import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { ROUTING_APPLICATION_IMPORT } from '../data/imports/cn-routing-application.mjs';

// Source-checked repairs only. This script stages a manifest; it never writes MongoDB.
const root = path.resolve('tmp/question-syntax-audit');
const chapters = JSON.parse(await fs.readFile(path.join(root, 'chapters.json'), 'utf8'));
const patches = [];
const assets = [];
const r = String.raw;
function fix(ci, number, fields, reason, source) {
  const chapter = chapters[ci];
  const question = chapter.questions[number - 1];
  const changes = Object.fromEntries(Object.entries(fields).filter(([key, value]) => question[key] !== value)
    .map(([key, after]) => [key, { before: question[key], after }]));
  assert.ok(Object.keys(changes).length, `No change: ${ci}/${number}`);
  patches.push({ chapterId: chapter._id, subject: chapter.subject, chapter: chapter.chapter,
    number, questionId: question.id, changes, reason, source });
  Object.assign(question, fields);
}
const q = (ci, number) => chapters[ci].questions[number - 1];
const removeHtml = text => text.replace(/<img\b[^>]*>/g, '');
const rowBreaks = text => text.replace(/(?<!\\)\\(\s+\\hline)/g, r`\\$1`)
  .replace(/(\\+)hline\b/g, (_, slashes) => `${slashes}${slashes.length % 2 ? '' : '\\'}hline`);
async function copyAsset(from, ci, name, source) {
  const to = path.join('public', chapters[ci].subject, chapters[ci].chapter, `${name}.png`);
  const bytes = await fs.readFile(from);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  try { assert.equal(createHash('sha256').update(await fs.readFile(to)).digest('hex'), sha256); }
  catch (error) { if (error.code !== 'ENOENT') throw error; await fs.writeFile(to, bytes, { flag: 'wx' }); }
  assets.push({ from, to, sha256, source });
}

fix(4, 50, { text: q(4, 50).text.replace('[IMG_2]', '') },
  'The existing single image contains both P and Q automata; remove the nonexistent second reference.', 'Existing 50.png visually checked against Finite Automata PDF');
fix(15, 27, { text: q(15, 27).text.replace('[IMG_1]', '').replace('[IMG_2]', '[IMG_1]') },
  'The existing single image contains both the original and reversed linked lists.', 'Existing 27.png visually checked');

const fsmTable = r`$$\begin{array}{cc|c|cc|c}\text{Present }A&\text{Present }B&\text{Input}&\text{Next }A&\text{Next }B&\text{Output}\\\hline 0&0&0&0&0&1\\0&1&0&1&0&0\\1&0&0&0&1&0\\1&1&0&1&0&0\\0&0&1&0&1&0\\0&1&1&0&1&1\\1&0&1&1&0&1\\1&1&1&0&0&1\end{array}$$`;
fix(5, 41, { text: removeHtml(q(5, 41).text).replace('[DIAGRAM_PLACEHOLDER]', `\n${fsmTable}\n`), diagram: '' },
  'Restore the missing FSM state table as editable LaTeX, preserving all eight rows.', 'PDA PDF page 3, book 162, Q2.41');
await copyAsset(path.join(root, 'pda-2015-crop.png'), 5, 'audit-pda-2015-states', 'PDA PDF page 3, book 163, Q2.47');
fix(5, 47, { text: removeHtml(q(5, 47).text).replaceAll(r`\perp`, 'Z'), diagram: 'audit-pda-2015-states' },
  'Replace the hand-drawn image whose q1 loop incorrectly repeats input 0 instead of 1 with an exact source crop; remove obsolete HTML.', 'PDA PDF page 3, book 163, Q2.47');
fix(5, 50, { text: removeHtml(q(5, 50).text), optC: q(5, 50).optC.replace('one very input', 'on every input') },
  'Remove obsolete scraped HTML after the working diagram reference; preserve the existing hand-drawn image.', 'Existing PDA image visually compared with PDA PDF page 3, book 163, Q2.50');
