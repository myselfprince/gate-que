import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {DBMS_FILE_STRUCTURES_IMPORT as source,DBMS_FILE_STRUCTURES_ANSWER_KEY as key} from '../data/imports/dbms-file-structures.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('File Structures covers both scanned spreads, all source answers and page continuations',()=>{
  const years=[1999,2000,2002,2004,2004,2005,2005,2005,2005,2006,2007,2007,2007,2008,2008,2009,2010,2015,2015,2015,2016,2017,2019,2020,2021,2023,2024,2024];
  const oneMark=new Set([1,2,6,7,14,17,18,19,21,23,25,27,28]);
  const sets={18:'1',19:'2',20:'3',21:'2',22:'2',25:'2',27:'1',28:'2'};
  assert.equal(source.questions.length,28);
  assert.equal(new Set(source.questions.map(q=>q.id)).size,28);
  for(const [i,q] of source.questions.entries()) {
    const n=i+1;
    assert.equal(q.source.questionNumber,`6.${n}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    if(q.pdfStyle) assert.deepEqual(normalizeQuestionMetadata(q).pdfStyle,q.pdfStyle);
    assert.equal(q.year,String(years[i]));
    assert.equal(q.marks,oneMark.has(n)?'1':'2');
    assert.equal(q.setNum,sets[n]||'');
    assert.equal(q.source.answerKeyPdfPage,2);
    assert.equal(q.questionType,[19,20,22,24,25,26].includes(n)?'NAT':n===28?'MSQ':'MCQ');
    if(q.questionType==='NAT') {assert.equal(q.natAnswer,key[i]);assert.deepEqual(q.correctOptions,[]);}
    else assert.deepEqual(q.correctOptions,[...key[i]]);
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,q.questionType==='NAT'?0:4);
    assert.deepEqual(q.source.pdfPages,[...new Set(q.source.bookPages.map(p=>Math.floor((p-656)/2)+1))]);
  }
  assert.deepEqual(source.questions[18].source.pdfPages,[1,2]);
  assert.match(source.questions[18].source.notes.join(' '),/order 1/);
  assert.equal(source.questions[7].text.split('\n')[0],source.questions[8].text.split('\n')[0]);
  assert.match(source.questions[12].text,/Keys K15 and then K25/);
  assert.match(source.questions[25].text,/\\lceil\\log_2 b\\rceil/);
  const manifest=JSON.parse(fs.readFileSync(new URL('../data/imports/dbms-file-structures-diagrams.json',import.meta.url)));
  assert.equal(manifest.sourceSHA256,source.sourceHash);
  assert.deepEqual(collectLatexImages(source.questions),manifest.crops.map(c=>c.file));
  for(const crop of manifest.crops) {
    const bytes=fs.readFileSync(new URL('../public/'+source.subject+'/'+source.chapter+'/'+crop.file,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),crop.sha256);
  }
});

test('File Structures repeats preserve edits and locks while unreviewed matches are rejected',()=>{
  const first=mergeReviewedImport([],source.questions,[]);
  assert.equal(first.added,28);
  first.questions[0].text='User edit';first.questions[0].isPosLocked=true;
  const repeat=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeat.added,0);assert.deepEqual(repeat.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[0]],source.questions,[]),/Duplicate source/);
});

test('File Structures PDF and editable source retain full width, diagrams and one question per page',()=>{
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,28);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,27);
  assert.match(tex,/\\pagecolor\{black\}/);assert.match(tex,/\\color\{white\}/);
  assert.match(tex,/\\begin\{minipage\}\[t\]\{\\textwidth\}/);
  assert.match(tex,/\\boxed/);
  for(const file of collectLatexImages(source.questions)) assert.ok(tex.includes(file));
  assert.doesNotMatch(tex,/\[IMG_\d+\]/);
});
