# Data Structures - Graphs

Imported only `6. Data Structures/5. Graphs.pdf`, SHA-256
`4e81d5c512edbe016342f79be6bcde4e2c53124be6af9db2a1c6b439f84417b3`.
Both scanned PDF spreads and all four book pages were rendered and visually
reviewed. Questions occupy book pages 402-404; the complete printed key and
the Q6.1 matrix solution are on PDF page 2 / book page 405. Explanations are
excluded from question bodies. The printed chapter is numbered 6; the app
chapter is `6. Data Structures / 5. Graphs`.

All 25 questions 6.1-6.25 are saved in book order: 18 MCQ, 1 MSQ, 5 NAT,
1 subjective. Q6.24 is MSQ despite the printed key having only A selected.
Q6.1 is a subjective matrix question, with the printed solution stored as
editable LaTeX in the existing answer field. No schema extension was needed.
Q6.4, Q6.12 and Q6.21 include their column continuations. Years, marks and
all seven printed set labels are preserved. Prose and math are editable;
Q6.6 pseudocode uses the separate code field. Seven diagram-only crops have
checked source coordinates and content hashes in the diagram manifest.

Source issues retained explicitly:
- Q6.1: the printed graph disagrees with the printed solution matrix, e.g.
  P2-to-P5 in the diagram versus P5-to-P2 in the matrix. Both are preserved,
  and the source notes flag the unresolved inconsistency. No matrix correction
  was inferred. There are no missing text, options or answers.
- Q6.6: printed grammatical anomalies are retained literally.
- Q6.10: the printed three-vertex statement and discovery/finish times are
  retained literally, even though the times exceed a standard three-node clock.
- Q6.16: option C prints the square after the closing parenthesis: Theta(n)^2.

The main database chapter was absent; the existing completion target was 25.
A checksummed EJSON backup was saved before a transaction inserted 25 records.
The target stayed unchanged. The importer requires the unique chapter identity
index, conditionally updates existing content, rejects unreviewed legacy matches,
and refuses concurrent chapter/target creation or edits. Repeat imports retain
existing IDs, edits, answers and locks. Unrelated chapter/target hashes were
unchanged. Actual read-back verified 25 source identities, all metadata, answer
values, unique IDs and image references. Live repeat dry-run: 25 matched, 0 added.

Backup and read-back: `data/backups/data-structures-graphs-2026-10-28/`.
Initial result: 25 newly added, 0 already matched, 0 missing/unreadable items;
1 unresolved source inconsistency (Q6.1), included with both printed versions.

Validation: 13 relevant tests, lint and production build passed. Production
Next.js export routes returned 2 PDF parts (20 + 5 pages) and a portable editable
LaTeX ZIP with all 7 images. All 25 editor previews passed with 103 MathJax
expressions, no raw math, math errors, broken images or overflow. QA intercepted
editor API requests so preview autosave never wrote to the main database.
Every exported page was rendered and visually checked. Black backgrounds,
white text, full-width body and page bounds passed. The ZIP compiled independently
to 25 pages, all pixel-identical to the PDF route. No shared app/export files were
changed; pre-existing uncommitted changes were preserved.

Artifacts and reports: `output/pdf/data-structures-graphs/`.

```powershell
node scripts/import-data-structures-graphs.mjs
node scripts/import-data-structures-graphs.mjs --apply --backup-dir data/backups/data-structures-graphs-2026-10-28
node scripts/verify-data-structures-graphs-export.mjs data/backups/data-structures-graphs-2026-10-28/verified-source-from-database.json output/pdf/data-structures-graphs
python scripts/verify-data-structures-graphs-pdfs.py output/pdf/data-structures-graphs
```

Use bundled Python with pdfplumber/Pillow/pypdfium2, Poppler and pdflatex.
Network inspection/import, Next.js junction creation and browser/TeX QA required
execution outside the Windows sandbox. The successful production build and export
QA ran sequentially in the same session.
