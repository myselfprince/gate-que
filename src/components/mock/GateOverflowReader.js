'use client';
import { useEffect, useRef, useState } from 'react';
import { loadMath } from './MockQuestion';
import styles from './MockAdmin.module.css';

export default function GateOverflowReader({ url, question }) {
  const [state, setState] = useState({}), [requested, setRequested] = useState(null);
  const node = useRef(null);
  const current = state.url === url ? state : {};
  useEffect(() => {
    if (!requested || requested.url !== url) return;
    const controller = new AbortController();
    fetch(`/api/gatemock/admin/reference?url=${encodeURIComponent(url)}`, { signal: controller.signal, cache: 'no-store' })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error); return data; })
      .then(data => setState({ ...data, url }))
      .catch(error => { if (error.name !== 'AbortError') setState({ url, error: error.message }); });
    return () => controller.abort();
  }, [requested, url]);
  useEffect(() => {
    if (!current.posts || !node.current) return;
    let disposed = false; const element = node.current;
    loadMath().then(math => { if (!disposed) return math.typesetPromise([element]); }).catch(() => {});
    return () => { disposed = true; window.MathJax?.typesetClear?.([element]); };
  }, [current.posts]);
  function load() { setState({ url, loading: true }); setRequested({ url }); }
  if (!url) return <div className={styles.readerIntro}><div><strong>Add this question’s GATE Overflow link</strong><p>Paste a question URL above to read its discussion here. The link is saved with the answer.</p><a href={`https://gateoverflow.in/search?q=${encodeURIComponent(`GATE ${question.examPaper === 'IT' ? 'IT' : 'CSE'} ${question.year} question ${question.paperQuestionNumber || ''}`)}`} target="_blank" rel="noreferrer">Find on GATE Overflow ↗</a></div></div>;
  return <>
    <div className={styles.readerIntro}><div><strong>Read the source while reviewing</strong><p>Load the question and community answers in this page.</p></div><button type="button" disabled={current.loading} onClick={load}>{current.loading ? 'Loading discussion…' : current.posts ? 'Reload discussion' : current.error ? 'Retry discussion' : 'Load discussion here'}</button></div>
    {current.loading && <p role="status">Loading GATE Overflow discussion…</p>}
    {current.error && <p className={styles.readerError} role="status">{current.error}<a href={url} target="_blank" rel="noreferrer">Open original ↗</a></p>}
    {current.posts && <div ref={node} className={styles.readerContent} aria-label="GATE Overflow discussion"><h3>{current.title}</h3>{current.posts.map((post, index) => <article className={styles.readerPost} key={index}><strong>{post.label}</strong><div dangerouslySetInnerHTML={{ __html: post.html }} /></article>)}<p className={styles.readerCredit}>Source: <a href={current.sourceUrl} target="_blank" rel="noreferrer">GATE Overflow · Original discussion ↗</a></p></div>}
  </>;
}
