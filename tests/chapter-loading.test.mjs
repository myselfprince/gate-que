import test from 'node:test';
import assert from 'node:assert/strict';
import { chapterQuestionWindow, mergeLoadedChapter } from '../src/lib/chapter-loading.mjs';

test('question loads accept finite batches and all, with a separate offset', () => {
  for (const count of [10, 25, 50, 100]) {
    assert.deepEqual(chapterQuestionWindow(new URLSearchParams(`limit=${count}&offset=10`)), { limit: count, offset: 10 });
  }
  assert.deepEqual(chapterQuestionWindow(new URLSearchParams('limit=all')), { limit: null, offset: 0 });
  assert.deepEqual(chapterQuestionWindow(new URLSearchParams()), { limit: null, offset: 0 });
  for (const query of ['limit=0', 'limit=-1', 'limit=1.5', 'limit=1001', 'limit=bad', 'offset=-10', 'offset=1.5', 'offset=bad']) {
    assert.throws(() => chapterQuestionWindow(new URLSearchParams(query)));
  }
});

const existing = { questions: Array.from({ length: 50 }, (_, i) => ({ id: `q-${i + 1}`, text: `Question ${i + 1}` })), lockCount: 0 };

test('saving ten edited questions preserves the other forty questions in order', () => {
  const questions = existing.questions.slice(0, 10).map(q => ({ ...q, text: 'Edited' }));
  const saved = mergeLoadedChapter(existing, { questions, lockCount: 3 }, 10);
  assert.equal(saved.questions.length, 50);
  assert.deepEqual(saved.questions.slice(0, 10), questions);
  assert.deepEqual(saved.questions.slice(10), existing.questions.slice(10));
  assert.equal(saved.lockCount, 3);
  assert.equal(existing.questions[0].text, 'Question 1');
});

test('inserting or deleting in a loaded batch keeps the unloaded tail and its bulk locks', () => {
  const locked = { ...existing, lockCount: 25 };
  const inserted = [...existing.questions.slice(0, 10), { id: 'new', text: 'Inserted' }];
  const saved = mergeLoadedChapter(locked, { questions: inserted, lockCount: 10 }, 10);
  assert.equal(saved.questions.length, 51);
  assert.equal(saved.lockCount, 26);
  assert.deepEqual(saved.questions.slice(11), existing.questions.slice(10));
  const deleted = mergeLoadedChapter(locked, { questions: [], lockCount: 0 }, 10);
  assert.equal(deleted.questions.length, 40);
  assert.equal(deleted.lockCount, 15);
  assert.deepEqual(deleted.questions, existing.questions.slice(10));
});

test('a fully loaded chapter can be replaced, and invalid ranges cannot drop questions', () => {
  assert.deepEqual(mergeLoadedChapter(existing, { questions: [], lockCount: 0 }, 50), { questions: [], lockCount: 0 });
  for (const count of [-1, 51, 1.5, '10', undefined]) {
    assert.throws(() => mergeLoadedChapter(existing, { questions: [], lockCount: 0 }, count));
  }
  assert.throws(() => mergeLoadedChapter(existing, { questions: Array(1000).fill({}), lockCount: 0 }, 10), /1000/);
});
