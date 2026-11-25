'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { isLargeRemoval, planChapterSync } from './chapter-sync.mjs';

const AUTOSAVE_DELAY = 1200;
const RETRY_DELAY = 10_000;

// Saves editor changes to MongoDB automatically, a moment after you stop typing.
// Only changed questions are sent (see chapter-sync.mjs). One request runs at a
// time; edits made while it runs are sent right after it.
//
// status.state: idle | pending | saving | saved | error (retries) | paused (needs Load
// Database or Save) | confirm (a large removal waits for Save) | unlinked (not loaded from the database).
export function useChapterAutosave({ subject, chapter, questions, lockCount, databaseState, setDatabaseState, isDirty, setIsDirty, enabled, onFullSave, onLockCorrected }) {
  const [status, setStatus] = useState({ state: 'idle' });
  const latest = useRef(null);
  const running = useRef(null);
  const again = useRef(false);
  useLayoutEffect(() => {
    latest.current = { subject, chapter, questions, lockCount, databaseState, onFullSave, onLockCorrected };
  });

  // options.lockCount: a bulk lock just set on screen (state has not re-rendered yet).
  const syncOnce = useCallback(async ({ allowLargeRemoval = false, lockCount: lockOverride } = {}) => {
    const { subject, chapter, questions, databaseState, onFullSave, onLockCorrected } = latest.current;
    const lockCount = lockOverride ?? latest.current.lockCount;
    if (!databaseState?.baseline) { setStatus({ state: 'unlinked' }); return { ok: false, reason: 'unlinked' }; }
    const plan = planChapterSync({ baseline: databaseState.baseline, lockCount: databaseState.savedLockCount ?? 0 }, questions, lockCount);
    if (plan.empty) { setIsDirty(false); setStatus({ state: 'saved', at: Date.now() }); return { ok: true }; }
    if (plan.needsFullSave) {
      // Repeated or missing question ids: single questions cannot be addressed, so save the whole chapter.
      setStatus({ state: 'saving' });
      const saved = await onFullSave?.();
      setStatus(saved ? { state: 'saved', at: Date.now() } : { state: 'error', message: 'The full chapter save did not complete.' });
      return saved ? { ok: true, data: saved } : { ok: false, reason: 'error' };
    }
    if (!allowLargeRemoval && isLargeRemoval(plan, databaseState.baseline.length)) {
      setStatus({ state: 'confirm', removed: plan.removed });
      return { ok: false, reason: 'confirm' };
    }
    setStatus({ state: 'saving' });
    const body = {
      subject, chapter, baseRevision: databaseState.updatedAt ?? null, loadedCount: databaseState.loadedCount ?? 0,
      upserts: plan.upserts, ...(plan.order && { order: plan.order }), ...(plan.lockCount !== undefined && { lockCount: plan.lockCount }),
    };
    let response, data;
    try {
      response = await fetch('/api/chapters', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      data = await response.json().catch(() => ({}));
    } catch {
      setStatus({ state: 'error', message: 'No connection to the server. Your changes are kept in this browser and will be retried.' });
      return { ok: false, reason: 'error' };
    }
    if (latest.current.subject !== subject || latest.current.chapter !== chapter) return { ok: false, reason: 'switched' };
    if (!response.ok || !data.success) {
      const message = data.error || 'The database did not accept this save.';
      // Conflicts and refused changes need you; server or network errors are retried.
      if (response.status === 409 || response.status === 400) { setStatus({ state: 'paused', message }); return { ok: false, reason: 'conflict', message }; }
      setStatus({ state: 'error', message: `${message} Retrying shortly.` });
      return { ok: false, reason: 'error', message };
    }
    const structural = Boolean(plan.order) || plan.lockCount !== undefined;
    // The server keeps a chapter-wide lock that reaches past the loaded questions; show what it kept.
    const savedLockCount = data.data.lockCount === undefined ? lockCount : Math.min(data.data.lockCount, questions.length);
    if (savedLockCount !== lockCount) onLockCorrected?.(savedLockCount, data.data.lockCount);
    const next = {
      ...databaseState,
      baseline: plan.nextBaseline,
      savedLockCount,
      loadedCount: structural ? questions.length : databaseState.loadedCount,
      totalQuestions: structural ? data.data.totalQuestions ?? databaseState.totalQuestions : databaseState.totalQuestions,
      // A save that overlapped another window's change keeps the old revision, so a later
      // add/delete/move is refused instead of overwriting what that window did.
      updatedAt: data.data.revisionMatched ? data.data.updatedAt : databaseState.updatedAt,
    };
    latest.current = { ...latest.current, databaseState: next };
    setDatabaseState(next);
    const remaining = planChapterSync({ baseline: next.baseline, lockCount: next.savedLockCount }, latest.current.questions, savedLockCount !== lockCount ? savedLockCount : latest.current.lockCount);
    if (remaining.empty) { setIsDirty(false); setStatus({ state: 'saved', at: Date.now() }); }
    else again.current = true;
    return { ok: true, data: data.data };
  }, [setDatabaseState, setIsDirty]);

  // Runs one save at a time; a call during a save queues one more pass after it.
  const sync = useCallback((options) => {
    if (running.current) { again.current = true; return running.current; }
    const run = (async () => {
      try {
        let result;
        do { again.current = false; result = await syncOnce(options); } while (again.current && result.ok);
        return result;
      } finally { running.current = null; }
    })();
    running.current = run;
    return run;
  }, [syncOnce]);

  // Saves everything now (before switching topic, or from the Save button), waiting for any running save first.
  const flush = useCallback(async (options) => {
    if (running.current) await running.current.catch(() => {});
    return sync(options);
  }, [sync]);

  const linked = Boolean(databaseState?.baseline);
  const waitingForUser = status.state === 'paused';
  useEffect(() => {
    if (!enabled || !isDirty || !linked || waitingForUser) return;
    const timer = setTimeout(() => { sync(); }, status.state === 'error' ? RETRY_DELAY : AUTOSAVE_DELAY);
    return () => clearTimeout(timer);
  }, [enabled, isDirty, linked, waitingForUser, status.state, questions, lockCount, databaseState, sync]);

  // Leaving the tab: save immediately rather than after the delay.
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden' && enabled && isDirty && linked && !waitingForUser) sync(); };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [enabled, isDirty, linked, waitingForUser, sync]);

  const resetStatus = useCallback(() => setStatus({ state: 'idle' }), []);
  return { status, flush, resetStatus };
}
