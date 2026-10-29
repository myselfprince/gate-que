import test from 'node:test';
import assert from 'node:assert/strict';
import {DYNAMIC_PROGRAMMING_IMPORT as source} from '../data/imports/algorithms-dynamic.mjs';
import {normalizeQuestionMetadata} from '../src/lib/question-metadata.mjs';
import {collectLatexImages} from '../src/lib/latex-source.mjs';
import {buildQuestionPages} from '../src/lib/question-pages.mjs';
import {mergeReviewedImport} from '../scripts/lib/cn-tcp-ip-merge.mjs';

test('14 DP identities, source boundary, exam labels and explicitly missing answers',()=>{
  assert.equal(source.questions.length,14);
  assert.equal(new Set(source.questions.map(q=>q.id)).size,14);
  const years=[1998,2004,2008,2008,2008,2008,2009,2009,2011,2013,2014,2016,2016,2018];
  for(const [i,q] of source.questions.entries()) {
    assert.equal(q.source.questionNumber,`4.${i+1}`);
    assert.deepEqual(normalizeQuestionMetadata(q).source,q.source);
    assert.deepEqual(q.source.pdfPages,[1]);
    assert.deepEqual(q.source.bookPages,i===7?[472,473]:[i<7?472:473]);
    assert.equal(q.source.answerKeyPdfPage,null);
    assert.equal(q.source.answerKeyStatus,'not-supplied');
    assert.match(q.source.notes[0],/PDF page 2 is the next chapter/);
    assert.equal(q.year,String(years[i]));
    assert.equal(q.marks,[0,8,9].includes(i)?'1':'2');
    assert.equal(q.setNum,({10:'2',11:'1',12:'2'})[i]||'');
    assert.deepEqual(q.correctOptions,[]);
    assert.equal(q.natAnswer,'');
    assert.equal([q.optA,q.optB,q.optC,q.optD].filter(Boolean).length,q.questionType==='NAT'?0:4);
    assert.equal(q.code,'');
    for(const field of ['text','optA','optB','optC','optD']) {
      assert.equal((q[field].match(/\$/g)||[]).length%2,0,`${q.source.questionNumber} ${field}`);
      assert.doesNotMatch(q[field],/[\x00-\x08\x0b\x0c\x0e-\x1f]/);
    }
  }
  assert.deepEqual(source.questions.reduce((a,q)=>(a[q.questionType]=(a[q.questionType]||0)+1,a),{}),{MCQ:11,NAT:3});
  assert.deepEqual(source.questions.filter(q=>q.questionType==='NAT').map(q=>q.source.questionNumber),['4.11','4.12','4.13']);
  assert.doesNotMatch(source.questions.map(q=>q.text).join('\n'),/Explanations|NP is NP-complete|2CNFSAT/);
});

test('shared data, continued options and printed anomalies stay editable and intact',()=>{
  const [q5,q6,q7,q8,q9,q10,q11,q12,,q14]=source.questions.slice(4);
  for(const q of [q5,q6]) {
    assert.match(q.text,/Boolean array, \$Y\$/);
    assert.match(q.text,/\$W-1\$ columns \$X\[i,j\]\$/);
  }
  assert.equal(q6.optD,'$X[n-1,n]$');
  for(const q of [q7,q8]) {
    assert.match(q.text,/X\[m\]/);
    assert.match(q.text,/LCS\) of \$X\[n\]\$/);
    assert.match(q.text,/\\mathrm\{expr2\}/);
  }
  assert.deepEqual(q8.source.bookPages,[472,473]);
  assert.match(q8.optA,/initialized to 0/);
  assert.match(q8.optD,/either \$p<r\$ or \$q<s\$/);
  assert.match(q9.text,/L_\{n\+1\}/);
  assert.equal(q10.optD,String.raw`$\Theta(n^3\log n)$`);
  assert.match(q11.text,/qpqrr/);
  assert.match(q11.text,/pqprqrp/);
  assert.match(q12.text,/\\begin\{bmatrix\}0&2&8&5\\\\2&0&5&8\\\\8&5&0&x\\\\5&8&x&0/);
  assert.match(q14.text,/\(G_1\(G_2G_3\)\)\(G_4\(G_5G_6\)\)/);
  assert.deepEqual(collectLatexImages(source.questions),[]);
  const tex=buildQuestionPages(source);
  assert.equal((tex.match(/% Question page /g)||[]).length,14);
  assert.equal((tex.match(/\\clearpage/g)||[]).length,13);
  assert.match(tex,/\\pagecolor\{black\}/);
  assert.match(tex,/\\color\{white\}/);
  assert.doesNotMatch(tex,/\[IMG_\d+\]|\[CODE\]/);
});

test('repeat import preserves edits, IDs, answers and locks; unreviewed matches stop',()=>{
  const unrelated={id:'unrelated-user-question',text:'An unrelated question',isPosLocked:true};
  const first=mergeReviewedImport([unrelated],source.questions,[]);
  assert.equal(first.added,14);
  first.questions[1].text='User edited prose';
  first.questions[1].isPosLocked=true;
  first.questions[1].correctOptions=['D'];
  first.questions[11].natAnswer='user answer';
  const repeated=mergeReviewedImport(first.questions,source.questions,[]);
  assert.equal(repeated.added,0);
  assert.equal(repeated.alreadyPresent,14);
  assert.deepEqual(repeated.questions,first.questions);
  assert.deepEqual(repeated.questions[0],unrelated);
  const legacy={...source.questions[0]};delete legacy.source;
  assert.throws(()=>mergeReviewedImport([legacy],source.questions,[]),/Unreviewed match/);
  assert.throws(()=>mergeReviewedImport([...first.questions,first.questions[1]],source.questions,[]),/Duplicate source/);
});
