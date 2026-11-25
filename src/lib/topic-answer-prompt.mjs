// Topic-by-topic answer prompts for this editor's book chapters (/gatetopicanswers).
// Client-safe: no Node built-ins. Server code computes coverage and passes it in.
import { GATE_SYLLABUS } from './syllabus.js';

export const EDITOR_PROJECT_PATH = String.raw`E:\All Projects and Data\gate-pyq-YT-app`;
export const GATEOVERFLOW_ROOT = String.raw`G:\GateOverflow PYQ PDF all years`;
export const MADE_EASY_ROOT = String.raw`C:\Users\Prince\Desktop\MadeEasy PYQ PDF`;

// Where each subject sits in the GATE Overflow volumes and the Made Easy solutions folder.
const SUBJECT_SOURCES = {
  '1. Discrete Maths': { volume: 'filter1_volume1.pdf', chapters: { '1. Mathematical Logic': 'Discrete Mathematics: Mathematical Logic', '2. Set Theory and Algebra': 'Discrete Mathematics: Set Theory & Algebra', '3. Combinatorics': 'Discrete Mathematics: Combinatory', '4. Graph Theory': 'Discrete Mathematics: Graph Theory' }, solutions: 'Discrete Mathemetics.pdf' },
  '2. TOC': { volume: 'filter1_volume2.pdf', chapter: 'Theory of Computation', solutions: 'TOC.pdf' },
  '3. Computer Networks': { volume: 'filter1_volume3.pdf', chapter: 'Computer Networks', solutions: 'CN.pdf' },
  '4. COA': { volume: 'filter1_volume3.pdf', chapter: 'CO & Architecture', solutions: 'COA.pdf' },
  '5. Operating Systems': { volume: 'filter1_volume3.pdf', chapter: 'Operating System', solutions: 'OS.pdf' },
  '6. Data Structures': { volume: 'filter1_volume2.pdf', chapter: 'Programming and DS: Data Structures', solutions: 'C Programming and DS.pdf' },
  '7. Algorithms': { volume: 'filter1_volume2.pdf', chapter: 'Algorithms', solutions: 'Algorithms.pdf' },
  '8. C Prog': { volume: 'filter1_volume2.pdf', chapter: 'Programming: Programming in C', solutions: 'C Prog. & Data Structures.pdf' },
  '9. Digital Logic': { volume: 'filter1_volume3.pdf', chapter: 'Digital Logic', solutions: 'Digital Logic.pdf' },
  '10. Compiler Design': { volume: 'filter1_volume2.pdf', chapter: 'Compiler Design', solutions: 'Compiler Design.pdf' },
  '11. Engg. Maths': { volume: 'filter1_volume1.pdf', chapters: { '1. Probability': 'Engineering Mathematics: Probability', '2. Linear Algebra': 'Engineering Mathematics: Linear Algebra', '3. Calculus': 'Engineering Mathematics: Calculus' } },
  '12. DBMS': { volume: 'filter1_volume3.pdf', chapter: 'Databases', solutions: 'DBMS.pdf' },
  '13. General Aptitude': { volume: 'filter1_volume1.pdf', chapter: 'General Aptitude: Analytical, Quantitative, Spatial and Verbal Aptitude' },
};

// Stable file-name-safe identity for a chapter; data/topic-answers/<slug>.json uses it.
const slugPart = value => String(value).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const topicSlug = (subject, chapter) => `${slugPart(subject)}--${slugPart(chapter)}`;
const order = value => parseInt(value, 10) || 999;

export function topicStatus(topic) {
  const c = topic.coverage;
  if (!c) return { state: 'unknown', complete: false, label: 'Status unavailable' };
  if (c.missingChapter) return { state: 'missing', complete: false, label: 'No questions in the editor yet' };
  if (c.answerFile?.exists && c.answerFile.valid === false) return { state: 'review', complete: false, label: 'Answer file needs review' };
  if (c.complete) return { state: 'complete', complete: true, label: `All answered · ${c.answered}/${c.answerable}` };
  if (c.answered > 0) return { state: 'progress', complete: false, label: `In progress · ${c.answered}/${c.answerable} answered` };
  return { state: 'pending', complete: false, label: `No answers yet · 0/${c.answerable}` };
}

