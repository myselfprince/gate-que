import test from 'node:test';
import assert from 'node:assert/strict';
import { examSections, examStatusCounts, nextExamQuestion, numericKeypadValue, paletteStatus } from '../src/lib/gate-exam-screen.mjs';

test('GATE sections separate aptitude from technical questions without changing paper indices', () => {
  const questions = [{ subject: '2. TOC', examPaper: 'CS' }, { subject: '13. General Aptitude' }, { subject: '4. COA' }, { subject: '13. General Aptitude' }];
  const sections = examSections(questions);
  assert.deepEqual(sections.map(section => section.indices), [[1, 3], [0, 2]]);
  assert.equal(nextExamQuestion(sections, 1), 3);
  assert.equal(nextExamQuestion(sections, 3), 0);
  assert.equal(nextExamQuestion(sections, 0, -1), 3);
  assert.equal(nextExamQuestion(sections, 2), 2);
  assert.equal(examSections([{ subject: '2. TOC' }])[0].name, 'TOC');
});

test('all five GATE palette states are mutually exclusive, including answered review', () => {
  const questions = ['a', 'b', 'c', 'd', 'e'].map(key => ({ key }));
  const state = { responses: [{ key: 'a', value: ['A'] }, { key: 'e', value: '-0.5' }], marked: ['d', 'e'], visited: ['a', 'b', 'd', 'e'] };
  assert.deepEqual(questions.map(q => paletteStatus(q.key, state)), ['answered', 'notAnswered', 'notVisited', 'review', 'answeredReview']);
  assert.deepEqual(examStatusCounts(questions, state), { answered: 1, notAnswered: 1, notVisited: 1, review: 1, answeredReview: 1 });
});

test('NAT keypad handles signed decimals, backspace, clearing and duplicate decimal points', () => {
  let value = '';
  for (const key of ['−', '.', '5']) value = numericKeypadValue(value, key);
  assert.equal(value, '-.5');
  assert.equal(numericKeypadValue(value, '.'), '-.5');
  assert.equal(numericKeypadValue(value, 'Backspace'), '-.');
  assert.equal(numericKeypadValue(value, '−'), '.5');
  assert.equal(numericKeypadValue(value, 'Clear'), '');
  assert.equal(numericKeypadValue('', '.'), '0.');
});
