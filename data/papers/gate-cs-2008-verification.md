# GATE CS 2008 verification

The separate `gate-cs-2008` dataset is imported into `yearpapers` and selectable at http://localhost:3000/gatemock?paper=gate-cs-2008. The existing historical-paper framework supplies the timer, question palette, saved responses, review markers, calculator, refresh/resume, submission, scoring, review and downloads. No book record was edited. This task only processed the selected year-wise source PDF.

## Source identity and coverage

Selected source: `D:\Gate PYQs Year Wise - PDFs\2008.pdf`.

SHA-256: `f01fcd02a9a5544d1f89959eca288fe967bb537ed00513b46e5fe8f9f97f7202`. The same value is stored in the imported document's `sourceSha256`; the physical filename `2008.pdf` is retained in `public/Year Papers/GATE CS 2008/`.

The scanned header reads **2008, MAIN PAPER - CS, CS: COMPUTER SCIENCE AND ENGINEERING**, three hours, maximum marks 150. There is no set/session designation or filename/header conflict. All 18 supplied pages were visually read. The scan ends with Q85 and END OF THE QUESTION PAPER on printed page 18/24. The header mentions 24 printed pages including rough work; the last six leaves are absent. All question numbers 1-85 are present, with no question borrowed from another paper.

| Navigation block | Original positions | Count | Marks |
| --- | --- | ---: | ---: |
| One-mark | 1-20 | 20 | 20 |
| Two-mark | 21-70 | 50 | 100 |
| Common data | 71-73 and 74-75 | 5 | 10 |
| Linked pairs | 76-77, 78-79, 80-81, 82-83, 84-85 | 10 | 20 |
| Total | 1-85 | 85 | 150 |

All are single-choice objective questions. There is no General Aptitude, written section or optional choice in this paper. Q21's historical numerical-method topic is retained. Shared passages, diagrams and programs are repeated where needed for independent question pages.

The scan's page-1 rules specify -0.25 for wrong Q1-20, -0.5 for wrong Q21-75 and first members of linked pairs, and no penalty for second members Q77,79,81,83,85. Unattempted answers earn zero. Unlike the preceding year's scan, this scan explicitly says a linked second answer is not evaluated if the first is wrong or unattempted. Server scoring uses those rules. Pending self-assessment of disputed Q76 leaves Q77 pending; full credit unlocks it and partial credit makes it ineligible. This handling of disputed prerequisites is disclosed as a practice policy.

## Read-only baseline and isolated copies

`scripts/inspect-gate-2008.mjs 2008` saved read-only EJSON snapshots of `chapters`, `yearpapers` and `mockattempts` before any database writes. The snapshot directory is ignored `data/backups/gate-2008/`; its deterministic hashes use BSON EJSON with documents sorted by `_id` and preserve embedded question order.

| Original book measure | Before | After |
| --- | --- | --- |
| Chapter documents | 52 | 52 |
| Embedded question records | 2,654 | 2,654 |
| Eligible nonblank mock questions | 2,647 | 2,647 |
| SHA-256 | `cb64756a0e7afa184f98d08d3d850bebdac1cf68e764f9b99c8f647639373a4f` | `cb64756a0e7afa184f98d08d3d850bebdac1cf68e764f9b99c8f647639373a4f` |

The eight baseline papers (CS 2000-2006 and IT 2004) and six existing attempts compare unchanged. Other chats added further papers concurrently; this task did not edit them. The final check confirms exactly one 2008 dataset and equality between its persisted content and `data/papers/gate-cs-2008.json`.

The import searches all 2,654 records, not only the 167 tagged 2008. There are **79 copied positions and six added transcriptions**: Q9,15,21,22,23,54. The complete mapping and field-by-field copy corrections are in `content-audit.json`; `full-book-search.json` retains the top five full-content token candidates for every source position. Missing positions were also searched by distinctive words across all years. No cross-year candidate supplied a missing full question.

