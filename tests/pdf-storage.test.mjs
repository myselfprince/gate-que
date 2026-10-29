import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createJob, jobDirectory, readJob, writeJobStatus } from '../src/lib/pdf-jobs.mjs';
import { cleanupPdfStorage, pdfStorageUsage } from '../src/lib/pdf-storage.mjs';

async function savedJob(root, { status = 'completed', subject = 'Test', images = true } = {}) {
  const job = await createJob({ subject, chapter: 'Storage', questions: [{ id: 'one', text: 'Keep question data' }] }, { root, launch: false });
  const directory = jobDirectory(job.id, root);
  const report = { imagesAvailable: images, pages: 1, warnings: [] };
  await fs.writeFile(path.join(directory, 'complete.pdf'), 'keep PDF');
  await fs.writeFile(path.join(directory, 'parts.zip'), 'keep PDF parts');
  await fs.writeFile(path.join(directory, 'answer-key.pdf'), 'keep answer key');
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report));
  await fs.writeFile(path.join(directory, 'images', 'original.png'), 'keep source snapshot');
  if (images) {
    await fs.writeFile(path.join(directory, 'images.zip'), 'generated page image ZIP');
    await fs.mkdir(path.join(directory, 'page-images'));
    await fs.writeFile(path.join(directory, 'page-images', 'page-1.png'), 'generated PNG');
  }
  await writeJobStatus(directory, { ...job, status, ...(status === 'running' ? { pid: process.pid } : {}), report });
  return { ...job, directory };
}

test('storage checks and cleanup handle missing storage and reject unknown cleanup targets', async () => {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'gate-storage-empty-'));
  try {
    const root = path.join(base, 'missing');
    assert.deepEqual(await pdfStorageUsage(root), { exports: { count: 0, bytes: 0 }, images: { count: 0, bytes: 0, archives: 0, pages: 0 }, activeExports: 0, unavailableExports: 0 });
    assert.deepEqual((await cleanupPdfStorage('exports', root)).deletedIds, []);
    await assert.rejects(cleanupPdfStorage('../outside', root), /Choose/);
    await assert.rejects(fs.access(root), { code: 'ENOENT' });
  } finally { await fs.rm(base, { recursive: true, force: true }); }
});

test('bulk PDF cleanup spans every subject and more than the 30-entry history limit', async () => {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'gate-storage-all-')), root = path.join(base, 'jobs');
  try {
    const jobs = [];
    for (let index = 0; index < 35; index++) jobs.push(await savedJob(root, { subject: index % 2 ? 'Algorithms' : 'Maths', status: index % 3 ? 'completed' : 'failed' }));
    const queued = await savedJob(root, { status: 'queued' });
    const running = await savedJob(root, { status: 'running' });
    const busy = await savedJob(root);
    const lock = path.join(root, `.action-${busy.id}.lock`);
    await fs.writeFile(lock, JSON.stringify({ pid: process.pid }));
    await fs.writeFile(path.join(root, 'sentinel.pdf'), 'unregistered file');
    await fs.writeFile(path.join(base, 'downloaded.pdf'), 'downloaded copy');
    const unknown = path.join(root, randomUUID()); await fs.mkdir(unknown); await fs.writeFile(path.join(unknown, 'keep.png'), 'not registered');
    const usage = await pdfStorageUsage(root);
    assert.equal(usage.exports.count, 36); assert.equal(usage.activeExports, 2); assert.equal(usage.images.count, 36);
    const result = await cleanupPdfStorage('exports', root);
    assert.deepEqual(result.deletedIds.sort(), jobs.map(job => job.id).sort());
    assert.deepEqual(result.skippedActiveIds.sort(), [queued.id, running.id].sort());
    assert.deepEqual(result.skippedBusyIds, [busy.id]); assert.deepEqual(result.failures, []); assert.ok(result.bytesFreed > 0);
    for (const job of jobs) await assert.rejects(fs.access(job.directory), { code: 'ENOENT' });
    for (const job of [queued, running, busy]) assert.ok(await readJob(job.id, root));
    assert.equal(await fs.readFile(path.join(root, 'sentinel.pdf'), 'utf8'), 'unregistered file');
    assert.equal(await fs.readFile(path.join(base, 'downloaded.pdf'), 'utf8'), 'downloaded copy');
    assert.equal(await fs.readFile(path.join(unknown, 'keep.png'), 'utf8'), 'not registered');
    assert.ok(await fs.stat(lock));
  } finally { await fs.rm(base, { recursive: true, force: true }); }
});

