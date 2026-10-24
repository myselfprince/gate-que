import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAnswerKey } from '../src/lib/answer-key.mjs';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';

test('a separate answer key retains source labels, MSQ answers, NAT math and unavailable answers', () => {
  const payload = { subject: 'Test', chapter: 'Practice', questions: [{ text: 'Question', exportNumber: '21', correctOptions: ['A', 'C'] }, { text: 'NAT', source: { questionNumber: '3.12' }, natAnswer: '$\\frac{1}{2}$' }, { text: 'Unknown' }, { isBlank: true }], pdfSettings: { includeAnswerKey: true, workingLines: 4 } };
  const key = buildAnswerKey(payload);
  assert.match(key, /Q21/); assert.match(key, /\(A\), \(C\)/); assert.match(key, /Q3\.12/); assert.match(key, /\\frac\{1\}\{2\}/); assert.match(key, /Answer not available/);
  const questions = buildQuestionPages(payload);
  assert.doesNotMatch(questions, /\\frac\{1\}\{2\}|Answer not available/);
  assert.match(questions, /Working space/);
  assert.match(questions, /textheight-22pt-70pt/);
});
