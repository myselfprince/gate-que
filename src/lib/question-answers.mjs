import { reviewAnswerText, awardsMarksToAll } from './question-review.mjs';

export function questionType(question) {
  if (question.questionType) return question.questionType;
  if (question.isProof) return 'SUBJECTIVE';
  if (question.correctOptions?.length) return question.correctOptions.length > 1 ? 'MSQ' : 'MCQ';
  return ['A', 'B', 'C', 'D'].some(letter => question[`opt${letter}`]?.trim())
    ? question.correctOptions?.length > 1 ? 'MSQ' : 'MCQ' : 'NAT';
}

export const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

// Switching between MCQ and MSQ keeps the marked options that still fit, so a
// key can be corrected without re-marking it. Any other switch starts clean.
export function answerTypePatch(question, type) {
  const current = questionType(question);
  const options = question.correctOptions || [];
  const keepOptions = ['MCQ', 'MSQ'].includes(current) && (type === 'MSQ' || (type === 'MCQ' && options.length <= 1));
  return {
    questionType: type,
    correctOptions: keepOptions ? [...options] : [],
    ...(keepOptions ? {} : { natAnswer: '', natRange: null }),
    isProof: type === 'SUBJECTIVE',
    answerDisposition: question.answerDisposition === 'none-correct' && !['MCQ', 'MSQ'].includes(type) ? 'disputed' : question.answerDisposition || 'standard',
  };
}

// MCQ: picks the option, or clears it when the marked option is clicked again.
// MSQ: toggles the option. A non-option question becomes an MCQ.
export function toggleCorrectOptionPatch(question, letter) {
  const type = questionType(question);
  const options = question.correctOptions || [];
  if (type === 'MSQ') return { questionType: 'MSQ', correctOptions: options.includes(letter) ? options.filter(option => option !== letter) : [...options, letter].sort() };
  if (type === 'MCQ') return { questionType: 'MCQ', correctOptions: options.length === 1 && options[0] === letter ? [] : [letter] };
  return { ...answerTypePatch(question, 'MCQ'), correctOptions: [letter] };
}

export function storedAnswerText(question) {
  if (question.isBlank) return '';
  if (awardsMarksToAll(question)) return 'Marks to All';
  if (reviewAnswerText(question)) return reviewAnswerText(question);
  const type = questionType(question);
  if (type === 'MCQ' || type === 'MSQ') return (question.correctOptions || []).map(option => `(${option})`).join(', ');
  if (question.natRange) return `${question.natRange.min} to ${question.natRange.max}`;
  const answer = question.natAnswer?.trim() || '';
  return /^(?:NAT|_+|answer not available)$/i.test(answer) ? '' : answer;
}

// True when nothing is left to mark: a key is stored, the question is flagged
// (none correct / disputed), or it is subjective and needs no key. Blanks never count.
export function answerKeyComplete(question) {
  if (question.isBlank) return false;
  return questionType(question) === 'SUBJECTIVE' || Boolean(storedAnswerText(question));
}

export function numericAnswerRange(question) {
  if (question.natRange) return question.natRange;
  const answer = storedAnswerText(question).replace(/\$/g, '').trim();
  const number = '[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?';
  const range = answer.match(new RegExp(`^\\[?\\s*(${number})\\s*(?:to|,|:)\\s*(${number})\\s*\\]?$`, 'i'));
  if (range && Number(range[1]) <= Number(range[2])) return { min: Number(range[1]), max: Number(range[2]) };
  if (new RegExp(`^${number}$`, 'i').test(answer)) return { min: Number(answer), max: Number(answer) };
  return null;
}
