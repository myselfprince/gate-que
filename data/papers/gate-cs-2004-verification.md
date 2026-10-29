# GATE CS 2004 verification

Attempt: <http://localhost:3000/gatemock?paper=gate-cs-2004>

Selected source: `D:\Gate PYQs Year Wise - PDFs\2004.pdf` (physical filename unchanged).
SHA-256: `ba48acc7ffb92c1722d6efc85bd324a1001e35f5bb1b8766dddbf3d629e081a5`.
The 12-page scan header is **GATE-2004, COMPUTER SCIENCE & ENGINEERING**. No set/session label appears. No identity discrepancy was found.

All 90 numbered positions were visually checked against the selected scan, including continuations and common data. Q1–30 carry one mark; Q31–90 carry two marks, for 150 marks. All are single-answer multiple-choice positions. No General Aptitude, descriptive section or optional-question rule appears. Common data for Q56–57 and Q63–64 are repeated for navigation.

The scan omits duration and negative-marking instructions. The environment and exports explicitly disclose **180 minutes and zero penalty as practice settings**, not verified official 2004 rules. Q74's hypothetical −0.25 penalty is part of that question only. No official answer key was obtained from the reviewed sources; supplied Made Easy keys and GATE Overflow discussions are not labelled official.

## Independent storage and preservation

- Collection: `yearpapers`; slug/dataset ID: `gate-cs-2004`. Exactly one dataset exists. The document stores the exact source SHA-256.
- 86 independent copies link to their book chapter/question IDs, book labels when available, and a deterministic source-record digest. Q30, Q76, Q81 and Q90 were added from the scan.
- All 2,654 stored book questions were searched, including other year tags. The 163 records tagged 2004 contain other-paper questions and duplicates; year tags alone were not used to select content. Duplicate representations of Q36, Q54 and Q56 were consolidated in the separate copy.
- All 12 required images have independent paper-directory paths and a validated immutable asset manifest. Their bytes are also published through the existing `yearpaperassets` storage. Text, formulas, tables and code remain editable.
- Read-only pre-write book and year-paper snapshots are in `data/backups/gate-2004/`. The original `chapters` collection is only read by the inspection, import guard and integrity verifier.
- Book snapshot: **52 documents, 2,654 stored questions** (2,647 nonblank questions in the mock catalog).
- Before and after book SHA-256: `5ceb77abee3ea480348ca8f1920946d37cce082fc652b017ea16ba83748184d5`.
- The complete 2000, 2001, 2002 and 2003 year-paper documents remain unchanged. Verification creates disposable attempt records and deletes only those IDs; it does not modify book records or existing attempts.
- `/gateyearpaperpdf` derives **90/90, complete** from the actual dataset, source hash, answers, identities and marks. No completion flag was set separately.

## Answers and source defects

Every position has an independently authored worked reference, an exact mapped discussion URL and per-source verification status. **54** Made Easy key entries were visually checked, and **22** matching GATE Overflow discussions were individually reviewed. Other discussion links are explicitly labelled question mappings from the local cache, not reviewed answers. Numerical calculations, program traces, SRPT, heap insertion, LRU, Dijkstra, graph colouring, automaton counts, recurrence and tree-level costs have independent executable checks.

The following **11 positions / 21 marks** require post-submission self-assessment; the remaining **129 marks** are automatically gradable:

