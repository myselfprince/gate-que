# GATE CS 2009 verification

Attempt: http://localhost:3000/gatemock?paper=gate-cs-2009

The dataset is stored once in `yearpapers` as `gate-cs-2009`. Its JSON source is `data/papers/gate-cs-2009.json`. The existing catalogue, attempt APIs, timer, autosave, calculator, review and export renderer accept this paper's actual configuration without changing another paper's rules. No application source was changed for this import.

## Selected source and coverage

- Exact selected source: `D:\Gate PYQs Year Wise - PDFs\2009.pdf`.
- SHA-256: `d260584d7a0fdd14f3c7bd262e3e48c25eb6b2f75fe4df8889993b1b1c41b83a`, persisted as `sourceSha256`.
- Header: **2009, CS: Computer Science & Information Technology**. Single paper, with no set/session designation. Filename and header identity agree.
- All 14 supplied image-only pages were rendered and read. The header says 16 printed pages including rough work; page 14 ends with Q60 and END OF THE QUESTION PAPER. The omitted final two leaves contain no questions according to this end marker.
- 60 single-correct MCQs, 100 marks, three hours. No General Aptitude, descriptive questions or optional sections.

| Original positions | Navigation block | Marks |
| --- | --- | --- |
| 1-20 | One-mark questions | 20 |
| 21-50 | Two-mark questions | 60 |
| 51-56 | Three common-data pairs | 12 |
| 57-60 | Two linked-answer pairs | 8 |

Source page 1 specifies a one-third-mark penalty for wrong Q1-20 and a two-thirds-mark penalty for wrong Q21-57 and Q59. Q58 and Q60 have no negative marks and are evaluated only when Q57 and Q59, respectively, are correct. Unattempted answers score zero. These dependencies are enforced on the server, including self-assessment of Q58.

The digital review policy gives no definite automatic grade to the seven items below. Their 14 marks use labeled, bounded post-submission self-assessment; they are not silently assigned an official key. The automatic maximum is 86 marks. This review policy is a practice accommodation, separate from the printed grading instructions.

## Book search and independent copies

The MongoDB snapshot contains 52 chapter documents and 2,654 question records, including seven blank placeholders. All records were searched by full stem/code/options, with ranked candidates saved in `data/backups/gate-2009/full-book-search.json`. The 57 year-tagged records supply 55 selected positions. Five positions are new source transcriptions: **19, 20, 46, 49, 50**, including historical software-engineering and HTML content.

Two tagged records were excluded: `bwsh4exhr` is a duplicate FSM question with two corrupt next-state rows; `a47f41c1-2210-440b-9d3d-4c3a16f8ee81` asks about MAC addresses and does not occur in this source. Similar questions tagged other years were compared but were not appended.

Each copy has its own ID and `yearpaper:gate-cs-2009:N` key, with original chapter/question IDs, original year/subject/chapter/book label and a deterministic source-record hash. The selected sequential-circuits copy of Q27 matches the source table. Editable tables replace the book images for Q22 and Q24. The three genuine diagrams at Q32, Q38 and Q41 were cropped from this exact scan into `public/Year Papers/GATE CS 2009/` and published as independent content-addressed paper assets. The original file is also copied there as `2009.pdf`.

Corrections apply only to paper copies: Q8's distractor says "end of fetch cycle"; Q23's option-B parentheses are restored; Q33 option C is I and III; Q45's cross-product operand is lowercase s; Q53 uses source X[m]/uppercase X rather than the book's X[n]/lowercase x. Common passages and linked context are repeated where needed on independent question pages. Q54 repeats Q53's incomplete definition without supplying its answer. The complete per-position source-page and correction audit is in `data/backups/gate-2009/content-audit.json`.

## Answer coverage and limitations

All 60 positions have independently authored worked references. They are **not authenticated official answers**. Fifteen Made Easy key entries were visually checked in `C:\Users\Prince\Desktop\MadeEasy PYQ PDF\All Subject Solutions Keys`: Q6,11,13,27,28,35,38,39,43,44,47,51,52,59,60. Each retains its exact key PDF, page, item and printed option, including disagreements.

Thirteen GATE Overflow discussions were individually reviewed: Q19,20,27,28,43,44,45,47,49,50,55,56,58. Remaining discussion URLs are question mappings from the reference project's local cache, not claims of individually checked web answers. Direct bulk HTTP requests returned 403; the web tool supplied the individually reviewed discussions. Existing stored Made Easy provenance is retained separately. No private database credentials appear in paper data or this report.

Independent executable checks cover the Fibonacci-like program trace, FSM shortest input, LRU cache, SSTF disk movement, schedule conflict graphs, B+ leaf split alternatives, pipeline end times, dice probability, sector numbering, window packing, heap deletion and an SQL counterexample.

