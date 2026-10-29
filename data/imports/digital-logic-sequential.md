# Digital Logic - Sequential Circuits

Source: `C:/Users/Prince/Desktop/MadeEasy PYQ PDF/9. Digital Logic/3. Sequential Circuits.pdf`

SHA-256: `41cd95b1b2efe20c72011eb32e607fb4c5701672be021a6546520eb5be1a6467`.
All four scanned spreads were rendered at 3000px and visually read, including
every column and continuation. Q3.1-Q3.37 occupy book pages 221-226. The
previous chapter's explanations on page 220 and the explanations following
the Sequential Circuits answer key on page 227 are excluded from question text.
The answer key is on PDF spread 4 / book page 227.

The main chapter was absent. The import added all 37 source records, matched
zero pre-existing records, and preserved the existing completion target of 37.
There are 33 MCQs, three NATs (3.30 = 3, 3.31 = 4, 3.34 = 2), and one historical
subjective question (3.1). There is no explicitly identified MSQ in this source.
Printed years, marks (including 3.1's five marks), and set numbers are retained.
No set or original exam-paper question number is inferred when none is printed.

Three records have unresolved source material; all three are saved with the
available information, without invented text or answers:

- **3.1:** The key says "Sol.". The supplied solution gives the part (b) cycle
  S4 -> S2 -> S5 -> S6 -> S7 -> S3 -> S1 -> S4 and unreachable state S0. It does
  not supply a complete state diagram for part (a). The available partial
  solution is editable in the existing answer field and documented in source notes.
- **3.11:** The key prints only `(*)`; the supplied PDF includes no explanation
  for it. Correct options are deliberately empty. No MSQ answer is inferred.
- **3.32:** Even the original 4096px source scan has damaged third-cycle bits:
  the first bit of option C and second bit of option D are unclear. Explicit
  uncertainty markers retain the readable bits. The printed answer B is clear.

Q3.2 does not specify a number of clock cycles; its printed wording and answer A
are retained. Q3.28's printed answer D is retained. Q3.13's return arrows are
editable explicit transitions to 00. Q3.21's source description of A/B as "two
states" is retained along with its complete eight-row table.

Q3.3 continues across columns; Q3.12 crosses facing book pages; Q3.19 crosses
PDF spreads; Q3.22 and Q3.32 continue across columns. Both Q3.24 and Q3.25 carry
the complete shared passage and circuit. Prose and tables remain editable;
mathematical expressions are LaTeX. There is no program code in this chapter.
Thirty-three figure-only crops preserve all circuits, timing traces and option
figures. The crop manifest records bounds, excluded exterior prose pixels and
checksums; no circuit wire, arrow or signal label is intentionally masked.

The importer adapts the existing reviewed chapter merge. It rejects unexpected
legacy/content/ID collisions, preserves edits and locks on repeat import, and
checks global ID collisions. Apply writes a checksummed EJSON backup before a
transaction, uses an exact chapter revision/content guard and unique chapter
identity index, and compares unrelated chapter/target hashes afterwards.

Backups and database read-back: `data/backups/digital-logic-sequential-2026-10-28/`.
The original before-state is `before-2026-10-28T02-57-37-806Z.ejson` (with a
`.sha256` sidecar). Subsequent exact-state guarded corrections also have their
own before-state snapshots: Q3.3 uses two option columns and imageScale 0.5,
Q3.15 uses two option columns. Q3.32's unrelated semicolon-paste repair flag was
cleared; its source notes and explicit uncertainty markers remain unchanged.

The only application change for this import constrains option-preview image
widths and grid tracks so Q3.3's long waveform options fit the preview pane.
Existing uncommitted application changes were preserved. No export format or
metadata schema changes were needed. The existing exporter retains black pages,
white text, full-width question bodies and one complete question per page.

```powershell
python scripts/extract-sequential-diagrams.py
node scripts/import-digital-logic-sequential.mjs
node scripts/import-digital-logic-sequential.mjs --apply --backup-dir 'data/backups/digital-logic-sequential-2026-10-28'
node --test tests/digital-logic-sequential-import.test.mjs
node scripts/verify-sequential-export.mjs 'data/backups/digital-logic-sequential-2026-10-28/verified-source-from-database.json' 'output/pdf/digital-logic-sequential'
python scripts/verify-sequential-pdfs.py 'output/pdf/digital-logic-sequential'
```

Main-database read-back passed source coverage, IDs, source metadata, available
answers and working image references. Repeat import matches all 37 and adds zero.
Unrelated chapters and targets were unchanged during the import. All 164 tests,
ESLint and the production build passed. Windows sandbox-only filesystem,
localhost and MiKTeX access failures passed when rerun with permitted execution.

All 37 editor previews rendered 107 MathJax expressions, with no raw math,
unknown commands, math errors, broken images, horizontal overflow or page errors.
Preview QA intercepts browser API persistence, preventing autosaves/preferences
from reaching the main database. Actual export routes returned a full 37-page
PDF, two parts (20 + 17), and a portable editable LaTeX ZIP with all 33 images
and the complete source metadata. Every PDF page was rendered and visually
reviewed. Independent compilation of the ZIP matched all 37 PDF pages exactly.

Outputs and detailed QA: `output/pdf/digital-logic-sequential/`.
