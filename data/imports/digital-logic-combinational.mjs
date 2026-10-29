// Transcribed against every column of the three supplied scanned spreads.
const r=String.raw;
const m=value=>`$${value}$`;
const sourceHash='3fb94a04cc0c2153efc11e29861411a10df92ba788b5d37010485da84becc37a';
const key='D C - C B BC C A A A B A D D A A B B A C C B B A A C - D B - C D C C -'.split(' ');
const nat={27:'12',30:'-1',35:'4'};
export const COMBINATIONAL_SOLUTION=r`Use the printed 4-to-1 multiplexer with $S_1=C_1$, $S_0=C_0$, and data inputs $I_0=\overline{A+B}$, $I_1=A+B$, $I_2=A\oplus B$, $I_3=AB$. The OR output also feeds the inverter; the XOR and AND outputs feed inputs 2 and 3, respectively.`;
function question(n,year,marks,text,options=[],extra={}) {
  const {notes=[],...fields}=extra;
  const bookPages=n<=7?[212]:n===8?[212,213]:n<=14?[213]:n===15?[213,214]:n<=23?[214]:n===27?[215]:n<=31?[215]:n===32?[215,216]:[216];
  const pdfPages=[...new Set(bookPages.map(p=>Math.floor((p-212)/2)+1))];
  const questionType=n===3?'SUBJECTIVE':n===6?'MSQ':nat[n]?'NAT':'MCQ';
  return {id:`madeeasy-digital-logic-combinational-2-${n}`,text,code:'',year:String(year),marks:String(marks),setNum:'',rawTopic:'Combinational Circuits',diagram:'',ext:'.png',
    optA:options[0]||'',optB:options[1]||'',optC:options[2]||'',optD:options[3]||'',questionType,correctOptions:key[n-1]==='-'?[]:[...key[n-1]],natAnswer:n===3?COMBINATIONAL_SOLUTION:nat[n]||'',
    isBlank:false,isPosLocked:false,isCodeOptions:false,isProof:false,needsManualOptionFix:false,optLayout:'auto',tempPaste:'',...fields,
    source:{file:'9. Digital Logic/2. Combinational Circuits.pdf',sha256:sourceHash,questionNumber:`2.${n}`,pdfPages,bookPages,answerKeyPdfPage:3,
      notes:['All three scanned spreads visually reviewed, including every column. Printed answer key: PDF page 3, book page 217. Explanations excluded from question text.',...notes]}};
}
const questions=[
  question(1,1996,2,r`Consider the circuit in figure which has a four bit binary number $b_3b_2b_1b_0$ as input and a five bit binary number $d_4d_3d_2d_1d_0$ as output. The circuit implements:
[IMG_1]`,['Binary to Hex conversion','Binary to BCD conversion','Binary to grey code conversion','Binary to radix-12 conversion'],{diagram:'combinational-2-1'}),
  question(2,1996,2,'Consider the circuit in figure shown. f implements\n[IMG_1]',[
    m(r`\overline A\,\overline B C+\overline A B\overline C+ABC`),m('A+B+C'),m(r`A\oplus B\oplus C`),m('AB+BC+CA')],{diagram:'combinational-2-2'}),
  question(3,1996,2,r`A logic network has two data inputs A and B and two control inputs $C_0$ and $C_1$. It implements the function F according to the following table.
$$\begin{array}{c|c|c}C_1&C_0&F\\\hline 0&0&\overline{A+B}\\0&1&A+B\\1&0&A\oplus B\\1&1&AB\end{array}$$
Implement the circuit using one 4 to 1 multiplexer, one 2-input exclusive OR gate, one 2-input AND gate, one 2-input OR gate and one inverter.`,[],{notes:['The answer key says "Sol.". The complete circuit solution is supplied on book page 217, PDF page 3, lower-left column. Its input/select wiring is transcribed into the editable answer field; this is a historical subjective question.']}),
  question(4,1998,1,'A multiplexor with a 4 bit data select input is a',['4 : 1 multiplexor','2 : 1 multiplexor','16 : 1 multiplexor','8 : 1 multiplexor']),
  question(5,1999,1,'The number of full and half-adders required to add 16-bit numbers is:',['8 half-adders, 8 full-adders','1 half-adder, 15 full-adders','16 half-adders, 0 full-adders','4 half-adders, 12 full-adders']),
  question(6,1999,2,'Which of the following sets of component(s) is/are sufficient to implement any arbitrary Boolean function?',['XOR gates, NOT gates','2 to 1 multiplexors','AND gates, XOR gates',r`Three-input gates that output $(A.B)+C$ for the inputs A, B and C.`],{notes:['Historical multiple-correct question: printed key and explanation both specify (b, c); stored as MSQ.']}),
  question(7,2001,2,r`Consider the circuit shown below. The output of a 2 : 1 Mux is given by the function $(ac'+bc)$.
[IMG_1]
Which of the following is true?`,[m(r`f=x_1'+x_2`),m(r`f=x_1x_2+x_1x_2'`),m(r`f=x_1x_2+x_1'x_2'`),m('f=x_1+x_2')],{diagram:'combinational-2-7'}),
  question(8,2002,2,r`Consider the following multiplexer where I0, I1, I2, I3 are four data input lines selected by two address line combinations $A_1A_0=00;01,10,11$ respectively and f is the output of the multiplexer, EN is the Enable input.
[IMG_1]
The function f(x, y, z) implemented by the above circuit is`,[m(r`xyz'`),m('xy+z'),m('x+y'),'None of these'],{diagram:'combinational-2-8'}),
  question(9,2003,2,r`Consider the ALU shown below:
[IMG_1]
If the operands are in 2's complement representation, which of the following operations can be performed by suitably setting the control lines K and $C_0$ only (+ and - denote addition and subtraction respectively)?`,[
    r`$A+B$, and $A-B$, but not $A+1$`,r`$A+B$, and $A+1$, but not $A-B$`,r`$A+B$, but not $A-B$, or $A+1$`,r`$A+B$, and $A-B$, and $A+1$`],{diagram:'combinational-2-9'}),
  question(10,2004,2,'A 4-bit carry lookahead adder, which adds two 4-bit numbers, is designed using AND, OR, NOT, NAND, NOR gates only. Assuming that all the inputs are available in both complemented and uncomplemented forms and the delay of each gate is one time unit, what is the overall propagation delay of the adder? Assume that the carry network has been implemented using two-level AND-OR logic.',['4 time units','6 time units','10 time units','12 time units']),
  question(11,2004,2,r`A circuit outputs a digit in the form of 4 bits. 0 is represented by 0000, 1 by 0001, ..., 9 by 1001. A combinational circuit is to be designed which takes these 4 bits as input and outputs 1 if the digit $\geq5$, and 0 otherwise. If only AND, OR and NOT gates may be used, what is the minimum number of gates required?`,['2','3','4','5']),
  question(12,2004,1,'Consider a multiplexer with X and Y as data inputs and Z as control input. If Z = 0 selects input X and Z = 1 selects input Y. What are the connections required to realize the 2-variable Boolean function $f=T+R$ without using any additional hardware?',['R to X, 1 to Y, T to Z','T to X, R to Y, T to Z','T to X, R to Y, 0 to Z','R to X, 0 to Y, T to Z']),
  question(13,2005,2,'The circuit shown below implements a 2-input NOR gate using two 2 : 1 MUX (control signal 1 selects the upper input). What are the values of signals x, y and z?\n[IMG_1]',['1, 0, B','1, 0, A','0, 1, B','0, 1, A'],{diagram:'combinational-2-13'}),
  question(14,2006,2,'The majority function is a Boolean function f(x, y, z) that takes the value 1 whenever a majority of the variables x, y, z and 1. In the circuit diagram for the majority function shown below, the logic gates for the boxes labeled P and Q are, respectively,\n[IMG_1]',['XOR, AND','XOR, XOR','OR, OR','OR, AND'],{diagram:'combinational-2-14',notes:['The printed wording says "x, y, z and 1"; retained exactly.']}),
  question(15,2006,2,'Consider the circuit below. Which one of the following options correctly represents f(x, y, z)?\n[IMG_1]',[
    m(r`x\overline z+xy+\overline y z`),m(r`x\overline z+xy+y\overline z`),m(r`xz+xy+\overline{yz}`),m(r`xz+x\overline y+\overline y z`)],{diagram:'combinational-2-15'}),
  question(16,2006,2,r`Given two 3-bit numbers $a_2a_1a_0$ and $b_2b_1b_0$ and c, the carry in, the function that represents the carry generate function when these two numbers are added is`,[
    m(r`a_2b_2+a_2a_1b_1+a_2a_1a_0b_0+a_2a_0b_1b_0+a_1b_2b_1+a_1a_0b_2b_0+a_0b_2b_1b_0`),
    m(r`a_2b_2+a_2b_1b_0+a_2a_1b_1b_0+a_1a_0b_2b_1+a_1a_0b_2+a_1a_0b_2b_0+a_2a_0b_1b_0`),
    m(r`a_2+b_2+(a_2\oplus b_2)[a_1+b_1+(a_1\oplus b_1)(a_0+b_0)]`),
    m(r`a_2b_2+\overline a_2a_1b_1+\overline{a_2a_1}a_0b_0+\overline a_2a_0\overline b_1b_0+a_1\overline b_2b_1+\overline a_1a_0\overline b_2b_0+a_0\overline{b_2b_1}b_0`)],{optLayout:'1col',notes:['Long options transcribed in full, including the printed grouped complement bars in option D.']}),
  question(17,2006,2,r`We consider the addition of two 2's complement numbers $b_{n-1}b_{n-2}\ldots b_0$ and $a_{n-1}a_{n-2}\ldots a_0$. A binary adder for adding unsigned binary numbers is used to add the two numbers. The sum is denoted by $c_{n-1}c_{n-2}\ldots c_0$ and the carryout by $c_{\mathrm{out}}$.
Which one of the following options correctly identifies the overflow condition?`,[
    m(r`c_{\mathrm{out}}\,\overline{(a_{n-1}\oplus b_{n-1})}`),
    m(r`a_{n-1}b_{n-1}\overline c_{n-1}+\overline{a_{n-1}b_{n-1}}c_{n-1}`),
    m(r`c_{\mathrm{out}}\oplus c_{n-1}`),m(r`a_{n-1}\oplus b_{n-1}\oplus c_{n-1}`)],{notes:['The printed key for 2.17 is (b), with a blue pen mark over the letter. Printed grouped complement bars are retained; no algebraic correction applied.']}),
  question(18,2007,2,r`In a look-ahead carry generator, the carry generate function $G_i$ and the carry propagate function $P_i$ for inputs $A_i$ and $B_i$ are given by
$$P_i=A_i\oplus B_i\text{ and }G_i=A_iB_i.$$
The expressions for the sum bit $S_i$ and carry bit $C_{i+1}$ of the look-ahead carry adder are given by
$$S_i=P_i\oplus C_i\text{ and }C_{i+1}=G_i+P_iC_i,$$
where $C_0$ is the input carry.
Consider a two-level logic implementation of the look-ahead carry generator. Assume that all $P_i$ and $G_i$ are available for the carry generator circuit and that the AND and OR gates can have any number of inputs. The number of AND gates and OR gates needed to implement the look-ahead carry generator for a 4-bit adder with $S_3,S_2,S_1,S_0$ and $C_4$ as its outputs are respectively`,['6, 3','10, 4','6, 4','10, 5']),
  question(19,2007,1,'The following circuit implements a two-input AND gate using two 2-1 multiplexers.\n[IMG_1]\nWhat are the values of X1, X2, X3?',['X1 = b, X2 = 0, X3 = a','X1 = b, X2 = 1, X3 = b','X1 = a, X2 = b, X3 = 1','X1 = a, X2 = 0, X3 = b'],{diagram:'combinational-2-19'}),
  question(20,2007,1,'How many 3-to-8 line decoders with an enable input are needed to construct a 6-to-64 line decoder without using any other logic gates?',['7','8','9','10']),
  question(21,2007,2,'Suppose only one multiplexer and one inverter are allowed to be used to implement any Boolean function of n variables. What is the minimum size of the multiplexer needed?',[r`$2^n$ line to 1 line`,r`$2^{n+1}$ line to 1 line`,r`$2^{n-1}$ line to 1 line`,r`$2^{n-2}$ line to 1 line`]),
  question(22,2008,1,'What Boolean function does the circuit below realize?\n[IMG_1]',[m(r`xz+\overline x\,\overline z`),m(r`x\overline z+\overline xz`),m(r`\overline x\,\overline y+yz`),m(r`xy+\overline y\,\overline z`)],{diagram:'combinational-2-22'}),
  question(23,2010,1,'The Boolean expression for the output f of the multiplexer shown below is\n[IMG_1]',[m(r`\overline{P\oplus Q\oplus R}`),m(r`P\oplus Q\oplus R`),m('P+Q+R'),m(r`\overline{P+Q+R}`)],{diagram:'combinational-2-23'}),
  question(24,2013,1,r`In the following truth table, V = 1 if and only if the input is valid.
$$\begin{array}{c|c|c|c|c|c|c}\text{Inputs}&&&&\text{Outputs}&&\\D_0&D_1&D_2&D_3&X_0&X_1&V\\\hline 0&0&0&0&x&x&0\\1&0&0&0&0&0&1\\x&1&0&0&0&1&1\\x&x&1&0&1&0&1\\x&x&x&1&1&1&1\end{array}$$
What function does the truth table represent?`,['Priority encoder','Decoder','Multiplexer','Demultiplexer']),
  question(25,2014,2,r`Consider the 4 to 1 multiplexer with two select lines $S_1$ and $S_0$ given below:
[IMG_1]
The minimal sum-of-products form of the Boolean expression for the output F of the multiplexer is`,[
    m(r`\overline P Q+Q\overline R+P\overline Q R`),
    m(r`\overline P Q+\overline P Q\overline R+PQ\overline R+P\overline Q R`),
    m(r`\overline P QR+\overline P Q\overline R+Q\overline R+P\overline Q R`),m(r`PQ\overline R`)],{setNum:'1',diagram:'combinational-2-25'}),
  question(26,2014,1,'Consider the following combinational function block involving four Boolean variables x, y, a, b where x, a, b are inputs and y is the output.\n[CODE]\nWhich one of the following digital logic blocks is the most suitable for implementing this function?',['Full adder','Priority encoder','Multiplexor','Flip-flop'],{setNum:'3',code:'f (x, y, a, b)\n{\n    if (x is 1) y = a;\n    else y = b;\n}'}),
  question(27,2015,2,'A half adder is implemented with XOR and AND gates. A full adder is implemented with two half adders and one OR gate. The propagation delay of an XOR gate is twice that of an AND/OR gate. The propagation delay of an AND/OR gate is 1.2 microseconds.\nA 4-bit ripple-carry binary adder is implemented by using four full adders. The total propagation time of this 4-bit binary adder in microseconds is ________.',[],{setNum:'2'}),
  question(28,2016,2,'Consider the two cascaded 2-to-1 multiplexers as shown in the figure.\n[IMG_1]\nThe minimal sum of products form of the output X is',[
    m(r`\overline P\,\overline Q+PQR`),m(r`\overline P Q+QR`),m(r`PQ+\overline P\,\overline Q R`),m(r`\overline Q\,\overline R+PQR`)],{setNum:'1',diagram:'combinational-2-28'}),
  question(29,2016,2,r`Consider a carry lookahead adder for adding two n-bit integers, built using gates of fan-in atmost two. The time to perform addition using this adder is`,[m(r`\Theta(1)`),m(r`\Theta(\log(n))`),m(r`\Theta(\sqrt n)`),m(r`\Theta(n)`)],{setNum:'1'}),
  question(30,2016,1,r`Consider an eight bit ripple-carry adder for computing the sum of A and B, where A and B are integers represented in 2's complement form. If the decimal value of A is one, the decimal value of B that leads to the longest latency for the sum to stabilize is ________.`,[],{setNum:'2'}),
  question(31,2017,1,r`When two 8-bit numbers $A_7\ldots A_0$ and $B_7\ldots B_0$ in 2's complement representation (with $A_0$ and $B_0$ as the least significant bits) are added using a ripple-carry adder, the sum bits obtained are $S_7\ldots S_0$ and the carry bits are $C_7\ldots C_0$. An overflow is said to have occurred if`,[
    r`the carry bit $C_7$ is 1`,r`all the carry bits $(C_7,\ldots,C_0)$ are 1`,r`$(A_7.B_7.\overline S_7+\overline A_7.\overline B_7.S_7)$ is 1`,r`$(A_0.B_0.\overline S_0+\overline A_0.\overline B_0.S_0)$ is 1`],{setNum:'1'}),
  question(32,2021,1,r`Which one of the following circuits implements the Boolean function given below?
$f(x,y,z)=m_0+m_1+m_3+m_4+m_5+m_6$, where $m_i$ is the $i^{\mathrm{th}}$ minterm.`,['IMG:combinational-2-32-a','IMG:combinational-2-32-b','IMG:combinational-2-32-c','IMG:combinational-2-32-d'],{setNum:'2',optLayout:'2col'}),
  question(33,2022,2,r`Consider a digital display system (DDS) shown in the figure that displays the contents of register X. A 16-bit code word is used to load a word in X, either from S or from R. S is a 1024-word memory segment and R is a 32-word register file. Based on the value of mode bit M, T selects an input word to load in X. P and Q interface with the corresponding bits in the code word to choose the addressed word. Which one of the following represents the functionality of P, Q, and T?
[IMG_1]`,[
    'P is 10 : 1 multiplexer; Q is 5 : 1 multiplexer; T is 2 : 1 multiplexer',
    r`P is $10:2^{10}$ decoder; Q is $5:2^5$ decoder; T is 2 : 1 encoder`,
    r`P is $10:2^{10}$ decoder; Q is $5:2^5$ decoder; T is 2 : 1 multiplexer`,
    'P is 1 : 10 de-multiplexer; Q is 1 : 5 de-multiplexer; T is 2 : 1 multiplexer'],{diagram:'combinational-2-33',optLayout:'1col'}),
  question(34,2023,2,r`A Boolean digital circuit is composed using two 4-input multiplexers (M1 and M2) and one 2-input multiplexer (M3) as shown in the figure. X0-X7 are the inputs of the multiplexers M1 and M2 and could be connected to either 0 or 1. The select lines of the multiplexers are connected to Boolean variables A, B and C as shown.
[IMG_1]
Which one of the following set of values of (X0, X1, X2, X3, X4, X5, X6, X7) will realise the Boolean function $A+\overline A.\overline C+A.\overline B.C$?`,[
    '(1, 1, 0, 0, 1, 1, 1, 0)','(1, 1, 0, 0, 1, 1, 0, 1)','(1, 1, 0, 1, 1, 1, 0, 0)','(0, 0, 1, 1, 0, 1, 1, 1)'],{diagram:'combinational-2-34',notes:['Printed function and key (c) are retained without correcting the apparent mismatch between the function and the listed input combinations.']}),
  question(35,2024,2,r`Consider a digital logic circuit consisting of three 2-to-1 multiplexers M1, M2, and M3 as shown below. X1 and X2 are inputs of M1. X3 and X4 are inputs of M2. A, B, and C are select lines of M1, M2, and M3, respectively.
[IMG_1]
For an instance of inputs X1 = 1, X2 = 1, X3 = 0, and X4 = 0, the number of combinations of A, B, C that give the output Y = 1 is ________.`,[],{setNum:'1',diagram:'combinational-2-35'}),
];
export const DIGITAL_LOGIC_COMBINATIONAL_IMPORT={subject:'9. Digital Logic',chapter:'2. Combinational Circuits',sourceHash,questions};
