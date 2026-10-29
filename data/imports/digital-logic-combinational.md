# Combinational Circuits import — 28 October 2026

Source: `C:/Users/Prince/Desktop/MadeEasy PYQ PDF/9. Digital Logic/2. Combinational Circuits.pdf`

SHA-256: `3fb94a04cc0c2153efc11e29861411a10df92ba788b5d37010485da84becc37a`

All three scanned spreads were rendered at 3000 pixels wide and visually read,
including every column. Book pages 212–216 contain Q2.1–Q2.35; book page 217
(PDF page 3) contains the complete answer key and the supplied Q2.3 circuit
solution. Explanations are excluded from the question text. Q2.3 and Q2.34
continue across columns; Q2.8, Q2.15 and Q2.32 continue across facing pages.

There are 35 questions: 30 MCQ, one MSQ (Q2.6, key B/C), three NAT (Q2.27 = 12,
Q2.30 = -1, Q2.35 = 4) and one historical subjective question (Q2.3). The
Q2.3 answer is an editable transcription of the supplied solution circuit's
data-input and select-input connections. No answer or text fields are missing.

Prose and formulas remain editable. Both truth tables are LaTeX arrays. Q2.26
uses the separate code field. Twenty checksum-guarded figure-only crops retain
circuit wiring, arrows and labels, including four diagram options for Q2.32.
The manifest records PDF pages, original pixel bounds and exterior prose masks.

Source anomalies are preserved: Q2.17 has grouped complement notation and a
blue mark over printed key B. Q2.34's printed Boolean function appears
inconsistent with the listed input combinations and key C. Both retain the
printed text/key with explicit source notes; their mathematical correctness is
not silently repaired. Q2.14's awkward printed majority-function wording is
also retained.

The actual main database chapter was absent. The guarded transaction added all
35 questions, retaining deterministic IDs and the existing target of 35. No
other chapter or completion target changed. Before-state EJSON, SHA-256 sidecars,
after-state and read-back records are in
`data/backups/digital-logic-combinational-2026-10-28/`.

Editor QA found unsupported MathJax `\multicolumn` in Q2.24's initial table
headings. An equivalent array heading fixed it without changing table values.
The exact original record was checked before this targeted correction; a
second backup and a whole-chapter compare-and-set protected concurrent edits.
`scripts/fix-combinational-table-preview.mjs` is a guarded, repeat-safe record of
that repair. Shared application/export helpers were not modified.

Final live database read-back verified all 35 source identities, unique IDs,
metadata, printed answers and image references. A live repeat-import dry-run
matched 35 and added zero. Unit tests also verify user text/answer edits and
position locks survive repeated imports, while unreviewed collisions stop.

Validation: all 159 project tests, ESLint and the production build passed.
The existing export routes produced two PDF parts (20 + 15 pages), a complete
35-page black-background/white-text PDF, and a portable editable LaTeX ZIP with
all 20 images. All 35 editor previews rendered 151 math expressions with no
MathJax errors, raw commands, broken images or horizontal overflow. Browser
autosave/preference requests were intercepted during preview QA.

Every exported PDF page was rendered and visually reviewed. One question per
page, full-width prose, typography, tables, code and diagrams were checked.
The editable ZIP compiled independently; all 35 rendered pages are pixel-equal
to the corresponding route-exported PDF pages. PDF layout warnings: zero.
Outputs, previews, contact sheets and QA reports are in
`output/pdf/digital-logic-combinational/`.

```powershell
python scripts/extract-combinational-diagrams.py
node scripts/import-digital-logic-combinational.mjs
node scripts/import-digital-logic-combinational.mjs --apply --backup-dir '<backup-dir>'
node scripts/verify-combinational-export.mjs '<backup-dir>/verified-source-from-database.json' '<output-dir>'
python scripts/verify-combinational-pdfs.py '<output-dir>'
```

Use the bundled Python runtime with pdfplumber/Pillow and working Poppler and
MiKTeX commands for the PDF QA script. Windows sandbox restrictions initially
blocked dependency junctions, test filesystem operations and database DNS;
rerunning the required commands with normal authorized access passed.
