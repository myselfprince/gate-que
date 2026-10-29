import test from 'node:test';
import assert from 'node:assert/strict';
import {OS_DEADLOCK_IMPORT as source} from '../data/imports/os-deadlock.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {buildAnswerKey} from '../src/lib/answer-key.mjs';
import {storedAnswerText} from '../src/lib/question-answers.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('21 source identities preserve all printed keys, including unresolved asterisk',()=>{
  // Independently read from the key rows on book page 563.
  const answers=['C B C A C A B C D','B A A B B 7 * D B','2 A AD'].join(' ').split(' ');
  assert.equal(source.questions.length,21);
  assert.equal(answers.length,21);
  for(const [i,q] of source.questions.entries()) {
    assert.equal(q.source.questionNumber,`3.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,3);
    assert.equal(q.natAnswer||q.correctOptions.join('')||(i===15?'*':''),answers[i]);
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,q.questionType==='NAT'?0:4);
    assert.match(q.year,/^(199[78]|200[0456789]|201[04578]|2022)$/);
    assert.match(q.marks,/^[12]$/);
    assert.match(q.setNum,/^[123]?$/);
    for(const field of ['text','optA','optB','optC','optD']) {
      assert.equal((q[field].match(/\$/g)||[]).length%2,0,`${q.id}: ${field}`);
      assert.doesNotMatch(q[field],/[\x00-\x08\x0b\x0c\x0e-\x1f]/);
    }
  }
  assert.deepEqual(source.questions.reduce((a,q)=>(a[q.questionType]=(a[q.questionType]||0)+1,a),{}),{MCQ:18,NAT:2,MSQ:1});
  const unknown=source.questions[15];
  assert.deepEqual(unknown.correctOptions,[]);
  assert.equal(storedAnswerText(unknown),'');
  assert.match(unknown.source.notes.join(' '),/only "\*"/);
  const answerKey=buildAnswerKey(source);
  assert.match(answerKey,/Q16\}\] \\textit\{Answer not available\}/);
  assert.equal((answerKey.match(/Answer not available/g)||[]).length,1);
});

test('continuations, editable matrices, code and source boundaries survive export',()=>{
  const q=n=>source.questions[n-1];
  for(const [n,pages] of [[1,[559]],[7,[559,560]],[12,[560,561]],[14,[561]],[20,[562]],[21,[562]]]) assert.deepEqual(q(n).source.bookPages,pages);
  assert.deepEqual(q(7).source.pdfPages,[1,2]);
  for(const n of [8,12,14,18,20]) assert.match(q(n).text,/\\begin\{array\}/);
  assert.match(q(8).text,/1\\ 2\\ 1/);
  assert.match(q(14).text,/8\\quad4\\quad3/);
  assert.match(q(12).text,/t = 5: releases 1 unit of R2/);
  assert.match(q(12).text,/and 1 unit of R1/);
  assert.match(q(20).text,/P_3 & 5 & 4 & 1/);
  for(const n of [4,6,9,13]) {assert.ok(q(n).code);assert.match(q(n).text,/\[CODE\]/);}
  assert.match(q(4).code,/kill Pr/);
  assert.match(q(13).code,/R\[n-i-2\]/);
  assert.equal(q(14).setNum,'1');
  assert.equal(q(15).setNum,'3');
  assert.equal(q(16).setNum,'2');
  assert.equal(q(17).setNum,'3');
  assert.equal(q(18).setNum,'2');
  assert.deepEqual(collectLatexImages(source.questions),[]);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,21);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,20);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]/);
  assert.ok(source.questions.every(q=>!q.source.bookPages.includes(558)&&!q.source.bookPages.includes(563)));
});

test('repeat merge retains edits, IDs, locks and unrelated records; collisions stop',()=>{
  const unrelated={id:'user-note-or-question',text:'Preserve me',isPosLocked:true};
  const first=mergeReviewedImport([unrelated],source.questions,[]);
  assert.equal(first.added,21);
  first.questions[1].text='User edited this question';
  first.questions[1].isPosLocked=true;
  first.questions[16].correctOptions=['A'];
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,21);
  assert.deepEqual(repeated.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[1]],source.questions,[]),/Duplicate source/);
});
