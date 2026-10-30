# GATE CS 2006 verification

Attempt: http://localhost:3000/gatemock?paper=gate-cs-2006

Source: `D:\Gate PYQs Year Wise - PDFs\2006.pdf`. Physical filename unchanged. Exact SHA-256: `8155cf736514df6a162efa0f458ae7484a98a54c54bf3f370769424f34162f36`; also stored in `sourceSha256`. All 13 pages were read and rendered. Header: **GATE-2006 / COMPUTER SCIENCE & ENGINEERING**, no set/session label. No identity discrepancy.

| Block | Original positions | Marks |
| --- | --- | --- |
| One-mark MCQs | 1-20 | 20 |
| Two-mark MCQs | 21-70 | 100 |
| Common data | 71-75 | 10 |
| Five linked pairs | 76-85 | 20 |

85 MCQs, 150 marks, no optional questions, written questions or General Aptitude. Shared passages are repeated. Original and navigation numbering agree.

The 180-minute timer is corroborated by [GATE Overflow's original-paper catalog](https://gateoverflow.in/exam/55/gate-cse-2006-original-paper). The selected scan omits its instructions leaf. No authenticated official CS grading instructions were located. The UI and exports explicitly disclose **practice rules**: a 25% wrong-answer penalty (0.25/0.5 mark); no penalty on linked second answers; second-answer credit requires a correct first answer. These are not claimed as verified official grading.

## Coverage and protection

All 2,654 current MongoDB book questions were searched before creating the paper; matching used full content, not year tags. **80 copied, 5 transcribed** (Q16,18,24,31,56). Additional duplicate/close candidates were found at Q32,44,74,75,82,83. Other 2006 content, including historical IT questions sharing the year tag, was excluded. Candidate rankings and copy-only corrections are in ignored `data/backups/gate-2006/full-book-search.json` and `content-audit.json`.

Every copy has an independent ID/key, source chapter/question provenance and source-record digest. Assets are in `public/Year Papers/GATE CS 2006/`, with 11 validated manifest files and immutable uploaded image blobs; the exact `2006.pdf` is retained there too. New attempts freeze image hashes and use the diagram API, so papers imported after server startup still display diagrams. Legacy attempts retain existing paths.

Read-only snapshots are in `data/backups/gate-2006/`: `chapters-before.ejson`, `yearpapers-before.ejson`, `mockattempts-before.ejson`. Repairs back up the previous 2006 document before replacement. Deterministic checksums use sorted documents serialized as BSON EJSON.

- **52 book documents / 2,654 questions unchanged**; before and after SHA-256: `cb64756a0e7afa184f98d08d3d850bebdac1cf68e764f9b99c8f647639373a4f`.
- Seven existing papers unchanged: CS 2000-2005 and IT 2004.
- Six pre-existing attempts unchanged; only temporary verification attempts removed.
- Exactly one 2006 dataset in `yearpapers`, persisted content identical to disk JSON.
- Tracker completion derives from actual data and exact source hash: **85/85 questions, 150/150 marks**. No completion flag was written.

## Answers and review policy

**85/85 authored worked references**, clearly distinguished from official keys. All 85 question-discussion mappings come from the reference project's local cache. **16 supplied Made Easy key entries were directly visually read**, on Algorithms PDF pages 3 and 7 and Digital Logic pages 1-3. **22 GATE Overflow discussions were consulted**. Retained book answer provenance is separately labeled, not claimed as a fresh visual check. Remaining answers were independently derived; numerical/program traces have executable checks. Not all 85 answers are externally keyed or officially verified.

Automatic maximum: **126 marks**. **13 items / 24 marks** require explicit post-submission self-assessment:

| Q | Defect or disagreement |
| --- | --- |
| 13 | Literal right-child index `2i-1` collides with the root. Conventional D requires `2i+1`. Source option D `2^n-1` is restored in the copy. |
| 18 | Empty samples have no defined minimum; conventional n needs a zero-on-empty rule. |
| 24 | Arbitrary subsets can be empty; conventional C requires nonempty subsets. |
| 36 | Overprinted formulas retained as a source facsimile; carry-generation solution/conventional A are separate. |
| 38 | Source D omits a cube included in the corrected online version; none of the selected source covers meets the requirement. Made Easy prints an asterisk. |
| 39 | Grouped source complement differs from the correct separate sign complements. Separate supplied key prints C; book/discussion favor B. |
| 63 | Conventional A is supported by book/discussion, but efficient support and removal of virtual memory admit differing interpretations. |
| 66 | Source uses max where the necessary progress condition needs min. |
| 69 | Universal plan-runtime claim needs unstated cost/materialization assumptions. Conventional C is retained as a reference. |
| 70 | Both C and D are false in a source MCQ; it is not silently converted to MSQ. |
| 79 | Conceptual barrier repair B leaves identification of the first new-generation process unspecified. |
| 83 | One broadcast ping does not populate all host entries. Conventional A assumes a fully learned table. |
| 85 | Source duplicates the correct `max(l,m)+2` expression at A and D; both are retained. |

Q12 is a resolved printed-key error: a queue (A) supports linear-time unweighted traversal, despite Made Easy C. Its proof and disagreement are shown in review. Original book answers remain untouched.

## Outputs and tests

Files in `output/pdf/`: `gate-cs-2006.dark.pdf` (85 pages), `gate-cs-2006.print.pdf` (85), `gate-cs-2006.solutions.pdf` (12), and `gate-cs-2006.zip` (matching dark paper and solutions). All 182 pages were rasterized; sequence, all 85 answer entries and text bounds checked. Contact sheets and detailed diagram/long-question pages were visually inspected. Damaged source formulas remain disclosed; Q83 uses 11-point text to fit its complete passage, diagram and tables on one page. Question PDFs contain no answers or solution links.

- **317 tests pass, zero failures** (`npm test`). An earlier sandbox run blocked nine temporary-file rename/symlink tests; rerunning with normal filesystem permissions passed.
- **Production build passed**, `npm run build -- --webpack`, Next.js 16.3.2. Project serves on port 3000.
- **API/browser verification passed** (`scripts/verify-gate-2006.mjs`): all 85 screens, exact expected image counts, no diagram placeholders/math/page errors; active answer secrecy; autosave/resume; revision conflicts; expiry; review markers; calculator; frozen submission; penalties; linked gating; bounded self-assessment; four matching downloads. Existing 2000 written responses and server-enforced 15-response limits also pass.
- **PDF verification passed** (`scripts/verify-gate-2006-pdfs.py`): 85+85+12 pages, every answer entry, zero out-of-page text, matching ZIP members.
- **Final integrity passed** (`scripts/verify-gate-2006-integrity.mjs`): unchanged book, prior papers and attempts; exact persisted copy; one dataset; derived tracker complete.

Reproduction: `node scripts/inspect-gate-2006.mjs 2006`, `python scripts/extract-gate-2006-assets.py`, `node scripts/build-gate-2006.mjs`, `node scripts/audit-gate-2006.mjs`, `node scripts/import-year-paper.mjs gate-cs-2006`, `node scripts/export-year-paper.mjs gate-cs-2006`. A changed existing copy requires `--update-copy`, which backs up and replaces only that paper.
