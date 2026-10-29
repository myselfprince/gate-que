# Transactions and Concurrency Control

Source: `12. DBMS/5. Transactions and Concurrency Contorl.pdf`.
SHA-256: `16985def50bfc94418b62c19aad1798a920288316c047092fa39f73bb3584cec`.
All four scanned spreads were rendered and visually inspected, including enlarged
columns, the answer key, and schedule continuations. Q5.1-Q5.37 occupy book pages
644-650; the answer key is on PDF page 4 / book page 651. Book page 644 is inferred
from the facing folio 645. Explanations below the answer key are excluded.

There are 32 MCQs, 3 MSQs (5.31, 5.35, 5.37), and 2 NATs (5.22, 5.28). All 37
answers are transcribed from the supplied key. No text, options, or answers are
missing. Source issues remain explicitly documented rather than corrected:

- Q5.11: supplied key B conflicts with the printed schedules (S2 is not conflict
  serializable); the printed question and key B are retained.
- Q5.30: the source T1 schedule contains WD twice, while every option ends in WB.
  The printed schedule, options, and key B are retained.
- Q5.9: the repeated unlock(A) in S2 of options B/C is retained. Complete
  transaction and option programs are editable in the separate code field;
  Scheme A-D option references identify their corresponding code listings.
- Q5.5 option D wording and Q5.8 uppercase W are retained. The index question
  Q5.15 remains in its printed chapter and order.

Schedules and tables are editable LaTeX, and programs use separate code fields.
Q5.22 has one graph-only crop with source coordinates and asset checksum in
`dbms-transactions-diagrams.json`. No whole-question screenshots replace prose.
Q5.10 crosses PDF spreads 1-2; Q5.17 crosses book pages 646-647. Q5.27 continues
between columns of book page 648, without crossing a book page.

The main database chapter was initially absent; all 37 questions were added.
The existing completion target of 37 was preserved. The importer reuses the
reviewed merge helpers, rejects unreviewed legacy collisions, verifies the source
checksum, creates a checksum-protected EJSON backup, and writes in a transaction
with unique chapter/target indexes and compare-and-set concurrency protection.
Subsequent code layout, source wording and math-spacing corrections were also
backed up, restricted to exact reviewed records and protected against concurrent
edits. IDs, locks, all other questions, and other chapters/targets are preserved.

The final live database audit found an exact match with the reviewed source,
37 unique IDs, valid metadata/answers/assets, a valid original backup checksum,
and no unrelated changes. Live repeat import adds zero and matches all 37.
Backups and read-back evidence: `data/backups/dbms-transactions-2026-10-28/`.

```powershell
python scripts/extract-dbms-transactions-diagram.py
node scripts/import-dbms-transactions.mjs
node scripts/import-dbms-transactions.mjs --apply --backup-dir data/backups/dbms-transactions-2026-10-28
node scripts/verify-dbms-transactions-database.mjs
node --test tests/dbms-transactions-import.test.mjs tests/question-pages.test.mjs
node scripts/verify-dbms-transactions-export.mjs data/backups/dbms-transactions-2026-10-28/verified-source-from-database.json output/pdf/dbms-transactions
python scripts/verify-dbms-transactions-pdfs.py output/pdf/dbms-transactions
```

Use the bundled Python runtime for pdfplumber if the system Python lacks it.
PDF/LaTeX export checks use the existing HTTP routes and a local production
server. Preview browser persistence is intercepted, so it cannot autosave to the
main database. All 37 editor previews pass with 164 MathJax expressions, no
math errors, broken images, raw delimiters, horizontal overflow or page errors.
All 37 black PDF pages were rendered and visually reviewed. The independently
compiled portable LaTeX ZIP matches all 37 PDF pages exactly, preserving the
existing full-width prose, typography, code/diagram placement and one-question
per-page format. A separate answer-key PDF is included in the PDF bundle.

Eight relevant tests pass. Focused ESLint and project ESLint excluding generated
`tmp/` and `output/` artifacts pass. The default lint command encounters two
existing generated compiler QA chunks with react/display-name errors. Default
Turbopack build encounters a worker startup error; the installed documented
`npm run build -- --webpack` production build passes. No shared application or
export helper code was changed for this import.

Exports and preview gallery: `output/pdf/dbms-transactions/`.
