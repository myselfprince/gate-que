import test from 'node:test';
import assert from 'node:assert/strict';
import { TCP_UDP_IP_IMPORT as source } from '../data/imports/cn-tcp-udp-ip.mjs';
import { normalizeQuestionMetadata } from '../src/lib/question-metadata.mjs';
import { collectLatexImages } from '../src/lib/latex-source.mjs';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';
import { mergeReviewedImport, printedQuestion, recordHash, sourceQuestions } from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('all 94 source numbers, printed answers, types and continuations are retained',()=>{
  const key='D D D B A C A D C B A D B B D D D C B A D C C C A A C D C B D C A D B B C B D C C B D D A C C A C C 1100 5 C 26 D D 1 256 A B B B C A C A 158 13 1.1 B 36 C D 34or35 C C B 44 D B,C,D A,B A 33 B,C,D C,D 3 C,D B,D 6 40 A,B C,D D 4'.split(' ');
  assert.equal(source.questions.length,94);
  assert.equal(new Set(source.questions.map((q)=>q.id)).size,94);
  source.questions.forEach((q,i)=>{
    assert.equal(q.source.questionNumber,`3.${i+1}`);
    assert.equal((q.natAnswer || q.correctOptions.join(',')).replaceAll(' ',''),key[i]);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
  });
  for(const [number,pages] of [[21,[1,2]],[56,[3,4]],[64,[4]],[81,[5]]]) assert.deepEqual(source.questions[number-1].source.pdfPages,pages);
  assert.deepEqual(source.questions[63].source.bookPages,[692,693]);
  assert.deepEqual(source.questions[80].source.bookPages,[694,695]);
  assert.equal(source.questions[79].questionType,'MSQ');
  assert.equal(source.questions[78].questionType,'MCQ');
  assert.equal(source.questions[73].natAnswer,'34 or 35');
  assert.match(source.questions[2].optA,/172\.56\.87\.23\.2/);
  assert.match(source.questions[24].optA,/1-N/);
});

test('reviewed matching preserves edits, order, IDs, locks and source versions without duplicates',()=>{
  const edited={...source.questions[2],id:'existing-id',text:'A user edit',marks:'1',isPosLocked:true,source:undefined};
  delete edited.source;
  const extra={id:'unrelated',text:'Keep this record',code:'kept',isPosLocked:true};
  const reviewed=[{number:'3.3',id:edited.id,beforeHash:recordHash(edited),correctOptions:['D'],conflicts:['Marks differ']}];
  const first=mergeReviewedImport([edited,extra],source.questions,reviewed);
  assert.equal(first.added,93);
  assert.equal(first.alreadyPresent,1);
  for(const key of Object.keys(edited)) assert.deepEqual(first.questions[0][key],edited[key]);
  assert.deepEqual(first.questions[1],extra);
  assert.deepEqual(normalizeQuestionMetadata(first.questions[0]).source,first.questions[0].source);
  const readback=sourceQuestions({questions:first.questions},source.sourceHash);
  readback.forEach((q,i)=>assert.deepEqual(printedQuestion(q),printedQuestion(source.questions[i])));
  const next=mergeReviewedImport(first.questions,source.questions,reviewed);
  assert.equal(next.added,0);
  assert.equal(next.metadataAdded,0);
  assert.deepEqual(next.questions,first.questions);
  assert.throws(()=>mergeReviewedImport([{...edited,text:'Concurrent user edit'},extra],source.questions,reviewed),/changed/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[0]],source.questions,reviewed),/Duplicate source/);
});

test('invalid source-version metadata cannot bypass answer validation',()=>{
  const q=source.questions[0];
  const version={...q.source,verifiedQuestion:printedQuestion(q),reviewConflicts:[]};
  assert.deepEqual(normalizeQuestionMetadata({source:version}).source,version);
  assert.throws(()=>normalizeQuestionMetadata({source:{...version,verifiedQuestion:{...version.verifiedQuestion,correctOptions:['Z']}}}));
  assert.throws(()=>normalizeQuestionMetadata({source:{...version,verifiedQuestion:{...version.verifiedQuestion,text:''}}}));
  assert.throws(()=>normalizeQuestionMetadata({source:{...version,reviewConflicts:[null]}}));
});

test('export preserves editable tables, shared data, figures and the established page layout',()=>{
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,94);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,93);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.match(tex,/\\color\{white\}/);
  assert.match(tex,/\\begin\{minipage\}\[t\]\{\\textwidth\}/);
  assert.match(tex,/\\begin\{array\}/);
  assert.match(tex,/p\{0\.46\\linewidth\}@\{\\hspace\{0\.08\\linewidth\}\}/);
  assert.doesNotMatch(tex,/\[IMG_\d\]/);
  assert.equal(collectLatexImages(source.questions).length,4);
  assert.match(source.questions[12].text,/180 bytes/);
  assert.match(source.questions[37].text,/192\.168\.1\.97/);
});
