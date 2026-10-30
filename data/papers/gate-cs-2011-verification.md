# GATE CS 2011 verification

Attempt: <http://localhost:3000/gatemock?paper=gate-cs-2011>. Exactly one `gate-cs-2011` dataset is stored in MongoDB `yearpapers`. The production app is running on local port 3000.

## Selected source and identity

- Exact selected source: `D:\Gate PYQs Year Wise - PDFs\2011.pdf`.
- SHA-256: `d84d37b374ed77906a34c410f7fba96af7127808b7697466a0183aa4f82b3acc`. Computed from the selected bytes, checked against the requested hash, and stored in `sourceSha256` and per-question provenance.
- Header: **2011, CS: Computer Science & Information Technology, Question Booklet Code A**. The booklet code denotes this option/question permutation, not an additional examination session. Set/session remains blank. No filename/year/paper-code discrepancy was found.
- The physical filename remains `2011.pdf`, including the independent copy in `public/Year Papers/GATE CS 2011/`.
- All 17 selected pages were visually read. The cover states 20 pages including rough-work leaves; this file ends on printed page 17 with Q65 and the end-of-paper marker. All 65 question positions are present; the absent final three leaves contain no missing questions. No other year-wise question PDF was processed or appended.
- 65 single-choice MCQs, 100 marks, 180 minutes. No optional questions, section-choice limits, descriptive questions, NATs or MSQs occur in this paper.

| Original positions | Navigation block | Count | Marks |
| --- | --- | ---: | ---: |
| Q1-25 | One-mark technical | 25 | 25 |
| Q26-47 | Two-mark technical | 22 | 44 |
| Q48-51 | Common data: two pairs | 4 | 8 |
| Q52-55 | Linked answer pairs | 4 | 8 |
| Q56-65 | General Aptitude | 10 | 15 |

The five blocks are navigation subdivisions; aptitude remains in its original final position. Q56-60 are one mark each and Q61-65 two marks each.

Source page 1 explicitly specifies wrong-answer deductions of one-third mark for Q1-25/Q56-60, and two-thirds mark for Q26-52/Q54/Q61-65. Q53 and Q55 have no negative marking. Unattempted answers earn zero. Q53 is evaluated only when Q52 is correct; Q55 only when Q54 is correct. The existing server enforces these prerequisites and zero second-answer penalties. No historical grading rule needed to be invented.

## Book search and independent reconstruction

Before database writes, read-only EJSON snapshots were saved for `chapters`, `yearpapers` and `mockattempts` in ignored `data/backups/gate-2011/`. Counts and deterministic BSON EJSON SHA-256 values are recorded in `snapshot-report.json`.

The read-only search covered all **2,654 questions across 52 chapter documents**, including 51 records tagged 2011. Matching used question text, code, option order and diagrams, not year tags alone. Per-question similarity candidates from the entire book are saved in `full-book-search.json`. Shared passages at Q52/Q53 are intentionally similar but have distinct final prompts and source records; no duplicate position was imported.

The new dataset contains **47 independent book copies and 18 additions**. Added positions are Q5, Q7-10, Q37, Q39, Q47 and Q56-65. They include the complete historical software-development, HTML, SRS and black-box-testing material. Tables and code are editable. Three source matches were incorrectly tagged 2010 in the book: the SOP simplification (Q14), K4/Q3 planarity (Q17) and expectation/variance question (Q18). Only the independent copies receive 2011 identity and source marks.

Seven 2011-tagged book entries are absent from this CS source and were excluded: recursive-language classification, SAN-switch bandwidth, bit-error rate, octet Hamming distance, video-terminal bit rate, IP-to-MAC protocol and gigabit Ethernet encoding. Their original records are preserved.

Every copy has an independent `gate-cs-2011-qNN` ID and `yearpaper:gate-cs-2011:N` key. `source.copiedFrom` records the original chapter/question ID, year, subject/chapter, book label where available, and deterministic source-record checksum. Twenty-four diagram crops come directly from this selected scan into its own paper directory. Immutable hash-addressed assets are published using the existing paper-assets mechanism so frozen attempts do not depend on original book diagrams.

Material source restorations, confined to paper copies:

| Position | Restoration / preserved source issue |
| --- | --- |
| Q3 | One mark in the selected source, unlike the book's two-mark metadata. |
| Q4 | Restored the omitted final protocol question sentence. |
| Q14 | Restored the selected option-A barred literals, retaining source option order. |
| Q17 | Preserved the literal source option-C typo K3; the book says K4. Both specified graphs K4 and Q3 are planar. |
| Q22 | Source option D is `011`, not book `11`. The scan literally begins `Char c[]`, an undefined type without a typedef; this source defect is preserved and self-assessed. |
| Q25 | Restored source final Max bound `L_(n-1)` from book `L_(n+1)`. Explained the contiguous-run wording and unstated traversal order in the reference. |
| Q28 | Restored the complete device-to-memory clause, full speedup question and `count` spelling; the book truncates the prompt and prints `court`. |
| Q47 | Included the entire original C function comment and all six input/expected-output test rows. |
| Q48-55 | Restored original common/linked labels and repeated the complete relevant passage and diagram on each question. |
| Q52-53 | Restored source N5 distance-vector label from the book's B5, without duplicating Q52's prompt inside Q53. |

