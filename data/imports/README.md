# Reviewed chapter imports

## Dynamic Programming (14 source questions)

`algorithms-dynamic.mjs` covers Q4.1-Q4.14 from
`7. Algorithms/4. Dynamic Prog.pdf`, SHA-256
`938e1832c310c1ec6db3b9f95fa54c67db0c15817df326c3467b55f52ee81e61`.
Both scanned PDF pages were visually inspected, with all four columns of the
first spread reviewed at higher resolution. Only PDF page 1 / book pages
472-473 belongs to this chapter. PDF page 2 / book pages 476-477 is P and NP
Concepts, including that chapter's answers and explanations, and is excluded.
The supplied PDF contains no Dynamic Programming answer key. All 11 MCQ and
3 NAT answers are intentionally empty and carry validated `not-supplied`
metadata; there are no unresolved question or option transcriptions.

Shared data accompanies Q4.5/6 and Q4.7/8; the latter includes the preceding
recurrence needed by Q4.8. Q4.8 starts on book page 472 and its options continue
on page 473. The matrix and recurrences remain editable LaTeX. No diagrams or
program listings occur in this chapter. The printed Y/X and W-1 inconsistencies,
Q4.6 option D, Q4.7 X[n]/x notation, and Q4.9 L_(n+1) are preserved with source
notes. The B-tree question Q4.3 stays in its printed chapter and order.

The main chapter was initially absent. The adapted reviewed importer added 14
records and preserved the existing target of 14. Stable IDs, source identity
checks, checksum-protected EJSON backups, unique chapter/target indexes and a
transaction protect the update. Existing source edits/locks survive repeats;
unreviewed legacy records or conflicts stop rather than overwrite. The actual
database read-back passed coverage, metadata, answer state and uniqueness
checks; the live repeat-import dry-run added zero. All other chapters and
targets were unchanged during this import.

```powershell
node scripts/import-algorithms-dynamic.mjs
node scripts/import-algorithms-dynamic.mjs --apply --backup-dir data/backups/algorithms-dynamic-2026-10-27
node --test tests/algorithms-dynamic-import.test.mjs
node scripts/verify-algorithms-dynamic-export.mjs data/backups/algorithms-dynamic-2026-10-27/verified-source-from-database.json output/pdf/algorithms-dynamic
python scripts/verify-algorithms-dynamic-pdfs.py output/pdf/algorithms-dynamic
```

The export checks use the existing PDF and editable LaTeX routes and a local
preview server. Browser persistence is intercepted so preview verification
cannot save questions or preferences to the database.
All 14 editor previews passed with 180 MathJax expressions, no raw math,
overflow, broken images or rendering errors. All 14 PDF pages were rendered
and visually inspected. The portable LaTeX ZIP compiles independently and is
pixel-identical to the exported PDF on all 14 pages. Black backgrounds, white
text, full-width prose and one question per page use the existing layout.
Artifacts and the local preview gallery are in `output/pdf/algorithms-dynamic/`.

## Algorithm Analysis and Asymptotic Notations (68 source questions)

`algorithms-analysis.mjs` covers Q1.1-Q1.68 from all five visually inspected
scanned spreads of `7. Algorithms/1. Algo. Analysis and Asymptotic Notations.pdf`,
book pages 417-424. All answers come from PDF page 5 / book page 425; the
explanations below the key are excluded. Source SHA-256:
`b626ea3c6f9591e887dc07217525a86f18e041edef3adfe2ecd42324a56e6492`.

There are 60 MCQs, 4 MSQs (1.1, 1.62-1.64) and 4 NATs (1.41, 1.48, 1.54,
1.67). The printed formal-language question 1.64 remains in this chapter's
original order. Shared code accompanies Q1.20/21 and Q1.32/33; Q1.48 spans book
pages 421-422 and has one checksum-guarded flowchart-only crop. Tables and
formulas remain editable LaTeX, and programs have separate code fields.

