// Guarded data-only layout correction after the first real export exposed Q3.3 overflow.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {DIGITAL_LOGIC_SEQUENTIAL_IMPORT as source} from '../data/imports/digital-logic-sequential.mjs';
const require=createRequire(import.meta.url);require('@next/env').loadEnvConfig(process.cwd());
const {MongoClient,BSON}=require('mongoose').mongo;
const root=path.resolve('data/backups/digital-logic-sequential-2026-10-28');
const reviewed=BSON.EJSON.parse(await fs.readFile(path.join(root,'after.ejson'),'utf8'));
const identity={subject:source.subject,chapter:source.chapter};
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
try {
  await client.connect();const db=client.db();
  const before=await db.collection('chapters').findOne(identity);
  assert.deepEqual(before,reviewed,'Chapter changed after reviewed import; re-review before correction.');
  const proposed=structuredClone(before.questions);
  for(const n of [3,15,32]) {
    const current=before.questions[n-1],incoming=source.questions[n-1];
    assert.equal(current.id,incoming.id);
    const {optLayout:_old,pdfStyle:_style,needsManualOptionFix:_oldFlag,...oldContent}=current;
    const {optLayout:_new,pdfStyle:_newStyle,needsManualOptionFix:_newFlag,...newContent}=incoming;
    assert.deepEqual(oldContent,newContent,'Only the reviewed layout fields may change.');
    proposed[n-1].optLayout=incoming.optLayout;
    if(incoming.pdfStyle) proposed[n-1].pdfStyle=incoming.pdfStyle;
    if(n===32) proposed[n-1].needsManualOptionFix=incoming.needsManualOptionFix;
  }
  if(JSON.stringify(proposed)===JSON.stringify(before.questions)) {console.log('Layout already current; no write.');}
  else {
    const backup=path.join(root,`before-layout-${new Date().toISOString().replace(/[:.]/g,'-')}.ejson`);
    await fs.writeFile(backup,BSON.EJSON.stringify(before,null,2),{flag:'wx'});
    await fs.writeFile(backup+'.sha256',createHash('sha256').update(await fs.readFile(backup)).digest('hex')+'\n',{flag:'wx'});
    const result=await db.collection('chapters').updateOne({_id:before._id,updatedAt:before.updatedAt,questions:before.questions,lockCount:before.lockCount},{$set:{questions:proposed,updatedAt:new Date()}});
    assert.equal(result.matchedCount,1,'Concurrent edit detected; no correction written.');
    const after=await db.collection('chapters').findOne(identity);
    assert.deepEqual(after.questions,proposed);
    assert.equal(after.lockCount,before.lockCount);
    for(const [i,q] of before.questions.entries()) if(![2,14,31].includes(i)) assert.deepEqual(after.questions[i],q);
    await fs.writeFile(path.join(root,'after.ejson'),BSON.EJSON.stringify(after,null,2));
    await fs.writeFile(path.join(root,'verified-source-from-database.json'),JSON.stringify({...identity,questions:after.questions},null,2));
    const changed=before.questions.flatMap((q,i)=>JSON.stringify(q)===JSON.stringify(proposed[i])?[]:[{number:q.source.questionNumber,fields:Object.keys(proposed[i]).filter(field=>JSON.stringify(q[field])!==JSON.stringify(proposed[i][field]))}]);
    await fs.writeFile(backup+'.audit.json',JSON.stringify({backup,changed,allOtherFieldsPreserved:true},null,2));
    console.log(JSON.stringify({backup,readBack:'pass',allOtherFieldsPreserved:true}));
  }
} finally {await client.close();}
