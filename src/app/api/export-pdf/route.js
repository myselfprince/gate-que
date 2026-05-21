import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';

const execAsync = promisify(exec);

const escapeLatex = (text) => {
  if (!text) return "";
  return text.replace(/(?<!\\)%/g, '\\%');
};

const shouldUseTwoCols = (q) => {
    if (!q.optA && !q.optB && !q.optC && !q.optD) return false;
    const maxLen = Math.max(
        (q.optA || "").length, (q.optB || "").length,
        (q.optC || "").length, (q.optD || "").length
    );
    const hasBlockMath = [q.optA, q.optB, q.optC, q.optD].some(opt => opt?.includes('$$'));
    const hasManyBreaks = [q.optA, q.optB, q.optC, q.optD].some(opt => (opt?.match(/\n/g) || []).length > 2);
    
    if (hasBlockMath || hasManyBreaks || maxLen > 65) return false;
    return true;
};

export async function POST(req) {
const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
const baseTempDir = path.join(process.cwd(), `temp_pdf_${uniqueId}`);
try {
const { subject, chapter, questions } = await req.json();
await fs.mkdir(baseTempDir, { recursive: true });
const zip = new AdmZip();
const CHUNK_SIZE = 20;

for (let i = 0; i < questions.length; i += CHUNK_SIZE) {
const chunk = questions.slice(i, i + CHUNK_SIZE);
const chunkIndex = Math.floor(i / CHUNK_SIZE) + 1;
const startQNum = i;
const tempDir = path.join(baseTempDir, `chunk_${chunkIndex}`);
await fs.mkdir(tempDir, { recursive: true });

const texFileName = 'gate_workbook.tex';
const pdfFileName = 'gate_workbook.pdf';
const texFilePath = path.join(tempDir, texFileName);
const pdfFilePath = path.join(tempDir, pdfFileName);

let latex = `\\documentclass[12pt]{exam}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath, amssymb}
\\usepackage{graphicx}
\\usepackage[export]{adjustbox}
\\usepackage[margin=0.5in, landscape]{geometry}
\\usepackage{multicol}
\\usepackage{listings}
\\usepackage{xcolor}
\\usepackage[none]{hyphenat}
\\sloppy
\\pagecolor{black}
\\color{white}
\\pagestyle{empty}
\\cfoot{}
\\lstset{
basicstyle=\\ttfamily\\small\\color{white},
backgroundcolor=\\color[rgb]{0.12,0.12,0.12},
frame=single,
rulecolor=\\color{gray},
breaklines=true,
tabsize=4
}
\\begin{document}
\\begin{center}
\\LARGE \\textbf{GATE CSE: ${subject} - ${chapter} (Part ${chunkIndex})}
\\end{center}
\\vspace{0.5cm}
\\begin{questions}
`;

if (startQNum > 0) {
latex += `\\setcounter{question}{${startQNum}}\n`;
}

chunk.forEach(q => {
// BLANK PLACEHOLDER LOGIC FOR PDF
if (q.isBlank) {
latex += "\\begin{multicols*}{2}\n";
latex += `\n\\question {\\small \\textbf{[Blank Placeholder]}} \\\\[0.2cm]\n{\\Large \\textit{This question is reserved/blank.}}\n\\vspace{4cm}\n`;
latex += "\n\\end{multicols*}\n\\vspace{0.6cm}\n\\newpage\n";
return;
}

let qText = escapeLatex(q.text.trim())
.replace(/_{3,}/g, '\\rule{2cm}{0.4pt}')
.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ');

// SMART MATH SPLITTER: Protects BOTH $$...$$ and $...$ from being corrupted by \newline
let textParts = qText.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/);
for (let j = 0; j < textParts.length; j++) {
  if (j % 2 === 0) {
    // Only replace \n with \newline in standard text (even indexes)
    textParts[j] = textParts[j].replace(/\r?\n/g, '\\newline\n');
  }
}
qText = textParts.join('');

latex += "\\begin{multicols*}{2}\n";

const imageList = q.diagram ? q.diagram.split(',').map(s => s.trim()).filter(Boolean) : [];
imageList.forEach((imgName, imgIndex) => {
if (!imgName) return;
const imgPath = path.join(process.cwd(), 'public', subject, chapter, `${imgName}${q.ext}`).replace(/\\/g, '/');
const latexImg = `\n\\begin{center}\n\\includegraphics[max width=0.9\\linewidth, keepaspectratio]{"${imgPath}"}\n\\end{center}\n`;
const tag = `[IMG_${imgIndex + 1}]`;
if (qText.includes(tag)) {
qText = qText.replace(tag, latexImg);
} else if (imgIndex === 0 && qText.includes('[DIAGRAM_PLACEHOLDER]')) {
qText = qText.replace('[DIAGRAM_PLACEHOLDER]', latexImg);
} else {
qText += latexImg;
}
});
qText = qText.replace('[DIAGRAM_PLACEHOLDER]', '');

let codeLatex = q.code ? `\n\\vspace{0.2cm}\\begin{lstlisting}\n${q.code}\n\\end{lstlisting}\\vspace{0.2cm}\n` : '';
if (qText.includes('[CODE]')) {
qText = qText.replace('[CODE]', codeLatex);
latex += `\n\\question {\\small \\textbf{[GATE ${q.year || ''} | ${q.marks || '1'} Mark]}} \\\\[0.2cm]\n{\\Large ${qText}}\n`;
} else {
latex += `\n\\question {\\small \\textbf{[GATE ${q.year || ''} | ${q.marks || '1'} Mark]}} \\\\[0.2cm]\n{\\Large ${qText}}\n`;
if (q.code) {
latex += codeLatex;
}
}

const hasOptions = q.optA || q.optB || q.optC || q.optD;

const processOpt = (opt, isCode) => {
if (!opt) return "";
if (opt.startsWith("IMG:")) {
const imgName = opt.replace("IMG:", "").trim();
const imgPath = path.join(process.cwd(), 'public', subject, chapter, `${imgName}${q.ext}`).replace(/\\/g, '/');
return `\\includegraphics[width=0.4\\linewidth, valign=c]{"${imgPath}"}`;
}
if (isCode) {
let codeSafe = opt
.replace(/\\/g, '\\textbackslash{}')
.replace(/[{}]/g, '\\$&')
.replace(/[_&#%$]/g, '\\$&')
.replace(/</g, '\\textless{}')
.replace(/>/g, '\\textgreater{}')
.replace(/~/g, '\\textasciitilde{}')
.replace(/\^/g, '\\textasciicircum{}')
.replace(/ /g, '~')
.replace(/\r?\n/g, '\\newline\n');
return `\\texttt{${codeSafe}}`;
}

// Ensure options are also protected from \newline inside math tags
let escapedOpt = escapeLatex(opt);
let optParts = escapedOpt.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/);
for (let j = 0; j < optParts.length; j++) {
  if (j % 2 === 0) {
    optParts[j] = optParts[j].replace(/\r?\n/g, '\\newline\n');
  }
}
return optParts.join('');
};

if (hasOptions) {
const isTwoCol = q.optLayout === '2col' || (q.optLayout !== '1col' && shouldUseTwoCols(q));
if (isTwoCol) {
latex += "\n\\vspace{0.3cm}\\noindent\\begin{tabular}{@{}p{0.48\\linewidth} p{0.48\\linewidth}@{}}\n";
let row1 = "";
row1 += q.optA ? `\\textbf{(A)} ${processOpt(q.optA, q.isCodeOptions)}` : "";
row1 += " & ";
row1 += q.optB ? `\\textbf{(B)} ${processOpt(q.optB, q.isCodeOptions)}` : "";
row1 += " \\\\[0.4cm]\n";
let row2 = "";
row2 += q.optC ? `\\textbf{(C)} ${processOpt(q.optC, q.isCodeOptions)}` : "";
row2 += " & ";
row2 += q.optD ? `\\textbf{(D)} ${processOpt(q.optD, q.isCodeOptions)}` : "";
row2 += " \\\\\n";
latex += row1 + row2;
latex += "\\end{tabular}\n";
} else {
latex += "\\begin{choices}\n";
if (q.optA) latex += `  \\choice ${processOpt(q.optA, q.isCodeOptions)}\n`;
if (q.optB) latex += `  \\choice ${processOpt(q.optB, q.isCodeOptions)}\n`;
if (q.optC) latex += `  \\choice ${processOpt(q.optC, q.isCodeOptions)}\n`;
if (q.optD) latex += `  \\choice ${processOpt(q.optD, q.isCodeOptions)}\n`;
latex += "\\end{choices}\n";
}
} else {
latex += `\n\\vspace{0.5cm}\n\\textbf{Answer:} ${escapeLatex(q.natAnswer) || '\\rule{3cm}{0.4pt}'}\n`;
}
latex += "\n\\end{multicols*}\n\\vspace{0.6cm}\n\\newpage\n";
});

latex += "\n\\end{questions}\n\\end{document}\n";
await fs.writeFile(texFilePath, latex, 'utf8');

try {
await execAsync(`pdflatex -interaction=nonstopmode -output-directory="${tempDir}" "${texFilePath}"`);
} catch (pdflatexError) {
console.warn(`pdflatex threw a warning on chunk ${chunkIndex}, but might have generated the PDF.`, pdflatexError);
}
const pdfBuffer = await fs.readFile(pdfFilePath);
zip.addFile(`${subject}_${chapter}_PYQs_Part${chunkIndex}.pdf`, pdfBuffer);
}

const zipBuffer = zip.toBuffer();
await fs.rm(baseTempDir, { recursive: true, force: true });
return new NextResponse(zipBuffer, {
status: 200,
headers: {
'Content-Type': 'application/zip',
'Content-Disposition': `attachment; filename="${subject}_${chapter}_PYQs.zip"`,
},
});
} catch (error) {
console.error("PDF Generation Error:", error);
try {
await fs.rm(baseTempDir, { recursive: true, force: true });
} catch (cleanupError) {
console.error("Failed to clean up temp directory:", cleanupError);
}
return NextResponse.json({ success: false, error: error.message }, { status: 500 });
}
}