import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Preference from '@/models/Preference';

export async function GET() {
  try {
    await dbConnect();
    const prefs = await Preference.findOne({ user: 'admin' });
    return NextResponse.json({ success: true, data: prefs });
  } catch (error) {
    console.error("Prefs GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const { subject, chapter } = await req.json();
    
    // Upsert: Create it if it doesn't exist, update it if it does
    const prefs = await Preference.findOneAndUpdate(
      { user: 'admin' },
      { lastSubject: subject, lastChapter: chapter },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({ success: true, data: prefs });
  } catch (error) {
    console.error("Prefs POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}