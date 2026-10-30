# GATE CS 2007 verification

Attempt: http://localhost:3000/gatemock?paper=gate-cs-2007

Selected source: `D:\Gate PYQs Year Wise - PDFs\2007.pdf`. The physical filename is unchanged. SHA-256 is `f3df0aaaf8a898ecd17380984636780d16d897a8d630463fdaab7f1d7187e463`, stored exactly in the year-paper document's `sourceSha256`. An identical copy is retained at `public/Year Papers/GATE CS 2007/2007.pdf`.

The selected header reads **2007 / CS: Computer Science and Engineering**. No set/session designation appears. There is no identity discrepancy. All 21 supplied pages were rendered and inspected, including the instructions and the end-of-question-paper marker at page 21. The header describes 24 printed pages including rough work; the supplied file ends after all 85 questions on printed page 21, without the remaining leaves.

| Navigation block | Original positions | Questions | Marks |
| --- | --- | --- | --- |
| One-mark questions | 1-20 | 20 | 20 |
| Two-mark questions | 21-70 | 50 | 100 |
| Common data | 71-75 | 5 | 10 |
| Five linked pairs | 76-85 | 10 | 20 |

**85 MCQs, 150 marks, 180 minutes**, all compulsory. No General Aptitude, descriptive questions, NATs, MSQs or optional-question limits belong to this selected source. Original displayed and navigation numbers agree. Shared passages, original option order, editable tables/math/code and all source diagrams are retained.

Source instructions on page 1 document negative marks: 0.25 for wrong Q1-20; 0.5 for wrong Q21-76,78,80,82,84; zero for wrong Q77,79,81,83,85 and for unattempted questions. The digital MCQ interface accepts one option only.

The scan labels the five pairs as linked answers but does not explicitly state conditional-credit scoring. The existing framework's rule that a second answer earns credit only after a correct first is **disclosed as a practice dependency policy**, in the app instructions and exports, rather than asserted as authenticated official grading. Q81 remains pending until its manually reviewed Q80 prerequisite is fully credited.

## Source search and independent storage

All **2,654 current book records** were searched before database import. Full content and source diagrams were compared, rather than relying on year tags. The 165 year-tagged candidates contain additional IT questions and duplicates, which were excluded. Candidate rankings across the complete book are saved in ignored `data/backups/gate-2007/full-book-search.json`.

**82 book copies and 3 new source transcriptions** (Q21,25,28) make the final 85-position paper. Close/duplicate candidates include Q9,19,20,65,66,68,69,71,72. Every copied record has an independent ID/key, original chapter/question identity, book label where available and a source-record digest. All seven diagram files are in this paper's own directory, freshly cropped from the exact selected source; the framework publishes their immutable image hashes for new attempt snapshots.

Copy-only corrections include Q5 option B/C order; Q12 option A's minus one; Q16 group labels; Q20's stray digit; Q31 positive closure rather than the book's stars; Q32's full P-Q-R-S statements and combination choices; Q33's XNOR expression; Q46's identifier capitalization; Q49's missing edge; Q66's C/D order; complete shared instruction tables and source grammar columns; and the six-symbol Huffman passage/options at Q76-77. In particular, the selected source has a-f and average length **1.9375**, whereas the book variant omits f and gives 1.781. Neither variant is silently substituted for the other. Detailed provenance and corrections are in `content-audit.json`.

Only `yearpapers` stores the paper questions. Diagram blobs use the framework's immutable asset collection. No original Chapter, target, book question or book asset was modified. Book-based subject/topic/weighted mocks continue to exclude all dataset copies.

## Answers and review policy

**85/85 positions have authored worked reference solutions**, clearly labeled as authored rather than official. All 85 question-discussion mappings were checked against the reference project's local cache. **19 supplied Made Easy key entries** were directly read on Algorithms PDF pages 3 and 7, Digital Logic pages 1-3, and COA pages 1 and 3. **15 GATE Overflow discussions** were consulted: Q15,21,25,28,31,32,33,40,44,54,58,62,67,69,79. Other retained book answer provenance and cache-only mappings are labeled separately; no fresh external or official verification is claimed for them. Q28's discussion has no posted worked answer, so its convergence proof is authored.

The references include independently executable checks of Boolean tables/XNOR, recursive code, condition-test counts, SRT scheduling, CRC division, cache passes, grammar parse counts, optimal/LRU paging, Huffman expectation and robot-path enumeration. They establish the stated references, not an official answer key.

**12 positions / 22 marks require post-submission self-assessment. Automatic maximum: 128 marks.**

