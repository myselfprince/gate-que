import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MEMORY_ORGANIZATION_IMPORT as source} from '../data/imports/coa-memory-organization.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('all 74 source questions preserve absent-key status instead of inferred answers',()=>{
  assert.equal(source.questions.length,74);
  const types = {};
  for (const [i,q] of source.questions.entries()) {
    assert.equal(q.source.questionNumber,`4.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyStatus,'not-supplied');
    assert.equal(q.source.answerKeyPdfPage,null);
    assert.equal(q.natAnswer,'');
    assert.deepEqual(q.correctOptions,[]);
    for(const field of ['text','optA','optB','optC','optD']) assert.equal((q[field].match(/\$/g)||[]).length%2,0,`${q.source.questionNumber} ${field}`);
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,q.questionType==='NAT'?0:4);
    types[q.questionType]=(types[q.questionType]||0)+1;
  }
  assert.deepEqual(types,{MCQ:50,MSQ:4,NAT:20});
  assert.deepEqual(source.questions.filter(q=>q.questionType==='MSQ').map(q=>q.source.questionNumber),['4.3','4.68','4.70','4.73']);
  assert.deepEqual([...new Set(source.questions.flatMap(q=>q.source.pdfPages))],[1,2,3,4,5]);
  assert.equal(source.questions[73].setNum,'1');
  assert.equal(source.questions[73].year,'2024');
});

test('cross-page continuations, shared code, tables and figure-only crops remain portable',()=>{
  assert.deepEqual(source.questions[11].source.bookPages,[281,282]);
  assert.deepEqual(source.questions[11].source.pdfPages,[1,2]);
  assert.equal(source.questions[11].optD,'Fewer segmentation faults occur');
  for(const i of [19,20]) {
    assert.match(source.questions[i].code,/P1:.*\n/);
    assert.match(source.questions[i].code,/x \+= A\[j\]\[i\]/);
    assert.deepEqual(source.questions[i].source.bookPages,[282,283]);
  }
  for(const i of [28,29,30]) assert.equal(source.questions[i].code,source.questions[28].code);
  assert.deepEqual(source.questions[29].source.pdfPages,[2,3]);
  assert.deepEqual(source.questions[39].source.bookPages,[284,285]);
  assert.match(source.questions[39].optB,/v\)\\times j/);
  assert.match(source.questions[15].text,/\\begin\{array\}/);
  assert.match(source.questions[56].text,/\\begin\{array\}/);
  assert.equal(source.questions[34].diagram,source.questions[35].diagram);
  assert.match(source.questions[69].text,/0xA262/);
  assert.doesNotMatch(source.questions.map(q=>q.text).join('\n'),/Explanations|3\.40|3\.46/);
  const images=collectLatexImages(source.questions);
  assert.equal(images.length,3);
  for(const file of images) assert.ok(fs.statSync(new URL(`../public/${source.subject}/${source.chapter}/${file}`,import.meta.url)).size>10000);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,74);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,73);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]/);
  assert.match(tex,/\\pagecolor\{black\}/);
});

test('repeat import keeps edited answers, content and locks; unreviewed collisions stop',()=>{
  const first=mergeReviewedImport([],source.questions,[]);
  assert.equal(first.added,74);
  first.questions[0].text='User edited prose';
  first.questions[0].isPosLocked=true;
  first.questions[0].correctOptions=['D'];
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,74);
  assert.deepEqual(repeated.questions,first.questions);
  const legacy={...source.questions[0]}; delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[0]],source.questions,[]),/Duplicate source/);
});
