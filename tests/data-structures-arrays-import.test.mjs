import test from 'node:test';
import assert from 'node:assert/strict';
import {DATA_STRUCTURES_ARRAYS_IMPORT as source} from '../data/imports/data-structures-arrays.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('Arrays source coverage includes the facing-page continuation and complete printed key',()=>{
  assert.equal(source.questions.length,12);
  const answers='A A A A B C A A A C 0 19'.split(' ');
  source.questions.forEach((q,i)=>{
    assert.equal(q.source.questionNumber,`2.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,2);
    assert.equal(q.correctOptions.join('')||q.natAnswer,answers[i]);
    assert.equal(q.questionType,i<10?'MCQ':'NAT');
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,i<10?4:0);
    assert.deepEqual(q.source.bookPages,i<6?[363]:i===6?[363,364]:[364]);
  });
  assert.deepEqual(source.questions[6].source.pdfPages,[1,2]);
  assert.deepEqual(source.questions.slice(6,11).map(q=>q.setNum),['1','3','1','3','3']);
  assert.match(source.questions[6].code,/return Y;/);
  assert.match(source.questions[6].optD,/sum of all/);
  assert.match(source.questions[9].code,/Code segment 2:[\s\S]*X\[i\]\[0\]/);
  assert.match(source.questions[11].code, /printf\("%d"\\n,/);
  assert.match(source.questions[11].code, /20\}\);/);
  assert.match(source.questions[11].source.notes.join(' '),/invalid/);
  assert.deepEqual(collectLatexImages(source.questions),[]);
  const tex=buildQuestionPages(source);
  assert.ok(tex.includes(String.raw`{²}{{$^2$}}1 {×}{{$\times$}}1`));
  assert.equal((tex.match(/% Question page /g)||[]).length,12);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,11);
  assert.doesNotMatch(tex,/\[CODE\]|Explanations|1\.128|1\.130/);
});

test('Arrays repeat import preserves user edits, answers and locks; unreviewed matches stop',()=>{
  const first=mergeReviewedImport([],source.questions,[]);
  first.questions[0].text='User-edited question';
  first.questions[0].correctOptions=['D'];
  first.questions[0].isPosLocked=true;
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,12);
  assert.deepEqual(repeated.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
});
