import { PDFName, PDFString } from 'pdf-lib';
import { latexText } from './latex-source.mjs';
import { storedAnswerText } from './question-answers.mjs';

// "Show / hide on click" answers are PDF form checkboxes with two pre-rendered
// appearances: "Off" draws "Show answer" and "Answer" draws the typeset answer.
// Clicking a checkbox switches its appearance in every reader with basic form
// support (Chrome, Edge, Firefox/pdf.js, Acrobat), with no JavaScript and no
// optional-content layer support. Field names start with this prefix.
export const ANSWER_FIELD_PREFIX = 'gate-answer-';
export const ANSWER_ON_STATE = 'Answer';

// The appearance streams start without the page's colour, so the foreground is set inside each one.
export const answerTogglePreamble = foreground => String.raw`\newcommand{\gateanswerrefs}{}
\newbox\gateanswerprobe
\newbox\gateansweronbox
\newbox\gateansweroffbox
\newdimen\gateanswerinner
% #1 field name, #2 1 to wrap at the full line width (special notes), #3 typeset answer.
\newcommand{\gateanswertoggle}[3]{\begingroup\fontsize{10}{14}\selectfont
  \setbox\gateanswerprobe=\hbox{\textbf{Show answer}}\gateanswerinner=\wd\gateanswerprobe
  \ifnum#2=1 \gateanswerinner=\dimexpr\linewidth-8pt\relax
  \else\setbox\gateanswerprobe=\hbox{#3}\ifdim\wd\gateanswerprobe>\gateanswerinner\gateanswerinner=\wd\gateanswerprobe\fi
    \ifdim\gateanswerinner>\dimexpr\linewidth-8pt\relax\gateanswerinner=\dimexpr\linewidth-8pt\relax\fi\fi
  \setbox\gateansweronbox=\vbox{\kern3pt\hbox{\kern4pt\vbox{\hsize=\gateanswerinner\raggedright\noindent\color{${foreground}}#3\par}\kern4pt}\kern3pt\kern0pt}%
  \setbox\gateansweroffbox=\vbox to\ht\gateansweronbox{\kern3pt\hbox to\wd\gateansweronbox{\kern4pt\color{${foreground}}\textbf{Show answer}\hss}\vfil\kern0pt}%
  \edef\gateanswerwidth{\the\wd\gateansweronbox}\edef\gateanswerheight{\the\ht\gateansweronbox}%
  \immediate\pdfxform\gateansweroffbox\edef\gateansweroff{\the\pdflastxform\space 0 R}%
  \immediate\pdfxform\gateansweronbox\edef\gateansweron{\the\pdflastxform\space 0 R}%
  \pdfannot reserveobjnum\edef\gateanswerfield{\the\pdflastannot}%
  \xdef\gateanswerrefs{\gateanswerrefs\gateanswerfield\space 0 R\space}%
  \leavevmode\hbox to\gateanswerwidth{\pdfannot useobjnum\gateanswerfield\space width\gateanswerwidth\space height\gateanswerheight\space depth 0pt
    {/Subtype /Widget /FT /Btn /T (#1) /TU (Show or hide the answer) /F 4 /V /Off /AS /Off
     /AP << /N << /${ANSWER_ON_STATE} \gateansweron\space /Off \gateansweroff\space >> /D << /${ANSWER_ON_STATE} \gateansweron\space /Off \gateansweroff\space >> >> /MK << >>}%
    \vrule width 0pt height\gateanswerheight\space depth 0pt\hss}\endgroup}`;

// Readers only make widgets interactive when the catalog lists them as form fields.
export const ANSWER_TOGGLE_CATALOG = String.raw`\pdfcatalog{/AcroForm << /Fields [\gateanswerrefs] >>}`;

export function answerFooter(question, settings, page = 1) {
  const answer = storedAnswerText(question);
  if ((!answer && !question.specialNote) || settings.answerMode === 'none' || !settings.answerMode) return '';
  const content = `\\textbf{Answer:} ${latexText(answer || 'Answer under review')}${question.specialNote ? `\\par\\textbf{Admin special note:} ${latexText(question.specialNote)}` : ''}`;
  if (settings.answerMode === 'footer') return `{\\fontsize{10}{14}\\selectfont ${content}}`;
  const foreground = settings.theme === 'dark' ? 'white' : 'black';
  const hint = `{\\color{${foreground}!55}\\quad click to hide}`;
  return `\\gateanswertoggle{${ANSWER_FIELD_PREFIX}${page}}{${question.specialNote ? 1 : 0}}{${content}${question.specialNote ? `\\par${hint}` : hint}}`;
}

function collect(document, value, visit, seen = new Set()) {
  if (!value) return;
  const object = document.context.lookup(value);
  if (!object || seen.has(object)) return;
  seen.add(object);
  visit(value, object);
  if (typeof object.entries === 'function') for (const [, child] of object.entries()) collect(document, child, visit, seen);
  else if (typeof object.asArray === 'function') for (const child of object.asArray()) collect(document, child, visit, seen);
}

// copyPages retains page annotations and resources, but not the source catalog.
// Re-register the copied answer checkboxes as form fields with unique names, so
// each question toggles on its own in merged batches and books. Optional-content
// groups from PDFs exported before the checkbox toggle are re-registered too.
export function registerAnswerLayers(document) {
  const groups = new Map(), fields = [];
  document.getPages().forEach(page => {
    collect(document, page.node.Resources()?.lookup(PDFName.of('Properties')), (ref, object) => {
      if (object.get?.(PDFName.of('Type'))?.toString() !== '/OCG') return;
      const name = object.lookup(PDFName.of('Name'))?.decodeText?.() || '';
      if (name.startsWith('G4Gate answer ')) groups.set(ref.toString(), ref);
    });
    const annots = page.node.Annots();
    for (let index = 0; index < (annots?.size() || 0); index++) {
      const ref = annots.get(index), widget = document.context.lookup(ref);
      const name = widget?.lookup?.(PDFName.of('T'))?.decodeText?.() || '';
      if (widget?.get?.(PDFName.of('Subtype'))?.toString() === '/Widget' && name.startsWith(ANSWER_FIELD_PREFIX)) fields.push(ref);
    }
  });
  if (groups.size) {
    const refs = [...groups.values()];
    document.catalog.set(PDFName.of('OCProperties'), document.context.obj({ OCGs: refs, D: { BaseState: 'OFF', OFF: refs, Order: refs } }));
  }
  if (fields.length) {
    fields.forEach((ref, index) => {
      const widget = document.context.lookup(ref);
      widget.set(PDFName.of('T'), PDFString.of(`${ANSWER_FIELD_PREFIX}${index + 1}`));
      // Every copy starts hidden, whatever state the source file was saved in.
      widget.set(PDFName.of('V'), PDFName.of('Off'));
      widget.set(PDFName.of('AS'), PDFName.of('Off'));
    });
    document.catalog.set(PDFName.of('AcroForm'), document.context.obj({ Fields: fields }));
  }
  return groups.size + fields.length;
}
