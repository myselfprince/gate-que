import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { randomUUID } from 'crypto';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';
import { getSafeImageNames, jsonError, parseJson, rateLimit, requireMutationAccess, validateExportPayload, ValidationError } from '@/lib/api-utils';

export const runtime = 'nodejs';

const execFileAsync = promisify(execFile);
const CHUNK_SIZE = 20;

const latexEscapes = {
  '\\': '\\textbackslash{}',
  '{': '\\{',
  '}': '\\}',
  '#': '\\#',
  '$': '\\$',
  '%': '\\%',
  '&': '\\&',
  '_': '\\_',
  '~': '\\textasciitilde{}',
  '^': '\\textasciicircum{}'
};

const escapeLatexText = (value = '') => String(value).replace(/[\\{}#$%&_~^]/g, (character) => latexEscapes[character]);

const escapeLatexKeepingMath = (value = '') => String(value)
  .split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])/)
  .map((part, index) => (index % 2 ? part : escapeLatexText(part).replace(/\r?\n/g, '\\newline\n')))
  .join('');

const escapeListing = (value = '') => String(value).replace(/\\end\{lstlisting\}/g, '\\textbackslash{}end\\{lstlisting\\}');

const shouldUseTwoCols = (question) => {
  if (!question.optA && !question.optB && !question.optC && !question.optD) return false;
  const options = [question.optA, question.optB, question.optC, question.optD];
  const maxLength = Math.max(...options.map((option) => option.length));
  return !options.some((option) => option.includes('$$') || (option.match(/\n/g) || []).length > 2) && maxLength <= 65;
};

const imageLatex = (subject, chapter, imageName, extension) => {
  const imagePath = path.join(process.cwd(), 'public', subject, chapter, `${imageName}${extension}`).replace(/\\/g, '/');
  return `\n\\begin{center}\n\\includegraphics[max width=0.9\\linewidth, keepaspectratio]{"${imagePath}"}\n\\end{center}\n`;
};

const renderOption = (option, question, subject, chapter) => {
  if (!option) return '';
  if (option.startsWith('IMG:')) {
    const imageName = option.slice(4).trim();
    if (!getSafeImageNames(imageName).length) return '[Invalid image name]';
    const imagePath = path.join(process.cwd(), 'public', subject, chapter, `${imageName}${question.ext}`).replace(/\\/g, '/');
    return `\\includegraphics[width=0.4\\linewidth, valign=c]{"${imagePath}"}`;
  }
  if (question.isCodeOptions) return `\\texttt{${escapeLatexText(option).replace(/ /g, '~').replace(/\r?\n/g, '\\newline\n')}}`;
  return escapeLatexKeepingMath(option);
};

const renderQuestion = (question, subject, chapter) => {
  if (question.isBlank) {
    return '\\begin{multicols*}{2}\n\\question {\\small \\textbf{[Blank Placeholder]}} \\\\[0.2cm]\n{\\Large \\textit{This question is reserved/blank.}}\n\\vspace{4cm}\n\\end{multicols*}\n\\vspace{0.6cm}\n\\newpage\n';
  }

  let questionText = escapeLatexKeepingMath(question.text).replace(/_{3,}/g, '\\rule{2cm}{0.4pt}');
  getSafeImageNames(question.diagram).forEach((imageName, index) => {
    const image = imageLatex(subject, chapter, imageName, question.ext);
    const tag = `[IMG_${index + 1}]`;
    if (questionText.includes(tag)) questionText = questionText.replace(tag, image);
    else if (index === 0 && questionText.includes('[DIAGRAM_PLACEHOLDER]')) questionText = questionText.replace('[DIAGRAM_PLACEHOLDER]', image);
    else questionText += image;
  });
  questionText = questionText.replace(/\[IMG_\d+\]|\[DIAGRAM_PLACEHOLDER\]/g, '');

  const codeLatex = question.code
    ? `\n\\vspace{0.2cm}\\begin{lstlisting}\n${escapeListing(question.code)}\n\\end{lstlisting}\\vspace{0.2cm}\n`
    : '';
  const containsCodeTag = questionText.includes('[CODE]');
  if (containsCodeTag) questionText = questionText.replace('[CODE]', codeLatex);

  let latex = '\\begin{multicols*}{2}\n';
  latex += `\n\\question {\\small \\textbf{[GATE ${escapeLatexText(question.year)} | ${escapeLatexText(question.marks || '1')} Mark]}} \\\\[0.2cm]\n{\\Large ${questionText}}\n`;
  if (question.code && !containsCodeTag) latex += codeLatex;

  const hasOptions = question.optA || question.optB || question.optC || question.optD;
  if (hasOptions) {
    const useTwoColumns = question.optLayout === '2col' || (question.optLayout !== '1col' && shouldUseTwoCols(question));
    if (useTwoColumns) {
      latex += '\n\\vspace{0.3cm}\\noindent\\begin{tabular}{@{}p{0.48\\linewidth} p{0.48\\linewidth}@{}}\n';
      latex += `${question.optA ? `\\textbf{(A)} ${renderOption(question.optA, question, subject, chapter)}` : ''} & ${question.optB ? `\\textbf{(B)} ${renderOption(question.optB, question, subject, chapter)}` : ''} \\\\[0.4cm]\n`;
      latex += `${question.optC ? `\\textbf{(C)} ${renderOption(question.optC, question, subject, chapter)}` : ''} & ${question.optD ? `\\textbf{(D)} ${renderOption(question.optD, question, subject, chapter)}` : ''} \\\\n`;
      latex += '\\end{tabular}\n';
    } else {
      latex += '\\begin{choices}\n';
      for (const option of ['optA', 'optB', 'optC', 'optD']) {
        if (question[option]) latex += `  \\choice ${renderOption(question[option], question, subject, chapter)}\n`;
      }
      latex += '\\end{choices}\n';
    }
  } else if (!question.isProof) {
    latex += `\n\\vspace{0.5cm}\n\\textbf{Answer:} ${escapeLatexKeepingMath(question.natAnswer) || '\\rule{3cm}{0.4pt}'}\n`;
  }

  return `${latex}\\end{multicols*}\n\\vspace{0.6cm}\n\\newpage\n`;
};

