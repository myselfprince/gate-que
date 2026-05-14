import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chapter from '@/models/Chapter';
import Target from '@/models/Target';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch all chapters to count actual questions saved
    const chapters = await Chapter.find({}, 'subject chapter questions');
    // Fetch all targets you have set
    const targets = await Target.find({});

    const actualCounts = {};
    chapters.forEach(ch => {
      actualCounts[`${ch.subject}|${ch.chapter}`] = ch.questions.length;
    });

    const targetCounts = {};
    targets.forEach(t => {
      targetCounts[`${t.subject}|${t.chapter}`] = t.targetCount;
    });

    return NextResponse.json({ success: true, actualCounts, targetCounts });
  } catch (error) {
    console.error("Status GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const { subject, chapter, targetCount } = await req.json();
    
    await Target.findOneAndUpdate(
      { subject, chapter },
      { targetCount: Number(targetCount) },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Status POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}