// Merge the syllabus with per-chapter coverage rows (null when the database is unavailable).
export function topicList(rows, syllabus = GATE_SYLLABUS) {
  const bySlug = new Map((rows || []).map(row => [row.slug, row]));
  const topics = Object.entries(syllabus).flatMap(([subject, chapters]) => chapters.map(chapter => {
    const slug = topicSlug(subject, chapter);
    const row = bySlug.get(slug);
    bySlug.delete(slug);
    return { subject, chapter, slug, coverage: row || (rows ? { missingChapter: true } : null) };
  }));
  // Chapters saved in the database but absent from the syllabus stay visible.
  for (const row of bySlug.values()) topics.push({ subject: row.subject, chapter: row.chapter, slug: row.slug, coverage: row });
  return topics
    .map(topic => ({ ...topic, status: topicStatus(topic) }))
    .sort((a, b) => order(a.subject) - order(b.subject) || order(a.chapter) - order(b.chapter) || a.chapter.localeCompare(b.chapter));
}

export const topicLabel = topic => `${topic.subject.replace(/^\d+\.\s*/, '')} · ${topic.chapter.replace(/^\d+\.\s*/, '')}`;

// Next pending topic: not complete and not copied yet, otherwise the first incomplete one.
export function nextTopic(topics, copied = {}) {
  const open = topics.filter(topic => !topic.status.complete && topic.status.state !== 'missing');
  return open.find(topic => !copied[topic.slug]) || open[0] || null;
}

function sourceHints(topic) {
  const source = SUBJECT_SOURCES[topic.subject];
  const goChapter = source?.chapters?.[topic.chapter] || source?.chapter;
  const volume = source ? `${GATEOVERFLOW_ROOT}\\${source.volume}` : `${GATEOVERFLOW_ROOT}\\filter1_volume1.pdf … volume3.pdf`;
  return {
    gateOverflow: goChapter ? `${volume} — chapter "${goChapter}"` : volume,
    madeEasyChapter: `${MADE_EASY_ROOT}\\${topic.subject}\\${topic.chapter}.pdf`,
    madeEasySolutions: source?.solutions ? `${MADE_EASY_ROOT}\\All Subject Solutions Keys\\${source.solutions}` : 'No Made Easy solutions file is listed for this subject; rely on the chapter answer table.',
  };
}

function statusLine(topic) {
  const c = topic.coverage;
  if (!c) return 'Unknown — the database was unavailable when this prompt was copied.';
  if (c.missingChapter) return 'No chapter document with this subject/chapter name exists in the database. Confirm the exact names in the editor before doing anything; if it truly has no questions, stop and report.';
  const parts = [`${c.answered}/${c.answerable} answerable questions already have a stored answer`, `${c.total} questions in total`];
  if (c.blank) parts.push(`${c.blank} blank placeholder(s)`);
  if (c.subjective) parts.push(`${c.subjective} subjective/proof question(s)`);
  if (c.missing?.length) parts.push(`missing answers at positions ${c.missing.slice(0, 40).join(', ')}${c.missing.length > 40 ? ', …' : ''}`);
  if (c.answerFile?.exists) parts.push(c.answerFile.valid === false ? `existing answer file is INVALID (${c.answerFile.error})` : `a reviewed answer file already exists (${c.answerFile.entries} entries, reviewed ${c.answerFile.reviewedAt || 'date not recorded'})`);
  return `${parts.join('; ')}. Re-check the live chapter with the worksheet script before writing.`;
}