fix(5, 60, {
  optA: r`$\{a^m b^n\mid m>0\text{ or }n>0\}$ and $\{a^m b^n\mid m>0\text{ and }n>0\}$`,
  optB: r`$\{a^m b^n\mid m>0\text{ and }n>0\}$ and $\{a^m b^n\mid m>0\text{ or }n\geq0\}$`,
  optC: r`$\{a^m b^n\mid m\geq0\text{ or }n\geq0\}$ and $\{a^m b^n\mid m>0\text{ and }n>0\}$`,
  optD: r`$\{a^m b^n\mid m\geq0\text{ and }n>0\}$ and $\{a^m b^n\mid m>0\text{ or }n>0\}$`,
}, 'Restore all four truncated options from the scanned book.', 'PDA PDF page 3, book 163, Q2.49');
fix(5, 65, { text: q(5, 65).text.replace(r`$\in$`, r`$\epsilon$`) },
  'Restore epsilon in the grammar production; membership symbol was a transcription error.', 'PDA PDF page 4, Q2.56');
fix(5, 70, { optD: r`$\{w,\$\}$` }, 'Escape the literal dollar terminal inside the set.', 'Parsing PDF page 3, book 495, Q2.37');
let pdaImages = 0;
fix(5, 81, { text: removeHtml(q(5, 81).text).replace(r`\sigma`, r`\Sigma`).replace(/\[DIAGRAM_PLACEHOLDER\]/g, () => `[IMG_${++pdaImages}]`), diagram: '63one,63two' },
  'Reconnect the two matching existing PDA images and remove obsolete scraped HTML.', 'PDA PDF page 4, book 165, Q2.63; both assets visually verified');
const parsingTable = r`$$\begin{array}{c|cccccc}&a&b&c&d&f&\$\\\hline S&&&(1)&S\to daT&(2)&\\T&T\to aS&T\to baT&(3)&&T\to\epsilon&(4)\\R&&&R\to caTR&&R\to\epsilon&\end{array}$$`;
let tableNumber = 0;
fix(5, 82, { text: removeHtml(q(5, 82).text).replace(/\[DIAGRAM_PLACEHOLDER\]/g, () => ++tableNumber === 1 ? `\n${parsingTable}\n` : ''), diagram: '',
  optA: r`(1) $S\to Rf$; (2) blank; (3) blank; (4) $T\to\epsilon$`,
  optB: r`(1) blank; (2) $S\to Rf$; (3) $T\to\epsilon$; (4) $T\to\epsilon$`,
  optC: r`(1) blank; (2) $S\to Rf$; (3) $T\to\epsilon$; (4) blank`,
  optD: r`(1) $S\to Rf$; (2) $S\to Rf$; (3) $T\to\epsilon$; (4) $T\to\epsilon$`,
}, 'Restore the parsing table and all four missing option combinations as editable text/math.', 'Compiler Parsing Techniques PDF page 3, book 495, Q2.44');
fix(5, 86, { text: removeHtml(q(5, 86).text).replace('input symbol or ,', r`input symbol or $\epsilon$,`).replace('[DIAGRAM_PLACEHOLDER]', '[IMG_1]'), diagram: '71' },
  'Reconnect the correct existing PDA image and restore the missing epsilon.', 'PDA PDF page 5, book 166, Q2.71');

fix(6, 12, { text: r`Nobody knows yet if $P=NP$. Consider the language $L$ defined as follows: $L=\begin{cases}(0+1)^* & \text{if }P=NP\\\phi & \text{otherwise}\end{cases}$ Which of the following statements is true?` },
  'Repair the malformed piecewise expression and row separator.', 'Turing Machine PDF page 1, book 176, Q3.8');
fix(6, 13, { text: q(6, 13).text.replace(r`\cup {#}`, r`\cup \{\#\}`).replace('${w_i # w_j', r`$\{w_i \# w_j`).replace('i<j}$', r`i<j\}$`).replace('$#$', r`$\#$`) },
  'Escape literal hash symbols and set braces.', 'Turing Machine PDF; punctuation-only syntax repair');
