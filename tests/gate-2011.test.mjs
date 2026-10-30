import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
import {buildMock,paperCoverage,publicQuestion,gradeAttempt,validateAttemptState} from '../src/lib/gatemock.mjs';
import {questionAssetPaths} from '../src/lib/year-paper-assets.mjs';
const paper=JSON.parse(await fs.readFile(new URL('../data/papers/gate-cs-2011.json',import.meta.url),'utf8')),qs=paper.questions;
const state=responses=>({responses,currentIndex:0,visited:[],marked:[]});
test('2011 booklet A source, full coverage, original sections and independent copies',()=>{
 assert.equal(validateYearPaper(paper),paper);assert.equal(qs.length,65);assert.equal(paper.totalMarks,100);assert.equal(paper.durationMinutes,180);
 assert.equal(paper.sourceSha256,'d84d37b374ed77906a34c410f7fba96af7127808b7697466a0183aa4f82b3acc');
 assert.deepEqual(['one','two','common','linked','aptitude'].map(s=>qs.filter(q=>q.sectionId===s).length),[25,22,4,4,10]);
 assert.equal(qs.filter(q=>q.marks==='1').length,30);assert.equal(qs.slice(55).reduce((s,q)=>s+Number(q.marks),0),15);
 assert.equal(qs.filter(q=>q.source.copiedFrom).length,47);assert.equal(qs.filter(q=>!q.source.copiedFrom).length,18);
 assert.deepEqual(qs.filter(q=>q.dependsOnKey).map(q=>q.paperQuestionNumber),['53','55']);
 assert.ok(qs.every((q,i)=>q.paperQuestionNumber===String(i+1)&&q.originalLabel===String(i+1)&&q.examPaper==='CS'&&!q.setNum&&!q.sectionLimit&&q.source.bookletCode==='A'&&q.referenceAnswer));
 assert.ok(qs.every(q=>q.answerSources.find(s=>s.kind==='historical-key-mirror')?.printed===q.correctOptions[0]));
 assert.equal(paperCoverage(qs,paper).ready,true);
});
test('2011 selected scan restorations, documented disputes and complete independent assets',async()=>{
 assert.deepEqual(qs.filter(q=>q.manualReview).map(q=>q.paperQuestionNumber),['2','22','59','60','62']);
 assert.match(qs[21].code,/^Char c/);
 assert.equal(qs[21].optD,'011');assert.match(qs[24].text,/L_\{n-1\}/);assert.doesNotMatch(qs[24].text,/n\+1/);
 assert.match(qs[27].text,/approximate speedup/);assert.match(qs[27].code,/Decrement the count/);
 assert.match(qs[51].text,/\\mathrm\{N5\}/);assert.doesNotMatch(qs[52].text,/Previous question|Q4\./);
 assert.equal(qs[16].optC,'Q3 is planar while K3 is not');
 assert.deepEqual([13,16,17].map(i=>qs[i].source.copiedFrom.year),['2010','2010','2010']);
 assert.equal(paper.assetManifest.files.length,24);
 for(const q of qs){assert.doesNotMatch(JSON.stringify(publicQuestion(q,0)),/correctOptions|referenceAnswer|copiedFrom|gateOverflowUrl|answerSources|sourceSha256/);for(const asset of questionAssetPaths(q))await fs.access('public/'+asset);}
 const bytes=await fs.readFile('public/Year Papers/GATE CS 2011/2011.pdf');assert.equal(createHash('sha256').update(bytes).digest('hex'),paper.sourceSha256);
});
test('2011 isolation, exact ordering, saved MCQ responses and explicit review scoring',()=>{
 const book={...qs[0],datasetId:undefined,key:'book:original'};
 const exact=buildMock([book,...qs],{mode:'year',year:'2011',examPaper:'CS'},[paper]);assert.deepEqual(exact.questions.map(q=>q.key),qs.map(q=>q.key));
 assert.deepEqual(buildMock([book,...qs],{mode:'subject',subject:book.subject,count:1,durationMinutes:5}).questions.map(q=>q.key),['book:original']);
 const all=validateAttemptState(state(qs.map(q=>({key:q.key,value:q.correctOptions}))),qs),r=gradeAttempt(qs,all,1/3);
 assert.equal(r.score,94);assert.equal(r.ungraded,5);assert.equal(r.entries.length,65);assert.ok(r.entries.every(e=>e.referenceAnswer));
 assert.equal(gradeAttempt(qs,all,1/3,[{key:qs[1].key,marks:.5}]).score,94.5);
 assert.throws(()=>validateAttemptState(state([{key:qs[0].key,value:'written'}]),qs),/option/);
 assert.throws(()=>validateAttemptState(state([{key:qs[0].key,value:['A','B']}]),qs),/option/);
 const linked=validateAttemptState(state([{key:qs[0].key,value:['A']},{key:qs[25].key,value:['A']},{key:qs[51].key,value:['B']},{key:qs[52].key,value:['A']}]),qs);
 const lr=gradeAttempt(qs,linked,1/3);assert.equal(lr.score,-1.6667);assert.equal(lr.entries[52].status,'linked-ineligible');assert.equal(lr.entries[52].earned,0);
 const wrongSecond=validateAttemptState(state([{key:qs[51].key,value:['A']},{key:qs[52].key,value:['A']}]),qs);assert.equal(gradeAttempt(qs,wrongSecond,1/3).score,2);
});
test('2011 independent program, arithmetic, probability, metadata and replacement checks',()=>{
 const foo=(n,r)=>n>0?n%r+foo(Math.floor(n/r),r):0;assert.equal(foo(345,10),12);assert.equal(foo(513,2),2);
 const s='GATE2011';assert.equal(s.slice(s.charCodeAt(3)-s.charCodeAt(1)),'2011');
 let total=0,favourable=0;for(let a=1;a<=5;a++)for(let b=1;b<=5;b++)if(a!==b){total++;if(a===b+1)favourable++;}assert.equal(favourable/total,.2);
 assert.equal(8192/32*(32-8-5+2),5376);assert.equal(30/12,2.5);assert.equal((2+500*7)/(20+500*2),3502/1020);
 assert.ok(Math.abs(2.8*40**1.2-234.22325978044515)<1e-9);assert.ok(Math.abs(10*.9**3-7.29)<1e-12);
 const next=([p,q,r])=>[r,1-(p|r),q*(1-r)];assert.deepEqual(next([0,1,0]),[0,1,1]);let v=[0,0,0];const seen=new Set();while(!seen.has(v.join(''))){seen.add(v.join(''));v=next(v);}assert.deepEqual([...seen],['000','010','011','100']);
 for(let p=0;p<=1;p++)for(let q=0;q<=1;q++)for(let r=0;r<=1;r++)assert.equal((p|1-q|1-r)&(p|1-q|r)&(p|q|1-r),p|((1-q)&(1-r)));
});
test('2011 independent scheduling, matrix chain, natural join and distance-vector rounds',()=>{
 const arrivals=[0,1,2],left=[9,4,9],finish=[];for(let t=0;left.some(x=>x>0);t++){const eligible=left.map((l,i)=>({l,i})).filter(o=>o.l>0&&arrivals[o.i]<=t).sort((a,b)=>a.l-b.l);const i=eligible[0].i;if(--left[i]===0)finish[i]=t+1;}
 assert.equal(finish.reduce((s,t,i)=>s+t-arrivals[i]-[9,4,9][i],0)/3,5);
 const dims=[10,100,20,5,80];const costs=(i,j)=>i===j?[0]:Array.from({length:j-i},(_,k)=>i+k).flatMap(k=>costs(i,k).flatMap(a=>costs(k+1,j).map(b=>a+b+dims[i]*dims[k+1]*dims[j+1])));
 assert.deepEqual(costs(0,3).sort((a,b)=>a-b),[19000,25000,44000,130000,248000]);
 const rows=[['Ramesh','Sunderajan',10000],['Suresh','Ramgopal',5000],['Mahesh','Sunderajan',7000]];assert.equal(rows.flatMap(a=>rows.filter(b=>a[1]===b[1])).length,5);
 const old=[[0,1,7,8,4],[1,0,6,7,3],[7,6,0,2,6],[8,7,2,0,4],[4,3,6,4,0]],links=[[0,1,1],[1,2,2],[1,4,3],[2,3,2],[3,4,4]];
 const round=prior=>prior.map((v,i)=>v.map((_,target)=>i===target?0:Math.min(...links.filter(([a,b])=>a===i||b===i).map(([a,b,c])=>c+prior[a===i?b:a][target]))));
 old[1][2]=2;old[2][1]=2;const updated=round(old);assert.deepEqual(updated[2],[3,2,0,2,5]);updated[1][0]=Infinity;links.splice(0,1);assert.equal(round(updated)[2][0],10);
});
test('2011 Kruskal MST cost and weighted linked path for multiple graph sizes',()=>{
 for(let n=3;n<=20;n++){
 const es=[];for(let i=1;i<=n;i++)for(let j=i+1;j<=Math.min(n,i+2);j++)es.push([i,j,i+j]);es.sort((a,b)=>a[2]-b[2]);
 const parent=Array.from({length:n+1},(_,i)=>i),find=i=>parent[i]===i?i:parent[i]=find(parent[i]),tree=[];
 for(const e of es){const [i,j]=e,a=find(i),b=find(j);if(a!==b){parent[a]=b;tree.push(e);}}
 assert.equal(tree.reduce((s,e)=>s+e[2],0),n*n-n+1);
 if(n===10){const path=(i,target,from=0)=>i===target?0:tree.filter(([a,b])=>(a===i&&b!==from)||(b===i&&a!==from)).reduce((answer,[a,b,w])=>{const rest=path(a===i?b:a,target,i);return rest===null?answer:w+rest;},null);assert.equal(path(5,6),31);}
 }
});
