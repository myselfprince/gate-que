# GATE IT 2004 verification

Attempt: <http://localhost:3000/gatemock?paper=gate-it-2004>

Source: `D:\Gate PYQs Year Wise - PDFs\2004 it.pdf` (physical filename unchanged).
SHA-256: `b54c54f17e183e8c0362d9c263b2d8fabb3207c3b6c4d1aafce6c825dbab7008`.

The 14-page source header reads **GATE-2004, INFORMATION TECHNOLOGY**. No set/session label appears; filename identity agrees. Every source page, continuation, code block, table and diagram was read visually. Q1-30 are one-mark MCQs; Q31-90 are two-mark MCQs. The maximum is 150 marks. There is no General Aptitude section, written section or optional-question rule.

The scan omits duration and negative-marking instructions. **180 minutes and zero MCQ penalty are disclosed practice settings**, not verified official historical rules. No official answer key was found. All solutions are labelled authored references.

## Independent data and preservation

- MongoDB collection: `yearpapers`; slug/dataset ID: `gate-it-2004`. Exactly one matching dataset exists, with the exact source hash.
- **71 independent book copies and 19 source transcriptions**. Each has a new ID/key. Required images are copied to `public/Year Papers/GATE IT 2004/`; six images have an independent validated manifest and use existing year-paper asset storage.
- The complete 2,654-record book snapshot was searched. Two useful matches were found under other years: Q11 under 2011 and Q60 under 2008. Their year tags, code, numerical values and options were corrected only in the new copies to follow this scan.
- Exact duplicate book representations were found for Q22 and Q27. Only one independent copy occupies each source position. Several IT questions have blank or incorrect CS book tags; all new copies are explicitly IT.
- Newly transcribed positions: Q16-20, Q24-25, Q29-30, Q34, Q38-39, Q68-72, Q89-90. Software-engineering and web-technology questions are retained.
- Read-only snapshots of chapters, prior year papers and the six existing attempts are in ignored `data/backups/gate-it-2004/`. Updating the IT copy saves a separate prior-version backup first.
- Book count: **52 chapter documents / 2,654 records**, including 2,647 nonblank questions.
- Before/after book SHA-256: `cb64756a0e7afa184f98d08d3d850bebdac1cf68e764f9b99c8f647639373a4f`.
- The five previously completed CS datasets (2000-2004) and all six pre-existing attempts remain unchanged. Live verification creates disposable attempts and removes only its own IDs.
- Tracker completion derives from the persisted dataset, source hash, 90 positions, answers, marks and identity. No separate completion flag was set.
- The generic importer now accepts a validated `--snapshot-dir=gate-it-2004` argument, allowing CS and IT in the same year to have independent preservation baselines. Its default behavior is unchanged.

Per-position coverage and corrections are in `content-audit.json`; full-book candidates and duplicate decisions are in `book-match-audit.json` in the backup directory. Provenance retains the selected source record ID, chapter ID, original year, book label and record digest.

## Answer coverage and review policy

All **90/90** positions have independently authored worked references and an exact mapped GATE Overflow discussion URL. **29 Made Easy key entries** were visually checked; **14 discussions** were individually reviewed. Other discussion URLs are explicitly cache-derived question mappings, not claims of individually checked answers. These counts overlap.

Executable independent checks cover relation composition, determinants, variable-stage pipeline timing, LRU replacement, static-variable traces, bit stuffing, parity-code XOR closure, memory capacity, B-tree packing, effort scaling and error-seeding arithmetic.

**13 questions / 24 marks require post-submission self-assessment.** The other **126 marks** are automatically graded. Conventional keys are references for disputed items and never silently counted as correct/wrong.

