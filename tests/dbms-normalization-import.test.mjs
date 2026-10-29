import test from 'node:test';
import assert from 'node:assert/strict';
import {DBMS_NORMALIZATION_IMPORT as source} from '../data/imports/dbms-normalization.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {storedAnswerText} from '../src/lib/question-answers.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('57 scanned questions retain order, page continuations, exam labels and printed answers',()=>{
  const years=[1995,1997,1997,1998,1998,1998,1999,1999,2000,2001,2001,2000,2002,2002,2003,2004,2004,2004,2005,2005,2005,2005,2006,2006,2006,2007,2007,2008,2008,2008,2010,2011,2012,2013,2013,2014,2014,2014,2014,2014,2014,2015,2016,2016,2017,2017,2018,2019,2020,2021,2021,2021,2022,2022,2024,2024,2024];
  const marks=[2,2,2,1,1,2,1,2,2,1,2,1,2,2,2,1,2,2,1,1,2,2,1,2,2,2,2,2,2,2,2,1,1,2,2,1,1,2,1,1,1,1,1,1,1,1,2,2,2,2,1,2,1,1,1,2,2];
  const answers='SOL A D D C SOL B A B C C A C C D A B B A C D B A B CD D C A D C A A C B A B D A 8 19 B C B B A 0 B D A D A ABD A 8 AC ACD 50'.split(' ');
  const sets={36:'1',37:'1',38:'1',39:'2',40:'2',41:'3',42:'3',43:'1',44:'1',45:'1',46:'2',50:'1',51:'2',52:'2',55:'1',56:'2',57:'2'};
  assert.equal(source.questions.length,57);
  for(const [i,q] of source.questions.entries()) {
    const n=i+1;
    assert.equal(q.source.questionNumber,`2.${n}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.year,String(years[i]));assert.equal(q.marks,String(marks[i]));
    assert.equal(q.setNum,sets[n]||'');
    assert.deepEqual(q.source.pdfPages,n===17?[1,2]:[n<=16?1:n<=35?2:n<=49?3:4]);
    assert.deepEqual(q.source.bookPages,n<=8?[602]:n<=16?[603]:n===17?[603,604]:n<=27?[604]:n<=35?[605]:n<=44?[606]:n<=49?[607]:[608]);
    assert.equal(q.source.answerKeyPdfPage,4);
    if(answers[i]==='SOL') {assert.equal(q.questionType,'SUBJECTIVE');assert.ok(q.isProof);}
    else if(/^\d+$/.test(answers[i])) {assert.equal(q.questionType,'NAT');assert.equal(q.natAnswer,answers[i]);}
    else {assert.deepEqual(q.correctOptions,[...answers[i]]);assert.equal(q.questionType,answers[i].length>1?'MSQ':'MCQ');}
    assert.ok(storedAnswerText(q));
  }
  assert.match(source.questions[5].natAnswer,/unavailable.*cut off/);
  assert.match(source.questions[16].text,/highest normal form/);
  assert.match(source.questions[26].text,/A\\twoheadrightarrow B\$ and \$A\\twoheadrightarrow C/);
  assert.match(source.questions[36].code,/FOREIGN KEY \(a\) references R\)/);
  assert.match(source.questions[36].text,/\[CODE\]/);
  assert.ok(!source.questions[36].text.includes('CREATE TABLE'));
  assert.match(source.questions[39].text,/swati@ee/);
  assert.match(source.questions[45].text,/\\langle3,8\\rangle/);
  assert.match(source.questions[46].text,/Schema IV/);
  assert.ok(source.questions[33].text.startsWith('Linked Answer'));
  assert.ok(source.questions[34].text.startsWith('Linked Answer'));
});

test('editable tables and SQL use the existing full-width one-question-per-page layout',()=>{
  assert.deepEqual(collectLatexImages(source.questions),[]);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,57);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,56);
  assert.match(tex,/\\pagecolor\{black\}/);assert.match(tex,/\\color\{white\}/);
  assert.match(tex,/\\begin\{minipage\}\[t\]\{\\textwidth\}/);
  assert.match(tex,/\\begin\{lstlisting\}/);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]/);
  for(const q of source.questions) for(const match of q.text.matchAll(/\\text\{([^{}]*)\}/g)) assert.doesNotMatch(match[1],/(?<!\\)_/);
});

test('repeat import retains edits, answers, IDs, locks and unrelated records; rejects unreviewed collisions',()=>{
  const unrelated={id:'user-record',text:'Unrelated user record',isPosLocked:true};
  const first=mergeReviewedImport([unrelated],source.questions,[]);
  assert.equal(first.added,57);
  first.questions[1].text='User edit';first.questions[1].isPosLocked=true;
  first.questions[1].natAnswer='User answer';
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);assert.equal(repeated.alreadyPresent,57);
  assert.deepEqual(repeated.questions,first.questions);
  assert.deepEqual(repeated.questions[0],unrelated);
  const legacy={...source.questions[1]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[1]],source.questions,[]),/Duplicate source/);
});
