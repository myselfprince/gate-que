import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {DBMS_TRANSACTIONS_IMPORT as source,DBMS_TRANSACTIONS_ANSWER_KEY as key} from '../data/imports/dbms-transactions.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('Transactions coverage, chronology, type and source key match all reviewed pages',()=>{
  const years=[1999,2003,2003,2004,2004,2005,2006,2007,2007,2008,2009,2010,2010,2012,2013,2014,2014,2014,2015,2015,2015,2016,2016,2016,2016,2016,2017,2017,2019,2020,2021,2021,2021,2022,2024,2024,2024];
  const oneMark=new Set([2,4,6,7,12,15,19,20,22,23,25,29,31,36,37]);
  const sets={16:'1',17:'2',18:'3',19:'2',20:'2',21:'3',22:'1',23:'1',24:'1',25:'2',26:'2',27:'1',28:'2',31:'1',32:'1',33:'2',35:'1',36:'2',37:'2'};
  assert.equal(source.questions.length,37);
  assert.equal(new Set(source.questions.map(q=>q.id)).size,37);
  for(const [i,q] of source.questions.entries()) {
    const n=i+1;
    assert.equal(q.source.questionNumber,`5.${n}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.year,String(years[i]));
    assert.equal(q.marks,oneMark.has(n)?'1':'2');
    assert.equal(q.setNum,sets[n]||'');
    assert.equal(q.source.answerKeyPdfPage,4);
    assert.equal(q.questionType,[22,28].includes(n)?'NAT':[31,35,37].includes(n)?'MSQ':'MCQ');
    if(q.questionType==='NAT') {assert.equal(q.natAnswer,key[i]);assert.deepEqual(q.correctOptions,[]);}
    else assert.deepEqual(q.correctOptions,[...key[i]]);
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,q.questionType==='NAT'?0:4);
    assert.deepEqual(q.source.pdfPages,[...new Set(q.source.bookPages.map(p=>Math.floor((p-644)/2)+1))]);
  }
  assert.deepEqual(source.questions[9].source.pdfPages,[1,2]);
  assert.deepEqual(source.questions[16].source.bookPages,[646,647]);
  assert.deepEqual(source.questions[26].source.bookPages,[648]);
  assert.match(source.questions[9].text,/2RA\\ 2WA/);
  assert.equal(source.questions[8].code.match(/unlock \(A\);/g).length,10);
  assert.match(source.questions[10].source.notes.join(' '),/key appears inconsistent/);
  assert.match(source.questions[29].source.notes.join(' '),/WD twice/);
  assert.deepEqual(collectLatexImages(source.questions),['transactions-5-22.png']);
  const manifest=JSON.parse(fs.readFileSync(new URL('../data/imports/dbms-transactions-diagrams.json',import.meta.url)));
  assert.equal(manifest.sourceSHA256,source.sourceHash);
  for(const crop of manifest.crops) {
    const bytes=fs.readFileSync(new URL('../public/'+source.subject+'/'+source.chapter+'/'+crop.file,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),crop.sha256);
  }
});

test('Transactions merge preserves edits and locks on repeat and rejects unreviewed collisions',()=>{
  const first=mergeReviewedImport([],source.questions,[]);
  assert.equal(first.added,37);
  first.questions[0].text='User edit';first.questions[0].isPosLocked=true;
  const repeat=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeat.added,0);assert.deepEqual(repeat.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[0]],source.questions,[]),/Duplicate source/);
});

test('Transactions exports keep editable schedules, code, graph, full width and one page per question',()=>{
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,37);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,36);
  assert.match(tex,/\\pagecolor\{black\}/);assert.match(tex,/\\color\{white\}/);
  assert.match(tex,/\\begin\{minipage\}\[t\]\{\\textwidth\}/);
  assert.match(tex,/\\begin\{lstlisting\}/);assert.match(tex,/\\begin\{array\}/);
  assert.match(tex,/transactions-5-22.png/);
  assert.doesNotMatch(tex,/\[CODE\]|\[IMG_\d+\]/);
});
