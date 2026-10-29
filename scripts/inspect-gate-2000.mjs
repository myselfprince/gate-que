import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const {MongoClient,BSON}=require('mongoose').mongo;
const out='data/backups/gate-2000';
await fs.mkdir(out,{recursive:true});
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
try {
 await client.connect();
 const db=client.db();
 const chapters=await db.collection('chapters').find({}).sort({_id:1}).toArray();
 const serialized=BSON.EJSON.stringify(chapters);
 const digest=createHash('sha256').update(serialized).digest('hex');
 await fs.writeFile(`${out}/chapters-before.ejson`,serialized,{flag:'wx'}).catch(e=>{if(e.code!=='EEXIST')throw e;});
 const questions=chapters.flatMap(c=>(c.questions||[]).filter(q=>String(q.year).includes('2000')).map(q=>({...q,chapterId:String(c._id),subject:c.subject,chapter:c.chapter})));
 await fs.writeFile(`${out}/book-2000.json`,JSON.stringify(questions,null,2));
 console.log(JSON.stringify({chapters:chapters.length,questions:chapters.reduce((n,c)=>n+c.questions.length,0),gate2000:questions.length,digest,collections:(await db.listCollections().toArray()).map(c=>c.name),examples:questions.slice(0,2)},null,2));
}finally{await client.close();}
// The finder project's local cache is complete and needs no database credentials.
const reference=JSON.parse(await fs.readFile('E:/G4Gate_Platform/gate-pyq-find/public/data/questions.json','utf8'))
 .filter(q=>String(q.year).includes('2000'));
await fs.writeFile(`${out}/reference-2000.json`,JSON.stringify(reference,null,2));
console.log(JSON.stringify({referenceCacheCount:reference.length}));
