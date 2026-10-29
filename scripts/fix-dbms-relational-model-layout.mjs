// Wrap Q4.23 calculus at existing logical conjunctions without changing its symbols.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {DBMS_RELATIONAL_MODEL_IMPORT as source} from '../data/imports/dbms-relational-model.mjs';
import {recordHash,sourceQuestions} from './lib/cn-tcp-ip-merge.mjs';
const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const {MongoClient,BSON}=require('mongoose').mongo;
const root='data/backups/dbms-relational-model-2026-10-28';
const original=BSON.EJSON.parse(await fs.readFile(`${root}/after.ejson`,'utf8'));
const identity={subject:source.subject,chapter:source.chapter};
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000,connectTimeoutMS:10000});
try {
  await client.connect();const collection=client.db().collection('chapters');
  const before=await collection.findOne(identity);
  const questions=structuredClone(before.questions);
  const changed=[];
  for(const n of [23]) {
    const wanted=source.questions[n-1];
    const index=questions.findIndex(q=>q.id===wanted.id);
    assert.ok(index>=0);
    if(questions[index].text===wanted.text) continue;
    const old=original.questions.find(q=>q.id===wanted.id);
    assert.equal(recordHash(questions[index]),recordHash(old),`Q4.${n} changed; re-review before repair.`);
    assert.equal(questions[index].source.sha256,source.sourceHash);
    assert.equal(questions[index].source.questionNumber,'4.23');
    questions[index].text=wanted.text;changed.push(`4.${n}`);
  }
  if(changed.length) {
    const backup=`${root}/before-latex-fix-${new Date().toISOString().replace(/[:.]/g,'-')}.ejson`;
    await fs.writeFile(backup,BSON.EJSON.stringify(before,null,2),{flag:'wx'});
    await fs.writeFile(backup+'.sha256',createHash('sha256').update(await fs.readFile(backup)).digest('hex')+'\n',{flag:'wx'});
    const result=await collection.updateOne({_id:before._id,updatedAt:before.updatedAt,questions:before.questions,lockCount:before.lockCount},{$set:{questions,updatedAt:new Date()}});
    assert.equal(result.matchedCount,1,'Concurrent edit detected; no repair applied.');
    const after=await collection.findOne(identity);
    assert.deepEqual(after.questions,questions);assert.equal(after.lockCount,before.lockCount);
    assert.deepEqual(after.questions,source.questions);
    await fs.writeFile(`${root}/after-latex-fix.ejson`,BSON.EJSON.stringify(after,null,2));
    await fs.writeFile(`${root}/verified-source-from-database.json`,JSON.stringify({...identity,questions:sourceQuestions(after,source.sourceHash)},null,2));
    await fs.writeFile(`${root}/latex-fix-result.json`,JSON.stringify({changed,backupFile:backup,concurrentEditProtected:true,allOtherQuestionsPreserved:true},null,2));
    console.log(JSON.stringify({changed,backup,readBackMatchesReviewedSource:true}));
  } else console.log('Already repaired; no database changes.');
} finally {await client.close();}
