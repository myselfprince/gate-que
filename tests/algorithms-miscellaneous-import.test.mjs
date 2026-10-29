import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {ALGORITHMS_MISCELLANEOUS_IMPORT as source} from '../data/imports/algorithms-miscellaneous.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('25 source questions retain book order, exam labels and the printed answer key',()=>{
  const key=['C','D','B','B','D','D','D','B','D','D','A','B','C','B','D','C','B','B','C','C','150','C','C','C','C'];
  const years=[1996,1996,1997,1998,1999,1999,1999,2003,2003,2004,2004,2006,2006,2006,2006,2006,2006,2008,2013,2014,2014,2015,2015,2017,2016];
  const marks=[2,2,1,1,1,1,2,2,2,2,2,1,1,1,2,2,2,2,2,1,2,1,2,1,1];
  assert.equal(source.questions.length,25);
  assert.equal(new Set(source.questions.map(q=>q.id)).size,25);
  for(const [i,q] of source.questions.entries()) {
    assert.equal(q.source.questionNumber,`6.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.deepEqual(q.source.bookPages,[i<9?478:i<19?479:480]);
    assert.deepEqual(q.source.pdfPages,[i<19?1:2]);
    assert.equal(q.source.answerKeyPdfPage,2);
    assert.equal(q.year,String(years[i]));assert.equal(q.marks,String(marks[i]));
    assert.equal(q.setNum,({19:'1',20:'3',21:'1',22:'2',23:'1',24:'2'})[i]||'');
    assert.equal(q.questionType,i===20?'NAT':'MCQ');
    assert.deepEqual(q.correctOptions,i===20?[]:[key[i]]);
    assert.equal(q.natAnswer,i===20?'150':'');
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,i===20?0:4);
    for(const field of ['text','optA','optB','optC','optD']) assert.equal((q[field].match(/\$/g)||[]).length%2,0);
  }
  assert.match(source.questions[4].text,/Minimum number of exchanges required/);
  for(const q of source.questions.slice(7,9)) assert.match(q.text,/an inversion is a pair/);
  assert.equal(source.questions[6].optD,'m - w, n - u, o - v, p - v');
  assert.match(source.questions[6].text,/T_\{\\frac\{n\}\{2\}\}/);
  assert.equal(source.questions[11].optB,'n');
  assert.match(source.questions[14].text,/\[CODE\]/);
  assert.match(source.questions[14].code,/algorithm zzz/);
  assert.equal(source.questions.filter(q=>q.code).length,1);
  assert.match(source.questions[23].text,/\\begin\{array\}/);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,25);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,24);
  assert.match(tex,/\\pagecolor\{black\}/);assert.match(tex,/\\color\{white\}/);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]/);
});

test('every diagram reference resolves to the reviewed crop bytes',async()=>{
  const manifest=JSON.parse(await fs.readFile('data/imports/algorithms-miscellaneous-diagrams.json','utf8'));
  assert.equal(manifest.sourceSHA256,source.sourceHash);
  const files=collectLatexImages(source.questions);assert.equal(files.length,3);
  for(const file of files) {
    const bytes=await fs.readFile(path.join('public',source.subject,source.chapter,file));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.crops.find(c=>c.file===file).sha256);
  }
});

test('repeat import preserves user edits, IDs, locks, unrelated records and stops collisions',()=>{
  const unrelated={id:'unrelated',text:'Existing unrelated question',isPosLocked:true};
  const first=mergeReviewedImport([unrelated],source.questions,[]);assert.equal(first.added,25);
  first.questions[1].text='User edited question';first.questions[1].isPosLocked=true;first.questions[1].correctOptions=['A'];
  first.questions[21].natAnswer='user edited answer';
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);assert.equal(repeated.alreadyPresent,25);assert.deepEqual(repeated.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[1]],source.questions,[]),/Duplicate source/);
});
