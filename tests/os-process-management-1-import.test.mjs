import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {OS_PROCESS_MANAGEMENT_1_IMPORT as source} from '../data/imports/os-process-management-1.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('76 source identities, references, exam labels and answers match the scanned key',()=>{
  // Independent transcription of the answer-key rows on book page 533.
  const rows=[
    'B A B A D B A Sol. A',
    'C C C D B B A D Sol.',
    'D A A C A D C D B',
    'B B B A A D B C B',
    'B C D C D C A C C',
    'B A 7.2 1000 5.5 12 D C A',
    '8.25 D 3 B 29 31 2 D 5.25',
    '12 AC BCD D BCD CD CD C AB',
    'D BD AD D',
  ];
  const answers=rows.join(' ').split(' ');
  assert.equal(source.questions.length,76);
  assert.equal(answers.length,76);
  for(const [index,q] of source.questions.entries()) {
    assert.equal(q.source.questionNumber,`1.${index+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,5);
    assert.equal(q.natAnswer||q.correctOptions.join('')||(q.isProof?'Sol.':''),answers[index]);
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,['NAT','SUBJECTIVE'].includes(q.questionType)?0:4);
    assert.match(q.year,/^(199[5689]|20\d{2})$/);
    assert.match(q.marks,/^[12]$/);
    assert.match(q.setNum,/^[123]?$/);
    for(const field of ['text','optA','optB','optC','optD']) {
      assert.equal((q[field].match(/\$/g)||[]).length%2,0,`${q.id}: ${field}`);
      assert.doesNotMatch(q[field],/[\x00-\x08\x0b\x0c\x0e-\x1f]/);
    }
  }
  assert.deepEqual(source.questions.reduce((a,q)=>(a[q.questionType]=(a[q.questionType]||0)+1,a),{}),{MCQ:54,SUBJECTIVE:2,NAT:11,MSQ:9});
  assert.deepEqual(source.questions.filter(q=>q.isProof).map(q=>q.source.questionNumber),['1.8','1.18']);
  for(const q of source.questions.filter(q=>q.isProof)) {
    assert.equal(q.natAnswer,'');
    assert.match(q.source.notes.join(' '),/solution is not included/);
  }
  assert.deepEqual([...new Set(source.questions.flatMap(q=>q.source.pdfPages))],[1,2,3,4,5]);
  assert.deepEqual([...new Set(source.questions.flatMap(q=>q.source.bookPages))],Array.from({length:10},(_,i)=>524+i));
});

test('column/page continuations, editable tables and separate code/diagram fields survive export',()=>{
  const q=number=>source.questions[number-1];
  for(const [number,pages] of [[10,[524,525]],[28,[526,527]],[43,[528,529]],[50,[529,530]],[59,[530,531]],[67,[531,532]],[72,[532]],[75,[532,533]],[76,[533]]]) assert.deepEqual(q(number).source.bookPages,pages);
  for(const number of [2,23,24,29,34,43,45,48,49,50,53,55,57,59,61,63]) assert.match(q(number).text,/\\begin\{array\}/);
  for(const number of [22,26,37,44,60,73,75]) {assert.ok(q(number).code);assert.match(q(number).text,/\[CODE\]/);}
  assert.match(q(60).code,/i % 2 == 0/);
  assert.match(q(75).code,/wait\(s2\);\s+signal\(s2\);/);
  assert.equal(q(26).correctOptions.join(''),'D');
  assert.equal(q(36).correctOptions.join(''),'B');
  assert.equal(q(47).correctOptions.join(''),'A');
  for(const number of [26,36,47]) assert.match(q(number).source.notes.join(' '),/preserved literally/);
  const images=collectLatexImages(source.questions);
  assert.equal(images.length,3);
  for(const file of images) assert.ok(fs.statSync(new URL(`../public/${source.subject}/${source.chapter}/${file}`,import.meta.url)).size>10000);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,76);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,75);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]/);
});

test('repeat merge retains edits, answers, locks and unrelated records; ambiguous collisions stop',()=>{
  const unrelated={id:'user-note-or-question',text:'Retain this',isPosLocked:true};
  const initial=mergeReviewedImport([unrelated],source.questions,[]);
  assert.equal(initial.added,76);
  initial.questions[1].text='User edited this question';
  initial.questions[1].correctOptions=['D'];
  initial.questions[1].isPosLocked=true;
  const repeated=mergeReviewedImport(initial.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,76);
  assert.deepEqual(repeated.questions,initial.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...initial.questions,initial.questions[1]],source.questions,[]),/Duplicate source/);
});
