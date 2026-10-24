'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ALL_PDFS, PDF_ROOT, PROJECT_PATH, PROGRESS_KEY, LEGACY_PROGRESS_KEY,
  buildImportPrompt, parseProgress, trackerSubjects,
} from '@/lib/pdf-tracker.mjs';
import styles from './tracker.module.css';

export default function PdfTrackerPage() {
  const [overrides, setOverrides] = useState({});
  const overridesRef = useRef({});
  const [counts, setCounts] = useState({ actualCounts: {}, targetCounts: {} });
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(true);
  const [syncError, setSyncError] = useState('');
  const [storageError, setStorageError] = useState('');
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
      setSyncError('DB status load nahi hua. Saved ticks use kar sakte hain; DB completion ke liye Retry karein.');
    } finally {
      if (!signal?.aborted) setSyncing(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      try {
        const saved = {
          ...parseProgress(localStorage.getItem(LEGACY_PROGRESS_KEY)),
          ...parseProgress(localStorage.getItem(PROGRESS_KEY)),
        };
        overridesRef.current = saved;
        setOverrides(saved);
      } catch {
        setStorageError('Saved ticks read nahi hue. Is tab mein progress track kar sakte hain.');
      }
      setReady(true);
      void refreshStatus(controller.signal);
    }, 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [refreshStatus]);

  function saveProgress(next) {
    overridesRef.current = next;
    setOverrides(next);
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      setStorageError('');
    } catch {
      setStorageError('Browser progress save nahi kar paya. Ticks abhi sirf is tab mein hain.');
    }
  }

  function setChecked(files, checked) {
    const next = { ...overridesRef.current };
    files.forEach(file => { next[file.path] = checked; });
    saveProgress(next);
  }

  const subjects = trackerSubjects(overrides, counts.actualCounts, counts.targetCounts);
  const files = subjects.flatMap(subject => subject.files);
  const nextFile = files.find(file => !file.checked);
  const checkedCount = files.filter(file => file.checked).length;
  const completedSubjects = subjects.filter(subject => subject.complete).length;
  const percent = Math.round(checkedCount / files.length * 100);
  const busy = !ready || syncing || Boolean(copying);

  async function copyPrompt(file) {
    if (copyLock.current) return;
    copyLock.current = true;
    setCopying(file.path);
    setCopyFailed(false);
    setPreviewPath(file.path);
    try {
      await navigator.clipboard.writeText(buildImportPrompt(file.path));
      setChecked([file], true);
      setNotice(`Full prompt + exact PDF location copied. ✓ ${file.filename}`);
    } catch {
      setCopyFailed(true);
      setNotice('Clipboard copy nahi hua; checkmark change nahi kiya. Neeche full prompt select karke copy karein.');
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      copyLock.current = false;
      setCopying('');
    }
  }

  function useDatabaseTicks() {
    if (!window.confirm('Manual ticks reset karke current DB completion use karein?')) return;
    saveProgress({});
    try {
      localStorage.removeItem(LEGACY_PROGRESS_KEY);
    } catch {
      setStorageError('Purane manual ticks remove nahi hue. Reload ke baad woh wapas aa sakte hain.');
    }
    setNotice('Ticks current database completion se reset ho gaye.');
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
            {copying ? 'Copying…' : nextFile ? 'Copy next prompt (with location)' : '✓ All PDFs checked'}
          </button>
          <button disabled={!ready || syncing || Boolean(copying)} onClick={() => void refreshStatus()}>
            {syncing ? 'Loading DB status…' : '↻ Refresh DB status'}
          </button>
          <button disabled={busy || Boolean(syncError)} onClick={useDatabaseTicks}>Reset manual ticks</button>
        </div>
        <div className={styles.stats}>
          <strong>{checkedCount} <span>/ {files.length} PDFs checked</span></strong>
          <span>{completedSubjects} / {subjects.length} subjects · {percent}%</span>
        </div>
        <div className={styles.progress} role="progressbar" aria-label="PDF checklist" aria-valuemin={0} aria-valuemax={files.length} aria-valuenow={checkedCount}>
          <div style={{ width: `${percent}%` }} />
        </div>
        <p className={styles.hint}>DB mein completed chapters pehle se tick hain. Copy successful hone par bhi tick lagta hai. Folder tabhi neeche jayega jab uske saare PDFs checked honge.</p>
      </section>

      {syncError && <div className={styles.warning} role="alert">{syncError} <button disabled={syncing} onClick={() => void refreshStatus()}>Retry</button></div>}
      {storageError && <p className={styles.warning} role="alert">{storageError}</p>}
      <p className={styles.notice} role="status" aria-live="polite">{notice || (syncing ? 'Database completion sync ho raha hai…' : 'Checklist browser mein save hoti hai. DB counts har refresh par update hote hain.')}</p>

      <div className={styles.subjects} aria-busy={!ready || syncing}>
        {subjects.map((subject, index) => (
          <div key={subject.name}>
            {subject.complete && !subjects[index - 1]?.complete && <h2 className={styles.sectionTitle}>Completed subjects <span>All PDFs checked</span></h2>}
            <section className={`${styles.subject} ${subject.complete ? styles.completeSubject : ''} ${subject.name === nextFile?.subject ? styles.current : ''}`} data-subject={subject.name}>
              <header className={styles.subjectHead}>
                <input type="checkbox" checked={subject.complete} disabled={busy}
                  ref={node => { if (node) node.indeterminate = subject.checkedCount > 0 && !subject.complete; }}
                  aria-label={`Mark entire ${subject.name} checked`}
                  onChange={event => setChecked(subject.files, event.target.checked)} />
                <h2>{subject.name}</h2>
                {subject.complete && <span className={styles.completeTag}>✓ Complete</span>}
                <span className={styles.count}>{subject.checkedCount} / {subject.files.length} PDFs</span>
              </header>
              <div className={styles.pdfList}>
                {subject.files.map(file => (
                  <div key={file.path} className={`${styles.pdf} ${file.checked ? styles.done : ''}`} data-pdf={file.path}>
                    <input type="checkbox" id={`pdf-${ALL_PDFS.findIndex(item => item.path === file.path)}`}
                      checked={file.checked} disabled={busy} aria-label={`Check ${subject.name} / ${file.filename}`}
                      onChange={event => setChecked([file], event.target.checked)} />
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
      <p className={styles.footer}>Checkmark aapki copy / manual checklist hai. Actual database completion har PDF ke neeche alag dikhti hai.</p>
    </main>
  );
}
