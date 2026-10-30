# GATE CS 2005 verification

Attempt: http://localhost:3000/gatemock?paper=gate-cs-2005

Selected source: `D:\Gate PYQs Year Wise - PDFs\2005.pdf`. The physical filename is unchanged. Its SHA-256 is `4444090943ce9093ca672ddc0aa981bf3fb09559ba0bd1bc7c1588a82d199724`, also stored verbatim in the MongoDB year-paper document's `sourceSha256` field.

The 12-page scan's header reads **GATE-2005, COMPUTER SCIENCE & ENGINEERING**. No session/set appears; the stored set is blank. All 12 source pages were rendered and inspected. Its structure is 30 one-mark MCQs, 50 ordinary two-mark MCQs, and five linked two-part MCQs numbered 81(a)-85(b). This gives 85 top-level numbers, 90 answer positions and 150 marks. Sequential navigation numbers 1-90 are stored separately from the source labels. There is no General Aptitude, written section or optional-question limit in this paper. Common statements are repeated on each independent question page.

## Timing and marking evidence

The selected scan does not include its instruction leaf. The application explicitly identifies its settings as historical **practice** settings: 180 minutes; a wrong one-mark response loses 0.25 mark; a wrong ordinary two-mark response or linked part (a) loses 0.5 mark. Linked part (b) has no negative marks and can earn marks only when part (a) is correct. These settings are corroborated by the archived instruction-page reproduction indexed at https://www.onestopgate.com/downloads/computer-science/cs2005.pdf and its surviving reproduction at https://www.studocu.com/in/document/tripura-university/computer-science/gate-2005-computer-science-assignment/32447373. The first URL no longer fetched directly during verification. Neither reproduction is represented as an authenticated official rulebook. The UI and question exports disclose this limitation.

## Content and original-data protection

The current MongoDB book was searched first, across all 2,654 question records rather than relying on the 176 records tagged 2005. Full-content candidate comparisons are saved in ignored `data/backups/gate-2005/full-book-search.json`. Duplicate candidates at source positions 26, 34, 63, 73 and 74 were inspected and only one independent copy per position was used. ADT question 2 matched a book record incorrectly tagged 2004; its book record was not retagged.

There are **82 unique book copies and 8 new transcriptions**. New positions are 3, 4, 11, 51, 52, 58, 82(a) and 82(b). Every question has an independent ID/key and source PDF page mapping. Each copied record retains the source book chapter/question ID, original metadata identity and record checksum in its provenance. Thirteen referenced diagram files belong to `public/Year Papers/GATE CS 2005/`; their verified content-addressed manifest is published independently in `yearpaperassets`.

Read-only EJSON snapshots were saved before writes for the 52 book documents, six completed paper documents and six pre-existing attempts. Their counts and deterministic hashes are recorded in `data/backups/gate-2005/snapshot-report.json`. The initial and final book hashes are identical:

`cb64756a0e7afa184f98d08d3d850bebdac1cf68e764f9b99c8f647639373a4f`

The final integrity check confirms all 2,654 book records, all six previous papers and all six pre-existing attempts are unchanged; exactly one 2005 dataset exists and its persisted content equals the on-disk JSON. A final copy repair saved a separate EJSON backup before conditionally replacing that paper document. Verification creates and deletes only its own new test attempts.

The `/gateyearpaperpdf` tracker derives completion from the matching SHA and actual 90-question/150-mark dataset. Its result is `Verified in DB · 90/90 questions`; no tracker flag was written.

## Answers and source defects

All 90 positions have independently authored worked references. These are not official solutions. Twenty-five entries were cross-checked against directly viewed pages in the supplied Made Easy solution keys. Nineteen relevant GATE Overflow discussions were read using web retrieval. Every position retains its actual cached discussion URL; cache-only question mappings are explicitly distinguished from discussions individually reviewed. No authenticated official 2005 key was located in the examined resources.

Independent checks include the recursive digit trace, logic-circuit truth table, selected linear-system determinant (-70), Bayes probability (4/19), heap insertion, number representation and exhaustive enumeration of all 512 scheduling subsets. The scheduling optimum is 147 with one feasible optimal subset; equal profits of T4 and T5 do not allow exchanging their different deadlines.

Seven positions, worth **13 marks**, require post-submission self-assessment. The other **137 marks** are automatically assessed. Disputed responses are never silently counted as definitely correct or wrong, and self-assessed marks remain separate from automatic scores.

