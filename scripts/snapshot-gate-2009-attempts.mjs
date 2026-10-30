import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);require('@next/env').loadEnvConfig(process.cwd(),true,{info(){},error(){}});
const {MongoClient,BSON}=require('mongoose').mongo,client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
try{
 await client.connect();const attempts=await client.db().collection('mockattempts').find({}).sort({_id:1}).toArray();
 const file='data/backups/gate-2009/mockattempts-before.ejson';
 try{await fs.writeFile(file,BSON.EJSON.stringify(attempts),{flag:'wx'});await fs.chmod(file,0o444);}catch(e){if(e.code!=='EEXIST')throw e;}
 const baseline=BSON.EJSON.parse(await fs.readFile(file,'utf8'));
 console.log(JSON.stringify({existingAttempts:baseline.length,sha256:createHash('sha256').update(BSON.EJSON.stringify(baseline)).digest('hex')}));
}finally{await client.close();}
