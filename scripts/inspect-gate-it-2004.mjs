import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd(),true,{info(){},error(){}});
const {MongoClient,BSON}=require('mongoose').mongo;
const out='data/backups/gate-it-2004';
await fs.mkdir(out,{recursive:true});
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
const hash=v=>createHash('sha256').update(BSON.EJSON.stringify(v)).digest('hex');
try {
 await client.connect();const db=client.db();
 const chapters=await db.collection('chapters').find({}).sort({_id:1}).toArray();
 const papers=await db.collection('yearpapers').find({}).sort({_id:1}).toArray();
 const attempts=await db.collection('mockattempts').find({}).sort({_id:1}).toArray();
 for(const [name,docs] of [['chapters',chapters],['yearpapers',papers],['mockattempts',attempts]]){
  const file=`${out}/${name}-before.ejson`;
  try{await fs.writeFile(file,BSON.EJSON.stringify(docs),{flag:'wx'});await fs.chmod(file,0o444);}
  catch(e){if(e.code!=='EEXIST')throw e;if(hash(BSON.EJSON.parse(await fs.readFile(file,'utf8')))!==hash(docs))throw new Error(`Existing ${name} snapshot differs; preserve and investigate.`);}
 }
 const all=chapters.flatMap(c=>(c.questions||[]).map(q=>({...q,chapterId:String(c._id),subject:c.subject,chapter:c.chapter})));
 const questions=all.filter(q=>String(q.year).includes('2004'));
 await fs.writeFile(`${out}/book-2004.json`,JSON.stringify(questions,null,2));
 await fs.writeFile(`${out}/book-search.json`,JSON.stringify(all,null,2));
 const report={bookDocuments:chapters.length,bookQuestions:all.length,yearTagged:questions.length,bookSha256:hash(chapters),yearpapersSha256:hash(papers),papers:papers.map(p=>({slug:p.slug,count:p.questionCount})),attemptCount:attempts.length,attemptSha256:hash(attempts)};
 await fs.writeFile(`${out}/snapshot-report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await client.close();}
const reference=JSON.parse(await fs.readFile('E:/G4Gate_Platform/gate-pyq-find/public/data/questions.json','utf8')).filter(q=>String(q.year).includes('2004'));
await fs.writeFile(`${out}/reference-2004.json`,JSON.stringify(reference,null,2));
console.log(JSON.stringify({referenceCacheCount:reference.length,example:reference[0]}));
