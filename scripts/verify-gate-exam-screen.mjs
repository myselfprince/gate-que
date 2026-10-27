import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import puppeteer from 'puppeteer';

const origin = process.env.MOCK_TEST_ORIGIN || 'http://127.0.0.1:3000';
const output = 'tmp/gate-exam-screen-qa';
await fs.mkdir(output, { recursive: true });
const questions = Array.from({ length: 90 }, (_, index) => ({
  key: `layout-${index + 1}`, number: index + 1, paperQuestionNumber: String(index + 1), text: index === 0
    ? 'A tiger is 50 leaps of its own behind a deer. The tiger takes 5 leaps per minute and the deer takes 4 leaps per minute. If the tiger covers 8 metre per leap and the deer covers 5 metre per leap, the time required by the tiger to catch the deer is ______ minutes.'
    : index === 10 ? ('Consider the following function $f(x)=x^2+2x+1$. Which of the following statements is correct?\n\n').repeat(18) : `The value of $2+2$ is given by which of the following options?`,
  year: '2026', examPaper: 'CS', setNum: '1', marks: index < 5 ? '1' : '2', subject: index < 10 ? '13. General Aptitude' : index % 2 ? '2. TOC' : '4. COA', chapter: 'Test',
  questionType: index === 0 ? 'NAT' : index === 2 ? 'MSQ' : 'MCQ', optA: index === 0 ? '' : '$3$', optB: index === 0 ? '' : '$4$', optC: index === 0 ? '' : '$5$', optD: index === 0 ? '' : '$6$', code: '', diagram: '', ext: '.png',
}));
const attempt = { id: 'layout-attempt', title: 'GATE CS 2026 · Set 1 · Original paper', questions, warnings: [], exact: true, startedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 180 * 60000).toISOString(), durationMinutes: 180, negativeFraction: 1 / 3, state: { responses: [], marked: [], visited: ['layout-1'], currentIndex: 0 }, revision: 0, result: null, finishedAt: null, serverNow: new Date().toISOString() };
const browser = await puppeteer.launch({ headless: true });
let page;
try {
  page = await browser.newPage(); await page.setViewport({ width: 1440, height: 900 });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.evaluateOnNewDocument(draft => localStorage.setItem('g4gate-mock-active-v1', JSON.stringify(draft)), { id: attempt.id, token: 'test-layout-token', revision: 0, state: attempt.state });
  await page.setRequestInterception(true);
  page.on('request', request => {
    const path = new URL(request.url()).pathname;
    const reply = value => request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(value) });
    if (path === '/api/gatemock/catalog') return reply({ count: 90, subjects: [], years: [] });
    if (path === `/api/gatemock/attempts/${attempt.id}`) {
      if (request.method() !== 'GET') { const body = JSON.parse(request.postData()); attempt.state = body.state; attempt.revision++; }
      return reply({ success: true, attempt: { ...attempt, serverNow: new Date().toISOString() } });
    }
    return request.continue();
  });
  await page.goto(origin + '/gatemock', { waitUntil: 'networkidle2' });
  await page.waitForSelector('[aria-label="GATE computer based test"]');
  await page.screenshot({ path: `${output}/gate-nat-desktop.png` });
  const keypad = key => page.click(`[aria-label="Numerical keypad ${key}"]`);
  await keypad('1'); await keypad('.'); await keypad('5');
  assert.equal(await page.$eval('[aria-label="Numerical response"]', node => node.value), '1.5');
  await page.click('[aria-label="Open scientific calculator"]');
  const calc = '[aria-label="Scientific calculator window"]';
  await page.waitForSelector(calc, { visible: true });
  const key = label => page.click(`${calc} button[aria-label="${label}"]`);
  const result = () => page.$eval('[aria-label="Calculation result"]', node => node.textContent);
  await key('Clear'); for (const label of ['2', 'Add', '3', 'Multiply', '4', 'Equals']) await key(label);
  assert.equal(await result(), '14');
  await key('Clear'); await key('3'); await key('0'); await key('Sine'); assert.equal(await result(), '0.5');
  await page.evaluate(() => [...document.querySelectorAll('[aria-label="Scientific calculator window"] button')].find(button => button.textContent === 'MS').click());
  await key('Clear'); await page.evaluate(() => [...document.querySelectorAll('[aria-label="Scientific calculator window"] button')].find(button => button.textContent === 'MR').click()); assert.equal(await result(), '0.5');
  await page.screenshot({ path: `${output}/gate-calculator-desktop.png` });
  const before = await page.$eval(calc, node => ({ x: node.getBoundingClientRect().x, y: node.getBoundingClientRect().y }));
  await page.mouse.move(before.x + 60, before.y + 16); await page.mouse.down(); await page.mouse.move(before.x + 120, before.y + 60, { steps: 8 }); await page.mouse.up();
  const after = await page.$eval(calc, node => ({ x: node.getBoundingClientRect().x, y: node.getBoundingClientRect().y })); assert.ok(after.x > before.x + 40 && after.y > before.y + 30);
  await page.click(`${calc} button[aria-label="Minimize calculator"]`);
  assert.ok(await page.$eval(calc, node => node.getBoundingClientRect().height < 70));
  await page.click(`${calc} button[aria-label="Restore calculator"]`);
  await page.click(`${calc} button[aria-label="Close calculator"]`);
  await page.click('[aria-label="Open scientific calculator"]'); assert.equal(await result(), '0.5');
  await page.evaluate(() => [...document.querySelectorAll('[aria-label="Scientific calculator window"] button')].find(button => button.textContent === 'Help').click());
  assert.ok(await page.evaluate(() => document.body.textContent.includes('Calculator Instructions')));
  await page.evaluate(() => [...document.querySelectorAll('[aria-label="Scientific calculator window"] button')].find(button => button.textContent === 'Back').click());
  await page.click(`${calc} button[aria-label="Close calculator"]`);
  await page.evaluate(() => [...document.querySelectorAll('button')].find(button => button.textContent === 'Mark for Review & Next').click());
  // Fixture persistence follows the same state payloads as the real endpoint.
  await page.waitForFunction(() => document.querySelector('[data-question-key]')?.dataset.questionKey === 'layout-2');
  await page.click('input[type=radio]');
  await page.evaluate(() => [...document.querySelectorAll('button')].find(button => button.textContent === 'Save & Next').click());
  await page.waitForFunction(() => document.querySelector('[data-question-key]')?.dataset.questionKey === 'layout-3');
  await page.evaluate(() => [...document.querySelectorAll('button')].find(button => button.textContent === 'Mark for Review & Next').click());
  await page.waitForFunction(() => document.querySelector('[data-question-key]')?.dataset.questionKey === 'layout-4');
  assert.ok(await page.$('[aria-label="Question 1, Answered & Marked for Review"]'));
  assert.ok(await page.$('[aria-label="Question 2, Answered"]'));
  assert.ok(await page.$('[aria-label="Question 3, Marked for Review"]'));
  await page.click('[role=tab][title="Computer Science and Information Technology"]');
  await page.waitForFunction(() => document.querySelector('[data-question-key]')?.dataset.questionKey === 'layout-11');
  const geometry = await page.evaluate(() => {
    const root = document.querySelector('[aria-label="GATE computer based test"]');
    const scroll = document.querySelector('[data-question-key]');
    const footer = root.querySelector('footer');
    const palette = document.querySelector('[aria-label="Question palette"]');
    return { rootHeight: root.getBoundingClientRect().height, footerBottom: footer.getBoundingClientRect().bottom, questionScrollable: scroll.scrollHeight > scroll.clientHeight, paletteScrollable: [...palette.querySelectorAll('div')].some(node => getComputedStyle(node).overflowY === 'auto' && node.scrollHeight > node.clientHeight), noPageOverflow: document.documentElement.scrollWidth <= innerWidth };
  });
  assert.equal(geometry.rootHeight, 900); assert.ok(geometry.footerBottom <= 900 && geometry.footerBottom > 870);
  assert.ok(geometry.questionScrollable && geometry.paletteScrollable && geometry.noPageOverflow);
  await page.screenshot({ path: `${output}/gate-mcq-desktop.png` });
  await page.click('[aria-label="Collapse question palette"]'); assert.ok(await page.$eval('[aria-label="Question palette"]', node => getComputedStyle(node).display === 'none'));
  await page.click('[aria-label="Expand question palette"]');
  await page.evaluate(() => [...document.querySelectorAll('button')].find(button => button.textContent.includes('Instructions')).click());
  await page.waitForSelector('dialog[open]'); assert.ok(await page.evaluate(() => document.querySelector('dialog').textContent.includes('General Instructions'))); await page.click('[aria-label="Close dialog"]');
  await page.evaluate(() => [...document.querySelectorAll('button')].find(button => button.textContent.includes('Question Paper')).click());
  await page.waitForSelector('dialog[open]'); assert.ok(await page.evaluate(() => document.querySelector('dialog').textContent.includes('Question No. 80'))); await page.click('[aria-label="Close dialog"]');
  await page.setViewport({ width: 390, height: 844 });
  if (await page.$('[aria-label="Collapse question palette"]')) await page.click('[aria-label="Collapse question palette"]');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: `${output}/gate-mobile.png` });
  assert.deepEqual(errors, []);
  await fs.writeFile(`${output}/report.json`, JSON.stringify({ passed: true, calculator: ['precedence', 'trigonometry', 'memory', 'drag', 'minimize', 'close/reopen', 'help'], geometry, sections: true, fivePaletteStates: true, natKeypad: true, mobile: true }, null, 2));
  console.log('GATE layout, section palette, pinned footer, NAT keypad and reused scientific calculator verified.');
} catch (error) { await page?.screenshot({ path: `${output}/error.png` }).catch(() => {}); throw error; }
finally { await browser.close(); }
