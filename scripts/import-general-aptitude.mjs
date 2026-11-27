import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { mergeChapterImport } from '../src/lib/chapter-import.mjs';
import { collectLatexImages } from '../src/lib/latex-source.mjs';
import { storedAnswerText } from '../src/lib/question-answers.mjs';
import { normalizeQuestionMetadata } from '../src/lib/question-metadata.mjs';

const source = JSON.parse(await fs.readFile(new URL('../data/imports/general-aptitude.json', import.meta.url), 'utf8'));
const { subject, chapter, questions } = source;
const identity = { subject, chapter };
const sessionsByYear = [
  1, 1, 1, 1, 3, 3, 2, 2, 1, 1, 1, 2, 1, 1, 2, 2, 2,
];
const earlyNumbering = new Set([2010, 2011, 2012, 2013, 2017]);
const assets = collectLatexImages(questions);

assert.deepEqual(identity, { subject: '13. General Aptitude', chapter: '1. General Aptitude' });
const expected = sessionsByYear.flatMap((count, index) => {
  const year = index + 2010;
  const first = earlyNumbering.has(year) ? 56 : 1;
  return Array.from({ length: count }, (_, set) => Array.from({ length: 10 }, (_, i) => {
    const setNum = count === 1 ? '' : String(set + 1);
    return { year: String(year), setNum, paperQuestionNumber: String(first + i), marks: i < 5 ? '1' : '2' };
  })).flat();
});
assert.equal(questions.length, expected.length);
assert.equal(new Set(questions.map(q => q.id)).size, questions.length);

for (const [index, question] of questions.entries()) {
  const { id, text, year, setNum, paperQuestionNumber, marks } = question;
  assert.deepEqual({ year, setNum, paperQuestionNumber, marks }, expected[index], id);
  assert.equal(question.examPaper, 'CS', id);
  assert.equal(question.source.questionNumber, paperQuestionNumber, id);
  normalizeQuestionMetadata(question);
  assert.ok(text.trim() && storedAnswerText(question), id);
  const options = ['A', 'B', 'C', 'D'].map(letter => question[`opt${letter}`]);
  assert.ok(question.questionType === 'NAT' ? options.every(option => option === '') : options.every(option => option.trim()), id);
  const images = (question.diagram || '').split(',').filter(Boolean);
  for (const placeholder of text.matchAll(/\[IMG_(\d+)\]/g)) {
    assert.ok(images[Number(placeholder[1]) - 1], `${id} references a missing diagram`);
  }
}
for (const name of assets) {
  const image = await fs.readFile(path.join('public', subject, chapter, name));
  assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', name);
}

const validated = { questions: questions.length, papers: sessionsByYear.reduce((total, count) => total + count, 0), images: assets.length };
if (process.argv.includes('--validate')) {
  console.log(JSON.stringify({ mode: 'validate', ...validated }, null, 2));
  process.exit(0);
}

const require = createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const { MongoClient, BSON } = require('mongoose').mongo;
const apply = process.argv.includes('--apply');
const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
try {
  await client.connect();
  const chapters = client.db().collection('chapters');
  const targets = client.db().collection('targets');
  const [before, target] = await Promise.all([chapters.findOne(identity), targets.findOne(identity)]);
  const existing = before?.questions ?? [];
  const merged = mergeChapterImport(existing, questions);
  assert.deepEqual(merged.questions.slice(0, existing.length), existing, 'The import would change existing questions.');
  const targetCount = Math.max(questions.length, target?.targetCount ?? 0);
  let backup;
  if (apply && (merged.added || targetCount !== target?.targetCount)) {
    for (const collection of [chapters, targets]) {
      const indexes = await collection.indexes();
      assert.ok(indexes.some(index => index.unique && index.key.subject === 1 && index.key.chapter === 1),
        `The ${collection.collectionName} collection needs its unique subject and chapter index.`);
    }
    const directory = path.join('data', 'backups', 'general-aptitude');
    await fs.mkdir(directory, { recursive: true });
    backup = path.join(directory, `before-${new Date().toISOString().replace(/[:.]/g, '-')}.ejson`);
    await fs.writeFile(backup, BSON.EJSON.stringify({ chapter: before, target }, { relaxed: false }), { flag: 'wx' });
    await client.withSession(session => session.withTransaction(async () => {
      const now = new Date();
      if (merged.added && before) {
        const result = await chapters.updateOne({
          _id: before._id, updatedAt: before.updatedAt, questions: before.questions, lockCount: before.lockCount,
        }, { $set: { questions: merged.questions, updatedAt: now } }, { session });
        assert.equal(result.matchedCount, 1, 'The chapter changed during the import. Run the dry run again.');
      } else if (merged.added) {
        const result = await chapters.updateOne(identity, {
          $setOnInsert: { ...identity, questions: merged.questions, lockCount: 0, createdAt: now, updatedAt: now, __v: 0 },
        }, { upsert: true, session });
        assert.equal(result.upsertedCount, 1, 'The chapter was created during the import. Run the dry run again.');
      }
      if (target && targetCount !== target.targetCount) {
        const result = await targets.updateOne({
          _id: target._id, updatedAt: target.updatedAt, targetCount: target.targetCount,
        }, { $set: { targetCount, updatedAt: now } }, { session });
        assert.equal(result.matchedCount, 1, 'The chapter target changed during the import. Run the dry run again.');
      } else if (!target) {
        const result = await targets.updateOne(identity, {
          $setOnInsert: { ...identity, targetCount, createdAt: now, updatedAt: now, __v: 0 },
        }, { upsert: true, session });
        assert.equal(result.upsertedCount, 1, 'The target was created during the import. Run the dry run again.');
      }
    }));
  }
  if (apply) {
    const [saved, savedTarget] = await Promise.all([chapters.findOne(identity), targets.findOne(identity)]);
    assert.deepEqual(saved?.questions, merged.questions);
    assert.equal(saved.lockCount ?? 0, before?.lockCount ?? 0);
    assert.equal(savedTarget?.targetCount, targetCount);
  }

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run', ...identity, ...validated, existing: existing.length,
    added: merged.added, total: merged.questions.length, targetCount, backup,
  }, null, 2));
} finally {
  await client.close();
}
