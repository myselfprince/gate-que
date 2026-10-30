import { gradeAttempt } from './gatemock.mjs';
import { questionType } from './question-answers.mjs';

const answerFields = ['correctOptions', 'natAnswer', 'natRange', 'manualReview', 'answerDisposition',
  'specialNote', 'referenceAnswer', 'answerReviewedAt'];

function contentIdentity(question) {
  return JSON.stringify([question.key, questionType(question), String(question.marks), question.text,
    question.code || '', ...['A', 'B', 'C', 'D', 'E'].map(letter => question[`opt${letter}`] || ''),
    question.diagram || '', question.ext || '.png', question.assetSubject || question.subject,
    question.assetChapter || question.chapter,
    Object.entries(question.assetIds || {}).sort(([a], [b]) => a.localeCompare(b))]);
}

// Only explicit admin publications can replace a saved key. Never replace question content,
// responses, marks, penalties or linked-question rules while repairing a result.
export function refreshReviewedAttempt(attempt, currentQuestions) {
  if (!attempt.finishedAt || !attempt.result) return attempt;
  const byKey = new Map(currentQuestions.map(question => [question.key, question]));
  let changed = false;
  const questions = attempt.questions.map(saved => {
    const current = byKey.get(saved.key);
    const reviewedAt = Date.parse(current?.answerReviewedAt);
    if (!Number.isFinite(reviewedAt) || contentIdentity(saved) !== contentIdentity(current)
      || reviewedAt < (Date.parse(saved.answerReviewedAt) || 0)) return saved;
    const patch = Object.fromEntries(answerFields.map(field => [field, current[field] ?? (
      field === 'correctOptions' ? [] : field === 'manualReview' ? false : field === 'natRange' ? null : field === 'answerDisposition' ? 'standard' : '')]));
    if (answerFields.every(field => JSON.stringify(saved[field]) === JSON.stringify(patch[field]))) return saved;
    changed = true;
    return { ...saved, ...patch };
  });
  if (!changed) return attempt;
  const result = gradeAttempt(questions, attempt.state, attempt.negativeFraction, attempt.result.manualScores || []);
  // A verified automatic grade supersedes a previous self-assessment.
  const pending = new Set(result.entries.filter(entry => entry.manualReview).map(entry => entry.question.key));
  result.manualScores = result.manualScores.filter(item => pending.has(item.key));
  return { ...attempt, questions, result };
}

// Revision guards prevent a refresh from overwriting another tab's self-assessment.
// The source reader is injected; failures preserve the last persisted result.
export async function synchronizeReviewedAttempt(Model, attempt, readQuestions) {
  if (!attempt.finishedAt || !attempt.result) return attempt;
  let currentQuestions;
  try { currentQuestions = await readQuestions(attempt); } catch { /* Use the saved review during a source outage. */ }
  if (!currentQuestions) return { ...attempt, reviewSyncUnavailable: true };
  const identity = { _id: attempt._id, ...(attempt.userId ? { userId: attempt.userId } : {}),
    ...(attempt.tokenHash ? { tokenHash: attempt.tokenHash } : {}) };
  for (let retry = 0; retry < 3; retry++) {
    const refreshed = refreshReviewedAttempt(attempt, currentQuestions);
    if (refreshed === attempt) return attempt;
    const saved = await Model.findOneAndUpdate({ ...identity, revision: attempt.revision, finishedAt: { $ne: null } },
      { $set: { questions: refreshed.questions, result: refreshed.result }, $inc: { revision: 1 } }, { returnDocument: 'after' }).lean();
    if (saved) return saved;
    attempt = await Model.findOne(identity).lean();
    if (!attempt) throw new Error('Attempt no longer available.');
  }
  return { ...attempt, reviewSyncUnavailable: true };
}
