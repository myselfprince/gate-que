import { PDFName } from 'pdf-lib';
import { latexText } from './latex-source.mjs';
import { storedAnswerText } from './question-answers.mjs';

// Native PDF optional-content groups need no JavaScript or extra TeX package.
export const ANSWER_TOGGLE_PREAMBLE = String.raw`\newcommand{\gateanswerrefs}{}
\newcommand{\gateanswerref}{}`;
export function answerLayerSetup(question, settings, index) {
  if (settings.answerMode !== 'toggle') return '';
  if (!storedAnswerText(question) && !question.specialNote) return '\\pdfpageresources{}\n';
  return `\\immediate\\pdfobj{<< /Type /OCG /Name (G4Gate answer ${index + 1}) >>}
\\edef\\gateanswerref{\\the\\pdflastobj\\space 0 R}
\\xdef\\gateanswerrefs{\\gateanswerrefs\\gateanswerref\\space}
\\edef\\gateanswerresources{/Properties << /GateAnswer \\gateanswerref >>}
\\expandafter\\pdfpageresources\\expandafter{\\gateanswerresources}
`;
}
export const ANSWER_TOGGLE_CATALOG = String.raw`\pdfcatalog{/OCProperties << /OCGs [\gateanswerrefs] /D << /BaseState /OFF /OFF [\gateanswerrefs] /Order [\gateanswerrefs] >> >>}`;
export function answerFooter(question, settings) {
  const answer = storedAnswerText(question);
  if ((!answer && !question.specialNote) || settings.answerMode === 'none' || !settings.answerMode) return '';
  const content = `\\textbf{Answer:} ${latexText(answer || 'Answer under review')}${question.specialNote ? `\\par\\textbf{Admin special note:} ${latexText(question.specialNote)}` : ''}`;
  if (settings.answerMode === 'footer') return `{\\fontsize{10}{14}\\selectfont ${content}}`;
  return `{\\fontsize{10}{14}\\selectfont
\\leavevmode\\pdfstartlink attr{/Border [0 0 0]} user{/Subtype /Link /A << /S /SetOCGState /State [/Toggle \\gateanswerref] /PreserveRB true >>}\\textbf{Show / hide answer}\\pdfendlink\\par\\vspace{4pt}
\\noindent\\leavevmode\\pdfliteral direct{/OC /GateAnswer BDC}${content}\\pdfliteral direct{EMC}}`;
}

// copyPages retains page resources/actions, but not the source catalog. Rebuild
// the catalog using the copied group refs so batches and books stay interactive.
export function registerAnswerLayers(document) {
  const groups = new Map();
  const visit = (value, seen = new Set()) => {
    if (!value) return;
    const object = document.context.lookup(value);
    if (!object || seen.has(object)) return;
    seen.add(object);
    if (object.get?.(PDFName.of('Type'))?.toString() === '/OCG') {
      const name = object.lookup(PDFName.of('Name'))?.decodeText?.() || '';
      if (name.startsWith('G4Gate answer ')) groups.set(value.toString(), value);
    } else if (typeof object.entries === 'function') for (const [, child] of object.entries()) visit(child, seen);
    else if (typeof object.asArray === 'function') for (const child of object.asArray()) visit(child, seen);
  };
  for (const page of document.getPages()) visit(page.node.Resources()?.lookup(PDFName.of('Properties')));
  if (groups.size) {
    const refs = [...groups.values()];
    document.catalog.set(PDFName.of('OCProperties'), document.context.obj({ OCGs: refs, D: { BaseState: 'OFF', OFF: refs, Order: refs } }));
  }
  return groups.size;
}
