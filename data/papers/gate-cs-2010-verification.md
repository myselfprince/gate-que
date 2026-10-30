# GATE CS 2010 verification

Attempt: <http://localhost:3000/gatemock?paper=gate-cs-2010>. Dataset: `gate-cs-2010`, stored once in MongoDB `yearpapers`. The production app was built with webpack and started on port 3000.

## Selected source and original pattern

- Exact selected file: `D:\Gate PYQs Year Wise - PDFs\2010.pdf`.
- SHA-256: `c9ae2341cdf2a91b997fa0092bae579cc185c4d84b54af64cee5c01d28958801`, verified against the supplied value, stored in `sourceSha256` and every question's source provenance.
- Header: **2010, CS: Computer Science and Information Technology**. One paper; no set/session designation. No filename/header identity discrepancy. The physical filename remains `2010.pdf`, including the independent copy in `public/Year Papers/GATE CS 2010/`.
- All 24 pages were visually inspected. Instructions are on page 1, questions on pages 2-16, and the end marker on page 16. Pages 17-24 are rough-work pages. No other year-wise PDF was imported or appended.
- 65 MCQs, 100 marks, 180 minutes. No NAT, MSQ, descriptive questions, optional questions or section choices occur in this paper.

The five navigation blocks preserve the printed sequence, rather than moving aptitude to the beginning:

| Positions | Block | Questions | Marks |
| --- | --- | ---: | ---: |
| 1-25 | One-mark technical questions | 25 | 25 |
| 26-47 | Two-mark technical questions | 22 | 44 |
| 48-51 | Common data: two pairs | 4 | 8 |
| 52-55 | Linked answers: two pairs | 4 | 8 |
| 56-65 | General Aptitude: five one-mark and five two-mark | 10 | 15 |

Page 1 explicitly documents these scoring rules:

- Wrong Q1-25 and Q56-60: minus 1/3 mark.
- Wrong Q26-52, Q54 and Q61-65: minus 2/3 mark.
- No negative marking at Q53 or Q55. Unattempted questions earn zero.
- Q53 is evaluated only if Q52 is correct; Q55 only if Q54 is correct. A blank or wrong first answer makes the second ineligible. These are source rules, not inferred practice dependencies.

The digital interface accepts one option per MCQ, uses the existing exact timer and saved attempt snapshots, and enforces linked scoring on the server. The unchanged framework continues to support historical written responses and optional-section limits for older papers.

## Book search, independent copies and source corrections

Read-only searches covered all **2,654** book questions in **52** chapter documents, including **54** records tagged 2010. Full text, code, option sequences and diagrams were compared with the selected scan. The paper contains **51 independent book copies** and **14 new source transcriptions** (Q2, Q19, Q21, Q22 and Q56-65).

Three year-tagged records do not occur in this selected source and were excluded: the K4/Q3 planarity question (`p5wksyqsw`), the SOP minimization question (`madeeasy-digital-logic-functions-1-46`) and the variance question (`madeeasy-maths-probability-5-35`). Their original records remain untouched. Whole-book similarity results are saved in `data/backups/gate-2010/full-book-search.json`; high token similarity at Q35 and Q54 was checked as a false duplicate signal (different C code and overlapping linked passages, respectively). No duplicate paper positions were imported.

Each copy has a new ID and `yearpaper:gate-cs-2010:N` key. Its `source.copiedFrom` retains chapter/question identity, original book label, subject, chapter, year and a source-record checksum. Six diagrams were cropped directly from the selected scan into this paper's own directory. The two repeated diagram passages use those independent crops. Hash-addressed immutable copies are published through the framework's `yearpaperassets` storage for frozen attempts.

Material corrections are confined to the copies:

| Position | Selected-source restoration |
| --- | --- |
| Q6 | Source option C is `m0+m2+m6+m7`; the book repeats a different term. |
| Q11 | The source printf contains a space between the two integers. |
| Q17 | Source C is L2 intersection L3 and D is L2 union L3; book distractors differ. |
| Q19 | Both complete tables and the correlated SQL query are editable. |
| Q21-22 | Historical software-engineering questions are included. |
| Q28 | Four original labeled degree sequences are retained. |
| Q36 | The damaged book NULL test, punctuation and capital P were restored against the source; all four options remain editable code. |
| Q40 | Source option C says L1 and L2; the book says L1 and L3. |
| Q48-49 | Removed an extra repeated L2 phrase absent from the selected scan; retained the full bus diagram and shared passage. |
| Q50-55 | Original common/linked labels restored; complete shared tables, matrix and network repeated on each relevant question page. |

