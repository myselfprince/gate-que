import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {maximumPaperMarks,publicPaper,validateYearPaper} from '../src/lib/year-papers.mjs';
import {buildMock,paperCoverage,publicQuestion,gradeAttempt,validateAttemptState} from '../src/lib/gatemock.mjs';
import {examSections} from '../src/lib/gate-exam-screen.mjs';
const paper=JSON.parse(await fs.readFile(new URL('../data/papers/gate-cs-2000.json',import.meta.url),'utf8'));
const questions=paper.questions;
test('complete 2000 paper follows the supplied historical format and choice rule',()=>{
 assert.equal(validateYearPaper(paper),paper);
 assert.equal(questions.length,69);assert.equal(questions.filter(q=>q.questionType==='MCQ').length,49);
 assert.equal(questions.filter(q=>q.questionType==='SUBJECTIVE').length,20);
 assert.equal(questions.reduce((n,q)=>n+Number(q.marks),0),175);assert.equal(maximumPaperMarks(questions),150);
 assert.deepEqual(examSections(questions).map(s=>[s.indices.length,s.limit]),[[23,undefined],[26,undefined],[20,15]]);
 assert.equal(questions.some(q=>/aptitude/i.test(q.subject)),false);
 assert.equal(questions.filter(q=>q.source.copiedFrom).length,38);
 assert.deepEqual(questions.filter(q=>q.manualReview).map(q=>q.paperQuestionNumber),['29','31']);
 assert.equal(questions.filter(q=>q.correctOptions.length).reduce((n,q)=>n+Number(q.marks),0),71);
 assert.equal(questions[25].optD,String.raw`$2S\leq T$`);
 assert.match(questions[60].code,/function dash\(n,m,p,q,r,s/);
 assert.match(questions[60].code,/dash := false/);
 assert.match(questions[64].code,/z := z \+ x/);
 assert.match(questions[64].referenceAnswer,/12, 7, 10, 5/);
});
test('year copy ignores book duplicates and never enters weighted or subject practice',()=>{
 const book={...questions[0],datasetId:undefined,key:'book:q1',chapterId:'original'};
 const bank=[book,...questions];const original=JSON.stringify(bank);
 assert.equal(paperCoverage(bank,paper).ready,true);
 assert.equal(paperCoverage(bank,paper).available,69);
 const mock=buildMock(bank,{mode:'year',year:'2000',examPaper:'CS'},[paper]);
 assert.equal(mock.totalMarks,150);assert.equal(mock.questions.length,69);
 assert.ok(mock.questions.every(q=>q.datasetId==='gate-cs-2000'));
 assert.deepEqual(buildMock(bank,{mode:'subject',subject:book.subject,count:1,durationMinutes:1}).questions.map(q=>q.key),['book:q1']);
 assert.equal(JSON.stringify(bank),original);
 const partial=buildMock(bank,{mode:'year',year:'2000',examPaper:'CS',allowPartial:true},[{...paper,verified:false}]);
 assert.equal(partial.exact,false);assert.equal(partial.questions.length,69);assert.ok(partial.questions.every(q=>q.datasetId==='gate-cs-2000'));
 assert.doesNotMatch(JSON.stringify(publicPaper(paper)),/correctOptions|referenceAnswer|copiedFrom|natAnswer/);
 for(const q of questions)assert.doesNotMatch(JSON.stringify(publicQuestion(q,0)),/correctOptions|referenceAnswer|copiedFrom|natAnswer|gateOverflowUrl|manualReview/);
});
const stateFor=responses=>({currentIndex:0,marked:[],visited:[questions[0].key],responses});
test('written answers save verbatim content, validate size, and enforce any fifteen on the server',()=>{
 const written=questions.slice(49);
 const responses=written.slice(0,15).map(q=>({key:q.key,value:'Proof\n  x = 2;'}));
 const state=validateAttemptState(stateFor(responses),questions);assert.equal(state.responses.length,15);
 assert.equal(state.responses[0].value,'Proof\n  x = 2;');
 assert.throws(()=>validateAttemptState(stateFor([...responses,{key:written[15].key,value:'one too many'}]),questions),/at most 15/);
 assert.throws(()=>validateAttemptState(stateFor([{key:written[0].key,value:'x'.repeat(6001)}]),questions),/6000/);
 assert.throws(()=>validateAttemptState(stateFor([{key:written[0].key,value:['A']}]),questions),/6000/);
});
test('automatic and self-assessed marks preserve the 150-mark maximum and disputed explanations',()=>{
 const responses=questions.filter(q=>q.correctOptions.length).map(q=>({key:q.key,value:q.correctOptions}));
 const written=questions.slice(49,64);
 responses.push(...written.map(q=>({key:q.key,value:'My written answer'})));
 responses.push(...questions.filter(q=>q.manualReview).map(q=>({key:q.key,value:['B']})));
 const state=validateAttemptState(stateFor(responses),questions);
 const result=gradeAttempt(questions,state,0);
 assert.equal(result.score,71);assert.equal(result.totalMarks,150);assert.equal(result.gradableMarks,71);
 assert.equal(result.ungraded,17);assert.equal(result.unanswered,5);
 assert.ok(result.entries.every(e=>e.referenceAnswer));
 const assessments=[...written,...questions.filter(q=>q.manualReview)].map(q=>({key:q.key,marks:Number(q.marks)}));
 const reviewed=gradeAttempt(questions,state,0,assessments);
 assert.equal(reviewed.score,150);assert.equal(reviewed.selfAssessed,17);assert.equal(reviewed.gradableMarks,150);
});
test('all referenced diagrams are copied into a separate asset directory',async()=>{
 for(const q of questions){
  for(const name of (q.diagram||'').split(',').filter(Boolean))await fs.access(path.join('public',q.assetSubject,q.assetChapter,name+(q.ext||'.png')));
 }
});
test('the descriptive sorting answer matches an exhaustive independent arrangement count',()=>{
 const example=JSON.parse(questions[63].referenceAnswer.match(/\[[012,]+\]/)[0]);
 const swaps=values=>{
  const matrix=Array.from({length:3},()=>[0,0,0]);
  values.forEach((value,index)=>matrix[index<4?0:index<9?1:2][value]++);
  const wrong=12-matrix.reduce((sum,row,index)=>sum+row[index],0);
  let pairs=0;
  for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)pairs+=Math.min(matrix[i][j],matrix[j][i]);
  return pairs+2*(wrong-2*pairs)/3;
 };
 let worst=0,count=0;
 function enumerate(values,remaining){
  if(values.length===12){worst=Math.max(worst,swaps(values));count++;return;}
  for(let value=0;value<3;value++)if(remaining[value]){remaining[value]--;values.push(value);enumerate(values,remaining);values.pop();remaining[value]++;}
 }
 enumerate([],[4,5,3]);assert.equal(count,27720);assert.equal(worst,7);assert.equal(swaps(example),7);
});