Similar stems alone were rejected as duplicates. For example, Q5 has a similar 2012 Karnaugh question with a different map; Q62 has a different 2005 list-rearrangement program; Q66 has a similar 2012 fork question with different code. Q71 and Q73 share a passage but ask different questions. Q13 also exists with a 2016 tag and identical content, which may be a repeated examination question; it is not used to assert an incorrect year tag. Q58 has two semantically duplicated 2008 book records, one containing awkward math punctuation; the complete Made Easy copy was selected once. Neither duplicate nor original was changed.

Each paper question has a new ID/key, dataset ID, source page, original label, and copied-record ID/chapter/book label/hash when applicable. All five actual diagram crops come from this exact selected scan and reside in the paper's own asset directory. Six transition tables in Q49, the Q5 Karnaugh map, other mathematics and all programs remain editable. Diagram bytes are also published through the existing immutable `yearpaperassets` infrastructure; question content remains exclusively in `yearpapers`. Subject/topic/weighted mocks exclude the dataset copies.

Material restorations include Q3's equations and literal D; Q6's radix and >2 option; Q25's **24x²**, rather than the book's 4x²; Q35's original statement combinations; Q49's exact tables; Q51's E-H/P-S labels; Q53's b^m rather than b^n; ARR rather than APR in Q71-73; the zero-initialization line in Q74; R6 rather than R6x in Q77; literal 16 rather than the book's corrected 13 in Q79; X with W+1 columns in Q80-81; and <= rather than < in Q85 option C.

## Answers and evidence

All **85/85** positions have authored worked references, with final option order checked. These references are not called official answers. An official GATE 2008 key was not authenticated; searches of official IIT/IISc sources did not establish one.

Fifteen supplied Made Easy key entries were directly inspected visually:

| Source key PDF | PDF page | Book items | Source questions |
| --- | ---: | --- | --- |
| Digital Logic.pdf | 1 | 1.39 A, 1.40 C, 1.42 A | 5,8,26 |
| Digital Logic.pdf | 4 | 4.31 D, 4.32 D | 4,6 |
| COA.pdf | 1 | 1.24 D | 34 |
| COA.pdf | 2 | 2.20 C, 2.21 C | 33,37 |
| COA.pdf | 3 | 3.18 D, 3.19 A, 3.20 D | 36,76,77 |
| Algorithms.pdf | 3 | 1.30 D, 1.31 B, 1.32 B, 1.33 C | 39,40,74,75 |

The key files are under `C:\Users\Prince\Desktop\MadeEasy PYQ PDF\All Subject Solutions Keys`. Each paper record retains the file/page/item/printed letter. Stored book provenance is separately labeled; it is not promoted to a directly inspected or official key.

GATE Overflow discussions were individually read through the web tool for Q3,8,21,23,34,35,36,37,38,41,43,45,47,50,54,71,73,74,76,79,85. Each record stores its actual mapped URL and whether the discussion was read or only located in the local reference cache. Bulk direct HTTP retrieval returned 403 for all 85, recorded in `reference-fetch.json`; no claim is made that those failed fetches supplied answers. The reference project's local cache supplied valid question-to-discussion mappings for all positions.

Independent executable checks cover the Q3 determinant, Q26 Boolean truth table, Q45 Dijkstra versus Bellman-Ford, all four Q52 NFA/regex languages for every binary word of length 0-9, Q75 recurrence, Q79 enumeration of all 32 strings, and Q85's failed singleton repair. The graph simulation verifies D at Q45 despite its negative edges. Source-specific unit assertions also protect option order and restored formulas.

## Manual-review policy and limitations

Fourteen questions, totaling 27 marks, are explicitly excluded from definite automatic grading. They remain MCQs in the test and have references and post-submission self-assessment. No scan choices are silently repaired to create an answer.

