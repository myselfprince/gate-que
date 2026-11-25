import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chapter from '@/models/Chapter';
import { COVERAGE_PROJECTION, topicCoverageRows } from '@/lib/topic-answers-server.mjs';
import { topicList } from '@/lib/topic-answer-prompt.mjs';
import { requireReadAccess, rateLimit } from '@/lib/api-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Read-only: live answer coverage for every chapter, for the topic answer prompt page.
export async function GET(request) {
  const denied = requireReadAccess(request); if (denied) return denied;
  const limited = rateLimit(request, 'topic-answer-tracker', { limit: 30, windowMs: 60000 }); if (limited) return limited;
  let rows = null;
  try {
    await dbConnect();
    rows = await topicCoverageRows(await Chapter.find({}, COVERAGE_PROJECTION).lean());
  } catch (error) {
    console.error('Topic answer coverage error:', error);
  }
  return NextResponse.json({
    success: true,
    topics: topicList(rows),
    statusAvailable: Boolean(rows),
    warning: rows ? null : 'Database status is unavailable. Prompts still work; answer counts return when the database reconnects.',
    refreshedAt: new Date().toISOString(),
  }, { headers: { 'Cache-Control': 'no-store' } });
}
