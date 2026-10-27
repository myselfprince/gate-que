'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PdfPreview from './PdfPreview';
import PdfLivePreview from './PdfLivePreview';
import { selectPdfQuestions } from '@/lib/pdf-selection.mjs';
import styles from './PdfExportPanel.module.css';

const active = job => job && ['queued', 'running'].includes(job.status);
export default function PdfExportPanel({ payload, settingsValid = true, active: panelActive = true, settingsControls }) {
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const removedIds = useRef(new Set());
  const [snapshot, setSnapshot] = useState('');
  const [scope, setScope] = useState('all');
  const [year, setYear] = useState('');
  const [range, setRange] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [includeBlanks, setIncludeBlanks] = useState(true);
  const [sourceMode, setSourceMode] = useState('editable');
  const [bookIds, setBookIds] = useState([]);
  const [bookTitle, setBookTitle] = useState('Subject book');
  let selection = [], selectionError = '';
  try { selection = selectPdfQuestions(payload.questions, { scope, year, range, selectedIds, includeBlanks, sourceMode }); }
  catch (error) { selectionError = error.message; }
  const exportPayload = { ...payload, questions: selection };
  const signature = JSON.stringify({ ...payload, scope, year, range, selectedIds, includeBlanks, sourceMode });
  const refresh = useCallback(async () => {
    const response = await fetch('/api/pdf-jobs', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Export history could not be loaded.');
    setJobs(data.jobs.filter(job => !removedIds.current.has(job.id)));
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => { refresh().catch(error => setError(error.message)); }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);
  const running = jobs.some(active);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => { refresh().catch(error => setError(error.message)); }, 1500);
    return () => clearInterval(timer);
  }, [running, refresh]);
  const job = jobs.find(job => job.id === selected) || jobs[0];
  const bookCandidates = jobs.filter(job => job.status === 'completed' && job.kind !== 'book' && job.subject === payload.subject);
  async function start(candidate = exportPayload) {
    if (!settingsValid) return setError('Fix the invalid PDF design settings before exporting.');
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/pdf-jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(candidate) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Export could not be started.');
      setSelected(data.job.id); setSnapshot(signature);
      setJobs(previous => [data.job, ...previous.filter(job => job.id !== data.job.id)]);
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  async function sourceZip() {
    if (!settingsValid) return setError('Fix the invalid PDF design settings before exporting.');
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/export-latex', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(exportPayload) });
      if (!response.ok) throw new Error((await response.json()).error);
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a'); link.href = url; link.download = `${payload.subject}_${payload.chapter}_LaTeX.zip`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  async function action(kind) {
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/pdf-jobs/${job.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: kind }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await refresh();
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  async function buildBook() {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/pdf-jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'book', title: bookTitle, exportIds: bookIds }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSelected(data.job.id); setSnapshot(''); setJobs(previous => [data.job, ...previous]);
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  async function removeGenerated(downloadFirst = false) {
    if (!job || active(job)) return;
    const id = job.id;
    setBusy(true); setError(''); setNotice('');
    let downloadStarted = false;
    try {
      if (downloadFirst) {
        const response = await fetch(`/api/pdf-jobs/${id}/download`);
        if (!response.ok) throw Error((await response.json()).error || 'The PDF could not be downloaded.');
        const url = URL.createObjectURL(await response.blob());
        const link = document.createElement('a'); link.href = url; link.download = `G4Gate-${job.total}-questions.pdf`; link.click();
        downloadStarted = true; setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      const response = await fetch(`/api/pdf-jobs/${id}`, { method: 'DELETE' });
      if (!response.ok && response.status !== 404) throw Error((await response.json()).error || 'The saved export could not be deleted.');
      removedIds.current.add(id);
      setJobs(previous => previous.filter(item => item.id !== id));
      setSelected(previous => previous === id ? '' : previous); setBookIds(previous => previous.filter(item => item !== id)); setSnapshot('');
      setNotice(downloadFirst ? 'PDF download started. The saved export and its generated files were removed.' : 'Saved export and generated files deleted.');
    } catch (error) { setError(`${downloadStarted ? 'PDF download started, but the saved export could not be removed. ' : ''}${error.message}`); }
    finally { setBusy(false); }
  }
  return <>
  <div className={settingsControls ? styles.designer : undefined}>
    {settingsControls && <div className={styles.controls}>{settingsControls}</div>}
    <PdfLivePreview payload={payload} sourceMode={sourceMode} settingsValid={settingsValid} active={panelActive} />
  </div>
  <section aria-label="PDF exports" style={{ padding: 18, margin: '16px 0', border: '1px solid #cba6f7', borderRadius: 10, background: '#181825' }}>
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'end', marginBottom: 14 }}>
      <label>Export questions<select aria-label="Export question selection" value={scope} onChange={e => setScope(e.target.value)}><option value="all">All questions</option><option value="year">By year</option><option value="range">Question ranges</option><option value="selected">Choose questions</option></select></label>
      {scope === 'year' && <label>Year<select aria-label="Export year" value={year} onChange={e => setYear(e.target.value)}><option value="">Choose year</option>{[...new Set(payload.questions.map(q => q.year).filter(Boolean))].sort().map(year => <option key={year} value={year}>{year}</option>)}</select></label>}
      {scope === 'range' && <label>Ranges<input aria-label="Export ranges" value={range} onChange={e => setRange(e.target.value)} placeholder="1-20, 25, 40-50" /></label>}
      <label><input type="checkbox" checked={includeBlanks} onChange={e => setIncludeBlanks(e.target.checked)} /> Include blank placeholders</label>
      {payload.questions.some(q => q.source?.verifiedQuestion) && <label>Question version<select aria-label="Export question version" value={sourceMode} onChange={e => setSourceMode(e.target.value)}><option value="editable">Current editable questions</option><option value="verified">Reviewed source version where available</option></select></label>}
    </div>
    {sourceMode === 'verified' && <p style={{ color: '#f9e2af', fontSize: 13 }}>Reviewed source text is used where available; other questions use current edits. This choice does not change your database.</p>}
    {scope === 'selected' && <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #45475a', padding: 10, marginBottom: 12 }}>{payload.questions.map((question, index) => <label key={question.id} style={{ display: 'block', margin: '5px 0' }}><input type="checkbox" checked={selectedIds.includes(question.id)} onChange={e => setSelectedIds(ids => e.target.checked ? [...ids, question.id] : ids.filter(id => id !== question.id))} /> Q{index + 1} · {question.year} · {question.isBlank ? 'Blank placeholder' : question.text?.slice(0, 100)}</label>)}</div>}
    {selectionError && <p role="alert" style={{ color: '#f38ba8' }}>{selectionError}</p>}
    <p style={{ color: '#bac2de', fontSize: 13 }}>Selected: {selection.length} / {payload.questions.length}. Printed question numbers are preserved. Editor view filters do not change this export selection.</p>
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <button type="button" disabled={busy || !selection.length || Boolean(selectionError) || !settingsValid} onClick={() => start()} style={{ background: '#cba6f7', color: '#11111b', fontWeight: 'bold', padding: '10px 18px' }}>{busy ? 'Please wait...' : `Build PDF · ${selection.length} questions`}</button>
      <button type="button" disabled={busy || !selection.length || Boolean(selectionError) || !settingsValid} onClick={sourceZip}>Editable LaTeX ZIP</button>
      <span style={{ color: '#bac2de', fontSize: 13 }}>Your export continues in the background. Refreshing this page keeps its progress.</span>
      <button type="button" disabled={busy} onClick={() => refresh().catch(error => setError(error.message))}>Refresh history</button>
    </div>
    <details style={{ marginTop: 16 }}>
      <summary style={{ cursor: 'pointer', color: '#89b4fa' }}>Combine saved exports into a subject book</summary>
      <p style={{ color: '#bac2de', fontSize: 13 }}>Choose completed exports from {payload.subject}. Pages keep their layouts, links and chapter numbering. Order the exports below; chapter answer keys remain separate downloads.</p>
      <label>Book title<input aria-label="PDF book title" maxLength={120} value={bookTitle} onChange={e => setBookTitle(e.target.value)} /></label>
      <div style={{ maxHeight: 160, overflowY: 'auto' }}>{bookCandidates.map(item => <label key={item.id} style={{ display: 'block', margin: '6px 0' }}><input type="checkbox" checked={bookIds.includes(item.id)} onChange={e => setBookIds(ids => e.target.checked ? [...ids, item.id] : ids.filter(id => id !== item.id))} /> {item.chapter} · {item.total} pages · {new Date(item.createdAt).toLocaleString()}</label>)}</div>
      {bookIds.map((id, index) => <div key={id} style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0' }}><span>{index + 1}. {jobs.find(item => item.id === id)?.chapter || 'Saved export'}</span><button type="button" disabled={index === 0} aria-label={`Move book chapter ${index + 1} up`} onClick={() => setBookIds(ids => { const next = [...ids]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; })}>↑</button><button type="button" disabled={index === bookIds.length - 1} aria-label={`Move book chapter ${index + 1} down`} onClick={() => setBookIds(ids => { const next = [...ids]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; return next; })}>↓</button></div>)}
      <button type="button" disabled={busy || bookIds.length < 2 || !bookTitle.trim()} onClick={buildBook}>Build subject book · {bookIds.length} exports</button>
    </details>
    {error && <p role="alert" style={{ color: '#f38ba8' }}>{error}</p>}
    {notice && <p role="status" className={styles.notice}>{notice}</p>}
    {jobs.length === 0 && <p className={styles.deleteHint}>No saved PDF exports. Build a PDF when your design is ready.</p>}
    {jobs.length > 0 && <label>Export history<select aria-label="Export history" disabled={busy} value={job?.id || ''} onChange={e => { setSelected(e.target.value); setSnapshot(''); setNotice(''); }}>{jobs.map(item => <option key={item.id} value={item.id}>{item.subject} / {item.chapter} · {item.total} questions · {item.status} · {new Date(item.createdAt).toLocaleString()}</option>)}</select></label>}
    {job && <div>
      <p role="status">{job.status === 'queued' ? 'Waiting for the active export to finish' : job.status === 'running' ? job.phase === 'combining' ? `Combining saved PDFs: ${job.completed} / ${job.total}` : job.phase === 'answers' ? 'Building separate answer key...' : job.phase === 'images' ? 'Rendering matching page images...' : job.phase === 'checking' ? 'Checking PDF pages and links...' : `Compiling: ${job.completed} / ${job.total}` : job.status === 'completed' ? `${job.total} pages ready · page count and links verified` : job.error || job.status}{job.cancelRequested && active(job) ? ' · Cancelling...' : ''}</p>
      {active(job) && <><progress aria-label="PDF export progress" max={job.total} value={job.completed} style={{ width: 'min(100%,600px)' }} /><button type="button" disabled={busy || job.cancelRequested} onClick={() => action('cancel')}>Cancel export</button></>}
      {['failed', 'cancelled'].includes(job.status) && <button type="button" disabled={busy} onClick={() => action('retry')}>Retry saved snapshot</button>}
      <div className={styles.savedActions}>
        <button type="button" className={styles.danger} disabled={busy || active(job)} onClick={() => removeGenerated(false)}>Delete generated PDF</button>
        {job.status === 'completed' && <button type="button" className={styles.secondary} disabled={busy} onClick={() => removeGenerated(true)}>Download & remove saved PDF</button>}
      </div>
      <p className={styles.deleteHint}>{active(job) ? 'Cancel the export and wait for it to stop before deleting it.' : 'Delete removes this saved PDF, ZIPs, report and export-history entry. Files already downloaded remain on your computer.'}</p>
      {job.status === 'completed' && <div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 12 }}>
          <a href={`/api/pdf-jobs/${job.id}/download`} style={{ color: '#a6e3a1' }}>Download complete PDF</a>
          <a href={`/api/pdf-jobs/${job.id}/download?kind=zip`} style={{ color: '#89b4fa' }}>{job.kind === 'book' ? 'Chapter PDFs ZIP' : '20-question parts ZIP'}</a>
          <a href={`/api/pdf-jobs/${job.id}/download?kind=report`} style={{ color: '#89b4fa' }}>QA report</a>
          {job.report?.imagesAvailable && <a href={`/api/pdf-jobs/${job.id}/download?kind=images`} style={{ color: '#89b4fa' }}>Matching page images ZIP</a>}
          {job.report?.answerKeyPages && <a href={`/api/pdf-jobs/${job.id}/download?kind=answers`} style={{ color: '#89b4fa' }}>Separate answer-key PDF</a>}
          <a href={`/api/pdf-jobs/${job.id}/download?inline=1`} target="_blank" rel="noopener noreferrer" style={{ color: '#89b4fa' }}>Open PDF preview ↗</a>
        </div>
        <p style={{ fontSize: 13, color: '#bac2de' }}>{job.report?.textBoundsChecked ? job.kind === 'book' ? 'Source chapter text bounds checked; pages copied without reflow.' : 'Text bounds checked.' : 'Text bounds were not checked.'} Content still needs source review.{snapshot && snapshot !== signature ? ' Your draft or PDF settings changed. Build a new PDF to include them.' : ' Downloads contain the saved export snapshot.'}</p>
        {Boolean(job.report?.warnings?.length) && <details><summary style={{ color: '#f9e2af' }}>{job.report.warnings.length} layout/readability warnings</summary><ul>{job.report.warnings.map((warning, index) => <li key={index}>{warning.message}</li>)}</ul></details>}
        <PdfPreview key={job.id + '-' + job.attempt} url={`/api/pdf-jobs/${job.id}/download?inline=1`} openLinksInNewTab={job.report?.openLinksInNewTab !== false} />
      </div>}
    </div>}
  </section>
  </>;
}
