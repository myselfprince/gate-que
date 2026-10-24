import { normalizeSolutionUrl } from './solution-links.mjs';
import { normalizePdfSettings } from './pdf-settings.mjs';

export function normalizeQuestionMetadata(value, fail = (message) => { throw new Error(message); }) {
  const metadata = {};
  if (value.exportNumber !== undefined) {
    if (typeof value.exportNumber !== 'string' || !/^[1-9]\d{0,5}$/.test(value.exportNumber)) fail('Export question number is invalid.');
    metadata.exportNumber = value.exportNumber;
  }
  if (value.pdfStyle !== undefined) {
    try { metadata.pdfStyle = normalizePdfSettings(value.pdfStyle, { partial: true }); }
    catch (error) { fail(error.message); }
  }
  if (value.solutionUrl !== undefined) {
    try { metadata.solutionUrl = normalizeSolutionUrl(value.solutionUrl); }
    catch (error) { fail(error.message); }
  }
  if (value.questionType !== undefined) {
    if (!['MCQ', 'MSQ', 'NAT', 'SUBJECTIVE'].includes(value.questionType)) fail('Question type is invalid.');
    metadata.questionType = value.questionType;
  }
  if (value.correctOptions !== undefined) {
    if (!Array.isArray(value.correctOptions) || value.correctOptions.length > 4
      || value.correctOptions.some((option) => !['A', 'B', 'C', 'D'].includes(option))
      || new Set(value.correctOptions).size !== value.correctOptions.length) fail('Correct options are invalid.');
    metadata.correctOptions = [...value.correctOptions];
  }
  if (value.source !== undefined) {
    const source = value.source;
    if (!source || typeof source !== 'object' || Array.isArray(source)) fail('Question source is invalid.');
    for (const [key, max] of [['file', 500], ['questionNumber', 40]]) {
      if (typeof source[key] !== 'string' || !source[key].trim() || source[key].length > max) fail(`Source ${key} is invalid.`);
    }
    if (typeof source.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(source.sha256)) fail('Source checksum is invalid.');
    for (const key of ['pdfPages', 'bookPages']) {
      if (!Array.isArray(source[key]) || !source[key].length || source[key].length > 20
        || source[key].some((page) => !Number.isInteger(page) || page < 1)) fail(`Source ${key} is invalid.`);
    }
    const missingKey = source.answerKeyStatus === 'not-supplied';
    if (source.answerKeyStatus !== undefined && !missingKey) fail('Answer key status is invalid.');
    if (missingKey ? source.answerKeyPdfPage !== null
      : !Number.isInteger(source.answerKeyPdfPage) || source.answerKeyPdfPage < 1) fail('Answer key page is invalid.');
    metadata.source = {
      file: source.file.trim(), sha256: source.sha256, questionNumber: source.questionNumber.trim(),
      pdfPages: [...source.pdfPages], bookPages: [...source.bookPages], answerKeyPdfPage: source.answerKeyPdfPage,
    };
    if (missingKey) metadata.source.answerKeyStatus = 'not-supplied';
    if (source.notes !== undefined) {
      if (!Array.isArray(source.notes) || source.notes.length > 20
        || source.notes.some((note) => typeof note !== 'string' || !note.trim() || note.length > 1000)) fail('Source notes are invalid.');
      metadata.source.notes = [...source.notes];
    }
    // A reviewed PDF version can coexist with an edited legacy question. Keep
    // the editable legacy fields intact while retaining the exact printed version.
    if (source.verifiedQuestion !== undefined) {
      const printed = source.verifiedQuestion;
      if (!printed || typeof printed !== 'object' || Array.isArray(printed)) fail('Verified source question is invalid.');
      const result = {};
      for (const key of ['text', 'code', 'year', 'marks', 'setNum', 'diagram', 'ext', 'optA', 'optB', 'optC', 'optD', 'natAnswer']) {
        if (typeof printed[key] !== 'string' || printed[key].length > (key === 'diagram' || key === 'natAnswer' ? 2000 : 20000)) fail(`Verified source ${key} is invalid.`);
        result[key] = printed[key];
      }
      if (!result.text.trim() || !['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(result.ext)) fail('Verified source content is incomplete.');
      const answer = normalizeQuestionMetadata({ questionType: printed.questionType, correctOptions: printed.correctOptions }, fail);
      if (!answer.questionType || !answer.correctOptions) fail('Verified source answer is incomplete.');
      const options = [result.optA, result.optB, result.optC, result.optD];
      if (answer.questionType === 'NAT' ? options.some(Boolean) || !result.natAnswer || answer.correctOptions.length
        : options.some((option) => !option) || !answer.correctOptions.length
          || (answer.questionType === 'MCQ' && answer.correctOptions.length !== 1)) fail('Verified source answer is invalid.');
      metadata.source.verifiedQuestion = { ...result, ...answer };
    }
    if (source.reviewConflicts !== undefined) {
      if (!Array.isArray(source.reviewConflicts) || source.reviewConflicts.length > 30
        || source.reviewConflicts.some((entry) => typeof entry !== 'string' || !entry.trim() || entry.length > 500)) fail('Source review conflicts are invalid.');
      metadata.source.reviewConflicts = [...source.reviewConflicts];
    }
  }
  return metadata;
}