fix(6, 29, { text: q(6, 29).text.replace('{0,1}', r`\{0,1\}`).replace(r`L = {\langle`, r`L = \{\langle`).replace('2014}', r`2014\}`) },
  'Render literal set boundaries correctly across prose/math spans.', 'Turing Machine PDF page 2, book 179, Q3.25');
fix(6, 34, { text: q(6, 34).text.replaceAll(r`= {\langle`, r`= \{\langle`).replaceAll('$}$', r`$\}$`).replace(r`L_3 = \{\langle M \mid`, r`L_3 = \{\langle M \rangle \mid`).replace(r`\varepsilon}`, r`\varepsilon\}`) },
  'Repair literal set boundaries and the missing closing machine-encoding bracket.', 'Turing Machine PDF page 3, book 180, Q3.33');
fix(6, 40, { text: q(6, 40).text.replace('$#$', r`$\#$`).replace('${x#f(x)', r`$\{x\#f(x)`).replace('A^*}$', r`A^*\}$`) },
  'Escape the literal hash terminal and render the set braces.', 'Turing Machine PDF page 3, book 181, Q3.35');
const officialFsm = r`$$\begin{array}{c|cc|cc}\text{Present state}&\text{Next state}&\text{Next state}&\text{Output }f&\text{Output }f\\&X=0&X=1&X=0&X=1\\\hline A&F&B&0&0\\B&D&C&0&0\\C&F&E&0&0\\D&G&A&1&0\\E&D&C&0&0\\F&F&B&1&1\\G&G&H&0&1\\H&G&A&1&0\end{array}$$`;
fix(6, 50, { text: q(6, 50).text.replace('[DIAGRAM_PLACEHOLDER]', `\n${officialFsm}\n`), diagram: '' },
  'Restore the missing eight-state transition/output table as editable LaTeX. The 2025 record predates this audit and lies outside the supplied book coverage.', 'Official IIT Roorkee GATE 2025 CS1 PDF, page 59, Q59; visually verified: https://gate2025.iitr.ac.in/doc/2025/2025_QP/CS1.pdf');

await copyAsset('public/3. Computer Networks/3. TCP, UDP and IP/cn-tcp-ip-3-12-network.png', 7, 'audit-cn-ip-networks', 'TCP/IP PDF Q3.12-3.13');
fix(7, 18, { diagram: 'audit-cn-ip-networks' }, 'Reconnect the exact matching network diagram.', 'TCP/IP PDF page 1, Q3.12-3.13');
fix(7, 21, { text: rowBreaks(q(7, 21).text.replaceAll(r`\ &`, r`\\ &`)) },
  'Repair table continuation row separators.', 'ISO/OSI PDF page 1, book 666, Q1.2');
await copyAsset('public/3. Computer Networks/4. Routing and Application Layer/cn-routing-4-7-bridges.png', 7, 'audit-cn-spanning-tree', 'Routing PDF Q4.7-4.8');
const forwarding = ROUTING_APPLICATION_IMPORT.questions[7];
let bridgeImages = 0;
fix(7, 36, { diagram: 'audit-cn-spanning-tree', optLayout: '2col', text: q(7, 36).text.replace(/\[DIAGRAM_PLACEHOLDER\]/g, () => ++bridgeImages === 1 ? '[IMG_1]' : ''),
  ...Object.fromEntries(['optA', 'optB', 'optC', 'optD'].map(field => [field, forwarding[field]])) },
  'Reconnect the bridge diagram and restore all four omitted forwarding tables, including the printed anomaly.', 'Routing PDF Q4.8; existing reviewed source import');
fix(7, 37, { diagram: 'audit-cn-spanning-tree' }, 'Reconnect the matching bridge diagram.', 'Routing PDF Q4.7');
await copyAsset(path.join(root, 'manchester-crop.png'), 7, 'audit-cn-manchester', 'ISO/OSI PDF page 1, book 667, Q1.18');
fix(7, 50, { diagram: 'audit-cn-manchester' }, 'Restore the two waveforms with an exact source crop.', 'ISO/OSI PDF page 1, book 667, Q1.18');
fix(7, 63, { text: rowBreaks(q(7, 63).text).replace(/\\mathbf\{([dr])\}\*\{\\mathbf\{(\d)\}\}/g, r`\mathbf{$1}_{$2}`) },
  'Repair all table row separators and mis-transcribed d/r subscripts.', 'ISO/OSI PDF page 2, book 668, Q1.23');
