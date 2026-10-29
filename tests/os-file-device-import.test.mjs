import test from 'node:test';
import assert from 'node:assert/strict';
import {OS_FILE_DEVICE_IMPORT as source} from '../data/imports/os-file-device.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {buildAnswerKey} from '../src/lib/answer-key.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('35 visually read source identities and independently transcribed printed key',()=>{
  const key=['B C B D A AC C B D','C A C C B C B B C','B D B B B 3 99.6 10 346','D 85 4 C BC 153 4096 30.06'].join(' ').split(' ');
  assert.equal(source.questions.length,35);
  const counts={};
  source.questions.forEach((q,i)=>{
    assert.equal(q.source.questionNumber,`5.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.equal(q.source.answerKeyPdfPage,3);
    assert.equal(q.natAnswer||q.correctOptions.join(''),key[i]);
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,q.questionType==='NAT'?0:4);
    assert.match(q.marks,/^[12]$/);
    assert.match(q.year,/^(199[789]|200[123456789]|201[2456789]|202[0124])$/);
    assert.match(q.setNum,/^[12]?$/);
    counts[q.questionType]=(counts[q.questionType]||0)+1;
    for(const field of ['text','optA','optB','optC','optD']) {
      assert.equal((q[field].match(/\$/g)||[]).length%2,0);
      assert.doesNotMatch(q[field],/[\x00-\x08\x0b\x0c\x0e-\x1f]/);
    }
  });
  assert.deepEqual(counts,{MCQ:24,MSQ:2,NAT:9});
  assert.doesNotMatch(buildAnswerKey(source),/Answer not available/);
});

test('shared passage, facing-page continuations, editable tables and source anomalies retained',()=>{
  const q=n=>source.questions[n-1];
  for(const [n,pages] of [[1,[585]],[11,[585,586]],[15,[586]],[19,[586,587]],[29,[587,588]],[35,[588]]]) assert.deepEqual(q(n).source.bookPages,pages);
  assert.deepEqual(q(11).source.pdfPages,[1,2]);
  assert.deepEqual(q(29).source.pdfPages,[2,3]);
  for(const n of [1,2,7]) assert.match(q(n).text,/\\begin\{array\}/);
  for(const n of [17,18]) assert.match(q(n).text,/initially positioned at track number 180/);
  assert.match(q(15).text,/bookkeeping information for a file or data from a file, but not both/);
  assert.match(q(19).text,/Some programs do not exhibit locality/);
  assert.match(q(29).text,/\[118, 16, 1\]/);
  assert.match(q(29).text,/20 milliwatts/);
  assert.match(q(16).source.notes.join(' '),/grammatically incomplete/);
  assert.match(q(28).text,/no external fragmentation/);
  for(const [n,set] of [[24,'1'],[25,'2'],[26,'1'],[27,'1'],[28,'2'],[32,'1'],[34,'1'],[35,'2']]) assert.equal(q(n).setNum,set);
  assert.deepEqual(collectLatexImages(source.questions),[]);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,35);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,34);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.ok(source.questions.every(q=>!q.source.bookPages.some(p=>p<585||p>588)));
});

test('repeat import preserves existing edits, IDs, locks and unrelated records; collisions stop',()=>{
  const unrelated={id:'existing-user-record',text:'Keep this',isPosLocked:true};
  const first=mergeReviewedImport([unrelated],source.questions,[]);
  assert.equal(first.added,35);
  first.questions[1].text='User edit';first.questions[1].isPosLocked=true;
  first.questions[32].correctOptions=['D'];
  const repeat=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeat.added,0);assert.equal(repeat.alreadyPresent,35);
  assert.deepEqual(repeat.questions,first.questions);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[1]],source.questions,[]),/Duplicate source/);
});
