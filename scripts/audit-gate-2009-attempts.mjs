import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);require('@next/env').loadEnvConfig(process.cwd(),true,{info(){},error(){}});
const {MongoClient,BSON}=require('mongoose').mongo,hash=v=>createHash('sha256').update(BSON.EJSON.stringify(v)).digest('hex');
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
try{
 await client.connect();const old=BSON.EJSON.parse(await fs.readFile('data/backups/gate-2009/mockattempts-before.ejson','utf8'));
 const now=await client.db().collection('mockattempts').find({}).sort({_id:1}).toArray();
 const entries=old.map(a=>{const b=now.find(b=>b._id===a._id);return {id:a._id,title:a.title,startedAt:a.startedAt,purgeAt:a.purgeAt,revisionBefore:a.revision,revisionAfter:b?.revision,unchanged:b?hash(a)===hash(b):false,present:Boolean(b),changedFields:b?Object.keys(a).filter(k=>BSON.EJSON.stringify(a[k])!==BSON.EJSON.stringify(b[k])):[]};});
 const report={before:old.length,now:now.length,entries};await fs.writeFile('data/backups/gate-2009/attempt-preservation-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await client.close();}
