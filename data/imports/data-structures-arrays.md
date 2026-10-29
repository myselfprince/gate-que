# Data Structures — Arrays

Imported only `6. Data Structures/1. Arrays.pdf` (SHA-256
`09631d0c7973ec663deae638233f5a17f75e19661cba9484ef8902ab8c48f4fe`).
Both scanned spreads were rendered and visually inspected. The printed chapter
is numbered 2, while the app chapter is `6. Data Structures / 1. Arrays`.
All 12 printed questions 2.1–2.12 are included in book order: 10 MCQ, 2 NAT.
Questions occupy book pages 363–364; Q2.7 continues across both pages.
The complete printed answer key is on PDF page 2 / book page 365.
Previous-chapter explanations on book page 362 and Arrays explanations on 365
are excluded. No question diagrams or tables occur in this source.

Prose and LaTeX are editable; C and pseudocode use the separate code field.
Source years, marks and sets are retained. Q2.10 includes both code segments.
Q2.12 has two printed syntax anomalies: the initializer ends `20});` and
`printf("%d"\n, ...)` puts `\n` outside its quoted string. Both are preserved
literally, with source notes and the printed answer 19. No corrected program
or alternative answer is invented. There are no unreadable/missing questions,
options or answers; one source issue remains (Q2.12).

The actual main database chapter was absent. A checksummed EJSON before-state
was saved before a transaction added all 12 questions. The existing target 12
was preserved. Unique chapter identity and conditional updates prevent
concurrent creation/edit overwrites; unexpected legacy records stop import
for review. Existing user edits, IDs and locks survive repeat imports.
Read-back verified all 12 source identities, page references, answers and IDs;
unrelated chapter/target hashes were unchanged. Live repeat dry-run: 12 matched,
zero added. Backups and database read-back are under
`data/backups/data-structures-arrays-2026-10-28/`.

The only export-helper extension maps pseudocode `²` and `×` in LaTeX listings.
All 174 project tests, lint and production build passed. Actual export routes
returned a 12-page black PDF and matching portable editable LaTeX ZIP.
All 12 editor previews passed: 57 MathJax expressions, no math errors, raw math,
broken images or overflow. Preview persistence was intercepted during QA.
Every exported page was rendered and visually reviewed. The editable ZIP
compiled independently to 12 pages, all pixel-identical to the PDF route.
Artifacts, preview images, contact sheets and QA reports are under
`output/pdf/data-structures-arrays/`.

```powershell
node scripts/import-data-structures-arrays.mjs
node scripts/import-data-structures-arrays.mjs --apply --backup-dir data/backups/data-structures-arrays-2026-10-28
node scripts/verify-data-structures-arrays-export.mjs data/backups/data-structures-arrays-2026-10-28/verified-source-from-database.json output/pdf/data-structures-arrays
python scripts/verify-data-structures-arrays-pdfs.py output/pdf/data-structures-arrays
```

Use bundled Python (pdfplumber/Pillow), Poppler and pdflatex for the final check.
Windows sandbox restrictions required authorized execution outside the sandbox
for MongoDB network access, build junctions, temporary-file tests and browser/TeX QA.
