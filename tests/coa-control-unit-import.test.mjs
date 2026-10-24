import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CONTROL_UNIT_IMPORT as source} from '../data/imports/coa-control-unit.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('27 printed questions retain page coverage, exam metadata and the supplied answer key',()=>{
  const key='A,B B C A A B D C B A A B D B B B B B D C C C D D 5 D 10.2'.split(' ');
  assert.equal(source.questions.length,27);
  assert.equal(new Set(source.questions.map(q=>q.id)).size,27);
  for(const [i,q] of source.questions.entries()) {
    assert.equal(q.source.questionNumber,`2.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,3);
    assert.match(q.source.notes[0],/book page 265/);
    assert.equal(q.correctOptions.join(',')||q.natAnswer,key[i]);
    assert.equal(q.setNum,'');
    assert.deepEqual(q.source.bookPages,[i<9?261:i<15?262:i<23?263:264]);
    assert.deepEqual(q.source.pdfPages,[i<9?1:i<23?2:3]);
  }
  assert.deepEqual(source.questions.reduce((counts,q)=>({...counts,[q.questionType]:(counts[q.questionType]||0)+1}),{}),{MSQ:1,MCQ:24,NAT:2});
  assert.equal(source.questions[26].year,'2023');
  assert.equal(source.questions[23].marks,'2');
});

test('shared figures, editable control tables and column continuations survive exports',()=>{
  assert.equal(source.questions[15].diagram,source.questions[16].diagram);
  assert.ok(source.questions[15].text.startsWith('Common Data for Q.2.16 & Q.2.17:'));
  assert.ok(source.questions[16].text.startsWith('Common Data for Q.2.16 & Q.2.17:'));
  assert.match(source.questions[9].text,/\\mathrm\{PCin,Bout\}/);
  assert.match(source.questions[12].text,/\\mathrm\{S5,S10\}/);
  assert.match(source.questions[25].text,/\\mathrm\{MDR\}_r,\\mathrm\{IR\}_w/);
  assert.match(source.questions[3].text,/How many CPU clock cycles/);
  assert.doesNotMatch(source.questions.map(q=>q.text).join('\n'),/Explanations|1\.40|1\.41|1\.42/);
  const images=collectLatexImages(source.questions);
  assert.equal(images.length,3);
  for(const name of images) assert.ok(fs.statSync(new URL(`../public/${source.subject}/${source.chapter}/${name}`,import.meta.url)).size>10000);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,27);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,26);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]/);
  assert.match(tex,/\\pagecolor\{black\}/);
});

test('repeat import preserves user edits, IDs and locks; unreviewed collisions fail closed',()=>{
  const first=mergeReviewedImport([],source.questions,[]);
  assert.equal(first.added,27);
  first.questions[0].text='User edited prose';
  first.questions[0].isPosLocked=true;
  first.questions[0].correctOptions=['D'];
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,27);
  assert.deepEqual(repeated.questions,first.questions);
  const collision={...source.questions[0]};delete collision.source;
  assert.throws(()=>mergeReviewedImport([collision],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[0]],source.questions,[]),/Duplicate source/);
});
