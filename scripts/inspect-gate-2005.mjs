// Full-content search baselines are produced by the shared, read-only inspector.
import './inspect-year-paper.mjs';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url),{MongoClient,BSON}=require('mongoose').mongo;
const directory='data/backups/gate-2005';
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
try{
 await client.connect();const db=client.db(),attempts=await db.collection('mockattempts').find({}).sort({_id:1}).toArray();
 const file=directory+'/mockattempts-before.ejson';
 try{await fs.writeFile(file,BSON.EJSON.stringify(attempts),{flag:'wx'});}catch(e){if(e.code!=='EEXIST')throw e;}
 for(const name of ['chapters','yearpapers','mockattempts'])await fs.chmod(directory+'/'+name+'-before.ejson',0o444);
 const hash=v=>createHash('sha256').update(BSON.EJSON.stringify(v)).digest('hex');
 const report=JSON.parse(await fs.readFile(directory+'/snapshot-report.json','utf8'));
 report.attemptCount=attempts.length;report.attemptSha256=hash(attempts);report.yearpapersSha256=hash(BSON.EJSON.parse(await fs.readFile(directory+'/yearpapers-before.ejson','utf8')));
 await fs.writeFile(directory+'/snapshot-report.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({attemptCount:attempts.length,attemptSha256:hash(attempts),readOnlySnapshots:3}));
}finally{await client.close();}
