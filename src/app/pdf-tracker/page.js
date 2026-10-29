'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ALL_PDFS, PDF_ROOT, PROJECT_PATH, buildImportPrompt, trackerSubjects,
} from '@/lib/pdf-tracker.mjs';
import styles from './tracker.module.css';

export default function PdfTrackerPage() {
  const [counts, setCounts] = useState({ actualCounts: {}, targetCounts: {} });
  const [syncing, setSyncing] = useState(true);
  const [syncError, setSyncError] = useState('');
  const [notice, setNotice] = useState('');
  const [copying, setCopying] = useState('');
  const [previewPath, setPreviewPath] = useState(ALL_PDFS[0].path);
  const [copyFailed, setCopyFailed] = useState(false);
  const copyLock = useRef(false);
  const previewRef = useRef(null);

  const refreshStatus = useCallback(async (signal) => {
    setSyncing(true);
    setSyncError('');
    try {
      const response = await fetch('/api/status', { cache: 'no-store', signal });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error('Status unavailable');
      setCounts({ actualCounts: data.actualCounts || {}, targetCounts: data.targetCounts || {} });
    } catch (error) {
      if (error.name === 'AbortError') return;
      setSyncError('DB status load nahi hua. Database completion update karne ke liye Retry karein.');
    } finally {
      if (!signal?.aborted) setSyncing(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void refreshStatus(controller.signal);
    }, 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [refreshStatus]);

  const subjects = trackerSubjects(counts.actualCounts, counts.targetCounts);
  const files = subjects.flatMap(subject => subject.files);
  const nextFile = files.find(file => !file.checked);
  const checkedCount = files.filter(file => file.checked).length;
  const completedSubjects = subjects.filter(subject => subject.complete).length;
  const percent = Math.round(checkedCount / files.length * 100);
  const busy = syncing || Boolean(copying);

  async function copyPrompt(file) {
    if (copyLock.current) return;
    copyLock.current = true;
    setCopying(file.path);
    setCopyFailed(false);
    setPreviewPath(file.path);
    try {
      await navigator.clipboard.writeText(buildImportPrompt(file.path));
      setNotice(`Full prompt + exact PDF location copied: ${file.filename}`);
    } catch {
      setCopyFailed(true);
      setNotice('Clipboard copy nahi hua. Neeche full prompt select karke copy karein.');
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      copyLock.current = false;
      setCopying('');
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>GATE CSE · IMPORT WORKSPACE</span>
          <h1>MadeEasy PYQ PDF Tracker</h1>
          <p>PDF choose karein, poora import prompt copy karein, aur next chapter par badhein.</p>
        </div>
        <nav className={styles.links} aria-label="Workspace navigation">
          <Link href="/gateyearpaperpdf">Year paper prompts ↗</Link>
          <Link href="/status">Database progress ↗</Link>
          <Link href="/">← Editor</Link>
        </nav>
      </header>

      <section className={styles.overview} aria-label="Tracker progress">
        <div className={styles.paths}>
          <div><span>PROJECT</span><code>{PROJECT_PATH}\</code></div>
          <div><span>PDF FOLDER</span><code>{PDF_ROOT}</code></div>
        </div>
        <div className={styles.toolbar}>
          <button className={styles.primary} disabled={busy || !nextFile} onClick={() => copyPrompt(nextFile)}>
            {copying ? 'Copying…' : nextFile ? 'Copy next prompt (with location)' : '✓ All PDFs completed in DB'}
          </button>
          <button disabled={busy} onClick={() => void refreshStatus()}>
            {syncing ? 'Loading DB status…' : '↻ Refresh DB status'}
          </button>
        </div>
        <div className={styles.stats}>
          <strong>{checkedCount} <span>/ {files.length} PDFs completed in DB</span></strong>
          <span>{completedSubjects} / {subjects.length} subjects · {percent}%</span>
        </div>
        <div className={styles.progress} role="progressbar" aria-label="PDF database completion" aria-valuemin={0} aria-valuemax={files.length} aria-valuenow={checkedCount}>
          <div style={{ width: `${percent}%` }} />
        </div>
        <p className={styles.hint}>Ticks sirf database completion se automatically lagte hain; manually change nahi kar sakte. Prompt copy karne se tick nahi lagta. Folder tabhi neeche jayega jab uske saare PDFs DB mein complete honge.</p>
      </section>

      {syncError && <div className={styles.warning} role="alert">{syncError} <button disabled={syncing} onClick={() => void refreshStatus()}>Retry</button></div>}
      <p className={styles.notice} role="status" aria-live="polite">{notice || (syncing ? 'Database completion sync ho raha hai…' : 'Ticks database completion dikhate hain. DB counts har refresh par update hote hain.')}</p>

      <div className={styles.subjects} aria-busy={syncing}>
        {subjects.map((subject, index) => (
          <div key={subject.name}>
            {subject.complete && !subjects[index - 1]?.complete && <h2 className={styles.sectionTitle}>Completed subjects <span>All PDFs completed in DB</span></h2>}
            <section className={`${styles.subject} ${subject.complete ? styles.completeSubject : ''} ${subject.name === nextFile?.subject ? styles.current : ''}`} data-subject={subject.name}>
              <header className={styles.subjectHead}>
                <input type="checkbox" checked={subject.complete} disabled
                  ref={node => { if (node) node.indeterminate = subject.checkedCount > 0 && !subject.complete; }}
                  aria-label={`Database completion for ${subject.name}`} />
                <h2>{subject.name}</h2>
                {subject.complete && <span className={styles.completeTag}>✓ Complete</span>}
                <span className={styles.count}>{subject.checkedCount} / {subject.files.length} PDFs</span>
              </header>
              <div className={styles.pdfList}>
                {subject.files.map(file => (
                  <div key={file.path} className={`${styles.pdf} ${file.checked ? styles.done : ''}`} data-pdf={file.path}>
                    <input type="checkbox" id={`pdf-${ALL_PDFS.findIndex(item => item.path === file.path)}`}
                      checked={file.checked} disabled aria-label={`Database completion for ${subject.name} / ${file.filename}`} />
                    <label htmlFor={`pdf-${ALL_PDFS.findIndex(item => item.path === file.path)}`}>
                      <span className={styles.filename}>{file.filename}</span>
                      <span className={styles.fullpath}>{file.path}</span>
                      <span className={`${styles.dbStatus} ${file.database.complete ? styles.dbComplete : ''}`}>
                        {syncing ? 'DB status loading…' : syncError ? 'DB status unavailable' : `DB: ${file.database.added} / ${file.database.target || '—'} questions${file.database.complete ? ' · Completed' : ''}`}
                      </span>
                    </label>
                    <button className={styles.copy} disabled={busy} aria-label={`Copy prompt for ${subject.name} / ${file.filename}`}
                      onClick={() => copyPrompt(file)}>{copying === file.path ? 'Copying…' : 'Copy prompt (with location)'}</button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ))}
      </div>

      <details className={styles.preview} open={copyFailed ? true : undefined} ref={previewRef}>
        <summary>Full prompt preview / manual copy</summary>
        <label htmlFor="prompt-pdf">PDF to import</label>
        <select id="prompt-pdf" value={previewPath} onChange={event => setPreviewPath(event.target.value)}>
          {ALL_PDFS.map(file => <option key={file.path} value={file.path}>{file.subject} / {file.filename}</option>)}
        </select>
        <textarea aria-label="Full import prompt" readOnly value={buildImportPrompt(previewPath)} onFocus={event => event.target.select()} />
        <button disabled={busy} onClick={() => copyPrompt(ALL_PDFS.find(file => file.path === previewPath))}>Copy prompt (with location)</button>
      </details>
      <p className={styles.footer}>Checkmark sirf database completion dikhata hai. Latest status ke liye Refresh DB status use karein.</p>
    </main>
  );
}
