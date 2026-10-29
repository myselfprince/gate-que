# GATE CS 2002 reconstruction and verification

Completed 29 October 2026. Open `http://localhost:3000/gatemock?paper=gate-cs-2002` (production listener also available at `http://127.0.0.1:3000/gatemock?paper=gate-cs-2002`).

## Selected source and identity

Only `D:\Gate PYQs Year Wise - PDFs\2002.pdf` was reconstructed. Its physical filename is unchanged. SHA-256:

`aaa059d0b47e32ade8ea98e4b9bf7e5615717145bbf48095490ea027b5c03a7e`

This exact hash is persisted as `sourceSha256`. All ten rendered pages were inspected. The visible header is **GATE - 2002 / COMPUTER SCIENCE & ENGINEERING**; there is no set/session label. The PDF's defective text layer says 2001 at the top, but the visible header and question content establish 2002. No filename/header identity correction is needed.

| Source positions | Historical identifiers | Questions | Marks | Choice |
| --- | --- | ---: | ---: | --- |
| 1-25, Section A | 1.1-1.25 | 25 MCQs | 25 | All |
| 26-50, Section A | 2.1-2.25 | 25 MCQs | 50 | All |
| 51-70, Section B | 3-22 | 20 written questions | 100 available, 75 counted | Any 15 |

Maximum score is 150; 175 marks of questions are available. There is no General Aptitude section. The supplied scan states neither duration nor negative marking. **180 minutes and zero MCQ penalty are explicitly disclosed practice rules**, not verified official 2002 rules. The section rule is printed on source page 6.

## Independent copy and book protection

The paper has exactly one MongoDB `yearpapers` document with slug/dataset ID `gate-cs-2002`. It contains 70 separately keyed questions and five independent diagram assets under `public/Year Papers/GATE CS 2002/`. No year-paper question is eligible for subject, topic or weighted book mocks. Source book IDs, chapters, years, original provenance and partial-copy scope are retained under `source.copiedFrom` and `source.bookSource`.

The full 2,654-record book was searched, rather than only its 52 records tagged 2002. **45 positions were copied (42 full questions and three partial multipart matches); 25 positions were added from the selected PDF.** The partial matches are Q53(a), Q55(b) and Q66(a), whose other parts were transcribed. Q19 matches a book record tagged 2000; Q22 matches one tagged 2001. These match the selected PDF by content; their book records were not changed. Duplicate representations were found for Q5, Q11, Q13, Q21 and Q30. Three other 2002-tagged records do not belong to this paper. The ignored `data/backups/gate-2002/content-audit.json` contains the mapping, full-bank candidate search, exclusions, source page coverage and copy-only corrections.

Before database writes, `data/backups/gate-2002/chapters-before.ejson` was created and made read-only. It contains 52 chapter documents and 2,654 question records, including their answers, order, locks and metadata. The sorted BSON EJSON SHA-256 was identical before import, after import and after all live tests:

`5ceb77abee3ea480348ca8f1920946d37cce082fc652b017ea16ba83748184d5`

Every existing 2000/2001 year-paper document also retains its original deterministic checksum. A backup was saved before final adjustments to the 2002 copy. Final checks confirm one selected dataset, equality between persisted content and `data/papers/gate-cs-2002.json`, and tracker state **Verified in DB: 70/70** derived from the actual dataset and source hash. No tracker flag was set. Test attempts were individually identified and removed; existing attempts were not edited.

## Answer coverage and review policy

**70/70 positions have independently authored worked references**, labeled as authored rather than official. The supplied Made Easy solution PDFs were visually compared for 25 objective keys and two descriptive `Sol.` pointers. Eighteen question discussions were reviewed on GATE Overflow. Remaining discussion links come from the reference project's local question cache and are explicitly labeled as mappings, not claims that their answers were individually checked. The per-question `answerSources`, `verificationStatus`, `source.issues` and `source.pdfPages` record the exact scope.

