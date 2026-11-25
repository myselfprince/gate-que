import test from 'node:test';
import assert from 'node:assert/strict';
import { applyChapterPatch, ChapterSyncConflict, isLargeRemoval, planChapterSync, questionFingerprint, syncBaseline } from '../src/lib/chapter-sync.mjs';

const q = (id, extra = {}) => ({ id, text: `Q ${id}`, optA: 'a', optB: 'b', ...extra });
const saved = [q('1'), q('2'), q('3')];
const state = { baseline: syncBaseline(saved), lockCount: 0 };

test('an unchanged screen needs no save; browser-only flags are ignored', () => {
  assert.equal(planChapterSync(state, saved.map(item => ({ ...item, _justFilled: false })), 0).empty, true);
  assert.equal(questionFingerprint(q('1')), questionFingerprint({ ...q('1'), _justFilled: true }));
  assert.notEqual(questionFingerprint(q('1')), questionFingerprint(q('1', { optA: 'A' })));
});

test('editing a question sends only that question, without an order', () => {
  const plan = planChapterSync(state, [saved[0], q('2', { optB: 'changed', _justFilled: true }), saved[2]], 0);
  assert.equal(plan.empty, false);
  assert.deepEqual(plan.upserts, [q('2', { optB: 'changed' })]);
  assert.equal(plan.order, undefined);
  assert.equal(plan.lockCount, undefined);
  assert.equal(plan.removed, 0);
  assert.deepEqual(plan.nextBaseline.map(([id]) => id), ['1', '2', '3']);
});

test('inserting, deleting and moving questions sends the new order and only new or changed questions', () => {
  const plan = planChapterSync(state, [saved[2], q('new'), saved[0]], 0);
  assert.deepEqual(plan.order, ['3', 'new', '1']);
  assert.deepEqual(plan.upserts.map(item => item.id), ['new']);
  assert.equal(plan.removed, 1);
  assert.equal(planChapterSync(state, saved, 2).lockCount, 2);
});

test('repeated or missing ids fall back to a full save', () => {
  assert.equal(planChapterSync(state, [saved[0], saved[0]], 0).needsFullSave, true);
  assert.equal(planChapterSync(state, [{ text: 'no id' }], 0).needsFullSave, true);
});

test('large removals are held for confirmation', () => {
  const many = Array.from({ length: 10 }, (_, i) => q(String(i)));
  const base = { baseline: syncBaseline(many), lockCount: 0 };
  assert.equal(isLargeRemoval(planChapterSync(base, many.slice(0, 9), 0), 10), false);
  assert.equal(isLargeRemoval(planChapterSync(base, many.slice(0, 5), 0), 10), true);
  assert.equal(isLargeRemoval(planChapterSync(state, [], 0), 3), true, 'clearing the whole chapter');
});

test('the server applies an order to the loaded prefix and keeps everything after it', () => {
  const existing = { questions: [q('1'), q('2'), q('3'), q('4')], lockCount: 0 };
  const merged = applyChapterPatch(existing, { loadedCount: 2, order: ['2', 'x', '1'], upserts: [q('x'), q('1', { optA: 'edited' })] });
  assert.deepEqual(merged.questions.map(item => item.id), ['2', 'x', '1', '3', '4']);
  assert.equal(merged.questions[2].optA, 'edited');
  assert.equal(merged.lockCount, 0);
  assert.equal(applyChapterPatch(existing, { loadedCount: 4, lockCount: 2 }).lockCount, 2);
  // A chapter-wide lock past the loaded prefix shifts with inserted questions.
  assert.equal(applyChapterPatch({ ...existing, lockCount: 3 }, { loadedCount: 2, order: ['1', 'x', '2'], upserts: [q('x')] }).lockCount, 4);
  assert.throws(() => applyChapterPatch(existing, { loadedCount: 2, order: ['missing'] }), ChapterSyncConflict);
  assert.throws(() => applyChapterPatch(existing, { loadedCount: 9, order: [] }), ChapterSyncConflict);
});
