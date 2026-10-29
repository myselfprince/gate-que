# Logic Functions and Minimizations

Reviewed source: `9. Digital Logic/1. Logic Functions and Minimizations.pdf`.
SHA-256: `ebe00a96fdac069eb9a388d2691cb17a90e381b121a5687172308c6f08bf7c42`.

All five scanned spreads were rendered and visually inspected, with individual
columns and higher-resolution checks of overbars and nested expressions.
Q1.1-Q1.76 occupy book pages 191-198. The answer key is on PDF page 5 / book
page 199; the syllabus, exam-analysis table and explanations are excluded.

There are 64 MCQs, 5 MSQs (1.71, 1.73-1.76), 6 NATs (1.57, 1.58, 1.62,
1.66, 1.68, 1.72) and one subjective circuit-construction question (1.17).
73 answers are transcribed from the supplied printed key. Q1.17 is marked
"Sol." but its solution is outside this PDF. Q1.18 and Q1.28 have (*) in the
printed key. These three answer fields remain empty, with source notes;
handwritten annotations are not used as authoritative answers. No question
or option transcription remains unresolved.

K-maps and the truth table are editable LaTeX. The expression shared by
Q1.34/35 is repeated in each dependent question. Q1.37 continues from book
page 194 to 195; Q1.63 crosses columns on page 197; Q1.69 continues across
PDF pages 4-5 / book pages 197-198; Q1.73 has next-column options. Eighteen
checksum-guarded figure-only crops preserve the circuits, four circuit
options in Q1.48, and Q1.19's waveform. There are no program listings.

Printed anomalies are retained in source notes: Q1.5 option D's minterm 18,
Q1.8's non-Gray column ordering, Q1.19's delta subscript mismatch, Q1.28's
repeated x_1 in its first vector, Q1.37's printed XY+XY' definition, and
Q1.45 option C's repeated m_1. Printed answers are not recomputed to repair
these anomalies. The separate Q1.2 and Q1.4 stems and their complements
are preserved as printed.

The inspected main chapter was absent; 76 records were added. Its existing
completion target was 76 and was preserved. The importer reuses the reviewed
merge helper and requires a live backup directory for apply. It validates
the source checksum, image checksums, metadata, question numbers, answers
and option counts. Stable source identities and IDs prevent duplicates.
Unreviewed legacy/content/ID collisions stop for review. A checksum-protected
EJSON backup precedes a transaction, unique chapter index and exact revision/
content compare-and-set guards. Existing source edits and locks survive
repeat imports. Unrelated chapter and completion-target hashes were unchanged.

The actual database read-back passed all 76 source identities, unique IDs,
metadata, available answers and image references. The live repeat-import
dry-run matched 76 and added zero. Snapshots, import results, read-back data
and repeat verification are in `data/backups/digital-logic-functions/`.

```powershell
python scripts/extract-digital-logic-diagrams.py
node scripts/import-digital-logic-functions.mjs
node scripts/import-digital-logic-functions.mjs --apply --backup-dir data/backups/digital-logic-functions
node --test tests/digital-logic-functions-import.test.mjs
node scripts/verify-digital-logic-export.mjs data/backups/digital-logic-functions/verified-source-from-database.json output/pdf/digital-logic-functions
python scripts/verify-digital-logic-pdfs.py output/pdf/digital-logic-functions
```

Export QA uses the existing application routes and a local preview server.
Browser persistence is intercepted so editor verification cannot change
database questions or preferences. The export validator makes the existing
default CS exam-paper label explicit in portable chapter JSON; the QA
comparison accounts for that default without changing saved records.

Artifacts, per-question preview screenshots and the preview gallery are in
`output/pdf/digital-logic-functions/`. The layout keeps the existing black
background, white text, full-width prose, matching options, editable math
and one question per page. The four PDF parts contain 20 + 20 + 20 + 16
pages. The four formulas in Q1.76 share one editable aligned block to avoid
unnecessary vertical gaps.

All 76 PDF pages were rendered and visually reviewed. The final Q1.17 crop
excludes a neighbouring text fragment; Q1.19 uses two transparent exterior
strips outside the complete circuit and its labels to exclude prose from
the skewed photograph. Their pre-cleanup versions are backed up beside the
database snapshots. Crop bounds, exterior exclusions and checksums are in
`digital-logic-functions-diagrams.json`.

All 76 editor previews passed with 466 MathJax expressions, zero raw math,
unknown commands, rendering errors, broken images or horizontal overflow.
The exported PDF has zero layout warnings. The portable LaTeX ZIP compiles
independently and matches the PDF route pixel-for-pixel on all 76 pages.
The 156-test suite, ESLint and the Next.js production build passed. Native
Windows access was needed for MiKTeX, Turbopack junctions, and existing
export-job filesystem tests; no application or export-helper changes were
needed.
