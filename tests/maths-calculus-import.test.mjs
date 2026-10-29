import test from 'node:test';
import assert from 'node:assert/strict';
import { CALCULUS_IMPORT as source } from '../data/imports/maths-calculus.mjs';
import { normalizeQuestionMetadata } from '../src/lib/question-metadata.mjs';
import { collectLatexImages } from '../src/lib/latex-source.mjs';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';
import { mergeReviewedImport } from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('Calculus coverage, page provenance and the visually reviewed printed key', () => {
  assert.equal(source.questions.length,42);
  assert.equal(new Set(source.questions.map(q=>q.id)).size,42);
  // Independent transcription of the key rows on PDF p3 / book p117.
  const rows = ['D D B B B C B A A','B D B D B A C -2 A','A 4 A C -1 C C A 1','9 C 6 C 0.289 A C 0.25 19','-0.5 BD 0 D C D'];
  const key=rows.join(' ').split(' ');
  source.questions.forEach((q,i)=>{
    assert.equal(q.source.questionNumber,`7.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,3);
    assert.deepEqual(q.source.bookPages,[i<12?113:i<24?114:i<39?115:116]);
    assert.deepEqual(q.source.pdfPages,[i<12?1:i<39?2:3]);
    assert.equal(q.questionType==='NAT'?q.natAnswer:q.correctOptions.join(''),key[i]);
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,q.questionType==='NAT'?0:4);
    for(const field of ['text','optA','optB','optC','optD']) {
      assert.equal((q[field].match(/\$/g)||[]).length%2,0);
      assert.doesNotMatch(q[field],/[\x00-\x08\x0b\x0c\x0e-\x1f]/);
    }
  });
  assert.deepEqual(source.questions.reduce((a,q)=>(a[q.questionType]=(a[q.questionType]||0)+1,a),{}),{MCQ:30,NAT:11,MSQ:1});
  assert.deepEqual(source.questions[37].correctOptions,['B','D']);
  assert.deepEqual(collectLatexImages(source.questions),[]);
});

test('source anomalies, ordering and complex math survive the established layout',()=>{
  const q=n=>source.questions[n-1];
  assert.equal(q(7).year,'2008');assert.equal(q(8).year,'2007');
  assert.match(q(10).text,/\+4x\^2/);assert.deepEqual(q(10).correctOptions,['B']);
  assert.ok(q(10).source.notes.some(n=>n.includes('inconsistency')));
  assert.match(q(15).optA,/\\begin\{cases\}/);
  assert.match(q(16).text,/f\(q\)=\\begin\{vmatrix\}/);
  assert.equal(q(17).setNum,'1');assert.equal(q(20).setNum,'3');
  assert.match(q(39).text,/\\int_\{-3\}\^3\\int_\{-2\}\^2\\int_\{-1\}\^1/);
  assert.match(q(42).optB,/\\ge/);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,42);
  assert.match(tex,/\\pagecolor\{black\}/);assert.match(tex,/\\color\{white\}/);
  assert.match(tex,/\\begin\{minipage\}\[t\]\{\\textwidth\}/);
});

test('repeat import preserves user edits, IDs, answers and locks; collisions stop',()=>{
  const unrelated={id:'user-extra',text:'User record',isPosLocked:true};
  const first=mergeReviewedImport([unrelated],source.questions,[]);
  assert.equal(first.added,42);
  first.questions[1].text='User edit';first.questions[1].correctOptions=['C'];first.questions[1].isPosLocked=true;
  first.questions[17].natAnswer='user answer';
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);assert.equal(repeated.alreadyPresent,42);
  assert.deepEqual(repeated.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[1]],source.questions,[]),/Duplicate source/);
});
