import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
import {buildMock,paperCoverage,publicQuestion,gradeAttempt,validateAttemptState} from '../src/lib/gatemock.mjs';
import {questionAssetPaths} from '../src/lib/year-paper-assets.mjs';
const paper=JSON.parse(await fs.readFile(new URL('../data/papers/gate-cs-2007.json',import.meta.url),'utf8')),qs=paper.questions;
const state=responses=>({responses,currentIndex:0,visited:[],marked:[]});
test('2007 selected source, complete original sequence and documented marking',()=>{
 assert.equal(validateYearPaper(paper),paper);assert.equal(paper.durationMinutes,180);assert.equal(paper.totalMarks,150);
 assert.equal(paper.sourceSha256,'f3df0aaaf8a898ecd17380984636780d16d897a8d630463fdaab7f1d7187e463');
 assert.deepEqual(['one','two','common','linked'].map(s=>qs.filter(q=>q.sectionId===s).length),[20,50,5,10]);
 assert.equal(qs.filter(q=>q.marks==='1').length,20);assert.equal(qs.filter(q=>q.source.copiedFrom).length,82);
 assert.deepEqual(qs.filter(q=>!q.source.copiedFrom).map(q=>q.paperQuestionNumber),['21','25','28']);
 assert.deepEqual(qs.filter(q=>q.dependsOnKey).map(q=>q.paperQuestionNumber),['77','79','81','83','85']);
 assert.ok(qs.every((q,i)=>q.paperQuestionNumber===String(i+1)&&q.originalLabel===String(i+1)&&q.examPaper==='CS'&&!q.setNum&&!q.sectionLimit&&q.questionType==='MCQ'&&q.referenceAnswer));
 assert.equal(paperCoverage(qs,paper).ready,true);assert.match(paper.instructions.join(' '),/practice policy, not an authenticated official rule/);
});
test('2007 restores source options, complete six-symbol Huffman data and code',()=>{
 assert.equal(qs[4].optB,'1 3 2 4 5 6');assert.equal(qs[4].optC,'1 3 2 4 6 5');assert.equal(qs[11].optA,'$2^h-1$');
 assert.ok(['A','B','C','D'].every(k=>qs[30]['opt'+k].includes('^+')&&!qs[30]['opt'+k].includes('^*')));
 assert.match(qs[31].text,/\(P\)/);assert.equal(qs[31].optD,'S only');assert.match(qs[32].text,/XY\+X'Y'/);
 assert.doesNotMatch(qs[45].code,/leftchild|rightchild|Value = 1/);assert.match(qs[45].code,/value = 1/);
 assert.equal(qs[65].optC,'$20$ metres of cable');assert.equal(qs[65].optD,'$50$ metres of cable');
 assert.match(qs[75].text,/a,b,c,d,e,f/);assert.equal(qs[75].optA.split(',').length,6);assert.equal(qs[76].optD,'1.9375');
 assert.match(qs[80].text,/second time/);assert.ok(qs.every(q=>!q.text.includes('DIAGRAM_PLACEHOLDER')));
});
test('2007 independent copies never enter book mocks; active API projection excludes all keys and provenance',async()=>{
 for(const q of qs){assert.doesNotMatch(JSON.stringify(publicQuestion(q,0)),/correctOptions|referenceAnswer|copiedFrom|gateOverflowUrl|answerSources|verificationStatus|manualReview/);for(const asset of questionAssetPaths(q))await fs.access('public/'+asset);}
 const original={...qs[0],datasetId:undefined,key:'book:original'};
 assert.ok(buildMock([original,...qs],{mode:'year',year:'2007',examPaper:'CS'},[paper]).questions.every(q=>q.datasetId===paper.slug));
 for(const mode of ['subject','topic'])assert.deepEqual(buildMock([original,...qs],{mode,subject:original.subject,chapter:original.chapter,count:1,durationMinutes:5}).questions.map(q=>q.key),['book:original']);
 assert.ok(qs.every(q=>q.id!==q.source.copiedFrom?.questionId));
});
test('2007 source defects stay pending; source penalties, linked eligibility and manual prerequisites are enforced',()=>{
 assert.deepEqual(qs.filter(q=>q.manualReview).map(q=>Number(q.paperQuestionNumber)),[4,15,40,44,51,54,61,62,67,69,80,81]);
 const all=validateAttemptState(state(qs.map(q=>({key:q.key,value:q.correctOptions}))),qs),r=gradeAttempt(qs,all,.25);
 assert.equal(r.score,128);assert.equal(r.ungraded,12);assert.equal(r.entries[80].linkedEligible,null);
 const scores=qs.filter(q=>q.manualReview).map(q=>({key:q.key,marks:Number(q.marks)}));assert.equal(gradeAttempt(qs,all,.25,scores).score,150);
 const partial=gradeAttempt(qs,all,.25,[{key:qs[80].key,marks:2}]);assert.equal(partial.entries[80].status,'ungraded');assert.equal(partial.score,128);
 const wrong=state([{key:qs[0].key,value:['B']},{key:qs[20].key,value:['B']},{key:qs[75].key,value:['B']},{key:qs[76].key,value:['D']}]);
 const w=gradeAttempt(qs,wrong,.25);assert.equal(w.score,-1.25);assert.equal(w.entries[76].status,'linked-ineligible');
 const secondWrong=gradeAttempt(qs,state([{key:qs[75].key,value:['A']},{key:qs[76].key,value:['A']}]),.25);assert.equal(secondWrong.score,2);assert.equal(secondWrong.entries[76].earned,0);
 assert.throws(()=>validateAttemptState(state([{key:qs[0].key,value:['A','B']}]),qs),/option/);
});
test('2007 independently enumerated Boolean truth tables and connective identities',()=>{
 const minterms=fn=>Array.from({length:16},(_,n)=>n).filter(n=>fn(Boolean(n&8),Boolean(n&4),Boolean(n&2),Boolean(n&1)));
 assert.deepEqual(minterms((w,x,y,z)=>(!x&&z)||(x&&!z)),[1,3,4,6,9,11,12,14]);
 const expected=[0,4,5,7,8,9,13,15];
 for(const f of [(w,x,y,z)=>(!x&&!y&&!z)||(!w&&x&&!y)||(w&&!y&&z)||(x&&z),(w,x,y,z)=>(!w&&!y&&!z)||(w&&!x&&!y)||(x&&z),(w,x,y,z)=>(!w&&!y&&!z)||(w&&!x&&!y)||(x&&y&&z)||(x&&!y&&z)])assert.deepEqual(minterms(f),expected);
 assert.notDeepEqual(minterms((w,x,y,z)=>(!x&&!y&&!z)||(w&&!x&&!y)||(!w&&y)),expected);
 const xnor=(x,y)=>Number(x===y);for(const x of [0,1])for(const y of [0,1]){const z=xnor(x,y);assert.equal(xnor(y,z),x);assert.equal(xnor(x,z),y);assert.equal(xnor(xnor(x,y),z),1);}
});
test('2007 independent traces: code, SRT, CRC and two cache traversals',()=>{
 let r=0;const f=n=>{if(n<=0)return 1;if(n>3){r=n;return f(n-2)+2;}return f(n-1)+r;};assert.equal(f(5),18);
 for(const n of [1,2,3,4,5,16,31]){let j=1,comparisons=0;while(++comparisons&&j<=n)j*=2;assert.equal(comparisons,Math.floor(Math.log2(n))+2);}
 const p=[{a:0,left:20},{a:15,left:25},{a:30,left:10},{a:45,left:15}],done=[];
 for(let t=0;t<70;t++){const i=p.map((x,i)=>({...x,i})).filter(x=>x.a<=t&&x.left).sort((a,b)=>a.left-b.left||a.i-b.i)[0]?.i;if(i!==undefined&&--p[i].left===0)done[i]=t+1;}assert.equal(done[1]-15-25,15);
 let crc=parseInt('11001001000',2);for(let bit=10;bit>=3;bit--)if(crc&(1<<bit))crc^=9<<(bit-3);assert.equal(crc,3);
 const cache=Array(32).fill(-1),misses=[],replaced=new Set();for(let pass=0;pass<2;pass++){let count=0;for(let addr=0x1100;addr<0x1100+2500;addr++){const b=Math.floor(addr/64),i=b%32;if(cache[i]!==b){if(pass)replaced.add(i);cache[i]=b;count++;}}misses.push(count);}assert.deepEqual(misses,[40,16]);assert.deepEqual([...replaced].sort((a,b)=>a-b),[4,5,6,7,8,9,10,11]);
});
test('2007 independent parse-tree counting, paging and path enumeration',()=>{
 const grammar={S:[['a','B'],['b','A']],A:[['a'],['a','S'],['b','A','A']],B:[['b'],['b','S'],['a','B','B']]},memo=new Map();
 const count=(v,s)=>{const key=v+':'+s;if(memo.has(key))return memo.get(key);let total=0;for(const [first,...rest] of grammar[v]){if(s[0]!==first)continue;const tail=s.slice(1);if(!rest.length){if(!tail)total++;}else if(rest.length===1)total+=tail?count(rest[0],tail):0;else for(let k=1;k<tail.length;k++)total+=count(rest[0],tail.slice(0,k))*count(rest[1],tail.slice(k));}memo.set(key,total);return total;};
 assert.deepEqual(['aaaabb','aabbbb','aabbab','abbbba'].map(s=>count('S',s)),[0,0,2,0]);
 const refs=[1,2,1,3,7,4,5,6,3,1];const faults=optimal=>{const frames=[];let n=0;refs.forEach((v,i)=>{let at=frames.indexOf(v);if(at>=0){if(!optimal){frames.splice(at,1);frames.push(v);}return;}n++;if(frames.length===3){if(optimal){const next=frames.map(f=>{const at=refs.indexOf(f,i+1);return at<0?Infinity:at;});frames.splice(next.indexOf(Math.max(...next)),1);}else frames.shift();}frames.push(v);});return n;};assert.equal(faults(true),7);assert.equal(faults(false),9);
 const paths=Array.from({length:11},()=>Array(11).fill(0));paths[0][0]=1;for(let x=0;x<=10;x++)for(let y=0;y<=10;y++){if(x<10&&!(x===4&&y===4))paths[x+1][y]+=paths[x][y];if(y<10)paths[x][y+1]+=paths[x][y];}assert.equal(paths[10][10],152416);
 assert.equal([.5,.25,.125,.0625,.03125,.03125].reduce((s,p,i)=>s+p*[1,2,3,4,5,5][i],0),1.9375);
});
