import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_MOCK_BLUEPRINT, buildMock, questionBank, publicQuestion, paperCoverage, gradeAttempt, validateAttemptState, validatePaper } from '../src/lib/gatemock.mjs';

const q = (id, extra = {}) => ({ key: id, id, text: `Question ${id}`, year: '2006', examPaper: 'CS', setNum: '', marks: '1', subject: 'TOC', chapter: 'PDA', questionType: 'MCQ', optA: 'First', optB: 'Second', correctOptions: ['A'], ...extra });
const paper = { year: '2006', examPaper: 'CS', setNum: '', questionCount: 2, totalMarks: 3, durationMinutes: 180, negativeFraction: 1 / 3, verified: true, sourceUrl: '' };

test('year papers require exact CS/IT/set coverage and original numbering, never book numbering', () => {
  const bank = [q('second', { marks: '2', paperQuestionNumber: '2' }), q('first', { paperQuestionNumber: '1' }), q('it', { examPaper: 'IT', paperQuestionNumber: '1' }), q('set2', { setNum: '2', paperQuestionNumber: '1' })];
  assert.equal(paperCoverage(bank, paper).ready, true);
  const result = buildMock(bank, { mode: 'year', year: '2006', examPaper: 'CS' }, [paper]);
  assert.deepEqual(result.questions.map(q => q.key), ['first', 'second']); assert.equal(result.exact, true);
  const unnumbered = [q('first', { source: { questionNumber: '1' } })];
  assert.deepEqual(paperCoverage(unnumbered, paper).missing, [1, 2]);
  assert.throws(() => buildMock(unnumbered, { mode: 'year', year: '2006' }, [paper]), /incomplete/);
  assert.equal(buildMock(unnumbered, { mode: 'year', year: '2006', allowPartial: true }, [paper]).exact, false);
  assert.equal(paperCoverage([...bank, q('duplicate', { paperQuestionNumber: '1' })], paper).ready, false);
  assert.equal(paperCoverage(bank, { ...paper, totalMarks: 100 }).ready, false);
});

test('weighted mocks obey mark quotas, report shortages, exclude blanks and duplicate stems', () => {
  assert.equal(DEFAULT_MOCK_BLUEPRINT.reduce((n, row) => n + row.one + row.two, 0), 65);
  assert.equal(DEFAULT_MOCK_BLUEPRINT.reduce((n, row) => n + row.one + 2 * row.two, 0), 100);
  const bank = [q('one'), q('two', { marks: '2' }), q('duplicate', { text: 'Question one' }), q('other', { examPaper: 'IT' })];
  const config = { mode: 'full', durationMinutes: 180, blueprint: [{ subject: 'TOC', one: 1, two: 1 }] };
  assert.equal(buildMock(bank, config).totalMarks, 3);
  assert.throws(() => buildMock(bank, { ...config, blueprint: [{ subject: 'TOC', one: 3, two: 1 }] }), /Not enough/);
  assert.equal(buildMock(bank, { ...config, blueprint: [{ subject: 'TOC', one: 3, two: 1 }], allowPartial: true }).questions.length, 2);
  assert.throws(() => buildMock(bank, { mode: 'topic', subject: 'TOC', chapter: '', count: 2, durationMinutes: 30 }));
  assert.equal(questionBank([{ _id: 'c', questions: [{ id: 'blank', isBlank: true }, { id: 'q', text: 'Stem' }] }]).length, 1);
});

test('public attempts contain no correct options, NAT key or nested source answers', () => {
  const publicValue = publicQuestion(q('secret', { natAnswer: 'secret-answer', source: { verifiedQuestion: { natAnswer: 'nested-secret' } }, natRange: { min: 1, max: 2 }, solutionUrl: 'secret-solution' }), 0);
  assert.doesNotMatch(JSON.stringify(publicValue), /correctOptions|natAnswer|natRange|secret-answer|nested-secret|secret-solution/);
});

test('scoring applies MCQ penalties, exact MSQ sets, numeric ranges and excludes unavailable keys', () => {
  const questions = [q('wrong'), q('multi', { questionType: 'MSQ', marks: '2', correctOptions: ['A', 'B'] }),
    q('nat', { questionType: 'NAT', marks: '2', optA: '', optB: '', correctOptions: [], natRange: { min: 1.25, max: 1.30 } }), q('unknown', { correctOptions: [] }), q('unanswered')];
  const state = validateAttemptState({ currentIndex: 0, visited: ['wrong'], marked: ['multi'], responses: [{ key: 'wrong', value: ['B'] }, { key: 'multi', value: ['A'] }, { key: 'nat', value: '1.28' }, { key: 'unknown', value: ['A'] }] }, questions);
  const result = gradeAttempt(questions, state);
  assert.equal(result.score, 1.6667); assert.equal(result.gradableMarks, 6); assert.equal(result.ungraded, 1); assert.equal(result.unanswered, 1);
  assert.equal(result.entries[1].earned, 0); assert.equal(result.entries[2].status, 'correct');
  assert.throws(() => validateAttemptState({ ...state, responses: [{ key: 'wrong', value: ['A', 'B'] }] }, questions));
  assert.throws(() => validateAttemptState({ ...state, responses: [{ key: 'foreign-question', value: ['A'] }] }, questions));
  assert.throws(() => validateAttemptState({ ...state, responses: [{ key: 'nat', value: 'NaN' }] }, questions));
  assert.throws(() => validateAttemptState({ ...state, currentIndex: 99 }, questions));
});

test('paper definitions reject invented or invalid counts and grading rules', () => {
  assert.deepEqual(validatePaper(paper), paper);
  for (const changes of [{ questionCount: 0 }, { totalMarks: NaN }, { negativeFraction: -1 }, { setNum: '../2' }, { verified: 'yes' }]) assert.throws(() => validatePaper({ ...paper, ...changes }));
});
