import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID, createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import mongoose from 'mongoose';

const uri = process.env.GATE_PUBLISH_TEST_URI || 'mongodb://127.0.0.1:27018';
if (!uri.startsWith('mongodb://') || !['localhost', '127.0.0.1', '[::1]'].includes(new URL(uri).hostname)) throw new Error('This check refuses remote MongoDB.');
const suffix = randomUUID().replaceAll('-', ''), database = `gate-paper-publish-qa-${suffix}`;
const root = fileURLToPath(new URL('../', import.meta.url));
const work = path.join(root, 'tmp', database), slug = `gate-cs-2005-qa-${suffix}`;
const client = new mongoose.mongo.MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
const hash = value => createHash('sha256').update(mongoose.mongo.BSON.EJSON.stringify(value)).digest('hex');
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jDPsAAAAASUVORK5CYII=', 'base64');
const paper = { slug, datasetId: slug, title: 'Local QA paper', year: '2005', examPaper: 'CS', questionCount: 1,
  totalMarks: 1, availableMarks: 1, durationMinutes: 180, negativeFraction: 1 / 3, verified: true, instructions: [],
  questions: [{ key: slug + ':1', datasetId: slug, paperQuestionNumber: '1', text: 'QA [IMG_1]', subject: 'Year Papers', chapter: 'GATE CS 2005',
    diagram: 'diagram', questionType: 'MCQ', marks: '1', optA: 'A', optB: 'B', optC: 'C', optD: 'D', correctOptions: ['A'],
    referenceAnswer: 'QA explanation', gateOverflowUrl: 'https://gateoverflow.in/1', source: {} }] };
const importScript = path.join(root, 'scripts', 'import-year-paper.mjs');
async function publish(update = false) {
  return await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [importScript, slug, ...(update ? ['--update-copy'] : [])], {
      cwd: work, windowsHide: true, env: { ...process.env, MONGODB_URI: `mongodb://${new URL(uri).host}/${database}`, NODE_ENV: 'test' }, stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = ''; child.stdout.on('data', data => { output += data; }); child.stderr.on('data', data => { output += data; });
    child.on('error', reject); child.on('close', code => resolve({ code, output }));
  });
}
let created = false;
try {
  await client.connect();
  // The only writable database is a fresh, randomly named localhost QA database.
  const existing = await client.db('admin').admin().listDatabases({ nameOnly: true });
  assert.ok(!existing.databases.some(value => value.name === database));
  const db = client.db(database); created = true;
  await db.collection('chapters').insertOne({ name: 'Preserved book fixture', questions: [{ text: 'Do not change' }] });
  await db.collection('yearpapers').insertOne({ slug: 'previous-qa-paper', questions: [{ text: 'Preserved paper fixture' }] });
  const chapters = await db.collection('chapters').find({}).sort({ _id: 1 }).toArray();
  const previous = await db.collection('yearpapers').find({}).toArray();
  const backup = path.join(work, 'data', 'backups', 'gate-2005');
  const image = path.join(work, 'public', 'Year Papers', 'GATE CS 2005', 'diagram.png');
  await fs.mkdir(backup, { recursive: true }); await fs.mkdir(path.dirname(image), { recursive: true }); await fs.mkdir(path.join(work, 'data', 'papers'));
  await fs.writeFile(path.join(backup, 'chapters-before.ejson'), mongoose.mongo.BSON.EJSON.stringify(chapters));
  await fs.writeFile(path.join(backup, 'yearpapers-before.ejson'), mongoose.mongo.BSON.EJSON.stringify(previous));
  await fs.writeFile(path.join(work, 'data', 'papers', slug + '.json'), JSON.stringify(paper)); await fs.writeFile(image, png);
  let run = await publish(); assert.equal(run.code, 0, run.output);
  const first = await db.collection('yearpapers').findOne({ slug });
  const firstAsset = first.assetManifest.files[0].id;
  assert.equal(await db.collection('yearpaperassets').countDocuments(), 1);
  run = await publish(); assert.equal(run.code, 0, run.output);
  assert.equal(hash(await db.collection('yearpapers').findOne({ slug })), hash(first));
  await fs.writeFile(image, Buffer.concat([png, Buffer.from('new version')]));
  run = await publish(); assert.notEqual(run.code, 0); assert.match(run.output, /--update-copy/);
  assert.equal(await db.collection('yearpaperassets').countDocuments(), 1);
  assert.equal(hash(await db.collection('yearpapers').findOne({ slug })), hash(first));
  run = await publish(true); assert.equal(run.code, 0, run.output);
  const updated = await db.collection('yearpapers').findOne({ slug });
  assert.notEqual(updated.assetManifest.files[0].id, firstAsset);
  assert.equal(await db.collection('yearpaperassets').countDocuments(), 2);
  assert.ok(await db.collection('yearpaperassets').findOne({ _id: firstAsset }));
  assert.ok((await fs.readdir(backup)).some(name => name.startsWith(slug + '-') && name.endsWith('.ejson')));
  assert.equal(hash(await db.collection('chapters').find({}).sort({ _id: 1 }).toArray()), hash(chapters));
  assert.equal(hash(await db.collection('yearpapers').findOne({ _id: previous[0]._id })), hash(previous[0]));
  console.log(JSON.stringify({ passed: true, localOnly: true, publish: true, idempotent: true, updateGuard: true, backup: true, immutableImages: true, bookAndPreviousPapersUnchanged: true }));
} finally {
  if (created) { assert.match(database, /^gate-paper-publish-qa-[a-f0-9]{32}$/); await client.db(database).dropDatabase(); }
  await client.close();
  assert.equal(path.dirname(work), path.join(root, 'tmp'));
  await fs.rm(work, { recursive: true, force: true });
}
