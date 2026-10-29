import { GATE_SYLLABUS } from './syllabus.js';
import { chapterProgress, sortCompletedLast } from './chapter-progress.mjs';

export const PROJECT_PATH = String.raw`E:\All Projects and Data\gate-pyq-YT-app`;
export const PDF_ROOT = String.raw`C:\Users\Prince\Desktop\MadeEasy PYQ PDF`;

// These are the on-disk filenames, including the book's spelling and both DP PDFs.
const fileOverrides = {
  '7. Algorithms|4. Dynamic Programming': ['4. Dynamic Prog.pdf', '4. Dynamic Programming.pdf'],
  '7. Algorithms|6. Miscellaneous Topics': ['6. Muscellaneous Topics.pdf'],
};

export const PDF_SUBJECTS = Object.entries(GATE_SYLLABUS).map(([name, chapters]) => ({
  name,
  path: `${PDF_ROOT}\\${name}`,
  files: chapters.flatMap(chapter => (fileOverrides[`${name}|${chapter}`] || [`${chapter}.pdf`]).map(filename => ({
    subject: name,
    chapter,
    filename,
    path: `${PDF_ROOT}\\${name}\\${filename}`,
  }))),
}));

export const ALL_PDFS = PDF_SUBJECTS.flatMap(subject => subject.files);

export function trackerSubjects(actualCounts = {}, targetCounts = {}) {
  const subjects = PDF_SUBJECTS.map(subject => {
    const files = subject.files.map(file => {
      const database = chapterProgress(file.subject, file.chapter, actualCounts, targetCounts);
      return { ...file, database, checked: database.complete };
    });
    const checkedCount = files.filter(file => file.checked).length;
    return { ...subject, files, checkedCount, complete: files.length > 0 && checkedCount === files.length };
  });
  return sortCompletedLast(subjects, subject => subject.complete);
}

export function buildImportPrompt(pdfPath) {
  if (!ALL_PDFS.some(file => file.path === pdfPath)) throw new Error('Unknown tracker PDF.');
  return `Project: ${PROJECT_PATH}\\
PDF folder: ${PDF_ROOT}

Is project mein supplied PDF ke saare PYQs add karo. Ek baar mein sirf neeche specified PDF process karna.

Pehle AGENTS.md aur relevant installed Next.js documentation padho. Existing question schema, validation, import scripts aur export helpers inspect karke current implementation reuse karo. Full project analysis repeat karne ki zaroorat nahi hai.

Requirements:

1. PDF ke saare pages visually inspect karo. Scanned PDF ho toh pages render karke read karo; sirf text extraction par depend mat karo.
2. Correct subject aur chapter identify karo. Saare questions, options, year, marks aur set number accurately preserve karo. Book numbering/order, shared passages, column/page continuations, tables aur diagrams handle karo. Previous/next chapter ke questions ya explanations ko galti se questions mein include mat karna.
3. Prose editable text mein aur mathematical expressions valid LaTeX mein store karo. Code separate code field mein rakho. Diagrams ke liye accurate image crops aur working references use karo. Pura question screenshot bana kar editable text replace mat karna.
4. Available source answer key se answers save karo. MCQ, MSQ aur NAT correctly distinguish karo. Missing/unclear text, options ya answers invent mat karna; unresolved items clearly report karo.
5. Existing main database chapter pehle inspect aur backup karo. PDF questions ko existing records se match karke duplicates avoid karo. Existing edits, IDs, locks aur unrelated questions preserve karo. Conflicting matches silently overwrite mat karna.
6. Source PDF checksum, source question number, PDF/book page references aur available answer-key reference preserve karo. Existing metadata validation follow karo. Required extension ho toh backward-compatible change karo.
7. Import repeat-safe hona chahiye: same PDF dobara import karne par duplicate questions create na hon. Existing LAN importer ko blindly run mat karna—it targets LAN. Is PDF ke correct subject/chapter ke liye adapt karo.
8. Verified questions actual main database mein save karo; sirf JSON file ya proposed plan bana kar mat rukna. Database update se pehle backup aur concurrent-edit protection rakho. Sirf requested chapter aur relevant completion target update karo.
9. Existing PDF export format preserve karo:
   - Black background, white text
   - One question per page
   - Full-width question text
   - Consistent question/options typography
   - Correct LaTeX, code and diagram placement
   - Matching editable LaTeX ZIP export
10. Import ke baad database read-back, source coverage, unique IDs, metadata, answers aur image references verify karo. Repeat-import dry-run se duplicate prevention check karo. Preview/export rendering verify karo. Code change ho toh relevant tests, lint aur build run karo.

Scope sirf is PDF ka import aur uske liye necessary fixes hai. Unrelated redesign/refactor mat karna. Existing uncommitted changes preserve karo.

Kaam autonomously complete karo aur progress updates Hinglish mein do. End mein short Hinglish report do:

- Subject/chapter
- PDF question count
- Newly added, already matched aur unresolved counts
- Database verification result
- Backup location
- Export/preview links aur any remaining issues

PDF to import: ${pdfPath}`;
}
