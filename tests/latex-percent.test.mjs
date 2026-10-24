import test from 'node:test';
import assert from 'node:assert/strict';
import { latexText, buildLatexSource } from '../src/lib/latex-source.mjs';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';

test('literal percentages remain visible in prose and every supported math delimiter', () => {
  const text = String.raw`50% outside, $50%$, $$25%$$, \(75%\), \[100%\].`;
  const expected = String.raw`50\% outside, $50\%$, $$25\%$$, \(75\%\), \[100\%\].`;
  assert.equal(latexText(text), expected);
});

test('escaped percentages are preserved and a TeX line break does not escape the following percent', () => {
  const escaped = String.raw`$50\%$ and $$\text{25\%}$$`;
  assert.equal(latexText(escaped), escaped);
  assert.equal(latexText(String.raw`$$\begin{array}{c}50\\%25\end{array}$$`),
    String.raw`$$\begin{array}{c}50\\\%25\end{array}$$`);
});

test('literal dollars in parsing tables keep the complete math block editable', () => {
  const math = String.raw`$\begin{array}{cc} a & \$ \\ b & c \end{array}$`;
  assert.equal(latexText(math), math);
  assert.equal(latexText(String.raw`Price \$5 and $x \lt y \gt z$`), String.raw`Price \$5 and $x < y > z$`);
  assert.equal(latexText(String.raw`$x#y$ and $\#$`), String.raw`$x\#y$ and $\#$`);
});

test('the failing logic statement exports intact through both LaTeX layouts without changing question data', () => {
  const question = {
    text: 'Let $p$ and $q$ be the following propositions:\n$q :$ Student scores more than 50% marks.\n'
      + 'Consider: ${\\textit{``Fail grade cannot be given when student scores more than 50% marks.``}}$',
    optA: String.raw`$q \rightarrow p$`,
    optB: String.raw`$q \rightarrow \neg p$`,
    optC: String.raw`$p \rightarrow q$`,
    optD: String.raw`$\neg p \rightarrow q$`,
    year: '2023', marks: '1',
  };
  const before = structuredClone(question);
  const payload = { subject: 'Discrete Maths', chapter: 'Mathematical Logic', questions: [question] };
  for (const build of [buildLatexSource, buildQuestionPages]) {
    const tex = build(payload);
    assert.ok(tex.includes('\\textit{``Fail grade cannot be given when student scores more than 50\\% marks.``}'));
    assert.equal((tex.match(/50\\%/g) || []).length, 2);
  }
  assert.deepEqual(question, before);
});
