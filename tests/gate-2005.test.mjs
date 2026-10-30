import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {validateYearPaper,maximumPaperMarks,publicPaper} from '../src/lib/year-papers.mjs';
import {buildMock,gradeAttempt,publicQuestion,validateAttemptState,paperCoverage} from '../src/lib/gatemock.mjs';
import {examSections} from '../src/lib/gate-exam-screen.mjs';
import {questionAssetPaths,paperAssetFiles} from '../src/lib/year-paper-assets.mjs';
import {renderSourceQuestion} from '../src/lib/latex-source.mjs';
const paper=JSON.parse(await fs.readFile(new URL('../data/papers/gate-cs-2005.json',import.meta.url),'utf8')),qs=paper.questions;
const state=responses=>({responses,currentIndex:0,marked:[qs[0].key],visited:[qs[0].key]});
test('2005 preserves the selected historical source, linked labels and isolated assets',async()=>{
 assert.equal(validateYearPaper(paper),paper);assert.equal(paper.sourceSha256,'4444090943ce9093ca672ddc0aa981bf3fb09559ba0bd1bc7c1588a82d199724');
 assert.equal(qs.length,90);assert.equal(maximumPaperMarks(qs),150);assert.equal(paper.durationMinutes,180);assert.equal(paper.negativeFraction,.25);
 assert.deepEqual(examSections(qs).map(s=>s.indices.length),[30,50,10]);
 assert.equal(qs.filter(q=>q.source.copiedFrom).length,82);assert.equal(new Set(qs.map(q=>q.source.copiedFrom?.questionId).filter(Boolean)).size,82);
 assert.equal(qs[1].source.copiedFrom.year,'2004');
 assert.deepEqual(qs.slice(80).map(q=>q.originalLabel),['81(a)','81(b)','82(a)','82(b)','83(a)','83(b)','84(a)','84(b)','85(a)','85(b)']);
 const assets=paperAssetFiles(paper);
 for(const[i,q]of qs.entries()){
  assert.equal(q.paperQuestionNumber,String(i+1));assert.equal(q.year,'2005');assert.equal(q.examPaper,'CS');assert.equal(q.setNum,'');assert.equal(q.questionType,'MCQ');
  assert.equal(q.marks,i<30?'1':'2');assert.notEqual(q.id,q.source.copiedFrom?.questionId);assert.ok(q.referenceAnswer);assert.ok(q.source.pdfPages.length);
  for(const file of questionAssetPaths(q)){assert.ok(file.startsWith('Year Papers/GATE CS 2005/'));assert.ok(assets.has(file));await fs.access(new URL('../public/'+file,import.meta.url));}
 }
});
test('source defects, five-option order and copy corrections are retained',()=>{
 assert.equal(qs[9].optA,'6');assert.equal(qs[49].optA,'1');assert.equal(qs[49].optC,'$i+1$');assert.equal(qs[49].optE,'$2^i$');assert.equal(qs[49].correctOptions[0],'C');
 assert.match(qs[82].optA,/Blank/);assert.equal(qs[82].correctOptions[0],'B');assert.ok(qs[82].optE);
 assert.match(renderSourceQuestion(qs[49]),/\(E\)/);assert.equal(publicQuestion(qs[49],49).optE,'$2^i$');
 assert.match(qs[47].text,/-3x_3/);assert.match(qs[47].text,/\+4x_2/);
 assert.equal(qs[70].optA,qs[70].optB);assert.equal(qs[75].optD,'(3,4), (4,3) and (6,4)');assert.equal(qs[89].optC,'49 D0');
 assert.match(qs[67].code,/I3: S R2/);assert.doesNotMatch(qs[30].code,/getchar/);
 assert.deepEqual(qs.filter(q=>q.manualReview).map(q=>q.originalLabel),['14','36','55','61','68','70','72']);
 assert.equal(qs[34].optD,'42');assert.equal(qs[35].optC,'$z(k-1)+1$');
});
test('five options save, active keys stay private, and only the independent year enters this paper',()=>{
 for(const q of qs)assert.doesNotMatch(JSON.stringify(publicQuestion(q,0)),/referenceAnswer|correctOptions|natAnswer|answerSources|gateOverflowUrl|manualReview|copiedFrom/);
 assert.doesNotMatch(JSON.stringify(publicPaper(paper)),/referenceAnswer|correctOptions|answerSources/);
 validateAttemptState(state([{key:qs[49].key,value:['E']}]),qs);
 assert.throws(()=>validateAttemptState(state([{key:qs[0].key,value:['E']}]),qs),/Invalid option/);
 const book={...qs[0],key:'book',datasetId:undefined},other={...qs[0],key:'other',datasetId:'gate-it-2005',examPaper:'IT'};
 const bank=[book,other,...qs];assert.ok(paperCoverage(bank,paper).ready);
 assert.deepEqual(buildMock(bank,{mode:'year',year:'2005',examPaper:'CS'},[paper]).questions.map(q=>q.key),qs.map(q=>q.key));
 assert.deepEqual(buildMock(bank,{mode:'subject',subject:book.subject,count:1,durationMinutes:1}).questions.map(q=>q.key),['book']);
});
test('linked eligibility and historical penalties are enforced during grading',()=>{
 const selected=[qs[0],qs[30],qs[80],qs[81]],wrong=q=>['A','B','C','D'].find(k=>!q.correctOptions.includes(k));
 let result=gradeAttempt(selected,state(selected.map(q=>({key:q.key,value:q.correctOptions}))),.25);assert.equal(result.score,7);
 result=gradeAttempt(selected,state([{key:qs[0].key,value:[wrong(qs[0])]},{key:qs[30].key,value:[wrong(qs[30])]},{key:qs[80].key,value:[wrong(qs[80])]},{key:qs[81].key,value:qs[81].correctOptions}]),.25);
 assert.equal(result.score,-1.25);assert.equal(result.entries[3].status,'linked-ineligible');assert.equal(result.entries[3].earned,0);
 result=gradeAttempt(selected,state([{key:qs[81].key,value:qs[81].correctOptions}]),.25);assert.equal(result.score,0);assert.equal(result.entries[3].linkedEligible,false);
 result=gradeAttempt(selected,state([{key:qs[80].key,value:qs[80].correctOptions},{key:qs[81].key,value:[wrong(qs[81])]}]),.25);assert.equal(result.score,2);assert.equal(result.entries[3].earned,0);
});
test('manual prerequisite must receive full marks before its linked answer can earn marks',()=>{
 const selected=qs.slice(86,88).map(q=>({...q,manualReview:true})),s=state(selected.map(q=>({key:q.key,value:q.correctOptions})));
 let r=gradeAttempt(selected,s,.25,[{key:selected[1].key,marks:2}]);assert.equal(r.score,0);assert.equal(r.entries[1].linkedEligible,null);assert.equal(r.gradableMarks,0);
 const unanswered=gradeAttempt(selected,state([{key:selected[1].key,value:selected[1].correctOptions}]),.25);
 assert.equal(unanswered.entries[1].linkedEligible,false);assert.equal(unanswered.entries[1].status,'linked-ineligible');
 r=gradeAttempt(selected,s,.25,[{key:selected[0].key,marks:1},{key:selected[1].key,marks:2}]);assert.equal(r.score,1);assert.equal(r.entries[1].linkedEligible,false);
 r=gradeAttempt(selected,s,.25,selected.map(q=>({key:q.key,marks:2})));assert.equal(r.score,4);assert.equal(r.entries[1].linkedEligible,true);
 const invalid=structuredClone(paper);invalid.questions[0].dependsOnKey=qs[1].key;assert.throws(()=>validateYearPaper(invalid),/prerequisite/);
});
test('full 150-mark ceiling, pending marks and all answer entries remain consistent',()=>{
 const responses=qs.map(q=>({key:q.key,value:q.correctOptions})),s=state(responses);validateAttemptState(s,qs);
 const r=gradeAttempt(qs,s,.25);assert.equal(r.score,137);assert.equal(r.ungraded,7);assert.equal(r.entries.length,90);
 assert.equal(gradeAttempt(qs,s,.25,qs.filter(q=>q.manualReview).map(q=>({key:q.key,marks:Number(q.marks)}))).score,150);
});
test('independent numerical, code, circuit and exhaustive scheduling checks',()=>{
 let output=[];function foo(n,sum){if(n===0)return;const k=n%10;foo(Math.floor(n/10),sum+k);output.push(k);}let sum=0;foo(2048,sum);output.push(sum);assert.deepEqual(output,[2,0,4,8,0]);
 const matrix=[[2,-1,-3],[3,2,5],[-1,4,1]],det=([a,b,c])=>a[0]*(b[1]*c[2]-b[2]*c[1])-a[1]*(b[0]*c[2]-b[2]*c[0])+a[2]*(b[0]*c[1]-b[1]*c[0]);assert.equal(det(matrix),-70);
 for(let x=0;x<2;x++)for(let y=0;y<2;y++)for(let z=0;z<2;z++)assert.equal(Number(!((!(x&&!y))&&(y&&z))),Number(!y||!z));
 assert.equal(parseInt('657',8).toString(16),'1af');assert.ok(Math.abs((1/3*2/5)/(1/3*2/5+2/3*3/4)-4/19)<1e-15);
 const tasks=[[15,7],[20,2],[30,5],[18,3],[18,4],[10,5],[23,2],[16,7],[25,3]];let best=0,sets=[];
 for(let mask=0;mask<512;mask++){
  const jobs=tasks.map(([p,d],i)=>({p,d,i})).filter(j=>mask>>j.i&1).sort((a,b)=>a.d-b.d);
  if(jobs.some((j,i)=>i+1>j.d))continue;const profit=jobs.reduce((s,j)=>s+j.p,0);
  if(profit>best){best=profit;sets=[mask];}else if(profit===best)sets.push(mask);
 }
 assert.equal(best,147);assert.equal(sets.length,1);assert.equal(Math.floor(.239*256),0x3d);assert.equal((0x3d<<3)&255,0xe8);
 assert.ok(Math.abs(512*1024*50/4*40e-9*100-26.2144)<1e-10);
});
