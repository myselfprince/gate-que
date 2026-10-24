import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';
import { collectLatexImages } from '@/lib/latex-source.mjs';
import { buildQuestionPages } from '@/lib/question-pages.mjs';
import { jsonError, parseJson, rateLimit, requireMutationAccess, validateExportPayload, ValidationError } from '@/lib/api-utils';

export const runtime = 'nodejs';

export async function POST(request) {
  const denied = requireMutationAccess(request);
  if (denied) return denied;
  const limited = rateLimit(request, 'export-latex', { limit: 10, windowMs: 60_000 });
  if (limited) return limited;
  try {
    const payload = validateExportPayload(await parseJson(request));
    if (!payload.questions.length) return jsonError('At least one question is required for export.');
    const zip = new AdmZip();
    const files = collectLatexImages(payload.questions);
    for (const file of files) {
      try {
        const buffer = await fs.readFile(path.join(process.cwd(), 'public', payload.subject, payload.chapter, file));
        zip.addFile(`images/${file}`, buffer);
      } catch (error) {
        if (error.code === 'ENOENT') return jsonError(`An image is missing: ${file}`);
        throw error;
      }
    }
    zip.addFile('main.tex', Buffer.from(buildQuestionPages(payload), 'utf8'));
    zip.addFile('chapter.json', Buffer.from(JSON.stringify(payload, null, 2), 'utf8'));
    zip.addFile('README.txt', Buffer.from('Extract this ZIP before compiling main.tex with pdflatex. Each question uses one black landscape page, matching the PDF export. Keep the images folder next to main.tex. The JSON preserves editable question data, source references and available answer keys; answers are not printed on the question pages.\n', 'utf8'));
    return new NextResponse(zip.toBuffer(), {
      headers: { 'Content-Type': 'application/zip', 'Content-Disposition': 'attachment; filename="gate-pyqs-latex.zip"', 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    if (error instanceof ValidationError) return jsonError(error.message);
    console.error('LaTeX source export failed:', error);
    return jsonError('LaTeX source export failed. Check the question image references.', 500);
  }
}
