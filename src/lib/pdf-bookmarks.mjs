import { PDFName, PDFHexString } from 'pdf-lib';

export function addQuestionBookmarks(document, questions) {
  const entries = questions.map((question, index) => {
    const number = String(index + 1);
    const title = `Q${number}${question.year ? ` - GATE ${question.year}` : ''}${question.questionType ? ` - ${question.questionType}` : ''}`;
    return { title, page: index };
  });
  addPdfBookmarks(document, entries);
}

export function addPdfBookmarks(document, entries) {
  if (!entries.length) return;
  const count = entries => entries.reduce((sum, item) => sum + 1 + count(item.children || []), 0);
  const root = document.context.obj({ Type: 'Outlines', Count: count(entries) });
  const rootRef = document.context.register(root);
  function append(items, parent, parentRef) {
    const nodes = items.map(item => {
      const node = document.context.obj({ Title: PDFHexString.fromText(item.title), Parent: parentRef, Dest: [document.getPage(item.page).ref, 'Fit'] });
      return { node, ref: document.context.register(node), item };
    });
    nodes.forEach(({ node, ref, item }, index) => {
      if (index) node.set(PDFName.of('Prev'), nodes[index - 1].ref);
      if (index + 1 < nodes.length) node.set(PDFName.of('Next'), nodes[index + 1].ref);
      if (item.children?.length) {
        node.set(PDFName.of('Count'), document.context.obj(count(item.children)));
        append(item.children, node, ref);
      }
    });
    parent.set(PDFName.of('First'), nodes[0].ref);
    parent.set(PDFName.of('Last'), nodes.at(-1).ref);
  }
  append(entries, root, rootRef);
  document.catalog.set(PDFName.of('Outlines'), rootRef);
}
