import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {OS_MEMORY_IMPORT as source} from '../data/imports/os-memory.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {mergeReviewedImport, printedQuestion, sourceQuestions} from './lib/cn-tcp-ip-merge.mjs';

const require = createRequire(import.meta.url);
const {MongoClient,BSON} = require('mongoose').mongo;
require('@next/env').loadEnvConfig(process.cwd());
const apply = process.argv.includes('--apply');
const arg = name => {const i=process.argv.indexOf(name);return i<0?null:process.argv[i+1];};
const backupDir = arg('--backup-dir') ? path.resolve(arg('--backup-dir')) : null;
const snapshot = arg('--snapshot');
if (apply && (!backupDir || snapshot)) throw new Error('Apply requires --backup-dir and a live database.');
const sourcePdf = 'C:/Users/Prince/Desktop/MadeEasy PYQ PDF/5. Operating Systems/4. Mem. Mgmt and Virtual Mem.pdf';
assert.equal(createHash('sha256').update(await fs.readFile(sourcePdf)).digest('hex'),source.sourceHash,'Source PDF changed; repeat visual review.');
assert.equal(source.questions.length,74);
for(const [i,q] of source.questions.entries()) {
  assert.equal(q.source.questionNumber,`4.${i+1}`);
  normalizeQuestionMetadata(q);
  assert.ok(q.text.trim());
  assert.equal((q.text.match(/\$/g)||[]).length%2,0);
  assert.equal(q.source.answerKeyPdfPage,5);
  if(q.questionType==='NAT') { assert.ok(q.natAnswer); assert.deepEqual(q.correctOptions,[]); }
  else if(q.questionType==='SUBJECTIVE') { assert.deepEqual(q.correctOptions,[]); assert.equal(q.natAnswer,''); assert.ok(q.isProof); }
  else { assert.ok(q.correctOptions.length>=1); if(q.questionType==='MCQ')assert.equal(q.correctOptions.length,1); assert.equal(q.natAnswer,''); }
  assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,['NAT','SUBJECTIVE'].includes(q.questionType)?0:4);
}
for(const file of collectLatexImages(source.questions)) await fs.access(path.join('public',source.subject,source.chapter,file));

const identity = {subject:source.subject,chapter:source.chapter};
const digest = doc => createHash('sha256').update(BSON.EJSON.stringify(doc)).digest('hex');
async function otherHashes(db) {
  const all=await db.collection('chapters').find({}, {projection:{subject:1,chapter:1,questions:1,lockCount:1,updatedAt:1}}).toArray();
  const targets=await db.collection('targets').find({}).toArray();
  return [...all.filter(c=>c.chapter!==identity.chapter || c.subject!==identity.subject)
    .map(c=>({id:'chapter:'+String(c._id),hash:digest(c)})),...targets.filter(c=>c.chapter!==identity.chapter || c.subject!==identity.subject).map(c=>({id:'target:'+String(c._id),hash:digest(c)}))].sort((a,b)=>a.id.localeCompare(b.id));
}

