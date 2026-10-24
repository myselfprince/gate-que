import { NextResponse } from 'next/server';
import { createJob, listJobs } from '@/lib/pdf-jobs.mjs';
import { jsonError, parseJson, rateLimit, requireMutationAccess, requireReadAccess, validateExportPayload } from '@/lib/api-utils';

export const runtime = 'nodejs';
export async function GET(request) {
  const denied = requireReadAccess(request);
  if (denied) return denied;
  return NextResponse.json({ jobs: (await listJobs()).slice(0, 30) }, { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST(request) {
  const denied = requireMutationAccess(request);
  if (denied) return denied;
  const limited = rateLimit(request, 'pdf-jobs', { limit: 8, windowMs: 60_000 });
  if (limited) return limited;
  try {
    const payload = validateExportPayload(await parseJson(request));
    if (!payload.questions.length) return jsonError('At least one question is required.');
    const job = await createJob(payload);
    return NextResponse.json({ job }, { status: 202, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Export job creation failed:', error);
    return jsonError(error.code === 'ENOENT' ? 'A question image is missing. Check the diagram references.' : error.message, 400);
  }
}
