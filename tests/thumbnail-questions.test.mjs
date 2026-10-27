import test from 'node:test';
import assert from 'node:assert/strict';
import { newLayer, normalizeThumbnailEditor, editorForQuestion, setQuestionLayers, applyCutoutPlacement, questionSlideWindow } from '../src/lib/thumbnail-editor.mjs';
const png = (width, height) => {
  const bytes = Buffer.alloc(33); Buffer.from([137,80,78,71,13,10,26,10]).copy(bytes);
  bytes.write('IHDR', 12); bytes.writeUInt32BE(width, 16); bytes.writeUInt32BE(height, 20);
  return `data:image/png;base64,${bytes.toString('base64')}`;
};
const image = { id: 'shared-image', name: 'Cutout', dataUrl: png(200, 400) };
const cutout = newLayer('image', { id: 'cutout', assetId: image.id, x: 60, width: 25, height: 80 });
const base = normalizeThumbnailEditor({ version: 1, layers: [cutout], assets: [image] });

test('moving, cropping, hiding and replacing a cutout affect only the chosen stable question ID', () => {
  const replacement = { ...image, id: 'replacement', dataUrl: png(500, 600) };
  const local = { ...cutout, assetId: replacement.id, x: -5, width: 42, crop: { ...cutout.crop, left: 20 }, hidden: true };
  const edited = normalizeThumbnailEditor(setQuestionLayers(base, 'question-B', [local], [...base.assets, replacement]));
  assert.equal(editorForQuestion(edited, 'question-B').layers[0].x, -5);
  assert.equal(editorForQuestion(edited, 'question-B').layers[0].assetId, replacement.id);
  assert.equal(editorForQuestion(edited, 'question-A').layers[0].x, 60);
  assert.equal(editorForQuestion(edited, 'question-A').layers[0].hidden, false);
  assert.equal(editorForQuestion(edited, 'question-A').assets.length, 1);
  assert.equal(editorForQuestion(edited, 'question-A').assets[0].id, image.id);
  assert.equal(editorForQuestion(edited, 'new-question').layers[0].x, 60);
});
test('deleting an individual image preserves the shared source needed by other questions', () => {
  const edited = setQuestionLayers(base, 'question-A', []);
  assert.deepEqual(editorForQuestion(edited, 'question-A').layers, []);
  assert.equal(editorForQuestion(edited, 'question-B').layers.length, 1);
  assert.equal(edited.assets.length, 1);
});
test('apply-to-all copies geometry while preserving individual replacements, crops and unrelated layers', () => {
  const replacement = { ...image, id: 'other-image' };
  const text = newLayer('text', { id: 'title', text: 'Custom question headline' });
  let edited = setQuestionLayers(base, 'question-A', [{ ...cutout, x: -10, y: 8, width: 40, height: 92 }]);
  edited = setQuestionLayers(edited, 'question-B', [{ ...cutout, assetId: replacement.id, brightness: 130, rotation: 15, crop: { ...cutout.crop, left: 10 } }, text], [...edited.assets, replacement]);
  const applied = normalizeThumbnailEditor(applyCutoutPlacement(edited, 'question-A', 'cutout', ['question-A', 'question-B', 'question-C']));
  for (const id of ['question-A', 'question-B', 'question-C']) {
    const layer = editorForQuestion(applied, id).layers[0];
    assert.deepEqual([layer.x, layer.y, layer.width, layer.height], [-10, 8, 40, 92]);
  }
  const individual = editorForQuestion(applied, 'question-B').layers;
  assert.equal(individual[0].assetId, replacement.id);
  assert.equal(individual[0].brightness, 130); assert.equal(individual[0].rotation, 15);
  assert.equal(individual[0].crop.left, 10); assert.deepEqual(individual[1].text, text.text);
  assert.equal(editorForQuestion(edited, 'question-C').layers[0].x, 60, 'input snapshot stays intact for undo');
});
test('a newly uploaded cutout can be placed on all questions without duplicating image bytes', () => {
  const root = { ...base, layers: [] };
  const edited = setQuestionLayers(root, 'first', [cutout]);
  const applied = applyCutoutPlacement(edited, 'first', 'cutout', Array.from({ length: 100 }, (_, i) => `question-${i}`));
  assert.equal(applied.assets.length, 1);
  assert.equal(Object.keys(applied.questionLayers).length, 1, 'untouched questions inherit one default layer');
  assert.equal(editorForQuestion(applied, 'question-99').layers[0].id, 'cutout');
  const restored = normalizeThumbnailEditor(JSON.parse(JSON.stringify(applied)));
  assert.equal(editorForQuestion(restored, 'question-99').layers.length, 1);
});
test('question overrides are validated, including prototype-sensitive keys and layer limits', () => {
  assert.throws(() => normalizeThumbnailEditor({ ...base, questionLayers: { first: Array(41).fill(cutout) } }), /40/);
  assert.throws(() => normalizeThumbnailEditor({ ...base, questionLayers: JSON.parse('{"__proto__":[]}') }), /ID/);
  assert.throws(() => normalizeThumbnailEditor({ ...base, questionLayers: [] }), /invalid/);
  assert.throws(() => normalizeThumbnailEditor({ ...base, questionLayers: { first: [{ ...cutout, assetId: 'missing' }] } }), /asset/);
  assert.throws(() => applyCutoutPlacement(base, 'first', 'missing', ['first']), /Select/);
});
test('navigation mounts ten slides, crosses boundaries and retains original question numbers', () => {
  const entries = Array.from({ length: 23 }, (_, i) => ({ question_id: `id-${i}`, index: i * 2 + 1 }));
  assert.deepEqual(questionSlideWindow(entries, 'id-9').entries.map(entry => entry.index), [1,3,5,7,9,11,13,15,17,19]);
  assert.equal(questionSlideWindow(entries, 'id-10').start, 10);
  assert.equal(questionSlideWindow(entries, 'id-10').entries.length, 10);
  assert.equal(questionSlideWindow(entries, 'id-22').entries.length, 3);
  assert.equal(questionSlideWindow(entries, 'missing').index, 0);
  assert.equal(questionSlideWindow([], '').entries.length, 0);
});
