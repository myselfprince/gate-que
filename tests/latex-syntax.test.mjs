import test from 'node:test';
import assert from 'node:assert/strict';
import { latexSegments } from '../src/lib/latex-segments.mjs';
import { buildLatexSource, renderSourceQuestion } from '../src/lib/latex-source.mjs';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';

test('escaped terminal dollars and prose currency do not swallow subsequent math', () => {
  const text = String.raw`Price \$5; $\{w,\$\}$; $$a\\\$b$$; \(x\); \[y\].`;
  const segments = latexSegments(text);
  assert.equal(segments.filter(segment => segment.math).length, 4);
  assert.equal(segments.map(segment => segment.text).join(''), text);
  assert.deepEqual(segments.filter(segment => segment.math).map(segment => segment.text),
    [String.raw`$\{w,\$\}$`, String.raw`$$a\\\$b$$`, String.raw`\(x\)`, String.raw`\[y\]`]);
});

test('large editable tables fit the available width without scaling prose or ordinary math', () => {
  const question = { text: String.raw`Stem $x+y$. $$\begin{array}{ll}A&B\\C&D\end{array}$$` };
  const source = renderSourceQuestion(question);
  assert.ok(source.startsWith('Stem $x+y$. '));
  assert.ok(source.includes(String.raw`\ifdim\wd0>\linewidth\resizebox{\linewidth}{!}{\copy0}`));
  assert.ok(source.includes(String.raw`\begin{array}{ll}A&B\\C&D\end{array}`));
});

test('both editable export layouts support Unicode pseudocode comparisons', () => {
  const payload = { subject: 'C', chapter: 'Pseudocode', questions: [{ text: 'Loop [CODE]', code: 'while r ≥ y do\nr ← r - y' }] };
  const before = structuredClone(payload);
  for (const build of [buildLatexSource, buildQuestionPages]) {
    const source = build(payload);
    assert.ok(source.includes(String.raw`literate={≥}{{$\geq$}}1`));
    assert.ok(source.includes('while r ≥ y do'));
  }
  assert.deepEqual(payload, before);
});
