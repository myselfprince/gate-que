import { normalizeQuestionMetadata } from './question-metadata.mjs';
import { numericAnswerRange, questionType, storedAnswerText } from './question-answers.mjs';
import { normalizeQuestionReview, needsQuestionReview } from './question-review.mjs';

export function adminAnswerStatus(question) {
  if (needsQuestionReview(question) || questionType(question) === 'SUBJECTIVE') return 'review';
  return storedAnswerText(question) ? 'saved' : 'missing';
}

export function answerDraft(question) {
  const range = numericAnswerRange(question);
  return {
    questionType: questionType(question), correctOptions: [...(question.correctOptions || [])],
    natMode: question.natRange || (range && range.min !== range.max) ? 'range' : 'exact',
    natAnswer: range && range.min === range.max ? String(range.min) : question.natAnswer || '',
    natMin: range ? String(range.min) : '', natMax: range ? String(range.max) : '',
    manualReview: Boolean(question.manualReview), gateOverflowUrl: question.gateOverflowUrl || '', solutionUrl: question.solutionUrl || '',
    answerDisposition: question.answerDisposition || 'standard', specialNote: question.specialNote || '',
  };
}

// Only these answer fields are writable here; content, sources, locks and numbering stay intact.
export function validateAdminAnswer(value, question) {
  const review = normalizeQuestionReview(value);
  if (review.answerDisposition === 'none-correct' && !['MCQ', 'MSQ'].includes(value.questionType)) throw new Error('None correct applies only to option questions.');
  const metadata = normalizeQuestionMetadata({ questionType: value.questionType, correctOptions: value.correctOptions,
    gateOverflowUrl: value.gateOverflowUrl, solutionUrl: value.solutionUrl });
  if (!metadata.questionType || !metadata.correctOptions || typeof value.manualReview !== 'boolean') throw new Error('Choose a question type and review setting.');
  const result = { ...metadata, ...review, manualReview: value.manualReview || review.answerDisposition !== 'standard', natAnswer: '', natRange: null };
  if (review.answerDisposition === 'none-correct') result.correctOptions = [];
  if (['MCQ', 'MSQ'].includes(result.questionType)) {
    if (!result.correctOptions.length && !(result.manualReview && (result.specialNote || question.referenceAnswer))) throw new Error('Tick at least one correct option, or add a special note for manual review.');
    if (result.correctOptions.some(letter => !question[`opt${letter}`]?.trim())) throw new Error('A selected option has no content.');
    result.correctOptions.sort();
  } else if (result.questionType === 'NAT' && review.answerDisposition !== 'disputed') {
    if (result.correctOptions.length) throw new Error('NAT cannot have correct option letters.');
    const numeric = value => typeof value === 'string' && /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim()) && Number.isFinite(Number(value));
    if (value.natMode === 'exact') {
      if (!numeric(value.natAnswer)) throw new Error('Enter a finite numeric answer.');
      result.natAnswer = value.natAnswer.trim();
    } else if (value.natMode === 'range') {
      if (!numeric(value.natMin) || !numeric(value.natMax) || Number(value.natMin) > Number(value.natMax)) throw new Error('Enter a valid numeric range with minimum ≤ maximum.');
      result.natRange = { min: Number(value.natMin), max: Number(value.natMax) };
    } else throw new Error('Choose an exact answer or an accepted range.');
  } else {
    result.correctOptions = [];
    result.natAnswer = question.natAnswer || '';
    result.manualReview = true;
  }
  return result;
}

export function verifyAdminAnswer(value, question) {
  if (value.questionType === 'SUBJECTIVE') throw new Error('Written responses require individual assessment.');
  return validateAdminAnswer({ ...value, manualReview: false, answerDisposition: 'standard' }, question);
}

export function validateAdminLinks(value) {
  if (value.gateOverflowUrl === undefined && value.solutionUrl === undefined) throw new Error('Enter a GATE Overflow or YouTube solution link.');
  return normalizeQuestionMetadata({ gateOverflowUrl: value.gateOverflowUrl, solutionUrl: value.solutionUrl });
}

// Notes can be saved independently, even when an answer key is still missing.
export function validateAdminReview(value, question) {
  const review = normalizeQuestionReview(value);
  if (typeof value.manualReview !== 'boolean') throw new Error('Choose a manual review setting.');
  if (value.questionType !== questionType(question)) throw new Error('Save question type changes with Save answer before saving only the admin note.');
  if (review.answerDisposition === 'none-correct' && !['MCQ', 'MSQ'].includes(questionType(question))) throw new Error('None correct applies only to option questions.');
  return { ...review,
    manualReview: value.manualReview || review.answerDisposition !== 'standard' || questionType(question) === 'SUBJECTIVE',
    ...(review.answerDisposition === 'none-correct' ? { correctOptions: [] } : {}),
  };
}

export function adminQuestionRecord(question, paperUpdatedAt) {
  const fields = ['key', 'id', 'chapterId', 'subject', 'chapter', 'text', 'code', 'year', 'examPaper', 'setNum',
    'paperQuestionNumber', 'marks', 'questionType', 'optA', 'optB', 'optC', 'optD', 'correctOptions', 'natAnswer', 'natRange',
    'diagram', 'ext', 'assetSubject', 'assetChapter', 'isCodeOptions', 'isProof', 'datasetId', 'referenceAnswer',
    'manualReview', 'answerDisposition', 'specialNote', 'gateOverflowUrl', 'solutionUrl', 'sectionName', 'originalLabel', 'chapterUpdatedAt'];
  return { ...Object.fromEntries(fields.filter(key => question[key] !== undefined).map(key => [key, question[key]])),
    questionId: question.id, updatedAt: question.datasetId ? paperUpdatedAt : question.chapterUpdatedAt };
}
