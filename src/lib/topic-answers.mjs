// Topic-wise answer keys for book chapters.
//
// A reviewed answer file in data/topic-answers/<slug>.json records one verified
// answer per chapter question, together with its evidence. The apply script
// writes only answer fields (questionType, correctOptions, natAnswer, natRange
// and, when documented, answerDisposition/specialNote) and refuses to proceed if
// any question's content changed after review.
import { createHash } from 'node:crypto';
import { questionType, storedAnswerText } from './question-answers.mjs';
import { topicSlug } from './topic-answer-prompt.mjs';

export { topicSlug };
export const TOPIC_ANSWER_FORMAT = 'gate-topic-answers-v1';
export const TOPIC_ANSWER_DIR = 'data/topic-answers';
export const SOURCE_KINDS = ['gateoverflow-pdf', 'made-easy-key', 'year-paper', 'official-key', 'derived'];
const TYPES = ['MCQ', 'MSQ', 'NAT', 'SUBJECTIVE'];
const LETTERS = ['A', 'B', 'C', 'D'];
const STATUSES = ['verified', 'verified-with-note'];
const DISPOSITIONS = ['standard', 'none-correct', 'disputed'];

// Fields that define what a student reads. Any change invalidates a reviewed answer.
export const CONTENT_FIELDS = ['text', 'code', 'optA', 'optB', 'optC', 'optD', 'diagram', 'ext'];
export function questionContentHash(question) {
  return createHash('sha256').update(JSON.stringify(CONTENT_FIELDS.map(field => String(question[field] ?? '')))).digest('hex');
}

export function hasStoredAnswer(question) {
  try { return Boolean(storedAnswerText(question)); } catch { return false; }
}

export function chapterAnswerCoverage(chapter) {
  const questions = Array.isArray(chapter.questions) ? chapter.questions : [];
  const missing = [];
  let blank = 0, subjective = 0, answered = 0;
  questions.forEach((question, index) => {
    if (question.isBlank) { blank++; return; }
    if (questionType(question) === 'SUBJECTIVE') { subjective++; return; }
    if (hasStoredAnswer(question)) answered++;
    else missing.push(index + 1);
  });
  const answerable = questions.length - blank - subjective;
  return {
    subject: chapter.subject, chapter: chapter.chapter, slug: topicSlug(chapter.subject, chapter.chapter),
    total: questions.length, blank, subjective, answerable, answered, missing,
    complete: answerable > 0 && answered === answerable,
    updatedAt: chapter.updatedAt ? new Date(chapter.updatedAt).toISOString() : null,
  };
}

const text = (value, field, { required = true, max = 4000 } = {}) => {
  if (value === undefined && !required) return '';
  if (typeof value !== 'string' || (required && !value.trim()) || value.length > max) throw new Error(`${field} must be text of at most ${max} characters.`);
  return value.trim();
};

function normalizeEntry(entry, index) {
  const at = `Question entry ${index + 1}`;
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error(`${at} must be an object.`);
  if (!Number.isSafeInteger(entry.position) || entry.position < 1) throw new Error(`${at}: position must be the 1-based chapter position.`);
  const id = text(entry.id, `${at} id`, { max: 100 });
  if (typeof entry.contentSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(entry.contentSha256)) throw new Error(`${at}: contentSha256 is invalid.`);
  if (!TYPES.includes(entry.questionType)) throw new Error(`${at}: questionType must be one of ${TYPES.join(', ')}.`);
  const result = { position: entry.position, id, contentSha256: entry.contentSha256, questionType: entry.questionType };
  const options = entry.correctOptions ?? [];
  if (!Array.isArray(options) || options.some(option => !LETTERS.includes(option)) || new Set(options).size !== options.length) throw new Error(`${at}: correctOptions must be distinct letters A-D.`);
  if (entry.questionType === 'MCQ' && options.length !== 1) throw new Error(`${at}: an MCQ needs exactly one correct option.`);
  if (entry.questionType === 'MSQ' && !options.length) throw new Error(`${at}: an MSQ needs at least one correct option.`);
  if (['NAT', 'SUBJECTIVE'].includes(entry.questionType) && options.length) throw new Error(`${at}: ${entry.questionType} cannot have option letters.`);
  result.correctOptions = [...options].sort();
  if (entry.questionType === 'NAT') {
    const range = entry.natRange ?? null;
    if (range !== null && (!range || !Number.isFinite(range.min) || !Number.isFinite(range.max) || range.min > range.max)) throw new Error(`${at}: natRange needs finite min <= max.`);
    result.natAnswer = text(entry.natAnswer ?? '', `${at} natAnswer`, { required: !range, max: 200 });
    if (range) result.natRange = { min: range.min, max: range.max };
  }
  const disposition = entry.answerDisposition ?? 'standard';
  if (!DISPOSITIONS.includes(disposition)) throw new Error(`${at}: answerDisposition is invalid.`);
  if (disposition !== 'standard') {
    result.answerDisposition = disposition;
    result.specialNote = text(entry.specialNote, `${at} specialNote`);
  }
  if (!STATUSES.includes(entry.status)) throw new Error(`${at}: status must be ${STATUSES.join(' or ')}.`);
  result.status = entry.status;
  result.reason = text(entry.reason, `${at} reason`);
  result.note = text(entry.note, `${at} note`, { required: entry.status === 'verified-with-note' });
  if (!Array.isArray(entry.sources) || !entry.sources.length || entry.sources.length > 10) throw new Error(`${at}: list 1-10 answer sources.`);
  result.sources = entry.sources.map((source, position) => {
    if (!source || !SOURCE_KINDS.includes(source.kind)) throw new Error(`${at}: source ${position + 1} kind must be one of ${SOURCE_KINDS.join(', ')}.`);
    if (typeof source.agrees !== 'boolean') throw new Error(`${at}: source ${position + 1} must say whether it agrees.`);
    return { kind: source.kind, ref: text(source.ref, `${at} source ref`, { max: 500 }), answer: text(source.answer ?? '', `${at} source answer`, { required: false, max: 200 }), agrees: source.agrees };
  });
  if (!result.sources.some(source => source.kind !== 'derived' && source.agrees)) throw new Error(`${at}: at least one external source must agree, or record an official key.`);
  if (result.sources.some(source => !source.agrees) && entry.status !== 'verified-with-note') throw new Error(`${at}: a disagreeing source needs status verified-with-note and an explanation.`);
  if (entry.replaceExisting !== undefined && typeof entry.replaceExisting !== 'boolean') throw new Error(`${at}: replaceExisting must be true or false.`);
  if (entry.replaceExisting) result.replaceExisting = true;
  return result;
}

