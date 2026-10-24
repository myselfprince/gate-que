import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { buildQuestionPages } from './question-pages.mjs';
import { collectLatexImages } from './latex-source.mjs';

const run = promisify(execFile);
export const PDF_BATCH_SIZE = 20;

export class PdfExportError extends Error {
  constructor(message, details = {}, cause) { super(message, { cause }); this.name = 'PdfExportError'; this.details = details; }
}

export async function mergeQuestionPdfs(parts, expectedPages, title = 'G4Gate questions') {
  const merged = await PDFDocument.create();
  for (const part of parts) {
    const document = await PDFDocument.load(part.bytes);
    if (document.getPageCount() !== part.count) throw new PdfExportError(`Part ${part.number} has an unexpected page count.`);
    for (const page of await merged.copyPages(document, document.getPageIndices())) merged.addPage(page);
  }
  if (merged.getPageCount() !== expectedPages) throw new PdfExportError('The completed PDF has an unexpected page count.');
  merged.setTitle(title);
  merged.setAuthor('G4Gate');
  return Buffer.from(await merged.save());
}

// HTTP and CLI share the same compiler. Combining PDF pages does not reflow text.
export async function exportQuestionPdf(payload, { projectRoot = process.cwd(), onProgress = async () => {}, signal } = {}) {
  const { subject, chapter, questions } = payload;
  if (!Array.isArray(questions) || !questions.length) throw new PdfExportError('At least one question is required.');
  for (const segment of [subject, chapter]) {
    if (typeof segment !== 'string' || !segment.trim() || /[\\/\x00-\x1f]/.test(segment) || segment.includes('..')) throw new PdfExportError('Invalid chapter location.');
  }
  const imageRoot = path.resolve(projectRoot, 'public', subject, chapter).replaceAll('\\', '/');
  for (const file of collectLatexImages(questions)) {
    try { await fs.access(path.join(imageRoot, file)); }
    catch { throw new PdfExportError(`An image is missing: ${file}`, { file }); }
    if (!/\.(png|jpe?g)$/i.test(file)) throw new PdfExportError(`Convert ${file} to PNG or JPEG before PDF export.`, { file });
  }
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'gate-pyq-pdf-'));
  const parts = [];
  const warnings = [];
  try {
    for (let index = 0; index < questions.length; index += PDF_BATCH_SIZE) {
      signal?.throwIfAborted();
      const number = parts.length + 1;
      const batch = questions.slice(index, index + PDF_BATCH_SIZE);
      const batchDirectory = path.join(directory, `part-${number}`);
      await fs.mkdir(batchDirectory);
      const tex = buildQuestionPages({ ...payload, questions: batch }, { startIndex: index, totalQuestions: questions.length, imageRoot });
      await fs.writeFile(path.join(batchDirectory, 'main.tex'), tex);
      let output;
      try {
        const result = await run(process.env.PDFLATEX_BIN || 'pdflatex', ['-no-shell-escape', '-halt-on-error', '-interaction=nonstopmode', '-file-line-error', 'main.tex'], {
          cwd: batchDirectory, windowsHide: true, timeout: 60_000, maxBuffer: 10 * 1024 * 1024, signal,
        });
        output = result.stdout;
      } catch (error) {
        if (signal?.aborted) throw error;
        const markers = [...(error.stdout || '').matchAll(/GATEQUESTION:(\d+)/g)];
        const questionIndex = markers.length ? Number(markers.at(-1)[1]) : index + 1;
        const reason = error.code === 'ENOENT' ? 'pdflatex is not installed or PDFLATEX_BIN is incorrect.'
          : /Access is denied/i.test(error.stdout || '') ? 'The TeX installation cannot access its configuration folders.'
          : error.killed ? 'Compilation timed out.' : 'Check this question’s math, code and image references.';
        throw new PdfExportError(`PDF failed near question ${questionIndex}. ${reason}`, { questionIndex, questionId: questions[questionIndex - 1]?.id, part: number }, error);
      }
      for (const line of output.split(/\r?\n/).filter(line => /Overfull|GATEFITWARNING/.test(line))) warnings.push({ part: number, message: line });
      const bytes = await fs.readFile(path.join(batchDirectory, 'main.pdf'));
      parts.push({ number, count: batch.length, bytes });
      await onProgress({ completed: Math.min(index + batch.length, questions.length), total: questions.length, part: number });
    }
    const pdf = await mergeQuestionPdfs(parts, questions.length, `${subject} - ${chapter}`);
    return { pdf, parts, report: { questions: questions.length, pages: questions.length, batches: parts.length, warnings, pageCountVerified: true } };
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
}
