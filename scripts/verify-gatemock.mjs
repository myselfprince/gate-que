import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import puppeteer from 'puppeteer';
const require = createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const { MongoClient, ObjectId } = require('mongoose').mongo;
const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
const origin = process.env.MOCK_TEST_ORIGIN || 'http://127.0.0.1:3100';
const fixtureId = new ObjectId(), setNum = `qa-${randomUUID().slice(0, 8)}`, attempts = [];
let browser;
let adminCookie = '';
async function api(url, { method = 'GET', body, token, status = 200, headers = {} } = {}) {
  const response = await fetch(origin + url, { method, headers: { 'Content-Type': 'application/json', ...(adminCookie ? { Cookie: adminCookie } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const result = await response.json(); assert.equal(response.status, status, JSON.stringify(result)); return result;
}
try {
  await client.connect(); const db = client.db();
  const adminCheck = await fetch(origin + '/api/gatemock/admin');
  if (adminCheck.status === 401) {
    const login = await fetch(origin + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: process.env.APP_PASSWORD }) });
    assert.equal(login.status, 200, 'The configured administrator could not sign in.');
    adminCookie = login.headers.get('set-cookie').split(';')[0];
  }
  const catalog = await api('/api/gatemock/catalog'); assert.ok(catalog.count > 100);
  assert.doesNotMatch(JSON.stringify(catalog), /correctOptions|natAnswer|verifiedQuestion/);
  const now = new Date();
  const questions = ['a', 'b'].map((id, i) => ({ id, text: `Mock QA ${id}: choose the correct option.`, year: '2098', examPaper: 'CS', setNum,
    marks: '1', optA: 'First', optB: 'Second', optC: 'Third', optD: 'Fourth', questionType: 'MCQ', correctOptions: [i ? 'B' : 'A'], isPosLocked: true, diagram: '', ext: '.png' }));
  await db.collection('chapters').insertOne({ _id: fixtureId, subject: 'Mock QA fixture', chapter: setNum, lockCount: 1, questions, createdAt: now, updatedAt: now });
  const paper = { year: '2098', examPaper: 'CS', setNum, questionCount: 2, totalMarks: 2, durationMinutes: 180, negativeFraction: 1 / 3, verified: false, sourceUrl: '' };
  await api('/api/gatemock/admin', { method: 'POST', body: paper });
  let admin = await api('/api/gatemock/admin');
  assert.deepEqual(admin.years.find(p => p.setNum === setNum).coverage.missing, [1, 2]);
  for (const [i, q] of questions.entries()) {
    admin = await api('/api/gatemock/admin');
    const record = admin.records.find(r => r.questionId === q.id && r.chapterId === String(fixtureId));
    await api('/api/gatemock/admin', { method: 'PATCH', body: { chapterId: String(fixtureId), questionId: q.id, expectedUpdatedAt: record.chapterUpdatedAt, year: '2098', examPaper: 'CS', setNum, paperQuestionNumber: String(i + 1) } });
    await api('/api/gatemock/admin', { method: 'PATCH', status: 409, body: { chapterId: String(fixtureId), questionId: q.id, expectedUpdatedAt: record.chapterUpdatedAt, year: '2098', examPaper: 'CS', setNum, paperQuestionNumber: '99' } });
  }
  const saved = await db.collection('chapters').findOne({ _id: fixtureId });
  assert.equal(saved.lockCount, 1); assert.deepEqual(saved.questions.map(q => q.isPosLocked), [true, true]);
  await api('/api/gatemock/attempts', { method: 'POST', status: 400, body: { mode: 'year', year: '2098', examPaper: 'CS', setNum } });
  await api('/api/gatemock/admin', { method: 'POST', body: { ...paper, verified: true } });
  const created = await api('/api/gatemock/attempts', { method: 'POST', body: { mode: 'year', year: '2098', examPaper: 'CS', setNum } });
  attempts.push(created.attempt.id);
  assert.equal(created.attempt.exact, true);
  assert.doesNotMatch(JSON.stringify(created.attempt), /correctOptions|natAnswer|verifiedQuestion|tokenHash/);
  await api(`/api/gatemock/attempts/${created.attempt.id}`, { token: '0'.repeat(64), status: 404 });
  await api('/api/gatemock/attempts', { method: 'POST', status: 403, headers: { Origin: 'https://other.example' }, body: { mode: 'subject' } });
  const state = { ...created.attempt.state, responses: [{ key: created.attempt.questions[0].key, value: ['A'] }] };
  const updated = await api(`/api/gatemock/attempts/${created.attempt.id}`, { method: 'PUT', token: created.token, body: { revision: 0, state } });
  assert.equal(updated.attempt.revision, 1);
  await api(`/api/gatemock/attempts/${created.attempt.id}`, { method: 'PUT', token: created.token, status: 409, body: { revision: 0, state } });
  const finished = await api(`/api/gatemock/attempts/${created.attempt.id}`, { method: 'POST', token: created.token, body: { revision: 1, state } });
  assert.equal(finished.attempt.result.score, 1);
  const locked = await api(`/api/gatemock/attempts/${created.attempt.id}`, { method: 'PUT', token: created.token, body: { revision: 2, state: { ...state, responses: [] } } });
  assert.equal(locked.attempt.result.score, 1);
  const expiredId = randomUUID(), expiredToken = randomBytes(32).toString('hex'); attempts.push(expiredId);
  await db.collection('mockattempts').insertOne({ _id: expiredId, tokenHash: createHash('sha256').update(expiredToken).digest('hex'),
    title: 'Expired QA', questions: created.attempt.questions.map((q, i) => ({ ...q, correctOptions: [i ? 'B' : 'A'] })), warnings: [], state,
    expiresAt: new Date(Date.now() - 1000), startedAt: new Date(Date.now() - 181 * 60000), durationMinutes: 180, negativeFraction: 1 / 3, revision: 0 });
  const expired = await api(`/api/gatemock/attempts/${expiredId}`, { method: 'POST', token: expiredToken, body: { revision: 0, state: { ...state, responses: [] } } });
  assert.equal(expired.attempt.result.score, 1, 'Late submissions must not replace the last saved responses.');

  browser = await puppeteer.launch({ headless: true }); const page = await browser.newPage();
  if (adminCookie) { const at = adminCookie.indexOf('='); await browser.setCookie({ name: adminCookie.slice(0, at), value: adminCookie.slice(at + 1), url: origin }); }
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(origin + '/gatemock', { waitUntil: 'networkidle2' });
  await page.waitForSelector('[aria-label="Previous-year papers"] button');
  await fs.mkdir('tmp/gatemock-qa', { recursive: true });
  await page.screenshot({ path: 'tmp/gatemock-qa/builder.png', fullPage: true });
  await page.evaluate(value => {
    const select = [...document.querySelectorAll('label')].find(label => label.textContent.startsWith('Year')).querySelector('select');
    select.value = value; select.dispatchEvent(new Event('change', { bubbles: true }));
  }, '2098');
  await page.waitForFunction(value => [...document.querySelectorAll('[aria-label="Previous-year papers"] button')].some(button => button.textContent.includes(value) && button.getAttribute('aria-pressed') === 'true'), {}, setNum);
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent === 'Read instructions & continue →').click());
  await page.waitForSelector('dialog[open]');
  assert.equal(await page.$eval('dialog[open] footer button:last-child', button => button.disabled), true);
  await page.click('dialog[open] input[type=checkbox]');
  const attemptResponse = page.waitForResponse(response => response.url().endsWith('/api/gatemock/attempts') && response.request().method() === 'POST');
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent === 'Begin test →').click());
  const browserAttempt = await (await attemptResponse).json(); assert.ok(browserAttempt.attempt); attempts.push(browserAttempt.attempt.id);
  await page.waitForSelector('input[type=radio]'); await page.click('input[type=radio]');
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Mark for Review & Next').click());
  await page.waitForFunction(() => document.body.textContent.includes('Question No. 2'));
  await page.click('input[type=radio]');
  await page.waitForFunction(() => [...document.querySelectorAll('[role=status]')].some(el => el.textContent === 'Saved'));
  await page.screenshot({ path: 'tmp/gatemock-qa/exam.png', fullPage: true });
  let failResume = true;
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (failResume && request.url().endsWith(`/api/gatemock/attempts/${browserAttempt.attempt.id}`) && request.method() === 'GET') return request.respond({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Temporary connection failure' }) });
    return request.continue();
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForFunction(() => document.body.textContent.includes('Previous attempt could not resume'));
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('g4gate-mock-active-v1')).id), browserAttempt.attempt.id);
  failResume = false;
  await page.reload({ waitUntil: 'networkidle2' }); await page.waitForSelector('input[type=radio]:checked');
  assert.ok(await page.evaluate(() => document.body.textContent.includes('Question No. 2')));
  await page.click('[aria-label="Submit test"]');
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent === 'Confirm submit').click());
  await page.waitForFunction(() => document.body.textContent.includes('Your result & solutions'));
  assert.ok(await page.evaluate(() => document.body.textContent.includes('0.67')));
  await page.click('[role=tab][id=video-tab]');
  assert.ok(await page.evaluate(() => document.body.textContent.includes('No video solution yet')));
  await page.click('[role=tab][id=written-tab]');
  await page.screenshot({ path: 'tmp/gatemock-qa/results.png', fullPage: true });
  await page.goto(origin + '/gatemock/admin', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => document.body.textContent.includes('Map questions to this paper'));
  await page.screenshot({ path: 'tmp/gatemock-qa/admin.png', fullPage: true });
  await page.setViewport({ width: 390, height: 844 }); await page.goto(origin + '/gatemock', { waitUntil: 'networkidle2' });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2));
  await fs.writeFile('tmp/gatemock-qa/report.json', JSON.stringify({ api: 'passed', autosaveAndResume: 'passed', browserSubmitAndScore: 'passed', originalCoverage: 'passed', tokenAndOriginChecks: 'passed', deadlineAndRevisionChecks: 'passed', fixturesCleaned: true }, null, 2));
  console.log('Mock API, coverage admin, expiry, autosave/resume, browser exam and results verified.');
} finally {
  if (browser) await browser.close();
  if (client.topology?.isConnected()) {
    await client.db().collection('mockattempts').deleteMany({ _id: { $in: attempts } });
    await client.db().collection('mockpapers').deleteMany({ year: '2098', setNum });
    await client.db().collection('chapters').deleteOne({ _id: fixtureId });
  }
  await client.close();
}
