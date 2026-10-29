# Operating Systems: Process Management-2 import (2026-10-28)

All 46 questions, book Q2.1-Q2.46, are saved in the actual main database chapter
`5. Operating Systems / 2. Process Management-2`.

Source: `C:/Users/Prince/Desktop/MadeEasy PYQ PDF/5. Operating Systems/2. Process Management-2.pdf`

SHA-256: `554ed8606dd4ca3bcf738cafd1e54888bca5e619192c1722beceaf305d258a67`

All five scanned spreads were rendered and visually inspected, including both
book pages per spread (542-551). Text extraction is empty. The complete printed
answer key is on PDF page 5 / book page 551. The explanation section begins
below that key and is excluded from the imported questions.

## Content and source caveats

- 39 MCQs, 3 MSQs and 4 NATs; every question has an available printed answer.
- Prose and mathematics are editable text/LaTeX. Programs and the aligned
  parallel-process code tables use the separate code field. Q2.29 retains
  editable code options using the existing `isCodeOptions` representation.
- There are no graphical diagrams requiring image crops. All apparent boxed
  figures are source code or code tables, reproduced as editable code.
- Common data for Q2.10-Q2.11 and Q2.17-Q2.18 is included with each dependent
  question so each exported question page is self-contained.
- Q2.14, Q2.18, Q2.22, Q2.27, Q2.37 and Q2.41 continue onto the next book page.
  Q2.20, Q2.29, Q2.33 and Q2.43 continue into another column of the same page.
- Q2.6 literally uses `mod 4` despite declaring five processes/mutexes.
- Q2.27 prints identical options A and D; both are preserved.
- Q2.29 has inconsistent array/loop bounds and `f` versus `f(i)` in prose/code;
  the source is preserved literally rather than silently repaired.
- Q2.32's inner while loops have no trailing semicolon and enclose the critical
  sections in braces. Those details and the printed answer A are preserved.
- **One unresolved source answer conflict: Q2.44.** The key prints D, which is
  stored literally. The displayed code and requested BCABCABCA sequence appear
  to require option C (`S1=1, S2=0, S3=0`). A source review note records this;
  no replacement answer was invented. No question or answer was omitted.

## Database safety and verification

The initial chapter was absent. Its completion target was already 46 and was
preserved unchanged. The import added 46 questions and matched zero existing
records. Before writing, it saved a checksummed EJSON backup:

`data/backups/os-process-management-2-2026-10-28/before-2026-10-28T09-54-02-615Z.ejson`

The backup includes the absent chapter, existing completion target, source
checksum and unrelated-document hashes. The established reviewed merge,
unique chapter index, MongoDB transaction, conditional writes and concurrent
creation checks are reused. A newly encountered unreviewed legacy record or
content/ID collision stops the import. Repeat imports preserve edits and locks.

Read-back verified all 46 source identities, unique IDs, metadata, available
answers and image references. Unrelated chapters and targets were unchanged.
A live repeat-import dry-run matched all 46 and added zero. The backup folder
contains inspection, before/after EJSON, checksum, read-back JSON, import result
and repeat dry-run report.

Existing uncommitted user changes were preserved. No shared application or
exporter code was modified for this import.

## Validation and exports

All 190 tests, ESLint and the production build passed. Windows sandbox
restrictions initially blocked temporary-file rename/symlink tests, Turbopack
junction creation and MiKTeX registry access; the corresponding checks passed
outside the sandbox.

The actual application routes returned three PDF parts (20 + 20 + 6 pages)
and the portable editable LaTeX ZIP. All 46 editor previews rendered 144
MathJax expressions with no math errors, raw expressions, broken images or
horizontal overflow. Preview QA intercepted browser persistence requests.

All 46 exported pages were rendered and visually reviewed. They preserve
black backgrounds, white text, full-width question bodies and one question per
page. The editable ZIP compiled independently to 46 pages, all pixel-identical
to the corresponding PDF-route pages. No clipping or layout issues were found.

Artifacts in `output/pdf/os-process-management-2/`:

- `Process-Management-2.pdf`: independently compiled complete 46-page PDF.
- `Process-Management-2-Black-PDFs.zip`: original PDF-route parts.
- `Process-Management-2-Editable-LaTeX.zip`: editable TeX and chapter JSON.
- `preview-2-1.png` through `preview-2-46.png`: editor preview captures.
- `contact-1.jpg` through `contact-8.jpg`: all rendered PDF pages.
- `export-qa.json`, `pdf-structure-qa.json`: machine-readable checks.

```powershell
node scripts/import-os-process-management-2.mjs
node scripts/import-os-process-management-2.mjs --apply --backup-dir '<backup-directory>'
node scripts/verify-os-process-management-2-export.mjs '<backup-directory>/verified-source-from-database.json' '<output-directory>'
python scripts/verify-os-process-management-2-pdfs.py '<output-directory>'
```

Use the bundled Python runtime (pdfplumber, pypdfium2, Pillow), installed
pdflatex and the project's Puppeteer for the verification scripts.
