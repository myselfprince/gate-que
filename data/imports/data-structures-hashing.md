# Hashing import - 2026-10-28

- Subject/chapter: `6. Data Structures` / `6. Hashing`.
- Source: `C:/Users/Prince/Desktop/MadeEasy PYQ PDF/6. Data Structures/6. Hashing.pdf`.
- SHA-256: `092c3a0695e1d58164b0b96215e94d84350eb9290d59f056a0da7fbbb0c215fa`.
- Both scanned PDF spreads visually reviewed, including page/column continuations.
- Scope: 18 questions, book 7.1-7.18, 16 MCQ and 2 NAT. No MSQ.
- Printed answer key: PDF 2 / book 411. All 18 answers available and saved.
- Main chapter was absent; target was already 18. Added 18, matched 0, unresolved 0.
- Repeat live dry-run: added 0, matched 18. Target stays 18.
- Main database read-back verified full source coverage, all fields/answers, source metadata,
  unique IDs, position locks and working image references. Unrelated chapters/targets unchanged.
- No application/schema/export-helper changes were needed. Pre-existing working changes retained.

## Source coverage

| Book question | PDF pages | Book pages | Year / set | Marks | Type | Printed answer |
|---|---|---|---|---|---|---|
| 7.1 | 1 | 409 | 1996 | 1 | MCQ | C |
| 7.2 | 1 | 409 | 2004 | 1 | MCQ | C |
| 7.3 | 1 | 409 | 2005 | 1 | MCQ | D |
| 7.4 | 1 | 409 | 2006 | 1 | MCQ | C |
| 7.5 | 1 | 409 | 2007 | 2 | MCQ | B |
| 7.6 | 1 | 409 | 2007 | 2 | MCQ | B |
| 7.7 | 1 | 409 | 2008 | 2 | MCQ | D |
| 7.8 | 1, 2 | 409, 410 | 2009 | 2 | MCQ | C |
| 7.9 | 2 | 410 | 2010 | 2 | MCQ | C |
| 7.10 | 2 | 410 | 2010 | 2 | MCQ | C |
| 7.11 | 2 | 410 | 2014 / 1 | 2 | MCQ | A |
| 7.12 | 2 | 410 | 2014 / 3 | 2 | MCQ | A |
| 7.13 | 2 | 410 | 2015 / 2 | 2 | MCQ | B |
| 7.14 | 2 | 410 | 2015 / 3 | 1 | NAT | 80 |
| 7.15 | 2 | 410 | 2020 | 1 | NAT | 13 |
| 7.16 | 2 | 410, 411 | 2021 / 1 | 2 | MCQ | C |
| 7.17 | 2 | 411 | 2022 | 1 | MCQ | B |
| 7.18 | 2 | 411 | 2023 | 1 | MCQ | C |

The previous chapter's explanations (book 408) and Hashing explanations below
the answer key are excluded. Q7.8 options A/B appear on book 409 and C/D on book
410. Q7.9/7.10 each contain their shared passage and editable LaTeX table for
self-contained export. Q7.16 item 7, diagram, options and header continue on book
411. Its option D has a printed colon after 9, retained literally and noted in
source metadata; no corrected sequence was invented.

Prose and math are editable; the seven hash tables are editable LaTeX arrays.
Only the Q7.16 tree is a source image crop. The diagram manifest records bounds,
page, size and image checksum; its extraction script checks the PDF checksum.
There is no source program/code in this chapter.

## Backup and concurrency protection

Local backup directory: `data/backups/data-structures-hashing-2026-10-28/`.

- `inspection.ejson`: reviewed absent chapter and existing target.
- `before-2026-10-28T08-01-13-908Z.ejson` plus `.sha256`: pre-write snapshot,
  target, unrelated-record digests and source checksum. Backup checksum verified.
- `after.ejson`, `import-result.json`, `verified-source-from-database.json`:
  live database read-back and import audit.
- `repeat-dry-run.json`: final live repeat-import verification.

The importer re-reads the live chapter and target; refuses unreviewed records;
requires a unique subject/chapter index; writes the backup before a transaction;
and uses conditional creation/update guards. A concurrent chapter creation or
edit aborts instead of overwriting. Later source-linked edits and IDs are kept
by the reviewed merge. Unrelated chapter/target hashes are compared after import.

## Verification and exports

- `npm test`: 184/184 pass. Initial sandbox run blocked temporary renames and
  symlinks; the allowed external retry passed all tests.
- `npm run lint`: pass.
- `npm run build`: pass. Initial sandbox run denied a Turbopack junction;
  the allowed external retry passed.
- Editor preview: 18 questions, 63 rendered expressions, no MathJax errors,
  raw math, missing images, horizontal overflow or browser errors.
- PDF: 18 landscape pages, one question per page; black background, white text,
  full-width prose, no out-of-page text or layout warnings.
- Editable LaTeX ZIP independently compiled with pdflatex. All 18 pages are
  pixel-identical to the application PDF route at the QA render resolution.
- All 18 pages visually inspected. PDFium contact sheets provide the final
  previews; full-size renders and PDF text/color read-back confirm complete headers.

Outputs: `output/pdf/data-structures-hashing-2026-10-28/`:
`Hashing.pdf`, `Hashing-Black-PDFs.zip`, `Hashing-Editable-LaTeX.zip`,
`preview-pages-1.jpg` through `preview-pages-3.jpg`, per-question editor screenshots,
`export-qa.json`, and `pdf-structure-qa.json`.

## Repeatable commands

```powershell
node scripts/import-data-structures-hashing.mjs
node scripts/import-data-structures-hashing.mjs --apply --backup-dir data/backups/data-structures-hashing-2026-10-28
node scripts/verify-data-structures-hashing-export.mjs data/backups/data-structures-hashing-2026-10-28/verified-source-from-database.json output/pdf/data-structures-hashing-2026-10-28
python scripts/verify-data-structures-hashing-pdfs.py output/pdf/data-structures-hashing-2026-10-28
```

The default import is read-only. No LAN importer is executed.
