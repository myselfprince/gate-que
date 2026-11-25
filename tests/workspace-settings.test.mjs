import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PDF_SETTINGS } from '../src/lib/pdf-settings.mjs';
import { DEFAULT_YOUTUBE_SETTINGS } from '../src/lib/youtube-metadata.mjs';
import { normalizeWorkspaceSetting } from '../src/lib/workspace-settings.mjs';

test('PDF workspace settings keep every design value and saved template, and reject bad values', () => {
  const settings = { ...DEFAULT_PDF_SETTINGS, watermarkText: 'G4Gate', watermarkOpacity: 0.16, watermarkFontSize: 48, answerMode: 'toggle', theme: 'light' };
  const saved = normalizeWorkspaceSetting('pdf', { settings, templates: { 'My teaching style': { ...settings, fontSize: 24 } } });
  assert.deepEqual(saved.settings, settings);
  assert.equal(saved.templates['My teaching style'].fontSize, 24);
  // Missing keys fall back to defaults, so older saved copies still load.
  assert.equal(normalizeWorkspaceSetting('pdf', { settings: { watermarkText: 'X' } }).settings.pageSize, DEFAULT_PDF_SETTINGS.pageSize);
  for (const value of [null, [], { settings: { watermarkOpacity: 2 } }, { settings: { theme: 'neon' } }, { settings: {}, templates: [] },
    { settings: {}, templates: Object.fromEntries(Array.from({ length: 51 }, (_, i) => [`t${i}`, {}])) }]) {
    assert.throws(() => normalizeWorkspaceSetting('pdf', value), undefined, JSON.stringify(value)?.slice(0, 80));
  }
});

test('YouTube and scraper settings are validated; unknown keys are refused', () => {
  assert.deepEqual(normalizeWorkspaceSetting('youtube', { channelName: 'G4Gate', footer: 'Line 1\nLine 2', includeAnswer: true, extra: 'dropped' }),
    { ...DEFAULT_YOUTUBE_SETTINGS, channelName: 'G4Gate', footer: 'Line 1\nLine 2', includeAnswer: true });
  assert.throws(() => normalizeWorkspaceSetting('youtube', { titleStyle: 'clickbait' }));
  assert.throws(() => normalizeWorkspaceSetting('youtube', { channelName: 'a\nb' }));
  assert.deepEqual(normalizeWorkspaceSetting('scraper-group-prompt', { prompt: 'Format:\n1. ...', enabled: false }), { prompt: 'Format:\n1. ...', enabled: false });
  assert.throws(() => normalizeWorkspaceSetting('scraper-group-prompt', { prompt: 'x' }));
  assert.throws(() => normalizeWorkspaceSetting('theme', {}), /Unknown setting/);
  assert.throws(() => normalizeWorkspaceSetting('__proto__', {}), /Unknown setting/);
});

test('the browser saver debounces edits, keeps the latest value and flushes on close', async () => {
  const listeners = {}, requests = [];
  globalThis.document = { visibilityState: 'visible', addEventListener: (name, fn) => { listeners[name] = fn; }, removeEventListener: () => {} };
  globalThis.window = { addEventListener: (name, fn) => { listeners[name] = fn; }, removeEventListener: () => {} };
  globalThis.fetch = async (url, options) => { requests.push({ url, ...options, value: JSON.parse(options.body).value }); return { ok: true, json: async () => ({ success: true }) }; };
  try {
    const { workspaceSettingSaver } = await import('../src/lib/workspace-settings-client.js');
    const statuses = [];
    const saver = workspaceSettingSaver('pdf', { delay: 20, onStatus: status => statuses.push(status) });
    saver.save({ n: 1 }); saver.save({ n: 2 }); saver.save({ n: 3 });
    await new Promise(resolve => setTimeout(resolve, 60));
    assert.deepEqual(requests.map(request => request.value), [{ n: 3 }]);
    assert.equal(requests[0].method, 'PUT'); assert.equal(requests[0].url, '/api/settings/pdf');
    assert.equal(statuses.at(-1), 'saved');
    saver.save({ n: 4 });
    listeners.pagehide();
    assert.deepEqual(requests.at(-1).value, { n: 4 }); assert.equal(requests.at(-1).keepalive, true);
    await new Promise(resolve => setTimeout(resolve, 40));
    assert.equal(requests.length, 2, 'a flushed value is not sent twice');
    saver.dispose();
  } finally {
    delete globalThis.document; delete globalThis.window; delete globalThis.fetch;
  }
});

test('a remounted panel gets this tab\'s newest value, requests stay in order, and saveNow saves at once', async () => {
  const requests = [];
  let releaseFirst;
  globalThis.document = { visibilityState: 'visible', addEventListener: () => {}, removeEventListener: () => {} };
  globalThis.window = { addEventListener: () => {}, removeEventListener: () => {} };
  globalThis.fetch = async (url, options = {}) => {
    if (!options.method) return { ok: true, json: async () => ({ success: true, data: { value: { stale: true } } }) };
    const value = JSON.parse(options.body).value;
    if (value.n === 1) await new Promise(resolve => { releaseFirst = resolve; });
    requests.push(value);
    return { ok: true, json: async () => ({ success: true }) };
  };
  try {
    const { loadWorkspaceSetting, workspaceSettingSaver } = await import('../src/lib/workspace-settings-client.js');
    // Nothing saved in this tab yet: the database copy is read.
    assert.deepEqual(await loadWorkspaceSetting('scraper-group-prompt'), { stale: true });
    const saver = workspaceSettingSaver('youtube', { delay: 1000 });
    const first = saver.saveNow({ n: 1 });
    saver.save({ n: 2 });
    saver.dispose(); // panel unmounts (topic change) while the first save is still in flight
    // The next panel starts from the newest value, not the database's older copy.
    assert.deepEqual(await loadWorkspaceSetting('youtube'), { n: 2 });
    await new Promise(resolve => setTimeout(resolve, 0)); // the first request starts on the next tick
    releaseFirst(); await first;
    await new Promise(resolve => setTimeout(resolve, 10));
    assert.deepEqual(requests, [{ n: 1 }, { n: 2 }], 'the newer value is written last');
    globalThis.fetch = async () => ({ ok: false, json: async () => ({ success: false, error: 'Database offline.' }) });
    await assert.rejects(workspaceSettingSaver('youtube').saveNow({ n: 3 }), /Database offline/);
  } finally {
    delete globalThis.document; delete globalThis.window; delete globalThis.fetch;
  }
});
