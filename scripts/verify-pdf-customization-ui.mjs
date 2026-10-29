import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer';
import { loadWorkspaceQuestions } from './helpers/load-workspace.mjs';
import AdmZip from 'adm-zip';

const root = path.resolve('tmp/pdfs/pdf-customization/ui');
await fs.mkdir(root, { recursive: true });
const payload = { subject: '1. Discrete Maths', chapter: '2. Set Theory and Algebra', questions: Array.from({ length: 3 }, (_, index) => ({ id: `custom-ui-${index}`, year: '2024', marks: '1', text: `Evaluate $x^2$ at $x=${index + 1}$.`, optA: '$1$', optB: '$2$', optC: '$3$', optD: '$4$', solutionUrl: 'https://youtu.be/dQw4w9WgXcQ?t=90' })) };
const origin = 'http://127.0.0.1:3120';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3120'], { env: { ...process.env, AUTH_REQUIRED: 'false', PDF_EXPORT_DIR: path.join(root, 'jobs') }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '', browser, page;
server.stdout.on('data', chunk => { logs = (logs + chunk).slice(-4000); });
server.stderr.on('data', chunk => { logs = (logs + chunk).slice(-4000); });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  for (let count = 0; ; count++) {
    try { if ((await fetch(origin + '/api/auth/session')).ok) break; } catch { /* startup */ }
    if (count > 80) throw new Error(logs);
    await delay(200);
  }
  browser = await puppeteer.launch({ headless: true, args: ['--disable-dev-shm-usage', '--disable-gpu'] });
  page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = new URL(request.url());
    const reply = value => request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(value) });
    if (url.pathname === '/api/preferences') return reply({ success: true, data: { lastSubject: payload.subject, lastChapter: payload.chapter } });
    if (url.pathname === '/api/chapters') return reply({ success: true, data: payload });
    if (url.hostname === 'cdn.jsdelivr.net') return request.respond({ status: 200, contentType: 'application/javascript', body: 'window.MathJax={typesetClear(){},typesetPromise:()=>Promise.resolve()};' });
    return request.continue();
  });
  await page.evaluateOnNewDocument(() => {
    if (!localStorage.getItem('gate-pdf-settings-v2')) localStorage.setItem('gate-pdf-settings-v1', JSON.stringify({ settings: { fontSize: 24, minFontSize: 12, showWebsite: false } }));
  });
  await page.goto(origin, { waitUntil: 'networkidle0' });
  await loadWorkspaceQuestions(page);
  await page.waitForFunction(() => document.querySelector('[aria-label="Preferred text size"]')?.value === '24');
  const openSettings = () => page.$eval('#tab-pdf', button => button.click());
  const clickButton = text => page.evaluate(text => [...document.querySelectorAll('button')].find(button => button.textContent === text).click(), text);
  const checkbox = (label, checked) => page.evaluate(({ label, checked }) => { const input = [...document.querySelectorAll('label')].find(node => node.textContent.trim() === label)?.querySelector('input'); if (!input) throw new Error(`Missing ${label}`); const group = input.closest('details'); if (group) group.open = true; if (input.checked !== checked) input.click(); }, { label, checked });
  const fill = async (label, value) => { await page.$eval(`[aria-label="${label}"]`, input => { const group = input.closest('details'); if (group) group.open = true; }); await page.locator(`[aria-label="${label}"]`).fill(value); await page.$eval(`[aria-label="${label}"]`, input => input.blur()); };
  await openSettings();
  assert.equal(await page.evaluate(() => [...document.querySelectorAll('label')].find(node => node.textContent.trim() === 'Show background watermark').querySelector('input').checked), false);
  await clickButton('Reset');
  await page.waitForFunction(() => document.querySelector('[aria-label="Preferred text size"]').value === '18');
  await fill('Watermark text', 'Custom Academy');
  await checkbox('Show page numbers', false);
  await checkbox('Show website link on every page', true);
  await page.select('[aria-label="Website link position"]', 'bottom-center');
  await fill('Website URL', 'javascript:alert(1)');
  await page.waitForFunction(() => document.querySelector('[aria-label="Website URL"]').getAttribute('aria-invalid') === 'true');
  assert.equal(await page.evaluate(() => [...document.querySelectorAll('button')].find(button => button.textContent.startsWith('Build PDF')).disabled), true);
  const website = 'https://example.com/learn?path=%2Fa_b#practice';
  await fill('Website URL', website);
  await page.waitForFunction(() => ![...document.querySelectorAll('button')].find(button => button.textContent.startsWith('Build PDF')).disabled);
  await fill('Website link label', 'Study resources');
  await fill('Template name', 'Custom teaching');
  await clickButton('Save template');
  const submitted = page.waitForRequest(request => request.url() === origin + '/api/pdf-jobs' && request.method() === 'POST');
  await clickButton('Build PDF · 3 questions');
  const exported = JSON.parse((await submitted).postData());
  assert.equal(exported.pdfSettings.watermarkText, 'Custom Academy');
  assert.equal(exported.pdfSettings.showPageNumbers, false);
  assert.equal(exported.pdfSettings.websiteUrl, website);
  const waitPreview = async total => page.waitForFunction(total => document.querySelector('[aria-label="PDF page number"]')?.max === String(total) && document.querySelector('[data-pdf-page="1"] canvas')?.dataset.renderedPage === '1', { timeout: 45000 }, total);
  await page.waitForSelector('[aria-label="Export history"]');
  await page.waitForFunction(() => [...document.querySelectorAll('summary')].some(node => node.textContent === 'Preview saved PDF'));
  await page.evaluate(() => { [...document.querySelectorAll('summary')].find(node => node.textContent === 'Preview saved PDF').parentElement.open = true; });
  await waitPreview(3);
  await page.waitForSelector('[aria-label="Actual PDF preview"] a[href^="https://www.youtube.com"]');
  assert.equal(await page.$eval('[aria-label="Actual PDF preview"] a', node => node.target), '_blank');
  let text = await page.$eval('[aria-label="Actual PDF preview"]', node => node.textContent);
  assert.ok(text.includes('Custom Academy'));
  assert.ok(text.includes('Discrete Maths - Set Theory and Algebra'));
  await page.locator('[aria-label="PDF page number"]').fill('2');
  await page.waitForFunction(() => document.querySelector('[data-pdf-page="2"] canvas')?.dataset.renderedPage === '2');
  text = await page.$eval('[aria-label="Actual PDF preview"] .textLayer', node => node.textContent).catch(() => page.$eval('[data-pdf-page="2"]', node => node.textContent));
  assert.ok(!text.includes('Discrete Maths - Set Theory and Algebra'));
  await page.$eval('[aria-label="Actual PDF preview"]', node => node.scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: path.join(root, 'custom-preview.png') });
  const sourceResponse = await fetch(origin + '/api/export-latex', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(exported) });
  assert.ok(sourceResponse.ok);
  const zip = new AdmZip(Buffer.from(await sourceResponse.arrayBuffer()));
  assert.equal(JSON.parse(zip.readAsText('chapter.json')).pdfSettings.watermarkText, 'Custom Academy');
  assert.ok(zip.readAsText('main.tex').includes('Study resources'));
  await page.reload({ waitUntil: 'networkidle0' });
  await loadWorkspaceQuestions(page);
  await page.waitForFunction(() => document.querySelector('[aria-label="Watermark text"]')?.value === 'Custom Academy');
  await openSettings();
  assert.ok(await page.evaluate(() => [...document.querySelectorAll('button')].some(button => button.textContent === 'Custom teaching')));
  await checkbox('Open PDF links in a new tab in the app preview', false);
  await page.waitForFunction(() => document.querySelector('[aria-label="Live PDF design preview"] [data-preview-current="true"] canvas')?.dataset.renderedPage === '1', { timeout: 70000 });
  await page.waitForSelector('[aria-label="Live PDF sample viewer"] a[href^="https://www.youtube.com"]');
  assert.equal(await page.$eval('[aria-label="Live PDF sample viewer"] a', node => node.target), '_self');
  await fill('Website URL', 'invalid');
  await page.waitForSelector('[aria-label="Website URL"][aria-invalid="true"]');
  await clickButton('Reset');
  await page.waitForFunction(() => document.querySelector('[aria-label="Website URL"]').value === 'https://g4gate.com/' && ![...document.querySelectorAll('button')].find(button => button.textContent.startsWith('Build PDF')).disabled);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ legacyMigration: true, invalidUrlBlocksExport: true, customSettingsExported: true, sourceZipMatches: true, titleFirstPageOnly: true, previewNewTabToggle: true, savedTemplateRestored: true, resetClearsInvalidDraft: true, browserErrors: errors }, null, 2));
} catch (error) {
  if (page) {
    await page.screenshot({ path: path.join(root, 'error.png') });
    console.log(await page.evaluate(() => [...document.querySelectorAll('[role="alert"]')].map(node => node.textContent)));
  }
  throw error;
} finally { await browser?.close(); server.kill(); }
