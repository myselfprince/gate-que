import { selectPdfQuestions } from './pdf-selection.mjs';

export function pdfPreviewExamples(questions, sourceMode = 'editable') {
  const examples = selectPdfQuestions(questions, { includeBlanks: false, sourceMode });
  return examples.length ? examples : selectPdfQuestions(questions, { sourceMode }).slice(0, 1);
}
export function pdfPreviewPayload(payload, questionId, sourceMode = 'editable') {
  const examples = pdfPreviewExamples(payload.questions, sourceMode);
  const question = examples.find(question => question.id === questionId) || examples[0];
  if (!question) return null;
  return { ...payload, questions: [question], pdfSettings: { ...payload.pdfSettings, includeAnswerKey: false, includePageImages: false } };
}
