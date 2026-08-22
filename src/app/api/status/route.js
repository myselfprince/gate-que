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

    // 1. Get actual question counts from the main Chapter DB
    const chapters = await Chapter.find({}, 'subject chapter questions');
    const actualCounts = {};
    chapters.forEach(ch => {
      actualCounts[`${ch.subject}|${ch.chapter}`] = ch.questions ? ch.questions.length : 0;
    });

    // 2. Get user-defined target counts from the Target DB
    const targets = await Target.find({});
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
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, data: savedTarget });
  } catch (error) {
    if (error instanceof ValidationError) return jsonError(error.message);
    console.error('Status POST error:', error);
    return unexpectedError();
  }
}
