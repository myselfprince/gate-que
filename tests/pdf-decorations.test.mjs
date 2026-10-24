import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PDF_SETTINGS, normalizePdfSettings, migrateLegacyPdfSettings } from '../src/lib/pdf-settings.mjs';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';
import { documentTitle, expectedWebsiteLinks, pageDecorations } from '../src/lib/pdf-decorations.mjs';

const payload = { subject: '1. Discrete Maths', chapter: '2. Set Theory', questions: [{ text: 'One', solutionUrl: 'https://youtu.be/dQw4w9WgXcQ?t=90' }, { text: 'Two' }] };
test('watermarks, titles and positions default to the requested teaching layout', () => {
  const settings = normalizePdfSettings();
  assert.equal(settings.watermarkOpacity, 0.06);
  assert.equal(settings.watermarkPosition, 'center');
  assert.equal(settings.solutionPosition, 'top-right');
  assert.equal(settings.titleMode, 'first');
  assert.equal(settings.showWebsite, false);
  assert.equal(expectedWebsiteLinks(settings), 0);
  const tex = buildQuestionPages(payload);
  // A title appears in one measured body; subsequent font measurements can
  // repeat that first page's title, but the second page must not contain it.
  assert.ok(tex.slice(0, tex.indexOf('\\clearpage')).includes('Discrete Maths - Set Theory'));
  assert.ok(!tex.slice(tex.indexOf('\\clearpage')).includes('Discrete Maths - Set Theory'));
  const chunk = buildQuestionPages(payload, { startIndex: 20, totalQuestions: 22 });
  assert.ok(!chunk.includes('Discrete Maths - Set Theory'));
  assert.ok(tex.includes('white!6.00!black'));
  assert.ok(!tex.includes('Watch video solution'));
});

test('hidden furniture disappears and configurable links/numbering use their assigned slots', () => {
  const settings = normalizePdfSettings({ showWatermark: false, showWebsite: true, websiteUrl: 'https://example.com/?a=1&b=%2F#notes', websiteLabel: 'Resources', showPageNumbers: true, pageNumberPosition: 'top-left', pageNumberTemplate: 'Page {page} of {total}', solutionPosition: 'bottom-right', solutionLabel: 'See solution' });
  const row = pageDecorations({ settings, question: payload.questions[0], page: 21, total: 30, foreground: 'white' });
  assert.ok(row.top.includes('Page 21 of 30'));
  assert.ok(row.bottom.includes('See solution'));
  assert.ok(row.bottom.includes('b=\\%2F\\#notes'));
  const hidden = buildQuestionPages({ ...payload, pdfSettings: { showWatermark: false, showWebsite: false, showSolutions: false, showPageNumbers: false, titleMode: 'none', showQuestionNumber: false, showQuestionMeta: false } });
  assert.ok(!hidden.includes('shipout/background'));
  assert.ok(!hidden.includes('1 / 2'));
  assert.ok(!hidden.includes('Discrete Maths - Set Theory'));
  assert.equal(documentTitle('1. Subject', '2. Chapter', normalizePdfSettings({ titleText: 'My workbook' })), 'My workbook');
});

test('saved legacy fonts survive the new default branding and invalid link/settings values fail closed', () => {
  const migrated = migrateLegacyPdfSettings({ fontSize: 24, minFontSize: 12, showWebsite: true });
  assert.equal(migrated.fontSize, 24); assert.equal(migrated.showWebsite, false); assert.equal(migrated.showWatermark, true);
  assert.equal(migrateLegacyPdfSettings({ showWebsite: false }).showWatermark, false);
  assert.deepEqual(normalizePdfSettings(DEFAULT_PDF_SETTINGS), DEFAULT_PDF_SETTINGS);
  for (const settings of [{ websiteUrl: 'javascript:alert(1)' }, { websiteUrl: 'https://user:password@example.com' }, { watermarkOpacity: 2 }, { pageNumberPosition: 'outside' }, { titleMode: 'sometimes' }, { solutionLabel: 'x\n\\input{file}' }]) assert.throws(() => normalizePdfSettings(settings));
});
