import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';

const run = promisify(execFile);
const root = path.resolve('tmp/question-syntax-audit');
const input = process.argv[2] || path.join(root, 'chapters.json');
const output = path.resolve(process.argv[3] || path.join(root, 'compilation-before'));
const chapters = JSON.parse(await fs.readFile(input, 'utf8'));
const results = [];
const imageBypasses = [];
const diagnostics = !process.argv.includes('--strict-images');
await fs.mkdir(output, { recursive: true });

async function prepare(question, chapter, index) {
  const q = structuredClone(question);
  const names = (q.diagram || '').split(',').map(name => name.trim()).filter(Boolean);
  const kept = [];
  const remap = new Map();
  for (const [position, name] of names.entries()) {
    try { await fs.access(path.join('public', chapter.subject, chapter.chapter, `${name}${q.ext || '.png'}`)); remap.set(position, kept.length); kept.push(name); }
    catch { imageBypasses.push({ subject: chapter.subject, chapter: chapter.chapter, index: index + 1, file: name }); }
  }
  q.diagram = kept.join(', ');
  q.text = (q.text || '').replace(/\[IMG_(\d+)\]|\[DIAGRAM_PLACEHOLDER\]/g, (tag, number) => {
    const position = number ? Number(number) - 1 : 0;
    return remap.has(position) ? `[IMG_${remap.get(position) + 1}]` : '[Missing source diagram - audit diagnostic only]';
  });
  for (const field of ['optA', 'optB', 'optC', 'optD']) {
    if (q[field]?.startsWith('IMG:')) {
      try { await fs.access(path.join('public', chapter.subject, chapter.chapter, `${q[field].slice(4).trim()}${q.ext || '.png'}`)); }
      catch { imageBypasses.push({ subject: chapter.subject, chapter: chapter.chapter, index: index + 1, field }); q[field] = '[Missing option image - audit diagnostic only]'; }
    }
  }
  return q;
}

async function compile(chapter, questions, indices, directory) {
  await fs.mkdir(directory, { recursive: true });
  const imageRoot = path.resolve('public', chapter.subject, chapter.chapter).replaceAll('\\', '/');
  const source = buildQuestionPages({ ...chapter, questions }, { imageRoot, totalQuestions: chapter.questions.length, startIndex: indices[0] });
  await fs.writeFile(path.join(directory, 'main.tex'), source);
  try {
    const result = await run('pdflatex', ['-no-shell-escape', '-halt-on-error', '-interaction=nonstopmode', '-file-line-error', 'main.tex'], {
      cwd: directory, windowsHide: true, timeout: 45000, maxBuffer: 5 * 1024 * 1024,
    });
    await fs.writeFile(path.join(directory, 'compile.log'), result.stdout + result.stderr);
    return { ok: true, warnings: result.stdout.split(/\r?\n/).filter(line => /Overfull|Underfull|Warning/.test(line)), path: path.join(directory, 'main.pdf') };
  } catch (error) {
    const log = (error.stdout || '') + (error.stderr || '');
    await fs.writeFile(path.join(directory, 'compile.log'), log);
    return { ok: false, error: log.slice(-1800), timeout: error.killed || false };
  }
}

async function isolate(chapter, questions, indices, directory) {
  const result = await compile(chapter, questions, indices, directory);
  if (result.ok) return { valid: indices.map(index => index + 1), failures: [], runs: [result] };
  if (questions.length === 1) return { valid: [], failures: [{ index: indices[0] + 1, id: questions[0].id, ...result }], runs: [] };
  const mid = Math.floor(questions.length / 2);
  const left = await isolate(chapter, questions.slice(0, mid), indices.slice(0, mid), path.join(directory, 'left'));
  const right = await isolate(chapter, questions.slice(mid), indices.slice(mid), path.join(directory, 'right'));
  return { valid: [...left.valid, ...right.valid], failures: [...left.failures, ...right.failures], runs: [...left.runs, ...right.runs] };
}

const tasks = chapters.map((chapter, index) => ({ chapter, index, view: 'editable' }));
for (const [index, chapter] of chapters.entries()) {
  const verified = chapter.questions.filter(question => question.source?.verifiedQuestion).map(question => ({ ...question, ...question.source.verifiedQuestion }));
  if (verified.length) tasks.push({ chapter: { ...chapter, questions: verified }, index, view: 'verified-source' });
}
let cursor = 0;
async function worker() {
  while (cursor < tasks.length) {
    const task = tasks[cursor++];
    const { chapter, index, view } = task;
    const directory = path.join(output, `${String(index).padStart(2, '0')}-${view}`);
    try {
      const questions = await Promise.all(chapter.questions.map((question, questionIndex) => diagnostics ? prepare(question, chapter, questionIndex) : question));
      const result = await isolate(chapter, questions, questions.map((_, questionIndex) => questionIndex), directory);
      const record = { chapterIndex: index, subject: chapter.subject, chapter: chapter.chapter, view,
        total: questions.length, validCount: result.valid.length, valid: result.valid, failures: result.failures,
        compiledFiles: result.runs.map(run => run.path), warnings: result.runs.flatMap(run => run.warnings) };
      results.push(record);
      console.log(JSON.stringify({ subject: chapter.subject, chapter: chapter.chapter, view, total: record.total, valid: record.validCount, failures: record.failures.map(failure => ({ index: failure.index, id: failure.id, error: failure.error.slice(-850) })) }));
    } catch (error) {
      results.push({ chapterIndex: index, subject: chapter.subject, chapter: chapter.chapter, view, total: chapter.questions.length, validCount: 0, preflightFailure: error.message });
      console.log(JSON.stringify({ chapter: chapter.chapter, error: error.message }));
    }
    await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ diagnostics, imageBypasses, results }, null, 2));
  }
}
await Promise.all([worker(), worker()]);
console.log(JSON.stringify({ finished: true, views: results.length, valid: results.reduce((sum, result) => sum + result.validCount, 0), failures: results.reduce((sum, result) => sum + (result.failures?.length || 0), 0), imageBypasses: imageBypasses.length }));
