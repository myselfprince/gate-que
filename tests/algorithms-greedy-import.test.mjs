import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {ALGORITHMS_GREEDY_IMPORT as source} from '../data/imports/algorithms-greedy.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('80 source questions preserve the visually reviewed printed key, labels and metadata',()=>{
  const key='SUBJECTIVE B C B B B D B A A C A D D A D A B C A D A C D A D D A D B C D D B D C D D D B B B C D D B A B 358 69 B D A 7 B B 8 A 225 16 4 D 511 B 99 D BC 3 929 D AB A A ABC 24 B B 16 60 D'.split(' ');
  const labels='2002:2 2002:2 2003:1 2003:2 2003:2 2004:2 2004:2 2004:2 2004:2 2005:1 2005:1 2005:2 2005:2 2005:2 2005:2 2005:2 2006:1 2006:1 2006:1 2006:1 2006:2 2006:2 2006:2 2006:2 2006:2 2007:2 2007:2 2007:2 2007:2 2007:2 2008:2 2008:2 2008:2 2009:1 2009:2 2009:2 2009:2 2010:2 2010:2 2010:2 2011:1 2011:2 2011:2 2012:2 2012:2 2013:1 2014:1:2 2014:1:2 2014:2:2 2015:2:1 2015:2:1 2015:1:3 2016:1:1 2016:2:1 2016:2:1 2016:2:1 2016:2:2 2017:2:1 2017:2:2 2018:2 2018:2 2019:2 2020:2 2020:2 2020:2 2020:2 2021:2:1 2021:1:1 2021:1:2 2021:1:2 2021:2:2 2021:2:2 2021:1:2 2022:2 2022:2 2023:1 2023:2 2024:1:1 2024:2:1 2024:2:1'.split(' ');
  assert.equal(source.questions.length,80);
  assert.equal(labels.length,80);
  assert.equal(new Set(source.questions.map(q=>q.id)).size,80);
  for(const [i,q] of source.questions.entries()) {
    assert.equal(q.source.questionNumber,`3.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.sha256,source.sourceHash);
    assert.equal(q.source.answerKeyPdfPage,6);
    assert.match(q.source.notes[0],/book page 457/);
    const [year,marks,setNum='']=labels[i].split(':');
    assert.deepEqual([q.year,q.marks,q.setNum],[year,marks,setNum]);
    assert.equal(i===0?'SUBJECTIVE':q.correctOptions.join('')||q.natAnswer,key[i]);
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,['NAT','SUBJECTIVE'].includes(q.questionType)?0:4);
    for(const field of ['text','optA','optB','optC','optD']) {
      assert.equal((q[field].match(/\$/g)||[]).length%2,0,`${q.source.questionNumber} ${field}`);
      assert.doesNotMatch(q[field],/[\x00-\x08\x0b\x0c\x0e-\x1f]/);
    }
  }
  assert.equal(source.questions[0].natAnswer,'$O(m+n)$');
  assert.deepEqual(source.questions.reduce((a,q)=>(a[q.questionType]=(a[q.questionType]||0)+1,a),{}),{SUBJECTIVE:1,MCQ:62,NAT:14,MSQ:3});
  assert.deepEqual(source.questions.filter(q=>q.questionType==='MSQ').map(q=>q.source.questionNumber),['3.67','3.71','3.74']);
  assert.deepEqual([...new Set(source.questions.flatMap(q=>q.source.pdfPages))],[1,2,3,4,5,6]);
});

test('continuations, linked data, tables and source caveats remain editable',()=>{
  for(const [number,pages] of [[8,[447,448]],[16,[448,449]],[35,[450,451]],[69,[454,455]]]) assert.deepEqual(source.questions[number-1].source.bookPages,pages);
  for(const n of [14,15,39,40,51,59,60,75]) assert.match(source.questions[n-1].text,/\\begin\{(?:array|pmatrix|cases)\}/);
  for(const n of [25,29,37]) assert.match(source.questions[n-1].text,/Linked Q3\./);
  assert.equal(source.questions[41].diagram,source.questions[42].diagram);
  for(const n of [2,19,38,66]) assert.match(source.questions[n-1].source.notes.join(' '),/source|supplied|printed/i);
  assert.match(source.questions[65].text,/w\(u,v\)\+f\(v\)/);
  assert.doesNotMatch(source.questions[65].text,/-f\(u\)/);
  assert.equal(source.questions[44].optB,'SVDT');
  const manifest=JSON.parse(fs.readFileSync(new URL('../data/imports/algorithms-greedy-diagrams.json',import.meta.url),'utf8'));
  const images=collectLatexImages(source.questions);
  assert.equal(images.length,22);
  assert.equal(manifest.crops.length,22);
  for(const file of images) {
    const data=fs.readFileSync(new URL(`../public/${source.subject}/${source.chapter}/${file}`,import.meta.url));
    assert.equal(createHash('sha256').update(data).digest('hex'),manifest.crops.find(c=>c.file===file).sha256);
  }
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,80);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,79);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.match(tex,/\\color\{white\}/);
  assert.match(tex,/\\begin\{minipage\}\[t\]\{\\textwidth\}/);
  assert.doesNotMatch(tex,/\[IMG_\d+\]/);
  assert.doesNotMatch(source.questions.map(q=>q.text).join('\n'),/Explanations|2\.45/);
});

test('repeat import retains IDs, edits, answers, locks and unrelated records; ambiguous matches stop',()=>{
  const unrelated={id:'existing-user-question',text:'Existing unrelated question',isPosLocked:true};
  const first=mergeReviewedImport([unrelated],source.questions,[]);
  assert.equal(first.added,80);
  first.questions[1].text='An existing user edit';
  first.questions[1].isPosLocked=true;
  first.questions[2].correctOptions=['A'];
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,80);
  assert.deepEqual(repeated.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[1]],source.questions,[]),/Duplicate source/);
});
