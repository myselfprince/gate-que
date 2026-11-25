'use client';

// Browser side of /api/settings/<key>: load once, then save changes to MongoDB.
// Rapid edits (slider drags, typing) are debounced into one request; the latest
// value always wins, and a pending save is flushed when the page is hidden or closed.

// The newest value this tab has loaded or saved, per key. Panels remount when
// another topic loads; they start from this copy instead of re-reading the
// database, which may not have received a debounced or in-flight save yet and
// would otherwise bring back the previous topic's values.
const latest = new Map();

export async function loadWorkspaceSetting(key) {
  if (latest.has(key)) return latest.get(key);
  const response = await fetch(`/api/settings/${encodeURIComponent(key)}`, { cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) throw new Error(data.error || 'Saved settings could not be loaded from the database.');
  const value = data.data?.value ?? null;
  // A save made while this request was out is newer than what it returned.
  if (!latest.has(key) && value !== null) latest.set(key, value);
  return latest.has(key) ? latest.get(key) : value;
}

export function workspaceSettingSaver(key, { delay = 500, onStatus = () => {} } = {}) {
  let timer = null, pending, inFlight = Promise.resolve(), generation = 0;
  const send = (value, keepalive = false) => fetch(`/api/settings/${encodeURIComponent(key)}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value }), keepalive,
  }).then(async response => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.error || 'Settings could not be saved to the database.');
  });
  // Requests go out one at a time, so an older value can never land after a newer one.
  function run() {
    timer = null;
    const value = pending, current = ++generation;
    pending = undefined;
    onStatus('saving');
    const request = inFlight.catch(() => {}).then(() => send(value));
    inFlight = request.then(
      () => { if (current === generation && pending === undefined) onStatus('saved'); },
      error => { if (current === generation) onStatus('error', error); },
    );
    return request;
  }
  const flush = ({ afterInFlight = false } = {}) => {
    if (pending === undefined) return;
    clearTimeout(timer); timer = null;
    const value = pending; pending = undefined;
    // keepalive lets the request finish while the tab closes or the panel unmounts.
    const go = () => send(value, true).catch(() => {});
    if (afterInFlight) inFlight = inFlight.catch(() => {}).then(go); else go();
  };
  const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
  const onPageHide = () => flush();
  document.addEventListener('visibilitychange', onHide);
  window.addEventListener('pagehide', onPageHide);
  return {
    save(value) {
      latest.set(key, value);
      pending = value; clearTimeout(timer);
      timer = setTimeout(() => { run().catch(() => {}); }, delay);
      onStatus('pending');
    },
    // Saves at once (no debounce); resolves when the database has the value, rejects if it was refused.
    saveNow(value) {
      latest.set(key, value);
      pending = value; clearTimeout(timer);
      return run();
    },
    flush: () => flush(),
    // An unmounting panel queues its last edit behind any request still in flight.
    dispose() { flush({ afterInFlight: true }); document.removeEventListener('visibilitychange', onHide); window.removeEventListener('pagehide', onPageHide); },
  };
}
