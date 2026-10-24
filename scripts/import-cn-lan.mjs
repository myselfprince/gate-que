import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { LAN_IMPORT } from '../data/imports/cn-lan.mjs';
import { mergeChapterImport } from '../src/lib/chapter-import.mjs';
import { normalizeQuestionMetadata } from '../src/lib/question-metadata.mjs';

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require('@next/env');
const { MongoClient, BSON } = require('mongoose').mongo;
loadEnvConfig(process.cwd());

const apply = process.argv.includes('--apply');
const backupIndex = process.argv.indexOf('--backup-dir');
const backupDir = backupIndex >= 0 ? path.resolve(process.argv[backupIndex + 1]) : null;
if (apply && !backupDir) throw new Error('--backup-dir is required before database writes.');
if (LAN_IMPORT.questions.length !== 35) throw new Error('The LAN source must contain all 35 questions.');
for (const [i, q] of LAN_IMPORT.questions.entries()) {
  normalizeQuestionMetadata(q);
  if (q.source.questionNumber !== `2.${i + 1}` || !q.text.trim()) throw new Error('Source numbering or text is incomplete.');
  const options = [q.optA, q.optB, q.optC, q.optD];
  if (q.questionType === 'NAT' ? options.some(Boolean) || !q.natAnswer : options.some((option) => !option) || !q.correctOptions.length) {
    throw new Error(`Question ${q.source.questionNumber} is incomplete.`);
  }
}
const sourceFile = 'C:/Users/Prince/Desktop/MadeEasy PYQ PDF/3. Computer Networks/2. LAN.pdf';
const actualHash = createHash('sha256').update(await fs.readFile(sourceFile)).digest('hex');
if (actualHash !== LAN_IMPORT.sourceHash) throw new Error('The source PDF changed; re-review it before importing.');

const deadline = setTimeout(() => { console.error('LAN import connection deadline exceeded.'); process.exit(2); }, 45_000);
const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000, connectTimeoutMS: 10_000 });
try {
  await client.connect();
  const db = client.db();
  const chapters = db.collection('chapters');
  const identity = { subject: LAN_IMPORT.subject, chapter: LAN_IMPORT.chapter };
  const before = await chapters.findOne(identity);
  if (!before) throw new Error('Expected LAN chapter is missing. Inspect the database before importing.');
  const plan = mergeChapterImport(before.questions || [], LAN_IMPORT.questions);
  if (before.lockCount && plan.preservedNotes.length) throw new Error('A bulk lock protects the legacy note; review before importing.');
  const notes = [...(before.importNotes || [])];
  for (const note of plan.preservedNotes) {
    if (!notes.some((entry) => entry.id === note.id)) notes.push(note);
  }
  const summary = { mode: apply ? 'apply' : 'dry-run', ...identity, previousCount: before.questions.length,
    sourceCount: 35, added: plan.added, alreadyPresent: plan.alreadyPresent,
    preservedNoteCount: notes.length, finalCount: plan.questions.length };

  if (apply && (plan.added || plan.preservedNotes.length)) {
    await fs.mkdir(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const targetBefore = await db.collection('targets').findOne(identity);
    await fs.writeFile(path.join(backupDir, `before-${stamp}.ejson`), BSON.EJSON.stringify({ chapter: before, target: targetBefore }, null, 2), { flag: 'wx' });
    const filter = { _id: before._id, updatedAt: before.updatedAt, questions: before.questions, lockCount: before.lockCount };
    const changed = await chapters.updateOne(filter, { $set: {
      questions: plan.questions, importNotes: notes, updatedAt: new Date(),
    } });
    if (changed.matchedCount !== 1) throw new Error('LAN changed during import. Nothing was overwritten; rerun the dry-run.');
    await db.collection('targets').updateOne(identity, {
      $setOnInsert: { ...identity, createdAt: new Date() },
      $max: { targetCount: 35 }, $set: { updatedAt: new Date() },
    }, { upsert: true });
  }
  const after = await chapters.findOne(identity);
  const imported = after.questions.filter((q) => q.source?.sha256 === LAN_IMPORT.sourceHash);
  if (apply) {
    if (imported.length !== 35 || new Set(after.questions.map((q) => q.id)).size !== after.questions.length) throw new Error('Post-import count or ID verification failed.');
    for (const q of LAN_IMPORT.questions) {
      if (!imported.some((item) => item.id === q.id && item.source.questionNumber === q.source.questionNumber)) throw new Error('Source coverage verification failed.');
    }
    await fs.writeFile(path.join(backupDir, 'after.ejson'), BSON.EJSON.stringify(after, null, 2));
    await fs.writeFile(path.join(backupDir, 'import-result.json'), JSON.stringify(summary, null, 2));
  }
  console.log(JSON.stringify(summary, null, 2));
} catch (error) {
  console.error(JSON.stringify({ error: error.name, message: error.message.replace(/mongodb(?:\+srv)?:\/\/\S+/g, '[database URI]') }));
  process.exitCode = 1;
} finally {
  clearTimeout(deadline);
  await client.close();
}
