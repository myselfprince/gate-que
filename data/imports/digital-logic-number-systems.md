# Digital Logic - Number Systems import

Imported on 2026-10-28 from `9. Digital Logic/4. Number Systems.pdf`.

- SHA-256: `ed9441210bdacb32ed28da2d4aff0f8f436be776f690e2fbbe1bdf293e699c28`.
- All 3 scanned spreads visually inspected, with enlarged detail views. Q4.1-Q4.62 occupy book pages 233-237. Previous-chapter solutions on book page 232 were excluded.
- Main database chapter was absent. Added 62 questions, matched 0 existing records. Completion target was already 62 and was preserved unchanged.
- Types: 52 MCQ, 2 MSQ (4.55 and 4.62), 8 NAT (4.38, 4.39, 4.41, 4.42, 4.43, 4.52, 4.54, 4.58).
- All prose, options and numeric tables are editable. Q4.9 statements use the separate code field. Five checksum-guarded bit-field diagram crops are stored under `public/9. Digital Logic/4. Number Systems/`.
- Shared data is repeated for Q4.25-26 so each question exports independently. Q4.28 and Q4.53 retain both book-page references across continuations.

## Unresolved source issues

The supplied PDF contains no Number Systems answer key or solutions. All 62 answers are intentionally empty, with `answerKeyStatus: not-supplied` and `answerKeyPdfPage: null`. No source text is unreadable or omitted.

- Q4.7: historical four-option question has ambiguous single/multiple selection wording. Original MCQ form preserved; no answer inferred.
- Q4.14: the third and fourth options are both labelled (d) in the scan. Stored in printed order as C and D, with a source note.
- Q4.32: stem introduces a but subsequently uses r. Printed inconsistency retained.
- Q4.47: 0.875 and 12.100 are both labelled (ii), while options refer to (iii). Duplicate label retained.
- Q4.57: RB prints 0xC4210000. Exact register value and all options retained without correction.

## Persistence and verification

The reused reviewed merge rejects unreviewed ID/content/source collisions. Backup is written exclusively before mutation. The MongoDB transaction uses unique chapter identity protection and compare-and-swap guards for existing chapter and target updates. User edits, locks and IDs survive repeat imports.

Backup: `data/backups/digital-logic-number-systems-2026-10-28/before-2026-10-28T07-17-43-548Z.ejson`, with sibling SHA-256 file. `inspection.ejson`, `after.ejson`, `import-result.json`, and `verified-source-from-database.json` are in the same directory.

Database read-back passed source coverage 62/62, unique IDs, metadata, empty-answer status and all 5 image references. Unrelated chapters and targets were unchanged. Live repeat-import dry-run returned 0 added and 62 matched. Completion target remained 62.

Validation: 14 relevant Node tests passed; project lint and production build passed. Windows sandbox junction permissions required the build's authorized elevated retry. No application layout or export helpers were changed.

## Exports

Artifacts: `output/pdf/digital-logic-number-systems/`.

- `Number-Systems.pdf`: full 62-page black PDF, one question per page.
- `Number-Systems-Black-PDFs.zip`: standard 20/20/20/2-page split export.
- `Number-Systems-Editable-LaTeX.zip`: same layout, 5 images, portable chapter metadata.
- `preview.html`: all 62 editor previews.
- `export-qa.json`: 62 previews, 196 rendered math expressions, no math errors, raw math, broken images, overflow or browser errors.
- `pdf-structure-qa.json`: all 62 pages rendered, black background, full-width question body, no layout issues. The editable ZIP independently compiles and all 62 rendered pages are pixel-equal to the PDF route output.
- `contact-1.jpg` through `contact-11.jpg`: every exported question visually inspected.

## Repeatable commands

```powershell
node scripts/import-digital-logic-number-systems.mjs
node scripts/import-digital-logic-number-systems.mjs --apply --backup-dir data/backups/digital-logic-number-systems-2026-10-28
node scripts/verify-number-systems-export.mjs data/backups/digital-logic-number-systems-2026-10-28/verified-source-from-database.json output/pdf/digital-logic-number-systems
```

Source-only diagram extraction: `python scripts/extract-number-systems-diagrams.py` (requires PyMuPDF). PDF verification: run `scripts/verify-number-systems-pdfs.py` with the bundled Python runtime containing pdfplumber; Poppler and pdflatex must be on PATH.
