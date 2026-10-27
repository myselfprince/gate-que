import test from 'node:test';
import assert from 'node:assert/strict';
import { numericAnswerRange, storedAnswerText, questionType } from '../src/lib/question-answers.mjs';
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
