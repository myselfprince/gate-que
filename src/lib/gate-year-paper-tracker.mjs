import { maximumPaperMarks } from './year-papers.mjs';
import { questionType, storedAnswerText } from './question-answers.mjs';
import { needsQuestionReview } from './question-review.mjs';
import { buildG4GatePaperPrompt } from './gate-year-paper-g4gate-prompt.mjs';

export const YEAR_PDF_ROOT = String.raw`D:\Gate PYQs Year Wise - PDFs`;
export const YEAR_PROJECT_PATH = String.raw`E:\All Projects and Data\gate-pyq-YT-app`;
export const G4GATE_PROJECT_PATH = String.raw`E:\g4gate_tracker_latest`;
export const YEAR_PROMPT_TARGETS = {
  g4gate: { label: 'G4Gate project', projectPath: G4GATE_PROJECT_PATH },
  editor: { label: 'Current editor project', projectPath: YEAR_PROJECT_PATH },
};
export const HEADER_CORRECTIONS = {
  'DA 2025 set 2.pdf': {
    sha256: '6ed18668acb46b636ca0badf132d904756e4377a9972e8484a05eaebe9f17ddd',
    year: '2025', examPaper: 'CS', setNum: '2',
    note: 'Filename says DA, but the PDF header reads Computer Science and Information Technology (CS2). This prompt targets CS 2025 Set 2.',
  },
};

export function identifyYearPdf(filename, sha256 = '') {
  if (typeof filename !== 'string' || !/\.pdf$/i.test(filename) || /[\\/\x00-\x1f]/.test(filename)) throw new Error('Choose a PDF filename from the source folder.');
  const correction = HEADER_CORRECTIONS[filename];
  const compact = filename.match(/\bDA(\d{2})(?:S(\d+))?\b/i);
  const year = filename.match(/\b((?:19|20)\d{2})\b/)?.[1] || (compact ? `20${compact[1]}` : '');
  const examPaper = /(?:\bDA\b|\bDA\d{2})/i.test(filename) ? 'DA' : /\bIT\b/i.test(filename) ? 'IT' : 'CS';
  const setNum = filename.match(/\b(?:set|session|shift)\s*[-_ ]?\s*(\d+)\b/i)?.[1] || compact?.[2] || '';
  const reviewed = correction?.sha256 === sha256;
  const identity = reviewed ? correction : { year, examPaper, setNum };
  return { filename, path: `${YEAR_PDF_ROOT}\\${filename}`, sha256, year: identity.year, examPaper: identity.examPaper, setNum: identity.setNum,
    identitySource: reviewed ? 'reviewed-header' : 'filename',
    identityNote: reviewed ? correction.note : correction ? 'This filename has a known paper-code conflict, but its bytes have changed. Confirm the PDF header before choosing CS or DA.' : '',
  };
}

export function paperLabel(file) {
  return `GATE ${file.examPaper} ${file.year || 'Year unknown'}${file.setNum ? ` · Set ${file.setNum}` : ''}`;
}

export function yearPaperProgress(file, papers) {
  if (!Array.isArray(papers)) return { state: 'unknown', complete: false, count: 0, expected: null, label: 'Database status unavailable' };
  const exact = papers.filter(p => file.sha256 && p.sourceSha256 === file.sha256);
  if (exact.length > 1) return { state: 'review', complete: false, count: 0, expected: null, label: 'Multiple datasets match this PDF; review required' };
  const paper = exact[0];
  if (!paper) {
    const related = papers.some(p => String(p.year) === file.year && p.examPaper === file.examPaper && String(p.setNum || '') === file.setNum);
    return { state: related ? 'review' : 'pending', complete: false, count: 0, expected: null,
      label: related ? 'Paper exists; source PDF checksum is not matched' : 'Not built yet' };
  }
  const questions = (Array.isArray(paper.questions) ? paper.questions : []).filter(q => q && !q.isBlank && typeof q.text === 'string' && q.text.trim());
  const expected = Number(paper.questionCount);
  const numbers = questions.map(q => Number(q.paperQuestionNumber));
  const numbered = Number.isInteger(expected) && expected > 0 && new Set(numbers).size === expected && numbers.every(n => Number.isInteger(n) && n >= 1 && n <= expected);
  const keys = questions.map(q => q.key || q.id);
  const unique = keys.every(key => typeof key === 'string' && key) && new Set(keys).size === questions.length;
  const answers = questions.every(q => {
    const type = questionType(q);
    if (needsQuestionReview(q) || type === 'SUBJECTIVE' || (q.awardMarksToAll === true && q.datasetId)) return Boolean(q.referenceAnswer?.trim() || q.specialNote?.trim());
    if (type === 'MCQ' || type === 'MSQ') return Boolean(Array.isArray(q.correctOptions) && q.correctOptions.length && (type !== 'MCQ' || q.correctOptions.length === 1) && q.correctOptions.every(letter => ['A','B','C','D','E'].includes(letter) && typeof q[`opt${letter}`] === 'string' && q[`opt${letter}`].trim()));
    try { return Boolean(storedAnswerText(q)); } catch { return false; }
  });
  const marks = maximumPaperMarks(questions.map((q,i) => ({...q, key:q.key || q.id || `position-${i}`})));
  const complete = Boolean(paper.verified && paper.datasetId && paper.datasetId === paper.slug && questions.every(q => q.datasetId === paper.datasetId)
    && questions.length === expected && numbered && unique && answers && Number(paper.totalMarks) > 0 && marks === Number(paper.totalMarks) && Number(paper.durationMinutes) > 0);
  return { state: complete ? 'complete' : 'progress', complete, count: questions.length, expected: Number.isFinite(expected) ? expected : null,
    slug: paper.slug, label: complete ? `Verified in DB · ${questions.length}/${expected} questions` : `In progress · ${questions.length}/${Number.isFinite(expected) ? expected : '—'} questions`,
    missingAnswers: !answers, marks, totalMarks: paper.totalMarks };
}

