import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {DBMS_ER_MODEL_IMPORT as source} from '../data/imports/dbms-er-model.mjs';
const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const {MongoClient,BSON}=require('mongoose').mongo;
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
const identity={subject:source.subject,chapter:source.chapter};
const root='data/backups/dbms-er-model-2026-10-28';
try {
  await client.connect();
  const db=client.db(), collection=db.collection('chapters');
  const before=await collection.findOne(identity);
  const index=before.questions.findIndex(q=>q.id===source.questions[12].id);
  assert.ok(index>=0);
  const expected=structuredClone(source.questions[12]);
  if(before.questions[index].pdfStyle) {
    assert.deepEqual(before.questions[index],expected,'Question changed; re-review required');
    console.log('Already applied');
  } else {
    delete expected.pdfStyle;
    assert.deepEqual(before.questions[index],expected,'Question changed; re-review required');
    const backup=`${root}/before-diagram-size-${new Date().toISOString().replace(/[:.]/g,'-')}.ejson`;
    const bytes=BSON.EJSON.stringify({chapter:before,target:await db.collection('targets').findOne(identity)},null,2);
    await fs.writeFile(backup,bytes,{flag:'wx'});
    await fs.writeFile(backup+'.sha256',createHash('sha256').update(bytes).digest('hex')+'\n',{flag:'wx'});
    const questions=structuredClone(before.questions);
    questions[index].pdfStyle={imageScale:1.5};
    const result=await collection.updateOne({_id:before._id,questions:before.questions,updatedAt:before.updatedAt,lockCount:before.lockCount},{$set:{questions,updatedAt:new Date()}});
    assert.equal(result.matchedCount,1,'Concurrent edit detected');
    const after=await collection.findOne(identity);
    assert.deepEqual(after.questions,questions);
    assert.equal(after.lockCount,before.lockCount);
    await fs.writeFile(`${root}/after.ejson`,BSON.EJSON.stringify(after,null,2));
    await fs.writeFile(`${root}/verified-source-from-database.json`,JSON.stringify({...identity,questions:after.questions},null,2));
    console.log(JSON.stringify({backup,updatedQuestion:'1.13',imageScale:1.5,otherQuestionsUnchanged:true}));
  }
} finally {await client.close();}
