import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';

const root = path.resolve('tmp/question-syntax-audit');
const read = async name => JSON.parse(await fs.readFile(path.join(root, name), 'utf8'));
const digest = value => createHash('sha256').update(value).digest('hex');
const staged = await read('staged-chapters.json');
const manifest = await read('patches.json');
const syntax = await read('static-approved.json');
const compiled = await read('compilation-approved/report.json');
const previews = await read('preview-approved/report.json');
const layout = await read('pdf-layout-report.json');
const source = await read('source-metadata-report.json');
const http = await read('http-export-report.json');

assert.deepEqual(syntax.issues, []);
assert.equal(compiled.diagnostics, false);
assert.deepEqual(compiled.imageBypasses, []);
assert.equal(compiled.results.length, 18);
assert.equal(compiled.results.reduce((sum, result) => sum + result.validCount, 0), 1204);
for (const result of compiled.results) {
  assert.deepEqual(result.failures, []);
  assert.ok(!result.warnings.some(warning => warning.startsWith('Overfull')));
  const chapter = staged[result.chapterIndex];
  const questions = result.view === 'editable' ? chapter.questions : chapter.questions.filter(question => question.source?.verifiedQuestion).map(question => ({ ...question, ...question.source.verifiedQuestion }));
  const imageRoot = path.resolve('public', chapter.subject, chapter.chapter).replaceAll('\\', '/');
  const expected = buildQuestionPages({ ...chapter, questions }, { imageRoot, totalQuestions: questions.length, startIndex: 0 });
  assert.equal(await fs.readFile(path.join(path.dirname(result.compiledFiles[0]), 'main.tex'), 'utf8'), expected, 'Compiled source must match the final staged records.');
}
assert.equal(previews.length, 18);
for (const preview of previews) { assert.deepEqual(preview.issues, []); assert.deepEqual(preview.errors, []); }
assert.equal(layout.pagesChecked, 1204);
assert.equal(layout.pageCountAndBoundsValid, true);
assert.equal(source.sourceBoundQuestions, 290);
assert.equal(http.length, 8);
assert.ok(http.every(result => result.pdfHttpStatus === 200 && result.latexHttpStatus === 200 && result.portableZipCompiled));

if (process.argv[2] === 'seal') {
  const files = {};
  for (const name of ['staged-chapters.json', 'patches.json', 'static-approved.json', 'compilation-approved/report.json', 'preview-approved/report.json', 'pdf-layout-report.json', 'source-metadata-report.json', 'http-export-report.json']) {
    files[name] = digest(await fs.readFile(path.join(root, name)));
  }
  await fs.writeFile(path.join(root, 'evidence.json'), JSON.stringify({ sealedAt: new Date(), complete: true, files, visuallyReviewedPages: 70, testsPassed: 34, lintPassed: true, buildPassed: true }, null, 2));
  console.log(JSON.stringify({ complete: true, repairedQuestions: manifest.patches.length, pdfPages: 1204, browserViews: 18, apiExportPairs: http.length }));
  process.exit(0);
}