No official 2002 answer key was located. The current [official archive](https://gate2026.iitg.ac.in/download.html) starts its bulk question-paper download at 2007; it was not used to invent a 2002 key or historical grading rule. The reference project's `public/data/questions.json` supplied 72 mappings, including separate parts of multipart questions, without accessing or disclosing its credentials.

| Position | Issue | Treatment |
| --- | --- | --- |
| Q37 / 2.12 | Conventional D uses the 2n/3 subtree approximation; the literal integer-node balance condition at every node forces perfect trees. | Manual assessment, with both derivations. [Discussion](https://gateoverflow.in/842/gate-cse-2002-question-2-12). Independently enumerated feasible sizes through 1,023 nodes. |
| Q39 / 2.14 | A and C are true under inclusive “or”. | Conventional A retained as provenance; manual assessment. [Discussion](https://gateoverflow.in/844/gate-cse-2002-question-2-14). |
| Q46 / 2.21 | Made Easy OS 1.17 key D conflicts with the discussion's minimal sufficient characterization B; sufficient combinations overlap. | Manual assessment. [Discussion](https://gateoverflow.in/851/gate-cse-2002-question-2-21). |
| Q50 / 2.25 | C is the schema-level conclusion; B also describes the displayed instance. | Manual assessment with both readings. [Discussion](https://gateoverflow.in/855/gate-cse-2002-question-2-25). |

These four MCQs total 8 marks. The other 46 MCQs have an automatic maximum of 67 marks. The written section contributes up to 75 self-assessed marks after submission. Server-validated self-assessments can bring the total to 150 and remain separately labeled.

Other preserved defects/assumptions include Q26's book minterm typo (source has 6,7), Q27's differing book option B (source restored), Q29's duplicated A/D flag option, and Q70's printed `di` terminal (retained in the question; interpreted as the usual identifier token `id` in the worked reference). Q60 explicitly states the diagonal initialization convention and uses the printed outermost loop as the intermediate vertex. Q63 documents offer-weighted versus student-weighted salary averages. Q65 explains membership search versus record lookup in B+ trees. The pseudocode and currently out-of-syllabus 8085 questions are retained.

Independent checks include exhaustive three-variable truth tables, the six-NAND construction, the 8085 carry calculation, register-by-register pipeline tracing, the hexadecimal floating representation, all 512 directed three-vertex graphs against BFS, legal Hanoi moves, NFA/DFA behavior for every binary string through length 10, SQL-view deltas, FD projection and the literal weight-balanced-tree condition.

## Exports and live verification

Final outputs use the existing landscape one-question-per-page renderer:

- `output/pdf/gate-cs-2002.dark.pdf`: 70 pages.
- `output/pdf/gate-cs-2002.print.pdf`: 70 pages.
- `output/pdf/gate-cs-2002.solutions.pdf`: 11 pages, all 70 worked entries and source references.
- `output/pdf/gate-cs-2002.zip`: the dark question paper and solutions, with paper-specific filenames.

All 151 PDF pages were rendered; complete contact sheets were visually reviewed, with changed pages reviewed again at full size. Automated checks confirm original sequence, every answer label, text bounds, no solution text in question PDFs, no answer/video hyperlinks in question PDFs, and byte-identical ZIP contents. Five actual diagrams are complete in both themes. The pipeline diagram retains the original scan's limited resolution and is enlarged in the final paper.

Live API checks pass: complete catalog and source isolation; active-answer secrecy; invalid-token rejection; rejection of premature, excessive and invalid self-assessments; rejection of a sixteenth written response on save; autosave; submission; 67-mark objective scoring; saved self-assessment; automatic submission on expiry; and all four downloads. Browser checks pass for desktop/mobile selection, math rendering, MCQ selection, saved written text, refresh/resume, calculator, submission and post-submission self-assessment, with no page errors. Screenshots are in ignored `tmp/gate2002/browser/`.

`npm test`: **266 passed, zero failed**. `npm run build -- --webpack`: **passed**, including 33 generated pages and all API routes. Initial sandbox-only MiKTeX registry, filesystem rename and build-output permission errors were resolved by rerunning with normal local permissions. The old production process was restarted after the build to avoid stale JavaScript asset references.

Reproduce with:

```powershell
node scripts/inspect-year-paper.mjs 2002
python scripts/extract-gate-2002-assets.py
node scripts/build-gate-2002.mjs
node scripts/import-year-paper.mjs gate-cs-2002
node scripts/export-year-paper.mjs gate-cs-2002
python scripts/verify-gate-2002-pdfs.py
node scripts/verify-gate-2002.mjs
node scripts/verify-gate-2002-integrity.mjs
npm test
npm run build -- --webpack
```

The importer refuses changed book/other-paper checksums. For an intentionally revised 2002 copy, `--update-copy` saves a backup and conditionally replaces only that document. Database and local TeX operations require access to the configured services. Reports and EJSON snapshots are intentionally ignored by Git and contain no printed credentials.
