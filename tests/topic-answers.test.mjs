import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { storedAnswerText } from '../src/lib/question-answers.mjs';
import { normalizeQuestionMetadata } from '../src/lib/question-metadata.mjs';
import {
  TOPIC_ANSWER_DIR, TOPIC_ANSWER_FORMAT, chapterAnswerCoverage, planTopicAnswerUpdate,
  questionContentHash, topicAnswerUpdateDocument, topicSlug, validateTopicAnswerFile,
} from '../src/lib/topic-answers.mjs';
import { topicCoverageRows } from '../src/lib/topic-answers-server.mjs';
import { EDITOR_PROJECT_PATH, buildTopicAnswerPrompt, nextTopic, topicList, topicStatus } from '../src/lib/topic-answer-prompt.mjs';

const question = (id, extra = {}) => ({ id, text: `Question ${id}`, code: '', optA: 'p', optB: 'q', optC: 'r', optD: 's', diagram: '', ext: '.png', natAnswer: '', isBlank: false, ...extra });
const chapter = questions => ({ subject: '1. Discrete Maths', chapter: '1. Mathematical Logic', questions, updatedAt: new Date('2026-11-24T00:00:00Z') });
const sources = [{ kind: 'made-easy-key', ref: 'Made Easy Q1.1', answer: 'a', agrees: true }, { kind: 'derived', ref: 'truth table', answer: 'A', agrees: true }];
const entry = (q, position, extra = {}) => ({ position, id: q.id, contentSha256: questionContentHash(q), questionType: 'MCQ', correctOptions: ['A'], status: 'verified', reason: 'Derived.', sources, ...extra });
const file = entries => ({ format: TOPIC_ANSWER_FORMAT, subject: '1. Discrete Maths', chapter: '1. Mathematical Logic', slug: topicSlug('1. Discrete Maths', '1. Mathematical Logic'), questions: entries });

test('topic slugs and content hashes are stable and content-sensitive', () => {
  assert.equal(topicSlug('1. Discrete Maths', '1. Mathematical Logic'), '1-discrete-maths--1-mathematical-logic');
  assert.equal(topicSlug('3. Computer Networks', '3. TCP, UDP and IP'), '3-computer-networks--3-tcp-udp-and-ip');
  const q = question('a');
  assert.equal(questionContentHash(q), questionContentHash({ ...q, year: '1999', correctOptions: ['B'] }));
  assert.notEqual(questionContentHash(q), questionContentHash({ ...q, optB: 'q ' }));
});

test('answer files require consistent types, evidence and notes for disagreements', () => {
  const q = question('a');
  assert.equal(validateTopicAnswerFile(file([entry(q, 1)])).questions[0].correctOptions[0], 'A');
  const bad = [
    { correctOptions: ['A', 'B'] },
    { questionType: 'MSQ', correctOptions: [] },
    { questionType: 'NAT', correctOptions: ['A'], natAnswer: '4' },
    { questionType: 'NAT', correctOptions: [], natAnswer: '' },
    { reason: '' },
    { sources: [{ kind: 'derived', ref: 'mine', answer: 'A', agrees: true }] },
    { sources: [...sources, { kind: 'gateoverflow-pdf', ref: 'GO 3.1.1', answer: 'B', agrees: false }] },
    { status: 'verified-with-note', note: '' },
    { contentSha256: 'abc' },
  ];
  for (const change of bad) assert.throws(() => validateTopicAnswerFile(file([entry(q, 1, change)])), JSON.stringify(change));
  assert.doesNotThrow(() => validateTopicAnswerFile(file([entry(q, 1, { status: 'verified-with-note', note: 'GO key differs by option order.', sources: [...sources, { kind: 'gateoverflow-pdf', ref: 'GO', answer: 'B', agrees: false }] })])));
  assert.throws(() => validateTopicAnswerFile({ ...file([entry(q, 1)]), slug: 'wrong' }));
  assert.throws(() => validateTopicAnswerFile(file([entry(q, 1), entry(q, 2)])), /only once/);
});

