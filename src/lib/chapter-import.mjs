import { createHash } from 'node:crypto';

const fingerprint = (q) => createHash('sha256').update(JSON.stringify([
  q.text, q.code, q.year, q.examPaper || 'CS', q.setNum, q.optA, q.optB, q.optC, q.optD,
].map((value) => String(value || '').replace(/\s+/g, ' ').trim()))).digest('hex');

export function mergeChapterImport(existing, incoming) {
  const questions = [];
  const preservedNotes = [];
  for (const q of existing) {
    // This exact legacy record is an editorial note, not an exam question.
    const isLegacyNote = q.text === 'added in prev chapter 1 already'
      && !q.isPosLocked && !q.isBlank
      && ![q.code, q.diagram, q.optA, q.optB, q.optC, q.optD, q.natAnswer].some(Boolean);
    if (isLegacyNote) preservedNotes.push(q);
    else questions.push(q);
  }
  const ids = new Set(questions.map((q) => q.id));
  const sources = new Set(questions.filter((q) => q.source).map((q) => `${q.source.sha256}:${q.source.questionNumber}`));
  const contents = new Set(questions.map(fingerprint));
  let added = 0;
  for (const q of incoming) {
    const sourceKey = q.source ? `${q.source.sha256}:${q.source.questionNumber}` : '';
    if (ids.has(q.id) || (sourceKey && sources.has(sourceKey)) || contents.has(fingerprint(q))) continue;
    questions.push(q);
    ids.add(q.id);
    if (sourceKey) sources.add(sourceKey);
    contents.add(fingerprint(q));
    added++;
  }
  return { questions, preservedNotes, added, alreadyPresent: incoming.length - added };
}
