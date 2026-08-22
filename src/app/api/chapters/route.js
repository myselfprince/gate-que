import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chapter from '@/models/Chapter';
import { jsonError, parseJson, requireMutationAccess, requireReadAccess, unexpectedError, validateChapterIdentity, validateChapterPayload, ValidationError } from '@/lib/api-utils';

export const runtime = 'nodejs';

export async function POST(request) {
  const denied = requireMutationAccess(request);
  if (denied) return denied;
  try {
    await dbConnect();
    const { subject, chapter, questions, lockCount } = validateChapterPayload(await parseJson(request));
    
    const savedChapter = await Chapter.findOneAndUpdate(
      { subject, chapter },
      { $set: { questions, lockCount } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json({ success: true, data: savedChapter });
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
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const chapter = searchParams.get('chapter');

    if (subject && chapter) {
      const identity = validateChapterIdentity({ subject, chapter });
      const data = await Chapter.findOne(identity).lean();
      return NextResponse.json({ success: true, data });
    } else {
      const chapters = await Chapter.find({}, 'subject chapter -_id').lean();
      return NextResponse.json({ success: true, data: chapters });
    }
  } catch (error) {
    if (error instanceof ValidationError) return jsonError(error.message);
    console.error('Chapter GET error:', error);
    return unexpectedError();
  }
}
