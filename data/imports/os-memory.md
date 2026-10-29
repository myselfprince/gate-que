# Operating Systems: Memory Management and Virtual Memory

Imported on 2026-10-28 into the actual main database chapter
`5. Operating Systems / 4. Mem. Mgmt and Virtual Mem`.

## Source and coverage

- Source: `C:/Users/Prince/Desktop/MadeEasy PYQ PDF/5. Operating Systems/4. Mem. Mgmt and Virtual Mem.pdf`
- SHA-256: `0992bce7880081db8630d9bfe90fd3944ae64f56620b0c652dd491b85d9f0cd6`
- All five scanned spreads were rendered and visually inspected.
- 74 questions, Q4.1-Q4.74, book pages 567-574: 57 MCQ, 2 MSQ, 15 NAT.
- Printed answer key: PDF page 5 / book page 575. All 74 printed answers saved.
- Previous-chapter explanations on book page 566 and current-chapter explanations on page 575 are excluded.
- Q4.11, Q4.30, Q4.48, Q4.60 and Q4.67 span book pages; Q4.71 crosses columns. Shared data is reproduced for Q4.23/24, Q4.36/37 and Q4.47/48.
- Q4.11 and Q4.67 have high-resolution figure-only crops; crop coordinates and asset hashes are in `os-memory-diagrams.json`. Prose, mathematical expressions and three tables are editable; Q4.70 stores its declaration and loop in the separate code field.

## Remaining source issues

No missing or unreadable question, option or key. Two printed answer conflicts remain flagged in each record's source notes:

- **Q4.35:** printed option/key A is 0.194. The supplied timing values imply a probability near 0.019. No option or answer was invented or substituted.
- **Q4.65:** printed key is 154.5 ns, while the printed 10% fault rate and 5000 ns transfers imply a disk-I/O contribution alone of 600 ns/access. The literal key is saved.

Legacy Q4.13 and Q4.16 use “is/are” wording but have one printed correct option in a single-choice era; their original MCQ type is retained. Q4.52's printed milliseconds are retained. Q4.66 and Q4.73 are MSQs.

## Database safety and verification

The reviewed chapter was absent; its completion target was already 74. Import added 74, matched 0, and left the target and every unrelated chapter/target unchanged.

Backup directory: `data/backups/os-memory-2026-10-28/`.

- `inspection.ejson`: pre-import absent chapter and existing target.
- `before-2026-10-28T13-18-13-871Z.ejson` and `.sha256`: pre-write chapter, target, unrelated-document hashes and source checksum.
- `after.ejson` and `import-result.json`: original import read-back and result.
- `before-latex-fix-2026-10-28T13-23-00-893Z.ejson` and `.sha256`: additional backup before fixing the Q4.24 hexadecimal-address LaTeX command delimiter.
- `after-latex-fix.ejson`, `latex-fix-result.json`, `verified-source-from-database.json`: final actual database read-back.
- `repeat-dry-run.json`: live repeat check; 0 added and 74 already matched.

The importer reuses the reviewed merge and normal metadata validation, verifies the source checksum and images, rejects unreviewed legacy/content collisions, and uses a MongoDB transaction with unique chapter identity and compare-and-swap filters. Existing IDs, edits and locks survive repeats. The isolated Q4.24 repair requires the exact original question hash and a complete chapter compare-and-swap filter, with a separate backup; all other records and locks were checked unchanged.

Read-back passed 74/74 source identities, unique IDs, valid metadata, printed answers, image references and duplicate prevention. Database writes target only this chapter; its completion target remains 74.

## Export and preview verification

Output directory: `output/pdf/os-memory/`.

- `Memory-Management.pdf`: 74 black landscape pages, one question per page.
- `Memory-Management-Black-PDFs.zip`: original route output, batches 20/20/20/14.
- `Memory-Management-Editable-LaTeX.zip`: matching editable source, chapter JSON and two figure crops.
- `preview.html`: all PDF page renders and all editor screenshots.
- `export-qa.json`: 74 editor cards, 142 rendered expressions, no MathJax errors, raw math, broken images, overflow or browser errors.
- `pdf-structure-qa.json`: 74 rendered pages, black background, full-width prose, valid text bounds, independently compiled ZIP and 74/74 pixel-identical PDF pages.
- `contact-1.jpg` through `contact-13.jpg`: all output pages visually reviewed. Figure-only crops also visually inspected.

Full suite: 196/196 tests passed with normal Windows permissions; initial sandbox-only failures concerned temporary-file rename/symlink restrictions. Full lint and targeted lint passed. Production build passed with the installed Next.js documented `--webpack` option; default Turbopack encountered a Windows junction error. No application rendering/export implementation or existing uncommitted files were changed.

## Repeat commands

```powershell
node scripts/import-os-memory.mjs
node scripts/import-os-memory.mjs --apply --backup-dir data/backups/os-memory-2026-10-28
node scripts/verify-os-memory-export.mjs data/backups/os-memory-2026-10-28/verified-source-from-database.json output/pdf/os-memory
python scripts/verify-os-memory-pdfs.py output/pdf/os-memory
```

The Python helpers use `pypdfium2`, `pdfplumber` and Pillow from the bundled workspace Python runtime. The export verifier needs an existing production build, pdflatex, Poppler and the project's Puppeteer installation.