test('planning writes only answer fields and refuses stale or conflicting reviews', () => {
  const a = question('a'), b = question('b', { optA: '', optB: '', optC: '', optD: '', natRange: { min: 3, max: 5 } }), c = question('c');
  const reviewed = file([
    entry(a, 1),
    entry(b, 2, { questionType: 'NAT', correctOptions: [], natAnswer: '4', replaceExisting: true }),
    entry(c, 3, { questionType: 'MSQ', correctOptions: ['C', 'A'] }),
  ]);
  const plan = planTopicAnswerUpdate(chapter([a, b, c]), reviewed);
  assert.deepEqual(plan.errors, []);
  assert.deepEqual(plan.changes.map(change => change.set), [
    { questionType: 'MCQ', correctOptions: ['A'] },
    { questionType: 'NAT', natAnswer: '4', natRange: null },
    { questionType: 'MSQ', correctOptions: ['A', 'C'] },
  ]);
  // Every planned value passes the editor's own save validation and gives the reviewed key.
  const saved = [a, b, c].map((q, index) => ({ ...q, ...plan.changes[index].set }));
  for (const q of saved) assert.doesNotThrow(() => normalizeQuestionMetadata(q));
  assert.deepEqual(saved.map(storedAnswerText), ['(A)', '4', '(A), (C)']);
  assert.equal(planTopicAnswerUpdate(chapter(saved), reviewed).changes.length, 0);

  const { update, options } = topicAnswerUpdateDocument(plan.changes, new Date(0));
  assert.deepEqual(options.arrayFilters, [{ 'q0.id': 'a' }, { 'q1.id': 'b' }, { 'q2.id': 'c' }]);
  assert.deepEqual(update.$set['questions.$[q2].correctOptions'], ['A', 'C']);
  assert.equal(update.$set.updatedAt.getTime(), 0);

  const errors = (questions, answerFile = reviewed) => planTopicAnswerUpdate(chapter(questions), answerFile).errors.join('\n');
  assert.match(errors([{ ...a, optA: 'changed' }, b, c]), /changed after review/);
  assert.match(errors([b, a, c]), /moved/);
  assert.match(errors([a, b]), /not in this chapter/);
  assert.match(errors([a, b, c, question('d')]), /no reviewed answer entry/);
  assert.match(errors([{ ...a, correctOptions: ['B'], questionType: 'MCQ' }, b, c]), /already has a different stored answer/);
  assert.throws(() => planTopicAnswerUpdate(chapter([a, a, c]), reviewed), /not unique/);
  assert.throws(() => planTopicAnswerUpdate({ ...chapter([a]), chapter: '2. Set Theory and Algebra' }, reviewed), /different chapter/);
});

test('coverage counts answerable, answered, subjective and blank questions', () => {
  const coverage = chapterAnswerCoverage(chapter([
    question('a', { correctOptions: ['A'] }), question('b'), question('c', { isBlank: true }), question('d', { isProof: true, optA: '' }),
  ]));
  assert.deepEqual({ ...coverage, updatedAt: undefined }, {
    subject: '1. Discrete Maths', chapter: '1. Mathematical Logic', slug: '1-discrete-maths--1-mathematical-logic',
    total: 4, blank: 1, subjective: 1, answerable: 2, answered: 1, missing: [2], complete: false, updatedAt: undefined,
  });
});

test('committed topic answer files are valid and named by slug', () => {
  const names = fs.existsSync(TOPIC_ANSWER_DIR) ? fs.readdirSync(TOPIC_ANSWER_DIR).filter(name => name.endsWith('.json')) : [];
  assert.ok(names.length >= 1);
  for (const name of names) {
    const reviewed = validateTopicAnswerFile(JSON.parse(fs.readFileSync(path.join(TOPIC_ANSWER_DIR, name), 'utf8')));
    assert.equal(`${reviewed.slug}.json`, name);
    assert.deepEqual(reviewed.questions.map(item => item.position), reviewed.questions.map((_, index) => index + 1), `${name} positions`);
  }
});

