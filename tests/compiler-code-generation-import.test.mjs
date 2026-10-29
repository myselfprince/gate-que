import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {COMPILER_CODE_GENERATION_IMPORT as source} from '../data/imports/compiler-code-generation.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('all 28 source identities, pages, types and available printed answers are preserved',()=>{
  const key=['D B C B D B B D A','A D A * 8 C B 10 A','B 2 1024 6 A C A D B','A'].join(' ').split(' ');
  assert.equal(source.questions.length,28);
  for(const [i,q] of source.questions.entries()) {
    assert.equal(q.source.questionNumber,`4.${i+1}`);
    assert.equal(q.natAnswer||q.correctOptions.join(''),key[i]==='*'?'':key[i]);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,3);
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,q.questionType==='NAT'?0:4);
    for(const field of ['text','optA','optB','optC','optD']) assert.equal((q[field].match(/(?<!\\)\$/g)||[]).length%2,0);
  }
  assert.deepEqual(source.questions.reduce((a,q)=>(a[q.questionType]=(a[q.questionType]||0)+1,a),{}),{MCQ:23,NAT:5});
  const q=n=>source.questions[n-1];
  assert.deepEqual(q(5).source.bookPages,[512,513]);
  assert.deepEqual(q(18).source.bookPages,[514,515]);
  assert.deepEqual(q(25).source.pdfPages,[2,3]);
  assert.equal(q(6).code,q(7).code);
  assert.match(q(13).source.notes.join(' '),/\(\*\)/);
  assert.match(q(16).code,/if i < 5 goto \(2\)/);
  assert.ok(q(21).text.includes(String.raw`\mathrm{expr};\ \mathrm{stmt}\mid0`));
  assert.match(q(25).code,/y->f2/);
  assert.match(q(28).text,/\\mathrm\{uminus\}/);
  const images=collectLatexImages(source.questions);
  assert.equal(images.length,10);
  for(const file of images) assert.ok(fs.existsSync(`public/${source.subject}/${source.chapter}/${file}`));
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,28);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,27);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.doesNotMatch(tex,/\[CODE\]|\[IMG_\d+\]/);
});

test('repeat imports preserve edits, answers, IDs and locks and reject ambiguous collisions',()=>{
  const original={id:'keep',text:'Unrelated question',isPosLocked:true};
  const first=mergeReviewedImport([original],source.questions,[]);
  assert.equal(first.added,28);
  first.questions[1].text='User edited text';first.questions[1].isPosLocked=true;
  first.questions[2].correctOptions=['A'];
  const again=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(again.added,0);
  assert.equal(again.alreadyPresent,28);
  assert.deepEqual(again.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[1]],source.questions,[]),/Duplicate source/);
});
