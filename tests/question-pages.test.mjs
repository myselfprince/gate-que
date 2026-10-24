import test from 'node:test';
import assert from 'node:assert/strict';
import { LAN_IMPORT } from '../data/imports/cn-lan.mjs';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';

test('question-page layout uses full width, a dark theme and one page boundary per question', () => {
  const tex = buildQuestionPages(LAN_IMPORT);
  assert.match(tex, /\\pagecolor\{black\}/);
  assert.match(tex, /\\color\{white\}/);
  assert.match(tex, /\\begin\{minipage\}\[t\]\{\\textwidth\}/);
  assert.equal((tex.match(/% Question page /g) || []).length, 35);
  assert.equal((tex.match(/\\clearpage/g) || []).length, 34);
  assert.match(tex, /\\PackageError\{G4Gate\}/);
  assert.doesNotMatch(tex, /multicols|\\begin\{questions\}|Answer key|\\\\n\\end\{tabular\}/);
  assert.match(tex, /GATE 2024 \(Set-2\)/);
  assert.match(tex, /35 \/ 35/);
});

test('chunks retain global numbering without a separate title page', () => {
  const tex = buildQuestionPages({ ...LAN_IMPORT, questions: LAN_IMPORT.questions.slice(20) }, { startIndex: 20, totalQuestions: 35 });
  assert.match(tex, /21 \/ 35/);
  assert.match(tex, /35 \/ 35/);
  assert.equal((tex.match(/\\clearpage/g) || []).length, 14);
  assert.doesNotMatch(tex, /Part 2|\\maketitle/);
});

test('full-width fitting keeps one editable body instead of repeated question text', () => {
  const tex = buildQuestionPages({ subject: 'Subject', chapter: 'Chapter', questions: [{ text: 'Editable body only once.' }] });
  assert.equal((tex.match(/Editable body only once\./g) || []).length, 1);
  assert.match(tex, /\\renewcommand\{\\questionbody\}/);
  assert.match(tex, /\\fontsize\{17\}\{24\.56\}/);
  assert.match(tex, /\\setlength\{\\questionimageheight\}/);
});

test('figures, listings, blank placeholders and NAT prompts retain their structure', () => {
  const figure = { ...LAN_IMPORT.questions[0], text: 'Before [IMG_1] after [CODE]', diagram: 'figure', code: 'if (x < 2) {\n  x++;\n}' };
  const tex = buildQuestionPages({ ...LAN_IMPORT, questions: [figure, { ...figure, isBlank: true }, LAN_IMPORT.questions[17]] }, { imageRoot: 'E:/Question Images' });
  assert.match(tex, /E:\/Question Images\/figure.png/);
  assert.ok(tex.indexOf('Before') < tex.indexOf('includegraphics'));
  assert.ok(tex.indexOf('includegraphics') < tex.indexOf(' after'));
  assert.match(tex, /\\begin\{lstlisting\}/);
  assert.doesNotMatch(tex, /\\end\{lstlisting\}\s*\\newline/);
  assert.match(tex, /Blank placeholder/);
  assert.match(tex, /\\rule\{2cm\}/);
  assert.doesNotMatch(tex, /0\.4404/);
  assert.doesNotMatch(tex, /IMG_1|\[CODE\]/);
});

test('long code is captured once outside fitting conditionals while prose keeps full width',()=>{
  const question={text:'Prose before [CODE] and after.',code:'for (i=0; i<10; i++)\n    a[i] = b[i] * 8;',optA:'One',optB:'Two',optC:'Three',optD:'Four'};
  const tex=buildQuestionPages({subject:'COA',chapter:'CPU',questions:[question]});
  assert.equal((tex.match(/a\[i\] = b\[i\] \* 8;/g)||[]).length,1);
  assert.equal((tex.match(/Prose before/g)||[]).length,1);
  assert.ok(tex.indexOf('\\end{lstlisting}')<tex.indexOf('\\ifdim'));
  assert.match(tex,/\\scalebox\{\\questioncodescale\}\{\\usebox\{\\questioncodebox\}\}/);
  assert.match(tex,/\\renewcommand\{\\questioncodescale\}\{0\.722\}/);
  assert.match(tex,/\\begin\{minipage\}\[t\]\{\\textwidth\}/);
});
