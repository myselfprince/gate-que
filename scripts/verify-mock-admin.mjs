import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const { MongoClient, ObjectId } = require('mongoose').mongo;
const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
const origin = process.env.MOCK_TEST_ORIGIN || 'http://localhost:3000';
const manifest = 'tmp/mock-admin-qa/fixtures.json';
let fixtures, cookie = '';
async function api(path = '/api/gatemock/admin', { method = 'GET', body, status = 200, headers = {} } = {}) {
  const response = await fetch(origin + path, { method, headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...headers }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json(); assert.equal(response.status, status, JSON.stringify(data)); return data;
}
async function cleanup(db, fixture) {
  assert.match(fixture.slug, /^qa-admin-[a-f0-9-]+$/);
  await db.collection('chapters').deleteOne({ _id: new ObjectId(fixture.chapterId), chapter: fixture.slug });
  await db.collection('yearpapers').deleteOne({ slug: fixture.slug, datasetId: fixture.slug });
}
try {
  await client.connect(); const db = client.db();
  if (process.argv.includes('--cleanup')) {
    fixtures = JSON.parse(await fs.readFile(manifest, 'utf8'));
    if (process.argv.includes('--verify-browser')) {
      const paper = await db.collection('yearpapers').findOne({ slug: fixtures.slug });
      assert.deepEqual(paper.questions[0].correctOptions, ['C']);
      assert.deepEqual(paper.questions[1].correctOptions, ['A', 'B', 'D']);
      assert.equal(paper.questions[2].natAnswer, '-0.125');
      assert.equal(paper.questions[2].natRange, null);
      console.log('Browser MCQ, MSQ and exact NAT saves verified directly in storage.');
    }
    await cleanup(db, fixtures); fixtures = null;
    console.log('Admin QA fixtures cleaned.');
  } else {
    const check = await fetch(origin + '/api/gatemock/admin');
    if (check.status === 401) {
      const login = await fetch(origin + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: process.env.APP_PASSWORD }) });
      assert.equal(login.status, 200); cookie = login.headers.get('set-cookie').split(';')[0];
    }
    const slug = `qa-admin-${randomUUID().slice(0, 8)}`, chapterId = new ObjectId();
    fixtures = { slug, chapterId: String(chapterId), year: '2097', setNum: slug };
    const now = new Date(Date.now() - 1000);
    const questions = [1, 2, 3].map((number, index) => ({ id: `q${number}`, key: `yearpaper:${slug}:${number}`, datasetId: slug,
      text: `Admin QA question ${number}: verify the answer editor.`, year: '2097', examPaper: 'CS', setNum: slug, paperQuestionNumber: String(number),
      marks: '2', questionType: index === 2 ? 'NAT' : index === 1 ? 'MSQ' : 'MCQ', correctOptions: index === 2 ? [] : ['A'], natAnswer: index === 2 ? '0' : '',
      optA: index === 2 ? '' : 'First option', optB: index === 2 ? '' : 'Second option', optC: index === 2 ? '' : 'Third option', optD: index === 2 ? '' : 'Fourth option',
      isPosLocked: true, manualReview: false, subject: 'Admin QA', chapter: slug, diagram: '', ext: '.png',
      source: { note: 'Preserve QA source' }, referenceAnswer: 'QA written explanation.' }));
    await db.collection('chapters').insertOne({ _id: chapterId, subject: 'Admin QA', chapter: slug, lockCount: 2,
      questions: questions.map(({ datasetId, key, ...q }) => q), createdAt: now, updatedAt: now });
    await db.collection('yearpapers').insertOne({ slug, datasetId: slug, year: '2097', examPaper: 'CS', setNum: slug, title: 'Admin QA paper',
      questions, questionCount: 3, totalMarks: 6, durationMinutes: 180, negativeFraction: 1 / 3, verified: true, createdAt: now, updatedAt: now });
    let inventory = await api();
    assert.equal(inventory.records.filter(q => q.datasetId === slug).length, 3);
    async function save(record, extra, status = 200) {
      return api('/api/gatemock/admin', { method: 'PUT', status, body: { key: record.key, datasetId: record.datasetId, chapterId: record.chapterId,
        questionId: record.questionId, expectedUpdatedAt: record.updatedAt, questionType: record.questionType, correctOptions: record.correctOptions,
        manualReview: false, gateOverflowUrl: '', ...extra } });
    }
    for (const storage of ['chapter', 'paper']) {
      inventory = await api();
      const records = inventory.records.filter(q => storage === 'paper' ? q.datasetId === slug : q.chapterId === String(chapterId));
      const first = records.find(q => q.questionId === 'q1');
      await save(first, { correctOptions: ['B', 'C'] }, 400);
      await save(first, { correctOptions: ['B'] });
      await save(first, { correctOptions: ['A'] }, 409);
      inventory = await api();
      const second = inventory.records.find(q => q.key === records.find(q => q.questionId === 'q2').key);
      await save(second, { correctOptions: ['B', 'D'] });
      inventory = await api();
      const third = inventory.records.find(q => q.key === records.find(q => q.questionId === 'q3').key);
      await save(third, { natMode: 'range', natMin: '3', natMax: '2' }, 400);
      await save(third, { natMode: 'exact', natAnswer: '0' });
      inventory = await api();
      await save(inventory.records.find(q => q.key === third.key), { natMode: 'range', natMin: '-0.5', natMax: '0.5' });
      const saved = storage === 'paper' ? await db.collection('yearpapers').findOne({ slug }) : await db.collection('chapters').findOne({ _id: chapterId });
      assert.deepEqual(saved.questions.map(q => q.correctOptions), [['B'], ['B', 'D'], []]);
      assert.deepEqual(saved.questions[2].natRange, { min: -0.5, max: 0.5 });
      assert.equal(saved.questions[2].natAnswer, '');
      assert.ok(saved.questions.every(q => q.isPosLocked && q.source.note === 'Preserve QA source'));
      if (storage === 'chapter') assert.equal(saved.lockCount, 2);
    }
    await api('/api/gatemock/admin', { method: 'PUT', status: 403, headers: { Origin: 'https://other.example' }, body: {} });
    const malformed = await fetch(origin + '/api/gatemock/admin', { method: 'PUT', headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: '{' });
    assert.equal(malformed.status, 400);
    await api('/api/gatemock/admin/reference?url=' + encodeURIComponent('https://evil.test/private'), { status: 400 });
    console.log('Admin API verified: chapter + year-paper MCQ/MSQ/NAT persistence, stale revision rejection, validation, source/lock preservation and origin checks.');
    if (process.argv.includes('--keep')) {
      await fs.mkdir('tmp/mock-admin-qa', { recursive: true });
      await fs.writeFile(manifest, JSON.stringify(fixtures));
      console.log(`Browser QA fixture: GATE CS 2097, set ${slug}.`);
      fixtures = null;
    }
  }
} finally {
  if (fixtures) await cleanup(client.db(), fixtures);
  await client.close();
}
