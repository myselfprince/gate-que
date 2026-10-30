'use client';
import { useEffect, useRef, useState } from 'react';
import { examQuestionNumber, examSections, examStatusCounts, nextExamQuestion, numericKeypadValue, paletteStatus } from '@/lib/gate-exam-screen.mjs';
import MockQuestion, { MockOption } from './MockQuestion';
import MockCalculator from './MockCalculator';
import styles from './GateExamScreen.module.css';

const statuses = [['answered', 'Answered'], ['notAnswered', 'Not Answered'], ['notVisited', 'Not Visited'], ['review', 'Marked for Review'], ['answeredReview', 'Answered & Marked for Review']];
const timeText = seconds => seconds === null ? '…' : `${Math.floor(seconds / 3600).toString().padStart(2, '0')}:${Math.floor(seconds % 3600 / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
function Badge({ status, children }) { return <span className={`${styles.badge} ${styles[status]}`}>{children}{status === 'answeredReview' && <span className={styles.tick}>✓</span>}</span>; }

export default function GateExamScreen({ attempt, state, seconds, busy, error, saveStatus, confirmSubmit, onRespond, onMove, onCommitNext, onConfirmSubmit, onCancelSubmit, onSubmit }) {
  const [calculator, setCalculator] = useState(false), [paletteOpen, setPaletteOpen] = useState(true), [modal, setModal] = useState(null), [fontSize, setFontSize] = useState(16);
  const dialog = useRef(null), questionArea = useRef(null);
  const sections = examSections(attempt.questions);
  const section = sections.find(section => section.indices.includes(state.currentIndex));
  const q = attempt.questions[state.currentIndex], counts = examStatusCounts(attempt.questions, state);
  const response = state.responses.find(response => response.key === q.key)?.value;
  const questionNumber = examQuestionNumber(sections, state.currentIndex);
  const kind = confirmSubmit ? 'submit' : modal;
  const answered = counts.answered + counts.answeredReview;
  const sectionAnswered = state.responses.filter(r => section.indices.some(i => attempt.questions[i].key === r.key) && (Array.isArray(r.value) ? r.value.length : r.value)).length;
  const choiceFull = section.limit && sectionAnswered >= section.limit && !response;
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => { if (window.innerWidth < 700) setPaletteOpen(false); });
    return () => { document.body.style.overflow = previous; cancelAnimationFrame(frame); };
  }, []);
  useEffect(() => { questionArea.current?.scrollTo({ top: 0 }); }, [q.key]);
  useEffect(() => {
    if (kind && !dialog.current?.open) dialog.current?.showModal();
    else if (!kind && dialog.current?.open) dialog.current.close();
  }, [kind]);
  function closeDialog() { setModal(null); onCancelSubmit(); }
  function selectQuestion(index) { onMove(index); if (window.innerWidth < 700) setPaletteOpen(false); }
  function next(mark) {
    const nextIndex = nextExamQuestion(sections, state.currentIndex);
    onCommitNext(mark, nextIndex);
    if (nextIndex === state.currentIndex) setModal('lastQuestion');
  }
  function fullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.();
  }
  return <main className={styles.examRoot} data-palette-open={paletteOpen} data-time-low={seconds !== null && seconds <= 300} aria-label="GATE computer based test">
    <header className={styles.banner}><div className={styles.brand}><span className={styles.brandSeal} aria-hidden="true">G4</span><strong>G4Gate</strong></div><div className={styles.examTitle}><strong>GRADUATE APTITUDE TEST IN ENGINEERING</strong><span>GATE {q.examPaper} · Computer Based Practice Test</span></div><button className={styles.fullscreen} onClick={fullscreen} aria-label="Toggle full screen" title="Full screen">⛶</button></header>
    <div className={styles.topStrip}><span title={attempt.title}>{attempt.title}</span><nav><button onClick={() => setModal('instructions')}><i className={styles.infoIcon}>i</i> Instructions</button><button onClick={() => setModal('paper')}><i className={styles.paperIcon}>▤</i> Question Paper</button></nav></div>
    <div className={styles.examBody}>
      <section className={styles.mainColumn} aria-label="Question and responses">
        <div className={styles.groupBar}><button className={styles.groupButton} onClick={() => setModal('summary')}>GATE {q.examPaper} <span aria-hidden="true">ⓘ</span></button><div className={styles.clockTools}><button aria-label="Open scientific calculator" aria-pressed={calculator} className={styles.calculatorLaunch} title="Scientific Calculator" onClick={() => setCalculator(value => !value)}><svg width="17" height="21" viewBox="0 0 17 21" aria-hidden="true"><rect x="1" y="1" width="15" height="19" rx="1" fill="#f39931" /><rect x="3" y="3" width="11" height="4" fill="white" />{[10, 14, 18].flatMap(y => [4, 8, 12].map(x => <rect key={`${x}-${y}`} x={x - 1} y={y - 1} width="2" height="2" fill="white" />))}</svg></button><strong role="timer">Time Left : {timeText(seconds)}</strong></div></div>
        <div className={styles.sectionBar}><span>Sections</span><div role="tablist" aria-label="Exam sections">{sections.map(item => <button key={item.id} role="tab" aria-selected={item.id === section.id} title={item.name} onClick={() => selectQuestion(item.indices[0])}>{item.name} <span aria-hidden="true">ⓘ</span></button>)}</div></div>
        <div className={styles.questionMeta}><span>Question Type : <strong>{q.questionType}</strong></span><div><span>Marks for correct answer: <b className={styles.positive}>{q.marks}</b></span><span>Negative Marks: <b className={styles.negative}>{q.questionType === 'MCQ' ? (Number(q.marks) * (q.negativeFraction ?? attempt.negativeFraction)).toFixed(2) : '0'}</b></span></div></div>
        <div className={styles.questionHeading}><strong>Question No. {questionNumber}{q.originalLabel && q.originalLabel !== q.paperQuestionNumber ? ` · Source ${q.originalLabel}` : ''}</strong><div><button title="Decrease question text size" aria-label="Decrease question text size" disabled={fontSize <= 13} onClick={() => setFontSize(value => value - 1)}>A−</button><button title="Increase question text size" aria-label="Increase question text size" disabled={fontSize >= 22} onClick={() => setFontSize(value => value + 1)}>A+</button><span>View in : English</span></div></div>
        <div ref={questionArea} className={styles.questionScroll} style={{ '--question-font': `${fontSize}px` }} data-question-key={q.key}>
          <MockQuestion key={q.key} question={q}>
            <p className={styles.origin}><strong>(GATE {q.examPaper} {q.year}{q.setNum ? ` · Set ${q.setNum}` : ''})</strong>{q.paperQuestionNumber ? <small>Original paper Q{q.originalLabel || q.paperQuestionNumber}</small> : null}</p>
            {section.limit && <p className={styles.notice}>Attempt any {section.limit} questions in this section. {sectionAnswered} selected.{choiceFull ? ' Clear an existing written response before selecting another.' : ''}</p>}
            <fieldset disabled={busy || seconds === 0 || choiceFull} className={styles.responses}><legend className={styles.srOnly}>{q.questionType === 'SUBJECTIVE' ? 'Write your answer' : q.questionType === 'MSQ' ? 'Select all correct options' : q.questionType === 'MCQ' ? 'Select one option' : 'Enter your numerical answer'}</legend>
              {['MCQ', 'MSQ'].includes(q.questionType) ? ['A', 'B', 'C', 'D', 'E'].filter(letter => q[`opt${letter}`]).map(letter => <label className={styles.option} key={letter}><input type={q.questionType === 'MCQ' ? 'radio' : 'checkbox'} name={`response-${q.key}`} checked={Array.isArray(response) && response.includes(letter)} onChange={event => onRespond(q.questionType === 'MCQ' ? [letter] : event.target.checked ? [...(response || []), letter] : response.filter(value => value !== letter))} /><span>{letter}.</span><MockOption question={q} text={q[`opt${letter}`]} /></label>) : q.questionType === 'SUBJECTIVE' ? <label className={styles.writtenLabel}>Written response<textarea aria-label="Written response" rows={8} maxLength={6000} value={typeof response === 'string' ? response : ''} onChange={event => onRespond(event.target.value)} placeholder="Write your working, code, or proof here. For diagrams, work on paper and describe the result here." /><small>Saved with your attempt. Compare with the reference solution and self-assess after submission.</small></label> : <div className={styles.numericResponse}><input aria-label="Numerical response" type="text" inputMode="decimal" value={typeof response === 'string' ? response : ''} maxLength={100} onChange={event => onRespond(event.target.value.trim())} autoComplete="off" /><div className={styles.numberPad} aria-label="Numerical answer keypad"><button type="button" className={styles.backspace} onClick={() => onRespond(numericKeypadValue(response, 'Backspace'))}>Backspace</button>{['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', '−'].map(key => <button key={key} type="button" aria-label={`Numerical keypad ${key}`} onClick={() => onRespond(numericKeypadValue(response, key))}>{key}</button>)}</div></div>}
            </fieldset>
          </MockQuestion>
        </div>
        {error && <div role="alert" className={styles.error}>{error}</div>}
        <footer className={styles.actionBar}><div><button className={styles.plainButton} disabled={busy || seconds === 0} onClick={() => next(true)}>Mark for Review &amp; Next</button><button className={styles.plainButton} disabled={busy || seconds === 0} onClick={() => onRespond([])}>Clear Response</button></div><div><button className={styles.plainButton} disabled={nextExamQuestion(sections, state.currentIndex, -1) === state.currentIndex} onClick={() => selectQuestion(nextExamQuestion(sections, state.currentIndex, -1))}>Previous</button><button className={styles.blueButton} disabled={busy || seconds === 0} onClick={() => next(false)}>Save &amp; Next</button><button className={`${styles.blueButton} ${styles.footerSubmit}`} disabled={busy} aria-label="Submit test with palette hidden" onClick={onSubmit}>Submit</button></div></footer>
      </section>
      <button className={styles.paletteHandle} aria-label={paletteOpen ? 'Collapse question palette' : 'Expand question palette'} aria-expanded={paletteOpen} onClick={() => setPaletteOpen(value => !value)}>{paletteOpen ? '›' : '‹'}</button>
      <aside className={styles.sidebar} aria-label="Question palette">
        <div className={styles.candidate}><div className={styles.avatar} aria-hidden="true"><svg viewBox="0 0 64 78"><defs><linearGradient id="candidate-avatar" x2="0" y2="1"><stop stopColor="#ecf1f5" /><stop offset="1" stopColor="#7893a6" /></linearGradient></defs><circle cx="32" cy="23" r="17" fill="url(#candidate-avatar)" stroke="#526c80" /><path d="M7 76V64c0-17 9-25 25-25s25 8 25 25v12" fill="url(#candidate-avatar)" stroke="#526c80" /><path d="m24 43 8 15 8-15-8 5Z" fill="#fff" /></svg></div><div><strong>Candidate</strong><small>GATE {q.examPaper}</small><button onClick={() => setModal('profile')}>Profile</button></div></div>
        <div className={styles.legend}>{statuses.map(([status, label]) => <div key={status} className={status === 'answeredReview' ? styles.wideLegend : ''}><Badge status={status}>{counts[status]}</Badge><span>{label}{status === 'answeredReview' && <small>(will also be evaluated)</small>}</span></div>)}</div>
        <div className={styles.paletteTitle}>{section.name}</div>
        <div className={styles.paletteScroll}><p>Choose a Question</p><div className={styles.palette}>{section.indices.map(index => {
          const question = attempt.questions[index], status = paletteStatus(question.key, state), number = examQuestionNumber(sections, index);
          return <button key={question.key} className={`${styles.paletteButton} ${index === state.currentIndex ? styles.current : ''}`} aria-current={index === state.currentIndex ? 'step' : undefined} aria-label={`Question ${number}, ${statuses.find(([value]) => value === status)[1]}`} onClick={() => selectQuestion(index)}><Badge status={status}>{number}</Badge></button>;
        })}</div></div>
        <div className={styles.submitArea}><small role="status" title={saveStatus}>{saveStatus}</small><button className={styles.blueButton} disabled={busy} aria-label="Submit test" onClick={onSubmit}>Submit</button></div>
      </aside>
    </div>
    <MockCalculator open={calculator} onClose={() => setCalculator(false)} />
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="exam-dialog-title" onCancel={closeDialog}><header><strong id="exam-dialog-title">{({ instructions: 'General Instructions', paper: 'Question Paper', profile: 'Candidate Profile', summary: 'Section Summary', submit: 'Submit this test?', lastQuestion: 'This was the last question' })[kind]}</strong><button aria-label="Close dialog" onClick={closeDialog}>×</button></header><div className={styles.dialogBody}>
      {kind === 'lastQuestion' && <p>You have reached the end of the paper. You can review earlier questions or submit your test when you are ready.</p>}
      {kind === 'instructions' && <><p><strong>{attempt.title}</strong></p><p>{attempt.questions.length} questions · {attempt.totalMarks} maximum marks · {attempt.durationMinutes} minutes</p><ol><li>The timer shows the remaining time. The test submits automatically when time expires.</li><li>For MCQ, select one option. For MSQ, select every correct option; there is no partial credit. For NAT, enter a number. Written answers are saved for self-assessment after submission.</li><li>Click <strong>Save &amp; Next</strong> to save your response, remove its review mark and move to the next question.</li><li><strong>Mark for Review &amp; Next</strong> saves your response and marks the question for review. Answered questions marked for review are evaluated.</li><li>Use the section tabs and question palette to move between questions. Calculator memory stays available when you close and reopen it.</li><li>Unless a question specifies a different penalty, wrong MCQs lose {(attempt.negativeFraction * 100).toFixed(2)}% of that question’s marks. Linked part (b) uses its stated penalty and requires a correct part (a). Wrong MSQ and NAT responses have no negative marks. Unavailable or disputed keys require manual review.</li></ol>{attempt.warnings.map(warning => <p className={styles.notice} key={warning}>{warning}</p>)}</>}
      {kind === 'profile' && <dl><dt>Name</dt><dd>Candidate</dd><dt>Test</dt><dd>{attempt.title}</dd><dt>Duration</dt><dd>{attempt.durationMinutes} minutes</dd></dl>}
      {(kind === 'summary' || kind === 'submit') && <><p>{answered} answered · {attempt.questions.length - answered} unanswered · {counts.review + counts.answeredReview} marked for review</p><table><thead><tr><th>Section</th><th>Questions</th><th>Answered</th><th>Review</th></tr></thead><tbody>{sections.map(section => { const counts = examStatusCounts(section.indices.map(index => attempt.questions[index]), state); return <tr key={section.id}><td>{section.name}</td><td>{section.indices.length}</td><td>{counts.answered + counts.answeredReview}</td><td>{counts.review + counts.answeredReview}</td></tr>; })}</tbody></table>{kind === 'submit' && <p>Answered questions marked for review are evaluated. You cannot change responses after submission.</p>}</>}
      {kind === 'paper' && sections.map(section => <section key={section.id}><h3>{section.name}</h3>{section.indices.map(index => <article className={styles.paperQuestion} key={attempt.questions[index].key}><strong>Question No. {examQuestionNumber(sections, index)} · {attempt.questions[index].marks} marks</strong><MockQuestion question={attempt.questions[index]}>{['A', 'B', 'C', 'D', 'E'].filter(letter => attempt.questions[index][`opt${letter}`]).map(letter => <p key={letter}>{letter}. <MockOption question={attempt.questions[index]} text={attempt.questions[index][`opt${letter}`]} /></p>)}</MockQuestion><button className={styles.plainButton} onClick={() => { selectQuestion(index); closeDialog(); }}>Go to this question</button></article>)}</section>)}
    </div><footer><button className={styles.plainButton} onClick={closeDialog}>{kind === 'submit' ? 'Continue test' : kind === 'lastQuestion' ? 'Back to test' : 'Close'}</button>{kind === 'lastQuestion' && <button className={styles.blueButton} disabled={busy} onClick={() => { setModal(null); onSubmit(); }}>Review &amp; submit</button>}{kind === 'submit' && <button className={styles.blueButton} disabled={busy} onClick={onConfirmSubmit}>Confirm submit</button>}</footer></dialog>
  </main>;
}