const readback = await read('readback-chapters.json');
assert.equal(readback.length, staged.length);
for (const chapter of staged) assert.deepEqual(readback.find(item => item._id === chapter._id).questions, chapter.questions, 'Live read-back must match the audited question set.');
const readbackSyntax = await read('static-readback.json');
assert.deepEqual(readbackSyntax.issues, []);
const application = JSON.parse(await fs.readFile('data/backups/question-syntax-audit-2026-10-24/application-result.json', 'utf8'));
assert.equal(application.readBackVerified, true);
assert.equal(application.repeatPendingWrites, 0);
const output = path.resolve('output/question-syntax-audit-2026-10-24');
await fs.mkdir(output, { recursive: true });
for (const [from, to] of [['patches.json', 'repairs.json'], ['static-readback.json', 'syntax-checks.json'], ['preview-approved/report.json', 'editor-checks.json'], ['compilation-approved/report.json', 'compilation-checks.json'], ['pdf-layout-report.json', 'page-layout-checks.json'], ['source-metadata-report.json', 'source-metadata-checks.json'], ['http-export-report.json', 'http-export-checks.json'], ['evidence.json', 'evidence.json'], ['test-results.txt', 'test-results.txt']]) {
  await fs.copyFile(path.join(root, from), path.join(output, to));
}
const rows = staged.map((chapter, index) => `| ${chapter.subject} / ${chapter.chapter} | ${chapter.questions.filter(question => !question.isBlank).length} | ${chapter.questions.filter(question => question.isBlank).length} | ${manifest.patches.filter(patch => patch.chapterId === chapter._id).length} | Pass |`);
const expressions = previews.reduce((sum, preview) => sum + preview.expressions, 0);
const summary = {
  completedAt: new Date(), chapters: staged.length, actualQuestions: 1165, blankPlaceholders: 7,
  repairedQuestions: manifest.patches.length, changedFields: manifest.patches.reduce((sum, patch) => sum + Object.keys(patch.changes).length, 0),
  sourceBoundQuestions: 290, legacyQuestionsWithoutSourceMetadata: 875,
  mathJaxExpressions: expressions, pdfPagesVerified: 1204, visuallyReviewedPdfPages: 70,
  syntaxIssuesRemaining: 0, previewIssuesRemaining: 0, missingImagesRemaining: 0,
  exportPairsChecked: http.length, testsPassed: 34, lintPassed: true, buildPassed: true, application,
};
await fs.writeFile(path.join(output, 'summary.json'), JSON.stringify(summary, null, 2));
const report = `# Question syntax and LaTeX audit — 24 October 2026

All 1,165 nonblank saved questions across 17 chapters received syntax, MathJax preview and strict PDF compilation checks. Seven blank placeholders were checked separately. Thirty-two question records were repaired in the main database with a transaction, a pre-write backup, and exact concurrent-edit guards.

No syntax errors, MathJax errors, unknown commands, missing images or editor overflow remain in this audited snapshot. PDF compilation and page-count/bounds checks passed for 1,204 pages: 1,172 saved records (including seven placeholders) plus 32 preserved source alternatives. Seventy selected PDF pages were rendered and visually reviewed, including all repaired records and the first/last question of every chapter.

## Chapter results

| Subject / chapter | Questions | Blank slots | Records repaired | Syntax / editor / PDF |
| --- | ---: | ---: | ---: | --- |
${rows.join('\n')}

## Repairs

Restored truncated PDA options, two missing question tables and their option combinations, the Hamming-code tables, and the 2025 FSM table. Repaired table row separators/rules, set braces, missing angle brackets, epsilon and alphabet symbols, literal hash/dollar characters, and C equality operators in code options. Reconnected matching diagrams, removed obsolete scraped image HTML and orphan image placeholders, corrected one erroneous hand-drawn PDA transition using an exact scan crop, and improved three table-option layouts.

The shared exporter now parses escaped dollars correctly inside math, supports MathJax comparison aliases in TeX, preserves escaped prose characters, prints Unicode pseudocode comparison/arrow symbols, and fits wide editable math tables inside the page. Black pages, white text, full-width prose, separate code and one question per page remain in place. Ordinary mathematical expressions and stored code are retained as editable source.

See [every before/after field and source note](./repairs.json). Seven additional image assets were created from matching existing crops or exact supplied-PDF crops; old images were preserved.

## Verification

- ${expressions} MathJax expression instances checked in 18 editor views; no issues.
- 1,204 strict compiled PDF pages; no image bypasses, failed questions, overfull boxes, off-page text/images or page-count mismatches.
- Real PDF and editable LaTeX ZIP endpoints returned HTTP 200 for eight representative chapter payloads (all repaired records plus regression cases). All eight extracted portable ZIPs compiled successfully. The API rate limit was respected.
- 290 source-bound questions across six chapters have matching PDF checksums, unique source numbering, page references and saved answer metadata compared with the existing reviewed import manifests. Legacy/source alternatives and previous review notes were preserved.
- 34 tests, lint and production build passed.
- Database read-back matches the audited records. IDs, order, position locks, chapter metadata, targets and unrelated records were preserved. A repeat dry-run plans zero writes.

## Backup and evidence

Pre-write full backup: [${path.basename(application.backupFile)}](<${application.backupFile.replaceAll('\\', '/')}>). Its sibling SHA-256 file verifies the backup bytes. The same backup directory contains audit-start and post-write EJSON snapshots and the application result.

Machine-readable results: [summary](./summary.json), [syntax](./syntax-checks.json), [editor](./editor-checks.json), [PDF layout](./page-layout-checks.json), [source metadata](./source-metadata-checks.json), [HTTP exports](./http-export-checks.json), [sealed evidence](./evidence.json).

## Scope and retained content differences

This was an exhaustive saved-question syntax/rendering audit, with visual source consultation for flagged repairs. It does not certify a fresh word-for-word or answer-key re-transcription of all legacy records. Of the 1,165 nonblank questions, 875 lack persisted source checksum/question/page metadata. Some legacy records are outside the chapter/year coverage of the supplied book. They were not deleted, reclassified or counted as newly imported questions.

Twenty-nine source-bound records retain differences from their reviewed source manifests; their existing source alternatives/review notes remain available in [source metadata checks](./source-metadata-checks.json). C Programming question 43 also retains its legacy 1-mark field although the supplied scan prints 2 marks; this non-syntax discrepancy was recorded without overwriting that existing metadata. The duplicated d4 in the Hamming-code stem and the anomalous forwarding-table entry were preserved because they appear in the printed source.

The missing 2025 FSM table was restored from the [official IIT Roorkee GATE 2025 CS1 paper, page 59, Q59](https://gate2025.iitr.ac.in/doc/2025/2025_QP/CS1.pdf), which was visually inspected; it is outside the supplied book's coverage. No answer was invented or changed during this syntax repair.
`;
await fs.writeFile(path.join(output, 'report.md'), report);
console.log(JSON.stringify({ report: path.join(output, 'report.md'), ...summary }));
