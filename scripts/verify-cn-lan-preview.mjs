import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { LAN_IMPORT } from '../data/imports/cn-lan.mjs';

const outputDir = process.argv[2];
if (!outputDir) throw new Error('Provide a screenshot output directory.');
await fs.mkdir(outputDir, { recursive: true });
const browser = await puppeteer.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1900, height: 1100, deviceScaleFactor: 1 });
  const errors = [];
  const failedFonts = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => {
    if (request.resourceType() === 'font') failedFonts.push(request.failure()?.errorText);
  });
  await page.setRequestInterception(true);
  page.on('request', async (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith('/api/')) {
      // Mock persistence during UI QA; never edit live records/preferences here.
      const data = url.pathname === '/api/preferences'
        ? { lastSubject: LAN_IMPORT.subject, lastChapter: LAN_IMPORT.chapter }
        : { ...LAN_IMPORT, lockCount: 0 };
      await request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data }) });
    } else await request.continue();
  });
  await page.goto('http://localhost:3107', { waitUntil: 'networkidle2', timeout: 30_000 });
  await page.waitForSelector('#question-35', { timeout: 20_000 });
  await page.waitForFunction(() => Boolean(window.MathJax?.typesetPromise), { timeout: 30_000 });
  await page.evaluate(async () => {
    await window.MathJax.startup.promise;
    await window.MathJax.typesetPromise([document.getElementById('questions_container')]);
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  const math = await page.evaluate(() => ({
    questions: document.querySelectorAll('.question-card').length,
    expressions: document.querySelectorAll('mjx-container').length,
    errors: [...document.querySelectorAll('mjx-merror')].map((element) => element.textContent),
    rawMath: [...document.querySelectorAll('.preview-pane')].filter((element) => /\$[^$]+\$/.test(element.textContent)).length,
    fontFaces: [...document.fonts].map((font) => ({ family: font.family, status: font.status })),
  }));
  for (const number of [1, 14, 30, 35]) {
    const element = await page.$(`#question-${number} .question-card`);
    await element.screenshot({ path: path.join(outputDir, `question-${number}.png`) });
  }
  if (math.questions !== 35 || !math.expressions || math.errors.length || math.rawMath || errors.length || failedFonts.length) {
    throw new Error(JSON.stringify({ math, errors, failedFonts }));
  }
  console.log(JSON.stringify({ math, errors, screenshots: outputDir }, null, 2));
} finally {
  await browser.close();
}
