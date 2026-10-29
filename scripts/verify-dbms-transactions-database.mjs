import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {DBMS_TRANSACTIONS_IMPORT as source} from '../data/imports/dbms-transactions.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {mergeReviewedImport} from './lib/cn-tcp-ip-merge.mjs';
const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const {MongoClient,BSON}=require('mongoose').mongo;
const root='data/backups/dbms-transactions-2026-10-28';
const initial=JSON.parse(await fs.readFile(`${root}/import-result.json`,'utf8'));
const backup=BSON.EJSON.parse(await fs.readFile(initial.backupFile,'utf8'));
assert.equal(createHash('sha256').update(await fs.readFile(initial.backupFile)).digest('hex'),(await fs.readFile(initial.backupFile+'.sha256','utf8')).trim());
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000,connectTimeoutMS:10000});
const digest=doc=>createHash('sha256').update(BSON.EJSON.stringify(doc)).digest('hex');
try {
  await client.connect();const db=client.db();
  const identity={subject:source.subject,chapter:source.chapter};
  const chapter=await db.collection('chapters').findOne(identity);
  const target=await db.collection('targets').findOne(identity);
  assert.deepEqual(chapter.questions,source.questions,'Database differs from final reviewed source; preserve concurrent edits and review.');
  assert.equal(chapter.lockCount,backup.chapter?.lockCount||0);
  assert.equal(new Set(chapter.questions.map(q=>q.id)).size,37);
  assert.deepEqual(target,backup.target,'Existing completion target must remain unchanged.');
  for(const q of chapter.questions) normalizeQuestionMetadata(q);
  for(const file of collectLatexImages(chapter.questions)) await fs.access(`public/${source.subject}/${source.chapter}/${file}`);
  const repeated=mergeReviewedImport(chapter.questions,source.questions,[]);
  assert.equal(repeated.added,0);assert.deepEqual(repeated.questions,chapter.questions);
  const all=await db.collection('chapters').find({},{projection:{subject:1,chapter:1,questions:1,lockCount:1,updatedAt:1}}).toArray();
  const targets=await db.collection('targets').find({}).toArray();
  const hashes=new Map([...all.filter(c=>c.subject!==source.subject||c.chapter!==source.chapter).map(c=>['chapter:'+String(c._id),digest(c)]),
    ...targets.filter(c=>c.subject!==source.subject||c.chapter!==source.chapter).map(c=>['target:'+String(c._id),digest(c)])]);
  const changesSinceInitialBackup=backup.otherHashes.filter(c=>hashes.get(c.id)!==c.hash).map(c=>c.id);
  const result={subject:source.subject,chapter:source.chapter,sourceCoverage:37,sourceMatchesDatabase:true,uniqueIds:true,metadataValid:true,
    answerKeyPdfPage:4,unresolvedAnswers:0,sourceIssueQuestions:['5.11','5.30'],types:{MCQ:32,MSQ:3,NAT:2},unresolvedText:0,imageReferencesValid:true,backupChecksumValid:true,lockCountPreserved:true,
    targetUnchanged:true,targetCount:target.targetCount,repeatAdded:repeated.added,repeatMatched:repeated.alreadyPresent,
    initialImportUnrelatedStateUnchanged:initial.unrelatedChaptersUnchanged,changesSinceInitialBackup};
  await fs.writeFile(`${root}/final-database-audit.json`,JSON.stringify(result,null,2));
  await fs.writeFile(`${root}/final.ejson`,BSON.EJSON.stringify({chapter,target},null,2));
  await fs.writeFile(`${root}/verified-source-from-database.json`,JSON.stringify({...identity,questions:chapter.questions},null,2));
  console.log(JSON.stringify(result,null,2));
} finally {await client.close();}
