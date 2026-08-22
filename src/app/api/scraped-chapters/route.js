import { NextResponse } from 'next/server';
import dbConnect2 from '@/lib/mongodb2';
import ScrapedChapterSchema from '@/models/ScrapedChapter';
import { jsonError, parseJson, requireMutationAccess, requireReadAccess, unexpectedError, validateChapterIdentity, validateScrapedChapterPayload, ValidationError } from '@/lib/api-utils';

export const runtime = 'nodejs';

export async function POST(request) {
  const denied = requireMutationAccess(request);
  if (denied) return denied;
  try {
    const conn = await dbConnect2();
    const ScrapedChapter = conn.models.ScrapedChapter || conn.model('ScrapedChapter', ScrapedChapterSchema);
    
    const { subject, chapter, questions } = validateScrapedChapterPayload(await parseJson(request));
    
    const savedChapter = await ScrapedChapter.findOneAndUpdate(
      { subject, chapter },
      { $set: { questions } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    
    return NextResponse.json({ success: true, data: savedChapter });
  } catch (error) {
    if (error instanceof ValidationError) return jsonError(error.message);
    console.error('Scraped chapter POST error:', error);
    return unexpectedError();
  }
}

export async function GET(request) {
  const denied = requireReadAccess(request);
  if (denied) return denied;
  try {
    const conn = await dbConnect2();
    const ScrapedChapter = conn.models.ScrapedChapter || conn.model('ScrapedChapter', ScrapedChapterSchema);
    
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const chapter = searchParams.get('chapter');
    
    if (subject && chapter) {
      const identity = validateChapterIdentity({ subject, chapter });
      const data = await ScrapedChapter.findOne(identity).lean();
      return NextResponse.json({ success: true, data });
    } else {
      const chapters = await ScrapedChapter.find({}, 'subject chapter -_id').lean();
      return NextResponse.json({ success: true, data: chapters });
    }
  } catch (error) {
    if (error instanceof ValidationError) return jsonError(error.message);
    console.error('Scraped chapter GET error:', error);
    return unexpectedError();
  }
}
