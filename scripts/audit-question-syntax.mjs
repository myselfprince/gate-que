import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { ALL_PDFS } from '../src/lib/pdf-tracker.mjs';
import { normalizeQuestionMetadata } from '../src/lib/question-metadata.mjs';
import { collectLatexImages, renderSourceQuestion } from '../src/lib/latex-source.mjs';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';
import { latexSegments } from '../src/lib/latex-segments.mjs';

const require = createRequire(import.meta.url);
const { MongoClient, BSON } = require('mongoose').mongo;
require('@next/env').loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const auditDir = path.resolve('tmp/question-syntax-audit');
const mode = process.argv[2] || 'static';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
await fs.mkdir(auditDir, { recursive: true });

if (mode === 'snapshot') {
  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000 });
  try {
    await client.connect();
    const chapters = await client.db().collection('chapters').find({}).sort({ subject: 1, chapter: 1 }).toArray();
    const targets = await client.db().collection('targets').find({}).toArray();
    const snapshot = BSON.EJSON.stringify({ takenAt: new Date(), chapters, targets }, null, 2);
    await fs.writeFile(path.join(auditDir, 'before.ejson'), snapshot, { flag: 'wx' });
    await fs.writeFile(path.join(auditDir, 'before.ejson.sha256'), `${digest(snapshot)}\n`, { flag: 'wx' });
    await fs.writeFile(path.join(auditDir, 'chapters.json'), JSON.stringify(chapters, null, 2));
    console.log(JSON.stringify({ chapters: chapters.length, questions: chapters.reduce((total, chapter) => total + chapter.questions.length, 0), snapshot: path.join(auditDir, 'before.ejson') }));
  } finally { await client.close(); }
  process.exit(0);
}

const input = process.argv[3] || path.join(auditDir, 'chapters.json');
const output = process.argv[4] || path.join(auditDir, 'static-report.json');
const chapters = JSON.parse(await fs.readFile(input, 'utf8'));
const issues = [];
const inventory = [];
const globalIds = new Map();
const sourceFiles = new Map();
const stringFields = ['text', 'code', 'optA', 'optB', 'optC', 'optD', 'natAnswer'];
const mathFields = ['text', 'optA', 'optB', 'optC', 'optD', 'natAnswer'];

function checkSyntax(question, context) {
  const add = (type, details, field) => issues.push({ ...context, type, field, details });
  for (const field of stringFields) if (question[field] != null && typeof question[field] !== 'string') add('field-type', typeof question[field], field);
  if (!question.isBlank && !(question.text || '').trim()) add('empty-text', 'Non-placeholder question has no text', 'text');
  if (/<img\b/i.test(question.text || '')) add('scraped-image-html', 'Image HTML is not an editable diagram reference.', 'text');
  if (question.text?.includes('[CODE]') && !question.code?.trim()) add('missing-code', 'Code placeholder has no snippet.', 'code');
  try { normalizeQuestionMetadata(question); } catch (error) { add('metadata', error.message); }
  try {
    renderSourceQuestion(question);
    for (const file of collectLatexImages([question])) {
      awaitImageChecks.push({ context, file, path: path.join('public', context.subject, context.chapter, file) });
    }
  } catch (error) { add('render-source', error.message); }
  for (const field of mathFields) {
    const value = question[field];
    if (typeof value !== 'string' || !value || (question.isCodeOptions && field.startsWith('opt'))) continue;
    for (const match of value.matchAll(/(\\+)hline\b/g)) {
      if (match[1].length % 2 === 0) add('table-rule-command', 'A row break is followed by plain hline instead of \\hline.', field);
    }
    let delimiter = null;
    let start = -1;
    let braces = 0;
    const tokens = [];
    for (let index = 0; index < value.length; index++) {
      if (value[index] === '\\') {
        const next = value[index + 1];
        if (['(', '[', ')', ']'].includes(next)) { tokens.push({ token: `\\${next}`, index }); index++; }
        else index++;
      } else if (value[index] === '$') {
        const token = value[index + 1] === '$' ? '$$' : '$';
        tokens.push({ token, index });
        if (token === '$$') index++;
      }
    }
    for (const token of tokens) {
      if (!delimiter) {
        if (['\\)', '\\]'].includes(token.token)) { add('math-delimiter', `Unexpected ${token.token} at ${token.index}`, field); continue; }
        delimiter = token.token; start = token.index;
      } else {
        const close = ({ '$': '$', '$$': '$$', '\\(': '\\)', '\\[': '\\]' })[delimiter];
        if (token.token !== close) { add('math-delimiter', `${delimiter} at ${start} interrupted by ${token.token} at ${token.index}`, field); continue; }
        const math = value.slice(start + delimiter.length, token.index);
        braces = 0;
        for (let index = 0; index < math.length; index++) {
          if (math[index] === '\\') { index++; continue; }
          if (math[index] === '{') braces++;
          if (math[index] === '}') braces--;
          if (braces < 0) break;
        }
        if (braces !== 0) add('math-braces', `Unbalanced braces (${braces}): ${math}`, field);
        const begins = [...math.matchAll(/\\begin\{([^}]+)\}/g)].map(match => match[1]);
        const ends = [...math.matchAll(/\\end\{([^}]+)\}/g)].map(match => match[1]);
        if (JSON.stringify(begins) !== JSON.stringify([...ends].reverse()) && begins.length > 0) {
          // A stack handles nested environments and consecutive arrays correctly.
          const stack = []; let valid = true;
          for (const match of math.matchAll(/\\(begin|end)\{([^}]+)\}/g)) {
            if (match[1] === 'begin') stack.push(match[2]);
            else if (stack.pop() !== match[2]) valid = false;
          }
          if (!valid || stack.length) add('math-environment', `Unbalanced environments: ${math}`, field);
        }
        delimiter = null;
      }
    }
    if (delimiter) add('math-delimiter', `Unclosed ${delimiter} at ${start}: ${value.slice(Math.max(0, start - 40), start + 180)}`, field);
    const stripped = latexSegments(value).filter(segment => !segment.math).map(segment => segment.text).join('');
    if (/\\(?:frac|sqrt|sum|prod|log|left|right|begin|text|mathrm|overline|neg|forall|exists|rightarrow|leq|geq|alpha|beta|lambda|theta|cdot|times)\b/.test(stripped)) add('latex-outside-math', stripped.slice(0, 800), field);
    if (/[\uFFFD\u200B]/.test(value)) add('invisible-or-replacement-character', value.slice(0, 800), field);
  }
}

