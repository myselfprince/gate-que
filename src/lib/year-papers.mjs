import { needsQuestionReview, normalizeQuestionReview, awardsMarksToAll } from './question-review.mjs';
import {numericAnswerRange} from './question-answers.mjs';

export function maximumPaperMarks(questions) {
  const groups = new Map();
  for (const q of questions) {
    const id = q.sectionId || q.key;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(q);
  }
  return [...groups.values()].reduce((total, items) => total + items.map(q => Number(q.marks)).sort((a,b) => b-a)
    .slice(0, items[0].sectionLimit || items.length).reduce((sum, marks) => sum + marks, 0), 0);
}

export function publicPaper(paper) {
  const fields = ['slug', 'datasetId', 'title', 'year', 'examPaper', 'setNum', 'questionCount', 'totalMarks', 'availableMarks', 'durationMinutes', 'negativeFraction', 'verified', 'sourceUrl', 'instructions'];
  return Object.fromEntries(fields.filter(key => paper[key] !== undefined).map(key => [key, paper[key]]));
}

export function validateYearPaper(paper) {
  if (!/^[a-z0-9-]+$/.test(paper.slug) || paper.datasetId !== paper.slug || !paper.verified) throw new Error('Invalid separate paper identity.');
  const q = paper.questions;
  if (!Array.isArray(q) || q.length !== paper.questionCount) throw new Error('Incomplete paper.');
  if (new Set(q.map(q => q.key)).size !== q.length) throw new Error('Duplicate paper question keys.');
  q.forEach((question,index) => {
    normalizeQuestionReview(question);
    if (question.awardMarksToAll !== undefined && (question.awardMarksToAll !== true || !awardsMarksToAll(question) || needsQuestionReview(question)
      || question.correctOptions?.length || !question.answerSources?.some(s => s.printed === 'Marks to All' && s.url?.startsWith('https://')))) throw new Error(`Undocumented all-candidate award at Q${index+1}.`);
    if (question.answerDisposition === 'none-correct' && (!['MCQ', 'MSQ'].includes(question.questionType) || question.correctOptions?.length)) throw new Error(`Invalid none-correct key at Q${index+1}.`);
    if (question.datasetId !== paper.slug || Number(question.paperQuestionNumber) !== index+1 || !question.text?.trim()
      || !(question.referenceAnswer?.trim() || (needsQuestionReview(question) && question.specialNote?.trim())) || !question.gateOverflowUrl?.startsWith('https://gateoverflow.in/')) throw new Error(`Invalid content or missing reference at Q${index+1}.`);
    if (['MCQ','MSQ'].includes(question.questionType) && !needsQuestionReview(question) && !awardsMarksToAll(question) &&
      (!question.correctOptions?.length || (question.questionType === 'MCQ' && question.correctOptions.length !== 1)
      || new Set(question.correctOptions).size !== question.correctOptions.length
      || question.correctOptions.some(letter => !['A','B','C','D','E'].includes(letter) || !question[`opt${letter}`]))) throw new Error(`Invalid key at Q${index+1}.`);
    if (question.negativeFraction !== undefined && (typeof question.negativeFraction !== 'number' || !Number.isFinite(question.negativeFraction) || question.negativeFraction < 0 || question.negativeFraction > 1)) throw new Error(`Invalid penalty at Q${index+1}.`);
    if (question.dependsOnKey && !q.slice(0,index).some(prior => prior.key === question.dependsOnKey)) throw new Error(`Linked prerequisite must precede Q${index+1}.`);
    if (question.questionType === 'NAT' && !needsQuestionReview(question) && !numericAnswerRange(question)) throw new Error(`Invalid numerical key at Q${index+1}.`);
    if (!['MCQ','MSQ','NAT','SUBJECTIVE'].includes(question.questionType)) throw new Error(`Unsupported question type at Q${index+1}.`);
  });
  if (maximumPaperMarks(q) !== paper.totalMarks || q.reduce((n,q)=>n+Number(q.marks),0) !== paper.availableMarks) throw new Error('Paper marks do not match section choice rules.');
  return paper;
}
