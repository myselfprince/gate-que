# Independent year-paper datasets

Independent year papers are stored in MongoDB's `yearpapers` collection. The `chapters`, `targets`, and original question assets are never written by the year-paper importer. Timed attempts continue to use `mockattempts` and snapshot the separate paper questions. A later book edit cannot change an existing year paper or attempt.

GATE IT 2004 is available as `gate-it-2004`: 90 MCQs, two sections, 150 marks, with disclosed 180-minute/zero-penalty practice settings. It contains 71 independent book copies and 19 source transcriptions. All questions have authored references; 13 source-defective or disputed items require self-assessment. See [the IT 2004 verification report](gate-it-2004-verification.md) for provenance, source differences, preservation checks, exports and test results.

GATE CS 2004 is available as `gate-cs-2004`: 90 MCQs, two mark-based sections, 150 marks, with explicitly disclosed 180-minute/zero-penalty practice settings. It contains 86 independent book copies and four source transcriptions. See [the 2004 verification report](gate-cs-2004-verification.md) for source differences, answer coverage, manual-review positions, preservation checks and actual test results. The catalog and downloads use its own dataset identity; the previously completed 2000–2003 papers remain separate.

## GATE CS 2000

- 69 positions, in the order of `D:\Gate PYQs Year Wise - PDFs\2000.pdf`.
- Section A: 23 one-mark MCQs and 26 two-mark MCQs (75 marks).
- Section B: 20 five-mark descriptive questions; answer any 15 (75 marks).
- 150 maximum marks; 180 minutes. There are 175 marks of questions available because Section B offers a choice.
- No General Aptitude section appears in this historical paper. No questions from another year were appended.
- The supplied scan does not specify a negative-marking rule. This reconstruction explicitly uses zero MCQ penalty as a practice rule.
- 38 unique questions were copied from the 41 book records tagged 2000. Two duplicates and one record absent from this paper were excluded. Eleven missing MCQs and twenty descriptive questions were transcribed from the source paper.
- Each copy has a new ID and key, its own assets, the source question identity, a reference answer, and a GATE Overflow discussion link. Original book option order and transcription differences are corrected in the copy only.

The scan flattens numbering to Q1-Q69. GATE Overflow uses 1.1-1.23 for Q1-Q23, 2.1-2.26 for Q24-Q49, and 3-22 for Q50-Q69. Both identifiers are retained.

## Answer review

Stored Made Easy keys were reused when available. Additional reference answers were checked against `C:\Users\Prince\Desktop\MadeEasy PYQ PDF\All Subject Solutions Keys`, the reference project's cached 70 GATE 2000 entries at `E:\G4Gate_Platform\gate-pyq-find\public\data\questions.json`, and linked GATE Overflow discussions. The reference project's database credentials did not authenticate; its local cache supplied the complete question link catalogue.

Worked reference solutions are authored explanations, not a claim to an official answer key. In particular, the two historical 8085 descriptive discussions have no posted answers; their solutions were derived from the instruction timing diagram and program trace.

Three source conflicts are documented:

| Scan position | Reference ID | Treatment |
| --- | --- | --- |
| Q24 | 2.1 | D is mathematically correct: the overlap can only be 0 or 1. The web page displays C despite its worked discussion explaining D. |
| Q29 | 2.6 | No option is universally true. B assumes an unstated restriction on sets; the counterexample is included. Manual review. |
| Q31 | 2.8 | Two-state minimal DFAs also recognize `{epsilon}` or `a+`; D is not universally true. Manual review. |

The other 47 MCQs give an automatic maximum of 71 marks. Written answers and the two disputed MCQs are self-assessed after submission. The UI labels those marks as self-assessed, validates their bounds on the server, and persists them separately from frozen responses. The server and UI both enforce at most 15 nonempty Section B responses.

## Reproduction and verification

```powershell
node scripts/inspect-gate-2000.mjs
node scripts/build-gate-2000.mjs
python scripts/extract-gate-2000-assets.py
node scripts/import-gate-2000.mjs
node scripts/export-gate-2000.mjs
node scripts/verify-gate-2000.mjs
```

The inspection snapshot and import checksum reports are in ignored `data/backups/gate-2000/`. A changed copy is refused by default; `--update-copy` backs up and conditionally replaces only the separate paper document. Import compares every original chapter before and after, and with the initial snapshot. The book contains 2,654 records, of which 2,647 are nonblank questions eligible for the mock catalogue.

Exports are in ignored `output/pdf/`: a 69-page dark paper, a 69-page print paper, a worked-solutions PDF, and a ZIP. They use the existing landscape, one-question-per-page LaTeX renderer. All 69 question pages and solution labels are read back and checked for text outside page boundaries. Downloads are available beside the selected year in `/gatemock`.

Verification covers source counts, frozen-copy isolation, answer secrecy, section limits, scoring, assets, API authorization, browser refresh/resume, calculator, submission, self-assessment, and all PDF/ZIP downloads. `node --test tests/*.test.mjs` passes 248 tests, including an exhaustive check of all 27,720 arrangements in descriptive Q64. `next build --webpack` succeeds; the default Turbopack production build encountered an environment CSS-worker process-launch failure.
