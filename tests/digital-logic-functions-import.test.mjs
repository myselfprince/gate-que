import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {DIGITAL_LOGIC_FUNCTIONS_IMPORT as source} from '../data/imports/digital-logic-functions.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('all 76 source numbers, printed keys, types, sets and cross-page references survive',()=>{
  const key='C C B C B C D C D B C C A B A C - - D D B B A C C A A - C D C B C A C D D D A C A A A B A B A D B A D A D B D B 1 3 A A C 1 A C D 3 D 3 A B ACD 6 AD AC AC BC'.split(' ');
  assert.equal(source.questions.length,76);
  assert.equal(new Set(source.questions.map(q=>q.id)).size,76);
  for(const [i,q] of source.questions.entries()) {
    const n=i+1;
    assert.equal(q.source.questionNumber,`1.${n}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,5);
    assert.equal(q.correctOptions.join('')||q.natAnswer||'-',key[i]);
    const pages=n<=10?[191]:n<=18?[192]:n<=28?[193]:n<=36?[194]:n===37?[194,195]:n<=47?[195]:n<=57?[196]:n<=68?[197]:n===69?[197,198]:[198];
    assert.deepEqual(q.source.bookPages,pages);
    assert.deepEqual(q.source.pdfPages,[...new Set(pages.map(p=>Math.floor((p-190)/2)+1))]);
    assert.equal(q.setNum,({52:'1',53:'2',54:'3',55:'3',56:'1',57:'2',58:'3',59:'3',60:'1',61:'2',62:'1',63:'2',64:'2',71:'1',72:'2',73:'1',74:'1',75:'2',76:'2'})[n]||'');
  }
  assert.deepEqual(source.questions.reduce((c,q)=>({...c,[q.questionType]:(c[q.questionType]||0)+1}),{}),{MCQ:64,SUBJECTIVE:1,NAT:6,MSQ:5});
  for(const n of [17,18,28])assert.match(source.questions[n-1].source.notes.join(' '),/left empty|unresolved|no answer has been inferred/);
});

test('linked data, editable K-maps, figure-only images and original notation are retained',()=>{
  for(const n of [34,35])assert.match(source.questions[n-1].text,/Linked Answer Q1\.34/);
  assert.match(source.questions[7].text,/00&01&10&11/);
  assert.match(source.questions[16].text,/6 NAND gates/);
  assert.equal(source.questions[16].questionType,'SUBJECTIVE');
  assert.match(source.questions[36].text,/XY\+XY'/);
  assert.match(source.questions[74].optA,/\\cdot/);
  assert.ok(source.questions.every(q=>q.code===''));
  assert.equal(source.questions.filter(q=>q.text.includes('\\begin{array}')).length,12);
  const manifest=JSON.parse(fs.readFileSync(new URL('../data/imports/digital-logic-functions-diagrams.json',import.meta.url)));
  const images=collectLatexImages(source.questions);
  assert.equal(images.length,18);
  assert.deepEqual(new Set(manifest.map(f=>f.file)),new Set(images));
  for(const file of manifest){
    const bytes=fs.readFileSync(new URL(`../public/${source.subject}/${source.chapter}/${file.file}`,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
  }
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,76);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,75);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]/);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.match(tex,/\\color\{white\}/);
});

test('repeat import preserves IDs, edited answers and locks; unreviewed collisions stop',()=>{
  const first=mergeReviewedImport([],source.questions,[]);
  assert.equal(first.added,76);
  first.questions[0].text='User edited prose';
  first.questions[0].isPosLocked=true;
  first.questions[1].correctOptions=['D'];
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,76);
  assert.deepEqual(repeated.questions,first.questions);
  const collision={...source.questions[0]};delete collision.source;
  assert.throws(()=>mergeReviewedImport([collision],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[0]],source.questions,[]),/Duplicate source/);
});