| Q | Conventional reference and reason for manual review |
| --- | --- |
| 4 | B assumes no added isolated vertices; literal minimum-edge nonplanarity does not fix vertex count. |
| 15 | D counts successful loop tests; including the exit comparison gives floor(log2(n))+2, absent from the options. |
| 40 | B assumes linear probing; closed hashing alone does not specify the probe sequence. |
| 44 | A is a worst-case Euclidean bound; no worst-case or positive-divisor qualifier is printed. |
| 51 | B describes intended primality pseudocode; the source's old-style declaration redeclares n and is invalid modern C. |
| 54 | B uses direct basic-block translation; algebraic reassociation of the final expression permits A. Optimization scope is unspecified. |
| 61 | A assumes non-NULL salaries; the question says arbitrary employee table without a NOT NULL constraint. |
| 62 | D uses conventional nonempty determinants/proper transitive-dependency terminology; empty determinants provide a counterexample to A. |
| 67 | C uses legacy excluded subnet IDs; the all-subnet convention's 64/1022 result is absent. |
| 69 | C counts labels for a full sender window; go-back-N/reliability and selective-repeat assumptions give different sequence-space requirements. |
| 80 | C assumes two identical sequential byte-address traversals; array traversal order is not explicit. |
| 81 | A inherits Q80's traversal assumption and requires a fully credited Q80 prerequisite. |

Manual outcomes are not automatically called correct/wrong. Self-assessed marks are stored separately from frozen responses and validated on the server. All original source defects remain visible and explained.

## Data protection

Read-only BSON EJSON snapshots, saved before database writes, are in `data/backups/gate-2007/`: `chapters-before.ejson`, `yearpapers-before.ejson`, `mockattempts-before.ejson`. Documents are sorted by `_id` before deterministic EJSON hashing. The final source-column-order repair saved a read-only backup of the earlier 2007 copy before replacement.

- **52 book documents / 2,654 questions unchanged**. Before/after SHA-256: `cb64756a0e7afa184f98d08d3d850bebdac1cf68e764f9b99c8f647639373a4f`.
- Eight pre-existing year papers unchanged: CS 2000-2006 and IT 2004.
- All six pre-existing attempts unchanged. Live verification removed only its own temporary attempts.
- Exactly one `gate-cs-2007` document; persisted content equals the checked JSON.
- Completion is derived by the tracker from the actual dataset and exact selected source hash: **85/85 questions, 150/150 marks**. No tracker flag was written.

## Exports and verification

Final files in `output/pdf/`:

- `gate-cs-2007.dark.pdf`: 85 pages, one question per page.
- `gate-cs-2007.print.pdf`: 85 pages, one question per page.
- `gate-cs-2007.solutions.pdf`: 13 pages, all 85 keys and worked references, provenance and disputed-item notes.
- `gate-cs-2007.zip`: the matching dark question paper and separate solutions PDF.

All four downloads are exposed beside the selected paper in `/gatemock`. Question PDFs do not contain answers, worked solutions or solution links. All **183 pages** were rasterized; every ordered question header, answer entry/letter and text bounds were checked. Both complete question contact-sheet series, the solution sheets, detailed diagram/code/common-data pages and the final Q78-79 production layout were visually inspected.

- `npm test`: **324 tests passed, zero failures**. The seven 2007 tests also passed after the final source-column-order correction.
- `npm run build -- --webpack`: **passed**, Next.js 16.3.2; all routes compiled. The supported Webpack bundler was used.
- `node scripts/verify-gate-2007.mjs`: **API and browser passed**, including all 85 screens, math/images, answer secrecy, valid/invalid responses, autosave/resume and revision conflicts, review markers, calculator, expiry, submission/frozen answers, documented penalties, linked gating, manual-prerequisite enforcement and bounded self-assessment. The older CS 2000 descriptive responses and server-enforced 15-response choice limits also passed. Four HTTP downloads matched the final local files/ZIP members. Desktop and mobile screens were inspected.
- `python scripts/verify-gate-2007-pdfs.py`: **85 + 85 + 13 pages**, all 85 answer entries/letters, zero text-bound issues, matching archive members.
- `node scripts/verify-gate-2007-integrity.mjs`: **passed** for book, prior papers, pre-existing attempts, selected source copy, single dataset, persisted JSON and derived tracker completion.

Reproduction: `node scripts/inspect-gate-2007.mjs 2007`, `python scripts/extract-gate-2007-assets.py`, `node scripts/build-gate-2007.mjs`, `node scripts/audit-gate-2007.mjs`, `node scripts/import-year-paper.mjs gate-cs-2007`, `node scripts/export-year-paper.mjs gate-cs-2007`. A differing existing copy requires `--update-copy`, which backs it up and conditionally replaces only this paper.

Limitations: no authenticated official answer key was supplied; only the stated subset of external keys/discussions was directly reviewed. Source defects and unstated conventions are retained under the explicit self-assessment policy. Conditional linked credit is a disclosed practice rule; the selected scan directly verifies duration, question counts, marks and negative penalties.
