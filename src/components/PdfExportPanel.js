'use client';

import { useCallback, useEffect, useState } from 'react';

const active = job => job && ['queued', 'running'].includes(job.status);
export default function PdfExportPanel({ payload }) {
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [snapshot, setSnapshot] = useState('');
  const signature = JSON.stringify(payload);
  const refresh = useCallback(async () => {
    const response = await fetch('/api/pdf-jobs', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Export history could not be loaded.');
    setJobs(data.jobs);
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
  async function start() {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/pdf-jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: signature });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Export could not be started.');
      setSelected(data.job.id); setSnapshot(signature);
      setJobs(previous => [data.job, ...previous.filter(job => job.id !== data.job.id)]);
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
  return <section aria-label="PDF exports" style={{ padding: 18, margin: '16px 0', border: '1px solid #cba6f7', borderRadius: 10, background: '#181825' }}>
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <button type="button" disabled={busy || !payload.questions.length} onClick={start} style={{ background: '#cba6f7', color: '#11111b', fontWeight: 'bold', padding: '10px 18px' }}>{busy ? 'Please wait...' : `Build PDF · ${payload.questions.length} questions`}</button>
      <span style={{ color: '#bac2de', fontSize: 13 }}>Your export continues in the background. Refreshing this page keeps its progress.</span>
      <button type="button" disabled={busy} onClick={() => refresh().catch(error => setError(error.message))}>Refresh history</button>
    </div>
    {error && <p role="alert" style={{ color: '#f38ba8' }}>{error}</p>}
    {jobs.length > 0 && <label>Export history<select value={job?.id || ''} onChange={e => { setSelected(e.target.value); setSnapshot(''); }}>{jobs.map(item => <option key={item.id} value={item.id}>{item.subject} / {item.chapter} · {item.total} questions · {item.status} · {new Date(item.createdAt).toLocaleString()}</option>)}</select></label>}
    {job && <div>
      <p role="status">{job.status === 'queued' ? 'Waiting for the active export to finish' : job.status === 'running' ? `Compiling: ${job.completed} / ${job.total}` : job.status === 'completed' ? `${job.total} pages ready · page count and links verified` : job.error || job.status}{job.cancelRequested && active(job) ? ' · Cancelling...' : ''}</p>
      {active(job) && <><progress aria-label="PDF export progress" max={job.total} value={job.completed} style={{ width: 'min(100%,600px)' }} /><button type="button" disabled={busy || job.cancelRequested} onClick={() => action('cancel')}>Cancel export</button></>}
      {['failed', 'cancelled'].includes(job.status) && <button type="button" disabled={busy} onClick={() => action('retry')}>Retry saved snapshot</button>}
      {job.status === 'completed' && <div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 12 }}>
          <a href={`/api/pdf-jobs/${job.id}/download`} style={{ color: '#a6e3a1' }}>Download complete PDF</a>
          <a href={`/api/pdf-jobs/${job.id}/download?kind=zip`} style={{ color: '#89b4fa' }}>20-question parts ZIP</a>
          <a href={`/api/pdf-jobs/${job.id}/download?kind=report`} style={{ color: '#89b4fa' }}>QA report</a>
          <a href={`/api/pdf-jobs/${job.id}/download?inline=1`} target="_blank" rel="noopener noreferrer" style={{ color: '#89b4fa' }}>Open PDF preview ↗</a>
        </div>
        <p style={{ fontSize: 13, color: '#bac2de' }}>{job.report?.textBoundsChecked ? 'Text bounds checked.' : 'Text bounds were not checked.'} Content still needs source review.{snapshot && snapshot !== signature ? ' Your draft or PDF settings changed. Build a new PDF to include them.' : ' Downloads contain the saved export snapshot.'}</p>
        {Boolean(job.report?.warnings?.length) && <details><summary style={{ color: '#f9e2af' }}>{job.report.warnings.length} layout/readability warnings</summary><ul>{job.report.warnings.map((warning, index) => <li key={index}>{warning.message}</li>)}</ul></details>}
      </div>}
    </div>}
  </section>;
}
