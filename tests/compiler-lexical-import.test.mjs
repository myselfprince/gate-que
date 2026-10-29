import test from 'node:test';
import assert from 'node:assert/strict';
import {COMPILER_LEXICAL_IMPORT as source} from '../data/imports/compiler-lexical.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('Lexical source covers both scanned spreads, continuations and the printed key',()=>{
  assert.equal(source.questions.length,19);
  const answers='C B C 5 10 C C C C B B C B C D D C B D'.split(' ');
  source.questions.forEach((q,i)=>{
    assert.equal(q.source.questionNumber,`1.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,2);
    assert.equal(q.correctOptions.join('')||q.natAnswer,answers[i]);
    assert.equal(q.questionType,[3,4].includes(i)?'NAT':'MCQ');
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,[3,4].includes(i)?0:4);
    assert.deepEqual(q.source.bookPages,[i<12?487:488]);
    assert.deepEqual(q.source.pdfPages,[i<12?1:2]);
  });
  assert.deepEqual(source.questions.filter(q=>q.setNum).map(q=>[q.source.questionNumber,q.setNum]),[['1.13','2'],['1.14','2'],['1.17','2'],['1.19','2']]);
  assert.deepEqual(source.questions[7].optD,'Load-time');
  assert.match(source.questions[15].text,/Which of the above statements/);
  assert.equal(source.questions[15].optA,source.questions[15].optC);
  assert.match(source.questions[3].source.notes.join(' '),/conflicting printed key/);
  assert.equal(source.questions[4].code,source.questions[5].code);
  assert.match(source.questions[8].code,/fro \(i = 0, i < n, i\+\+\);/);
  assert.match(source.questions[16].code,/Integer x;/);
  assert.deepEqual(collectLatexImages(source.questions),[]);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,19);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,18);
  assert.doesNotMatch(tex,/\[CODE\]|Explanations/);
});

test('Lexical repeat import preserves edits, IDs and locks and refuses unreviewed collisions',()=>{
  const first=mergeReviewedImport([],source.questions,[]);
  first.questions[0].text='User-edited question';
  first.questions[0].correctOptions=['D'];
  first.questions[0].isPosLocked=true;
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,19);
  assert.deepEqual(repeated.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
});
