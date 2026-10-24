import { NextResponse } from 'next/server';
import { readJob, cancelJob, retryJob } from '@/lib/pdf-jobs.mjs';
import { jsonError, parseJson, rateLimit, requireMutationAccess, requireReadAccess } from '@/lib/api-utils';

export const runtime = 'nodejs';
export async function GET(request, { params }) {
  const denied = requireReadAccess(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const job = await readJob(id);
    return job ? NextResponse.json({ job }, { headers: { 'Cache-Control': 'no-store' } }) : jsonError('Export not found.', 404);
  } catch { return jsonError('Export not found.', 404); }
}
export async function POST(request, { params }) {
  const denied = requireMutationAccess(request);
  if (denied) return denied;
  const limited = rateLimit(request, 'pdf-job-actions', { limit: 12, windowMs: 60_000 });
  if (limited) return limited;
  try {
    const { id } = await params;
    const { action } = await parseJson(request);
    if (!['cancel', 'retry'].includes(action)) return jsonError('Choose cancel or retry.');
    const job = await (action === 'cancel' ? cancelJob(id) : retryJob(id));
    return job ? NextResponse.json({ job }) : jsonError('Export not found.', 404);
  } catch (error) { return jsonError(error.message, 400); }
}
