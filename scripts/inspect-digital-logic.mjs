import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const {MongoClient,BSON}=require('mongoose').mongo;
const deadline=setTimeout(()=>{console.error('Database inspection deadline exceeded');process.exit(2)},45000);
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000,connectTimeoutMS:10000});
try {
  await client.connect();
  const db=client.db();
  const identity={subject:'9. Digital Logic',chapter:'1. Logic Functions and Minimizations'};
  const chapter=await db.collection('chapters').findOne(identity);
  const target=await db.collection('targets').findOne(identity);
  await fs.mkdir('data/backups/digital-logic-functions',{recursive:true});
  await fs.writeFile('data/backups/digital-logic-functions/inspection.ejson',BSON.EJSON.stringify({chapter,target},null,2),{flag:'wx'});
  console.log(JSON.stringify({chapter,target,indexes:await db.collection('chapters').indexes(),targetIndexes:await db.collection('targets').indexes()},null,2));
} catch(error) {console.error(error.name,error.message.replace(/mongodb(?:\+srv)?:\/\/\S+/g,'[database URI]'));process.exitCode=1;}
finally {await client.close();clearTimeout(deadline);}
