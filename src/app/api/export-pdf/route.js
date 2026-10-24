import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import AdmZip from 'adm-zip';
import { buildQuestionPages } from '@/lib/question-pages.mjs';
import { collectLatexImages } from '@/lib/latex-source.mjs';
import { jsonError, parseJson, rateLimit, requireMutationAccess, validateExportPayload, ValidationError } from '@/lib/api-utils';

export const runtime = 'nodejs';

const execFileAsync = promisify(execFile);
const CHUNK_SIZE = 20;

export async function POST(request) {
  const denied = requireMutationAccess(request);
  if (denied) return denied;
  const limited = rateLimit(request, 'export-pdf', { limit: 4, windowMs: 60_000 });
  if (limited) return limited;

  let baseTempDir;
  try {
    const { subject, chapter, questions } = validateExportPayload(await parseJson(request));
    if (!questions.length) return jsonError('At least one question is required for export.');
    const imageRoot = path.join(process.cwd(), 'public', subject, chapter).replace(/\\/g, '/');
    for (const file of collectLatexImages(questions)) {
      try { await fs.access(path.join(imageRoot, file)); }
      catch (error) {
        if (error.code === 'ENOENT') return jsonError(`An image is missing: ${file}`);
        throw error;
      }
    }
    baseTempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gate-pyq-pdf-'));
    const zip = new AdmZip();
    for (let index = 0; index < questions.length; index += CHUNK_SIZE) {
      const chunkNumber = Math.floor(index / CHUNK_SIZE) + 1;
      const tempDir = path.join(baseTempDir, `chunk_${chunkNumber}`);
      await fs.mkdir(tempDir);
      const latex = buildQuestionPages({ subject, chapter, questions: questions.slice(index, index + CHUNK_SIZE) }, {
        startIndex: index, totalQuestions: questions.length, imageRoot,
      });
      await fs.writeFile(path.join(tempDir, 'gate_workbook.tex'), latex, 'utf8');
      await execFileAsync('pdflatex', [
        '-no-shell-escape', '-halt-on-error', '-interaction=nonstopmode', 'gate_workbook.tex',
      ], { cwd: tempDir, timeout: 60_000, maxBuffer: 10 * 1024 * 1024 });
      zip.addFile(`PYQs_Part${chunkNumber}.pdf`, await fs.readFile(path.join(tempDir, 'gate_workbook.pdf')));
    }
    return new NextResponse(zip.toBuffer(), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="gate-pyqs.pdf.zip"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) return jsonError(error.message);
    console.error('PDF generation error:', error);
    return jsonError('PDF generation failed. Check the LaTeX content, image references and pdflatex installation.', 500);
  } finally {
    if (baseTempDir) await fs.rm(baseTempDir, { recursive: true, force: true }).catch((error) => console.error('PDF cleanup error:', error));
  }
}
