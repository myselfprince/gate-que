import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { readMockBank, mockCatalog } from '@/lib/gatemock-server';
import { rateLimit, unexpectedError } from '@/lib/api-utils';
export const runtime = 'nodejs';
export async function GET(request) {
  const limited = rateLimit(request, 'mock-catalog', { limit: 60, windowMs: 60000 }); if (limited) return limited;
  try { await dbConnect(); const { bank, papers } = await readMockBank(); return NextResponse.json({ success: true, ...mockCatalog(bank, papers) }); }
  catch (error) { console.error('Mock catalog failed:', error.name); return unexpectedError(); }
}
