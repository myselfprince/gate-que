import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chapter from '@/models/Chapter';
import MockPaper from '@/models/MockPaper';
import { readMockBank, mockCatalog } from '@/lib/gatemock-server';
import { validatePaper } from '@/lib/gatemock.mjs';
import { normalizeQuestionMetadata } from '@/lib/question-metadata.mjs';
import { requireReadAccess, requireMutationAccess, parseJson, jsonError, unexpectedError } from '@/lib/api-utils';
export const runtime = 'nodejs';
export async function GET(request) {
  const denied = requireReadAccess(request); if (denied) return denied;
  try {
    await dbConnect(); const { bank, papers } = await readMockBank();
    return NextResponse.json({ success: true, ...mockCatalog(bank, papers), records: bank.filter(q => !q.datasetId).map(q => ({
      key: q.key, chapterId: q.chapterId, questionId: q.id, subject: q.subject, chapter: q.chapter, text: q.text.slice(0, 240),
      year: q.year, examPaper: q.examPaper, setNum: q.setNum || '', paperQuestionNumber: q.paperQuestionNumber || '',
      marks: q.marks, chapterUpdatedAt: q.chapterUpdatedAt,
    })) });
  } catch (error) { console.error('Mock admin read failed:', error.name); return unexpectedError(); }
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
