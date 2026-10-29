const raw = String.raw;
const sourceHash = '207c753b90a883fe8a900313be8145b832bf0355cdb70e3f7992f64d8ca64b73';
const answers = ['A','B','C','A','D','B','A','C'];

function question(number, year, marks, text, options, extra = {}) {
  const {notes = [], ...fields} = extra;
  return {
    id: `madeeasy-algorithms-p-np-5-${number}`, text, code: '', year: String(year), marks: String(marks), setNum: '',
    rawTopic: 'P and NP Concepts', diagram: '', ext: '.png',
    optA: options[0], optB: options[1], optC: options[2], optD: options[3],
    questionType: 'MCQ', correctOptions: [answers[number-1]], natAnswer: '',
    isBlank: false, isPosLocked: false, isCodeOptions: false, isProof: false,
    needsManualOptionFix: false, optLayout: 'auto', tempPaste: '', ...fields,
    source: {
      file: '7. Algorithms/5. P and NP Concepts.pdf', sha256: sourceHash, questionNumber: `5.${number}`,
      bookPages: [476], pdfPages: [1], answerKeyPdfPage: 1,
      notes: ['Question visually transcribed from PDF spread 1 / book page 476; answer transcribed from the printed chapter key on the same spread / book page 477. Explanations are excluded.', ...notes],
    },
  };
}

const questions = [
  question(1,2006,1,'A problem in NP is NP-complete if',[
    'it can be reduced to the 3-SAT problem in polynomial time',
    'the 3-SAT problem can be reduced to it in polynomial time',
    'it can be reduced to any other problem in NP in polynomial time',
    'some problem in NP can be reduced to it in polynomial time',
  ],{notes:['The printed key and explanation both select (a). The reduction direction in option (a) appears inconsistent with the usual NP-completeness criterion (option b). The supplied answer A is preserved literally; no replacement answer is inferred.']}),
  question(2,2008,1,raw`For problems $X$ and $Y$, $Y$ is NP-complete and $X$ reduces to $Y$ in polynomial time. Which of the following is TRUE?`,[
    raw`If $X$ can be solved in polynomial time, then so can $Y$`,
    raw`$X$ is NP-complete`,raw`$X$ is NP-hard`,raw`$X$ is in NP, but not necessarily NP-complete`,
  ],{notes:['The printed key and explanation select (b), although reduction X to an NP-complete Y establishes membership in NP rather than NP-hardness (option d). The supplied answer B is preserved literally; this source-key conflict requires editorial review.']}),
  question(3,2009,1,raw`Let $\pi_A$ be a problem that belongs to the class NP. Then which one of the following is TRUE?`,[
    raw`There is no polynomial time algorithm for $\pi_A$`,
    raw`If $\pi_A$ can be solved deterministically in polynomial time, then $\mathrm{P}=\mathrm{NP}$`,
    raw`If $\pi_A$ is NP-hard, then it is NP-complete`,
    raw`$\pi_A$ may be undecidable`,
  ]),
  question(4,2013,1,raw`Which of the following statements are TRUE?
1. The problem of determining whether there exists a cycle in an undirected graph is in P.
2. The problem of determining whether there exists a cycle in an undirected graph is in NP.
3. If a problem A is NP-Complete, there exists a non-deterministic polynomial time algorithm to solve A.`,[
    '1, 2 and 3','1 and 3 only','2 only','3 only',
  ],{notes:['This is a single-choice combination-of-statements question, not an MSQ.']}),
  question(5,2014,2,'Suppose a polynomial time algorithm is discovered that correctly computes the largest clique in a given graph. In this scenario, which one of the following represents the correct Venn diagram of the complexity classes P, NP and NP Complete (NPC)?',[
    'IMG:p-np-5-5-A','IMG:p-np-5-5-B','IMG:p-np-5-5-C','IMG:p-np-5-5-D',
  ],{setNum:'1',optLayout:'2col',notes:['Figure-only option crops preserve the original Venn regions and labels. Options A/B occur at the bottom of the first column and C/D continue at the top of the second column on book page 476. The adjacent 2014 Set-1 / 2 M label belongs to Q5.5.']}),
  question(6,2014,2,raw`Consider the decision problem 2CNFSAT defined as follows:
$\{\phi\mid\phi\text{ is a satisfiable propositional formula in CNF with at most two literals per clause}\}$
For example, $\phi=(x_1\lor x_2)\land(x_1\lor\overline{x_3})\land(x_2\lor x_4)$ is a Boolean formula and it is in 2CNFSAT. The decision problem 2CNFSAT is`,[
    'NP-Complete.',
    'solvable in polynomial time by reduction to directed graph reachability.',
    'solvable in constant time since any input instance is satisfiable.',
    'NP-hard, but not NP-complete.',
  ],{setNum:'3'}),
  question(7,2015,1,raw`Consider two decision problems $Q_1$, $Q_2$ such that $Q_1$ reduces in polynomial time to 3-SAT and 3-SAT reduces in polynomial time to $Q_2$. Then which one of the following is consistent with the above statement?`,[
    raw`$Q_1$ is in NP, $Q_2$ is NP hard`,
    raw`$Q_2$ is in NP, $Q_1$ is NP hard`,
    raw`Both $Q_1$ and $Q_2$ are in NP`,
    raw`Both $Q_1$ and $Q_2$ are NP hard`,
  ],{setNum:'2'}),
  question(8,2015,2,raw`Language $L_1$ is polynomial time reducible to language $L_2$. Language $L_3$ is polynomial time reducible to $L_2$, which in turn is polynomial time reducible to language $L_4$. Which of the following is/are True?
I. If $L_4\in\mathrm{P}$, $L_2\in\mathrm{P}$
II. If $L_1\in\mathrm{P}$ or $L_3\in\mathrm{P}$, then $L_2\in\mathrm{P}$
III. $L_1\in\mathrm{P}$, if and only if $L_3\in\mathrm{P}$
IV. If $L_4\in\mathrm{P}$, then $L_1\in\mathrm{P}$ and $L_3\in\mathrm{P}$`,[
    'II only','III only','I and IV only','I only',
  ],{setNum:'3',notes:['Although the stem says is/are True, the options are single-choice combinations; the printed key selects only C.']}),
];

export const P_NP_IMPORT = {subject:'7. Algorithms',chapter:'5. P and NP Concepts',sourceHash,questions};
