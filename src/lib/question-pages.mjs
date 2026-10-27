import { collectLatexImages, escapeLatex, renderSourceQuestion, LISTINGS_UNICODE } from './latex-source.mjs';
import { normalizePdfSettings, questionPdfSettings } from './pdf-settings.mjs';
import { documentTitle, pageDecorations, watermarkTex, YOUTUBE_ICON_TEX } from './pdf-decorations.mjs';
import { answerLayerSetup, ANSWER_TOGGLE_PREAMBLE, ANSWER_TOGGLE_CATALOG } from './pdf-answers.mjs';

// Both PDF and editable-source exports use this layout. Each complete question
// is measured first. Long prose is reflowed at a smaller font while the box
// keeps its full width; shrinking the entire box also narrowed the text column.
export function buildQuestionPages({ subject, chapter, questions, pdfSettings }, {
  startIndex = 0, totalQuestions = questions.length, imageRoot = 'images',
} = {}) {
  collectLatexImages(questions);
  const settings = normalizePdfSettings(pdfSettings);
  const foreground = settings.theme === 'dark' ? 'white' : 'black';
  const workingSpace = settings.workingLines ? `{\\color{${foreground}!35}\\vbox{\\offinterlineskip{\\fontsize{9}{12}\\selectfont Working space\\strut}\\vskip2pt\n${'\\hrule height0.3pt\\vskip13.7pt\n'.repeat(settings.workingLines)}}}\\par\n` : '';
  const title = escapeLatex(documentTitle(subject, chapter, settings));
  let source = `\\documentclass[12pt,a4paper,landscape]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[margin=${settings.marginMm}mm]{geometry}
\\usepackage{amsmath,amssymb,graphicx,listings,xcolor}
\\usepackage[hidelinks]{hyperref}
\\pagecolor{${settings.theme === 'dark' ? 'black' : 'white'}}
\\color{${foreground}}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}
\\setlength{\\tabcolsep}{0pt}
\\setlength{\\emergencystretch}{3em}
\\lstset{basicstyle=\\ttfamily\\fontsize{15}{20}\\selectfont\\color{${foreground}},breaklines=true,columns=fullflexible,keepspaces=true,frame=single,rulecolor=\\color{${foreground}!35},aboveskip=12pt,belowskip=12pt,${LISTINGS_UNICODE}}
\\newsavebox{\\questionbox}
\\newsavebox{\\questioncodebox}
\\newsavebox{\\pageheaderbox}
\\newsavebox{\\pagefooterbox}
\\newsavebox{\\gatewatermarkbox}
\\newlength{\\gatewatermarkx}
\\newlength{\\gatewatermarky}
${YOUTUBE_ICON_TEX}
${settings.answerMode === 'toggle' ? ANSWER_TOGGLE_PREAMBLE : ''}
\\newcommand{\\questioncodescale}{1}
\\newlength{\\questionheight}
\\newlength{\\questionimageheight}
\\newcommand{\\questionbody}{}
\\begin{document}
`;
  questions.forEach((q, index) => {
    const style = questionPdfSettings(settings, q.pdfStyle);
    // A larger listing is scaled after capture. Reserve a narrower source box
    // so its scaled frame never grows beyond the full text width.
    const codeWidth = style.fontSize > 18 ? `${(1 / Number((style.fontSize / 18).toFixed(3))).toFixed(6)}\\textwidth` : '\\textwidth';
    if (index) source += '\\clearpage\n';
    source += answerLayerSetup(q, settings, startIndex + index);
    const decorations = pageDecorations({ settings, question: q, page: startIndex + index + 1, total: totalQuestions, foreground });
    const showTitle = settings.titleMode === 'every' || (settings.titleMode === 'first' && startIndex + index === 0);
    const box = (name, content) => content ? `\\begin{lrbox}{\\${name}}\\begin{minipage}{\\textwidth}\n${content}\\par\\end{minipage}\\end{lrbox}\n` : `\\sbox{\\${name}}{}\n`;
    source += watermarkTex(settings, foreground);
    source += box('pageheaderbox', decorations.top) + box('pagefooterbox', decorations.bottom);
    source += `\\setlength{\\questionheight}{\\dimexpr\\textheight-32pt-\\ht\\pageheaderbox-\\dp\\pageheaderbox-\\ht\\pagefooterbox-\\dp\\pagefooterbox-${settings.workingLines ? (settings.workingLines + 1) * 14 : 0}pt\\relax}\n`;
    const number = q.source?.questionNumber || q.exportNumber || String(startIndex + index + 1);
    const meta = `GATE ${q.examPaper || 'CS'} ${q.year || ''}${q.setNum ? ` (Set-${q.setNum})` : ''} | ${q.marks || '1'} Mark${q.questionType ? ` | ${q.questionType}` : ''}`;
    // Capture verbatim code once outside conditionals. The measured question
    // can then reflow at full width, independently scaling the saved listing.
    const codeReference = '\n\\par\\medskip\\noindent\\scalebox{\\questioncodescale}{\\usebox{\\questioncodebox}}\\par\\medskip\n';
    let content = renderSourceQuestion(q, { imageRoot, maxImageHeight: '\\questionimageheight', codeRenderer: () => codeReference });
    if (!q.isBlank && !q.isProof && ![q.optA, q.optB, q.optC, q.optD].some(Boolean)
      && !/_{3,}/.test(q.text || '')) content += '\n\\par\\medskip\\textbf{Answer:} \\rule{3cm}{0.4pt}\n';
    const measure = (fontSize) => {
      return `
\\def\\questionfontsize{${fontSize}}
\\setlength{\\questionimageheight}{${(0.36 * fontSize / 18 * style.imageScale).toFixed(3)}\\textheight}
\\renewcommand{\\questioncodescale}{${(fontSize / 18).toFixed(3)}}
\\begin{lrbox}{\\questionbox}
\\begin{minipage}[t]{\\textwidth}
${showTitle ? `{\\${{ left: 'raggedright', center: 'centering', right: 'raggedleft' }[settings.titleAlignment]}\\fontsize{${settings.titleFontSize}}{${settings.titleFontSize + 4}}\\selectfont\\color{${foreground}!65} ${title}\\par}\n\\vspace{8pt}\n{\\color{${foreground}!30}\\hrule height 0.4pt}\n\\vspace{18pt}` : ''}
${settings.showQuestionNumber || settings.showQuestionMeta ? `{\\fontsize{15}{21}\\selectfont\\bfseries ${settings.showQuestionNumber ? escapeLatex(number) : ''}${settings.showQuestionNumber && settings.showQuestionMeta ? '\\quad ' : ''}${settings.showQuestionMeta ? `[${escapeLatex(meta)}]` : ''}\\par}\n\\vspace{12pt}` : ''}
\\fontsize{${fontSize}}{${(fontSize * style.lineSpacing).toFixed(2)}}\\selectfont
\\questionbody
\\par
\\end{minipage}
\\end{lrbox}
`;
    };
    source += `\n% Question page ${number}\n\\typeout{GATEQUESTION:${startIndex + index + 1}}\n`;
    if (q.code && !q.isBlank) source += `\\begin{lrbox}{\\questioncodebox}
\\begin{minipage}{${codeWidth}}
${renderSourceQuestion({ text: '[CODE]', code: q.code })}
\\end{minipage}
\\end{lrbox}
`;
    // Keep each editable body in one place in the portable LaTeX source.
    source += `\\renewcommand{\\questionbody}{%\n${content}\n}\n`;
    source += measure(style.fontSize);
    for (let fontSize = style.fontSize - 1; fontSize >= style.minFontSize; fontSize--) {
      source += `\\ifdim\\dimexpr\\ht\\questionbox+\\dp\\questionbox\\relax>\\questionheight\n${measure(fontSize)}\\fi\n`;
    }
    source += `
\\typeout{GATEFIT:${startIndex + index + 1}:FONT:\\questionfontsize}
${decorations.top ? '\\noindent\\usebox{\\pageheaderbox}\\par\\vspace{10pt}\\nointerlineskip' : ''}
\\noindent
\\ifdim\\dimexpr\\ht\\questionbox+\\dp\\questionbox\\relax>\\questionheight
  ${style.overflow === 'warn' ? `\\typeout{GATEFITWARNING:${startIndex + index + 1}:Question shrunk below the configured minimum}\\resizebox*{!}{\\questionheight}{\\usebox{\\questionbox}}` : `\\PackageError{G4Gate}{Question ${startIndex + index + 1} does not fit at minimum font ${style.minFontSize}pt}{Reduce the font or diagram size in PDF settings.}`}
\\else
  \\usebox{\\questionbox}
\\fi
\\par\\vfill
${workingSpace}
${decorations.bottom ? '\\noindent\\usebox{\\pagefooterbox}\\par' : ''}
`;
  });
  return source + (settings.answerMode === 'toggle' ? ANSWER_TOGGLE_CATALOG + '\n' : '') + '\\end{document}\n';
}
