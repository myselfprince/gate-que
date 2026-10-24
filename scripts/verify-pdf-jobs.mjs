import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { PDFDocument } from 'pdf-lib';
import AdmZip from 'adm-zip';

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
  if (payload.pdfSettings?.includePageImages) {
    const imagesResponse = await fetch(`${origin}/api/pdf-jobs/${created.id}/download?kind=images`);
    assert.equal(imagesResponse.status, 200);
    const images = new AdmZip(Buffer.from(await imagesResponse.arrayBuffer()));
    assert.equal(images.getEntries().length, payload.questions.length);
    const image = images.readFile('Question_001.png');
    assert.equal(image.readUInt32BE(16), 1920);
    await fs.writeFile(path.join(root, 'matched-page-001.png'), image);
  }
  if (payload.pdfSettings?.includeAnswerKey) {
    const answerResponse = await fetch(`${origin}/api/pdf-jobs/${created.id}/download?kind=answers`);
    assert.equal(answerResponse.status, 200);
    const answers = new Uint8Array(await answerResponse.arrayBuffer());
    assert.ok((await PDFDocument.load(answers)).getPageCount() > 0);
    assert.equal(finalJob.report.answerKeyBoundsChecked, true);
    await fs.writeFile(path.join(root, 'verified-answer-key.pdf'), answers);
  }
  const missing = await fetch(`${origin}/api/pdf-jobs/not-a-job/download`);
  assert.equal(missing.status, 404);
  let bookPages;
  if (process.argv.includes('--book')) {
    const { jobs } = await request('/api/pdf-jobs');
    const other = jobs.filter(job => job.id !== created.id && job.status === 'completed' && job.kind !== 'book' && job.subject === created.subject && job.total !== created.total).sort((a, b) => b.total - a.total)[0];
    assert.ok(other, 'Book verification requires another completed chapter export from the same subject.');
    const exportIds = [created.id, other.id];
    const { job: book } = await request('/api/pdf-jobs', { mode: 'book', title: 'Verified subject book', exportIds });
    const finished = await waitFor(book.id, job => job.status === 'completed');
    assert.deepEqual(finished.report.sourceJobs, exportIds);
    bookPages = created.total + other.total;
    assert.equal(finished.report.pages, bookPages);
    assert.equal(finished.report.websiteLinks, finalJob.report.websiteLinks + other.report.websiteLinks);
    const pdfResponse = await fetch(`${origin}/api/pdf-jobs/${book.id}/download`);
    assert.equal(pdfResponse.status, 200);
    const bytes = new Uint8Array(await pdfResponse.arrayBuffer());
    assert.equal((await PDFDocument.load(bytes)).getPageCount(), bookPages);
    await fs.writeFile(path.join(root, 'verified-subject-book.pdf'), bytes);
  }
  console.log(JSON.stringify({ acceptanceMs, pages: payload.questions.length, cancelledAndRetried: cancelled.status === 'cancelled', reusedBatches: finalJob.report.reusedBatches, bookPages, report: finalJob.report }, null, 2));
} finally { server.kill(); }
