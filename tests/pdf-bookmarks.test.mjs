import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument, PDFName } from 'pdf-lib';
import { mergeQuestionPdfs } from '../src/lib/pdf-export.mjs';

test('bookmarks point to the copied pages and preserve original question labels', async () => {
  const doc = await PDFDocument.create(); doc.addPage(); doc.addPage();
  const bytes = await mergeQuestionPdfs([{ number: 1, count: 2, bytes: await doc.save() }], 2, 'Questions', [{ exportNumber: '21', year: '2024' }, { source: { questionNumber: '3.12' } }]);
  const output = await PDFDocument.load(bytes);
  const root = output.catalog.lookup(PDFName.of('Outlines'));
  assert.equal(root.lookup(PDFName.of('Count')).asNumber(), 2);
  const first = root.lookup(PDFName.of('First'));
  assert.match(first.lookup(PDFName.of('Title')).decodeText(), /Q21 - GATE 2024/);
  assert.equal(first.lookup(PDFName.of('Dest')).get(0).toString(), output.getPage(0).ref.toString());
  assert.equal(first.lookup(PDFName.of('Next')).lookup(PDFName.of('Title')).decodeText(), 'Q3.12');
});
