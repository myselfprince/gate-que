// Reviewed visually against all four supplied scanned spreads, including continuations.
const r=String.raw;
const m=value=>`$${value}$`;
const sourceHash='41cd95b1b2efe20c72011eb32e607fb4c5701672be021a6546520eb5be1a6467';
const key='- A A B A A C D B D - A D C C A A A C D A A A D B C C D A - - B B - D B A'.split(' ');
const nat={30:'3',31:'4',34:'2'};
export const SEQUENTIAL_PARTIAL_SOLUTION=r`The supplied solution for part (b) tabulates the cycle $S_4\to S_2\to S_5\to S_6\to S_7\to S_3\to S_1\to S_4$. The state which is not reachable is $S_0$. The supplied PDF does not print a complete state diagram for part (a).`;
const img=name=>`IMG:sequential-3-${name}`;
function question(n,year,marks,text,options=[],extra={}) {
  const {notes=[],...fields}=extra;
  const bookPages=n<=4?[221]:n<=11?[222]:n===12?[222,223]:n<=18?[223]:n===19?[223,224]:n<=26?[224]:n<=34?[225]:[226];
  const pdfPages=[...new Set(bookPages.map(p=>Math.floor((p-220)/2)+1))];
  return {id:`madeeasy-digital-logic-sequential-3-${n}`,text,code:'',year:String(year),marks:String(marks),setNum:'',rawTopic:'Sequential Circuits',diagram:'',ext:'.png',
    optA:options[0]||'',optB:options[1]||'',optC:options[2]||'',optD:options[3]||'',questionType:n===1?'SUBJECTIVE':nat[n]?'NAT':'MCQ',correctOptions:key[n-1]==='-'?[]:[key[n-1]],natAnswer:n===1?SEQUENTIAL_PARTIAL_SOLUTION:nat[n]||'',
    isBlank:false,isPosLocked:false,isCodeOptions:false,isProof:false,needsManualOptionFix:false,optLayout:'auto',tempPaste:'',...fields,
    source:{file:'9. Digital Logic/3. Sequential Circuits.pdf',sha256:sourceHash,questionNumber:`3.${n}`,pdfPages,bookPages,answerKeyPdfPage:4,
      notes:['All four scanned spreads visually reviewed. Printed answer key: PDF page 4, book page 227. Previous-chapter explanations on page 220 and explanations after the key are excluded from question text.',...notes]}};
}
const common=r`Consider the following circuit involving three D-type flip-flops used in a certain type of counter configuration.
[IMG_1]`;
const questions=[
  question(1,1996,5,r`Consider the synchronous sequential circuit in the figure.
[IMG_1]
(a) Draw a state diagram which is implemented by the circuit. Use the following names for the states corresponding to the values of flip-flops as given below.
$$\begin{array}{ccc|c}Q_1&Q_2&Q_3&\text{State}\\\hline 0&0&0&S_0\\0&0&1&S_1\\\vdots&\vdots&\vdots&\vdots\\1&1&1&S_7\end{array}$$
(b) Given that the initial state of the circuit is $S_4$, identify the set of states which are not reachable.`,[],{diagram:'sequential-3-1',notes:['Historical subjective question, not NAT. Key says "Sol.". The supplied solution on book page 227 contains the part (b) state cycle/table and S0 answer; no complete part (a) state diagram is supplied. Partial answer preserved without inventing the missing solution.']}),
  question(2,2000,2,r`The following arrangement of master-slave flip flops
[IMG_1]
has the initial state of P, Q as 0, 1 (respectively). After the clock cycles the output state P, Q is (respectively),`,['1, 0','1, 1','0, 0','0, 1'],{diagram:'sequential-3-2',notes:['The source does not specify a number of clock cycles. Its key is (a), and its supplied explanation says PQ alternates between 01 and 10. Wording/key retained.']}),
  question(3,2001,2,r`Consider the following circuit with initial state $Q_0=Q_1=0$. The D flip-flops are positive edge triggered and have set up time 20 ns and hold time is 0 ns.
[IMG_1]
Consider the following timing diagrams of X and C; the clock period of $C\geq40$ nanosecond. Which one is the correct plot of Y?
[IMG_2]`,['a','b','c','d'].map(s=>img(`3-${s}`)),{diagram:'sequential-3-3-circuit,sequential-3-3-timing',optLayout:'2col',pdfStyle:{imageScale:0.5}}),
  question(4,2001,2,r`Consider the circuit given below with initial state $Q_0=1$, $Q_1=Q_2=0$. The state of the circuit is given by the value $4Q_2+2Q_1+Q_0$.
[IMG_1]
Which one of the following is the correct state sequence of the circuit`,['1, 3, 4, 6, 7, 5, 2','1, 2, 5, 3, 7, 6, 4','1, 2, 7, 3, 5, 6, 4','1, 6, 5, 7, 2, 3, 4'],{diagram:'sequential-3-4'}),
  question(5,2002,2,r`The finite state machine described by the following state diagram with A as starting state, where an arc label x/y and x stands for 1-bit input and y stands for 2-bit output
[IMG_1]`,['Outputs the sum of the present and the previous bits of the input.','Outputs 01 whenever the input sequence contains 11.','Outputs 00 whenever the input sequence contains 10.','None of the above'],{diagram:'sequential-3-5'}),
  question(6,2003,2,r`A 1-input, 2-output synchronous sequential circuit behaves as follows:
Let $z_k$, $n_k$ denote the number of 0's and 1's respectively in initial k bits of the input $(z_k+n_k=k)$. The circuit outputs 00 until one of the following conditions holds.
1. $z_k-n_k=2$. In this case, the output at the k-th and all subsequent clock ticks is 10.
2. $n_k-z_k=2$. In this case, the output at the k-th and all subsequent clock ticks is 01.
What is the minimum number of states required in the state transition graph of the above circuit?`,['5','6','7','8']),
  question(7,2004,1,'In an SR latch made by cross-coupling two NAND gates, if both S and R inputs are set to 0, then it will result in',[
    m(r`Q=0,\;Q'=1`),m(r`Q=1,\;Q'=0`),m(r`Q=1,\;Q'=1`),'Indeterminate states']),
  question(8,2004,2,r`Consider the partial implementation of a 2-bit counter using T flip-flops following the sequence 0-2-3-1-0, as shown below:
[IMG_1]
To complete the circuit, the input X should be`,[m("Q_2'"),m('Q_2+Q_1'),m("(Q_1\\oplus Q_2)'"),m(r`Q_1\oplus Q_2`)],{diagram:'sequential-3-8'}),
  question(9,2005,2,r`The following diagram represents a finite state machine which takes input a binary number from the least significant bit.
[IMG_1]
Which one of the following is TRUE?`,["It computes 1's complement of the input number","It computes 2's complement of the input number",'It increments the input number','It decrements the input number'],{diagram:'sequential-3-9'}),
  question(10,2005,1,'How many pulses are needed to change the contents of a 8-bit upcounter from 10101100 to 00100111 (rightmost bit is the LSB)?',['134','133','124','123']),
  question(11,2005,2,r`Which of the following input sequences will always generate a 1 at the output z at the end of the third cycle?
[IMG_1]`,[
    m(r`\begin{array}{ccc}A&B&C\\0&0&0\\1&0&1\\1&1&1\end{array}`),
    m(r`\begin{array}{ccc}A&B&C\\1&0&1\\1&1&0\\1&1&1\end{array}`),
    m(r`\begin{array}{ccc}A&B&C\\0&1&1\\1&0&1\\1&1&1\end{array}`),
    m(r`\begin{array}{ccc}A&B&C\\0&0&1\\1&1&0\\1&1&1\end{array}`)],{diagram:'sequential-3-11',notes:['Unresolved answer: the supplied key prints only (*) for 3.11. No explanation for this question is included in this PDF. Correct options intentionally left empty. No inferred answer or MSQ classification.']}),
  question(12,2005,2,r`Consider the following circuit involving a positive edge triggered D FF.
[IMG_1]
Consider the following timing diagram. Let $A_i$ represent the logic level on the line A in the i-th clock period.
[IMG_2]
Let $A'$ represent the complement of A. The correct output sequence on Y over the clock periods 1 through 5 is`,[
    m(r`A_0\ A_1\ A_1'\ A_3\ A_4`),m(r`A_0\ A_1\ A_2'\ A_3\ A_4`),m(r`A_1\ A_2\ A_2'\ A_3\ A_4`),m(r`A_1\ A_2'\ A_3\ A_4\ A_5'`)],{diagram:'sequential-3-12-circuit,sequential-3-12-timing'}),
  question(13,2005,2,r`Consider the following circuit:
[IMG_1]
The flip-flops are positive edge triggered D FFs. Each state is designated as a two bit string $Q_0Q_1$. Let the initial state be 00. The state transition sequence is`,[
    m(r`00\to11\to01\to00`),m(r`00\to11\to00`),m(r`00\to10\to01\to11\to00`),m(r`00\to11\to01\to10\to00`)],{diagram:'sequential-3-13',notes:['Return arrows in all four printed options are transcribed as an explicit final transition to 00.']}),
  question(14,2006,2,r`Consider the circuit in the diagram. The $\oplus$ operator represents Ex-OR. The D flip-flops are initialized to zero (cleared).
[IMG_1]
The following data: 100110000 is supplied to the "data" terminal in nine clock cycles. After that the values of $q_2q_1q_0$ are`,['000','001','010','101'],{diagram:'sequential-3-14'}),
  question(15,2006,1,r`You are given a free running clock with a duty cycle of 50% and a digital waveform f which changes only at the negative edge of the clock. Which one of the following circuits (using clocked D flip-flops) will delay the phase of f by $180^\circ$?`,['a','b','c','d'].map(s=>img(`15-${s}`)),{optLayout:'2col'}),
  question(16,2006,2,r`For a state machine with the following state diagram the expression for the next state $S^+$ in terms of the current state S and the input variables x and y is
[IMG_1]`,[m(r`S^+=S'y'+Sx`),m(r`S^+=Sxy'+S'yx'`),m(r`S^+=xy'`),m(r`S^+=S'y+Sx'`)],{diagram:'sequential-3-16'}),
  question(17,2007,1,'Which of the following input sequences for a cross-coupled R-S flip-flop realized with two NAND gates may lead to an oscillation?',['11, 00','01, 10','10, 01','00, 11']),
  question(18,2007,2,r`What is the final value stored in the linear feedback shift register if the input is 101101?
[IMG_1]`,['0110','1011','1101','1111'],{diagram:'sequential-3-18'}),
  question(19,2007,2,r`The control signal functions of 4-bit binary counter are given below (where X is "don't care")
$$\begin{array}{c|c|c|c|l}\text{Clear}&\text{Clock}&\text{Load}&\text{Count}&\text{Function}\\\hline1&X&X&X&\text{Clear to 0}\\0&X&0&0&\text{No change}\\0&\uparrow&1&X&\text{Load input}\\0&\uparrow&0&1&\text{Count next}\end{array}$$
The counter is connected as follows:
[IMG_1]
Assume that the counter and gate delays are negligible. If the counter starts at 0, then it cycles through the following sequence`,['0, 3, 4','0, 3, 4, 5','0, 1, 2, 3, 4','0, 1, 2, 3, 4, 5'],{diagram:'sequential-3-19'}),
  question(20,2008,2,r`Consider the following state diagram and its realization by a JK flip flop.
[IMG_1]
The combinational circuit generates J and K in terms of x, y and Q. The Boolean expressions for J and K are:`,[
    m(r`\overline{x\oplus y}\text{ and }\overline{x\oplus y}`),m(r`\overline{x\oplus y}\text{ and }x\oplus y`),m(r`x\oplus y\text{ and }\overline{x\oplus y}`),m(r`x\oplus y\text{ and }x\oplus y`)],{diagram:'sequential-3-20'}),
  question(21,2009,2,r`Given the following state table of an FSM with two states A and B, one input and one output:
$$\begin{array}{cc|c|cc|c}\text{Present}&\text{Present}&\text{Input}&\text{Next}&\text{Next}&\text{Output}\\\text{State A}&\text{State B}&&\text{State A}&\text{State B}&\\\hline0&0&0&0&0&1\\0&1&0&1&0&0\\1&0&0&0&1&0\\1&1&0&1&0&0\\0&0&1&0&1&0\\0&1&1&0&0&1\\1&0&1&0&1&1\\1&1&1&0&0&1\end{array}$$
If the initial state is A = 0, B = 0, what is the minimum length of an input string which will take the machine to the state A = 0, B = 1 with output = 1?`,['3','4','5','6'],{notes:['The source calls A and B "two states"; the complete eight-row table is retained literally.']}),
  question(22,2010,2,r`In the sequential circuit shown below, if the initial value of the output $Q_1Q_0$ is 00, what are the next four values of $Q_1Q_0$?
[IMG_1]`,['11, 10, 01, 00','10, 11, 01, 00','10, 00, 01, 11','11, 10, 00, 01'],{diagram:'sequential-3-22'}),
  question(23,2011,1,'The minimum number of D flip-flops needed to design a mod-258 counter is',['9','8','512','258']),
  question(24,2011,2,common+r`
If at some instance prior to the occurrence of the clock edge, P, Q and R have a value 0, 1 and 0 respectively, what shall be the value of PQR after the clock edge?`,['000','001','010','011'],{diagram:'sequential-3-24-25'}),
  question(25,2011,2,common+r`
If all the flip-flops were reset to 0 at power on, what is the total number of distinct outputs (states) represented by PQR generated by the counter?`,['3','4','5','6'],{diagram:'sequential-3-24-25'}),
  question(26,2014,1,r`Let $k=2^n$. A circuit is built by giving the output of an n-bit binary counter as input to an n-to-$2^n$ bit decoder. This circuit is equivalent to a`,['k-bit binary up counter.','k-bit binary down counter.','k-bit ring counter.','k-bit Johnson counter.'],{setNum:'2'}),
  question(27,2014,2,r`[IMG_1]
The above synchronous sequential circuit built using JK flip-flops is initialized with $Q_2Q_1Q_0=000$. The state sequence for this circuit for the next 3 clock cycles is`,['001, 010, 011','111, 110, 101','100, 110, 111','100, 011, 001'],{diagram:'sequential-3-27',setNum:'3'}),
  question(28,2015,1,'Consider a 4 bit Johnson counter with an initial value of 0000. The counting sequence of this counter is',['0, 1, 3, 7, 15, 14, 12, 8, 0','0, 1, 3, 5, 7, 9, 11, 13, 15, 0','0, 2, 4, 6, 8, 10, 12, 14, 0','0, 8, 12, 14, 15, 7, 3, 1, 0'],{setNum:'1',notes:['Printed key (d) retained; no alternative shift-direction convention inferred.']}),
  question(29,2015,2,r`A positive edge-triggered D flip-flop is connected to a positive edge-triggered JK flip-flop as follows. The Q output of the D flip-flop is connected to both the J and K inputs of the JK flip-flop, while the Q output of the JK flip-flop is connected to the input of the D flip-flop. Initially, the output of the D flip-flop is set to logic one and the output of the JK flip-flop is cleared.
Which of the following is the bit sequence (including the initial state) generated at the Q output of the JK flip-flop when the flip-flops are connected to a free-running common clock?
Assume that $J=K=1$ is the toggle mode and $J=K=0$ is the state-holding mode of the JK flip-flop. Both the flip-flops have non-zero propagation delays.`,['0110110...','0100100...','011101110...','011001100...'],{setNum:'1'}),
  question(30,2015,1,'The minimum number of JK flip-flops required to construct a synchronous counter with the count sequence (0, 0, 1, 1, 2, 2, 3, 3, 0, 0,...) is _____.',[],{setNum:'2'}),
  question(31,2016,1,'We want to design a synchronous counter that counts the sequence 0-1-0-2-0-3 and then repeats. The minimum number of J-K flip-flops required to implement this counter is _____.',[],{setNum:'1'}),
  question(32,2017,2,r`Consider a combination of T and D flip-flops connected as shown below. The output of the D flip-flop is connected to the input of the T flip-flop and the output of the T flip-flop is connected to the input of the D flip-flop.
[IMG_1]
Initially, both $Q_0$ and $Q_1$ are set to 1 (before the 1st clock cycle). The outputs`,[
    r`$Q_1Q_0$ after the 3rd cycle are 11 and after the 4th cycle are 00 respectively.`,
    r`$Q_1Q_0$ after the 3rd cycle are 11 and after the 4th cycle are 01 respectively.`,
    r`$Q_1Q_0$ after the 3rd cycle are [unclear first bit]0 and after the 4th cycle are 11 respectively.`,
    r`$Q_1Q_0$ after the 3rd cycle are 0[unclear second bit] and after the 4th cycle are 01 respectively.`],{diagram:'sequential-3-32',setNum:'1',notes:['Unresolved printed option text: the first bit of option (c) and second bit of option (d), for the third-cycle state, are damaged/unclear even in the original 4096px scan. Explicit uncertainty markers preserve the legible bits. Printed key (b) is clear. No missing bits were inferred.']}),
  question(33,2017,2,r`The next state table of a 2-bit saturating up-counter is given below:
$$\begin{array}{cc|cc}Q_1&Q_0&Q_1^+&Q_0^+\\\hline0&0&0&1\\0&1&1&0\\1&0&1&1\\1&1&1&1\end{array}$$
The counter is built as a synchronous sequential circuit using T flip-flops. The expressions for $T_1$ and $T_0$ are`,[
    m(r`T_1=Q_1Q_0,\quad T_0=\overline Q_1\overline Q_0`),m(r`T_1=\overline Q_1Q_0,\quad T_0=\overline Q_1+\overline Q_0`),m(r`T_1=Q_1+Q_0,\quad T_0=\overline Q_1+\overline Q_0`),m(r`T_1=\overline Q_1Q_0,\quad T_0=Q_1+Q_0`)],{setNum:'2'}),
  question(34,2018,1,r`Consider the sequential circuit shown in the figure, where both the flip-flops used are positive-edge-triggered D flip-flops.
[IMG_1]
The number of states in the state transition diagram of the circuit that have a transition back to the same state on some value of "in" is _____.`,[],{diagram:'sequential-3-34'}),
  question(35,2021,2,r`Consider a 3-bit counter, designed using T flip-flops, as shown below:
[IMG_1]
Assuming the initial state of the counter given by PQR as 000. What are the next three states?`,['011, 101, 111','001, 010, 000','001, 010, 111','011, 101, 000'],{diagram:'sequential-3-35',setNum:'1'}),
  question(36,2023,1,r`The output of a 2-input multiplexer is connected back to one of its inputs as shown in the figure.
[IMG_1]
Match the functional equivalence of this circuit to one of the following options.`,['D Flip-flop','D Latch','Half-adder','Demultiplexer'],{diagram:'sequential-3-36'}),
  question(37,2023,2,r`Consider a sequential digital circuit consisting of T flip-flops and D flip-flops as shown in the figure. CLKIN is the clock input to the circuit. At the beginning, Q1, Q2 and Q3 have values 0, 1 and 1, respectively.
[IMG_1]
Which one of the given values of (Q1, Q2, Q3) can NEVER be obtained with this digital circuit?`,['(0, 0, 1)','(1, 0, 0)','(1, 0, 1)','(1, 1, 1)'],{diagram:'sequential-3-37'}),
];
export const DIGITAL_LOGIC_SEQUENTIAL_IMPORT={subject:'9. Digital Logic',chapter:'3. Sequential Circuits',sourceHash,questions};
export const SEQUENTIAL_UNRESOLVED=[
  {number:'3.1',field:'answer (part a)',reason:'The supplied solution contains the part (b) cycle/table and S0; no complete part (a) state diagram is printed.'},
  {number:'3.11',field:'answer',reason:'Printed answer key is (*) and the supplied PDF has no explanation for this question.'},
  {number:'3.32',field:'options C/D',reason:'Damaged third-cycle bits in options C and D. Explicit uncertainty markers are stored; answer B is clear.'},
];
