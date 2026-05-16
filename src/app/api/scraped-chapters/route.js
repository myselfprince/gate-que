import { NextResponse } from 'next/server';
import dbConnect2 from '@/lib/mongodb2';
import ScrapedChapterSchema from '@/models/ScrapedChapter';

export async function POST(req) {
  try {
    const conn = await dbConnect2();
    const ScrapedChapter = conn.models.ScrapedChapter || conn.model('ScrapedChapter', ScrapedChapterSchema);
    
    const { subject, chapter, questions } = await req.json();
    
    const savedChapter = await ScrapedChapter.findOneAndUpdate(
      { subject, chapter },
      { questions },
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
    const conn = await dbConnect2();
    const ScrapedChapter = conn.models.ScrapedChapter || conn.model('ScrapedChapter', ScrapedChapterSchema);
    
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    const chapter = searchParams.get('chapter');
    
    if (subject && chapter) {
      const data = await ScrapedChapter.findOne({ subject, chapter });
      return NextResponse.json({ success: true, data });
    } else {
      const chapters = await ScrapedChapter.find({}, 'subject chapter -_id');
      return NextResponse.json({ success: true, data: chapters });
    }
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}