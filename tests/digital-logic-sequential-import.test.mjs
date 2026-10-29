import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {DIGITAL_LOGIC_SEQUENTIAL_IMPORT as source, SEQUENTIAL_UNRESOLVED} from '../data/imports/digital-logic-sequential.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('37 sequential source identities, available answers and continuation metadata are complete',()=>{
  const key='PARTIAL A A B A A C D B D ? A D C C A A A C D A A A D B C C D A 3 4 B B 2 D B A'.split(' ');
  assert.equal(source.questions.length,37);
  assert.equal(new Set(source.questions.map(q=>q.id)).size,37);
  source.questions.forEach((q,i)=>{
    const n=i+1;
    assert.equal(q.source.questionNumber,`3.${n}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,4);
    assert.equal(n===1?'PARTIAL':q.correctOptions.join('')||q.natAnswer||'?',key[i]);
    const pages=n<=4?[221]:n<=11?[222]:n===12?[222,223]:n<=18?[223]:n===19?[223,224]:n<=26?[224]:n<=34?[225]:[226];
    assert.deepEqual(q.source.bookPages,pages);
    assert.deepEqual(q.source.pdfPages,[...new Set(pages.map(p=>Math.floor((p-220)/2)+1))]);
    assert.equal(q.setNum,({26:'2',27:'3',28:'1',29:'1',30:'2',31:'1',32:'1',33:'2',35:'1'})[n]||'');
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,['NAT','SUBJECTIVE'].includes(q.questionType)?0:4);
    for(const field of ['text','optA','optB','optC','optD']) assert.equal((q[field].match(/\$/g)||[]).length%2,0);
  });
  assert.deepEqual(source.questions.reduce((a,q)=>(a[q.questionType]=(a[q.questionType]||0)+1,a),{}),{SUBJECTIVE:1,MCQ:33,NAT:3});
  assert.deepEqual(SEQUENTIAL_UNRESOLVED.map(e=>e.number),['3.1','3.11','3.32']);
  assert.deepEqual(source.questions[10].correctOptions,[]);
  assert.match(source.questions[31].optC,/\[unclear first bit\]0/);
  assert.match(source.questions[31].optD,/0\[unclear second bit\]/);
  assert.equal(source.questions[31].needsManualOptionFix,false,'Source uncertainty must not trigger the unrelated semicolon-paste repair banner.');
  assert.equal(source.questions[23].diagram,source.questions[24].diagram);
  assert.ok(source.questions[23].text.startsWith(source.questions[24].text.split('\nIf all')[0]));
});

test('every figure is checksum-guarded and the existing shared black PDF layout is preserved',()=>{
  const manifest=JSON.parse(fs.readFileSync(new URL('../data/imports/digital-logic-sequential-diagrams.json',import.meta.url)));
  const images=collectLatexImages(source.questions);
  assert.equal(images.length,33);
  assert.deepEqual(new Set(manifest.map(f=>f.file)),new Set(images));
  for(const file of manifest) {
    const bytes=fs.readFileSync(new URL(`../public/${source.subject}/${source.chapter}/${file.file}`,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
  }
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,37);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,36);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.match(tex,/\\color\{white\}/);
  assert.match(tex,/\\begin\{minipage\}\[t\]\{\\textwidth\}/);
  assert.doesNotMatch(tex,/\[IMG_\d+\]/);
});

test('re-import retains edits, answers and locks; unreviewed collisions and duplicate sources fail',()=>{
  const first=mergeReviewedImport([],source.questions,[]);
  assert.equal(first.added,37);
  first.questions[0].text='User edited text';
  first.questions[0].isPosLocked=true;
  first.questions[1].correctOptions=['B'];
  first.questions[29].natAnswer='User edited answer';
  const repeat=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeat.added,0);
  assert.equal(repeat.alreadyPresent,37);
  assert.deepEqual(repeat.questions,first.questions);
  const collision={...source.questions[0]};delete collision.source;
  assert.throws(()=>mergeReviewedImport([collision],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[0]],source.questions,[]),/Duplicate source/);
});
