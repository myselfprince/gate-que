import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import AdmZip from 'adm-zip';
const origin = process.env.EDITOR_TEST_ORIGIN || 'http://127.0.0.1:3120';
const output = path.resolve('tmp/thumbnail-questions');
await fs.mkdir(output, { recursive: true });
const questions = Array.from({ length: 23 }, (_, i) => ({ id: `slide-${i}`, text: `Question ${i + 1}: choose the correct network protocol.`, year: '2024', marks: '1', optA: 'Flow control', optB: 'Routing' }));
questions.splice(4, 0, { id: 'blank-slide', isBlank: true, text: '', year: '2024', marks: '1' });
const fixture = { subject: '1. Discrete Maths', chapter: '1. Mathematical Logic', questions };
const chapterKey = JSON.stringify([fixture.subject, fixture.chapter]);
const zipName = `${fixture.subject}_${fixture.chapter}_Thumbnails.zip`.replace(/[^a-zA-Z0-9_.-]+/g, '_');
for (const name of ['Question_1.png', 'Question_2.png', zipName]) await fs.rm(path.join(output, name), { force: true });
const downloaded = async name => {
  for (let attempt = 0; attempt < 600; attempt++) {
    try { const bytes = await fs.readFile(path.join(output, name)); if (bytes.length > 32) return bytes; } catch { /* pending download */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw Error(`Download did not finish: ${name}`);
};
let browser, page;
try {
  browser = await puppeteer.launch({ headless: true, args: ['--disable-dev-shm-usage', '--disable-gpu'] });
  page = await browser.newPage(); await page.setViewport({ width: 1600, height: 1100 });
  const cdp = await page.createCDPSession(); await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: output });
  const errors = [], slideRequests = [], exported = [], batches = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', async response => {
    if (response.url() === origin + '/api/thumbnail-export' && response.request().postData()?.includes('"mode":"review"') && response.ok()) {
      try { batches.push(await response.json()); } catch { /* cancelled group */ }
    }
  });
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin === origin && url.pathname === '/api/preferences') return request.respond({ contentType: 'application/json', body: JSON.stringify({ success: true, data: { subject: fixture.subject, chapter: fixture.chapter } }) });
    if (url.origin === origin && url.pathname === '/api/chapters') return request.respond({ contentType: 'application/json', body: JSON.stringify({ success: true, data: fixture }) });
    if (url.origin === origin && url.pathname === '/api/thumbnail-export') {
      const body = JSON.parse(request.postData());
      if (body.mode === 'review') slideRequests.push(body);
      if (body.mode === 'single' || body.mode === 'zip') exported.push(body);
    }
    return request.continue();
  });
  const activate = selector => page.$eval(selector, node => node.click());
  const click = text => page.evaluate(text => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === text && b.getClientRects().length); if (!b || b.disabled) throw Error('Missing or disabled: ' + text); b.click(); }, text);
  const value = label => page.$eval(`[aria-label="${label}"]`, input => Number(input.value));
  const fill = async (label, value) => {
    await page.focus(`[aria-label="${label}"]`); await page.keyboard.down('Control'); await page.keyboard.press('KeyA'); await page.keyboard.up('Control');
    await page.keyboard.press('Backspace'); await page.keyboard.type(String(value)); await page.keyboard.press('Tab');
  };
  const setRange = (label, value) => page.$eval(`[aria-label="${label}"]`, (input, value) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); }, value);
  const currentId = () => page.$eval('[aria-label="Thumbnail question"]', select => select.value);
  const choose = async id => { await page.select('[aria-label="Thumbnail question"]', id); await page.waitForFunction(id => document.querySelector('[aria-label="Thumbnail question"]').value === id, {}, id); };
  const saved = () => page.waitForFunction(() => [...document.querySelectorAll('[role="status"]')].some(node => node.textContent === 'Saved in this browser'));
  const readyPreview = () => page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => /^Download Q\d+ PNG$/.test(button.textContent) && !button.disabled), { timeout: 70000 });
  const open = async () => { await page.goto(origin, { waitUntil: 'networkidle2' }); await activate('#tab-youtube'); await activate('#yt-thumbnail-tab'); await readyPreview(); };
  await page.goto(origin, { waitUntil: 'networkidle2' });
  // Migrate an existing shared cutout rather than replacing the user's saved format.
  await page.evaluate(async () => {
    const canvas = document.createElement('canvas'); canvas.width = 200; canvas.height = 300; const ctx = canvas.getContext('2d'); ctx.fillStyle = '#ed755f'; ctx.fillRect(0, 0, 200, 300);
    await new Promise((resolve, reject) => { const request = indexedDB.open('gate-creator-assets-v1', 1); request.onupgradeneeded = () => request.result.createObjectStore('assets'); request.onerror = () => reject(request.error); request.onsuccess = () => { const db = request.result, tx = db.transaction('assets', 'readwrite'); tx.objectStore('assets').put({ version: 2, settings: {}, editor: { version: 1, assets: [{ id: 'photo', name: 'Cutout', dataUrl: canvas.toDataURL('image/png') }], layers: [{ id: 'cutout', type: 'image', name: 'Cutout', assetId: 'photo', x: 60, y: 15, width: 25, height: 60 }] } }, 'thumbnail-editor-v2'); tx.oncomplete = () => { db.close(); resolve(); }; }; });
  });
  await page.evaluate(chapterKey => new Promise(resolve => {
    const request = indexedDB.open('gate-creator-assets-v1', 1);
    request.onsuccess = () => {
      const db = request.result, tx = db.transaction('assets', 'readwrite'), store = tx.objectStore('assets');
      const legacy = store.get('thumbnail-editor-v2');
      legacy.onsuccess = () => store.put(legacy.result, 'thumbnail-editor-v3:' + chapterKey);
      tx.oncomplete = () => { db.close(); resolve(); };
    };
  }), chapterKey);
  await open();
  await page.waitForFunction(() => [...document.querySelectorAll('[aria-label="Question slides"] img')].some(img => img.naturalWidth === 1280), { timeout: 70000 });
  assert.equal((await page.$$('[data-question-id]')).length, 10);
  assert.equal((await page.$$('[data-testid="thumbnail-canvas"]')).length, 1);
  await page.waitForFunction(() => document.querySelector('[aria-label="Question preload progress"]')?.textContent.startsWith('All 23 questions ready'));
  const initialReviewRequests = slideRequests.length;
  assert.ok(slideRequests.every(body => body.questions.length <= 10));
  assert.ok(slideRequests[0].questionNumbers.includes(11), 'original numbering skips blank Q5');
  assert.ok(!slideRequests[0].questionNumbers.includes(5));
  assert.ok((await page.$eval('[aria-label="Scrollable question previews"]', node => node.scrollHeight > node.clientHeight)), 'ten previews scroll vertically');
  await page.$eval('[data-layer-id="cutout"]', node => node.focus()); await activate('#design-tab-object');
  await fill('X position (%)', -12); await fill('Y position (%)', 6); await fill('Width (px)', 300);
  await activate('[aria-label="Next question"]'); assert.equal(await currentId(), 'slide-1');
  assert.equal(await value('X position (%)'), 60, 'Q1 edits must not change Q2');
  await fill('X position (%)', 15); await fill('Width (px)', 220);
  const replacementData = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = 200; c.height = 300; const ctx = c.getContext('2d'); ctx.fillStyle = '#3377ee'; ctx.fillRect(0, 0, 200, 300); return c.toDataURL('image/png'); });
  const replacementPath = path.join(output, 'replacement.png'); await fs.writeFile(replacementPath, Buffer.from(replacementData.split(',')[1], 'base64'));
  await (await page.$('[aria-label="Replace selected image"]')).uploadFile(replacementPath);
  await page.waitForFunction(() => document.querySelector('[data-layer-id="cutout"] img')?.src.includes('data:image/png'));
  await page.waitForFunction(() => !document.querySelector('[aria-label="Next question"]').disabled);
  const individualSource = await page.$eval('[data-layer-id="cutout"] img', img => img.src);
  await page.evaluate(() => [...document.querySelectorAll('summary')].find(node => node.textContent === 'Crop & transparent borders').parentElement.open = true);
  await setRange('Crop left', 10);
  await page.evaluate(() => [...document.querySelectorAll('summary')].find(node => node.textContent === 'Photo adjustments').parentElement.open = true);
  await setRange('Brightness', 125);
  await activate('[aria-label="Previous question"]'); assert.equal(await currentId(), 'slide-0'); assert.equal(await value('X position (%)'), -12);
  await click('Apply position & size to all questions');
  await activate('[aria-label="Next question"]');
  assert.equal(await value('X position (%)'), -12); assert.equal(await value('Width (px)'), 300);
  assert.equal(await page.$eval('[data-layer-id="cutout"] img', img => img.src), individualSource);
  assert.equal(await value('Brightness'), 125); assert.equal(await value('Crop left'), 10);
  await activate('[aria-label="Undo design edit"]'); assert.equal(await currentId(), 'slide-0');
  await activate('[aria-label="Next question"]'); assert.equal(await value('X position (%)'), 15, 'bulk change is one undo step');
  await activate('[aria-label="Redo design edit"]'); assert.equal(await value('X position (%)'), -12);
  await fill('X position (%)', 33);
  await activate('[aria-label="Next question"]'); assert.equal(await value('X position (%)'), -12, 'new individual edit must not move Q3');
  assert.equal(slideRequests.length, initialReviewRequests, 'per-question cutout edits update previews locally without more renders');
  await activate('[aria-label="Next 10 slides"]'); assert.equal(await currentId(), 'slide-10'); assert.equal((await page.$$('[data-question-id]')).length, 10);
  await page.waitForFunction(() => document.querySelector('[data-question-id="slide-10"] img')?.naturalWidth === 1280, { timeout: 70000 });
  await activate('[aria-label="Previous question"]'); assert.equal(await currentId(), 'slide-9'); assert.equal((await page.$$('[data-question-id]')).length, 10);
  await activate('[aria-label="Next 10 slides"]'); await activate('[aria-label="Next 10 slides"]');
  assert.equal((await page.$$('[data-question-id]')).length, 3);
  await activate('[data-question-id="slide-22"]'); assert.equal(await page.$eval('[aria-label="Next question"]', b => b.disabled), true);
  await saved(); await open(); await choose('slide-1'); await activate('#design-tab-object');
  assert.equal(await value('X position (%)'), 33, 'individual position survives reload');
  assert.equal(await page.$eval('[data-layer-id="cutout"] img', img => img.src), individualSource);
  const persisted = await page.evaluate(chapterKey => new Promise(resolve => { const r = indexedDB.open('gate-creator-assets-v1', 1); r.onsuccess = () => { const db = r.result, tx = db.transaction('assets'); const req = tx.objectStore('assets').get('thumbnail-editor-v3:' + chapterKey); tx.oncomplete = () => { db.close(); resolve(req.result); }; }; }), chapterKey);
  assert.equal(persisted.editor.assets.length, 2, 'question layouts share image data');
  assert.equal(persisted.editor.questionLayers['slide-1'][0].x, 33);
  await activate('#design-tab-design');
  await page.evaluate(() => [...document.querySelectorAll('label')].find(label => label.textContent.trim() === 'Show question & branding').querySelector('input').click());
  await page.select('[aria-label="PNG resolution"]', '1280'); await readyPreview();
  await click('Download Q2 PNG'); const single2 = await downloaded('Question_2.png');
  assert.equal(exported.at(-1).editor.layers[0].x, 33);
  await choose('slide-0'); await readyPreview(); await click('Download Q1 PNG'); const single1 = await downloaded('Question_1.png');
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent === 'Chapter ZIP · 23' && !b.disabled));
  await click('Chapter ZIP · 23'); const zip = new AdmZip(await downloaded(zipName));
  assert.equal(zip.getEntries().filter(entry => entry.entryName.endsWith('.png')).length, 23);
  assert.ok(!zip.getEntry('Question_5.png'), 'blank question is skipped');
  assert.ok(zip.getEntry('Question_1.png').getData().equals(single1));
  assert.ok(zip.getEntry('Question_2.png').getData().equals(single2), 'ZIP uses the same individual geometry as single export');
  assert.ok(!single1.equals(single2));
  await saved(); await activate('#design-tab-object');
  await page.evaluate(() => { document.querySelector('[aria-label="Thumbnail studio"]').scrollIntoView({ block: 'start' }); });
  await page.screenshot({ path: path.join(output, 'desktop.png'), fullPage: true });
  await page.setViewport({ width: 390, height: 844 }); await page.screenshot({ path: path.join(output, 'mobile.png'), fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'mobile layout has no horizontal page overflow');
  assert.deepEqual(errors, []);
  assert.ok(batches.every(batch => batch.slides.length <= 10));
  const dimensions = await page.evaluate(async batches => {
    const result = [];
    for (const batch of batches) for (const slide of batch.slides) {
      const bytes = Uint8Array.from(atob(slide.dataUrl.split(',')[1]), c => c.charCodeAt(0));
      const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/jpeg' })); result.push([bitmap.width, bitmap.height]); bitmap.close();
    }
    return result;
  }, batches);
  assert.ok(dimensions.every(([width, height]) => width === 1280 && height === 720));
  console.log(JSON.stringify({ passed: true, checks: ['10-slide scrolling groups', 'previous/next arrows', 'group boundary navigation', 'blank numbering', 'one full canvas', 'small batched previews', 'individual position and replacement', 'apply geometry to all', 'individual crop and effects preserved', 'bulk undo/redo', 'reload persistence', 'shared image assets', 'individual PNG and ZIP consistency', 'mobile layout'], previewRequests: slideRequests.length, output }, null, 2));
} catch (error) { await page?.screenshot({ path: path.join(output, 'failure.png'), fullPage: true }).catch(() => {}); throw error; }
finally { await browser?.close(); }
