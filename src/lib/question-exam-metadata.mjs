const CONTENT_FIELDS = ['text', 'code', 'optA', 'optB', 'optC', 'optD'];
// Require a complete exam label; years in formulas, URLs and code are content.
const EXAM_LABEL = /\[\s*(?:GATE\s*)?((?:19|20)\d{2})(?:\s*\(?\s*Set\s*[-:]?\s*(\d+)\s*\)?)?\s*[:|]\s*([12])\s*M(?:arks?)?\s*(?:\|\s*(MCQ|MSQ|NAT|SUBJECTIVE)\s*)?\]/gi;

export function reconcileQuestionExamMetadata(question) {
  const labels = [];
  for (const field of CONTENT_FIELDS) {
    if (typeof question[field] !== 'string') continue;
    for (const match of question[field].matchAll(EXAM_LABEL)) {
      labels.push({ field, label: match[0], index: match.index, year: match[1], setNum: match[2], marks: match[3], questionType: match[4]?.toUpperCase() });
    }
  }
  if (!labels.length) return { question, labels, conflict: false };
  const metadata = {};
  for (const key of ['year', 'marks', 'setNum', 'questionType']) {
    const values = new Set(labels.map(label => label[key]).filter(Boolean));
    // Keep all evidence intact when two inline labels disagree.
    if (values.size > 1) return { question, labels, conflict: true };
    if (values.size) metadata[key] = [...values][0];
  }
  const repaired = { ...question, ...metadata };
  for (const field of CONTENT_FIELDS) {
    const matches = labels.filter(label => label.field === field).reverse();
    if (!matches.length) continue;
    let text = question[field];
    for (const match of matches) {
      let start = match.index;
      let end = start + match.label.length;
      while (start > 0 && /[ \t]/.test(text[start - 1])) start--;
      while (end < text.length && /[ \t]/.test(text[end])) end++;
      const before = text.slice(0, start);
      const after = text.slice(end);
      const space = before && after && !/[\r\n]$/.test(before) && !/^[\r\n]/.test(after) ? ' ' : '';
      text = before + space + after;
    }
    repaired[field] = text;
  }
  return { question: repaired, labels, conflict: false };
}
