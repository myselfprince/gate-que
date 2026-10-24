import fs from 'node:fs/promises';
import { openSync, closeSync } from 'node:fs';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { collectLatexImages } from './latex-source.mjs';

const jobIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
// Runtime exports are intentionally outside the traced application bundle.
export const jobsRoot = () => path.resolve(/* turbopackIgnore: true */ process.env.PDF_EXPORT_DIR || 'output/pdf-jobs');
export function jobDirectory(id, root = jobsRoot()) {
  if (!jobIdPattern.test(id)) throw new Error('Unknown export job.');
  return path.join(root, id);
}
export async function writeJobStatus(directory, status) {
  const temporary = path.join(directory, `status-${randomUUID()}.tmp`);
  await fs.writeFile(temporary, JSON.stringify({ ...status, updatedAt: new Date().toISOString() }));
  await fs.rename(temporary, path.join(directory, 'status.json'));
}
export const isProcessAlive = pid => {
  if (!Number.isInteger(pid) || pid < 1) return false;
  try { process.kill(pid, 0); return true; } catch (error) { return error.code === 'EPERM'; }
};
export async function readJob(id, root = jobsRoot()) {
  const directory = jobDirectory(id, root);
  let status;
  try { status = JSON.parse(await fs.readFile(path.join(directory, 'status.json'), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  if (['queued', 'running'].includes(status.status) && status.pid && !isProcessAlive(status.pid)) {
    status = { ...status, status: 'failed', error: 'Export worker stopped. Retry this saved snapshot.' };
    await writeJobStatus(directory, status);
  }
  try { await fs.access(path.join(directory, 'cancel')); status.cancelRequested = true; } catch { /* not cancelled */ }
  return status;
}
export async function listJobs(root = jobsRoot()) {
  let entries;
  try { entries = await fs.readdir(root); } catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  const records = await Promise.all(entries.filter(id => jobIdPattern.test(id)).map(id => readJob(id, root)));
  return records.filter(Boolean).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function launchJob(id, root = jobsRoot()) {
  const directory = jobDirectory(id, root);
  const log = openSync(path.join(directory, 'worker.log'), 'a');
  try {
    const child = spawn(process.execPath, [path.resolve('scripts/pdf-worker.mjs'), id], {
      cwd: process.cwd(), env: { ...process.env, PDF_EXPORT_DIR: root }, windowsHide: true, detached: true, stdio: ['ignore', log, log],
    });
    await new Promise((resolve, reject) => { child.once('spawn', resolve); child.once('error', reject); });
    // Worker waits for this acknowledgement before touching the status file.
    const status = JSON.parse(await fs.readFile(path.join(directory, 'status.json'), 'utf8'));
    await writeJobStatus(directory, { ...status, pid: child.pid });
    await fs.writeFile(path.join(directory, 'ready'), '');
    child.unref();
  } finally { closeSync(log); }
}
export async function createJob(payload, { root = jobsRoot(), launch = true } = {}) {
  const records = await listJobs(root);
  if (records.filter(record => ['queued', 'running'].includes(record.status)).length >= 8) throw new Error('The export queue is full. Wait for a job to finish.');
  const id = randomUUID();
  const directory = jobDirectory(id, root);
  await fs.mkdir(path.join(directory, 'images'), { recursive: true });
  try {
    const images = {};
    for (const file of collectLatexImages(payload.questions)) {
      const buffer = await fs.readFile(path.join(process.cwd(), 'public', payload.subject, payload.chapter, file));
      await fs.writeFile(path.join(directory, 'images', file), buffer);
      images[file] = createHash('sha256').update(buffer).digest('hex');
    }
    const snapshot = structuredClone(payload);
    await fs.writeFile(path.join(directory, 'request.json'), JSON.stringify(snapshot));
    await fs.writeFile(path.join(directory, 'assets.json'), JSON.stringify(images));
    const status = { id, status: 'queued', subject: payload.subject, chapter: payload.chapter, total: payload.questions.length, completed: 0, createdAt: new Date().toISOString(), attempt: 1 };
    await writeJobStatus(directory, status);
    if (launch) await launchJob(id, root);
    return await readJob(id, root);
  } catch (error) {
    // Only the new, UUID-validated job directory belongs to this operation.
    await fs.rm(directory, { recursive: true, force: true });
    throw error;
  }
}
export async function cancelJob(id, root = jobsRoot()) {
  const job = await readJob(id, root);
  if (!job) return null;
  if (['queued', 'running'].includes(job.status)) await fs.writeFile(path.join(jobDirectory(id, root), 'cancel'), '');
  return readJob(id, root);
}
export async function retryJob(id, root = jobsRoot()) {
  const job = await readJob(id, root);
  if (!job) return null;
  if (!['failed', 'cancelled'].includes(job.status)) throw new Error('Only failed or cancelled exports can be retried.');
  const directory = jobDirectory(id, root);
  for (const file of ['cancel', 'ready']) await fs.rm(path.join(/* turbopackIgnore: true */ directory, file), { force: true });
  await writeJobStatus(directory, { ...job, status: 'queued', completed: 0, attempt: job.attempt + 1, error: undefined, pid: undefined, cancelRequested: undefined });
  await launchJob(id, root);
  return readJob(id, root);
}
