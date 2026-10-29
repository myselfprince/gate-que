'use client';
import { safeGateOverflowUrl, safeSolutionUrl } from '@/lib/solution-links.mjs';
import GateOverflowReader from './GateOverflowReader';
import MockQuestion from './MockQuestion';
import base from './GatePractice.module.css';
import styles from './MockAdmin.module.css';

export default function QuestionSolutionLinks({ question, draft, onChange, onSave, busy }) {
  const discussion = safeGateOverflowUrl(draft.gateOverflowUrl), video = safeSolutionUrl(draft.solutionUrl);
  const dirty = draft.gateOverflowUrl !== (question.gateOverflowUrl || '') || draft.solutionUrl !== (question.solutionUrl || '');
  return <section className={styles.referenceSection} aria-label="Question references">
    <div className={styles.referenceTitle}><div><h2>Question links &amp; solutions</h2><p className={styles.referenceHint}>Open the saved reference, or add and update links for this question.</p></div></div>
    <label>GATE Overflow question / answer URL<input type="url" value={draft.gateOverflowUrl} onChange={e => onChange('gateOverflowUrl', e.target.value)} placeholder="https://gateoverflow.in/…" maxLength={2000} /></label>
    {discussion ? <a className={styles.solutionLink} href={discussion} target="_blank" rel="noreferrer">Visit GATE Overflow ↗</a> : <p className={styles.referenceHint}>No GATE Overflow link saved for this question yet.</p>}
    <label className={styles.videoField}>YouTube video solution URL<input type="url" value={draft.solutionUrl} onChange={e => onChange('solutionUrl', e.target.value)} placeholder="https://www.youtube.com/watch?v=…" maxLength={1000} /></label>
    {video && <a className={styles.solutionLink} href={video} target="_blank" rel="noreferrer">Watch video solution ↗</a>}
    <div className={styles.linkSaveBar}><button className={base.primary} type="button" disabled={busy || !dirty} onClick={onSave}>Save solution links</button><small>Links can be saved even when the answer key is missing.</small></div>
    {discussion && <details className={styles.inlineDiscussion}><summary>Read the discussion inside admin</summary><GateOverflowReader url={discussion} question={question} /></details>}
    {question.referenceAnswer && <details className={styles.explanation} open><summary>Saved written explanation</summary><MockQuestion key={`${question.key}-reference`} question={{ ...question, key: `${question.key}-reference`, text: question.referenceAnswer, code: '', diagram: '' }} /></details>}
  </section>;
}
