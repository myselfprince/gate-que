import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createJob, readJob, listJobs, cancelJob, jobDirectory } from '../src/lib/pdf-jobs.mjs';

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
    assert.equal((await listJobs(root))[0].id, job.id);
    assert.equal((await cancelJob(job.id, root)).cancelRequested, true);
    assert.equal((await readJob(job.id, root)).status, 'queued');
    assert.throws(() => jobDirectory('../../outside', root), /Unknown export job/);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
