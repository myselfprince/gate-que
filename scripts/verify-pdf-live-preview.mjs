import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import { createJob, jobDirectory, writeJobStatus } from '../src/lib/pdf-jobs.mjs';
const output = path.resolve('tmp/pdfs/live-preview-check'); await fs.mkdir(output, { recursive: true });
const jobs = path.join(output, `jobs-${randomUUID()}`);
const origin = 'http://127.0.0.1:3121';
const figureName = `codex-pdf-preview-${randomUUID()}`;
const fixture = { subject: '1. Discrete Maths', chapter: '1. Mathematical Logic', questions: [
  { id: 'pdf-preview-blank', isBlank: true, text: '', year: '2024', marks: '1' },
  { id: 'pdf-preview-math', text: 'Let $p \\implies q$. Which proposition is equivalent to $\\neg p \\lor q$?', year: '2024', marks: '2', optA: '$p \\implies q$', optB: '$p \\land q$', optC: '$\\neg q$', optD: '$p \\lor q$', solutionUrl: 'https://youtu.be/dQw4w9WgXcQ?t=90' },
  { id: 'pdf-preview-diagram', text: 'Interpret the circuit below. [IMG_1]', diagram: figureName, ext: '.png', year: '2025', marks: '1', optA: 'Series', optB: 'Parallel' },
] };
const figure = path.resolve('public', fixture.subject, fixture.chapter, `${figureName}.png`);
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3121'], { env: { ...process.env, AUTH_REQUIRED: 'false', PDF_EXPORT_DIR: jobs }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '', browser, page;
server.stdout.on('data', chunk => { logs = (logs + chunk).slice(-6000); }); server.stderr.on('data', chunk => { logs = (logs + chunk).slice(-6000); });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  for (let i = 0; ; i++) { try { if ((await fetch(origin + '/api/auth/session')).ok) break; } catch { /* startup */ } if (i > 100) throw Error(logs); await delay(100); }
  browser = await puppeteer.launch({ headless: true, args: ['--disable-dev-shm-usage', '--disable-gpu'] });
  page = await browser.newPage(); await page.setViewport({ width: 1600, height: 1100 });
  const drawing = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = 400; c.height = 100; const ctx = c.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 400, 100); ctx.strokeStyle = '#00aa66'; ctx.lineWidth = 5; ctx.strokeRect(60, 25, 280, 50); ctx.fillStyle = '#222222'; ctx.font = '22px Arial'; ctx.fillText('Circuit example', 110, 58); return c.toDataURL('image/png'); });
  await fs.mkdir(path.dirname(figure), { recursive: true }); await fs.writeFile(figure, Buffer.from(drawing.split(',')[1], 'base64'), { flag: 'wx' });
  const cdp = await page.createCDPSession(); await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: output });
  const errors = [], previews = [], jobPosts = [], deletes = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin === origin && url.pathname === '/api/preferences') return request.respond({ contentType: 'application/json', body: JSON.stringify({ success: true, data: { subject: fixture.subject, chapter: fixture.chapter } }) });
    if (url.origin === origin && url.pathname === '/api/chapters') return request.respond({ contentType: 'application/json', body: JSON.stringify({ success: true, data: fixture }) });
    // Thumbnail preloading is unrelated to this PDF regression and uses no compiler time here.
    if (url.origin === origin && url.pathname === '/api/thumbnail-export') { const data = JSON.parse(request.postData()); return request.respond({ contentType: 'application/json', body: JSON.stringify({ slides: data.questions.map((q, i) => ({ questionId: q.id, number: data.questionNumbers[i], dataUrl: drawing })) }) }); }
    if (url.pathname === '/api/pdf-preview') previews.push({ body: JSON.parse(request.postData()), start: performance.now() });
    if (url.pathname === '/api/pdf-jobs' && request.method() === 'POST') jobPosts.push(JSON.parse(request.postData()));
    if (url.pathname.startsWith('/api/pdf-jobs/') && request.method() === 'DELETE') deletes.push(url.pathname.split('/').at(-1));
    return request.continue();
  });
  let lastBytes, lastDuration;
  page.on('response', async response => { if (response.url() === origin + '/api/pdf-preview' && response.ok()) { lastBytes = await response.buffer(); lastDuration = Math.round(performance.now() - previews.at(-1).start); } });
  const activate = selector => page.$eval(selector, node => node.click());
  const click = text => page.evaluate(text => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === text && b.getClientRects().length); if (!b || b.disabled) throw Error('Missing or disabled button: ' + text); b.click(); }, text);
  const sampleReady = () => page.waitForFunction(() => { const root = document.querySelector('[aria-label="Live PDF design preview"]'); return root?.querySelector('[data-preview-current="true"] canvas')?.dataset.renderedPage === '1' && [...root.querySelectorAll('[role="status"]')].some(node => node.textContent === 'Up to date'); }, { timeout: 70000 });
  const range = (label, value) => page.$eval(`[aria-label="${label}"]`, (input, value) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); }, String(value));
  const theme = value => page.evaluate(value => { const select = [...document.querySelectorAll('label')].find(label => label.textContent.startsWith('Page theme')).querySelector('select'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, value); select.dispatchEvent(new Event('change', { bubbles: true })); }, value);
  const checkbox = (text, checked) => page.evaluate(({ text, checked }) => { const input = [...document.querySelectorAll('label')].find(node => node.textContent.trim() === text)?.querySelector('input'); if (!input) throw Error('Missing ' + text); if (input.checked !== checked) input.click(); }, { text, checked });
  const sampleBackground = () => page.$eval('[aria-label="Live PDF sample viewer"] canvas', canvas => [...canvas.getContext('2d').getImageData(5, 5, 1, 1).data]);
  await page.goto(origin, { waitUntil: 'networkidle2' }); assert.equal(previews.length, 0, 'hidden PDF tab must not compile previews');
  await activate('#tab-pdf'); await sampleReady();
  assert.equal(previews.length, 1); assert.equal(previews[0].body.questions.length, 1); assert.equal(previews[0].body.questions[0].id, 'pdf-preview-math'); assert.equal(previews[0].body.questions[0].exportNumber, '2');
  assert.equal((await PDFDocument.load(lastBytes)).getPageCount(), 1); assert.equal(jobPosts.length, 0);
  assert.deepEqual((await (await fetch(origin + '/api/pdf-jobs')).json()).jobs, []);
  const initialMs = lastDuration, dark = await sampleBackground(); assert.ok(dark[0] < 30 && dark[1] < 30 && dark[2] < 30);
  const count = previews.length;
  await range('Preferred text size', 20); await range('Preferred text size', 22); await range('Preferred text size', 24);
  assert.ok(await page.$('[aria-label="Live PDF sample viewer"] canvas'), 'previous preview remains visible while updating');
  await sampleReady(); assert.equal(previews.length, count + 1, 'rapid slider changes compile only once'); assert.equal(previews.at(-1).body.pdfSettings.fontSize, 24);
  const settingsUpdateMs = lastDuration;
  await theme('light'); await sampleReady(); const light = await sampleBackground(); assert.ok(light[0] > 240 && light[1] > 240 && light[2] > 240);
  const beforeCache = previews.length; await theme('dark'); await sampleReady(); await delay(600); assert.equal(previews.length, beforeCache, 'previous settings reuse cached PDF bytes');
  const beforeExtras = previews.length; await checkbox('Matching page images ZIP', true); await checkbox('Separate answer-key PDF', true); await delay(650); assert.equal(previews.length, beforeExtras);
  await checkbox('Matching page images ZIP', false); await checkbox('Separate answer-key PDF', false);
  await page.select('[aria-label="Live PDF example question"]', 'pdf-preview-diagram'); await sampleReady();
  assert.equal(previews.at(-1).body.questions[0].diagram, figureName); assert.equal((await PDFDocument.load(lastBytes)).getPageCount(), 1);
  await fs.writeFile(path.join(output, 'diagram-sample.pdf'), lastBytes);
  await page.select('[aria-label="Live PDF example question"]', 'pdf-preview-math'); await sampleReady();
  const sampleDownload = path.join(output, 'Question-2-preview.pdf'); await fs.rm(sampleDownload, { force: true });
  await click('Download sample PDF');
  let sampleBytes;
  for (let i = 0; i < 100; i++) { try { sampleBytes = await fs.readFile(sampleDownload); if (sampleBytes.length > 32) break; } catch { /* download */ } await delay(100); }
  await fs.writeFile(path.join(output, 'math-sample.pdf'), sampleBytes);
  assert.equal(jobPosts.length, 0); assert.deepEqual((await (await fetch(origin + '/api/pdf-jobs')).json()).jobs, []);
  await page.evaluate(() => document.querySelector('[aria-label="Live PDF design preview"]').scrollIntoView({ block: 'center' })); await page.screenshot({ path: path.join(output, 'live-preview.png') });
  await click('Build PDF · 3 questions');
  let exported;
  for (let i = 0; i < 200; i++) { const state = await (await fetch(origin + '/api/pdf-jobs')).json(); exported = state.jobs[0]; if (exported?.status === 'completed') break; if (exported?.status === 'failed') throw Error(JSON.stringify(exported)); await delay(150); }
  assert.equal(exported.status, 'completed'); assert.equal(jobPosts.length, 1);
  await page.waitForFunction(id => [...document.querySelectorAll('a')].some(a => a.href.includes(id + '/download')) && [...document.querySelectorAll('button')].some(b => b.textContent === 'Download & remove saved PDF'), { timeout: 10000 }, exported.id);
  const downloadedName = path.join(output, 'G4Gate-3-questions.pdf'); await fs.rm(downloadedName, { force: true });
  await click('Download & remove saved PDF');
  await page.waitForFunction(() => !document.querySelector('[aria-label="Export history"]'), { timeout: 15000 });
  let downloaded;
  for (let i = 0; i < 100; i++) { try { downloaded = await fs.readFile(downloadedName); if (downloaded.length > 32) break; } catch { /* download */ } await delay(100); }
  assert.equal((await PDFDocument.load(downloaded)).getPageCount(), 3);
  assert.equal((await fetch(origin + '/api/pdf-jobs/' + exported.id)).status, 404); assert.equal((await fetch(origin + '/api/pdf-jobs/' + exported.id + '/download')).status, 404);
  await assert.rejects(fs.access(jobDirectory(exported.id, jobs)), { code: 'ENOENT' });
  // Also exercise the standalone delete action with a completed, independently saved fixture.
  const manual = await createJob({ ...fixture, questions: [fixture.questions[1]], pdfSettings: {} }, { root: jobs, launch: false });
  await fs.writeFile(path.join(jobDirectory(manual.id, jobs), 'complete.pdf'), sampleBytes);
  await writeJobStatus(jobDirectory(manual.id, jobs), { ...manual, status: 'completed', report: { pages: 1, warnings: [], textBoundsChecked: true } });
  const rejected = await fetch(origin + '/api/pdf-jobs/' + manual.id, { method: 'DELETE', headers: { Origin: 'https://outside.example' } }); assert.equal(rejected.status, 403);
  await click('Refresh history'); await page.waitForSelector('[aria-label="Export history"]');
  await click('Delete generated PDF'); await page.waitForFunction(() => !document.querySelector('[aria-label="Export history"]'));
  assert.ok(deletes.includes(exported.id) && deletes.includes(manual.id)); assert.deepEqual((await (await fetch(origin + '/api/pdf-jobs')).json()).jobs, []);
  assert.equal((await fetch(origin + '/api/pdf-jobs/' + manual.id)).status, 404);
  assert.equal((await page.$$('[aria-label="Live PDF example question"] option')).length, 2);
  await sampleReady(); assert.ok(await page.$('[aria-label="Live PDF sample viewer"] canvas'));
  const invalid = await fetch(origin + '/api/pdf-preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fixture) }); assert.equal(invalid.status, 422);
  await page.setViewport({ width: 390, height: 844 }); await page.screenshot({ path: path.join(output, 'mobile.png'), fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'mobile layout has no horizontal overflow');
  assert.deepEqual(errors, []);
  const result = { passed: true, initialPreviewMs: initialMs, settingsCompileMs: settingsUpdateMs, previewRequests: previews.length, persistedExportsCreated: jobPosts.length, checks: ['automatic one-question example', 'no compilation while hidden', 'actual PDF bytes and canvas', 'slider debounce', 'old preview stays visible', 'dark/light layout', 'cached presets', 'no answer/image side artifacts', 'diagram example', 'clean export history', 'full export still works', 'download then remove saved export', 'standalone deletion', 'download survives deletion', 'cross-origin deletion blocked', 'preview remains after deletion', 'mobile layout'], output };
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(result, null, 2)); console.log(JSON.stringify(result, null, 2));
} catch (error) { await page?.screenshot({ path: path.join(output, 'error.png'), fullPage: true }).catch(() => {}); console.log(logs); throw error; }
finally { await browser?.close(); server.kill(); await fs.rm(figure, { force: true }); }
