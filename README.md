
---

# 🚀 GATE CSE PYQ Pipeline: The Ultimate Question Engine

Welcome to the **GATE CSE PYQ Pipeline**! This is a full-stack Next.js application designed to act as an automated, end-to-end factory for collecting, cleaning, organizing, editing, and exporting Previous Year Questions (PYQs) for Computer Science exams.

## Run locally

1. Install Node.js 22.13 or later, MongoDB access, a TeX installation that provides `pdflatex`, and the browser dependencies required by Puppeteer.
2. Copy `.env.example` to `.env.local` and enter your two MongoDB connection strings. For local development, authentication is disabled by default to preserve the existing one-user workflow.
3. Run `npm ci`, then `npm run dev`.

Run `npm run lint` and `npm run build` before deployment.

The workspace separates **Question editor**, **PDF & LaTeX**, and **YouTube
studio** into tabs. Use **Save to database** to save question edits. YouTube
studio has separate **Title & description** and **Thumbnails & cutout** views.
**Questions to load** defaults to **All questions**. Click **Load Database** to
load the full chapter, or choose a smaller batch when needed.

For YouTube, choose a question and enter a specific focus topic to generate
three title choices, a unique description, and relevant tags. Customize channel
branding, website/playlist links, a footer, and whether to include the question
or its stored NAT answer. Copy the title, description, tags, or the full upload
pack. Export the current question or chapter as JSON, CSV, or TXT. JSON retains
`video_title`, `timestamp_title`, and `index`, and adds description, tags, stable
question IDs and matching thumbnail filenames. Blank placeholders are skipped
without renumbering the remaining questions. Generated titles fit 100 characters;
descriptions fit 5,000. Custom copy over the limit is flagged before exporting.
Descriptions contain no invented timestamps or links. Review the generated copy
against the actual video before publishing; keywords do not guarantee rankings.

In **Thumbnails & cutout**, choose a full-question or large-topic layout, theme,
accent, branding, text position and width. Upload a transparent PNG cutout, then
drag it in the preview or use the position/size/opacity controls. Arrow keys move
the focused cutout; flip and left/right presets are available. Presets position
the text opposite the cutout. This placement applies to all chapter thumbnails.
Download one PNG or a chapter ZIP at 1280×720, 1920×1080 or 3840×2160. Filenames
match the YouTube metadata export. Blank placeholders and stored NAT answers are
optional. Long questions auto-fit, with a warning if text becomes small. Preview
and exports use the same renderer; missing diagrams stop export with an error.
The existing variable-height question-card ZIP remains under **Question image
export**. Thumbnail generation needs Chrome/Puppeteer and access to the existing
MathJax CDN, just like the question preview.

YouTube copy, defaults and thumbnail design are saved in this browser's local
storage; the resized PNG cutout is saved in IndexedDB with transparency intact.
These creator settings are separate from **Save to database** and do not sync
between browsers. Use the downloadable metadata and PNG/ZIP files for backups.

Open **Diagram studio** from the editor, or visit `/diagram-maker`. Its SVG
canvas includes 48 symbols: AND/OR/NOT/NAND/NOR/XOR/XNOR gates, buffers,
MUX/DEMUX, encoders/decoders, adders, multipliers, ALUs, registers, counters,
flip-flops, memory, clock/ground, DFA/NFA and graph states, flowchart shapes,
tables, linked-list nodes, stacks and electrical symbols. Multi-input gates,
MUX/DEMUX and bus widths are configurable up to 64. Drag a library symbol onto
the canvas or click to add it. Click/drag between pin circles to connect; wires
stay attached when symbols move or rotate. Use **Connect** and click states
to add labelled transitions, including self-loops. Select wires to choose
straight, right-angle or curved routes, arrowheads, labels, colours and bends.

Ready templates include half/full adders, a DFA, an epsilon-NFA, MUX/DEMUX,
multiplier, flip-flop, flowchart, truth table, linked list and binary tree.
Double-click a symbol to edit its label or table cells. Tables also accept
tab-separated clipboard data. The Math/epsilon library inserts logic, set,
Greek and arrow symbols. Freehand, rectangle, ellipse, line, arrow, text and
erase tools support annotations. Shift-click or drag a selection box to select
several symbols; move, duplicate, align or distribute them together. Wheel
zooms, Space-drag pans, arrow keys nudge, and Ctrl/Cmd-Z undoes changes.
Moving a complete circuit also moves its internal wire bends. Feedback wires
between different pins on one digital block route around the block; automatic
right-angle connections respect pin orientation, including rotated symbols.

