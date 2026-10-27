import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { PDFDocument, PDFName } from 'pdf-lib';
import { load } from 'cheerio';
import { buildQuestionPages } from './question-pages.mjs';
import { collectLatexImages } from './latex-source.mjs';
import { normalizePdfSettings } from './pdf-settings.mjs';
import { expectedWebsiteLinks, visibleSolutionUrl } from './pdf-decorations.mjs';
import { addQuestionBookmarks } from './pdf-bookmarks.mjs';
import { buildAnswerKey } from './answer-key.mjs';
import { registerAnswerLayers } from './pdf-answers.mjs';

const run = promisify(execFile);
export const PDF_BATCH_SIZE = 20;

export class PdfExportError extends Error {
  constructor(message, details = {}, cause) { super(message, { cause }); this.name = 'PdfExportError'; this.details = details; }
}

async function inspectTextBounds(file, count, signal) {
  const { stdout } = await run(process.env.PDFTOTEXT_BIN || 'pdftotext', ['-bbox', file, '-'], { windowsHide: true, timeout: 60_000, maxBuffer: 20 * 1024 * 1024, signal });
  const xml = load(stdout, { xmlMode: true });
  const pages = xml('page').toArray();
  if (pages.length !== count) throw new PdfExportError('Text read-back has an unexpected page count.');
  pages.forEach((page, index) => {
    const width = Number(xml(page).attr('width')), height = Number(xml(page).attr('height'));
    const words = xml(page).find('word').toArray();
    if (!words.length) throw new PdfExportError(`Page ${index + 1} has no readable text.`);
    for (const word of words) {
      const node = xml(word);
      if (Number(node.attr('xMin')) < -1 || Number(node.attr('yMin')) < -1 || Number(node.attr('xMax')) > width + 1 || Number(node.attr('yMax')) > height + 1) throw new PdfExportError(`Text is outside page ${index + 1}. Reduce the font or diagram size.`, { questionIndex: index + 1 });
    }
  });
}

export async function mergeQuestionPdfs(parts, expectedPages, title = 'G4Gate questions', questions = []) {
  const merged = await PDFDocument.create();
  for (const part of parts) {
    const document = await PDFDocument.load(part.bytes);
    if (document.getPageCount() !== part.count) throw new PdfExportError(`Part ${part.number} has an unexpected page count.`);
    for (const page of await merged.copyPages(document, document.getPageIndices())) merged.addPage(page);
  }
  if (merged.getPageCount() !== expectedPages) throw new PdfExportError('The completed PDF has an unexpected page count.');
  merged.setTitle(title);
  merged.setAuthor('G4Gate');
  addQuestionBookmarks(merged, questions);
  registerAnswerLayers(merged);
  return Buffer.from(await merged.save());
}

