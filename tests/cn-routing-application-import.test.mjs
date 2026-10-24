import test from 'node:test';
import assert from 'node:assert/strict';
import {ROUTING_APPLICATION_IMPORT as source} from '../data/imports/cn-routing-application.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('43 questions retain source order, page continuations, sets, types and unavailable answers',()=>{
  assert.equal(source.questions.length,43);
  assert.equal(new Set(source.questions.map(q=>q.id)).size,43);
  source.questions.forEach((q,i)=>{
    assert.equal(q.source.questionNumber,`4.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.deepEqual(q.correctOptions,[]);
    assert.equal(q.natAnswer,'');
    assert.equal(q.source.answerKeyPdfPage,null);
    assert.equal(q.source.answerKeyStatus,'not-supplied');
  });
  assert.deepEqual(source.questions.filter(q=>q.questionType==='NAT').map(q=>q.source.questionNumber),['4.32','4.35','4.38','4.40']);
  assert.deepEqual(source.questions.filter(q=>q.questionType==='MSQ').map(q=>q.source.questionNumber),['4.36','4.41']);
  assert.deepEqual(source.questions[9].source.pdfPages,[1,2]);
  assert.deepEqual(source.questions[35].source.pdfPages,[3,4]);
  assert.deepEqual(source.questions[6].source.bookPages,[708,709]);
  assert.equal(source.questions[14].year,'2005');
  assert.equal(source.questions[35].setNum,'2');
  assert.equal(source.questions[42].setNum,'1');
  assert.match(source.questions[21].text,/\\mathrm\{B5\}/);
  assert.match(source.questions[32].source.notes[0],/\(a\), \(d\), \(c\), \(d\)/);
});

test('missing-key metadata is explicit and backward compatible; invalid values cannot imply an answer key',()=>{
  const q=source.questions[0];
  assert.throws(()=>normalizeQuestionMetadata({source:{...q.source,answerKeyStatus:undefined}}));
  assert.throws(()=>normalizeQuestionMetadata({source:{...q.source,answerKeyPdfPage:4}}));
  assert.throws(()=>normalizeQuestionMetadata({source:{...q.source,answerKeyStatus:'invented'}}));
  assert.throws(()=>normalizeQuestionMetadata({source:{...q.source,notes:[null]}}));
  const legacy={...q.source,answerKeyPdfPage:4};delete legacy.answerKeyStatus;
  assert.deepEqual(normalizeQuestionMetadata({source:legacy}).source,legacy);
});

test('re-import preserves edits and unrelated records, while unreviewed collisions stop',()=>{
  const first=mergeReviewedImport([],source.questions,[]);
  assert.equal(first.added,43);
  const edited={...first.questions[0],text:'User edit',isPosLocked:true};
  const extra={id:'unrelated',text:'Keep this',code:'int a;',isPosLocked:true};
  const records=[edited,...first.questions.slice(1),extra];
  const next=mergeReviewedImport(records,source.questions,[]);
  assert.equal(next.added,0);
  assert.equal(next.alreadyPresent,43);
  assert.deepEqual(next.questions,records);
  const collision={...source.questions[0],text:'Unreviewed legacy record'};delete collision.source;
  assert.throws(()=>mergeReviewedImport([collision],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[0]],source.questions,[]),/Duplicate source/);
});

test('export keeps editable tables, shared passages, nine figure references and one black page per question',()=>{
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,43);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,42);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.match(tex,/\\color\{white\}/);
  assert.match(tex,/\\begin\{minipage\}\[t\]\{\\textwidth\}/);
  assert.match(tex,/\\begin\{array\}/);
  assert.doesNotMatch(tex,/\\multicolumn/);
  assert.match(tex,/\\fontsize\{17\}\{24\.56\}/);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|Answer key/);
  assert.equal(collectLatexImages(source.questions).length,9);
  assert.match(source.questions[19].text,/Each router starts/);
  assert.match(source.questions[22].text,/link N2-N3 reduces to 2/);
  assert.match(source.questions[42].text,/t=0/);
});
