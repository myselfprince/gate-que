import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {DBMS_RELATIONAL_MODEL_IMPORT as source} from '../data/imports/dbms-relational-model.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('36 reviewed identities, exam metadata, missing answers and continuation provenance',()=>{
  const years=[1996,1998,1999,1999,2000,2001,2002,2004,2004,2005,2005,2006,2006,2007,2007,2007,2007,2008,2009,2009,2009,2012,2013,2014,2014,2015,2017,2017,2018,2019,2021,2021,2022,2023,2024,2024];
  const marks=[2,2,1,1,1,2,1,1,2,1,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,1,2,1,1,1,2];
  const sets={24:'2',25:'3',26:'2',27:'1',28:'1',31:'1',32:'1',35:'1',36:'2'};
  assert.equal(source.questions.length,36);
  for(const [i,q] of source.questions.entries()) {
    const n=i+1;
    assert.equal(q.source.questionNumber,`4.${n}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.year,String(years[i]));
    assert.equal(q.marks,String(marks[i]));
    assert.equal(q.setNum,sets[n]||'');
    assert.equal(q.questionType,n===1?'SUBJECTIVE':[28,30,31,35].includes(n)?'NAT':n===33?'MSQ':'MCQ');
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,['MCQ','MSQ'].includes(q.questionType)?4:0);
    assert.equal(q.source.answerKeyStatus,'not-supplied');
    assert.equal(q.source.answerKeyPdfPage,null);
    assert.deepEqual(q.correctOptions,[]);
    assert.equal(q.natAnswer,'');
  }
  assert.deepEqual(source.questions[12].source.pdfPages,[1,2]);
  assert.deepEqual(source.questions[18].source.pdfPages,[2]);
  assert.deepEqual(source.questions[29].source.bookPages,[636,637]);
  assert.deepEqual(source.questions[8].source.bookPages,[632,633]);
  assert.match(source.questions[0].text,/\(b\)/);
  assert.match(source.questions[10].code,/marks >= 75/);
  assert.match(source.questions[10].text,/marks\}>75/);
  assert.match(source.questions[20].text,/Suppliers/);
  assert.match(source.questions[22].code,/S.roll.no/);
  assert.match(source.questions[34].source.notes.join(' '),/table header B/);
});

test('diagram checksum and shared exports retain editable math, code and full-width bodies',()=>{
  const manifest=JSON.parse(fs.readFileSync(new URL('../data/imports/dbms-relational-model-diagrams.json',import.meta.url)));
  assert.equal(manifest.sourceSHA256,source.sourceHash);
  assert.deepEqual(collectLatexImages(source.questions),['relational-model-4-13.png']);
  for(const entry of manifest.crops) {
    const bytes=fs.readFileSync(new URL(`../public/12. DBMS/4. Relational Model/${entry.file}`,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256);
  }
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,36);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.match(tex,/\\color\{white\}/);
  assert.match(tex,/\\begin\{minipage\}\[t\]\{\\textwidth\}/);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]/);
  assert.equal(source.questions.filter(q=>q.code).length,4);
});

test('repeat preserves edits, answers, IDs, unrelated questions and locks; unreviewed collisions fail',()=>{
  const unrelated={id:'user-note',text:'Keep my unrelated question',isPosLocked:true};
  const first=mergeReviewedImport([unrelated],source.questions,[]);
  assert.equal(first.added,36);
  first.questions[2].text='User edit';
  first.questions[2].isPosLocked=true;
  first.questions[2].correctOptions=['C'];
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,36);
  assert.deepEqual(repeated.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[1]],source.questions,[]),/Duplicate source/);
});