Export cropped artwork or a full artboard as editable SVG, high-resolution PNG,
clipboard PNG or project JSON. Choose a theme, white or transparent background;
editing handles/grid dots are omitted. Browser autosave preserves the active
draft; **Save project** keeps up to 20 local snapshots. JSON import/export moves
projects between browsers and provides backups. The project format supports
500 symbols, 1,500 connections and bounded tables/drawing data. Creator drafts
and snapshots are local to this browser, separate from the question database.

**K-Map studio** at `/kmap-maker` supports 2–6 variables, with Gray-code axes
and separate 4-variable panels for 5/6-variable maps. Enter minterms/maxterms
and don't-cares, paint or drag across cells, edit the truth table, undo a paint
stroke, and display minterm numbers or variable expressions. Manual groups are
checked for power-of-two size, Boolean adjacency, compatible cell values and
wrap-around/panel membership. SOP/POS simplification uses prime implicants and
a bounded minimum-cover search; a capped search is labelled explicitly. Fill
all blank cells before simplifying. Suggested groups can be displayed on the
map; copy the resulting expression or LaTeX. Export SVG, PNG, standalone TikZ
source, editable JSON or a truth-table CSV. Browser drafts restore on refresh.
**Add to diagram studio** places the map alongside the existing artwork as a
vector object. Double-click that object to edit its cells in K-Map studio, then
send it back to update the same object; the diagram's other artwork is kept.

PDF export offers a complete chapter PDF and a ZIP of 20-question parts. Both
compile in bounded batches and verify page counts before delivery. For terminal
exports, use `npm run export:pdf -- chapter.json output.pdf` with the `chapter.json`
from an extracted LaTeX ZIP. The command also writes an adjacent `.qa.json` report.
Install `pdflatex` (or set `PDFLATEX_BIN`) and keep chapter diagrams in `public/`.
Layout warnings require review; successful compilation is not content verification.
Each question can store an optional YouTube solution URL, including a timestamp,
and an optional **GateOverflow solution URL** (`gateOverflowUrl`) for a question
or answer on `gateoverflow.in`. PDF and editable LaTeX exports show both available
links at the top right by default: red YouTube **Video sol.** and **GateOverflow sol.**
Each has its own visibility, label, position and size in PDF design settings.
Questions without a URL omit that link. The default branding is a faint, centred `g4gate.com` background
watermark; the subject/chapter title appears on the first page only.
The TeX installation must include `hyperref` and its dependencies.

The **PDF & LaTeX** tab keeps PDF and LaTeX export buttons at the top. Choose
questions, then use a preset, theme, text size and answer options in **Choose a
look**. The live preview follows the selected export questions. Detailed settings
open one section at a time: **Solution & website links**, **Branding & page
labels**, **Page layout**, and **Saved styles & extra files**. These include
watermark styling, link positions and labels, page numbers, titles, fitting and
saved templates. Previous PDFs and book combining are under **Saved exports**;
saved PDF previews open on request. Settings also apply to terminal exports.
Previous browser settings keep their font choices and migrate to the new layout.
Items sharing a header/footer position stack; their height is reserved before
fitting the question. The app preview opens external links in a new tab by default
and offers a toggle. Downloaded PDF web links follow the PDF reader's settings;
the PDF format cannot require a browser tab for an HTTP/HTTPS link.

