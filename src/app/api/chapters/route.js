import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chapter from '@/models/Chapter';
import { chapterQuestionWindow, mergeLoadedChapter } from '@/lib/chapter-loading.mjs';
import { applyChapterPatch, ChapterSyncConflict } from '@/lib/chapter-sync.mjs';
import { jsonError, parseJson, requireMutationAccess, requireReadAccess, unexpectedError, validateChapterIdentity, validateChapterPatch, validateChapterPayload, ValidationError } from '@/lib/api-utils';

export const runtime = 'nodejs';

const STRUCTURE_CONFLICT = 'This chapter changed in another tab or window. Click Load Database to get the latest version before adding, deleting or moving questions. Your text and answer edits are kept on screen.';

// Autosave. Edits to existing questions replace just those array entries, matched by id,
// in one small update; nothing else in the chapter is read or rewritten. Adding, removing
// or moving questions (or changing the bulk lock) sends the new id order and is accepted
// only against the exact revision the editor last saw.
export async function PATCH(request) {
  const denied = requireMutationAccess(request);
  if (denied) return denied;
  try {
    const patch = validateChapterPatch(await parseJson(request));
    const { subject, chapter, baseRevision, upserts } = patch;
    const base = baseRevision === null ? null : new Date(baseRevision);
    const now = new Date();
    await dbConnect();
    const chapters = Chapter.collection;

    if (patch.order === undefined && patch.lockCount === undefined) {
      if (!upserts.length) return NextResponse.json({ success: true, data: { updatedAt: baseRevision, revisionMatched: true } });
      const set = { updatedAt: now };
      const arrayFilters = upserts.map((question, index) => {
        set[`questions.$[q${index}]`] = question;
        return { [`q${index}.id`]: question.id };
      });
      const before = await chapters.findOneAndUpdate(
        { subject, chapter, 'questions.id': { $all: upserts.map(question => question.id) } },
        { $set: set },
        { arrayFilters, returnDocument: 'before', projection: { updatedAt: 1 } }
      );
      if (!before) return jsonError('Some of these questions are no longer in the database; they may have been moved or deleted in another window. Click Load Database to refresh.', 409);
      // The editor may advance its revision only if nothing else changed the chapter in between.
      const revisionMatched = Boolean(base) && before.updatedAt?.getTime() === base.getTime();
      return NextResponse.json({ success: true, data: { updatedAt: now, revisionMatched } });
    }

    if (base === null) {
      // First save of a chapter that has no database copy yet: create it, unless one appeared meanwhile.
      const created = applyChapterPatch({ questions: [], lockCount: 0 }, { ...patch, loadedCount: 0 });
      const result = await chapters.updateOne(
        { subject, chapter },
        { $setOnInsert: { subject, chapter, questions: created.questions, lockCount: created.lockCount, createdAt: now, updatedAt: now } },
        { upsert: true }
      );
      if (!result.upsertedCount) return jsonError('This chapter already exists in the database. Click Load Database to get it before saving.', 409);
      return NextResponse.json({ success: true, data: { updatedAt: now, revisionMatched: true, lockCount: created.lockCount, totalQuestions: created.questions.length } });
    }

    const existing = await chapters.findOne({ subject, chapter, updatedAt: base });
    if (!existing) return jsonError(STRUCTURE_CONFLICT, 409);
    let merged;
    try { merged = applyChapterPatch(existing, patch); }
    catch (error) {
      if (error instanceof ChapterSyncConflict) return jsonError(STRUCTURE_CONFLICT, 409);
      throw new ValidationError(error.message);
    }
    const result = await chapters.updateOne(
      { _id: existing._id, updatedAt: base },
      { $set: { questions: merged.questions, lockCount: merged.lockCount, updatedAt: now } }
    );
    if (!result.matchedCount) return jsonError(STRUCTURE_CONFLICT, 409);
    return NextResponse.json({ success: true, data: { updatedAt: now, revisionMatched: true, lockCount: merged.lockCount, totalQuestions: merged.questions.length } });
  } catch (error) {
    if (error instanceof ValidationError) return jsonError(error.message);
    console.error('Chapter PATCH error:', error);
    return unexpectedError();
  }
}

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
        { returnDocument: 'after', runValidators: true }
      ).select('-questions').lean();
      if (!saved) return jsonError('This chapter changed in the database. Reload it before saving.', 409);
      return NextResponse.json({ success: true, data: { ...saved, totalQuestions: merged.questions.length } });
    }
    
    const savedChapter = await Chapter.findOneAndUpdate(
      { subject, chapter },
      { $set: { questions, lockCount } },
      { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true }
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