| Position | Reason / review policy |
| --- | --- |
| Q14 | Conventional 8/8 natural-join answer assumes an unstated foreign key. Without it the minimum can be 0. |
| Q47 | Scan option D is 1230 ns; the two-level translation calculation gives 1260 ns. Preserve the scan option. |
| Q49 | Exact inode maximum is 17,247,250,432 bytes; conventional C is only the dominant-term approximation. |
| Q62 | Supplied key A conflicts with the usual full-sum delay B; implementation/polarity assumptions matter. |
| Q63 | After-HALT sequential PC gives 1028 (D); supplied key C uses the HALT start address, 1024. Hypothetical restart semantics are unspecified. |
| Q71 | Scan prints −x+5y=1 and x−3y=3, unlike the conventional −1 and x+3y=3. Literal scan has no solution. |
| Q76 | Union-of-covering-lines interpretation gives a+b; rectangular-support interpretation gives min(a,b). |
| Q82 | Tight complexity is Θ(n), C; scan D is O(n), also true. |
| Q83 | Scan assumes a>0 while the parameter is n; intended positive-n reading gives D. |
| Q87 | Low-resolution exponent is transcribed as m−n; conventional references have m+n. Both interpretations and the missing nonnegative-exponent restriction are explained. |
| Q89 | Scan uses i≤j; authored index-order decision argument states the nonrepeating-enumeration convention. |

Resolved key disagreements are also visible in review: Q36 uses A (rear pointer), although the supplied key prints C; Q85 uses B (Θ(n log n)), although the supplied Miscellaneous key prints A. Corrections affect only independent year-paper copies. All per-position differences, page coverage and provenance are recorded in `data/backups/gate-2004/content-audit.json`; search candidates are in `full-book-search.json`.

Example reviewed discussions: [Q14](https://gateoverflow.in/1011/gate-cse-2004-question-14), [Q47](https://gateoverflow.in/318/gate-cse-2004-question-47), [Q62](https://gateoverflow.in/1057/gate-cse-2004-question-62), [Q63](https://gateoverflow.in/1058/gate-cse-2004-question-63), [Q76](https://gateoverflow.in/1070/gate-cse-2004-question-76), [Q85](https://gateoverflow.in/1079/gate-cse-2004-question-85).

## Exports and validation

The existing renderer produces:

- `output/pdf/gate-cs-2004.dark.pdf`: 90 pages, one complete question per page.
- `output/pdf/gate-cs-2004.print.pdf`: 90 pages, matching sequence and content.
- `output/pdf/gate-cs-2004.solutions.pdf`: 13 pages, all 90 answer entries, authored explanations and source notes.
- `output/pdf/gate-cs-2004.zip`: dark question PDF plus answers/solutions; both archive members match the generated bytes.

All four are available beside the selected paper under **Download paper & solutions**. Question PDFs contain no answer keys, worked references or solution links. All pages were rendered and visually inspected; Q34's layout and Q38's math options were corrected during that inspection. Automated checks confirm page counts, ordered headers, every answer entry and text bounds. Poppler independently confirms final rendering.

Actual checks:

- `npm test`: **293 passed, 0 failed** outside the Windows sandbox. Initial sandbox-only failures involved temporary-file renames and symlink permissions.
- `node --test tests/gate-2004.test.mjs tests/year-paper-assets.test.mjs`: **12 passed, 0 failed** after final dataset formatting changes.
- `npm run build -- --webpack`: **passed**, 33 routes prerendered. Initial sandbox build could not create a generated directory; the unsandboxed build succeeded.
- `node scripts/verify-gate-2004.mjs`: **passed** against the local production app. Checks all 90 browser positions for math errors and loaded diagrams; saves all 90 API responses; verifies active-answer secrecy, invalid token rejection, stale-revision conflicts, refresh/resume, review markers, calculator, submission, 129-mark automatic score, manual assessment and bounds, frozen submitted state, automatic expiry, all three PDF download bytes and both ZIP members. No browser page errors.
- Existing 2002 written-response persistence and the server-enforced 15-question optional limit: **passed** through disposable attempts.
- `python scripts/verify-gate-2004-pdfs.py`: **passed**; 90/90/13 pages, all 90 answers, no text-boundary or question-PDF answer-leak issues.
- `node scripts/verify-gate-2004-integrity.mjs`: **passed**; original book checksum unchanged, earlier papers unchanged, one persisted 2004 dataset equal to disk, matching source PDF, tracker complete.

The production app is available on port 3000. No application-code changes were needed: the existing year-paper catalog, attempt isolation, server scoring, manual assessment and download routes handle this historical paper's actual structure.
