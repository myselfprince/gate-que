import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { requireAccess } from '@/lib/auth';

const DEFAULT_MAX_BODY_BYTES = 10 * 1024 * 1024;
const MAX_STRING_LENGTH = 20_000;
const IMAGE_NAME_PATTERN = /^[A-Za-z0-9 .()_-]+$/;
const allowedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

export class ValidationError extends Error {}

export const jsonError = (error, status = 400) => NextResponse.json({ success: false, error }, { status });

export const unexpectedError = () => jsonError('Something went wrong. Please try again.', 500);

export const parseJson = async (request, maxBodyBytes = Number(process.env.MAX_REQUEST_BYTES) || DEFAULT_MAX_BODY_BYTES) => {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > maxBodyBytes) throw new ValidationError('Request body is too large.');
  try {
    return await request.json();
  } catch {
    throw new ValidationError('Request body must be valid JSON.');
  }
};

const readString = (value, field, { required = false, maxLength = MAX_STRING_LENGTH, trim = false } = {}) => {
  if (typeof value !== 'string') {
    if (required) throw new ValidationError(`${field} is required.`);
    return '';
  }
  const normalized = value.replace(/\r\n/g, '\n');
  const result = trim ? normalized.trim() : normalized;
  if (required && !result) throw new ValidationError(`${field} is required.`);
  if (result.length > maxLength) throw new ValidationError(`${field} is too long.`);
  return result;
};

const readBoolean = (value) => value === true;

const readInteger = (value, field, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) throw new ValidationError(`${field} is invalid.`);
  return parsed;
};

const readOptionalInteger = (value, field, options) => (value === undefined ? undefined : readInteger(value, field, options));

const normalizeExtension = (value) => {
  const extension = readString(value || '.png', 'Image extension', { maxLength: 8, trim: true }).toLowerCase();
  if (!allowedExtensions.has(extension)) throw new ValidationError('Image extension is not supported.');
  return extension;
};

export const getSafeImageNames = (diagram) => readString(diagram || '', 'Images', { maxLength: 2_000 })
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean)
  .filter((name) => IMAGE_NAME_PATTERN.test(name));

export const validateQuestion = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ValidationError('Each question must be an object.');
  const optLayout = readString(value.optLayout || 'auto', 'Options layout', { maxLength: 10, trim: true });
  if (!['auto', '1col', '2col'].includes(optLayout)) throw new ValidationError('Options layout is invalid.');

  return {
    id: readString(value.id || randomUUID(), 'Question id', { required: true, maxLength: 100, trim: true }),
    text: readString(value.text || '', 'Question text'),
    code: readString(value.code || '', 'Code'),
    year: readString(String(value.year ?? '2026'), 'Year', { maxLength: 16, trim: true }),
    setNum: readString(String(value.setNum ?? ''), 'Set number', { maxLength: 16, trim: true }),
    rawTopic: readString(value.rawTopic || '', 'Topic', { maxLength: 500, trim: true }),
    marks: readString(String(value.marks ?? '1'), 'Marks', { maxLength: 8, trim: true }),
    diagram: readString(value.diagram || '', 'Images', { maxLength: 2_000 }),
    ext: normalizeExtension(value.ext),
    optA: readString(value.optA || '', 'Option A'),
    optB: readString(value.optB || '', 'Option B'),
    optC: readString(value.optC || '', 'Option C'),
    optD: readString(value.optD || '', 'Option D'),
    natAnswer: readString(value.natAnswer || '', 'NAT answer', { maxLength: 2_000 }),
    isBlank: readBoolean(value.isBlank),
    isPosLocked: readBoolean(value.isPosLocked),
    isCodeOptions: readBoolean(value.isCodeOptions),
    isProof: readBoolean(value.isProof),
    needsManualOptionFix: readBoolean(value.needsManualOptionFix),
    optLayout,
    tempPaste: readString(value.tempPaste || '', 'Temporary paste', { maxLength: MAX_STRING_LENGTH })
  };
};

export const validateQuestions = (questions, maxQuestions = 1_000) => {
  if (!Array.isArray(questions)) throw new ValidationError('Questions must be an array.');
  if (questions.length > maxQuestions) throw new ValidationError(`A maximum of ${maxQuestions} questions is allowed.`);
  return questions.map(validateQuestion);
};

