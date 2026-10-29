import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
const require=createRequire(import.meta.url);require('@next/env').loadEnvConfig(process.cwd(),true,{info(){},error(){}});
const {MongoClient,BSON}=require('mongoose').mongo;
const slug=process.argv[2];if(!/^gate-(cs|it)-\d{4}(?:-[a-z0-9-]+)?$/.test(slug))throw new Error('Pass a paper slug.');
const paper=validateYearPaper(JSON.parse(await fs.readFile(`data/papers/${slug}.json`,'utf8')));
const dir=`data/backups/gate-${paper.year}`;
const baseline=BSON.EJSON.parse(await fs.readFile(`${dir}/chapters-before.ejson`,'utf8'));
const previous=BSON.EJSON.parse(await fs.readFile(`${dir}/yearpapers-before.ejson`,'utf8'));
const hash=v=>createHash('sha256').update(BSON.EJSON.stringify(v)).digest('hex');
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
try{
 await client.connect();const db=client.db(),books=db.collection('chapters'),papers=db.collection('yearpapers');
 const before=await books.find({}).sort({_id:1}).toArray();
 if(hash(before)!==hash(baseline))throw new Error('Book differs from read-only snapshot. Refusing import.');
 for(const p of previous.filter(p=>p.slug!==slug))if(hash(await papers.findOne({_id:p._id}))!==hash(p))throw new Error(`Previous paper ${p.slug} changed. Refusing import.`);
 const existing=await papers.findOne({slug});
 if(existing){const {_id,createdAt,updatedAt,...saved}=existing;if(hash(saved)!==hash(paper)){
  if(!process.argv.includes('--update-copy'))throw new Error('Different copy exists; pass --update-copy to replace only this year paper.');
  await fs.writeFile(`${dir}/${slug}-${Date.now()}.ejson`,BSON.EJSON.stringify(existing),{flag:'wx'});
  const changed=await papers.replaceOne({_id:existing._id,updatedAt:existing.updatedAt},{...paper,createdAt:existing.createdAt,updatedAt:new Date()});
  if(changed.modifiedCount!==1)throw new Error('Concurrent paper change.');
 }}else await papers.insertOne({...paper,createdAt:new Date(),updatedAt:new Date()});
 const after=await books.find({}).sort({_id:1}).toArray();
 if(hash(before)!==hash(after))throw new Error('Book changed during import. Investigate concurrent writers.');
 const preserved=[];
 for(const p of previous.filter(p=>p.slug!==slug)){if(hash(await papers.findOne({_id:p._id}))!==hash(p))throw new Error(`Previous paper ${p.slug} changed.`);preserved.push(p.slug);}
 const report={slug,collection:'yearpapers',questions:paper.questionCount,copied:paper.questions.filter(q=>q.source.copiedFrom).length,added:paper.questions.filter(q=>!q.source.copiedFrom).length,
  bookDocuments:after.length,bookQuestions:after.reduce((n,c)=>n+c.questions.length,0),bookBefore:hash(before),bookAfter:hash(after),unchangedSinceInitialSnapshot:hash(baseline)===hash(after),previousPapersUnchanged:preserved};
 await fs.writeFile(`${dir}/import-report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await client.close();}
