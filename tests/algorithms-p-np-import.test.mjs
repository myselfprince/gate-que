import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {P_NP_IMPORT as source} from '../data/imports/algorithms-p-np.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('all eight printed questions, labels and literal answer-key anomalies are preserved',()=>{
  assert.equal(source.questions.length,8);
  const years=[2006,2008,2009,2013,2014,2014,2015,2015];
  const answers=['A','B','C','A','D','B','A','C'];
  for(const [i,q] of source.questions.entries()) {
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.questionNumber,`5.${i+1}`);
    assert.deepEqual(q.source.pdfPages,[1]);
    assert.deepEqual(q.source.bookPages,[476]);
    assert.equal(q.source.answerKeyPdfPage,1);
    assert.equal(q.year,String(years[i]));
    assert.equal(q.marks,[4,5,7].includes(i)?'2':'1');
    assert.equal(q.setNum,({4:'1',5:'3',6:'2',7:'3'})[i]||'');
    assert.equal(q.questionType,'MCQ');
    assert.deepEqual(q.correctOptions,[answers[i]]);
    assert.equal(q.natAnswer,'');
    assert.equal(q.code,'');
    for(const field of ['text','optA','optB','optC','optD']) assert.equal((q[field].match(/\$/g)||[]).length%2,0);
  }
  assert.match(source.questions[0].source.notes.join(' '),/answer A is preserved/);
  assert.match(source.questions[1].source.notes.join(' '),/answer B is preserved/);
  assert.match(source.questions[5].text,/\\overline\{x_3\}/);
  assert.match(source.questions[7].optC,/I and IV only/);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,8);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.match(tex,/\\color\{white\}/);
  assert.doesNotMatch(tex,/Explanations|\[IMG_\d+\]/);
});

test('the four cross-column Venn options have exact reproducible image references',async()=>{
  const files=collectLatexImages(source.questions);
  assert.deepEqual(files,['p-np-5-5-A.png','p-np-5-5-B.png','p-np-5-5-C.png','p-np-5-5-D.png']);
  const manifest=JSON.parse(await fs.readFile('data/imports/algorithms-p-np-diagrams.json','utf8'));
  assert.equal(manifest.sourceSHA256,source.sourceHash);
  for(const file of files) {
    const bytes=await fs.readFile(`public/${source.subject}/${source.chapter}/${file}`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.crops.find(c=>c.file===file).sha256);
  }
});

test('repeat import preserves user edits, IDs and locks, and rejects unreviewed collisions',()=>{
  const unrelated={id:'unrelated',text:'User question',isPosLocked:true};
  const first=mergeReviewedImport([unrelated],source.questions,[]);
  assert.equal(first.added,8);
  first.questions[1].text='User revised text';
  first.questions[1].correctOptions=['B'];
  first.questions[1].isPosLocked=true;
  const repeat=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeat.added,0);
  assert.equal(repeat.alreadyPresent,8);
  assert.deepEqual(repeat.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[1]],source.questions,[]),/Duplicate source/);
});