| Source position | Issue and review policy |
| --- | --- |
| 14 | The grammar is both ambiguous and left-recursive. A/B disagreement remains visible. |
| 36 | The scan prints undefined `z` in C, where the conventional formula requires `n`; D omits `+1`. Literal scan retained. |
| 55 | The separator in the second language is malformed. The reference explains the conventional reading; literal source retained. |
| 61 | Historical C treats `fro(...)` as a function call; the supplied key says C, the independent/reference answer is A, and modern C diagnoses an undeclared function. |
| 68 | The intended eight-cycle result assumes forwarding that the scan does not explicitly specify. |
| 70 | The listed 25% key approximates 26.2144% with binary KB (25.6% with decimal KB). |
| 72 | Virtual-address reasoning gives C, while the supplied key gives D; `%d` for an address is also nonportable. |

Additional source-copy differences are retained in per-question issue metadata. In particular, Q50 has five source options and the final key is C (`i+1`), not the book's four-option B. Source 82(a) contains a blank A and shifts its MST choice to B, with a fifth E; all five slots survive. Q19's supplied B is resolved to C by the independent daisy-chain argument and discussion. Source Q33's 9, Q35's 42, Q48's signs, Q60's repeated equality distractor, Q66's list labels, Q68's instruction, Q71's duplicated distractor, Q76's missing distractor and Q77's incomplete book stem were repaired only in the independent copies. Source 85(b)'s C is `49 D0`, not the book's `4D D0`.

The references also state ordinary modeling assumptions, including nontrivial graph size in Q6, modern inclusion of subnet-zero in Q27, decimal KB in Q69 and shifting the already truncated field in 85(b).

## Exports

The existing landscape LaTeX renderer produced:

- `output/pdf/gate-cs-2005.dark.pdf`: 90 pages, one question per page.
- `output/pdf/gate-cs-2005.print.pdf`: 90 pages, one question per page.
- `output/pdf/gate-cs-2005.solutions.pdf`: 12 pages, all 90 answer entries and worked references, including source notes.
- `output/pdf/gate-cs-2005.zip`: dark question paper and separate solutions.

All 192 PDF pages were rendered, with contact sheets and selected full-page inspection. Readback checks verify original order, linked labels, the fifth option, all 90 answer entries, page counts and word bounds. No out-of-page text or answer leakage was detected. PDF download bytes and both ZIP member contents match the local outputs. The selected paper exposes all four downloads in `/gatemock`.

## Validation

- `node --test tests/*.test.mjs`: **312 passed, zero failed** with normal Windows temporary-file/symlink permissions. The restricted sandbox initially produced EPERM in nine unrelated PDF-storage tests; rerunning with normal access passed all of them.
- `npm run build -- --webpack`: **passed** using the installed Next.js 16.3.2 supported Webpack bundler. Relevant installed route-handler and CLI guides were read before framework changes.
- ESLint on all modified framework files: **passed**.
- `scripts/verify-gate-2005.mjs`: API and browser verification **passed**. It checks all 90 math-rendered questions and loaded diagrams; five source options; active answer secrecy; token authorization; autosave, stale revisions and refresh/resume; review markers; calculator; submission; 137 automatic marks and saved self-assessment; immutable submitted responses; zero-penalty/prerequisite linked scoring; automatic expiry; and all downloads.
- Existing 2002 written responses and its 15-question server-enforced optional limit: **passed** as a regression check. This 2005 paper itself contains neither written questions nor optional choices.
- Final database/tracker integrity: **passed**, including unchanged book, earlier papers and attempts.

Detailed machine-readable evidence is in ignored `data/backups/gate-2005/`; rendered PDFs and browser screenshots are in `tmp/gate2005/`. No original book or earlier year-paper record was edited.

Reproduction: `node scripts/inspect-gate-2005.mjs 2005`, `python scripts/extract-gate-2005-assets.py`, `node scripts/build-gate-2005.mjs`, `node scripts/audit-gate-2005.mjs`, `node scripts/import-year-paper.mjs gate-cs-2005`, `node scripts/export-year-paper.mjs gate-cs-2005`, `python scripts/verify-gate-2005-pdfs.py`, `node scripts/verify-gate-2005.mjs`, `node scripts/verify-gate-2005-integrity.mjs`. Existing changed copies are refused by default; `--update-copy` creates a backup and replaces only the selected year-paper copy.
