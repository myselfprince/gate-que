// Read-only: build a review worksheet for one chapter's answers.
//
//   node scripts/topic-answers/worksheet.mjs --topic 1.1
//   node scripts/topic-answers/worksheet.mjs --subject "1. Discrete Maths" --chapter "1. Mathematical Logic"
//
// Writes a backup snapshot of the chapter, then tmp/topic-answers/<slug>/worksheet.md,
// worksheet.json and draft-answers.json. Run scripts/topic-answers/gateoverflow-index.py
// first so GATE Overflow candidates and keys are included. Candidates are hints only:
// option order differs between sources, so every key must be mapped by option text.
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { questionType, storedAnswerText } from '../../src/lib/question-answers.mjs';
import { TOPIC_ANSWER_DIR, TOPIC_ANSWER_FORMAT, questionContentHash } from '../../src/lib/topic-answers.mjs';
import { GATEOVERFLOW_INDEX, chapterArgs, databaseLabel, madeEasyChapterPdf, withChapters, writeBackup } from './lib.mjs';

const target = chapterArgs(process.argv);
const plain = value => String(value || '').replace(/\$[^$]*\$/g, ' ').replace(/\\[a-zA-Z]+/g, ' ').replace(/[^a-zA-Z0-9 ]+/g, ' ').toLowerCase();
const words = value => new Set(plain(value).split(/\s+/).filter(word => word.length > 2));
const overlap = (a, b) => { if (!a.size || !b.size) return 0; let shared = 0; for (const word of a) if (b.has(word)) shared++; return shared / Math.min(a.size, b.size); };
const norm = value => String(value || '').replace(/\s+/g, '').replace(/\\(?:left|right|,|;|!)/g, '').replace(/[{}$]/g, '');

const chapter = await withChapters(collection => collection.findOne({ subject: target.subject, chapter: target.chapter }));
if (!chapter) throw new Error(`Chapter not found: ${target.subject} / ${target.chapter}`);
const backup = await writeBackup(target.slug, 'worksheet', chapter);

const index = existsSync(GATEOVERFLOW_INDEX) ? JSON.parse(await fs.readFile(GATEOVERFLOW_INDEX, 'utf8')) : null;
const goQuestions = (index?.questions || []).map(item => ({ ...item, words: words(`${item.title} ${item.text}`) }));

// Verified independent year-paper copies keep a link to the book record they came from.
const copies = new Map();
for (const name of existsSync('data/papers') ? await fs.readdir('data/papers') : []) {
  if (!name.endsWith('.json')) continue;
  const paper = JSON.parse(await fs.readFile(path.join('data/papers', name), 'utf8'));
  for (const copy of paper.questions || []) {
    const id = copy.source?.copiedFrom?.questionId;
    if (id) copies.set(id, [...(copies.get(id) || []), { paper: paper.slug, copy }]);
  }
}

const existingFile = path.join(TOPIC_ANSWER_DIR, `${target.slug}.json`);
const rows = chapter.questions.map((question, position) => {
  const type = questionType(question);
  const own = words(`${question.text} ${['A', 'B', 'C', 'D'].map(letter => question[`opt${letter}`]).join(' ')}`);
  const candidates = goQuestions
    .filter(item => !question.year || item.year === String(question.year).trim())
    .map(item => ({ score: overlap(own, item.words), item }))
    .filter(match => match.score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ score, item }) => ({ score: Number(score.toFixed(2)), volume: item.volume, id: item.id, title: item.title, page: item.page, url: item.url, key: item.answer, answerKeyPage: item.answerKeyPage }));
  const yearPapers = (copies.get(question.id) || []).map(({ paper, copy }) => {
    const toBook = {};
    for (const letter of ['A', 'B', 'C', 'D']) {
      const match = ['A', 'B', 'C', 'D'].find(book => norm(question[`opt${book}`]) && norm(question[`opt${book}`]) === norm(copy[`opt${letter}`]));
      toBook[letter] = match || '?';
    }
    return {
      paper, number: copy.paperQuestionNumber, questionType: copy.questionType, key: copy.correctOptions || [], natAnswer: copy.natAnswer || '', natRange: copy.natRange || null,
      bookLetters: (copy.correctOptions || []).map(letter => toBook[letter]), sameOptionText: ['A', 'B', 'C', 'D'].every(letter => toBook[letter] === letter),
      verificationStatus: copy.verificationStatus || '', reference: copy.referenceAnswer || '', issues: copy.source?.issues || [],
    };
  });
  return {
    position: position + 1, id: question.id, isBlank: Boolean(question.isBlank), year: question.year, setNum: question.setNum, marks: question.marks,
    inferredType: type, storedAnswer: storedAnswerText(question), contentSha256: questionContentHash(question),
    diagram: question.diagram ? `public/${chapter.subject}/${chapter.chapter}/${question.diagram}${question.ext || '.png'}` : '',
    text: question.text, code: question.code, options: Object.fromEntries(['A', 'B', 'C', 'D'].map(letter => [letter, question[`opt${letter}`] || ''])),
    gateOverflow: candidates, yearPapers,
  };
});

