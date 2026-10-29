# Algorithms - P and NP Concepts

Imported only `7. Algorithms/5. P and NP Concepts.pdf` on 2026-10-28.
SHA-256: `207c753b90a883fe8a900313be8145b832bf0355cdb70e3f7992f64d8ca64b73`.
The complete one-page scanned spread was rendered at 150/300 dpi and visually
inspected, including both book pages 476-477. Questions 5.1-5.8 are on page 476;
the complete answer key is on page 477. Explanations were excluded.

All eight questions are MCQs, including the combination-of-statements options
in 5.4 and 5.8. Printed answers: A, B, C, A, D, B, A, C. All prose/options,
years, marks and supplied set numbers are editable. Mathematical expressions
use LaTeX. No code, table or shared passage occurs in this source. Q5.5 has
four exact figure-only crops: options A/B at the bottom of the first column
and C/D at the top of the second column, with the exam label after option D.
Reproduce images using `scripts/extract-algorithms-p-np-diagrams.py`;
the companion JSON records bounds, dimensions, page references and checksums.

## Source answer-key conflicts

No text, options or printed answers are missing/unreadable. Two answer-key
conflicts remain for editorial review, recorded in the database source notes:

- 5.1: printed A, even though the reduction direction in B gives the usual
  NP-completeness criterion. The printed explanation also chooses A.
- 5.2: printed B, even though reduction X to an NP-complete Y establishes NP
  membership (option D), not NP-hardness. The explanation also chooses B.

The literal source answers were saved. No replacement answer was invented.

## Main database result

The target chapter was absent on inspection. Initial import added 8, matched 0.
The existing target count 8 was preserved unchanged. A checksummed EJSON backup
of the chapter/target before-state was written before the guarded transaction:

`data/backups/algorithms-p-np-2026-10-28/before-2026-10-28T17-26-33-779Z.ejson`

Unique chapter/target indexes and conditional writes protect concurrent edits
and creation. Any unreviewed existing legacy question causes import to stop.
Read-back checked all 8 source identities, unique IDs, metadata, literal answers,
image references and existing locks/records. Unrelated chapter/target hashes
were unchanged. Live repeat-import dry-run matched 8 and added 0. Synthetic
repeat-import checks also preserve user edits, answers, IDs and locks.

## Verification and exports

All 233 project tests passed. ESLint passed with generated `output/` and `tmp/`
excluded. Default Turbopack builds crashed in worker startup; the documented
`npm run build -- --webpack` production build passed. Concurrent changes to
shared `.next` output required a temporary isolated source copy for export QA.
The main project configuration and existing uncommitted changes were preserved.

Actual PDF/LaTeX routes returned HTTP 200. All 8 editor previews rendered 53
MathJax expressions with no math errors, raw math, missing images or overflow;
browser persistence was intercepted. All eight exported pages were rendered
and visually reviewed: black background, white text, full-width prose, matching
typography and one complete question per page. The four Venn diagram options
are correctly placed. The portable editable ZIP compiled independently;
all eight pages are pixel-identical to the PDF-route output.

Artifacts and QA records: `output/pdf/algorithms-p-np/`.

```powershell
node scripts/import-algorithms-p-np.mjs
node scripts/import-algorithms-p-np.mjs --apply --backup-dir data/backups/algorithms-p-np-2026-10-28
node scripts/verify-algorithms-p-np-export.mjs data/backups/algorithms-p-np-2026-10-28/verified-source-from-database.json output/pdf/algorithms-p-np
python scripts/verify-algorithms-p-np-pdfs.py output/pdf/algorithms-p-np
```

The export verifier accepts `P_NP_QA_ROOT` to point to an isolated production
build when other activity is using the main `.next` directory.
