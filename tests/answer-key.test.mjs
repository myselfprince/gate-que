import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAnswerKey } from '../src/lib/answer-key.mjs';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';

test('a separate answer key matches sequential PDF numbers and retains stored answers', () => {
  const payload = { subject: 'Test', chapter: 'Practice', questions: [{ text: 'Question', exportNumber: '21', correctOptions: ['A', 'C'] }, { text: 'NAT', source: { questionNumber: '3.12' }, natAnswer: '$\\frac{1}{2}$' }, { text: 'Unknown' }, { isBlank: true }, { text: 'After blank', correctOptions: ['B'] }], pdfSettings: { includeAnswerKey: true, workingLines: 4 } };
  const key = buildAnswerKey(payload);
  assert.deepEqual([...key.matchAll(/\\textbf\{Q([^}]+)\}/g)].map(match => match[1]), ['1', '2', '3', '5']);
  assert.match(key, /\(A\), \(C\)/); assert.match(key, /\\frac\{1\}\{2\}/); assert.match(key, /Answer not available/);
  const questions = buildQuestionPages(payload);
  assert.doesNotMatch(questions, /\\frac\{1\}\{2\}|Answer not available/);
  assert.match(questions, /Working space/);
  assert.match(questions, /textheight-32pt-[^\n]+-70pt/);
});
