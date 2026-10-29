import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {LINEAR_ALGEBRA_IMPORT as source} from '../data/imports/maths-linear-algebra.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('Linear Algebra covers all 68 source identities with explicit missing-key metadata',()=>{
  assert.equal(source.questions.length,68);
  assert.equal(new Set(source.questions.map(q=>q.id)).size,68);
  assert.deepEqual(source.questions.reduce((a,q)=>(a[q.questionType]=(a[q.questionType]||0)+1,a),{}),{MCQ:46,SUBJECTIVE:1,NAT:18,MSQ:3});
  assert.deepEqual(source.questions.filter(q=>q.questionType==='MSQ').map(q=>q.source.questionNumber),['6.63','6.67','6.68']);
  assert.deepEqual(source.questions.filter(q=>q.questionType==='SUBJECTIVE').map(q=>q.source.questionNumber),['6.13']);
  for(const [i,q] of source.questions.entries()) {
    assert.equal(q.source.questionNumber,`6.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyStatus,'not-supplied');
    assert.equal(q.source.answerKeyPdfPage,null);
    assert.equal(q.natAnswer,'');assert.deepEqual(q.correctOptions,[]);
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,['NAT','SUBJECTIVE'].includes(q.questionType)?0:4);
    assert.ok(q.source.bookPages.every(p=>p>=95&&p<=101));
    assert.ok(q.source.pdfPages.every(p=>p>=1&&p<=4));
    assert.equal(q.code,'');
    for(const field of ['text','optA','optB','optC','optD']) {
      assert.equal((q[field].match(/\$/g)||[]).length%2,0,`${i+1} ${field}`);
      assert.doesNotMatch(q[field],/[\x00-\x08\x0b\x0c\x0e-\x1f]/);
    }
  }
});

test('page/column continuations, print anomalies and figure survive editable export',async()=>{
  const q=n=>source.questions[n-1];
  assert.deepEqual(q(51).source.pdfPages,[3,4]);
  assert.deepEqual(q(51).source.bookPages,[99,100]);
  assert.equal(q(51).optD,'Neither I nor II');
  assert.equal(q(46).optC,'$p+q+r=0$ or $p=q=r$');
  assert.equal(q(25).optA,q(25).optC);
  assert.match(q(27).text,/x_1\+2x_3\+3x_3/);
  assert.match(q(62).text,/\$U_\{32\}\$/);
  assert.match(q(62).optB,/U_\{32\}=2/);
  assert.match(q(62).optA,/U_\{33\}=/);
  assert.match(q(33).optA,/\\begin\{vmatrix\}/);
  assert.match(q(17).optD,/3\+\\sqrt5/);
  assert.deepEqual(collectLatexImages(source.questions),['linear-algebra-6-65-graph.png']);
  const manifest=JSON.parse(await fs.readFile('data/imports/maths-linear-algebra-diagrams.json','utf8'));
  assert.equal(manifest.sourceSHA256,source.sourceHash);
  const crop=manifest.crops[0];
  const bytes=await fs.readFile(`public/${source.subject}/${source.chapter}/${crop.file}`);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),crop.sha256);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,68);
  assert.match(tex,/\\pagecolor\{black\}/);assert.match(tex,/\\color\{white\}/);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]/);
});

test('repeats retain edits, answers, IDs and locks; unreviewed collisions stop',()=>{
  const unrelated={id:'unrelated-user-record',text:'Unrelated editable content',isPosLocked:true};
  const first=mergeReviewedImport([unrelated],source.questions,[]);
  assert.equal(first.added,68);
  first.questions[1].text='User edit';first.questions[1].correctOptions=['C'];first.questions[1].isPosLocked=true;
  first.questions[35].natAnswer='user answer';
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);assert.equal(repeated.alreadyPresent,68);
  assert.deepEqual(repeated.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[1]],source.questions,[]),/Duplicate source/);
});
