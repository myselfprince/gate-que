import test from 'node:test';
import assert from 'node:assert/strict';
import { pdfPreviewExamples, pdfPreviewPayload } from '../src/lib/pdf-live-preview.mjs';
const questions = [
  { id: 'blank', isBlank: true, text: '' },
  { id: 'first', text: 'Editable $x^2$', year: '2024', source: { verifiedQuestion: { text: 'Reviewed $x^2$' } } },
  { id: 'second', text: 'Another question' },
];
test('live preview automatically chooses a real question and preserves its printed number', () => {
  const payload = { subject: 'Maths', chapter: 'Logic', questions, pdfSettings: { fontSize: 22, theme: 'dark', includeAnswerKey: true, includePageImages: true } };
  const preview = pdfPreviewPayload(payload, '');
  assert.equal(preview.questions.length, 1); assert.equal(preview.questions[0].id, 'first'); assert.equal(preview.questions[0].exportNumber, '2');
  assert.equal(preview.pdfSettings.fontSize, 22); assert.equal(preview.pdfSettings.includeAnswerKey, false); assert.equal(preview.pdfSettings.includePageImages, false);
  assert.equal(payload.pdfSettings.includePageImages, true); assert.equal(payload.questions.length, 3);
});
test('examples follow the reviewed-source selection and changing examples keeps numbering', () => {
  assert.equal(pdfPreviewExamples(questions, 'verified')[0].text, 'Reviewed $x^2$');
  const result = pdfPreviewPayload({ questions }, 'second');
  assert.equal(result.questions[0].id, 'second'); assert.equal(result.questions[0].exportNumber, '3');
  assert.equal(pdfPreviewPayload({ questions }, 'deleted-question').questions[0].id, 'first');
});
test('empty chapters do not request a preview; an all-blank chapter can preview a placeholder', () => {
  assert.equal(pdfPreviewPayload({ questions: [] }, ''), null);
  assert.equal(pdfPreviewPayload({ questions: [questions[0]] }, '').questions[0].isBlank, true);
});
