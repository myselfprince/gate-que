import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chapter from '@/models/Chapter';
import Target from '@/models/Target';

export async function GET(req) {
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
    console.error("GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const { subject, chapter, targetCount } = await req.json();

    // Update or create the target count
    const savedTarget = await Target.findOneAndUpdate(
      { subject, chapter },
      { targetCount: parseInt(targetCount) || 0 },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: savedTarget });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}