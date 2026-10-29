import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {DATA_STRUCTURES_GRAPHS_IMPORT as source} from '../data/imports/data-structures-graphs.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('Graphs covers all printed questions, continuations, types, key and exact diagram crops',()=>{
  const answers=['','C','C','D','B','D','D','B','D','D','C','D','C','C','B','C','19','6','31','B','D','A','80','A','5040'];
  assert.equal(source.questions.length,25);
  const types={};
  for(const [i,q] of source.questions.entries()) {
    assert.equal(q.source.questionNumber,`6.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,2);
    assert.deepEqual(q.source.bookPages,[i<6?402:i<16?403:404]);
    assert.deepEqual(q.source.pdfPages,[i<16?1:2]);
    if(i)assert.equal(q.correctOptions.join('')||q.natAnswer,answers[i]);
    types[q.questionType]=(types[q.questionType]||0)+1;
  }
  assert.deepEqual(types,{SUBJECTIVE:1,MCQ:18,NAT:5,MSQ:1});
  assert.match(source.questions[0].natAnswer,/P_5 & 1 & 1 & 0 & 0 & 0/);
  assert.match(source.questions[0].source.notes.join(' '),/disagree/);
  assert.match(source.questions[3].text,/4\. a f g h b e/);
  assert.match(source.questions[11].text,/terminates/);
  assert.equal(source.questions[20].optD,'POQNMR');
  assert.deepEqual(source.questions.filter(q=>q.setNum).map(q=>[q.source.questionNumber,q.setNum]),[
    ['6.16','1'],['6.17','3'],['6.18','1'],['6.19','2'],['6.20','2'],['6.21','2'],['6.24','1'],
  ]);
  const manifest=JSON.parse(fs.readFileSync(new URL('../data/imports/data-structures-graphs-diagrams.json',import.meta.url)));
  assert.equal(manifest.sourceSHA256,source.sourceHash);
  assert.equal(collectLatexImages(source.questions).length,7);
  for(const crop of manifest.crops)assert.equal(createHash('sha256').update(fs.readFileSync(path.join('public',source.subject,source.chapter,crop.file))).digest('hex'),crop.sha256);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,25);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]|Explanations/);
});

test('Graphs repeat-import retains edits, IDs, answers and locks; unexpected collisions require review',()=>{
  const first=mergeReviewedImport([],source.questions,[]);
  first.questions[0].text='User-edited question';
  first.questions[0].isPosLocked=true;
  first.questions[1].correctOptions=['D'];
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,25);
  assert.deepEqual(repeated.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([first.questions[0],first.questions[0]],source.questions,[]),/Duplicate source identity/);
});
