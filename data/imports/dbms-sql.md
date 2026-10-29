# DBMS / Structured Query Language (SQL) import

Source: `12. DBMS/3. Structure Query Language.pdf`.
SHA-256: `1d2a0491e11bf9150cee1fd246a9b33e8ee26d64ed23964b3588fef3ddeb8cd3`.
All five scanned PDF spreads were rendered and visually inspected. Questions
3.1-3.42 occupy book pages 616-624; the opening folio 616 is inferred from
the facing printed page 617. The complete answer key and the descriptive
solutions for 3.1/3.3 appear on PDF page 5 / book page 625. Explanations were
excluded from question content.

42 records: 33 MCQs, seven NATs (3.31, 3.34-3.36, 3.38, 3.41, 3.42), and two
descriptive questions (3.1, 3.3). There are no MSQs; paired statement choices
remain single MCQ options. Every answer is stored from the supplied key;
descriptive SQL solutions use the existing SUBJECTIVE answer field. Exact
printed numeric answers are stored without inventing acceptance ranges.

One unresolved text item: Q3.27's SELECT identifier is visible only as
`hire-dat`, with the remaining suffix obscured. Its code explicitly records
`hire-dat[unclear]`; the source answer B is clear and saved. No unreadable
characters have been filled in from the schema. Q3.24's supplied key C is
retained and flagged because it conflicts with ordinary SQL semantics.
Printed syntax and naming inconsistencies are retained in question notes,
including Q3.20's missing equality/unbound alias, Q3.34's CTE syntax, Q3.35's
EC placement, Q3.38's Student_code/Subject_code, Q3.39's table names/column
names, and Q3.41's NOT EXIST and sName/cName mismatch.

Prose and options are editable text/math. SQL listings use the separate code
field; SQL options keep the existing code-option rendering. Every relation
instance is an editable LaTeX table with printed keys and complete rows.
No raster diagrams occur in this chapter, so there are no image assets or
references. Shared contexts for 3.15/3.16, 3.20/3.21 and 3.25/3.26 are repeated
in full. The linked query is included with 3.16. Cross-spread continuations
3.12, 3.30 and 3.39 have both PDF pages recorded. Multiple relation tables
are arranged beside each other to retain readable full-width question text.

The inspected main database chapter was absent; the existing target was 42.
42 questions were transactionally inserted, zero legacy matches existed,
and the target stayed unchanged at 42. The existing reviewed merge rejects
unreviewed legacy records/content collisions, preserves IDs/edits/locks on
repeats and validates source identities. Import writes require unique chapter
indexes, a checksummed EJSON backup, a transaction and compare-and-set guards.
Subsequent table-layout repairs have separate backups and complete-question
CAS guards. Backups/read-back are in `data/backups/dbms-sql-2026-10-28/`.
Initial backup: `before-2026-10-28T15-14-09-616Z.ejson`.

Database read-back verifies all 42 questions, metadata, answers, unique IDs,
source coverage and absent image references. Live repeat dry-run adds zero
and matches 42. Unrelated chapter/target hashes were unchanged at the initial
import. The final audit detected a later concurrent change to the unrelated
`2. Funcational Dependencies and Normalizaation` chapter, last updated at
2026-10-28 20:45:15 IST. This import only wrote the SQL chapter; that concurrent
work was left intact. All unrelated targets remained unchanged.

Exports and every editor screenshot are in `output/pdf/dbms-sql/`.
`SQL.pdf` is the complete 42-page black-background/white-text PDF. The actual
export route produces three parts (20 + 20 + 2 questions) and a separate
answer key. `SQL-Editable-LaTeX.zip` contains the matching `main.tex`,
`answer-key.tex`, complete question JSON, metadata and instructions. All
42 question pages are rendered for visual review; the independently compiled
ZIP is compared to each PDF route page. Browser preview persistence requests
are intercepted so QA cannot autosave to the database. All 42 editor previews
render 108 MathJax expressions without math errors, raw LaTeX, broken images,
browser errors or horizontal overflow.

Validation: full test suite 218/218 with normal Windows filesystem access;
import-specific tests pass. Lint over `src scripts tests data/imports` passes.
Unscoped `npm run lint` also scans pre-existing ignored temporary Next builds
and reports two generated-chunk errors there; those files were left intact.
Documented `npm run build -- --webpack` passes. Default Turbopack fails in its
local CSS worker subprocess. No application source or global export helper
changes were needed.

```powershell
node scripts/import-dbms-sql.mjs
node scripts/import-dbms-sql.mjs --apply --backup-dir data/backups/dbms-sql-2026-10-28
node --test tests/dbms-sql-import.test.mjs
node scripts/verify-dbms-sql-export.mjs data/backups/dbms-sql-2026-10-28/verified-source-from-database.json output/pdf/dbms-sql
# Use the bundled Python runtime for pdfplumber/Pillow.
python scripts/verify-dbms-sql-pdfs.py output/pdf/dbms-sql
```
