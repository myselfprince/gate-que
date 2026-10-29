# DBMS / ER Model import

Source: `12. DBMS/1. ER Model.pdf`, SHA-256
`aab96c4034d58b63448c7e115b78a124483163c42875a59c7c4b4dab2a917991`.
Both complete scanned spreads and enlarged question columns were visually read.
The syllabus/analysis page is excluded. Q1.1-Q1.5 are on PDF page 1 / book
page 597 (opening folio inferred from the following visible page 598).
Q1.6-Q1.12 are on PDF page 2 / book page 598; Q1.13-Q1.14 are on book page 599.
All 14 printed questions are present: 13 MCQ and one NAT (Q1.9).

No source answer key is supplied. All 14 answers remain empty with validated
`answerKeyStatus: not-supplied` and `answerKeyPdfPage: null`. There are no
unresolved question/option transcriptions. Q1.1's computeSalary/getSalary
inconsistency and the literal Q1.5 option D `1` are preserved and annotated.
Q1.5's complete relation is editable LaTeX. There are no program listings.

Five reproducible, checksum-guarded diagram assets retain all arrows,
participation lines, weak entities and attribute underlines. Q1.6/Q1.7 share
their diagram, and Q1.7 also repeats the preceding question for independence.
Q1.9 includes its continuation from the next column. Q1.13's four labelled
figures are tightly cropped separately and composed in their original 2x2
order; its option mapping remains editable prose. Its existing per-question
PDF image scale is set to 1.5 for readability.

The live chapter was absent and its completion target was already 14.
14 records were added, with stable IDs and no legacy matches. The target was
preserved. The adapted existing reviewed merge rejects unreviewed records,
content/ID collisions and duplicate source identities. Import repeats retain
user edits, answers and position locks. Updates use an EJSON backup plus
SHA-256, MongoDB transaction, unique identity indexes and compare-and-set
protection. All unrelated chapter and target hashes matched after import.
The Q1.13 display setting also has a separate full-chapter backup and CAS guard.

Backups and actual database read-back:
`data/backups/dbms-er-model-2026-10-28/`.
Final live repeat dry-run adds 0 and matches 14; metadata, source coverage,
unique IDs, all image hashes/references and intentionally missing answers pass.

Verification uses the existing PDF and editable ZIP API routes and a local
production QA server. Browser persistence requests are intercepted, so preview
QA cannot autosave to the main database. All 14 editor previews pass with no
math errors, raw LaTeX, broken images or overflowing questions.
Artifacts are in `output/pdf/dbms-er-model/`; `preview.html` links every
editor screenshot. Every PDF page was rendered and visually reviewed. The
editable ZIP compiles independently and matches all 14 PDF page renderings.
Black backgrounds, white text, full-width prose and one question per page
retain the established export format.

All 212 tests passed with normal Windows filesystem access; sandbox runs
initially hit EPERM on temporary rename/symlink tests. Targeted import tests
and lint pass. The documented `next build --webpack` production build passes;
default Turbopack fails in its CSS subprocess before compilation completes.
No application source or global export layout changes were needed.

```powershell
# Use the bundled Python runtime for pypdfium2/pdfplumber/Pillow.
python scripts/extract-dbms-er-model-diagrams.py
node scripts/import-dbms-er-model.mjs
node scripts/import-dbms-er-model.mjs --apply --backup-dir data/backups/dbms-er-model-2026-10-28
node --test tests/dbms-er-model-import.test.mjs
node scripts/verify-dbms-er-model-export.mjs data/backups/dbms-er-model-2026-10-28/verified-source-from-database.json output/pdf/dbms-er-model
python scripts/verify-dbms-er-model-pdfs.py output/pdf/dbms-er-model
```
