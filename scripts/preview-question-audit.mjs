import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import nextEnv from '@next/env';
import puppeteer from 'puppeteer';

nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const root = path.resolve('tmp/question-syntax-audit');
const chapters = JSON.parse(await fs.readFile(process.argv[2] || path.join(root, 'chapters.json'), 'utf8'));
const output = path.resolve(process.argv[3] || path.join(root, 'preview-before'));
await fs.mkdir(output, { recursive: true });
const origin = 'http://localhost:3000';
const login = await fetch(`${origin}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify({ password: process.env.APP_PASSWORD }) });
assert.ok(login.ok, `Local session failed: ${login.status}`);
const session = login.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
const browser = await puppeteer.launch({ headless: true });
const results = [];
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1900, height: 1100, deviceScaleFactor: 1 });
  await page.setExtraHTTPHeaders({ Cookie: session });
  let payload;
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.pathname.startsWith('/api/')) {
      const data = url.pathname === '/api/preferences' ? { lastSubject: payload.subject, lastChapter: payload.chapter } : payload;
      // Never allow preview autosaves or preferences to reach the live database.
      void request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data }) });
    } else void request.continue();
  });
  const tasks = chapters.map((chapter, chapterIndex) => ({ chapter, chapterIndex, view: 'editable' }));
  for (const [chapterIndex, chapter] of chapters.entries()) {
    const questions = chapter.questions.filter(question => question.source?.verifiedQuestion).map(question => ({ ...question, ...question.source.verifiedQuestion }));
    if (questions.length) tasks.push({ chapter: { ...chapter, questions }, chapterIndex, view: 'verified-source' });
  }
  for (const task of tasks) {
    payload = task.chapter;
    errors.length = 0;
    await page.goto(origin, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector(`#question-${payload.questions.length}`, { timeout: 30000 });
    await page.waitForFunction(() => Boolean(window.MathJax?.typesetPromise), { timeout: 45000 });
    await page.evaluate(async () => {
      await window.MathJax.startup.promise;
      const container = document.getElementById('questions_container');
      window.MathJax.typesetClear([container]);
      await window.MathJax.typesetPromise([container]);
      await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    const questions = await page.evaluate(() => [...document.querySelectorAll('.question-card')].map(card => {
      const preview = card.querySelector('.preview-pane');
      const number = Number(card.closest('[id^="question-"]').id.split('-')[1]);
      return {
        index: number,
        expressions: preview.querySelectorAll('mjx-container').length,
        mathErrors: [...preview.querySelectorAll('mjx-merror')].map(element => ({ text: element.textContent, message: element.getAttribute('title') || element.querySelector('[title]')?.getAttribute('title') })),
        unknownMathCommands: [...preview.querySelectorAll('mjx-container')].filter(element => /\\[A-Za-z]+/.test(element.textContent)).map(element => element.textContent),
        rawMath: /\$[^$]+\$|\\\(|\\\[/.test(preview.textContent),
        brokenImages: [...preview.querySelectorAll('img')].filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src.split('?')[0]),
        overflow: preview.scrollWidth > preview.clientWidth + 2,
      };
    }));
    assert.equal(questions.length, payload.questions.filter(question => !question.isBlank).length);
    const record = { subject: payload.subject, chapter: payload.chapter, chapterIndex: task.chapterIndex, view: task.view,
      total: payload.questions.length, nonBlank: questions.length, placeholders: payload.questions.filter(question => question.isBlank).length, expressions: questions.reduce((sum, question) => sum + question.expressions, 0),
      issues: questions.filter(question => question.mathErrors.length || question.unknownMathCommands.length || question.rawMath || question.brokenImages.length || question.overflow), errors: [...errors] };
    results.push(record);
    for (const issue of record.issues) {
      const element = await page.$(`#question-${issue.index} .question-card`);
      await element.screenshot({ path: path.join(output, `${String(task.chapterIndex).padStart(2, '0')}-${task.view}-${issue.index}.png`) });
    }
    console.log(JSON.stringify(record));
    await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(results, null, 2));
  }
} finally { await browser.close(); }
