# Stacks and Queues import review

- Database identity: `6. Data Structures` / `2. Stack and Queues`.
- Source: `C:/Users/Prince/Desktop/MadeEasy PYQ PDF/6. Data Structures/2. Stack and Queues.pdf`.
- SHA-256: `d470dc8e1e5d08893ef10af72258c910f1637e9720b89683bfaf125af85154c8`.
- Visually reviewed all three scanned spreads, book pages 368-373. Question coverage: Q3.1-Q3.30, in printed order. Answer key: PDF page 3 / book page 373. Explanations are excluded from question bodies; Q3.5's descriptive answer comes from the supplied explanation.
- 23 MCQ, 5 NAT, 1 SUBJECTIVE (Q3.5), 1 MSQ (Q3.30, A/B/D). No missing text, options or supplied answers.
- Continuations: Q3.14 crosses columns; Q3.16 crosses PDF pages 1-2 / book pages 369-370; Q3.19 crosses columns; Q3.22 crosses facing book pages 370-371; Q3.25 crosses columns; Q3.28's figure continues onto PDF page 3 / book page 372.
- Four diagram-only source crops: Q3.10, Q3.26, Q3.28, Q3.30. Coordinate bounds and checksums are in `data-structures-stacks-queues-diagrams.json`; images are in `public/6. Data Structures/2. Stack and Queues/`. Prose, formulas, options and code remain editable.

## Source caveats requiring editorial review

All four affected questions are imported, with literal source content and source notes. No answer was invented or silently corrected.

| Question | Source issue | Stored answer |
| --- | --- | --- |
| 3.1 | Option B has an extra trailing plus; explanation has one trailing plus. | B, as printed |
| 3.10 | Printed key C appears inconsistent with option A, the rear pointer in a circular singly linked queue. | C, as printed; answer discrepancy remains unresolved |
| 3.20 | Missing semicolon after `stkTop = -1` in main makes the literal C program invalid. | 15, as printed |
| 3.29 | Source repeats subscript a2 for both 7 and 8 and does not specify a3. | 8, as printed |

## Main database operation

The chapter was absent at inspection. The existing target was 30. A transaction created the chapter with 30 new questions and lockCount 0; target 30 was retained byte-for-byte. Unrelated chapter/target hashes were unchanged. No existing IDs or edits were overwritten.

Backup directory: `data/backups/data-structures-stacks-queues-2026-10-28/`.
Pre-write snapshot: `before-2026-10-28T07-42-51-004Z.ejson`, with a SHA-256 sidecar. The same directory contains inspection, database read-back, source projection and import result artifacts.

The importer checks the source checksum and diagram checksums before connecting. It reuses the reviewed merge helper, rejects unreviewed legacy records/content/ID collisions, and requires the unique subject/chapter index. The write transaction uses existing record state as a concurrency condition or requires a newly inserted chapter. A live repeat-import dry-run returned 0 added / 30 matched. Later source-associated edits are preserved and reported.

```powershell
node scripts/import-data-structures-stacks-queues.mjs
node scripts/import-data-structures-stacks-queues.mjs --apply --backup-dir data/backups/data-structures-stacks-queues-2026-10-28
```

## Verification and exports

- Database read-back: 30/30 source coverage, unique IDs, valid metadata and printed answers, valid image references, repeat-added 0.
- `npm test`: 179/179 pass outside the Windows sandbox (sandbox prevents temporary-file renames and symlink tests).
- `npm run lint`: pass.
- `npm run build`: pass outside the Windows sandbox (Turbopack needs local junction creation).
- Actual `/api/export-pdf` and `/api/export-latex`: HTTP 200; two PDF parts with 20 and 10 pages; ZIP includes all four image assets and editable source metadata.
- Editor preview: 30 questions, 112 math expressions, no math errors, raw math, broken images, overflow or browser errors. QA browser API persistence was mocked to prevent autosaves.
- Independent compilation of the extracted editable ZIP: 30 pages, pixel-identical to all 30 route-exported pages. Every exported page was rendered and visually reviewed. Black background, white text, full-width question body, one question per page, matching question/options sizing and correctly placed code/diagrams retained.

Artifacts: `output/pdf/data-structures-stacks-queues/Stacks-Queues.pdf`, `Stacks-Queues-Editable-LaTeX.zip`, `Stacks-Queues-Black-PDFs.zip`, `preview.html`, `export-qa.json`, and `pdf-structure-qa.json`.

No application or shared export implementation changes were needed. All pre-existing uncommitted files were preserved.
