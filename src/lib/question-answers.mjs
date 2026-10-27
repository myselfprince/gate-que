export function questionType(question) {
  if (question.questionType) return question.questionType;
  if (question.isProof) return 'SUBJECTIVE';
  if (question.correctOptions?.length) return question.correctOptions.length > 1 ? 'MSQ' : 'MCQ';
  return ['A', 'B', 'C', 'D'].some(letter => question[`opt${letter}`]?.trim())
    ? question.correctOptions?.length > 1 ? 'MSQ' : 'MCQ' : 'NAT';
}

export function storedAnswerText(question) {
  if (question.isBlank) return '';
  const type = questionType(question);
  if (type === 'MCQ' || type === 'MSQ') return (question.correctOptions || []).map(option => `(${option})`).join(', ');
  if (question.natRange) return `${question.natRange.min} to ${question.natRange.max}`;
  const answer = question.natAnswer?.trim() || '';
  return /^(?:NAT|_+|answer not available)$/i.test(answer) ? '' : answer;
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
