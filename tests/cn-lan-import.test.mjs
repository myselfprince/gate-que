import test from 'node:test';
import assert from 'node:assert/strict';
import { LAN_IMPORT } from '../data/imports/cn-lan.mjs';
import { mergeChapterImport } from '../src/lib/chapter-import.mjs';
import { normalizeQuestionMetadata } from '../src/lib/question-metadata.mjs';
import { buildLatexSource, collectLatexImages } from '../src/lib/latex-source.mjs';

test('LAN covers all source questions and the scanned answer key', () => {
  const expected = ['D', 'D', 'B', 'B', 'B', 'C', 'D', 'A', 'C', 'B', 'A', 'B', 'A', 'C', 'B', 'A', 'B', '0.4404', 'D', 'A', 'C', '2500', 'D', '200', '4', 'B', '89.33', 'C', 'A', '50', '3', 'C', '135', 'A', '500'];
  assert.equal(LAN_IMPORT.questions.length, 35);
  assert.equal(new Set(LAN_IMPORT.questions.map((q) => q.id)).size, 35);
  LAN_IMPORT.questions.forEach((q, i) => {
    assert.equal(q.source.questionNumber, `2.${i + 1}`);
    assert.equal(q.natAnswer || q.correctOptions.join(','), expected[i]);
    assert.equal((q.text.match(/\$/g) || []).length % 2, 0);
    assert.deepEqual(normalizeQuestionMetadata(q).source, q.source);
  });
  assert.deepEqual(LAN_IMPORT.questions[29].source.pdfPages, [2, 3]);
  assert.match(LAN_IMPORT.questions[29].text, /successfully avoid a collision/);
  assert.equal(LAN_IMPORT.questions[27].optA, '01011011010');
});

test('repeat import preserves edited records, other questions and legacy notes', () => {
  const note = { id: 'note', text: 'added in prev chapter 1 already' };
  const first = mergeChapterImport([note], LAN_IMPORT.questions);
  assert.equal(first.added, 35);
  assert.equal(first.questions.length, 35);
  assert.deepEqual(first.preservedNotes, [note]);
  const edited = { ...first.questions[0], text: 'User edit to keep' };
  const unrelated = { id: 'extra', text: 'Additional existing question', year: '2026' };
  const next = mergeChapterImport([edited, ...first.questions.slice(1), unrelated], LAN_IMPORT.questions);
  assert.equal(next.added, 0);
  assert.equal(next.alreadyPresent, 35);
  assert.equal(next.questions[0].text, 'User edit to keep');
  assert.equal(next.questions.at(-1), unrelated);
});

test('malformed source and answer metadata are rejected', () => {
  assert.throws(() => normalizeQuestionMetadata({ source: { ...LAN_IMPORT.questions[0].source, pdfPages: [-1] } }));
  assert.throws(() => normalizeQuestionMetadata({ correctOptions: ['A', 'A'] }));
  assert.throws(() => normalizeQuestionMetadata({ questionType: 'unknown' }));
  assert.deepEqual(normalizeQuestionMetadata({ text: 'Legacy question' }), {});
});

test('LaTeX keeps source numbering, sets, math, blanks and the answer key', () => {
  const tex = buildLatexSource(LAN_IMPORT);
  assert.equal((tex.match(/\\item\[\\textbf\{2\./g) || []).length, 35);
  assert.match(tex, /GATE 2024 \(Set-2\)/);
  assert.match(tex, /\\times10\^8/);
  assert.match(tex, /\\rule\{2cm\}/);
  assert.match(tex, /\\section\*\{Answer key\}/);
  assert.doesNotMatch(tex, /\\\\n\\end\{tabular\}/);
  assert.deepEqual(collectLatexImages(LAN_IMPORT.questions), []);
});

test('portable image tokens stay in place and invalid references fail', () => {
  const q = { ...LAN_IMPORT.questions[0], text: 'Before [IMG_1] after', diagram: 'figure-1' };
  const tex = buildLatexSource({ ...LAN_IMPORT, questions: [q] });
  assert.ok(tex.indexOf('Before') < tex.indexOf('includegraphics'));
  assert.ok(tex.indexOf('includegraphics') < tex.indexOf(' after'));
  assert.match(tex, /images\/figure-1.png/);
  assert.doesNotMatch(tex, /IMG/);
  assert.throws(() => collectLatexImages([{ ...q, diagram: '../private' }]));
  assert.throws(() => buildLatexSource({ ...LAN_IMPORT, questions: [{ ...q, diagram: '' }] }));
});
