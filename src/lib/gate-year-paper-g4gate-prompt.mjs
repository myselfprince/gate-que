export function buildG4GatePaperPrompt({ identity, source, file, projectPath, editorPath }) {
  return `Build one complete GATE previous-year paper for G4Gate. Work in the destination project below and process ONLY the selected PDF.

INPUTS
- YEAR: ${identity.year}
- PAPER: ${identity.examPaper}
- SET / SESSION: ${identity.setNum || 'blank — single paper; confirm against the PDF'}
- EXACT SOURCE PDF: ${source.path}
- SOURCE PDF SHA-256: ${file.sha256 || 'Compute before preparing the package and store as sourceSha256.'}
${source.identityNote ? `- SOURCE IDENTITY NOTE: ${source.identityNote}\n` : ''}
Inspect the actual PDF header before deciding the year, paper code and session. Filename metadata is only a starting point. Preserve the physical filename; report any header discrepancy.

DESTINATION PROJECT — THIS IS THE AI CHAT WORKSPACE
${projectPath}
Keep all implementation, prepared paper packages, tests and output artifacts in this project. The editor project below is a read-only reference, not the destination.

READ FIRST
- AGENTS.md and docs/gate-paper-authoring.md.
- docs/gate-papers.md for the central admin, source isolation and student attempt rules.
- Relevant installed Next.js guides in node_modules/next/dist/docs/ before changing application code.

RESOURCES
1. Original paper: ${source.path}
2. Existing G4Gate packages: data/gate-imports/*.json and data/gate-imports/manifest.json. Each package has a paper object and its diagram assets.
3. Read-only editor reference: ${editorPath}. Inspect its data/papers/ JSON, source-book caches and paper-specific build/verification scripts when useful. Never change its book records or database.
4. Made Easy questions and answer keys: C:\\Users\\Prince\\Desktop\\MadeEasy PYQ PDF
   Solution keys: C:\\Users\\Prince\\Desktop\\MadeEasy PYQ PDF\\All Subject Solutions Keys
5. Read-only reference project: E:\\G4Gate_Platform\\gate-pyq-find, including public/data/questions.json. Keep credentials private; prefer local caches.
6. Relevant GATE Overflow discussions: https://gateoverflow.in/.

USE G4GATE'S IMPLEMENTATION
Inspect lib/gate/admin-papers.mjs, admin-package.mjs, admin-server.js, server.js, grading.mjs, paper-assets.mjs, year-papers.mjs and reviews-server.js; models/GateManagedPaper.js, GatePaperSettings.js, GateQuestionReview.js and GateExamAttempt.js; components/gate/admin/; app/admin/gate/; and app/api/admin/gate/.

The paper library/editor is /admin/gate, individual paper review is /admin/gate/papers/<slug>, and student mock tests are /gate. Reuse existing admin login, roles, Pro access rules, paper reader, exam UI and grading. Do not rebuild authentication or change users, subscriptions, timers, leaderboards or unrelated features.

MANDATORY DATA PROTECTION
Never connect development, tests, import scripts or application models to a production database. Keep both MONGODB_URI and any GATE_PAPERS_MONGODB_URI on localhost, confirm their effective hosts without printing credentials, and follow AGENTS.md. The verified local server is on port 27018; do not mix it with the separate 27017 instance.

Never modify, delete, renumber, move, correct or add answers to original book/chapter records. Preserve every existing paper, student response, active attempt, deadline, score, report, account and subscription. Before changing any existing local document or prepared file, save an ignored backup and record deterministic checksums and counts. Verify unrelated records are unchanged afterwards. Do not replace an existing paper identity to bypass duplicate protection.

G4Gate reads source yearpapers/yearpaperassets as read-only. New imports use gate_admin_papers and immutable gate_admin_assets; admin corrections use gate_question_reviews, and paper settings use gate_admin_paper_settings. Do not write this paper into the source yearpapers collection or switch the tracker to the editor's database URI. Existing admin imports are add-only. If this paper already exists, inspect it, preserve its IDs/keys and diagnose any incomplete copy; prepare a correction through the supported review workflow rather than overwriting its base dataset or attempts.

1. ESTABLISH THE REAL PAPER STRUCTURE
Read the complete selected PDF and verify every original position, section, numbering, question type, marks, maximum score, duration, optional-question limits, linked prerequisites and documented negative marking. Do not assume every year has 65 questions or 100 marks. Include aptitude only when it belongs to this actual paper; 15 aptitude marks do not necessarily mean 15 aptitude questions. Never add questions from another year, paper or session. If an old grading rule cannot be verified, disclose the practice rule instead of claiming it is official.

2. REUSE CONTENT WITHOUT CHANGING ITS SOURCES
Search existing packages, read-only book records/caches and the selected source PDF for exact matches. Match full text, code, option order and diagrams, not just year tags or book numbering. Identify duplicates, missing questions, source defects and transcription/marks differences. Give the new paper its own canonical datasetId, independent question IDs/keys and provenance. Correct differences only in its independent prepared copy. Report copied-versus-added counts. For DA, extend the destination's CS/IT-only validators and labels if necessary; never relabel a DA paper as CS.

3. COMPLETE EVERY QUESTION AND ANSWER
Transcribe all missing questions, including historical/descriptive and out-of-syllabus items. Preserve shared passages, multipart and linked questions, tables, code, math, actual diagrams and original option order. Prefer editable text/math/code, with clean crops for diagrams. Keep both displayed and historical identifiers when different.

Provide a verified key or worked reference for every question. Prefer official keys where available, compare supplied Made Easy keys and relevant GATE Overflow discussions, and independently check numerical results and program traces. Match each key to the final option order. Record answer sources, page/link, verification status and source disagreements. Never fabricate missing keys, links, official rules or verification claims. Preserve flawed/ambiguous questions with an explanatory special note and explicit manual review. Distinguish authored references from official answers. Retain documented all-candidate awards and linked-answer rules rather than guessing replacements. Use post-submission self-assessment for written responses when appropriate.

4. PREPARE THE IMPORTABLE PACKAGE IN THIS PROJECT
Use data/gate-imports/<canonical-slug>.json with format g4gate-paper-package-v1, a complete paper object, and assets containing immutable SHA-256 IDs and base64 image data. Retain the selected PDF's exact sourceSha256 on paper. Use the existing assetManifest schema, safe relative image paths, actual MIME signatures, bounded image sizes and every required diagram/option image. Do not depend on image files that exist only in the editor project.

Update data/gate-imports/manifest.json with exactly one matching entry: slug, title, year, examPaper, setNum, questionCount, totalMarks and imageCount. Preserve all other entries and packages. Use lib/gate/admin-package.mjs validation; run tools/validate-gate-paper-package.mjs on the package with --source-pdf pointing to the selected PDF, and run --all to check all previously prepared packages. A manifest flag or a copied prompt is not proof of completion.

5. TEST THE REAL G4GATE WORKFLOW LOCALLY
Use the destination's own dev port and report it; do not stop another app just to claim port 3000. Verify /admin/gate and /gate. Test importing the new package with the existing admin APIs against an isolated localhost database only. Confirm duplicate imports refuse replacement; signed-out/non-admin callers cannot manage papers; admin roles can read diagrams; student APIs enforce existing access and attempt ownership; active responses contain no keys or worked solutions; and images, original order, sections, optional limits, calculator, timer, autosave, refresh/resume, submit, scoring, answer review and written self-assessment work.

Do not alter existing active attempts or recalculate unrelated scores. Explicit verified answer corrections may update compatible submitted results through the existing guarded refresh flow, preserving saved responses and avoiding double-counted self-assessment. Link/explanation edits must not rewrite student grades.

6. MATCHING PDF EXPORTS — DO NOT ASSUME THEY ALREADY EXIST HERE
The current G4Gate admin exports portable paper JSON with images. The old editor's LaTeX/PDF pipeline is a read-only reference, not an installed G4Gate PDF feature. Inspect ${editorPath}\\src\\lib\\year-paper-export.mjs and related renderer/tests if needed, then adapt or implement the required pipeline inside this destination project.

Produce a dark question PDF, a print-friendly question PDF, a separate answers-and-worked-solutions PDF, and a ZIP. Use original order, one question per page, readable math/code and complete diagrams. Question PDFs must hide keys. Expose appropriate authenticated downloads through G4Gate if this workflow requires downloads. Keep generated outputs in ignored local output folders; do not claim PDF/export support merely because the JSON package validates. If a compiler dependency is unavailable, preserve completed work and state the exact limitation honestly.

7. VERIFY, HAND OFF FOR SAFE LIVE IMPORT, AND REPORT
Check source coverage, numbering, option order, marks, key/reference coverage, choices, links and asset checksums. Render and visually inspect final PDFs and relevant browser screens; verify page counts, every answer entry and text bounds. Run relevant regression tests, all-package validation and a production build. Ensure old packages, original source records and unrelated student data are unchanged.

Complete the paper, package, local import/test integration and requested exports rather than stopping at a plan. For live publication, prepare and deploy the server-side package/manifest changes through the project's authorized code workflow. Do not run production DB scripts or silently import/overwrite production data. The existing G4Gate administrator can add a missing package from https://g4gate.com/admin/gate using Add previous-year paper; an existing identity must use the supported review process. State whether live import actually occurred. A prepared package is not proof that it is already imported in production.

Report the destination project, actual local /gate and admin URLs, selected PDF and verified identity, questions/sections/duration/marks, copied-versus-added counts, answer verification and manual-review items, sourceSha256, package and export paths, preserved-data checksums, actual test/build results and any exact remaining live-admin step. The prompt tracker verifies local prepared-package readiness; it does not certify the live production database.

Proceed autonomously within this scope. Ask only when an unresolved ambiguity materially prevents identifying or completing this exact paper.
`;
}