Per-position source pages, corrections and provenance are in `content-audit.json` beside the read-only snapshot, and in the tracked paper JSON itself.

## Answer verification and review policy

**65/65 positions have independently authored worked references.** These are not represented as an authenticated official answer key. An official-key search located historical question-paper archives but did not establish an authenticated 2010 key for this exact scan. The finder project's local cache supplied all 65 discussion mappings without using its credentials.

Ten entries were visually checked in the supplied separate Made Easy key PDFs:

| Key PDF | PDF page | Printed items | Paper positions |
| --- | ---: | --- | --- |
| Algorithms.pdf | 3 | 1.36 = C | Q12 |
| Algorithms.pdf | 7 | 3.38 = D; 3.39 = D; 3.40 = B | Q34, Q50, Q51 |
| Digital Logic.pdf | 1 | 1.45 = A; 1.47 = A | Q6, Q31 |
| Digital Logic.pdf | 2 | 2.23 = B | Q9 |
| Digital Logic.pdf | 3 | 3.22 = A | Q32 |
| COA.pdf | 1 | 1.25 = B | Q37 |
| COA.pdf | 3 | 3.22 = B | Q33 |

The root of these key paths is `C:\Users\Prince\Desktop\MadeEasy PYQ PDF\All Subject Solutions Keys`. Stored book provenance is retained separately and is not counted as a new direct key check.

