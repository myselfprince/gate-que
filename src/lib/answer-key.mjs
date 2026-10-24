import { escapeLatex, latexText } from './latex-source.mjs';
import { normalizePdfSettings } from './pdf-settings.mjs';

export function buildAnswerKey({ subject, chapter, questions, pdfSettings }) {
  const settings = normalizePdfSettings(pdfSettings);
  const foreground = settings.theme === 'dark' ? 'white' : 'black';
  const entries = questions.flatMap((question, index) => {
    if (question.isBlank) return [];
    const number = question.source?.questionNumber || question.exportNumber || String(index + 1);
    const answer = question.correctOptions?.length ? question.correctOptions.map(option => `(${option})`).join(', ') : question.natAnswer?.trim();
    return [`\\typeout{GATEANSWER:${index + 1}}\n\\item[\\textbf{Q${escapeLatex(number)}}] ${answer ? latexText(answer) : '\\textit{Answer not available}'}\n`];
  }).join('');
  return `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern,amsmath,amssymb,xcolor}
\\usepackage[margin=20mm]{geometry}
\\usepackage[hidelinks]{hyperref}
\\pagecolor{${settings.theme === 'dark' ? 'black' : 'white'}}
\\color{${foreground}}
\\setlength{\\emergencystretch}{3em}
\\begin{document}
\\section*{Answer key}
{\\large\\textbf{${escapeLatex(`${subject} - ${chapter}`)}}\\par}
\\medskip
Only available stored answers are included. Missing answers are marked explicitly.
\\begin{enumerate}
\\setlength{\\itemsep}{8pt}
${entries || '\\item No non-blank questions selected.'}
\\end{enumerate}
\\vfill
${settings.showWebsite ? '\\href{https://g4gate.com}{g4gate.com}' : ''}
\\end{document}
`;
}
