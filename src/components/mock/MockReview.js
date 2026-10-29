'use client';
import { useRef, useState } from 'react';
import { safeSolutionUrl, safeGateOverflowUrl, solutionEmbedUrl } from '@/lib/solution-links.mjs';
import { examSections } from '@/lib/gate-exam-screen.mjs';
import MockQuestion, { MockOption } from './MockQuestion';
import MockLayout from './MockLayout';
import styles from './GatePractice.module.css';

const labels = { correct: 'Correct', wrong: 'Incorrect', unanswered: 'Unanswered', ungraded: 'Needs review', 'self-assessed': 'Self-assessed' };
const hasResponse = value => Array.isArray(value) ? value.length > 0 : Boolean(value);
const responseText = value => Array.isArray(value) ? value.map(letter => `(${letter})`).join(', ') || 'Not answered' : value || 'Not answered';

function Solution({ entry, busy, onAssess, manualScores }) {
  const [tab, setTab] = useState('written'), [playing, setPlaying] = useState(false);
  const video = safeSolutionUrl(entry.solutionUrl), discussion = safeGateOverflowUrl(entry.gateOverflowUrl);
  return <section className={styles.solution} aria-label="Answer explanation">
    <div className={styles.solutionTabs} role="tablist" aria-label="Solution format"><button id="written-tab" role="tab" aria-selected={tab === 'written'} aria-controls="written-solution" onClick={() => setTab('written')}>Written solution</button><button id="video-tab" role="tab" aria-selected={tab === 'video'} aria-controls="video-solution" onClick={() => setTab('video')}>Video solution <span>{video ? 'Available' : 'Not added'}</span></button></div>
    {tab === 'written' ? <div id="written-solution" role="tabpanel" aria-labelledby="written-tab" className={styles.solutionBody}>
      {entry.referenceAnswer ? <><h3>Solution explained</h3><MockQuestion question={{ ...entry.question, key: `${entry.question.key}-reference`, text: entry.referenceAnswer, code: '', diagram: '' }} />{entry.verificationStatus && <details className={styles.sourceNotes}><summary>Answer verification &amp; sources</summary><p>{entry.verificationStatus}. {entry.sourceIssues?.join(' ')}</p>{entry.answerSources?.filter(s => s.kind === 'made-easy-key').map(s => <p key={s.file}>Made Easy comparison: {s.file.split('/').at(-1)}, PDF page {s.pdfPage}, item {s.question}, printed key {s.printed}.</p>)}</details>}</> : <div className={styles.emptySolution}><strong>{discussion ? 'A discussion is available for this question.' : 'A written explanation has not been added yet.'}</strong><p>{discussion ? 'Open the linked GATE Overflow discussion to read the available explanation.' : 'Use the answer key above to check your response.'}</p></div>}
      {discussion && <a className={styles.textLink} href={discussion} target="_blank" rel="noreferrer">Read GATE Overflow discussion ↗</a>}
    </div> : <div id="video-solution" role="tabpanel" aria-labelledby="video-tab" className={styles.solutionBody}>
      {video ? <><h3>Video explanation · Q{entry.question.number}</h3>{playing ? <iframe className={styles.video} src={solutionEmbedUrl(video)} title={`Video solution for question ${entry.question.number}`} allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <button className={styles.videoPreview} onClick={() => setPlaying(true)}><span aria-hidden="true">▶</span><strong>Play video solution</strong><small>Load the YouTube player for this question</small></button>}<a className={styles.textLink} href={video} target="_blank" rel="noreferrer">Watch on YouTube ↗</a></> : <div className={styles.emptySolution}><span className={styles.emptyPlay} aria-hidden="true">▷</span><h3>No video solution yet</h3><p>When a video is added for this question, you can watch it here. Check the written solution or available discussion.</p><button onClick={() => setTab('written')}>View written solution</button></div>}
    </div>}
    {entry.manualReview && hasResponse(entry.response) && <form className={styles.assessment} onSubmit={event => { event.preventDefault(); onAssess(entry.question.key, Number(new FormData(event.currentTarget).get('marks'))); }}><div><strong>Self-assessment</strong><p>This question needs manual review. Compare your working with the reference and record your marks.</p></div><label>Your marks (0–{entry.question.marks})<input name="marks" aria-label={`Self-assessed marks Q${entry.question.number}`} type="number" min="0" max={entry.question.marks} step="0.5" required defaultValue={manualScores?.find(s => s.key === entry.question.key)?.marks ?? ''} /></label><button disabled={busy}>Save self-assessment</button><small>Stored separately from automatic grading.</small></form>}
  </section>;
}

