import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { mergeLoadedChapter } from '../src/lib/chapter-loading.mjs';

const origin = process.env.EDITOR_TEST_ORIGIN || 'http://127.0.0.1:3120';
const output = path.resolve('tmp/chapter-loading');
await fs.mkdir(output, { recursive: true });
const original = Array.from({ length: 75 }, (_, i) => ({ id: `batch-${i + 1}`, text: `Question ${i + 1}`, year: '2024', marks: '1', optA: 'A', optB: 'B' }));
let stored = { questions: original, lockCount: 0, updatedAt: '2026-10-27T00:00:00.000Z' };
const reads = [], writes = [], errors = [];
let failRead = false, acceptDialog = true, browser;
let preferences = null;
try {
  browser = await puppeteer.launch({ headless: true, args: ['--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050 });
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => acceptDialog ? dialog.accept() : dialog.dismiss());
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = new URL(request.url());
    const reply = (data, status = 200) => request.respond({ status, contentType: 'application/json', body: JSON.stringify(data) });
    if (url.origin === origin && url.pathname === '/api/preferences') {
      if (request.method() === 'POST') {
        const body = JSON.parse(request.postData());
        preferences = { lastSubject: body.subject, lastChapter: body.chapter };
      }
      return reply({ success: true, data: preferences });
    }
    if (url.origin === origin && url.pathname === '/api/chapters') {
      if (request.method() === 'POST') {
        const body = JSON.parse(request.postData()); writes.push(body);
        assert.equal(body.expectedUpdatedAt, stored.updatedAt);
        stored = { ...stored, ...mergeLoadedChapter(stored, body, body.loadedCount), updatedAt: new Date(Date.parse(stored.updatedAt) + 1000).toISOString() };
        return reply({ success: true, data: { totalQuestions: stored.questions.length, lockCount: stored.lockCount, updatedAt: stored.updatedAt } });
      }
      reads.push(Object.fromEntries(url.searchParams));
      if (failRead) return reply({ success: false, error: 'Database unavailable for this test.' }, 503);
      const offset = Number(url.searchParams.get('offset') || 0);
      const limit = url.searchParams.get('limit');
      return reply({ success: true, data: { ...stored, totalQuestions: stored.questions.length, questions: stored.questions.slice(offset, limit === 'all' ? undefined : offset + Number(limit)) } });
    }
    // Keep this UI regression independent of database credentials and export workers.
    if (url.origin === origin && url.pathname.startsWith('/api/')) return reply({ success: true, jobs: [], slides: [] });
    if (url.hostname === 'cdn.jsdelivr.net') return request.respond({ contentType: 'application/javascript', body: 'window.MathJax={typesetClear(){},typesetPromise:()=>Promise.resolve()};' });
    return request.continue();
  });
  const click = text => page.evaluate(text => {
    const button = [...document.querySelectorAll('button')].find(node => node.textContent.trim() === text);
    if (!button || button.disabled) throw new Error(`Missing or disabled button: ${text}`);
    button.click();
  }, text);
  const waitCount = count => page.waitForFunction(count => document.querySelectorAll('#questions_container > [id^="question-"]').length === count && !document.querySelector('#workspace-load-database').disabled, {}, count);
  const editFirst = async text => {
    await page.locator('#question-1 textarea').fill(text);
    await page.waitForFunction(() => document.body.textContent.includes('Synced (Unsaved)'));
  };
  await page.goto(origin, { waitUntil: 'networkidle2' });
  assert.equal(reads.length, 0, 'startup must not load database questions');
  assert.equal(await page.$eval('#workspace-question-limit', node => node.value), '10');
  const subject = await page.$eval('#workspace-subject', node => node.options[1].value);
  await page.select('#workspace-subject', subject);
  const chapter = await page.$eval('#workspace-chapter', node => node.options[1].value);
  await page.select('#workspace-chapter', chapter);
  assert.equal(reads.length, 0, 'dropdown changes must not load database questions');
  assert.ok(!await page.evaluate(() => document.body.textContent.includes('Reviving Database...')));
  await click('Load Database'); await waitCount(10);
  assert.deepEqual(reads[0], { subject, chapter, limit: '10' });
  assert.ok(await page.evaluate(() => document.body.textContent.includes('10 of 75 database questions loaded')));

  await editFirst('Edited question 1');
  await click('Load 10 more'); await waitCount(20);
  assert.equal(reads[1].offset, '10');
  assert.equal(await page.$eval('#question-1 textarea', node => node.value), 'Edited question 1');
  assert.equal(await page.$eval('#question-11 textarea', node => node.value), 'Question 11');
  await click('Save to database');
  await page.waitForFunction(() => !document.body.textContent.includes('Synced (Unsaved)') && ![...document.querySelectorAll('button')].some(node => node.textContent === 'Saving…'));
  assert.equal(writes[0].loadedCount, 20);
  assert.equal(stored.questions[0].text, 'Edited question 1');
  assert.deepEqual(stored.questions.slice(20), original.slice(20));

  await editFirst('Restored local edit');
  await page.waitForFunction(({ subject, chapter }) => JSON.parse(localStorage.getItem(`gate_draft_${subject}_${chapter}`))?.questions[0].text === 'Restored local edit', {}, { subject, chapter });
  const readCount = reads.length;
  await page.reload({ waitUntil: 'networkidle2' }); await waitCount(20);
  assert.equal(reads.length, readCount, 'restoring a local draft must not fetch database questions');
  assert.equal(await page.$eval('#question-1 textarea', node => node.value), 'Restored local edit');
  acceptDialog = false;
  await click('Load Database');
  await page.waitForFunction(() => document.activeElement?.tagName !== 'BUTTON' || !document.querySelector('#workspace-load-database').disabled);
  assert.equal(reads.length, readCount, 'declining replacement must keep the unsaved draft');
  acceptDialog = true;
  await page.select('#workspace-question-limit', '50');
  assert.equal(reads.length, readCount, 'changing batch size must not fetch');
  await click('Load Database'); await waitCount(50);
  assert.equal(reads.at(-1).limit, '50');

  failRead = true;
  await click('Load Database');
  await page.waitForFunction(() => document.body.textContent.includes('Database unavailable for this test.'));
  await waitCount(50);
  failRead = false;
  await page.select('#workspace-question-limit', 'all');
  await click('Load remaining questions'); await waitCount(75);
  assert.equal(reads.at(-1).offset, '50');
  assert.equal(reads.at(-1).limit, 'all');
  assert.ok(!await page.evaluate(() => [...document.querySelectorAll('button')].some(node => node.textContent.startsWith('Load remaining'))));
  await click('Load Database'); await waitCount(75);
  assert.equal(reads.at(-1).offset, undefined, 'All also works as a fresh load');

  await page.select('#workspace-question-limit', '10');
  await click('Load Database'); await waitCount(10);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: path.join(output, 'desktop.png') });
  await page.setViewport({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'mobile has no horizontal overflow');
  await page.screenshot({ path: path.join(output, 'mobile.png') });
  assert.deepEqual(errors, []);
  console.log('PASS: manual loading, 10/50/all, load more, safe batch save, local draft restore, failed fetch, and responsive layout.');
} finally {
  await browser?.close();
}
