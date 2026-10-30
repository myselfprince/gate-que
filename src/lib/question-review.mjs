export const ANSWER_DISPOSITIONS = ['standard', 'none-correct', 'disputed'];

// Documented historical awards belong only to independent year-paper copies.
// This policy is deliberately omitted from active-attempt publicQuestion data.
export const awardsMarksToAll = question => question.awardMarksToAll === true && Boolean(question.datasetId);

export function normalizeQuestionReview(value) {
  const answerDisposition = value.answerDisposition ?? 'standard';
  const specialNote = value.specialNote ?? '';
  if (!ANSWER_DISPOSITIONS.includes(answerDisposition)) throw new Error('Choose a valid answer review status.');
  if (typeof specialNote !== 'string' || specialNote.length > 4000) throw new Error('Special note must be text of at most 4000 characters.');
  if (answerDisposition !== 'standard' && !specialNote.trim()) throw new Error('Explain the question issue in the special note.');
  return { answerDisposition, specialNote: specialNote.trim() };
}

export function needsQuestionReview(question) {
  return question.manualReview === true || ['none-correct', 'disputed'].includes(question.answerDisposition);
}

export function reviewAnswerText(question) {
  if (question.answerDisposition === 'none-correct') return 'None of the options is correct';
  if (question.answerDisposition === 'disputed') return 'Answer under review';
  return '';
}