Source caveats are retained in per-question notes: the malformed Q1.21 opening,
uninitialized Z[0] in Q1.32/33, and overlapping base/recursive conditions in
Q1.66. No text or answer has been invented to repair these printed defects.

The inspected main chapter was absent and the existing completion target was
68. The adapted importer uses the existing reviewed merge, stable IDs,
checksum-guarded source, EJSON backup with checksum, a unique chapter index,
transaction and compare-and-set protection. It rejects newly introduced
unreviewed records. Repeat imports preserve existing edits and locks.

```powershell
node scripts/import-algorithms-analysis.mjs
node scripts/import-algorithms-analysis.mjs --apply --backup-dir data/backups/algorithms-analysis
node scripts/verify-algorithms-analysis-export.mjs data/backups/algorithms-analysis/verified-source-from-database.json output/pdf/algorithms-analysis
python scripts/verify-algorithms-analysis-pdfs.py output/pdf/algorithms-analysis
```

## Memory Organization (74 source questions)

`coa-memory-organization.mjs` covers Q4.1-Q4.74 from all five scanned spreads
of `4. COA/4. Memory Organization.pdf`, book pages 281-289. The previous
chapter's explanations on book page 280 are excluded. Source SHA-256:
`e1b88198e1018531aee17191441bfe1c70efd30be87a44b1f08a771b14af5bfd`.

The supplied PDF ends at Q4.74 and contains no answer key for this chapter.
All 74 answer fields are intentionally empty and carry the existing validated
`answerKeyStatus: not-supplied` metadata with a null answer-key page. There are
50 MCQs, 4 MSQs (4.3, 4.68, 4.70, 4.73) and 20 NATs. No question text is
unresolved. MSQ classification follows the printed multiple-selection wording.

The main chapter was absent: 74 records were added, with no existing matches.
The existing target of 74 was preserved. Stable IDs, source identities,
checksum-protected EJSON backups, exact revision/content checks, a unique
chapter index and a transaction protect imports. Unexpected legacy records
stop for review; repeat import preserves edits and locks and adds zero records.

Shared programs are separate code fields and accompany every dependent question.
Q4.12 crosses PDF spreads; Q4.20/21 continue across book pages; Q4.30/31 require
the shared program on the previous spread. Q4.40, Q4.45, Q4.55, Q4.64 and Q4.70
have page/column continuations. Both tables are editable LaTeX. Three
checksum-guarded, figure-only crops serve Q4.35/36, Q4.52 and Q4.71. Printed
anomalies and the redundant table transcription in Q4.16 are documented in
source notes. All prose remains editable. The Q4.16 closing-math-delimiter
correction was separately backed up and applied only to the exact reviewed
record; its ID, metadata, locks and all other questions were preserved.

```powershell
python scripts/extract-coa-memory-diagrams.py
node scripts/import-coa-memory-organization.mjs
node scripts/import-coa-memory-organization.mjs --apply --backup-dir 'data/backups/coa-memory-organization'
node --test tests/coa-memory-organization-import.test.mjs
node scripts/verify-coa-memory-export.mjs '<verified-source-from-database.json>' '<output-dir>'
python scripts/verify-coa-memory-pdfs.py '<output-dir>'
```

The actual database read-back passed full source/content coverage and repeat
import added zero records. All 74 editor previews passed (215 MathJax
expressions; no errors, raw math, broken images or overflow). Actual export
routes produced four parts (20 + 20 + 20 + 14 pages). Every page was rendered
and visually reviewed; independent compilation of the portable LaTeX ZIP is
pixel-identical on all 74 pages. Black backgrounds, white text, full-width
question bodies and one complete question per page use the existing export
helpers. The current default title appears on the first page. No export
format or application schema changes were required.

Artifacts and preview captures: `output/pdf/coa-memory-organization/`.
Backups, database read-back and correction audit:
`data/backups/coa-memory-organization-2026-10-27/`.

## CPU Architecture and Addressing Modes (45 source questions)

