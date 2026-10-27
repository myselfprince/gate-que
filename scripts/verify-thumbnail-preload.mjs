import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { loadWorkspaceQuestions } from './helpers/load-workspace.mjs';
import { buildThumbnailHtml } from '../src/lib/thumbnail-render.mjs';
const origin = process.env.EDITOR_TEST_ORIGIN || 'http://127.0.0.1:3120';
const output = path.resolve('tmp/thumbnail-preload'); await fs.mkdir(output, { recursive: true });
const fixture = { subject: '1. Discrete Maths', chapter: '1. Mathematical Logic', questions: Array.from({ length: 100 }, (_, i) => ({ id: `preload-${i}`, year: String(1995 + i % 30), marks: String(i % 2 + 1), text: `Let $p \\implies q$ and $a^2+b^2=25$. Which statement follows for the given propositions?`, optA: '$p \\land q$', optB: '$\\neg p \\lor q$', optC: 'True', optD: 'False' })) };
let browser, page;
try {
  browser = await puppeteer.launch({ headless: true, args: ['--disable-dev-shm-usage', '--disable-gpu'] });
  page = await browser.newPage(); await page.setViewport({ width: 1600, height: 1100 });
  const errors = [], review = [], legacy = [], responses = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin === origin && url.pathname === '/api/preferences') return request.respond({ contentType: 'application/json', body: JSON.stringify({ success: true, data: { subject: fixture.subject, chapter: fixture.chapter } }) });
    if (url.origin === origin && url.pathname === '/api/chapters') return request.respond({ contentType: 'application/json', body: JSON.stringify({ success: true, data: fixture }) });
    if (url.origin === origin && url.pathname === '/api/thumbnail-export') { const body = JSON.parse(request.postData()); if (body.mode === 'review') review.push(body); if (body.mode === 'preview' || body.mode === 'slides') legacy.push(body); }
    return request.continue();
  });
  const begin = performance.now(); let firstReadyMs = null;
  page.on('response', async response => {
    if (response.url() === origin + '/api/thumbnail-export' && response.request().postData()?.includes('"mode":"review"')) {
      if (response.ok() && firstReadyMs === null) firstReadyMs = Math.round(performance.now() - begin);
      responses.push(response.status());
    }
  });
  const activate = selector => page.$eval(selector, node => node.click());
  const current = () => page.$eval('[aria-label="Thumbnail question"]', select => select.value);
  await page.goto(origin, { waitUntil: 'networkidle2' });
  await loadWorkspaceQuestions(page);
  // Preloading starts while the main question editor is still selected.
  await page.waitForFunction(() => document.querySelector('[aria-label="Question preload progress"]')?.textContent.startsWith('All 100 questions ready'), { timeout: 180000 });
  const allReadyMs = Math.round(performance.now() - begin);
  assert.equal(await page.$eval('#tab-editor', node => node.getAttribute('aria-selected')), 'true');
  await activate('#tab-youtube'); await activate('#yt-thumbnail-tab');
  assert.equal(review.length, 10, 'one render per group, not per question'); assert.deepEqual(legacy, []);
  assert.equal(responses.length, 10); assert.ok(responses.every(status => status === 200));
  assert.ok(review.every(body => body.questions.length === 10));
  await page.waitForFunction(() => document.querySelector('img[alt="Q1 thumbnail preview"]')?.naturalWidth === 1280);
  assert.equal((await page.$$('[data-question-id]')).length, 10);
  const cardSrc = await page.$eval('[data-question-id="preload-0"] img', img => img.src), canvasSrc = await page.$eval('img[alt="Q1 thumbnail preview"]', img => img.src);
  assert.equal(cardSrc, canvasSrc, 'sidebar and canvas use the same full-size cached render');
  const source = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = 100; c.height = 200; c.getContext('2d').fillRect(0, 0, 100, 200); return c.toDataURL('image/png'); });
  const file = path.join(output, 'cutout.png'); await fs.writeFile(file, Buffer.from(source.split(',')[1], 'base64'));
  await (await page.$('[aria-label="Upload images"]')).uploadFile(file);
  await page.waitForSelector('[data-layer-id]'); await page.waitForFunction(() => !document.querySelector('[aria-label="Next question"]').disabled);
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent === 'Apply position & size to all questions').click());
  const y = await page.$eval('[aria-label="Y position (%)"]', input => Number(input.value));
  await page.focus('[data-question-id="preload-0"]');
  const timings = [];
  for (let i = 1; i < 100; i++) {
    const start = performance.now(); await page.keyboard.press('ArrowDown');
    await page.waitForFunction(id => document.querySelector('[aria-label="Thumbnail question"]').value === id, { timeout: 1500 }, `preload-${i}`);
    assert.equal(await page.$eval('[aria-label="Thumbnail studio"]', node => !!node.querySelector('[data-testid="thumbnail-canvas"] img[alt$="thumbnail preview"]')), true);
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-question-id')), `preload-${i}`, 'focus follows the active slide across groups');
    assert.ok(Math.abs(await page.$eval('[aria-label="Y position (%)"]', input => Number(input.value)) - y) < .01, 'sidebar arrows must not move the cutout');
    timings.push(performance.now() - start);
  }
  await page.keyboard.press('ArrowDown'); assert.equal(await current(), 'preload-99');
  await page.keyboard.press('ArrowUp'); await page.waitForFunction(() => document.querySelector('[aria-label="Thumbnail question"]').value === 'preload-98');
  assert.equal(review.length, 10, '100 cached navigations must not make new render requests');
  assert.equal(legacy.length, 0); assert.equal((await page.$$('[data-question-id]')).length, 10);
  await page.$eval('[aria-label="Thumbnail studio"]', node => node.focus()); await page.keyboard.press('ArrowDown');
  assert.ok(await page.$eval('[aria-label="Y position (%)"]', input => Number(input.value)) > y, 'canvas arrows still nudge the selected layer');
  const sorted = timings.toSorted((a, b) => a - b), p95 = Math.round(sorted[Math.floor(sorted.length * .95)]);
  assert.ok(p95 < 750, `Cached navigation should not wait for a network render; p95=${p95}ms`);
  const sample = await browser.newPage();
  await sample.setViewport({ width: 1280, height: 720 });
  await sample.setContent(buildThumbnailHtml({ subject: fixture.subject, chapter: fixture.chapter, items: [{ question: fixture.questions[1], number: 2 }], settings: {}, origin }), { waitUntil: 'load' });
  await sample.waitForSelector('html[data-ready="true"]', { timeout: 30000 });
  assert.equal(await sample.evaluate(() => window.thumbnailError || ''), '');
  assert.doesNotMatch(await sample.$eval('.meta', node => node.textContent), /\bQ\d+\b/);
  assert.doesNotMatch(await sample.$eval('.bottomline', node => node.textContent), /\bQ\d+\b/);
  assert.equal(await sample.$eval('.marks-badge', node => node.textContent), '2MARKS');
  assert.equal(await sample.$eval('.marks-badge strong', node => getComputedStyle(node).fontSize), '42px');
  assert.ok(await sample.$('mjx-container'), 'math stays rendered in the preloaded design');
  await sample.screenshot({ path: path.join(output, 'marks-highlight.png') }); await sample.close();
  await page.evaluate(() => document.querySelector('[aria-label="Thumbnail studio"]').scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: path.join(output, 'desktop.png'), fullPage: true });
  await page.setViewport({ width: 390, height: 844 }); await page.screenshot({ path: path.join(output, 'mobile.png'), fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  assert.deepEqual(errors, []);
  const result = { passed: true, questions: 100, reviewRequests: review.length, perQuestionRequests: legacy.length, firstReadyMs, allReadyMs, cachedNavigationP95Ms: p95, checks: ['preload before studio opens', '100 maths questions', 'full-size preview sharing', '10-slide DOM limit', 'sidebar up/down across groups', 'focus retained', 'cutout not nudged by sidebar arrows', 'canvas nudge preserved', 'no generated question labels', 'prominent marks badge', 'math rendered', 'mobile layout'], output };
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(result, null, 2)); console.log(JSON.stringify(result, null, 2));
} catch (error) { await page?.screenshot({ path: path.join(output, 'failure.png'), fullPage: true }).catch(() => {}); throw error; }
finally { await browser?.close(); }
