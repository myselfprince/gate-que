import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer';

const payload = JSON.parse(await fs.readFile(process.argv[2], 'utf8'));
const root = path.resolve('tmp/pdfs/export-upgrade/jobs-check');
const origin = 'http://127.0.0.1:3119';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3119'], { env: { ...process.env, AUTH_REQUIRED: 'false', PDF_EXPORT_DIR: root }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '', browser, page;
server.stdout.on('data', chunk => { logs = (logs + chunk).slice(-4000); });
server.stderr.on('data', chunk => { logs = (logs + chunk).slice(-4000); });
try {
  for (let count = 0; ; count++) {
    try { if ((await fetch(origin + '/api/auth/session')).ok) break; } catch { /* startup */ }
    if (count > 80) throw new Error(logs);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  browser = await puppeteer.launch({ headless: true, args: ['--disable-dev-shm-usage', '--disable-gpu'] });
  page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  await page.setRequestInterception(true);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    const url = new URL(request.url());
    const reply = value => request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(value) });
    if (url.pathname === '/api/preferences') return reply({ success: true, data: { lastSubject: payload.subject, lastChapter: payload.chapter } });
    if (url.pathname === '/api/chapters') return reply({ success: true, data: payload });
    if (url.hostname === 'cdn.jsdelivr.net') return request.respond({ status: 200, contentType: 'application/javascript', body: 'window.MathJax={typesetClear(){},typesetPromise:()=>Promise.resolve()};' });
    return request.continue();
  });
  await page.goto(origin, { waitUntil: 'networkidle0' });
  const { jobs } = await (await fetch(origin + '/api/pdf-jobs')).json();
  const large = jobs.find(job => job.total === payload.questions.length && job.status === 'completed');
  assert.ok(large, 'Run the background job verification first.');
  await page.waitForSelector('[aria-label="Export history"]');
  await page.select('[aria-label="Export history"]', large.id);
  await page.waitForFunction(() => document.querySelector('[aria-label="Actual PDF preview"] canvas')?.width > 100, { timeout: 30000 });
  await page.waitForSelector('[aria-label="Actual PDF preview"] a[href^="https://g4gate.com"]', { timeout: 10000 });
  await page.locator('[aria-label="PDF page number"]').fill('21');
  await page.waitForFunction(() => document.querySelector('[data-pdf-page="21"] canvas')?.width > 100);
  await page.select('[aria-label="PDF zoom"]', '1.5');
  await page.waitForFunction(() => document.querySelector('[data-pdf-page="21"] canvas')?.style.width.startsWith('1262'));
  await page.select('[aria-label="PDF zoom"]', 'fit');
  await page.waitForFunction(() => {
    const canvas = document.querySelector('[data-pdf-page="21"] canvas');
    return canvas?.dataset.renderedPage === '21' && Math.abs(Number(canvas.dataset.renderedWidth) - (canvas.parentElement.parentElement.clientWidth - 64)) < 2;
  });
  await page.$eval('[aria-label="Actual PDF preview"]', node => node.scrollIntoView({ block: 'center' }));
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.waitForFunction(() => Boolean(document.querySelector('[data-pdf-page="21"] canvas')?.dataset.renderedWidth));
  await page.screenshot({ path: 'tmp/pdfs/export-upgrade/pdf-preview-settled.png' });
  const canvasImage = await page.$eval('[data-pdf-page="21"] canvas', node => node.toDataURL('image/png').split(',')[1]);
  await fs.writeFile('tmp/pdfs/export-upgrade/pdf-preview-canvas.png', Buffer.from(canvasImage, 'base64'));
  const details = await page.evaluate(() => ({ page: document.querySelector('[data-pdf-page]')?.getAttribute('data-pdf-page'), linkCount: document.querySelectorAll('[aria-label="Actual PDF preview"] a').length, textSpans: document.querySelectorAll('[aria-label="Actual PDF preview"] canvas + div span').length, thumbnails: document.querySelectorAll('[aria-label="PDF page thumbnails"] button').length, alerts: [...document.querySelectorAll('[aria-label="Actual PDF preview"] [role="alert"]')].map(node => node.textContent) }));
  console.log(await page.evaluate(() => {
    const c=document.querySelector('[data-pdf-page] canvas');
    return {intrinsic:[c.width,c.height],css:[c.style.width,c.style.height],transform:c.getContext('2d').getTransform().toString(),rect:[c.getBoundingClientRect().width,c.getBoundingClientRect().height],sample1:[...c.getContext('2d').getImageData(500,300,1,1).data]};
  }));
  assert.deepEqual(errors, []);
  assert.deepEqual(details.alerts, []);
  assert.equal(details.page, '21');
  assert.ok(details.textSpans > 0);
  await page.select('[aria-label="Export question selection"]', 'range');
  await page.locator('[aria-label="Export ranges"]').fill('20-21');
  const submitted = page.waitForRequest(request => request.url() === origin + '/api/pdf-jobs' && request.method() === 'POST');
  await page.evaluate(() => [...document.querySelectorAll('button')].find(button => button.textContent === 'Build PDF · 2 questions').click());
  const exportRequest = JSON.parse((await submitted).postData());
  assert.deepEqual(exportRequest.questions.map(question => question.exportNumber), ['20', '21']);
  await page.waitForFunction(() => document.querySelector('[aria-label="PDF page number"]')?.max === '2' && Boolean(document.querySelector('[data-pdf-page="1"] canvas')?.dataset.renderedWidth), { timeout: 30000 });
  await page.$eval('[aria-label="PDF exports"]', node => node.scrollIntoView({ block: 'start' }));
  await page.evaluate(() => window.scrollBy(0, -210));
  await page.screenshot({ path: 'tmp/pdfs/export-upgrade/selection-preview.png' });
  details.rangeSelectionBuilt = true;
  console.log(JSON.stringify(details, null, 2));
} catch (error) {
  if (page) {
    console.log(await page.evaluate(() => ({ alerts: [...document.querySelectorAll('[role="alert"]')].map(node => node.textContent), links: [...document.querySelectorAll('[aria-label="Actual PDF preview"] a')].map(node => node.href) })));
    await (await page.$('[aria-label="PDF exports"]'))?.screenshot({ path: 'tmp/pdfs/export-upgrade/pdf-preview-error.png' });
  }
  throw error;
} finally { await browser?.close(); server.kill(); }
