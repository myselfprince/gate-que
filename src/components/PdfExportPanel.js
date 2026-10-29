'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PdfPreview from './PdfPreview';
import PdfLivePreview from './PdfLivePreview';
import PdfStorageCleanup from './PdfStorageCleanup';
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
  const historyRequest = useRef(0);
  const [snapshot, setSnapshot] = useState('');
  const [scope, setScope] = useState('all');
  const [year, setYear] = useState('');
  const [range, setRange] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [includeBlanks, setIncludeBlanks] = useState(true);
  const [sourceMode, setSourceMode] = useState('editable');
  const [bookIds, setBookIds] = useState([]);
  const [bookTitle, setBookTitle] = useState('Subject book');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedPreviewOpen, setSavedPreviewOpen] = useState(false);
  const historyRef = useRef(null);
  let selection = [], selectionError = '';
  try { selection = selectPdfQuestions(payload.questions, { scope, year, range, selectedIds, includeBlanks, sourceMode }); }
  catch (error) { selectionError = error.message; }
  const exportPayload = { ...payload, questions: selection };
  const signature = JSON.stringify({ ...payload, scope, year, range, selectedIds, includeBlanks, sourceMode });
  const refresh = useCallback(async () => {
    const request = ++historyRequest.current;
    const response = await fetch('/api/pdf-jobs', { cache: 'no-store' });
    const data = await response.json();
    if (request !== historyRequest.current) return;
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
      setHistoryOpen(true); setSavedPreviewOpen(false);
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
      setHistoryOpen(true); setSavedPreviewOpen(false);
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
  function viewHistory() {
    setHistoryOpen(true);
    requestAnimationFrame(() => historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
  async function storageCleaned(result) {
    const deleted = new Set(result.deletedIds);
    for (const id of deleted) removedIds.current.add(id);
    if (deleted.size) {
      setJobs(previous => previous.filter(item => !deleted.has(item.id)));
      setBookIds(previous => previous.filter(id => !deleted.has(id)));
      setSelected(previous => deleted.has(previous) ? '' : previous);
      setSavedPreviewOpen(false); setSnapshot('');
    }
    await refresh();
  }
  return <>
  <section className={styles.exportBar} aria-label="PDF exports">
    <div><h3>Your PDF</h3><p>{selection.length} of {payload.questions.length} questions · {payload.pdfSettings?.theme === 'light' ? 'White' : 'Black'} pages · {payload.pdfSettings?.fontSize || 18}pt</p></div>
    <div className={styles.exportActions}>
      <button type="button" className={styles.primary} disabled={busy || !selection.length || Boolean(selectionError) || !settingsValid} onClick={() => start()}>{busy ? 'Please wait...' : `Build PDF · ${selection.length} questions`}</button>
      <button type="button" className={styles.secondary} disabled={busy || !selection.length || Boolean(selectionError) || !settingsValid} onClick={sourceZip}>LaTeX ZIP</button>
    </div>
    {!settingsValid && <p className={styles.error} role="alert">Fix the highlighted design settings to export.</p>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {notice && <p role="status" className={styles.notice}>{notice}</p>}
    {active(job) && <div className={styles.exportProgress}><span role="status">{job.status === 'queued' ? 'PDF queued' : `Building PDF: ${job.completed} / ${job.total}`}</span><progress aria-label="Current PDF export progress" max={job.total} value={job.completed} /><button type="button" className={styles.textButton} onClick={viewHistory}>View export</button></div>}
  </section>
  <div className={styles.designer}>
    <div className={styles.controls}>
      <section className={styles.selectionPanel} aria-label="Questions to export">
        <div className={styles.selectionHeading}><h3>Choose questions</h3><span>{selection.length} selected</span></div>
        <div className={styles.selectionGrid}>
      <label>Export questions<select aria-label="Export question selection" value={scope} onChange={e => setScope(e.target.value)}><option value="all">All questions</option><option value="year">By year</option><option value="range">Question ranges</option><option value="selected">Choose questions</option></select></label>
      {scope === 'year' && <label>Year<select aria-label="Export year" value={year} onChange={e => setYear(e.target.value)}><option value="">Choose year</option>{[...new Set(payload.questions.map(q => q.year).filter(Boolean))].sort().map(year => <option key={year} value={year}>{year}</option>)}</select></label>}
      {scope === 'range' && <label>Ranges<input aria-label="Export ranges" value={range} onChange={e => setRange(e.target.value)} placeholder="1-20, 25, 40-50" /></label>}
        </div>
        <details className={styles.selectionOptions}><summary>Selection options</summary>
      <label className={styles.check}><input type="checkbox" checked={includeBlanks} onChange={e => setIncludeBlanks(e.target.checked)} /> Include blank placeholders</label>
      {payload.questions.some(q => q.source?.verifiedQuestion) && <label>Question version<select aria-label="Export question version" value={sourceMode} onChange={e => setSourceMode(e.target.value)}><option value="editable">Current editable questions</option><option value="verified">Reviewed source version where available</option></select></label>}
        </details>
    {sourceMode === 'verified' && <p style={{ color: '#f9e2af', fontSize: 13 }}>Reviewed source text is used where available; other questions use current edits. This choice does not change your database.</p>}
    {scope === 'selected' && <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #45475a', padding: 10, marginBottom: 12 }}>{payload.questions.map((question, index) => <label key={question.id} style={{ display: 'block', margin: '5px 0' }}><input type="checkbox" checked={selectedIds.includes(question.id)} onChange={e => setSelectedIds(ids => e.target.checked ? [...ids, question.id] : ids.filter(id => id !== question.id))} /> Q{index + 1} · {question.year} · {question.isBlank ? 'Blank placeholder' : question.text?.slice(0, 100)}</label>)}</div>}
    {selectionError && <p role="alert" style={{ color: '#f38ba8' }}>{selectionError}</p>}
        <p className={styles.selectionHint}>Numbered 1, 2, 3… in the exported PDF.</p>
      </section>
      {settingsControls}
    </div>
    <PdfLivePreview payload={exportPayload} sourceMode={sourceMode} settingsValid={settingsValid} active={panelActive} />
  </div>
  <details className={styles.history} ref={historyRef} open={historyOpen} onToggle={event => setHistoryOpen(event.currentTarget.open)}>
    <summary><span><strong>Saved exports</strong><small>Download previous PDFs or combine them into a book</small></span><span className={styles.historyCount}>{jobs.length}</span></summary>
    <div className={styles.historyBody}>
    <button type="button" className={styles.secondary} disabled={busy} onClick={() => refresh().catch(error => setError(error.message))}>Refresh history</button>
    <PdfStorageCleanup disabled={busy} onBusyChange={setBusy} onCleaned={storageCleaned} />
    <details style={{ marginTop: 16 }}>
      <summary style={{ cursor: 'pointer', color: '#89b4fa' }}>Combine saved exports into a subject book</summary>
      <p style={{ color: '#bac2de', fontSize: 13 }}>Choose completed exports from {payload.subject}. Pages keep their layouts, links and chapter numbering. Order the exports below; chapter answer keys remain separate downloads.</p>
      <label>Book title<input aria-label="PDF book title" maxLength={120} value={bookTitle} onChange={e => setBookTitle(e.target.value)} /></label>
      <div style={{ maxHeight: 160, overflowY: 'auto' }}>{bookCandidates.map(item => <label key={item.id} style={{ display: 'block', margin: '6px 0' }}><input type="checkbox" checked={bookIds.includes(item.id)} onChange={e => setBookIds(ids => e.target.checked ? [...ids, item.id] : ids.filter(id => id !== item.id))} /> {item.chapter} · {item.total} pages · {new Date(item.createdAt).toLocaleString()}</label>)}</div>
      {bookIds.map((id, index) => <div key={id} style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0' }}><span>{index + 1}. {jobs.find(item => item.id === id)?.chapter || 'Saved export'}</span><button type="button" disabled={index === 0} aria-label={`Move book chapter ${index + 1} up`} onClick={() => setBookIds(ids => { const next = [...ids]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; })}>↑</button><button type="button" disabled={index === bookIds.length - 1} aria-label={`Move book chapter ${index + 1} down`} onClick={() => setBookIds(ids => { const next = [...ids]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; return next; })}>↓</button></div>)}
      <button type="button" disabled={busy || bookIds.length < 2 || !bookTitle.trim()} onClick={buildBook}>Build subject book · {bookIds.length} exports</button>
    </details>
    {jobs.length === 0 && <p className={styles.deleteHint}>No saved PDF exports. Build a PDF when your design is ready.</p>}
    {jobs.length > 0 && <label>Export history<select aria-label="Export history" disabled={busy} value={job?.id || ''} onChange={e => { setSelected(e.target.value); setSnapshot(''); setNotice(''); setSavedPreviewOpen(false); }}>{jobs.map(item => <option key={item.id} value={item.id}>{item.subject} / {item.chapter} · {item.total} questions · {item.status} · {new Date(item.createdAt).toLocaleString()}</option>)}</select></label>}
    {job && <div>
      <p role="status">{job.status === 'queued' ? 'Waiting for the active export to finish' : job.status === 'running' ? job.phase === 'combining' ? `Combining saved PDFs: ${job.completed} / ${job.total}` : job.phase === 'answers' ? 'Building separate answer key...' : job.phase === 'images' ? 'Rendering matching page images...' : job.phase === 'checking' ? 'Checking PDF pages and links...' : `Compiling: ${job.completed} / ${job.total}` : job.status === 'completed' ? `${job.total} pages ready · page count and links verified` : job.error || job.status}{job.cancelRequested && active(job) ? ' · Cancelling...' : ''}</p>
      {active(job) && <><progress aria-label="PDF export progress" max={job.total} value={job.completed} style={{ width: 'min(100%,600px)' }} /><button type="button" disabled={busy || job.cancelRequested} onClick={() => action('cancel')}>Cancel export</button></>}
      {['failed', 'cancelled'].includes(job.status) && <button type="button" disabled={busy} onClick={() => action('retry')}>Retry saved snapshot</button>}
      <details className={styles.manageExport}><summary>Manage saved export</summary><div className={styles.savedActions}>
        <button type="button" className={styles.danger} disabled={busy || active(job)} onClick={() => removeGenerated(false)}>Delete generated PDF</button>
        {job.status === 'completed' && <button type="button" className={styles.secondary} disabled={busy} onClick={() => removeGenerated(true)}>Download & remove saved PDF</button>}
      </div>
      <p className={styles.deleteHint}>{active(job) ? 'Cancel the export and wait for it to stop before deleting it.' : 'Delete removes this saved PDF, ZIPs, report and export-history entry. Files already downloaded remain on your computer.'}</p></details>
      {job.status === 'completed' && <div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 12 }}>
          <a className={styles.downloadLink} href={`/api/pdf-jobs/${job.id}/download`}>Download complete PDF</a>
          {job.report?.answerKeyPages && <a href={`/api/pdf-jobs/${job.id}/download?kind=answers`} style={{ color: '#89b4fa' }}>Separate answer-key PDF</a>}
          <a href={`/api/pdf-jobs/${job.id}/download?inline=1`} target="_blank" rel="noopener noreferrer" style={{ color: '#89b4fa' }}>Open PDF ↗</a>
        </div>
        <details className={styles.manageExport}><summary>Other files & export details</summary><div className={styles.savedActions}>
          <a href={`/api/pdf-jobs/${job.id}/download?kind=zip`} style={{ color: '#89b4fa' }}>{job.kind === 'book' ? 'Chapter PDFs ZIP' : '20-question parts ZIP'}</a>
          <a href={`/api/pdf-jobs/${job.id}/download?kind=report`} style={{ color: '#89b4fa' }}>QA report</a>
          {job.report?.imagesAvailable && <a href={`/api/pdf-jobs/${job.id}/download?kind=images`} style={{ color: '#89b4fa' }}>Matching page images ZIP</a>}
        </div>
        <p style={{ fontSize: 13, color: '#bac2de' }}>{job.report?.textBoundsChecked ? job.kind === 'book' ? 'Source chapter text bounds checked; pages copied without reflow.' : 'Text bounds checked.' : 'Text bounds were not checked.'} Content still needs source review.{snapshot && snapshot !== signature ? ' Your draft or PDF settings changed. Build a new PDF to include them.' : ' Downloads contain the saved export snapshot.'}</p>
        </details>
        {Boolean(job.report?.warnings?.length) && <details><summary style={{ color: '#f9e2af' }}>{job.report.warnings.length} layout/readability warnings</summary><ul>{job.report.warnings.map((warning, index) => <li key={index}>{warning.message}</li>)}</ul></details>}
        <details className={styles.manageExport} open={savedPreviewOpen} onToggle={event => setSavedPreviewOpen(event.currentTarget.open)}><summary>Preview saved PDF</summary>
          {historyOpen && savedPreviewOpen && <PdfPreview key={job.id + '-' + job.attempt} url={`/api/pdf-jobs/${job.id}/download?inline=1`} openLinksInNewTab={job.report?.openLinksInNewTab !== false} />}
        </details>
      </div>}
    </div>}
    </div>
  </details>
  </>;
}
