# Greedy Method: reviewed source import

The six scanned PDF spreads of `7. Algorithms/3. Greedy Method.pdf` were
visually inspected, including higher resolution half-spreads. The import
covers Q3.1-Q3.80 in printed order, book pages 447-456. The previous chapter's
explanations on book page 446 and the Greedy explanations on page 457 are
excluded from question content. The complete answer key is on PDF page 6 /
book page 457; Q3.1's reference answer comes from its supplied explanation.

Source SHA-256:
`a92eb7d6acfa00d9f6891c2b63110e4f284f3cef99be07ce127ec4910b55b91a`.

There are 62 MCQs, 3 MSQs (3.67, 3.71, 3.74), 14 NATs and one historical
subjective fill-in (3.1, reference answer `O(m+n)`). No source text, options or
printed answers are missing. The 22 diagram-only PNG crops are reproducible
with the checksum-guarded crop script; their coordinates and hashes are in
`algorithms-greedy-diagrams.json`. Prose, tables and formulas are editable.
There are no source program listings. Shared and linked data accompanies
each dependent question, including the preceding question's choices where
needed. Q3.8, 3.16, 3.35 and 3.69 preserve page continuations.

Four source answer/formulation conflicts remain flagged in per-question
source notes. The supplied key is retained rather than silently corrected:

| Question | Source issue |
| --- | --- |
| 3.2 | Printed key B conflicts with the displayed distinct-weight statement. |
| 3.19 | Printed key C is Heap; the linear-time unweighted wording suggests Queue. |
| 3.38 | Printed key D omits the maximum with Y in the displayed formulation. |
| 3.66 | Source prints `w'(u,v)=w(u,v)+f(v)` without a potential-difference term, yet gives D. |

Other printed defects are preserved with notes: Q3.5's `a_a` start marker,
Q3.11/22's mislabelled options, Q3.27's missing word, Q3.28/29's probabilities
summing to 31/32 and Q3.45's `SVDT` option despite no V in the graph. Questions
on rod cutting and directed spanning trees remain in their printed chapter.

The main chapter was absent and its existing target was 80. The import added
80 records, matched zero prior questions, and preserved the target. The
existing reviewed merge provides stable IDs and source identity checks;
unreviewed content/ID collisions stop for review. EJSON backups with checksums,
transactions and exact concurrent-edit guards protect writes. Other chapters
and targets were verified unchanged during both database updates.

An additional protected formatting correction replaced Q3.10's unsupported
MathJax multicolumn header with a compatible editable array header. Its full
before/after snapshots are under the `rendering-fix` backup directory. All
question content, choices, answers, IDs and locks are preserved.

```powershell
python scripts/extract-algorithms-greedy-diagrams.py
node scripts/import-algorithms-greedy.mjs
node scripts/import-algorithms-greedy.mjs --apply --backup-dir data/backups/algorithms-greedy-2026-10-28
node --test tests/algorithms-greedy-import.test.mjs
node scripts/verify-algorithms-greedy-export.mjs data/backups/algorithms-greedy-2026-10-28/rendering-fix/verified-source-from-database.json output/pdf/algorithms-greedy
python scripts/verify-algorithms-greedy-pdfs.py output/pdf/algorithms-greedy
```

Actual database read-back passed coverage, IDs, metadata, answers and image
checks. The live repeat-import dry-run matched 80 and added zero. Preview QA
checked all 80 editor cards and 472 MathJax expressions with no errors, raw
math, overflowing questions or broken images. PDF QA checks all 80 pages in
four 20-page parts, black backgrounds, white text and full-width editable
bodies. Independent compilation of the portable LaTeX ZIP is compared pixel
by pixel against the PDF route. Artifacts and QA reports are under
`output/pdf/algorithms-greedy/`; backups are under
`data/backups/algorithms-greedy-2026-10-28/`.
