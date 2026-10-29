import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { adminYearPaperSummary, validatePreparedYearPaper } from '../src/lib/admin-year-papers.mjs';

const fixture = { year: '2096', examPaper: 'IT', setNum: 'Session 2', questionCount: 2, totalMarks: 4, durationMinutes: 180,
  negativeFraction: 1 / 3, verified: true, questions: [1, 2].map(n => ({ id: `q${n}`, text: `Question ${n}`, paperQuestionNumber: String(n),
    marks: '2', questionType: 'MCQ', optA: 'First', optB: 'Second', optC: 'Third', optD: 'Fourth', correctOptions: n === 1 ? ['B'] : [] })) };

test('prepared papers are categorized as separate datasets and allow missing solution links and keys', () => {
  const paper = validatePreparedYearPaper(fixture);
  assert.equal(paper.slug, 'gate-it-2096-session-2');
  assert.ok(paper.questions.every(q => q.datasetId === paper.slug && q.year === '2096' && q.examPaper === 'IT' && q.setNum === 'Session 2'));
  assert.equal(paper.questions[0].manualReview, false);
  assert.equal(paper.questions[1].manualReview, true);
  assert.equal(paper.questions[1].gateOverflowUrl, '');
  const summary = adminYearPaperSummary(paper);
  assert.equal(summary.ready, true);
  assert.equal(summary.available, 2);
  assert.equal(summary.reviewCount, 1);
  assert.equal(summary.videoCount, 0);
  assert.ok(!('questions' in summary));
});

test('paper imports reject incomplete arrays, invalid options and inconsistent marks', () => {
  assert.throws(() => validatePreparedYearPaper({ ...fixture, questionCount: 3 }), /count/);
  assert.throws(() => validatePreparedYearPaper({ ...fixture, totalMarks: 5 }), /marks/);
  assert.throws(() => validatePreparedYearPaper({ ...fixture, examPaper: 'XX' }), /CS\/IT/);
  assert.throws(() => validatePreparedYearPaper({ ...fixture, questions: [fixture.questions[1], fixture.questions[0]] }), /original paper order/);
  assert.throws(() => validatePreparedYearPaper({ ...fixture, questions: fixture.questions.map(q => ({ ...q, gateOverflowUrl: 'https://evil.test' })) }), /gateoverflow/);
});

test('existing historical prepared papers retain original questions, diagrams and references when imported', async () => {
  const files = (await fs.readdir(new URL('../data/papers/', import.meta.url))).filter(name => /^gate-(?:cs|it)-200[0-4]\.json$/.test(name));
  assert.ok(files.length >= 3, 'The committed historical paper fixtures must be present.');
  for (const file of files) {
    const slug = file.slice(0, -5);
    const original = JSON.parse(await fs.readFile(new URL(`../data/papers/${slug}.json`, import.meta.url), 'utf8'));
    const paper = validatePreparedYearPaper(original);
    assert.equal(paper.slug, slug);
    assert.equal(paper.questions.length, original.questions.length);
    assert.equal(paper.sourceSha256, original.sourceSha256);
    for (const [index, q] of paper.questions.entries()) {
      for (const key of ['text', 'code', 'diagram', 'referenceAnswer', 'gateOverflowUrl']) assert.equal(q[key], original.questions[index][key] || '', `${slug} Q${index + 1} ${key}`);
    }
    const summary = adminYearPaperSummary(paper);
    assert.equal(summary.gateOverflowCount, original.questions.length);
  }
});