| Question | Reference and reason |
| --- | --- |
| 3 | Unique solution requires alpha != 5; none of the literal choices states this. |
| 21 | Conventional A uses a sufficient trapezoidal error bound; actual integer minimum is not literally 1000e. |
| 34 | Made Easy/GO conventional D uses architecture-dependent trap/RFE terminology and atomicity assumptions. |
| 36 | Authored/GO B contradicts Made Easy's printed D; register renaming removes register WAR hazards. |
| 37 | Made Easy C, GO A, and broader register-window I/II interpretations conflict; no I-and-II choice. |
| 38 | Conventional C assumes ordinary effective-address calculation; indirect translation can occur during it. |
| 43 | B is the intended tighter recurrence; C is also a looser valid inequality. Pivot-selection cost is unspecified. |
| 54 | A assumes escaping closures; literal returned functions can also be noncapturing or statically bound. |
| 64 | A assumes interrupt-driven I/O; the literal wording does not exclude polling. |
| 73 | C assumes write-allocate; no-write-allocate can give zero hits. |
| 74 | Conventional B prints Theta(2^n); exact recursive time is Theta(phi^n). |
| 76 | Conventional A depends on whether “fall-through path” includes the architectural delay slot. Q77 waits for assessment. |
| 79 | Exact result 13; source choices are 5,7,8,16. Linked Q78 prerequisite applies. |
| 85 | Conventional A fixes midpoint progress but still misses the final singleton because i<j exits too early. |

The nonmanual pool totals 123 marks; responding with every stored reference gives 121 automatic marks while Q77's two marks await Q76 assessment. Giving full practice credit to all manual items unlocks Q77 and yields 150. Self-assessment is bounded to the question's marks in half-mark steps and stored separately from responses. It is practice evaluation, not an authenticated official adjudication. Additional standard assumptions (successful forks, adequate N, intended historical C declarations, table alignment, conventional binary-tree terminology) are stated in the references rather than invented as official grading rules.

## Exports and verification

The existing LaTeX renderer produces `output/pdf/gate-cs-2008.dark.pdf` (85 landscape pages), `.print.pdf` (85 landscape pages), `.solutions.pdf` (14 portrait pages), and `.zip`. Both question versions contain exactly one question per page, in original order, with no answer-key content or links. The ZIP contains the exact dark question and worked-solution PDF bytes under paper-specific names. The four download routes are exposed beside the selected paper in `/gatemock`.

All 184 PDF pages were rendered. Contact sheets for both question themes and all solution pages were visually inspected; detailed diagram/code pages were inspected separately. Q52's four NFAs were enlarged during visual QA. Automated read-back checks find all 85 ordered headers, all 85 solution labels, zero text outside page bounds, no answer leaks and matching ZIP contents. The renderer reports no layout warnings.

The 2008 unit suite passes 6/6. The full regression suite passed 344/344 at the time run; nine sandbox-only temporary-file rename failures disappeared on the normal Windows runtime. Live API/browser checks verify all 85 screens with zero math, image or page errors, frozen active responses without answer keys, invalid tokens, stale revisions, save/resume, quarter-mark penalties, linked-credit rules, expiry, self-assessment and all four byte-identical downloads. Legacy 2000 written-response persistence and its server-enforced fifteen-question limit pass. Desktop/mobile layouts, calculator, review markers, autosave and submission were exercised.

A webpack production build succeeded (36 routes prerendered). An initial root build found another chat's active build lock, so a source/config snapshot was built at ignored `tmp/gate2008/build-workspace` without disturbing either shared server. It compiled in 28.1 seconds, completed static generation and tracing, and emitted only a multiple-lockfile workspace-root warning. A production instance of that snapshot on port 3008 supplies isolated final checks after concurrent logins filled port 3000's existing login rate limit. The paper itself remains available through the existing port 3000 server. The rate limit and authentication were not changed.

Reproduce with:

```powershell
node scripts/inspect-gate-2008.mjs 2008
python scripts/extract-gate-2008-assets.py
node scripts/build-gate-2008.mjs
node scripts/audit-gate-2008.mjs
node --test tests/gate-2008.test.mjs
node scripts/import-year-paper.mjs gate-cs-2008
node scripts/export-year-paper.mjs gate-cs-2008
python scripts/verify-gate-2008-pdfs.py
node scripts/verify-gate-2008.mjs
node scripts/verify-gate-2008-integrity.mjs
```

An already imported different copy requires `--update-copy`, which saves its EJSON backup before conditionally replacing only that paper. Reinspection refuses a changed book baseline. Secrets stay in environment configuration and are never included in reports.
