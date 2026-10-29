import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {validateYearPaper,maximumPaperMarks} from '../src/lib/year-papers.mjs';
import {buildMock,gradeAttempt,publicQuestion,validateAttemptState} from '../src/lib/gatemock.mjs';
const paper=JSON.parse(await fs.readFile(new URL('../data/papers/gate-cs-2002.json',import.meta.url),'utf8'));
const questions=paper.questions;
test('2002 source identity, full structure, provenance and independent assets',async()=>{
 assert.equal(validateYearPaper(paper),paper);assert.equal(paper.sourceSha256,'aaa059d0b47e32ade8ea98e4b9bf7e5615717145bbf48095490ea027b5c03a7e');
 assert.equal(questions.length,70);assert.equal(maximumPaperMarks(questions),150);assert.equal(questions.reduce((n,q)=>n+Number(q.marks),0),175);
 assert.deepEqual(['a1','a2','b'].map(id=>questions.filter(q=>q.sectionId===id).length),[25,25,20]);
 assert.equal(questions.filter(q=>q.source.copiedFrom).length,45);assert.equal(questions.filter(q=>q.source.copiedFrom?.scope==='partial-multipart-question').length,3);
 assert.deepEqual(questions.filter(q=>q.manualReview).map(q=>q.paperQuestionNumber),['37','39','46','50']);
 assert.equal(questions[18].source.copiedFrom.year,'2000');assert.equal(questions[21].source.copiedFrom.year,'2001');
 assert.equal(questions[28].optA,questions[28].optD);assert.match(questions[25].text,/Sigma\(6,7\)/);assert.equal(questions[26].optB,"$xy'z$");
 for(const q of questions){
  assert.equal(q.year,'2002');assert.equal(q.examPaper,'CS');assert.equal(q.setNum,'');assert.ok(q.referenceAnswer);assert.ok(q.source.pdfPages.length);assert.ok(q.answerSources.length>=2);
  assert.notEqual(q.id,q.source.copiedFrom?.questionId);
  assert.doesNotMatch(JSON.stringify(publicQuestion(q,0)),/referenceAnswer|correctOptions|answerSources|verificationStatus|copiedFrom|sourceIssues/);
  for(const name of (q.diagram||'').split(',').filter(Boolean))await fs.access(new URL(`../public/Year Papers/GATE CS 2002/${name}${q.ext||'.png'}`,import.meta.url));
 }
});
test('2002 scoring, section limit and book-mock isolation',()=>{
 const mock=buildMock(questions,{mode:'year',year:'2002',examPaper:'CS'},[paper]);assert.equal(mock.totalMarks,150);assert.equal(mock.exact,true);assert.equal(mock.negativeFraction,0);
 assert.throws(()=>buildMock(questions,{mode:'subject',subject:questions[0].subject,count:1,durationMinutes:5}),/Only 0/);
 const state={responses:questions.filter(q=>q.questionType==='MCQ'&&!q.manualReview).map(q=>({key:q.key,value:q.correctOptions})),marked:[],visited:[],currentIndex:0};
 assert.equal(gradeAttempt(questions,state,0).score,67);
 state.responses.push(...questions.slice(50,65).map(q=>({key:q.key,value:'A written proof\nsecond line'})));
 validateAttemptState(state,questions);
 assert.throws(()=>validateAttemptState({...state,responses:[...state.responses,{key:questions[65].key,value:'sixteenth answer'}]},questions),/at most 15/);
 state.responses.push(...questions.filter(q=>q.manualReview).map(q=>({key:q.key,value:['A']})));
 const selfScores=state.responses.filter(r=>questions.find(q=>q.key===r.key).manualReview||questions.find(q=>q.key===r.key).questionType==='SUBJECTIVE').map(r=>({key:r.key,marks:Number(questions.find(q=>q.key===r.key).marks)}));
 assert.equal(gradeAttempt(questions,state,0,selfScores).score,150);
});
test('generalized year-paper validation accepts MSQ and NAT with valid keys',()=>{
 const p=structuredClone(paper);p.questions[0].questionType='MSQ';p.questions[0].correctOptions=['A','C'];validateYearPaper(p);
 p.questions[0].questionType='NAT';p.questions[0].natAnswer='1';p.questions[0].correctOptions=[];validateYearPaper(p);
 p.questions[0].natAnswer='not numeric';assert.throws(()=>validateYearPaper(p),/numerical key/);
});
test('independent boolean enumeration checks K-map, mux and six NAND construction',()=>{
 const gray=[0,1,3,2],cells=[[0,1,1,0],[null,0,0,1],[null,0,0,1],[0,1,1,null]];
 for(let row=0;row<4;row++)for(let col=0;col<4;col++)if(cells[row][col]!==null){const x=gray[col]&1,z=gray[row]&1;assert.equal(Number((x&&!z)||(z&&!x)),cells[row][col]);}
 for(let n=0;n<8;n++){const x=(n>>2)&1,y=(n>>1)&1,z=n&1;const mux=!z?[x,x,y,y][2*(1-y)+z]:0;assert.equal(Number(mux),Number(x&&y&&!z));assert.equal(Number((x&&!y)||(y&&!z)),Number((x||y)&&!(y&&z)));}
 const nand=(a,b)=>1-Number(a&&b);
 for(let n=0;n<64;n++){const [a,b,c,d,e,f]=[5,4,3,2,1,0].map(k=>(n>>k)&1);const n1=nand(a,b),n2=nand(c,d),n3=nand(n1,n2),n4=nand(n3,n3),n5=nand(e,f);assert.equal(nand(n4,n5),Number((a&&b)||(c&&d)||(e&&f)));}
 assert.equal(0x5d+0x6b,0xc8);assert.ok((0xd+0xb)>15);assert.equal(Number(0x5d+0x6b>255),0);
});
test('pipelined adder trace and historical floating encoding',()=>{
 const pairs=[[6,5],[3,5],[7,3],[5,6],[0,0],[0,0],[0,0],[0,0]];
 let r0=[0,0],r1={a:0,b:0,low:0,carry:0},r2={a:0,b:0,low:0,mid:0,carry:0};const out=[];
 for(const [a,b] of pairs){const middle=((r1.a>>1)&1)+((r1.b>>1)&1)+r1.carry;const low=(r0[0]&1)+(r0[1]&1);
  r2={a:r1.a,b:r1.b,low:r1.low,mid:middle&1,carry:middle>>1};r1={a:r0[0],b:r0[1],low:low&1,carry:low>>1};r0=[a,b];
  const high=(r2.a>>2)+(r2.b>>2)+r2.carry;out.push((high<<2)|(r2.mid<<1)|r2.low);
 }assert.deepEqual(out,[0,0,11,8,10,11,0,0]);
 const encoded=(1n<<31n)|(0x780000n<<7n)|65n;assert.equal(encoded.toString(16),'bc000041');
 assert.equal(-Number(0x780000)/2**24*16**(65-64),-7.5);assert.equal(Math.round(Math.log10((1-2**-24)*16**63)),76);
});
test('Floyd loop order checked against BFS for all directed graphs on three vertices',()=>{
 for(let mask=0;mask<512;mask++){const a=Array.from({length:3},(_,i)=>Array.from({length:3},(_,j)=>(mask>>(i*3+j))&1));
  const p=a.map((row,i)=>row.map((v,j)=>i===j?0:v?1:Infinity));for(let i=0;i<3;i++)for(let j=0;j<3;j++)for(let k=0;k<3;k++)p[j][k]=Math.min(p[j][k],p[j][i]+p[i][k]);
  for(let s=0;s<3;s++){const dist=[Infinity,Infinity,Infinity];dist[s]=0;const queue=[s];while(queue.length){const u=queue.shift();for(let v=0;v<3;v++)if(a[u][v]&&dist[v]===Infinity){dist[v]=dist[u]+1;queue.push(v);}}assert.deepEqual(p[s],dist);}
 }
});
test('NFA and DFA match suffix language, Hanoi moves are legal, and view deltas are exact',()=>{
 const dfa=[[1,0],[1,2],[1,3],[1,0]];
 for(let len=0;len<=10;len++)for(let n=0;n<2**len;n++){const str=n.toString(2).padStart(len,'0').slice(-len||Infinity).replaceAll('0','a').replaceAll('1','b');let s=0,states=new Set([0]);for(const c of str){s=dfa[s][c==='b'?1:0];const next=new Set();for(const q of states){if(q===0){next.add(0);if(c==='a')next.add(1);}if(q===1&&c==='b')next.add(2);if(q===2&&c==='b')next.add(3);}states=next;}assert.equal(s===3,str.endsWith('abb'));assert.equal(states.has(3),str.endsWith('abb'));}
 for(let n=0;n<=7;n++){const poles={A:Array.from({length:n},(_,i)=>n-i),B:[],C:[]};let moves=0;function move(k,a,b,c){if(k>0){move(k-1,a,c,b);const disk=poles[a].pop();assert.equal(disk,k);assert.ok(!poles[c].length||poles[c].at(-1)>disk);poles[c].push(disk);moves++;move(k-1,b,a,c);}}move(n,'A','B','C');assert.equal(moves,2**n-1);assert.equal(poles.C.length,n);}
 const old=[[1,2],[2,3],[2,4],[4,5],[6,7],[6,8],[9,10]],join=rows=>[...new Set(rows.flatMap(([a,b])=>rows.filter(([c])=>b===c).map(([,d])=>`${a},${d}`)))].sort();
 const initial=join(old);assert.deepEqual(initial,['1,3','1,4','2,5']);assert.deepEqual(join([...old,[2,11],[11,6]]).filter(t=>!initial.includes(t)),['1,11','11,7','11,8','2,6']);
});
test('literal weight-balance condition permits only perfect tree sizes',()=>{
 const possible=new Map([[0,0]]);
 for(let n=1;n<=1023;n++)for(let left=0;left<n;left++){
  const right=n-1-left;
  if(possible.has(left)&&possible.has(right)&&2*left>=right&&left<=2*right)possible.set(n,1+Math.max(possible.get(left),possible.get(right)));
 }
 assert.deepEqual([...possible.keys()],[0,1,3,7,15,31,63,127,255,511,1023]);
 for(const [n,h] of possible)assert.equal(n,2**h-1);
});
test('dependency projection proves the written BCNF and nonpreservation reference',()=>{
 const bits={L:1,M:2,N:4,O:8,P:16},fds=[[2,8],[12,16],[16,1],[1,6]];
 const closure=(s,rules)=>{let last;do{last=s;for(const [a,b] of rules)if((s&a)===a)s|=b;}while(last!==s);return s;};
 const r1=23,r2=10,project=mask=>Array.from({length:32},(_,s)=>[s,closure(s,fds)&mask]).filter(([s])=>(s&mask)===s);
 const projected=[...project(r1),...project(r2)];assert.equal(closure(bits.N|bits.O,projected)&bits.P,0);
 for(const mask of [r1,r2])for(const [s,c] of project(mask))if(c!==s)assert.equal(closure(s,fds)&mask,mask);
 assert.equal(closure(r1&r2,fds)&r2,r2);
});
