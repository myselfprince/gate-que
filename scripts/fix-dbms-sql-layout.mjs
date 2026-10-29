import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {DBMS_SQL_IMPORT as source} from '../data/imports/dbms-sql.mjs';
const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const {MongoClient,BSON}=require('mongoose').mongo;
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
const identity={subject:source.subject,chapter:source.chapter};
const root='data/backups/dbms-sql-2026-10-28';
try {
  await client.connect();
  const db=client.db(),collection=db.collection('chapters');
  const before=await collection.findOne(identity);
  const reviewed=JSON.parse(await fs.readFile(`${root}/verified-source-from-database.json`,'utf8'));
  assert.deepEqual(before.questions,reviewed.questions,'Concurrent edit; review required before layout repair');
  assert.equal(before.questions.length,42);
  const questions=structuredClone(before.questions);
  const changed=[];
  for(const n of [11,15,16,25,26,31,38,39,41]) {
    const i=questions.findIndex(q=>q.id===source.questions[n-1].id);
    assert.ok(i>=0);
    assert.deepEqual({...questions[i],text:source.questions[n-1].text},source.questions[n-1],'Only reviewed table layout may change');
    if(questions[i].text!==source.questions[n-1].text){questions[i].text=source.questions[n-1].text;changed.push(n);}
  }
  if(changed.length) {
    const backup=`${root}/before-layout-${new Date().toISOString().replace(/[:.]/g,'-')}.ejson`;
    const bytes=BSON.EJSON.stringify({chapter:before,target:await db.collection('targets').findOne(identity)},null,2);
    await fs.writeFile(backup,bytes,{flag:'wx'});
    await fs.writeFile(backup+'.sha256',createHash('sha256').update(bytes).digest('hex')+'\n',{flag:'wx'});
    const result=await collection.updateOne({_id:before._id,questions:before.questions,updatedAt:before.updatedAt,lockCount:before.lockCount},{$set:{questions,updatedAt:new Date()}});
    assert.equal(result.matchedCount,1,'Concurrent edit detected');
    console.log(JSON.stringify({backup,changed,onlyTableLayoutChanged:true}));
  }
  const after=await collection.findOne(identity);
  assert.deepEqual(after.questions,source.questions);
  assert.equal(after.lockCount,before.lockCount);
  await fs.writeFile(`${root}/after.ejson`,BSON.EJSON.stringify(after,null,2));
  await fs.writeFile(`${root}/verified-source-from-database.json`,JSON.stringify({...identity,questions:after.questions},null,2));
} finally {await client.close();}
