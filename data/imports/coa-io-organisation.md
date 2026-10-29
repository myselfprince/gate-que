# IO Organisation source audit

Subject: `4. COA`. Chapter: `5. IO Organisation`.

Source: `C:/Users/Prince/Desktop/MadeEasy PYQ PDF/4. COA/5. IO Organisation.pdf`.
SHA-256: `2206ec80774b9fdf9dc4d6593efd04fad40891a0fe152768b536b4d767d97d1e`.

All three scanned PDF spreads were rendered and visually inspected. The import covers all 34 questions, 5.1–5.34, in printed order: 28 MCQs, one MSQ and five numerical questions represented as NAT. No official numerical answer ranges are supplied, so none were invented.

| Questions | PDF pages | Book pages |
| --- | --- | --- |
| 5.1–5.9 | 1 | 303 |
| 5.10–5.19 | 2 | 304 |
| 5.20 | 2 | 304–305 |
| 5.21–5.27 | 2 | 305 |
| 5.28 | 2–3 | 305–306 |
| 5.29–5.34 | 3 | 306 |

Book page 302 belongs to the preceding chapter's explanations and is excluded. Book page 307 contains the answer key and explanations; these are not imported as questions. Answers come from its printed key. For 5.7, the key says “Sol.” and the supplied explanation explicitly gives all four options, retained as MSQ.

Shared passages are repeated for 5.11/5.12 and 5.22/5.23 so independent exports remain complete. The matching table in 5.4 is editable LaTeX. The program in 5.25 is in the separate code field. Only the diagram in 5.8 is an image crop, at `public/4. COA/5. IO Organisation/coa-io-5-8-control-memory.png`.

## Source issues retained for review

- **5.25: one unresolved text item.** The printed final sentence ends “from interrupt driven program based input-output?” and omits the explicit comparison being requested. The available wording and answer A (3.4) are preserved; no missing prompt was invented. The program's printed typo “Decrement the court” is also preserved and noted.
- **5.1: answer-unit inconsistency.** The stem asks for bytes per second; the numeric key gives 30 and the supplied explanation labels it 30 Kbps. The stored numeric answer is the printed 30, with the discrepancy recorded in source notes.
- **5.5 and 5.21:** printed answer C is retained for each, despite apparent disagreement with their content; no inferred answer replaces the supplied key.
- **5.9:** the supplied explanation includes an intermediate 0.19% and ends with 0.10%; the printed key D is preserved.

All 34 supplied answers are present. These warnings concern the source, not missing imported options or inferred answers.

## Database and repeat-import verification

The main database chapter was absent before import. The existing target was already 34 and remained unchanged. A pre-write EJSON backup and SHA-256 sidecar are in `data/backups/coa-io-organisation-2026-10-28/`. The import added 34 records and matched zero existing records. A subsequent live read-only dry run matched all 34 and added zero.

The importer uses the existing reviewed merge helper, deterministic IDs, source checksum/question identity, pre-write backup, a MongoDB transaction and a unique chapter index. It rejects unreviewed collisions or concurrent chapter creation. It preserves existing records/locks and checks unrelated chapter/target hashes. Repeat imports preserve subsequent user edits.

```powershell
node scripts/import-coa-io-organisation.mjs
node scripts/import-coa-io-organisation.mjs --apply --backup-dir data/backups/coa-io-organisation-2026-10-28
```

The apply operation was completed and read back from the actual main database. The read-back export is `data/backups/coa-io-organisation-2026-10-28/verified-source-from-database.json`.

## Export and checks

Artifacts are in `output/pdf/coa-io-organisation/`: a combined 34-page PDF, 20/14-page PDF parts, an editable LaTeX ZIP, all editor screenshots and all rendered question pages. Existing export helpers and design are unchanged. All 34 final PDF pages were visually inspected. The extracted editable ZIP compiled successfully and all 34 pages were pixel-identical to the PDF export. Bounds, black background, white text, image references, metadata, source coverage and unique IDs passed. Editor rendering had 71 math expressions, zero math errors, zero broken images and zero overflow.

Validation: 150/150 tests passed, lint passed, production build passed. Windows sandbox restrictions initially prevented the existing filesystem tests and Next.js junction creation; the normal-permission reruns passed. No application/schema/export refactor was needed.