`coa-cpu-addressing.mjs` covers Q1.1-Q1.45 from all four scanned spreads of
`4. COA/1. CPU Arch. and Address. Modes.pdf`, book pages 248-254. The printed
answer table is on PDF page 4 / book page 255. SHA-256:
`8aa38459f735217253db118956b6de251bab9118150ee24868d263a3ddb0add3`.
All 34 MCQs and 11 NATs have their printed answers; no MSQs or unresolved text
were found. Printed anomalies (including Q1.8's answer C and Q1.12's square
brackets) are preserved with source notes. Explanations are excluded.

The main chapter was absent; 45 records were added and the existing target of
45 retained. IDs and source identities are stable. The importer reuses the
reviewed merge and stops for review if unexpected legacy records appear. It
backs up chapter/target state to checksum-protected EJSON before a transaction;
exact state checks and unique identity indexes protect concurrent edits or
creation. Re-import adds zero records and preserves editable content and locks.

Shared programs accompany every dependent question in the separate code field.
Q1.7, Q1.11, Q1.21, Q1.25, Q1.35 and Q1.38 continue across book columns/pages;
Q1.15 continues across PDF pages. Two figure-only crops retain the expression
tree and chip-select gate. Other tables are editable LaTeX or instruction/code
tables. Q1.44 uses a MathJax-compatible hash symbol outside its text command.

Export fitting captures each verbatim listing once outside TeX conditionals,
then scales that saved listing while reflowing prose/options at full width.
PDF and editable LaTeX share this layout: black landscape pages, white text,
one complete question per page. The regression checks include all 45 editor
previews and rendered PDF pages, portable image parity, source numbering,
full-width rules, bounds and black backgrounds.

```powershell
python scripts/extract-coa-cpu-diagrams.py
node scripts/import-coa-cpu-addressing.mjs
node scripts/import-coa-cpu-addressing.mjs --apply --backup-dir 'C:\path\to\local\backup'
node --test tests/*.test.mjs
npm run lint
npm run build
node scripts/verify-coa-cpu-export.mjs '<backup-dir>/verified-source-from-database.json' '<export-dir>'
python scripts/verify-coa-cpu-pdfs.py '<export-dir>'
```

The export QA server is temporary and browser persistence is intercepted, so
preview checks cannot autosave into the main database or alter preferences.

## Routing and Application Layer (43 source questions)

`cn-routing-application.mjs` covers Q4.1-Q4.43 from all four scanned spreads
of `3. Computer Networks/4. Routing and Application Layer.pdf`, book pages
708-715. SHA-256:
`adee929df2f3f0e6f1a7818ec0e2a9d42832439e11260789362993d1c9ac338b`.
The source has 37 MCQs, 2 MSQs (4.36/4.41), and 4 NATs (4.32/4.35/4.38/4.40).
There is **no answer key in this supplied PDF**. All 43 answers remain empty;
`source.answerKeyStatus = "not-supplied"` and `answerKeyPdfPage = null` make
this explicit without fabricating an answer-key reference. Existing numeric
answer-key page metadata remains valid. Optional `source.notes` retain printed
inconsistencies and survive normal editor saves and exports.

The main chapter was absent at initial inspection; 43 questions were added and
the existing completion target of 43 was retained. Stable IDs, source identities,
and the existing reviewed merge protect repeat imports. Unexpected legacy
content/ID matches stop for review. Apply saves a checksum-protected EJSON
backup of the chapter (including its initial absence), target, and unrelated
chapter hashes before a transaction. Exact compare-and-set checks and a unique
chapter identity index protect concurrent updates and creation.

Shared passages are repeated with their dependent questions. Q4.10 spans PDF
pages 1-2; Q4.36 spans pages 3-4. Q4.7-8 and Q4.15-16 cross book pages.
Nine figure crops retain source labels; tables remain editable LaTeX. Q4.10's
four input tables share one destination column and its option tables are
transposed, retaining every value. No question screenshot replaces prose.

