# Compiler Design: Lexical Analysis

Imported only `10. Compiler Design/1. Lexical Analysis.pdf` from the supplied
MadeEasy folder. SHA-256:
`266f9e55d7f0ba3153564b3bcf7b0a2e9dadb2545072aecd577f2a7a4e173a66`.

Both scanned PDF spreads were rendered and visually read, including the syllabus
leaf and the answer/explanation leaf. There are 19 source questions, Q1.1-Q1.19:
17 MCQs and two historical numeric-response questions represented as NAT.
No MSQs occur. No question diagrams require crops. The two matching tables are
editable LaTeX; program statements are in separate code fields. Q1.8 and Q1.16
continue between columns and have been rejoined. No explanations were imported
as questions.

Q1.1-Q1.12 occur on PDF page 1; the unnumbered opening chapter leaf's book folio
487 is inferred from the following numbered folio 488 and documented in metadata.
Q1.13-Q1.19 occur on PDF page 2 / book page 488. All answers were transcribed
from PDF page 2 / book page 489. Printed years, marks and sets are retained.

Source issues retained explicitly:

- Q1.4: the printed key says 5, but the explanation says Fortran has 3 tokens
  and counts 5 for C. Stored answer is the printed key's 5. This is one unresolved
  source answer conflict; no corrected answer was inferred.
- Q1.5 and Q1.6 are separately numbered numeric and MCQ versions of the same
  program statement in the source. Both are intentionally retained.
- Q1.16 prints "I only" for both A and C; both literal options are retained.
- Q1.9 prints `fro` with comma-separated arguments; Q1.17 prints `Integer`.
  These are the errors being examined and have not been corrected.

The configured main database chapter was absent. A live inspection was saved to
`data/backups/compiler-lexical-2026-10-28/inspection.ejson`. Immediately before
the write, a checksummed backup of the absent chapter, existing target and
unrelated state hashes was saved to
`data/backups/compiler-lexical-2026-10-28/before-2026-10-28T13-33-30-374Z.ejson`.
A transaction created 19 questions and changed only this completion target from
18 to 19. Unique identity indexes and conditional chapter/target writes protect
against concurrent creation and edits. Unreviewed legacy records stop the import.

Database read-back verified 19/19 source identities, unique IDs, metadata,
printed answers and image references (none required). Unrelated chapter/target
hashes were unchanged. A subsequent live repeat-import dry-run found 19 matches
and zero additions. Existing user edits and locks are covered by the merge test.
Read-back, before/after snapshots and results are in the backup directory above.

```powershell
node scripts/import-compiler-lexical.mjs
node scripts/import-compiler-lexical.mjs --apply --backup-dir data/backups/compiler-lexical-2026-10-28
node scripts/verify-compiler-lexical-export.mjs data/backups/compiler-lexical-2026-10-28/verified-source-from-database.json output/pdf/compiler-lexical
python scripts/verify-compiler-lexical-pdfs.py output/pdf/compiler-lexical
```

Validation: both chapter tests passed, as did all 201 project tests when run
outside the Windows filesystem sandbox (sandboxed rename/symlink operations
caused nine permission-only failures). All new JavaScript files passed ESLint.
The full lint run encountered a concurrently created, unrelated syntax error in
`data/imports/compiler-parsing.mjs`; that file was left untouched. Default
Turbopack builds crashed in a CSS worker. The documented `--webpack` fallback
completed successfully. Because concurrent project activity replaced the shared
`.next` build, export QA used an isolated temporary copy of the same application
source with the existing parent dependencies; no application configuration was
changed. The verifier accepts this optional app directory as its third argument.

Actual export routes returned a 19-page PDF and an editable LaTeX ZIP. All 19
editor previews rendered 48 math expressions, with no errors, raw math, broken
images or horizontal overflow. Preview persistence requests were intercepted,
so no autosaves reached the database. All PDF pages were rendered and visually
reviewed. Black backgrounds, white text, full-width question bodies, code and
table placement passed. Independently compiling the ZIP produced 19 pages
pixel-identical to the PDF route. No export helper or format changes were needed.

Deliverables and QA evidence: `output/pdf/compiler-lexical/`, including
`Lexical-Analysis.pdf`, `Lexical-Analysis-Editable-LaTeX.zip`, all 19 editor
captures, four contact sheets, `export-qa.json` and `pdf-structure-qa.json`.
