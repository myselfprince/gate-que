
---

# 🚀 GATE CSE PYQ Pipeline: The Ultimate Question Engine

Welcome to the **GATE CSE PYQ Pipeline**! This is a full-stack Next.js application designed to act as an automated, end-to-end factory for collecting, cleaning, organizing, editing, and exporting Previous Year Questions (PYQs) for Computer Science exams.

## Run locally

1. Install Node.js 20.9 or later, MongoDB access, a TeX installation that provides `pdflatex`, and the browser dependencies required by Puppeteer.
2. Copy `.env.example` to `.env.local` and enter your two MongoDB connection strings. For local development, authentication is disabled by default to preserve the existing one-user workflow.
3. Run `npm ci`, then `npm run dev`.

Run `npm run lint` and `npm run build` before deployment.

## Production requirements

This application performs browser screenshots, LaTeX compilation, ZIP generation, and database writes. Deploy it to a Node.js server or container with a writable temporary directory, `pdflatex`, and Chrome/Puppeteer support; it is not suitable for a filesystem-restricted serverless runtime.

Production authentication is enabled by default. Set both `JWT_SECRET` and `APP_PASSWORD` to long, unique values before starting the service, then sign in at `/login`. The existing API and UI remain available after sign-in.

Question diagrams live in `public/` and are intentionally versioned so a fresh clone and production deployment contain the same images. If the asset library grows substantially, move it to object storage and store stable URLs in question records.

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

## 💻 Tech Stack Summary

* **Framework:** Next.js (App Router)
* **Frontend UI:** React, raw CSS/Inline styles
* **Math Rendering:** MathJax 3.0
* **Database:** MongoDB & Mongoose
* **Web Scraping:** Cheerio (Server-side)
* **PDF Generation:** `pdflatex` (via Node `child_process`)
* **Image Generation:** Puppeteer (Headless Chrome)
* **File Zipping:** `adm-zip`
