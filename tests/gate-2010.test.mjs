import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
import {buildMock,paperCoverage,publicQuestion,gradeAttempt,validateAttemptState} from '../src/lib/gatemock.mjs';
import {questionAssetPaths} from '../src/lib/year-paper-assets.mjs';
const paper=JSON.parse(await fs.readFile(new URL('../data/papers/gate-cs-2010.json',import.meta.url),'utf8')),qs=paper.questions;
const state=responses=>({responses,currentIndex:0,visited:[],marked:[]});
test('2010 exact source identity, sections, original numbering, aptitude and official linked rules',()=>{
 assert.equal(validateYearPaper(paper),paper);assert.equal(qs.length,65);assert.equal(paper.durationMinutes,180);
 assert.equal(paper.sourceSha256,'c9ae2341cdf2a91b997fa0092bae579cc185c4d84b54af64cee5c01d28958801');
 assert.equal(paper.totalMarks,100);assert.equal(qs.filter(q=>q.marks==='1').length,30);
 assert.deepEqual(['one','two','common','linked','aptitude'].map(s=>qs.filter(q=>q.sectionId===s).length),[25,22,4,4,10]);
 assert.equal(qs.slice(55).reduce((sum,q)=>sum+Number(q.marks),0),15);
 assert.deepEqual(qs.filter(q=>q.dependsOnKey).map(q=>q.paperQuestionNumber),['53','55']);
 assert.ok(qs.filter(q=>q.dependsOnKey).every(q=>q.negativeFraction===0));
 assert.equal(qs.filter(q=>q.source.copiedFrom).length,51);assert.equal(qs.filter(q=>!q.source.copiedFrom).length,14);
 assert.ok(qs.every((q,i)=>q.paperQuestionNumber===String(i+1)&&q.examPaper==='CS'&&!q.setNum&&!q.sectionLimit&&q.referenceAnswer&&q.answerSources));
 assert.equal(paperCoverage(qs,paper).ready,true);
});
test('2010 source corrections, explicit disputes, complete assets and active answer secrecy',async()=>{
 assert.deepEqual(qs.filter(q=>q.manualReview).map(q=>q.paperQuestionNumber),['34','48','49','63']);
 assert.match(qs[16].optC,/L_2\\cap L_3/);assert.match(qs[39].optC,/L1 and L2/);
 assert.match(qs[35].code,/head == NULL/);assert.doesNotMatch(qs[35].code,/q = P/);
 assert.deepEqual(qs[33].correctOptions,['B']);assert.deepEqual(qs[34].correctOptions,['C']);assert.deepEqual(qs[60].correctOptions,['C']);
 assert.equal(paper.assetManifest.files.length,6);
 for(const q of qs){assert.doesNotMatch(JSON.stringify(publicQuestion(q,0)),/correctOptions|referenceAnswer|copiedFrom|gateOverflowUrl|answerSources/);for(const asset of questionAssetPaths(q))await fs.access('public/'+asset);}
 const book={...qs[0],datasetId:undefined,key:'book:original'};
 assert.ok(buildMock([book,...qs],{mode:'year',year:'2010',examPaper:'CS'},[paper]).questions.every(q=>q.datasetId===paper.slug));
 assert.deepEqual(buildMock([book,...qs],{mode:'subject',subject:book.subject,count:1,durationMinutes:5}).questions.map(q=>q.key),['book:original']);
});
test('2010 scoring, thirds, linked ineligibility and review policy',()=>{
 const all=validateAttemptState(state(qs.map(q=>({key:q.key,value:q.correctOptions}))),qs);
 const result=gradeAttempt(qs,all,paper.negativeFraction);assert.equal(result.score,92);assert.equal(result.ungraded,4);
 assert.equal(result.entries.length,65);assert.ok(result.entries.every(e=>e.referenceAnswer));
 const s=validateAttemptState(state([{key:qs[0].key,value:['A']},{key:qs[25].key,value:['B']},{key:qs[51].key,value:['A']},{key:qs[52].key,value:['C']},{key:qs[53].key,value:['C']},{key:qs[54].key,value:['A']}]),qs);
 const r=gradeAttempt(qs,s,1/3);assert.equal(r.score,.3333);assert.equal(r.entries[52].earned,0);assert.equal(r.entries[52].status,'linked-ineligible');assert.equal(r.entries[54].earned,0);
 assert.throws(()=>validateAttemptState(state([{key:qs[0].key,value:'written'}]),qs),/option/);
 assert.throws(()=>validateAttemptState(state([{key:qs[0].key,value:['A','B']}]),qs),/option/);
 const review=gradeAttempt(qs,all,1/3,[{key:qs[33].key,marks:1.5}]);assert.equal(review.score,93.5);assert.equal(review.entries[33].status,'self-assessed');
});
test('independent program, FIFO, degree sequences, octal and digit-count checks',()=>{
 const f=a=>!a.length?0:a[0]%2===0?a[0]+f(a.slice(1)):a[0]-f(a.slice(1));assert.equal(f([12,7,13,4,11,6]),15);
 const fifo=[];let faults=0;for(const p of [...Array(100).keys(),...Array.from({length:100},(_,i)=>99-i)])if(!fifo.includes(p)){faults++;if(fifo.length===4)fifo.shift();fifo.push(p);}assert.equal(faults,196);
 const graphical=a=>{a=[...a];while(a.length){a.sort((x,y)=>y-x);const n=a.shift();if(n<0||n>a.length)return false;for(let i=0;i<n;i++)if(--a[i]<0)return false;}return true;};
 assert.deepEqual([[7,6,5,4,4,3,2,1],[6,6,6,6,3,3,2,2],[7,6,6,4,4,3,2,2],[8,7,7,6,4,2,1,1]].map(graphical),[true,false,true,false]);
 assert.equal((parseInt('137',8)+parseInt('276',8)).toString(8),'435');assert.equal((parseInt('731',8)+parseInt('672',8)).toString(8),'1623');
 let count=0;for(let n=3001;n<5000;n++){const s=String(n);if([...s].every(c=>'234'.includes(c))&&[...s].filter(c=>c==='2').length<=2&&[...s].filter(c=>c==='3').length<=3)count++;}assert.equal(count,51);
 assert.equal((0xf87b*8)&65535,0xc3d8);assert.ok(Math.abs((3.5-(3.5**2-13)/7)-3.607142857142857)<1e-12);
});
test('exhaustive subsequence optimization confirms Q34 conflict with printed D',()=>{
 const best=a=>{let max=0;for(let mask=0;mask<2**a.length;mask++){let sum=0,k=0;for(let i=0;i<a.length;i++)if(mask&(1<<i))sum+=a[i]/2**k++;max=Math.max(max,sum);}return max;};
 for(let code=0;code<625;code++){let x=code;const a=Array.from({length:4},()=>{const n=x%5-2;x=Math.floor(x/5);return n;});const y=best(a.slice(1));assert.equal(best(a),Math.max(y,a[0]+y/2));}
 assert.notEqual(best([-1,2]),-1+best([2])/2);
});
test('all hash insertion permutations and graph routes independently verify linked/common data',()=>{
 const insert=xs=>{const t=Array(10).fill(null);for(const x of xs){let i=x%10;while(t[i]!==null)i=(i+1)%10;t[i]=x;}return t;};
 const target=[null,null,42,23,34,52,46,33,null,null],perm=a=>a.length?a.flatMap((v,i)=>perm(a.filter((_,j)=>i!==j)).map(p=>[v,...p])):[[]];
 assert.equal(perm([42,23,34,52,46,33]).filter(xs=>JSON.stringify(insert(xs))===JSON.stringify(target)).length,30);
 const edges=[[0,1,6],[0,2,3],[1,2,2],[1,3,7],[2,4,9],[3,4,1],[3,5,8],[4,5,4]];
 const unused=es=>{const d=Array.from({length:6},(_,i)=>Array.from({length:6},(_,j)=>i===j?0:Infinity));for(const [u,v,w]of es)d[u][v]=d[v][u]=w;for(let k=0;k<6;k++)for(let i=0;i<6;i++)for(let j=0;j<6;j++)d[i][j]=Math.min(d[i][j],d[i][k]+d[k][j]);return es.filter(([u,v,w])=>d[u][v]<w);};
 assert.equal(unused(edges).length,2);const altered=edges.map(e=>unused(edges).includes(e)?[e[0],e[1],2]:e);assert.equal(unused(altered).length,1);
 const w=[[0,1,8,1,4],[1,0,12,4,9],[8,12,0,7,3],[1,4,7,0,2],[4,9,3,2,0]];
 const paths=(u,target,seen=[u],cost=0)=>u===target?[cost]:seen.length===4?[]:w[u].flatMap((weight,v)=>seen.includes(v)?[]:paths(v,target,[...seen,v],cost+weight));assert.equal(Math.min(...paths(1,2)),8);
 const allEdges=[];for(let u=0;u<5;u++)for(let v=u+1;v<5;v++)allEdges.push([u,v,w[u][v]]);let min=Infinity;
 for(let mask=0;mask<1<<10;mask++){const es=allEdges.filter((_,i)=>mask&(1<<i));if(es.length!==4||es.filter(([u,v])=>u===0||v===0).length!==1)continue;const seen=new Set([0]);for(let i=0;i<5;i++)for(const [u,v]of es){if(seen.has(u))seen.add(v);if(seen.has(v))seen.add(u);}if(seen.size===5)min=Math.min(min,es.reduce((s,e)=>s+e[2],0));}assert.equal(min,10);
});
