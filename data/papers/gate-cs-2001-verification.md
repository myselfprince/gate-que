# GATE CS 2001 reconstruction and verification

Completed locally on 2026-10-29. Open http://localhost:3000/gatemock and select CS / 2001. The production server uses the webpack build.

## Paper structure

The supplied ten-page `D:/Gate PYQs Year Wise - PDFs/2001.pdf` was opened, extracted and visually reviewed. Its SHA-256 is `e4dd9d8849d91bb70dab35d848f726186a1b8f24acda7b2bed02c99809eef127`.

| Section | Displayed positions | Questions | Marks |
| --- | --- | ---: | ---: |
| A, one mark | 1-25 | 25 MCQs | 25 |
| A, two marks | 26-50 | 25 MCQs | 50 |
| B, written | 51-70 | 20 multipart questions; answer any 15 | 75 maximum |

There are 70 question positions, 175 available marks and a 150-mark maximum. No General Aptitude questions are appended. The displayed scan numbers and historical discussion labels are both retained: 1-25 correspond to 1.1-1.25, 26-50 to 2.1-2.25, and 51-70 to 3-22. The supplied scan does not document exam duration or negative marking. **180 minutes and zero penalty are explicitly disclosed practice settings**, not asserted official historical rules.

## Independent storage and protected data

- Dataset: `data/papers/gate-cs-2001.json`; native MongoDB collection: `yearpapers`, slug `gate-cs-2001`.
- 44 book questions were copied with new independent IDs; 26 questions were added from the paper, including all 20 written questions.
- Nine existing diagram/option assets were independently copied; one converter diagram was cropped from the supplied original. All ten live in `public/Year Papers/GATE CS 2001/`.
- Every copy retains its original chapter/question IDs, original year tag, source metadata and paper page references under `source`. The matrix question at Q1 was found under the incorrect book year 2002. Duplicate and unrelated representations are documented in the local content audit.
- The original `chapters` collection was saved before any database write in the read-only `data/backups/gate-2001/chapters-before.ejson`: **52 documents, 2,654 questions**. The deterministic SHA-256 of BSON EJSON documents sorted by `_id` is `5ceb77abee3ea480348ca8f1920946d37cce082fc652b017ea16ba83748184d5`.
- Before/after book checksums match exactly. All original book fields, answers, locks, IDs, ordering and assets remain unchanged. The existing GATE 2000 MongoDB document also matches its original snapshot checksum exactly and remains selectable with 69 questions / 150 marks.
- Separate copies are excluded from book-based subject, topic and weighted mocks.

## Answer verification and review policy

All 70 questions have authored worked references. No official 2001 answer key was located. References are **not labeled official**. Each question retains answer sources, source page/link, verification scope and relevant issues.

16 relevant GATE Overflow discussions were individually reviewed; 11 supplied Made Easy key items were visually checked, covering **23 distinct questions** in total. Other solutions are independently authored/reviewed, with discussion mappings from the reference project's local cache and stored book provenance retained. The dataset explicitly distinguishes a reviewed discussion from a question mapping whose solution was not individually cross-checked. This is not a claim that all 70 answers were externally verified.

- **Q3:** A is intended, but D is also logically true because valid implies satisfiable.
- **Q13:** C/D depends on the architecture and interpretation of privilege reduction.
- **Q49:** C is the conventional key; B is also unsafe under vacuous truth.

Those three MCQs (4 marks) require post-submission self-assessment. The remaining 47 MCQs carry 71 automatically graded marks. All written answers are saved and self-assessed after submission; the server permits at most 15 answered written questions.

Q10, Q38 and Q45 explain corrections to conflicting Made Easy keys without changing the book. Notes also cover the NFA wording, root-parent exception, scheduling observation interval, setup/hold assumptions, page-table entry estimate, inequality/prose mismatch, transfer/unit conventions, S-K/J-K typo, E/B typo, disk scheduling conventions and B+ tree split conventions. Q67 follows the supplied scan's resource-acquisition order, which differs from some web discussion; exhaustive reachable-state exploration checks the reference's concurrency conclusions.

Independent executable checks cover the even-number count, program trace, two's complement, FIFO anomaly, all ten valid excess-3 conversions, sequential output trace, all candidate spanning trees, and resource-program interleavings.

## Test environment and exports

- Original order and three navigation groups; MCQ and saved written responses; server-enforced choice limit.
- Timer, automatic expiry submission, palette/review state, scientific calculator, autosave and refresh/resume.
- Active attempt/catalog responses omit answers, solutions, verification sources and copy provenance. Worked references and sources appear only after submission. Study downloads are available beside the selected paper.
- MathJax 3.2.2 is pinned locally; predev/prebuild copies its components and fonts into `public/vendor/mathjax/`. Mock question rendering no longer depends on the external CDN.
- `output/pdf/gate-cs-2001.dark.pdf`: 70 pages, one complete question per page.
- `output/pdf/gate-cs-2001.print.pdf`: 70 pages, one complete question per page.
- `output/pdf/gate-cs-2001.solutions.pdf`: 11 pages, all Q1-Q70 answers/references and review notes.
- `output/pdf/gate-cs-2001.zip`: dark questions plus the separate solutions; contents checked byte-for-byte against final files.

## Actual verification results

- Full automated test suite: **257 passed, 0 failed** with normal temporary-file access. The sandbox-only run had nine permission failures in unrelated temporary export-storage tests; rerunning with normal access passed all of them.
- Targeted 2000/2001/mock regression suite: **15 passed**.
- ESLint: passed for changed implementation, scripts and new tests.
- `npm run build -- --webpack`: production build passed, including all 33 static routes. A sandbox-only build initially encountered a generated-directory permission error; the supported webpack build passed with normal access.
- Live API/browser checks passed: complete catalog coverage, separate dataset selection, no active answer leakage, rejecting the 16th written response, saving, refreshing/resuming, scoring, invalid/token-bound assessment rejection, post-submit self-assessment, calculator, all four downloads, automatic server expiry submission and GATE 2000 readiness.
- Desktop/mobile screenshots inspected; final objective/written/review screens have rendered math and no page errors.
- Both question PDFs have exactly 70 ordered pages. All 70 solution labels are present. Every text word was checked against physical page bounds; no issues. Question PDFs contain no solution layer or solution links. Every final page was rendered; source pages and final representative math/code/diagram/long-text pages were visually inspected. Poppler additionally confirmed final rendering of the long disk-transfer question.
- Machine-readable evidence is saved in `data/backups/gate-2001/{snapshot-report,content-audit,import-report,pdf-verification,live-verification}.json`; final screenshots and renders are in `tmp/gate2001/`.

## Reproducible commands

```powershell
node scripts/inspect-year-paper.mjs 2001
node scripts/build-gate-2001.mjs
python scripts/extract-gate-2001-assets.py
node scripts/import-year-paper.mjs gate-cs-2001
node scripts/export-year-paper.mjs gate-cs-2001
python scripts/verify-gate-2001-pdfs.py
node scripts/verify-gate-2001.mjs
npm run build -- --webpack
npm start
```

The importer refuses a changed book baseline, checks previously completed papers, and requires explicit `--update-copy` to replace a differing copy of the requested paper. It never writes to `chapters`.
