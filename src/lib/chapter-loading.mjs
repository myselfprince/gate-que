export const QUESTION_LOAD_OPTIONS = [10, 25, 50, 100, 'all'];

export function chapterQuestionWindow(searchParams) {
  const rawLimit = searchParams.get('limit');
  const limit = rawLimit === null || rawLimit === 'all' ? null : Number(rawLimit);
  const offset = Number(searchParams.get('offset') ?? 0);
  if ((limit !== null && (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000))
    || !Number.isSafeInteger(offset) || offset < 0) {
    throw new Error('Choose a question count between 1 and 1000, or all, and a valid offset.');
  }
  return { limit, offset };
}

// Replace the loaded prefix while keeping every question outside that prefix.
export function mergeLoadedChapter(existing, { questions, lockCount }, loadedCount) {
  if (!Number.isSafeInteger(loadedCount) || loadedCount < 0 || loadedCount > existing.questions.length) {
    throw new Error('The loaded question range is invalid. Reload the chapter before saving.');
  }
  const mergedQuestions = [...questions, ...existing.questions.slice(loadedCount)];
  if (mergedQuestions.length > 1000) throw new Error('A maximum of 1000 questions is allowed.');
  return {
    questions: mergedQuestions,
    lockCount: existing.lockCount > loadedCount
      ? existing.lockCount + questions.length - loadedCount
      : lockCount,
  };
}
