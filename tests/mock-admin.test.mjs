import test from 'node:test';
import assert from 'node:assert/strict';
import { answerDraft, validateAdminAnswer, validateAdminLinks, adminQuestionRecord, adminAnswerStatus } from '../src/lib/mock-admin.mjs';
import { gradeAttempt } from '../src/lib/gatemock.mjs';
import { parseGateOverflowPage, sanitizeReferenceHtml } from '../src/lib/gateoverflow-reader.mjs';

const question = { key: 'qa:1', id: 'q1', text: 'Choose', year: '2026', marks: '2', subject: 'QA', chapter: 'QA', optA: 'a', optB: 'b', optC: 'c', optD: 'd', questionType: 'MCQ', correctOptions: ['A'] };
const draft = extra => ({ ...answerDraft(question), ...extra });
const score = (extra, value) => gradeAttempt([{ ...question, ...extra }], { responses: [{ key: question.key, value }] });

test('admin saves single MCQ and exact MSQ selections used by grading', () => {
  assert.throws(() => validateAdminAnswer(draft({ correctOptions: ['A', 'C'] }), question), /MCQ/);
  assert.throws(() => validateAdminAnswer(draft({ correctOptions: [] }), question), /Tick/);
  assert.throws(() => validateAdminAnswer(draft({ correctOptions: ['D'] }), { ...question, optD: '' }), /no content/);
  const answer = validateAdminAnswer(draft({ questionType: 'MSQ', correctOptions: ['C', 'A'] }), question);
  assert.deepEqual(answer.correctOptions, ['A', 'C']);
  assert.equal(score(answer, ['A', 'C']).score, 2);
  assert.equal(score(answer, ['A']).score, 0);
  assert.equal(score(answer, ['A', 'B', 'C']).score, 0);
});

test('NAT exact zero, negatives, decimals and ranges survive type changes and inclusive grading', () => {
  const nat = value => validateAdminAnswer(draft({ questionType: 'NAT', correctOptions: [], ...value }), question);
  for (const value of ['0', '-2.5', '.25', '1e-3']) {
    const answer = nat({ natMode: 'exact', natAnswer: value });
    assert.equal(answer.natRange, null);
    assert.equal(score(answer, value).score, 2);
    assert.deepEqual(answer.correctOptions, []);
  }
  const range = nat({ natMode: 'range', natMin: '-1.5', natMax: '0' });
  assert.equal(range.natAnswer, '');
  assert.equal(score(range, '-1.5').score, 2);
  assert.equal(score(range, '0').score, 2);
  assert.equal(score(range, '0.01').score, 0);
  for (const bad of ['', 'Infinity', 'NaN', '0x10', '12abc']) assert.throws(() => nat({ natMode: 'exact', natAnswer: bad }), /numeric/);
  assert.throws(() => nat({ natMode: 'range', natMin: '2', natMax: '1' }), /range/);
  assert.throws(() => nat({ natMode: 'range', natMin: '', natMax: '1' }), /range/);
  assert.equal(answerDraft({ ...question, questionType: 'NAT', natRange: { min: 0, max: 0 } }).natMode, 'range');
});

test('admin answer patch preserves non-answer content and an explicit manual-review decision', () => {
  const answer = validateAdminAnswer(draft({ manualReview: true, gateOverflowUrl: 'https://gateoverflow.in/998/example' }), question);
  assert.equal(score(answer, ['A']).entries[0].status, 'ungraded');
  assert.equal(adminAnswerStatus({ ...question, ...answer }), 'review');
  assert.equal(adminAnswerStatus(question), 'saved');
  assert.equal(adminAnswerStatus({ ...question, correctOptions: [] }), 'missing');
  assert.ok(!('text' in answer));
  assert.ok(!('source' in answer));
  assert.ok(!('isPosLocked' in answer));
  const written = validateAdminAnswer(draft({ questionType: 'SUBJECTIVE', correctOptions: [] }), { ...question, natAnswer: 'A written reference.' });
  assert.equal(written.natAnswer, 'A written reference.');
  assert.equal(written.manualReview, true);
  assert.throws(() => validateAdminAnswer(draft({ gateOverflowUrl: 'https://evil.test/a' }), question), /gateoverflow/);
  const record = adminQuestionRecord({ ...question, text: 'x'.repeat(500), datasetId: 'qa-paper', source: { private: true } }, 'revision');
  assert.equal(record.text.length, 500);
  assert.equal(record.updatedAt, 'revision');
  assert.equal(record.questionId, 'q1');
  assert.ok(!('source' in record));
});

test('reference reader keeps math, source labels, code and safe diagrams without executable HTML', () => {
  const url = 'https://gateoverflow.in/998/example';
  const content = sanitizeReferenceHtml('<p onclick="bad()">$x$<script>alert(1)</script><script type="math/tex">a+b</script><a href="javascript:alert(1)">bad</a><img src="/images/a.png" onerror="bad()"><img src="https://evil.test/tracker"><svg onload="bad()"></svg><iframe src="evil"></iframe><code>n++</code></p>', url);
  assert.doesNotMatch(content, /onclick|onerror|<script|<svg|<iframe|javascript:|evil\.test/);
  assert.match(content, /\$a\+b\$/);
  assert.match(content, /https:\/\/gateoverflow.in\/images\/a.png/);
  const parsed = parseGateOverflowPage('<h1>GATE question</h1><div class="qa-q-view-content"><p>Question</p></div><div class="qa-a-list-item qa-a-list-item-selected"><div class="qa-a-item-content">Answer $C$</div><div class="qa-a-item-meta"><a class="qa-user-link">Author</a></div></div>', url);
  assert.equal(parsed.posts.length, 2);
  assert.equal(parsed.posts[1].label, 'Accepted answer · Author');
  assert.throws(() => parseGateOverflowPage('<h1>Cloudflare</h1>', url), /readable/);
});

test('solution links save independently of missing or disputed answer keys', () => {
  const questionWithNoKey = { ...question, correctOptions: [], manualReview: true };
  const patch = validateAdminLinks({ gateOverflowUrl: 'https://gateoverflow.in/998/example', solutionUrl: 'https://youtu.be/dQw4w9WgXcQ?t=90' });
  assert.equal(patch.solutionUrl, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90s');
  assert.ok(!('correctOptions' in patch));
  assert.ok(!('manualReview' in patch));
  const saved = { ...questionWithNoKey, ...patch };
  assert.deepEqual(saved.correctOptions, []);
  assert.equal(saved.manualReview, true);
  assert.equal(score(patch, ['A']).entries[0].solutionUrl, patch.solutionUrl);
  assert.deepEqual(validateAdminLinks({ solutionUrl: '' }), { solutionUrl: '' });
  assert.throws(() => validateAdminLinks({ solutionUrl: 'javascript:alert(1)' }), /YouTube/);
  assert.throws(() => validateAdminLinks({ gateOverflowUrl: 'https://evil.test' }), /gateoverflow/);
});
