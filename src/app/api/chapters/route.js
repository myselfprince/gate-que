import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chapter from '@/models/Chapter';
import { chapterQuestionWindow, mergeLoadedChapter } from '@/lib/chapter-loading.mjs';
import { jsonError, parseJson, requireMutationAccess, requireReadAccess, unexpectedError, validateChapterIdentity, validateChapterPayload, ValidationError } from '@/lib/api-utils';

export const runtime = 'nodejs';

export async function POST(request) {
  const denied = requireMutationAccess(request);
  if (denied) return denied;
  try {
    const body = await parseJson(request);
    const payload = validateChapterPayload(body);
    const { subject, chapter, questions, lockCount } = payload;
    if (body.loadedCount !== undefined && (!Number.isSafeInteger(body.loadedCount) || body.loadedCount < 0
      || typeof body.expectedUpdatedAt !== 'string' || !Number.isFinite(Date.parse(body.expectedUpdatedAt)))) {
      throw new ValidationError('A valid loaded question count and chapter revision are required.');
    }
    await dbConnect();

    if (body.loadedCount !== undefined) {
      const revision = new Date(body.expectedUpdatedAt);
      const current = await Chapter.findOne({ subject, chapter, updatedAt: revision }).lean();
      if (!current) return jsonError('This chapter changed in the database. Reload it before saving.', 409);
      let merged;
      try { merged = mergeLoadedChapter(current, payload, body.loadedCount); }
      catch (error) { throw new ValidationError(error.message); }
      const saved = await Chapter.findOneAndUpdate(
        { _id: current._id, updatedAt: revision },
        { $set: merged },
        { new: true, runValidators: true }
      ).select('-questions').lean();
      if (!saved) return jsonError('This chapter changed in the database. Reload it before saving.', 409);
      return NextResponse.json({ success: true, data: { ...saved, totalQuestions: merged.questions.length } });
    }
    
    const savedChapter = await Chapter.findOneAndUpdate(
      { subject, chapter },
      { $set: { questions, lockCount } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json({ success: true, data: { ...savedChapter.toObject(), totalQuestions: savedChapter.questions.length } });
  } catch (error) {
    if (error instanceof ValidationError) return jsonError(error.message);
    console.error('Chapter POST error:', error);
    return unexpectedError();
  }
}

export async function GET(request) {
  const denied = requireReadAccess(request);
  if (denied) return denied;
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const chapter = searchParams.get('chapter');

    if (subject && chapter) {
      const identity = validateChapterIdentity({ subject, chapter });
      let window;
      try { window = chapterQuestionWindow(searchParams); }
      catch (error) { throw new ValidationError(error.message); }
      await dbConnect();
      const allQuestions = { $ifNull: ['$questions', []] };
      const totalQuestions = { $size: allQuestions };
      const [data] = await Chapter.aggregate([
        { $match: identity },
        { $project: {
          subject: 1, chapter: 1, lockCount: 1, createdAt: 1, updatedAt: 1,
          totalQuestions,
          questions: window.limit === null && window.offset === 0
            ? allQuestions
            : { $slice: [allQuestions, window.offset, window.limit ?? { $max: [1, totalQuestions] }] },
        } },
      ]);
      return NextResponse.json({ success: true, data: data ?? null });
    } else {
      await dbConnect();
      const chapters = await Chapter.find({}, 'subject chapter -_id').lean();
      return NextResponse.json({ success: true, data: chapters });
    }
  } catch (error) {
    if (error instanceof ValidationError) return jsonError(error.message);
    console.error('Chapter GET error:', error);
    return unexpectedError();
  }
}
