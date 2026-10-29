import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {OS_MEMORY_IMPORT as source} from '../data/imports/os-memory.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('74 identities and answers agree with independently transcribed printed key rows',()=>{
  const rows=[
    'A C C C D B B C A',
    'C B A D D C D C C',
    'C B B C D C D A D',
    'B D B C A B C A A',
    'C C B B D A B A B',
    'B C C 7 D 6 122 4 A',
    '22 A 36 384 1 D B B D',
    'C 154.5 AD 4108 C 0.6 4096 5 6596',
    'BCD 1028',
  ];
  const keys=rows.join(' ').split(' ');
  assert.equal(keys.length,74);
  assert.equal(source.questions.length,74);
  const types={};
  for(const [i,q] of source.questions.entries()) {
    assert.equal(q.source.questionNumber,`4.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,5);
    assert.equal(q.natAnswer||q.correctOptions.join(''),keys[i]);
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,q.questionType==='NAT'?0:4);
    types[q.questionType]=(types[q.questionType]||0)+1;
    for(const field of ['text','optA','optB','optC','optD']) {
      assert.equal((q[field].match(/\$/g)||[]).length%2,0,`${q.id}: ${field}`);
      assert.doesNotMatch(q[field],/[\x00-\x08\x0b\x0c\x0e-\x1f]/);
    }
    assert.ok(q.source.bookPages.every(p=>p>=567&&p<=574));
  }
  assert.deepEqual(types,{MCQ:57,NAT:15,MSQ:2});
});

test('continuations, shared data, exact options, tables, code and diagram crops survive export',()=>{
  const q=n=>source.questions[n-1];
  for(const [n,pages] of [[11,[567,568]],[30,[569,570]],[48,[571,572]],[60,[572,573]],[67,[573,574]],[74,[574]]]) assert.deepEqual(q(n).source.bookPages,pages);
  for(const pair of [[23,24],[36,37],[47,48]]) assert.equal(q(pair[0]).text.split('\n')[0],q(pair[1]).text.split('\n')[0]);
  for(const n of [30,33,41]) assert.match(q(n).text,/\\begin\{array\}/);
  assert.match(q(63).optA,/2\^\{10\}/);
  assert.equal(q(70).code,'int D[128][128];\n\nfor (int i = 0; i < 128; i++)\n    for (int j = 0; j < 128; j++)\n        D[j][i] *= 10;');
  assert.equal((q(70).text.match(/\[CODE\]/g)||[]).length,1);
  assert.match(q(35).source.notes.join(' '),/inconsistent/);
  assert.match(q(65).source.notes.join(' '),/inconsistent/);
  const manifest=JSON.parse(fs.readFileSync('data/imports/os-memory-diagrams.json','utf8'));
  assert.deepEqual(collectLatexImages(source.questions).sort(),manifest.map(x=>x.file).sort());
  for(const item of manifest) assert.equal(createHash('sha256').update(fs.readFileSync(path.join('public',source.subject,source.chapter,item.file))).digest('hex'),item.sha256);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,74);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,73);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]/);
});

test('repeat import retains user edits and locks; unreviewed content collisions abort',()=>{
  const unrelated={id:'user-note',text:'Keep existing content',isPosLocked:true};
  const first=mergeReviewedImport([unrelated],source.questions,[]);
  assert.equal(first.added,74);
  first.questions[1].text='User edit';first.questions[1].isPosLocked=true;
  first.questions[65].natAnswer='User answer';
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,74);
  assert.deepEqual(repeated.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[1]],source.questions,[]),/Duplicate source/);
});
