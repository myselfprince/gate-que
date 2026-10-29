import test from 'node:test';
import assert from 'node:assert/strict';
import { selectPdfQuestions } from '../src/lib/pdf-selection.mjs';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';

const questions = Array.from({ length: 30 }, (_, index) => ({ id: `q-${index + 1}`, text: `Question ${index + 1}`, year: index % 2 ? '2024' : '2023', isBlank: index === 1 }));
test('range exports preserve editor order and use consecutive PDF question numbers', () => {
  const result = selectPdfQuestions(questions, { scope: 'range', range: '21-25, 3, 23-24' });
  assert.deepEqual(result.map(q => q.exportNumber), ['3', '21', '22', '23', '24', '25']);
  assert.equal(result.length, 6);
  const tex = buildQuestionPages({ subject: 'Test', chapter: 'Ranges', questions: result });
  assert.deepEqual([...tex.matchAll(/% Question page (\d+)\n/g)].map(match => match[1]), ['1', '2', '3', '4', '5', '6']);
  assert.match(tex, /\\bfseries 2\\quad/);
  assert.doesNotMatch(tex, /\\bfseries 21\\quad/);
  for (const range of ['0', '31', '5-2', '1,,2', '1-a']) assert.throws(() => selectPdfQuestions(questions, { scope: 'range', range }));
});
test('year, explicit IDs, blank handling and source versions never mutate the editable draft', () => {
  assert.equal(selectPdfQuestions(questions, { scope: 'year', year: '2024', includeBlanks: false }).length, 14);
  assert.deepEqual(selectPdfQuestions(questions, { scope: 'selected', selectedIds: ['q-5', 'q-1'] }).map(q => q.id), ['q-1', 'q-5']);
  const draft = [{ id: 'stable', text: 'Edited', solutionUrl: 'https://youtu.be/dQw4w9WgXcQ', gateOverflowUrl: 'https://gateoverflow.in/12345', source: { verifiedQuestion: { text: 'Printed' } } }];
  const result = selectPdfQuestions(draft, { sourceMode: 'verified' });
  assert.equal(result[0].text, 'Printed'); assert.equal(result[0].id, 'stable'); assert.equal(result[0].solutionUrl, draft[0].solutionUrl); assert.equal(draft[0].text, 'Edited');
  assert.equal(result[0].gateOverflowUrl, draft[0].gateOverflowUrl);
});
