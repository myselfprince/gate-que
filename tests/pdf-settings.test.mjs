import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePdfSettings, questionPdfSettings } from '../src/lib/pdf-settings.mjs';
import { normalizeQuestionMetadata } from '../src/lib/question-metadata.mjs';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';

test('PDF settings reject invalid dimensions and preserve only supported numeric values', () => {
  for (const value of [{ fontSize: '20' }, { fontSize: NaN }, { fontSize: 50 }, { marginMm: 0 }, { minFontSize: 20 }, { theme: 'unknown' }, { showSolutions: 'false' }]) assert.throws(() => normalizePdfSettings(value));
  const value = normalizePdfSettings({ fontSize: 24, minFontSize: 14, theme: 'light' });
  assert.deepEqual(normalizePdfSettings(value), value);
  assert.equal(questionPdfSettings(value, { fontSize: 12 }).minFontSize, 12);
  assert.deepEqual(normalizeQuestionMetadata({ pdfStyle: { fontSize: 20, imageScale: 0.75 } }).pdfStyle, { fontSize: 20, imageScale: 0.75 });
});

test('chapter design and per-question sizes reach the final LaTeX with bounded fitting', () => {
  const payload = { subject: 'COA', chapter: 'CPU', pdfSettings: { fontSize: 22, minFontSize: 16, marginMm: 20, theme: 'light', lineSpacing: 1.5, showSolutions: false }, questions: [{ text: 'Question', solutionUrl: 'https://youtu.be/dQw4w9WgXcQ', pdfStyle: { fontSize: 20 } }] };
  const tex = buildQuestionPages(payload);
  assert.match(tex, /margin=20mm/);
  assert.match(tex, /\\pagecolor\{white\}/);
  assert.match(tex, /\\color\{black\}/);
  assert.match(tex, /\\fontsize\{20\}\{30\.00\}/);
  assert.doesNotMatch(tex, /youtube.com|\\resizebox\*\{!\}\{\\questionheight\}/);
  assert.match(tex, /does not fit at minimum font 16pt/);
  assert.match(buildQuestionPages({ ...payload, pdfSettings: { ...payload.pdfSettings, overflow: 'warn' } }), /GATEFITWARNING/);
});

test('large teaching fonts keep the scaled code frame inside the text width', () => {
  const tex = buildQuestionPages({ subject: 'Test', chapter: 'Code', pdfSettings: { fontSize: 24, minFontSize: 16 }, questions: [{ text: 'Read this program. [CODE]', code: 'for (int i=0; i<n; i++) {\n    total += i;\n}' }] });
  assert.match(tex, /\\begin\{minipage\}\{0\.750188\\textwidth\}/);
  assert.match(tex, /questioncodescale\}\{1\.333\}/);
});