| Position | Source defect or disagreement |
| --- | --- |
| Q11 | Scan prints 50 characters rather than reference 80; none of the scan's options gives its 4 Mbps average. |
| Q12 | Scan L1 hit rate is 0.5, giving 30 ns, absent from the options. Reference 0.8 gives C=12.6 ns; Made Easy prints A. Source B is 12.5, unlike book 12.8. |
| Q34 | B and C are duplicates; D is also algebraically equivalent. |
| Q40 | Literal epsilon stack transition and unspecified acceptance convention conflict with reference variants. |
| Q41 | Scan repeats delta(B,a) with conflicting destinations; intended option B also contains a wrong production. |
| Q44 | Source option B lacks a clear plus between two product terms. |
| Q50 | The ratio wording omits the compared operation type. |
| Q57 | Source recurrence II prints n-1k rather than n-1. |
| Q60 | The output statement lies outside the if, printing the base newline before the reversed letters. Source spelling and distractors remain. |
| Q61 | Source f1 assigns L, while all answer choices expect U. Literal output has no listed match. |
| Q71 | The calculation gives 50 undetected natural errors; source B misprints 500. |
| Q72 | MTBF-as-uptime versus MTBF-as-complete-cycle conventions distinguish D from C. |
| Q74 | Two student inserts omit dept_id despite the assertion that all inserts succeeded. |

Other source differences are disclosed without changing automatic grading: Q2's intersections/options, Q31's connective and identifiers, Q46's equivalent forwarding sequence, Q49's control signals, Q55's malformed book expressions, Q73's A13/A23 multivalue placement and C/D order, and Q84's numbered assertions. Q47 uses the intended asynchronous variable-stage model; Q48 uses sequential initial line allocation; Q82 uses delayed token reinsertion; Q83's 10 kbps is an approximation.

Example reviewed discussions: [Q12](https://gateoverflow.in/3653/gate-it-2004-question-12-isro2016-77), [Q34](https://gateoverflow.in/3677/gate-it-2004-question-34), [Q40](https://gateoverflow.in/3683/gate-it-2004-question-40), [Q71](https://gateoverflow.in/3714/gate-it-2004-question-71), [Q72](https://gateoverflow.in/3715/gate-it-2004-question-72).

## Exports and actual verification

- `output/pdf/gate-it-2004.dark.pdf`: 90 pages, one question per page.
- `output/pdf/gate-it-2004.print.pdf`: 90 matching question pages.
- `output/pdf/gate-it-2004.solutions.pdf`: 11 pages, all 90 authored answers, disagreements and source notes.
- `output/pdf/gate-it-2004.zip`: dark question paper plus solutions; both members match the final PDF bytes.

All four downloads appear beside this selected paper in the existing lobby. Question PDFs expose no answer keys, solutions or discussion links. All 191 PDF pages were rendered; contact sheets and full pages were visually checked, including all dark-paper positions, the mathematical/code/diagram pages, print pages and every solutions page. Automated checks verify all ordered headers, answer labels, text bounds and ZIP contents. Final renderer warnings: none.

Checks performed:

- `npm test`: **297 passed, 0 failed** with normal Windows permissions. The initial sandbox run blocked nine existing temporary-file/junction tests; all passed when rerun outside that restriction.
- `node --test tests/gate-it-2004.test.mjs`: **4 passed**, including source fidelity, isolation, grading and independent numerical/program checks.
- `npm run build -- --webpack`: **passed**, 33 pages generated. Webpack is supported by the installed Next.js CLI guide.
- `node scripts/verify-gate-it-2004.mjs`: API and browser checks pass: all 90 positions, math rendering, all diagrams, save/resume, active answer secrecy, review flags, calculator, stale revisions, invalid tokens, submission, 126 automatic marks, self-assessment and bounds, frozen submitted state, timer expiry and four download byte comparisons.
- Existing CS 2002 written-response persistence, post-submit assessment and server-enforced 15-response optional limit pass through disposable regression attempts.
- `python scripts/verify-gate-it-2004-pdfs.py`: **90/90/11 pages, no issues**, all answers and bounds verified.
- `node scripts/verify-gate-it-2004-integrity.mjs`: original-book, previous-paper and existing-attempt checks; persisted copy equality; unique dataset and source-derived tracker completion.

Use the requested **localhost** URL. The already-running Next.js dev server blocks browser scripts from the alternative 127.0.0.1 origin. No app configuration was loosened. The app remains available on port 3000. No new descriptive/MSQ/NAT section was invented for this all-MCQ source.
