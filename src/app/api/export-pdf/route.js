import { NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import { exportQuestionPdf, PdfExportError } from '@/lib/pdf-export.mjs';
import { jsonError, parseJson, rateLimit, requireMutationAccess, validateExportPayload, ValidationError } from '@/lib/api-utils';

export const runtime = 'nodejs';

export async function POST(request) {
  const denied = requireMutationAccess(request);
  if (denied) return denied;
  const limited = rateLimit(request, 'export-pdf', { limit: 4, windowMs: 60_000 });
  if (limited) return limited;
  try {
    const body = await parseJson(request);
    const payload = validateExportPayload(body);
    const format = body.format || 'zip';
    if (!['pdf', 'zip'].includes(format)) return jsonError('Choose PDF or ZIP export.');
    const result = await exportQuestionPdf(payload, { signal: request.signal });
    const headers = { 'Cache-Control': 'no-store', 'X-PDF-Pages': String(result.report.pages), 'X-PDF-Warnings': String(result.report.warnings.length) };
    if (format === 'pdf') return new NextResponse(new Uint8Array(result.pdf), { headers: { ...headers, 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="gate-pyqs.pdf"' } });
    const zip = new AdmZip();
    for (const part of result.parts) zip.addFile(`PYQs_Part${part.number}.pdf`, part.bytes);
    if (result.answerKey) zip.addFile('Answer-Key.pdf', result.answerKey);
    return new NextResponse(zip.toBuffer(), { headers: { ...headers, 'Content-Type': 'application/zip', 'Content-Disposition': 'attachment; filename="gate-pyqs.zip"' } });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof PdfExportError) return jsonError(error.message, 400);
    console.error('PDF export failed:', error);
    return jsonError('PDF generation failed. Please try again.', 500);
  }
}
