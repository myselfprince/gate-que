# Compiler Design / Parsing Techniques import

- Source: `C:/Users/Prince/Desktop/MadeEasy PYQ PDF/10. Compiler Design/2. Parsing Techniques.pdf`
- SHA-256: `b27ddf5121c24c8bf0b87b09640c1d8833ecc00bd58ebe05e4a71e310d590df0`
- Visually inspected all four scanned spreads, with enlarged book pages and a Q2.39 detail crop.
- Coverage: Q2.1–Q2.52, book pages 491–496. Key: PDF page 4, book page 497.
- Excluded the preceding Lexical Analysis material on book page 490 and all explanation content on book page 497.
- Imported 52 new questions into the actual main MongoDB chapter; no pre-existing chapter questions. Existing target was 52 and remains unchanged.
- Types: 45 MCQ, 6 NAT, 1 MSQ. All 52 answers transcribed from the supplied key. No unresolved text or answers.
- Prose, grammar productions and parsing tables remain editable. The syntax-directed action rules in Q2.1 use the separate code field. No question diagrams occur in this source; no screenshot substitutions or image assets are needed.
- Repeated shared passages and linked-question context for standalone exports; preserved all cross-page and column continuations.
- Source caveat: Q2.29 prints “unit productions” with the example A → a. This wording was retained, not silently corrected.

## Database safety and verification

Inspection and checksummed pre-update backups are under `data/backups/compiler-parsing-2026-10-28/`.

- Initial backup: `before-2026-10-28T13-36-51-059Z.ejson` and its `.sha256` file.
- Final visual checking identified a missing minus sign in Q2.39 option B. The isolated repair first backed up the chapter to `before-latex-fix-2026-10-28T13-39-21-380Z.ejson`, checked the exact previous question hash, and updated only that option with a full-document concurrent-edit guard. All other fields, IDs and locks were verified unchanged.
- `after-latex-fix.ejson` is the final chapter snapshot; `verified-source-from-database.json` contains final database read-back used for export QA.
- Original import used a MongoDB transaction and unique chapter identity index; unsafe new legacy/content/ID collisions abort instead of overwriting.
- Read-back verifies 52 unique IDs, complete source numbering, normalized metadata and exact source answers/content. Unrelated chapter/target hashes were unchanged during import.
- Final live repeat dry-run: 52 existing matches, 0 additions, no retained-content differences. See `repeat-dry-run.json`.

## Validation and artifacts

- Full test suite: 204/204 passed outside the Windows sandbox; sandbox-only failures were temporary file rename/symlink permissions.
- Full lint and focused lint for all new JavaScript files passed.
- Production build passed with `npm run build -- --webpack`. Default Turbopack build encounters a worker-start failure in this environment; no unrelated build/configuration changes were made.
- Editor preview: 52 cards, 229 rendered math expressions, no MathJax errors, unknown commands, raw LaTeX, image failures, horizontal overflow or browser errors.
- Export: three parts of 20, 20 and 12 pages. All 52 pages rendered and visually reviewed. No bounds or layout issues; black background and full-width question bodies verified.
- Editable LaTeX ZIP independently compiles to 52 pages; all 52 are pixel-identical to the application PDF export.
- Artifacts: `output/pdf/compiler-parsing/Parsing-Techniques.pdf`, `Parsing-Techniques-Editable-LaTeX.zip`, `Parsing-Techniques-Black-PDFs.zip`, `preview.html`, `export-qa.json`, and `pdf-structure-qa.json`.

## Repeat import

Dry-run: `node scripts/import-compiler-parsing.mjs`

Apply if required: `node scripts/import-compiler-parsing.mjs --apply --backup-dir data/backups/compiler-parsing-2026-10-28`

The importer preserves already imported user edits; rerunning it does not reset them to the printed source.
