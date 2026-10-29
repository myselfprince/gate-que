// Repair only the exact original imported Q2.24 table markup. User edits fail
// closed; this never reconciles a semantic/content conflict automatically.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {DIGITAL_LOGIC_COMBINATIONAL_IMPORT as source} from '../data/imports/digital-logic-combinational.mjs';
const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const {MongoClient,BSON}=require('mongoose').mongo;
const backupDir=path.resolve(process.argv[2]||'data/backups/digital-logic-combinational-2026-10-28');
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
const identity={subject:source.subject,chapter:source.chapter};
const desired=source.questions[23];
try {
  await client.connect();
  const db=client.db();
  const before=await db.collection('chapters').findOne(identity);
  const target=await db.collection('targets').findOne(identity);
  const index=before.questions.findIndex(q=>q.source?.sha256===source.sourceHash&&q.source.questionNumber==='2.24');
  assert.ok(index>=0);
  const old=before.questions[index];
  assert.deepEqual({...old,text:desired.text},desired,'Q2.24 has user edits; review required.');
  if(old.text!==desired.text) {
    const previous=desired.text.replace(String.raw`\text{Inputs}&&&&\text{Outputs}&&`,String.raw`\multicolumn{4}{c|}{\text{Inputs}}&\multicolumn{3}{c}{\text{Outputs}}`);
    assert.equal(old.text,previous,'Unexpected Q2.24 text; review required.');
    const backup=path.join(backupDir,`before-table-preview-fix-${new Date().toISOString().replace(/[:.]/g,'-')}.ejson`);
    await fs.writeFile(backup,BSON.EJSON.stringify({chapter:before,target,sourceHash:source.sourceHash},null,2),{flag:'wx'});
    await fs.writeFile(backup+'.sha256',createHash('sha256').update(await fs.readFile(backup)).digest('hex')+'\n',{flag:'wx'});
    const updated=await db.collection('chapters').updateOne({_id:before._id,updatedAt:before.updatedAt,questions:before.questions,lockCount:before.lockCount},{$set:{[`questions.${index}.text`]:desired.text,updatedAt:new Date()}});
    assert.equal(updated.matchedCount,1,'Concurrent chapter edit; no change applied.');
    console.log(JSON.stringify({question:'2.24',formattingFix:'MathJax-compatible table headings',backup}));
  }
  const after=await db.collection('chapters').findOne(identity);
  const expected=structuredClone(before.questions);expected[index].text=desired.text;
  assert.deepEqual(after.questions,expected);
  assert.equal(after.lockCount,before.lockCount);
  assert.deepEqual(await db.collection('targets').findOne(identity),target);
  await fs.writeFile(path.join(backupDir,'after.ejson'),BSON.EJSON.stringify(after,null,2));
  await fs.writeFile(path.join(backupDir,'verified-source-from-database.json'),JSON.stringify({...identity,questions:after.questions},null,2));
} finally {await client.close();}
