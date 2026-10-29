import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {DBMS_ER_MODEL_IMPORT as source} from '../data/imports/dbms-er-model.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('all 14 printed identities, exam labels, page provenance and missing answer states',()=>{
  const years=[2004,2004,2005,2005,2005,2008,2008,2012,2015,2017,2018,2020,2024,2024];
  const marks=[2,2,1,2,2,2,2,1,2,1,1,1,1,1];
  assert.equal(source.questions.length,14);
  for(const [i,q] of source.questions.entries()) {
    assert.equal(q.source.questionNumber,`1.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.year,String(years[i]));
    assert.equal(q.marks,String(marks[i]));
    assert.equal(q.setNum,({8:'1',9:'2',12:'1',13:'2'})[i]||'');
    assert.deepEqual(q.source.pdfPages,[i<5?1:2]);
    assert.deepEqual(q.source.bookPages,[i<5?597:i<12?598:599]);
    assert.equal(q.source.answerKeyStatus,'not-supplied');
    assert.equal(q.source.answerKeyPdfPage,null);
    assert.equal(q.natAnswer,'');
    assert.deepEqual(q.correctOptions,[]);
    assert.equal(q.questionType,i===8?'NAT':'MCQ');
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,i===8?0:4);
    for(const key of ['text','optA','optB','optC','optD']) assert.equal((q[key].match(/\$/g)||[]).length%2,0);
  }
  assert.match(source.questions[0].text,/computeSalary/);
  assert.match(source.questions[0].text,/getSalary/);
  assert.equal(source.questions[4].optD,'1');
  assert.match(source.questions[4].text,/\\begin\{array\}/);
  assert.match(source.questions[6].text,/Preceding Question 1.6/);
  assert.match(source.questions[8].text,/If a relational model is derived/);
  assert.deepEqual([source.questions[12].optA,source.questions[12].optB,source.questions[12].optC,source.questions[12].optD],['(iii)','(ii)','(iv)','(i)']);
  assert.equal(source.questions[12].pdfStyle.imageScale,1.5);
});

test('figure-only assets match reviewed checksums and shared export keeps full-width text',()=>{
  const manifest=JSON.parse(fs.readFileSync(new URL('../data/imports/dbms-er-model-diagrams.json',import.meta.url)));
  assert.equal(manifest.sourceSHA256,source.sourceHash);
  assert.equal(collectLatexImages(source.questions).length,5);
  for(const entry of manifest.crops) {
    const bytes=fs.readFileSync(new URL(`../public/12. DBMS/1. ER Model/${entry.file}`,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256);
  }
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,14);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,13);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.match(tex,/\\color\{white\}/);
  assert.match(tex,/\\begin\{minipage\}\[t\]\{\\textwidth\}/);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]/);
});

test('repeat import preserves user edits and locks; collisions and duplicate sources stop',()=>{
  const existing={id:'unrelated',text:'An unrelated user question',isPosLocked:true};
  const first=mergeReviewedImport([existing],source.questions,[]);
  assert.equal(first.added,14);
  first.questions[1].text='Edited by user';
  first.questions[1].correctOptions=['C'];
  first.questions[1].isPosLocked=true;
  first.questions[9].natAnswer='4';
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,14);
  assert.deepEqual(repeated.questions,first.questions);
  assert.deepEqual(repeated.questions[0],existing);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[1]],source.questions,[]),/Duplicate source/);
});
