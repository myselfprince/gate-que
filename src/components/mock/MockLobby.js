'use client';
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_MOCK_BLUEPRINT } from '@/lib/gatemock.mjs';
import MockLayout from './MockLayout';
import styles from './GatePractice.module.css';

const title = paper => `GATE ${paper.examPaper} ${paper.year}${paper.setNum ? ` · Set ${paper.setNum}` : ''}`;
const preferredPaper = papers => papers.find(p => p.coverage?.ready) || papers[0];

export default function MockLobby({ catalog, requestedPaper, busy, error, onStart }) {
  const requested = catalog.years.find(p => p.paper?.slug === requestedPaper);
  const initial = requested || catalog.years.find(p => p.examPaper === 'CS' && p.coverage?.ready);
  const [examPaper, setExamPaper] = useState(initial?.examPaper || 'CS');
  const [paperId, setPaperId] = useState(initial?.id || '');
  const [year, setYear] = useState(''), [availability, setAvailability] = useState(requested && !requested.coverage?.ready ? 'all' : 'complete');
  const [mode, setMode] = useState('year'), [subject, setSubject] = useState(catalog.subjects[0]?.subject || ''), [chapter, setChapter] = useState('');
  const [count, setCount] = useState(20), [duration, setDuration] = useState(30), [allowPartial, setAllowPartial] = useState(false);
  const [blueprint, setBlueprint] = useState(DEFAULT_MOCK_BLUEPRINT), [instructions, setInstructions] = useState(false), [accepted, setAccepted] = useState(false);
  const dialog = useRef(null), selection = useRef(null);
  const papers = catalog.years.filter(p => p.examPaper === examPaper);
  const visible = papers.filter(p => (!year || p.year === year) && (availability !== 'complete' || p.coverage?.ready));
  const chosen = papers.find(p => p.id === paperId);
  const complete = papers.filter(p => p.coverage?.ready).length;
  const topics = catalog.subjects.find(s => s.subject === subject)?.topics || [];
  const one = blueprint.reduce((n, row) => n + row.one, 0), two = blueprint.reduce((n, row) => n + row.two, 0);
  const canStart = mode === 'year' ? chosen && (chosen.coverage?.ready || (allowPartial && chosen.available > 0)) : Boolean(subject && (mode !== 'topic' || chapter));
  const config = { mode, examPaper, subject, chapter, count, durationMinutes: mode === 'year' ? chosen?.paper?.durationMinutes || 180 : mode === 'full' ? 180 : duration,
    blueprint, year: chosen?.year, setNum: chosen?.setNum || '', allowPartial };
  useEffect(() => {
    if (instructions && !dialog.current?.open) dialog.current?.showModal();
    else if (!instructions && dialog.current?.open) dialog.current.close();
  }, [instructions]);
  function choose(paper) {
    setPaperId(paper.id); setMode('year'); setAllowPartial(false);
    if (window.innerWidth < 900) selection.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function changeView(nextPaper, nextYear, nextAvailability) {
    setExamPaper(nextPaper); setYear(nextYear); setAvailability(nextAvailability); setMode('year'); setAllowPartial(false);
    const matching = catalog.years.filter(p => p.examPaper === nextPaper && (!nextYear || p.year === nextYear) && (nextAvailability !== 'complete' || p.coverage?.ready));
    setPaperId(preferredPaper(matching)?.id || '');
  }
  function openInstructions() { setAccepted(false); setInstructions(true); }
  return <MockLayout>
    <section className={styles.intro}><p className={styles.eyebrow}>PREVIOUS-YEAR FULL-LENGTH TESTS</p><h1>Your GATE paper. The exam experience.</h1><p>Choose a complete previous-year paper, attempt it against the clock, and learn from every answer.</p>
      <div className={styles.steps}><span><b>1</b> Choose your paper</span><span><b>2</b> Attempt in GATE format</span><span><b>3</b> Review answers &amp; solutions</span></div>
    </section>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <div className={styles.lobbyGrid}>
      <section className={styles.panel} aria-labelledby="papers-title">
        <div className={styles.panelHeading}><div><h2 id="papers-title">Previous-year papers</h2><p>Original order. Complete paper. Timed practice.</p></div><span className={styles.readyBadge}>{complete} complete</span></div>
        <div className={styles.filters}>
          <label>Paper<select value={examPaper} onChange={e => changeView(e.target.value, '', availability)}><option value="CS">GATE CS</option><option value="IT">GATE IT · historical</option></select></label>
          <label>Year<select value={year} onChange={e => changeView(examPaper, e.target.value, availability)}><option value="">All years</option>{[...new Set(papers.map(p => p.year))].map(value => <option key={value}>{value}</option>)}</select></label>
          <label>Availability<select value={availability} onChange={e => changeView(examPaper, year, e.target.value)}><option value="complete">Complete papers</option><option value="all">All papers</option></select></label>
        </div>
        <div className={styles.listLabel}><span>{visible.length} {visible.length === 1 ? 'paper' : 'papers'}</span><span>Select a paper to view test details</span></div>
        <div className={styles.paperList} aria-label="Previous-year papers">
          {visible.map(paper => <button key={paper.id} aria-pressed={paperId === paper.id && mode === 'year'} onClick={() => choose(paper)} className={`${styles.paperRow} ${paperId === paper.id && mode === 'year' ? styles.selectedPaper : ''}`}>
            <span className={styles.yearBlock}>{paper.year}<small>{paper.examPaper}</small></span>
            <span className={styles.paperInfo}><strong>{title(paper)}</strong><span>{paper.coverage?.ready ? `${paper.paper.questionCount} questions · ${paper.paper.totalMarks} marks · ${paper.paper.durationMinutes} min` : `${paper.available} questions available · Partial practice`}</span><small>{paper.coverage?.ready ? 'Complete paper · Original question order' : 'Full paper verification pending'}</small></span>
            <span className={styles.rowEnd}><span className={paper.coverage?.ready ? styles.readyBadge : styles.pendingBadge}>{paper.coverage?.ready ? 'Ready to attempt' : 'Incomplete'}</span><span aria-hidden="true">{paperId === paper.id && mode === 'year' ? 'Selected ✓' : 'View test →'}</span></span>
          </button>)}
          {!visible.length && <div className={styles.empty}><strong>{availability === 'complete' ? 'No complete papers in this selection yet.' : 'No papers found.'}</strong><p>Try another year or explore the available questions.</p><button onClick={() => changeView(examPaper, '', 'all')}>Show all papers</button></div>}
        </div>
        <p className={styles.listNote}>Only papers with verified order, question counts and marks appear as complete. Older papers retain their original pattern.</p>
      </section>
      <aside ref={selection} className={`${styles.panel} ${styles.testDetails}`} aria-label="Selected test details">
        <div className={styles.blueHeading}>YOUR SELECTED TEST</div>
        {mode === 'year' && chosen ? <div className={styles.detailsBody}>
          <span className={chosen.coverage?.ready ? styles.readyBadge : styles.pendingBadge}>{chosen.coverage?.ready ? 'Complete previous-year paper' : 'Available-question practice'}</span>
          <h2>{title(chosen)}</h2><p>{examPaper === 'CS' ? 'Computer Science and Information Technology' : 'Information Technology'}</p>
          <div className={styles.testFacts}><div><strong>{chosen.coverage?.ready ? chosen.paper.questionCount : chosen.available}</strong><span>Questions</span></div><div><strong>{chosen.coverage?.ready ? chosen.paper.totalMarks : chosen.coverage?.marks ?? '—'}</strong><span>Marks</span></div><div><strong>{chosen.paper?.durationMinutes || 180}<small> min</small></strong><span>Duration</span></div></div>
          <ul className={styles.featureList}><li>GATE-style question palette &amp; timer</li><li>Scientific calculator &amp; review markers</li><li>Automatic saving in this browser</li><li>Answers &amp; solutions after submission</li></ul>
          {!chosen.coverage?.ready && <div className={styles.notice}><strong>This is not a full-length paper yet.</strong><p>{chosen.coverage ? `${chosen.coverage.mapped} of ${chosen.coverage.expected} original positions mapped. ` : ''}Use the available questions for practice.</p><label className={styles.check}><input type="checkbox" checked={allowPartial} onChange={e => setAllowPartial(e.target.checked)} />I want to practise the available questions</label></div>}
          <button className={styles.primary} disabled={busy || !canStart} onClick={openInstructions}>Read instructions &amp; continue →</button><small className={styles.helper}>The timer starts only when you begin the test.</small>
          {chosen.paper?.datasetId && chosen.paper?.slug && <details className={styles.downloads}><summary>Download paper &amp; solutions</summary><a href={`/api/gatemock/papers/${chosen.paper.slug}/export?format=pdf&theme=light`}>Question paper · Print PDF ↗</a><a href={`/api/gatemock/papers/${chosen.paper.slug}/export?format=pdf&theme=dark`}>Question paper · Dark PDF ↗</a><a href={`/api/gatemock/papers/${chosen.paper.slug}/export?format=key`}>Answers &amp; solutions PDF ↗</a><a href={`/api/gatemock/papers/${chosen.paper.slug}/export?format=zip`}>Paper + solutions ZIP ↗</a></details>}
        </div> : <div className={styles.detailsBody}><h2>{mode === 'year' ? 'Choose a paper' : 'Custom practice'}</h2><p>{mode === 'year' ? 'Select a previous-year paper from the list to see its format and instructions.' : 'Set your practice options below, then read the instructions before you begin.'}</p></div>}
      </aside>
    </div>
    <details className={`${styles.panel} ${styles.otherPractice}`}><summary>Need focused practice? <span>Subject tests, topics &amp; custom mocks</span></summary>
      <div className={styles.practiceBody}>
        <div className={styles.segmented} aria-label="Practice type">{[['year', 'Previous-year paper'], ['subject', 'Subject test'], ['topic', 'Topic test'], ['full', 'Custom mock']].map(([value, label]) => <button key={value} aria-pressed={mode === value} onClick={() => { setMode(value); setAllowPartial(false); }}>{label}</button>)}</div>
        {mode !== 'year' && <><p className={styles.muted}>Custom practice uses the question bank. For an original full-length exam, select a previous-year paper above.</p>
          {mode !== 'full' ? <div className={styles.practiceFields}><label>Subject<select value={subject} onChange={e => { setSubject(e.target.value); setChapter(''); }}>{catalog.subjects.map(item => <option key={item.subject} value={item.subject}>{item.subject}</option>)}</select></label>{mode === 'topic' && <label>Topic<select value={chapter} onChange={e => setChapter(e.target.value)}><option value="">Choose a topic</option>{topics.map(topic => <option key={topic}>{topic}</option>)}</select></label>}<label>Questions<input type="number" min="1" max="250" value={count} onChange={e => setCount(Number(e.target.value))} /></label><label>Minutes<input type="number" min="1" max="360" value={duration} onChange={e => setDuration(Number(e.target.value))} /></label></div>
            : <><p>Editable subject weights · {one + two} questions · {one + 2 * two} marks · 180 minutes</p><div className={styles.tableScroll}><table><thead><tr><th>Subject</th><th>1-mark questions</th><th>2-mark questions</th></tr></thead><tbody>{blueprint.map((row, index) => <tr key={row.subject}><td>{row.subject}</td>{['one', 'two'].map(key => <td key={key}><input aria-label={`${row.subject} ${key}-mark quota`} type="number" min="0" max="100" value={row[key]} onChange={e => setBlueprint(values => values.map((item, i) => index === i ? { ...item, [key]: Number(e.target.value) } : item))} /></td>)}</tr>)}</tbody></table></div></>}
          <label className={styles.check}><input type="checkbox" checked={allowPartial} onChange={e => setAllowPartial(e.target.checked)} />Allow a smaller test if there are not enough questions</label><button className={styles.primary} disabled={busy || !canStart} onClick={openInstructions}>Read practice instructions →</button>
        </>}
      </div>
    </details>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="start-title" onCancel={() => setInstructions(false)}>
      <header><div><small>BEFORE YOU BEGIN</small><h2 id="start-title">{mode === 'year' && chosen ? title(chosen) : 'Custom GATE practice'}</h2></div><button aria-label="Close instructions" onClick={() => setInstructions(false)}>×</button></header>
      <div className={styles.dialogBody}><p><strong>{config.durationMinutes} minutes</strong> · {mode === 'year' && chosen?.coverage?.ready ? 'Original full paper' : 'Practice test'}</p>
        <ol><li>The countdown begins when you click <strong>Begin test</strong>. Your test submits automatically when time runs out.</li><li>Use the question palette and section tabs to navigate. <strong>Save &amp; Next</strong> moves on; <strong>Mark for Review &amp; Next</strong> flags a question to revisit.</li><li>MCQ: choose one answer. MSQ: choose all correct answers. NAT: enter a numerical value. Older papers may include written answers or section choices.</li><li>A wrong MCQ loses {((mode === 'year' ? chosen?.paper?.negativeFraction ?? 1 / 3 : 1 / 3) * 100).toFixed(2)}% of its marks. MSQ and NAT have no negative marking. Check the question header for marks.</li><li>Your progress saves automatically. Refresh this browser to resume. Answers marked for review are also evaluated.</li><li>Submit to see your responses, answer keys and available explanations. Missing or disputed keys are kept separate for self-assessment.</li></ol>
        {mode === 'year' && chosen?.paper?.instructions?.map(text => <p className={styles.notice} key={text}>{text}</p>)}
        <label className={styles.check}><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} />I have read the instructions and am ready to begin.</label>
        {error && <p className={styles.error} role="alert">{error}</p>}
      </div><footer><button onClick={() => setInstructions(false)}>Back to papers</button><button className={styles.primary} disabled={!accepted || busy || !canStart} onClick={() => onStart(config)}>{busy ? 'Preparing test…' : 'Begin test →'}</button></footer>
    </dialog>
  </MockLayout>;
}
