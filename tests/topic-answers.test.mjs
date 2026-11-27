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
    { correctOptions: [] },
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
    const blanks = new Set(reviewed.blankPositions ?? []);
    const expectedPositions = Array.from({ length: reviewed.questions.length + blanks.size }, (_, index) => index + 1)
      .filter(position => !blanks.has(position));
    assert.deepEqual(reviewed.questions.map(item => item.position), expectedPositions, `${name} positions`);
  }
});

test('page catalog merges live coverage with the syllabus and reads answer files', async () => {
  const logic = chapter([question('a', { correctOptions: ['A'] }), question('b', { correctOptions: ['B'] })]);
  const sets = { ...chapter([question('c')]), chapter: '2. Set Theory and Algebra' };
  const extra = { ...chapter([question('d')]), subject: '14. Extra', chapter: '1. New chapter' };
  const rows = await topicCoverageRows([logic, sets, extra]);
  assert.deepEqual(rows[0].answerFile, { exists: true, valid: true, reviewedAt: '2026-11-24', entries: 61, notes: 21 });
  assert.equal(rows[1].answerFile.valid, true);
  assert.equal(rows[1].answerFile.entries, 100);
  assert.deepEqual(rows[2].answerFile, { exists: false });
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

test('reviewed Set Theory and Algebra key covers all 100 questions', () => {
  const answerPath = path.join(TOPIC_ANSWER_DIR, '1-discrete-maths--2-set-theory-and-algebra.json');
  const reviewed = validateTopicAnswerFile(JSON.parse(fs.readFileSync(answerPath, 'utf8')));
  const answers = reviewed.questions.map(item => {
    if (item.answerDisposition === 'none-correct') return 'NONE';
    if (item.questionType === 'SUBJECTIVE') return 'S';
    if (item.questionType === 'NAT') return item.natAnswer;
    return item.correctOptions.join('');
  });
  assert.equal(answers.join(' '), [
    'D C D A B A C C B C',
    'A B C C B S S C S C',
    'NONE B C A D A D C B C',
    'C C D A A B C C B A',
    'C B A D C A C B B B',
    'B NONE D D A A D C C A',
    'C A 16 A D 5 B 4 A C',
    'D D 2048 36 0.95 B D C 2 B',
    'B 0 271 42 D B 0.125 7 A C',
    'AD 59049 A ABC BCD AD 2 CD 5 4',
  ].join(' '));
  assert.deepEqual(reviewed.questions.filter(item => item.questionType === 'MSQ').map(item => item.position), [89, 91, 94, 95, 96, 98]);
  assert.deepEqual(reviewed.questions.filter(item => item.questionType === 'SUBJECTIVE').map(item => item.position), [16, 17, 19]);
  assert.deepEqual(reviewed.questions.filter(item => item.answerDisposition === 'none-correct').map(item => item.position), [21, 52]);
  assert.deepEqual(reviewed.questions.flatMap(item => item.natRange ? [{ position: item.position, ...item.natRange }] : []), [
    { position: 87, min: 0.1249, max: 0.1259 },
  ]);
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

test('reviewed Finite Automata and Regular Languages key covers all 116 questions', () => {
  const answerFile = path.join(TOPIC_ANSWER_DIR, '2-toc--1-finite-automata-and-regular-languages.json');
  const { questions } = validateTopicAnswerFile(JSON.parse(fs.readFileSync(answerFile, 'utf8')));
  assert.deepEqual(questions.map(item => item.position), Array.from({ length: 116 }, (_, index) => index + 1));
  const key = questions.map(item => {
    if (item.answerDisposition === 'none-correct') return 'none';
    if (item.questionType === 'NAT') return item.natAnswer;
    return item.correctOptions.join('');
  });
  assert.equal(key.join(' '), [
    'A B C D B D D A CD D',
    'B B C B D A B D D A',
    'B C B C B A B A A B',
    'D none B D A A C B A C',
    'D B A BCD C B A D C none',
    'A A C C A A D AC A none',
    'A C C B C A C B A B',
    'C none A D C A B A A 3',
    '1 C A 3 B D C B 2 B',
    '4 D 8 B C D 2 B D 120',
    'A none 6 A A 256 ABC D C C',
    '4 AC 44 D 15 A',
  ].join(' '));
  assert.deepEqual(questions.filter(item => item.questionType === 'MSQ').map(item => item.position), [9, 44, 58, 107, 112]);
  assert.equal(questions.filter(item => item.questionType === 'MCQ').length, 98);
  assert.equal(questions.filter(item => item.questionType === 'NAT').length, 13);
  assert.ok(questions.filter(item => item.questionType === 'NAT').every(item => !item.natRange));
});

test('reviewed Linked Lists key covers all 31 questions with the verified answers and dispositions', () => {
  const answerFile = path.join(TOPIC_ANSWER_DIR, '6-data-structures--3-linked-lists.json');
  const { questions } = validateTopicAnswerFile(JSON.parse(fs.readFileSync(answerFile, 'utf8')));
  assert.deepEqual(questions.map(item => item.position), Array.from({ length: 31 }, (_, index) => index + 1));

  const key = questions.map(item => item.questionType === 'NAT' ? item.natAnswer : item.correctOptions.join(''));
  assert.equal(key.join(' '), 'B B D C C D B A A B A C A B B D C D A C D B B A C D A D A 5 B');
  assert.deepEqual(questions.filter(item => item.questionType !== 'MCQ').map(item => [item.position, item.questionType]), [[30, 'NAT']]);
  assert.equal(questions[29].natRange, undefined);
  assert.deepEqual(questions.filter(item => item.answerDisposition === 'none-correct').map(item => item.position), [7, 10, 15, 16, 23, 26]);
  assert.deepEqual(questions.filter(item => item.answerDisposition === 'disputed').map(item => item.position), [21, 30]);
});

test('reviewed Trees key covers all 65 questions with the verified answers', () => {
  const reviewed = validateTopicAnswerFile(JSON.parse(fs.readFileSync(path.join(TOPIC_ANSWER_DIR, '6-data-structures--4-trees.json'), 'utf8')));
  assert.deepEqual(reviewed.questions.map(item => item.position), Array.from({ length: 65 }, (_, index) => index + 1));
  const key = reviewed.questions.map(item => {
    if (item.questionType === 'SUBJECTIVE') return 'S';
    if (item.questionType === 'NAT') return item.natAnswer;
    return item.correctOptions.join('');
  });
  assert.equal(key.join(' '), 'B B C B S B D BC A C D D C B B D D B D C B D A C B C D B C C B A C C A A B A B B D B A D 1 A D A A 19 B 64 B B 4 4.25 D C D 1 509 C A C B');
  assert.deepEqual(reviewed.questions.filter(item => item.questionType === 'MSQ').map(item => item.position), [8]);
  assert.deepEqual(reviewed.questions.filter(item => item.questionType === 'SUBJECTIVE').map(item => item.position), [5]);
  assert.equal(reviewed.questions[33].answerDisposition, 'none-correct');
});

test('reviewed Turing Machine key covers all 51 questions with the verified answers', () => {
  const filename = path.join(TOPIC_ANSWER_DIR, '2-toc--3-turing-machine-re-rec-undecidabilitu.json');
  const reviewed = validateTopicAnswerFile(JSON.parse(fs.readFileSync(filename, 'utf8')));
  assert.deepEqual(reviewed.questions.map(item => item.position), Array.from({ length: 51 }, (_, index) => index + 1));

  const key = reviewed.questions.map(item => {
    if (item.answerDisposition === 'none-correct') return 'NONE';
    if (item.questionType === 'NAT') return item.natAnswer;
    return item.correctOptions.join('');
  });
  assert.equal(key.join(' '), [
    'BD BD BC AD D B B AC D A',
    'NONE A A B C B D B D B',
    'B D D D C B A C B D',
    'C D D C C C D D D NONE',
    'D B B A A D ABC BCD BC 5 D',
  ].join(' '));
  assert.deepEqual(reviewed.questions.filter(item => item.questionType === 'MSQ').map(item => item.position), [1, 2, 3, 4, 8, 46, 47, 48, 49]);
  assert.deepEqual(reviewed.questions.filter(item => item.questionType === 'NAT').map(item => item.position), [50]);
  assert.equal(reviewed.questions[49].natRange, undefined);
  assert.deepEqual(reviewed.questions.filter(item => item.answerDisposition === 'none-correct')
    .map(item => [item.position, item.correctOptions]), [[11, ['C']], [40, ['A']]]);
});

test('reviewed PDA, CFL and DCFL key covers all 101 questions', () => {
  const filename = path.join(TOPIC_ANSWER_DIR, '2-toc--2-pda-cfl-and-dcfl.json');
  const reviewed = validateTopicAnswerFile(JSON.parse(fs.readFileSync(filename, 'utf8')));
  const questions = reviewed.questions;
  assert.deepEqual(questions.map(item => item.position), Array.from({ length: 101 }, (_, index) => index + 1));

  const key = questions.map(item => {
    if (item.questionType === 'SUBJECTIVE') return 'S';
    if (item.questionType === 'NAT') return item.natAnswer;
    return item.correctOptions.join('');
  });
  assert.equal(key.join(' '), [
    'C B S A B B A AC B B',
    'C C B B C D D D A B',
    'D B B D C B B C D B',
    'D C C B B D A B D B',
    'A C D C D C B B D D',
    'B C B B A D B B D D',
    'D D D C C A B B D C',
    'A B B C C B A C BCD BCD',
    '50 D C BCD ABC A B ACD 9 BC',
    'A 179 CD C D A C A ACD BD',
    'ABC',
  ].join(' '));
  assert.deepEqual(questions.filter(item => item.questionType === 'MSQ').map(item => item.position),
    [8, 79, 80, 84, 85, 88, 90, 93, 99, 100, 101]);
  assert.deepEqual(questions.filter(item => item.questionType === 'SUBJECTIVE').map(item => item.position), [3]);
  assert.deepEqual(questions.filter(item => item.questionType === 'NAT').map(item => [item.position, item.natRange]),
    [[81, undefined], [89, undefined], [92, undefined]]);
  assert.deepEqual(questions.filter(item => item.answerDisposition === 'none-correct').map(item => item.position),
    [1, 25, 26, 41, 47]);
  assert.deepEqual(questions.filter(item => item.answerDisposition === 'disputed').map(item => item.position), [13]);
});

test('reviewed ISO-OSI Stack and SWP key covers all 146 questions', () => {
  const filename = path.join(TOPIC_ANSWER_DIR, '3-computer-networks--1-iso-osi-stack-and-swp.json');
  const { questions } = validateTopicAnswerFile(JSON.parse(fs.readFileSync(filename, 'utf8')));
  assert.deepEqual(questions.map(item => item.position), Array.from({ length: 146 }, (_, index) => index + 1));

  const key = questions.map(item => item.questionType === 'NAT' ? item.natAnswer : item.correctOptions.join(''));
  assert.equal(key.join(' '), [
    'C C C A A C A B D B',
    'A B C C D C B B B B',
    'A A C D A D C D D B',
    'B A B A C A A C B A',
    'C A D C D D C B B A',
    'C B C B D A A C C C',
    'A B C B A B B D C D',
    'C D A C B B D A B C',
    'A A C C C B B D D D',
    'B B D 5 28 B B B C D',
    '1575 8 D 12 0.4404 320 D B C C',
    'A 4 B 200 D 2500 D B A C',
    'B D A 88.34 C B B 50 3 C',
    'B 135 C 51 A C 7.08 B 500 B',
    'A B 30 D B B',
  ].join(' '));
  assert.equal(questions.filter(item => item.questionType === 'MCQ').length, 127);
  assert.equal(questions.filter(item => item.questionType === 'NAT').length, 18);
  assert.deepEqual(questions.filter(item => item.questionType === 'MSQ').map(item => item.position), [2]);
  assert.deepEqual(questions.filter(item => item.natRange).map(item => [item.position, item.natRange]), [
    [95, { min: 28, max: 30 }],
    [124, { min: 86.5, max: 89.5 }],
    [132, { min: 130, max: 140 }],
    [134, { min: 50, max: 52 }],
    [137, { min: 7.07, max: 7.09 }],
  ]);
  assert.deepEqual(questions.filter(item => item.answerDisposition).map(item => [item.position, item.answerDisposition]), [
    [36, 'disputed'], [44, 'none-correct'], [59, 'disputed'], [62, 'disputed'],
  ]);
});

test('reviewed Graph Theory key covers all 65 questions with the verified answers', () => {
  const filename = path.join(TOPIC_ANSWER_DIR, '1-discrete-maths--4-graph-theory.json');
  const { questions } = validateTopicAnswerFile(JSON.parse(fs.readFileSync(filename, 'utf8')));
  assert.deepEqual(questions.map(item => item.position), Array.from({ length: 65 }, (_, index) => index + 1));

  const key = questions.map(item => {
    if (item.questionType === 'SUBJECTIVE') return 'S';
    if (item.questionType === 'NAT') return item.natAnswer;
    return item.correctOptions.join('');
  });
  assert.equal(key.join(' '), [
    'S C D B C A D C D A',
    'D B A D C C C B B D',
    'C C B D A B C A D B',
    'D B C C C B 506 C 36 5',
    '6 C A 24 D B 199 995 4 18',
    '16 3 109 D 7 11 B 36 D ABC',
    'A AB BD B 2',
  ].join(' '));
  assert.deepEqual(questions.filter(item => item.questionType === 'MSQ').map(item => item.position), [60, 61, 62, 63]);
  assert.deepEqual(questions.filter(item => item.questionType === 'NAT').map(item => item.position),
    [37, 39, 40, 41, 44, 47, 48, 49, 50, 51, 52, 53, 55, 56, 58, 65]);
  assert.ok(questions.every(item => item.natRange === undefined));
  assert.deepEqual(questions.filter(item => item.questionType === 'SUBJECTIVE').map(item => item.position), [1]);
  assert.deepEqual(questions.filter(item => item.answerDisposition === 'disputed').map(item => item.position), [36]);
});

test('reviewed TCP, UDP and IP key covers all 113 questions', () => {
  const filename = path.join(TOPIC_ANSWER_DIR, '3-computer-networks--3-tcp-udp-and-ip.json');
  const { questions } = validateTopicAnswerFile(JSON.parse(fs.readFileSync(filename, 'utf8')));
  assert.deepEqual(questions.map(item => item.position), Array.from({ length: 113 }, (_, index) => index + 1));

  const key = questions.map(item => {
    if (item.answerDisposition === 'none-correct') return 'NONE';
    if (item.questionType === 'NAT') return item.natAnswer;
    return item.correctOptions.join('');
  });
  assert.equal(key.join(' '), [
    'D D D B C D A D C A',
    'D A B A C C D B B D',
    'B D B D C C C C B D',
    'C C B C A D B C C C',
    'A C B B C B B D C D',
    'A B D D A C NONE A D A',
    'NONE D D D C C A C C 1100',
    '5 C 27 D D 1 256 A B B',
    'B C A C A 158 13 1.1 B 9',
    'C D 34 C C B 44 D BCD AB',
    'A 33 BCD CD 3 CD BD 6 40 AB',
    'CD D 4',
  ].join(' '));
  assert.deepEqual(questions.filter(item => item.questionType === 'MSQ').map(item => item.position),
    [99, 100, 103, 104, 106, 107, 110, 111]);
  assert.deepEqual(questions.filter(item => item.questionType === 'NAT').map(item => item.position),
    [70, 71, 73, 76, 77, 86, 87, 88, 90, 93, 97, 102, 105, 108, 109, 113]);
  assert.equal(questions.filter(item => item.questionType === 'MCQ').length, 89);
  assert.deepEqual(questions.filter(item => item.natRange).map(item => [item.position, item.natRange]), [
    [70, { min: 1100, max: 1300 }],
    [93, { min: 34, max: 35 }],
  ]);
  assert.deepEqual(questions.filter(item => item.answerDisposition).map(item => [item.position, item.answerDisposition]), [
    [57, 'none-correct'],
    [61, 'none-correct'],
    [64, 'disputed'],
    [73, 'disputed'],
  ]);
});

test('reviewed Routing and Application Layer key covers all 43 questions', () => {
  const filename = path.join(TOPIC_ANSWER_DIR, '3-computer-networks--4-routing-and-application-layer.json');
  const { questions } = validateTopicAnswerFile(JSON.parse(fs.readFileSync(filename, 'utf8')));
  assert.deepEqual(questions.map(item => item.position), Array.from({ length: 43 }, (_, index) => index + 1));

  const key = questions.map(item => item.questionType === 'NAT' ? item.natAnswer : item.correctOptions.join(''));
  assert.equal(key.join(' '), [
    'B B C B C D A A C A',
    'C D B D C A B D C B',
    'C A C C C C D A C A',
    'C 144 D D 6 AD C 4 BD 0.5',
    'AC C C',
  ].join(' '));
  assert.deepEqual(questions.filter(item => item.questionType === 'MSQ').map(item => item.position), [36, 39, 41]);
  assert.deepEqual(questions.filter(item => item.questionType === 'NAT').map(item => item.position), [32, 35, 38, 40]);
  assert.equal(questions.filter(item => item.questionType === 'MCQ').length, 36);
  assert.ok(questions.every(item => item.natRange === undefined));
  assert.deepEqual(questions.filter(item => item.answerDisposition).map(item => [item.position, item.answerDisposition]), [
    [8, 'disputed'],
  ]);
});

test('reviewed Deadlock key covers all 21 questions', () => {
  const filename = path.join(TOPIC_ANSWER_DIR, '5-operating-systems--3-deadlock.json');
  const { questions } = validateTopicAnswerFile(JSON.parse(fs.readFileSync(filename, 'utf8')));
  assert.deepEqual(questions.map(item => item.position), Array.from({ length: 21 }, (_, index) => index + 1));

  const key = questions.map(item => {
    if (item.answerDisposition === 'none-correct') return 'NONE';
    if (item.questionType === 'NAT') return item.natAnswer;
    return item.correctOptions.join('');
  });
  assert.equal(key.join(' '), 'C B C A C A NONE C D B A A B B 7 NONE D B 2 A AD');
  assert.equal(questions.filter(item => item.questionType === 'MCQ').length, 18);
  assert.deepEqual(questions.filter(item => item.questionType === 'NAT').map(item => item.position), [15, 19]);
  assert.deepEqual(questions.filter(item => item.questionType === 'MSQ').map(item => item.position), [21]);
  assert.ok(questions.every(item => item.natRange === undefined));
  assert.deepEqual(questions.filter(item => item.replaceExisting).map(item => item.position), [7]);

  const noneCorrect = questions.filter(item => item.answerDisposition === 'none-correct');
  assert.deepEqual(noneCorrect.map(item => item.position), [7, 16]);
  for (const item of noneCorrect) {
    assert.deepEqual(item.correctOptions, []);
    assert.equal(storedAnswerText(item), 'None of the options is correct');
    assert.doesNotThrow(() => normalizeQuestionMetadata(item));
  }
});

test('reviewed Memory Organization key covers all 74 questions', () => {
  const filename = path.join(TOPIC_ANSWER_DIR, '4-coa--4-memory-organization.json');
  const { questions } = validateTopicAnswerFile(JSON.parse(fs.readFileSync(filename, 'utf8')));
  assert.deepEqual(questions.map(item => item.position), Array.from({ length: 74 }, (_, index) => index + 1));

  const key = questions.map(item => {
    if (item.answerDisposition === 'none-correct') return 'NONE';
    if (item.questionType === 'NAT') return item.natAnswer;
    return item.correctOptions.join('');
  });
  assert.equal(key.join(' '), [
    'D B BD B D B D C C C',
    'C C A C C A D A D C',
    'B D C A D A A C D B',
    'C C D B C C D C A A',
    'B NONE 20 D D 10000 1.68 14 A 31',
    '24 30 76 14 0.05 18 4.72 A 59 B',
    'A 160 13.5 B 17 B 2 ABD 0.85 ABD',
    'C 19 AB 3.00',
  ].join(' '));
  assert.equal(questions.filter(item => item.questionType === 'MCQ').length, 50);
  assert.deepEqual(questions.filter(item => item.questionType === 'MSQ').map(item => item.position), [3, 68, 70, 73]);
  assert.deepEqual(questions.filter(item => item.questionType === 'NAT').map(item => item.position),
    [43, 46, 47, 48, 50, 51, 52, 53, 54, 55, 56, 57, 59, 62, 63, 65, 67, 69, 72, 74]);
  assert.deepEqual(questions.filter(item => item.natRange).map(item => [item.position, item.natRange]),
    [[59, { min: 59, max: 60 }]]);
  assert.deepEqual(questions.filter(item => item.answerDisposition === 'disputed').map(item => item.position),
    [23, 31, 35, 36, 47, 63]);
  assert.deepEqual(questions[41].correctOptions, []);
  assert.equal(storedAnswerText(questions[41]), 'None of the options is correct');
});

test('reviewed Dynamic Programming key covers all 14 questions', () => {
  const filename = path.join(TOPIC_ANSWER_DIR, '7-algorithms--4-dynamic-programming.json');
  const { questions } = validateTopicAnswerFile(JSON.parse(fs.readFileSync(filename, 'utf8')));
  assert.deepEqual(questions.map(item => item.position), Array.from({ length: 14 }, (_, index) => index + 1));

  const key = questions.map(item => item.questionType === 'NAT' ? item.natAnswer : item.correctOptions.join(''));
  assert.equal(key.join(' '), 'A D C B B C C B A C 34 12 1500 C');
  assert.equal(questions.filter(item => item.questionType === 'MCQ').length, 11);
  assert.deepEqual(questions.filter(item => item.questionType === 'NAT').map(item => item.position), [11, 12, 13]);
  assert.ok(questions.every(item => item.natRange === undefined));
});

test('reviewed Syntax Directed Translations key covers all 25 questions', () => {
  const filename = path.join(TOPIC_ANSWER_DIR, '10-compiler-design--3-syntax-directed-translations.json');
  const { questions } = validateTopicAnswerFile(JSON.parse(fs.readFileSync(filename, 'utf8')));
  assert.deepEqual(questions.map(item => item.position), Array.from({ length: 25 }, (_, index) => index + 1));

  const key = questions.map(item => item.questionType === 'NAT' ? item.natAnswer : item.correctOptions.join(''));
  assert.equal(key.join(' '), 'ABC A B B B B C D C B D B 6 C 9 C B A A C A 80 2.375 B AC');
  assert.equal(questions.filter(item => item.questionType === 'MCQ').length, 19);
  assert.deepEqual(questions.filter(item => item.questionType === 'MSQ').map(item => item.position), [1, 25]);
  assert.deepEqual(questions.filter(item => item.questionType === 'NAT').map(item => item.position), [13, 15, 22, 23]);
  assert.deepEqual(questions.filter(item => item.natRange).map(item => [item.position, item.natRange]),
    [[23, { min: 2.374, max: 2.376 }]]);
  assert.deepEqual(questions.filter(item => item.status === 'verified-with-note').map(item => item.position),
    [1, 3, 9, 10, 11, 12, 18, 21, 22]);
});

test('reviewed Code Generation and Optimization key covers all 28 questions', () => {
  const filename = path.join(TOPIC_ANSWER_DIR, '10-compiler-design--4-code-generations-and-optimizatinos.json');
  const { questions } = validateTopicAnswerFile(JSON.parse(fs.readFileSync(filename, 'utf8')));
  assert.deepEqual(questions.map(item => item.position), Array.from({ length: 28 }, (_, index) => index + 1));

  const key = questions.map(item => item.questionType === 'NAT' ? item.natAnswer : item.correctOptions.join(''));
  assert.equal(key.join(' '), [
    'D A C B D B B D A A',
    'D A C 8 C B 9 A B 2',
    '1024 6 A C A D B A',
  ].join(' '));
  assert.equal(questions.filter(item => item.questionType === 'MCQ').length, 22);
  assert.deepEqual(questions.filter(item => item.questionType === 'MSQ').map(item => item.position), [23]);
  assert.deepEqual(questions.filter(item => item.questionType === 'NAT').map(item => item.position),
    [14, 17, 20, 21, 22]);
  assert.ok(questions.every(item => item.natRange === undefined));
  assert.deepEqual(questions.filter(item => item.replaceExisting).map(item => item.position), [2, 17]);
});

test('reviewed ER Model key covers all 14 questions', () => {
  const filename = path.join(TOPIC_ANSWER_DIR, '12-dbms--1-er-model.json');
  const { questions } = validateTopicAnswerFile(JSON.parse(fs.readFileSync(filename, 'utf8')));
  assert.deepEqual(questions.map(item => item.position), Array.from({ length: 14 }, (_, index) => index + 1));

  const key = questions.map(item => item.questionType === 'NAT' ? item.natAnswer : item.correctOptions.join(''));
  assert.equal(key.join(' '), 'A B C B C B A C 4 C A D C C');
  assert.deepEqual(questions.filter(item => item.questionType !== 'MCQ').map(item => [item.position, item.questionType]),
    [[9, 'NAT']]);
  assert.equal(questions[8].natRange, undefined);
  assert.deepEqual(questions.filter(item => item.status === 'verified-with-note').map(item => item.position),
    [1, 2, 3, 5, 10]);
});

test('reviewed Logic Functions and Minimizations key covers all 76 questions', () => {
  const filename = path.join(TOPIC_ANSWER_DIR, '9-digital-logic--1-logic-functions-and-minimizations.json');
  const { questions } = validateTopicAnswerFile(JSON.parse(fs.readFileSync(filename, 'utf8')));
  assert.deepEqual(questions.map(item => item.position), Array.from({ length: 76 }, (_, index) => index + 1));

  const key = questions.map(item => {
    if (item.answerDisposition === 'none-correct') return 'NONE';
    if (item.questionType === 'SUBJECTIVE') return 'S';
    if (item.questionType === 'NAT') return item.natAnswer;
    return item.correctOptions.join('');
  });
  assert.equal(key.join(' '), [
    'C C B C B C D C D B',
    'C C A B A C S NONE D D',
    'B B A C C A A NONE C D',
    'C B C A C D NONE D A C',
    'A A A B A B A D B A',
    'D A D B D B 1 3 A A',
    'C 1 A C D 3 D 3 A B',
    'CD 6 AD AC AC BC',
  ].join(' '));
  assert.equal(questions.filter(item => item.questionType === 'MCQ').length, 64);
  assert.deepEqual(questions.filter(item => item.questionType === 'MSQ').map(item => item.position),
    [71, 73, 74, 75, 76]);
  assert.deepEqual(questions.filter(item => item.questionType === 'NAT').map(item => item.position),
    [57, 58, 62, 66, 68, 72]);
  assert.ok(questions.every(item => item.natRange === undefined));
  assert.deepEqual(questions.filter(item => item.questionType === 'SUBJECTIVE').map(item => item.position), [17]);
  assert.deepEqual(questions.filter(item => item.replaceExisting).map(item => item.position), [37, 71]);

  const noneCorrect = questions.filter(item => item.answerDisposition === 'none-correct');
  assert.deepEqual(noneCorrect.map(item => item.position), [18, 28, 37]);
  for (const item of noneCorrect) {
    assert.deepEqual(item.correctOptions, []);
    assert.equal(storedAnswerText(item), 'None of the options is correct');
    assert.doesNotThrow(() => normalizeQuestionMetadata(item));
  }
});

test('reviewed Sequential Circuits key covers all 37 questions', () => {
  const filename = path.join(TOPIC_ANSWER_DIR, '9-digital-logic--3-sequential-circuits.json');
  const { questions } = validateTopicAnswerFile(JSON.parse(fs.readFileSync(filename, 'utf8')));
  assert.deepEqual(questions.map(item => item.position), Array.from({ length: 37 }, (_, index) => index + 1));

  const key = questions.map(item => {
    if (item.questionType === 'SUBJECTIVE') return 'S';
    if (item.answerDisposition === 'none-correct') return 'NONE';
    if (item.questionType === 'NAT') return item.natAnswer;
    return item.correctOptions.join('');
  });
  assert.equal(key.join(' '), [
    'S A A B A A C D B D',
    'NONE A D C C A D A C D',
    'A A A D B C C D A 3',
    '3 B B 2 D B A',
  ].join(' '));
  assert.deepEqual(questions.filter(item => item.questionType !== 'MCQ').map(item => [item.position, item.questionType]),
    [[1, 'SUBJECTIVE'], [30, 'NAT'], [31, 'NAT'], [34, 'NAT']]);
  assert.deepEqual(questions.filter(item => item.natRange).map(item => [item.position, item.natRange]),
    [[31, { min: 3, max: 4 }]]);
  assert.deepEqual(questions.filter(item => item.replaceExisting).map(item => item.position), [17, 31]);
  assert.deepEqual(questions[10].correctOptions, []);
  assert.equal(storedAnswerText(questions[10]), 'None of the options is correct');
});

test('reviewed Operating Systems Miscellaneous key covers all six questions', () => {
  const filename = path.join(TOPIC_ANSWER_DIR, '5-operating-systems--6-miscellaneous.json');
  const { questions } = validateTopicAnswerFile(JSON.parse(fs.readFileSync(filename, 'utf8')));

  assert.deepEqual(questions.map(({ position, questionType, correctOptions }) => [position, questionType, correctOptions]), [
    [1, 'MCQ', ['C']],
    [2, 'MCQ', ['D']],
    [3, 'MCQ', ['D']],
    [4, 'MCQ', []],
    [5, 'MCQ', ['A']],
    [6, 'MCQ', ['D']],
  ]);
  assert.deepEqual(questions.filter(item => item.status === 'verified-with-note').map(item => item.position), [1, 3, 4, 5]);
  assert.equal(questions[0].answerDisposition, 'disputed');
  assert.equal(questions[3].answerDisposition, 'none-correct');
  assert.equal(storedAnswerText(questions[3]), 'None of the options is correct');
});

test('reviewed Relational Model key covers all 36 questions', () => {
  const filename = path.join(TOPIC_ANSWER_DIR, '12-dbms--4-relational-model.json');
  const { questions } = validateTopicAnswerFile(JSON.parse(fs.readFileSync(filename, 'utf8')));
  assert.deepEqual(questions.map(item => item.position), Array.from({ length: 36 }, (_, index) => index + 1));

  const key = questions.map(item => {
    if (item.questionType === 'SUBJECTIVE') return 'S';
    if (item.answerDisposition === 'none-correct') return 'NONE';
    if (item.questionType === 'NAT') return item.natAnswer;
    return item.correctOptions.join('');
  });
  assert.equal(key.join(' '), [
    'S D B C C C C B D C',
    'B D C D A B C D A NONE',
    'A A A A D C D 4 C 1',
    '820 A AB A 2 B',
  ].join(' '));
  assert.deepEqual(questions.filter(item => item.questionType !== 'MCQ').map(item => [item.position, item.questionType]), [
    [1, 'SUBJECTIVE'], [28, 'NAT'], [30, 'NAT'], [31, 'NAT'], [33, 'MSQ'], [35, 'NAT'],
  ]);
  assert.deepEqual(questions.filter(item => item.natRange).map(item => [item.position, item.natRange]),
    [[31, { min: 819, max: 820 }]]);
  assert.deepEqual(questions.filter(item => item.answerDisposition === 'disputed').map(item => item.position),
    [6, 13, 15, 19, 23, 27]);
  assert.equal(storedAnswerText(questions[19]), 'None of the options is correct');
  assert.equal(storedAnswerText(questions[30]), '819 to 820');
  assert.ok(questions.every(item => !item.replaceExisting));
});

test('reviewed Number Systems key covers all 62 questions', () => {
  const answerFile = path.join(TOPIC_ANSWER_DIR, '9-digital-logic--4-number-systems.json');
  const { questions } = validateTopicAnswerFile(JSON.parse(fs.readFileSync(answerFile, 'utf8')));
  assert.deepEqual(questions.map(item => item.position), Array.from({ length: 62 }, (_, index) => index + 1));
  const key = questions.map(item => {
    if (item.answerDisposition === 'none-correct') return 'NONE';
    return item.questionType === 'NAT' ? item.natAnswer : item.correctOptions.join('');
  });
  assert.equal(key.join(' '), [
    'C D A D C B AB C C C',
    'B B D D A C D A A A',
    'A A A A D D C C A C',
    'D NONE B B A B B 5 3 A',
    '5 -11 1 D C D C B D A',
    'C -7.75 B 3 AC B B 110 C B C ABC',
  ].join(' '));
  assert.equal(questions.filter(item => item.questionType === 'MCQ').length, 51);
  assert.deepEqual(questions.filter(item => item.questionType === 'MSQ').map(item => item.position), [7, 55, 62]);
  assert.deepEqual(questions.filter(item => item.questionType === 'NAT').map(item => item.position),
    [38, 39, 41, 42, 43, 52, 54, 58]);
  assert.ok(questions.every(item => item.natRange === undefined && !item.replaceExisting));
  assert.deepEqual(questions.filter(item => item.status === 'verified-with-note').map(item => item.position),
    [4, 5, 7, 9, 10, 13, 14, 26, 32, 36, 47, 57]);
  assert.deepEqual(questions.filter(item => item.answerDisposition).map(item => [item.position, item.answerDisposition]), [
    [4, 'disputed'], [9, 'disputed'], [32, 'none-correct'], [57, 'disputed'],
  ]);
  assert.equal(storedAnswerText(questions[31]), 'None of the options is correct');
  assert.equal(storedAnswerText(questions[56]), 'Answer under review');
});

test('reviewed Linear Algebra key covers all 68 questions', () => {
  const filename = path.join(TOPIC_ANSWER_DIR, '11-engg-maths--2-linear-algebra.json');
  const reviewed = validateTopicAnswerFile(JSON.parse(fs.readFileSync(filename, 'utf8')));
  const { questions } = reviewed;
  assert.deepEqual(questions.map(item => item.position), Array.from({ length: 68 }, (_, index) => index + 1));

  const key = questions.map(item => {
    if (item.questionType === 'SUBJECTIVE') return 'S';
    if (item.answerDisposition === 'none-correct') return 'NONE';
    return item.questionType === 'NAT' ? item.natAnswer : item.correctOptions.join('');
  });
  assert.equal(key.join(' '), [
    'A C A B C B A B A A',
    'A C S B B C D B C A',
    'B B D A B A NONE A NONE D',
    'A D A 1 0 0 6 A 2 6',
    'D 6 0 B 5 C 15 C 0.125 C',
    'B 2 5 3 D C 12 B 3 4',
    'C NONE ACD B 2 A A BD',
  ].join(' '));
  assert.equal(questions.filter(item => item.questionType === 'MCQ').length, 46);
  assert.deepEqual(questions.filter(item => item.questionType === 'SUBJECTIVE').map(item => item.position), [13]);
  assert.match(questions[12].reason, /1, 2, −2 and −1/);
  assert.deepEqual(questions.filter(item => item.questionType === 'MSQ').map(item => item.position), [63, 67, 68]);
  assert.deepEqual(questions.filter(item => item.questionType === 'NAT').map(item => item.position),
    [34, 35, 36, 37, 39, 40, 42, 43, 45, 47, 49, 52, 53, 54, 57, 59, 60, 65]);
  assert.ok(questions.every(item => item.natRange === undefined && !item.replaceExisting));
  assert.deepEqual(questions.filter(item => item.status === 'verified-with-note').map(item => item.position),
    [2, 5, 10, 11, 14, 19, 21, 25, 26, 27, 29, 30, 40, 45, 46, 62, 64, 65]);

  const noneCorrect = questions.filter(item => item.answerDisposition === 'none-correct');
  assert.deepEqual(noneCorrect.map(item => item.position), [27, 29, 62]);
  for (const item of noneCorrect) {
    assert.deepEqual(item.correctOptions, []);
    assert.equal(storedAnswerText(item), 'None of the options is correct');
    assert.doesNotThrow(() => normalizeQuestionMetadata(item));
  }
  const coverage = chapterAnswerCoverage(reviewed);
  assert.equal(coverage.answered, 67);
  assert.equal(coverage.complete, true);
});

test('reviewed C Programming key covers all 137 nonblank questions', () => {
  const filename = path.join(TOPIC_ANSWER_DIR, '8-c-prog--1-programming.json');
  const reviewed = validateTopicAnswerFile(JSON.parse(fs.readFileSync(filename, 'utf8')));
  const { questions } = reviewed;
  const byPosition = new Map(questions.map(question => [question.position, question]));
  const chapterQuestions = Array.from({ length: 144 }, (_, index) => byPosition.get(index + 1) ?? { isBlank: true });
  assert.equal(questions.length, 137);
  assert.deepEqual(reviewed.blankPositions, [91, 95, 101, 107, 112, 133, 134]);
  assert.equal(chapterQuestions.map(question => {
    if (question.isBlank) return '-';
    if (question.answerDisposition === 'none-correct') return 'NONE';
    return question.questionType === 'NAT' ? question.natAnswer : question.correctOptions.join('');
  }).join(' '), [
    'D B C C A D C A D A',
    'C A B C D D B B A D',
    'A C D B C A B C C NONE',
    'D C C D D C D D C B',
    'D A C D A C D D C B',
    'D A A B C C B D C B',
    'D B D C D C B D C C',
    'D B D C 9 B 1.73 D -5 B',
    '51 D 5 C C B 10 230 D 2016',
    '- A D 30 - 3 23 C 3 A',
    '- C 2 0 3 D - A 4 10230',
    'A - 6 26 D 5 D 10 81 55',
    '1023 D 15 60 C D A A 7 A',
    'D D - - ABD A B B 46 111',
    'D 5 25 435',
  ].join(' '));
  assert.equal(questions.filter(question => question.questionType === 'MCQ').length, 104);
  assert.equal(questions.filter(question => question.questionType === 'NAT').length, 32);
  assert.deepEqual(questions.filter(question => question.questionType === 'MSQ').map(question => question.position), [135]);
  assert.deepEqual(questions.filter(question => question.natRange).map(question => [question.position, question.natRange]),
    [[77, { min: 1.72, max: 1.74 }]]);
  assert.deepEqual(questions.filter(question => question.answerDisposition === 'disputed').map(question => question.position),
    [5, 29, 38, 50, 55, 57, 66, 72, 93, 97, 102, 103, 109, 111, 114, 125]);
  assert.equal(storedAnswerText(byPosition.get(30)), 'None of the options is correct');
  assert.equal(storedAnswerText(byPosition.get(77)), '1.72 to 1.74');
  assert.ok(questions.every(question => !question.replaceExisting));
  const coverage = chapterAnswerCoverage({ ...reviewed, questions: chapterQuestions });
  assert.equal(coverage.blank, 7);
  assert.equal(coverage.subjective, 0);
  assert.equal(coverage.answered, 137);
  assert.equal(coverage.complete, true);
});

test('reviewed Probability key covers all 69 questions', () => {
  const filename = path.join(TOPIC_ANSWER_DIR, '11-engg-maths--1-probability.json');
  const reviewed = validateTopicAnswerFile(JSON.parse(fs.readFileSync(filename, 'utf8')));
  const { questions } = reviewed;
  assert.deepEqual(questions.map(item => item.position), Array.from({ length: 69 }, (_, index) => index + 1));

  const key = questions.map(item => {
    if (item.answerDisposition === 'none-correct') return 'NONE';
    return item.questionType === 'NAT' ? item.natAnswer : item.correctOptions.join('');
  });
  assert.equal(key.join(' '), [
    'C D C D B C C D B C',
    'D C A B C D A D C B',
    'A C A C B B B NONE C A',
    'B A A A C D A C B C',
    '0.25 10 11.90 0.26 0.25 0.75 0.5 0.33 0.55 0',
    'A B 54 0.023 0.60 0.503 0.8 0.5 A 0.37',
    '0.04 15.49 D A CD AC B 0.375 A',
  ].join(' '));
  assert.equal(questions.filter(item => item.questionType === 'MCQ').length, 46);
  assert.deepEqual(questions.filter(item => item.questionType === 'MSQ').map(item => item.position), [7, 65, 66]);
  assert.deepEqual(questions.filter(item => item.questionType === 'NAT').map(item => item.position),
    [41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 53, 54, 55, 56, 57, 58, 60, 61, 62, 68]);
  assert.deepEqual(questions.filter(item => item.natRange).map(item => [item.position, item.natRange.min, item.natRange.max]), [
    [41, 0.24, 0.27], [43, 11.85, 11.95], [44, 0.259, 0.261], [48, 0.33, 0.34],
    [54, 0.023, 0.0232], [55, 0.60, 0.61], [56, 0.502, 0.504], [60, 0.35, 0.39], [62, 15, 16],
  ]);
  assert.deepEqual(questions.filter(item => item.status === 'verified-with-note').map(item => item.position),
    [1, 7, 9, 11, 12, 18, 20, 25, 28, 29, 34, 35, 40, 55, 59, 60]);
  assert.equal(storedAnswerText(questions[11]), 'Answer under review');
  assert.equal(storedAnswerText(questions[27]), 'None of the options is correct');
  assert.ok(questions.every(item => !item.replaceExisting));
  const coverage = chapterAnswerCoverage(reviewed);
  assert.equal(coverage.answered, 69);
  assert.equal(coverage.complete, true);
});
