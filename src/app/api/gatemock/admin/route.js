import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chapter from '@/models/Chapter';
import MockPaper from '@/models/MockPaper';
import YearPaper from '@/models/YearPaper';
import { adminQuestionRecord, validateAdminAnswer, validateAdminLinks } from '@/lib/mock-admin.mjs';
import { publicPaper } from '@/lib/year-papers.mjs';
import { readMockBank, mockCatalog } from '@/lib/gatemock-server';
import { validatePaper } from '@/lib/gatemock.mjs';
import { normalizeQuestionMetadata } from '@/lib/question-metadata.mjs';
import { requireReadAccess, requireMutationAccess, parseJson, jsonError, unexpectedError, ValidationError } from '@/lib/api-utils';
export const runtime = 'nodejs';
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
    const body = await parseJson(request, 10000);
    if (!body || typeof body.questionId !== 'string' || typeof body.expectedUpdatedAt !== 'string'
      || !Number.isFinite(Date.parse(body.expectedUpdatedAt))) return jsonError('Question identity and revision are required.');
    const isPaper = typeof body.datasetId === 'string' && /^[a-z0-9-]{1,100}$/.test(body.datasetId);
    if (!isPaper && (typeof body.chapterId !== 'string' || !/^[a-f0-9]{24}$/i.test(body.chapterId))) return jsonError('Question storage is invalid.');
    await dbConnect();
    const Model = isPaper ? YearPaper : Chapter;
    const identity = isPaper ? { datasetId: body.datasetId } : { _id: body.chapterId };
    const before = await Model.findOne(identity).lean();
    if (!before) return jsonError('Question collection not found.', 404);
    if (new Date(before.updatedAt).getTime() !== Date.parse(body.expectedUpdatedAt)) return jsonError('This paper or chapter changed. Refresh inventory before saving. Your draft is still available.', 409);
    const question = before.questions.find(q => q.id === body.questionId && !q.isBlank && (!isPaper || q.key === body.key));
    if (!question) return jsonError('Question not found.', 404);
    let answer;
    try { answer = body.action === 'links' ? validateAdminLinks(body) : validateAdminAnswer(body, question); } catch (error) { return jsonError(error.message); }
    const questions = before.questions.map(q => q === question ? { ...q, ...answer,
      [body.action === 'links' ? 'linksUpdatedAt' : 'answerReviewedAt']: new Date().toISOString() } : q);
    const saved = await Model.findOneAndUpdate({ _id: before._id, updatedAt: before.updatedAt }, { $set: { questions } }, { new: true }).select('updatedAt').lean();
    if (!saved) return jsonError('This paper or chapter changed. Refresh inventory before saving. Your draft is still available.', 409);
    return NextResponse.json({ success: true, answer, updatedAt: saved.updatedAt });
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
    const saved = await MockPaper.findOneAndUpdate({ year: paper.year, examPaper: paper.examPaper, setNum: paper.setNum }, { $set: paper }, { upsert: true, new: true, runValidators: true });
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
    const before = await Chapter.findOne({ _id: body.chapterId, updatedAt: new Date(body.expectedUpdatedAt) }).lean();
    if (!before) return jsonError('Chapter changed. Refresh coverage before saving.', 409);
    if (!before.questions.some(q => q.id === body.questionId && !q.isBlank)) return jsonError('Question not found.', 404);
    const questions = before.questions.map(q => q.id === body.questionId ? { ...q, ...metadata, year: body.year, setNum: body.setNum } : q);
    const saved = await Chapter.findOneAndUpdate({ _id: before._id, updatedAt: before.updatedAt }, { $set: { questions } }, { new: true }).select('updatedAt').lean();
    if (!saved) return jsonError('Chapter changed. Refresh coverage before saving.', 409);
    return NextResponse.json({ success: true, updatedAt: saved.updatedAt });
  } catch (error) { console.error('Mock question mapping failed:', error.name); return unexpectedError(); }
}
