import test from 'node:test';
import assert from 'node:assert/strict';
import {OS_PROCESS_MANAGEMENT_2_IMPORT as source} from '../data/imports/os-process-management-2.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('all 46 scanned questions have validated identities, references and printed answers',()=>{
  // Independently read from the six key rows on PDF page 5 / book page 551.
  const answers=[
    'C C D B B B A B B',
    'B C D D D B A B B',
    'C D C C A A A B B',
    'D C C 3 A A C 7 D',
    'C 80 A C ACD BCD BC D',
    'C 14',
  ].join(' ').split(' ');
  assert.equal(source.questions.length,46);
  assert.equal(answers.length,46);
  for(const [i,q] of source.questions.entries()) {
    assert.equal(q.source.questionNumber,`2.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,5);
    assert.equal(q.natAnswer||q.correctOptions.join(''),answers[i]);
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,q.questionType==='NAT'?0:4);
    assert.match(q.year,/^(199[678]|200[013456789]|201[023456789]|202[01234])$/);
    assert.match(q.marks,/^[12]$/);
    assert.match(q.setNum,/^[123]?$/);
    for(const field of ['text','optA','optB','optC','optD']) {
      assert.equal((q[field].match(/\$/g)||[]).length%2,0,`${q.id}: ${field}`);
      assert.doesNotMatch(q[field],/[\x00-\x08\x0b\x0c\x0e-\x1f]/);
    }
  }
  assert.deepEqual(source.questions.reduce((a,q)=>(a[q.questionType]=(a[q.questionType]||0)+1,a),{}),{MCQ:39,NAT:4,MSQ:3});
  assert.deepEqual([...new Set(source.questions.flatMap(q=>q.source.pdfPages))],[1,2,3,4,5]);
  assert.deepEqual([...new Set(source.questions.flatMap(q=>q.source.bookPages))],Array.from({length:10},(_,i)=>542+i));
});

test('shared passages, continuations and literal source code survive editable exports',()=>{
  const q=n=>source.questions[n-1];
  for(const [n,pages] of [[14,[543,544]],[18,[544,545]],[20,[545]],[22,[545,546]],[27,[546,547]],[29,[547]],[33,[548]],[37,[548,549]],[41,[549,550]],[43,[550]],[46,[551]]]) assert.deepEqual(q(n).source.bookPages,pages);
  assert.equal(q(10).code,q(11).code);
  assert.equal(q(17).code,q(18).code);
  assert.match(q(11).text,/Common Data for Q\. 2\.10 & 2\.11/);
  assert.match(q(18).text,/Common Data for Q\. 2\.17 & 2\.18/);
  for(const question of source.questions.filter(q=>q.code)) assert.match(question.text,/\[CODE\]/);
  assert.match(q(6).code,/mod 4/);
  assert.equal(q(27).optA,q(27).optD);
  assert.match(q(29).code,/i <= n/);
  assert.match(q(32).code,/while \(varQ == true\)\n\s*\{/);
  assert.equal(q(44).correctOptions.join(''),'D');
  assert.match(q(44).source.notes.join(' '),/preserved literally/);
  assert.equal(q(29).isCodeOptions,true);
  assert.deepEqual(collectLatexImages(source.questions),[]);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,46);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,45);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]/);
});

test('repeat import preserves existing edits, IDs and locks, and rejects unreviewed collisions',()=>{
  const unrelated={id:'unrelated-user-question',text:'Preserve',isPosLocked:true};
  const first=mergeReviewedImport([unrelated],source.questions,[]);
  assert.equal(first.added,46);
  first.questions[1].text='Existing user edit';
  first.questions[1].correctOptions=['B'];
  first.questions[1].isPosLocked=true;
  const repeat=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeat.added,0);
  assert.equal(repeat.alreadyPresent,46);
  assert.deepEqual(repeat.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[1]],source.questions,[]),/Duplicate source/);
});
