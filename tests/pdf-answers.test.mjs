import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';
import { mergeQuestionPdfs } from '../src/lib/pdf-export.mjs';
import { normalizePdfSettings } from '../src/lib/pdf-settings.mjs';
import { ANSWER_FIELD_PREFIX, ANSWER_ON_STATE, answerFooter } from '../src/lib/pdf-answers.mjs';

test('answer export defaults to hidden, with explicit footer and click-to-show checkbox choices', () => {
  const payload = { subject: 'Test', chapter: 'Answers', questions: [{ year: '2006', text: 'Question', optA: 'A', optB: 'B', correctOptions: ['B'] }, { text: 'Unknown', optA: 'A' }] };
  assert.doesNotMatch(buildQuestionPages(payload), /Answer:|gateanswertoggle|AcroForm|SetOCGState/);
  const footer = buildQuestionPages({ ...payload, pdfSettings: { answerMode: 'footer' } });
  assert.match(footer, /Answer:\} \(B\)/); assert.doesNotMatch(footer, /gateanswertoggle\{|AcroForm/);
  const toggle = buildQuestionPages({ ...payload, pdfSettings: { answerMode: 'toggle' } });
  // One checkbox for the answered question only; readers need the AcroForm entry to make it clickable.
  assert.equal((toggle.match(/\\gateanswertoggle\{gate-answer-/g) || []).length, 1);
  assert.match(toggle, /\\gateanswertoggle\{gate-answer-1\}\{0\}\{\\textbf\{Answer:\} \(B\)/);
  assert.match(toggle, /\/FT \/Btn/); assert.match(toggle, new RegExp(`/AS /Off`)); assert.match(toggle, new RegExp(`/${ANSWER_ON_STATE} \\\\gateansweron`));
  assert.match(toggle, /\\pdfcatalog\{\/AcroForm << \/Fields \[\\gateanswerrefs\] >>\}/);
  assert.doesNotMatch(toggle, /SetOCGState|\/Type \/OCG/);
  // The dark theme draws white text inside the appearance streams; light draws black.
  assert.match(toggle, /\\color\{white\}#3/);
  assert.match(buildQuestionPages({ ...payload, pdfSettings: { answerMode: 'toggle', theme: 'light' } }), /\\color\{black\}#3/);
  assert.throws(() => normalizePdfSettings({ answerMode: 'bad' }));
});

test('special notes use the full-width wrapping field and numbering follows the page', () => {
  const settings = normalizePdfSettings({ answerMode: 'toggle' });
  const note = answerFooter({ optA: 'x', correctOptions: ['A'], specialNote: 'Marks to all.' }, settings, 7);
  assert.match(note, /^\\gateanswertoggle\{gate-answer-7\}\{1\}\{\\textbf\{Answer:\} \(A\)\\par\\textbf\{Admin special note:\} Marks to all\./);
  assert.equal(answerFooter({ optA: 'x', correctOptions: [] }, settings, 2), '');
  assert.match(answerFooter({ natAnswer: '$\\frac{1}{2}$', questionType: 'NAT' }, settings, 3), /^\\gateanswertoggle\{gate-answer-3\}\{0\}\{\\textbf\{Answer:\} \$\\frac\{1\}\{2\}\$/);
});

test('combined batches register every answer checkbox with a unique name and hidden state', async () => {
  const parts = [];
  for (let i = 0; i < 2; i++) {
    const doc = await PDFDocument.create(); const page = doc.addPage([841.89, 595.28]);
    const appearance = name => doc.context.register(doc.context.flateStream(`BT ET % ${name}`, { Type: 'XObject', Subtype: 'Form', BBox: [0, 0, 100, 16] }));
    // Both batches number their own first question 1, as separately compiled chapters do in a book.
    const widget = doc.context.register(doc.context.obj({
      Type: 'Annot', Subtype: 'Widget', FT: 'Btn', T: PDFString.of(`${ANSWER_FIELD_PREFIX}1`), Rect: [20, 20, 120, 36], F: 4,
      V: i ? ANSWER_ON_STATE : 'Off', AS: i ? ANSWER_ON_STATE : 'Off', AP: { N: { [ANSWER_ON_STATE]: appearance('on'), Off: appearance('off') } },
    }));
    const link = doc.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: [200, 20, 260, 36], A: { S: 'URI', URI: PDFString.of('https://example.com') } });
    page.node.set(PDFName.of('Annots'), doc.context.obj([widget, link]));
    parts.push({ number: i + 1, count: 1, bytes: await doc.save() });
  }
  const merged = await PDFDocument.load(await mergeQuestionPdfs(parts, 2));
  const fields = merged.catalog.lookup(PDFName.of('AcroForm')).lookup(PDFName.of('Fields'));
  assert.equal(fields.size(), 2);
  const widgets = fields.asArray().map(ref => merged.context.lookup(ref));
  assert.deepEqual(widgets.map(widget => widget.lookup(PDFName.of('T')).decodeText()), ['gate-answer-1', 'gate-answer-2']);
  // A batch saved with its answer shown still starts hidden in the combined PDF.
  assert.deepEqual(widgets.map(widget => [widget.get(PDFName.of('V')).toString(), widget.get(PDFName.of('AS')).toString()]), [['/Off', '/Off'], ['/Off', '/Off']]);
  merged.getPages().forEach((page, index) => assert.equal(page.node.Annots().get(0).toString(), fields.get(index).toString()));
  // Both appearance streams survive the copy, so the toggle still draws the typeset answer.
  for (const widget of widgets) assert.deepEqual(widget.lookup(PDFName.of('AP')).lookup(PDFName.of('N')).keys().map(String).sort(), ['/Answer', '/Off']);
  assert.equal(merged.catalog.lookup(PDFName.of('OCProperties')), undefined);
});

test('older layer-based answer PDFs keep their hidden layers when combined into a book', async () => {
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
  assert.equal(merged.catalog.lookup(PDFName.of('AcroForm')), undefined);
});
