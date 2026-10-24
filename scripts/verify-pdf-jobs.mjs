import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { PDFDocument } from 'pdf-lib';

const input = process.argv[2];
if (!input) throw new Error('Provide a chapter JSON with more than 20 questions.');
const payload = JSON.parse(await fs.readFile(input, 'utf8'));
assert.ok(payload.questions.length > 20);
const root = path.resolve('tmp/pdfs/export-upgrade/jobs-check');
await fs.mkdir(root, { recursive: true });
const origin = 'http://127.0.0.1:3118';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3118'], {
  env: { ...process.env, AUTH_REQUIRED: 'false', PDF_EXPORT_DIR: root }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
server.stdout.on('data', chunk => { logs = (logs + chunk).slice(-4000); });
server.stderr.on('data', chunk => { logs = (logs + chunk).slice(-4000); });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const request = async (url, body) => {
  const response = await fetch(origin + url, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
  const data = await response.json();
  assert.ok(response.ok, JSON.stringify(data));
  return data;
};
async function waitFor(id, check) {
  for (let count = 0; count < 240; count++) {
    const { job } = await request(`/api/pdf-jobs/${id}`);
    if (check(job)) return job;
    if (job.status === 'failed') throw new Error(`Worker failed: ${JSON.stringify(job)}\n${logs}`);
    await delay(250);
  }
  throw new Error('Timed out waiting for export.');
}
try {
  for (let count = 0; ; count++) {
    try { if ((await fetch(origin + '/api/auth/session')).ok) break; } catch { /* startup */ }
    if (count > 80 || server.exitCode !== null) throw new Error(logs);
    await delay(200);
  }
  const startedAt = Date.now();
  const { job: created } = await request('/api/pdf-jobs', payload);
  assert.equal(created.status, 'queued');
  const acceptanceMs = Date.now() - startedAt;
  await waitFor(created.id, job => job.completed >= 20 || job.status === 'completed');
  await request(`/api/pdf-jobs/${created.id}`, { action: 'cancel' });
  const cancelled = await waitFor(created.id, job => ['cancelled', 'completed'].includes(job.status));
  let finalJob = cancelled;
  if (cancelled.status === 'cancelled') {
    await request(`/api/pdf-jobs/${created.id}`, { action: 'retry' });
    finalJob = await waitFor(created.id, job => job.status === 'completed');
    assert.ok(finalJob.report.reusedBatches >= 1, 'Retry should reuse completed snapshot batches.');
  }
  assert.equal(finalJob.report.textBoundsChecked, true);
  assert.equal(finalJob.report.linksVerified, true);
  const response = await fetch(`${origin}/api/pdf-jobs/${created.id}/download`);
  assert.equal(response.status, 200);
  const bytes = new Uint8Array(await response.arrayBuffer());
  assert.equal((await PDFDocument.load(bytes)).getPageCount(), payload.questions.length);
  await fs.writeFile(path.join(root, 'verified-complete.pdf'), bytes);
  const missing = await fetch(`${origin}/api/pdf-jobs/not-a-job/download`);
  assert.equal(missing.status, 404);
  console.log(JSON.stringify({ acceptanceMs, pages: payload.questions.length, cancelledAndRetried: cancelled.status === 'cancelled', reusedBatches: finalJob.report.reusedBatches, report: finalJob.report }, null, 2));
} finally { server.kill(); }
