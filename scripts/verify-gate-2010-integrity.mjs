import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {identifyYearPdf,yearPaperProgress} from '../src/lib/gate-year-paper-tracker.mjs';
const require=createRequire(import.meta.url);require('@next/env').loadEnvConfig(process.cwd(),true,{info(){},error(){}});
const {MongoClient,BSON}=require('mongoose').mongo;
const hash=v=>createHash('sha256').update(BSON.EJSON.stringify(v)).digest('hex');
const dir='data/backups/gate-2010',slug='gate-cs-2010';
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
try{
 await client.connect();const db=client.db();
 const chapters=await db.collection('chapters').find({}).sort({_id:1}).toArray(),baseline=BSON.EJSON.parse(await fs.readFile(dir+'/chapters-before.ejson','utf8'));
 const papers=await db.collection('yearpapers').find({}).sort({_id:1}).toArray(),previous=BSON.EJSON.parse(await fs.readFile(dir+'/yearpapers-before.ejson','utf8'));
 const attempts=await db.collection('mockattempts').find({}).sort({_id:1}).toArray(),oldAttempts=BSON.EJSON.parse(await fs.readFile(dir+'/mockattempts-before.ejson','utf8'));
 const selected=papers.filter(p=>p.slug===slug);assert.equal(selected.length,1);
 const disk=JSON.parse(await fs.readFile('data/papers/'+slug+'.json','utf8'));
 const sourceSha256=createHash('sha256').update(await fs.readFile('D:/Gate PYQs Year Wise - PDFs/2010.pdf')).digest('hex');assert.equal(sourceSha256,disk.sourceSha256);
 const {_id,createdAt,updatedAt,...content}=selected[0];
 const report={bookBefore:hash(baseline),bookAfter:hash(chapters),bookUnchanged:hash(baseline)===hash(chapters),bookDocuments:chapters.length,bookQuestions:chapters.reduce((n,c)=>n+c.questions.length,0),sourceSha256,
 otherPapers:previous.filter(p=>p.slug!==slug).map(p=>({slug:p.slug,unchanged:hash(p)===hash(papers.find(q=>String(q._id)===String(p._id)))})),
 existingAttempts:oldAttempts.length,existingAttemptsUnchanged:oldAttempts.every(p=>hash(p)===hash(attempts.find(q=>String(q._id)===String(p._id)))),
 selectedDatasets:selected.length,persistedEqualsDisk:hash(content)===hash(disk),tracker:yearPaperProgress(identifyYearPdf('2010.pdf',sourceSha256),papers)};
 assert.ok(report.bookUnchanged&&report.persistedEqualsDisk&&report.existingAttemptsUnchanged&&report.tracker.complete&&report.otherPapers.every(p=>p.unchanged));
 await fs.writeFile(dir+'/final-integrity.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await client.close();}
