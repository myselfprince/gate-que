import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeQuestionReview } from '../src/lib/question-review.mjs';
import { validateAdminAnswer, validateAdminReview, verifyAdminAnswer, answerDraft, adminQuestionRecord } from '../src/lib/mock-admin.mjs';
import { gradeAttempt, publicQuestion } from '../src/lib/gatemock.mjs';
import { normalizeQuestionMetadata } from '../src/lib/question-metadata.mjs';
import { storedAnswerText } from '../src/lib/question-answers.mjs';
import { buildAnswerKey } from '../src/lib/answer-key.mjs';

const q = { id: 'q1', key: 'paper:1', questionType: 'MCQ', text: 'Choose', marks: '2', optA: 'a', optB: 'b', optC: 'c', optD: 'd', correctOptions: ['A'] };

test('explicit verification clears stale manual and disputed flags but still validates the key', () => {
  const pending = { ...q, manualReview: true, answerDisposition: 'disputed', specialNote: 'Check interpretation.' };
  const patch = verifyAdminAnswer(answerDraft(pending), pending);
  assert.equal(patch.manualReview, false); assert.equal(patch.answerDisposition, 'standard');
  assert.equal(gradeAttempt([{ ...pending, ...patch }], { responses: [{ key: q.key, value: ['A'] }] }).score, 2);
  assert.throws(() => verifyAdminAnswer({ ...answerDraft(pending), correctOptions: [] }, pending));
  assert.throws(() => verifyAdminAnswer({ ...answerDraft(pending), questionType: 'SUBJECTIVE' }, pending), /individual assessment/);
});
test('admin note saves independently of an incomplete key, type or solution-link drafts', () => {
  const unknown = { ...q, correctOptions: [] };
  const draft = { ...answerDraft(unknown), correctOptions: ['D'], specialNote: 'An additional clarification.', solutionUrl: 'unfinished link' };
  const patch = validateAdminReview(draft, unknown);
  assert.equal(patch.specialNote, draft.specialNote);
  for (const field of ['correctOptions', 'questionType', 'natAnswer', 'natRange', 'solutionUrl', 'text']) assert.ok(!(field in patch));
  assert.deepEqual({ ...unknown, ...patch }.correctOptions, []);
  assert.throws(() => validateAdminReview({ ...draft, questionType: 'NAT' }, unknown), /question type/);
});
test('saving a none-correct admin note clears the old key and forces manual review', () => {
  const patch = validateAdminReview({ ...answerDraft(q), answerDisposition: 'none-correct', specialNote: 'No listed option is valid.', manualReview: false }, q);
  assert.deepEqual(patch.correctOptions, []); assert.equal(patch.manualReview, true);
  assert.throws(() => validateAdminReview({ ...answerDraft(q), answerDisposition: 'none-correct', specialNote: '' }, q), /special note/);
  assert.throws(() => validateAdminReview({ ...answerDraft(q), questionType: 'NAT', answerDisposition: 'none-correct', specialNote: 'No option.' }, { ...q, questionType: 'NAT' }), /option questions/);
});
test('none-correct saves without selecting a fake option and never automatically penalizes an aspirant', () => {
  const patch = validateAdminAnswer({ ...answerDraft(q), answerDisposition: 'none-correct', specialNote: 'All options are wrong; alpha can be any real number except 5.' }, q);
  assert.deepEqual(patch.correctOptions, []);
  assert.equal(patch.manualReview, true);
  assert.equal(storedAnswerText({ ...q, ...patch }), 'None of the options is correct');
  const result = gradeAttempt([{ ...q, ...patch }], { responses: [{ key: q.key, value: ['B'] }] });
  assert.equal(result.score, 0); assert.equal(result.gradableMarks, 0); assert.equal(result.wrong, 0);
  assert.equal(result.entries[0].specialNote, patch.specialNote);
  assert.equal(result.entries[0].status, 'ungraded');
  assert.doesNotMatch(JSON.stringify(publicQuestion({ ...q, ...patch }, 0)), /specialNote|answerDisposition|All options|manualReview/);
});
test('ordinary note retains automatic grading and reviewed notes survive storage and exports', () => {
  const patch = validateAdminAnswer({ ...answerDraft(q), specialNote: 'Assume integer inputs.' }, q);
  const result = gradeAttempt([{ ...q, ...patch }], { responses: [{ key: q.key, value: ['A'] }] });
  assert.equal(result.score, 2);
  assert.equal(adminQuestionRecord({ ...q, ...patch }).specialNote, patch.specialNote);
  assert.equal(normalizeQuestionMetadata(patch).specialNote, patch.specialNote);
  const tex = buildAnswerKey({ subject: 'Maths', chapter: 'Paper', questions: [{ ...q, ...patch }] });
  assert.match(tex, /Admin special note:/); assert.match(tex, /Assume integer inputs/);
});
test('disputed keys cannot grade even when a stale manualReview flag says false', () => {
  const question = { ...q, answerDisposition: 'disputed', specialNote: 'Ambiguous wording.', manualReview: false };
  assert.equal(gradeAttempt([question], { responses: [{ key: q.key, value: ['A'] }] }).gradableMarks, 0);
  assert.equal(storedAnswerText(question), 'Answer under review');
  for (const bad of [{ answerDisposition: 'unknown' }, { answerDisposition: 'none-correct', specialNote: ' ' }, { specialNote: 'x'.repeat(4001) }, { specialNote: {} }]) assert.throws(() => normalizeQuestionReview(bad));
  assert.throws(() => validateAdminAnswer({ ...answerDraft(q), questionType: 'NAT', answerDisposition: 'none-correct', specialNote: 'No option.' }, q), /option questions/);
  const disputedNat = validateAdminAnswer({ ...answerDraft(q), questionType: 'NAT', correctOptions: [], natAnswer: '', answerDisposition: 'disputed', specialNote: 'The numerical data is incomplete.' }, q);
  assert.equal(disputedNat.manualReview, true); assert.equal(disputedNat.natAnswer, '');
});
