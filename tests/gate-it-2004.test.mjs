import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {validateYearPaper,maximumPaperMarks,publicPaper} from '../src/lib/year-papers.mjs';
import {buildMock,gradeAttempt,publicQuestion,paperCoverage} from '../src/lib/gatemock.mjs';
import {examSections} from '../src/lib/gate-exam-screen.mjs';
import {questionAssetPaths,paperAssetFiles} from '../src/lib/year-paper-assets.mjs';
const paper=JSON.parse(await fs.readFile(new URL('../data/papers/gate-it-2004.json',import.meta.url),'utf8')),qs=paper.questions;
test('IT 2004 preserves full historical source and independent storage',async()=>{
 assert.equal(validateYearPaper(paper),paper);
 assert.equal(paper.sourceSha256,'b54c54f17e183e8c0362d9c263b2d8fabb3207c3b6c4d1aafce6c825dbab7008');
 assert.equal(qs.length,90);assert.equal(maximumPaperMarks(qs),150);assert.equal(paper.durationMinutes,180);assert.equal(paper.negativeFraction,0);
 assert.deepEqual(examSections(qs).map(s=>s.indices.length),[30,60]);
 assert.equal(qs.filter(q=>q.source.copiedFrom).length,71);
 assert.equal(qs.filter(q=>q.answerSources.some(s=>s.kind==='made-easy-key')).length,29);
 assert.equal(qs[10].source.copiedFrom.year,'2011');assert.equal(qs[59].source.copiedFrom.year,'2008');
 const files=paperAssetFiles(paper);assert.equal(files.size,6);
 for(const [i,q] of qs.entries()){
  assert.equal(q.paperQuestionNumber,String(i+1));assert.equal(q.originalLabel,String(i+1));assert.equal(q.examPaper,'IT');assert.equal(q.year,'2004');assert.equal(q.setNum,'');
  assert.equal(q.marks,i<30?'1':'2');assert.equal(q.questionType,'MCQ');
  assert.notEqual(q.id,q.source.copiedFrom?.questionId);assert.ok(q.referenceAnswer);assert.match(q.gateOverflowUrl,/gate-it-2004-question-/);
  for(const file of questionAssetPaths(q)){assert.ok(file.startsWith('Year Papers/GATE IT 2004/'));assert.ok(files.has(file));await fs.access(new URL('../public/'+file,import.meta.url));}
 }
});
test('literal scan defects, full schedule and source option order survive',()=>{
 assert.match(qs[10].text,/\$50\$/);assert.match(qs[11].text,/0.5/);assert.match(qs[11].text,/500 ns/);
 assert.equal(qs[11].optB,'12.5 ns');assert.equal(qs[33].optB,qs[33].optC);
 assert.match(qs[40].optB,/B\\to bB/);assert.equal(qs[43].optB,"$AB'AC'+A'C$");
 assert.match(qs[60].code,/s.a = "L"/);assert.equal(qs[70].optB,'500');
 assert.equal(qs[72].optC,'4');assert.equal(qs[72].optD,'5');
 assert.match(qs[76].text,/B=B\+\\mathrm\{Temp\}/);assert.equal(qs[79].correctOptions[0],'D');assert.equal(qs[83].correctOptions[0],'A');
 assert.deepEqual(qs.filter(q=>q.manualReview).map(q=>Number(q.paperQuestionNumber)),[11,12,34,40,41,44,50,57,60,61,71,72,74]);
});
test('IT paper isolation, active answer secrecy and honest manual scores',()=>{
 const book={...qs[0],id:'book',key:'book',datasetId:undefined};
 const cs={...qs[0],key:'cs',examPaper:'CS',datasetId:'gate-cs-2004'};
 const bank=[book,cs,...qs];assert.ok(paperCoverage(bank,paper).ready);
 const mock=buildMock(bank,{mode:'year',year:'2004',examPaper:'IT'},[paper]);
 assert.deepEqual(mock.questions.map(q=>q.key),qs.map(q=>q.key));
 for(const q of qs)assert.doesNotMatch(JSON.stringify(publicQuestion(q,0)),/referenceAnswer|correctOptions|answerSources|gateOverflowUrl|manualReview|copiedFrom/);
 assert.doesNotMatch(JSON.stringify(publicPaper(paper)),/referenceAnswer|correctOptions/);
 assert.deepEqual(buildMock(bank,{mode:'subject',examPaper:'IT',subject:book.subject,count:1,durationMinutes:1}).questions.map(q=>q.key),['book']);
 const state={currentIndex:0,responses:qs.map(q=>({key:q.key,value:q.correctOptions})),marked:[],visited:[]};
 const graded=gradeAttempt(qs,state,0);assert.equal(graded.score,126);assert.equal(graded.ungraded,13);
 const assessed=gradeAttempt(qs,state,0,qs.filter(q=>q.manualReview).map(q=>({key:q.key,marks:Number(q.marks)})));assert.equal(assessed.score,150);
});
test('independent numerical, program and network calculations',()=>{
 const r=[];for(const a of [1,3,5,7])for(const c of [1,2,3,4])if([2,4,6,8].some(b=>(a+b)%3===0&&(b+c)%2===0&&(b+c)%3!==0))r.push([a,c]);
 assert.deepEqual(r,[[1,2],[3,2],[3,4],[5,4],[7,2]]);
 let a=1,b=3;for(let n=2;n<=12;n++){[a,b]=[b,3*b-a];const x=(3+Math.sqrt(5))/2,y=(3-Math.sqrt(5))/2;assert.ok(Math.abs(b-(x**(n+1)-y**(n+1))/Math.sqrt(5))<1e-6);}
 const dur=[[1,2,1,2],[2,1,2,1],[1,1,2,1],[2,1,2,1],[1,2,1,2]],fin=[];
 for(let i=0;i<5;i++){fin[i]=[];for(let j=0;j<4;j++)fin[i][j]=Math.max(fin[i-1]?.[j]||0,fin[i][j-1]||0)+dur[i][j];}
 assert.deepEqual(fin.map(r=>r[3]),[6,7,9,11,13]);
 const lines=[],last=[];for(const [time,v] of [4,3,25,8,19,6,25,8,16,35,45,22,8,3,16,25,7].entries()){let i=lines.indexOf(v);if(i<0){i=lines.length<8?lines.length:last.indexOf(Math.min(...last));lines[i]=v;}last[i]=time;}
 assert.equal(lines.indexOf(7),5);
 let stat=10,y=10;const g=x=>++stat+x;for(let i=0;i<2;i++)y+=g(5)+g(5);assert.equal(y,80);
 let out='',run=0;for(const bit of '01110110'){out+=bit;run=bit==='1'?run+1:0;if(run===2){out+='0';run=0;}}assert.equal(out,'0110101100');
 const basis=[0b0101011,0b1001101,0b1110001],space=new Set();for(let mask=0;mask<8;mask++)space.add(basis.reduce((v,b,i)=>v^((mask>>i&1)?b:0),0));
 assert.deepEqual(['0010111','0110110','1011010','0111010'].map(x=>space.has(parseInt(x,2))),[true,false,true,false]);
 assert.equal(.5*1+.5*.9*10+.5*.1*500,30);
 assert.equal(1024*(10+128+128**2+128**3),2164402176);assert.equal(Math.floor((512+18)/23),23);
 assert.equal(20*(8/4)**4,320);assert.equal(200/(16/20)-200,50);
});
