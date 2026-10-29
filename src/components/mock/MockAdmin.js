'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { paperKey } from '@/lib/gatemock.mjs';
import { answerDraft, adminAnswerStatus, validateAdminAnswer, validateAdminLinks } from '@/lib/mock-admin.mjs';
import { storedAnswerText } from '@/lib/question-answers.mjs';
import { safeGateOverflowUrl, safeSolutionUrl } from '@/lib/solution-links.mjs';
import MockQuestion, { MockOption } from './MockQuestion';
import MockPaperAdmin from './MockPaperAdmin';
import QuestionSolutionLinks from './QuestionSolutionLinks';
import base from './GatePractice.module.css';
import styles from './MockAdmin.module.css';

const statusNames = { saved: 'Answer saved', missing: 'Answer missing', review: 'Needs review' };
const statusStyles = { saved: base.correct, missing: base.unanswered, review: base.ungraded };
async function request(method = 'GET', body, paperSlug) {
  const response = await fetch(`/api/gatemock/admin${method === 'GET' && paperSlug ? `?paper=${encodeURIComponent(paperSlug)}` : ''}`, { method, cache: 'no-store', headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Admin request failed.');
  return data;
}

function AnswerEditor({ question, draft, setDraft, busy, dirty, error, notice, onSave, onSaveLinks, onReset, onPrevious, onNext, position, total }) {
  const choice = ['MCQ', 'MSQ'].includes(draft.questionType);
  const change = (field, value) => setDraft({ ...draft, [field]: value });
  const discussion = safeGateOverflowUrl(draft.gateOverflowUrl);
  const video = safeSolutionUrl(draft.solutionUrl);
  function toggle(letter) {
    change('correctOptions', draft.questionType === 'MCQ' ? [letter]
      : draft.correctOptions.includes(letter) ? draft.correctOptions.filter(value => value !== letter) : [...draft.correctOptions, letter].sort());
  }
  return <>
    <header className={base.reviewHeading}><div><strong>Question {question.paperQuestionNumber || position + 1}</strong><span>{draft.questionType} · {question.marks} {Number(question.marks) === 1 ? 'mark' : 'marks'}</span></div><span className={`${base.statusLabel} ${dirty ? styles.unsaved : statusStyles[adminAnswerStatus(question)]}`}>{dirty ? 'Unsaved changes' : statusNames[adminAnswerStatus(question)]}</span></header>
    <form onSubmit={event => { event.preventDefault(); onSave(false); }} aria-label="Edit correct answer">
      <fieldset className={styles.editorFields} disabled={busy}>
        <div className={base.reviewQuestionBody}>
          <p className={base.questionOrigin}>{question.subject?.replace(/^\d+\.\s*/, '')} · {question.sectionName || question.chapter}{question.paperQuestionNumber ? ` · Original paper Q${question.paperQuestionNumber}` : ''}<span className={styles.storageTag}>{question.datasetId ? 'Year paper' : 'Question bank'}</span></p>
          <MockQuestion key={question.key} question={question} />
          {(discussion || video) && <nav className={styles.questionLinks} aria-label="Question solution shortcuts">{discussion && <a href={discussion} target="_blank" rel="noreferrer">GATE Overflow ↗</a>}{video && <a href={video} target="_blank" rel="noreferrer">Video solution ↗</a>}</nav>}
          <div className={styles.answerToolbar}><div><h2>Set the correct answer</h2><p>{choice ? draft.questionType === 'MSQ' ? 'Tick every correct option. The complete selection is used for grading.' : 'Tick the one correct option.' : draft.questionType === 'NAT' ? 'Enter the exact value or an accepted range, including both endpoints.' : 'Written questions are kept for manual review.'}</p></div><label>Question type<select aria-label="Question type" value={draft.questionType} onChange={event => setDraft({ ...draft, questionType: event.target.value, correctOptions: event.target.value === 'MCQ' ? draft.correctOptions.slice(0, 1) : event.target.value === 'MSQ' ? draft.correctOptions : [] })}>{['MCQ', 'MSQ', 'NAT', 'SUBJECTIVE'].map(type => <option key={type}>{type}</option>)}</select></label></div>
          {choice && <MockQuestion key={`${question.key}-options-${draft.questionType}`} question={{ ...question, key: `${question.key}-options-${draft.questionType}`, text: '', code: '', diagram: '' }}><fieldset className={styles.options}><legend>{draft.questionType === 'MSQ' ? 'Correct options (select all that apply)' : 'Correct option (select one)'}</legend>{['A', 'B', 'C', 'D'].filter(letter => question[`opt${letter}`]?.trim()).map(letter => <label key={letter} className={`${styles.option} ${draft.correctOptions.includes(letter) ? styles.checkedOption : ''}`}><input type={draft.questionType === 'MCQ' ? 'radio' : 'checkbox'} name="correct-option" aria-label={`Option ${letter}`} checked={draft.correctOptions.includes(letter)} onChange={() => toggle(letter)} /><b>({letter})</b><MockOption question={question} text={question[`opt${letter}`]} />{draft.correctOptions.includes(letter) && <small>✓ Correct</small>}</label>)}{!['A', 'B', 'C', 'D'].some(letter => question[`opt${letter}`]?.trim()) && <p className={base.notice}>This question has no options. Choose NAT, or add options in the question editor.</p>}</fieldset></MockQuestion>}
          {draft.questionType === 'NAT' && <div className={styles.natEditor}><label>Answer format<select aria-label="NAT answer format" value={draft.natMode} onChange={e => change('natMode', e.target.value)}><option value="exact">Exact answer</option><option value="range">Accepted range</option></select></label>{draft.natMode === 'exact' ? <label>Correct numeric answer<input aria-label="Correct numeric answer" type="number" step="any" required value={draft.natAnswer} onChange={e => change('natAnswer', e.target.value)} placeholder="e.g. 12.5" /></label> : <><label>Minimum (inclusive)<input aria-label="Minimum accepted answer" type="number" step="any" required value={draft.natMin} onChange={e => change('natMin', e.target.value)} placeholder="e.g. 12.4" /></label><label>Maximum (inclusive)<input aria-label="Maximum accepted answer" type="number" step="any" required value={draft.natMax} onChange={e => change('natMax', e.target.value)} placeholder="e.g. 12.6" /></label></>}</div>}
          <div className={styles.savedAnswer}><span>Currently saved answer</span><strong>{storedAnswerText(question) || 'No answer saved'}</strong><small>Changes apply to new tests after saving.</small></div>
          <label className={styles.reviewCheck}><input type="checkbox" checked={draft.manualReview || draft.questionType === 'SUBJECTIVE'} disabled={draft.questionType === 'SUBJECTIVE'} onChange={e => change('manualReview', e.target.checked)} /><span>Keep this question in manual review<small>Uncheck after resolving a disputed key to enable automatic grading.</small></span></label>
          {error && <p className={base.error} role="alert">{error}</p>}{notice && <p className={styles.success} role="status">{notice}</p>}
          <div className={styles.saveBar}><button className={base.primary} type="submit" disabled={!dirty}>{busy && dirty ? 'Saving…' : 'Save answer'}</button><button type="button" disabled={!dirty} onClick={() => onSave(true)}>Save &amp; next →</button><button type="button" disabled={!dirty} onClick={onReset}>Reset changes</button></div>
        </div>
        <QuestionSolutionLinks question={question} draft={draft} onChange={change} onSave={onSaveLinks} busy={busy} />
      </fieldset>
    </form>
    <footer className={base.reviewActions}><button disabled={busy || position <= 0} onClick={onPrevious}>← Previous</button><span>{position + 1} of {total}</span><button disabled={busy || position >= total - 1} onClick={onNext}>Next question →</button></footer>
  </>;
}

export default function MockAdmin({ paperSlug = '' }) {
  const [data, setData] = useState(null), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false);
  const [paper, setPaper] = useState(''), [filter, setFilter] = useState('all'), [search, setSearch] = useState(''), [selectedKey, setSelectedKey] = useState('');
  const [drafts, setDrafts] = useState({}), [tab, setTab] = useState('answers');
  const editor = useRef(null);
  useEffect(() => { let active = true; request('GET', undefined, paperSlug).then(result => { if (active) { setData(result); setPaper(result.years.find(p => p.paper?.datasetId)?.id || result.years[0]?.id || 'all'); } }).catch(error => { if (active) setError(error.message); }); return () => { active = false; }; }, [paperSlug]);
  const paperInfo = data?.years.find(value => value.id === paper);
  const paperRecords = (data?.records || []).filter(q => paper === 'all' || (paperKey(q) === paper && (paperInfo?.paper?.datasetId ? q.datasetId === paperInfo.paper.datasetId : !q.datasetId)));
  const records = paperRecords.filter(q => (filter === 'all' || adminAnswerStatus(q) === filter) && (!search || `${q.text} ${q.paperQuestionNumber || ''} ${q.questionId} ${q.subject}`.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => Number(a.year) - Number(b.year) || (Number(a.paperQuestionNumber) || 9999) - (Number(b.paperQuestionNumber) || 9999) || a.key.localeCompare(b.key));
  const question = records.find(q => q.key === selectedKey) || records[0];
  const position = records.indexOf(question);
  const draft = question && (drafts[question.key] || answerDraft(question));
  const dirty = question && JSON.stringify(draft) !== JSON.stringify(answerDraft(question));
  const pending = Object.keys(drafts).filter(key => { const record = data?.records.find(q => q.key === key); return record && JSON.stringify(drafts[key]) !== JSON.stringify(answerDraft(record)); }).length;
  useEffect(() => {
    if (!pending) return;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [pending]);
  function select(key) { setSelectedKey(key); setError(''); setNotice(''); if (window.innerWidth < 900) editor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  async function save(next, linksOnly = false) {
    const current = question, nextKey = records[position + 1]?.key;
    setError(''); setNotice('');
    try {
      if (linksOnly) validateAdminLinks(draft); else validateAdminAnswer(draft, current);
      setBusy(true);
      const result = await request('PUT', { ...draft, ...(linksOnly ? { action: 'links' } : {}), key: current.key, chapterId: current.chapterId, datasetId: current.datasetId, questionId: current.questionId, expectedUpdatedAt: current.updatedAt });
      const saved = { ...current, ...result.answer };
      setData(previous => ({ ...previous, records: previous.records.map(record => {
        const sameCollection = current.datasetId ? record.datasetId === current.datasetId : record.chapterId === current.chapterId;
        return { ...record, ...(record.key === current.key ? result.answer : {}), ...(sameCollection ? { updatedAt: result.updatedAt, ...(!current.datasetId ? { chapterUpdatedAt: result.updatedAt } : {}) } : {}) };
      }) }));
      setDrafts(previous => ({ ...previous, [current.key]: linksOnly ? { ...(previous[current.key] || draft), gateOverflowUrl: saved.gateOverflowUrl || '', solutionUrl: saved.solutionUrl || '' } : answerDraft(saved) }));
      setNotice(`Question ${current.paperQuestionNumber || position + 1}: ${linksOnly ? 'solution links' : 'answer'} saved.`);
      if (next && nextKey) select(nextKey);
    } catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  async function refresh() {
    setBusy(true); setError('');
    try { setData(await request('GET', undefined, paperSlug)); setNotice('Inventory refreshed. Unsaved drafts are preserved.'); } catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  return <main className={`${base.page} ${styles.page}`}>
    <header className={base.header}><Link href="/gatemock" className={base.brand}><span className={base.seal} aria-hidden="true">G4</span><span>G4Gate<small>{paperSlug ? 'PREVIOUS-YEAR PAPER REVIEW' : 'QUESTION REVIEW ADMIN'}</small></span></Link><nav className={styles.headerLinks}><Link href="/gatemock/admin/papers">Previous-year papers</Link><Link href="/gatemock">Test centre</Link><Link href="/">Question editor ↗</Link></nav></header>
    <div className={base.strip}><span>ADMIN · Answer keys &amp; paper management</span><span>Review · Tick the correct answer · Save</span></div>
    <div className={styles.content}>
      <section className={styles.intro}><div><p className={base.eyebrow}>{paperSlug ? 'PREVIOUS-YEAR PAPER ADMIN' : 'ADMIN WORKSPACE'}</p><h1>{paperSlug ? paperInfo?.paper?.title || 'Previous-year paper review' : 'Review questions & save answers'}</h1><p>{paperSlug ? 'Original question order · Answer keys · GATE Overflow links · Video solutions' : 'Check the reference, select the correct options or enter a numeric answer, and save.'}</p></div><button disabled={busy || !data} onClick={refresh}>↻ Refresh inventory</button></section>
      {!paperSlug && <Link href="/gatemock/admin/papers" className={styles.paperLibraryLink}><strong>Previous-year papers →</strong><span>Manage complete GATE CS / IT papers by year and session. Open each paper to edit its answers and solutions.</span></Link>}
      <div className={styles.tabs} role="tablist" aria-label="Admin workspace"><button id="answers-tab" role="tab" aria-selected={tab === 'answers'} aria-controls="answers-panel" onClick={() => setTab('answers')}>Question review &amp; solutions</button>{!paperSlug && <button id="coverage-tab" role="tab" aria-selected={tab === 'coverage'} aria-controls="coverage-panel" onClick={() => setTab('coverage')}>Paper coverage &amp; mapping</button>}{pending > 0 && <span role="status">{pending} unsaved {pending === 1 ? 'draft' : 'drafts'} · kept while you switch questions</span>}</div>
      {tab === 'coverage' ? <section id="coverage-panel" role="tabpanel" aria-labelledby="coverage-tab"><MockPaperAdmin /></section> : <section id="answers-panel" role="tabpanel" aria-labelledby="answers-tab">
        {(!question || !data) && error && <p className={base.error} role="alert">{error} {error.includes('Authentication') && <Link href="/login">Sign in</Link>}</p>}
        {!data ? <div className={styles.loading} role="status">{error ? 'Inventory could not load.' : 'Loading question inventory…'}</div> : <>
          <section className={styles.filters} aria-label="Question filters">{paperSlug ? <div className={styles.paperContext}><strong>{data.records.length} questions · {paperInfo?.paper?.totalMarks} marks</strong><span>GATE {paperInfo?.examPaper} {paperInfo?.year}{paperInfo?.setNum ? ` · Set ${paperInfo.setNum}` : ''}</span><Link href="/gatemock/admin/papers">← All previous-year papers</Link></div> : <label>Year / paper / set<select aria-label="Year / paper / set" value={paper} disabled={busy} onChange={e => { setPaper(e.target.value); select(''); }}><option value="all">All questions · year papers &amp; question bank</option>{data.years.map(value => <option key={value.id} value={value.id}>GATE {value.examPaper} {value.year}{value.setNum ? ` · Set ${value.setNum}` : ''} · {value.available} questions{value.paper?.datasetId ? ' · Year paper' : ''}</option>)}</select></label>}<label>Find a question<input type="search" value={search} disabled={busy} onChange={e => { setSearch(e.target.value); select(''); }} placeholder="Question text, original number or ID" /></label></section>
          <div className={base.reviewGrid}>
            <aside className={`${base.panel} ${base.reviewNav}`} aria-label="Admin question navigation"><div className={base.blueHeading}>QUESTION REVIEW</div><div className={base.reviewNavBody}><label>Show questions<select value={filter} disabled={busy} onChange={e => { setFilter(e.target.value); select(''); }}><option value="all">All questions ({paperRecords.length})</option>{Object.entries(statusNames).map(([value, name]) => <option key={value} value={value}>{name} ({paperRecords.filter(q => adminAnswerStatus(q) === value).length})</option>)}</select></label><p className={base.muted}>{records.length} questions in this view</p><div className={base.reviewPalette}>{records.map((record, index) => <button key={record.key} disabled={busy} className={`${statusStyles[adminAnswerStatus(record)]} ${drafts[record.key] && JSON.stringify(drafts[record.key]) !== JSON.stringify(answerDraft(record)) ? styles.draftQuestion : ''}`} aria-current={record === question ? 'step' : undefined} aria-label={`Review question ${record.paperQuestionNumber || index + 1}, ${statusNames[adminAnswerStatus(record)]}`} onClick={() => select(record.key)}>{record.paperQuestionNumber || index + 1}</button>)}</div><div className={base.reviewLegend}>{Object.entries(statusNames).map(([value, name]) => <span key={value}><i className={statusStyles[value]} />{name}</span>)}<span><i className={styles.unsaved} />Unsaved draft</span></div><p className={styles.navHint}>MCQ: one tick<br />MSQ: multiple ticks<br />NAT: exact value or range</p></div></aside>
            <section ref={editor} className={`${base.panel} ${base.reviewQuestion}`} aria-label="Admin question review">{question ? <AnswerEditor question={question} draft={draft} setDraft={value => { setDrafts(previous => ({ ...previous, [question.key]: value })); setError(''); setNotice(''); }} busy={busy} dirty={dirty} error={error} notice={notice} onSave={save} onSaveLinks={() => save(false, true)} onReset={() => { setDrafts(previous => ({ ...previous, [question.key]: answerDraft(question) })); setError(''); setNotice(''); }} position={position} total={records.length} onPrevious={() => select(records[position - 1].key)} onNext={() => select(records[position + 1].key)} /> : <div className={base.empty}><h2>No matching questions</h2><p>Choose a different paper or filter.</p><button onClick={() => { setFilter('all'); setSearch(''); }}>Clear filters</button></div>}</section>
          </div>
        </>}
      </section>}
    </div>
  </main>;
}