test('image-only cleanup removes generated PNGs and ZIPs while preserving PDFs, sources and retry data', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'gate-storage-images-'));
  try {
    const a = await savedJob(root), b = await savedJob(root, { status: 'failed' });
    const untouched = await savedJob(root, { images: false });
    await fs.writeFile(path.join(a.directory, 'page-images', 'keep.txt'), 'unrecognized file');
    const before = await pdfStorageUsage(root);
    assert.equal(before.images.count, 2); assert.equal(before.images.archives, 2); assert.equal(before.images.pages, 2);
    const result = await cleanupPdfStorage('images', root);
    assert.deepEqual(result.imageJobIds.sort(), [a.id, b.id].sort());
    assert.deepEqual(result.deletedIds, []); assert.deepEqual(result.failures, []);
    assert.equal(result.imageFilesDeleted, 4); assert.equal(result.bytesFreed, before.images.bytes);
    for (const job of [a, b]) {
      await assert.rejects(fs.access(path.join(job.directory, 'images.zip')), { code: 'ENOENT' });
      await assert.rejects(fs.access(path.join(job.directory, 'page-images', 'page-1.png')), { code: 'ENOENT' });
      assert.equal(await fs.readFile(path.join(job.directory, 'complete.pdf'), 'utf8'), 'keep PDF');
      assert.equal(await fs.readFile(path.join(job.directory, 'parts.zip'), 'utf8'), 'keep PDF parts');
      assert.equal(await fs.readFile(path.join(job.directory, 'answer-key.pdf'), 'utf8'), 'keep answer key');
      assert.equal(await fs.readFile(path.join(job.directory, 'images', 'original.png'), 'utf8'), 'keep source snapshot');
      assert.equal(JSON.parse(await fs.readFile(path.join(job.directory, 'request.json'), 'utf8')).questions[0].text, 'Keep question data');
      assert.equal((await readJob(job.id, root)).report.imagesAvailable, false);
      assert.equal(JSON.parse(await fs.readFile(path.join(job.directory, 'report.json'), 'utf8')).imagesAvailable, false);
    }
    assert.equal((await readJob(b.id, root)).status, 'failed');
    assert.equal(await fs.readFile(path.join(a.directory, 'page-images', 'keep.txt'), 'utf8'), 'unrecognized file');
    await assert.rejects(fs.access(path.join(b.directory, 'page-images')), { code: 'ENOENT' });
    assert.ok(await readJob(untouched.id, root));
    assert.equal((await pdfStorageUsage(root)).images.bytes, 0);
    assert.deepEqual((await cleanupPdfStorage('images', root)).imageJobIds, []);
    assert.ok(!(await fs.readdir(root)).some(file => file.startsWith('.action-')));
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('image cleanup skips active and busy exports without altering their files or metadata', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'gate-storage-busy-'));
  try {
    const queued = await savedJob(root, { status: 'queued' }), running = await savedJob(root, { status: 'running' }), busy = await savedJob(root);
    await fs.writeFile(path.join(root, `.action-${busy.id}.lock`), JSON.stringify({ pid: process.pid }));
    const result = await cleanupPdfStorage('images', root);
    assert.deepEqual(result.skippedActiveIds.sort(), [queued.id, running.id].sort());
    assert.deepEqual(result.skippedBusyIds, [busy.id]); assert.deepEqual(result.imageJobIds, []);
    for (const job of [queued, running, busy]) {
      assert.equal((await readJob(job.id, root)).report.imagesAvailable, true);
      assert.ok(await fs.stat(path.join(job.directory, 'images.zip')));
    }
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('cleanup refuses linked or unrecognized export locations and never follows image-directory links', async () => {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'gate-storage-boundary-')), root = path.join(base, 'jobs'), outside = path.join(base, 'outside');
  await fs.mkdir(root); await fs.mkdir(outside);
  try {
    await fs.writeFile(path.join(outside, 'page-1.png'), 'outside image');
    const linked = randomUUID(); await fs.symlink(outside, jobDirectory(linked, root), process.platform === 'win32' ? 'junction' : 'dir');
    const images = await savedJob(root, { images: false });
    await fs.symlink(outside, path.join(images.directory, 'page-images'), process.platform === 'win32' ? 'junction' : 'dir');
    const invalid = await savedJob(root); const status = await readJob(invalid.id, root);
    await writeJobStatus(invalid.directory, { ...status, id: randomUUID() });
    const result = await cleanupPdfStorage('images', root);
    assert.equal(result.failures.length, 3); assert.equal(result.imageFilesDeleted, 0);
    assert.equal(await fs.readFile(path.join(outside, 'page-1.png'), 'utf8'), 'outside image');
    assert.equal((await pdfStorageUsage(root)).unavailableExports, 3);
    const all = await cleanupPdfStorage('exports', root);
    assert.deepEqual(all.deletedIds, [images.id]); assert.equal(all.failures.length, 2);
    assert.equal(await fs.readFile(path.join(outside, 'page-1.png'), 'utf8'), 'outside image');
    assert.ok(await fs.stat(invalid.directory));
  } finally { await fs.rm(base, { recursive: true, force: true }); }
});
