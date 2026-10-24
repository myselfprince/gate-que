import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { jobDirectory, readJob } from '@/lib/pdf-jobs.mjs';
import { jsonError, requireReadAccess } from '@/lib/api-utils';

export const runtime = 'nodejs';
export async function GET(request, { params }) {
  const denied = requireReadAccess(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const job = await readJob(id);
    if (!job) return jsonError('Export not found.', 404);
    if (job.status !== 'completed') return jsonError('This export is not ready.', 409);
    const kind = new URL(request.url).searchParams.get('kind') || 'pdf';
    const files = { pdf: ['complete.pdf', 'application/pdf'], zip: ['parts.zip', 'application/zip'], report: ['report.json', 'application/json'] };
    if (!Object.hasOwn(files, kind)) return jsonError('Unknown download format.');
    const [file, type] = files[kind];
    const bytes = await fs.readFile(/* turbopackIgnore: true */ path.join(/* turbopackIgnore: true */ jobDirectory(id), file));
    const inline = kind === 'pdf' && new URL(request.url).searchParams.get('inline') === '1';
    return new NextResponse(new Uint8Array(bytes), { headers: { 'Content-Type': type, 'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="G4Gate-${job.total}-questions.${kind === 'report' ? 'json' : kind}"`, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return jsonError('Export file unavailable.', 404); }
}
