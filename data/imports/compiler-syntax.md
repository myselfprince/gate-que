# Compiler Design / Syntax Directed Translations import

- Source: `C:/Users/Prince/Desktop/MadeEasy PYQ PDF/10. Compiler Design/3. Syntax Directed Translations.pdf`
- SHA-256: `a763257c9796c375d591a6be074d495f2287a0ab620069d0f1dd32c5f669bc90`
- Visually inspected both scanned spreads, all four book pages 504-507. Opening folio 504 is inferred from the next printed folio 505.
- Complete coverage: Q3.1-Q3.25, in printed order. No preceding/following chapter or explanation content occurs in these scans.
- Main database chapter was absent. Added 25 questions; initially matched 0. Existing completion target was 25 and stayed unchanged.
- Types: 20 MCQ, 4 NAT (3.13, 3.15, 3.22, 3.23), 1 MSQ (3.25). Years, marks and printed set numbers retained.
- The supplied PDF has no answer key. All 25 answer fields remain empty with `answerKeyStatus: not-supplied` and `answerKeyPdfPage: null`; no answers inferred.
- Prose and mathematical grammar/table content remain editable. Pseudo-code and the Q3.12 basic block use the separate code field. Two tree diagrams use figure-only crops, not whole-question screenshots.
- Shared grammar for Q3.9-Q3.10 is repeated for standalone questions. Preserved Q3.11 and Q3.18 column continuations, Q3.21 page continuation, and Q3.23 column continuation.

## Source issues retained

- Q3.9 option B literally ends at "It detects reduce-reduce conflict, and resolves". Its ending is unresolved; none was invented.
- Q3.10 refers to Part (a); the printed reference is retained with the shared grammar.
- Q3.21 labels both the first and second options (a). Their text and order are preserved as A/B in the app.
- Q3.22 includes P in the non-terminal set although no P production is shown. Preserved verbatim.
- Unresolved question count: 25 because all source answers are missing; Q3.9 also has an incomplete option.

## Safety and read-back

Backup directory: `data/backups/compiler-syntax-2026-10-28/`.

- `inspection.ejson` records the initial absent chapter and existing target.
- Checksummed pre-update snapshot: `before-2026-10-28T13-50-55-446Z.ejson` plus `.sha256`.
- Transaction and unique chapter/target indexes protect creation; full chapter snapshot comparisons protect updates against concurrent edits.
- Existing merge helpers reject unreviewed content/ID collisions. No LAN importer was run.
- `after.ejson` and `verified-source-from-database.json` were read from the actual main database after saving.
- Verified 25 unique IDs, full numbering, exact imported content, source checksum, normalized metadata, empty unknown answers, and working image references.
- All unrelated chapter/target hashes were unchanged during the transaction. Target remained 25.
- Live repeat dry-run found 25 matches and 0 additions, with no retained-content differences. See `repeat-dry-run.json`.
- Existing uncommitted project changes were preserved; this task adds only chapter-specific data, import/inspection/QA scripts and tests.

## Verification and artifacts

- Full suite: 209/209 tests passed outside the Windows sandbox. Initial sandbox-only failures were file permission restrictions.
- Lint passed with `npm run lint -- --ignore-pattern 'tmp/**'`. Plain lint includes an existing generated build under `tmp/compiler-lexical-qa/.next` with a display-name error; it was excluded from source lint.
- Production build passed with `npm run build -- --webpack` outside the sandbox. Initial sandbox prerender was blocked by EPERM creating a build directory.
- App preview: 25 cards, 121 rendered math expressions; zero math errors, unknown commands, raw math, broken images, horizontal overflows or browser errors.
- PDF exports: 20+5 pages, all rendered and visually reviewed. Black background, white text, full-width bodies, one question per page; no text bounds/layout errors.
- Editable LaTeX ZIP independently compiled to 25 pages; all 25 rendered pages are pixel-identical to application-exported PDFs.
- Two diagram crops were visually checked and checksummed in `compiler-syntax-diagrams.json`.
- Output directory: `output/pdf/compiler-syntax/` contains the full `Syntax-Directed-Translations.pdf`, editable LaTeX ZIP, PDF parts ZIP, `preview.html`, editor screenshots, rendered pages and QA JSON reports.

## Repeat import

Dry-run: `node scripts/import-compiler-syntax.mjs`

Apply: `node scripts/import-compiler-syntax.mjs --apply --backup-dir data/backups/compiler-syntax-2026-10-28`

Already imported edits, IDs and locks are retained on repeat. Unexpected legacy records or conflicting matches abort for review.
