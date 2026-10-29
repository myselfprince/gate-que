import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { randomUUID, createHash } from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const { MongoClient } = require('mongoose').mongo;
const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
const origin = process.env.MOCK_TEST_ORIGIN || 'http://localhost:3000';
const folder = 'tmp/year-paper-admin-qa', manifest = `${folder}/fixtures.json`;
let fixtures = [], cookie = '';
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
async function api(path, { method = 'GET', body, status = 200 } = {}) {
  const response = await fetch(origin + path, { method, headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json(); assert.equal(response.status, status, JSON.stringify(data)); return data;
}
async function cleanup(db) {
  for (const slug of fixtures) {
    assert.match(slug, /^gate-it-2096-qa-[a-f0-9-]+(?:-ui)?$/);
    await db.collection('yearpapers').deleteOne({ slug, datasetId: slug, year: '2096' });
  }
}
try {
  await client.connect(); const db = client.db();
  if (process.argv.includes('--cleanup')) {
    fixtures = JSON.parse(await fs.readFile(manifest, 'utf8')).slugs;
    if (process.argv.includes('--verify-browser')) {
      const paper = await db.collection('yearpapers').findOne({ slug: fixtures[1] });
      assert.ok(paper, 'Browser import must create the categorized paper.');
      assert.equal(paper.questions[0].gateOverflowUrl, 'https://gateoverflow.in/998/gate-cse-2004-question-1');
      assert.equal(paper.questions[0].solutionUrl, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90s');
      assert.deepEqual(paper.questions[0].correctOptions, []);
      assert.equal(paper.questions[0].manualReview, true);
      console.log('Browser import and independent reference/video saves verified in storage.');
    }
    await cleanup(db); fixtures = [];
    console.log('Year-paper admin QA fixtures cleaned.');
  } else {
    const check = await fetch(origin + '/api/gatemock/admin/papers');
    if (check.status === 401) {
      const login = await fetch(origin + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: process.env.APP_PASSWORD }) });
      assert.equal(login.status, 200); cookie = login.headers.get('set-cookie').split(';')[0];
    }
    const before = await api('/api/gatemock/admin/papers');
    for (const slug of ['gate-cs-2000', 'gate-cs-2001', 'gate-cs-2003', 'gate-cs-2004', 'gate-it-2004']) {
      const paper = before.papers.find(p => p.slug === slug); assert.ok(paper, `${slug} must appear in the dedicated library.`);
      assert.ok(paper.gateOverflowCount > 0); assert.ok(!paper.questions);
    }
    const booksHash = digest(await db.collection('chapters').find({}).sort({ _id: 1 }).toArray());
    const previousPapers = await db.collection('yearpapers').find({}).sort({ slug: 1 }).toArray();
    const previousHash = digest(previousPapers);
    const setNum = `qa-${randomUUID().slice(0, 8)}`, slug = `gate-it-2096-${setNum}`, uiSlug = `${slug}-ui`;
    fixtures = [slug, uiSlug];
    const paper = { title: 'Admin QA previous-year paper', year: '2096', examPaper: 'IT', setNum, questionCount: 2, totalMarks: 4,
      durationMinutes: 180, negativeFraction: 1 / 3, verified: true, questions: [1, 2].map(number => ({ id: `q${number}`, paperQuestionNumber: String(number),
        text: `Paper-admin QA question ${number}`, marks: '2', questionType: 'MCQ', correctOptions: [], optA: 'First', optB: 'Second', optC: 'Third', optD: 'Fourth' })) };
    await api('/api/gatemock/admin/papers', { method: 'POST', body: { ...paper, questionCount: 3 }, status: 400 });
    const imported = await api('/api/gatemock/admin/papers', { method: 'POST', body: paper, status: 201 });
    assert.equal(imported.paper.slug, slug);
    await api('/api/gatemock/admin/papers', { method: 'POST', body: paper, status: 409 });
    let scoped = await api(`/api/gatemock/admin?paper=${slug}`);
    assert.equal(scoped.records.length, 2); assert.ok(scoped.records.every(q => q.datasetId === slug));
    const record = scoped.records[0];
    const linksBody = { action: 'links', datasetId: slug, key: record.key, questionId: record.questionId, expectedUpdatedAt: record.updatedAt,
      gateOverflowUrl: 'https://gateoverflow.in/998/gate-cse-2004-question-1', solutionUrl: 'https://youtu.be/dQw4w9WgXcQ?t=90' };
    await api('/api/gatemock/admin', { method: 'PUT', body: { ...linksBody, solutionUrl: 'https://evil.test' }, status: 400 });
    await api('/api/gatemock/admin', { method: 'PUT', body: linksBody });
    await api('/api/gatemock/admin', { method: 'PUT', body: linksBody, status: 409 });
    scoped = await api(`/api/gatemock/admin?paper=${slug}`);
    assert.deepEqual(scoped.records[0].correctOptions, []);
    assert.equal(scoped.records[0].manualReview, true);
    assert.equal(scoped.records[0].solutionUrl, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90s');
    const summary = (await api('/api/gatemock/admin/papers')).papers.find(p => p.slug === slug);
    assert.equal(summary.gateOverflowCount, 1); assert.equal(summary.videoCount, 1);
    await api('/api/gatemock/admin?paper=does-not-exist', { status: 404 });
    const catalog = await api('/api/gatemock/catalog');
    assert.ok(catalog.years.some(p => p.paper?.slug === slug));
    assert.equal(digest(await db.collection('chapters').find({}).sort({ _id: 1 }).toArray()), booksHash);
    assert.equal(digest(await db.collection('yearpapers').find({ slug: { $nin: fixtures } }).sort({ slug: 1 }).toArray()), previousHash);
    console.log('Year-paper library, categorization/import, duplicate protection, scoped review, independent solution links and existing-paper preservation verified.');
    if (process.argv.includes('--keep')) {
      await fs.mkdir(folder, { recursive: true });
      await fs.writeFile(manifest, JSON.stringify({ slugs: fixtures }));
      await fs.writeFile(`${folder}/browser-paper.json`, JSON.stringify({ ...paper, setNum: `${setNum}-ui`, title: 'Browser QA previous-year paper' }, null, 2));
      console.log(`Browser import JSON: ${folder}/browser-paper.json. Expected paper: ${uiSlug}.`);
      fixtures = [];
    }
  }
} finally {
  if (fixtures.length) await cleanup(client.db());
  await client.close();
}
