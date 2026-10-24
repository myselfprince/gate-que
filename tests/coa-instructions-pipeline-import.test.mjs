import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {INSTRUCTIONS_PIPELINE_IMPORT as source} from '../data/imports/coa-instructions-pipeline.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('46 printed questions retain book order, complete source references and printed answers',()=>{
  const key='B A B D D C A C A B C D C B B B C D A D D B B C B 4 1.6 C 1.54 3.2 13 B 3 33.28 4 28 1.508 219 2.16 17160 1.875 1.42 2040 B,C,D C 3'.split(' ');
  const sets={26:'1',27:'1',28:'3',29:'3',30:'1',31:'2',32:'3',33:'3',34:'1',35:'2',36:'2',37:'1',40:'1',41:'2',44:'1',45:'2',46:'2'};
  assert.equal(source.questions.length,46);
  assert.equal(new Set(source.questions.map(q=>q.id)).size,46);
  for(const [i,q] of source.questions.entries()) {
    const n=i+1;
    assert.equal(q.source.questionNumber,`3.${n}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,4);
    assert.match(q.source.notes[0],/book page 275/);
    assert.equal(q.correctOptions.join(',')||q.natAnswer,key[i]);
    assert.equal(q.setNum,sets[n]||'');
    assert.deepEqual(q.source.pdfPages,[n<=14?1:n<=29?2:n<=43?3:4]);
    const pages=n<9?[268]:n===9?[268,269]:n<=14?[269]:n<22?[270]:n===22?[270,271]:n<=29?[271]:n<37?[272]:n===37?[272,273]:n<=43?[273]:[274];
    assert.deepEqual(q.source.bookPages,pages);
    assert.equal((q.text.match(/\$/g)||[]).length%2,0);
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,q.questionType==='NAT'?0:4);
  }
  assert.deepEqual(source.questions.reduce((counts,q)=>({...counts,[q.questionType]:(counts[q.questionType]||0)+1}),{}),{MCQ:27,NAT:17,MSQ:2});
  assert.equal(source.questions[1].year,'2002');
  assert.deepEqual(source.questions[43].correctOptions,['B','C','D']);
  assert.equal(source.questions[44].questionType,'MSQ');
  assert.deepEqual(source.questions[44].correctOptions,['C']);
});

test('shared data, separate code, editable tables, continuations and figures survive export',()=>{
  assert.equal(source.questions[12].code,source.questions[13].code);
  for(const n of [13,14])assert.ok(source.questions[n-1].text.startsWith('Common Data for Q.3.13 & 3.14:'));
  for(const n of [19,20])assert.ok(source.questions[n-1].text.startsWith('Common Data for Q.3.19 & Q.3.20:'));
  for(const n of [6,12,21,33])assert.match(source.questions[n-1].text,/\\begin\{array\}/);
  for(const n of [6,9,13,14,16,20,21,22,31,32,41,45]) {
    assert.ok(source.questions[n-1].code);
    assert.match(source.questions[n-1].text,/\[CODE\]/);
  }
  assert.match(source.questions[8].text,/starting from the fetch/);
  assert.equal(source.questions[21].optD,'19');
  assert.match(source.questions[36].text,/20 independent instructions/);
  assert.match(source.questions[19].code,/R6x/);
  assert.equal(source.questions[33].natAnswer,'33.28');
  assert.doesNotMatch(source.questions.map(q=>q.text).join('\n'),/Explanations|Memory Organization/);
  const images=collectLatexImages(source.questions);
  assert.equal(images.length,2);
  for(const name of images)assert.ok(fs.statSync(new URL(`../public/${source.subject}/${source.chapter}/${name}`,import.meta.url)).size>10000);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,46);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,45);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]/);
  assert.match(tex,/\\pagecolor\{black\}/);
});

test('repeat import preserves edits, IDs and locks; new collisions are rejected',()=>{
  const first=mergeReviewedImport([],source.questions,[]);
  assert.equal(first.added,46);
  first.questions[0].text='User edited prose';
  first.questions[0].isPosLocked=true;
  first.questions[0].correctOptions=['D'];
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,46);
  assert.deepEqual(repeated.questions,first.questions);
  const collision={...source.questions[0]};delete collision.source;
  assert.throws(()=>mergeReviewedImport([collision],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[0]],source.questions,[]),/Duplicate source/);
});
