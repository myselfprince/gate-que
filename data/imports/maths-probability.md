# Engineering Mathematics: Probability

Source: `C:/Users/Prince/Desktop/MadeEasy PYQ PDF/11. Engg. Maths/1. Probability.pdf`

SHA-256: `e90e2db4cee3877cc55b5300d274bb84ec09928c74008fc6cacce3621a3233c2`

All four scanned PDF pages were rendered and visually reviewed. The main database chapter was absent at inspection. Imported all 69 questions in book order as `11. Engg. Maths` / `1. Probability`; the existing target of 69 was retained. Types: 46 MCQ, 3 MSQ, 20 NAT.

| PDF page | Book pages | Coverage |
| --- | --- | --- |
| 1 | 74-75 | Exclude previous-chapter explanations on 74. Import Q5.1-Q5.10 from 75; join Q5.6 across columns. |
| 2 | 76-77 | Q5.11-Q5.28; Q5.25 options continue in the right column; Q5.29 stem starts here. |
| 3 | 78-79 | Q5.29 options/year/marks continue here, then Q5.30-Q5.53; Q5.48 continues across columns. |
| 4 | 80-81 | Q5.54-Q5.69. Editable tables in Q5.55 and Q5.63; source diagram crop in Q5.61. |

No Probability answer key is present in the supplied PDF. All 69 answers remain intentionally empty with `source.answerKeyStatus = 'not-supplied'` and `source.answerKeyPdfPage = null`. No answer was calculated or invented.

Source issues retained:

- Q5.16 option C is printed 7525.
- Q5.26 all options use `e^{-20}` despite a 45-minute interval.
- Q5.28 options B/C print denominator `364^{r-2}`. All four options use the same display math style.
- Q5.35 (2010) follows Q5.34 (2011); source order is retained.
- Q5.40 has an incomplete printed time phrase, “between 5 PM, and p has”; the missing endpoint remains unresolved rather than guessed.
- Q5.59 has mismatched printed delimiters in S1. Delimiters are balanced for valid LaTeX; the squared expectation/inequality and the absolute values in S2 are retained. This normalization is recorded in source notes.

Import and verification:

```powershell
node scripts/import-maths-probability.mjs
node scripts/import-maths-probability.mjs --apply --backup-dir data/backups/maths-probability-2026-10-28
node scripts/verify-maths-probability-export.mjs data/backups/maths-probability-2026-10-28/verified-source-from-database.json output/pdf/maths-probability
python scripts/verify-maths-probability-pdfs.py output/pdf/maths-probability
```

The importer reuses `mergeReviewedImport`, checks the source checksum, rejects unreviewed legacy collisions, backs up before mutation, uses a MongoDB transaction with chapter/target identity indexes and optimistic concurrency guards, and verifies other chapter/target hashes. Repeating the import adds zero questions and preserves edits and locks. `extract-maths-probability-diagram.py` reproduces the diagram from the checksum-pinned source; the crop manifest records its bounds and hash.

Initial backup: `data/backups/maths-probability-2026-10-28/before-2026-10-28T17-27-53-011Z.ejson` with adjacent SHA-256 file. The later Q5.28 typography adjustment has its own backup and exact-record/concurrent-edit guard in `fix-maths-probability-typography.mjs`.

QA outputs are in `output/pdf/maths-probability/`: database-derived PDF parts, full 69-page PDF, matching editable LaTeX ZIP, 69 editor previews, 12 contact sheets, and machine-readable export/layout reports. Black background, white text, full-width prose and one question per page use the existing export helpers. The ZIP compiles independently and its pages match the export renders.

Relevant 14 tests and targeted ESLint pass. The production Webpack build passes. The default Turbopack build encounters a local subprocess-start failure; no app/config changes were made for that environment issue.
