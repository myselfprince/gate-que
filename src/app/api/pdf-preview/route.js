import { NextResponse } from 'next/server';
import { exportQuestionPdf, PdfExportError } from '@/lib/pdf-export.mjs';
import { jsonError, parseJson, rateLimit, requireMutationAccess, validateExportPayload, ValidationError } from '@/lib/api-utils';

export const runtime = 'nodejs';
export async function POST(request) {
  const denied = requireMutationAccess(request);
  if (denied) return denied;
  const limited = rateLimit(request, 'pdf-live-preview', { limit: 40, windowMs: 60_000 });
  if (limited) return limited;
  try {
    const data = await parseJson(request);
    if (!Array.isArray(data.questions) || data.questions.length !== 1) throw new ValidationError('Choose one example question for the PDF preview.');
    const payload = validateExportPayload(data);
    payload.pdfSettings = { ...payload.pdfSettings, includeAnswerKey: false, includePageImages: false };
    // Temporary compiler files are cleaned by exportQuestionPdf. Live previews never create jobs.
    const result = await exportQuestionPdf(payload, { signal: request.signal });
    return new NextResponse(new Uint8Array(result.pdf), { headers: { 'Content-Type': 'application/pdf', 'Cache-Control': 'no-store', 'X-PDF-Pages': String(result.report.pages), 'X-PDF-Warnings': encodeURIComponent(JSON.stringify(result.report.warnings)) } });
  } catch (error) {
    if (request.signal.aborted) return jsonError('Preview cancelled.', 499);
    if (error instanceof ValidationError || error instanceof PdfExportError) return jsonError(error.message, 422);
    console.error('PDF preview failed:', error);
    return jsonError('PDF preview could not be generated. Check the question and compiler, then retry.', 500);
  }
}
