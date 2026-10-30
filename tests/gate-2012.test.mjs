import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
import {buildMock,paperCoverage,publicQuestion,gradeAttempt,validateAttemptState} from '../src/lib/gatemock.mjs';
import {yearPaperProgress,identifyYearPdf} from '../src/lib/gate-year-paper-tracker.mjs';
import {questionAssetPaths} from '../src/lib/year-paper-assets.mjs';
const paper=JSON.parse(await fs.readFile(new URL('../data/papers/gate-cs-2012.json',import.meta.url),'utf8')),qs=paper.questions;
const state=responses=>({responses,currentIndex:0,visited:[],marked:[]});
test('2012 booklet A has complete original coverage, rules and provenance',()=>{
 assert.equal(validateYearPaper(paper),paper);assert.equal(qs.length,65);assert.equal(paper.totalMarks,100);assert.equal(paper.availableMarks,100);assert.equal(paper.durationMinutes,180);
 assert.equal(paper.sourceSha256,'ff1031a54b710960b9b7f7e941ff299c0ce77952ee540816e040aa01fbb30269');
 assert.deepEqual(['one','two','common','linked','aptitude'].map(s=>qs.filter(q=>q.sectionId===s).length),[25,22,4,4,10]);
 assert.equal(qs.filter(q=>q.marks==='1').length,30);assert.equal(qs.slice(55).reduce((s,q)=>s+Number(q.marks),0),15);
 assert.equal(qs.filter(q=>q.source.copiedFrom).length,53);assert.equal(qs.filter(q=>!q.source.copiedFrom).length,12);
 assert.deepEqual(qs.filter(q=>q.dependsOnKey).map(q=>q.paperQuestionNumber),['53','55']);
 assert.ok(qs.every((q,i)=>q.paperQuestionNumber===String(i+1)&&q.originalLabel===String(i+1)&&q.examPaper==='CS'&&!q.setNum&&!q.sectionLimit&&q.source.bookletCode==='A'&&q.referenceAnswer));
 assert.ok(qs.every(q=>q.answerSources.find(s=>s.kind==='historical-key-mirror')?.printed===(q.awardMarksToAll?'Marks to All':q.correctOptions[0])));
 assert.equal(paperCoverage(qs,paper).ready,true);assert.equal(yearPaperProgress(identifyYearPdf('2012.pdf',paper.sourceSha256),[paper]).complete,true);
});
test('2012 literal corrections and independent assets do not leak answers',async()=>{
 assert.deepEqual(qs.filter(q=>q.manualReview).map(q=>q.paperQuestionNumber),['9','15','63']);
 assert.equal(qs[37].optC,'90');assert.equal(qs[39].optB,'SBDT');assert.match(qs[36].optD,/2\^n-2/);
 assert.doesNotMatch(qs[31].code,/while[^\n]*;/);assert.match(qs[2].code,/Choice A\\ n/);
 assert.match(qs[49].text,/Phone\}&\\text\{Area/);assert.match(qs[51].optC,/emptyset/);
 assert.doesNotMatch(qs[51].optD,/\\\$/);assert.doesNotMatch(qs[52].optB,/B\\to\\varepsilon/);
 assert.equal(paper.assetManifest.files.length,12);
 for(const q of qs){assert.doesNotMatch(JSON.stringify(publicQuestion(q,0)),/correctOptions|referenceAnswer|copiedFrom|gateOverflowUrl|answerSources|sourceSha256|awardMarksToAll|manualReview/);for(const asset of questionAssetPaths(q))await fs.access('public/'+asset);}
 const bytes=await fs.readFile('public/Year Papers/GATE CS 2012/2012.pdf');assert.equal(createHash('sha256').update(bytes).digest('hex'),paper.sourceSha256);
});
test('2012 documented awards, disputes, linked eligibility and copy isolation',()=>{
 const book={...qs[0],datasetId:undefined,key:'book:original'};
 assert.deepEqual(buildMock([book,...qs],{mode:'year',year:'2012',examPaper:'CS'},[paper]).questions.map(q=>q.key),qs.map(q=>q.key));
 assert.deepEqual(buildMock([book,...qs],{mode:'subject',subject:book.subject,count:1,durationMinutes:5}).questions.map(q=>q.key),['book:original']);
 const all=validateAttemptState(state(qs.map(q=>({key:q.key,value:q.correctOptions}))),qs),r=gradeAttempt(qs,all,1/3);
 assert.equal(r.score,96);assert.equal(r.ungraded,3);assert.equal(r.awarded,6);assert.equal(r.gradableMarks,96);
 assert.deepEqual(r.entries.filter(e=>e.status==='awarded').map(e=>e.question.number),[3,29,38,39,45,60]);
 assert.equal(gradeAttempt(qs,state([]),1/3).score,10); // Awards apply to blanks too.
 assert.equal(gradeAttempt(qs,all,1/3,[{key:qs[8].key,marks:.5}]).score,96.5);
 assert.throws(()=>validateAttemptState(state([{key:qs[0].key,value:'written'}]),qs),/option/);
 assert.throws(()=>validateAttemptState(state([{key:qs[0].key,value:['A','B']}]),qs),/option/);
 const linked=state([{key:qs[51].key,value:['B']},{key:qs[52].key,value:['C']}]);
 const lr=gradeAttempt(qs,linked,1/3);assert.equal(lr.score,9.3333);assert.equal(lr.entries[52].status,'linked-ineligible');
 const wrongSecond=state([{key:qs[51].key,value:['A']},{key:qs[52].key,value:['A']}]);assert.equal(gradeAttempt(qs,wrongSecond,1/3).score,12);
 const undocumented=structuredClone(paper);undocumented.questions[0].awardMarksToAll=true;undocumented.questions[0].correctOptions=[];assert.throws(()=>validateYearPaper(undocumented),/Undocumented/);
});
test('2012 independent numeric calculations, parsing and program traces',()=>{
 const words=['ab','aa','baa'];const member=s=>{const ok=Array(s.length+1).fill(false);ok[0]=true;for(let i=0;i<s.length;i++)if(ok[i])for(const w of words)if(s.startsWith(w,i))ok[i+w.length]=true;return ok[s.length];};
 assert.deepEqual(['abaabaaabaa','aaaabaaaa','baaaaabaaaab','baaaaabaa'].map(member),[true,true,false,true]);
 const poly=x=>x**4-x**3-x*x-4;let lo=1,hi=9;const mids=[];while(mids.length<8){const m=(lo+hi)/2;mids.push(m);if(poly(m)===0)break;if(poly(lo)*poly(m)<0)hi=m;else lo=m;}assert.deepEqual(mids,[5,3,2]);
 let favourable=0;for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)if(a<=3?a+b>=6:a>=6)favourable++;assert.equal(favourable/36,5/12);
 assert.equal((8+16+16**2)*128,35*1024);assert.equal(8192*20,160*1024);assert.equal(32-11-5,16);
 assert.equal((6*5*4*3)/(4*3*2)*3,45);assert.ok(Math.abs(.4*.72/(.6*.96+.4*.72)-1/3)<1e-12);
 assert.equal(3*(1000/1e6+100000/1e8)*1000+999,1005);
 const events=[];let mainA=1,staticA=2;for(let i=0;i<2;i++){staticA+=2;events.push([staticA,2]);if(i===0)mainA++;}events.push([mainA,0]);assert.deepEqual(events,[[4,2],[6,2],[2,0]]);
 const a=[[12,'Arun',60],[15,'Shreya',24],[99,'Rohit',11]],b=[[15,'Shreya',24],[25,'Hari',40],[98,'Rohit',20],[99,'Rohit',11]];
 const union=[...new Map([...a,...b].map(r=>[JSON.stringify(r),r])).values()];assert.equal(union.flatMap(r=>[10,99].filter(id=>r[0]>40||id<15)).length,7);assert.equal(a.filter(r=>b.filter(v=>v[1]==='Arun').every(v=>r[2]>v[2])).length,3);
});
test('2012 independent page replacement, RR scheduling and Dijkstra strict ties',()=>{
 const refs=[1,2,3,2,4,1,3,2,4,1];
 function faults(policy){const frames=[],seen=new Map(),insert=new Map();let count=0;refs.forEach((p,i)=>{if(!frames.includes(p)){count++;if(frames.length===3){let victim;if(policy==='opt')victim=frames.reduce((a,b)=>{const next=x=>{const k=refs.indexOf(x,i+1);return k<0?Infinity:k;};return next(a)>=next(b)?a:b;});else victim=frames.reduce((a,b)=>(policy==='fifo'?insert:seen).get(a)<(policy==='fifo'?insert:seen).get(b)?a:b);frames.splice(frames.indexOf(victim),1);}frames.push(p);insert.set(p,i);}seen.set(p,i);});return count;}
 assert.deepEqual(['opt','fifo','lru'].map(faults),[5,6,9]);
 const remaining=[5,7,4],arrivals=[0,1,3],queue=[0],done=[],added=new Set([0]);let time=0;
 while(queue.length){const p=queue.shift(),slice=Math.min(2,remaining[p]);time+=slice;remaining[p]-=slice;for(let i=0;i<3;i++)if(!added.has(i)&&arrivals[i]<=time){queue.push(i);added.add(i);}if(remaining[p])queue.push(p);else done.push(p+1);}assert.deepEqual(done,[1,3,2]);
 const edges=[['S','A',4],['S','B',3],['B','S',3],['S','D',7],['B','D',4],['A','C',1],['C','D',3],['C','E',1],['D','E',1],['E','G',2],['G','E',2],['E','T',4],['D','T',3],['G','T',3],['D','F',5],['T','F',5]];
 const dist={S:0},parent={},doneV=new Set();while(true){const next=Object.keys(dist).filter(v=>!doneV.has(v)).sort((a,b)=>dist[a]-dist[b])[0];if(!next)break;doneV.add(next);for(const [a,b,w]of edges)if(a===next&&dist[a]+w<(dist[b]??Infinity)){dist[b]=dist[a]+w;parent[b]=a;}}let v='T',path='T';while(parent[v]){v=parent[v];path=v+path;}assert.equal(path,'SACET');assert.equal(dist.T,10);
});
