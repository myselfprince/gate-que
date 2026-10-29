const raw = String.raw;
const sourceHash = '266f9e55d7f0ba3153564b3bcf7b0a2e9dadb2545072aecd577f2a7a4e173a66';
const answers = 'C B C 5 10 C C C C B B C B C D D C B D'.split(' ');
function question(number, year, marks, text, options = [], extra = {}) {
  const {notes = [], ...fields} = extra;
  return {
    id: `madeeasy-compiler-lexical-1-${number}`, text, code: '', year: String(year), marks: String(marks), setNum: '',
    rawTopic: 'Lexical Analysis', diagram: '', ext: '.png',
    optA: options[0] || '', optB: options[1] || '', optC: options[2] || '', optD: options[3] || '',
    questionType: options.length ? 'MCQ' : 'NAT', correctOptions: options.length ? [answers[number-1]] : [], natAnswer: options.length ? '' : answers[number-1],
    isBlank: false, isPosLocked: false, isCodeOptions: false, isProof: false, needsManualOptionFix: false, optLayout: 'auto', tempPaste: '', ...fields,
    source: {
      file: '10. Compiler Design/1. Lexical Analysis.pdf', sha256: sourceHash, questionNumber: `1.${number}`,
      bookPages: [number <= 12 ? 487 : 488], pdfPages: [number <= 12 ? 1 : 2], answerKeyPdfPage: 2,
      notes: ['Answer transcribed from the printed Lexical Analysis key, PDF page 2 / book page 489.',
        ...(number <= 12 ? ['Opening chapter leaf has no visible folio; book page 487 is inferred from the following numbered page 488.'] : []), ...notes],
    },
  };
}
export const COMPILER_LEXICAL_IMPORT = {
  subject: '10. Compiler Design', chapter: '1. Lexical Analysis', sourceHash,
  questions: [
    question(1,1995,1,`Which of the following strings can definitely be said to be token without looking at the next input character while compiling a Pascal program?
I. begin    II. Program    III. <>`,['I','II','III','All of these']),
    question(2,1995,1,raw`In some programming languages an identifier is permitted to be a letter followed by any number of letters or digits. If L and D denotes the sets of letters and digits respectively. Which of the following expression defines an identifier?`,[
      '$(L+D)^{+}$', '$L(L+D)^{*}$', raw`$(L\mathbin{.}D)^{*}$`, raw`$L(L\mathbin{.}D)^{*}$`,
    ]),
    question(3,1998,1,'Type checking is normally done during',['Lexical analysis','Syntax analysis','Syntax directed translation','Code optimization']),
    question(4,1999,2,`The number of tokens in the Fortran statement
[CODE]
is`,[],{code:'DO 10 I = 1.25',notes:['Printed answer key gives 5. The supplied explanation says Fortran has 3 tokens and then counts 5 for C. The conflicting printed key value 5 is preserved without inventing a corrected answer. Historical numeric response represented as NAT.']}),
    question(5,2000,1,`The number of tokens in the following C statement
[CODE]
is`,[],{code:'printf("i = %d, &i = %x", i, &i);',notes:['The book separately numbers this numeric-response entry and the same statement with MCQ options as Q1.6; both source entries are retained. Historical numeric response represented as NAT.']}),
    question(6,2000,1,`The number of tokens in the following C statement
[CODE]
is`,['3','26','10','21'],{code:'printf("i = %d, &i = %x", i, &i);'}),
    question(7,2003,2,`Which of the following is NOT an advantage of using shared, dynamically linked libraries as opposed to using statically linked libraries?`,[
      'Smaller sizes of executable', 'Lesser overall page fault rate in the system', 'Faster program startup', 'Existing programs need not be re-linked to take advantage of newer versions of libraries',
    ]),
    question(8,2004,1,raw`Consider a program P that consists of two source modules $M_1$ and $M_2$ contained in two different files. If $M_1$ contains a reference to a function defined in $M_2$, the reference will be resolved at`,['Edit-time','Compile-time','Link-time','Load-time'],{notes:['Question begins at the bottom of the first question column; options and exam metadata continue at the top of the next column on PDF page 1.']}),
    question(9,2005,2,`Consider line number 3 of the following C-program.
[CODE]
Identify the compiler's response about this line while creating the object-module`,['No compilation error','Only a lexical error','Only syntactic errors','Both lexical and syntactic errors'],{code:`int main () {             /* Line 1 */
    int i, n;             /* Line 2 */
    fro (i = 0, i < n, i++); /* Line 3 */
}`,notes:['Literal printed fro and comma-separated loop header are preserved; they are the error being examined.']}),
    question(10,2009,1,raw`Which of the following statements are TRUE?
I. There exist parsing algorithms for some programming languages whose complexities are less than $\theta(n^3)$.
II. A programming language, which allows recursion can be implemented with static storage allocation.
III. No L-attributed definition can be evaluated in the framework of bottom-up parsing.
IV. Code improving transformations can be performed at both source language and intermediate code level.`,['I and II','I and IV','III and IV','I, III and IV']),
    question(11,2010,1,'Which data structure in a compiler is used for managing information about variables and their attributes?',['Abstract syntax tree','Symbol table','Semantic stack','Parse table']),
    question(12,2011,1,'In a compiler, keywords of a language are recognized during',['parsing of the program','the code generation','the lexical analysis of the program','dataflow analysis']),
    question(13,2016,1,raw`Match the following.
$$\begin{array}{ll}
\text{List-I} & \text{List-II}\\
\text{P. Lexical analysis} & \text{(i) Leftmost derivation}\\
\text{Q. Top down parsing} & \text{(ii) Type checking}\\
\text{R. Semantic analysis} & \text{(iii) Regular expressions}\\
\text{S. Runtime environments} & \text{(iv) Activation records}
\end{array}$$
Codes:`,[
      raw`$\mathrm{P}\to\mathrm{(i)},\ \mathrm{Q}\to\mathrm{(ii)},\ \mathrm{R}\to\mathrm{(iv)},\ \mathrm{S}\to\mathrm{(iii)}$`,
      raw`$\mathrm{P}\to\mathrm{(iii)},\ \mathrm{Q}\to\mathrm{(i)},\ \mathrm{R}\to\mathrm{(ii)},\ \mathrm{S}\to\mathrm{(iv)}$`,
      raw`$\mathrm{P}\to\mathrm{(ii)},\ \mathrm{Q}\to\mathrm{(iii)},\ \mathrm{R}\to\mathrm{(i)},\ \mathrm{S}\to\mathrm{(iv)}$`,
      raw`$\mathrm{P}\to\mathrm{(iv)},\ \mathrm{Q}\to\mathrm{(i)},\ \mathrm{R}\to\mathrm{(ii)},\ \mathrm{S}\to\mathrm{(iii)}$`,
    ],{setNum:'2',optLayout:'1col'}),
    question(14,2017,1,raw`Match the following according to input (from the left column) to the compiler phase (in the right column) that processes it:
$$\begin{array}{ll}
\text{List-I} & \text{List-II}\\
\text{P. Syntax tree} & \text{(i) Code generator}\\
\text{Q. Character stream} & \text{(ii) Syntax analyzer}\\
\text{R. Intermediate representation} & \text{(iii) Semantic analyzer}\\
\text{S. Token stream} & \text{(iv) Lexical analyzer}
\end{array}$$`,[
      raw`$\mathrm{P}\to\mathrm{(ii)},\ \mathrm{Q}\to\mathrm{(iii)},\ \mathrm{R}\to\mathrm{(iv)},\ \mathrm{S}\to\mathrm{(i)}$`,
      raw`$\mathrm{P}\to\mathrm{(ii)},\ \mathrm{Q}\to\mathrm{(i)},\ \mathrm{R}\to\mathrm{(iii)},\ \mathrm{S}\to\mathrm{(iv)}$`,
      raw`$\mathrm{P}\to\mathrm{(iii)},\ \mathrm{Q}\to\mathrm{(iv)},\ \mathrm{R}\to\mathrm{(i)},\ \mathrm{S}\to\mathrm{(ii)}$`,
      raw`$\mathrm{P}\to\mathrm{(i)},\ \mathrm{Q}\to\mathrm{(iv)},\ \mathrm{R}\to\mathrm{(ii)},\ \mathrm{S}\to\mathrm{(iii)}$`,
    ],{setNum:'2',optLayout:'1col'}),
    question(15,2018,2,raw`A lexical analyzer uses the following patterns to recognize three tokens $T_1$, $T_2$ and $T_3$ over the alphabet {a, b, c}.
$T_1:\ \mathrm{a?\ (b|c)*a}$
$T_2:\ \mathrm{b?\ (a|c)*b}$
$T_3:\ \mathrm{c?\ (b|a)*c}$
Note that 'x?' means 0 or 1 occurrence of the symbol x. Note also that the analyzer outputs the token that matches the longest possible prefix.
If the string bbaacabc is processed by the analyzer, which one of the following is the sequence of tokens it outputs?`,['$T_1T_2T_3$','$T_1T_1T_3$','$T_2T_1T_3$','$T_3T_3$']),
    question(16,2020,1,`Consider the following statements:
I. Symbol table is accessed only during lexical analysis and syntax analysis.
II. Compilers for programming languages that support recursion necessarily need heap storage for memory allocation in the run-time environment.
III. Errors violating the condition 'any variable must be declared before its use' are detected during syntax analysis.
Which of the above statements is/are TRUE?`,['I only','I and III only','I only','None of I, II and III'],{notes:['Statements begin at the bottom of the left column and the prompt/options continue at the top of the next column on book page 488. Printed options A and C both read I only; this duplication is retained.']}),
    question(17,2021,2,`Consider the following ANSI C program:
[CODE]
Which one of the following phases in a seven-phase C compiler will throw an error?`,['Syntax analyzer','Machine dependent optimizer','Semantic analyzer','Lexical analyzer'],{setNum:'2',code:`int main() {
    Integer x;
    return 0;
}`,notes:['Capitalized Integer is literal source code and is retained as the error being examined.']}),
    question(18,2023,1,`Consider the following statements regarding the front-end and back-end of a compiler.
S1: The front-end includes phases that are independent of the target hardware.
S2: The back-end includes phases that are specific to the target hardware.
S3: The back-end includes phases that are specific to the programming language used in the source code.
Identify the CORRECT option.`,['Only S1 is TRUE.','Only S1 and S2 are TRUE.','S1, S2, and S3 are all TRUE.','Only S1 and S3 are TRUE.']),
    question(19,2024,1,`Consider the following two sets:
Set X
P. Lexical Analyzer
Q. Syntax Analyzer
R. Intermediate Code Generator
S. Code Optimizer
Set Y
1. Abstract Syntax Tree
2. Token
3. Parse Tree
4. Constant Folding
Which one of the following options is the CORRECT match from Set X to Set Y?`,['P - 4; Q - 1; R - 3; S - 2','P - 2; Q - 1; R - 3; S - 4','P - 4; Q - 3; R - 2; S - 1','P - 2; Q - 3; R - 1; S - 4'],{setNum:'2'}),
  ],
};
