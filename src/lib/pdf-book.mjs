import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { PDFDocument, PDFName } from 'pdf-lib';
import { addPdfBookmarks } from './pdf-bookmarks.mjs';
import { registerAnswerLayers } from './pdf-answers.mjs';

const linkUrls = page => {
  const annotations = page.node.Annots();
  const urls = [];
  for (let index = 0; annotations && index < annotations.size(); index++) {
    const action = annotations.lookup(index).lookup(PDFName.of('A'));
    if (action?.lookup(PDFName.of('S'))?.toString() === '/URI') urls.push(action.lookup(PDFName.of('URI')).decodeText());
  }
  return urls;
};

export async function exportPdfBook(payload, { directory, signal, onProgress = async () => {} }) {
  const book = await PDFDocument.create();
  const parts = [], bookmarks = [], warnings = [];
  const seenQuestions = new Set(), repeatedQuestions = new Set();
  let completed = 0;
  for (const [index, chapter] of payload.chapters.entries()) {
    signal?.throwIfAborted();
    for (const id of chapter.questionIds || []) {
      if (seenQuestions.has(id)) repeatedQuestions.add(id);
      seenQuestions.add(id);
    }
    const bytes = await fs.readFile(path.join(directory, 'chapters', chapter.file));
    if (createHash('sha256').update(bytes).digest('hex') !== chapter.sha256) throw new Error('A saved chapter PDF changed. Create the book again from export history.');
    const source = await PDFDocument.load(bytes);
    if (source.getPageCount() !== chapter.pages) throw new Error(`Unexpected page count in ${chapter.chapter}.`);
    const offset = book.getPageCount();
    const copied = await book.copyPages(source, source.getPageIndices());
    copied.forEach((page, pageIndex) => {
      const expected = linkUrls(source.getPage(pageIndex));
      if (JSON.stringify(linkUrls(page)) !== JSON.stringify(expected)) throw new Error('A chapter link was not preserved.');
      book.addPage(page);
    });
    const pageIndices = new Map(source.getPages().map((page, index) => [page.ref.toString(), index]));
    const children = [];
    let item = source.catalog.lookup(PDFName.of('Outlines'))?.lookup(PDFName.of('First'));
    const seen = new Set();
    while (item && !seen.has(item) && children.length < chapter.pages) {
      seen.add(item);
      const dest = item.lookup(PDFName.of('Dest'));
      const page = dest && pageIndices.get(dest.get(0).toString());
      if (page !== undefined) children.push({ title: item.lookup(PDFName.of('Title')).decodeText(), page: offset + page });
      item = item.lookup(PDFName.of('Next'));
    }
    bookmarks.push({ title: chapter.chapter, page: offset, children });
    parts.push({ number: index + 1, count: chapter.pages, bytes });
    warnings.push(...(chapter.report.warnings || []).map(warning => ({ ...warning, message: `${chapter.chapter}: ${warning.message}` })));
    completed += chapter.pages;
    await onProgress({ completed, total: payload.total, phase: 'combining' });
  }
  if (book.getPageCount() !== payload.total) throw new Error('The combined book has an unexpected page count.');
  addPdfBookmarks(book, bookmarks);
  registerAnswerLayers(book);
  if (repeatedQuestions.size) warnings.push({ message: `This book contains ${repeatedQuestions.size} repeated question IDs across the selected exports. Review overlapping chapter selections.` });
  book.setTitle(`${payload.subject} - ${payload.chapter}`); book.setAuthor('G4Gate');
  return { pdf: Buffer.from(await book.save()), parts, report: { questions: payload.total, pages: payload.total, chapters: payload.chapters.length, repeatedQuestionIds: repeatedQuestions.size, batches: payload.chapters.length, warnings, pageCountVerified: true, linksVerified: true, websiteLinks: payload.chapters.reduce((sum, chapter) => sum + (chapter.report.websiteLinks || 0), 0), solutionLinks: payload.chapters.reduce((sum, chapter) => sum + (chapter.report.solutionLinks || 0), 0), openLinksInNewTab: payload.chapters[0]?.report.openLinksInNewTab !== false, textBoundsChecked: payload.chapters.every(chapter => chapter.report.textBoundsChecked), textBoundsBasis: 'Source chapter PDFs copied without reflow', sourceJobs: payload.chapters.map(chapter => chapter.sourceId) } };
}
