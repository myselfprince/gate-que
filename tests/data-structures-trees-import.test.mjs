import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {DATA_STRUCTURES_TREES_IMPORT as source} from '../data/imports/data-structures-trees.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {mergeTreesImport} from '../scripts/lib/trees-merge.mjs';

test('Trees covers every printed number, missing key, continuations and original types',()=>{
  assert.equal(source.questions.length,65);
  const types={};
  source.questions.forEach((q,i)=>{
    assert.equal(q.source.questionNumber,`5.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,null);
    assert.equal(q.source.answerKeyStatus,'not-supplied');
    assert.deepEqual(q.correctOptions,[]);
    assert.equal(q.natAnswer,'');
    types[q.questionType]=(types[q.questionType]||0)+1;
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,q.questionType==='MCQ'?4:0);
  });
  assert.deepEqual(types,{MCQ:57,SUBJECTIVE:1,NAT:7});
  assert.match(source.questions[4].text,/\(e\) 17 77 27 66 18 43/);
  assert.match(source.questions[26].text,/An array X/);
  assert.match(source.questions[28].text,/An array X/);
  assert.match(source.questions[36].text,/number of its neighbours/);
  assert.match(source.questions[37].text,/number of its neighbours/);
  assert.deepEqual(source.questions[40].source.bookPages,[388,389]);
  assert.deepEqual(source.questions[46].source.bookPages,[389,390]);
  assert.deepEqual(source.questions[46].source.pdfPages,[3,4]);
  assert.match(source.questions[46].optD,/leaf nodes/);
  assert.equal(source.questions[47].questionType,'MCQ');
  assert.match(source.questions[57].optB,/S_2.*S_2/);
  assert.match(source.questions[59].text,/\|A-B\|/);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,65);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,64);
  assert.doesNotMatch(tex,/\[CODE\]|\[IMG_\d+\]|Explanations|DLLNode|SLLdel/);
});

test('Trees preserves the two printed copies but repeated imports add zero and retain edits',()=>{
  const first=mergeTreesImport([],source.questions);
  assert.equal(first.added,65);
  assert.equal(first.questions[3].text,first.questions[5].text);
  first.questions[3].text='User-edited first copy';
  first.questions[5].text='User-edited second copy';
  first.questions[0].correctOptions=['D'];
  first.questions[0].isPosLocked=true;
  const second=mergeTreesImport(first.questions,source.questions);
  assert.equal(second.added,0);
  assert.equal(second.alreadyPresent,65);
  assert.deepEqual(second.questions,first.questions);
  const duplicate=structuredClone(first.questions[0]);duplicate.id='duplicate-source';
  assert.throws(()=>mergeTreesImport([...first.questions,duplicate],source.questions),/Duplicate source identity/);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeTreesImport([legacy],source.questions),/Unreviewed match/);
  assert.throws(()=>mergeTreesImport([],[source.questions[5]]),/requires Q5.4/);
});

test('Trees figure references resolve to checksummed diagram-only crops',()=>{
  const manifest=JSON.parse(fs.readFileSync(new URL('../data/imports/data-structures-trees-diagrams.json',import.meta.url),'utf8'));
  assert.equal(manifest.sourceSHA256,source.sourceHash);
  assert.equal(collectLatexImages(source.questions).length,7);
  assert.equal(manifest.crops.length,7);
  for(const crop of manifest.crops) {
    assert.ok(collectLatexImages(source.questions).includes(crop.file));
    const bytes=fs.readFileSync(path.join('public',source.subject,source.chapter,crop.file));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),crop.sha256);
    assert.ok(crop.size[0]>=170 && crop.size[1]>=170);
  }
});