export function compareYearPdfs(a,b) {
  return Number(Boolean(a.progress?.complete)) - Number(Boolean(b.progress?.complete)) || Number(a.year || 9999) - Number(b.year || 9999)
    || ['CS','IT','DA'].indexOf(a.examPaper) - ['CS','IT','DA'].indexOf(b.examPaper)
    || Number(a.setNum || 0) - Number(b.setNum || 0) || a.filename.localeCompare(b.filename,undefined,{numeric:true});
}

export function buildYearPaperPrompt(file, changes = {}, target = 'editor') {
  if (!Object.hasOwn(YEAR_PROMPT_TARGETS, target)) throw new Error('Choose a valid destination project.');
  if(file.sha256&&(typeof file.sha256!=='string'||!/^[a-f0-9]{64}$/.test(file.sha256)))throw new Error('Use a valid source PDF SHA-256.');
  const identity = { year: String(changes.year ?? file.year).trim(), examPaper: changes.examPaper ?? file.examPaper, setNum: String(changes.setNum ?? file.setNum ?? '').trim() };
  if (!/^(19|20)\d{2}$/.test(identity.year) || !['CS','IT','DA'].includes(identity.examPaper) || !/^[\w -]{0,16}$/.test(identity.setNum)) throw new Error('Choose a valid year, paper code and set/session.');
  const source = identifyYearPdf(file.filename,file.sha256);
  if (target === 'g4gate') return buildG4GatePaperPrompt({ identity, source, file, projectPath: G4GATE_PROJECT_PATH, editorPath: YEAR_PROJECT_PATH });
  return `Build a complete, independently stored GATE previous-year question paper in the existing project. Process ONLY the PDF specified below in this task.

INPUTS
- YEAR: ${identity.year}
- PAPER: ${identity.examPaper}
- SET / SESSION: ${identity.setNum || 'blank — single paper; confirm against the PDF'}
- EXACT SOURCE PDF: ${source.path}
- SOURCE PDF SHA-256: ${file.sha256 || 'Compute before importing and store as sourceSha256.'}
${source.identityNote ? `- SOURCE IDENTITY NOTE: ${source.identityNote}\n` : ''}
Filename metadata is a starting point. Inspect the actual PDF header and confirm the year, paper and session before importing. Preserve the physical filename. If the header differs, use the verified paper identity and report the discrepancy.

PROJECT
${YEAR_PROJECT_PATH}

RESOURCES
1. Selected original year-wise paper: ${source.path}
2. Existing book questions: the current project's MongoDB database.
3. Made Easy questions and answer keys: C:\\Users\\Prince\\Desktop\\MadeEasy PYQ PDF
   Solution keys: C:\\Users\\Prince\\Desktop\\MadeEasy PYQ PDF\\All Subject Solutions Keys
4. Reference project: E:\\G4Gate_Platform\\gate-pyq-find
   Inspect its source and local cache at public/data/questions.json when useful. Keep credentials private; use the local cache if its database is unavailable.
5. GATE Overflow: https://gateoverflow.in/ — use relevant question discussions to cross-check missing or disputed answers.

REUSE THE EXISTING IMPLEMENTATION
GATE CS 2000 already exists as a separate yearpapers dataset with timed attempts and PDF exports. Inspect data/papers/, src/models/YearPaper.js, src/lib/year-papers.mjs, src/lib/year-paper-export.mjs, src/lib/gatemock.mjs, src/lib/gatemock-server.js, src/components/mock/, src/app/api/gatemock/, and the GATE 2000 inspection/import/export/verification scripts.

Reuse and generalize this framework. Remove GATE-2000-specific assumptions from titles, paths, question types, filenames and rules before reuse. Preserve all previously completed papers and their behavior. For a DA paper, extend any CS/IT-only validation and labels as necessary; never relabel DA questions as CS.

MANDATORY DATA PROTECTION
The questions saved from my hardcopy book must remain exactly as they are. Do not modify, delete, renumber, move, correct, or add answers to the original book records. Preserve their IDs, text, code, options, diagrams, answers, order, locks and metadata.

Before database writes, save a read-only snapshot and record deterministic checksums and document/question counts. Write this paper ONLY into the separate yearpapers collection. Give every copy an independent ID/key and copy its required assets into its own paper directory. Retain provenance linking each copy to the source book record.

Store the exact selected source PDF SHA-256 in the year-paper document's sourceSha256 field so /gateyearpaperpdf can match this file and update its completion status. Do not mark work complete by setting a tracker flag. The tracker must derive completion from the actual verified dataset.

If this separate paper already exists, inspect it and complete or repair only that paper copy after saving a backup. Avoid duplicate datasets and preserve other completed papers, attempts and unrelated work. Verify that the original book collection's checksum remains unchanged after import.

1. ESTABLISH THE ACTUAL PAPER STRUCTURE
Read the complete selected PDF. Verify every question, original position, section, numbering, question type, marks, maximum score, duration, optional-question/section-choice rules and documented negative marking. Do not assume all years use the modern 65-question, 100-mark format.

Include General Aptitude only when it belongs to this actual paper, in its original position. Do not confuse 15 aptitude marks with 15 aptitude questions. Do not append questions from another year, set or paper code. If a historical grading rule cannot be verified, disclose the practice rule being used instead of inventing an official rule.

2. SEARCH THE CURRENT DATABASE FIRST
Find all potentially matching book questions and compare their full content against the source paper. Do not trust year tags or book numbering alone. Match text, code, options and diagrams. Identify exact matches, duplicates, incorrectly tagged records, missing questions and option-order/marks/transcription differences. Copy matching questions into the NEW dataset and correct discrepancies only in those copies.

3. COMPLETE THE PAPER IN ORIGINAL ORDER
Transcribe every missing question from the selected PDF, including descriptive, historical and currently out-of-syllabus items. Preserve option order, shared passages, multipart questions, mathematical notation, tables, code and diagrams. Prefer editable text/math/code, with clean crops for actual diagrams. Keep both displayed paper numbering and historical/source identifiers when they differ.

4. VERIFY EVERY ANSWER
Provide an answer or worked reference solution for every question. Prefer official keys where available; cross-check the supplied Made Easy solution keys and relevant GATE Overflow discussions. Match answers to the final option order. Retain the answer source, page/link, verification status and any disagreement or source defect. Independently check numerical results and program traces where needed.

Never fabricate missing keys, links, verification claims or official grading rules. Preserve flawed or ambiguous questions, explain the issue and use a documented review policy. Clearly distinguish authored worked solutions from official answers. Disputed items must not be silently graded as definitely correct or wrong.

5. INTEGRATE THE FULL TEST ENVIRONMENT
Make this paper selectable at http://localhost:3000/gatemock using the existing environment. Support its actual sections, original order, duration, maximum marks, MCQ/MSQ/NAT types, saved descriptive responses and any optional-question limits. Enforce limits on the server. Retain timer/automatic submission, question palette, review markers, calculator, autosave, refresh/resume, submission, scoring and answer review. Provide clearly labeled post-submission self-assessment when needed.

Do not expose answer keys or worked solutions in active-attempt API responses. Keep new year-paper copies out of book-based subject and weighted mocks. Do not let another year's paper or set leak into this one.

6. PRODUCE MATCHING PDF EXPORTS
Use the existing export style/renderer to create a dark question PDF, a print-friendly question PDF, a separate answers-and-worked-solutions PDF, and a ZIP containing the paper and solutions. Preserve one question per page, readable math/code, complete diagrams and original sequence. Question PDFs must not reveal answers. Expose the correct downloads beside this paper in /gatemock. Use this paper's own titles, directories and filenames.

7. VERIFY AND FINISH
Follow AGENTS.md and read relevant installed Next.js guides before code changes. Check complete source coverage, numbering, option order, marks, answers, section choices, separate-copy isolation and unchanged original-book checksums. Test answer secrecy, saved responses, refresh/resume, submission, scoring, written responses, optional-question limits and downloads. Render and visually inspect final PDFs and relevant browser screens; verify page counts, every answer entry and text bounds. Run appropriate tests and a production build with a supported working bundler.

Complete the implementation, import the separate dataset, generate the exports and make the paper usable locally. Do not stop at a plan or scaffold, and do not merely save questions without wiring the test and downloads.

Report the attempt URL, selected PDF path, verified paper identity, total questions/sections/duration/marks, copied-versus-added counts, answer verification coverage, disputed/manual-review items, original-data checksum verification, downloadable outputs and actual test/build results. State remaining limitations honestly.

Proceed autonomously within this scope. Ask only when an unresolved ambiguity materially prevents identifying or completing the correct paper.
`;
}
