'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { paperKey } from '@/lib/gatemock.mjs';
import styles from './mock.module.css';

async function request(method = 'GET', body) {
  const response = await fetch('/api/gatemock/admin', { method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), cache: 'no-store' });
  const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Admin request failed.'); return data;
}
const empty = { year: '2006', examPaper: 'CS', setNum: '', questionCount: '', totalMarks: '', durationMinutes: 180, negativeFraction: 1 / 3, verified: false, sourceUrl: '' };
function MappingRow({ record, paper, disabled, onSave }) {
  const [number, setNumber] = useState(paperKey(record) === paperKey(paper) ? record.paperQuestionNumber : '');
  return <article className={styles.record}><small>{record.subject} → {record.chapter} · GATE {record.examPaper} {record.year}{record.setNum ? ` Set ${record.setNum}` : ''} · {record.marks} marks · {record.paperQuestionNumber ? `Original Q${record.paperQuestionNumber}` : 'Unassigned'}</small><p>{record.text}</p>
    <form onSubmit={event => { event.preventDefault(); onSave(record, number); }}><label>Original Q number<input aria-label={`Original number ${record.questionId}`} type="number" min="1" max="999" value={number} onChange={e => setNumber(e.target.value)} /></label><button disabled={disabled}>Save mapping to {paper.examPaper} {paper.year}{paper.setNum ? ` Set ${paper.setNum}` : ''}</button></form>
  </article>;
}
export default function MockPaperAdmin() {
  const [data, setData] = useState(null), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [form, setForm] = useState(empty);
  const [search, setSearch] = useState(''), [subject, setSubject] = useState(''), [all, setAll] = useState(false), [page, setPage] = useState(0);
  async function refresh() { const result = await request(); setData(result); return result; }
  useEffect(() => { let active = true; request().then(result => { if (active) setData(result); }).catch(error => { if (active) setError(error.message); }); return () => { active = false; }; }, []);
  const change = (key, value) => { setForm(form => ({ ...form, [key]: value })); setPage(0); };
  const identity = paperKey(form), selected = data?.years.find(paper => paper.id === identity);
  const records = (data?.records || []).filter(record => !record.datasetId && (all || paperKey(record) === identity) && (!subject || record.subject === subject) && (!search || `${record.text} ${record.questionId}`.toLowerCase().includes(search.toLowerCase())));
  async function savePaper(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try { await request('POST', { ...form, questionCount: Number(form.questionCount), totalMarks: Number(form.totalMarks), durationMinutes: Number(form.durationMinutes), negativeFraction: Number(form.negativeFraction) }); await refresh(); setNotice('Paper definition saved. Coverage recalculated from current question mappings.'); }
    catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  async function map(record, number) {
    setBusy(true); setError(''); setNotice('');
    try { await request('PATCH', { chapterId: record.chapterId, questionId: record.questionId, expectedUpdatedAt: record.chapterUpdatedAt, year: form.year, examPaper: form.examPaper, setNum: form.setNum, paperQuestionNumber: number }); await refresh(); setNotice('Question mapping saved.'); }
    catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  return <section className={styles.page} aria-label="Paper coverage management"><h2>Paper definitions &amp; question mapping</h2><p>Define a paper and map original question numbers in the book question bank.</p>
    {error && <p role="alert" className={styles.error}>{error} {error.includes('Authentication') && <Link href="/login">Sign in</Link>}</p>}{notice && <p role="status">{notice}</p>}
    <div className={styles.builderLayout}><section className={styles.panel}><h2>Official paper definition</h2><label>Load an existing year / set<select value={selected?.id || ''} onChange={event => { const paper = data.years.find(p => p.id === event.target.value); if (paper) { setForm(paper.paper ? { ...paper.paper } : { ...empty, year: paper.year, examPaper: paper.examPaper, setNum: paper.setNum }); setPage(0); } }}><option value="">Choose or enter a paper below</option>{data?.years.map(paper => <option key={paper.id} value={paper.id}>{paper.year} · {paper.examPaper}{paper.setNum ? ` · Set ${paper.setNum}` : ''} · {paper.available} available</option>)}</select></label>
      <form onSubmit={savePaper}><div className={styles.formRow}><label>Year<input required type="number" min="1983" max="2099" value={form.year} onChange={e => change('year', e.target.value)} /></label><label>Paper<select value={form.examPaper} onChange={e => change('examPaper', e.target.value)}><option>CS</option><option>IT</option></select></label><label>Set / session<input maxLength={16} value={form.setNum} onChange={e => change('setNum', e.target.value)} placeholder="Blank for single paper" /></label></div>
        <div className={styles.formRow}><label>Official question count<input required type="number" min="1" max="250" value={form.questionCount} onChange={e => change('questionCount', e.target.value)} /></label><label>Official total marks<input required type="number" min="1" max="1000" value={form.totalMarks} onChange={e => change('totalMarks', e.target.value)} /></label></div>
        <div className={styles.formRow}><label>Duration (minutes)<input required type="number" min="1" max="360" value={form.durationMinutes} onChange={e => change('durationMinutes', e.target.value)} /></label><label>Wrong MCQ penalty fraction<input required type="number" step="any" min="0" max="1" value={form.negativeFraction} onChange={e => change('negativeFraction', e.target.value)} /></label></div>
        <label>Official paper / answer key URL<input type="url" value={form.sourceUrl} onChange={e => change('sourceUrl', e.target.value)} maxLength={2000} placeholder="https://…" /></label>
        <label className={styles.check}><input type="checkbox" checked={form.verified} onChange={e => change('verified', e.target.checked)} />I checked the paper, its original numbering, marks and marking rules against the official source.</label>
        <p className={styles.legend}>Older papers can have different counts and marks. Counts are never guessed from chapter or book numbering. Linked-answer or subjective historical questions may require manual review; the automatic MCQ penalty here is uniform.</p>
        <button className={styles.primary} disabled={busy || !data}>Save paper definition</button>
      </form></section><aside className={styles.panel}><h2>Coverage · {form.examPaper} {form.year}{form.setNum ? ` Set ${form.setNum}` : ''}</h2>
        {selected?.coverage ? <><h3>{selected.coverage.mapped} / {selected.coverage.expected} positions mapped</h3><p className={styles.coverageNumbers}><strong>Missing original questions:</strong> {selected.coverage.missing.join(', ') || 'None'}</p><p>Duplicate positions: {selected.coverage.duplicates.map(value => `Q${value.number}`).join(', ') || 'None'}</p><p>Unassigned questions: {selected.coverage.unassigned.length}</p><p>Out-of-range mappings: {selected.coverage.outOfRange.length}</p><p>Marks: {selected.coverage.marks} / {selected.coverage.expectedMarks}</p><p>Mapped questions without stored answers: {selected.coverage.missingAnswers}</p><strong>{selected.coverage.ready ? 'Ready as a verified original paper' : 'Incomplete / review required'}</strong></> : <p>Save the official question count and total marks to identify exact missing positions. {selected?.available || 0} questions currently match this year, paper and set.</p>}
        <hr /><p>Imported book question numbers are kept separately. Map only the numbers printed in the original GATE paper.</p><button disabled={busy} onClick={() => refresh().catch(error => setError(error.message))}>Refresh inventory</button>
      </aside></div>
    <section className={styles.panel} style={{ marginTop: 24 }}><h2>Map questions to this paper</h2><div className={styles.formRow}><label>Find a question<input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Question text or ID" /></label><label>Subject<select value={subject} onChange={e => { setSubject(e.target.value); setPage(0); }}><option value="">All subjects</option>{data?.subjects.map(value => <option key={value.subject}>{value.subject}</option>)}</select></label></div>
      <label className={styles.check}><input type="checkbox" checked={all} onChange={e => { setAll(e.target.checked); setPage(0); }} />Search the entire bank to move a question into this year / paper / set</label><p>{records.length} matching questions. A blank original number removes the position mapping.</p>
      <div className={styles.recordList}>{records.slice(page * 25, (page + 1) * 25).map(record => <MappingRow key={`${record.key}-${record.chapterUpdatedAt}-${identity}`} record={record} paper={form} disabled={busy} onSave={map} />)}</div>
      <div className={styles.pagination}><button disabled={!page || busy} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page + 1} / {Math.max(1, Math.ceil(records.length / 25))}</span><button disabled={(page + 1) * 25 >= records.length || busy} onClick={() => setPage(page + 1)}>Next</button></div>
    </section>
  </section>;
}
