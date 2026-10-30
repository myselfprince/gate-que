import test from 'node:test';
import assert from 'node:assert/strict';
import { gradeAttempt, publicQuestion } from '../src/lib/gatemock.mjs';
import { refreshReviewedAttempt, synchronizeReviewedAttempt } from '../src/lib/reviewed-attempt.mjs';

const q = { key: 'yearpaper:gate-cs-2008:21', subject: 'Maths', chapter: 'Paper', questionType: 'MCQ', text: 'Trapezoidal approximation',
  marks: '2', optA: '1000e', optB: '1000', optC: '100e', optD: '100', correctOptions: ['A'], manualReview: true };
const published = { ...q, manualReview: false, answerDisposition: 'standard', answerReviewedAt: '2026-10-30T10:00:00Z' };
function submitted(questions = [q], values = [['A']], manualScores = []) {
  const state = { responses: questions.map((question, index) => ({ key: question.key, value: values[index] })) };
  return { _id: 'attempt', userId: 'owner', revision: 3, finishedAt: '2026-10-30T09:00:00Z',
    questions, state, negativeFraction: 1 / 3, result: gradeAttempt(questions, state, 1 / 3, manualScores) };
}

test('an existing selected key remains pending until explicit publication, then Q21 receives its two marks', () => {
  const attempt = submitted(), before = structuredClone(attempt);
  assert.equal(attempt.result.score, 0); assert.equal(attempt.result.entries[0].manualReview, true);
  assert.equal(refreshReviewedAttempt(attempt, [{ ...q, manualReview: false }]), attempt);
  const actual = refreshReviewedAttempt(attempt, [published]);
  assert.equal(actual.result.score, 2); assert.equal(actual.result.correct, 1); assert.equal(actual.result.ungraded, 0);
  assert.equal(actual.result.entries[0].manualReview, false); assert.equal(actual.result.entries[0].answer, '(A)');
  assert.deepEqual(actual.state, attempt.state); assert.deepEqual(attempt, before);
  assert.equal(refreshReviewedAttempt(actual, [published]), actual);
  assert.doesNotMatch(JSON.stringify(publicQuestion(published, 0)), /correctOptions|manualReview|answerReviewedAt/);
});

test('corrected keys regrade correct, incorrect and unanswered responses with the saved MCQ penalty', () => {
  for (const [response, status, earned] of [[['B'], 'correct', 2], [['A'], 'wrong', -0.5], [[], 'unanswered', 0]]) {
    const attempt = { ...submitted([q], [response]), negativeFraction: 0.25 };
    const actual = refreshReviewedAttempt(attempt, [{ ...published, correctOptions: ['B'] }]);
    assert.equal(actual.result.entries[0].status, status); assert.equal(actual.result.score, earned);
    assert.equal(actual.result.gradableMarks, 2);
  }
});

test('MSQ and inclusive NAT range corrections also award marks', () => {
  for (const [question, response, correction] of [
    [{ ...q, questionType: 'MSQ', correctOptions: [] }, ['A', 'C'], { correctOptions: ['C', 'A'] }],
    [{ ...q, questionType: 'NAT', correctOptions: [], natAnswer: '' }, '12.5', { natRange: { min: 12.4, max: 12.5 } }],
  ]) {
    const actual = refreshReviewedAttempt(submitted([question], [response]), [{ ...question, ...published,
      questionType: question.questionType, ...correction }]);
    assert.equal(actual.result.score, 2); assert.equal(actual.result.correct, 1);
  }
});

test('verified grades replace self-assessment once and retain unrelated written assessments', () => {
  const written = { ...q, key: 'written', questionType: 'SUBJECTIVE' };
  const attempt = submitted([q, written], [['A'], 'Working'], [{ key: q.key, marks: 1 }, { key: written.key, marks: 0.5 }]);
  const actual = refreshReviewedAttempt(attempt, [published, written]);
  assert.equal(actual.result.score, 2.5); assert.equal(actual.result.selfAssessed, 1);
  assert.deepEqual(actual.result.manualScores, [{ key: written.key, marks: 0.5 }]);
});

test('reopened disputes withdraw automatic grades and cannot reuse a superseded self-assessment', () => {
  const verified = refreshReviewedAttempt(submitted([q], [['A']], [{ key: q.key, marks: 1 }]), [published]);
  const disputed = { ...published, answerReviewedAt: '2026-10-30T11:00:00Z', answerDisposition: 'disputed', manualReview: true, specialNote: 'Rechecking.' };
  const actual = refreshReviewedAttempt(verified, [disputed]);
  assert.equal(actual.result.score, 0); assert.equal(actual.result.ungraded, 1);
});

test('different question content, options, assets, marks, types and older publications cannot rewrite a saved attempt', () => {
  const attempt = submitted();
  for (const change of [{ text: 'New question' }, { key: 'other' }, { optA: 'Other option' }, { marks: '1' },
    { assetIds: { image: 'changed' } }, { questionType: 'NAT' }]) {
    assert.equal(refreshReviewedAttempt(attempt, [{ ...published, ...change }]), attempt);
  }
  const verified = refreshReviewedAttempt(attempt, [published]);
  assert.equal(refreshReviewedAttempt(verified, [{ ...published, correctOptions: ['B'], answerReviewedAt: '2026-10-29T10:00:00Z' }]), verified);
});

test('active attempts never fetch keys; outages keep the saved result', async () => {
  const active = { ...submitted(), finishedAt: null, result: null };
  assert.equal(await synchronizeReviewedAttempt({}, active, async () => { throw Error('Must not read'); }), active);
  const saved = submitted();
  const actual = await synchronizeReviewedAttempt({}, saved, async () => { throw Error('Offline'); });
  assert.equal(actual.result, saved.result); assert.equal(actual.reviewSyncUnavailable, true);
});

test('persistence uses owner and revision guards, retries a race and preserves concurrent self-assessment', async () => {
  const written = { ...q, key: 'written', questionType: 'SUBJECTIVE' };
  const attempt = submitted([q, written], [['A'], 'Working']);
  const concurrent = { ...submitted([q, written], [['A'], 'Working'], [{ key: written.key, marks: 1.5 }]), revision: 4 };
  const calls = [];
  const Model = {
    findOneAndUpdate(query, update) { calls.push({ query, update }); return { lean: async () => calls.length === 1 ? null : ({ ...concurrent, ...update.$set, revision: 5 }) }; },
    findOne(query) { assert.deepEqual(query, { _id: 'attempt', userId: 'owner' }); return { lean: async () => concurrent }; },
  };
  const saved = await synchronizeReviewedAttempt(Model, attempt, async () => [published, written]);
  assert.equal(saved.revision, 5); assert.equal(saved.result.score, 3.5);
  assert.equal(calls[0].query.userId, 'owner'); assert.equal(calls[0].query.revision, 3); assert.equal(calls[1].query.revision, 4);
});
