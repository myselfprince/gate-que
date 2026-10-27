'use client';

import { useEffect, useRef, useState } from 'react';
import PdfPreview from './PdfPreview';
import { pdfPreviewExamples, pdfPreviewPayload } from '@/lib/pdf-live-preview.mjs';
import styles from './PdfExportPanel.module.css';

export default function PdfLivePreview({ payload, sourceMode, settingsValid, active }) {
  const [exampleId, setExampleId] = useState('');
  const [display, setDisplay] = useState(null);
  const [attempt, setAttempt] = useState({ key: '', error: '' });
  const [retry, setRetry] = useState(0);
  const cache = useRef(new Map());
  const examples = pdfPreviewExamples(payload.questions, sourceMode);
  const sample = pdfPreviewPayload(payload, exampleId, sourceMode);
  const request = sample ? JSON.stringify(sample) : '';
  const current = display?.key === request;
  const error = attempt.key === request ? attempt.error : '';
  const updating = Boolean(active && settingsValid && request && (!current || attempt.key === request && attempt.pending) && !error);
  useEffect(() => {
    if (!active || !settingsValid || !request) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const cached = cache.current.get(request);
      if (cached) { setDisplay(cached); setAttempt({ key: request, error: '' }); return; }
      setAttempt({ key: request, error: '', pending: true });
      try {
        const response = await fetch('/api/pdf-preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: request, signal: controller.signal });
        if (!response.ok) throw Error((await response.json()).error || 'The sample PDF could not be generated.');
        const data = await response.arrayBuffer();
        if (controller.signal.aborted) return;
        const result = { key: request, data, warnings: JSON.parse(decodeURIComponent(response.headers.get('X-PDF-Warnings') || '%5B%5D')) };
        cache.current.set(request, result);
        let bytes = [...cache.current.values()].reduce((total, item) => total + item.data.byteLength, 0);
        while (cache.current.size > 6 || bytes > 24 * 1024 * 1024 && cache.current.size > 1) {
          const oldest = cache.current.keys().next().value;
          bytes -= cache.current.get(oldest).data.byteLength; cache.current.delete(oldest);
        }
        setDisplay(result);
        setAttempt({ key: request, error: '', pending: false });
      } catch (error) { if (!controller.signal.aborted) setAttempt({ key: request, error: error.message }); }
    }, cache.current.has(request) ? 0 : 450);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [active, settingsValid, request, retry]);
  function downloadSample() {
    if (!display) return;
    const url = URL.createObjectURL(new Blob([display.data], { type: 'application/pdf' }));
    const link = document.createElement('a'); link.href = url; link.download = `Question-${sample.questions[0].exportNumber}-preview.pdf`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <aside className={styles.livePreview} aria-label="Live PDF design preview" aria-busy={updating}>
    <div className={styles.previewHeading}><div><p className={styles.eyebrow}>Live design preview</p><h3>See your settings on a real PDF.</h3></div><span role="status" className={styles.previewState}>{!settingsValid ? 'Fix settings to update' : !sample ? 'Add a question' : error ? 'Preview needs attention' : updating ? 'Updating…' : current ? 'Up to date' : 'Updating…'}</span></div>
    <p className={styles.previewHint}>Changes update automatically after a short pause. The example uses your PDF layout, maths, diagrams and decorations.</p>
    <label>Example question<select aria-label="Live PDF example question" value={sample?.questions[0].id || ''} disabled={!examples.length} onChange={event => setExampleId(event.target.value)}>{examples.map(question => <option key={question.id} value={question.id}>Q{question.exportNumber} · {question.year || 'No year'} · {question.isBlank ? 'Blank placeholder' : question.text?.slice(0, 70)}</option>)}</select></label>
    <div className={styles.previewSurface} data-preview-current={current ? 'true' : 'false'}>
      {display ? <PdfPreview key={display.key} data={display.data} compact openLinksInNewTab={payload.pdfSettings?.openLinksInNewTab !== false} /> : <div className={styles.previewEmpty}>{!sample ? 'Load a chapter to preview an example question.' : !settingsValid ? 'Correct the highlighted settings to generate a preview.' : error ? 'Preview unavailable. You can retry below.' : 'Preparing your example PDF…'}</div>}
      {display && updating && <div className={styles.updatingBadge} role="status">Updating preview…</div>}
    </div>
    {error && <p role="alert" className={styles.error}>{error} <button className={styles.textButton} onClick={() => setRetry(value => value + 1)}>Retry preview</button></p>}
    {current && display.warnings.map((warning, index) => <p key={index} className={styles.warning}>{warning.message}</p>)}
    <div className={styles.previewActions}><button className={styles.secondary} disabled={!display || !current || !settingsValid} onClick={downloadSample}>Download sample PDF</button><button className={styles.textButton} disabled={updating || !sample || !settingsValid} onClick={() => { cache.current.delete(request); setAttempt({ key: request, error: '' }); setRetry(value => value + 1); }}>Refresh preview</button><span>Temporary sample · export history stays clean</span></div>
  </aside>;
}