export async function POST(request) {
  const denied = requireMutationAccess(request);
  if (denied) return denied;
  const limited = rateLimit(request, 'export-pdf', { limit: 4, windowMs: 60_000 });
  if (limited) return limited;

  const baseTempDir = path.join(process.cwd(), `temp_pdf_${randomUUID()}`);
  try {
    const { subject, chapter, questions } = validateExportPayload(await parseJson(request));
    if (!questions.length) return jsonError('At least one question is required for export.');
    await fs.mkdir(baseTempDir, { recursive: true });

    const zip = new AdmZip();
    for (let index = 0; index < questions.length; index += CHUNK_SIZE) {
      const chunk = questions.slice(index, index + CHUNK_SIZE);
      const chunkNumber = Math.floor(index / CHUNK_SIZE) + 1;
      const tempDir = path.join(baseTempDir, `chunk_${chunkNumber}`);
      const texFilePath = path.join(tempDir, 'gate_workbook.tex');
      const pdfFilePath = path.join(tempDir, 'gate_workbook.pdf');
      await fs.mkdir(tempDir, { recursive: true });

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
\\lstset{basicstyle=\\ttfamily\\small\\color{white}, backgroundcolor=\\color[rgb]{0.12,0.12,0.12}, frame=single, rulecolor=\\color{gray}, breaklines=true, tabsize=4}
\\begin{document}
\\begin{center}
\\LARGE \\textbf{GATE CSE: ${escapeLatexText(subject)} - ${escapeLatexText(chapter)} (Part ${chunkNumber})}
\\end{center}
\\vspace{0.5cm}
\\begin{questions}
`;
      if (index > 0) latex += `\\setcounter{question}{${index}}\n`;
      latex += chunk.map((question) => renderQuestion(question, subject, chapter)).join('');
      latex += '\\end{questions}\n\\end{document}\n';
      await fs.writeFile(texFilePath, latex, 'utf8');

      await execFileAsync('pdflatex', [
        '-no-shell-escape',
        '-halt-on-error',
        '-interaction=nonstopmode',
        `-output-directory=${tempDir}`,
        texFilePath
      ], { timeout: 30_000, maxBuffer: 10 * 1024 * 1024 });

      const pdfBuffer = await fs.readFile(pdfFilePath);
      zip.addFile(`PYQs_Part${chunkNumber}.pdf`, pdfBuffer);
    }

    return new NextResponse(zip.toBuffer(), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="gate-pyqs.pdf.zip"',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    if (error instanceof ValidationError) return jsonError(error.message);
    console.error('PDF generation error:', error);
    return jsonError('PDF generation failed. Check that pdflatex is installed and the question content is valid.', 500);
  } finally {
    await fs.rm(baseTempDir, { recursive: true, force: true }).catch((cleanupError) => console.error('PDF cleanup error:', cleanupError));
  }
}
