'use client';
import { useEffect, useRef, useState } from 'react';
import GateExamScreen from './GateExamScreen';
import MockLobby from './MockLobby';
import MockReview from './MockReview';
import MockLayout from './MockLayout';
import styles from './GatePractice.module.css';

const STORAGE_KEY = 'g4gate-mock-active-v1';
const hasResponse = value => Array.isArray(value) ? value.length > 0 : Boolean(value);
async function api(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers }, cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) { const error = new Error(data.error || 'Request failed.'); error.status = response.status; throw error; }
  return data;
}

export default function GateMock() {
  const [catalog, setCatalog] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true);
  const [requestedPaper, setRequestedPaper] = useState(''), [attempt, setAttempt] = useState(null), [testState, setTestState] = useState(null);
  const [seconds, setSeconds] = useState(null), [saveStatus, setSaveStatus] = useState(''), [confirmSubmit, setConfirmSubmit] = useState(false);
  const token = useRef(''), revision = useRef(0), stateRef = useRef(null), queue = useRef(Promise.resolve()), clockOffset = useRef(0), submitting = useRef(false);
  useEffect(() => { stateRef.current = testState; }, [testState]);

  function accept(value, secret, localDraft) {
    token.current = secret; revision.current = value.revision; clockOffset.current = new Date(value.serverNow).getTime() - Date.now();
    const state = !value.finishedAt && localDraft?.revision === value.revision && localDraft.state ? localDraft.state : value.state;
    stateRef.current = state; setAttempt(value); setTestState(state); setError('');
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: value.id, token: secret, revision: value.revision, state })); }
    catch { setSaveStatus('Browser resume storage unavailable; server autosave is active.'); }
  }
  useEffect(() => {
    let active = true;
    const catalogRequest = api('/api/gatemock/catalog').then(data => {
      if (active) { setCatalog(data); setRequestedPaper(new URLSearchParams(window.location.search).get('paper') || ''); }
    }).catch(error => { if (active) setError(error.message); });
    let resumeRequest;
    try {
      const draft = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (draft?.id && draft?.token) resumeRequest = api(`/api/gatemock/attempts/${draft.id}`, { headers: { Authorization: `Bearer ${draft.token}` } }).then(data => {
        if (active) accept(data.attempt, draft.token, draft);
      }).catch(error => {
        if (active) { setError(`Previous attempt could not resume: ${error.message} Refresh to retry.`); if (error.status === 404) localStorage.removeItem(STORAGE_KEY); }
      });
    } catch { /* No valid browser draft. */ }
    Promise.allSettled([catalogRequest, resumeRequest]).then(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!attempt || attempt.finishedAt) return;
    const update = () => setSeconds(Math.max(0, Math.ceil((new Date(attempt.expiresAt).getTime() - Date.now() - clockOffset.current) / 1000)));
    update(); const interval = setInterval(update, 1000); return () => clearInterval(interval);
  }, [attempt]);

  function save(state, finish = false) {
    if (!attempt) return Promise.resolve();
    const id = attempt.id, secret = token.current;
    queue.current = queue.current.catch(() => {}).then(async () => {
      setSaveStatus(finish ? 'Submitting…' : 'Saving…');
      const data = await api(`/api/gatemock/attempts/${id}`, { method: finish ? 'POST' : 'PUT', headers: { Authorization: `Bearer ${secret}` }, body: JSON.stringify({ revision: revision.current, state }) });
      revision.current = data.attempt.revision;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, token: secret, revision: revision.current, state: stateRef.current })); } catch { /* Server save still succeeded. */ }
      setSaveStatus('Saved');
      if (data.attempt.finishedAt) { setAttempt(data.attempt); setTestState(data.attempt.state); }
      return data;
    });
    return queue.current;
  }
  useEffect(() => {
    if (!attempt || attempt.finishedAt || !testState) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: attempt.id, token: token.current, revision: revision.current, state: testState })); } catch { /* Server autosave remains available. */ }
    const timeout = setTimeout(() => { save(testState).catch(error => setSaveStatus(`Not saved: ${error.message}`)); }, 800);
    return () => clearTimeout(timeout);
    // State is snapshotted into the serial save queue; the attempt revision lives in a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testState, attempt?.id, attempt?.finishedAt]);
  async function submit() {
    if (submitting.current) return;
    submitting.current = true; setBusy(true); setConfirmSubmit(false); setError('');
    try { await save(stateRef.current, true); }
    catch (error) { setError(`Submission failed: ${error.message} Your last server save is retained. Retry submission.`); }
    finally { submitting.current = false; setBusy(false); }
  }
  useEffect(() => {
    if (seconds !== 0 || !attempt || attempt.finishedAt) return;
    const timeout = setTimeout(submit, 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, attempt?.finishedAt]);

  async function start(config) {
    setBusy(true); setError('');
    try {
      const data = await api('/api/gatemock/attempts', { method: 'POST', body: JSON.stringify(config) });
      accept(data.attempt, data.token); setSeconds(null); setSaveStatus('');
    } catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  function move(index) {
    const key = attempt.questions[index].key;
    setTestState(state => ({ ...state, currentIndex: index, visited: [...new Set([...state.visited, key])] }));
  }
  function respond(value) {
    const key = attempt.questions[testState.currentIndex].key;
    setTestState(state => ({ ...state, responses: [...state.responses.filter(response => response.key !== key), ...(hasResponse(value) ? [{ key, value }] : [])] }));
  }
  async function assess(key, marks) {
    setBusy(true); setError('');
    try {
      const data = await api(`/api/gatemock/attempts/${attempt.id}/assessment`, { method: 'POST', headers: { Authorization: `Bearer ${token.current}` }, body: JSON.stringify({ revision: revision.current, key, marks }) });
      revision.current = data.attempt.revision; setAttempt(data.attempt);
    } catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  function newTest() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* The current view can still be reset. */ }
    setAttempt(null); setTestState(null); setSeconds(null); setError(''); setSaveStatus(''); setConfirmSubmit(false);
    window.scrollTo({ top: 0 });
  }
  if (attempt?.finishedAt && attempt.result) return <MockReview attempt={attempt} busy={busy} error={error} onAssess={assess} onNewTest={newTest} />;
  if (attempt && testState) return <GateExamScreen attempt={attempt} state={testState} seconds={seconds} busy={busy} error={error} saveStatus={saveStatus}
    confirmSubmit={confirmSubmit} onRespond={respond} onMove={move} onSubmit={() => setConfirmSubmit(true)} onCancelSubmit={() => setConfirmSubmit(false)} onConfirmSubmit={submit}
    onCommitNext={(marked, nextIndex) => {
      const key = attempt.questions[testState.currentIndex].key;
      const nextState = { ...testState, currentIndex: nextIndex, visited: [...new Set([...testState.visited, attempt.questions[nextIndex].key])],
        marked: marked ? [...new Set([...testState.marked, key])] : testState.marked.filter(value => value !== key) };
      setTestState(nextState); stateRef.current = nextState;
      save(nextState).catch(error => setSaveStatus(`Not saved: ${error.message}`));
    }} />;
  if (loading || !catalog) return <MockLayout><section className={styles.empty} aria-busy={loading}><h1>{loading ? 'Loading your test centre…' : 'Could not load papers'}</h1><p>{loading ? 'Checking available papers and saved progress.' : 'Refresh to try again.'}</p>{error && <p className={styles.error} role="alert">{error}</p>}{!loading && <button onClick={() => window.location.reload()}>Retry loading papers</button>}</section></MockLayout>;
  return <MockLobby catalog={catalog} requestedPaper={requestedPaper} busy={busy} error={error} onStart={start} />;
}
