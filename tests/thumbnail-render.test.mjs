import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_THUMBNAIL_SETTINGS, buildThumbnailHtml, normalizeThumbnailSettings, normalizeCutout, cutoutPlacement } from '../src/lib/thumbnail-render.mjs';

const png = (width, height) => {
  const bytes = Buffer.alloc(33); Buffer.from([137,80,78,71,13,10,26,10]).copy(bytes);
  bytes.write('IHDR', 12); bytes.writeUInt32BE(width, 16); bytes.writeUInt32BE(height, 20);
  return `data:image/png;base64,${bytes.toString('base64')}`;
};
const context = { subject: '1. Discrete Maths', chapter: '1. Mathematical Logic', origin: 'http://localhost:3000', items: [{ question: { text: 'Question <script>alert(1)</script> [IMG_1]', year: '2024', marks: '2', diagram: 'test diagram', ext: '.png', natAnswer: '42', optA: 'IMG:option' }, number: 3, headline: 'Logic & Equivalence' }], settings: DEFAULT_THUMBNAIL_SETTINGS };

test('settings validate styles and clamp numeric positions without admitting CSS injection', () => {
  assert.equal(normalizeThumbnailSettings({ overlayX: 900, overlayWidth: 100 }).overlayX, 100);
  assert.throws(() => normalizeThumbnailSettings({ accent: 'red;display:none' }), /colour/);
  assert.throws(() => normalizeThumbnailSettings({ fontSize: 'NaN' }), /number/);
  assert.throws(() => normalizeThumbnailSettings({ resolution: 5000 }), /resolution/);
});
test('only bounded PNG data assets are accepted', () => {
  assert.equal(normalizeCutout(png(800, 1200)).height, 1200);
  assert.throws(() => normalizeCutout('https://example.com/cutout.png'), /PNG/);
  assert.throws(() => normalizeCutout('data:image/svg+xml;base64,PHN2Zz4='), /PNG/);
  assert.throws(() => normalizeCutout(png(10000, 10000)), /dimensions/);
  assert.equal(normalizeCutout(''), null);
});
test('cutout placement keeps tall and wide images within the exact 16:9 frame', () => {
  for (const [width, height] of [[800,1200], [1200,100], [100,2000]]) {
    const placement = cutoutPlacement({ ...DEFAULT_THUMBNAIL_SETTINGS, overlayX: 100, overlayY: 100, overlayWidth: 80 }, { width, height });
    assert.ok(placement.x >= 0 && placement.y >= 0);
    assert.ok(placement.x + placement.width <= 100.00001);
    assert.ok(placement.y + placement.height <= 100.00001);
    assert.ok(Math.abs(placement.width * 1280 / (placement.height * 720) - width / height) < .00001);
  }
});
test('thumbnail HTML escapes source content, includes safe diagram URLs, and hides answers by default', () => {
  const html = buildThumbnailHtml(context);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /test%20diagram\.png/);
  assert.match(html, /option\.png/);
  assert.match(html, /id="q-3"/);
  assert.doesNotMatch(html, /Answer: 42|<script>alert/);
  assert.match(html, /window.thumbnailError/);
});
test('topic templates and cutout composition retain custom headline, flip and opacity', () => {
  const html = buildThumbnailHtml({ ...context, settings: { template: 'topic', overlayFlip: true, overlayOpacity: .5 }, cutout: normalizeCutout(png(800,1200)) });
  assert.match(html, /Logic &amp; Equivalence/);
  assert.match(html, /transform:scaleX\(-1\)/);
  assert.match(html, /opacity:0.5/);
  assert.match(html, /data:image\/png;base64/);
});
