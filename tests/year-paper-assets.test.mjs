import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { paperAssetFiles, paperAssetAvailability, questionAssetPaths, withPaperAssetIds, questionDiagramUrl } from '../src/lib/year-paper-assets.mjs';
import { preparePaperAssets, publishPaperAssets, readPaperAsset } from '../src/lib/year-paper-assets-server.mjs';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jDPsAAAAASUVORK5CYII=', 'base64');
const assetPath = 'Year Papers/GATE CS 2005/diagram.png';
const question = () => ({ subject: 'Year Papers', chapter: 'GATE CS 2005', diagram: 'diagram', optA: 'IMG:diagram' });
const file = () => ({ path: assetPath, id: createHash('sha256').update(png).digest('hex'), byteLength: png.length, contentType: 'image/png' });
const paper = () => ({ questions: [question()], assetManifest: { version: 1, files: [file()] } });

test('attempt diagrams use frozen uploaded versions and never silently fall back to another image',async()=>{
 const q=withPaperAssetIds(paper()).questions[0];assert.equal(questionDiagramUrl(q,'diagram'),'/api/gatemock/assets/'+file().id);
 assert.equal(questionDiagramUrl(question(),'diagram'),'/Year%20Papers/GATE%20CS%202005/diagram.png');
 assert.equal(questionDiagramUrl({...q,assetIds:{}},'diagram'),null);
 const collection={async findOne(){return {data:png,contentType:'image/png',byteLength:png.length};}};
 assert.deepEqual((await readPaperAsset(collection,file().id)).data,png);
 assert.equal(await readPaperAsset(collection,'a'.repeat(64)),null);assert.equal(await readPaperAsset(collection,'../invalid'),null);
 assert.deepEqual((await readPaperAsset({async findOne(){return {data:{buffer:png},contentType:'image/png',byteLength:png.length};}},file().id)).data,png);
});

test('manifests require every referenced diagram exactly once and reject traversal or invalid metadata', () => {
  assert.deepEqual(questionAssetPaths(question()), [assetPath]);
  assert.equal(paperAssetFiles(paper()).size, 1);
  assert.equal(paperAssetFiles({ questions: [question()] }), null);
  for (const change of [{ id: '../image' }, { byteLength: 0 }, { contentType: 'text/html' }, { path: '../image.png' }]) {
    const value = paper(); Object.assign(value.assetManifest.files[0], change); assert.throws(() => paperAssetFiles(value));
  }
  for (const files of [[], [file(), file()]]) assert.throws(() => paperAssetFiles({ ...paper(), assetManifest: { version: 1, files } }));
  assert.throws(() => questionAssetPaths({ ...question(), chapter: '../other' }));
});

test('uploaded versions never fall back to a stale bundled diagram; legacy papers still work', () => {
  const uploaded = paper(), legacy = { questions: [question()] }, bundled = new Set([assetPath]);
  assert.equal(paperAssetAvailability([uploaded], [], bundled)(assetPath, uploaded), false);
  assert.equal(paperAssetAvailability([legacy], [], bundled)(assetPath, legacy), true);
  const doc = { _id: file().id, byteLength: png.length, contentType: 'image/png' };
  assert.equal(paperAssetAvailability([uploaded], [doc], new Set())(assetPath, uploaded), true);
  assert.equal(paperAssetAvailability([uploaded], [{ ...doc, byteLength: 1 }], bundled)(assetPath, uploaded), false);
});

test('snapshots freeze each image version and remove untrusted question mappings', () => {
  const value = paper(), first = withPaperAssetIds(value);
  value.assetManifest.files[0].id = 'a'.repeat(64);
  assert.equal(first.questions[0].assetIds[assetPath], file().id);
  assert.equal(withPaperAssetIds(value).questions[0].assetIds[assetPath], 'a'.repeat(64));
  assert.equal(withPaperAssetIds({ questions: [{ ...question(), assetIds: { [assetPath]: 'b'.repeat(64) } }] }).questions[0].assetIds, undefined);
});

test('publisher validates files before writes and uploads immutable, deduplicated bytes', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'gate-assets-'));
  t.after(async () => {
    assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith('gate-assets-'));
    await fs.rm(root, { recursive: true, force: true });
  });
  const absolute = path.join(root, assetPath);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, png);
  const prepared = await preparePaperAssets({ questions: [question(), question()] }, root);
  assert.deepEqual(prepared.paper.assetManifest.files, [file()]);
  assert.deepEqual(prepared.documents[0].data, png);
  const operations = [];
  await publishPaperAssets({ async updateOne(...args) { operations.push(args); } }, [...prepared.documents, ...prepared.documents]);
  assert.equal(operations.length, 1);
  assert.deepEqual(operations[0][0], { _id: file().id });
  assert.deepEqual(operations[0][1].$setOnInsert.data, png);
  assert.deepEqual(operations[0][2], { upsert: true });
  await fs.writeFile(absolute, '<html>not an image</html>');
  await assert.rejects(preparePaperAssets({ questions: [question()] }, root), /Invalid image content/);
  await assert.rejects(preparePaperAssets({ questions: [{ ...question(), diagram: 'missing', optA: 'First' }] }, root), /ENOENT/);
});
