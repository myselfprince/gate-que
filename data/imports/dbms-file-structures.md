# DBMS / File Structures

Source: `12. DBMS/6. File Structures.pdf`.
SHA-256: `6a32ebac6bd3897877038afddbe516d8f9df745c2ea467fcd54fd78eb57653d2`.
Both scanned PDF spreads were rendered and visually read, including enlarged
linked questions, diagrams, the page continuation and the complete answer key.
Book questions 6.1-6.28 occupy pages 656-659; the answer key is on PDF page 2 /
book page 659. Opening folio 656 is inferred from facing folio 657. Explanations
below the answer key are excluded.

28 questions: 21 MCQ, 1 MSQ (6.28), 6 NAT (6.19, 6.20, 6.22, 6.24-6.26).
All answers are transcribed from the supplied key; no missing text/options/keys.
Q6.19 prints "order 1", which appears inconsistent with the illustrated tree
containing a two-key internal node. Printed wording and key 5 are preserved,
with an explicit source note. Q6.6 option A's singular "record" and Q6.13's
lowercase k20 are also retained.

Shared join passage is repeated in 6.8/6.9. The initial tree is shared by
6.12/6.13; prerequisite insertions are repeated in 6.13 for standalone reading.
Q6.12 candidate node contents and Q6.13 boxed node are editable LaTeX. Q6.14's
options continue in the next column. Q6.19's diagram and exam metadata continue
on the next book/PDF page. Three diagram-only crops (one shared) have source
coordinates, page references and asset checksums in the companion manifest.
No whole-question screenshot replaces editable prose. No code is present.

Main database chapter was absent; 28 records were added. Existing target 28
was preserved unchanged. The importer reuses the reviewed merge helpers,
validates the source checksum, rejects unreviewed existing collisions, backs up
chapter/target before writing, and uses a transaction with unique identity
indexes and compare-and-set concurrency protection. Existing IDs, edits and
position locks are preserved on repeat import.

Backups: `data/backups/dbms-file-structures-2026-10-28/`.
Original backup: `before-2026-10-28T17-12-33-663Z.ejson` plus SHA-256 sidecar.
Final live audit: exact source match, 28 unique IDs, valid metadata, complete
answers, working assets, backup checksum valid, target and unrelated state
unchanged. Live repeat-import dry-run: 28 matched, 0 added.

```powershell
python scripts/extract-dbms-file-structures-diagrams.py
node scripts/import-dbms-file-structures.mjs
node scripts/import-dbms-file-structures.mjs --apply --backup-dir data/backups/dbms-file-structures-2026-10-28
node scripts/verify-dbms-file-structures-database.mjs
node --test tests/dbms-file-structures-import.test.mjs
node scripts/verify-dbms-file-structures-export.mjs data/backups/dbms-file-structures-2026-10-28/verified-source-from-database.json output/pdf/dbms-file-structures
python scripts/verify-dbms-file-structures-pdfs.py output/pdf/dbms-file-structures
```

Use the bundled Python runtime for pdfplumber when unavailable in system Python.
All 227 tests pass with normal filesystem access. Source ESLint passes using
`npm run lint -- --ignore-pattern 'tmp/**' --ignore-pattern 'output/**'`.
Default lint encounters two existing errors in generated compiler QA chunks.
Default Turbopack build encounters its worker startup error; documented
`npm run build -- --webpack` production build passes. No shared app/export
implementation was modified for this import; prior uncommitted edits remain.

HTTP PDF/LaTeX export routes and all 28 editor previews pass. Browser persistence
is intercepted for preview QA, preventing accidental autosave to the main DB.
62 MathJax expressions render with zero errors, raw math, broken images or
horizontal overflow. All 28 question pages were rendered and visually reviewed:
black background, white text, full-width body, consistent question/options
typography, proper figure placement, exactly one question per page.
Independently compiled portable LaTeX ZIP has 28 pages, each pixel-identical to
the PDF route output (20 + 8 pages). The PDF bundle includes a separate source
answer key. Exports, preview gallery, rendered pages and QA evidence are in
`output/pdf/dbms-file-structures/`.
