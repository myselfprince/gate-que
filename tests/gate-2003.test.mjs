import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {validateYearPaper,maximumPaperMarks,publicPaper} from '../src/lib/year-papers.mjs';
import {buildMock,gradeAttempt,publicQuestion,validateAttemptState,paperCoverage} from '../src/lib/gatemock.mjs';
import {examSections} from '../src/lib/gate-exam-screen.mjs';
import {renderSourceQuestion} from '../src/lib/latex-source.mjs';
const paper=JSON.parse(await fs.readFile(new URL('../data/papers/gate-cs-2003.json',import.meta.url),'utf8'));
const qs=paper.questions;
const state=responses=>({currentIndex:0,responses,marked:[qs[0].key],visited:[qs[0].key]});
test('2003 exact source, 90 original positions, 150 marks and independent copies',async()=>{
 assert.equal(validateYearPaper(paper),paper);assert.equal(paper.sourceSha256,'96d31f045242668747703711ac67fa41d7a624f08e08af389d441681c357480d');
 assert.equal(qs.length,90);assert.equal(maximumPaperMarks(qs),150);assert.equal(paper.availableMarks,150);
 assert.deepEqual(examSections(qs).map(s=>[s.indices.length,s.limit]),[[30,undefined],[60,undefined]]);
 assert.equal(qs.filter(q=>q.source.copiedFrom).length,76);assert.equal(new Set(qs.map(q=>q.source.copiedFrom?.questionId).filter(Boolean)).size,76);
 assert.equal(qs.filter(q=>q.answerSources.some(s=>s.kind==='made-easy-key')).length,44);
 assert.deepEqual(qs.filter(q=>q.manualReview).map(q=>Number(q.paperQuestionNumber)),[15,18,24,35,37,42,45,60,65,72,74,84]);
 for(const [i,q] of qs.entries()){
  assert.equal(q.paperQuestionNumber,String(i+1));assert.equal(q.originalLabel,String(i+1));assert.equal(q.examPaper,'CS');assert.equal(q.year,'2003');assert.equal(q.setNum,'');assert.equal(q.questionType,'MCQ');assert.equal(q.marks,i<30?'1':'2');
  assert.notEqual(q.id,q.source.copiedFrom?.questionId);assert.ok(q.referenceAnswer);assert.ok(q.source.pdfPages.length);assert.equal(q.source.sha256,paper.sourceSha256);
  for(const name of [...(q.diagram||'').split(',').filter(Boolean),...['A','B','C','D'].flatMap(l=>q[`opt${l}`]?.startsWith('IMG:')?[q[`opt${l}`].slice(4)]:[])])await fs.access(new URL(`../public/Year Papers/GATE CS 2003/${name}${q.ext||'.png'}`,import.meta.url));
 }
 assert.match(qs[34].text,/sqrt\{n-1\}/);assert.match(qs[71].optB,/\\vee\(Q/);assert.equal(qs[64].text.includes('inserting'),false);
 assert.equal(qs[81].optB,'10.35.28.2 and 10.35.29.4');assert.equal(qs[67].diagram,'q68-greedy-3-4-graph');
});
test('2003 active question and catalog payloads never expose stored keys or worked references',()=>{
 for(const q of qs)assert.doesNotMatch(JSON.stringify(publicQuestion(q,0)),/referenceAnswer|correctOptions|natAnswer|answerSources|verificationStatus|gateOverflowUrl|copiedFrom|manualReview/);
 assert.doesNotMatch(JSON.stringify(publicPaper(paper)),/correctOptions|referenceAnswer|answerSources|copiedFrom/);
});
test('three diagram options retain original A-B-C-D order in a readable single-row export',()=>{
 const source=renderSourceQuestion(qs[64]);assert.match(source,/p\{0\.31\\linewidth\}/);
 assert.ok(source.indexOf('q65-option-a')<source.indexOf('q65-option-b'));
 assert.ok(source.indexOf('q65-option-b')<source.indexOf('q65-option-c'));
 assert.ok(source.indexOf('q65-option-c')<source.indexOf('None of the above'));
});
test('2003 source selection excludes all other years and every subject mock excludes year copies',()=>{
 const book={...qs[0],id:'book-id',key:'book-key',datasetId:undefined};
 const other={...qs[0],key:'other-year',year:'2002',datasetId:'gate-cs-2002'};
 const bank=[other,book,...qs];assert.equal(paperCoverage(bank,paper).ready,true);
 const mock=buildMock(bank,{mode:'year',year:'2003',examPaper:'CS'},[paper]);assert.deepEqual(mock.questions.map(q=>q.key),qs.map(q=>q.key));
 assert.equal(mock.totalMarks,150);assert.equal(mock.durationMinutes,180);assert.equal(mock.negativeFraction,0);
 assert.deepEqual(buildMock(bank,{mode:'subject',subject:book.subject,count:1,durationMinutes:1}).questions.map(q=>q.key),['book-key']);
});
test('2003 all 90 responses save, 129 objective marks grade and 21 disputed marks self-assess',()=>{
 const responses=qs.map(q=>({key:q.key,value:q.correctOptions}));validateAttemptState(state(responses),qs);
 const result=gradeAttempt(qs,state(responses),0);assert.equal(result.score,129);assert.equal(result.ungraded,12);assert.equal(result.gradableMarks,129);
 const assessed=gradeAttempt(qs,state(responses),0,qs.filter(q=>q.manualReview).map(q=>({key:q.key,marks:Number(q.marks)})));assert.equal(assessed.score,150);
 assert.throws(()=>validateAttemptState(state([{key:qs[0].key,value:['A','B']}]),qs),/Invalid option/);
 assert.throws(()=>validateAttemptState(state([{key:qs[0].key,value:'written answer'}]),qs),/Invalid option/);
});
test('literal scanned recurrence differs from corrected-version B; sum verified for 50 squares',()=>{
 let t=1;for(let n=1;n<2500;n++){
  t+=Math.floor(Math.sqrt(n-1));const m=Math.sqrt(n+1);
  if(Number.isInteger(m)){const normal=m*(4*m*m-3*m+5)/6;assert.equal(t,normal-2*m+2);assert.notEqual(t,normal);}
 }
});
test('all binary cubes prove the source K-map has minimum SOP 8 and POS 9 literals',()=>{
 const gray=[0,1,3,2],map=[[null,1,0,1],[0,1,null,0],[1,null,null,0],[null,0,0,null]],one=[],zero=[];
 for(let i=0;i<4;i++)for(let j=0;j<4;j++){if(map[i][j]===1)one.push(gray[i]*4+gray[j]);if(map[i][j]===0)zero.push(gray[i]*4+gray[j]);}
 function minCover(target,forbidden){const dp=new Map([[0,0]]),full=target.reduce((m,n)=>m|(1<<n),0);
  for(let c=0;c<81;c++){let t=c;const pattern=[];for(let i=0;i<4;i++){pattern.push(t%3-1);t=Math.floor(t/3);}
   const hit=Array.from({length:16},(_,n)=>n).filter(n=>pattern.every((v,i)=>v===-1||v===(n>>(3-i)&1)));
   if(hit.some(n=>forbidden.includes(n)))continue;const mask=hit.filter(n=>target.includes(n)).reduce((m,n)=>m|(1<<n),0),cost=pattern.filter(v=>v!==-1).length;
   for(const [seen,best] of [...dp])if(!dp.has(seen|mask)||best+cost<dp.get(seen|mask))dp.set(seen|mask,best+cost);
  }return dp.get(full);
 }
 assert.equal(minCover(one,zero),8);assert.equal(minCover(zero,one),9);
 for(let i=0;i<4;i++)for(let j=0;j<4;j++)if(map[i][j]!==null){const n=gray[i]*4+gray[j],[x,y,z,w]=[3,2,1,0].map(k=>(n>>k)&1);
  assert.equal(Number((!y&&!w)||(!x&&!z&&w)||(x&&!z&&!w)),map[i][j]);
  assert.equal(Number((!z||!w)&&(!y||!z)&&(x||z||w)&&(!x||!w)),map[i][j]);
 }
});
test('operation tables, signed divisibility and source linear-system consistency',()=>{
 const plus=['bac','abc','acb'],mul=['abc','bca','ccb'],abc='abc',valid=[];
 for(const x of abc)for(const y of abc){const f=(r,c)=>r[abc.indexOf(c)],sum=(x,y)=>plus[abc.indexOf(x)][abc.indexOf(y)];if(sum(f(mul[0],x),f(mul[0],y))==='c'&&sum(f(mul[1],x),f(mul[2],y))==='c')valid.push(x+y);}
 assert.deepEqual(valid,['bc','cb']);assert.equal(Math.abs(-25%-5),0);
 const x=-11/5,u=23/5;assert.ok(Math.abs(4*x+3*u-5)<1e-10);assert.ok(Math.abs(x+2*u-7)<1e-10);assert.ok(Math.abs(2*x+u-.2)<1e-10);
});
test('DFA count and Turing-machine trace enumerate all short inputs',()=>{
 const delta=[[1,0],[2,0],[2,3],[3,3]];let count=0;
 for(let n=0;n<128;n++){const s=n.toString(2).padStart(7,'0');if(s[0]!=='1'||s[3]!=='1'||s[6]!=='1')continue;let q=0;for(const bit of s)q=delta[q][Number(bit)];if(q===3)count++;}assert.equal(count,7);
 for(let len=0;len<=8;len++)for(let v=0;v<2**len;v++){
  const s=len?v.toString(2).padStart(len,'0'):'',tape=s.split('');let q=0,p=0,halt=false;const seen=new Set();
  while(true){const symbol=tape[p]??'B',key=JSON.stringify([q,p,tape]);if(seen.has(key))break;seen.add(key);if(q===0&&symbol==='B'){halt=true;break;}
   if(q===0){tape[p]='1';q=1;p++;}else if(symbol==='0'){tape[p]='1';p++;}else{q=0;p--;}
  }assert.equal(halt,len===0);
 }
});
test('source graph MST, exact stack lifetime, nine-bit rotation and semaphore block property',()=>{
 const edges=[['a','c',1],['c','d',2],['a','d',2],['b','g',2],['e','i',2],['b','d',3],['h','i',4],['f','h',4],['i','j',5],['a','b',6],['a','e',8],['e','h',8],['g','h',8],['f','i',9],['e','f',11],['g','i',14],['d','h',15],['g','j',19]];
 const parent=Object.fromEntries('abcdefghij'.split('').map(v=>[v,v]));function root(v){return parent[v]===v?v:root(parent[v]);}let sum=0,k=0;for(const [a,b,w] of edges.toSorted((a,b)=>a[2]-b[2]))if(root(a)!==root(b)){parent[root(a)]=root(b);sum+=w;k++;}assert.equal(k,9);assert.equal(sum,31);
 for(let n=1;n<=40;n++){const X=3,Y=7;const lives=Array.from({length:n},(_,i)=>{const pushEnd=i*(X+Y)+X,popStart=(2*n-i-1)*(X+Y);return popStart-pushEnd;});assert.equal(lives.reduce((a,b)=>a+b,0)/n,n*(X+Y)-X);}
 for(let a=0;a<256;a++)for(let initial=0;initial<2;initial++){let ring=initial*256+a,ones=0;for(let i=0;i<8;i++){ones+=ring&1;ring=(ring>>1)|((ring&1)<<8);}assert.equal(ones,a.toString(2).replaceAll('0','').length);ring=(ring>>1)|((ring&1)<<8);assert.equal(ring&255,a);}
 for(let s=0;s<1024;s++){const out=s.toString(2).padStart(10,'0').split('').map(c=>c+c).join('');assert.doesNotMatch(out,/01(?:11)*0|10(?:00)*1/);}
});
test('program remainder sieve prints nothing; inversion and timing calculations agree',()=>{
 for(let n=3;n<=1000;n++){const a=Array(n+1).fill(0);for(let k=2;k<=2*Math.floor(Math.log2(n));k++)for(let j=k+1;j<=n;j++)a[j]=Number(Boolean(a[j]||j%k));assert.ok(a.slice(3).every(Boolean));}
 assert.ok(Math.abs(2*2000/(2e8)*1e7/8-25)<1e-10);assert.ok(Math.abs(5000/(450e-6)-11.111111111e6)<.01);
 assert.equal(Math.round((1+2+.04*20)*2)/2,4);assert.equal((1+3)*4096,16384);
});
