import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { PDFDocument, PDFName } from 'pdf-lib';
import { exportQuestionPdf } from '../src/lib/pdf-export.mjs';

const root = path.resolve(process.argv[2] || 'tmp/pdfs/pdf-customization');
await fs.mkdir(root, { recursive: true });
const questions = Array.from({ length: 21 }, (_, index) => ({ id: `decor-${index + 1}`, year: '2024', marks: '1', text: `Evaluate $x^2+2x+1$ at $x=${index + 1}$.`, ...(index % 7 === 0 ? { code: 'for (int i=0; i<n; i++) {\n    total += i;\n}' } : {}), optA: '$1$', optB: '$2$', optC: '$3$', optD: '$4$', solutionUrl: 'https://youtu.be/dQw4w9WgXcQ?t=90' }));
const base = { subject: '1. Discrete Maths', chapter: '2. Set Theory and Algebra', questions };
const cases = [
  ['default-21', base],
  ['minimal', { ...base, questions: questions.slice(0, 3), pdfSettings: { showWatermark: false, showWebsite: false, showSolutions: false, showPageNumbers: false, titleMode: 'none', showQuestionNumber: false, showQuestionMeta: false } }],
  ['custom', { ...base, questions: questions.slice(0, 3), pdfSettings: { watermarkText: 'Example Academy', watermarkOpacity: 0.08, watermarkClickable: true, websiteUrl: 'https://example.com/learn?ref=pdf&path=%2Fa_b#practice', showWebsite: true, websiteLabel: 'Visit resources', websitePosition: 'bottom-center', pageNumberPosition: 'top-left', pageNumberTemplate: 'Page {page} of {total}', solutionPosition: 'bottom-right', solutionLabel: 'See solution', titleMode: 'every', titleText: 'Custom workbook', titleAlignment: 'center' } }],
  ['light', { ...base, questions: questions.slice(0, 3), pdfSettings: { theme: 'light', watermarkText: 'G4GATE', watermarkOpacity: 0.08, watermarkAngle: -30, watermarkPosition: 'bottom-center', openLinksInNewTab: false, pageNumberPosition: 'top-right' } }],
];
const reports = {};
const run = promisify(execFile);
for (const [name, payload] of cases) {
  const result = await exportQuestionPdf(payload);
  assert.equal(result.report.pages, payload.questions.length);
  assert.equal(result.report.textBoundsChecked, true);
  assert.deepEqual(result.report.warnings, []);
  const doc = await PDFDocument.load(result.pdf);
  const first = doc.getPage(0), annots = first.node.Annots();
  const links = [];
  for (let index = 0; annots && index < annots.size(); index++) {
    const annotation = annots.lookup(index), action = annotation.lookup(PDFName.of('A'));
    if (action?.lookup(PDFName.of('S'))?.toString() !== '/URI') continue;
    links.push({ url: action.lookup(PDFName.of('URI')).decodeText(), rect: annotation.lookup(PDFName.of('Rect')).asArray().map(value => value.asNumber()) });
  }
  if (name === 'default-21') {
    assert.equal(result.parts.length, 2);
    assert.equal(links.length, 1);
    assert.ok(links[0].rect[0] > first.getWidth() * 0.65);
    assert.ok(links[0].rect[1] > first.getHeight() * 0.85);
  }
  if (name === 'minimal') assert.equal(links.length, 0);
  if (name === 'custom') {
    const websiteLinks = links.filter(link => link.url === payload.pdfSettings.websiteUrl);
    assert.equal(websiteLinks.length, 2);
    const footer = websiteLinks.find(link => link.rect[1] < first.getHeight() * 0.2);
    assert.ok(footer);
    assert.ok(Math.abs((footer.rect[0] + footer.rect[2]) / 2 - first.getWidth() / 2) < 2);
    assert.equal(result.report.websiteLinks, 6);
  }
  const file = path.join(root, `${name}.pdf`);
  await fs.writeFile(file, result.pdf);
  const { stdout } = await run(process.env.PDFTOTEXT_BIN || 'pdftotext', ['-layout', file, '-'], { windowsHide: true });
  const pages = stdout.split('\f').slice(0, payload.questions.length);
  if (name === 'default-21') {
    assert.equal(pages.filter(page => page.includes('Discrete Maths - Set Theory and Algebra')).length, 1);
    assert.ok(pages[0].includes('Discrete Maths - Set Theory and Algebra'));
    assert.ok(!pages[20].includes('Discrete Maths - Set Theory and Algebra'));
    pages.forEach((page, index) => { assert.ok(page.includes('g4gate.com')); assert.ok(page.includes(`${index + 1} / 21`)); });
  }
  if (name === 'minimal') pages.forEach(page => { assert.ok(!page.includes('g4gate.com')); assert.ok(!page.includes('Discrete Maths')); assert.ok(!page.includes('Video sol.')); assert.ok(!page.includes('GATE 2024')); });
  if (name === 'custom') pages.forEach((page, index) => { assert.ok(page.includes('Custom workbook')); assert.ok(page.includes(`Page ${index + 1} of 3`)); });
  reports[name] = { ...result.report, firstPageLinks: links };
}
await fs.writeFile(path.join(root, 'decoration-qa.json'), JSON.stringify(reports, null, 2));
console.log(JSON.stringify(reports, null, 2));
