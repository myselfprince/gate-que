import test from 'node:test';
import assert from 'node:assert/strict';
import { examQuestionNumber, examSections, examStatusCounts, nextExamQuestion, numericKeypadValue, paletteStatus } from '../src/lib/gate-exam-screen.mjs';

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

test('historical papers continue from Q25 to Q26 and Q50 to Q51 across section boundaries', () => {
  const questions = Array.from({ length: 70 }, (_, index) => ({ sectionId: index < 25 ? 'one' : index < 50 ? 'two' : 'written' }));
  const sections = examSections(questions);
  for (const boundary of [24, 49]) {
    const next = nextExamQuestion(sections, boundary);
    assert.equal(next, boundary + 1);
    assert.equal(examQuestionNumber(sections, next), boundary + 2);
    assert.equal(nextExamQuestion(sections, next, -1), boundary);
  }
  assert.deepEqual(sections.map(section => section.indices.map(index => examQuestionNumber(sections, index))), [
    Array.from({ length: 25 }, (_, index) => index + 1),
    Array.from({ length: 25 }, (_, index) => index + 26),
    Array.from({ length: 20 }, (_, index) => index + 51),
  ]);
});

test('numbering follows navigation when aptitude and technical indices are interleaved', () => {
  const questions = [{ subject: 'TOC' }, { subject: 'General Aptitude' }, { subject: 'COA' }, { subject: 'General Aptitude' }];
  const sections = examSections(questions), order = sections.flatMap(section => section.indices);
  assert.deepEqual(order, [1, 3, 0, 2]);
  assert.deepEqual(order.map(index => examQuestionNumber(sections, index)), [1, 2, 3, 4]);
  assert.equal(nextExamQuestion(sections, 3), 0);
  assert.equal(examQuestionNumber(sections, 0), 3);
});

test('Next stays at the final question so the screen can show its end-of-paper message', () => {
  for (const lengths of [[1], [2, 1], [25, 25, 20]]) {
    let offset = 0;
    const sections = lengths.map(length => ({ indices: Array.from({ length }, () => offset++) }));
    const finalIndex = offset - 1;
    assert.equal(nextExamQuestion(sections, finalIndex), finalIndex);
    assert.equal(examQuestionNumber(sections, finalIndex), offset);
    assert.equal(nextExamQuestion(sections, sections[0].indices[0], -1), sections[0].indices[0]);
  }
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
