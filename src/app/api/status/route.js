import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chapter from '@/models/Chapter';
import Target from '@/models/Target';
import { jsonError, parseJson, requireMutationAccess, requireReadAccess, unexpectedError, validateStatusPayload, ValidationError } from '@/lib/api-utils';

export const runtime = 'nodejs';

export async function GET(request) {
  const denied = requireReadAccess(request);
  if (denied) return denied;
  try {
    await dbConnect();

    // 1. Question counts are computed inside MongoDB, so no question text leaves the database.
    // 2. User-defined target counts come from the Target collection.
    const [chapters, targets] = await Promise.all([
      Chapter.aggregate([{ $project: { _id: 0, subject: 1, chapter: 1, count: { $size: { $ifNull: ['$questions', []] } } } }]),
      Target.find({}, 'subject chapter targetCount -_id').lean(),
    ]);
    const actualCounts = {};
    chapters.forEach(ch => {
      actualCounts[`${ch.subject}|${ch.chapter}`] = ch.count;
    });
    const targetCounts = {};
    targets.forEach(t => {
      targetCounts[`${t.subject}|${t.chapter}`] = t.targetCount;
    });

    return NextResponse.json({ success: true, actualCounts, targetCounts });
  } catch (error) {
    console.error('Status GET error:', error);
    return unexpectedError();
  }
}

export async function POST(request) {
  const denied = requireMutationAccess(request);
  if (denied) return denied;
  try {
    await dbConnect();
    const { subject, chapter, targetCount } = validateStatusPayload(await parseJson(request));

    // Update or create the target count
    const savedTarget = await Target.findOneAndUpdate(
      { subject, chapter },
      { $set: { targetCount } },
      { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, data: savedTarget });
  } catch (error) {
    if (error instanceof ValidationError) return jsonError(error.message);
    console.error('Status POST error:', error);
    return unexpectedError();
  }
}
