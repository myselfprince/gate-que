import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { PDFDocument, PDFName } from 'pdf-lib';
import puppeteer from 'puppeteer';
import { exportQuestionPdf } from '../src/lib/pdf-export.mjs';
import { exportPdfBook } from '../src/lib/pdf-book.mjs';
import { registerAnswerLayers } from '../src/lib/pdf-answers.mjs';
import { loadWorkspaceQuestions } from './helpers/load-workspace.mjs';
const require = createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const run = promisify(execFile), origin = process.env.MOCK_TEST_ORIGIN || 'http://127.0.0.1:3100';
const dir = path.resolve('tmp/pdfs/answer-modes'); await fs.mkdir(dir, { recursive: true });
const questions = Array.from({ length: 21 }, (_, i) => ({ id: `answer-qa-${i + 1}`, text: `Question ${i + 1}: Choose the correct result for $2+2$.`, year: '2006', examPaper: 'IT', marks: '1', code: '', optA: '$3$', optB: '$4$', optC: '$5$', optD: '$6$', correctOptions: i === 1 ? [] : ['B'], questionType: 'MCQ' }));
questions[2] = { ...questions[2], text: 'Find the value of $1/2$.', optA: '', optB: '', optC: '', optD: '', correctOptions: [], questionType: 'NAT', natAnswer: '$\\frac{1}{2}$' };
const payload = { subject: 'PDF QA', chapter: 'Answer modes', questions, pdfSettings: { theme: 'light', showWatermark: false } };
const samples = {};
for (const mode of ['none', 'footer', 'toggle']) {
  const result = await exportQuestionPdf({ ...payload, questions: mode === 'toggle' ? questions : questions.slice(0, 3), pdfSettings: { ...payload.pdfSettings, answerMode: mode } });
  await fs.writeFile(path.join(dir, `${mode}.pdf`), result.pdf);
  const doc = await PDFDocument.load(result.pdf);
  if (mode === 'toggle') {
    assert.equal(result.parts.length, 2);
    assert.equal(doc.catalog.lookup(PDFName.of('OCProperties')).lookup(PDFName.of('OCGs')).size(), 20);
    assert.equal(doc.getPage(1).node.Resources().lookup(PDFName.of('Properties')), undefined);
  }
  const sample = await PDFDocument.create(); const [page] = await sample.copyPages(doc, [0]); sample.addPage(page); registerAnswerLayers(sample); samples[mode] = Buffer.from(await sample.save());
}
await fs.mkdir(path.join(dir, 'chapters'), { recursive: true });
const chapters = [];
for (const mode of ['toggle', 'footer']) {
  const bytes = await fs.readFile(path.join(dir, `${mode}.pdf`)); await fs.writeFile(path.join(dir, 'chapters', `${mode}.pdf`), bytes);
  chapters.push({ file: `${mode}.pdf`, sha256: createHash('sha256').update(bytes).digest('hex'), sourceId: mode, chapter: mode, pages: mode === 'toggle' ? 21 : 3, questionIds: [], report: { warnings: [], textBoundsChecked: true } });
}
const book = await exportPdfBook({ subject: 'PDF QA', chapter: 'Book', total: 24, chapters }, { directory: dir });
assert.equal((await PDFDocument.load(book.pdf)).catalog.lookup(PDFName.of('OCProperties')).lookup(PDFName.of('OCGs')).size(), 20);
const poppler = 'C:/Users/Prince/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe';
for (const mode of ['footer', 'toggle']) await run(poppler, ['-png', '-f', '1', '-l', '1', '-scale-to', '1400', path.join(dir, `${mode}.pdf`), path.join(dir, mode)], { windowsHide: true });
let browser;
try {
  browser = await puppeteer.launch({ headless: true }); const page = await browser.newPage();
  const login = await fetch(origin + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: process.env.APP_PASSWORD }) });
  assert.equal(login.status, 200); const cookie = login.headers.get('set-cookie');
  if (cookie) { const raw = cookie.split(';')[0], at = raw.indexOf('='); await browser.setCookie({ name: raw.slice(0, at), value: raw.slice(at + 1), url: origin }); }
  const fixture = { ...payload, questions: questions.slice(0, 3), _id: 'pdf-answer-fixture', updatedAt: new Date().toISOString(), totalQuestions: 3, lockCount: 0 };
  await page.setViewport({ width: 1440, height: 1100 }); await page.setRequestInterception(true);
  page.on('request', request => {
    const url = new URL(request.url());
    const json = data => request.respond({ contentType: 'application/json', body: JSON.stringify(data) });
    if (url.pathname === '/api/preferences') return json({ success: true, data: { subject: fixture.subject, chapter: fixture.chapter } });
    if (url.pathname === '/api/chapters') return json({ success: true, data: fixture });
    if (url.pathname === '/api/pdf-jobs') return json({ success: true, jobs: [] });
    if (url.pathname === '/api/pdf-preview') return request.respond({ contentType: 'application/pdf', body: samples[JSON.parse(request.postData()).pdfSettings.answerMode || 'none'], headers: { 'X-PDF-Pages': '1', 'X-PDF-Warnings': encodeURIComponent('[]') } });
    if (url.pathname === '/api/thumbnail-export') return json({ slides: [] });
    return request.continue();
  });
  await page.goto(origin, { waitUntil: 'networkidle2' }); await loadWorkspaceQuestions(page);
  await page.$eval('#tab-pdf', node => node.click());
  const ready = () => page.waitForFunction(() => document.querySelector('[data-preview-current="true"] canvas')?.dataset.renderedPage === '1', { timeout: 30000 });
  await ready(); await page.select('[aria-label="PDF answer display"]', 'toggle');
  await page.waitForSelector('button[aria-label="Show / hide answer"]'); await ready();
  const image = () => page.$eval('[data-preview-current="true"] canvas', canvas => canvas.toDataURL());
  const hidden = await image(); await fs.writeFile(path.join(dir, 'preview-hidden.png'), Buffer.from(hidden.split(',')[1], 'base64'));
  await page.click('button[aria-label="Show / hide answer"]');
  await page.waitForFunction(before => document.querySelector('[data-preview-current="true"] canvas')?.toDataURL() !== before, {}, hidden);
  await ready(); const visible = await image(); assert.notEqual(visible, hidden);
  await fs.writeFile(path.join(dir, 'preview-revealed.png'), Buffer.from(visible.split(',')[1], 'base64'));
  await page.click('button[aria-label="Show / hide answer"]');
  await page.waitForFunction(before => document.querySelector('[data-preview-current="true"] canvas')?.toDataURL() === before, {}, hidden);
  await page.select('[aria-label="PDF answer display"]', 'footer'); await ready();
  await page.waitForFunction(() => !document.querySelector('button[aria-label="Show / hide answer"]'));
  console.log('PDF answer modes compiled; two-batch and book layers retained; app preview hides, reveals and re-hides the stored answer.');
  await fs.writeFile(path.join(dir, 'report.json'), JSON.stringify({ passed: true, modes: ['none', 'footer', 'toggle'], togglePages: 21, initiallyHiddenGroups: 20, bookLayersPreserved: true, previewToggle: true, unknownAnswersOmitted: true }, null, 2));
} finally { await browser?.close(); }
