import { createHash } from 'node:crypto';
import { mergeChapterImport } from '../../src/lib/chapter-import.mjs';
import { normalizeQuestionMetadata } from '../../src/lib/question-metadata.mjs';

export const recordHash = (q) => createHash('sha256').update(JSON.stringify(q)).digest('hex');
const fields = ['text','code','year','marks','setNum','diagram','ext','optA','optB','optC','optD','natAnswer','questionType','correctOptions'];
export const printedQuestion = (q) => Object.fromEntries(fields.map((field) => [field, q[field]]));

export function mergeReviewedImport(existing, incoming, reviewedMatches) {
  const questions = structuredClone(existing);
  const covered = new Set();
  const matches = [];
  let metadataAdded = 0;
  for (const source of incoming) {
    const number = source.source.questionNumber;
    const found = questions.filter((q) => q.source?.sha256 === source.source.sha256 && q.source.questionNumber === number);
    if (found.length > 1) throw new Error(`Duplicate source identity: ${number}`);
    if (found.length) { covered.add(source.id); continue; }
    const reviewed = reviewedMatches.find((match) => match.number === number);
    if (!reviewed) continue;
    const target = questions.find((q) => q.id === reviewed.id);
    if (!target || recordHash(target) !== reviewed.beforeHash) throw new Error(`Reviewed existing record changed: ${number}. Re-review before import.`);
    if (target.source) throw new Error(`Existing record already belongs to another source: ${number}`);
    const metadata = {
      source: { ...source.source, verifiedQuestion: printedQuestion(source), reviewConflicts: reviewed.conflicts },
      questionType: target.questionType || source.questionType,
      correctOptions: target.correctOptions || reviewed.correctOptions,
    };
    normalizeQuestionMetadata(metadata);
    Object.assign(target, metadata);
    matches.push(number);
    metadataAdded++;
    covered.add(source.id);
  }
  // Existing reviewed IDs are retained; only truly missing records reach the
  // established content/source/ID duplicate guard.
  const missing = incoming.filter((q) => !covered.has(q.id));
  const plan = mergeChapterImport(questions, missing);
  if (plan.preservedNotes.length || plan.added !== missing.length) throw new Error('Unreviewed match or editorial note requires explicit review.');
  if (new Set(plan.questions.map((q) => q.id)).size !== plan.questions.length) throw new Error('Question IDs are not unique.');
  return { questions: plan.questions, added: plan.added, alreadyPresent: incoming.length - plan.added, metadataAdded, matches };
}

// Read the visually verified PDF version from actual database records. Legacy
// edits stay in the parent record, including option order and position locks.
export function sourceQuestions(chapter, sourceHash) {
  return chapter.questions.filter((q) => q.source?.sha256 === sourceHash)
    .sort((a,b) => Number(a.source.questionNumber.split('.')[1]) - Number(b.source.questionNumber.split('.')[1]))
    .map((q) => {
      if (!q.source.verifiedQuestion) return structuredClone(q);
      const { verifiedQuestion, reviewConflicts: _conflicts, ...source } = q.source;
      return { ...q, ...verifiedQuestion, source };
    });
}
