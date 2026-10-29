import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { deleteJob, jobDirectory, jobsRoot, PdfJobConflictError, readJob, resolveStoredJobDirectory, withJobMutation, writeJobStatus } from './pdf-jobs.mjs';

const active = job => ['queued', 'running'].includes(job.status);
const statuses = new Set(['queued', 'running', 'completed', 'failed', 'cancelled']);

async function fileInfo(file) {
  let info;
  try { info = await fs.lstat(file); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  if (!info.isFile() || info.isSymbolicLink()) throw new Error('A saved export contains an unexpected file link.');
  return { file, bytes: info.size };
}

async function storedJob(id, root) {
  const directory = await resolveStoredJobDirectory(id, root);
  if (!directory || !await fileInfo(path.join(directory, 'status.json')) || !await fileInfo(path.join(directory, 'request.json'))) return null;
  const job = await readJob(id, root);
  if (!job || job.id !== id || !statuses.has(job.status) || typeof job.createdAt !== 'string') throw new Error('Export metadata is invalid.');
  return { id, directory, job };
}

async function storedIds(root) {
  let entries;
  try { entries = await fs.readdir(root, { withFileTypes: true }); } catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  return entries.filter(entry => {
    try { jobDirectory(entry.name, root); return entry.isDirectory() || entry.isSymbolicLink(); } catch { return false; }
  }).map(entry => entry.name);
}

async function directoryBytes(directory) {
  const info = await fs.lstat(directory);
  if (info.isSymbolicLink()) return 0;
  if (info.isFile()) return info.size;
  if (!info.isDirectory()) return 0;
  let bytes = 0;
  for (const entry of await fs.readdir(directory)) bytes += await directoryBytes(path.join(directory, entry));
  return bytes;
}

async function generatedImages(directory) {
  const archive = await fileInfo(path.join(directory, 'images.zip'));
  const files = archive ? [archive] : [];
  const pageDirectory = path.join(directory, 'page-images');
  let info;
  try { info = await fs.lstat(pageDirectory); } catch (error) { if (error.code === 'ENOENT') return { files, pageDirectory: null, archives: Number(Boolean(archive)), pages: 0 }; throw error; }
  if (!info.isDirectory() || info.isSymbolicLink() || path.dirname(await fs.realpath(pageDirectory)) !== await fs.realpath(directory)) throw new Error('Generated image location is invalid.');
  let pages = 0;
  for (const name of await fs.readdir(pageDirectory)) {
    if (!/^page-\d+\.png$/.test(name)) continue;
    const file = await fileInfo(path.join(pageDirectory, name));
    if (file) { files.push(file); pages++; }
  }
  return { files, pageDirectory, archives: Number(Boolean(archive)), pages };
}

export async function pdfStorageUsage(root = jobsRoot()) {
  const usage = { exports: { count: 0, bytes: 0 }, images: { count: 0, bytes: 0, archives: 0, pages: 0 }, activeExports: 0, unavailableExports: 0 };
  for (const id of await storedIds(root)) {
    try {
      const entry = await storedJob(id, root);
      if (!entry) continue;
      if (active(entry.job)) { usage.activeExports++; continue; }
      const bytes = await directoryBytes(entry.directory);
      usage.exports.count++; usage.exports.bytes += bytes;
      const images = await generatedImages(entry.directory);
      if (images.files.length) usage.images.count++;
      usage.images.bytes += images.files.reduce((sum, file) => sum + file.bytes, 0);
      usage.images.archives += images.archives; usage.images.pages += images.pages;
    } catch (error) { if (error.code !== 'ENOENT') usage.unavailableExports++; }
  }
  return usage;
}

async function clearJobImages(id, root) {
  return withJobMutation(id, root, async () => {
    const entry = await storedJob(id, root);
    if (!entry) return null;
    const { directory, job } = entry;
    if (active(job)) throw new PdfJobConflictError('Cancel the export and wait for it to stop before deleting its images.');
    const images = await generatedImages(directory);
    const reportFile = await fileInfo(path.join(directory, 'report.json'));
    if (!images.files.length && job.report?.imagesAvailable !== true) return null;
    let bytes = 0;
    for (const file of images.files) { await fs.rm(file.file, { force: true }); bytes += file.bytes; }
    if (images.pageDirectory) {
      try { await fs.rmdir(images.pageDirectory); } catch (error) { if (!['ENOENT', 'ENOTEMPTY', 'EEXIST'].includes(error.code)) throw error; }
    }
    const report = { ...job.report, imagesAvailable: false };
    if (reportFile) {
      const temporary = path.join(directory, `report-${randomUUID()}.tmp`);
      try { await fs.writeFile(temporary, JSON.stringify(report, null, 2), { flag: 'wx' }); await fs.rename(temporary, reportFile.file); }
      finally { await fs.rm(temporary, { force: true }); }
    }
    await writeJobStatus(directory, { ...job, report });
    return { bytes, files: images.files.length };
  });
}

export async function cleanupPdfStorage(target, root = jobsRoot()) {
  if (!['exports', 'images'].includes(target)) throw new Error('Choose saved PDFs or generated page images.');
  const result = { target, deletedIds: [], imageJobIds: [], skippedActiveIds: [], skippedBusyIds: [], failures: [], bytesFreed: 0, imageFilesDeleted: 0 };
  // Snapshot the registered exports once. New exports created during cleanup are retained.
  for (const id of await storedIds(root)) {
    try {
      const entry = await storedJob(id, root);
      if (!entry) continue;
      if (active(entry.job)) { result.skippedActiveIds.push(id); continue; }
      if (target === 'exports') {
        const bytes = await directoryBytes(entry.directory);
        if (await deleteJob(id, root)) { result.deletedIds.push(id); result.bytesFreed += bytes; }
      } else {
        const removed = await clearJobImages(id, root);
        if (removed) { result.imageJobIds.push(id); result.bytesFreed += removed.bytes; result.imageFilesDeleted += removed.files; }
      }
    } catch (error) {
      if (error instanceof PdfJobConflictError) {
        const latest = await readJob(id, root).catch(() => null);
        (latest && active(latest) ? result.skippedActiveIds : result.skippedBusyIds).push(id);
      } else if (error.code !== 'ENOENT') result.failures.push({ id, message: error.message });
    }
  }
  return result;
}