// HTTP and CLI share the same compiler. Combining PDF pages does not reflow text.
export async function exportQuestionPdf(payload, { projectRoot = process.cwd(), assetDirectory, checkpointDirectory, onProgress = async () => {}, signal } = {}) {
  const { subject, chapter, questions } = payload;
  if (!Array.isArray(questions) || !questions.length) throw new PdfExportError('At least one question is required.');
  for (const segment of [subject, chapter]) {
    if (typeof segment !== 'string' || !segment.trim() || /[\\/\x00-\x1f]/.test(segment) || segment.includes('..')) throw new PdfExportError('Invalid chapter location.');
  }
  const imageRoot = (assetDirectory || path.resolve(projectRoot, 'public', subject, chapter)).replaceAll('\\', '/');
  const assetHashes = {};
  for (const file of collectLatexImages(questions)) {
    try { await fs.access(path.join(imageRoot, file)); }
    catch { throw new PdfExportError(`An image is missing: ${file}`, { file }); }
    if (!/\.(png|jpe?g)$/i.test(file)) throw new PdfExportError(`Convert ${file} to PNG or JPEG before PDF export.`, { file });
    assetHashes[file] = createHash('sha256').update(await fs.readFile(path.join(imageRoot, file))).digest('hex');
  }
  if (checkpointDirectory) await fs.mkdir(checkpointDirectory, { recursive: true });
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'gate-pyq-pdf-'));
  const parts = [];
  const warnings = [];
  let reusedBatches = 0;
  try {
    for (let index = 0; index < questions.length; index += PDF_BATCH_SIZE) {
      signal?.throwIfAborted();
      const number = parts.length + 1;
      const batch = questions.slice(index, index + PDF_BATCH_SIZE);
      const batchDirectory = path.join(directory, `part-${number}`);
      await fs.mkdir(batchDirectory);
      const tex = buildQuestionPages({ ...payload, questions: batch }, { startIndex: index, totalQuestions: questions.length, imageRoot });
      const digest = createHash('sha256').update(tex).update(JSON.stringify(assetHashes)).digest('hex');
      const checkpoint = checkpointDirectory && path.join(checkpointDirectory, `part-${number}`);
      if (checkpoint) {
        try {
          const saved = JSON.parse(await fs.readFile(`${checkpoint}.json`, 'utf8'));
          const bytes = await fs.readFile(`${checkpoint}.pdf`);
          const document = await PDFDocument.load(bytes);
          if (saved.digest === digest && document.getPageCount() === batch.length) {
            parts.push({ number, count: batch.length, bytes });
            warnings.push(...saved.warnings);
            reusedBatches++;
            await onProgress({ completed: Math.min(index + batch.length, questions.length), total: questions.length, part: number, reused: true });
            continue;
          }
        } catch { /* incomplete/stale checkpoints are compiled again */ }
      }
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
          : /does not fit at minimum font/.test(error.stdout || '') ? 'This question does not fit at the minimum font size. Reduce its text or diagram size in PDF settings.'
          : error.killed ? 'Compilation timed out.' : 'Check this question’s math, code and image references.';
        const question = questions[questionIndex - 1];
        const label = question?.source?.questionNumber || question?.exportNumber || String(questionIndex);
        throw new PdfExportError(`PDF failed near export question ${questionIndex} (Q${label}). ${reason}`, { questionIndex, questionId: question?.id, questionNumber: label, part: number }, error);
      }
      const batchWarnings = output.split(/\r?\n/).filter(line => /Overfull|GATEFITWARNING/.test(line)).map(message => ({ part: number, message }));
      for (const match of output.matchAll(/GATEFIT:(\d+):FONT:(\d+)/g)) {
        if (Number(match[2]) < 12) batchWarnings.push({ part: number, questionIndex: Number(match[1]), message: `Question ${match[1]} uses ${match[2]}pt body text. Review readability.` });
      }
      warnings.push(...batchWarnings);
      const bytes = await fs.readFile(path.join(batchDirectory, 'main.pdf'));
      if (checkpoint) {
        await fs.writeFile(`${checkpoint}.pdf`, bytes);
        await fs.writeFile(`${checkpoint}.json`, JSON.stringify({ digest, warnings: batchWarnings }));
      }
      parts.push({ number, count: batch.length, bytes });
      await onProgress({ completed: Math.min(index + batch.length, questions.length), total: questions.length, part: number });
    }
    await onProgress({ completed: questions.length, total: questions.length, phase: 'checking' });
    const pdf = await mergeQuestionPdfs(parts, questions.length, `${subject} - ${chapter}`, questions);
    const document = await PDFDocument.load(pdf);
    const settings = normalizePdfSettings(payload.pdfSettings);
    let websiteLinks = 0, solutionLinks = 0;
    for (const [index, page] of document.getPages().entries()) {
      if (Math.abs(page.getWidth() - 841.89) > 1 || Math.abs(page.getHeight() - 595.28) > 1) throw new PdfExportError(`Question ${index + 1} has unexpected page dimensions.`);
      const annotations = page.node.Annots();
      const urls = [];
      for (let i = 0; annotations && i < annotations.size(); i++) {
        const annotation = annotations.lookup(i);
        const action = annotation.lookup(PDFName.of('A'));
        if (action?.lookup(PDFName.of('S'))?.toString() === '/URI') urls.push(action.lookup(PDFName.of('URI')).decodeText());
      }
      const websiteCount = expectedWebsiteLinks(settings);
      if (websiteCount) {
        if (urls.filter(url => url === settings.websiteUrl).length < websiteCount) throw new PdfExportError(`Website link missing on page ${index + 1}.`);
        websiteLinks += websiteCount;
      }
      const solution = visibleSolutionUrl(questions[index], settings);
      if (solution) {
        if (!urls.includes(solution)) throw new PdfExportError(`Solution link missing on page ${index + 1}.`);
        solutionLinks++;
      }
    }
    let textBoundsChecked = false;
    await fs.writeFile(path.join(directory, 'complete.pdf'), pdf);
    try {
      await inspectTextBounds(path.join(directory, 'complete.pdf'), questions.length, signal);
      textBoundsChecked = true;
    } catch (error) {
      if (error instanceof PdfExportError || signal?.aborted) throw error;
      warnings.push({ message: 'Text bounds could not be checked. Install Poppler pdftotext or set PDFTOTEXT_BIN, then retry.' });
    }
    let answerKey, answerKeyPages, answerKeyBoundsChecked;
    if (settings.includeAnswerKey) {
      await onProgress({ completed: questions.length, total: questions.length, phase: 'answers' });
      await fs.writeFile(path.join(directory, 'answer-key.tex'), buildAnswerKey(payload));
      try {
        const result = await run(process.env.PDFLATEX_BIN || 'pdflatex', ['-no-shell-escape', '-halt-on-error', '-interaction=nonstopmode', 'answer-key.tex'], { cwd: directory, windowsHide: true, timeout: 60_000, maxBuffer: 10 * 1024 * 1024, signal });
        for (const line of result.stdout.split(/\r?\n/).filter(line => /Overfull/.test(line))) warnings.push({ message: `Answer key: ${line}` });
      } catch (error) {
        if (signal?.aborted) throw error;
        const markers = [...(error.stdout || '').matchAll(/GATEANSWER:(\d+)/g)];
        throw new PdfExportError(`Answer key failed near question ${markers.at(-1)?.[1] || 1}. Check the stored answer’s math.`, {}, error);
      }
      answerKey = await fs.readFile(path.join(directory, 'answer-key.pdf'));
      answerKeyPages = (await PDFDocument.load(answerKey)).getPageCount();
      answerKeyBoundsChecked = false;
      try { await inspectTextBounds(path.join(directory, 'answer-key.pdf'), answerKeyPages, signal); answerKeyBoundsChecked = true; }
      catch (error) { if (error instanceof PdfExportError || signal?.aborted) throw error; warnings.push({ message: 'Answer-key text bounds could not be checked. Install Poppler pdftotext and retry.' }); }
    }
    return { pdf, parts, answerKey, report: { questions: questions.length, pages: questions.length, batches: parts.length, reusedBatches, warnings, pageCountVerified: true, textBoundsChecked, linksVerified: true, websiteLinks, solutionLinks, openLinksInNewTab: settings.openLinksInNewTab, ...(answerKey ? { answerKeyPages, answerKeyBoundsChecked } : {}) } };
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
}
