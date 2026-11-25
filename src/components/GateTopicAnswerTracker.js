'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { GATE_SYLLABUS } from '@/lib/syllabus.js';
import { EDITOR_PROJECT_PATH, buildTopicAnswerPrompt, nextTopic, topicLabel } from '@/lib/topic-answer-prompt.mjs';
// Same workspace layout as the year-paper prompt page.
import styles from './GateYearPaperTracker.module.css';

const STORAGE = 'g4gate-topic-answer-prompts-v1';

export default function GateTopicAnswerTracker() {
  const [catalog, setCatalog] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const [selected, setSelected] = useState(''), [search, setSearch] = useState(''), [subjectFilter, setSubjectFilter] = useState('all'), [statusFilter, setStatusFilter] = useState('all');
  const [copied, setCopied] = useState({}), [notice, setNotice] = useState(''), [copying, setCopying] = useState(''), [copyFailed, setCopyFailed] = useState(false), [storageWarning, setStorageWarning] = useState(false);
  const history = useRef({ selected: '', copied: {} }), loaded = useRef(false), copyLock = useRef(false), preview = useRef(null);

  const refresh = useCallback(async signal => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/gatetopicanswers', { cache: 'no-store', signal });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not load topics.');
      if (signal?.aborted) return;
      setCatalog(data);
      setSelected(current => data.topics.some(topic => topic.slug === current) ? current
        : (nextTopic(data.topics, history.current.copied) || data.topics[0])?.slug || '');
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      if (!loaded.current) {
        loaded.current = true;
        try {
          const saved = JSON.parse(localStorage.getItem(STORAGE) || 'null');
          if (saved && typeof saved === 'object') {
            history.current = { selected: typeof saved.selected === 'string' ? saved.selected : '', copied: saved.copied && typeof saved.copied === 'object' ? saved.copied : {} };
            setSelected(history.current.selected); setCopied(history.current.copied);
          }
        } catch { setStorageWarning(true); }
      }
      void refresh(controller.signal);
    }, 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [refresh]);

  function remember(change) {
    history.current = { ...history.current, ...change };
    try { localStorage.setItem(STORAGE, JSON.stringify(history.current)); } catch { setStorageWarning(true); }
  }
  function choose(topic) { setSelected(topic.slug); remember({ selected: topic.slug }); setCopyFailed(false); }

  const topics = catalog?.topics || [], chosen = topics.find(topic => topic.slug === selected);
  const visible = topics.filter(topic => (subjectFilter === 'all' || topic.subject === subjectFilter)
    && (statusFilter === 'all' || statusFilter === 'pending' && !topic.status.complete || statusFilter === 'complete' && topic.status.complete || statusFilter === 'copied' && copied[topic.slug])
    && `${topic.subject} ${topic.chapter}`.toLowerCase().includes(search.toLowerCase().trim()));
  const pending = visible.filter(topic => !topic.status.complete), done = visible.filter(topic => topic.status.complete);
  const next = nextTopic(visible, copied);
  const completeCount = topics.filter(topic => topic.status.complete).length, copiedCount = topics.filter(topic => copied[topic.slug]).length;
  const answered = topics.reduce((sum, topic) => sum + (topic.coverage?.answered || 0), 0);
  const answerable = topics.reduce((sum, topic) => sum + (topic.coverage?.answerable || 0), 0);
  const subjects = [...new Set([...Object.keys(GATE_SYLLABUS), ...topics.map(topic => topic.subject)])];

  let prompt = '', promptError = '';
  if (chosen) { try { prompt = buildTopicAnswerPrompt(chosen); } catch (e) { promptError = e.message; } }

  async function copyPrompt(topic) {
    if (copyLock.current) return;
    let text;
    try { text = buildTopicAnswerPrompt(topic); } catch (e) { choose(topic); setNotice(e.message); return; }
    copyLock.current = true; choose(topic); setCopying(topic.slug); setNotice('');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard is unavailable.');
      await navigator.clipboard.writeText(text);
      const value = { ...history.current.copied, [topic.slug]: new Date().toISOString() };
      setCopied(value); remember({ copied: value });
      setNotice(`Prompt copied for ${topicLabel(topic)}. Isi project (${EDITOR_PROJECT_PATH}) ke AI chat mein paste karein.`);
    } catch {
      setCopyFailed(true); setNotice('Clipboard copy nahi hua. Full prompt neeche selected hai; Ctrl+C ya apne device ka Copy use karein.');
      requestAnimationFrame(() => { preview.current?.focus(); preview.current?.select(); preview.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    } finally { copyLock.current = false; setCopying(''); }
  }

  function downloadPrompt() {
    const url = URL.createObjectURL(new Blob([prompt], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${chosen.slug}.answers.prompt.txt`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function rows(items) {
    return items.map(topic => {
      const active = topic.slug === selected, file = topic.coverage?.answerFile;
      return <article key={topic.slug} className={`${styles.row} ${active ? styles.selected : ''} ${topic.status.complete ? styles.done : ''}`} data-slug={topic.slug}>
        <input type="checkbox" checked={topic.status.complete} disabled aria-label={`All answers stored for ${topicLabel(topic)}`} />
        <div className={styles.fileInfo}>
          <button className={styles.fileName} onClick={() => choose(topic)} aria-pressed={active}>{topicLabel(topic)}</button>
          <span className={styles.identity}>{topic.subject} / {topic.chapter}</span>
          <div className={styles.badges}>
            <span className={topic.status.complete ? styles.completeBadge : ['review', 'missing'].includes(topic.status.state) ? styles.reviewBadge : styles.statusBadge}>{topic.status.label}</span>
            {file?.exists && file.valid && <span className={styles.statusBadge}>Reviewed answer file · {file.entries}{file.notes ? ` · ${file.notes} notes` : ''}</span>}
            {copied[topic.slug] && <span className={styles.copiedBadge}>Prompt copied</span>}
          </div>
        </div>
        <div className={styles.rowActions}>
          <button onClick={() => choose(topic)} aria-label={`Preview prompt for ${topicLabel(topic)}`}>Preview</button>
          <button className={styles.copyButton} disabled={Boolean(copying)} onClick={() => copyPrompt(topic)} aria-label={`Copy prompt for ${topicLabel(topic)}`}>{copying === topic.slug ? 'Copying…' : 'Copy prompt'}</button>
        </div>
      </article>;
    });
  }

  return <main className={styles.page}>
    <header className={styles.header}>
      <div><span className={styles.eyebrow}>G4GATE · TOPIC ANSWER WORKSPACE</span><h1>One topic. Every answer verified.</h1><p>Ek topic choose karein, uska full prompt copy karein, aur isi project ke AI chat mein paste karein. Har prompt sirf ek topic ke answers add aur verify karta hai.</p></div>
      <nav aria-label="Workspace navigation"><Link href="/gateyearpaperpdf">Year paper prompts ↗</Link><Link href="/status">Chapter status ↗</Link><Link href="/">← Editor</Link></nav>
    </header>

    <section className={styles.overview} aria-label="Topic answer progress">
      <div className={styles.source}><span>ANSWER STATUS</span><code>MongoDB chapters · data/topic-answers/</code><small>Live database read · answer fields only</small></div>
      <div className={styles.stats}>
        <div><strong>{catalog ? topics.length : '—'}</strong><span>Topics</span></div>
        <div><strong>{catalog?.statusAvailable ? completeCount : '—'}</strong><span>Fully answered</span></div>
        <div><strong>{catalog?.statusAvailable ? `${answered}/${answerable}` : '—'}</strong><span>Questions answered</span></div>
        <div><strong>{copiedCount}</strong><span>Prompts copied</span></div>
      </div>
      <div className={styles.progress} role="progressbar" aria-label="Answered questions" aria-valuemin={0} aria-valuemax={answerable || 1} aria-valuenow={answered}><span style={{ width: `${answerable ? answered / answerable * 100 : 0}%` }} /></div>
      <div className={styles.toolbar}>
        <button className={styles.primary} disabled={loading || Boolean(copying) || !next} onClick={() => copyPrompt(next)}>{copying ? 'Copying…' : 'Copy next pending prompt →'}</button>
        <button disabled={loading} onClick={() => void refresh()}>{loading ? 'Checking database…' : '↻ Refresh answer status'}</button>
        <p>Tick means every answerable question in that chapter has a stored answer. <strong>Copied ≠ answered.</strong></p>
      </div>
    </section>

    {error && <div className={styles.warning} role="alert">{error} <button disabled={loading} onClick={() => void refresh()}>Retry</button></div>}
    {catalog?.warning && <p className={styles.warning} role="alert">{catalog.warning}</p>}
    {storageWarning && <p className={styles.warning}>Browser copy-history storage is unavailable. Prompts and answer status still work.</p>}
    <p className={copyFailed ? styles.warning : styles.notice} role="status" aria-live="polite">{notice || (loading ? 'Topics aur answer status load ho rahe hain…' : 'Choose a topic to preview or copy its answer prompt.')}</p>

    <div className={styles.workspace}>
      <section className={styles.library} aria-label="Book topics" aria-busy={loading}>
        <div className={styles.filters}>
          <label className={styles.search}>Search topics<input type="search" placeholder="Subject or chapter…" value={search} onChange={e => setSearch(e.target.value)} /></label>
          <label>Subject<select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}><option value="all">All subjects</option>{subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}</select></label>
          <label>Status<select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">All topics</option><option value="pending">Answers pending</option><option value="complete">All answered</option><option value="copied">Prompt copied</option></select></label>
        </div>
        <div className={styles.listHeading}><h2>Book topics</h2><span>{visible.length} of {topics.length} topics</span></div>
        {loading && !catalog && <p className={styles.empty}>Loading topics…</p>}
        {!loading && catalog && !visible.length && <div className={styles.empty}><h3>No matching topics</h3><p>Try a different search or filter.</p></div>}
        {pending.length > 0 && <div className={styles.fileGroup}>{rows(pending)}</div>}
        {done.length > 0 && <><h3 className={styles.completedHeading}>All answers stored <span>{done.length}</span></h3><div className={styles.fileGroup}>{rows(done)}</div></>}
      </section>

      <aside className={styles.previewPanel} aria-label="Full topic answer prompt preview">
        <div className={styles.previewHeading}><span className={styles.eyebrow}>READY TO PASTE</span><span>{prompt.length.toLocaleString()} characters</span></div>
        <h2>{chosen ? topicLabel(chosen) : 'Select a topic'}</h2>
        {chosen && <>
          <p className={styles.path}>{chosen.subject} / {chosen.chapter} · data/topic-answers/{chosen.slug}.json</p>
          {promptError && <p className={styles.warning} role="alert">{promptError}</p>}
          <textarea ref={preview} aria-label="Full topic answer prompt" readOnly value={prompt} spellCheck={false} onFocus={e => e.target.select()} />
          <div className={styles.previewActions}>
            <button className={styles.primary} disabled={Boolean(copying) || Boolean(promptError)} onClick={() => copyPrompt(chosen)}>Copy full prompt</button>
            <button disabled={Boolean(promptError)} onClick={downloadPrompt}>Download .txt</button>
            <button disabled={Boolean(promptError)} onClick={() => { preview.current?.focus(); preview.current?.select(); setNotice('Full prompt selected. Press Ctrl+C or use your device’s Copy action.'); }}>Select all</button>
          </div>
          <p className={styles.safety}>Prompt includes: answer sources, the worksheet/apply scripts, option-order mapping rules, unchanged question data and final checks.</p>
        </>}
      </aside>
    </div>
    <footer className={styles.footer}><span>AI chat project: <code>{EDITOR_PROJECT_PATH}</code></span><p>This page only reads answer status and builds prompts. Answers are written by the reviewed apply script, never by this page.</p></footer>
  </main>;
}