export function verifyMemoryImport(before,after) {
  assert.equal(after.lockCount,before?.lockCount||0);
  assert.equal(new Set(after.questions.map(q=>q.id)).size,after.questions.length);
  (before?.questions||[]).forEach((q,i)=>assert.deepEqual(after.questions[i],q,`Existing record ${q.id} changed`));
  const imported=sourceQuestions(after,source.sourceHash);
  assert.equal(imported.length,74);
  const existingIds=new Set((before?.questions||[]).map(q=>q.id));
  const retainedEdits=[];
  imported.forEach((q,i)=>{
    normalizeQuestionMetadata(q);
    assert.deepEqual(q.source,source.questions[i].source);
    if(!existingIds.has(q.id)) assert.deepEqual(printedQuestion(q),printedQuestion(source.questions[i]));
    else if(JSON.stringify(printedQuestion(q))!==JSON.stringify(printedQuestion(source.questions[i]))) retainedEdits.push(q.source.questionNumber);
  });
  const repeated=mergeReviewedImport(after.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.deepEqual(repeated.questions,after.questions);
  return {sourceCoverage:74,uniqueIds:true,metadataValid:true,answersMatchPrintedKey:true,unresolvedAnswers:[],imageReferencesValid:true,existingRecordsPreserved:true,repeatAdded:0,retainedEdits};
}

const client=snapshot?null:new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000,connectTimeoutMS:10000});
const deadline=setTimeout(()=>{console.error('OS memory import deadline exceeded');process.exit(2)},45000);
try {
  let db,before,targetBefore,unrelatedBefore;
  if(snapshot) ({chapter:before,target:targetBefore}=BSON.EJSON.parse(await fs.readFile(snapshot,'utf8')));
  else {
    await client.connect();db=client.db();
    before=await db.collection('chapters').findOne(identity);
    targetBefore=await db.collection('targets').findOne(identity);
    unrelatedBefore=await otherHashes(db);
  }
  // The reviewed database chapter was absent. Any later legacy/content/ID
  // collision is rejected by the existing reviewed merge instead of overwritten.
  const plan=mergeReviewedImport(before?.questions||[],source.questions,[]);
  let backupFile;
  // An absent chapter was reviewed. Refuse any newly introduced unreviewed legacy
  // records, including semantic matches that differ from the exact fingerprint.
  if((before?.questions||[]).some(q=>q.source?.sha256!==source.sourceHash)) throw new Error('Unreviewed existing records detected; inspect and match them before applying this import.');
  if(apply && (plan.added || (targetBefore?.targetCount||0)<74)) {
    const indexes=await db.collection('chapters').indexes();
    assert.ok(indexes.some(index=>index.unique && index.key.subject===1 && index.key.chapter===1),'A unique chapter identity index is required for safe concurrent creation.');
    await fs.mkdir(backupDir,{recursive:true});
    backupFile=path.join(backupDir,`before-${new Date().toISOString().replace(/[:.]/g,'-')}.ejson`);
    await fs.writeFile(backupFile,BSON.EJSON.stringify({chapter:before,target:targetBefore,otherHashes:unrelatedBefore,sourceHash:source.sourceHash},null,2),{flag:'wx'});
    await fs.writeFile(backupFile+'.sha256',createHash('sha256').update(await fs.readFile(backupFile)).digest('hex')+'\n',{flag:'wx'});
    const session=client.startSession();
    try {
      await session.withTransaction(async()=>{
        if(before) {
          const result=await db.collection('chapters').updateOne({_id:before._id,updatedAt:before.updatedAt,questions:before.questions,lockCount:before.lockCount},{$set:{questions:plan.questions,updatedAt:new Date()}},{session});
          assert.equal(result.matchedCount,1,'Concurrent chapter edit detected; transaction aborted.');
        } else {
          const now=new Date();
          const result=await db.collection('chapters').updateOne(identity,{$setOnInsert:{...identity,questions:plan.questions,lockCount:0,createdAt:now,updatedAt:now,__v:0}},{upsert:true,session});
          assert.equal(result.upsertedCount,1,'Chapter was concurrently created; transaction aborted. Re-review existing content.');
        }
        if(targetBefore && targetBefore.targetCount<74) {
          const result=await db.collection('targets').updateOne({_id:targetBefore._id,updatedAt:targetBefore.updatedAt,targetCount:targetBefore.targetCount},{$set:{targetCount:74,updatedAt:new Date()}},{session});
          assert.equal(result.matchedCount,1,'Concurrent target edit detected; transaction aborted.');
        } else if(!targetBefore) {
          const now=new Date();
          const result=await db.collection('targets').updateOne(identity,{$setOnInsert:{...identity,targetCount:74,createdAt:now,updatedAt:now}},{session,upsert:true});
          assert.equal(result.upsertedCount,1,'Target was concurrently created; transaction aborted.');
        }
      });
    } finally {await session.endSession();}
  }
  const after=apply?await db.collection('chapters').findOne(identity):{...(before||identity),lockCount:before?.lockCount||0,questions:plan.questions};
  const checks=verifyMemoryImport(before,after);
  const targetAfter=apply?await db.collection('targets').findOne(identity):targetBefore;
  if(apply) {
    assert.ok(targetAfter.targetCount>=74);
    if(targetBefore?.targetCount>=74) assert.deepEqual(targetAfter,targetBefore);
    assert.deepEqual(await otherHashes(db),unrelatedBefore,'Unrelated chapter state changed during the import; inspect concurrent activity.');
  }
  const result={mode:apply?'apply':'dry-run',...identity,sourceCount:74,previousCount:before?.questions.length||0,
    added:plan.added,alreadyMatched:plan.alreadyPresent,finalCount:after.questions.length,
    unresolvedAnswers:[],unresolvedText:0,sourceCaveats:['4.35 and 4.65: printed values conflict with the printed answer; source key preserved literally'],unresolvedSourceIssues:['4.35','4.65'],
    checks,unrelatedChaptersUnchanged:apply?true:undefined,backupFile,targetBefore:targetBefore?.targetCount,targetAfter:targetAfter?.targetCount};
  if(apply) {
    await fs.mkdir(backupDir,{recursive:true});
    await fs.writeFile(path.join(backupDir,'after.ejson'),BSON.EJSON.stringify(after,null,2));
    await fs.writeFile(path.join(backupDir,'import-result.json'),JSON.stringify(result,null,2));
    await fs.writeFile(path.join(backupDir,'verified-source-from-database.json'),JSON.stringify({...identity,questions:sourceQuestions(after,source.sourceHash)},null,2));
  }
  console.log(JSON.stringify(result,null,2));
} catch(error) {console.error(JSON.stringify({error:error.name,message:error.message.replace(/mongodb(?:\+srv)?:\/\/\S+/g,'[database URI]')}));process.exitCode=1;}
finally {clearTimeout(deadline);if(client)await client.close();}
