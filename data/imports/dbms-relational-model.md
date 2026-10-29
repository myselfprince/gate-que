# DBMS / Relational Model import

Source: `12. DBMS/4. Relational Model.pdf`.
SHA-256: `1556421d5e7360aec7b13f66076ab2cdd803e4318e11e6755763b6ded4208ec7`.
All three scanned spreads were rendered and visually read, including both
columns and facing-page/spread continuations. Book questions 4.1-4.36 occupy
folios 632-637; opening folio 632 is inferred from facing printed folio 633.
There are no answer-key or explanation pages in this supplied PDF.

36 questions were added to the actual main database, with zero prior matches
and zero unresolved text items. All 36 answers remain explicitly unrecorded,
with `answerKeyStatus: 'not-supplied'` and `answerKeyPdfPage: null`. No answer
was calculated or copied from external solution sites.

Types: 30 MCQs, four NATs (4.28, 4.30, 4.31, 4.35), one MSQ (4.33), and one
descriptive question (4.1, with both subparts). Q4.33 is official GATE 2022 CS
Q25 in the Q23-Q27 MSQ section. Only its type was verified from the official
[GATE question paper](https://gate2026.iitg.ac.in/doc/download/2022/cs_2022.pdf).
The supplied book's question wording, option order, years, marks and sets
remain authoritative for the imported content.

Prose is editable text, formulas and complete relation instances are editable
LaTeX, and four SQL listings use the separate code field. The Q4.13 query-plan
figure is a reproducible diagram-only source crop with a checksum manifest;
it is served from `public/12. DBMS/4. Relational Model/`. Q4.9, 4.13, 4.19 and
4.30 retain both relevant book pages; Q4.13 also records both PDF spreads.
The common schema is repeated in full for Q4.20/4.21.

Printed inconsistencies are retained in source notes: Q4.1(b)'s selection
operator, Q4.8's R2/r2, Q4.10's S/s, Q4.11's SQL/algebra bounds and grouping,
Q4.15's a-num/a-number, Q4.16's CourseId/courseId, Q4.19's scheme/instance
symbols and projection subscripts, Q4.23's Student/Students, rollno/roll.no and
Regis-tration naming, Q4.27's Deptid/DeptId, and Q4.35's S(A,C) versus the
printed A,B table header. These are legible source discrepancies, not guessed
repairs. Q4.23 calculus is wrapped at logical conjunctions. Q4.11's hobby
table and Q4.28's CR table continue in adjacent blocks, with every row in
original order and the continuation direction explicitly stated.

The inspected database chapter was absent. The completion target was already
36 and stayed byte-for-byte unchanged. The importer reused the reviewed merge,
required unique chapter/target indexes, wrote a checksummed EJSON backup,
and used a MongoDB transaction with compare-and-set protection. Subsequent
question-local layout adjustments have separate checksummed backups and
complete-chapter compare-and-set guards. All pre-existing working-tree edits
were left intact; no application UI or export helper was changed by this task.

Initial backup:
`data/backups/dbms-relational-model-2026-10-28/before-2026-10-28T15-47-56-313Z.ejson`.
The same directory contains inspection, repair backups, final EJSON/read-back,
`final-database-audit.json`, `import-result.json` and `repeat-dry-run.json`.
Final audit confirms exact database/source equality, 36 unique IDs, metadata
and image validity, preserved locks/target, and unchanged unrelated chapter
and target hashes. Live repeat dry-run matches 36 and adds zero. Repeat-import
tests also prove preservation of user edits, answers, locks and unrelated
records, and rejection of unreviewed collisions and duplicate source IDs.

```powershell
node scripts/import-dbms-relational-model.mjs
node scripts/import-dbms-relational-model.mjs --apply --backup-dir '<backup-dir>'
node scripts/verify-dbms-relational-model-database.mjs
node scripts/verify-dbms-relational-model-export.mjs '<backup-dir>/verified-source-from-database.json' '<output-dir>'
python scripts/verify-dbms-relational-model-pdfs.py '<output-dir>'
```

Exports are in `output/pdf/dbms-relational-model/`. `Relational-Model.pdf`
contains 36 black-background/white-text question pages. The real PDF route
also provides two parts (20 + 16) in `Relational-Model-Black-PDFs.zip`.
`Relational-Model-Editable-LaTeX.zip` contains the same editable layout,
chapter JSON, and the portable diagram asset. Its independent compilation
matches all 36 PDF-route pages pixel-for-pixel. Every question page was
rendered and visually checked; the final adjusted tables were inspected at
full size. No clipping or layout errors remain. `preview.html` links all
36 editor captures and the exports. Preview QA found 179 rendered math
expressions, zero math errors, raw math, broken images or horizontal overflow.
Browser persistence was intercepted during preview QA.

Final checks: all 221 tests pass. Source lint passes using
`npm run lint -- --ignore-pattern 'tmp/**' --ignore-pattern 'output/**'`.
Unfiltered lint encounters two pre-existing display-name errors in compiled
temporary compiler QA builds. `npm run build -- --webpack` passes; default
Turbopack crashes while launching a PostCSS worker in the existing tracker
CSS, including outside the sandbox. No unrelated configuration was changed.
