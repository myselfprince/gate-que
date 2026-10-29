import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {IO_ORGANISATION_IMPORT as source} from '../data/imports/coa-io-organisation.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('IO source covers all 34 printed questions, keys, pages, types and sets',()=>{
  const key=['30','A','C','B','C','D','A,B,C,D','A','D','C','D','A','B','B','B','C','D','A','B','D','C','C','C','B','A','D','14020','6.1','456','A','80000','A','C','B'];
  assert.equal(source.questions.length,34);
  for(const [i,q] of source.questions.entries()) {
    assert.equal(q.source.questionNumber,`5.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,3);
    assert.equal(q.correctOptions.join(',')||q.natAnswer,key[i]);
    assert.match(q.source.notes[0],/book page 307/);
    const n=i+1;
    assert.deepEqual(q.source.bookPages,n<=9?[303]:n<=19?[304]:n===20?[304,305]:n<=27?[305]:n===28?[305,306]:[306]);
    assert.deepEqual(q.source.pdfPages,n<=9?[1]:n<=27?[2]:n===28?[2,3]:[3]);
    assert.equal(q.setNum,({27:'1',28:'2',29:'1',31:'2',33:'1',34:'2'})[n]||'');
  }
  assert.deepEqual(source.questions.reduce((counts,q)=>({...counts,[q.questionType]:(counts[q.questionType]||0)+1}),{}),{NAT:5,MCQ:28,MSQ:1});
});

test('shared passages, page continuations, editable code/table and source defects survive export',()=>{
  for(const n of [11,12]) assert.match(source.questions[n-1].text,/A disk has 8 equidistant tracks/);
  for(const n of [22,23]) assert.match(source.questions[n-1].text,/10 platters each with 2 recording surfaces/);
  assert.match(source.questions[19].text,/Number of tracks = 500[\s\S]*Rotation speed = 600 rpm/);
  assert.match(source.questions[27].text,/controller's transfer time is 10 times/);
  assert.match(source.questions[3].text,/\\begin\{array\}/);
  assert.match(source.questions[24].text,/\[CODE\]/);
  assert.match(source.questions[24].code,/LOOP: Load a byte from device/);
  assert.match(source.questions[24].source.notes.join(' '),/Unresolved source wording/);
  assert.match(source.questions[0].source.notes.join(' '),/units are inconsistent/);
  assert.doesNotMatch(source.questions.map(q=>q.text).join('\n'),/Explanations|4\.73|4\.74/);
  const images=collectLatexImages(source.questions);
  assert.deepEqual(images,['coa-io-5-8-control-memory.png']);
  for(const name of images) assert.ok(fs.statSync(new URL(`../public/${source.subject}/${source.chapter}/${name}`,import.meta.url)).size>10000);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,34);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,33);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]/);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.match(tex,/\\begin\{lstlisting\}/);
});

test('repeat import retains edits, IDs and locks, and rejects unreviewed collisions',()=>{
  const first=mergeReviewedImport([],source.questions,[]);
  assert.equal(first.added,34);
  first.questions[0].text='User edited prose';
  first.questions[0].isPosLocked=true;
  first.questions[1].correctOptions=['D'];
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,34);
  assert.deepEqual(repeated.questions,first.questions);
  const collision={...source.questions[0]};delete collision.source;
  assert.throws(()=>mergeReviewedImport([collision],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[0]],source.questions,[]),/Duplicate source/);
});
