import test from 'node:test';
import assert from 'node:assert/strict';
import {COMPILER_PARSING_IMPORT as source} from '../data/imports/compiler-parsing.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('52 numbered questions agree with independently transcribed printed key rows',()=>{
  const rows=['A B C C A D B D A','B A B A A D A D A','A C C C B D B C A','C C D D B C C C D','C A C 31 B 5 7 D A','8 D 5 AC D B 9'];
  const answers=rows.join(' ').split(' ');
  assert.equal(source.questions.length,52);
  for(const [i,q] of source.questions.entries()) {
    assert.equal(q.source.questionNumber,`2.${i+1}`);
    assert.equal(q.natAnswer||q.correctOptions.join(''),answers[i]);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,4);
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,q.questionType==='NAT'?0:4);
    for(const field of ['text','optA','optB','optC','optD']) {
      assert.equal((q[field].match(/(?<!\\)\$/g)||[]).length%2,0,`${q.id}: ${field}`);
      assert.doesNotMatch(q[field],/\\n(?=[A-Z])/);
    }
  }
  assert.deepEqual(source.questions.reduce((a,q)=>(a[q.questionType]=(a[q.questionType]||0)+1,a),{}),{MCQ:45,NAT:6,MSQ:1});
});

test('page continuations, linked passages, tables, code and chapter boundaries survive export',()=>{
  const q=n=>source.questions[n-1];
  for(const [n,pages] of [[1,[491]],[11,[491,492]],[21,[492,493]],[33,[494,495]],[37,[494,495]],[50,[496]],[52,[496]]]) assert.deepEqual(q(n).source.bookPages,pages);
  for(const n of [13,14]) assert.match(q(n).text,/E\\to E\+E/);
  assert.match(q(18).text,/B\\to bB/);
  for(const n of [22,23]) assert.match(q(n).text,/A\\to bAA/);
  for(const n of [27,28,44,51]) assert.match(q(n).text,/\\begin\{array\}\{\|/);
  assert.match(q(50).text,/FIRST.*FOLLOW/s);
  assert.match(q(50).text,/\\operatorname\{FOLLOW\}\(R\)=\\\{f/);
  assert.match(q(1).code,/print"3"/);
  assert.match(q(1).text,/\[CODE\]/);
  assert.match(q(39).optB,/E'\\to -TE'/);
  assert.equal(q(49).questionType,'MSQ');
  assert.deepEqual(q(49).correctOptions,['A','C']);
  assert.deepEqual(collectLatexImages(source.questions),[]);
  assert.ok(source.questions.every(q=>q.source.bookPages.every(p=>p>=491&&p<=496)));
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,52);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,51);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.doesNotMatch(tex,/\[CODE\]|\[IMG_\d+\]/);
});

test('repeat merge preserves user edits and locks; unreviewed collisions abort',()=>{
  const existing={id:'user-record',text:'Retain this question',isPosLocked:true};
  const first=mergeReviewedImport([existing],source.questions,[]);
  assert.equal(first.added,52);
  first.questions[1].text='Edited by user';
  first.questions[1].isPosLocked=true;
  first.questions[49].correctOptions=['B'];
  const again=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(again.added,0);
  assert.equal(again.alreadyPresent,52);
  assert.deepEqual(again.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[1]],source.questions,[]),/Duplicate source/);
});
