import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {CPU_ADDRESSING_IMPORT as source} from '../data/imports/coa-cpu-addressing.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('all 45 source questions retain book order, answer key, page continuations and exam sets',()=>{
  assert.equal(source.questions.length,45);
  const key='C A B A C B D C B B D C C D D A B D D A C B A D B D D 16383 A D 16 500 D -16 A D 32 B 1034 14 50 B 3 34 32'.split(' ');
  assert.equal(new Set(source.questions.map(q=>q.id)).size,45);
  source.questions.forEach((q,i)=>{
    assert.equal(q.source.questionNumber,`1.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,4);
    assert.match(q.source.notes[0],/book page 255/);
    assert.equal(q.correctOptions[0]||q.natAnswer,key[i]);
    assert.equal(q.questionType,q.correctOptions.length?'MCQ':'NAT');
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,q.questionType==='MCQ'?4:0);
  });
  assert.equal(source.questions.filter(q=>q.questionType==='NAT').length,11);
  assert.deepEqual(source.questions[6].source.bookPages,[248,249]);
  assert.deepEqual(source.questions[14].source.pdfPages,[1,2]);
  assert.deepEqual(source.questions[20].source.bookPages,[250,251]);
  assert.deepEqual(source.questions[24].source.bookPages,[251]);
  assert.deepEqual(source.questions[34].source.bookPages,[252,253]);
  assert.deepEqual(source.questions[37].source.bookPages,[252,253]);
  assert.equal(source.questions[27].setNum,'1');
  assert.equal(source.questions[30].setNum,'2');
  assert.equal(source.questions[41].year,'2023');
  assert.equal(source.questions[44].setNum,'2');
});

test('shared programs, tables and code remain editable; figure crops contain only diagrams',()=>{
  assert.equal(source.questions[2].code,source.questions[3].code);
  assert.equal(source.questions[7].code,source.questions[9].code);
  assert.equal(source.questions[18].code,source.questions[20].code);
  assert.match(source.questions[11].code,/while\[\*A\+\+\];/);
  assert.match(source.questions[41].code,/L09: end/);
  assert.match(source.questions[41].code,/a\[i\] = b\[i\] \* 8;/);
  assert.match(source.questions[43].text,/\\begin\{array\}/);
  assert.doesNotMatch(source.questions.map(q=>q.text).join('\n'),/Explanations|Over flow in/);
  const images=collectLatexImages(source.questions);
  assert.equal(images.length,2);
  const hashes=['c480e7615dd18a75ac87e807fd5198b7c700ec8aa0b9045ceef9cb1419db9e30','4c837b378dd4551ab8bd2f46f6ef0729071e65823c6b5402a8b2a426bb38c4c0'];
  images.forEach((file,i)=>assert.equal(createHash('sha256').update(fs.readFileSync(new URL(`../public/${source.subject}/${source.chapter}/${file}`,import.meta.url))).digest('hex'),hashes[i]));
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,45);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,44);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]|Answer key/);
});

test('repeated imports preserve edits, IDs, locks and order; unreviewed collisions stop',()=>{
  const first=mergeReviewedImport([],source.questions,[]);
  assert.equal(first.added,45);
  first.questions[0].text='User edited prose';
  first.questions[0].isPosLocked=true;
  first.questions[0].correctOptions=['D'];
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,45);
  assert.deepEqual(repeated.questions,first.questions);
  const collision={...source.questions[0]};delete collision.source;
  assert.throws(()=>mergeReviewedImport([collision],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[0]],source.questions,[]),/Duplicate source/);
});
