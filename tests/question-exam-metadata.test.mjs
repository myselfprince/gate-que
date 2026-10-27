import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcileQuestionExamMetadata } from '../src/lib/question-exam-metadata.mjs';

test('extracts both missed formats and the existing paste format', () => {
  for (const label of ['[GATE 2005 | 1 Mark]', '[2005 : 1 Mark]', '[2005 : 1 M]', '[gate 2005 | 1 Marks]']) {
    const original = { id: 'stable', text: `Which statement is TRUE? ${label}`, year: '2026', marks: '2', isPosLocked: true };
    const { question, conflict } = reconcileQuestionExamMetadata(original);
    assert.equal(conflict, false);
    assert.deepEqual(question, { ...original, text: 'Which statement is TRUE?', year: '2005', marks: '1' });
    assert.equal(original.year, '2026');
    assert.equal(reconcileQuestionExamMetadata(question).question, question);
  }
});

test('finds metadata in code or options and preserves code indentation', () => {
  const original = { text: 'Run [CODE]', code: '    int year = 2017;\n    return year; [2017 : 1 M]', optD: 'None [2017 : 1 M]', year: '2026', marks: '2' };
  const { question, labels } = reconcileQuestionExamMetadata(original);
  assert.equal(labels.length, 2);
  assert.equal(question.code, '    int year = 2017;\n    return year;');
  assert.equal(question.optD, 'None');
  assert.equal(question.year, '2017');
});

test('supports set numbers, question types and labels inside prose', () => {
  const { question } = reconcileQuestionExamMetadata({ text: '[GATE 2014 (Set-2) | 2 Marks | MSQ] Stem [2014 Set 2 : 2 M] continues.', setNum: '', questionType: 'MSQ' });
  assert.deepEqual(question, { text: 'Stem continues.', year: '2014', marks: '2', setNum: '2', questionType: 'MSQ' });
});

test('leaves ambiguous metadata for review without removing evidence', () => {
  for (const text of ['Stem [2005 : 1 M] [2008 : 1 M]', 'Stem [2005 : 1 M] [2005 : 2 M]', 'Stem [2005 Set 1 : 1 M] [2005 Set 2 : 1 M]']) {
    const original = { text, year: '2026' };
    const result = reconcileQuestionExamMetadata(original);
    assert.equal(result.conflict, true);
    assert.equal(result.question, original);
  }
});

test('does not mistake numbers, mathematical ranges or URLs for exam metadata', () => {
  const original = {
    text: 'Functions on {0, ..., 2014}; www.gate-2023.in; array [2008 : 1]; GATE 2005 is mentioned in prose.',
    code: '    int a = 2048;\n    int b = 2016;',
    optA: '$2011$', year: '2026', marks: '1',
  };
  assert.deepEqual(reconcileQuestionExamMetadata(original), { question: original, labels: [], conflict: false });
});
