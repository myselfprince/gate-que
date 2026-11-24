import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);require('@next/env').loadEnvConfig(process.cwd(),true,{info(){},error(){}});
const {MongoClient,BSON}=require('mongoose').mongo,base='data/backups/gate-2012';
const hash=x=>createHash('sha256').update(BSON.EJSON.stringify(x)).digest('hex');
const dir=`${base}/resume-${new Date().toISOString().replace(/[:.]/g,'-')}`;await fs.mkdir(dir,{recursive:true});
const dbClient=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
try{
 await dbClient.connect();const db=dbClient.db(),report={snapshotDirectory:dir,collections:{}};
 for(const name of ['chapters','yearpapers','mockattempts']){
  const rows=await db.collection(name).find({}).sort({_id:1}).toArray();
  const file=`${dir}/${name}-before.ejson`;await fs.writeFile(file,BSON.EJSON.stringify(rows),{flag:'wx'});await fs.chmod(file,0o444);
  const old=BSON.EJSON.parse(await fs.readFile(`${base}/${name}-before.ejson`,'utf8'));
  const changed=old.filter(p=>hash(p)!==hash(rows.find(q=>String(q._id)===String(p._id))));
  report.collections[name]={documents:rows.length,questions:rows.reduce((s,r)=>s+(r.questions?.length||0),0),sha256:hash(rows),originalSha256:hash(old),changedOldDocuments:changed.map(p=>p.slug||String(p._id)),addedDocuments:rows.filter(p=>!old.some(q=>String(p._id)===String(q._id))).map(p=>p.slug||String(p._id))};
  if(name==='yearpapers'){
   const paper=rows.find(p=>p.slug==='gate-cs-2012'),disk=JSON.parse(await fs.readFile('data/papers/gate-cs-2012.json','utf8'));const {_id,createdAt,updatedAt,...content}=paper;
   report.paperEqualsDisk=hash(content)===hash(disk);report.paperMetadataFields=Object.keys({...content,...disk}).filter(k=>k!=='questions'&&hash(content[k])!==hash(disk[k]));
   report.paperDifferences=paper.questions.flatMap((q,i)=>{const d=disk.questions[i];const fields=Object.keys({...q,...d}).filter(k=>hash(q[k])!==hash(d[k]));return fields.length?[{number:i+1,fields,values:Object.fromEntries(fields.map(k=>[k,{database:q[k],disk:d[k]}]))}]:[];});
  }
 }
 await fs.writeFile(`${dir}/audit.json`,JSON.stringify(report,null,2));await fs.writeFile(`${base}/resume-audit-latest.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await dbClient.close();}
