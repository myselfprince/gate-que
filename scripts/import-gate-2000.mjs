import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd(),true,{info(){},error(){}});
const {MongoClient,BSON}=require('mongoose').mongo;
const paper=validateYearPaper(JSON.parse(await fs.readFile('data/papers/gate-cs-2000.json','utf8')));
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
const hash=value=>createHash('sha256').update(BSON.EJSON.stringify(value)).digest('hex');
try{
 await client.connect();const db=client.db();
 const before=await db.collection('chapters').find({}).sort({_id:1}).toArray();
 const collection=db.collection('yearpapers');
 await collection.createIndex({slug:1},{unique:true});
 await collection.createIndex({year:1,examPaper:1,setNum:1},{unique:true});
 const existing=await collection.findOne({slug:paper.slug});
 if(existing){
  const {_id,createdAt,updatedAt,...saved}=existing;
  if(hash(saved)!==hash(paper)){
   if(!process.argv.includes('--update-copy'))throw new Error('A different paper copy already exists; refusing to overwrite it without --update-copy.');
   await fs.writeFile(`data/backups/gate-2000/yearpaper-${Date.now()}.ejson`,BSON.EJSON.stringify(existing));
   const changed=await collection.replaceOne({_id:existing._id,updatedAt:existing.updatedAt},{...paper,createdAt:existing.createdAt,updatedAt:new Date()});
   if(changed.modifiedCount!==1)throw new Error('The year copy changed concurrently; refresh and retry.');
  }
 }else await collection.insertOne({...paper,createdAt:new Date(),updatedAt:new Date()});
 const after=await db.collection('chapters').find({}).sort({_id:1}).toArray();
 if(hash(before)!==hash(after))throw new Error('Book collection changed during import; investigate concurrent writers.');
 const baseline=BSON.EJSON.parse(await fs.readFile('data/backups/gate-2000/chapters-before.ejson','utf8'));
 const report={collection:'yearpapers',slug:paper.slug,questions:paper.questions.length,bookQuestions:after.reduce((n,c)=>n+c.questions.length,0),bookBefore:hash(before),bookAfter:hash(after),unchangedSinceInitialSnapshot:hash(baseline)===hash(after),inserted:!existing};
 await fs.writeFile('data/backups/gate-2000/import-report.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
}finally{await client.close();}
