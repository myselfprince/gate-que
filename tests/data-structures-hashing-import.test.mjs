import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {DATA_STRUCTURES_HASHING_IMPORT as source} from '../data/imports/data-structures-hashing.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('Hashing coverage retains both continuations, linked table, printed key and figure',()=>{
  const answers='C C D C B B D C C C A A B 80 13 C B C'.split(' ');
  assert.equal(source.questions.length,18);
  source.questions.forEach((q,i)=>{
    assert.equal(q.source.questionNumber,`7.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,2);
    assert.equal(q.correctOptions.join('')||q.natAnswer,answers[i]);
    assert.equal(q.questionType,[13,14].includes(i)?'NAT':'MCQ');
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,[13,14].includes(i)?0:4);
    assert.equal(q.code,'');
  });
  assert.deepEqual(source.questions[7].source.pdfPages,[1,2]);
  assert.deepEqual(source.questions[7].source.bookPages,[409,410]);
  assert.deepEqual(source.questions[15].source.bookPages,[410,411]);
  assert.match(source.questions[7].optD,/12,2[\s\S]*13,3,23[\s\S]*5,15/);
  for(const q of source.questions.slice(8,10)) {
    assert.match(q.text,/Linked Answer Questions 7\.9 and 7\.10/);
    assert.match(q.text,/2 & 42[\s\S]*3 & 23[\s\S]*4 & 34[\s\S]*5 & 52[\s\S]*6 & 46[\s\S]*7 & 33/);
  }
  assert.match(source.questions[15].text,/7\. A split is done only if it is needed/);
  assert.equal(source.questions[15].optD,'5, 9: 4, 13, 10, 7');
  assert.deepEqual(source.questions.filter(q=>q.setNum).map(q=>[q.source.questionNumber,q.setNum]),[['7.11','1'],['7.12','3'],['7.13','2'],['7.14','3'],['7.16','1']]);
  assert.deepEqual(collectLatexImages(source.questions),['hashing-7-16.png']);
  const manifest=JSON.parse(fs.readFileSync(new URL('../data/imports/data-structures-hashing-diagrams.json',import.meta.url)));
  for(const crop of manifest.crops) {
    const bytes=fs.readFileSync(new URL(`../public/${source.subject}/${source.chapter}/${crop.file}`,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),crop.sha256);
  }
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,18);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,17);
  assert.doesNotMatch(tex,/\[IMG_1\]|Explanations|6\.24|6\.25/);
});

test('Hashing repeated import retains edits, answers, IDs and position locks; unknown matches abort',()=>{
  const first=mergeReviewedImport([],source.questions,[]);
  first.questions[0].text='User-edited question';
  first.questions[0].correctOptions=['D'];
  first.questions[0].isPosLocked=true;
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,18);
  assert.deepEqual(repeated.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([source.questions[0],source.questions[0]],source.questions,[]),/Duplicate source identity/);
});
