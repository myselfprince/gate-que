# Operating Systems: Deadlock import (2026-10-28)

All 21 questions, book Q3.1-Q3.21, are saved in the actual main database chapter
`5. Operating Systems / 3. Deadlock`.

Source: `C:/Users/Prince/Desktop/MadeEasy PYQ PDF/5. Operating Systems/3. Deadlock.pdf`

SHA-256: `6205825112b07858d82294f7c72b91d47198507724fb6384ae4b33dad1bb0ed6`

All three scanned PDF spreads were rendered and visually inspected, including
both book pages per spread (558-563). Text extraction is empty. Book page 558
contains the previous chapter's explanations and is excluded. Deadlock
questions occupy book pages 559-562. The complete chapter key is on PDF page 3 /
book page 563; the explanation section below it is excluded from question data.

## Content and unresolved answer

- 18 MCQs, 2 NATs, 1 MSQ. All 21 questions, options, years, marks and printed
  sets are preserved in book order. No question is omitted.
- Q3.7 continues from book page 559 to 560. Q3.12 continues from 560 to 561.
  Q3.4's final option and Q3.20's options continue into the next column of the
  same book page. No shared passage is required.
- Prose and mathematics are editable text/LaTeX. Q3.8, Q3.12, Q3.14, Q3.18 and
  Q3.20 contain editable resource/timeline tables; Q3.20 has two matrices.
- Q3.4, Q3.6, Q3.9 and Q3.13 use the separate code field. Side-by-side process
  code preserves the source statement order. No question contains a graphical
  diagram requiring an image crop; explanation-only figures are excluded.
- **One unresolved answer: Q3.16.** The printed key contains only `*`, without
  an option or legend. Supplied explanations end at Q3.5, so there is no source
  explanation for Q3.16. The MCQ and all four options are saved, its answer
  fields remain empty, and the printed asterisk is recorded in source notes.
  The existing answer-key export marks it as `Answer not available`.
- The other 20 answers match the printed key. NAT values 7 and 2 are saved
  literally, without inventing tolerance ranges. Q3.21 is MSQ with A and D.

## Database persistence and safety

The initial chapter was absent; the existing completion target was 20. The
transaction added 21 questions and updated only this chapter's target to 21.
Before either write, a checksummed EJSON backup was created:

`data/backups/os-deadlock-2026-10-28/before-2026-10-28T11-50-21-205Z.ejson`

It includes the absent chapter, original target, PDF checksum and unrelated
document hashes. The existing reviewed merge, unique chapter index, MongoDB
transaction, conditional updates and concurrent-creation protection are reused.
An unreviewed legacy record or content/ID collision stops the import. Existing
edits, IDs and locks are preserved on repetition.

Database read-back verified all 21 source identities, unique IDs, valid
metadata, available answers and image references. Unrelated chapters and
targets remained unchanged. The live repeat-import dry-run matched all 21
questions and added zero. Inspection, backup/checksum, after-snapshot, import
result, database read-back and repeat report are in the backup folder.

Existing uncommitted changes were preserved. No shared application, schema,
validation or exporter code was modified for this import.

## Validation and outputs

All 193 project tests, ESLint and the production build passed. Tests/build ran
outside the Windows sandbox because its temporary-file rename/symlink and
Turbopack junction restrictions were already established in the preceding task.

Actual app export routes returned two PDF parts (20 + 1 pages) and a matching
portable editable LaTeX ZIP. All 21 editor previews rendered 62 MathJax
expressions with no math errors, unparsed expressions, broken images or
horizontal overflow. Browser persistence requests were intercepted during QA.

All 21 PDF pages were rendered and visually reviewed. Black backgrounds,
white text, full-width question bodies, one question per page, tables and code
placement passed. The editable ZIP compiled independently into a 21-page PDF;
every page was pixel-identical to its corresponding PDF-route page. No clipping
or layout defect was found. A review-sheet thumbnail-spacing fix affects only
the chapter-specific verification helper, not the exports or database data.

Artifacts in `output/pdf/os-deadlock/`:

- `Deadlock.pdf`: complete independently compiled 21-page PDF.
- `Deadlock-Black-PDFs.zip`: original PDF-route parts.
- `Deadlock-Editable-LaTeX.zip`: editable main.tex and chapter.json.
- `preview-3-1.png` through `preview-3-21.png`: editor preview captures.
- `contact-1.jpg` through `contact-4.jpg`: all rendered question pages.
- `export-qa.json` and `pdf-structure-qa.json`: verification results.

```powershell
node scripts/import-os-deadlock.mjs
node scripts/import-os-deadlock.mjs --apply --backup-dir '<backup-directory>'
node scripts/verify-os-deadlock-export.mjs '<backup-directory>/verified-source-from-database.json' '<output-directory>'
python scripts/verify-os-deadlock-pdfs.py '<output-directory>'
```

Use the bundled Python runtime (pdfplumber, pypdfium2, Pillow), installed
pdflatex and the project's Puppeteer for export verification.
