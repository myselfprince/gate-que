'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { validatePreparedYearPaper } from '@/lib/admin-year-papers.mjs';
import base from './GatePractice.module.css';
import styles from './MockYearPaperAdmin.module.css';

const paperTitle = paper => paper.title || `GATE ${paper.examPaper} ${paper.year}${paper.setNum ? ` · Set ${paper.setNum}` : ''}`;
export default function MockYearPaperAdmin() {
  const [papers, setPapers] = useState(null), [exam, setExam] = useState(''), [year, setYear] = useState(''), [selected, setSelected] = useState('');
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [adding, setAdding] = useState(false);
  const [candidate, setCandidate] = useState(null), [fileName, setFileName] = useState('');
  const selection = useRef(null);
  async function refresh() {
    const response = await fetch('/api/gatemock/admin/papers', { cache: 'no-store' });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Paper library could not load.');
    setPapers(data.papers); return data.papers;
  }
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/gatemock/admin/papers', { cache: 'no-store', signal: controller.signal })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error); return data; })
      .then(data => setPapers(data.papers)).catch(error => { if (error.name !== 'AbortError') setError(error.message); });
    return () => controller.abort();
  }, []);
  const categorized = (papers || []).filter(p => !exam || p.examPaper === exam);
  const visible = categorized.filter(p => !year || p.year === year);
  const chosen = visible.find(p => p.slug === selected) || visible[0];
  const years = [...new Set(categorized.map(p => p.year))].sort((a, b) => Number(b) - Number(a));
  function choose(slug) { setSelected(slug); if (window.innerWidth < 900) selection.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  async function readPaper(event) {
    const file = event.target.files?.[0]; setError(''); setNotice(''); setCandidate(null); setFileName('');
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Choose a prepared paper JSON up to 2 MB.'); return; }
    try {
      const data = JSON.parse(await file.text());
      setCandidate(validatePreparedYearPaper(data));
      setFileName(file.name);
    } catch (error) { setError(error instanceof SyntaxError ? 'The selected file is not valid JSON.' : error.message); }
  }
  const change = (field, value) => setCandidate(previous => ({ ...previous, [field]: value }));
  async function importPaper(event) {
    event.preventDefault(); setError(''); setNotice('');
    try {
      const prepared = validatePreparedYearPaper(candidate);
      setBusy(true);
      const response = await fetch('/api/gatemock/admin/papers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prepared) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'The paper could not be added.');
      await refresh(); setExam(data.paper.examPaper); setYear(data.paper.year); setSelected(data.paper.slug); setAdding(false); setCandidate(null);
      setNotice(`${paperTitle(data.paper)} added. Open its review page to edit answers and solution links.`);
    } catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  return <main className={`${base.page} ${styles.page}`}>
    <header className={base.header}><Link href="/gatemock" className={base.brand}><span className={base.seal} aria-hidden="true">G4</span><span>G4Gate<small>PREVIOUS-YEAR PAPER ADMIN</small></span></Link><nav className={styles.headerLinks}><Link href="/gatemock/admin">Question bank admin</Link><Link href="/gatemock">Test centre ↗</Link></nav></header>
    <div className={base.strip}><span>ADMIN · Previous-year papers</span><span>Organize papers · Review answers · Add solutions</span></div>
    <div className={base.content}>
      <section className={styles.intro}><div><p className={base.eyebrow}>PREVIOUS-YEAR PAPER LIBRARY</p><h1>Your GATE papers, organized.</h1><p>Browse each complete paper in its original order. Manage answer keys, GATE Overflow links and video solutions.</p></div><button className={base.primary} onClick={() => setAdding(!adding)} aria-expanded={adding} aria-controls="add-year-paper">{adding ? 'Close import' : '+ Add previous-year paper'}</button></section>
      {error && <p className={base.error} role="alert">{error} {error.includes('Authentication') && <Link href="/login">Sign in</Link>}</p>}
      {notice && <p className={styles.success} role="status">{notice}</p>}
      {adding && <section id="add-year-paper" className={`${base.panel} ${styles.importPanel}`} aria-label="Add previous-year paper"><h2>Add a prepared paper</h2><p>Choose a prepared paper JSON, then set its paper category, year and session. It will appear in this library and the test centre.</p><p className={styles.importHelp}>Use the same JSON format as the existing year papers, with questions in original order. Referenced diagrams must already be prepared in the paper’s asset folder.</p><label>Prepared paper JSON<input type="file" accept=".json,application/json" disabled={busy} onChange={readPaper} /></label>
        {candidate && <form onSubmit={importPaper}><p className={styles.fileSummary}>{fileName} · {candidate.questions.length} questions · {candidate.totalMarks} marks</p><div className={styles.importFields}><label>Paper category<select value={candidate.examPaper} disabled={busy} onChange={e => change('examPaper', e.target.value)}><option value="CS">GATE CS</option><option value="IT">GATE IT</option></select></label><label>Year<input type="number" min="1983" max="2099" required disabled={busy} value={candidate.year} onChange={e => change('year', e.target.value)} /></label><label>Set / session<input maxLength={16} disabled={busy} value={candidate.setNum} placeholder="Blank for a single paper" onChange={e => change('setNum', e.target.value)} /></label><label className={styles.wideField}>Paper title<input maxLength={200} disabled={busy} value={candidate.title} placeholder={`GATE ${candidate.examPaper} ${candidate.year}`} onChange={e => change('title', e.target.value)} /></label></div><label className={styles.check}><input type="checkbox" checked={candidate.verified} disabled={busy} onChange={e => change('verified', e.target.checked)} /><span>Paper order, question count and marking rules have been verified.<small>Unverified papers stay marked for review in the library.</small></span></label><button className={base.primary} disabled={busy}>{busy ? 'Adding paper…' : 'Add paper to library'}</button></form>}
      </section>}
      {!papers ? <div className={styles.loading} role="status">{error ? 'Paper library could not load.' : 'Loading previous-year papers…'}</div> : <div className={base.lobbyGrid}>
        <section className={base.panel} aria-labelledby="admin-papers-title"><div className={base.panelHeading}><div><h2 id="admin-papers-title">Previous-year papers</h2><p>Original order. Separate papers. All solutions in one place.</p></div><span className={base.readyBadge}>{papers.length} added</span></div>
          <div className={base.filters}><label>Paper<select value={exam} onChange={e => { setExam(e.target.value); setYear(''); }}><option value="">All paper categories</option><option value="CS">GATE CS</option><option value="IT">GATE IT · historical</option></select></label><label>Year<select value={year} onChange={e => setYear(e.target.value)}><option value="">All years</option>{years.map(value => <option key={value}>{value}</option>)}</select></label><label>Question paper<select value={chosen?.slug || ''} onChange={e => choose(e.target.value)}>{!visible.length && <option value="">No papers in this category</option>}{visible.map(p => <option key={p.slug} value={p.slug}>{paperTitle(p)}</option>)}</select></label></div>
          <div className={base.listLabel}><span>{visible.length} previous-year {visible.length === 1 ? 'paper' : 'papers'}</span><span>Select a paper to manage its questions</span></div>
          <div className={base.paperList} aria-label="Admin previous-year papers">{visible.map(paper => <button className={base.paperRow} aria-pressed={chosen?.slug === paper.slug} key={paper.slug} onClick={() => choose(paper.slug)}><span className={base.yearBlock}>{paper.year}<small>{paper.examPaper}</small></span><span className={base.paperInfo}><strong>{paperTitle(paper)}</strong><span>{paper.available} questions · {paper.totalMarks} marks · {paper.durationMinutes} min</span><small>{paper.gateOverflowCount} GATE Overflow links · {paper.videoCount} video solutions{paper.setNum ? ` · Set ${paper.setNum}` : ''}</small></span><span className={base.rowEnd}><span className={paper.ready ? base.readyBadge : base.pendingBadge}>{paper.ready ? 'Verified complete' : 'Review required'}</span><span>{chosen?.slug === paper.slug ? 'Selected ✓' : 'View paper →'}</span></span></button>)}{!visible.length && <div className={base.empty}><h3>No papers in this category</h3><p>Choose another category or add a prepared paper.</p></div>}</div>
          <div className={base.listNote}>Newly imported year papers appear here automatically under their GATE paper category, year and set.</div>
        </section>
        <aside ref={selection} className={`${base.panel} ${base.testDetails}`} aria-label="Selected admin paper"><div className={base.blueHeading}>YOUR SELECTED PAPER</div>{chosen ? <div className={base.detailsBody}><span className={chosen.ready ? base.readyBadge : base.pendingBadge}>{chosen.ready ? 'Complete previous-year paper' : 'Paper needs verification'}</span><h2>{paperTitle(chosen)}</h2><p>{chosen.examPaper === 'IT' ? 'Information Technology' : 'Computer Science and Information Technology'}{chosen.setNum ? ` · Set ${chosen.setNum}` : ''}</p><div className={base.testFacts}><div><strong>{chosen.available}</strong><span>Questions</span></div><div><strong>{chosen.totalMarks}</strong><span>Marks</span></div><div><strong>{chosen.durationMinutes}<small> min</small></strong><span>Duration</span></div></div><ul className={styles.features}><li>Review every question in its original order</li><li>Save MCQ, MSQ and NAT answer keys</li><li>Open, add or change GATE Overflow links</li><li>Add or update YouTube video solutions</li></ul><div className={styles.linkStats}><span><strong>{chosen.gateOverflowCount}/{chosen.available}</strong> GATE Overflow links</span><span><strong>{chosen.videoCount}/{chosen.available}</strong> Video solutions</span></div><Link href={`/gatemock/admin/papers/${chosen.slug}`} className={styles.primaryLink}>Review questions &amp; solutions →</Link><Link href={`/gatemock?paper=${encodeURIComponent(chosen.slug)}`} className={styles.testLink}>View in test centre ↗</Link><p className={styles.reviewNote}>{chosen.reviewCount} questions currently require manual review.</p></div> : <div className={base.empty}><p>Select a paper to view its details.</p></div>}</aside>
      </div>}
    </div>
  </main>;
}
