// Align all Q5.28 option fractions without replacing any edited record.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {PROBABILITY_IMPORT as source} from '../data/imports/maths-probability.mjs';
import {recordHash,sourceQuestions} from './lib/cn-tcp-ip-merge.mjs';
const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const {MongoClient,BSON}=require('mongoose').mongo;
const root='data/backups/maths-probability-2026-10-28';
const original=BSON.EJSON.parse(await fs.readFile(`${root}/after.ejson`,'utf8'));
const identity={subject:source.subject,chapter:source.chapter};
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000,connectTimeoutMS:10000});
try {
  await client.connect();const db=client.db(),collection=db.collection('chapters');
  const before=await collection.findOne(identity);
  const targetBefore=await db.collection('targets').findOne(identity);
  const questions=structuredClone(before.questions);
  const wanted=source.questions[27],index=questions.findIndex(q=>q.id===wanted.id);
  assert.ok(index>=0);
  if(questions[index].optA===wanted.optA && questions[index].optD===wanted.optD) {
    console.log('Already aligned; no database changes.');
  } else {
    assert.equal(recordHash(questions[index]),recordHash(original.questions[27]),'Q5.28 changed; re-review before repair.');
    for(const field of ['optA','optD']) {
      assert.equal(questions[index][field].replace(/^\$/,'$\\displaystyle '),wanted[field]);
      questions[index][field]=wanted[field];
    }
    const backup=`${root}/before-typography-fix-${new Date().toISOString().replace(/[:.]/g,'-')}.ejson`;
    await fs.writeFile(backup,BSON.EJSON.stringify(before,null,2),{flag:'wx'});
    await fs.writeFile(backup+'.sha256',createHash('sha256').update(await fs.readFile(backup)).digest('hex')+'\n',{flag:'wx'});
    const result=await collection.updateOne({_id:before._id,updatedAt:before.updatedAt,questions:before.questions,lockCount:before.lockCount},{$set:{questions,updatedAt:new Date()}});
    assert.equal(result.matchedCount,1,'Concurrent edit detected; no repair applied.');
    const after=await collection.findOne(identity);
    assert.deepEqual(after.questions,questions);assert.equal(after.lockCount,before.lockCount);
    assert.deepEqual(await db.collection('targets').findOne(identity),targetBefore);
    await fs.writeFile(`${root}/after-typography-fix.ejson`,BSON.EJSON.stringify(after,null,2));
    await fs.writeFile(`${root}/verified-source-from-database.json`,JSON.stringify({...identity,questions:sourceQuestions(after,source.sourceHash)},null,2));
    await fs.writeFile(`${root}/typography-fix-result.json`,JSON.stringify({question:'5.28',fields:['optA','optD'],backupFile:backup,concurrentEditProtected:true,allOtherQuestionsPreserved:true,targetUnchanged:true},null,2));
    console.log('Q5.28 typography aligned; all other records, target and locks preserved. Backup: '+backup);
  }
} finally {await client.close();}