The editor creates background PDF jobs with progress, cancel/retry, and download
history. Questions and diagram bytes are snapshotted when the job starts; retries
reuse completed batches only when their source and asset hashes still match.
Jobs survive editor refreshes and Next.js restarts. A stopped worker is shown as
failed and can be retried. One local worker compiles at a time, with up to eight
queued/running jobs. Keep the full `scripts/` directory when deploying.
Install Poppler `pdftotext` for automatic text-bound checks. If unavailable the QA
report explicitly marks that check incomplete. Jobs and snapshots remain in
`output/pdf-jobs/` (or `PDF_EXPORT_DIR`); protect and back up this local directory.
Under **Saved exports → Storage cleanup**, delete all saved PDF exports across
subjects, or remove only generated page-image PNGs and image ZIPs while keeping
PDFs. Storage totals show the space eligible for cleanup. Queued/running exports
and exports being used by another action are skipped. Questions, original chapter
diagrams, retry source images and downloaded copies are kept by image-only cleanup;
deleting full exports removes their export folders and snapshots as well.
The export panel has its own explicit all/year/range/checkbox selection and blank
placeholder toggle. The editable-source ZIP uses the same selection and settings.
Use the one-question preview before building a chapter. When a reviewed source
version exists, choose it explicitly; current edits remain the default and are
never overwritten by exporting. PDF.js previews render the downloadable artifact
with lazy thumbnails, selectable text, search, zoom, and external links.
Complete PDFs include question bookmarks. Enable **Matching page images ZIP**
to render 1920-pixel page PNGs directly from the final PDF using Poppler
`pdftoppm` (or `PDFTOPPM_BIN`). This is separate from the editor's existing
thumbnail-image export, which has its own presentation layout.
Optional working-space lines reserve space before question fitting. Enable the
separate answer-key PDF to export stored MCQ/MSQ/NAT answers without revealing
them on question pages. Missing answers are labeled explicitly. The LaTeX ZIP
includes `answer-key.tex`, and the terminal exporter writes an adjacent
`.answer-key.pdf` when this option is enabled.
Combine 2-20 completed exports from the same subject into a book (up to 2000
question pages). Choose their order in the export panel. The background worker
snapshots the source PDFs, verifies page counts and preserved links, and adds
chapter/question bookmarks. Pages retain their chapter numbering and layout;
chapter answer keys remain separate. No questions are recompiled or reflowed.

## GATE Mock Lab and paper coverage

Visit `/gatemock` for timed subject tests, topic/chapter tests, editable subject-weighted mocks, and year/set papers. Questions come from the editor database; blanks are excluded. CS is the default exam paper. The editor can change a question to historical IT, assign its set/session, and record its **original paper question number** independently of book/source numbering. MCQ/MSQ correct options and NAT answers or inclusive numeric ranges are editable and saved with the chapter.

The attempt screen follows the GATE computer-test layout: compact white/blue header, aptitude/technical section tabs, candidate panel, five shaped response states, independently scrolling question/palette areas, and pinned Mark for Review & Next / Clear Response / Previous / Save & Next controls. NAT questions include an on-screen numeric keypad. The scientific calculator reuses the tracker app's keypad, state logic and token-based math engine, with Deg/Rad modes, memory, Help, dragging, minimizing and close/reopen without clearing the calculation. Question Paper and Instructions open within the exam.

