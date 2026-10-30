# Independent year-paper datasets

GATE CS 2011 is available as `gate-cs-2011`: booklet A, 65 MCQs, 100 marks and 180 minutes. Five navigation blocks retain the source order, including ten General Aptitude questions at the end. It contains 47 independent book copies and 18 new transcriptions; all 65 have authored worked references compared with a historical booklet-A key mirror. Q2, Q22, Q59, Q60 and Q62 (six marks) use explicit post-submission self-assessment for key conflicts, a literal source code defect or competing interpretations. The source verifies one-third penalties, conditional linked credit and no penalty on linked second answers. See [the 2011 verification report](gate-cs-2011-verification.md) for source coverage, provenance, preservation checksums, downloads and actual test/build results.

GATE CS 2009 is available as `gate-cs-2009`: 60 MCQs, 100 marks and 180 minutes. The four original blocks contain 20 one-mark questions, 30 ordinary two-mark questions, six common-data questions and four linked-answer questions. It contains 55 independent book copies and five source transcriptions. All 60 have authored worked references; seven disputed or assumption-sensitive positions (14 marks) require self-assessment. The selected source verifies one-third penalties and conditional credit with zero penalties for linked second answers. See [the 2009 verification report](gate-cs-2009-verification.md) for source corrections, answer coverage, preservation checksums, exports and actual validation results.

GATE CS 2008 is available as `gate-cs-2008`: 85 MCQs in four original blocks, 150 marks and 180 minutes. It contains 79 independent book copies and six source transcriptions, with worked references for all 85 questions. The selected scan explicitly documents quarter-mark penalties and conditional linked credit. Fourteen defective, disputed or convention-sensitive questions (27 marks) use post-submission self-assessment. See [the 2008 verification report](gate-cs-2008-verification.md) for source corrections, answer provenance, unchanged-book checksums, downloads and actual test/build results.

GATE CS 2010 is available as `gate-cs-2010`: 65 MCQs, 100 marks, 180 minutes, with ten General Aptitude questions in their original final position. It contains 51 independent book copies and 14 source transcriptions. All 65 have authored worked references; disputed Q34, Q48, Q49 and Q63 (eight marks) require self-assessment. Source page 1 explicitly verifies one-third penalties, zero penalties on linked second answers, and conditional linked credit. See [the 2010 verification report](gate-cs-2010-verification.md) for full provenance, preservation checksums, exports and actual test/build results.

GATE CS 2007 is available as `gate-cs-2007`: 85 MCQs, four original blocks, 150 marks and 180 minutes. It contains 82 independent book copies and three source transcriptions, with 85 authored worked references. The selected instructions verify its negative penalties; conditional linked credit is explicitly disclosed as a practice rule. Twelve source-defective or convention-sensitive positions (22 marks) require self-assessment. See [the 2007 verification report](gate-cs-2007-verification.md) for source corrections, answer coverage, unchanged-book checksums, all four downloads and actual test/build results.

GATE CS 2006 is available as `gate-cs-2006`: 85 MCQs in four original blocks, 150 marks and a 180-minute timer. It contains 80 independent book copies and five source transcriptions. All 85 positions have authored worked references; 13 defective/disputed positions (24 marks) require self-assessment. The omitted historical instructions are handled with explicitly disclosed practice penalties. See [the 2006 verification report](gate-cs-2006-verification.md) for provenance, source defects, checksums, downloads and the 317-test/production-build results.

Independent year papers are stored in MongoDB's `yearpapers` collection. The `chapters`, `targets`, and original question assets are never written by the year-paper importer. Timed attempts continue to use `mockattempts` and snapshot the separate paper questions. A later book edit cannot change an existing year paper or attempt.

GATE CS 2005 is available as `gate-cs-2005`: 90 answer positions, three sections, 150 marks and a disclosed 180-minute historical practice model. Its five linked pairs retain labels 81(a)-85(b), with server-enforced prerequisite scoring and zero penalty for part (b). It contains 82 independent book copies and eight source transcriptions; every position has an authored worked reference. Seven defective/disputed positions require self-assessment. See [the 2005 verification report](gate-cs-2005-verification.md) for source differences, answer provenance, unchanged-book checksums and validation results.

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
