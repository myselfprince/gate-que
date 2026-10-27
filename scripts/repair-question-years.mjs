import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { reconcileQuestionExamMetadata } from '../src/lib/question-exam-metadata.mjs';

const require = createRequire(import.meta.url);
const { MongoClient, BSON } = require('mongoose').mongo;
require('@next/env').loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const apply = process.argv.includes('--apply');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportDir = path.resolve('output/question-year-audit');
const backupDir = path.resolve('data/backups/question-year-audit', stamp);

function plan(chapters) {
  const updates = [];
  const changes = [];
  const conflicts = [];
  for (const chapter of chapters) {
    const questions = chapter.questions.map((original, index) => {
      const result = reconcileQuestionExamMetadata(original);
      if (!result.labels.length) return original;
      const identity = { chapterId: String(chapter._id), subject: chapter.subject, chapter: chapter.chapter, number: index + 1, questionId: original.id };
      if (result.conflict) {
        conflicts.push({ ...identity, labels: result.labels });
        return original;
      }
      const fields = Object.fromEntries(Object.entries(result.question)
        .filter(([key, value]) => value !== original[key])
        .map(([key, value]) => [key, { before: original[key] ?? null, after: value }]));
      changes.push({ ...identity, labels: result.labels, fields });
      return result.question;
    });
    if (questions.some((question, index) => question !== chapter.questions[index])) updates.push({ before: chapter, questions });
  }
  return { updates, changes, conflicts };
}

const reports = [];
await fs.mkdir(reportDir, { recursive: true });
for (const [name, envKey, collectionName] of [
  ['editor', 'MONGODB_URI', 'chapters'],
  ['staging', 'MONGODB_URI_2', 'scrapedchapters'],
]) {
  const client = new MongoClient(process.env[envKey], { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000 });
  try {
    await client.connect();
    const collection = client.db().collection(collectionName);
    const chapters = await collection.find({}).sort({ subject: 1, chapter: 1 }).toArray();
    const initial = plan(chapters);
    assert.equal(initial.conflicts.length, 0, 'Conflicting inline exam labels need manual review before applying.');
    let backupFile;
    if (apply && initial.updates.length) {
      await fs.mkdir(backupDir, { recursive: true });
      backupFile = path.join(backupDir, `${name}-before.ejson`);
      const snapshot = BSON.EJSON.stringify({ takenAt: new Date(), collectionName, chapters, changes: initial.changes }, null, 2);
      await fs.writeFile(backupFile, snapshot, { flag: 'wx' });
      await fs.writeFile(`${backupFile}.sha256`, `${createHash('sha256').update(snapshot).digest('hex')}\n`, { flag: 'wx' });
      const session = client.startSession();
      try {
        await session.withTransaction(async () => {
          for (const { before, questions } of initial.updates) {
            const result = await collection.updateOne(
              { _id: before._id, questions: before.questions, updatedAt: before.updatedAt },
              { $set: { questions, updatedAt: new Date() } }, { session });
            assert.equal(result.matchedCount, 1, `Concurrent edit detected in ${before.chapter}; transaction aborted.`);
          }
        });
      } finally { await session.endSession(); }
    }
    if (apply) {
      const after = await collection.find({}).sort({ subject: 1, chapter: 1 }).toArray();
      assert.equal(after.length, chapters.length);
      for (const before of chapters) {
        const saved = after.find(chapter => String(chapter._id) === String(before._id));
        assert.ok(saved, 'A chapter disappeared during the audit.');
        const update = initial.updates.find(item => String(item.before._id) === String(before._id));
        assert.deepEqual(saved, update ? { ...before, questions: update.questions, updatedAt: saved.updatedAt } : before);
      }
      assert.equal(plan(after).changes.length, 0, 'Inline exam labels remain after applying.');
      await fs.writeFile(path.join(reportDir, `${name}-after.json`), JSON.stringify(after, null, 2));
    }
    reports.push({
      database: name, chapters: chapters.length,
      records: chapters.reduce((count, chapter) => count + chapter.questions.length, 0),
      actualQuestions: chapters.reduce((count, chapter) => count + chapter.questions.filter(question => !question.isBlank).length, 0),
      questionsCorrected: initial.changes.length,
      yearCorrections: initial.changes.filter(change => change.fields.year).length,
      affectedChapters: initial.updates.length, conflicts: initial.conflicts,
      changes: initial.changes, backupFile, readBackVerified: apply,
    });
  } catch (error) {
    console.error(JSON.stringify({ database: name, error: error.name, message: error.message.replace(/mongodb(?:\+srv)?:\/\/\S+/g, '[database URI]') }));
    process.exitCode = 1;
  } finally { await client.close(); }
}
const report = { mode: apply ? 'apply' : 'dry-run', checkedAt: new Date(), databases: reports };
await fs.writeFile(path.join(reportDir, `${report.mode}-${stamp}.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
