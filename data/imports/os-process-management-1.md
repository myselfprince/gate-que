# Operating Systems: Process Management-1 import (2026-10-28)

Imported all 76 questions (book Q1.1-Q1.76) into the actual main database chapter
`5. Operating Systems / 1. Process Management-1`.

Source: `C:/Users/Prince/Desktop/MadeEasy PYQ PDF/5. Operating Systems/1. Process Management-1.pdf`

SHA-256: `8b722f6546557c3c79df71dd2368e9fa007049a95ed17ab57a6169fd0d063ae5`

All five scanned PDF spreads were rendered and visually inspected, including
both book pages per spread (524-533). Text extraction is empty. The complete
printed answer key is on PDF page 5 / book page 533. There are no explanation
pages in this supplied PDF. No neighbouring chapter was included.

## Content and remaining source issues

- 54 MCQs, 9 MSQs, 11 NATs and 2 subjective questions.
- All text/options, years, marks, printed set numbers, ordering and continuations
  are retained. Mathematical expressions and 16 tables use editable LaTeX.
- Seven code blocks are in the separate code field; the two parallel-thread
  examples retain their side-by-side statement alignment.
- Q1.3, Q1.28 and Q1.38 use visually verified figure-only PNG crops. Reproduce
  them using `scripts/extract-os-process-management-1-diagrams.py`. All three
  image files are included in the portable LaTeX ZIP.
- Q1.10, Q1.28, Q1.43, Q1.50, Q1.59, Q1.67 and Q1.75 span book pages. Q1.72's
  options continue into the second column of book page 532, not onto page 533.
- Q1.8 and Q1.18 are subjective. Their printed key says only `Sol.`; the
  referenced solutions are absent. Both answer fields remain empty. No text
  or option is unreadable; no answer or answer range was invented.
- Q1.26, Q1.36 and Q1.47 have apparent printed-key inconsistencies. Their
  printed answers D, B and A are stored literally, with source review notes.
  Alternative answers are not substituted. Thus five questions have source
  issues: two missing solutions and three apparent key conflicts.

## Persistence and repeat safety

The initial main database chapter was absent; its target was already 76.
The import added 76, matched 0 and preserved the target unchanged. Before the
write, a checksummed EJSON snapshot was created at:

`data/backups/os-process-management-1-2026-10-28/before-2026-10-28T09-06-21-424Z.ejson`

This contains the absent chapter, the existing target, unrelated-document
hashes and the source checksum. The import uses the established reviewed merge,
a unique chapter identity index, a MongoDB transaction, concurrent-creation
protection and conditional writes. Unreviewed legacy records or collisions stop
the import instead of overwriting existing content. Existing IDs, edits and
locks remain intact on repetition.

Database read-back verified all 76 source identities, unique IDs, metadata,
available answers and diagram references. Unrelated chapters and targets were
unchanged. The live repeat-import dry-run matched all 76 and added zero.
Snapshot, read-back JSON, initial result and repeat report are in the backup
directory. User changes present before this task were preserved; no shared
application code or exporter was modified for this import.

## Validation and exports

All 187 project tests, ESLint and the production build passed. Windows sandbox
limitations initially blocked temporary-file rename/symlink tests and Next.js
junction creation; those checks passed when run outside that sandbox.

The actual export routes returned four PDF parts (20 + 20 + 20 + 16 pages) and
the matching portable editable LaTeX ZIP. All 76 editor previews rendered 193
MathJax expressions with zero math errors, unparsed expressions, broken images
or horizontal overflow. Browser persistence was intercepted during preview QA.

All 76 exported pages were rendered and visually reviewed. Page count, text
bounds, black background, white text and full-width question bodies passed.
The editable ZIP compiled independently into a 76-page complete PDF; all 76
pages were pixel-identical to their corresponding PDF-route pages.

Artifacts in `output/pdf/os-process-management-1/`:

- `Process-Management-1.pdf`: independently compiled complete PDF.
- `Process-Management-1-Black-PDFs.zip`: original PDF-route parts.
- `Process-Management-1-Editable-LaTeX.zip`: editable source, chapter JSON and images.
- `preview-1-*.png`: all 76 editor previews.
- `contact-1.jpg` through `contact-13.jpg`: complete rendered PDF review sheets.
- `export-qa.json` and `pdf-structure-qa.json`: machine-readable QA.

```powershell
node scripts/import-os-process-management-1.mjs
node scripts/import-os-process-management-1.mjs --apply --backup-dir '<backup-directory>'
node scripts/verify-os-process-management-1-export.mjs '<backup-directory>/verified-source-from-database.json' '<output-directory>'
python scripts/verify-os-process-management-1-pdfs.py '<output-directory>'
```

Use the bundled Python runtime (pdfplumber, pypdfium2, Pillow), installed
pdflatex and the project's Puppeteer for the verification scripts.
