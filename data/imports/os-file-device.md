# Operating Systems - File System and Device Management

Source: `5. Operating Systems/5. File Sys and Device Mgmt.pdf`.
SHA-256: `6ccfa094781f19b3d50f6d899088a6281f1b935b1ffa6a7929e6c5399dc9a883`.

All three scanned PDF spreads were rendered and visually inspected, including
both facing book pages. Imported Q5.1-Q5.35 only, in book order, from book
pages 585-588. Book page 584 contains the previous chapter's explanations;
book page 589 contains this chapter's complete answer key and explanations.
Neither explanation section was imported as questions.

The import contains 24 MCQs, two MSQs (5.6 = AC; 5.32 = BC), and nine NATs.
Every answer comes from the printed key on book page 589 / PDF spread 3.
All question text, options, years, marks and printed set numbers are readable.
No missing answers or text were inferred. Matching lists are editable LaTeX
tables; all other prose is editable text. This chapter has no diagrams or code.
Shared directions are included in both Q5.17 and Q5.18. Facing-page continuations
are joined for Q5.11, Q5.19 and Q5.29; Q5.15 continues in the adjacent column.

Printed anomalies are preserved and documented in source notes:

- Q5.2 labels both matching columns List-I.
- Q5.6 has singular stem wording but the key/explanation select A and C.
- Q5.16 splits the suspension condition into labels II and III; II is
  grammatically incomplete. The printed answer B is retained.
- Q5.26 asks for additional SSTF distance compared with SCAN, specifies movement
  toward 100, and gives positive 10 in the key. All are preserved literally.
- Q5.30 requests one decimal place but the key prints 4; stored as printed.

The actual main database chapter was absent at inspection. Its existing target
was 35. A checksummed EJSON backup of the chapter, target and unrelated chapter
hashes was written before the transaction. The import created 35 records;
the existing target remained unchanged. A unique chapter identity index,
conditional writes and a transaction protect concurrent creation/editing.
Any unreviewed legacy content or collision stops the importer. Re-imports use
source checksum/question number and preserve existing edits, IDs and locks.

Database read-back verified 35 source identities, unique IDs, metadata, content,
all printed answers and zero image dependencies. Unrelated chapter/target hashes
were unchanged. A subsequent live dry-run matched all 35 and added zero.

```powershell
node scripts/import-os-file-device.mjs
node scripts/import-os-file-device.mjs --apply --backup-dir data/backups/os-file-device-2026-10-28
node scripts/verify-os-file-device-export.mjs data/backups/os-file-device-2026-10-28/verified-source-from-database.json output/pdf/os-file-device
python scripts/verify-os-file-device-pdfs.py output/pdf/os-file-device
```

Backups/read-back evidence: `data/backups/os-file-device-2026-10-28/`.
Exports and all 35 editor preview captures: `output/pdf/os-file-device/`.
The browser QA intercepts persistence calls so no editor autosave or preference
changes reach the database. The exported source comes from actual database
read-back. The PDF verification script renders every page, checks page boundaries,
black backgrounds and full-width prose, compiles the portable editable LaTeX
ZIP independently, and compares it to the PDF route output.

Validation completed: all 199 tests, ESLint and the production build passed.
The actual PDF and LaTeX export routes both returned 200. All 35 editor previews
rendered (50 MathJax expressions) with zero math errors, raw math, broken images,
horizontal overflow or browser exceptions. Poppler rendered all 35 exported
pages for visual review. All pages have black backgrounds, white text, full-width
question bodies and one question per page. The independently compiled portable
LaTeX document has 35 pages, pixel-identical to the corresponding PDF-route
pages (20 + 15). No application layout/schema changes were needed.