Printed anomalies intentionally retained: Q4.15-16 show year 2005; the bridge
diagram repeats H11/H12 labels; Q4.22-23 show a B5 vector row for node N5;
Q4.9 ends with a stray 1; Q4.33 labels its second option (d), recorded in notes
while positional option fields remain A/B/C/D. Table titles are ordinary text
because MathJax does not support the LaTeX `multicolumn` command.

Long prose now reflows at a measured smaller font inside a full-width question
box; shrinking the entire box previously narrowed the text column. Black pages,
white text, typography, one question per page, code handling and portable image
placement remain shared by PDF and editable LaTeX exports.

```powershell
# Use the bundled Python if the system Python lacks Pillow/pdfplumber.
python scripts/extract-cn-routing-diagrams.py
node scripts/import-cn-routing-application.mjs
node scripts/import-cn-routing-application.mjs --apply --backup-dir 'C:\path\to\local\backups'
node --test tests/*.test.mjs
npm run lint
npm run build
node scripts/verify-cn-routing-export.mjs 'verified-source-from-database.json' 'C:\path\to\exports'
python scripts/verify-cn-routing-pdfs.py 'C:\path\to\exports'
```

Export QA reads actual database read-back data. Only browser persistence is
mocked, so rendering checks cannot autosave or change preferences. It checks
all 43 previews, MathJax (including unsupported commands), image URLs, overflow,
and portable JSON/image parity. PDF QA renders every page and checks source
numbers, bounds, black backgrounds, and the full-width header rule.

## LAN (35 source questions)

`cn-lan.mjs` contains all 35 questions (2.1-2.35) from the user's
`3. Computer Networks/2. LAN.pdf`, including the continuation of Q2.30.
Prose is editable; equations use inline LaTeX. Answers are transcribed from
the source book's key, rather than independently corrected. Source question
numbers, PDF/book pages, file checksum, exam sets and question types are retained.

The LAN import uses stable IDs and preserves matching existing questions,
including user edits. The exact legacy note `added in prev chapter 1 already`
is retained in chapter `importNotes`, rather than counted as a PYQ.

Run the importer from the repository root with the configured `MONGODB_URI`:

```powershell
node scripts/import-cn-lan.mjs
node scripts/import-cn-lan.mjs --apply --backup-dir 'C:\path\to\local\backups'
```

The first command is a dry-run. The second writes an EJSON snapshot before
updating only the main LAN chapter and its completion target. A concurrent-edit
check prevents overwriting a chapter that changed after it was read. Re-running
keeps existing imported records instead of duplicating or resetting them.
Keep backups outside version control; they contain existing database records.

The editor's **Export LaTeX ZIP** button downloads `main.tex`, `chapter.json`
and any referenced image files. The source matches PDF export: black landscape
pages, white text, and one question per page. Extract the ZIP before compiling; image paths
are relative, so the bundle can move between machines. Exporting the source
does not require a local TeX installation.

Checks:

```powershell
node --test tests/cn-lan-import.test.mjs
npm run lint
npm run build
```

The optional `scripts/verify-cn-lan-preview.mjs <output-dir>` expects the app
on local port 3107. It mocks API persistence, verifies rendered MathJax and
saves representative editor screenshots without writing to MongoDB.

## TCP, UDP and IP (94 source questions)

`cn-tcp-udp-ip.mjs` was visually transcribed from all six scanned spreads of
`3. Computer Networks/3. TCP, UDP and IP.pdf` (book pages 686-697). The source
SHA-256 is `56139841ba5ebfa3976575c2c90aff616bba7d4cc0b58220cd10c5bfa37cb9e6`.
Q3.21 and Q3.56 cross PDF-page boundaries; Q3.64 and Q3.81 cross book pages.
Shared data is included with each dependent question. Tables are editable
LaTeX; four figure crops serve five questions. Printed answer-key values,
including apparent printing errors, are retained without inferred corrections.

