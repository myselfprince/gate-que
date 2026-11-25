// Shared helpers for the topic-answer scripts. They connect with the editor's
// own MONGODB_URI from .env.local and never print credentials.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { GATE_SYLLABUS } from '../../src/lib/syllabus.js';
import { topicSlug } from '../../src/lib/topic-answers.mjs';
import { COVERAGE_PROJECTION, topicCoverageRows } from '../../src/lib/topic-answers-server.mjs';

const require = createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const { MongoClient, BSON } = require('mongoose').mongo;
export { BSON };

export const MADE_EASY_ROOT = String.raw`C:\Users\Prince\Desktop\MadeEasy PYQ PDF`;
export const GATEOVERFLOW_ROOT = String.raw`G:\GateOverflow PYQ PDF all years`;
export const GATEOVERFLOW_INDEX = path.join('tmp', 'gateoverflow', 'index.json');

export function databaseLabel() {
  const uri = process.env.MONGODB_URI || '';
  if (!uri) throw new Error('MONGODB_URI is not configured in .env.local.');
  const host = uri.replace(/^mongodb(?:\+srv)?:\/\//, '').split('/')[0].split('@').at(-1);
  const name = uri.replace(/^mongodb(?:\+srv)?:\/\/[^/]+\/?/, '').split('?')[0] || '(default)';
  return `${name} on ${host}`;
}

export async function withChapters(work) {
  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  try { return await work(client.db().collection('chapters')); }
  finally { await client.close(); }
}

// Accept "--subject X --chapter Y", "--slug s" or a syllabus position such as "--topic 1.1".
export function chapterArgs(argv) {
  const value = name => { const at = argv.indexOf(`--${name}`); return at >= 0 ? argv[at + 1] : undefined; };
  const subject = value('subject'), chapter = value('chapter'), slug = value('slug'), topic = value('topic');
  const all = Object.entries(GATE_SYLLABUS).flatMap(([s, chapters]) => chapters.map(c => ({ subject: s, chapter: c, slug: topicSlug(s, c) })));
  if (subject && chapter) return { subject, chapter, slug: topicSlug(subject, chapter) };
  if (slug) { const found = all.find(item => item.slug === slug); if (found) return found; }
  if (topic && /^\d+\.\d+$/.test(topic)) {
    const [s, c] = topic.split('.').map(Number);
    const found = all.find(item => parseInt(item.subject) === s && parseInt(item.chapter) === c);
    if (found) return found;
  }
  throw new Error('Choose a chapter: --subject "1. Discrete Maths" --chapter "1. Mathematical Logic", --slug <slug> or --topic 1.1');
}

export async function writeBackup(slug, label, chapter) {
  const dir = path.join('data', 'backups', 'topic-answers', slug);
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${new Date().toISOString().replace(/[:.]/g, '-')}-${label}.ejson`);
  await fs.writeFile(file, BSON.EJSON.stringify(chapter, { relaxed: false }), { flag: 'wx' });
  return file;
}

export const madeEasyChapterPdf = ({ subject, chapter }) => path.join(MADE_EASY_ROOT, subject, `${chapter}.pdf`);

const order = value => parseInt(value, 10) || 999;

// Read-only: every chapter's stored-answer coverage plus its reviewed answer file status.
// The /gatetopicanswers page computes the same rows live through /api/gatetopicanswers.
export async function readCoverage(collection) {
  const rows = await topicCoverageRows(await collection.find({}, { projection: COVERAGE_PROJECTION }).toArray());
  return rows.sort((a, b) => order(a.subject) - order(b.subject) || order(a.chapter) - order(b.chapter) || a.chapter.localeCompare(b.chapter));
}

export const coverageLine = row => `${row.complete ? '✓' : ' '} ${row.subject} / ${row.chapter}: ${row.answered}/${row.answerable} answered`
  + `${row.subjective ? ` (+${row.subjective} subjective)` : ''}${row.answerFile.exists ? ` · answer file ${row.answerFile.valid ? `${row.answerFile.entries} entries` : 'INVALID'}` : ''}`;
