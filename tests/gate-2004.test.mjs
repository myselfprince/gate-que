import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {validateYearPaper,maximumPaperMarks,publicPaper} from '../src/lib/year-papers.mjs';
import {buildMock,gradeAttempt,publicQuestion,validateAttemptState,paperCoverage} from '../src/lib/gatemock.mjs';
import {examSections} from '../src/lib/gate-exam-screen.mjs';
import {questionAssetPaths,paperAssetFiles} from '../src/lib/year-paper-assets.mjs';
const paper=JSON.parse(await fs.readFile(new URL('../data/papers/gate-cs-2004.json',import.meta.url),'utf8')),qs=paper.questions;
const state=responses=>({currentIndex:0,responses,marked:[qs[0].key],visited:[qs[0].key]});
test('2004 source coverage, historical structure and independent assets',async()=>{
 assert.equal(validateYearPaper(paper),paper);assert.equal(paper.sourceSha256,'ba48acc7ffb92c1722d6efc85bd324a1001e35f5bb1b8766dddbf3d629e081a5');
 assert.equal(qs.length,90);assert.equal(maximumPaperMarks(qs),150);assert.equal(paper.availableMarks,150);
 assert.deepEqual(examSections(qs).map(s=>[s.indices.length,s.limit]),[[30,undefined],[60,undefined]]);
 assert.equal(qs.filter(q=>q.source.copiedFrom).length,86);assert.equal(new Set(qs.map(q=>q.source.copiedFrom?.questionId).filter(Boolean)).size,86);
 assert.deepEqual(qs.filter(q=>!q.source.copiedFrom).map(q=>Number(q.paperQuestionNumber)),[30,76,81,90]);
 assert.equal(qs.filter(q=>q.answerSources.some(s=>s.kind==='made-easy-key')).length,54);
 assert.deepEqual(qs.filter(q=>q.manualReview).map(q=>Number(q.paperQuestionNumber)),[14,47,49,62,63,71,76,82,83,87,89]);
 const files=paperAssetFiles(paper);
 for(const [i,q] of qs.entries()){
  assert.equal(q.paperQuestionNumber,String(i+1));assert.equal(q.originalLabel,String(i+1));assert.equal(q.examPaper,'CS');assert.equal(q.year,'2004');assert.equal(q.setNum,'');assert.equal(q.questionType,'MCQ');assert.equal(q.marks,i<30?'1':'2');
  assert.notEqual(q.id,q.source.copiedFrom?.questionId);assert.ok(q.referenceAnswer);assert.ok(q.source.pdfPages.length);assert.equal(q.source.sha256,paper.sourceSha256);
  assert.match(q.gateOverflowUrl,/gate-cse-2004-question-/);
  for(const file of questionAssetPaths(q)){assert.ok(file.startsWith('Year Papers/GATE CS 2004/'));assert.ok(files.has(file));await fs.access(new URL('../public/'+file,import.meta.url));}
 }
});
test('selected scan defects and option order survive corrections to book copies',()=>{
 assert.equal(qs[6].optD,'3 or 4');assert.doesNotMatch(qs[12].optC,/-/);assert.match(qs[31].optA,/m-j\+1/);assert.equal(qs[32].optC,'gnirt');
 assert.equal(qs[46].optD,'1230 nanoseconds');assert.match(qs[69].text,/P\\vee Q/);assert.match(qs[70].text,/-x\+5y&=1/);assert.match(qs[70].text,/x-3y&=3/);
 assert.match(qs[81].code,/i <= n/);assert.equal(qs[81].optD,'$O(n)$');assert.match(qs[82].text,/a>0/);assert.match(qs[83].optD,/n-1/);assert.match(qs[86].text,/m-n/);assert.match(qs[88].text,/i\\le j/);
 assert.equal(qs[35].correctOptions[0],'A');assert.equal(qs[35].answerSources.find(s=>s.kind==='made-easy-key').printed,'C');
 assert.equal(qs[84].correctOptions[0],'B');assert.equal(qs[84].answerSources.find(s=>s.kind==='made-easy-key').printed,'A');
});
test('2004 catalog and active attempts keep all answers private and other datasets isolated',()=>{
 for(const q of qs)assert.doesNotMatch(JSON.stringify(publicQuestion(q,0)),/referenceAnswer|correctOptions|natAnswer|answerSources|verificationStatus|gateOverflowUrl|copiedFrom|manualReview/);
 assert.doesNotMatch(JSON.stringify(publicPaper(paper)),/correctOptions|referenceAnswer|answerSources|copiedFrom/);
 const book={...qs[0],id:'book-id',key:'book-key',datasetId:undefined};
 const other={...qs[0],key:'other-year',year:'2003',datasetId:'gate-cs-2003'};
 const bank=[other,book,...qs];assert.equal(paperCoverage(bank,paper).ready,true);
 const mock=buildMock(bank,{mode:'year',year:'2004',examPaper:'CS'},[paper]);assert.deepEqual(mock.questions.map(q=>q.key),qs.map(q=>q.key));
 assert.equal(mock.totalMarks,150);assert.equal(mock.durationMinutes,180);assert.equal(mock.negativeFraction,0);
 assert.deepEqual(buildMock(bank,{mode:'subject',subject:book.subject,count:1,durationMinutes:1}).questions.map(q=>q.key),['book-key']);
 assert.deepEqual(buildMock(bank,{mode:'full',blueprint:[{subject:book.subject,one:1,two:0}],durationMinutes:1}).questions.map(q=>q.key),['book-key']);
});
test('90 responses, 129 automatic marks and 21 self-assessed marks',()=>{
 const responses=qs.map(q=>({key:q.key,value:q.correctOptions}));validateAttemptState(state(responses),qs);
 const result=gradeAttempt(qs,state(responses),0);assert.equal(result.score,129);assert.equal(result.ungraded,11);assert.equal(result.gradableMarks,129);
 const assessed=gradeAttempt(qs,state(responses),0,qs.filter(q=>q.manualReview).map(q=>({key:q.key,marks:Number(q.marks)})));assert.equal(assessed.score,150);
 assert.throws(()=>validateAttemptState(state([{key:qs[0].key,value:['A','B']}]),qs),/Invalid option/);
 assert.throws(()=>validateAttemptState(state([{key:qs[0].key,value:'written answer'}]),qs),/Invalid option/);
});
test('heap insertions, LRU misses and recursive program independently traced',()=>{
 const heap=[];for(const v of [32,15,20,30,12,25,16]){heap.push(v);let j=heap.length-1;while(j>0){const p=Math.floor((j-1)/2);if(heap[p]>=heap[j])break;[heap[p],heap[j]]=[heap[j],heap[p]];j=p;}}
 assert.deepEqual(heap,[32,30,25,15,12,20,16]);
 const set=[];let misses=0;for(const v of [8,12,0,12,8]){const i=set.indexOf(v);if(i<0){misses++;if(set.length===2)set.shift();}else set.splice(i,1);set.push(v);}assert.equal(misses,4);
 let i=1;function f(n){if(n>=5)return n;n+=i;i++;return f(n);}assert.equal(f(1),7);
 const s='string\0',p=[];for(let j=0;j<6;j++)p[j]=s[6-j];assert.equal(p[0],'\0');
 for(let digits=1;digits<=6;digits++){let n=123456,rev=0;for(let j=0;j<digits;j++){rev=rev*10+n%10;n=Math.floor(n/10);}assert.equal(n,Math.floor(123456/10**digits));assert.equal(rev,Number('123456'.slice(-digits).split('').reverse().join('')));}
});
test('SRPT simulation and Dijkstra source graph validate supplied calculations',()=>{
 const jobs=[{a:0,left:5},{a:1,left:3},{a:2,left:3},{a:4,left:1}];let turns=0;
 for(let t=0;t<12;t++){const q=jobs.filter(j=>j.a<=t&&j.left).sort((a,b)=>a.left-b.left||a.a-b.a)[0];q.left--;if(!q.left)turns+=t+1-q.a;}
 assert.equal(turns/4,5.5);
 const edges={P:[['Q',1],['S',6],['T',7]],Q:[['R',1],['S',4]],R:[['S',2],['U',1]],S:[['T',3],['U',2]],T:[['U',2]],U:[]},dist={P:0},done=[];
 while(done.length<6){const u=Object.keys(edges).filter(v=>!done.includes(v)).sort((a,b)=>(dist[a]??Infinity)-(dist[b]??Infinity))[0];done.push(u);for(const [v,w] of edges[u])dist[v]=Math.min(dist[v]??Infinity,dist[u]+w);}
 assert.deepEqual(done,['P','Q','R','U','S','T']);assert.deepEqual(done.map(v=>dist[v]),[0,1,2,3,4,7]);
 assert.equal(100+2*(.9*150+.1*450)+8e6/1e4,1260);
});
test('graph colouring, finite automaton counts and literal equation defect checked',()=>{
 const names=['T','R','B','L','a','b','c','d'],edges=[['T','R'],['R','B'],['B','L'],['L','T'],['a','b'],['b','c'],['c','d'],['d','a'],['T','a'],['T','b'],['R','b'],['R','c'],['B','c'],['B','d'],['L','d'],['L','a']];
 function colour(k){const c={};function visit(i){if(i===names.length)return {...c};const u=names[i];for(let v=0;v<k;v++){if(edges.some(([a,b])=>a===u&&c[b]===v||b===u&&c[a]===v))continue;c[u]=v;const r=visit(i+1);if(r)return r;delete c[u];}return null;}return visit(0);}
 assert.equal(colour(3),null);assert.ok(colour(4));
 for(let n=0;n<=9;n++)for(let v=0;v<2**n;v++){const s=n?v.toString(2).padStart(n,'0'):'';let row=0,col=0;for(const bit of s)if(bit==='0')row=1-row;else col=(col+1)%3;const ones=[...s].filter(x=>x==='1').length;assert.equal(row===0&&col===0,ones%3===0&&(n-ones)%2===0);}
 const x=11/4,y=3/4;assert.equal(-x+5*y,1);assert.equal(x-y,2);assert.notEqual(x-3*y,3);
});
test('recurrence, tree-level costs, fragmentation and numerical answers independently checked',()=>{
 let t=1;for(let n=2;n<=25;n++){t=2*t+n;assert.equal(t,2**(n+1)-n-2);}
 for(let h=1;h<=15;h++){const n=2**h;let work=0;for(let depth=0;depth<h;depth++)work+=2**depth*(n/2**(depth+1));assert.equal(work,n*h/2);}
 const parts=[];let remaining=200;while(remaining){const chunk=Math.min(remaining,80);parts.push(chunk+20);remaining-=chunk;}assert.deepEqual(parts,[100,100,60]);assert.equal(parts.reduce((a,b)=>a+b,0),260);assert.equal(Math.round(512*180/260*10)/10,354.5);
 assert.equal(1024*(10+256+256**2+256**3),17247250432);assert.equal(1000+4*7,1028);assert.equal(2*7+3*3+1,24);assert.equal((300+900)/600e6/(20e3/10e6)*100,.1);
 assert.equal((1000+3)*165/1000,165.495);assert.equal(150*1000*(.25-.75*.25),9375);assert.equal(7*8-5*11,1);assert.equal((-6*10+256).toString(2),'11000100');
});
