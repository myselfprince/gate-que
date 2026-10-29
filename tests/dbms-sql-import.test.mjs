import test from 'node:test';
import assert from 'node:assert/strict';
import {DBMS_SQL_IMPORT as source,DBMS_SQL_ANSWER_KEY as key} from '../data/imports/dbms-sql.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('SQL source coverage, supplied key, linked spreads and explicitly unresolved scan text',()=>{
  assert.equal(source.questions.length,42);
  const years=[1998,1999,1999,2000,2000,2003,2003,2004,2004,2004,2004,2005,2005,2005,2006,2006,2006,2006,2007,2008,2008,2011,2011,2012,2012,2012,2014,2014,2014,2014,2015,2015,2015,2016,2017,2017,2018,2019,2020,2021,2022,2023];
  const oneMark=new Set([6,24,29,32,33,35,37,39]);
  const nat=new Set([31,34,35,36,38,41,42]);
  const sets={27:'1',28:'2',29:'3',30:'3',31:'1',32:'1',33:'3',34:'2',35:'1',36:'2',40:'2'};
  for(const [i,q] of source.questions.entries()) {
    const n=i+1;
    assert.equal(q.source.questionNumber,`3.${n}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.year,String(years[i]));
    assert.equal(q.marks,oneMark.has(n)?'1':'2');
    assert.equal(q.setNum,sets[n]||'');
    assert.equal(q.source.answerKeyPdfPage,5);
    assert.deepEqual(q.source.pdfPages,[...new Set(q.source.bookPages.map(p=>Math.floor((p-616)/2)+1))]);
    assert.equal(q.questionType,[1,3].includes(n)?'SUBJECTIVE':nat.has(n)?'NAT':'MCQ');
    if(q.questionType==='MCQ')assert.deepEqual(q.correctOptions,[key[i]]);
    else {assert.ok(q.natAnswer);if(nat.has(n))assert.equal(q.natAnswer,key[i]);}
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,q.questionType==='MCQ'?4:0);
  }
  assert.deepEqual(source.questions[11].source.pdfPages,[1,2]);
  assert.deepEqual(source.questions[29].source.pdfPages,[3,4]);
  assert.deepEqual(source.questions[38].source.pdfPages,[4,5]);
  assert.equal(source.questions.filter(q=>q.code.includes('[unclear]')).length,1);
  assert.match(source.questions[26].code,/hire-dat\[unclear\]/);
  assert.deepEqual(source.questions[23].correctOptions,['C']);
  assert.equal(source.questions[34].natAnswer,'2.6');
  assert.match(source.questions[24].text,/How many tuples does the result/);
  assert.match(source.questions[24].text,/Assume that the schema/);
  assert.match(source.questions[24].text,/\\bowtie_/);
  assert.equal((source.questions[24].text.match(/\$\$/g)||[]).length,4);
  assert.match(source.questions[0].natAnswer,/FREQUENTS.student/);
  assert.match(source.questions[2].natAnswer,/count\(Employee-no\)/);
  assert.match(source.questions[14].text,/Schumacher/);
  assert.equal(source.questions[14].code,source.questions[15].code);
  assert.deepEqual(collectLatexImages(source.questions),[]);
});

test('SQL imports stop on legacy collisions and preserve edited records on repeats',()=>{
  const first=mergeReviewedImport([],source.questions,[]);
  assert.equal(first.added,42);
  first.questions[0].text='User edited question';first.questions[0].isPosLocked=true;
  const repeat=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeat.added,0);assert.deepEqual(repeat.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[0]],source.questions,[]),/Duplicate source/);
});

test('editable SQL export retains code, tables, black full-width one-question pages',()=>{
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,42);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,41);
  assert.match(tex,/\\pagecolor\{black\}/);assert.match(tex,/\\color\{white\}/);
  assert.match(tex,/\\begin\{minipage\}\[t\]\{\\textwidth\}/);
  assert.match(tex,/\\begin\{lstlisting\}/);
  assert.match(tex,/\\begin\{array\}/);
  assert.doesNotMatch(tex,/\[CODE\]|\[IMG_\d+\]/);
});
