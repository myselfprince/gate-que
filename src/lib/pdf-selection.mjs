export function selectPdfQuestions(questions, { scope = 'all', year = '', range = '', selectedIds = [], includeBlanks = true, sourceMode = 'editable' } = {}) {
  if (!['all', 'year', 'range', 'selected'].includes(scope)) throw new Error('Choose an export selection.');
  if (!['editable', 'verified'].includes(sourceMode)) throw new Error('Choose a question version.');
  const indices = new Set();
  if (scope === 'range') {
    if (!range.trim() || range.length > 1000) throw new Error('Enter a range such as 1-20, 25, 40-50.');
    for (const part of range.split(',')) {
      const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (!match) throw new Error('Use question numbers and ranges, such as 1-20, 25.');
      const first = Number(match[1]), last = Number(match[2] || match[1]);
      if (first < 1 || last > questions.length || first > last) throw new Error(`Choose question numbers from 1 to ${questions.length}.`);
      for (let index = first - 1; index < last; index++) indices.add(index);
    }
  }
  const ids = new Set(selectedIds);
  return questions.flatMap((question, index) => {
    if ((!includeBlanks && question.isBlank) || (scope === 'year' && String(question.year) !== String(year)) || (scope === 'range' && !indices.has(index)) || (scope === 'selected' && !ids.has(question.id))) return [];
    const printed = sourceMode === 'verified' && question.source?.verifiedQuestion;
    return [{ ...question, ...(printed || {}), exportNumber: String(index + 1) }];
  });
}
