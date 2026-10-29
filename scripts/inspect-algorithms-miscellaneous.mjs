import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const {MongoClient,BSON}=require('mongoose').mongo;
const c=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000,connectTimeoutMS:10000});
const deadline=setTimeout(()=>{console.error('Inspection deadline exceeded');process.exit(2);},30000);
try {
  await c.connect();const db=c.db();
  const chapters=await db.collection('chapters').find({subject:'7. Algorithms'}).toArray();
  console.log(chapters.map(x=>({chapter:x.chapter,count:x.questions.length,lockCount:x.lockCount})));
  const chapter=chapters.find(x=>x.chapter==='6. Miscellaneous Topics')||null;
  const target=await db.collection('targets').findOne({subject:'7. Algorithms',chapter:'6. Miscellaneous Topics'});
  console.log(BSON.EJSON.stringify({chapter,target},null,2));
  await fs.writeFile('tmp/pdfs/algorithms-miscellaneous/inspection.ejson',BSON.EJSON.stringify({chapter,target},null,2));
} finally {clearTimeout(deadline);await c.close();}
