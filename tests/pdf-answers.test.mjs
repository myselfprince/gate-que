import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';
import { mergeQuestionPdfs } from '../src/lib/pdf-export.mjs';
import { normalizePdfSettings } from '../src/lib/pdf-settings.mjs';

test('answer export defaults to hidden, with explicit footer and native layer-toggle choices', () => {
  const payload = { subject: 'Test', chapter: 'Answers', questions: [{ year: '2006', text: 'Question', optA: 'A', optB: 'B', correctOptions: ['B'] }, { text: 'Unknown', optA: 'A' }] };
  assert.doesNotMatch(buildQuestionPages(payload), /Answer:|SetOCGState|G4Gate answer/);
  const footer = buildQuestionPages({ ...payload, pdfSettings: { answerMode: 'footer' } });
  assert.match(footer, /Answer:\} \(B\)/); assert.doesNotMatch(footer, /SetOCGState/);
  const toggle = buildQuestionPages({ ...payload, pdfSettings: { answerMode: 'toggle' } });
  assert.match(toggle, /SetOCGState/); assert.match(toggle, /BaseState \/OFF/);
  assert.equal((toggle.match(/\/Type \/OCG/g) || []).length, 1);
  assert.throws(() => normalizePdfSettings({ answerMode: 'bad' }));
});

test('combining PDF batches retains copied answer groups and initially hides each one', async () => {
  const parts = [];
  for (let i = 0; i < 2; i++) {
    const doc = await PDFDocument.create(); const page = doc.addPage([841.89, 595.28]);
    const group = doc.context.register(doc.context.obj({ Type: 'OCG', Name: PDFString.of(`G4Gate answer ${i + 1}`) }));
    page.node.set(PDFName.of('Resources'), doc.context.obj({ Properties: { GateAnswer: group } }));
    page.node.set(PDFName.of('Annots'), doc.context.obj([doc.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: [20, 20, 100, 40], A: { S: 'SetOCGState', State: ['Toggle', group] } })]));
    parts.push({ number: i + 1, count: 1, bytes: await doc.save() });
  }
  const merged = await PDFDocument.load(await mergeQuestionPdfs(parts, 2));
  const properties = merged.catalog.lookup(PDFName.of('OCProperties'));
  assert.equal(properties.lookup(PDFName.of('OCGs')).size(), 2);
  assert.equal(properties.lookup(PDFName.of('D')).lookup(PDFName.of('OFF')).size(), 2);
  for (const page of merged.getPages()) {
    const resourceRef = page.node.Resources().lookup(PDFName.of('Properties')).get(PDFName.of('GateAnswer'));
    const actionRef = page.node.Annots().lookup(0).lookup(PDFName.of('A')).lookup(PDFName.of('State')).get(1);
    assert.equal(resourceRef.toString(), actionRef.toString());
  }
});
