import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';
import { addQuestionBookmarks } from '../src/lib/pdf-bookmarks.mjs';
import { exportPdfBook } from '../src/lib/pdf-book.mjs';

test('subject books retain chapter order, source PDF links and question destinations', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'gate-book-test-'));
  try {
    await fs.mkdir(path.join(directory, 'chapters'));
    const chapters = [];
    for (const number of [1, 2]) {
      const document = await PDFDocument.create();
      const page = document.addPage([841.89, 595.28]); page.drawText(`Chapter ${number}`);
      const annotation = document.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: [10, 10, 100, 25], A: { S: 'URI', URI: PDFString.of('https://g4gate.com') } });
      page.node.set(PDFName.of('Annots'), document.context.obj([document.context.register(annotation)]));
      addQuestionBookmarks(document, [{ source: { questionNumber: `${number}.1` } }]);
      const bytes = await document.save(), file = `${number}.pdf`;
      await fs.writeFile(path.join(directory, 'chapters', file), bytes);
      chapters.push({ file, sha256: createHash('sha256').update(bytes).digest('hex'), sourceId: String(number), chapter: `Chapter ${number}`, pages: 1, questionIds: ['same-id'], report: { warnings: [], textBoundsChecked: true, websiteLinks: 1, solutionLinks: 0 } });
    }
    const payload = { subject: 'Test', chapter: 'Book', total: 2, chapters };
    const result = await exportPdfBook(payload, { directory });
    assert.equal(result.report.websiteLinks, 2); assert.equal(result.report.pages, 2);
    assert.equal(result.report.repeatedQuestionIds, 1);
    assert.match(result.report.warnings[0].message, /repeated question IDs/);
    const pdf = await PDFDocument.load(result.pdf);
    const first = pdf.catalog.lookup(PDFName.of('Outlines')).lookup(PDFName.of('First'));
    assert.equal(first.lookup(PDFName.of('Title')).decodeText(), 'Chapter 1');
    assert.equal(first.lookup(PDFName.of('First')).lookup(PDFName.of('Title')).decodeText(), 'Q1.1');
    assert.equal(first.lookup(PDFName.of('Next')).lookup(PDFName.of('Dest')).get(0).toString(), pdf.getPage(1).ref.toString());
    await fs.writeFile(path.join(directory, 'chapters', '1.pdf'), 'changed');
    await assert.rejects(exportPdfBook(payload, { directory }), /changed/);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});
