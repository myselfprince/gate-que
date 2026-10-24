import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { MongoClient, BSON } = require('mongoose').mongo;
require('@next/env').loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const root = path.resolve('tmp/question-syntax-audit');
const backupDir = path.resolve('data/backups/question-syntax-audit-2026-10-24');
const apply = process.argv.includes('--apply');
const digest = value => createHash('sha256').update(value).digest('hex');
const read = async name => JSON.parse(await fs.readFile(path.join(root, name), 'utf8'));
const baseline = await read('chapters.json');
const staged = await read('staged-chapters.json');
const manifest = await read('patches.json');
assert.equal(new Set(manifest.patches.map(patch => patch.questionId)).size, manifest.patches.length);
for (const asset of manifest.assets) assert.equal(digest(await fs.readFile(asset.to)), asset.sha256, `Asset changed: ${asset.to}`);

function plan(chapters) {
  const updates = new Map();
  let alreadyApplied = 0;
  for (const patch of manifest.patches) {
    const beforeChapter = chapters.find(chapter => String(chapter._id) === patch.chapterId);
    assert.ok(beforeChapter, `Chapter no longer exists: ${patch.chapter}`);
    const index = beforeChapter.questions.findIndex(question => question.id === patch.questionId);
    assert.ok(index >= 0, `Question no longer exists: ${patch.questionId}`);
    const original = baseline.find(chapter => chapter._id === patch.chapterId).questions.find(question => question.id === patch.questionId);
    const expected = staged.find(chapter => chapter._id === patch.chapterId).questions.find(question => question.id === patch.questionId);
    const current = beforeChapter.questions[index];
    if (JSON.stringify(current) === JSON.stringify(expected)) { alreadyApplied++; continue; }
    assert.deepEqual(current, original, `Concurrent edit to ${patch.questionId}; no overwrite permitted.`);
    const update = updates.get(patch.chapterId) || { before: beforeChapter, questions: structuredClone(beforeChapter.questions), repaired: [] };
    update.questions[index] = { ...update.questions[index], ...Object.fromEntries(Object.entries(patch.changes).map(([field, change]) => [field, change.after])) };
    assert.deepEqual(update.questions[index], expected);
    update.repaired.push(patch.questionId);
    updates.set(patch.chapterId, update);
  }
  return { updates, alreadyApplied };
}

if (apply) {
  const evidence = await read('evidence.json');
  for (const [name, hash] of Object.entries(evidence.files)) assert.equal(digest(await fs.readFile(path.join(root, name))), hash, `Evidence changed: ${name}`);
  assert.equal(evidence.complete, true, 'Verification must finish before database mutation.');
}
const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000 });
try {
  await client.connect();
  const db = client.db();
  const chapters = await db.collection('chapters').find({}).sort({ subject: 1, chapter: 1 }).toArray();
  const targets = await db.collection('targets').find({}).sort({ _id: 1 }).toArray();
  const initial = plan(chapters);
  let backupFile;
  if (apply && initial.updates.size) {
    await fs.mkdir(backupDir, { recursive: true });
    backupFile = path.join(backupDir, `before-${new Date().toISOString().replace(/[:.]/g, '-')}.ejson`);
    const snapshot = BSON.EJSON.stringify({ takenAt: new Date(), chapters, targets, manifest }, null, 2);
    await fs.writeFile(backupFile, snapshot, { flag: 'wx' });
    await fs.writeFile(`${backupFile}.sha256`, `${digest(snapshot)}\n`, { flag: 'wx' });
    await fs.copyFile(path.join(root, 'before.ejson'), path.join(backupDir, 'audit-start.ejson'));
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        for (const { before, questions } of initial.updates.values()) {
          const filter = { _id: before._id, questions: before.questions, updatedAt: before.updatedAt };
          if (Object.hasOwn(before, 'lockCount')) filter.lockCount = before.lockCount;
          const result = await db.collection('chapters').updateOne(filter,
            { $set: { questions, updatedAt: new Date() } }, { session });
          assert.equal(result.matchedCount, 1, `Concurrent chapter change detected: ${before.chapter}; aborting transaction.`);
        }
      });
    } finally { await session.endSession(); }
  }
  const after = apply ? await db.collection('chapters').find({}).sort({ subject: 1, chapter: 1 }).toArray() : chapters;
  const afterTargets = await db.collection('targets').find({}).sort({ _id: 1 }).toArray();
  if (apply) {
    assert.equal(after.length, chapters.length, 'Concurrent chapter creation/deletion detected after commit.');
    for (const chapter of after) {
      const before = chapters.find(item => String(item._id) === String(chapter._id));
      const update = initial.updates.get(String(chapter._id));
      if (!update) assert.deepEqual(chapter, before, 'Unrelated chapter changed during verification.');
      else {
        assert.deepEqual(chapter.questions, update.questions, 'Read-back differs from verified repairs.');
        const { updatedAt: _beforeTime, questions: _beforeQuestions, ...beforeRest } = before;
        const { updatedAt: _afterTime, questions: _afterQuestions, ...afterRest } = chapter;
        assert.deepEqual(afterRest, beforeRest, 'Chapter metadata or lock count changed.');
        assert.deepEqual(chapter.questions.map(question => [question.id, question.isPosLocked]), before.questions.map(question => [question.id, question.isPosLocked]));
      }
    }
    assert.deepEqual(afterTargets, targets, 'Completion targets changed.');
    const repeated = plan(after);
    assert.equal(repeated.updates.size, 0, 'Repeat-run must plan zero writes.');
    assert.equal(repeated.alreadyApplied, manifest.patches.length);
  }
  const result = { mode: apply ? 'apply' : 'dry-run', checkedAt: new Date(),
    questionsToRepair: [...initial.updates.values()].reduce((sum, update) => sum + update.repaired.length, 0),
    affectedChapters: initial.updates.size, alreadyApplied: initial.alreadyApplied,
    records: after.reduce((sum, chapter) => sum + chapter.questions.length, 0),
    actualQuestions: after.reduce((sum, chapter) => sum + chapter.questions.filter(question => !question.isBlank).length, 0),
    backupFile, readBackVerified: apply, idsOrderAndLocksPreserved: apply, targetsUnchanged: apply,
    repeatPendingWrites: apply ? 0 : undefined };
  if (apply) {
    await fs.mkdir(backupDir, { recursive: true });
    await fs.writeFile(path.join(backupDir, 'after.ejson'), BSON.EJSON.stringify({ chapters: after, targets: afterTargets }, null, 2));
    await fs.writeFile(path.join(root, 'readback-chapters.json'), JSON.stringify(after, null, 2));
    await fs.writeFile(path.join(backupDir, 'application-result.json'), JSON.stringify(result, null, 2));
  }
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(JSON.stringify({ error: error.name, message: error.message.replace(/mongodb(?:\+srv)?:\/\/\S+/g, '[database URI]') }));
  process.exitCode = 1;
} finally { await client.close(); }