export default function MockReview({ attempt, busy, error, onAssess, onNewTest }) {
  const result = attempt.result;
  const numberByKey = new Map(examSections(attempt.questions).flatMap(section => section.indices).map((index, position) => [attempt.questions[index].key, position + 1]));
  const reviewEntries = result.entries.map(entry => ({ ...entry, question: { ...entry.question, number: numberByKey.get(entry.question.key) || entry.question.number } }))
    .sort((a, b) => a.question.number - b.question.number);
  const [filter, setFilter] = useState('all'), [selectedKey, setSelectedKey] = useState(reviewEntries[0]?.question.key);
  const review = useRef(null);
  const entries = reviewEntries.filter(entry => filter === 'all' || entry.status === filter);
  const entry = entries.find(item => item.question.key === selectedKey) || entries[0];
  const position = entries.indexOf(entry);
  function select(key) { setSelectedKey(key); if (window.innerWidth < 900) review.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  return <MockLayout review onHome={onNewTest}>
    <section className={styles.resultIntro}><div><p className={styles.eyebrow}>TEST SUBMITTED</p><h1>Your result &amp; solutions</h1><p>{attempt.title}</p></div><button onClick={onNewTest}>Choose another paper →</button></section>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    <div className={styles.scoreGrid}><div className={styles.scoreCard}><span>Your score</span><strong>{result.score.toFixed(2)} <small>/ {result.gradableMarks}</small></strong><small>On graded questions · Paper maximum {result.totalMarks}</small></div>{[['correct', 'Correct'], ['wrong', 'Incorrect'], ['unanswered', 'Unanswered'], ['ungraded', 'Needs review']].map(([status, label]) => <button key={status} className={styles.statCard} aria-pressed={filter === status} onClick={() => setFilter(filter === status ? 'all' : status)}><strong className={styles[status]}>{result[status]}</strong><span>{label}</span></button>)}</div>
    {Boolean(result.ungraded || result.selfAssessed) && <p className={styles.notice}>Missing or disputed answer keys and written responses need manual review. {result.selfAssessed || 0} responses self-assessed; those marks are included separately in your score.</p>}
    <div className={styles.reviewGrid}>
      <aside className={`${styles.panel} ${styles.reviewNav}`} aria-label="Review question navigation"><div className={styles.blueHeading}>QUESTION REVIEW</div><div className={styles.reviewNavBody}><label>Show questions<select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All questions ({result.entries.length})</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label} ({result.entries.filter(e => e.status === value).length})</option>)}</select></label><p className={styles.muted}>{entries.length} questions in this view</p><div className={styles.reviewPalette}>{entries.map(item => <button key={item.question.key} className={styles[item.status]} aria-current={item === entry ? 'step' : undefined} aria-label={`Review question ${item.question.number}, ${labels[item.status]}`} onClick={() => select(item.question.key)}>{item.question.number}</button>)}</div><div className={styles.reviewLegend}>{Object.entries(labels).filter(([status]) => result.entries.some(e => e.status === status)).map(([status, label]) => <span key={status}><i className={styles[status]} />{label}</span>)}</div></div></aside>
      <section ref={review} className={`${styles.panel} ${styles.reviewQuestion}`} aria-label="Question review">
        {entry ? <><header className={styles.reviewHeading}><div><strong>Question {entry.question.number}</strong><span>{entry.question.questionType} · {entry.question.marks} {Number(entry.question.marks) === 1 ? 'mark' : 'marks'}</span></div><span className={`${styles.statusLabel} ${styles[entry.status]}`}>{labels[entry.status]} · {entry.earned > 0 ? '+' : ''}{entry.earned.toFixed(2)} marks</span></header>
          <div className={styles.reviewQuestionBody}><p className={styles.questionOrigin}>{entry.question.sectionName || entry.question.subject.replace(/^\d+\.\s*/, '')}{entry.question.paperQuestionNumber ? ` · Original paper Q${entry.question.paperQuestionNumber}` : ''}</p><MockQuestion key={entry.question.key} question={entry.question}>{['A', 'B', 'C', 'D'].filter(letter => entry.question[`opt${letter}`]).map(letter => { const selected = Array.isArray(entry.response) && entry.response.includes(letter), correct = !entry.manualReview && entry.answer?.includes(`(${letter})`); return <div key={letter} className={`${styles.reviewOption} ${correct ? styles.correctOption : selected ? styles.selectedOption : ''}`}><b>({letter})</b><MockOption question={entry.question} text={entry.question[`opt${letter}`]} />{(selected || correct) && <small>{correct ? '✓ Correct' : ''}{selected ? `${correct ? ' · ' : ''}Your choice` : ''}</small>}</div>; })}</MockQuestion>
          <div className={styles.answerComparison}><div><span>Your answer</span><strong>{responseText(entry.response)}</strong></div><div><span>{entry.manualReview ? 'Reference answer · Check solution' : 'Correct answer'}</span><strong>{entry.answer || 'Answer key not available'}</strong></div></div>
          {entry.manualReview && <p className={styles.notice}>This item requires manual review. It is not counted as an automatically correct or incorrect answer.</p>}
          </div><Solution key={entry.question.key} entry={entry} busy={busy} onAssess={onAssess} manualScores={result.manualScores} />
          <footer className={styles.reviewActions}><button disabled={position <= 0} onClick={() => select(entries[position - 1].question.key)}>← Previous</button><span>{position + 1} of {entries.length}</span><button className={styles.primary} disabled={position >= entries.length - 1} onClick={() => select(entries[position + 1].question.key)}>Next question →</button></footer>
        </> : <div className={styles.empty}><h2>No questions in this view</h2><p>Choose a different filter to continue reviewing.</p><button onClick={() => setFilter('all')}>Show all questions</button></div>}
      </section>
    </div>
  </MockLayout>;
}
