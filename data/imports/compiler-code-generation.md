# Code Generation and Optimization

Reviewed source: `10. Compiler Design/4. Code Generations and Optimizatinos.pdf`.
SHA-256: `b5fc5757b77aca121115807eeeed9846c69768c0112ce5d241c400a40b007b0e`.
All three scanned spreads were rendered and visually inspected at spread and
half-spread resolution, covering book pages 512-517. Q4.1-Q4.28 occupy pages
512-516; page 517 supplies the answer key. Explanations are excluded.

There are 23 MCQs and five NATs (4.14, 4.17, 4.20, 4.21, 4.22). The source key
prints (*) for Q4.13, so its correctOptions remains empty. This is the only
unresolved answer; no question or option text is unresolved. Q4.23 remains an
MCQ despite its printed "is/are" phrasing. Q4.21 retains the printed 0 for the
empty statement. No external answers were inferred.

The prose and tables are editable text/LaTeX, and program listings are separate
code fields with placement markers. Q4.6/7 both contain their shared program.
Q4.5, Q4.18 and Q4.25 retain their page continuations; Q4.21 retains its column
continuation. Ten checksum-guarded figure-only crops preserve Q4.4/5 diagram
options and Q4.13/26 flowgraphs. Crop coordinates, page references, dimensions
and image hashes are in `compiler-code-generation-diagrams.json`.

The actual main database chapter was absent on inspection. The import added
28 questions, matched zero existing records and preserved the existing target
of 28. It uses the existing reviewed merge helper, stable IDs, source identity
checks, checksum-protected EJSON backup, unique chapter/target indexes,
transaction and compare-and-set protection. Unexpected legacy records and
collisions abort for review. User edits and locks survive repeat imports.
All unrelated chapter and target hashes were unchanged across the import.

Backup directory: `data/backups/compiler-code-generation-2026-10-28/`.
Pre-update backup: `before-2026-10-28T13-51-19-286Z.ejson` with `.sha256` file.
The directory also contains the inspection, after snapshot, import result and
verified-source-from-database.json read-back. Live repeat dry-run matched all
28 and added zero; coverage, IDs, metadata, available answers and images passed.

```powershell
node scripts/import-compiler-code-generation.mjs
node scripts/import-compiler-code-generation.mjs --apply --backup-dir data/backups/compiler-code-generation-2026-10-28
node --test tests/compiler-code-generation-import.test.mjs
node scripts/verify-compiler-code-generation-export.mjs data/backups/compiler-code-generation-2026-10-28/verified-source-from-database.json output/pdf/compiler-code-generation [optional-built-app-directory]
python scripts/verify-compiler-code-generation-pdfs.py output/pdf/compiler-code-generation
```

All 209 tests passed outside the restricted sandbox; source lint passed. An
isolated production webpack build passed, preserving the running dev server.
The normal Turbopack build encountered sandbox worker/lock errors; plain
repository-wide lint includes pre-existing generated files under tmp/, so the
successful source lint explicitly checked src/, scripts/, data/imports/, tests/
and the configuration files.

The existing export routes produced 28 black-background, white-text pages in
20/8-page parts. All pages were rendered and visually inspected. All 28 editor
previews passed with 88 MathJax expressions, no raw math, broken images,
overflow or browser errors. The editable ZIP contains all ten images and
source metadata; it compiled independently and pixel-matched all 28 pages.
Artifacts, preview.html and verification-report.json are under
`output/pdf/compiler-code-generation/`. Q4.5 uses the existing automatic fit
for its long program and four diagram options. No export helper or application
source was modified for this import.
