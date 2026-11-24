import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createJob, createBookJob, readJob, listJobs, cancelJob, jobDirectory, writeJobStatus } from '../src/lib/pdf-jobs.mjs';
import { snapshotPageSize } from '../src/lib/pdf-settings.mjs';

test('subject books refuse chapter exports with different page sizes', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'gate-job-book-size-'));
  try {
    const chapter = async (name, pageSize) => {
      const job = await createJob({ subject: 'Test', chapter: name, questions: [{ id: name, text: 'Question' }], pdfSettings: pageSize ? { pageSize } : {} }, { root, launch: false });
      const directory = jobDirectory(job.id, root);
      await writeJobStatus(directory, { ...job, status: 'completed', report: {} });
      await fs.writeFile(path.join(directory, 'complete.pdf'), 'chapter');
      return job;
    };
    const wide = await chapter('Wide'), alsoWide = await chapter('Also wide'), a4 = await chapter('A4', 'a4-landscape');
    // Snapshots from before page sizes existed were compiled as A4 landscape.
    const legacy = await chapter('Legacy');
    const legacyRequest = path.join(jobDirectory(legacy.id, root), 'request.json');
    const snapshot = JSON.parse(await fs.readFile(legacyRequest, 'utf8')); delete snapshot.pdfSettings;
    await fs.writeFile(legacyRequest, JSON.stringify(snapshot));
    assert.equal(snapshotPageSize(undefined), 'a4-landscape');
    await assert.rejects(createBookJob([wide.id, a4.id], 'Book', { root, launch: false }), /different page sizes \(Widescreen \(16:9\): Wide; A4 landscape: A4\)/);
    await assert.rejects(createBookJob([wide.id, legacy.id], 'Book', { root, launch: false }), /A4 landscape: Legacy/);
    assert.ok(await createBookJob([wide.id, alsoWide.id], 'Book', { root, launch: false }));
    assert.ok(await createBookJob([a4.id, legacy.id], 'A4 book', { root, launch: false }));
    assert.equal((await listJobs(root)).filter(job => job.kind === 'book').length, 2);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('export jobs freeze question snapshots, persist history and cancel without changing the draft', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'gate-job-test-'));
  try {
    const payload = { subject: 'Test', chapter: 'Snapshot', questions: [{ id: 'one', text: 'Original', solutionUrl: 'https://youtu.be/dQw4w9WgXcQ', gateOverflowUrl: 'https://gateoverflow.in/12345' }] };
    const job = await createJob(payload, { root, launch: false });
    payload.questions[0].text = 'Edited';
    payload.questions[0].gateOverflowUrl = '';
    const snapshot = JSON.parse(await fs.readFile(path.join(jobDirectory(job.id, root), 'request.json'), 'utf8'));
    assert.equal(snapshot.questions[0].text, 'Original');
    assert.equal(snapshot.questions[0].solutionUrl, 'https://youtu.be/dQw4w9WgXcQ');
    assert.equal(snapshot.questions[0].gateOverflowUrl, 'https://gateoverflow.in/12345');
    assert.equal(snapshot.pdfSettings.pageSize, 'widescreen');
    assert.equal((await listJobs(root))[0].id, job.id);
    assert.equal((await cancelJob(job.id, root)).cancelRequested, true);
    assert.equal((await readJob(job.id, root)).status, 'queued');
    assert.throws(() => jobDirectory('../../outside', root), /Unknown export job/);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
