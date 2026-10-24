import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';
import { mergeQuestionPdfs } from '../src/lib/pdf-export.mjs';

test('combining batches preserves page order, dimensions, streams and URI annotations', async () => {
  const parts = [];
  for (let number = 1; number <= 3; number++) {
    const doc = await PDFDocument.create();
    const page = doc.addPage([800 + number, 600]);
    page.drawText(`Question ${number}`);
    const annotation = doc.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: [0, 0, 100, 20], A: { Type: 'Action', S: 'URI', URI: PDFString.of(`https://g4gate.com/?q=${number}`) } });
    page.node.set(PDFName.of('Annots'), doc.context.obj([doc.context.register(annotation)]));
    parts.push({ number, count: 1, bytes: await doc.save() });
  }
  const merged = await PDFDocument.load(await mergeQuestionPdfs(parts, 3));
  assert.deepEqual(merged.getPages().map(p => p.getWidth()), [801, 802, 803]);
  for (const [index, page] of merged.getPages().entries()) {
    const annotations = page.node.Annots();
    assert.equal(annotations.size(), 1);
    const annotation = annotations.lookup(0);
    assert.equal(annotation.lookup(PDFName.of('A')).lookup(PDFName.of('URI')).decodeText(), `https://g4gate.com/?q=${index + 1}`);
    assert.ok(page.node.Contents());
  }
  await assert.rejects(mergeQuestionPdfs(parts, 4), /unexpected page count/);
  await assert.rejects(mergeQuestionPdfs([{ ...parts[0], count: 2 }], 2), /unexpected page count/);
});
