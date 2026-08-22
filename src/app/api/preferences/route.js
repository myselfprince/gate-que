import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Preference from '@/models/Preference';
import { jsonError, parseJson, requireMutationAccess, requireReadAccess, unexpectedError, validatePreferencePayload, ValidationError } from '@/lib/api-utils';

export const runtime = 'nodejs';

export async function GET(request) {
  const denied = requireReadAccess(request);
  if (denied) return denied;
  try {
    await dbConnect();
    const prefs = await Preference.findOne({ user: 'admin' });
    return NextResponse.json({ success: true, data: prefs });
  } catch (error) {
    console.error('Preferences GET error:', error);
    return unexpectedError();
  }
}

export async function POST(request) {
  const denied = requireMutationAccess(request);
  if (denied) return denied;
  try {
    await dbConnect();
    const { subject, chapter } = validatePreferencePayload(await parseJson(request));
    
    // Upsert: Create it if it doesn't exist, update it if it does
    const prefs = await Preference.findOneAndUpdate(
      { user: 'admin' },
      { $set: { lastSubject: subject, lastChapter: chapter } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    
    return NextResponse.json({ success: true, data: prefs });
  } catch (error) {
    if (error instanceof ValidationError) return jsonError(error.message);
    console.error('Preferences POST error:', error);
    return unexpectedError();
  }
}