export function validateTopicAnswerFile(value) {
  if (!value || value.format !== TOPIC_ANSWER_FORMAT) throw new Error(`Answer file format must be ${TOPIC_ANSWER_FORMAT}.`);
  const subject = text(value.subject, 'subject', { max: 200 }), chapter = text(value.chapter, 'chapter', { max: 200 });
  if (value.slug !== topicSlug(subject, chapter)) throw new Error(`slug must be ${topicSlug(subject, chapter)}.`);
  if (!Array.isArray(value.questions) || !value.questions.length || value.questions.length > 1000) throw new Error('questions must list 1-1000 entries.');
  const questions = value.questions.map(normalizeEntry);
  for (const key of ['position', 'id']) {
    if (new Set(questions.map(entry => entry[key])).size !== questions.length) throw new Error(`Each question ${key} may appear only once.`);
  }
  return { ...value, subject, chapter, questions };
}

const answerState = question => ({
  questionType: question.questionType ?? null,
  correctOptions: Array.isArray(question.correctOptions) ? [...question.correctOptions].sort() : [],
  natAnswer: String(question.natAnswer ?? ''),
  natRange: question.natRange ?? null,
  answerDisposition: question.answerDisposition ?? 'standard',
  specialNote: question.specialNote ?? '',
});

function targetState(entry, current) {
  const target = { ...current, questionType: entry.questionType };
  if (entry.questionType === 'MCQ' || entry.questionType === 'MSQ') target.correctOptions = entry.correctOptions;
  if (entry.questionType === 'NAT') {
    target.correctOptions = [];
    target.natAnswer = entry.natAnswer;
    // storedAnswerText prefers natRange, so a reviewed exact answer must clear a stale range.
    target.natRange = entry.natRange ?? null;
  }
  if (entry.answerDisposition) { target.answerDisposition = entry.answerDisposition; target.specialNote = entry.specialNote; }
  return target;
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Compare a reviewed answer file with the live chapter and return the exact field writes.
export function planTopicAnswerUpdate(chapter, answerFile) {
  const file = validateTopicAnswerFile(answerFile);
  if (chapter.subject !== file.subject || chapter.chapter !== file.chapter) throw new Error('The answer file belongs to a different chapter.');
  const questions = Array.isArray(chapter.questions) ? chapter.questions : [];
  if (new Set(questions.map(question => question.id)).size !== questions.length) throw new Error('Chapter question ids are not unique; fix them in the editor first.');
  const entries = new Map(file.questions.map(entry => [entry.id, entry]));
  const errors = [], changes = [];
  let unchanged = 0;
  questions.forEach((question, index) => {
    const entry = entries.get(question.id);
    const label = `Q${index + 1} (${question.id})`;
    if (question.isBlank) { if (entry) errors.push(`${label} is blank; remove its entry.`); return; }
    if (!entry) { errors.push(`${label} has no reviewed answer entry.`); return; }
    entries.delete(question.id);
    if (entry.position !== index + 1) errors.push(`${label} moved: the answer file says position ${entry.position}. Re-review it.`);
    if (entry.contentSha256 !== questionContentHash(question)) errors.push(`${label} text, options or diagram changed after review. Re-review it.`);
    const before = answerState(question), after = targetState(entry, before);
    if (same(before, after)) { unchanged++; return; }
    const hadAnswer = hasStoredAnswer(question) || before.questionType !== null;
    const conflicting = hasStoredAnswer(question) && !same({ ...before, questionType: null }, { ...after, questionType: null });
    if (conflicting && !entry.replaceExisting) errors.push(`${label} already has a different stored answer (${storedAnswerText(question)}). Set replaceExisting only after confirming the stored key is wrong.`);
    const set = {};
    for (const field of ['questionType', 'correctOptions', 'natAnswer', 'natRange', 'answerDisposition', 'specialNote']) {
      if (!same(before[field], after[field])) set[field] = after[field];
    }
    changes.push({ position: index + 1, id: question.id, hadAnswer, before, after, set });
  });
  for (const entry of entries.values()) errors.push(`Answer entry for ${entry.id} (position ${entry.position}) is not in this chapter.`);
  return { file, errors, changes, unchanged };
}

// MongoDB update for planned changes; array filters address questions by stable id.
export function topicAnswerUpdateDocument(changes, now = new Date()) {
  const $set = { updatedAt: now }, arrayFilters = [];
  changes.forEach((change, index) => {
    const name = `q${index}`;
    arrayFilters.push({ [`${name}.id`]: change.id });
    for (const [field, value] of Object.entries(change.set)) $set[`questions.$[${name}].${field}`] = value;
  });
  return { update: { $set }, options: { arrayFilters } };
}
