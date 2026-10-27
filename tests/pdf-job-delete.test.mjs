import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createJob, createBookJob, readJob, listJobs, jobDirectory, writeJobStatus, deleteJob, retryJob, PdfJobConflictError } from '../src/lib/pdf-jobs.mjs';
const payload = { subject: 'Test', chapter: 'Preview cleanup', questions: [{ id: 'one', text: 'Original' }] };
async function terminal(root, status = 'completed') {
  const job = await createJob(payload, { root, launch: false });
  await writeJobStatus(jobDirectory(job.id, root), { ...job, status, report: {} });
  return job;
}
test('deletion removes only the selected generated export and all its files', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'gate-job-delete-'));
  try {
    const job = await terminal(root), other = await terminal(root);
    const directory = jobDirectory(job.id, root);
    await fs.writeFile(path.join(root, 'sentinel.txt'), 'keep');
    for (const file of ['complete.pdf', 'parts.zip', 'report.json', 'images.zip', 'answer-key.pdf', 'worker.log']) await fs.writeFile(path.join(directory, file), 'generated file');
    await fs.writeFile(path.join(directory, 'images', 'figure.png'), 'snapshot image');
    assert.equal((await deleteJob(job.id, root)).id, job.id);
    await assert.rejects(fs.access(directory), { code: 'ENOENT' });
    assert.equal(await readJob(job.id, root), null); assert.equal((await listJobs(root)).length, 1);
    assert.equal((await readJob(other.id, root)).id, other.id); assert.equal(await fs.readFile(path.join(root, 'sentinel.txt'), 'utf8'), 'keep');
    assert.equal(payload.questions[0].text, 'Original');
    assert.equal(await deleteJob(job.id, root), null);
    assert.ok(!(await fs.readdir(root)).some(file => file.startsWith('.action-')));
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
test('active exports cannot be deleted; failed and cancelled exports can be cleaned up', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'gate-job-active-'));
  try {
    const job = await createJob(payload, { root, launch: false });
    await assert.rejects(deleteJob(job.id, root), PdfJobConflictError);
    assert.equal((await readJob(job.id, root)).status, 'queued');
    await writeJobStatus(jobDirectory(job.id, root), { ...job, status: 'running', pid: process.pid });
    await assert.rejects(deleteJob(job.id, root), /Cancel/);
    await writeJobStatus(jobDirectory(job.id, root), { ...job, status: 'cancelled' });
    assert.equal((await deleteJob(job.id, root)).status, 'cancelled');
    const failed = await terminal(root, 'failed'); assert.equal((await deleteJob(failed.id, root)).status, 'failed');
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
test('invalid paths, symlinks and concurrent retry actions cannot escape deletion boundaries', async () => {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'gate-job-boundary-')), root = path.join(base, 'jobs'), outside = path.join(base, 'outside');
  await fs.mkdir(root); await fs.mkdir(outside);
  try {
    await fs.writeFile(path.join(outside, 'keep.txt'), 'outside');
    await assert.rejects(deleteJob('../outside', root), /Unknown/);
    const linked = randomUUID(); await fs.symlink(outside, jobDirectory(linked, root), process.platform === 'win32' ? 'junction' : 'dir');
    await assert.rejects(deleteJob(linked, root), /location/); assert.equal(await fs.readFile(path.join(outside, 'keep.txt'), 'utf8'), 'outside');
    const job = await terminal(root, 'failed');
    const actionLock = path.join(root, `.action-${job.id}.lock`); await fs.writeFile(actionLock, JSON.stringify({ pid: process.pid }));
    await assert.rejects(deleteJob(job.id, root), PdfJobConflictError); await assert.rejects(retryJob(job.id, root), PdfJobConflictError);
    await fs.rm(actionLock); assert.equal((await deleteJob(job.id, root)).id, job.id);
  } finally { await fs.rm(base, { recursive: true, force: true }); }
});
test('completed subject books keep copied chapters after source exports are deleted', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'gate-job-book-delete-'));
  try {
    const a = await terminal(root), b = await terminal(root);
    for (const job of [a, b]) await fs.writeFile(path.join(jobDirectory(job.id, root), 'complete.pdf'), 'independent chapter copy');
    const book = await createBookJob([a.id, b.id], 'Book', { root, launch: false });
    await deleteJob(a.id, root);
    assert.equal(await fs.readFile(path.join(jobDirectory(book.id, root), 'chapters', 'chapter-1.pdf'), 'utf8'), 'independent chapter copy');
    assert.ok(await readJob(book.id, root)); assert.ok(await readJob(b.id, root));
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