const awaitImageChecks = [];
for (const [chapterIndex, chapter] of chapters.entries()) {
  const files = ALL_PDFS.filter(file => file.subject === chapter.subject && file.chapter === chapter.chapter);
  const row = { index: chapterIndex, subject: chapter.subject, chapter: chapter.chapter, questions: chapter.questions.length,
    placeholders: 0, withSource: 0, verifiedVersions: 0, sourcePdfPaths: files.map(file => file.path) };
  const ids = new Set();
  for (const [index, question] of chapter.questions.entries()) {
    const context = { subject: chapter.subject, chapter: chapter.chapter, chapterIndex, index: index + 1, id: question.id, view: 'editable' };
    if (!question.id || ids.has(question.id)) issues.push({ ...context, type: 'duplicate-or-missing-id' });
    ids.add(question.id);
    if (globalIds.has(question.id)) issues.push({ ...context, type: 'id-reused-across-chapters', details: globalIds.get(question.id) });
    else globalIds.set(question.id, { subject: chapter.subject, chapter: chapter.chapter, index: index + 1 });
    if (question.isBlank) row.placeholders++;
    if (question.source) { row.withSource++; sourceFiles.set(question.source.sha256, question.source.file); }
    checkSyntax(question, context);
    if (question.source?.verifiedQuestion) {
      row.verifiedVersions++;
      checkSyntax(question.source.verifiedQuestion, { ...context, view: 'verified-source' });
    }
  }
  try { buildQuestionPages(chapter); } catch (error) { issues.push({ subject: chapter.subject, chapter: chapter.chapter, type: 'chapter-export', details: error.message }); }
  inventory.push(row);
}
for (const check of awaitImageChecks) {
  try { await fs.access(check.path); }
  catch { issues.push({ ...check.context, type: 'missing-image', details: check.file }); }
}
const hashes = [];
for (const file of ALL_PDFS.filter(file => inventory.some(chapter => chapter.subject === file.subject && chapter.chapter === file.chapter))) {
  const hash = digest(await fs.readFile(file.path));
  hashes.push({ ...file, sha256: hash, matchesImportedSource: sourceFiles.has(hash) });
}
const report = { input, chapters: inventory.length, questions: inventory.reduce((total, chapter) => total + chapter.questions, 0),
  withSource: inventory.reduce((total, chapter) => total + chapter.withSource, 0),
  verifiedVersions: inventory.reduce((total, chapter) => total + chapter.verifiedVersions, 0),
  issues, inventory, sourcePdfs: hashes };
await fs.writeFile(output, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ chapters: report.chapters, questions: report.questions, withSource: report.withSource,
  verifiedVersions: report.verifiedVersions, inventory, issues }, null, 2));
