import test from 'node:test';
import assert from 'node:assert/strict';
import { newLayer, normalizeThumbnailEditor, resizeLayer, snapLayer, layerImageStyle } from '../src/lib/thumbnail-editor.mjs';
import { buildThumbnailHtml } from '../src/lib/thumbnail-render.mjs';
const near = (a, b) => assert.ok(Math.abs(a - b) < .00001, `${a} ≠ ${b}`);
const base = newLayer('shape', { x: 10, y: 20, width: 30, height: 40, aspectLocked: false });
const center = l => [l.x * 12.8 + l.width * 6.4, l.y * 7.2 + l.height * 3.6];

test('all eight resize handles keep their opposite anchor fixed, including rotated layers', () => {
  for (const rotation of [0, 30, 90, -45]) for (const handle of ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']) {
    const layer = { ...base, rotation }, next = { ...layer, ...resizeLayer(layer, handle, 80, 40) };
    const cos = Math.cos(rotation * Math.PI / 180), sin = Math.sin(rotation * Math.PI / 180);
    const sx = handle.includes('e') ? -1 : handle.includes('w') ? 1 : 0;
    const sy = handle.includes('s') ? -1 : handle.includes('n') ? 1 : 0;
    const anchor = l => { const c = center(l), x = sx * l.width * 6.4, y = sy * l.height * 3.6; return [c[0] + x * cos - y * sin, c[1] + x * sin + y * cos]; };
    anchor(layer).forEach((value, i) => near(value, anchor(next)[i]));
    assert.ok(next.width > 0 && next.height > 0);
  }
});
test('aspect lock keeps proportions and resizing never creates negative dimensions', () => {
  for (const handle of ['nw', 'se', 'e', 'n']) {
    const next = { ...base, ...resizeLayer(base, handle, -5000, 3000, true) };
    near(next.width / next.height, base.width / base.height);
    assert.ok(next.width >= .5 && next.height >= .5);
  }
});
test('snapping aligns canvas edges, centers and visible objects; hidden layers are ignored', () => {
  const next = snapLayer({ ...base, x: -.2, y: 29.9 }, []);
  near(next.patch.x, 0); near(next.patch.y, 30);
  assert.equal(next.guides.length, 2);
  const hidden = { ...base, id: 'hidden', x: 11, hidden: true };
  near(snapLayer({ ...base, x: 10.6, y: 15 }, [hidden]).patch.x, 10.6);
});
test('projects reject unsafe assets, invalid IDs, oversized layer lists and invalid crops', () => {
  const project = { version: 1, assets: [], layers: [base] };
  assert.throws(() => normalizeThumbnailEditor({ ...project, layers: [{ ...base, type: 'html' }] }), /invalid/);
  assert.throws(() => normalizeThumbnailEditor({ ...project, layers: [{ ...base, id: '"><script>' }] }), /invalid/);
  assert.throws(() => normalizeThumbnailEditor({ ...project, layers: Array(41).fill(base) }), /40/);
  assert.throws(() => normalizeThumbnailEditor({ ...project, layers: [{ ...base, crop: { left: 80, right: 30 } }] }), /5%/);
  assert.throws(() => normalizeThumbnailEditor({ ...project, assets: [{ id: 'unsafe', dataUrl: 'https://bad.example/image.png' }] }), /PNG/);
  assert.throws(() => normalizeThumbnailEditor({ ...project, layers: [{ ...base, type: 'image', assetId: 'missing' }] }), /asset/);
});
test('cropping uses source percentages without empty padding', () => {
  const style = layerImageStyle({ crop: { top: 25, bottom: 25, left: 10, right: 40 } });
  assert.equal(style.width, '200%'); assert.equal(style.height, '200%');
  assert.equal(style.left, '-20%'); assert.equal(style.top, '-50%');
});
test('exports retain layer order, bleed, effects and crop while hiding hidden layers and escaping text', () => {
  const first = { ...base, id: 'background', x: -10, width: 120, rotation: 15, fill: '#ff0000' };
  const title = newLayer('text', { id: 'title', text: '<script>alert(1)</script>', opacity: .5, flipY: true, fontFamily: 'Impact' });
  const hidden = { ...base, id: 'hidden', hidden: true, fill: '#123456' };
  const html = buildThumbnailHtml({ subject: '1. Maths', chapter: '1. Logic', items: [{ number: 1, question: { text: 'Test', year: 2024, marks: 1 } }], settings: { showQuestion: false, customBackground: true, backgroundColor: '#aabbcc' }, editor: { version: 1, assets: [], layers: [first, title, hidden] }, origin: 'http://localhost:3000' });
  assert.match(html, /left:-10%;top:20%;width:120%/);
  assert.match(html, /rotate\(15deg\)/); assert.match(html, /scale\(1,-1\)/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /#123456|<script>alert/);
  assert.ok(html.indexOf('background:#ff0000') < html.indexOf('&lt;script&gt;'));
  assert.match(html, /\.topline,\.meta,\.fit-area,\.bottomline\{display:none\}/);
  assert.match(html, /background:#aabbcc/);
});
test('photo-only designs omit hidden question diagrams and work without a MathJax download', () => {
  const context = { subject: 'Maths', chapter: 'Logic', items: [{ number: 1, question: { text: '$x^2$ [IMG_1]', diagram: 'missing-figure', year: 2024, marks: 1 } }], origin: 'http://localhost:3000' };
  const photo = buildThumbnailHtml({ ...context, settings: { showQuestion: false } });
  assert.doesNotMatch(photo, /src="https:\/\/cdn|missing-figure\.png/);
  const question = buildThumbnailHtml({ ...context, settings: {} });
  assert.match(question, /src="https:\/\/cdn/);
  assert.match(question, /missing-figure\.png/);
});
