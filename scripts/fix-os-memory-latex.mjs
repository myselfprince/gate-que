// Repair the reviewed Q4.24 hex-address delimiter without replacing user edits.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {OS_MEMORY_IMPORT as source} from '../data/imports/os-memory.mjs';
import {recordHash,sourceQuestions} from './lib/cn-tcp-ip-merge.mjs';
const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const {MongoClient,BSON}=require('mongoose').mongo;
const root='data/backups/os-memory-2026-10-28';
const original=BSON.EJSON.parse(await fs.readFile(`${root}/after.ejson`,'utf8'));
const identity={subject:source.subject,chapter:source.chapter};
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000,connectTimeoutMS:10000});
try {
  await client.connect();const collection=client.db().collection('chapters');
  const before=await collection.findOne(identity);
  const index=before.questions.findIndex(q=>q.id==='madeeasy-os-memory-24');
  assert.ok(index>=0);
  const wanted=source.questions[23];
  if(before.questions[index].text!==wanted.text) {
    assert.equal(recordHash(before.questions[index]),recordHash(original.questions[23]),'Q4.24 changed; re-review before repair.');
    assert.equal(before.questions[index].text.replace('\\timesFFFFF000','\\times\\mathrm{FFFFF000}'),wanted.text);
    const backup=`${root}/before-latex-fix-${new Date().toISOString().replace(/[:.]/g,'-')}.ejson`;
    await fs.writeFile(backup,BSON.EJSON.stringify(before,null,2),{flag:'wx'});
    await fs.writeFile(backup+'.sha256',createHash('sha256').update(await fs.readFile(backup)).digest('hex')+'\n',{flag:'wx'});
    const questions=structuredClone(before.questions);questions[index].text=wanted.text;
    const result=await collection.updateOne({_id:before._id,updatedAt:before.updatedAt,questions:before.questions,lockCount:before.lockCount},{$set:{questions,updatedAt:new Date()}});
    assert.equal(result.matchedCount,1,'Concurrent edit detected; no repair applied.');
    const after=await collection.findOne(identity);
    assert.deepEqual(after.questions,questions);assert.equal(after.lockCount,before.lockCount);
    await fs.writeFile(`${root}/after-latex-fix.ejson`,BSON.EJSON.stringify(after,null,2));
    await fs.writeFile(`${root}/verified-source-from-database.json`,JSON.stringify({...identity,questions:sourceQuestions(after,source.sourceHash)},null,2));
    await fs.writeFile(`${root}/latex-fix-result.json`,JSON.stringify({question:'4.24',backupFile:backup,concurrentEditProtected:true,allOtherQuestionsPreserved:true},null,2));
    console.log('Q4.24 LaTeX repaired; all other records and locks preserved. Backup: '+backup);
  } else console.log('Q4.24 already repaired; no changes.');
} finally {await client.close();}
