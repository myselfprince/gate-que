import { PDFName, PDFHexString } from 'pdf-lib';

export function addQuestionBookmarks(document, questions) {
  if (!questions.length) return;
  const root = document.context.obj({ Type: 'Outlines', Count: questions.length });
  const rootRef = document.context.register(root);
  const nodes = questions.map((question, index) => {
    const number = question.source?.questionNumber || question.exportNumber || String(index + 1);
    const title = `Q${number}${question.year ? ` - GATE ${question.year}` : ''}${question.questionType ? ` - ${question.questionType}` : ''}`;
    const node = document.context.obj({ Title: PDFHexString.fromText(title), Parent: rootRef, Dest: [document.getPage(index).ref, 'Fit'] });
    return { node, ref: document.context.register(node) };
  });
  nodes.forEach(({ node }, index) => {
    if (index) node.set(PDFName.of('Prev'), nodes[index - 1].ref);
    if (index + 1 < nodes.length) node.set(PDFName.of('Next'), nodes[index + 1].ref);
  });
  root.set(PDFName.of('First'), nodes[0].ref);
  root.set(PDFName.of('Last'), nodes.at(-1).ref);
  document.catalog.set(PDFName.of('Outlines'), rootRef);
}
