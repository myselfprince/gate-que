import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {validateYearPaper,maximumPaperMarks} from '../src/lib/year-papers.mjs';
import {buildMock,gradeAttempt,publicQuestion,validateAttemptState} from '../src/lib/gatemock.mjs';
import {yearPaperZip} from '../src/lib/year-paper-export.mjs';
import AdmZip from 'adm-zip';
const paper=JSON.parse(await fs.readFile(new URL('../data/papers/gate-cs-2001.json',import.meta.url),'utf8'));
const questions=paper.questions;
test('2001 has complete independent coverage and actual historical sections',async()=>{
 assert.equal(validateYearPaper(paper),paper);assert.equal(questions.length,70);assert.equal(maximumPaperMarks(questions),150);
 assert.equal(questions.reduce((n,q)=>n+Number(q.marks),0),175);
 assert.deepEqual(['a1','a2','b'].map(id=>questions.filter(q=>q.sectionId===id).length),[25,25,20]);
 assert.deepEqual(questions.filter(q=>q.manualReview).map(q=>q.paperQuestionNumber),['3','13','49']);
 assert.equal(questions.filter(q=>q.source.copiedFrom).length,44);
 assert.equal(questions[0].source.copiedFrom.year,'2002');
 for(const q of questions){
  assert.ok(q.referenceAnswer);assert.ok(q.answerSources.length>=2);assert.ok(q.source.pdfPages.length);
  assert.notEqual(q.id,q.source.copiedFrom?.questionId);
  for(const name of [...(q.diagram||'').split(',').filter(Boolean),...['A','B','C','D'].flatMap(k=>q['opt'+k]?.startsWith('IMG:')?[q['opt'+k].slice(4)]:[])])
   await fs.access(new URL(`../public/Year Papers/GATE CS 2001/${name}${q.ext||'.png'}`,import.meta.url));
  assert.doesNotMatch(JSON.stringify(publicQuestion(q,0)),/referenceAnswer|correctOptions|answerSources|verificationStatus|sourceIssues|copiedFrom/);
 }
});
test('2001 remains isolated and choice/assessment scoring respects 150 maximum',()=>{
 const mock=buildMock(questions,{mode:'year',year:'2001',examPaper:'CS'},[paper]);assert.equal(mock.exact,true);
 assert.throws(()=>buildMock(questions,{mode:'subject',subject:questions[0].subject,count:1,durationMinutes:5}),/Only 0/);
 const state={responses:questions.filter(q=>!q.manualReview&&q.questionType==='MCQ').map(q=>({key:q.key,value:q.correctOptions})),marked:[],visited:[],currentIndex:0};
 assert.equal(gradeAttempt(questions,state,0).score,71);
 state.responses.push(...questions.slice(50,65).map(q=>({key:q.key,value:'my proof\nsecond line'})));
 validateAttemptState(state,questions);
 assert.throws(()=>validateAttemptState({...state,responses:[...state.responses,{key:questions[65].key,value:'sixteenth'}]},questions),/at most 15/);
 state.responses.push(...questions.filter(q=>q.manualReview).map(q=>({key:q.key,value:['A']})));
 const manual=state.responses.filter(r=>questions.find(q=>q.key===r.key).questionType==='SUBJECTIVE'||questions.find(q=>q.key===r.key).manualReview).map(r=>({key:r.key,marks:Number(questions.find(q=>q.key===r.key).marks)}));
 assert.equal(gradeAttempt(questions,state,0,manual).score,150);
 const zip=new AdmZip(yearPaperZip({slug:paper.slug,pdf:Buffer.from('question'),answerKey:Buffer.from('solution')}));
 assert.deepEqual(zip.getEntries().map(e=>e.entryName).sort(),['GATE-CS-2001-Answers-and-Solutions.pdf','GATE-CS-2001-Questions.pdf']);
});
test('independent numerical enumeration and traces verify the 2001 references',()=>{
 let count=0;for(let n=1000;n<10000;n+=2)if(new Set(String(n)).size===4)count++;assert.equal(count,2296);
 const trace=s=>s?trace(s.slice(1))+trace(s.slice(1))+s[0]:'';assert.equal(trace('123'),'3323321');
 assert.equal((4096-539).toString(16).toUpperCase(),'DE5');
 const fifo=frames=>{const queue=[];let faults=0;for(const p of [1,2,3,4,1,2,5,1,2,3,4,5])if(!queue.includes(p)){faults++;if(queue.length===frames)queue.shift();queue.push(p);}return faults;};
 assert.deepEqual([fifo(3),fifo(4)],[9,10]);
 // Validate the complete excess-3 to BCD truth table, not just one example.
 for(let d=0;d<=9;d++){const bits=(d+3).toString(2).padStart(4,'0').split('').map(Number);const [w,x,y,z]=bits;
  assert.equal(Number((w||y)&&(!x||z)&&(x||!y||!z)),(d>>2)&1);
 }
 const transitions=[[1,0],[2,0],[2,3],[2,0]];let state=0,output='';for(const bit of '10110001001011011'){const x=Number(bit);output+=((state>>1)^x);state=transitions[state][x];}
 assert.equal(output,'10110010110100011');
 const edges=[[0,1,2],[0,2,8],[0,5,3],[1,3,4],[1,4,12],[2,3,7],[3,4,9],[3,5,4]];let minimum=Infinity,trees=0;
 for(let mask=0;mask<256;mask++){if(mask.toString(2).replaceAll('0','').length!==5)continue;const parent=[0,1,2,3,4,5];const root=i=>parent[i]===i?i:root(parent[i]);let sum=0,cycle=false;edges.forEach(([a,b,w],i)=>{if(mask&(1<<i)){if(root(a)===root(b))cycle=true;parent[root(a)]=root(b);sum+=w;}});if(cycle)continue;if(sum<minimum){minimum=sum;trees=1;}else if(sum===minimum)trees++;}
 assert.deepEqual([minimum,trees],[25,2]);
});
test('source-variant resource programs are checked over every reachable interleaving',()=>{
 function explore(order){
  const p1=[['check',0],['set',0],['check',1],['set',1],['use'],['free',0],['free',1]];
  const p2=order==='opposite'?[['check',1],['set',1],['check',0],['set',0],['use'],['free',1],['free',0]]:[['check',0],['set',0],['check',1],['set',1],['use'],['free',1],['free',0]];
  const seen=new Set();let overlap=false,deadlock=false;
  function walk(pc,flags){const key=JSON.stringify([pc,flags]);if(seen.has(key))return;seen.add(key);if(pc.every(n=>n===4))overlap=true;
   let enabled=0;[p1,p2].forEach((p,i)=>{if(pc[i]===p.length)return;const [op,r]=p[pc[i]];if(op==='check'&&flags[r])return;enabled++;const next=[...pc],f=[...flags];next[i]++;if(op==='set')f[r]=1;if(op==='free')f[r]=0;walk(next,f);});
   if(!enabled&&pc.some(n=>n<7))deadlock=true;
  }walk([0,0],[0,0]);return {overlap,deadlock};
 }
 assert.deepEqual(explore('opposite'),{overlap:false,deadlock:true});
 assert.deepEqual(explore('same'),{overlap:true,deadlock:false});
});