| Q | Review reason and reference |
| --- | --- |
| 28 | Fully buffered overlapping execution yields B=23 cycles; draining between iterations gives the Made Easy D=30. Buffering/overlap is unstated. [Discussion](https://gateoverflow.in/1314/gate-cse-2009-question-28). |
| 44 | Printed key C=4 follows a conventional separator/bias policy. Executable traces with other valid separator choices yield five or three leaf splits. The source does not specify the policy. [Discussion](https://gateoverflow.in/1330/gate-cse-2009-question-44). |
| 45 | Intended relational division gives A; literal v[s] and projection notation are ill-typed/nonstandard. Original notation is preserved. [Discussion](https://gateoverflow.in/1331/gate-cse-2009-question-45). |
| 47 | Made Easy prints B; alternative A interpretations and the stated 1000/s clock do not establish a unique minimum rate. [Discussion](https://gateoverflow.in/1333/gate-cse-2009-question-47). |
| 50 | Raw versus exit-to-entry augmented CFG circuit rank changes statement I; binary-decision assumptions are also unstated. Conventional B is a reference. [Discussion](https://gateoverflow.in/1336/gate-cse-2009-question-50). |
| 55 | Query returns suppliers with no blue parts, including zero-supply suppliers under the usual non-NULL/reference assumptions. No literal scan option is exact; source C says only blue, unlike the web variant's only non-blue. [Discussion](https://gateoverflow.in/1339/gate-cse-2009-question-55). |
| 58 | C=20 ms assumes immediate equal-size reverse traffic carrying the ACK. Reverse-traffic availability is unstated. Q57 remains a server prerequisite. [Discussion](https://gateoverflow.in/43470/gate-cse-2009-question-58). |

Q43's apparent key conflict was resolved: only same-item read/write conflicts count; S2 and S3 are serializable, so B is correct. Q49 keeps the scan's actual option B, unlike the duplicated web option. Q46 retains the scan's reversed public/private exponent variable names; inverse-exponent arithmetic still supports I and III.

## Preservation

Before writes, `data/backups/gate-2009/chapters-before.ejson` was saved with the read-only attribute, alongside deterministic counts and checksums. Book before and after SHA-256 is identical:

`cb64756a0e7afa184f98d08d3d850bebdac1cf68e764f9b99c8f647639373a4f`

The importer never writes book chapters, targets or book images. All eight previously persisted paper documents at inspection (CS 2000-2006 and IT 2004) remain byte-for-byte unchanged. Other year work appearing concurrently in the shared workspace was preserved. The two final refinements of this paper were backed up before replacement, with no duplicate 2009 dataset or identity.

The attempt snapshot captured 11 records while another 2007 verification was running. Six persistent attempts are byte-for-byte unchanged against both that snapshot and the earlier independent 2007 snapshot. Five transient records disappeared during the concurrent 2007 test's completion: their timestamps and exact four-CS-2007/one-CS-2000 pattern support that origin as an inference. The original snapshot remains intact; no old record was restored or edited. This work's browser script deletes only newly returned UUIDs for its own disposable attempts. See `attempt-preservation-audit.json` and `final-integrity.json` in the backup directory; the all-11 comparison is honestly recorded as false rather than overwritten with a new baseline.

The tracker derives **Verified in DB: 60/60** from the unique persisted dataset, numbering, answers, marks and matching source SHA-256. No completion flag was set.

The real tracker API and browser row were also checked: `2009.pdf` has the exact selected SHA, links to `gate-cs-2009`, and displays a checked, disabled completion checkbox with 60/60 coverage. Screenshot: `tmp/gate2009/browser/tracker.png`.

## Exports and validation

- `output/pdf/gate-cs-2009.dark.pdf`: 60 pages, one question per page.
- `output/pdf/gate-cs-2009.print.pdf`: 60 pages, one question per page.
- `output/pdf/gate-cs-2009.solutions.pdf`: nine pages, all 60 answer entries and worked references, with source/review notes.
- `output/pdf/gate-cs-2009.zip`: dark question paper and separate solutions, verified byte-for-byte against the PDFs.

The same four downloads appear beside this selection in `/gatemock`. Question exports include no keys, solutions or solution links. All 129 PDF pages were rendered; every question header, every answer label, page count and text bounds were checked. Both themes and the solution contact sheets were visually inspected, with full-size checks of tables, diagrams, code and disputed-answer pages. Final PDF verification reports zero issues.

Validation completed:

- Eight dedicated 2009 tests pass, including meaningful independent computational audits and copy/secrecy/scoring checks.
- Full suite: **344/344 passed** outside the sandbox. The initial sandbox run had nine Windows EPERM failures for existing temporary-file rename/symlink fixtures; rerunning with normal OS access resolved them.
- Production: **`npm run build -- --webpack` passed** on installed Next.js 16.3.2, with all 36 static pages generated. Relevant installed route-handler/webpack documentation was read before changes.
- Targeted ESLint on all new JavaScript/data/test files passed.
- Live API/browser checks passed for all 60 positions, math and diagrams, ownership authorization, answer secrecy, optimistic save revisions, refresh/resume, submission, one-third penalties, both linked dependencies, bounds on self-assessment, frozen submitted responses, timer expiry, review markers and calculator. Older written answers and the 15-of-20 choice limit were exercised on a disposable 2000 attempt. No browser math, image or page errors occurred. Desktop/mobile screens and all four download bytes were checked.

Reproduction (requires the selected local sources and configured project MongoDB):

```powershell
node scripts/inspect-gate-2009.mjs
node scripts/snapshot-gate-2009-attempts.mjs
python scripts/extract-gate-2009-assets.py
node scripts/build-gate-2009.mjs
node scripts/audit-gate-2009.mjs
node scripts/import-year-paper.mjs gate-cs-2009
node scripts/export-year-paper.mjs gate-cs-2009
python scripts/verify-gate-2009-pdfs.py
node --test tests/gate-2009.test.mjs
node scripts/verify-gate-2009.mjs
node scripts/verify-gate-2009-integrity.mjs
node scripts/verify-gate-2009-tracker.mjs
```

An existing changed copy requires `--update-copy`, which backs up and conditionally replaces only that document. Inspection deliberately refuses a changed original-book baseline. Authentication rate limits apply to repeated live verification runs; reuse a legitimate existing session or wait for the login window to reset.
