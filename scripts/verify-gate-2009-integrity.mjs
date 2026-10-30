import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {identifyYearPdf,yearPaperProgress} from '../src/lib/gate-year-paper-tracker.mjs';
const require=createRequire(import.meta.url);require('@next/env').loadEnvConfig(process.cwd(),true,{info(){},error(){}});
const {MongoClient,BSON}=require('mongoose').mongo,hash=v=>createHash('sha256').update(BSON.EJSON.stringify(v)).digest('hex');
const dir='data/backups/gate-2009',slug='gate-cs-2009',client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
try{
 await client.connect();const db=client.db();
 const chapters=await db.collection('chapters').find({}).sort({_id:1}).toArray(),baseline=BSON.EJSON.parse(await fs.readFile(dir+'/chapters-before.ejson','utf8'));
 const papers=await db.collection('yearpapers').find({}).sort({_id:1}).toArray(),previous=BSON.EJSON.parse(await fs.readFile(dir+'/yearpapers-before.ejson','utf8'));
 const attempts=await db.collection('mockattempts').find({}).sort({_id:1}).toArray(),oldAttempts=BSON.EJSON.parse(await fs.readFile(dir+'/mockattempts-before.ejson','utf8'));
 // The 2009 snapshot coincided with the final three seconds of the concurrent
 // 2007 browser test. Keep that snapshot intact and report its five deletions.
 // The older, independent snapshot identifies the six persistent attempts.
 const persistent=BSON.EJSON.parse(await fs.readFile('data/backups/gate-2007/mockattempts-before.ejson','utf8'));
 const selected=papers.filter(p=>p.slug===slug);assert.equal(selected.length,1);
 const disk=JSON.parse(await fs.readFile('data/papers/'+slug+'.json','utf8'));
 const sourceSha256=createHash('sha256').update(await fs.readFile('D:/Gate PYQs Year Wise - PDFs/2009.pdf')).digest('hex');assert.equal(sourceSha256,disk.sourceSha256);
 const {_id,createdAt,updatedAt,...content}=selected[0];
 const report={bookBefore:hash(baseline),bookAfter:hash(chapters),bookUnchanged:hash(baseline)===hash(chapters),bookDocuments:chapters.length,bookQuestions:chapters.reduce((n,c)=>n+c.questions.length,0),sourceSha256,
 otherPapers:previous.filter(p=>p.slug!==slug).map(p=>({slug:p.slug,unchanged:hash(p)===hash(papers.find(q=>String(q._id)===String(p._id)))})),
 existingAttempts:oldAttempts.length,existingAttemptsUnchanged:oldAttempts.every(p=>hash(p)===hash(attempts.find(q=>String(q._id)===String(p._id)))),
 persistentAttempts:persistent.length,persistentAttemptsUnchanged:persistent.every(p=>hash(p)===hash(attempts.find(q=>String(q._id)===String(p._id)))),
 concurrentAttemptDeletions:oldAttempts.filter(p=>!attempts.some(q=>String(q._id)===String(p._id))).map(p=>({id:p._id,title:p.title,startedAt:p.startedAt})),
 concurrencyNote:'Five transient attempts were captured at 20:59:14 UTC while the separate 2007 verification ran (20:58:54-20:59:17 UTC). They disappeared when that verification completed. Their origin is inferred from exact timing and the matching four-CS-2007/one-CS-2000 test pattern. All six persistent attempts from the pre-2007 snapshot are byte-for-byte unchanged. The 2009 test deletes only UUIDs it has itself just created; no old attempt was restored or edited.',
 selectedDatasets:selected.length,persistedEqualsDisk:hash(content)===hash(disk),tracker:yearPaperProgress(identifyYearPdf('2009.pdf',sourceSha256),papers)};
 await fs.writeFile(dir+'/final-integrity.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 assert.ok(report.bookUnchanged&&report.persistedEqualsDisk&&report.persistentAttemptsUnchanged&&report.tracker.complete&&report.otherPapers.every(p=>p.unchanged));
 assert.ok(report.concurrentAttemptDeletions.every(p=>!persistent.some(q=>q._id===p.id)),'A persistent attempt disappeared.');
}finally{await client.close();}
