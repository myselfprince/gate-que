import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { assetContentType, MAX_PAPER_ASSET_BYTES, paperAssetFiles, questionAssetPaths } from './year-paper-assets.mjs';

export function isPaperImage(data, contentType) {
  const hex = data.subarray(0, 12).toString('hex');
  if (contentType === 'image/png') return hex.startsWith('89504e470d0a1a0a');
  if (contentType === 'image/jpeg') return hex.startsWith('ffd8ff');
  if (contentType === 'image/gif') return ['GIF87a', 'GIF89a'].includes(data.subarray(0, 6).toString('ascii'));
  return contentType === 'image/webp' && data.subarray(0, 4).toString('ascii') === 'RIFF' && data.subarray(8, 12).toString('ascii') === 'WEBP';
}

export async function preparePaperAssets(paper, publicRoot) {
  const root = await fs.realpath(publicRoot);
  const files = [], documents = [];
  let total = 0;
  for (const assetPath of [...new Set(paper.questions.flatMap(questionAssetPaths))].sort()) {
    const absolute = await fs.realpath(path.join(root, ...assetPath.split('/')));
    const relative = path.relative(root, absolute);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Paper diagram escapes the public directory.');
    const stat = await fs.stat(absolute);
    if (!stat.isFile() || stat.size < 1 || stat.size > MAX_PAPER_ASSET_BYTES || (total += stat.size) > 64 * 1024 * 1024) throw new Error('Paper diagram exceeds the upload limit.');
    const data = await fs.readFile(absolute), contentType = assetContentType(assetPath);
    if (!isPaperImage(data, contentType)) throw new Error(`Invalid image content: ${assetPath}`);
    const id = createHash('sha256').update(data).digest('hex');
    files.push({ path: assetPath, id, byteLength: data.length, contentType });
    documents.push({ _id: id, data, byteLength: data.length, contentType });
  }
  const published = { ...paper, assetManifest: { version: 1, files } };
  paperAssetFiles(published);
  return { paper: published, documents };
}

// Hash-addressed blobs are immutable so existing attempt snapshots keep their diagrams.
export async function publishPaperAssets(collection, documents) {
  const unique = [...new Map(documents.map(document => [document._id, document])).values()];
  for (const document of unique) {
    await collection.updateOne({ _id: document._id }, { $setOnInsert: document }, { upsert: true });
  }
}
