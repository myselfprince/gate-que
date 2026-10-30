import { paperCoverage, validatePaper } from './gatemock.mjs';
import { publicPaper, maximumPaperMarks } from './year-papers.mjs';
import { numericAnswerRange, questionType } from './question-answers.mjs';
import { normalizeQuestionMetadata } from './question-metadata.mjs';
import { safeGateOverflowUrl, safeSolutionUrl } from './solution-links.mjs';

export function adminYearPaperSummary(paper) {
  const questions = paper.questions || [];
  const coverage = paperCoverage(questions, paper);
  return { ...publicPaper(paper), updatedAt: paper.updatedAt, available: questions.length, ready: coverage.ready,
    gateOverflowCount: questions.filter(q => safeGateOverflowUrl(q.gateOverflowUrl)).length,
    videoCount: questions.filter(q => safeSolutionUrl(q.solutionUrl)).length,
    reviewCount: questions.filter(q => q.manualReview || questionType(q) === 'SUBJECTIVE').length };
}

const text = (value, label, max = 20000) => {
  if (typeof value !== 'string' || value.length > max) throw new Error(`${label} must be text (maximum ${max} characters).`);
  return value;
};

// Prepared papers use their own storage and original order, independent of chapter questions.
export function validatePreparedYearPaper(value) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.questions)) throw new Error('Choose a prepared paper JSON containing a questions array.');
  const metadata = validatePaper({ ...value, year: String(value.year || ''), setNum: value.setNum || '' });
  if (value.questions.length !== metadata.questionCount) throw new Error('The declared question count must match the complete questions array.');
  const session = metadata.setNum.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const slug = `gate-${metadata.examPaper.toLowerCase()}-${metadata.year}${session ? `-${session}` : ''}`;
  const questions = value.questions.map((q, index) => {
    if (!q || typeof q !== 'object' || Array.isArray(q) || q.isBlank) throw new Error(`Question ${index + 1} is missing or blank.`);
    if (q.paperQuestionNumber && String(q.paperQuestionNumber) !== String(index + 1)) throw new Error('Questions must be in their original paper order, numbered 1 onwards.');
    const type = questionType(q);
    const normalized = normalizeQuestionMetadata({ answerDisposition: q.answerDisposition, specialNote: q.specialNote, questionType: type, correctOptions: q.correctOptions || [], natRange: q.natRange ?? null,
      gateOverflowUrl: q.gateOverflowUrl || '', solutionUrl: q.solutionUrl || '' });
    const result = { ...q, ...normalized, id: text(q.id || `${slug}-q${index + 1}`, 'Question ID', 150),
      key: `yearpaper:${slug}:${index + 1}`, datasetId: slug, year: metadata.year, examPaper: metadata.examPaper,
      setNum: metadata.setNum, paperQuestionNumber: String(index + 1), marks: String(q.marks || ''),
      subject: text(q.subject || `GATE ${metadata.examPaper}`, 'Subject', 200), chapter: text(q.chapter || 'Previous-year paper', 'Chapter', 200),
      ext: q.ext || '.png', isBlank: false };
    for (const field of ['text', 'code', 'optA', 'optB', 'optC', 'optD', 'referenceAnswer', 'natAnswer', 'diagram']) result[field] = text(q[field] || '', `Question ${index + 1} ${field}`, field === 'diagram' ? 2000 : 20000);
    if (!result.text.trim() || !Number.isFinite(Number(result.marks)) || Number(result.marks) <= 0 || Number(result.marks) > 100) throw new Error(`Question ${index + 1} needs question text and valid marks.`);
    if (normalized.correctOptions.some(letter => !result[`opt${letter}`].trim())) throw new Error(`Question ${index + 1} has a key for an empty option.`);
    const hasKey = type === 'NAT' ? Boolean(numericAnswerRange(result)) : ['MCQ', 'MSQ'].includes(type) && normalized.correctOptions.length > 0;
    result.manualReview = q.manualReview === true || normalized.answerDisposition === 'none-correct' || normalized.answerDisposition === 'disputed' || !hasKey;
    return result;
  });
  if (new Set(questions.map(q => q.id)).size !== questions.length) throw new Error('Question IDs must be unique within a paper.');
  if (maximumPaperMarks(questions) !== metadata.totalMarks) throw new Error('The total marks do not match the paper’s questions and section choice rules.');
  const instructions = value.instructions || [];
  if (!Array.isArray(instructions) || instructions.length > 30) throw new Error('Paper instructions are invalid.');
  if (value.sourceSha256 !== undefined && (typeof value.sourceSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(value.sourceSha256))) throw new Error('The paper source checksum is invalid.');
  return { ...metadata, slug, datasetId: slug, title: text(value.title || `GATE ${metadata.examPaper} ${metadata.year}${metadata.setNum ? ` · Set ${metadata.setNum}` : ''}`, 'Paper title', 200),
    ...(value.sourceSha256 ? { sourceSha256: value.sourceSha256 } : {}),
    availableMarks: questions.reduce((sum, q) => sum + Number(q.marks), 0),
    instructions: instructions.map(value => text(value, 'Paper instruction', 3000)), questions };
}
