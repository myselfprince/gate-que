import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {NUMBER_SYSTEMS_IMPORT as source} from '../data/imports/digital-logic-number-systems.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('all 62 source questions preserve continuations, shared data, types and missing key',()=>{
  assert.equal(source.questions.length,62);
  assert.equal(new Set(source.questions.map(q=>q.id)).size,62);
  const nat=[38,39,41,42,43,52,54,58];
  source.questions.forEach((q,i)=>{
    const n=i+1;
    assert.equal(q.source.questionNumber,`4.${n}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyStatus,'not-supplied');
    assert.equal(q.source.answerKeyPdfPage,null);
    assert.deepEqual(q.correctOptions,[]);
    assert.equal(q.natAnswer,'');
    assert.equal(q.questionType,nat.includes(n)?'NAT':[55,62].includes(n)?'MSQ':'MCQ');
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,nat.includes(n)?0:4);
  });
  assert.deepEqual(source.questions[27].source.bookPages,[234,235]);
  assert.deepEqual(source.questions[52].source.pdfPages,[3]);
  assert.deepEqual(source.questions[52].source.bookPages,[236,237]);
  assert.equal(source.questions[24].diagram,source.questions[25].diagram);
  assert.ok(source.questions[8].code.includes('Y := Y + B'));
  assert.match(source.questions[56].text,/0xC4210000/);
});

test('diagrams are complete, checksum guarded and shared PDF layout stays intact',()=>{
  const manifest=JSON.parse(fs.readFileSync(new URL('../data/imports/digital-logic-number-systems-diagrams.json',import.meta.url)));
  assert.equal(manifest.length,5);
  assert.deepEqual(new Set(manifest.map(d=>d.file)),new Set(collectLatexImages(source.questions)));
  for(const d of manifest) {
    const bytes=fs.readFileSync(new URL(`../public/${source.subject}/${source.chapter}/${d.file}`,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),d.sha256);
  }
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,62);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.match(tex,/\\color\{white\}/);
  assert.match(tex,/\\begin\{minipage\}\[t\]\{\\textwidth\}/);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]/);
});

test('repeat import preserves user edits, IDs, answers, position locks and unrelated questions',()=>{
  const first=mergeReviewedImport([],source.questions,[]);
  assert.equal(first.added,62);
  first.questions[0].text='User text';
  first.questions[0].isPosLocked=true;
  first.questions[0].correctOptions=['B'];
  first.questions[37].natAnswer='Edited numeric answer';
  const repeat=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeat.added,0);
  assert.equal(repeat.alreadyPresent,62);
  assert.deepEqual(repeat.questions,first.questions);
  const legacy={...source.questions[1]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[0]],source.questions,[]),/Duplicate source/);
});
