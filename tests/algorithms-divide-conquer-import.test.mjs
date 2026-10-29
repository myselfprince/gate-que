import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ALGORITHMS_DIVIDE_CONQUER_IMPORT as source} from '../data/imports/algorithms-divide-conquer.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('50 source identities, page references, exam labels and answers match the printed key',()=>{
  const key='A C D A C B B B A C A B B A B B A A B C A D C B B C B C B C C 162 A B B B A B D D 29 0.08 B B C D A D D 9'.split(' ');
  assert.equal(source.questions.length,50);
  for(const [i,q] of source.questions.entries()) {
    assert.equal(q.source.questionNumber,`2.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,4);
    assert.match(q.source.notes[0],/book page 441/);
    assert.equal(q.correctOptions.join('')||q.natAnswer,key[i]);
    assert.match(q.year,/^(199[5679]|20\d{2})$/);
    assert.match(q.marks,/^[12]$/);
    assert.match(q.setNum,/^[123]?$/);
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,q.questionType==='NAT'?0:4);
    for(const field of ['text','optA','optB','optC','optD']) {
      assert.equal((q[field].match(/\$/g)||[]).length%2,0,`${q.source.questionNumber} ${field}`);
      assert.doesNotMatch(q[field],/[\x00-\x08\x0b\x0c\x0e-\x1f]/);
    }
  }
  assert.deepEqual(source.questions.reduce((a,q)=>(a[q.questionType]=(a[q.questionType]||0)+1,a),{}),{MCQ:45,NAT:4,MSQ:1});
  assert.deepEqual(source.questions.filter(q=>q.questionType==='MSQ').map(q=>q.source.questionNumber),['2.49']);
  assert.deepEqual(source.questions.filter(q=>q.questionType==='NAT').map(q=>q.source.questionNumber),['2.32','2.41','2.42','2.50']);
  assert.deepEqual([...new Set(source.questions.flatMap(q=>q.source.pdfPages))],[1,2,3,4]);
  assert.deepEqual([...new Set(source.questions.flatMap(q=>q.source.bookPages))],[435,436,437,438,439,440]);
});

test('shared passages, continued code, editable tables, graph and printed anomalies are retained',()=>{
  const q=number=>source.questions[number-1];
  assert.equal(q(20).code,q(21).code);
  for(const number of [20,21]) {
    assert.deepEqual(q(number).source.bookPages,[436,437]);
    assert.deepEqual(q(number).source.pdfPages,[2]);
    assert.match(q(number).code,/10\. \}/);
  }
  for(const number of [22,23,24]) assert.match(q(number).text,/550, 149, 507, 395, 463, 402, 270/);
  assert.deepEqual(q(37).source.bookPages,[438,439]);
  assert.match(q(37).code,/int partition\(int a\[\], int n\);/);
  assert.equal((q(37).code.match(/kth_smallest\(______/g)||[]).length,2);
  assert.match(q(37).source.notes.join(' '),/pivot index/);
  assert.equal(q(32).natAnswer,'162');
  assert.match(q(32).source.notes.join(' '),/148/);
  assert.match(q(41).text,/sum_\{k=1\}/);
  assert.match(q(41).source.notes.join(' '),/discrepancy/);
  assert.match(q(28).text,/\$n2\^n\$/);
  assert.match(q(46).text,/\\begin\{array\}/);
  assert.equal(q(49).questionType,'MSQ');
  assert.deepEqual(q(49).correctOptions,['D']);
  const images=collectLatexImages(source.questions);
  assert.deepEqual(images,['algorithms-divide-conquer-2-50-graph.png']);
  assert.ok(fs.statSync(new URL(`../public/${source.subject}/${source.chapter}/${images[0]}`,import.meta.url)).size>10000);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,50);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,49);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]/);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.doesNotMatch(source.questions.map(q=>q.text).join('\n'),/Explanations|Function 2/);
});

test('repeat merge preserves edits, IDs, answers, locks and unrelated records; collisions stop',()=>{
  const unrelated={id:'unrelated-user-question',text:'An unrelated question',isPosLocked:true};
  const first=mergeReviewedImport([unrelated],source.questions,[]);
  assert.equal(first.added,50);
  first.questions[1].text='User edited prose';
  first.questions[1].isPosLocked=true;
  first.questions[1].correctOptions=['D'];
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,50);
  assert.deepEqual(repeated.questions,first.questions);
  assert.deepEqual(repeated.questions[0],unrelated);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[1]],source.questions,[]),/Duplicate source/);
});
