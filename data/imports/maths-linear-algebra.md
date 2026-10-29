# Linear Algebra import - 2026-10-28

Imported only `11. Engg. Maths/2. Linear Algebra.pdf` into main database subject
`11. Engg. Maths`, chapter `2. Linear Algebra`.

Source SHA-256:
`db82237929f2ad56a350754384712fa8e74edf893fb7cc827830d06e9bcd9337`.
All four scanned PDF spreads were rendered and visually inspected, with
higher-resolution half-spread views for every question page. All 68 printed
questions Q6.1-Q6.68, book pages 95-101, are included in book order. The previous
Probability chapter's explanations on book page 94 are excluded. The source has
no Linear Algebra answer key: all 68 answers remain empty, with validated
`answerKeyStatus: not-supplied` and `answerKeyPdfPage: null`. No question text,
options, exam labels or diagrams remain unresolved. No independently solved or
invented answer has been substituted.

There are 46 MCQs, 18 NATs, 3 MSQs (6.63, 6.67, 6.68), and one historical
subjective question (6.13, no options or numeric answer blank in the book).
Grouped assertion choices in 6.27, 6.29, 6.51 and 6.58 remain MCQ choices.
Q6.46 options continue in the next column; Q6.51 continues across PDF spreads
3-4 / book pages 99-100. All matrices, determinants, vectors, equations and
expressions are editable LaTeX. There are no program listings or shared
passages. The graph-only crop for 6.65 includes all five vertex labels, all
edges and both self-loops. Its bounds and checksum are in the crop manifest.

Printed anomalies are preserved with per-question notes: letter case in 6.2
and 6.5, duplicate option values in 6.25, the X transpose notation in 6.26,
the repeated x_3 in 6.27's second equation, l_22 wording in 6.45, U_32/U_33
inconsistency in 6.62, and the opening "Let and A" in 6.64.

## Main database result

The inspected chapter was absent; the existing target was 68. The transaction
added 68 records and retained that target unchanged. No existing question,
lock or unrelated chapter/target was altered. The importer adapts the existing
reviewed merge helper and uses stable IDs, source checksum+question identity,
unique chapter/target indexes, an exact concurrent-edit guard and a transaction.
Unexpected legacy records or matches require review and cannot be silently
overwritten. Repeated source imports preserve edited content, answers and locks.

Backup and read-back directory:
`data/backups/maths-linear-algebra-2026-10-28/`.
The checksummed before-state is
`before-2026-10-28T17-33-22-607Z.ejson`; the inspection, full after-state,
import result and verified source JSON are alongside it.

Actual database read-back passed complete source equality, 68/68 source
coverage, unique IDs, metadata, empty-answer state and image checks. Unrelated
chapter and target hashes matched before and after. The live repeat-import
dry-run matched all 68 and added zero.

## Reproduction

```powershell
# Use bundled Python with pypdfium2/Pillow if the system Python lacks them.
python scripts/extract-maths-linear-algebra-diagram.py
node scripts/import-maths-linear-algebra.mjs
node scripts/import-maths-linear-algebra.mjs --apply --backup-dir data/backups/maths-linear-algebra-2026-10-28
node --test tests/maths-linear-algebra-import.test.mjs
node scripts/verify-maths-linear-algebra-export.mjs data/backups/maths-linear-algebra-2026-10-28/verified-source-from-database.json output/pdf/maths-linear-algebra
python scripts/verify-maths-linear-algebra-pdfs.py output/pdf/maths-linear-algebra
```

## Export and validation

All 239 project tests passed outside the filesystem sandbox (the sandbox
prevented temporary-file rename/symlink tests). ESLint passed with generated
`tmp/**` and `output/**` excluded; the plain lint command also examined three
pre-existing compiled QA trees under tmp and reported generated-code errors.
The default Turbopack build hit a CSS-worker process error both inside and
outside the sandbox. The installed Next.js CLI's documented `--webpack`
production build completed successfully. No unrelated app changes were made.

Actual PDF and LaTeX API routes returned successfully. All 68 editor previews
rendered 418 MathJax expressions with no math errors, unknown commands, raw math,
broken images, horizontal overflow or browser errors. Browser API persistence
was intercepted so preview QA could not autosave to the database.

All 68 exported PDF pages were rendered and visually inspected. Black
backgrounds, white text, full-width prose, one question per page, typography,
matrices, option content and the diagram are retained. The app's existing PDF
numbering is 1-68; source Q6.x identities remain in database/portable JSON
metadata. Each PDF header's ordinal, year, set, marks and type was checked.
The independently extracted portable LaTeX ZIP compiles to 68 pages, all
pixel-identical to the API's PDF parts (20+20+20+8). No layout issues remain.

Artifacts in `output/pdf/maths-linear-algebra/`:

- `Maths-Linear-Algebra.pdf`: complete independently compiled PDF.
- `Maths-Linear-Algebra-Black-PDFs.zip`: four actual PDF API parts.
- `Maths-Linear-Algebra-Editable-LaTeX.zip`: portable editable source, JSON and graph.
- `preview.html`: all 68 PDF pages and editor previews.
- `export-qa.json`, `pdf-structure-qa.json`: validation evidence.

Remaining source limitation: all 68 answers are unresolved because the supplied
PDF contains no answer key. Printed source anomalies above remain literal.
