import test from 'node:test';
import assert from 'node:assert/strict';
import { ThumbnailPreviewCache, reviewPreviewSettings } from '../src/lib/thumbnail-preview-cache.mjs';
const entries = n => Array.from({ length: n }, (_, i) => ({ question_id: `q-${i}`, index: i + 1 }));
const slides = group => group.map(entry => ({ questionId: entry.question_id, dataUrl: 'data:image/jpeg;base64,YWJj', warnings: [] }));
const flush = () => new Promise(resolve => setImmediate(resolve));

test('100 questions preload in ten batches with at most two in flight; revisits make no requests', async () => {
  const pending = [], calls = []; let active = 0, peak = 0;
  const cache = new ThumbnailPreviewCache({ entries: entries(100), fetchBatch: async group => {
    calls.push(group); active++; peak = Math.max(active, peak);
    await new Promise(resolve => pending.push(resolve)); active--; return slides(group);
  } });
  cache.start('q-0'); assert.equal(calls.length, 2);
  for (let i = 0; i < 10; i++) { pending.shift()(); await flush(); }
  assert.equal(cache.getSnapshot().completed, 100); assert.equal(calls.length, 10); assert.equal(peak, 2);
  for (let i = 99; i >= 0; i--) cache.prioritize(`q-${i}`);
  await flush(); assert.equal(calls.length, 10); assert.equal(cache.getSnapshot().images.get('q-55').dataUrl, 'data:image/jpeg;base64,YWJj');
});
test('navigation prioritizes a distant group without aborting the group already being reviewed', async () => {
  const calls = [], pending = [];
  const cache = new ThumbnailPreviewCache({ entries: entries(40), concurrency: 1, fetchBatch: async (group, signal) => {
    calls.push({ group, signal }); await new Promise(resolve => pending.push(resolve)); return slides(group);
  } });
  cache.start('q-0'); cache.prioritize('q-25'); assert.equal(calls[0].signal.aborted, false);
  pending.shift()(); await flush(); assert.equal(calls[1].group[0].question_id, 'q-20');
  cache.stop(); assert.equal(calls[1].signal.aborted, true); pending.shift()(); await flush();
});
test('changing settings cancels old work and stale responses cannot overwrite the new generation', async () => {
  const pending = [], calls = [];
  const cache = new ThumbnailPreviewCache({ entries: entries(2), fetchBatch: async (group, signal) => {
    calls.push(signal); return await new Promise(resolve => pending.push(() => resolve(slides(group))));
  } });
  cache.start('q-0'); cache.stop(); cache.start('q-0');
  assert.equal(calls[0].aborted, true); assert.equal(calls[1].aborted, false);
  pending[0](); await flush(); assert.equal(cache.getSnapshot().completed, 0);
  pending[1](); await flush(); assert.equal(cache.getSnapshot().completed, 2);
});
test('failed groups report useful errors while other groups load and an explicit retry recovers', async () => {
  let fail = true;
  const cache = new ThumbnailPreviewCache({ entries: entries(12), fetchBatch: async group => {
    if (group[0].question_id === 'q-0' && fail) throw Error('Image could not load');
    return slides(group);
  } });
  cache.start('q-0'); await flush(); assert.equal(cache.getSnapshot().completed, 2);
  assert.equal(cache.getSnapshot().errors.get('q-2'), 'Image could not load');
  fail = false; cache.retry('q-0'); await flush(); assert.equal(cache.getSnapshot().completed, 12); assert.equal(cache.getSnapshot().errors.size, 0);
});
test('cached preview data stays under the memory cap and an evicted question can reload', async () => {
  let calls = 0;
  const cache = new ThumbnailPreviewCache({ entries: entries(20), concurrency: 1, maxBytes: 600, fetchBatch: async group => { calls++; return slides(group); } });
  cache.start('q-0'); await flush();
  assert.ok(cache.bytes <= 600); assert.ok(cache.getSnapshot().images.has('q-0')); assert.equal(calls, 2);
  const evicted = entries(20).find(entry => !cache.getSnapshot().images.has(entry.question_id));
  cache.prioritize(evicted.question_id); await flush(); assert.ok(cache.getSnapshot().images.has(evicted.question_id)); assert.equal(calls, 3);
});
test('preview identity ignores cutout geometry and export resolution but includes visible base settings', () => {
  const settings = { template: 'question', theme: 'dark', contentWidth: 64, resolution: 1280, overlayX: 5 };
  assert.deepEqual(reviewPreviewSettings(settings), reviewPreviewSettings({ ...settings, resolution: 3840, overlayX: 90 }));
  assert.notDeepEqual(reviewPreviewSettings(settings), reviewPreviewSettings({ ...settings, theme: 'light' }));
});