export const validateChapterIdentity = (data) => ({
  subject: validatePathSegment(data?.subject, 'Subject'),
  chapter: validatePathSegment(data?.chapter, 'Chapter')
});

const validatePathSegment = (value, field) => {
  const segment = readString(value, field, { required: true, maxLength: 200, trim: true });
  if (/[\\/\u0000\r\n]/.test(segment) || segment === '.' || segment === '..') throw new ValidationError(`${field} is invalid.`);
  return segment;
};

export const validateChapterPayload = (data) => {
  const identity = validateChapterIdentity(data);
  const questions = validateQuestions(data?.questions);
  const lockCount = readOptionalInteger(data?.lockCount, 'Lock count', { min: 0, max: questions.length }) ?? 0;
  return { ...identity, questions, lockCount };
};

export const validateScrapedChapterPayload = (data) => ({
  ...validateChapterIdentity(data),
  questions: validateQuestions(data?.questions)
});

export const validatePreferencePayload = (data) => validateChapterIdentity(data);

export const validateStatusPayload = (data) => ({
  ...validateChapterIdentity(data),
  targetCount: readInteger(data?.targetCount, 'Target count', { min: 0, max: 100_000 })
});

export const validateConfigPayload = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new ValidationError('Configuration is required.');
  const syllabus = data.syllabus;
  const topicMapping = data.topicMapping;
  if (!syllabus || typeof syllabus !== 'object' || Array.isArray(syllabus)) throw new ValidationError('Syllabus is invalid.');
  if (!topicMapping || typeof topicMapping !== 'object' || Array.isArray(topicMapping)) throw new ValidationError('Topic mapping is invalid.');

  const normalizedSyllabus = {};
  for (const [subject, chapters] of Object.entries(syllabus)) {
    const safeSubject = readString(subject, 'Subject', { required: true, maxLength: 200, trim: true });
    if (!Array.isArray(chapters) || chapters.length > 100) throw new ValidationError('Chapters are invalid.');
    normalizedSyllabus[safeSubject] = chapters.map((chapter) => readString(chapter, 'Chapter', { required: true, maxLength: 200, trim: true }));
  }

  const normalizedMapping = {};
  for (const [topic, chapter] of Object.entries(topicMapping)) {
    normalizedMapping[readString(topic, 'Topic', { required: true, maxLength: 500, trim: true })] = readString(chapter, 'Chapter', { required: true, maxLength: 200, trim: true });
  }
  return { syllabus: normalizedSyllabus, topicMapping: normalizedMapping };
};

export const validateExportPayload = (data) => {
  const maxQuestions = Number(process.env.MAX_EXPORT_QUESTIONS) || 250;
  const identity = validateChapterIdentity(data);
  const questions = validateQuestions(data?.questions, maxQuestions);
  return {
    ...identity,
    questions,
    contentWidth: Math.min(100, Math.max(30, Number(data?.contentWidth) || 100))
  };
};

export const isSameOrigin = (request) => {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    const requestHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
    if (!requestHost || originUrl.host !== requestHost) return false;

    const forwardedProtocol = request.headers.get('x-forwarded-proto');
    return !forwardedProtocol || originUrl.protocol === `${forwardedProtocol}:`;
  } catch {
    return false;
  }
};

export const requireMutationAccess = (request) => {
  const authResponse = requireAccess(request);
  if (authResponse) return authResponse;
  return isSameOrigin(request) ? null : jsonError('Cross-origin requests are not allowed.', 403);
};

export const requireReadAccess = (request) => requireAccess(request);

const rateLimitStore = globalThis.__gateRateLimitStore || (globalThis.__gateRateLimitStore = new Map());

export const rateLimit = (request, scope, { limit, windowMs }) => {
  const forwardedFor = request.headers.get('x-forwarded-for') || 'local';
  const key = `${scope}:${forwardedFor.split(',')[0].trim()}`;
  const now = Date.now();
  const record = rateLimitStore.get(key);
  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  if (record.count >= limit) return jsonError('Too many requests. Please wait and try again.', 429);
  record.count += 1;
  return null;
};
