import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {DATA_STRUCTURES_STACKS_QUEUES_IMPORT as source} from '../data/imports/data-structures-stacks-queues.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {storedAnswerText} from '../src/lib/question-answers.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('Stacks and Queues covers every printed question, continuation and answer',()=>{
  assert.equal(source.questions.length,30);
  const answers='B A A D 3x1+log*a2/- C B D B C A D C A A B A A C 15 C A 256 C B B 86 0 8 ABD'.split(' ');
  source.questions.forEach((q,i)=>{
    assert.equal(q.source.questionNumber,`3.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,3);
    assert.equal(q.correctOptions.join('')||q.natAnswer.replaceAll(' ',''),answers[i]);
    assert.ok(storedAnswerText(q));
    assert.equal((q.text.match(/\$/g)||[]).length%2,0);
    assert.equal(q.source.sha256,source.sourceHash);
    assert.deepEqual(q.source.pdfPages,[...new Set(q.source.bookPages.map(p=>Math.floor((p-368)/2)+1))]);
  });
  const types=source.questions.reduce((a,q)=>(a[q.questionType]=(a[q.questionType]||0)+1,a),{});
  assert.deepEqual(types,{MCQ:23,SUBJECTIVE:1,NAT:5,MSQ:1});
  assert.deepEqual(source.questions[15].source.bookPages,[369,370]);
  assert.deepEqual(source.questions[21].source.bookPages,[370,371]);
  assert.deepEqual(source.questions[27].source.bookPages,[371,372]);
  assert.deepEqual(source.questions[27].source.pdfPages,[2,3]);
  assert.deepEqual(source.questions[29].correctOptions,['A','B','D']);
  assert.equal(source.questions[29].setNum,'2');
  assert.equal(source.questions[0].optB,'ABCD+*F/+DE*++');
  assert.match(source.questions[19].code,/stkTop = -1\n/);
  assert.match(source.questions[28].text,/a_2=7.*a_2=8/);
  for(const n of [1,10,20,29]) assert.ok(source.questions[n-1].source.notes.length>1);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,30);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,29);
  assert.doesNotMatch(tex,/\[CODE\]|\[IMG_\d+\]|Explanations/);
  assert.ok(tex.includes(String.raw`\begin{minipage}[t]{\textwidth}`));
});

test('diagram-only crops match reviewed checksums and portable references',()=>{
  const manifest=JSON.parse(fs.readFileSync('data/imports/data-structures-stacks-queues-diagrams.json','utf8'));
  assert.equal(manifest.sourceSHA256,source.sourceHash);
  assert.deepEqual(collectLatexImages(source.questions).sort(),manifest.crops.map(c=>c.file).sort());
  for(const crop of manifest.crops) assert.equal(createHash('sha256').update(fs.readFileSync(`public/${source.subject}/${source.chapter}/${crop.file}`)).digest('hex'),crop.sha256);
});

test('repeat import retains edits, IDs and locks and refuses unreviewed legacy matches',()=>{
  const first=mergeReviewedImport([],source.questions,[]);
  first.questions[0].text='User-edited question';
  first.questions[0].correctOptions=['D'];
  first.questions[0].isPosLocked=true;
  const repeat=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeat.added,0);
  assert.equal(repeat.alreadyPresent,30);
  assert.deepEqual(repeat.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([source.questions[0],source.questions[0]],source.questions,[]),/Duplicate source identity/);
  assert.equal(mergeReviewedImport([{id:'unrelated',text:'Unrelated saved question',isPosLocked:true}],source.questions,[]).questions[0].isPosLocked,true);
});
