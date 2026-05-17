import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chapter from '@/models/Chapter';

export async function POST(req) {
  try {
    await dbConnect();
    // 🔥 NEW: Extract lockCount (defaulting to 0 if missing)
    const { subject, chapter, questions, lockCount = 0 } = await req.json();
    
    const savedChapter = await Chapter.findOneAndUpdate(
      { subject, chapter },
      { questions, lockCount }, // 🔥 NEW: Save to DB
      { new: true, upsert: true }
    );
    return NextResponse.json({ success: true, data: savedChapter });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect(); // Moved inside the try block
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    const chapter = searchParams.get('chapter');

    if (subject && chapter) {
      const data = await Chapter.findOne({ subject, chapter });
      return NextResponse.json({ success: true, data });
    } else {
      const chapters = await Chapter.find({}, 'subject chapter -_id');
      return NextResponse.json({ success: true, data: chapters });
    }
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}