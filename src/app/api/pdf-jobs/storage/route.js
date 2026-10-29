import { NextResponse } from 'next/server';
import { cleanupPdfStorage, pdfStorageUsage } from '@/lib/pdf-storage.mjs';
import { jsonError, parseJson, rateLimit, requireMutationAccess, requireReadAccess, ValidationError } from '@/lib/api-utils';

export const runtime = 'nodejs';

export async function GET(request) {
  const denied = requireReadAccess(request);
  if (denied) return denied;
  try {
    return NextResponse.json({ storage: await pdfStorageUsage() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return jsonError('Saved export storage could not be checked. Please try again.', 500); }
}

export async function DELETE(request) {
  const denied = requireMutationAccess(request);
  if (denied) return denied;
  const limited = rateLimit(request, 'pdf-storage-cleanup', { limit: 8, windowMs: 60_000 });
  if (limited) return limited;
  try {
    const target = (await parseJson(request))?.target;
    if (!['exports', 'images'].includes(target)) return jsonError('Choose saved PDFs or generated page images.');
    const result = await cleanupPdfStorage(target);
    return NextResponse.json({ success: true, result }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return jsonError(error instanceof ValidationError ? error.message : 'Storage cleanup could not finish. Refresh storage and try again.', error instanceof ValidationError ? 400 : 500); }
}
