# Data Structures - Trees

Source: `C:/Users/Prince/Desktop/MadeEasy PYQ PDF/6. Data Structures/4. Trees.pdf`.
SHA-256: `020037cef32681b1eb3bd79141978cfd1888f9c5bab76f7d69095077189a4e92`.
All four scanned spreads and all seven relevant book pages (385-391) were
visually read. The previous chapter's explanation on book page 384 is excluded.
The supplied PDF has no Trees answer key. All 65 answers remain blank with
`answerKeyStatus: not-supplied` and `answerKeyPdfPage: null`; no answers or
numeric ranges were inferred.

Coverage is Q5.1-Q5.65, in book order: 57 MCQs, seven NATs and one subjective
question. Q5.5 asks for explanations of five labelled probe sequences; all
five subparts are editable prose, rather than truncating the fifth option.
Q5.48 is an MCQ with combination options despite its is/are wording. No MSQs
are printed in this PDF. The book repeats Q5.4 verbatim as Q5.6. Both printed
numbers are intentionally retained. The Trees merge helper permits only this
reviewed pair to bypass the shared content fingerprint; source identities and
stable IDs still prevent duplicates on repeat imports.

Q5.3 includes the tree shared with Q5.2. Q5.27-29 and Q5.37-38 repeat their full
shared passages. Q5.36 continues in the other column, Q5.41 spans book pages
388-389, and Q5.47 continues across PDF spreads 3-4 / book pages 389-390.
Prose is editable, mathematical expressions are LaTeX, and five programs are
in separate code fields. Seven figure-only crops cover Q5.2/3, Q5.19's four
options, Q5.46 and Q5.62. The crop manifest records coordinates, PDF/book pages,
dimensions and checksums; no full-question screenshots replace text.

Source anomalies are retained, not silently corrected:

- Q5.3 option A reads `fegcbdba` (eight letters).
- Q5.21 labels its second/fourth options `(2)`/`(4)`; the positional fields are B/D.
- Q5.23 option D contains `0` after `10`.
- Q5.27 B/C/D print ceiling brackets; A prints floor brackets.
- Q5.34 declares lowercase `leftchild`/`rightchild` but accesses camel-case
  `leftChild`/`rightChild`, and uses uppercase `Value = 1`.
- Q5.43 option D ends with an extra closing parenthesis.
- Q5.58 option B says `S2 is true and S2 is false`.

The main chapter was absent at inspection. Import added all 65 records in a
transaction after writing a checksummed EJSON before-state. The existing
completion target 65 was preserved. Unique chapter indexing and exact-state
conditional writes protect concurrent creation/edits. Unexpected legacy records
require review. Repeating the import preserves editable content, answers, IDs,
locks and unrelated records. Main database read-back verified all 65 source
identities, metadata and image references. Unrelated chapter/target hashes were
unchanged. A live repeat-import dry-run matched all 65 and added zero.

Backup and verification records: `data/backups/data-structures-trees-2026-10-28/`.
Exports and 65 editor preview captures: `output/pdf/data-structures-trees/`.
The actual export routes returned four black PDF parts (20+20+20+5), a merged
65-page PDF and the portable editable LaTeX ZIP with all seven images. Preview
QA rendered 163 mathematical expressions with zero errors, raw math, broken
images or horizontal overflow. All 182 project tests, ESLint and the production
build passed. All 65 exported pages were rendered and visually inspected with
no layout defects. The portable ZIP compiled independently to 65 pages, all
pixel-identical to the PDF-route pages. PDF structural/rendering QA is recorded
in `pdf-structure-qa.json`.

```powershell
node scripts/import-data-structures-trees.mjs
node scripts/import-data-structures-trees.mjs --apply --backup-dir data/backups/data-structures-trees-2026-10-28
node --test tests/data-structures-trees-import.test.mjs
node scripts/verify-data-structures-trees-export.mjs data/backups/data-structures-trees-2026-10-28/verified-source-from-database.json output/pdf/data-structures-trees
# Run with the bundled Python containing pypdfium2, pdfplumber and Pillow:
python scripts/extract-data-structures-trees-diagrams.py
python scripts/verify-data-structures-trees-pdfs.py output/pdf/data-structures-trees
```
