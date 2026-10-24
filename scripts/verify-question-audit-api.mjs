import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { once } from 'node:events';
import AdmZip from 'adm-zip';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';

const run = promisify(execFile);
const root = path.resolve('tmp/question-syntax-audit');
const chapters = JSON.parse(await fs.readFile(path.join(root, 'staged-chapters.json'), 'utf8'));
const { patches } = JSON.parse(await fs.readFile(path.join(root, 'patches.json'), 'utf8'));
const output = path.join(root, 'http-exports');
await fs.mkdir(output, { recursive: true });
const origin = 'http://127.0.0.1:3107';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--port', '3107', '--hostname', '127.0.0.1'], {
  env: { ...process.env, AUTH_REQUIRED: 'false' }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
server.stdout.on('data', chunk => { logs = (logs + chunk).slice(-8000); });
server.stderr.on('data', chunk => { logs = (logs + chunk).slice(-8000); });
const results = [];
try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (server.exitCode !== null) throw new Error(`QA server failed: ${logs}`);
    try { ready = (await fetch(`${origin}/api/auth/session`)).ok; } catch { /* isolated local server is starting */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  assert.ok(ready);
  for (const [ci, chapter] of chapters.entries()) {
    const numbers = new Set(patches.filter(patch => patch.chapterId === chapter._id).map(patch => patch.number));
    if (ci === 0) numbers.add(59);
    if (ci === 5) numbers.add(91);
    if (ci === 16) { numbers.add(9); numbers.add(80); }
    if (!numbers.size) continue;
    const payload = { subject: chapter.subject, chapter: chapter.chapter, questions: [...numbers].sort((a, b) => a - b).map(number => chapter.questions[number - 1]) };
    const folder = path.join(output, String(ci).padStart(2, '0'));
    await fs.mkdir(folder, { recursive: true });
    let sourceFolder;
    for (const kind of ['pdf', 'latex']) {
      let response;
      for (let attempt = 0; attempt < 4; attempt++) {
        response = await fetch(`${origin}/api/export-${kind}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(payload), signal: AbortSignal.timeout(150000) });
        if (response.status !== 429) break;
        await response.arrayBuffer();
        const waitSeconds = Math.max(1, Number(response.headers.get('Retry-After')) || 30);
        console.log(JSON.stringify({ rateLimited: kind, waitSeconds }));
        for (let remaining = waitSeconds; remaining > 0; remaining -= 20) await new Promise(resolve => setTimeout(resolve, Math.min(20, remaining) * 1000));
      }
      assert.equal(response.status, 200, `Export ${kind}: ${response.status}; ${response.status === 200 ? '' : await response.text()}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      const zip = new AdmZip(bytes);
      await fs.writeFile(path.join(folder, `${kind}.zip`), bytes);
      const extracted = path.join(folder, kind);
      await fs.mkdir(extracted, { recursive: true });
      zip.extractAllTo(extracted, true);
      if (kind === 'latex') {
        sourceFolder = extracted;
        const portable = JSON.parse(zip.readAsText('chapter.json'));
        assert.equal(zip.readAsText('main.tex'), buildQuestionPages(portable));
        assert.equal(portable.questions.length, payload.questions.length);
        for (const [index, question] of portable.questions.entries()) {
          for (const field of ['text', 'code', 'optA', 'optB', 'optC', 'optD', 'diagram']) assert.equal(question[field] || '', payload.questions[index][field] || '');
        }
      }
    }
    const compiled = await run('pdflatex', ['-no-shell-escape', '-halt-on-error', '-interaction=nonstopmode', 'main.tex'], { cwd: sourceFolder, windowsHide: true, timeout: 45000, maxBuffer: 5 * 1024 * 1024 });
    await fs.writeFile(path.join(sourceFolder, 'compile.log'), compiled.stdout + compiled.stderr);
    const record = { chapterIndex: ci, subject: chapter.subject, chapter: chapter.chapter, questions: payload.questions.length, pdfHttpStatus: 200, latexHttpStatus: 200, portableZipCompiled: true };
    results.push(record);
    console.log(JSON.stringify(record));
  }
  await fs.writeFile(path.join(root, 'http-export-report.json'), JSON.stringify(results, null, 2));
} finally {
  server.kill();
  if (server.exitCode === null) await once(server, 'exit');
}
