# DBMS: Functional Dependencies and Normalization

Source: `C:/Users/Prince/Desktop/MadeEasy PYQ PDF/12. DBMS/2. Funcational Dependencies and Normalizaation.pdf`

SHA-256: `e14abdc67112fd7d8c019186206bce776d3f64dd016dcd01db77e5513e8f29ba`

All four scanned spreads were rendered and visually reviewed. The source contains 57 questions, numbered 2.1 through 2.57, followed by an answer key and the beginning of the explanations. No explanations or adjacent chapter questions were imported.

| PDF page | Book pages | Question coverage |
| --- | --- | --- |
| 1 | 602 (inferred), 603 | 2.1-2.16; beginning of 2.17 |
| 2 | 604, 605 | end of 2.17; 2.18-2.35 |
| 3 | 606, 607 | 2.36-2.49 |
| 4 | 608, 609 | 2.50-2.57; full answer key on 609 |

Stored types: 46 MCQ, 4 MSQ (2.25, 2.52, 2.55, 2.56), 5 NAT (2.39, 2.40, 2.46, 2.54, 2.57), 2 subjective (2.1, 2.6). The old Q2.25 says “Which one”, but the book answer key lists C,D; both letters are preserved and the inconsistency is recorded. All 55 objective answers are transcribed from the supplied key, without solving or replacing them.

The subjective answer for Q2.1 and Q2.6(a) comes from the supplied explanation on book page 609. **Q2.6(b) remains unresolved**: its explanation is cut off at the end of the PDF. This is explicitly recorded in the answer and source notes; no answer is inferred.

Tables in Q2.5, Q2.9, Q2.14, Q2.40 and Q2.46 are editable LaTeX arrays. No diagram-only assets are needed. Q2.37 has a separate SQL code field. Primary-key underlines, multivalued dependency arrows, shared data for Q2.34-35, and column/page continuations for Q2.17, 2.22, 2.40 and 2.47 are preserved. Printed anomalies in Q2.8, Q2.15 (Data_of_Birth versus Date_of_birth) and Q2.29 (P outside the attribute list) are retained with source notes.

The database inspection found no chapter document and a target of 57. The import uses the existing reviewed merge helper, a backup with SHA-256, MongoDB transaction, exact snapshot comparisons for concurrent edits, and unique chapter indexes for concurrent creation. It rejects unreviewed legacy records. Repeated imports preserve user edits, IDs and locks. No application schema or export layout changes are needed.

Commands from the project root:

```powershell
node scripts/import-dbms-normalization.mjs
node scripts/import-dbms-normalization.mjs --apply --backup-dir data/backups/dbms-normalization-2026-10-28
node --test tests/dbms-normalization-import.test.mjs tests/question-pages.test.mjs tests/answer-key.test.mjs tests/pdf-book.test.mjs
npm run build -- --webpack
node scripts/verify-dbms-normalization-export.mjs data/backups/dbms-normalization-2026-10-28/verified-source-from-database.json output/pdf/dbms-normalization
python scripts/verify-dbms-normalization-pdfs.py output/pdf/dbms-normalization
```

Backups and the actual database read-back are under `data/backups/dbms-normalization-2026-10-28/`. Final PDF, editable ZIP, preview gallery and machine-readable export QA reports are under `output/pdf/dbms-normalization/`.

Final validation: 57 newly added, 0 previously matched, 1 partially unresolved subjective answer. The final live repeat dry-run matches all 57 records, adds zero records, and reports no retained content differences. All 57 final PDF pages were visually reviewed in rendered contact sheets. The PDF route returns 3 parts (20, 20, 17 pages); the independently compiled editable ZIP matches all 57 rendered pages exactly. Editor QA renders 291 expressions with no math errors, raw math, missing images, or horizontal overflow. Ten relevant tests and targeted ESLint pass. Production build passes with `--webpack`; the default Turbopack build encounters a CSS worker process failure in this environment. Existing application files and uncommitted edits were preserved.

A formatting-only repair to Q2.15 and Q2.30 escapes underscores in LaTeX text labels. It has its own checksummed backup and exact concurrent-edit guard. `after-latex-fix.ejson` and `verified-source-from-database.json` hold the corrected database read-back; the original `after.ejson` is retained as an audit snapshot.