test('page catalog merges live coverage with the syllabus and reads answer files', async () => {
  const logic = chapter([question('a', { correctOptions: ['A'] }), question('b', { correctOptions: ['B'] })]);
  const sets = { ...chapter([question('c')]), chapter: '2. Set Theory and Algebra' };
  const extra = { ...chapter([question('d')]), subject: '14. Extra', chapter: '1. New chapter' };
  const rows = await topicCoverageRows([logic, sets, extra]);
  assert.deepEqual(rows[0].answerFile, { exists: true, valid: true, reviewedAt: '2026-11-24', entries: 61, notes: 21 });
  assert.deepEqual(rows[1].answerFile, { exists: false });
  const topics = topicList(rows);
  const bySlug = Object.fromEntries(topics.map(topic => [topic.slug, topic]));
  assert.equal(bySlug['1-discrete-maths--1-mathematical-logic'].status.state, 'complete');
  assert.equal(bySlug['1-discrete-maths--2-set-theory-and-algebra'].status.label, 'No answers yet · 0/1');
  assert.equal(bySlug['1-discrete-maths--3-combinatorics'].status.state, 'missing');
  assert.equal(topics.at(-1).slug, '14-extra--1-new-chapter');
  assert.ok(topicList(null).every(topic => topic.status.state === 'unknown'));
  assert.equal(nextTopic(topics).slug, '1-discrete-maths--2-set-theory-and-algebra');
  assert.equal(nextTopic(topics, { '1-discrete-maths--2-set-theory-and-algebra': 'x' }).slug, '14-extra--1-new-chapter');
  assert.equal(topicStatus({ coverage: { answerFile: { exists: true, valid: false } } }).state, 'review');
  // Every syllabus topic has a distinct slug, so answer files cannot collide.
  const slugs = topicList(null).map(topic => topic.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test('topic prompts target only the selected chapter in this project with its safeguards', () => {
  const [topic] = topicList([{ ...chapterAnswerCoverage(chapter([question('a', { correctOptions: ['A'] }), question('b'), question('c')])), answerFile: { exists: false } }]);
  const prompt = buildTopicAnswerPrompt(topic);
  for (const expected of [
    EDITOR_PROJECT_PATH, '- Subject: 1. Discrete Maths', '- Chapter: 1. Mathematical Logic', 'filter1_volume1.pdf — chapter "Discrete Mathematics: Mathematical Logic"',
    String.raw`MadeEasy PYQ PDF\1. Discrete Maths\1. Mathematical Logic.pdf`, String.raw`All Subject Solutions Keys\Discrete Mathemetics.pdf`,
    'node scripts/topic-answers/worksheet.mjs --subject "1. Discrete Maths" --chapter "1. Mathematical Logic"',
    'apply.mjs data/topic-answers/1-discrete-maths--1-mathematical-logic.json --write', 'map every key by option TEXT',
    '1/3 answerable questions', 'missing answers at positions 2, 3', 'Change only answer fields', 'Process ONLY this topic',
  ]) assert.ok(prompt.includes(expected), expected);
  assert.ok(!/mongodb(\+srv)?:\/\//.test(prompt));
  const tcp = topicList(null).find(item => item.slug === '3-computer-networks--3-tcp-udp-and-ip');
  const tcpPrompt = buildTopicAnswerPrompt(tcp);
  assert.match(tcpPrompt, /filter1_volume3\.pdf — chapter "Computer Networks"/);
  assert.match(tcpPrompt, /Status when copied: Unknown/);
  assert.throws(() => buildTopicAnswerPrompt({ ...topic, slug: 'other' }), /Choose a topic/);
});

test('reviewed Mathematical Logic key covers every question with the verified answers', () => {
  const reviewed = validateTopicAnswerFile(JSON.parse(fs.readFileSync(path.join(TOPIC_ANSWER_DIR, '1-discrete-maths--1-mathematical-logic.json'), 'utf8')));
  assert.equal(reviewed.questions.length, 61);
  const key = reviewed.questions.map(item => item.questionType === 'NAT' ? item.natAnswer : item.correctOptions.join(''));
  assert.equal(key.join(' '), 'D D A A A A D D B D C C A B B B B D D D D A A A C D B D B B B A B C D A D B B D D C A C C A 11 4 D B D D A B B C AC BC B BD A');
  assert.deepEqual(reviewed.questions.filter(item => item.questionType === 'MSQ').map(item => item.position), [57, 58, 60]);
});

test('reviewed Combinatorics key covers every question with the verified answers', () => {
  const reviewed = validateTopicAnswerFile(JSON.parse(fs.readFileSync(path.join(TOPIC_ANSWER_DIR, '1-discrete-maths--3-combinatorics.json'), 'utf8')));
  assert.equal(reviewed.questions.length, 42);
  const answer = item => {
    if (item.questionType === 'SUBJECTIVE') return 'S';
    if (item.questionType !== 'NAT') return item.correctOptions.join('');
    return item.natRange ? `${item.natRange.min}-${item.natRange.max}` : item.natAnswer;
  };
  assert.equal(reviewed.questions.map(answer).join(' '), 'D S C C B B D C B C A D C B A A D A D D C A 89 3.8-3.9 8 0.99 A 36 15 B 10 198 15 D A 12 65 7 A ABC A D');
  assert.deepEqual(reviewed.questions.filter(item => item.questionType === 'MSQ').map(item => item.position), [40]);
  assert.deepEqual(reviewed.questions.filter(item => item.questionType === 'SUBJECTIVE').map(item => item.position), [2]);
  assert.equal(reviewed.questions[23].natAnswer, '3.9');
  assert.deepEqual(reviewed.questions.filter(item => item.status === 'verified-with-note').map(item => item.position), [2, 3, 10, 20, 24, 35, 42]);
});
