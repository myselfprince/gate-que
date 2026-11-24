# GATE CS 2012 verification

The complete independent paper is available at [the local test centre](http://localhost:3000/gatemock?paper=gate-cs-2012). It is stored once in MongoDB `yearpapers` as `gate-cs-2012`, with its own question IDs, keys, asset directory and provenance. No original book question was edited.

## Selected source and paper identity

- Exact selected source: `D:\Gate PYQs Year Wise - PDFs\2012.pdf`.
- SHA-256: `ff1031a54b710960b9b7f7e941ff299c0ce77952ee540816e040aa01fbb30269`.
- Verified header: 2012, CS: Computer Science & Information Technology, Question Booklet Code A. There is no filename/header discrepancy. Booklet A is retained as the permutation identifier; set/session is blank.
- All 20 pages were read and rendered. Questions end on page 17; pages 18-20 are the supplied rough-work pages. The original physical filename is unchanged, including in `public/Year Papers/GATE CS 2012/2012.pdf`.
- The exact source checksum is persisted in `sourceSha256`. Tracker completion is derived from the actual matching document, all 65 numbered positions, unique keys, answers/review references, marks and duration; no tracker completion flag was written.

## Structure and grading

| Original block | Questions | Count | Marks |
| --- | --- | ---: | ---: |
| One-mark technical | 1-25 | 25 | 25 |
| Ordinary two-mark technical | 26-47 | 22 | 44 |
| Common data | 48-51 | 4 | 8 |
| Linked answers | 52-55 | 4 | 8 |
| General Aptitude | 56-65 | 10 | 15 |
| Total | 1-65 | 65 | 100 |

Duration is 180 minutes. All questions are single-answer MCQs. There are no optional sections, MSQs, NATs or descriptive questions in this paper. General Aptitude contains five one-mark and five two-mark questions, in its original final position.

Source page 1 explicitly documents one-third negative marking: -1/3 for an ordinary wrong one-mark response and -2/3 for an ordinary wrong two-mark response. Blanks receive zero except the historical all-candidate awards described below. Q53 is evaluated only after correct Q52; Q55 only after correct Q54. The second member of each linked pair has no negative marking. The server enforces these rules.

## Copies, additions and source restoration

All 2,654 saved book records were searched, rather than relying only on their year tags. Fifty-four records are tagged 2012. Fifty-three distinct matching records were copied, and twelve questions were newly transcribed: Q4, Q28 and Q56-65. The two Q44 book records contain duplicate content; the keyed copy was selected. The excluded duplicate remains untouched in the book.

The audit compared full text, code, options and diagrams. Similar candidates from 2008 were rejected after comparing their actual fork code and K-map cells. No question from another year or paper was appended. Full shared code, tables and linked passages are retained. Twelve independent diagram crops come only from the selected PDF; tables, option tables and code remain editable.

Material copy-only restorations include:

- Q3: retain the source's backslash-space-n sequence; describe the intended newline reading separately.
- Q9: restore the source's distractors, including the left endpoint pi/4 in D.
- Q32: remove the book's stray semicolon after `while`, restoring the actual source loop body.
- Q37: restore the final distractor `2(2^n-2)`.
- Q38: restore source option C=90. The calculated answer 45 is absent from the selected paper's choices.
- Q40: restore SBDT in B and retain every vertex, arrow and weight in a fresh source crop.
- Q47: restore the source pseudocode braces and remove the extra book distractor parenthesis.
- Q50-51: restore the C relation's Area column and original common-data numbering.
- Q52-53: restore the source FOLLOW-set distractors and S-to-epsilon production in option B.

Detailed per-position source pages, original book IDs, chapter IDs, book labels, record hashes and changed fields are retained in the dataset and `data/backups/gate-2012/content-audit.json` and `full-book-search.json`.

## Answer coverage and limitations

All 65 positions have authored worked references and a comparison with the historical booklet-A key. These are authored explanations, not official worked solutions.

The [retained key mirror](https://gatecse.in/w/images/b/b5/Key_CS_2012.pdf) was downloaded, hashed, read and visually checked. All 65 entries agree with the indexed [IIT Kanpur GATE archive](https://gate.iitk.ac.in/GATE2023/doc/papers/2012/cs_2012.pdf). Direct download from that official archive failed with DNS/502 errors. The retained file is explicitly labeled a mirror, not an authenticated download from the original issuing host.

Seventeen Made Easy key entries were visually checked in the supplied local solution PDFs: Algorithms items 1.37, 1.38, 2.28, 2.29, 3.44, 3.45; Digital Logic 1.49, 1.50; COA 2.23, 3.24; Compiler Design 2.27, 2.28, 4.5; and DBMS 2.33, 3.24, 3.25, 3.26. Their filenames, PDF pages and printed keys are recorded per question. Other stored book provenance is labeled as retained provenance, not a new direct key check.

Eleven GATE Overflow discussions or their indexed answer content were reviewed: Q9, Q15, Q20, Q24, Q29, Q32, Q34, Q40, Q45, Q60 and Q63. All 65 positions retain a discussion link; the other links are explicitly labeled as cache mappings, not individually verified discussions. The reference project's local cache supplied those mappings; its credentials were neither disclosed nor changed.

The historical key awards **Marks to All** for Q3, Q29, Q38, Q39, Q45 and Q60, totaling ten marks. This practice interprets that wording as full credit for every candidate, including blank responses. The six questions and their full worked references remain intact. Their intended answers do not replace the documented award. Awards have their own post-submission status and are excluded from active-attempt question data.

Three disputed or defective items require labeled post-submission self-assessment:

| Question | Issue | Marks |
| --- | --- | ---: |
| 9 | Published D counts the restricted-domain endpoint; the book's B uses an interior-only convention. [Discussion](https://gateoverflow.in/41/gate-cse-2012-question-9). | 1 |
| 15 | Published/Made Easy C conflicts with SQL semantics supporting B. Both are disclosed. [Discussion](https://gateoverflow.in/47/gate-cse-2012-question-15). | 1 |
| 63 | Exact probability is 1/3. Key B=0.334 is nearest but is not correct three-decimal rounding. [Discussion](https://gateoverflow.in/2211/gate-cse-2012-question-63). | 2 |

Automatic maximum is 96 marks, including the ten historical award marks. Four marks remain separately self-assessable. The original ambiguous statements are preserved. Official cancellation rationales that could not be authenticated are not invented.

Public instructions contain only test rules and a generic review-policy notice. Item-specific award/dispute notes are stored privately in `reviewNotes` and included in the solutions PDF. The catalog and active attempts do not expose answer fields, worked references, provenance, award flags or private review notes.

## Original-data protection

The initial read-only snapshots contain 52 complete chapter documents, 2,654 question records, all prior year papers and six existing attempts. Deterministic hashing uses sorted documents serialized with BSON EJSON, including all question content, IDs, order, locks and metadata.

Book SHA-256 before import and after the final work is identical:

`cb64756a0e7afa184f98d08d3d850bebdac1cf68e764f9b99c8f647639373a4f`

During the interruption the user made commits and an unrelated 2008 paper change. A fresh read-only resume snapshot preserved that state. Final updates backed up and replaced only the 2012 document, preserved all thirteen other papers against that fresh baseline, and preserved all six pre-existing attempts. The reference project was not modified. Temporary verification attempts were removed by their own IDs.

Evidence: `data/backups/gate-2012/final-integrity.json`, `resume-audit-latest.json`, initial `snapshot-report.json`, and the guarded import reports under `data/backups/gate-2012-final/`. Exactly one matching 2012 dataset exists and its persisted content equals the saved JSON.

## Exports and actual verification

The existing landscape renderer produces:

- `output/pdf/gate-cs-2012.dark.pdf`: 65 pages, one question per page.
- `output/pdf/gate-cs-2012.print.pdf`: 65 pages, one question per page.
- `output/pdf/gate-cs-2012.solutions.pdf`: 11 pages, all 65 worked entries, including full explanations for all six cancelled items.
- `output/pdf/gate-cs-2012.zip`: the dark paper and the matching solutions PDF, with 2012-specific filenames.

All four downloads are exposed beside the selected paper in `/gatemock`. The final live PDF responses match the local files byte-for-byte; ZIP members match the final paper and solutions. Question PDFs contain no answers or hidden optional-content answer layers.

All 141 final PDF pages were rendered and visually inspected. Every question header and answer entry was read back; text bounds, sequence, answer secrecy and all six cancelled-item explanations passed. Dense Q36 uses readable program/diagram columns, Q48-49 preserve their three output rows, and Q52-53 use larger option tables. Q47 uses an 11-point body; its complete code and options were inspected at full-page resolution.

Actual checks:

- `node --test tests/*.test.mjs`: **372 passed, 0 failed** on the current commits and final changes.
- `npm run build -- --webpack`: **passed** with installed Next.js 16.3.2. Installed CLI and route-handler guides were read before changes.
- `node scripts/verify-gate-2012.mjs`: **passed** API authorization, exact selection/order, active-answer secrecy, all saved responses, stale revision rejection, refresh/resume, frozen submitted responses, submission, penalties, linked eligibility, self-assessment bounds, expiry submission, and legacy written responses/15-question choice limits.
- Browser: **all 65 questions passed**, with zero math/image/page errors; palette, review marker, calculator, autosave, refresh/resume, submit/review, self-assessment, desktop and mobile checked.
- `node scripts/verify-gate-2012-downloads.mjs`: **all four final downloads passed**, including the corrected full worked references for cancelled items.
- `python scripts/verify-gate-2012-pdfs.py`: **passed**, page counts 65/65/11, zero bounds/secrecy/coverage issues.
- `node scripts/verify-gate-2012-integrity.mjs --baseline-dir=data/backups/gate-2012-final`: **passed**, original book checksum unchanged, other papers and existing attempts preserved, tracker complete from real data.

The existing development server was reused on `localhost:3000`; it was not stopped. Its 127.0.0.1 alias rejected development chunks, so the successful browser checks use the requested localhost URL. Sandbox-only Windows temporary-file/TeX failures were resolved by running the existing tools with normal local permissions; the successful final results above reflect those runs.
