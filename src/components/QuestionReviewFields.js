'use client';
import styles from './QuestionReviewFields.module.css';

export default function QuestionReviewFields({ value, questionType, onChange, noteRef, onSave, saveDisabled, busy }) {
  return <section className={styles.panel} aria-label="Admin special note">
    <div className={styles.heading}><h3>Admin special note</h3><span>Visible with answers</span></div>
    <p>Explain a wrong option, ambiguous wording or any other issue with this question.</p>
    <label>Answer review status<select aria-label="Answer review status" value={value.answerDisposition || 'standard'} onChange={event => onChange({ answerDisposition: event.target.value, ...(event.target.value !== 'standard' ? { manualReview: true } : {}), ...(event.target.value === 'none-correct' ? { correctOptions: [] } : {}) })}>
      <option value="standard">Standard answer / additional note</option>
      {['MCQ', 'MSQ'].includes(questionType) && <option value="none-correct">None of the options is correct</option>}
      <option value="disputed">Disputed / flawed question — manual review</option>
    </select></label>
    <label>Special note for aspirants<textarea ref={noteRef} className={styles.note} aria-label="Special note for aspirants" rows={4} maxLength={4000} value={value.specialNote || ''} required={Boolean(value.answerDisposition && value.answerDisposition !== 'standard')} onChange={event => onChange({ specialNote: event.target.value })} placeholder="For example: None of the options is correct. The correct condition is ..." /></label>
    <small>Shown with answers after submission. Questions marked as flawed or none correct are excluded from automatic grading. {(value.specialNote || '').length}/4000</small>
    {onSave && <div className={styles.actions}><button type="button" disabled={busy || saveDisabled} onClick={onSave}>{busy ? 'Saving…' : 'Save admin note'}</button><small>Save this note without selecting a correct option.</small></div>}
  </section>;
}
