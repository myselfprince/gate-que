import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { TCP_UDP_IP_IMPORT as source } from '../data/imports/cn-tcp-udp-ip.mjs';
import { normalizeQuestionMetadata } from '../src/lib/question-metadata.mjs';
import { collectLatexImages } from '../src/lib/latex-source.mjs';
import { mergeReviewedImport, printedQuestion, sourceQuestions } from './lib/cn-tcp-ip-merge.mjs';

const require = createRequire(import.meta.url);
const { MongoClient, BSON } = require('mongoose').mongo;
require('@next/env').loadEnvConfig(process.cwd());
const matches = JSON.parse(await fs.readFile(new URL('../data/imports/cn-tcp-udp-ip-matches.json', import.meta.url)));
const apply = process.argv.includes('--apply');
const arg = (name) => { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : null; };
const backupDir = arg('--backup-dir') ? path.resolve(arg('--backup-dir')) : null;
const snapshotPath = arg('--snapshot');
if (apply && (snapshotPath || !backupDir)) throw new Error('Apply requires --backup-dir and a live database connection.');
assert.equal(source.questions.length, 94);
const actualHash = createHash('sha256').update(await fs.readFile('C:/Users/Prince/Desktop/MadeEasy PYQ PDF/3. Computer Networks/3. TCP, UDP and IP.pdf')).digest('hex');
assert.equal(actualHash, source.sourceHash, 'Source PDF changed; repeat visual review.');
for (const [index,q] of source.questions.entries()) {
  assert.equal(q.source.questionNumber, `3.${index+1}`);
  normalizeQuestionMetadata(q);
  assert.ok(q.text.trim());
  assert.equal((q.text.match(/\$/g) || []).length % 2, 0);
  if (q.questionType === 'NAT') assert.ok(q.natAnswer && !q.correctOptions.length && ![q.optA,q.optB,q.optC,q.optD].some(Boolean));
  else assert.ok([q.optA,q.optB,q.optC,q.optD].every(Boolean) && q.correctOptions.length && (q.questionType !== 'MCQ' || q.correctOptions.length === 1));
}
for (const file of collectLatexImages(source.questions)) await fs.access(path.join('public',source.subject,source.chapter,file));

function verify(before,after) {
  assert.equal(after.lockCount,before.lockCount);
  assert.equal(new Set(after.questions.map((q)=>q.id)).size,after.questions.length);
  // Every existing editable field, ID, order, position lock and unrelated record survives.
  before.questions.forEach((q,index)=>{
    const saved=after.questions[index];
    for(const key of Object.keys(q)) assert.deepEqual(saved[key],q[key],`Existing ${q.id}.${key} changed`);
  });
  const readback=sourceQuestions(after,source.sourceHash);
  assert.equal(readback.length,94);
  readback.forEach((q,index)=>{
    normalizeQuestionMetadata(q);
    assert.deepEqual(printedQuestion(q),printedQuestion(source.questions[index]),`Source content differs at ${q.source.questionNumber}`);
    assert.deepEqual(q.source,source.questions[index].source);
  });
  const repeated=mergeReviewedImport(after.questions,source.questions,matches);
  assert.equal(repeated.added,0);
  assert.equal(repeated.metadataAdded,0);
  assert.deepEqual(repeated.questions,after.questions);
  return {sourceCoverage:94,uniqueIds:true,existingRecordsPreserved:true,repeatAdded:0};
}

const identity={subject:source.subject,chapter:source.chapter};
const client = snapshotPath ? null : new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000,connectTimeoutMS:10000});
const deadline=setTimeout(()=>{console.error('TCP/UDP/IP database deadline exceeded');process.exit(2)},45000);
try {
  let db; let before; let targetBefore;
  if(snapshotPath) ({chapter:before,target:targetBefore}=BSON.EJSON.parse(await fs.readFile(snapshotPath,'utf8')));
  else {
    await client.connect(); db=client.db();
    before=await db.collection('chapters').findOne(identity);
    targetBefore=await db.collection('targets').findOne(identity);
  }
  if(!before) throw new Error('Expected main TCP/UDP/IP chapter is missing.');
  const plan=mergeReviewedImport(before.questions,source.questions,matches);
  const summary={mode:apply?'apply':'dry-run',...identity,sourceCount:94,previousCount:before.questions.length,
    added:plan.added,alreadyMatched:plan.alreadyPresent,metadataAdded:plan.metadataAdded,finalCount:plan.questions.length,
    unresolvedLegacyConflicts:matches.filter((match)=>match.conflicts.length).map((match)=>match.number),
    existingUnrelatedCount:19,targetBefore:targetBefore?.targetCount};
  let backupFile;
  if(apply && (plan.added || plan.metadataAdded || (targetBefore?.targetCount || 0)<94)) {
    await fs.mkdir(backupDir,{recursive:true});
    backupFile=path.join(backupDir,`before-${new Date().toISOString().replace(/[:.]/g,'-')}.ejson`);
    await fs.writeFile(backupFile,BSON.EJSON.stringify({chapter:before,target:targetBefore},null,2),{flag:'wx'});
    await fs.writeFile(`${backupFile}.sha256`,createHash('sha256').update(await fs.readFile(backupFile)).digest('hex')+'\n',{flag:'wx'});
    const session=client.startSession();
    try {
      await session.withTransaction(async()=>{
        const changed=await db.collection('chapters').updateOne({
          _id:before._id,updatedAt:before.updatedAt,questions:before.questions,lockCount:before.lockCount,
        },{$set:{questions:plan.questions,updatedAt:new Date()}},{session});
        if(changed.matchedCount!==1) throw new Error('Concurrent chapter edit detected. Transaction aborted; no data overwritten.');
        if(targetBefore && targetBefore.targetCount<94) {
          const target=await db.collection('targets').updateOne({_id:targetBefore._id,updatedAt:targetBefore.updatedAt,targetCount:targetBefore.targetCount},{$set:{targetCount:94,updatedAt:new Date()}},{session});
          if(target.matchedCount!==1) throw new Error('Concurrent target edit detected. Transaction aborted.');
        } else if(!targetBefore) await db.collection('targets').insertOne({...identity,targetCount:94,createdAt:new Date(),updatedAt:new Date()},{session});
      });
    } finally {await session.endSession();}
  }
  const after=apply ? await db.collection('chapters').findOne(identity) : {...before,questions:plan.questions};
  const checks=verify(before,after);
  const targetAfter=apply ? await db.collection('targets').findOne(identity) : targetBefore;
  if(apply) assert.ok(targetAfter?.targetCount>=94);
  const result={...summary,checks,backupFile,targetAfter:targetAfter?.targetCount};
  if(apply) {
    await fs.writeFile(path.join(backupDir,'after.ejson'),BSON.EJSON.stringify(after,null,2));
    await fs.writeFile(path.join(backupDir,'import-result.json'),JSON.stringify(result,null,2));
    await fs.writeFile(path.join(backupDir,'verified-source-from-database.json'),JSON.stringify({...identity,questions:sourceQuestions(after,source.sourceHash)},null,2));
  }
  console.log(JSON.stringify(result,null,2));
} catch(error) {
  console.error(JSON.stringify({error:error.name,message:error.message.replace(/mongodb(?:\+srv)?:\/\/\S+/g,'[database URI]')}));
  process.exitCode=1;
} finally {clearTimeout(deadline);if(client) await client.close();}