The reviewed match manifest identifies 32 existing records; 62 questions were
missing. All original 51 editable records, their order, IDs and locks survive.
The 19 records outside this PDF remain in the main chapter. Fourteen matches
have legacy/source conflicts, listed in `cn-tcp-udp-ip-matches.json`. These
conflicts are intentionally unresolved: existing editable content is preserved.
Each match retains the complete verified source version under
`question.source.verifiedQuestion` and review details under
`question.source.reviewConflicts`. This metadata passes normal chapter saves.
The original answer key is represented in the verified version; legacy answer
letters are mapped to the retained option order. No conflicting answer is reset.

`sourceQuestions(chapter, sourceHash)` in `scripts/lib/cn-tcp-ip-merge.mjs`
reads those versions from the database in book order. The supplied 94-question
exports use this verified source view. The ordinary editor continues to show
the preserved legacy content on matched records until the conflicts are resolved.

```powershell
# Use the bundled Python with Pillow if the system Python lacks it.
python scripts/extract-cn-tcp-ip-diagrams.py
node scripts/import-cn-tcp-udp-ip.mjs
node scripts/import-cn-tcp-udp-ip.mjs --apply --backup-dir 'C:\path\to\local\backups'
node --test tests/cn-tcp-udp-ip-import.test.mjs
```

The importer checks the source checksum and all image references, backs up the
chapter and completion target to EJSON, and writes with a transaction plus an
exact concurrent-edit check. Existing target counts above 94 are preserved;
the current target already equals 94. A repeated import adds zero records and
does not reset edits. Export QA accepts the database read-back JSON:

```powershell
node scripts/verify-cn-tcp-ip-export.mjs '<backup-dir>/verified-source-from-database.json' '<output-dir>'
```

This checks the actual PDF and LaTeX routes, portable images, 94 editor previews,
MathJax errors and horizontal overflow. Browser persistence is intercepted during
preview QA so it cannot alter the main database or user preferences.

## COA - Control Unit Design (2026-10-24)

`coa-control-unit.mjs` covers Q2.1-Q2.27 from all three visually reviewed scanned
spreads of `4. COA/2. Control Unit Design.pdf`, book pages 261-264. The previous
chapter's explanations on book page 260 and the explanations on book page 265
are excluded. SHA-256:
`0c3d64c73a79bac06e3c1fea0b50d842c9803af995b25f7eb457c5cdd3df9d33`.

The printed answer table is on PDF page 3 / book page 265. All 27 answers are
available: 24 MCQs, one MSQ (Q2.1, answers A and B), and two NATs (Q2.25: 5;
Q2.27: 10.2). No set numbers are printed. No text or answers remain unresolved.
The printed answers B for Q2.12 and C for Q2.21 are retained with source notes,
without independently correcting the book. Q2.4's diagram labels the MUX 1:2
while its prose says 8 x (2:1); the source discrepancy is preserved and noted.
Q2.11's printed "hangling" is normalized to "handling", with a source note.

Three figure-only crops preserve the datapaths for Q2.4, Q2.16/Q2.17 and Q2.26.
Both questions dependent on the shared passage retain the complete passage and
diagram. Control signal schedules and micro-operations are editable LaTeX;
Q2.4 and Q2.26 include their continuations across book columns. Reproduce crops
with `scripts/extract-coa-control-diagrams.py` (bundled Python, Pillow, Poppler).

The actual main chapter was absent. The import added 27 records, retaining the
existing completion target of 27. The checksum-protected before-state EJSON,
database read-back and import result are in
`data/backups/coa-control-unit-2026-10-24/`. A transaction, exact state comparison
and unique chapter index protect concurrent edits/creation. Unexpected legacy
records require review. Existing user edits and locks survive repeat imports.

```powershell
# Read-only plan; omit --snapshot for a live database dry-run.
node scripts/import-coa-control-unit.mjs --snapshot '<before-state.ejson>'
node scripts/import-coa-control-unit.mjs --apply --backup-dir '<backup-dir>'
node scripts/verify-coa-control-export.mjs '<backup-dir>/verified-source-from-database.json' '<output-dir>'
```