The default mock blueprint is a practice distribution of 30 one-mark and 35 two-mark questions over 180 minutes. Subject quotas are editable; they are not fixed official subject weightages. Missing subjects or mark categories stop creation unless the student explicitly allows a smaller practice test. The [current official pattern](https://gate2026.iitg.ac.in/question-paper-pattern.html) is linked in the builder. MCQ penalties use a fraction of the question's marks; MSQ needs the complete correct option set and NAT uses the stored inclusive range. Unknown/non-numeric keys and subjective questions are left ungraded.

Use `/gatemock/admin` with the existing workspace admin login to define an official paper's count, marks, duration and MCQ penalty, and map questions to original positions. Coverage reports missing positions, duplicate assignments, unassigned questions, out-of-range positions, missing answers and mark totals. A year paper is offered as complete only after its original positions, totals and admin verification agree. Otherwise it is labeled available-question practice. Older linked-answer or special marking rules require manual review; the configured automatic MCQ penalty is uniform. No counts or original numbering are inferred from a chapter or book index.

The mock page and its catalog/attempt endpoints are public. Admin and editor endpoints retain the existing `AUTH_REQUIRED` / `APP_PASSWORD` authentication. Attempts use independent random bearer tokens; correct keys stay on the server until submission. Responses and navigation save with revision checks, a server-enforced deadline, and refresh/resume in the same browser. Attempts expire from storage after 30 days.

In PDF design settings, **Answers in question PDF** offers hidden answers (default), **Show / hide answer on click**, or a small answer in each page footer. Only stored answers appear. Toggle PDFs use native optional-content layers, start hidden, and work in the app preview; downloaded PDFs require a reader with layer support. Footer mode is suitable for print or readers without layer toggling. Batch and book exports retain the answer layers, and the separate answer-key PDF remains independently available.

Regression checks: `node --test tests/gatemock.test.mjs tests/question-paper.test.mjs tests/question-answers.test.mjs tests/pdf-answers.test.mjs`. With a local server on port 3100, `node scripts/verify-gatemock.mjs` verifies temporary database fixtures and browser attempts, and `node scripts/verify-pdf-answers.mjs` compiles/render-checks the PDF variants. Both scripts use the configured admin login without printing credentials. Mock fixtures are removed in cleanup. PDF checks require the existing TeX/Poppler/Chrome runtimes.

## Production deployment

This application performs browser screenshots, LaTeX compilation, ZIP generation, and database writes. Deploy it to a Node.js server or container with a writable temporary directory, `pdflatex`, and Chrome/Puppeteer support; it is not suitable for a filesystem-restricted serverless runtime.

Production authentication is enabled by default. Set both `JWT_SECRET` and `APP_PASSWORD` to long, unique values before starting the service, then sign in at `/login`. The existing API and UI remain available after sign-in.

Question diagrams live in `public/`, which this repository currently excludes from Git. Copy the matching chapter image library when setting up another machine or deploying. A source-only clone does not include these diagrams. For a larger asset library, use object storage with stable references.

Instead of manually typing math equations, formatting code, and organizing chapters, this system handles the heavy lifting through automated web scraping, smart text parsing, and a highly interactive workspace.

---

## 🏗️ System Architecture: The "Two-Database" Strategy

To ensure data integrity and prevent messy web data from destroying clean data, the application uses a strict **Dual MongoDB Cluster Strategy**:

1. **Staging DB (`scrapedPyqs`): The Quarantine Zone**
* When the app scrapes questions from websites, the raw, unverified data goes here.
* This prevents dirty data (broken math, bad formatting) from touching your final book.


2. **Production DB (`GatePyqs`): The Clean Room**
* This is the main database linked to the core Editor workspace.
* Only finalized, reviewed, and perfectly formatted questions live here.


3. **AppConfig DB: The Brain**
* A central config file that stores the complete syllabus hierarchy (Subject → Chapters).
* It contains a `TOPIC_MAPPING` dictionary. If a website calls a topic *"Asymptotic Notation"*, the config automatically maps it to your official chapter *"1. Algo. Analysis and Asymptotic Notations"*.



---

## 🔄 The Complete Workflow (Step-by-Step)

### 1️⃣ The Scraper Module (`/scraper`)

Because browsers block direct scraping due to CORS, the Next.js backend acts as a proxy API.

* **Auto-Detection:** You feed it a URL, and it automatically detects total pagination, fetching all pages sequentially.
* **Cheerio Parsing:** It extracts clean LaTeX from MathJax annotations, cleans up broken tags, and pulls metadata (Year, Marks, Set Number).
* **Auto-Grouping:** It runs the raw topics through `TOPIC_MAPPING` and sorts all extracted questions into beautiful, collapsible Chapter Groups.
* **Batch Copy System:** To prevent AI limits later on, the scraper allows you to generate **Batch Buttons** (e.g., 20 questions per chunk). Clicking a button copies exactly that range (e.g., Q1-Q20) into a structured text format and tracks your "Last Copied" status.
* **Offline Backups:** Saves your scraped sessions to `localStorage` or pushes them directly to the Cloud Staging DB.

### 2️⃣ The AI Formatting Step (Optional but Powerful)

You take the copied batch from the Scraper and pass it to an AI (like ChatGPT/Claude) with a strict prompt. The AI acts purely as a formatter:

* It extracts code and indents it.
* It converts messy math to LaTeX.
* It prepares it for the Main Editor.

### 3️⃣ The Main Editor Workspace (The Core)

This is where the magic happens. When you open a chapter, the app checks the Production DB; if empty, it checks local drafts so you never lose work.

* **Bulk Quick Paste Parser:** You paste the formatted text from the AI into a box. A custom Regex engine instantly detects the `QUESTION`, `CODE`, `OPTIONS`, and `Metadata`, converting raw text into beautiful, structured React UI cards instantly.
* **Missing Image Tracker:** If a question says `[IMG_1]` but the image is missing from your local folders, the app detects the 404 error and highlights the question with a **Red Dashed Border** so you know what needs fixing.

### 4️⃣ The "Rock and Water" Displacement System

Organizing questions to perfectly match a physical book can cause numbering conflicts. This app solves this with a custom fluid array system:

* **Locks (Rocks):** You can "Pos-Lock" a question to a specific number (e.g., Question 26). It anchors there permanently.
* **Flow (Water):** If you insert a new question at #25, it pushes the old #25 down. But instead of shifting the Locked #26, it *skips over it*, dropping the displaced question to #27 automatically.
* **Auto-Sorting:** Any unlocked questions pushed to the bottom are automatically re-sorted chronologically by Year.
* **Blank Placeholders:** You can insert an empty, locked "Blank Box" to preserve numbering for a missing question, and use "Quick Paste Flow Here" to fill it later.

---

## ✨ Standout Smart Features

### 🧑‍💻 Intelligent Code Formatting & `[CODE]` Tags

* **Auto-Indentation:** If you paste raw C code, the app runs a custom algorithm counting `{` and `}` braces to automatically indent the code perfectly.
* **Inline `[CODE]` Injection:** By simply typing `[CODE]` inside your question text, the system knows exactly where to inject the monospace code block (working across Live Preview, PDFs, and Images).

### 📐 Smart Options Layout (Auto 2x2 Grid)

* The app calculates the character length of options and checks for block math (`$$`).
* **Short Options:** Automatically snaps into a beautiful **2x2 Grid** to save vertical space.
* **Long Options:** Automatically defaults to a 1-column vertical list.
* **Manual Override:** You can force 1-column or 2-column layouts via radio buttons.

### 🛡️ The Semicolon Safety Net

Options are parsed using semicolons (`;`). But what if a C code option contains multiple semicolons?

* The app detects if there are `> 4` semicolons.
* Instead of breaking the layout, it dumps the raw text into Box A, paints the question red, and shows a warning.
* You manually change the separator to `#`, paste it back, and the app gracefully splits it, indents it as code, and removes the warning.

---

## 📤 The Triple Export Engine

Once your chapter is perfect, the app can export it in three distinct ways:

### 1. High-Quality PDF Exporter

* Converts the JSON state into raw `.tex` (LaTeX) code.
* Injects the `lstlisting` package for code, `tabular` for 2x2 option grids, and maps local image paths automatically.
* Runs a local `pdflatex` child process to compile high-quality, print-ready PDFs in chunks (to prevent memory crashes), and zips them up.

### 2. YouTube SEO Exporter

* Strips all LaTeX math and converts symbols to plain English (e.g., `\Rightarrow` becomes `implication`).
* Removes image tags.
* Generates a highly optimized, readable YouTube description complete with auto-generated Hashtags, Timestamps, and the inline Code Snippet.

### 3. Image ZIP Exporter (Puppeteer)

* Launches a headless Google Chrome browser.
* Renders an HTML template of your questions (complete with MathJax, Images, and CSS Grids for options).
* Takes a high-resolution `.png` screenshot of every single question and packs them into an instant `.zip` download.

---

## 📊 Database Progress Tracker (`/status`)

A built-in dashboard that compares your *Actual* Questions in the DB against your *Target* Questions (from your physical book). It shows a chapter-by-chapter breakdown of completion status (In Progress, Completed) so you always know exactly how much work is left.

---

## Year-paper prompt tracker (`/gateyearpaperpdf`)

Scans `D:\Gate PYQs Year Wise - PDFs` for question-paper PDFs and prepares a complete, ready-to-copy build prompt for each exact file. Supports search, CS/IT/DA and status filters, editable prompt inputs, copy-next-pending, full preview, manual clipboard fallback and `.txt` downloads. Copy history and prompt-input changes stay in this browser.

Completion comes from verified, independently stored `yearpapers` documents matched to the source PDF's SHA-256. Copying a prompt never marks a paper complete. The tracker only reads source PDFs and database records; it never edits book questions or year papers. It remains usable for prompt copying when database status is unavailable. Archives are excluded.

The checksum-guarded identity correction for `DA 2025 set 2.pdf` targets CS 2025 Set 2, as shown by its actual CS2 header. New files are discovered on refresh; their prompts require verifying the actual PDF header before import. The reusable prompt and status rules are in `src/lib/gate-year-paper-tracker.mjs`.

Verify with `node --test tests/gate-year-paper-tracker.test.mjs` and, against the running local app, `node scripts/verify-gate-year-paper-tracker.mjs`.

## 💻 Tech Stack Summary

* **Framework:** Next.js (App Router)
* **Frontend UI:** React, raw CSS/Inline styles
* **Math Rendering:** MathJax 3.0
* **Database:** MongoDB & Mongoose
* **Web Scraping:** Cheerio (Server-side)
* **PDF Generation:** `pdflatex` (via Node `child_process`)
* **Image Generation:** Puppeteer (Headless Chrome)
* **File Zipping:** `adm-zip`