const dir = path.join('tmp', 'topic-answers', target.slug);
await fs.mkdir(dir, { recursive: true });
const madeEasy = madeEasyChapterPdf(target);
const meta = {
  subject: target.subject, chapter: target.chapter, slug: target.slug, database: databaseLabel(), chapterUpdatedAt: chapter.updatedAt,
  backup, madeEasyPdf: existsSync(madeEasy) ? madeEasy : null, gateOverflowIndex: index ? GATEOVERFLOW_INDEX : null,
  answerFile: existingFile, answerFileExists: existsSync(existingFile),
};
await fs.writeFile(path.join(dir, 'worksheet.json'), JSON.stringify({ ...meta, questions: rows }, null, 2));
await fs.writeFile(path.join(dir, 'draft-answers.json'), JSON.stringify({
  format: TOPIC_ANSWER_FORMAT, subject: target.subject, chapter: target.chapter, slug: target.slug, reviewedAt: '', sources: {},
  questions: rows.filter(row => !row.isBlank).map(row => ({
    position: row.position, id: row.id, contentSha256: row.contentSha256, questionType: row.inferredType,
    correctOptions: [], natAnswer: '', status: 'verified', reason: '', note: '', sources: [],
  })),
}, null, 2));

const md = [`# Answer worksheet: ${target.subject} / ${target.chapter}`, '',
  `- Database: ${meta.database}; chapter updatedAt ${new Date(chapter.updatedAt).toISOString()}`,
  `- Backup: ${backup}`, `- Made Easy chapter PDF: ${meta.madeEasyPdf || 'not found'}`,
  `- GATE Overflow index: ${meta.gateOverflowIndex || 'missing — run python -I scripts/topic-answers/gateoverflow-index.py'}`,
  `- Final answer file: ${existingFile}${meta.answerFileExists ? ' (exists)' : ''}`, '',
  'Candidate keys are hints. Map every key by option TEXT, never by letter alone.', ''];
for (const row of rows) {
  md.push(`## Q${row.position} · ${row.year}${row.setNum ? ` set ${row.setNum}` : ''} · ${row.marks} mark(s) · ${row.inferredType}${row.isBlank ? ' · BLANK' : ''}`,
    `id \`${row.id}\` · content \`${row.contentSha256.slice(0, 12)}\`${row.storedAnswer ? ` · stored answer ${row.storedAnswer}` : ''}${row.diagram ? ` · diagram ${row.diagram}` : ''}`, '', row.text);
  if (row.code) md.push('', '```', row.code, '```');
  for (const [letter, option] of Object.entries(row.options)) if (option) md.push(`- (${letter}) ${option}`);
  for (const go of row.gateOverflow) md.push(`- GO ${go.volume} ${go.id} p.${go.page} key **${go.key || '—'}** (match ${go.score}) ${go.title} ${go.url}`);
  if (!row.gateOverflow.length) md.push('- GO: no candidate found by year/text — search the PDFs manually.');
  for (const yp of row.yearPapers) md.push(`- Year paper ${yp.paper} Q${yp.number}: key ${JSON.stringify(yp.key)}${yp.natAnswer ? ` NAT ${yp.natAnswer}` : ''} → book letters ${JSON.stringify(yp.bookLetters)}${yp.sameOptionText ? '' : ' (option text differs; compare manually)'}${yp.issues.length ? ` · issues: ${yp.issues.join(' ')}` : ''}`);
  md.push('');
}
await fs.writeFile(path.join(dir, 'worksheet.md'), md.join('\n'));
const withGo = rows.filter(row => row.gateOverflow.length).length, withCopy = rows.filter(row => row.yearPapers.length).length;
console.log(`${rows.length} questions (${rows.filter(row => row.isBlank).length} blank) · ${withGo} with GO candidates · ${withCopy} with year-paper copies`);
console.log(`Worksheet: ${path.join(dir, 'worksheet.md')}\nDraft: ${path.join(dir, 'draft-answers.json')}\nBackup: ${backup}`);