Seven GATE Overflow discussions were individually reviewed: [Q32](https://gateoverflow.in/2206/gate-cse-2010-question-32), [Q33](https://gateoverflow.in/2207/gate-cse-2010-question-33), [Q34](https://gateoverflow.in/2208/gate-cse-2010-question-34), [Q48](https://gateoverflow.in/2352/gate-cse-2010-question-48), [Q49](https://gateoverflow.in/43329/gate-cse-2010-question-49), [Q62](https://gateoverflow.in/2370/gate-cse-2010-question-62?show=144289), [Q63](https://gateoverflow.in/2371/gate-cse-2010-question-63). Direct automated fetches returned HTTP 403, so targeted accessible web results were used. Other links are explicitly marked as local-cache mappings, not individual answer cross-checks. All answers also contain an authored derivation or reasoned reference, matched to the final options.

The following four disputed items, worth eight marks, are excluded from definite automatic correct/wrong outcomes and have labeled post-submission self-assessment:

| Position | Reference | Reason for review |
| --- | --- | --- |
| Q34 | B | Include/exclude recurrence gives max(Y,a0+Y/2), while the supplied Made Easy key prints D. Counterexample and source disagreement are included. |
| Q48 | C, 22 ns | Cache access/transfer timing conventions are unstated and disputed. |
| Q49 | C, 902 ns | Read-plus-write bus transfer model gives 902 ns; alternate timing interpretations are discussed. |
| Q63 | D | Accepted discussion answer D is contested against C and other reading interpretations. |

The definite automatic maximum is **92 marks**. Self-assessed marks are stored separately, bounded server-side and visibly identified in review. Every question retains answer-source type, location/link, official/nonofficial status, verification status and any source issue.

Independent executable checks include the C recursion (Q35 = 15), FIFO faults (Q24 = 196), graphical degree sequences, two's-complement arithmetic, Newton iteration, octal addition, the 51 distinct digit numbers, all 625 small signed subsequence cases, all 720 hash insertion permutations (30 valid), constrained spanning trees, paths of at most three edges, and both routing-network shortest-path computations.

## Original-data preservation

Before writes, read-only EJSON snapshots of `chapters`, `yearpapers` and `mockattempts` were saved in ignored `data/backups/gate-2010/`. Deterministic BSON EJSON SHA-256 checks and counts are recorded in `snapshot-report.json`.

Original book before and after:

`cb64756a0e7afa184f98d08d3d850bebdac1cf68e764f9b99c8f647639373a4f`

Final checks confirm 52 chapter documents and 2,654 original questions are unchanged, all eight papers present at the initial snapshot are unchanged, and all six existing attempts are unchanged. No original book record, original diagram, lock, answer, order, identifier or metadata was edited. Verification attempts were created with fresh IDs and only those IDs were removed on cleanup.

Exactly one 2010 dataset exists, its content equals the tracked paper JSON, and `/gateyearpaperpdf` derives **Verified in DB · 65/65 questions**, 100 marks, from actual content plus the exact source SHA-256. No tracker flag was set. Final evidence is in `import-report.json` and `final-integrity.json`.

## Exports and validation

Downloads beside the selected paper use its own slug:

- [Dark questions](http://localhost:3000/api/gatemock/papers/gate-cs-2010/export?format=pdf&theme=dark): `output/pdf/gate-cs-2010.dark.pdf`, 65 pages.
- [Print questions](http://localhost:3000/api/gatemock/papers/gate-cs-2010/export?format=pdf&theme=light): `output/pdf/gate-cs-2010.print.pdf`, 65 pages.
- [Answers and worked references](http://localhost:3000/api/gatemock/papers/gate-cs-2010/export?format=key): `output/pdf/gate-cs-2010.solutions.pdf`, nine pages, all Q1-Q65 entries.
- [ZIP](http://localhost:3000/api/gatemock/papers/gate-cs-2010/export?format=zip): `output/pdf/gate-cs-2010.zip`, containing the dark paper and matching solutions.

The existing LaTeX renderer preserves one question per page. Both question PDFs exclude answer keys and solution links. All 139 final pages were rendered, contact sheets visually inspected, and all question headers/order, answer labels and text bounds checked. Diagram crops and representative dense pages were also inspected at larger size. No text-bound, page-count, missing-answer-label, diagram or answer-leak issue was found. PDF and ZIP downloads match the generated local bytes.

Actual checks:

- `node --test tests/*.test.mjs`: **330 passed, zero failed** at the recorded run, including six 2010 tests. The initial sandbox run blocked nine existing temporary-file/link tests; rerunning with normal filesystem access passed all 330.
- `npm run build -- --webpack`: **passed**, Next.js 16.3.2 production compilation and all 36 static pages. The existing working webpack path was used.
- `node scripts/verify-gate-2010.mjs`: **passed** API and browser checks. All 65 screens loaded with zero MathJax, image or page errors. Tested secrecy, token authorization, revision conflicts, all saved responses, resume, review markers, calculator, submission, frozen submitted state, 1/3 and 2/3 penalties, linked prerequisite scoring, bounded self-assessment, expiry submission and all four downloads. The old 2000 written-response path and its server-enforced 15-response limit passed regression checks.
- `python scripts/verify-gate-2010-pdfs.py`: **passed**, 65 dark + 65 print + nine solutions pages, zero issues.
- `node scripts/verify-gate-2010-integrity.mjs`: **passed**, book/paper/attempt preservation, one exact dataset and tracker completion.

Browser and rendered-PDF evidence is in ignored `tmp/gate2010/`; test and production-build logs are `test-results.txt` and `build-results.txt` there. Machine-readable live and PDF reports are in `data/backups/gate-2010/`.

Remaining limits: no authenticated official answer key is claimed; four disputed questions need self-assessment; only the ten listed external-key entries and seven discussion pages are claimed as direct external checks. Other references are authored derivations plus preserved provenance. Original scan resolution limits diagram sharpness, but all labels and connections were retained and checked.

Reproduction from the preserved source and database snapshot:

```powershell
node scripts/inspect-gate-2010.mjs 2010
python scripts/extract-gate-2010-assets.py
node scripts/build-gate-2010.mjs
node scripts/audit-gate-2010.mjs
node scripts/import-year-paper.mjs gate-cs-2010
node scripts/export-year-paper.mjs gate-cs-2010
node scripts/verify-gate-2010.mjs
python scripts/verify-gate-2010-pdfs.py
node scripts/verify-gate-2010-integrity.mjs
```

The importer refuses a changed separate copy unless `--update-copy` is given, which backs up and conditionally replaces only this paper. Database and TeX commands need their normal environment access; credentials are loaded privately from the existing environment.
