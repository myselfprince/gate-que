import './inspect-year-paper.mjs';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url),{MongoClient,BSON}=require('mongoose').mongo;
const dir='data/backups/gate-2010',client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
try {
 await client.connect();const rows=await client.db().collection('mockattempts').find({}).sort({_id:1}).toArray();
 await fs.writeFile(dir+'/mockattempts-before.ejson',BSON.EJSON.stringify(rows),{flag:'wx'}).catch(e=>{if(e.code!=='EEXIST')throw e;});
 for(const name of ['chapters','yearpapers','mockattempts'])await fs.chmod(`${dir}/${name}-before.ejson`,0o444);
 const report=JSON.parse(await fs.readFile(dir+'/snapshot-report.json','utf8'));
 report.attemptCount=rows.length;report.attemptSha256=createHash('sha256').update(BSON.EJSON.stringify(rows)).digest('hex');
 await fs.writeFile(dir+'/snapshot-report.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({attempts:rows.length,readOnlySnapshots:3}));
} finally {await client.close();}
