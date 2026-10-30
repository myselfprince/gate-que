import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
import {buildMock,paperCoverage,publicQuestion,gradeAttempt,validateAttemptState} from '../src/lib/gatemock.mjs';
import {questionAssetPaths} from '../src/lib/year-paper-assets.mjs';
const paper=JSON.parse(await fs.readFile(new URL('../data/papers/gate-cs-2008.json',import.meta.url),'utf8')),qs=paper.questions;
const state=responses=>({responses,currentIndex:0,visited:[],marked:[]});
test('2008 identity, complete original order and documented linked rules',()=>{
 assert.equal(validateYearPaper(paper),paper);assert.equal(qs.length,85);assert.equal(paper.durationMinutes,180);
 assert.equal(paper.sourceSha256,'f01fcd02a9a5544d1f89959eca288fe967bb537ed00513b46e5fe8f9f97f7202');
 assert.equal(paper.totalMarks,150);assert.equal(qs.filter(q=>q.marks==='1').length,20);
 assert.deepEqual(['one','two','common','linked'].map(s=>qs.filter(q=>q.sectionId===s).length),[20,50,5,10]);
 assert.deepEqual(qs.filter(q=>q.dependsOnKey).map(q=>q.paperQuestionNumber),['77','79','81','83','85']);
 assert.equal(qs.filter(q=>q.source.copiedFrom).length,79);assert.equal(qs.filter(q=>!q.source.copiedFrom).length,6);
 assert.ok(qs.every((q,i)=>q.paperQuestionNumber===String(i+1)&&q.year==='2008'&&q.examPaper==='CS'&&!q.setNum&&!q.sectionLimit&&q.referenceAnswer&&q.answerSources));
 assert.equal(paperCoverage(qs,paper).ready,true);
});
test('2008 source corrections, diagram isolation, ambiguous questions and secrecy',async()=>{
 assert.deepEqual(qs.filter(q=>q.manualReview).map(q=>q.paperQuestionNumber),['3','21','34','36','37','38','43','54','64','73','74','76','79','85']);
 assert.equal(qs[2].optD,'any real number');assert.deepEqual(qs[2].correctOptions,[]);assert.match(qs[2].text,/2x_2/);
 assert.match(qs[24].text,/24x\^2/);assert.equal(qs[5].optD,'any value $>2$');assert.deepEqual(qs[18].correctOptions,['C']);
 assert.equal(qs[78].optD,'16');assert.deepEqual(qs[78].correctOptions,[]);assert.match(qs[84].optC,/<=/);
 assert.match(qs[73].code,/X\[0\] = Y\[0\] = Z\[0\] = 0/);assert.equal(qs[73].code,qs[74].code);
 for(const q of qs){assert.doesNotMatch(JSON.stringify(publicQuestion(q,0)),/correctOptions|referenceAnswer|copiedFrom|gateOverflowUrl|answerSources/);for(const asset of questionAssetPaths(q)){assert.match(asset,/^Year Papers\/GATE CS 2008\//);await fs.access('public/'+asset);}}
 const book={...qs[0],datasetId:undefined,key:'book:original'};
 assert.ok(buildMock([book,...qs],{mode:'year',year:'2008',examPaper:'CS'},[paper]).questions.every(q=>q.datasetId===paper.slug));
 assert.deepEqual(buildMock([book,...qs],{mode:'subject',subject:book.subject,count:1,durationMinutes:5}).questions.map(q=>q.key),['book:original']);
});
test('2008 grading leaves disputes pending and follows source penalties/dependency',()=>{
 const responses=qs.map(q=>({key:q.key,value:q.correctOptions.length?q.correctOptions:['A']}));
 const result=gradeAttempt(qs,validateAttemptState(state(responses),qs),.25);
 assert.equal(result.score,121);assert.equal(result.ungraded,15);assert.equal(result.gradableMarks,123);
 const manual=qs.filter(q=>q.manualReview).map(q=>({key:q.key,marks:Number(q.marks)}));
 const assessed=gradeAttempt(qs,state(responses),.25,manual);assert.equal(assessed.score,150);assert.equal(assessed.ungraded,0);
 const wrong=state([{key:qs[0].key,value:['B']},{key:qs[21].key,value:['B']},{key:qs[79].key,value:['A']},{key:qs[80].key,value:['C']}]);
 const r=gradeAttempt(qs,validateAttemptState(wrong,qs),.25);assert.equal(r.score,-1.25);assert.equal(r.entries[80].status,'linked-ineligible');
 assert.throws(()=>validateAttemptState(state([{key:qs[0].key,value:'written'}]),qs),/option/);
});
test('independent numerical and program checks: determinants, Boolean simplification, traces and defective repair',()=>{
 const det=a=>a[0][0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1])-a[0][1]*(a[1][0]*a[2][2]-a[1][2]*a[2][0])+a[0][2]*(a[1][0]*a[2][1]-a[1][1]*a[2][0]);
 for(let alpha=-5;alpha<=10;alpha++)assert.equal(det([[1,1,2],[1,2,3],[1,4,alpha]]),alpha-5);
 for(let p=0;p<2;p++)for(let q=0;q<2;q++)for(let r=0;r<2;r++)assert.equal(Boolean((p||!q)&&((p&&!q)||(p&&r))&&((!p&&!r)||!q)),Boolean(p&&!q));
 let v=[0,1];for(let i=2;i<=8;i++)v[i]=2*v[i-1]+3*v[i-2];assert.equal(v[8],1640);
 const valid=Array.from({length:32},(_,n)=>n.toString(2).padStart(5,'0')).filter(s=>!s.includes('00'));assert.equal(valid.length,13);
 const y=[1,2,3,4,5,6,7,8,9,10];let i=0,j=9,k;
 do{k=Math.floor((i+j)/2);if(y[k]<10)i=k+1;else j=k-1;}while(y[k]!==10&&i<j);
 assert.equal(i,9);assert.equal(j,9);assert.equal(k,8);assert.notEqual(y[k],10,'Q85 option A still misses the final singleton');
});
test('independent graph simulation: Dijkstra agrees with Bellman-Ford for source Q45',()=>{
 const edges=[['a','b',1],['b','c',2],['c','d',3],['d','a',2],['b','e',-3],['c','h',-5],['d','g',2],['h','e',1],['g','h',2],['g','e',1],['e','f',2],['f','g',3]];
 const vertices=[...'abcdefgh'],initial=()=>Object.fromEntries(vertices.map(v=>[v,v==='a'?0:Infinity]));
 const bf=initial();for(let t=0;t<7;t++)for(const [u,v,w]of edges)bf[v]=Math.min(bf[v],bf[u]+w);
 const dj=initial(),left=new Set(vertices);while(left.size){const u=[...left].sort((a,b)=>dj[a]-dj[b])[0];left.delete(u);for(const [a,b,w]of edges)if(a===u&&left.has(b))dj[b]=Math.min(dj[b],dj[a]+w);}
 assert.deepEqual(dj,bf);assert.deepEqual(dj,{a:0,b:1,c:3,d:6,e:-2,f:0,g:3,h:-2});
});
test('source NFAs and edited regex options agree by exhaustive short-word simulation',()=>{
 const tables=[{0:{0:[1]},1:{0:[0,2]},2:{1:[1,2]}},{0:{0:[1]},1:{0:[0],1:[2]},2:{0:[2],1:[1]}},{0:{0:[1]},1:{1:[0,2]},2:{0:[2],1:[1]}},{0:{0:[1]},1:{1:[0,2]},2:{0:[2],1:[1]}}];
 const regex=[/^(?:|0(?:01*1|00)*01*)$/,/^(?:|0(?:10*1|00)*0)$/,/^(?:|0(?:10*1|10)*1)$/,/^(?:|0(?:10*1|10)*10*)$/];
 for(let n=0;n<=9;n++)for(let v=0;v<2**n;v++){const s=n?v.toString(2).padStart(n,'0'):'';tables.forEach((table,k)=>{let states=new Set([0]);for(const c of s)states=new Set([...states].flatMap(st=>table[st]?.[c]||[]));assert.equal([...states].some(st=>st===0||([0,3].includes(k)&&st===2)),regex[k].test(s),`${k} ${s}`);});}
});
