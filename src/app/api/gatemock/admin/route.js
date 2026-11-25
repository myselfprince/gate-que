import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chapter from '@/models/Chapter';
import MockPaper from '@/models/MockPaper';
import YearPaper from '@/models/YearPaper';
import { adminQuestionRecord, validateAdminAnswer, validateAdminLinks, validateAdminReview, verifyAdminAnswer } from '@/lib/mock-admin.mjs';
import { publicPaper } from '@/lib/year-papers.mjs';
import { readMockBank, mockCatalog } from '@/lib/gatemock-server';
import { validatePaper } from '@/lib/gatemock.mjs';
import { normalizeQuestionMetadata } from '@/lib/question-metadata.mjs';
import { requireReadAccess, requireMutationAccess, parseJson, jsonError, unexpectedError, ValidationError } from '@/lib/api-utils';
export const runtime = 'nodejs';

// Sets a few fields on one question in place (the first array entry matching `match`),
// guarded by the revision the admin page loaded. Nothing else in the chapter or paper is rewritten.
async function updateOneQuestion(Model, { _id, updatedAt }, match, fields) {
  const now = new Date();
  const set = { updatedAt: now };
  for (const [key, value] of Object.entries(fields)) if (value !== undefined) set[`questions.$.${key}`] = value;
  const result = await Model.collection.updateOne({ _id, updatedAt, questions: { $elemMatch: match } }, { $set: set });
  return result.matchedCount ? now : null;
}
export async function GET(request) {
  const denied = requireReadAccess(request); if (denied) return denied;
  try {
    await dbConnect();
    const slug = new URL(request.url).searchParams.get('paper');
    if (slug && !/^[a-z0-9-]{1,100}$/.test(slug)) return jsonError('Paper identity is invalid.');
    let inventory;
    if (slug) {
      const paper = await YearPaper.findOne({ slug }).lean();
      if (!paper) return jsonError('Previous-year paper not found.', 404);
      inventory = { bank: paper.questions, papers: [publicPaper(paper)], yearPapers: [paper] };
    } else inventory = await readMockBank();
    const { bank, papers, yearPapers } = inventory;
    const revisions = new Map(yearPapers.map(paper => [paper.datasetId, paper.updatedAt]));
    return NextResponse.json({ success: true, ...mockCatalog(bank, papers), records: bank.map(q => adminQuestionRecord(q, revisions.get(q.datasetId))) }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { console.error('Mock admin read failed:', error.name); return unexpectedError(); }
}
export async function PUT(request) {
  const denied = requireMutationAccess(request); if (denied) return denied;
  try {
    const body = await parseJson(request, 24000);
    if (!body || typeof body.questionId !== 'string' || typeof body.expectedUpdatedAt !== 'string'
      || !Number.isFinite(Date.parse(body.expectedUpdatedAt))) return jsonError('Question identity and revision are required.');
    const isPaper = typeof body.datasetId === 'string' && /^[a-z0-9-]{1,100}$/.test(body.datasetId);
    if (!isPaper && (typeof body.chapterId !== 'string' || !/^[a-f0-9]{24}$/i.test(body.chapterId))) return jsonError('Question storage is invalid.');
    await dbConnect();
    const Model = isPaper ? YearPaper : Chapter;
    const identity = isPaper ? { datasetId: body.datasetId } : { _id: body.chapterId };
    const match = { id: body.questionId, isBlank: { $ne: true }, ...(isPaper ? { key: body.key } : {}) };
    // Read only the one question being edited, not the whole chapter or paper.
    const before = await Model.findOne(identity, { updatedAt: 1, questions: { $elemMatch: match } }).lean();
    if (!before) return jsonError('Question collection not found.', 404);
    if (new Date(before.updatedAt).getTime() !== Date.parse(body.expectedUpdatedAt)) return jsonError('This paper or chapter changed. Refresh inventory before saving. Your draft is still available.', 409);
    const question = before.questions?.[0];
    if (!question || question.isBlank) return jsonError('Question not found.', 404);
    let answer;
    try { answer = body.action === 'links' ? validateAdminLinks(body) : body.action === 'review' ? validateAdminReview(body, question) : body.action === 'verify' ? verifyAdminAnswer(body, question) : validateAdminAnswer(body, question); } catch (error) { return jsonError(error.message); }
    const updatedAt = await updateOneQuestion(Model, before, match, { ...answer,
      [body.action === 'links' ? 'linksUpdatedAt' : 'answerReviewedAt']: new Date().toISOString() });
    if (!updatedAt) return jsonError('This paper or chapter changed. Refresh inventory before saving. Your draft is still available.', 409);
    return NextResponse.json({ success: true, answer, updatedAt });
  } catch (error) {
    if (error instanceof ValidationError || error.name === 'ValidationError') return jsonError(error.message);
    console.error('Mock answer save failed:', error.name); return unexpectedError();
  }
}
export async function POST(request) {
  const denied = requireMutationAccess(request); if (denied) return denied;
  try {
    const body = await parseJson(request, 10000); let paper;
    try { paper = validatePaper(body); } catch (error) { return jsonError(error.message); }
    await dbConnect();
    const saved = await MockPaper.findOneAndUpdate({ year: paper.year, examPaper: paper.examPaper, setNum: paper.setNum }, { $set: paper }, { upsert: true, returnDocument: 'after', runValidators: true });
    return NextResponse.json({ success: true, paper: saved });
  } catch (error) { if (error.name === 'ValidationError') return jsonError(error.message); console.error('Mock paper save failed:', error.name); return unexpectedError(); }
}
export async function PATCH(request) {
  const denied = requireMutationAccess(request); if (denied) return denied;
  try {
    const body = await parseJson(request, 10000);
    let metadata;
    try { metadata = normalizeQuestionMetadata({ examPaper: body.examPaper, paperQuestionNumber: body.paperQuestionNumber }); } catch (error) { return jsonError(error.message); }
    if (!metadata.examPaper || metadata.paperQuestionNumber === undefined || !/^(19|20)\d{2}$/.test(body.year || '')
      || typeof body.setNum !== 'string' || !/^[\w -]{0,16}$/.test(body.setNum) || typeof body.chapterId !== 'string' || !/^[a-f0-9]{24}$/i.test(body.chapterId)
      || typeof body.questionId !== 'string' || typeof body.expectedUpdatedAt !== 'string' || !Number.isFinite(Date.parse(body.expectedUpdatedAt))) return jsonError('Question mapping is invalid.');
    await dbConnect();
    const match = { id: body.questionId, isBlank: { $ne: true } };
    const before = await Chapter.findOne({ _id: body.chapterId, updatedAt: new Date(body.expectedUpdatedAt) }, { updatedAt: 1, questions: { $elemMatch: match } }).lean();
    if (!before) return jsonError('Chapter changed. Refresh coverage before saving.', 409);
    if (!before.questions?.[0] || before.questions[0].isBlank) return jsonError('Question not found.', 404);
    const updatedAt = await updateOneQuestion(Chapter, before, match, { ...metadata, year: body.year, setNum: body.setNum });
    if (!updatedAt) return jsonError('Chapter changed. Refresh coverage before saving.', 409);
    return NextResponse.json({ success: true, updatedAt });
  } catch (error) { console.error('Mock question mapping failed:', error.name); return unexpectedError(); }
}