await copyAsset('public/3. Computer Networks/3. TCP, UDP and IP/cn-tcp-ip-3-55-network.png', 7, 'audit-cn-store-forward', 'TCP/IP PDF page 3, book 691, Q3.55');
fix(7, 93, { diagram: 'audit-cn-store-forward' }, 'Reconnect the exact store-and-forward diagram.', 'TCP/IP PDF page 3, book 691, Q3.55; source visually verified');
const hamming = r`$$\begin{array}{c|cccccccc}\text{Data bits}&d_8&d_7&d_6&d_5&d_4&d_3&d_2&d_1\\\hline&1&1&0&x&0&1&0&1\end{array}$$ $$\begin{array}{c|cccc}\text{Check bits}&c_8&c_4&c_2&c_1\\\hline&y&0&1&0\end{array}$$`;
fix(7, 135, { text: q(7, 135).text.replace('[DIAGRAM_PLACEHOLDER]', `\n${hamming}\n`), diagram: '' },
  'Restore the missing data/check-bit tables as editable LaTeX; preserve the printed codeword anomaly.', 'ISO/OSI PDF page 2, book 669, Q1.36');
fix(7, 142, { text: rowBreaks(q(7, 142).text) }, 'Repair all table row separators.', 'Mechanical syntax correction only; 2025 question is outside the supplied book coverage');

await copyAsset('public/3. Computer Networks/4. Routing and Application Layer/cn-routing-4-15-graph.png', 9, 'audit-cn-unit-cost-routing', 'Routing PDF Q4.15-4.16');
for (const number of [14, 15]) fix(9, number, { diagram: 'audit-cn-unit-cost-routing',
  ...(number === 15 ? { optLayout: '2col', ...Object.fromEntries(['optA', 'optB', 'optC', 'optD'].map(field => [field, rowBreaks(q(9, 15)[field])])) } : {}) },
  'Reconnect the matching unit-cost routing graph and repair missing table-rule command escapes.', 'Routing PDF Q4.15-4.16');
fix(9, 26, { text: rowBreaks(q(9, 26).text) }, 'Repair routing-table row separators while preserving legacy fields and the verified-source alternative.', 'TCP/IP PDF page 2, book 688, Q3.24');
await copyAsset('public/3. Computer Networks/4. Routing and Application Layer/cn-routing-4-10-network.png', 9, 'audit-cn-distance-vector', 'Routing PDF Q4.10');
fix(9, 35, { diagram: 'audit-cn-distance-vector', optLayout: '2col', ...Object.fromEntries(['text', 'optA', 'optB', 'optC', 'optD'].map(field => [field, rowBreaks(q(9, 35)[field])])) },
  'Reconnect the exact graph and repair all table row separators, preserving every numeric entry.', 'Routing PDF Q4.10');
fix(16, 43, { ...Object.fromEntries(['optA', 'optB', 'optC', 'optD'].map(field => [field, q(16, 43)[field].replaceAll('= =', '==')])), isCodeOptions: true },
  'Restore valid equality operators in code options and display them as code; preserve the position lock.', 'C Programming PDF page 4, book 321, Q1.43');
fix(16, 30, { text: q(16, 30).text.replace(' Let $n', '\nLet $n') },
  'Give the inline digit expression its own line so the editor does not clip it.', 'Formatting only; all question wording, code, options and locks preserved');

await fs.writeFile(path.join(root, 'patches.json'), JSON.stringify({ createdAt: new Date(), patches, assets }, null, 2));
await fs.writeFile(path.join(root, 'staged-chapters.json'), JSON.stringify(chapters, null, 2));
console.log(JSON.stringify({ questionsToRepair: patches.length, fields: patches.reduce((sum, patch) => sum + Object.keys(patch.changes).length, 0), assets: assets.length }));