export function buildTopicAnswerPrompt(topic) {
  if (!topic || typeof topic.subject !== 'string' || typeof topic.chapter !== 'string' || topic.slug !== topicSlug(topic.subject, topic.chapter)) {
    throw new Error('Choose a topic from the list.');
  }
  const hints = sourceHints(topic);
  const subjectArg = topic.subject.replace(/"/g, '\\"'), chapterArg = topic.chapter.replace(/"/g, '\\"');
  return `Add and verify the correct answer for every question in ONE topic of my GATE PYQ editor. Process ONLY this topic; do not start another one.

TOPIC
- Subject: ${topic.subject}
- Chapter: ${topic.chapter}
- Slug: ${topic.slug}
- Status when copied: ${statusLine(topic)}

PROJECT — WORK HERE
${EDITOR_PROJECT_PATH}
Read AGENTS.md first (this Next.js version differs from your training data). Book questions live in the MongoDB "chapters" collection, one document per subject + chapter, using this project's configured MONGODB_URI. Answer fields are questionType (MCQ | MSQ | NAT | SUBJECTIVE), correctOptions (letters A–D) and natAnswer or natRange {min, max}; see src/lib/question-answers.mjs and src/lib/question-metadata.mjs. The finished example is data/topic-answers/1-discrete-maths--1-mathematical-logic.json.

ANSWER SOURCES
1. GATE Overflow PYQ PDFs (trusted keys; they contain more questions than this app — answer only the app's questions): ${hints.gateOverflow}. Some questions are filed under another GATE Overflow chapter (for example binary-operation truth tables under Set Theory, CNF under Digital Logic), so search all three volumes when a match is missing. Formulas and code in these PDFs are rendered as images: render the page to read the options.
2. Made Easy chapter PDF — the printed source of these book questions, normally with the same numbering and option order: ${hints.madeEasyChapter}. Its answer table is on a scanned page near the end; render and read it. Solutions: ${hints.madeEasySolutions}
3. Verified year papers in data/papers/*.json (GATE CS 2000–2012 and IT 2004). Copies link back to book questions through source.copiedFrom.questionId; their keys follow the paper's option order.
4. Your own independent solution. gateoverflow.in refuses automated fetches, so use the PDFs rather than the website.

WORKFLOW — THE TOOLS ALREADY EXIST; REUSE THEM
1. If tmp/gateoverflow/index.json is missing: python -I scripts/topic-answers/gateoverflow-index.py (reads the three PDFs once, about a minute).
2. node scripts/topic-answers/worksheet.mjs --subject "${subjectArg}" --chapter "${chapterArg}"
   Read-only. It backs up the chapter and writes tmp/topic-answers/${topic.slug}/worksheet.md, worksheet.json and draft-answers.json with each question's id, contentSha256, text, options, diagram path, GATE Overflow candidates (id, page, URL, key) and year-paper copies mapped to book letters.
3. Verify every non-blank question:
   - Solve it from the app's own text, options, code and diagram (open the diagram PNG). Compute, trace code or brute-force truth tables where possible.
   - Cross-check the GATE Overflow key and the Made Easy key. Option order often differs between sources, so map every key by option TEXT, never by letter alone. Render GATE Overflow pages with: python -I scripts/topic-answers/render-pdf-pages.py <pdf> tmp/topic-answers/${topic.slug}/render 110 <page> (add --crop x0 y0 x1 y1 for scanned answer tables).
   - Worksheet candidates are hints. Book year tags can be wrong; match the question content.
   - "One or more" / "choose the correct choice(s)" questions are MSQ with every correct letter. NAT uses the exact value, or natRange for an accepted interval. Proof/descriptive items stay SUBJECTIVE with a short reference answer in "reason".
   - When sources conflict, an official key awarded marks to all, or the app's text has a transcription defect, decide the correct answer for the app's actual text, use status "verified-with-note" and explain it in "note". Do not edit question text or options; list suspected defects in your report with the corrected wording.
4. Write data/topic-answers/${topic.slug}.json (format gate-topic-answers-v1; validation in src/lib/topic-answers.mjs). Include one entry per non-blank question: position, id, contentSha256 (copy it from the worksheet), questionType, correctOptions / natAnswer / natRange, status, reason (short derivation), note, and sources [{ kind: gateoverflow-pdf | made-easy-key | year-paper | official-key | derived, ref, answer, agrees }]. Every entry needs at least one agreeing external source; any disagreeing source needs a note.
5. node scripts/topic-answers/apply.mjs data/topic-answers/${topic.slug}.json
   This is a dry run. Check every planned change, then apply it:
   node scripts/topic-answers/apply.mjs data/topic-answers/${topic.slug}.json --write
   The script backs up the chapter, writes only answer fields with an updatedAt guard and re-reads the document to verify that nothing else changed. The /gatetopicanswers page in this app then shows the topic's live status.
6. Run node --test tests/topic-answers.test.mjs and add a regression assertion for this topic's final key to that file.

DATA PROTECTION
- Change only answer fields. Never modify, delete, reorder or renumber questions, and never change text, code, options, diagrams, years, ids, locks or any other chapter.
- If a question already stores a different answer, prove the stored key wrong before setting replaceExisting: true for that entry, and report it.
- Never print database credentials. Writing bumps the chapter's updatedAt, so an editor tab that already has this chapter open must reload before saving; tell me if one might be open.
- Do not touch year papers, G4Gate or any other project or database.

REPORT
Question counts by type; how many answers each source confirmed; every verified-with-note item and why; suspected text defects with corrected wording; the backup path; the dry-run and --write summaries; and the test results. Say plainly what could not be verified. Do not claim success for a step that did not run.
`;
}
