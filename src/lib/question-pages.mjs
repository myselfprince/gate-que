import { collectLatexImages, escapeLatex, renderSourceQuestion, LISTINGS_UNICODE } from './latex-source.mjs';

// Both PDF and editable-source exports use this layout. Each complete question
// is measured first. Long prose is reflowed at a smaller font while the box
// keeps its full width; shrinking the entire box also narrowed the text column.
export function buildQuestionPages({ subject, chapter, questions }, {
  startIndex = 0, totalQuestions = questions.length, imageRoot = 'images',
} = {}) {
  collectLatexImages(questions);
  const title = escapeLatex(`${subject} - ${chapter}`);
  let source = `\\documentclass[12pt,a4paper,landscape]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[margin=14mm]{geometry}
\\usepackage{amsmath,amssymb,graphicx,listings,xcolor}
\\pagecolor{black}
\\color{white}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}
\\setlength{\\tabcolsep}{0pt}
\\setlength{\\emergencystretch}{3em}
\\lstset{basicstyle=\\ttfamily\\fontsize{15}{20}\\selectfont\\color{white},breaklines=true,columns=fullflexible,keepspaces=true,frame=single,rulecolor=\\color{white!35},aboveskip=12pt,belowskip=12pt,${LISTINGS_UNICODE}}
\\newsavebox{\\questionbox}
\\newsavebox{\\questioncodebox}
\\newcommand{\\questioncodescale}{1}
\\newlength{\\questionheight}
\\newlength{\\questionimageheight}
\\newcommand{\\questionbody}{}
\\setlength{\\questionheight}{\\dimexpr\\textheight-22pt\\relax}
\\begin{document}
`;
  questions.forEach((q, index) => {
    if (index) source += '\\clearpage\n';
    const number = q.source?.questionNumber || String(startIndex + index + 1);
    const meta = `GATE ${q.year || ''}${q.setNum ? ` (Set-${q.setNum})` : ''} | ${q.marks || '1'} Mark${q.questionType ? ` | ${q.questionType}` : ''}`;
    // Capture verbatim code once outside conditionals. The measured question
    // can then reflow at full width, independently scaling the saved listing.
    const codeReference = '\n\\par\\medskip\\noindent\\scalebox{\\questioncodescale}{\\usebox{\\questioncodebox}}\\par\\medskip\n';
    let content = renderSourceQuestion(q, { imageRoot, maxImageHeight: '\\questionimageheight', codeRenderer: () => codeReference });
    if (!q.isBlank && !q.isProof && ![q.optA, q.optB, q.optC, q.optD].some(Boolean)
      && !/_{3,}/.test(q.text || '')) content += '\n\\par\\medskip\\textbf{Answer:} \\rule{3cm}{0.4pt}\n';
    const measure = (fontSize) => {
      return `
\\setlength{\\questionimageheight}{${(0.36 * fontSize / 18).toFixed(3)}\\textheight}
\\renewcommand{\\questioncodescale}{${(fontSize / 18).toFixed(3)}}
\\begin{lrbox}{\\questionbox}
\\begin{minipage}[t]{\\textwidth}
{\\fontsize{12}{16}\\selectfont\\color{white!65} ${title}\\par}
\\vspace{8pt}
{\\color{white!30}\\hrule height 0.4pt}
\\vspace{18pt}
{\\fontsize{15}{21}\\selectfont\\bfseries ${escapeLatex(number)}\\quad [${escapeLatex(meta)}]\\par}
\\vspace{12pt}
\\fontsize{${fontSize}}{${(fontSize * 26 / 18).toFixed(2)}}\\selectfont
\\questionbody
\\par
\\end{minipage}
\\end{lrbox}
`;
    };
    source += `\n% Question page ${number}\n`;
    if (q.code && !q.isBlank) source += `\\begin{lrbox}{\\questioncodebox}
\\begin{minipage}{\\textwidth}
${renderSourceQuestion({ text: '[CODE]', code: q.code })}
\\end{minipage}
\\end{lrbox}
`;
    // Keep each editable body in one place in the portable LaTeX source.
    source += `\\renewcommand{\\questionbody}{%\n${content}\n}\n`;
    source += measure(18);
    for (let fontSize = 17; fontSize >= 8; fontSize--) {
      source += `\\ifdim\\dimexpr\\ht\\questionbox+\\dp\\questionbox\\relax>\\questionheight\n${measure(fontSize)}\\fi\n`;
    }
    source += `
\\noindent
\\ifdim\\dimexpr\\ht\\questionbox+\\dp\\questionbox\\relax>\\questionheight
  \\resizebox*{!}{\\questionheight}{\\usebox{\\questionbox}}
\\else
  \\usebox{\\questionbox}
\\fi
\\par\\vfill
{\\fontsize{9}{12}\\selectfont\\color{white!55}\\hfill ${startIndex + index + 1} / ${totalQuestions}\\par}
`;
  });
  return source + '\\end{document}\n';
}