`content-audit.json` and the tracked paper JSON retain per-position source pages, changes and issues.

## Answer verification and review policy

**65/65 positions have independently authored worked references** matched to the final source option order. They are explanations authored for this reconstruction, not represented as official worked solutions.

All 65 conventional choices were compared with the booklet-A column of the two-page [historical key mirror](https://gatecse.in/w/images/2/27/Key2011.pdf). Both key pages were visually inspected and all entries independently read back from the downloaded PDF. The mirror hash is `5d950cdf0382b821a0881a4a7880df118421a3917c714d3af9c6318fffb10373`. Its original issuing host was not authenticated; the data explicitly marks this as a non-authenticated historical mirror rather than an authenticated official key. The selected question paper's own printed rules remain the authority for grading rules.

Fifteen entries were directly and visually checked in the supplied Made Easy solution-key PDFs, rooted at `C:\Users\Prince\Desktop\MadeEasy PYQ PDF\All Subject Solutions Keys`:

| Key PDF | PDF page | Printed items | Paper positions |
| --- | ---: | --- | --- |
| Digital Logic.pdf | 1 | 1.48 D; 1.46 B | Q13, Q14 |
| Digital Logic.pdf | 3 | 3.23 A; 3.24 D; 3.25 B | Q15, Q50, Q51 |
| COA.pdf | 1 | 1.26 D; 1.27 D | Q21, Q36 |
| COA.pdf | 3 | 3.23 B | Q41 |
| COA.pdf | 5 | 5.25 A; 5.24 B | Q28, Q44 |
| Algorithms.pdf | 5 | 2.27 B; 2.26 C | Q29, Q38 |
| Algorithms.pdf | 7 | 3.41 B; 3.42 B; 3.43 C | Q23, Q54, Q55 |

Five discussion pages were directly reviewed through accessible web content: [Q2](https://gateoverflow.in/2104/gate-cse-2011-question-2), [Q42](https://gateoverflow.in/2144/gate-cse-2011-question-42), [Q59](https://gateoverflow.in/2169/gate-cse-2011-question-59), [Q60](https://gateoverflow.in/2170/gate-cse-2011-question-60), [Q62](https://gateoverflow.in/2172/gate-cse-2011-question-62). The finder project's local cache supplied all 65 exact discussion mappings. Direct automated fetches returned HTTP 403 for all 65; the remaining 60 links are explicitly cache-only mappings, not claims of individual discussion verification. Stored book-key provenance is retained separately from new direct key checks.

The following five positions, worth six marks, are excluded from definite automatic correct/wrong grading:

| Position | Conventional reference | Reason / review policy |
| --- | --- | --- |
| Q2 | D | Stored Made Easy book key A conflicts with the historical mirror and discussion D; the conventional HTTP-port assumption is also unstated. |
| Q22 | C under intended `char` reading | Literal scan starts with undefined `Char`. Preserve it, explain the intended pointer trace, and self-assess. |
| Q59 | B | Restrained is conventional; discussion participants challenge it against indifferent. |
| Q60 | D | Separate is conventional, but split is also a plausible antonym. |
| Q62 | D | Inverse plotted dose selects S, while a literal direct-proportional reading selects P. Preserve the entire graph and disclose the competing readings. |

The definite automatic maximum is **94 marks**. Labeled post-submission self-assessment stores marks separately and enforces half-mark steps and per-question bounds on the server. These conventional references are not silently graded as undisputed official answers. Other source defects with no effect on the intended unique choice, such as Q17's distractor typo and Q25's recurrence description, are disclosed in their worked references.

Executable independent checks cover C digit-sum recursion, the intended pointer offset, all 20 ordered card draws, Boolean truth tables, COCOMO effort, cache metadata, pipeline/DMA timing, the flip-flop state sequence, preemptive scheduling, all five matrix parenthesizations, natural join cardinality, synchronous distance-vector rounds, Kruskal MSTs for sizes 3-20 and the weighted linked path. The numerical checks corrected two draft arithmetic details before final import/export; final answers and explanations agree with the verified calculations.

## Preserved data and derived completion

The original-book checksum before and after is identical:

`cb64756a0e7afa184f98d08d3d850bebdac1cf68e764f9b99c8f647639373a4f`

Final verification confirms 52 original chapter documents / 2,654 original question records unchanged, all 12 earlier papers unchanged, and all six pre-existing attempts unchanged. Original text, IDs, order, diagrams, answers, locks and metadata were not edited. When the new separate paper was refined, the importer saved backups and replaced only that paper copy. Verification created fresh attempt IDs and removed only those fresh IDs afterward.

Exactly one 2011 dataset exists, and its persisted content equals `data/papers/gate-cs-2011.json`. `/gateyearpaperpdf` derives **Verified in DB - 65/65 questions**, 100 marks, from actual content and the exact selected source hash. No tracker-completion flag was written. Machine-readable evidence is in `import-report.json` and `final-integrity.json` beside the read-only snapshots.

## Exports and actual validation

Downloads beside the selected 2011 paper:

- [Dark questions](http://localhost:3000/api/gatemock/papers/gate-cs-2011/export?format=pdf&theme=dark): `output/pdf/gate-cs-2011.dark.pdf`, 65 pages.
- [Print questions](http://localhost:3000/api/gatemock/papers/gate-cs-2011/export?format=pdf&theme=light): `output/pdf/gate-cs-2011.print.pdf`, 65 pages.
- [Answers and worked references](http://localhost:3000/api/gatemock/papers/gate-cs-2011/export?format=key): `output/pdf/gate-cs-2011.solutions.pdf`, nine pages, every Q1-Q65 entry.
- [ZIP](http://localhost:3000/api/gatemock/papers/gate-cs-2011/export?format=zip): `output/pdf/gate-cs-2011.zip`, dark questions plus matching solutions.

The existing LaTeX export style preserves one question per page. Both question PDFs contain zero solution/discussion links or answer-key content. All 139 final pages were rendered and their contact sheets visually inspected. Dense Q45/Q47/Q52 and solution pages were also inspected at readable size. Read-back checks found zero missing headers, out-of-order pages, missing answer entries or out-of-bounds text. All 24 diagram crops were inspected and adjusted to preserve labels and edges. The dense Q47 uses 11-point body text and was explicitly reviewed for readability; this is the renderer's only recorded warning.

Actual successful checks:

- `node --test tests/*.test.mjs`: **350 passed, zero failed**, including six 2011-specific tests. Final run after the source-defect adjustment passed all 350.
- `npm run build -- --webpack`: **passed**, Next.js 16.3.2, successful production compilation and all 36 static pages. The documented working webpack path was used.
- `node scripts/verify-gate-2011.mjs`: **passed**, API and browser. All 65 question screens had zero MathJax, image or page errors. Checked answer secrecy, token authorization, stale revision conflicts, all saved responses, resume, markers, calculator, submit/frozen state, thirds penalties, linked prerequisites, self-assessment bounds, expiry submission and all four byte-matched downloads. Earlier paper catalogs and the old written-response / server-enforced 15-response limit passed regression checks.
- `python scripts/verify-gate-2011-pdfs.py`: **passed**, 65 dark + 65 print + nine solution pages, zero issues; ZIP entries equal their local PDF bytes.
- `node scripts/verify-gate-2011-integrity.mjs`: **passed**, original books, earlier papers, pre-existing attempts, one exact 2011 dataset and source-hash-derived tracker completion.
- `git diff --check`: **passed**; existing Windows line-ending notices are informational.

Desktop/mobile browser evidence, all source renders, final PDF renders and test/build logs are in ignored `tmp/gate2011/`. Machine-readable content, API, PDF and integrity reports are in ignored `data/backups/gate-2011/`.

Remaining limits: the historical key mirror is not authenticated on an original official issuing host; only the 15 specified Made Easy entries and five discussion pages are claimed as new direct external checks. Five source-defective/disputed positions require self-assessment. Diagrams retain the selected scan's resolution. Q47 requires the smaller 11-point layout to keep all content on one landscape page. The source's final three rough-work leaves are absent; no question is missing.

## Reproduction

```powershell
node scripts/inspect-gate-2011.mjs 2011
node scripts/fetch-gate-2011-references.mjs
python scripts/extract-gate-2011-key.py
python scripts/extract-gate-2011-assets.py
node scripts/build-gate-2011.mjs
node scripts/audit-gate-2011.mjs
node scripts/import-year-paper.mjs gate-cs-2011
node scripts/export-year-paper.mjs gate-cs-2011
node scripts/verify-gate-2011.mjs
python scripts/verify-gate-2011-pdfs.py
node scripts/verify-gate-2011-integrity.mjs
```

The importer refuses a changed copy unless `--update-copy` is supplied; it then backs up and conditionally replaces only this paper. Database/network/TeX commands need their normal environment access. Existing credentials are loaded privately; no reference-project database credentials were needed.
