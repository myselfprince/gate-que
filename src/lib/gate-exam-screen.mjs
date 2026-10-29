const cleanSubject = value => value.replace(/^\d+\.\s*/, '');

export function examSections(questions) {
  if (questions.some(q => q.sectionId)) {
    const sections = new Map();
    questions.forEach((q,index) => {
      const id = q.sectionId || 'subject';
      if (!sections.has(id)) sections.set(id, {id, name:q.sectionName || 'Computer Science', indices:[], limit:q.sectionLimit});
      sections.get(id).indices.push(index);
    });
    return [...sections.values()];
  }
  const aptitude = [], technical = [];
  questions.forEach((question, index) => (/general aptitude/i.test(question.subject) ? aptitude : technical).push(index));
  const subjects = [...new Set(technical.map(index => questions[index].subject))];
  const paper = questions[0]?.examPaper || 'CS';
  return [
    ...(aptitude.length ? [{ id: 'ga', name: 'General Aptitude', indices: aptitude }] : []),
    ...(technical.length ? [{ id: 'subject', name: subjects.length === 1 ? cleanSubject(subjects[0]) : paper === 'IT' ? 'Information Technology' : 'Computer Science and Information Technology', indices: technical }] : []),
  ];
}

export function paletteStatus(key, state) {
  const response = state.responses.find(response => response.key === key)?.value;
  const answered = Array.isArray(response) ? response.length > 0 : Boolean(response);
  if (state.marked.includes(key)) return answered ? 'answeredReview' : 'review';
  return answered ? 'answered' : state.visited.includes(key) ? 'notAnswered' : 'notVisited';
}

export function examStatusCounts(questions, state) {
  const counts = { answered: 0, notAnswered: 0, notVisited: 0, review: 0, answeredReview: 0 };
  for (const question of questions) counts[paletteStatus(question.key, state)]++;
  return counts;
}

export function nextExamQuestion(sections, currentIndex, direction = 1) {
  const indices = sections.flatMap(section => section.indices);
  const position = indices.indexOf(currentIndex);
  return indices[Math.max(0, Math.min(indices.length - 1, position + direction))] ?? currentIndex;
}

export function numericKeypadValue(value, key) {
  const text = typeof value === 'string' ? value : '';
  if (key === 'Backspace') return text.slice(0, -1);
  if (key === 'Clear') return '';
  if (key === '−') return text.startsWith('-') ? text.slice(1) : `-${text}`;
  if (key === '.') return text.includes('.') || /e/i.test(text) ? text : `${text || '0'}.`;
  return /^\d$/.test(key) && text.length < 100 ? text + key : text;
}
