# Calculus source review

Source: `11. Engg. Maths/3. Calculus.pdf`

SHA256: `06a0870de3ef2626055b76a9397ca64389af901de19ab79c2ddae67c9986c1f2`

All 3 scanned spreads and all question columns were rendered and visually read. There are 42 questions, Q7.1-Q7.42: 30 MCQ, 11 NAT, 1 MSQ (7.38). The complete printed answer key is on PDF page 3, book page 117. No question diagrams, code, tables, shared passages or question continuations occur.

| PDF page | Book pages | Included questions | Exclusions |
| --- | --- | --- | --- |
| 1 | 112-113 | 7.1-7.12 on p113 | Linear Algebra explanations on p112 |
| 2 | 114-115 | 7.13-7.39 | None |
| 3 | 116-117 | 7.40-7.42 on p116; key on p117 | Calculus explanations below key |

Printed anomalies are preserved in editable fields and source notes: mixed-number notation in 7.7; extra interval in 7.14 option A; f(q) in 7.16; a != b condition in 7.26; base-number question 7.30 and random-variable question 7.42 remain in the supplied chapter. Q7.7 (2008) precedes Q7.8 (2007), as printed.

Editorial issue: Q7.10 prints 3x^4-16x^3+4x^2+37 but keys answer B (1 extremum). This polynomial has three distinct stationary extrema. The source stem and answer key are retained, with an explicit source note. There is no missing/illegible text or missing answer; this single source inconsistency remains for editorial resolution.

Initial main database inspection found no Calculus chapter and a completion target of 42. The importer uses the existing reviewed merge, checks the source checksum, backs up chapter/target state with an SHA256 sidecar, uses transaction/concurrent-edit guards, and reads back the actual database. Repeats retain edits, IDs, answers and locks. Unreviewed legacy matches are rejected for review.

Commands:

```powershell
node scripts/import-maths-calculus.mjs
node scripts/import-maths-calculus.mjs --apply --backup-dir data/backups/maths-calculus-2026-10-28
node scripts/verify-maths-calculus-export.mjs data/backups/maths-calculus-2026-10-28/verified-source-from-database.json output/pdf/maths-calculus
python scripts/verify-maths-calculus-pdfs.py output/pdf/maths-calculus
```
