'use client';
import styles from './PreviewAnswerKey.module.css';
import { OPTION_LETTERS, answerTypePatch, questionType, toggleCorrectOptionPatch } from '@/lib/question-answers.mjs';

const TYPES = [['MCQ', 'One correct option'], ['MSQ', 'One or more correct options'], ['NAT', 'Numerical answer']];

function statusText(question, type, hasOptions) {
  if (type === 'SUBJECTIVE') return 'Subjective / proof — no answer key';
  if (question.answerDisposition === 'none-correct') return 'None of the options is correct';
  if (type === 'NAT') return question.natAnswer?.trim() || question.natRange ? 'Answer recorded' : 'Type the numerical answer';
  const marked = question.correctOptions || [];
  if (marked.length) return `Answer: ${marked.map(option => `(${option})`).join(', ')}`;
  if (question.answerDisposition === 'disputed' && question.specialNote) return 'Answer note';
  if (!hasOptions) return 'Add option text in the editor to mark an answer';
  return type === 'MSQ' ? 'Click every correct option' : 'Click the correct option';
}

// Answer key controls for the live preview: switch MCQ / MSQ / NAT, click options
// to mark them correct (marked options turn green), or type a NAT answer.
export default function PreviewAnswerKey({ question, disabled, hasOptions, isTwoCol, renderOption, onChange }) {
  const type = questionType(question);
  const isChoice = type === 'MCQ' || type === 'MSQ';
  const noneCorrect = question.answerDisposition === 'none-correct';
  const marked = question.correctOptions || [];
  const disputed = question.answerDisposition === 'disputed';
  const recorded = isChoice ? marked.length > 0 || noneCorrect || (disputed && Boolean(question.specialNote)) : Boolean(question.natAnswer?.trim() || question.natRange);
  const optionTextClass = question.isCodeOptions ? styles.codeText : styles.text;

  const mark = letter => onChange(toggleCorrectOptionPatch(question, letter));

  return <div className={styles.answerKey}>
    <div className={styles.bar}>
      <div role="group" aria-label="Question type" className={styles.types}>
        {TYPES.map(([value, title]) => <button key={value} type="button" title={title} aria-pressed={type === value} disabled={disabled} className={type === value ? styles.typeActive : styles.type} onClick={() => { if (type !== value) onChange(answerTypePatch(question, value)); }}>{value}</button>)}
      </div>
      <span className={recorded ? styles.status : styles.statusEmpty}>{statusText(question, type, hasOptions)}{disputed && (marked.length > 0 || !question.specialNote) ? ' · Disputed' : ''}</span>
    </div>
    {question.specialNote && <p className={styles.note}>{question.specialNote}</p>}

    {hasOptions ? <div role={type === 'MSQ' ? 'group' : 'radiogroup'} aria-label="Correct answer" className={isTwoCol ? styles.optionsTwoCol : styles.options}>
      {OPTION_LETTERS.map(letter => {
        const isMarked = isChoice && !noneCorrect && marked.includes(letter);
        const canMark = !disabled && !noneCorrect && type !== 'SUBJECTIVE' && Boolean(question[`opt${letter}`]?.trim());
        return <div key={letter} role={type === 'MSQ' ? 'checkbox' : 'radio'} aria-checked={isMarked} aria-disabled={!canMark} tabIndex={canMark ? 0 : -1}
          className={isMarked ? styles.optionMarked : styles.option}
          title={canMark ? (isMarked ? 'Click to unmark' : 'Click to mark as correct') : undefined}
          onClick={() => {
            // Dragging to select option text should not change the key.
            if (canMark && !window.getSelection?.()?.toString()) mark(letter);
          }}
          onKeyDown={event => {
            if (canMark && (event.key === ' ' || event.key === 'Enter')) { event.preventDefault(); mark(letter); }
          }}>
          <strong className={styles.letter}>({letter})</strong> <span className={optionTextClass}>{renderOption(letter)}</span>
          <span className={styles.tick} aria-hidden="true">✓</span>
        </div>;
      })}
    </div> : type === 'NAT' ? <div className={recorded ? styles.natRecorded : styles.nat}>
      <strong id={`nat-answer-${question.id}`}>NAT Answer:</strong>
      <input className={styles.natInput} aria-labelledby={`nat-answer-${question.id}`} value={question.natAnswer || ''} maxLength={2000} disabled={disabled} placeholder="e.g. 42 or 1.25 to 1.30"
        onChange={event => onChange({ questionType: 'NAT', natAnswer: event.target.value })} />
      {question.natRange && <small>Accepted range: {question.natRange.min} to {question.natRange.max}</small>}
    </div> : null}
  </div>;
}
