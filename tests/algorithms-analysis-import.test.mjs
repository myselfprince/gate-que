import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ALGORITHMS_ANALYSIS_IMPORT as source} from '../data/imports/algorithms-analysis.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('68 source identities, exam labels and answers match the complete printed key',()=>{
  const key='BD C B D D A C A B C C C C D A D D C C B B C B D D B B A A D B B C A A C C D B A 110 D A A D C D 2.32 C C B C B 5 D B B C A B A AC AD BD C A 3 D'.split(' ');
  assert.equal(source.questions.length,68);
  for(const [i,q] of source.questions.entries()) {
    assert.equal(q.source.questionNumber,`1.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,5);
    assert.match(q.source.notes[0],/book page 425/);
    assert.equal(q.correctOptions.join('')||q.natAnswer,key[i]);
    assert.match(q.year,/^(1996|1997|20\d{2})$/);
    assert.match(q.marks,/^[12]$/);
    assert.match(q.setNum,/^[123]?$/);
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,q.questionType==='NAT'?0:4);
    for(const field of ['text','optA','optB','optC','optD']) {
      assert.equal((q[field].match(/\$/g)||[]).length%2,0,`${q.source.questionNumber} ${field}`);
      assert.doesNotMatch(q[field],/[\x00-\x08\x0b\x0c\x0e-\x1f]/);
    }
  }
  assert.deepEqual(source.questions.reduce((a,q)=>(a[q.questionType]=(a[q.questionType]||0)+1,a),{}),{MSQ:4,MCQ:60,NAT:4});
  assert.deepEqual(source.questions.filter(q=>q.questionType==='MSQ').map(q=>q.source.questionNumber),['1.1','1.62','1.63','1.64']);
  assert.deepEqual(source.questions.filter(q=>q.questionType==='NAT').map(q=>q.source.questionNumber),['1.41','1.48','1.54','1.67']);
  assert.deepEqual([...new Set(source.questions.flatMap(q=>q.source.pdfPages))],[1,2,3,4,5]);
});

test('page continuations, shared programs, exact complements and source defects stay editable',()=>{
  for(const i of [19,20]) {
    assert.equal(source.questions[i].code,source.questions[19].code);
    assert.deepEqual(source.questions[i].source.bookPages,[418,419]);
    assert.deepEqual(source.questions[i].source.pdfPages,[2]);
  }
  assert.equal(source.questions[31].code,source.questions[32].code);
  assert.match(source.questions[32].source.notes.join(' '),/uninitialized Z\[0\]/);
  assert.match(source.questions[20].text,/space complexity of the above function is foo\(\)/);
  assert.match(source.questions[65].text,/n\\ge1/);
  assert.deepEqual(source.questions[47].source.bookPages,[421,422]);
  assert.deepEqual(source.questions[47].source.pdfPages,[3,4]);
  assert.match(source.questions[63].optC,/L_1\\cap\\overline\{L_3\}/);
  assert.equal(source.questions[63].optD,String.raw`$\overline{L_1}\cup\overline{L_2}$ is regular`);
  assert.match(source.questions[15].optC,/\\ne O/);
  assert.match(source.questions[27].text,/\\begin\{array\}/);
  assert.match(source.questions[45].text,/\\begin\{array\}/);
  assert.match(source.questions[62].code,/Function 1[\s\S]+Function 2/);
  const images=collectLatexImages(source.questions);
  assert.deepEqual(images,['algorithms-analysis-1-48-flowchart.png']);
  assert.ok(fs.statSync(new URL(`../public/${source.subject}/${source.chapter}/${images[0]}`,import.meta.url)).size>10000);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,68);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,67);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]/);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.doesNotMatch(source.questions.map(q=>q.text).join('\n'),/Explanations|Case-I/);
});

test('repeat import preserves edits, answers, IDs, locks and unrelated records; conflicts stop',()=>{
  const unrelated={id:'unrelated-user-question',text:'An unrelated question',isPosLocked:true};
  const first=mergeReviewedImport([unrelated],source.questions,[]);
  assert.equal(first.added,68);
  first.questions[1].text='User edited prose';
  first.questions[1].isPosLocked=true;
  first.questions[1].correctOptions=['D'];
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,68);
  assert.deepEqual(repeated.questions,first.questions);
  assert.deepEqual(repeated.questions[0],unrelated);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[1]],source.questions,[]),/Duplicate source/);
});
