import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
import {buildMock,paperCoverage,publicQuestion,gradeAttempt,validateAttemptState} from '../src/lib/gatemock.mjs';
import {questionAssetPaths} from '../src/lib/year-paper-assets.mjs';
const paper=JSON.parse(await fs.readFile(new URL('../data/papers/gate-cs-2009.json',import.meta.url),'utf8')),qs=paper.questions;
const state=responses=>({responses,currentIndex:0,visited:[],marked:[]});
test('2009 exact source identity, all positions, actual sections and official linked rules',()=>{
 assert.equal(validateYearPaper(paper),paper);assert.equal(qs.length,60);assert.equal(paper.totalMarks,100);assert.equal(paper.durationMinutes,180);assert.equal(paper.negativeFraction,1/3);
 assert.equal(paper.sourceSha256,'d260584d7a0fdd14f3c7bd262e3e48c25eb6b2f75fe4df8889993b1b1c41b83a');
 assert.deepEqual(['one','two','common','linked'].map(s=>qs.filter(q=>q.sectionId===s).length),[20,30,6,4]);
 assert.deepEqual(qs.filter(q=>q.dependsOnKey).map(q=>[q.paperQuestionNumber,q.negativeFraction]),[['58',0],['60',0]]);
 assert.equal(qs.filter(q=>q.source.copiedFrom).length,55);assert.equal(qs.filter(q=>!q.source.copiedFrom).length,5);
 assert.ok(qs.every((q,i)=>q.paperQuestionNumber===String(i+1)&&q.questionType==='MCQ'&&q.examPaper==='CS'&&q.setNum===''&&!q.sectionLimit&&q.referenceAnswer&&q.answerSources.length>=2));
 assert.equal(paperCoverage(qs,paper).ready,true);
 assert.deepEqual(qs.filter(q=>q.manualReview).map(q=>q.paperQuestionNumber),['28','44','45','47','50','55','58']);
});
test('2009 source corrections and independently stored assets expose no active answer material',async()=>{
 assert.match(qs[7].optB,/fetch cycle/);assert.equal(qs[32].optC,'I and III');assert.match(qs[22].optB,/G\(x\).*S\(x\).*P\(x\)/);
 assert.equal(qs[26].source.copiedFrom.questionId,'madeeasy-digital-logic-sequential-3-21');assert.match(qs[54].optC,/only blue/);
 assert.equal(qs[48].optB,'I, II and IV');assert.deepEqual(qs[42].correctOptions,['B']);
 for(const q of qs){assert.doesNotMatch(JSON.stringify(publicQuestion(q,0)),/correctOptions|referenceAnswer|copiedFrom|gateOverflowUrl|answerSources/);for(const asset of questionAssetPaths(q)){assert.match(asset,/Year Papers\/GATE CS 2009\//);await fs.access('public/'+asset);}}
 const book={...qs[0],datasetId:undefined,key:'book:original'};
 assert.ok(buildMock([book,...qs],{mode:'year',year:'2009',examPaper:'CS'},[paper]).questions.every(q=>q.datasetId===paper.slug));
 assert.deepEqual(buildMock([book,...qs],{mode:'subject',subject:book.subject,count:1,durationMinutes:5}).questions.map(q=>q.key),['book:original']);
});
test('2009 automatic maximum, one-third penalties, linked eligibility and manual review',()=>{
 const all=validateAttemptState(state(qs.map(q=>({key:q.key,value:q.correctOptions}))),qs),r=gradeAttempt(qs,all,paper.negativeFraction);
 assert.equal(r.score,86);assert.equal(r.ungraded,7);assert.equal(r.entries.length,60);assert.ok(r.entries.every(e=>e.referenceAnswer));
 const wrong=state([{key:qs[0].key,value:['B']},{key:qs[20].key,value:['A']},{key:qs[56].key,value:['A']},{key:qs[57].key,value:['C']},{key:qs[58].key,value:['A']},{key:qs[59].key,value:['D']}]);
 const w=gradeAttempt(qs,validateAttemptState(wrong,qs),1/3);assert.equal(w.score,-2.3333);assert.equal(w.entries[57].status,'linked-ineligible');assert.equal(w.entries[59].status,'linked-ineligible');
 const assessed=gradeAttempt(qs,all,1/3,[{key:qs[57].key,marks:1.5}]);assert.equal(assessed.score,87.5);assert.equal(assessed.entries[57].status,'self-assessed');
 const blocked=gradeAttempt(qs,wrong,1/3,[{key:qs[57].key,marks:2}]);assert.equal(blocked.entries[57].earned,0);
 const secondWrong=gradeAttempt(qs,state([{key:qs[58].key,value:['C']},{key:qs[59].key,value:['A']}]),1/3);assert.equal(secondWrong.score,2);assert.equal(secondWrong.entries[59].earned,0);
 assert.throws(()=>validateAttemptState(state([{key:qs[0].key,value:'written'}]),qs),/option/);
});
test('independent program trace, FSM shortest input, cache LRU and SSTF calculations',()=>{
 const ptr={v:15};function f(n){if(n<=1){ptr.v=1;return 1;}const t=f(n-1),r=t+ptr.v;ptr.v=t;return r;}assert.equal(f(5),8);
 const transitions=[[[0,1],[1,0]],[[2,0],[0,1]],[[1,0],[1,1]],[[2,0],[0,1]]];
 let frontier=[[0,'']],found;for(let d=1;d<5&&!found;d++){const next=[];for(const [s,input] of frontier)for(const bit of [0,1]){const [t,o]=transitions[s][bit];if(t===1&&o===1&&!found)found=input+bit;next.push([t,input+bit]);}frontier=next;}assert.equal(found,'101');
 const sets=Array.from({length:4},()=>[]);for(const x of [0,255,1,4,3,8,133,159,216,129,63,8,48,32,73,92,155]){const s=sets[x%4],i=s.indexOf(x);if(i>=0)s.splice(i,1);s.push(x);if(s.length>4)s.shift();}assert.deepEqual([3,8,129,216].map(x=>sets[x%4].includes(x)),[true,true,true,false]);
 let head=50,time=0,pending=[4,34,10,7,19,73,2,15,6,20];while(pending.length){pending.sort((a,b)=>Math.abs(a-head)-Math.abs(b-head));const x=pending.shift();time+=Math.abs(x-head);head=x;}assert.equal(time,119);
});
test('independent same-item conflict graphs confirm S2 and S3 only',()=>{
 const schedules=['R1x R2x R2y W1x W1y W2y','R1x R2x R2y W1x W2y W1y','R1x W1x R2x W1y R2y W2y','R2x R2y R1x W1x W1y W2y'];
 const edges=schedules.map(s=>{const a=s.split(' '),e=new Set();for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(a[i][1]!==a[j][1]&&a[i][2]===a[j][2]&&(a[i][0]==='W'||a[j][0]==='W'))e.add(a[i][1]+a[j][1]);return [...e].sort();});
 assert.deepEqual(edges,[['12','21'],['21'],['12'],['12','21']]);
});
test('independent B+ insertion exposes separator conventions rather than forcing a disputed key',()=>{
 const count=(leftSize,upper)=>{const leaves=[[]],splits=[];for(const k of [10,3,6,8,4,2,1]){let i=upper?leaves.findIndex(l=>l.at(-1)>=k):leaves.findIndex((_,j)=>j===leaves.length-1||k<leaves[j+1][0]);if(i<0)i=leaves.length-1;const l=leaves[i];l.push(k);l.sort((a,b)=>a-b);if(l.length>2){leaves.splice(i,1,l.slice(0,leftSize),l.slice(leftSize));splits.push(k);}}return splits;};
 assert.deepEqual(count(2,true),[6,4,2,1]);assert.deepEqual(count(2,false),[6,8,4,2,1]);assert.equal(count(1,false).length,3);assert.equal(qs[43].manualReview,true);
});
test('independent pipeline end-time matrix and source numerical results',()=>{
 const times=[[2,1,1,1],[1,3,2,2],[2,1,1,3],[1,2,2,2]],end=Array(4).fill(0);
 for(let i=0;i<8;i++)for(let j=0;j<4;j++)end[j]=Math.max(end[j],j?end[j-1]:0)+times[i%4][j];assert.equal(end[3],23);
 assert.ok(Math.abs((20/57)/.75-.468)<.001);assert.equal(parseInt('1217',8),parseInt('028f',16));
 assert.equal((400*20+16)*63+29,505037);assert.deepEqual([Math.floor(1039/63),1039%63],[16,31]);assert.equal(Math.ceil(Math.log2(25)),5);assert.equal(2*(25+1)-32,20);
 const h=[25,14,16,13,10,8,12];for(let k=0;k<2;k++){h[0]=h.pop();let i=0;for(;;){let j=2*i+1;if(j>=h.length)break;if(j+1<h.length&&h[j+1]>h[j])j++;if(h[i]>=h[j])break;[h[i],h[j]]=[h[j],h[i]];i=j;}}assert.deepEqual(h,[14,13,12,8,10]);
});
test('SQL counterexample distinguishes no-blue suppliers from literal source option D',()=>{
 const suppliers=['none','red','blue','mixed'],catalog=[['red','r'],['blue','b'],['mixed','r'],['mixed','b']],nonBlue=new Set(['r']);
 const excluded=new Set(catalog.filter(([,pid])=>!nonBlue.has(pid)).map(([sid])=>sid));
 const selected=suppliers.filter(s=>!excluded.has(s));assert.deepEqual(selected,['none','red']);assert.ok(!selected.includes('mixed'));assert.equal(qs[54].manualReview,true);
});
