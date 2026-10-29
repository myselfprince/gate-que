import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {COMPILER_SYNTAX_IMPORT as source} from '../data/imports/compiler-syntax.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('complete scan coverage preserves missing-key state, exam metadata and question types',()=>{
  assert.equal(source.questions.length,25);
  const years=[1995,1997,2003,2003,2003,2004,2004,2005,2005,2005,2006,2007,2014,2014,2016,2016,2018,2018,2019,2020,2021,2022,2023,2024,2024];
  const sets={13:'2',14:'3',15:'1',16:'1',21:'1',24:'1',25:'2'};
  const oneMark=new Set([1,2,3,6,14,17,25]);
  source.questions.forEach((q,i)=>{
    assert.equal(q.source.questionNumber,`3.${i+1}`);
    assert.equal(q.year,String(years[i]));
    assert.equal(q.setNum,sets[i+1]||'');
    assert.equal(q.marks,oneMark.has(i+1)?'1':'2');
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,null);
    assert.equal(q.source.answerKeyStatus,'not-supplied');
    assert.equal(q.natAnswer,'');
    assert.deepEqual(q.correctOptions,[]);
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,q.questionType==='NAT'?0:4);
    for(const field of ['text','optA','optB','optC','optD']) {
      assert.equal((q[field].match(/(?<!\\)\$/g)||[]).length%2,0);
      assert.doesNotMatch(q[field],/[\u0000-\u0008\u000b-\u001f]|\t/);
    }
  });
  assert.deepEqual(source.questions.reduce((a,q)=>(a[q.questionType]=(a[q.questionType]||0)+1,a),{}),{MCQ:20,NAT:4,MSQ:1});
});

test('shared data, page continuations, source caveats, code, tables and figure crops survive exports',async()=>{
  const q=n=>source.questions[n-1];
  assert.deepEqual(q(21).source.bookPages,[506,507]);
  assert.deepEqual(q(21).source.pdfPages,[2]);
  for(const n of [9,10]) assert.match(q(n).text,/E\^\{\(1\)\}.*E\^\{\(2\)\}/);
  assert.equal(q(9).optB,'It detects reduce-reduce conflict, and resolves');
  assert.match(q(11).code,/F -> \(S\)/);
  assert.match(q(21).code,/E -> ID \{set E.type := int;\}/);
  for(const n of [15,19,24]) assert.match(q(n).text,/\\begin\{array\}\{\|/);
  assert.match(q(22).text,/\\\%/);
  assert.match(q(23).text,/\\frac12/);
  const manifest=JSON.parse(await fs.readFile(new URL('../data/imports/compiler-syntax-diagrams.json',import.meta.url),'utf8'));
  const files=collectLatexImages(source.questions);
  assert.deepEqual(files,['syntax-3-13.png','syntax-3-18.png']);
  for(const item of manifest.crops) {
    const data=await fs.readFile(path.join('public',source.subject,source.chapter,item.file));
    assert.equal(createHash('sha256').update(data).digest('hex'),item.sha256);
  }
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,25);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,24);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.doesNotMatch(tex,/\[CODE\]|\[IMG_\d+\]/);
});

test('repeat merge retains edits, IDs and locks while unreviewed conflicts abort',()=>{
  const existing={id:'retain-me',text:'User question',isPosLocked:true};
  const first=mergeReviewedImport([existing],source.questions,[]);
  assert.equal(first.added,25);
  first.questions[1].text='User edited';
  first.questions[1].correctOptions=['B'];
  first.questions[1].isPosLocked=true;
  const again=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(again.added,0);
  assert.equal(again.alreadyPresent,25);
  assert.deepEqual(again.questions,first.questions);
  const legacy={...source.questions[0]}; delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[1]],source.questions,[]),/Duplicate source/);
});
