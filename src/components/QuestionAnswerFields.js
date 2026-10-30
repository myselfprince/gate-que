'use client';
import QuestionReviewFields from './QuestionReviewFields';
import { questionType, storedAnswerText } from '@/lib/question-answers.mjs';

export default function QuestionAnswerFields({ question, disabled, onChange }) {
  const type = questionType(question);
  return <fieldset disabled={disabled} style={{ marginTop: 16, padding: 14, border: '1px solid #45475a', borderRadius: 8 }}>
    <legend>Correct answer · {storedAnswerText(question) ? 'Recorded' : 'Not recorded'}</legend>
    <label>Question type<select aria-label="Question type" value={type} onChange={event => onChange({ questionType: event.target.value, correctOptions: [], natAnswer: '', natRange: null, isProof: event.target.value === 'SUBJECTIVE', answerDisposition: question.answerDisposition === 'none-correct' && !['MCQ', 'MSQ'].includes(event.target.value) ? 'disputed' : question.answerDisposition || 'standard' })}>
      <option value="MCQ">MCQ — one correct option</option><option value="MSQ">MSQ — multiple correct options</option><option value="NAT">NAT — numerical answer</option><option value="SUBJECTIVE">Subjective / proof</option>
    </select></label>
    {(type === 'MCQ' || type === 'MSQ') ? <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
      {['A', 'B', 'C', 'D'].map(letter => <label key={letter} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input type={type === 'MCQ' ? 'radio' : 'checkbox'} name={`correct-${question.id}`} disabled={question.answerDisposition === 'none-correct' || !question[`opt${letter}`]?.trim()} checked={question.correctOptions?.includes(letter) || false} onChange={event => onChange({ questionType: type, correctOptions: type === 'MCQ' ? [letter] : event.target.checked ? [...(question.correctOptions || []), letter].sort() : question.correctOptions.filter(option => option !== letter) })} />({letter})
      </label>)}
      <button type="button" onClick={() => onChange({ correctOptions: [] })}>Clear answer</button>
    </div> : <>
      <label>{type === 'NAT' ? 'Correct numerical answer' : 'Reference answer'}<input aria-label="Correct answer" value={question.natAnswer || ''} maxLength={2000} onChange={event => onChange({ questionType: type, natAnswer: event.target.value })} placeholder={type === 'NAT' ? 'e.g. 42 or 1.25 to 1.30' : 'Optional reference answer'} /></label>
      {type === 'NAT' && <details><summary>Accepted numeric range for mock grading (optional)</summary><div style={{ display: 'flex', gap: 12 }}>
        {['min', 'max'].map(key => <label key={key}>{key === 'min' ? 'Minimum' : 'Maximum'}<input type="number" step="any" aria-label={`NAT ${key}`} value={question.natRange?.[key] ?? ''} onChange={event => onChange({ natRange: event.target.value === '' ? null : { min: question.natRange?.min ?? Number(event.target.value), max: question.natRange?.max ?? Number(event.target.value), [key]: Number(event.target.value) } })} /></label>)}
      </div><button type="button" onClick={() => onChange({ natRange: null })}>Clear range</button></details>}
    </>}
    <QuestionReviewFields value={question} questionType={type} onChange={onChange} />
    <small style={{ color: '#a6adc8' }}>Leave unanswered if the key is unknown. Save to database to retain these fields.</small>
  </fieldset>;
}
