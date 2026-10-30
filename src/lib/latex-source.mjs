import { latexSegments } from './latex-segments.mjs';

const escapes = {
  '\\': '\\textbackslash{}', '{': '\\{', '}': '\\}', '#': '\\#', '$': '\\$',
  '%': '\\%', '&': '\\&', '_': '\\_', '~': '\\textasciitilde{}', '^': '\\textasciicircum{}',
  '•': '\\textbullet{}', '’': "'", '‘': "'", '“': '"', '”': '"', '–': '--', '—': '---',
};

export const escapeLatex = (text = '') => String(text).replace(/[\\{}#$%&_~^•’‘“”–—]/g, (c) => escapes[c]);

// A literal percent starts a TeX comment even inside $...$ or \text{...}.
// Preserve existing \% escapes; an even backslash run ends in a line break.
const normalizeMathForTex = (text) => text.replace(/(\\*)([%#])/g, (match, slashes, symbol) =>
  slashes.length % 2 ? match : `${slashes}\\${symbol}`)
  .replace(/\\(lt|gt)\b/g, (_, command) => command === 'lt' ? '<' : '>');

const escapeProse = (text) => text.split(/(\\[%#$&_{}])/g)
  .map(part => /^\\[%#$&_{}]$/.test(part) ? part : escapeLatex(part)).join('');

const renderMath = (part, fitTables) => {
  const normalized = normalizeMathForTex(part);
  if (!fitTables || !/\\begin\{(?:array|aligned|matrix|[bpvBV]matrix|cases)\}/.test(normalized)) return normalized;
  const display = normalized.startsWith('$$') || normalized.startsWith('\\[');
  const delimiterLength = normalized.startsWith('$') ? (display ? 2 : 1) : 2;
  const body = normalized.slice(delimiterLength, -delimiterLength);
  // Wide tables must fit horizontally as well as vertically. Keep their LaTeX
  // editable and scale only a math block that exceeds the available line width.
  const fitted = `\\begingroup\\setbox0=\\hbox{$${display ? '\\displaystyle ' : ''}${body}$}\\ifdim\\wd0>\\linewidth\\resizebox{\\linewidth}{!}{\\copy0}\\else\\copy0\\fi\\endgroup`;
  return `\\par\\smallskip\\noindent\\makebox[\\linewidth][c]{${fitted}}\\par\\smallskip `;
};

export const latexText = (text = '', { fitTables = false } = {}) => latexSegments(text)
  .map(({ math, text: part }) => math ? renderMath(part, fitTables) : part.split(/(_{3,})/).map((run) => /^_{3,}$/.test(run)
    ? '\\rule{2cm}{0.4pt}' : escapeProse(run).replace(/\r?\n/g, '\\par\n')).join(''))
  .join('');

export const LISTINGS_UNICODE = String.raw`literate={≥}{{$\geq$}}1 {≤}{{$\leq$}}1 {≠}{{$\neq$}}1 {←}{{$\leftarrow$}}1 {→}{{$\rightarrow$}}1 {²}{{$^2$}}1 {×}{{$\times$}}1`;

const safeImage = (name) => /^[A-Za-z0-9 .()_-]+$/.test(name) && name !== '.' && name !== '..';
const imageNames = (question) => (question.diagram || '').split(',').map((name) => name.trim()).filter(Boolean);

export function collectLatexImages(questions) {
  const files = new Set();
  for (const q of questions) {
    const names = [...imageNames(q), ...[q.optA, q.optB, q.optC, q.optD, q.optE]
      .filter((option) => option?.startsWith('IMG:')).map((option) => option.slice(4).trim())];
    for (const name of names) {
      if (!safeImage(name)) throw new Error('An image reference is invalid.');
      files.add(`${name}${q.ext || '.png'}`);
    }
  }
  return [...files];
}

export function renderSourceQuestion(q, { imageRoot = 'images', maxImageHeight, codeRenderer } = {}) {
  if (q.isBlank) return '\\textit{Blank placeholder.}';
  const names = imageNames(q);
  const used = new Set();
  const image = (name) => `\n\\begin{center}\\includegraphics[width=0.8\\linewidth,${maxImageHeight ? `height=${maxImageHeight},` : ''}keepaspectratio]{\\detokenize{${imageRoot}/${name}${q.ext || '.png'}}}\\end{center}\n`;
  const code = q.code ? (codeRenderer ? codeRenderer(q.code)
    : `\n\\begin{lstlisting}\n${q.code.replace(/\\end\{lstlisting\}/g, '[end listing]')}\n\\end{lstlisting}\n`) : '';
  let codeUsed = false;
  let body = (q.text || '').split(/(\[IMG_\d+\]|\[DIAGRAM_PLACEHOLDER\]|\[CODE\])/g).map((part) => {
    if (part === '[CODE]') { codeUsed = true; return code; }
    const match = part.match(/^\[IMG_(\d+)\]$/);
    const index = match ? Number(match[1]) - 1 : part === '[DIAGRAM_PLACEHOLDER]' ? 0 : -1;
    if (index >= 0) {
      if (!names[index]) throw new Error('A question image placeholder has no image reference.');
      used.add(index);
      return image(names[index]);
    }
    return latexText(part, { fitTables: true });
  }).join('');
  names.forEach((name, i) => { if (!used.has(i)) body += image(name); });
  if (!codeUsed) body += code;

  const options = [q.optA, q.optB, q.optC, q.optD, ...(q.optE ? [q.optE] : [])];
  if (options.some(Boolean)) {
    const renderOption = (option = '') => option.startsWith('IMG:') ? image(option.slice(4).trim())
      : q.isCodeOptions ? `\\texttt{${escapeLatex(option)}}` : latexText(option, { fitTables: true });
    const twoCols = !q.optE && (q.optLayout === '2col' || (q.optLayout !== '1col'
      && options.every((option) => (option || '').length <= 65 && !(option || '').includes('\n') && !(option || '').includes('$$'))));
    if (q.optLayout === '4col' && !q.optE) {
      body += '\n\\par\\smallskip\\noindent\\begin{tabular}{@{}p{0.22\\linewidth}@{\\hspace{0.04\\linewidth}}p{0.22\\linewidth}@{\\hspace{0.04\\linewidth}}p{0.22\\linewidth}@{\\hspace{0.04\\linewidth}}p{0.22\\linewidth}@{}}\n';
      body += ['A','B','C','D'].map(letter => `\\textbf{(${letter})} ${renderOption(q[`opt${letter}`])}`).join(' & ');
      body += '\\\\\n\\end{tabular}\\par\n';
    } else if (q.optLayout === '3col') {
      // Three diagram choices and a final text choice fit historical papers
      // without shrinking all four figures below readable print dimensions.
      body += '\n\\par\\smallskip\\noindent\\begin{tabular}{@{}p{0.31\\linewidth}@{\\hspace{0.035\\linewidth}}p{0.31\\linewidth}@{\\hspace{0.035\\linewidth}}p{0.31\\linewidth}@{}}\n';
      body += ['A', 'B', 'C'].map(letter => `\\textbf{(${letter})} ${renderOption(q[`opt${letter}`])}`).join(' & ');
      body += '\\\\\n\\end{tabular}\\par\\smallskip\n';
      if (q.optD) body += `\\textbf{(D)} ${renderOption(q.optD)}\\par\n`;
    } else if (twoCols) {
      body += '\n\\par\\smallskip\\noindent\\begin{tabular}{@{}p{0.46\\linewidth}@{\\hspace{0.08\\linewidth}}p{0.46\\linewidth}@{}}\n';
      body += `\\textbf{(A)} ${renderOption(q.optA)} & \\textbf{(B)} ${renderOption(q.optB)} \\\\[0.6em]\n`;
      body += `\\textbf{(C)} ${renderOption(q.optC)} & \\textbf{(D)} ${renderOption(q.optD)} \\\\\n\\end{tabular}\n`;
    } else {
      body += '\n\\begin{itemize}\n';
      options.forEach((option, i) => { if (option) body += `\\item[(${String.fromCharCode(65 + i)})] ${renderOption(option)}\n`; });
      body += '\\end{itemize}\n';
    }
  }
  return body;
}

export function buildLatexSource({ subject, chapter, questions }) {
  collectLatexImages(questions);
  let source = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[margin=20mm]{geometry}
\\usepackage{amsmath,amssymb,graphicx,listings}
\\lstset{basicstyle=\\ttfamily\\small,breaklines=true,columns=fullflexible,keepspaces=true,${LISTINGS_UNICODE}}
\\setlength{\\parindent}{0pt}
\\sloppy
\\begin{document}
\\section*{${escapeLatex(subject)} --- ${escapeLatex(chapter)}}
\\begin{enumerate}
`;
  for (const q of questions) {
    const number = q.source?.questionNumber;
    const meta = `GATE ${q.examPaper || 'CS'} ${q.year}${q.setNum ? ` (Set-${q.setNum})` : ''} | ${q.marks} Mark${q.questionType ? ` | ${q.questionType}` : ''}`;
    source += `\n\\item${number ? `[\\textbf{${escapeLatex(number)}}]` : ''} \\begin{minipage}[t]{\\linewidth}\n\\textbf{[${escapeLatex(meta)}]}\\par\\smallskip\n`;
    source += `${renderSourceQuestion(q)}\n\\end{minipage}\n\\par\\bigskip\n`;
  }
  source += '\\end{enumerate}\n';
  const answered = questions.filter((q) => q.correctOptions?.length || q.natAnswer);
  if (answered.length) {
    source += '\\clearpage\\section*{Answer key}\n\\renewcommand{\\arraystretch}{1.5}\n\\begin{tabular}{@{}ll@{\\qquad}ll@{\\qquad}ll@{}}\n';
    const cells = answered.map((q) => {
      const number = q.source?.questionNumber || String(questions.indexOf(q) + 1);
      const answer = q.correctOptions?.length ? q.correctOptions.join(', ') : q.natAnswer;
      return `\\textbf{${escapeLatex(number)}} & ${latexText(answer)}`;
    });
    for (let i = 0; i < cells.length; i += 3) {
      const row = cells.slice(i, i + 3);
      while (row.length < 3) row.push(' & ');
      source += `${row.join(' & ')} \\\\\n`;
    }
    source += '\\end{tabular}\n';
  }
  return source + '\\end{document}\n';
}
