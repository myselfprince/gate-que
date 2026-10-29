import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {PROBABILITY_IMPORT as source} from '../data/imports/maths-probability.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('69 Probability source identities, labels, boundaries and missing answers',()=>{
  const years=[1995,1996,1996,1997,1998,1999,1999,2000,2001,2002,2003,2003,2004,2004,2004,2004,2004,2004,2005,2005,2005,2006,2006,2007,2007,2007,2008,2008,2008,2008,2009,2010,2010,2011,2010,2011,2011,2012,2012,2013,2014,2014,2014,2014,2014,2015,2016,2016,2016,2017,2017,2017,2017,2018,2018,2019,2019,2020,2021,2021,2021,2021,2021,2021,2023,2024,2024,2024,2024];
  const oneMark=new Set([2,4,5,6,11,13,14,19,20,22,24,27,38,40,41,43,47,49,50,54,56,60,62,66,67,69]);
  const sets={41:'1',42:'1',43:'2',44:'2',45:'3',46:'3',47:'1',48:'1',49:'2',50:'1',51:'2',52:'2',53:'2',59:'1',60:'1',61:'1',62:'2',63:'2',64:'2',66:'1',67:'1',68:'1',69:'2'};
  assert.equal(source.questions.length,69);
  assert.equal(new Set(source.questions.map(q=>q.id)).size,69);
  for(const [i,q] of source.questions.entries()) {
    assert.equal(q.source.questionNumber,`5.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.year,String(years[i]));
    assert.equal(q.marks,oneMark.has(i+1)?'1':'2',q.source.questionNumber);
    assert.equal(q.setNum,sets[i+1]||'');
    assert.equal(q.source.answerKeyPdfPage,null);
    assert.equal(q.source.answerKeyStatus,'not-supplied');
    assert.deepEqual(q.correctOptions,[]);
    assert.equal(q.natAnswer,'');
    assert.equal(q.code,'');
    assert.ok(q.source.bookPages.every(p=>p>=75 && p<=81));
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,q.questionType==='NAT'?0:4);
    for(const field of ['text','optA','optB','optC','optD']) assert.equal((q[field].match(/\$/g)||[]).length%2,0);
  }
  assert.deepEqual(source.questions.reduce((a,q)=>(a[q.questionType]=(a[q.questionType]||0)+1,a),{}),{MCQ:46,MSQ:3,NAT:20});
  assert.deepEqual(source.questions.filter(q=>q.questionType==='MSQ').map(q=>q.source.questionNumber),['5.7','5.65','5.66']);
});

test('column/page continuations, anomalous source text, editable tables and exact diagram',()=>{
  const q=n=>source.questions[n-1];
  assert.match(q(6).optC,/greater than or equal to 5/);
  assert.match(q(25).optB,/10/);
  assert.deepEqual(q(29).source.pdfPages,[2,3]);
  assert.deepEqual(q(29).source.bookPages,[77,78]);
  assert.equal(q(29).optA,'0.24');
  assert.equal(q(29).optD,'0.6');
  assert.match(q(48).text,/Step 4[\s\S]*output of the experiment/);
  assert.equal(q(16).optC,'7525');
  assert.ok([q(26).optA,q(26).optB,q(26).optC,q(26).optD].every(s=>s.includes('e^{-20}')));
  assert.match(q(28).optB,/364\^\{r-2\}/);
  assert.ok([q(28).optA,q(28).optB,q(28).optC,q(28).optD].every(s=>s.startsWith('$\\displaystyle ')));
  assert.match(q(40).source.notes.join(' '),/incomplete time phrase/);
  assert.match(q(59).text,/\|X-/);
  for(const n of [55,63]) assert.match(q(n).text,/\\begin\{array\}/);
  const manifest=JSON.parse(fs.readFileSync('data/imports/maths-probability-diagrams.json','utf8'));
  assert.deepEqual(collectLatexImages(source.questions),manifest.crops.map(c=>c.file));
  for(const item of manifest.crops) assert.equal(createHash('sha256').update(fs.readFileSync(path.join('public',source.subject,source.chapter,item.file))).digest('hex'),item.sha256);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,69);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,68);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[DIAGRAM[^\]]*\]|\[CODE\]/);
  const body=tex.slice(tex.indexOf('% Question page 61'),tex.indexOf('% Question page 62'));
  assert.ok(body.indexOf('includegraphics')<body.indexOf('If the received signal'));
});

test('repeated imports preserve edits, answers, IDs and locks; collisions abort',()=>{
  const unrelated={id:'user-note',text:'Keep existing content',isPosLocked:true};
  const first=mergeReviewedImport([unrelated],source.questions,[]);
  assert.equal(first.added,69);
  first.questions[1].text='User edit';first.questions[1].isPosLocked=true;
  first.questions[1].correctOptions=['D'];first.questions[41].natAnswer='User answer';
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,69);
  assert.deepEqual(repeated.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[1]],source.questions,[]),/Duplicate source/);
});
