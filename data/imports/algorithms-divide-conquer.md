# Divide and Conquer: reviewed PDF import

Source: `7. Algorithms/2. Divide and Conquer.pdf`, SHA-256
`9f7deecd91fd52146914409e245a924f7b772c0abaa9441449978e45b74f1672`.
All four scanned spreads were rendered and visually reviewed. Q2.1-Q2.50
occupy book pages 435-440. The full answer key is on PDF page 4 / book page
441. Previous-chapter explanations on book page 434 and explanations below
the chapter key are excluded.

There are 45 MCQs, one MSQ (2.49, with only D in the printed key), and four
NATs (2.32, 2.41, 2.42, 2.50). No text or answers are missing. Three source
issues remain explicitly flagged in question metadata:

- Q2.32: the key gives 162 for 100 numbers; the optimal comparison count is
  148. The printed answer is preserved for editorial review.
- Q2.37: the partition return-value description conflicts with its use as a
  pivot index in the caller. Both are retained as printed.
- Q2.41: the summation lower limit is k=1 despite S(i,j) and zero-based
  bounds. The formula and printed answer 29 are retained.

The linked Q2.20/21 program crosses book pages 436-437; Q2.37's program
crosses pages 438-439. Programs are separate editable code fields. Shared
directions accompany all dependent questions. Q2.46's array remains editable
LaTeX, and Q2.50 uses one checksum-guarded graph-only crop. The graph questions
stay in the original chapter and order.

The main chapter was absent at initial inspection. The importer added 50
records and retained the existing target of 50. It reuses the reviewed merge,
stable IDs, source identities, metadata validation and export helpers.
Unexpected legacy records and unreviewed content/ID collisions stop the import.
A checksum-protected EJSON backup precedes the transaction. Exact content,
revision and lock checks protect existing chapters; the unique identity index
and insert-only upsert protect concurrent chapter creation. Repeat imports
preserve edits and locks and add zero records.

```powershell
# Use the bundled Python runtime when pypdfium2 is not in system Python.
python scripts/extract-algorithms-divide-conquer-diagram.py
node scripts/import-algorithms-divide-conquer.mjs
node scripts/import-algorithms-divide-conquer.mjs --apply --backup-dir data/backups/algorithms-divide-conquer-2026-10-28
node --test tests/algorithms-divide-conquer-import.test.mjs
node scripts/verify-algorithms-divide-conquer-export.mjs data/backups/algorithms-divide-conquer-2026-10-28/verified-source-from-database.json output/pdf/algorithms-divide-conquer
python scripts/verify-algorithms-divide-conquer-pdfs.py output/pdf/algorithms-divide-conquer
```

The database read-back passes source/content coverage, unique IDs, metadata,
printed answers, image references, existing-record preservation and repeat
merge checks. The separate live repeat-import dry run adds zero records and
matches all 50. Unrelated chapters/targets and the existing target are unchanged.

All 50 editor previews pass: 288 rendered MathJax expressions, no math errors,
unknown commands, raw math, broken images, JavaScript errors or horizontal
overflow. Preview browser persistence is intercepted so editor QA cannot save
into the main database or modify preferences. The temporary QA server uses
port 3112. Actual export routes produce three parts (20 + 20 + 10 pages) and
the matching editable LaTeX ZIP using the existing format and helpers.

All 50 exported pages were rendered and visually inspected. Structural checks
confirm black backgrounds, white text, full-width bodies, source numbering,
page bounds and one complete question per page. Independent ZIP compilation
matches all 50 layouts: 49 pages are pixel-identical, while Q2.21 has 187
antialiasing pixels affected by a maximum 0.009565pt glyph-position rounding
difference. The comparator requires identical text, fonts and colors and limits
geometry differences to 0.02pt and changed pixels to 0.05% of the page. This
measured rounding is documented rather than called pixel-identical. There are
no layout errors. No application schema or export-helper changes were needed.

The full test suite passed (150 tests at the time of the run), lint passed,
and the production build passed. Sandbox-only temporary-file/junction and
MiKTeX registry access restrictions were resolved by running those checks in
the approved unrestricted execution environment.

Backups and read-back: `data/backups/algorithms-divide-conquer-2026-10-28/`.
Exports, preview captures and rendering QA: `output/pdf/algorithms-divide-conquer/`.
