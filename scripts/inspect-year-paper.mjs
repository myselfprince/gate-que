import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd(),true,{info(){},error(){}});
const {MongoClient,BSON}=require('mongoose').mongo;
const year=process.argv[2];
if(!/^\d{4}$/.test(year))throw new Error('Usage: node scripts/inspect-year-paper.mjs YEAR');
const out=`data/backups/gate-${year}`;
await fs.mkdir(out,{recursive:true});
const hash=value=>createHash('sha256').update(BSON.EJSON.stringify(value)).digest('hex');
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
try{
 await client.connect();const db=client.db();
 const chapters=await db.collection('chapters').find({}).sort({_id:1}).toArray();
 const previous=await db.collection('yearpapers').find({}).sort({_id:1}).toArray();
 const snapshot=`${out}/chapters-before.ejson`;
 try{await fs.writeFile(snapshot,BSON.EJSON.stringify(chapters),{flag:'wx'});await fs.chmod(snapshot,0o444);}catch(e){if(e.code!=='EEXIST')throw e;}
 const baseline=BSON.EJSON.parse(await fs.readFile(snapshot,'utf8'));
 if(hash(baseline)!==hash(chapters))throw new Error('Book differs from this inspection baseline. Preserve and investigate.');
 await fs.writeFile(`${out}/yearpapers-before.ejson`,BSON.EJSON.stringify(previous),{flag:'wx'}).catch(e=>{if(e.code!=='EEXIST')throw e;});
 const all=chapters.flatMap(c=>(c.questions||[]).map(q=>({...q,chapterId:String(c._id),subject:c.subject,chapter:c.chapter})));
 await fs.writeFile(`${out}/book-${year}.json`,JSON.stringify(all.filter(q=>String(q.year).includes(year)),null,2));
 await fs.writeFile(`${out}/book-search.json`,JSON.stringify(all));
 const report={chapters:chapters.length,questions:all.length,yearTagged:all.filter(q=>String(q.year).includes(year)).length,sha256:hash(chapters),previousPapers:previous.map(p=>({slug:p.slug,sha256:hash(p)}))};
 await fs.writeFile(`${out}/snapshot-report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await client.close();}
const reference=JSON.parse(await fs.readFile('E:/G4Gate_Platform/gate-pyq-find/public/data/questions.json','utf8')).filter(q=>String(q.year).includes(year));
await fs.writeFile(`${out}/reference-${year}.json`,JSON.stringify(reference,null,2));
console.log(JSON.stringify({referenceCacheCount:reference.length,examples:reference.slice(0,2)}));
