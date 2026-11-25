import test from 'node:test';
import assert from 'node:assert/strict';
import { numericAnswerRange, storedAnswerText, questionType, answerTypePatch, toggleCorrectOptionPatch, answerKeyComplete } from '../src/lib/question-answers.mjs';
import { normalizeQuestionMetadata } from '../src/lib/question-metadata.mjs';

test('correct answers retain MCQ, MSQ and numeric ranges; unknown keys stay unknown', () => {
  assert.equal(storedAnswerText({ optA: 'x', correctOptions: ['B'] }), '(B)');
  assert.equal(questionType({ optA: 'x', correctOptions: ['A', 'C'] }), 'MSQ');
  assert.equal(storedAnswerText({ optA: 'x', correctOptions: ['A', 'C'] }), '(A), (C)');
  assert.equal(storedAnswerText({ natAnswer: 'NAT' }), '');
  assert.equal(storedAnswerText({ natRange: { min: 1.2, max: 1.3 } }), '1.2 to 1.3');
  assert.deepEqual(numericAnswerRange({ natAnswer: '$-0.25$' }), { min: -0.25, max: -0.25 });
  assert.deepEqual(numericAnswerRange({ natAnswer: '1.25 to 1.30' }), { min: 1.25, max: 1.3 });
  assert.equal(numericAnswerRange({ natAnswer: '$\\sqrt{2}$' }), null);
  assert.deepEqual(normalizeQuestionMetadata({ natRange: { min: 1, max: 2 } }).natRange, { min: 1, max: 2 });
  for (const value of [{ natRange: { min: 2, max: 1 } }, { natRange: { min: NaN, max: 1 } }, { questionType: 'MCQ', correctOptions: ['A', 'B'] }, { questionType: 'NAT', correctOptions: ['A'] }]) assert.throws(() => normalizeQuestionMetadata(value));
});

test('preview answer marking toggles MCQ/MSQ options and keeps compatible keys across type switches', () => {
  const mcq = { optA: 'a', optB: 'b', optC: 'c', optD: 'd', questionType: 'MCQ', correctOptions: ['A'] };
  assert.deepEqual(toggleCorrectOptionPatch(mcq, 'C'), { questionType: 'MCQ', correctOptions: ['C'] });
  assert.deepEqual(toggleCorrectOptionPatch(mcq, 'A'), { questionType: 'MCQ', correctOptions: [] });
  const msq = { ...mcq, questionType: 'MSQ', correctOptions: ['B', 'D'] };
  assert.deepEqual(toggleCorrectOptionPatch(msq, 'A').correctOptions, ['A', 'B', 'D']);
  assert.deepEqual(toggleCorrectOptionPatch(msq, 'D').correctOptions, ['B']);
  // Legacy question with no stored type: inferred from its options.
  assert.deepEqual(toggleCorrectOptionPatch({ optA: 'a', optB: 'b' }, 'B'), { questionType: 'MCQ', correctOptions: ['B'] });
  // A NAT-typed question with options becomes an MCQ when an option is clicked.
  const fromNat = toggleCorrectOptionPatch({ ...mcq, questionType: 'NAT', correctOptions: [], natAnswer: '5' }, 'B');
  assert.equal(fromNat.questionType, 'MCQ');
  assert.deepEqual(fromNat.correctOptions, ['B']);
  assert.equal(fromNat.natAnswer, '');

  assert.deepEqual(answerTypePatch(mcq, 'MSQ').correctOptions, ['A']);
  assert.deepEqual(answerTypePatch(msq, 'MCQ').correctOptions, []);
  assert.deepEqual(answerTypePatch({ ...msq, correctOptions: ['B'] }, 'MCQ').correctOptions, ['B']);
  assert.deepEqual(answerTypePatch(mcq, 'NAT'), { questionType: 'NAT', correctOptions: [], natAnswer: '', natRange: null, isProof: false, answerDisposition: 'standard' });
  assert.deepEqual(answerTypePatch({ natAnswer: '7', natRange: { min: 6, max: 8 } }, 'MCQ').natRange, null);
  assert.equal(answerTypePatch({ ...mcq, answerDisposition: 'none-correct' }, 'NAT').answerDisposition, 'disputed');
  assert.equal(answerTypePatch(mcq, 'SUBJECTIVE').isProof, true);
  for (const patch of [toggleCorrectOptionPatch(msq, 'A'), answerTypePatch(mcq, 'MSQ'), answerTypePatch(msq, 'MCQ'), answerTypePatch(mcq, 'NAT')]) normalizeQuestionMetadata(patch);
});

test('review progress counts stored keys, review flags and subjective questions, never blanks', () => {
  assert.equal(answerKeyComplete({ optA: 'a', correctOptions: ['A'] }), true);
  assert.equal(answerKeyComplete({ optA: 'a', correctOptions: [] }), false);
  assert.equal(answerKeyComplete({ questionType: 'NAT', natAnswer: '' }), false);
  assert.equal(answerKeyComplete({ questionType: 'NAT', natAnswer: 'NAT' }), false);
  assert.equal(answerKeyComplete({ questionType: 'NAT', natAnswer: '42' }), true);
  assert.equal(answerKeyComplete({ optA: 'a', answerDisposition: 'none-correct' }), true);
  assert.equal(answerKeyComplete({ isProof: true }), true);
  assert.equal(answerKeyComplete({ isBlank: true, natAnswer: '5' }), false);
});
