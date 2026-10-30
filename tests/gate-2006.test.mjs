import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
import {buildMock,paperCoverage,publicQuestion,gradeAttempt,validateAttemptState} from '../src/lib/gatemock.mjs';
import {questionAssetPaths} from '../src/lib/year-paper-assets.mjs';
const paper=JSON.parse(await fs.readFile(new URL('../data/papers/gate-cs-2006.json',import.meta.url),'utf8')),qs=paper.questions;
const state=responses=>({responses,currentIndex:0,visited:[],marked:[]});
test('2006 source identity, historical counts, common data and linked dependencies',()=>{
 assert.equal(validateYearPaper(paper),paper);assert.equal(qs.length,85);assert.equal(paper.durationMinutes,180);
 assert.equal(paper.sourceSha256,'8155cf736514df6a162efa0f458ae7484a98a54c54bf3f370769424f34162f36');
 assert.equal(paper.totalMarks,150);assert.equal(qs.filter(q=>q.marks==='1').length,20);
 assert.deepEqual(['one','two','common','linked'].map(s=>qs.filter(q=>q.sectionId===s).length),[20,50,5,10]);
 assert.deepEqual(qs.filter(q=>q.dependsOnKey).map(q=>q.paperQuestionNumber),['77','79','81','83','85']);
 assert.equal(qs.filter(q=>q.source.copiedFrom).length,80);assert.equal(qs.filter(q=>!q.source.copiedFrom).length,5);
 assert.ok(qs.every((q,i)=>q.paperQuestionNumber===String(i+1)&&q.examPaper==='CS'&&!q.sectionLimit&&q.referenceAnswer&&q.answerSources));
 assert.equal(paperCoverage(qs,paper).ready,true);
});
test('2006 literal scan defects, independent corrections, complete keys and active secrecy',async()=>{
 assert.deepEqual(qs.filter(q=>q.manualReview).map(q=>q.paperQuestionNumber),['13','18','24','36','38','39','63','66','69','70','79','83','85']);
 assert.match(qs[12].text,/2i-1/);assert.deepEqual(qs[11].correctOptions,['A']);assert.deepEqual(qs[27].correctOptions,['D']);
 assert.equal(qs[12].optD,'$2^n-1$');assert.equal(qs[17].optC,String.raw`$\sqrt{n}$`);
 assert.deepEqual(qs[52].correctOptions,['D']);assert.equal(qs[84].optA,qs[84].optD);
 assert.match(qs[65].optB,/max/);assert.equal(qs[69].questionType,'MCQ');
 for(const q of qs){assert.doesNotMatch(JSON.stringify(publicQuestion(q,0)),/correctOptions|referenceAnswer|copiedFrom|gateOverflowUrl|answerSources/);for(const asset of questionAssetPaths(q))await fs.access('public/'+asset);}
 const book={...qs[0],datasetId:undefined,key:'book:original'};
 assert.ok(buildMock([book,...qs],{mode:'year',year:'2006',examPaper:'CS'},[paper]).questions.every(q=>q.datasetId===paper.slug));
 assert.deepEqual(buildMock([book,...qs],{mode:'subject',subject:book.subject,count:1,durationMinutes:5}).questions.map(q=>q.key),['book:original']);
});
test('2006 scoring leaves defects pending, applies quarter penalties and gates linked seconds',()=>{
 const all=validateAttemptState(state(qs.map(q=>({key:q.key,value:q.correctOptions.length?q.correctOptions:['A']}))),qs);
 const result=gradeAttempt(qs,all,paper.negativeFraction);assert.equal(result.score,126);assert.equal(result.ungraded,13);
 assert.equal(result.entries.length,85);assert.ok(result.entries.every(e=>e.referenceAnswer));
 const wrong=state([{key:qs[0].key,value:['B']},{key:qs[20].key,value:['B']},{key:qs[75].key,value:['A']},{key:qs[76].key,value:['A']}]);
 const r=gradeAttempt(qs,validateAttemptState(wrong,qs),.25);assert.equal(r.score,-1.25);assert.equal(r.entries[76].earned,0);assert.equal(r.entries[76].status,'linked-ineligible');
 assert.throws(()=>validateAttemptState(state([{key:qs[0].key,value:'written'}]),qs),/option/);
});
test('independent traces: feedback register, Gray code, ternary heap, LRTF and cache',()=>{
 let s=[0,0,0];for(const bit of '100110000')s=[s[1],s[2]^s[0],Number(bit)];assert.equal(s.join(''),'010');
 const minterms=[];for(let n=0;n<16;n++){const h=n^(n>>1),m=(n+1)%16,g=m^(m>>1);if(g&4)minterms.push(h);}assert.deepEqual(minterms.sort((a,b)=>a-b),[2,4,5,6,7,12,13,15]);
 const heap=[9,5,6,8,3,1];for(const x of [7,2,10,4]){heap.push(x);let i=heap.length-1;while(i){const p=Math.floor((i-1)/3);if(heap[p]>=heap[i])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p;}}assert.deepEqual(heap,[10,7,9,8,3,1,5,2,6,4]);
 const remaining=[2,4,8],completed=[];for(let t=0;t<14;t++){let i=remaining.indexOf(Math.max(...remaining));if(--remaining[i]===0)completed[i]=t+1;}assert.deepEqual(completed,[12,13,14]);
 const misses=transpose=>{const cache=Array(256).fill(-1);let total=0;for(let i=0;i<512;i++)for(let j=0;j<512;j++){const block=Math.floor(((transpose?j*512+i:i*512+j)*8)/128),slot=block%256;if(cache[slot]!==block){total++;cache[slot]=block;}}return total;};assert.equal(misses(false),16384);assert.equal(misses(true),262144);
});
