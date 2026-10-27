'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { DEFAULT_MOCK_BLUEPRINT, PAPER_PATTERN_SOURCE } from '@/lib/gatemock.mjs';
import { safeSolutionUrl } from '@/lib/solution-links.mjs';
import MockQuestion, { MockOption } from './MockQuestion';
import GateExamScreen from './GateExamScreen';
import styles from './mock.module.css';

const STORAGE_KEY = 'g4gate-mock-active-v1';
const hasResponse = value => Array.isArray(value) ? value.length > 0 : Boolean(value);
async function api(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers }, cache: 'no-store' });
  const data = await response.json(); if (!response.ok) { const error = new Error(data.error || 'Request failed.'); error.status = response.status; throw error; } return data;
}

export default function GateMock() {
  const [catalog, setCatalog] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [mode, setMode] = useState('subject'), [examPaper, setExamPaper] = useState('CS'), [subject, setSubject] = useState(''), [chapter, setChapter] = useState('');
  const [count, setCount] = useState(20), [duration, setDuration] = useState(30), [paperId, setPaperId] = useState(''), [allowPartial, setAllowPartial] = useState(false);
  const [blueprint, setBlueprint] = useState(DEFAULT_MOCK_BLUEPRINT), [attempt, setAttempt] = useState(null), [testState, setTestState] = useState(null);
  const [seconds, setSeconds] = useState(null), [saveStatus, setSaveStatus] = useState(''), [confirmSubmit, setConfirmSubmit] = useState(false);
  const token = useRef(''), revision = useRef(0), stateRef = useRef(null), queue = useRef(Promise.resolve()), clockOffset = useRef(0), submitting = useRef(false);
  useEffect(() => { stateRef.current = testState; }, [testState]);

  function accept(value, secret, localDraft) {
    token.current = secret; revision.current = value.revision; clockOffset.current = new Date(value.serverNow).getTime() - Date.now();
    const state = !value.finishedAt && localDraft?.revision === value.revision && localDraft.state ? localDraft.state : value.state;
    setAttempt(value); setTestState(state); setError('');
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: value.id, token: secret, revision: value.revision, state })); } catch { setSaveStatus('Browser resume storage unavailable; server autosave is active.'); }
  }
  useEffect(() => {
    let active = true;
    api('/api/gatemock/catalog').then(data => { if (active) { setCatalog(data); setSubject(data.subjects[0]?.subject || ''); } }).catch(error => { if (active) setError(error.message); });
    try {
      const draft = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (draft?.id && draft?.token) api(`/api/gatemock/attempts/${draft.id}`, { headers: { Authorization: `Bearer ${draft.token}` } }).then(data => { if (active) accept(data.attempt, draft.token, draft); }).catch(error => { if (active) { setError(`Previous attempt could not resume: ${error.message} Refresh to retry.`); if (error.status === 404) localStorage.removeItem(STORAGE_KEY); } });
    } catch { /* No valid browser draft. */ }
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

  async function start() {
    setBusy(true); setError('');
    const yearPaper = catalog.years.find(p => p.id === paperId);
    try {
      const data = await api('/api/gatemock/attempts', { method: 'POST', body: JSON.stringify({ mode, examPaper, subject, chapter, count, durationMinutes: mode === 'full' ? 180 : duration, blueprint,
        year: yearPaper?.year, setNum: yearPaper?.setNum || '', allowPartial }) });
      accept(data.attempt, data.token); setSeconds(null);
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
  const header = <header className={styles.header}><Link href="/gatemock" className={styles.logo}>G4Gate <span>Mock lab</span></Link><nav><Link href="/">Question editor</Link><Link href="/gatemock/admin">Paper coverage admin</Link></nav></header>;
  const alert = error && <p className={styles.error} role="alert">{error}</p>;
  if (attempt?.finishedAt && attempt.result) {
    const result = attempt.result;
    return <main className={styles.page}>{header}<section className={styles.hero}><p className={styles.eyebrow}>ATTEMPT COMPLETE</p><h1>Your review starts here.</h1><p>{attempt.title}</p></section>{alert}
      <div className={styles.stats}><div><strong>{result.score.toFixed(2)} / {result.gradableMarks}</strong><span>Score on gradable questions</span></div><div><strong>{result.correct}</strong><span>Correct</span></div><div><strong>{result.wrong}</strong><span>Wrong</span></div><div><strong>{result.unanswered}</strong><span>Unanswered</span></div><div><strong>{result.ungraded}</strong><span>Key unavailable / manual review</span></div></div>
      <p>Paper total: {result.totalMarks} marks. Unavailable keys and nonnumeric reference answers are excluded from automatic scoring.</p>
      <button onClick={() => { localStorage.removeItem(STORAGE_KEY); setAttempt(null); setTestState(null); setSeconds(null); }}>Build another test</button>
      <div className={styles.reviewList}>{result.entries.map(entry => <details key={entry.question.key} className={styles.panel}><summary>Q{entry.question.number} · {entry.status} · {entry.earned.toFixed(2)} marks · {entry.question.subject}</summary>
        <div className={styles.questionCard}><MockQuestion question={entry.question}>
          {['A', 'B', 'C', 'D'].filter(letter => entry.question[`opt${letter}`]).map(letter => <p key={letter}>({letter}) <MockOption question={entry.question} text={entry.question[`opt${letter}`]} /></p>)}
        </MockQuestion></div><p>Your response: {Array.isArray(entry.response) ? entry.response.join(', ') || 'Not answered' : entry.response || 'Not answered'}</p><p>Correct answer: {entry.answer || 'Not available'}</p>
        {safeSolutionUrl(entry.solutionUrl) && <a href={safeSolutionUrl(entry.solutionUrl)} target="_blank" rel="noreferrer">Watch video solution ↗</a>}
      </details>)}</div>
    </main>;
  }
  if (attempt && testState) {
    return <GateExamScreen attempt={attempt} state={testState} seconds={seconds} busy={busy} error={error} saveStatus={saveStatus}
      confirmSubmit={confirmSubmit} onRespond={respond} onMove={move} onSubmit={() => setConfirmSubmit(true)} onCancelSubmit={() => setConfirmSubmit(false)} onConfirmSubmit={submit}
      onCommitNext={(marked, nextIndex) => {
        const key = attempt.questions[testState.currentIndex].key;
        const nextState = { ...testState, currentIndex: nextIndex, visited: [...new Set([...testState.visited, attempt.questions[nextIndex].key])],
          marked: marked ? [...new Set([...testState.marked, key])] : testState.marked.filter(value => value !== key) };
        setTestState(nextState);
        save(nextState).catch(error => setSaveStatus(`Not saved: ${error.message}`));
      }} />;
  }
  const topics = catalog?.subjects.find(value => value.subject === subject)?.topics || [];
  const yearPapers = catalog?.years.filter(paper => paper.examPaper === examPaper) || [];
  const chosenPaper = yearPapers.find(paper => paper.id === paperId);
  const one = blueprint.reduce((n, row) => n + (row.one || 0), 0), two = blueprint.reduce((n, row) => n + (row.two || 0), 0);
  return <main className={styles.page}>{header}<section className={styles.hero}><p className={styles.eyebrow}>YOUR QUESTION BANK. YOUR NEXT ATTEMPT.</p><h1>Practice with a plan.<br /><span>Test under pressure.</span></h1><p>Build a focused test, mix subjects, or work through a year’s paper in a timed computer exam.</p></section>{alert}
    <div className={styles.builderLayout}><section className={styles.panel}><div className={styles.modeTabs}>{[['subject', 'Subject test'], ['topic', 'Topic test'], ['full', 'Weighted mock'], ['year', 'Year paper']].map(([value, label]) => <button key={value} aria-pressed={mode === value} className={mode === value ? styles.primary : ''} onClick={() => { setMode(value); setAllowPartial(false); }}>{label}</button>)}</div>
      <label>Exam paper<select value={examPaper} onChange={e => { setExamPaper(e.target.value); setPaperId(''); }}><option value="CS">GATE CS</option><option value="IT">GATE IT (historical papers)</option></select></label>
      {(mode === 'subject' || mode === 'topic') && <><label>Subject<select value={subject} onChange={e => { setSubject(e.target.value); setChapter(''); }}>{catalog?.subjects.map(value => <option key={value.subject} value={value.subject}>{value.subject} · {value.count} in bank</option>)}</select></label>
        {mode === 'topic' && <label>Topic / chapter<select value={chapter} onChange={e => setChapter(e.target.value)}><option value="">Choose a topic</option>{topics.map(topic => <option key={topic}>{topic}</option>)}</select></label>}
        <div className={styles.formRow}><label>Questions<input type="number" min="1" max="250" value={count} onChange={e => setCount(Number(e.target.value))} /></label><label>Duration (minutes)<input type="number" min="1" max="360" value={duration} onChange={e => setDuration(Number(e.target.value))} /></label></div>
      </>}
      {mode === 'full' && <><p>Editable practice weightage. Default: 65 questions, 100 marks, 180 minutes. Official GATE does not fix every subject’s yearly weightage.</p><div className={styles.tableScroll}><table><thead><tr><th>Subject</th><th>1-mark questions</th><th>2-mark questions</th></tr></thead><tbody>{blueprint.map((row, index) => <tr key={row.subject}><td>{row.subject}</td>{['one', 'two'].map(key => <td key={key}><input aria-label={`${row.subject} ${key}-mark quota`} type="number" min="0" max="100" value={row[key]} onChange={event => setBlueprint(values => values.map((item, i) => index === i ? { ...item, [key]: Number(event.target.value) } : item))} /></td>)}</tr>)}</tbody></table></div><p><strong>{one + two} questions · {one + 2 * two} marks · 180 minutes</strong></p></>}
      {mode === 'year' && <><label>Year / set<select value={paperId} onChange={e => setPaperId(e.target.value)}><option value="">Choose a paper</option>{yearPapers.map(paper => <option key={paper.id} value={paper.id}>{paper.year}{paper.setNum ? ` · Set ${paper.setNum}` : ''} · {paper.available} available · {paper.coverage?.ready ? 'Verified complete' : 'Incomplete / unverified'}</option>)}</select></label>
        {chosenPaper && <div className={styles.warning}>{chosenPaper.coverage ? <><strong>{chosenPaper.coverage.mapped} / {chosenPaper.coverage.expected} original positions mapped.</strong><p>Missing: {chosenPaper.coverage.missing.join(', ') || 'None'} · Duplicate positions: {chosenPaper.coverage.duplicates.map(item => item.number).join(', ') || 'None'} · Unassigned: {chosenPaper.coverage.unassigned.length}.</p><p>{chosenPaper.paper.verified ? 'Order reviewed by admin.' : 'Official paper review pending.'} {chosenPaper.coverage.marks} / {chosenPaper.coverage.expectedMarks} marks.</p></> : <p>Official question count and original numbering have not been configured. Available questions can be used for practice.</p>}</div>}
      </>}
      <label className={styles.check}><input type="checkbox" checked={allowPartial} onChange={e => setAllowPartial(e.target.checked)} />{mode === 'year' ? 'Use available questions as practice if the original paper is incomplete' : 'Allow a smaller practice test if the bank has shortages'}</label>
      <button className={styles.primary} disabled={busy || !catalog || (mode === 'year' && !paperId) || (mode === 'topic' && !chapter)} onClick={start}>{busy ? 'Preparing test…' : 'Start timed test →'}</button>
    </section><aside className={styles.panel}><p className={styles.eyebrow}>BEFORE YOU BEGIN</p><h2>Space to think.<br />A clock to respect.</h2><p>MCQ: one answer. MSQ: all correct answers, no partial credit. NAT: a numerical answer.</p><p>Default practice penalty: ⅓ of the question’s marks for a wrong MCQ; none for MSQ or NAT. Verified historical papers use their admin-configured MCQ penalty.</p><p>Progress saves automatically. Refresh to resume in this browser. Attempts are kept for 30 days.</p><p>Only stored answers are used for grading. Missing keys remain ungraded.</p><a href={PAPER_PATTERN_SOURCE} target="_blank" rel="noreferrer">Official current GATE pattern ↗</a><hr /><p>{catalog ? `${catalog.count} questions in the editor bank` : 'Loading question bank…'}</p></aside></div>
    <section className={styles.yearSection}><h2>Explore by year</h2><p>CS and historical IT papers stay separate. A complete paper also needs its original question order.</p><div className={styles.yearGrid}>{yearPapers.map(paper => <button key={paper.id} className={styles.yearTile} onClick={() => { setMode('year'); setPaperId(paper.id); setAllowPartial(!paper.coverage?.ready); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><strong>{paper.year}{paper.examPaper === 'IT' ? ' · IT' : ''}{paper.setNum ? ` · ${paper.setNum}` : ''}</strong><span>{paper.available} available</span><small>{paper.coverage?.ready ? 'Verified complete' : paper.coverage ? `${paper.coverage.mapped}/${paper.coverage.expected} mapped` : 'Coverage not configured'}</small></button>)}</div></section>
  </main>;
}
