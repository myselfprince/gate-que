import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import AdmZip from 'adm-zip';
import { exportQuestionPdf } from '../src/lib/pdf-export.mjs';
import { jobDirectory, jobsRoot, writeJobStatus, isProcessAlive } from '../src/lib/pdf-jobs.mjs';

const id = process.argv[2];
const root = jobsRoot();
const directory = jobDirectory(id, root);
const lockPath = path.join(root, '.compile.lock');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const run = promisify(execFile);
const cancelled = async () => { try { await fs.access(path.join(directory, 'cancel')); return true; } catch { return false; } };
let status;
let lock;
const controller = new AbortController();
let poll;
try {
  for (let attempt = 0; ; attempt++) {
    try { await fs.access(path.join(directory, 'ready')); break; }
    catch { if (attempt > 100) throw new Error('Export launch was not acknowledged.'); await sleep(100); }
  }
  status = JSON.parse(await fs.readFile(path.join(directory, 'status.json'), 'utf8'));
  for (let attempt = 0; ; attempt++) {
    if (await cancelled()) throw new Error('Export cancelled.');
    try { lock = await fs.open(lockPath, 'wx'); await lock.writeFile(JSON.stringify({ pid: process.pid, id })); break; }
    catch (error) {
      if (error.code !== 'EEXIST') throw error;
      let recovery;
      try {
        recovery = await fs.open(`${lockPath}.recovery`, 'wx');
        const raw = await fs.readFile(lockPath, 'utf8');
        if (raw) {
          const owner = JSON.parse(raw);
          if (!isProcessAlive(owner.pid)) await fs.rm(lockPath, { force: true });
        } else if (Date.now() - (await fs.stat(lockPath)).mtimeMs > 30_000) await fs.rm(lockPath, { force: true });
      } catch { /* another worker is creating/removing/recovering the lock */ }
      finally { if (recovery) { await recovery.close(); await fs.rm(`${lockPath}.recovery`, { force: true }); } }
      if (attempt > 1800) throw new Error('The export queue timed out. Retry when the active job finishes.');
      await sleep(500);
    }
  }
  status = { ...status, status: 'running' };
  await writeJobStatus(directory, status);
  poll = setInterval(async () => { if (await cancelled()) controller.abort(); }, 500);
  const payload = JSON.parse(await fs.readFile(path.join(directory, 'request.json'), 'utf8'));
  const result = await exportQuestionPdf(payload, {
    assetDirectory: path.join(directory, 'images'), checkpointDirectory: path.join(directory, 'parts'), signal: controller.signal,
    onProgress: async progress => { status = { ...status, ...progress, phase: progress.phase || 'compiling' }; await writeJobStatus(directory, status); },
  });
  controller.signal.throwIfAborted();
  await fs.writeFile(path.join(directory, 'complete.pdf'), result.pdf);
  if (payload.pdfSettings?.includePageImages) {
    status = { ...status, phase: 'images' };
    await writeJobStatus(directory, status);
    const imageDirectory = path.join(directory, 'page-images');
    await fs.mkdir(imageDirectory, { recursive: true });
    try {
      await run(process.env.PDFTOPPM_BIN || 'pdftoppm', ['-scale-to', '1920', '-png', path.join(directory, 'complete.pdf'), path.join(imageDirectory, 'page')], { windowsHide: true, timeout: 180_000, signal: controller.signal, maxBuffer: 5 * 1024 * 1024 });
    } catch (error) {
      if (controller.signal.aborted) throw error;
      throw new Error('Page image export failed. Install Poppler pdftoppm or set PDFTOPPM_BIN, then retry the saved export.');
    }
    const files = (await fs.readdir(imageDirectory)).filter(file => /^page-\d+\.png$/.test(file)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
    if (files.length !== result.report.pages) throw new Error('The page image count does not match the PDF.');
    const images = new AdmZip();
    for (const [index, file] of files.entries()) images.addFile(`Question_${String(index + 1).padStart(3, '0')}.png`, await fs.readFile(path.join(imageDirectory, file)));
    await fs.writeFile(path.join(directory, 'images.zip'), images.toBuffer());
    result.report.imagesAvailable = true;
    await fs.rm(imageDirectory, { recursive: true, force: true });
  }
  const zip = new AdmZip();
  for (const part of result.parts) zip.addFile(`PYQs_Part${part.number}.pdf`, part.bytes);
  zip.addFile('export-qa.json', Buffer.from(JSON.stringify(result.report, null, 2)));
  await fs.writeFile(path.join(directory, 'parts.zip'), zip.toBuffer());
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(result.report, null, 2));
  controller.signal.throwIfAborted();
  status = { ...status, status: 'completed', completed: status.total, report: result.report, finishedAt: new Date().toISOString() };
  await writeJobStatus(directory, status);
} catch (error) {
  if (status) await writeJobStatus(directory, { ...status, status: await cancelled() ? 'cancelled' : 'failed', error: error.message, details: error.details, finishedAt: new Date().toISOString() });
  console.error(error);
  process.exitCode = 1;
} finally {
  clearInterval(poll);
  if (lock) { await lock.close(); await fs.rm(lockPath, { force: true }); }
}
