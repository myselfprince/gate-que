import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import AdmZip from 'adm-zip';
import { LAN_IMPORT } from '../data/imports/cn-lan.mjs';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';

const outputDir = process.argv[2];
if (!outputDir) throw new Error('Provide an output directory for the export checks.');
await fs.mkdir(outputDir, { recursive: true });
const origin = 'http://127.0.0.1:3107';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--port', '3107', '--hostname', '127.0.0.1'], {
  env: { ...process.env, AUTH_REQUIRED: 'false' }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
server.stdout.on('data', (chunk) => { logs = (logs + chunk).slice(-8000); });
server.stderr.on('data', (chunk) => { logs = (logs + chunk).slice(-8000); });
const post = (route, body) => fetch(`${origin}/api/${route}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body), signal: AbortSignal.timeout(150_000),
});
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error(`QA server failed: ${logs}`);
    try { ready = (await fetch(`${origin}/api/auth/session`)).ok; } catch { /* wait for this server */ }
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(ready, 'QA server did not become ready.');
  const pdfResponse = await post('export-pdf', LAN_IMPORT);
  assert.equal(pdfResponse.status, 200, `PDF export failed: ${pdfResponse.status === 200 ? '' : await pdfResponse.text()}\n${logs}`);
  const pdfBytes = Buffer.from(await pdfResponse.arrayBuffer());
  const pdfZip = new AdmZip(pdfBytes);
  assert.deepEqual(pdfZip.getEntries().map((entry) => entry.entryName), ['PYQs_Part1.pdf', 'PYQs_Part2.pdf']);
  await fs.writeFile(path.join(outputDir, 'CN-LAN-Black-PDFs.zip'), pdfBytes);
  for (const entry of pdfZip.getEntries()) await fs.writeFile(path.join(outputDir, entry.entryName), entry.getData());

  const sourceResponse = await post('export-latex', LAN_IMPORT);
  assert.equal(sourceResponse.status, 200);
  const sourceBytes = Buffer.from(await sourceResponse.arrayBuffer());
  const sourceZip = new AdmZip(sourceBytes);
  assert.equal(sourceZip.readAsText('main.tex'), buildQuestionPages(LAN_IMPORT));
  assert.equal(JSON.parse(sourceZip.readAsText('chapter.json')).questions.length, 35);
  await fs.writeFile(path.join(outputDir, 'CN-LAN-Black-LaTeX.zip'), sourceBytes);

  const invalid = await post('export-pdf', { ...LAN_IMPORT, questions: [{ ...LAN_IMPORT.questions[0], diagram: '__missing_pdf_test_8642' }] });
  assert.equal(invalid.status, 400);
  assert.match((await invalid.json()).error, /image is missing/i);
  console.log(JSON.stringify({ pdfStatus: 200, parts: 2, sourceMatchesPdfLayout: true, missingImageRejected: true, outputDir }, null, 2));
} finally {
  server.kill();
  if (server.exitCode === null) await once(server, 'exit');
}