Live read-back and repeat-import dry-run passed with 27 matched and zero added.
Unrelated chapters were unchanged. All 24 project tests, ESLint and production
build passed. The actual PDF/LaTeX routes and all 27 editor previews passed;
84 MathJax expressions rendered with no errors, broken images or overflow.
Both PDF parts (20 + 7 pages) were rendered and visually reviewed. Every page
has a black background, white text, full-width prose and one complete question.
The extracted editable ZIP compiled independently to 27 pages, all pixel-equal
to the corresponding PDF route pages. Outputs and detailed QA are under
`output/pdf/coa-control-unit/`; `Control-Unit-Design.pdf` is the independently
compiled full document. Browser persistence was intercepted during preview QA.

## COA - Instructions Pipeline (2026-10-24)

`coa-instructions-pipeline.mjs` contains all 46 questions (3.1-3.46) from
`4. COA/3. Instructions Pipeline.pdf`. All four scanned PDF spreads were rendered
and visually inspected, including the two book pages within each spread.
Questions occupy book pages 268-274; the complete printed answer key is on
book page 275 / PDF spread 4. Explanations on that page were excluded.
Source SHA-256: `19a73f8062c04fc97904b750368e945cd2126f5953097ce99a5d7500c354d04b`.

The import has 27 MCQs, 17 NATs and two MSQs. Q3.44 selects B, C and D; Q3.45
is an is/are TRUE MSQ with only C selected in the printed key. All questions,
options, printed years, marks and available set numbers are transcribed.
No text or answers are unreadable or missing. Printed source anomalies remain
literal and are documented in each question's source notes: Q3.9 repeats the
I2 label and uses an A opcode with subtraction; Q3.13/3.14 print right-pointing
transfer arrows; Q3.15 has an extra 1; Q3.20 prints operand R6x; Q3.34's printed
answer is 33.28; Q3.37 and Q3.41 print 1.508 and 1.875 despite asking for two
decimal places. No corrected operands, alternative answers or answer ranges
were invented.

Shared passages are repeated completely for Q3.13/3.14 and Q3.19/3.20. Code is
stored in the separate code field. Stage timing, microprogram and reservation
tables are editable LaTeX. Figure-only crops for Q3.12 and Q3.23 retain all
labels and arrows. Q3.9, Q3.22 and Q3.37 span facing book pages; Q3.12, Q3.26
and Q3.32 span columns. Reproduce the crops with
`scripts/extract-coa-pipeline-diagrams.py` (bundled Python, Pillow, Poppler).

The actual main database chapter was absent. A checksummed EJSON before-state
was saved in `data/backups/coa-instructions-pipeline-2026-10-24/` before the
transaction added 46 records. The existing target 46 was preserved unchanged.
The unique chapter index and conditional writes protect concurrent creation
and edits. Unreviewed legacy records cause the importer to stop. Database
read-back verified full source coverage, IDs, metadata, answers and image
references. Unrelated chapter hashes remained unchanged. A live repeat-import
dry-run matched all 46 questions and added zero; user edits and locks are also
covered by the repeat-import tests.

```powershell
node scripts/import-coa-instructions-pipeline.mjs
node scripts/import-coa-instructions-pipeline.mjs --apply --backup-dir '<backup-dir>'
node scripts/verify-coa-pipeline-export.mjs '<backup-dir>/verified-source-from-database.json' '<output-dir>'
python scripts/verify-coa-pipeline-pdfs.py '<output-dir>'
```

All 27 project tests, ESLint and the production build passed. Actual export
routes returned three PDF parts (20 + 20 + 6 pages) and a portable editable
LaTeX ZIP. All 46 editor previews rendered 105 MathJax expressions with zero
errors, raw math, missing images or horizontal overflow. Browser persistence
was intercepted for preview QA. All 46 PDF pages were rendered and visually
reviewed. The independently compiled editable ZIP has 46 pages, each
pixel-identical to its corresponding PDF-route page. Outputs, preview captures,
contact sheets and QA records are in `output/pdf/coa-instructions-pipeline/`.
`Instructions-Pipeline.pdf` is the independently compiled complete document.
