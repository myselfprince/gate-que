import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {DIGITAL_LOGIC_COMBINATIONAL_IMPORT as source,COMBINATIONAL_SOLUTION} from '../data/imports/digital-logic-combinational.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('35 reviewed question identities, answer keys, types and continuation pages are complete',()=>{
  const key='D C SOL C B BC C A A A B A D D A A B B A C C B B A A C 12 D B -1 C D C C 4'.split(' ');
  assert.equal(source.questions.length,35);
  assert.equal(new Set(source.questions.map(q=>q.id)).size,35);
  source.questions.forEach((q,i)=>{
    const n=i+1;
    assert.equal(q.source.questionNumber,`2.${n}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,3);
    assert.equal(n===3?'SOL':q.correctOptions.join('')||q.natAnswer,key[i]);
    const pages=n<=7?[212]:n===8?[212,213]:n<=14?[213]:n===15?[213,214]:n<=23?[214]:n<=31?[215]:n===32?[215,216]:[216];
    assert.deepEqual(q.source.bookPages,pages);
    assert.deepEqual(q.source.pdfPages,[...new Set(pages.map(p=>Math.floor((p-212)/2)+1))]);
    assert.equal(q.setNum,({25:'1',26:'3',27:'2',28:'1',29:'1',30:'2',31:'1',32:'2',35:'1'})[n]||'');
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,['NAT','SUBJECTIVE'].includes(q.questionType)?0:4);
  });
  assert.deepEqual(source.questions.reduce((a,q)=>({...a,[q.questionType]:(a[q.questionType]||0)+1}),{}),{MCQ:30,SUBJECTIVE:1,MSQ:1,NAT:3});
  assert.equal(source.questions[2].natAnswer,COMBINATIONAL_SOLUTION);
  assert.match(source.questions[2].natAnswer,/I_0=\\overline\{A\+B\}/);
  assert.match(source.questions[25].code,/if \(x is 1\) y = a;/);
  assert.match(source.questions[25].text,/\[CODE\]/);
  assert.equal(source.questions.filter(q=>q.text.includes('\\begin{array}')).length,2);
  assert.doesNotMatch(source.questions[23].text,/\\multicolumn/,'Table headings must render in the editor MathJax as well as TeX.');
  assert.match(source.questions[16].optB,/\\overline\{a_\{n-1\}b_\{n-1\}\}/);
  assert.match(source.questions[33].source.notes.join(' '),/apparent mismatch/);
});

test('every figure reference matches a reviewed crop and the shared export layout remains intact',()=>{
  const manifest=JSON.parse(fs.readFileSync(new URL('../data/imports/digital-logic-combinational-diagrams.json',import.meta.url)));
  const images=collectLatexImages(source.questions);
  assert.equal(images.length,20);
  assert.deepEqual(new Set(manifest.map(f=>f.file)),new Set(images));
  for(const file of manifest) {
    const bytes=fs.readFileSync(new URL(`../public/${source.subject}/${source.chapter}/${file.file}`,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
  }
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,35);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,34);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.match(tex,/\\color\{white\}/);
  assert.match(tex,/\\begin\{minipage\}\[t\]\{\\textwidth\}/);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]/);
});

test('repeat imports preserve user edits, IDs and locks and reject unreviewed collisions',()=>{
  const first=mergeReviewedImport([],source.questions,[]);
  assert.equal(first.added,35);
  first.questions[0].text='User edited text';
  first.questions[0].isPosLocked=true;
  first.questions[1].correctOptions=['B'];
  first.questions[2].natAnswer='User edited circuit answer';
  const repeat=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeat.added,0);
  assert.equal(repeat.alreadyPresent,35);
  assert.deepEqual(repeat.questions,first.questions);
  const collision={...source.questions[0]};delete collision.source;
  assert.throws(()=>mergeReviewedImport([collision],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[0]],source.questions,[]),/Duplicate source/);
});
