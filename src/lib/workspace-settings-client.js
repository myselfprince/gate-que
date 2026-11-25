'use client';

// Browser side of /api/settings/<key>: load once, then save changes to MongoDB.
// Rapid edits (slider drags, typing) are debounced into one request; the latest
// value always wins, and a pending save is flushed when the page is hidden or closed.
export async function loadWorkspaceSetting(key) {
  const response = await fetch(`/api/settings/${encodeURIComponent(key)}`, { cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) throw new Error(data.error || 'Saved settings could not be loaded from the database.');
  return data.data?.value ?? null;
}

export function workspaceSettingSaver(key, { delay = 500, onStatus = () => {} } = {}) {
  let timer = null, pending, inFlight = Promise.resolve(), generation = 0;
  const send = (value, keepalive = false) => fetch(`/api/settings/${encodeURIComponent(key)}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value }), keepalive,
  }).then(async response => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.error || 'Settings could not be saved to the database.');
  });
  function run() {
    timer = null;
    const value = pending, current = ++generation;
    pending = undefined;
    onStatus('saving');
    inFlight = inFlight.catch(() => {}).then(() => send(value)).then(
      () => { if (current === generation && pending === undefined) onStatus('saved'); },
      error => { if (current === generation) onStatus('error', error); },
    );
    return inFlight;
  }
  const flush = () => {
    if (pending === undefined) return;
    clearTimeout(timer); timer = null;
    const value = pending; pending = undefined;
    // keepalive lets the request finish while the tab closes or the panel unmounts.
    send(value, true).catch(() => {});
  };
  const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
  document.addEventListener('visibilitychange', onHide);
  window.addEventListener('pagehide', flush);
  return {
    save(value) { pending = value; clearTimeout(timer); timer = setTimeout(run, delay); onStatus('pending'); },
    flush,
    dispose() { flush(); document.removeEventListener('visibilitychange', onHide); window.removeEventListener('pagehide', flush); },
  };
}
