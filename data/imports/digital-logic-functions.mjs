const r=String.raw;
const m=value=>`$${value}$`;
const sourceHash='ebe00a96fdac069eb9a388d2691cb17a90e381b121a5687172308c6f08bf7c42';
const answers={1:'C',2:'C',3:'B',4:'C',5:'B',6:'C',7:'D',8:'C',9:'D',10:'B',11:'C',12:'C',13:'A',14:'B',15:'A',16:'C',19:'D',20:'D',21:'B',22:'B',23:'A',24:'C',25:'C',26:'A',27:'A',29:'C',30:'D',31:'C',32:'B',33:'C',34:'A',35:'C',36:'D',37:'D',38:'D',39:'A',40:'C',41:'A',42:'A',43:'A',44:'B',45:'A',46:'B',47:'A',48:'D',49:'B',50:'A',51:'D',52:'A',53:'D',54:'B',55:'D',56:'B',59:'A',60:'A',61:'C',63:'A',64:'C',65:'D',67:'D',69:'A',70:'B',71:'ACD',73:'AD',74:'AC',75:'AC',76:'BC'};
const nat={57:'1',58:'3',62:'1',66:'3',68:'3',72:'6'};
export function kmap(rowLabel,columnLabel,rows,columns=['00','01','11','10'],rowNames=['00','01','11','10']) {
  return r`$$\begin{array}{c|`+'c'.repeat(columns.length)+r`} `+rowLabel+(rowLabel||columnLabel?r`\backslash `:'')+columnLabel+'&'+columns.join('&')+r`\\\hline `+rows.map((row,i)=>rowNames[i]+'&'+[...row].map(v=>v==='.'?r`\phantom{0}`:v).join('&')).join(r`\\\hline `)+r`\\\hline\end{array}$$`;
}
function question(n,year,marks,text,options=[],extra={}) {
  const {notes=[],...fields}=extra;
  const bookPages=n<=10?[191]:n<=18?[192]:n<=28?[193]:n<=37?[194]:n<=47?[195]:n<=57?[196]:n<=68?[197]:n===69?[197,198]:[198];
  if(n===37)bookPages.push(195);
  const pdfPages=[...new Set(bookPages.map(p=>Math.floor((p-190)/2)+1))];
  const questionType=n===17?'SUBJECTIVE':[71,73,74,75,76].includes(n)?'MSQ':nat[n]?'NAT':'MCQ';
  return {id:`madeeasy-digital-logic-functions-1-${n}`,text,code:'',year:String(year),marks:String(marks),setNum:'',rawTopic:'Logic Functions and Minimizations',diagram:'',ext:'.png',
    optA:options[0]||'',optB:options[1]||'',optC:options[2]||'',optD:options[3]||'',questionType,correctOptions:answers[n]?[...answers[n]]:[],natAnswer:nat[n]||'',
    isBlank:false,isPosLocked:false,isCodeOptions:false,isProof:false,needsManualOptionFix:false,optLayout:'auto',tempPaste:'',...fields,
    source:{file:'9. Digital Logic/1. Logic Functions and Minimizations.pdf',sha256:sourceHash,questionNumber:`1.${n}`,pdfPages,bookPages,answerKeyPdfPage:5,
      notes:['All five supplied scanned spreads visually reviewed. Printed answer key: PDF page 5, book page 199. Explanations and syllabus excluded.',...notes]}};
}
const linked=r`Linked Answer Q1.34 & Q1.35:
Consider the following expression: $a\overline d+\overline a\overline c+b\overline c d$.
`;
const questions=[
  question(1,1996,2,'What is the equivalent Boolean expression in product-of-sums form for the Karnaugh map given in figure\n'+kmap('CD','AB',['.11.','1..1','1..1','.11.']),[
    m(r`B\overline D+\overline B D`),m(r`(B+\overline C+D)(\overline B+C+\overline D)`),m(r`(B+D)(\overline B+\overline D)`),m(r`(B+\overline D)(\overline B+D)`)]),
  question(2,1997,2,r`Let $f(x,y,z)=\overline x+\overline y x+xz$ be a switching function. Which one of the following is valid?`,[
    r`$\overline y x$ is a prime implicant of $f$`,r`$xz$ is a minterm of $f$`,r`$xz$ is an implicant of $f$`,r`$y$ is a prime implicant of $f$`]),
  question(3,1997,1,r`Let $*$ be defined as $x*y=\overline x+y$. Let $z=x*y$. The value of $z*x$ is`,[m(r`\overline x+y`),m('x'),'0','1']),
  question(4,1997,2,r`Let $f(x,y,z)=\overline x+\overline y z+xz$ be a switching function. Which one of the following is valid?`,[
    r`$\overline y x$ is a prime implicant of $f$`,r`$xz$ is a minterm of $f$`,r`$xz$ is an implicant of $f$`,r`$\overline y$ is a prime implicant of $f$`]),
  question(5,1997,2,r`Consider the logic circuit shown in figure below. The functions $f_1$, $f_2$ and $f$ (in canonical sum of products form in decimal notation) are
[IMG_1]
$$f_1(w,x,y,z)=\Sigma(8,9,10)$$
$$f_2(w,x,y,z)=\Sigma(7,8,12,13,14,15)$$
$$f(w,x,y,z)=\Sigma(8,9)$$
The function $f_3$ is`,[m(r`\Sigma(9,10)`),m(r`\Sigma(9)`),m(r`\Sigma(1,8,9)`),m(r`\Sigma(8,10,18)`)],{diagram:'digital-logic-1-5',notes:['Option D prints minterm 18 for a four-variable function; preserved as printed.']}),
  question(6,1998,1,'Which of the following operations is commutative but not associative?',['AND','OR','NAND','EXOR']),
  question(7,1998,1,r`What happens when a bit string is XORed with itself $n$-times as shown:
$[B\oplus(B\oplus(B\oplus(B\ldots n\text{ times})))]$`,[r`Complements when $n$ is even`,r`Complements when $n$ is odd`,r`Divides by $2^n$ always`,r`Remains unchanged when $n$ is even`]),
  question(8,1998,1,'The function represented by the map given below is:\n'+kmap('A','BC',['1001','1001'],['00','01','10','11'],['0','1']),[m('A.B'),m('AB+BC+CA'),m(r`\overline B\oplus C`),m('A.BC')],{notes:['The column labels are printed 00,01,10,11 (not Gray order); retained exactly.']}),
  question(9,1999,1,r`Which of the following expressions is not equivalent to $\overline x$?`,[r`$x$ NAND $x$`,r`$x$ NOR $x$`,r`$x$ NAND 1`,r`$x$ NOR 1`]),
  question(10,1999,1,'Which of the following functions implements the Karnaugh map shown below?\n'+kmap('AB','CD',['0010','XX1X','0110','0110']),[m(r`\overline A B+CD`),m('D(C+A)'),m(r`A\overline D+\overline A B`),m(r`(C+D)(\overline C+D)(A+B)`)]),
  question(11,2000,2,r`The simultaneous equations on the Boolean variables $x,y,z$ and $w$,
$$\begin{aligned}x+y+z&=1\\xy&=0\\xz+w&=1\\xy+\overline z\,\overline w&=0\end{aligned}$$
have the following solution for $x,y,z$ and $w$, respectively:`,['0100','1101','1011','1000']),
  question(12,2000,2,'Which function does NOT implement the Karnaugh map given below?\n'+kmap('xy','wz',['0X00','0X11','1111','0X00']),[m('(w+x)y'),m('xy+yw'),m('(w+x)(w+y)(x+y)'),'None of the above']),
  question(13,2001,1,'Given the following Karnaugh map, which one of the following represents the minimal Sum-of-Products of the map?\n'+kmap('yz','wx',['0X0X','X1X1','0X10','01X0']),[m(r`xy+y'z`),m(r`wx'y'+xy+xz`),m(r`w'x+y'z+xy`),m('xz+y')]),
  question(14,2002,1,r`Minimum SOP for $f(w,x,y,z)$ shown in Karnaugh-map below is`+'\n'+kmap('yz','wx',['0110','X001','X001','011X']),[m(r`xz+y'z`),m(r`xz'+zx'`),m(r`x'y+zx'`),'None of these']),
  question(15,2002,2,r`Consider the following logic circuit whose inputs are functions $f_1,f_2,f_3$ and output is $f$. Given that
[IMG_1]
$$f_1(x,y,z)=\Sigma(0,1,3,5),\quad f_2(x,y,z)=\Sigma(6,5),\quad f(x,y,z)=\Sigma(1,4,5),$$
$f_3$ is`,[m(r`\Sigma(1,4,5)`),m(r`\Sigma(6,7)`),m(r`\Sigma(0,1,3,5)`),'None of these'],{diagram:'digital-logic-1-15'}),
  question(16,2002,2,r`$f(A,B)=A'+B$. Simplified expression for function $f(f(x+y,y),z)$ is`,[m(r`x'+z`),m('xyz'),m(r`xy'+z`),'None of these']),
  question(17,2002,2,'Transform the following logic circuit (without expressing its switching function) into an equivalent logic circuit that employs only 6 NAND gates each with 2-inputs.\n[IMG_1]',[],{diagram:'digital-logic-1-17',notes:['Subjective circuit-construction question, with no options. Printed key says "Sol."; the corresponding solution is outside the supplied PDF. Answer left empty.']}),
  question(18,2003,2,r`The literal count of a boolean expression is the sum of the number of times each literal appears in the expression. For example, the literal count of $(xy+xz)$ is 4. What are the minimum possible literal counts of the product-of-sum and sum-of-product representations respectively of the function given by the following Karnaugh map? Here, X denotes "don't care"`+'\n'+kmap('xy','zw',['X101','01X0','1XX0','X00X']),['(11, 9)','(9, 13)','(9, 10)','(11, 11)'],{notes:['Printed answer key is (*), with no option answer. Handwritten annotations below the choices are not treated as source answers. Answer unresolved.']}),
  question(19,2003,2,r`Consider the following circuit composed of XOR gates and non-inverting buffers.
[IMG_1]
The non-inverting buffers have delays $\delta_1=2$ ns and $\delta_2=4$ ns as shown in the figure. Both XOR gates and all wires have zero delay. Assume that all gate inputs, outputs and wires are stable at logic level 0 at time 0. If the following waveform is applied at input A, how many transition(s) (change of logic levels) occur(s) at B during the interval from 0 to 10 ns?
[IMG_2]`,['1','2','3','4'],{diagram:'digital-logic-1-19-circuit,digital-logic-1-19-waveform',notes:['The left buffer label in the figure is printed delta_2=2, whereas the prose says delta_1=2 ns. Both retained without correction.']}),
  question(20,2004,1,r`The Boolean function $x'y'+xy+x'y$ is equivalent to`,[m(r`x'+y'`),m('x+y'),m(r`x+y'`),m(r`x'+y`)]),
  question(21,2004,1,'What is the minimum number of NAND gates required to implement a 2-input EXCLUSIVE-OR function without using any other logic gate?',['3','4','5','6']),
  question(22,2004,2,r`The function $AB'C+A'BC+ABC'+A'B'C+AB'C'$ is equivalent to`,[m(r`AC'+AB+A'C`),m(r`AB'+AC'+A'C`),m(r`A'B+AC'+AB'`),m(r`A'B+AC+AB'`)]),
  question(23,2004,2,r`Which are the essential prime implicants of the following Boolean function?
$$f(a,b,c)=a'c+ac'+b'c$$`,[m(r`a'c\text{ and }ac'`),m(r`a'c\text{ and }b'c`),r`$a'c$ only`,m(r`ac'\text{ and }bc'`)]),
  question(24,2005,1,r`Which of the following expressions is equivalent to $(A\oplus B)\oplus C$?`,[m(r`(A+B+C)(\overline A+\overline B+\overline C)`),m(r`(A+B+C)(\overline A+\overline B+C)`),m(r`ABC+\overline A(B\oplus C)+\overline B(A\oplus C)`),'None of these']),
  question(25,2005,1,'A two-way switch has three terminals a, b and c. In ON position (logic value 1), a is connected to b, and in OFF position, a is connected to c. Two of these two-way switches S1 and S2 are connected to a bulb as shown below.\n[IMG_1]\nWhich of the following expressions, if true, will always result in the lighting of the bulb?',[m(r`S1\cdot\overline{S2}`),m('S1+S2'),m(r`\overline{S1\oplus S2}`),m(r`S1\oplus S2`)],{diagram:'digital-logic-1-25'}),
  question(26,2005,1,'Consider the following circuit:\n[IMG_1]\nWhich one of the following is TRUE?',['f is independent of X','f is independent of Y','f is independent of Z','None of X, Y, Z is redundant'],{diagram:'digital-logic-1-26'}),
  question(27,2005,1,r`The switching expression corresponding to $f(A,B,C,D)=\Sigma(1,4,5,9,11,12)$ is`,[m(r`BC'D'+A'C'D+AB'D`),m(r`ABC'+ACD+B'C'D`),m(r`ACD'+A'BC'+AC'D'`),m(r`A'BD+ACD'+BCD'`)]),
  question(28,2006,2,r`Consider a boolean function $f(w,x,y,z)$. Suppose that exactly one of its inputs is allowed to change at a time. If the function happens to be true for two input vectors $i_1=\langle w_1,x_1,y_1,x_1\rangle$ and $i_2=\langle w_2,x_2,y_2,z_2\rangle$, we would like the function to remain true as the input changes from $i_1$ to $i_2$ ($i_1$ and $i_2$ differ in exactly one bit position), without becoming false momentarily. Let $f(w,x,y,z)=\Sigma(5,7,11,12,13,15)$. Which of the following cube covers of $f$ will ensure that the required property is satisfied?`,[
    m(r`\overline w xz,\;wx\overline y,\;x\overline y z,\;xyz,\;wyz`),m(r`wxy,\;\overline w xz,\;wyz`),m(r`wx\overline y\,\overline z,\;xz,\;w\overline x yz`),m(r`wyz,\;wxz,\;\overline w xz,\;x\overline y z,\;xyz`)],{notes:['The first input vector prints x_1 again in its fourth position; retained. Printed answer key is (*), so no answer has been inferred.']}),
  question(29,2006,2,r`Consider numbers represented in 4-bit gray code. Let $h_3h_2h_1h_0$ be the gray code representation of a number $n$ and let $g_3g_2g_1g_0$ be the gray code of $(n+1)$ (modulo 16) value of the number. Which one of the following functions is correct?`,[
    m(r`g_0(h_3,h_2,h_1,h_0)=\Sigma(1,2,3,6,10,13,14,15)`),m(r`g_1(h_3,h_2,h_1,h_0)=\Sigma(4,9,10,11,12,13,14,15)`),m(r`g_2(h_3,h_2,h_1,h_0)=\Sigma(2,4,5,6,7,12,13,15)`),m(r`g_3(h_3,h_2,h_1,h_0)=\Sigma(0,1,6,7,10,11,12,13)`)],{optLayout:'1col'}),
  question(30,2006,2,'The boolean function for a combinational circuit with four inputs is represented by the following Karnaugh map.\n'+kmap('RS','PQ',['1001','0011','1110','1001'])+'\nWhich of the product terms given below is an essential prime implicant of the function?',[m('QRS'),m('PQS'),m(r`PQ'S'`),m(r`Q'S'`)]),
  question(31,2007,1,r`What is the maximum number of different Boolean functions involving $n$ Boolean variables?`,[m('n^2'),m('2^n'),m('2^{2^n}'),m('2^{n^2}')]),
  question(32,2007,1,r`Consider the following Boolean function of four variables $f(w,x,y,z)=\Sigma(1,3,4,6,9,11,12,14)$. The function is`,['independent of one variable','independent of two variables','independent of three variables','dependent on all the variables']),
  question(33,2007,2,r`The following expression was to be realized using 2-input AND and OR gates. However, during the fabrication all 2-input AND gates were mistakenly substituted by 2-input NAND gates.
$$(a.b).c+(\overline a.c).d+(b.c).d+a.d$$
What is the function finally realized?`,['1',m(r`\overline a+\overline b+\overline c+\overline d`),m(r`\overline a+b+\overline c+\overline d`),m(r`\overline a+\overline b+c+\overline d`)]),
  question(34,2007,2,linked+'Which of the following Karnaugh Maps correctly represents the expression?',[
    kmap('','',['11..','11..','11.1','1..1'],[r`\overline c\overline d`,r`\overline c d`,'cd',r`c\overline d`],[r`\overline a\overline b`,r`\overline a b`,'ab',r`a\overline b`]),
    kmap('','',['11..','1...','11.1','11.1'],[r`\overline c\overline d`,r`\overline c d`,'cd',r`c\overline d`],[r`\overline a\overline b`,r`\overline a b`,'ab',r`a\overline b`]),
    kmap('','',['11..','11.1','11.1','1..1'],[r`\overline c\overline d`,r`\overline c d`,'cd',r`c\overline d`],[r`\overline a\overline b`,r`\overline a b`,'ab',r`a\overline b`]),
    kmap('','',['11..','11..','11.1','1.11'],[r`\overline c\overline d`,r`\overline c d`,'cd',r`c\overline d`],[r`\overline a\overline b`,r`\overline a b`,'ab',r`a\overline b`]),
  ],{optLayout:'2col',notes:['Shared expression repeated in Q1.35. Blank map cells remain blank; all row/column literal labels remain editable.']}),
  question(35,2007,2,linked+'Which of the following expressions does not correspond to the Karnaugh Map obtained in above question?',[
    m(r`\overline c\overline d+a\overline d+ab\overline c+\overline a\overline c d`),m(r`\overline a\overline c+\overline c\overline d+a\overline d+ab\overline c d`),m(r`\overline a\overline c+a\overline d+ab\overline c+\overline c d`),m(r`\overline b\overline c\overline d+ac\overline d+\overline a\overline c+ab\overline c`)
  ],{notes:['The linked expression from Q1.34 is repeated to preserve the dependency.']}),
  question(36,2007,2,r`Let $f(w,x,y,z)=\Sigma(0,4,5,7,8,9,13,15)$. Which of the following expressions are NOT equivalent to $f$?`,[m(r`x'y'z'+w'xy'+wy'z+xz`),m(r`w'y'z'+wx'y'+xz`),m(r`w'y'z'+wx'y'+xyz+xy'z`),m(r`x'y'z'+wx'y'+w'y`)],{optLayout:'1col'}),
  question(37,2007,2,r`Define the connective $*$ for the Boolean variables $X$ and $Y$ as: $X*Y=XY+XY'$. Let $Z=X*Y$. Consider the following expressions P, Q and R.
P: $X=Y*Z$
Q: $Y=X*Z$
R: $X*Y*Z=1$
Which of the following is TRUE?`,['Only P and Q are valid','Only Q and R are valid','Only P and R are valid','All P, Q, R are valid'],{notes:['The defining expression prints XY+XY\' (no complement on the first X); transcribed as printed. Options continue on book page 195. Printed key D retained.']}),
  question(38,2007,2,'The line T in the following figure is permanently connected to the ground.\n[IMG_1]\nWhich of the following inputs (X1 X2 X3 X4) will detect the fault?',['0000','0111','1111','None of these'],{diagram:'digital-logic-1-38'}),
  question(39,2008,1,'In the Karnaugh map shown below, X denotes a don\'t care term. What is the minimal form of the function represented by the Karnaugh map\n'+kmap('cd','ab',['11.1','X...','X...','11.X']),[
    m(r`\overline b.\overline d+\overline a.\overline d`),m(r`\overline a.\overline b+\overline b.\overline d+\overline a.b.\overline d`),m(r`\overline b.\overline d+\overline a.b.\overline d`),m(r`\overline a.\overline b+\overline b.\overline d+\overline a.\overline d`)]),
  question(40,2008,1,r`For the given circuit $f_1$, $f_3$ and $f$ are given below:
[IMG_1]
$$f_1=\Sigma m(4,5,6,7,8)$$
$$f_3=\Sigma m(1,6,15)$$
$$f=\Sigma m(1,6,8,15)$$
Then $f_2$ is`,[m(r`\Sigma m(4,6)`),m(r`\Sigma m(4,8)`),m(r`\Sigma m(6,8)`),m(r`\Sigma m(4,6,8)`)],{diagram:'digital-logic-1-40'}),
  question(41,2008,1,'A set of Boolean connectives is functionally complete if all Boolean functions can be synthesized using those. Which of the following sets of connectives is NOT functionally complete?',['EX-NOR','Implication, negation','OR, negation','NAND']),
  question(42,2008,2,r`If $P,Q,R$ are Boolean variables, then $(P+\overline Q)(P.\overline Q+P.R)(\overline P.\overline R+\overline Q)$ simplifies to`,[m(r`P.\overline Q`),m(r`P.\overline R`),m(r`P.\overline Q+R`),m(r`P.\overline R+Q`)]),
  question(43,2008,1,r`Consider the following Boolean function of four variables:
$$f(A,B,C,D)=\Sigma(2,3,6,7,8,9,10,11,12,13)$$
The function is`,['independent of one variable','independent of two variables','independent of three variable','dependent on all the variables']),
  question(44,2009,1,r`What is the minimum number of gates required to implement the Boolean function $(AB+C)$ if we have to use only 2-input NOR gates?`,['2','3','4','5']),
  question(45,2010,1,r`The minterm expansion of $f(P,Q,R)=PQ+Q\overline R+P\overline R$ is`,[m('m_2+m_4+m_6+m_7'),m('m_0+m_1+m_3+m_5'),m('m_0+m_1+m_6+m_1'),m('m_2+m_3+m_4+m_5')],{notes:['Option C repeats m_1 in the printed source; retained.']}),
  question(46,2010,2,r`The simplified SOP (Sum of Product) form of the Boolean expression $(P+\overline Q+\overline R).(P+\overline Q+R).(P+Q+\overline R)$ is`,[m(r`P+\overline Q+\overline R`),m(r`P+\overline Q.\overline R`),m(r`\overline P.Q+R`),m('P.Q+R')]),
  question(47,2010,2,'What is the boolean expression for the output f of the combinational logic circuit of NOR gates given below?\n[IMG_1]',[m(r`\overline{Q+R}`),m(r`\overline{P+Q}`),m(r`\overline{P+R}`),m(r`\overline{P+Q+R}`)],{diagram:'digital-logic-1-47'}),
  question(48,2011,1,'Which one of the following circuits is NOT equivalent to a 2-input XNOR (exclusive NOR) gate?',['IMG:digital-logic-1-48-a','IMG:digital-logic-1-48-b','IMG:digital-logic-1-48-c','IMG:digital-logic-1-48-d'],{optLayout:'2col'}),
  question(49,2012,2,'What is the minimal form of the Karnaugh map shown below? Assume that X denotes a don\'t care term.\n'+kmap('cd','ab',['1XX1','X..1','....','1..X']),[
    m(r`\overline b\,\overline d`),m(r`\overline b\,\overline d+\overline b\,\overline c`),m(r`\overline b\,\overline d+a\overline b\,\overline c d`),m(r`\overline b\,\overline d+\overline b\,\overline c+\overline c\,\overline d`)]),
  question(50,2012,1,r`The truth table:
$$\begin{array}{c|c|c}X&Y&f(X,Y)\\\hline0&0&0\\0&1&0\\1&0&1\\1&1&1\end{array}$$
represents the Boolean function`,[m('X'),m('X+Y'),m(r`X\oplus Y`),m('Y')]),
  question(51,2013,1,r`Which one of the following expressions does NOT represent exclusive NOR of $x$ and $y$?`,[m(r`xy+x'y'`),m(r`x\oplus y'`),m(r`x'\oplus y`),m(r`x'\oplus y'`)]),
  question(52,2014,1,r`Consider the following Boolean expression for $F$:
$$F(P,Q,R,S)=PQ+\overline P QR+\overline P Q\overline R S$$
The minimal sum-of-products form of $F$ is`,[m('PQ+QR+QS'),m('P+Q+R+S'),m(r`\overline P+\overline Q+\overline R+\overline S`),m(r`\overline P R+\overline P\overline R S+P`)],{setNum:'1'}),
  question(53,2014,1,r`The dual of a Boolean function $F(x_1,x_2,\ldots,x_n,+,\cdot)$, written as $F^D$, is the same expression as that of $F$ with $+$ and $\cdot$ swapped. $F$ is said to be self-dual if $F=F^D$. The number of self-dual functions with $n$ Boolean variables is`,[m('2^n'),m('2^{n-1}'),m('2^{2^n}'),m('2^{2^{n-1}}')],{setNum:'2'}),
  question(54,2014,1,r`Consider the following minterm expression for $F$:
$$F(P,Q,R,S)=\Sigma(0,2,5,7,8,10,13,15)$$
The minterms 2, 7, 8 and 13 are 'do not care' terms. The minimal sum-of-products form for $F$ is`,[
    m(r`Q\overline S+\overline Q S`),m(r`\overline Q\,\overline S+QS`),m(r`\overline Q\,\overline R\,\overline S+\overline Q R\overline S+Q\overline R S+QRS`),m(r`\overline P\overline Q\overline S+\overline P QS+PQS+P\overline Q\overline S`)],{setNum:'3'}),
  question(55,2014,2,r`Let $\oplus$ denote the Exclusive OR (XOR) operation. Let '1' and '0' denote the binary constants. Consider the following Boolean expression for $F$ over two variables $P$ and $Q$:
$$F(P,Q)=((1\oplus P)\oplus(P\oplus Q))\oplus((P\oplus Q)\oplus(Q\oplus0))$$
The equivalent expression for $F$ is`,[m('P+Q'),m(r`\overline{P+Q}`),m(r`P\oplus Q`),m(r`\overline{P\oplus Q}`)],{setNum:'3'}),
  question(56,2015,2,r`Consider the operations:
$$f(X,Y,Z)=X'YZ+XY'+Y'Z'$$
and
$$g(X,Y,Z)=X'YZ+X'YZ'+XY$$
Which one of the following is correct?`,[r`Both $\{f\}$ and $\{g\}$ are functionally complete`,r`Only $\{f\}$ is functionally complete`,r`Only $\{g\}$ is functionally complete`,r`Neither $\{f\}$ nor $\{g\}$ is functionally complete`],{setNum:'1'}),
  question(57,2015,2,r`The number of min-terms after minimizing the following Boolean expression is ______.
$$[D'+AB'+A'C+AC'D+A'C'D]'$$`,[],{setNum:'2'}),
  question(58,2015,2,r`The total number of prime implicants of the function $f(w,x,y,z)=\Sigma(0,2,4,5,6,10)$ is ______.`,[],{setNum:'3'}),
  question(59,2015,2,r`Given the function $F=P'+QR$, where $F$ is a function in three Boolean variables $P,Q,R$ and $P'=!P$, consider the following statements.
S1: $F=\Sigma(4,5,6)$
S2: $F=\Sigma(0,1,2,3,7)$
S3: $F=\Pi(4,5,6)$
S4: $F=\Pi(0,1,2,3,7)$
Which of the following is true?`,['S1-False, S2-True, S3-True, S4-False','S1-True, S2-False, S3-False, S4-True','S1-False, S2-False, S3-True, S4-True','S1-True, S2-True, S3-False, S4-False'],{setNum:'3',optLayout:'1col'}),
  question(60,2016,1,r`Consider the Boolean operator $\#$ with the following properties: $x\#0=x$, $x\#1=\overline x$, $x\#x=0$ and $x\#\overline x=1$. Then $x\#y$ is equivalent to`,[m(r`x\overline y+\overline x y`),m(r`x\overline y+\overline x\,\overline y`),m(r`\overline x y+xy`),m(r`xy+\overline x\,\overline y`)],{setNum:'1'}),
  question(61,2016,1,r`Let $x_1\oplus x_2\oplus x_3\oplus x_4=0$ where $x_1,x_2,x_3,x_4$ are Boolean variables, and $\oplus$ is the XOR operator. Which one of the following must always be TRUE?`,[m('x_1x_2x_3x_4=0'),m('x_1x_3+x_2=0'),m(r`\overline x_1\oplus\overline x_3=\overline x_2\oplus\overline x_4`),m('x_1+x_2+x_3+x_4=0')],{setNum:'2'}),
  question(62,2017,1,r`Consider the Karnaugh map given below, where X represents "don't care" and blank represents 0.`+'\n'+kmap('dc','ba',['.XX.','1..X','1..1','.XX.'])+r`
Assume for all inputs $(a,b,c,d)$, the respective complements $(\overline a,\overline b,\overline c,\overline d)$ are also available. The above logic is implemented using 2-input NOR gates only. The minimum number of gates required is ______.`,[],{setNum:'1'}),
  question(63,2017,2,r`Given $f(w,x,y,z)=\Sigma_m(0,1,2,3,7,8,10)+\Sigma_d(5,6,11,15)$, where $d$ represents the don't-care condition in Karnaugh maps. Which of the following is a minimum product-of-sums (POS) form of $f(w,x,y,z)$?`,[
    m(r`f=(\overline w+\overline z)(\overline x+z)`),m(r`f=(\overline w+z)(x+z)`),m(r`f=(w+z)(\overline x+z)`),m(r`f=(w+\overline z)(\overline x+z)`)],{setNum:'2'}),
  question(64,2017,2,r`If $w,x,y,z$ are Boolean variables, then which one of the following is INCORRECT?`,[
    m(r`wx+w(x+y)+x(x+y)=x+wy`),m(r`\overline{w\overline x(y+\overline z)}+\overline w x=\overline w+x+\overline y z`),m(r`(w\overline x\,\overline{(y+x\overline z)}+\overline{\overline w x})y=x\overline y`),m(r`(w+y)(wxy+wyz)=wxy+wyz`)],{setNum:'2',optLayout:'1col'}),
  question(65,2018,1,r`Let $\oplus$ and $\odot$ denote the Exclusive OR and Exclusive NOR operations, respectively. Which one of the following is NOT CORRECT?`,[
    m(r`P\oplus\overline Q=P\odot Q`),m(r`\overline P\oplus Q=P\odot Q`),m(r`\overline P\oplus\overline Q=P\oplus Q`),m(r`(P\oplus\overline P)\oplus Q=(P\odot\overline P)\odot\overline Q`)]),
  question(66,2018,2,r`Consider the minterm list form of a Boolean function $F$ given below:
$$F(P,Q,R,S)=\Sigma m(0,2,5,7,9,11)+d(3,8,10,12,14)$$
Here, $m$ denotes a minterm and $d$ denotes a don't care term. The number of essential prime implicants of the function $F$ is ______.`,[]),
  question(67,2019,1,r`Which one of the following is NOT a valid identity?`,[
    m(r`x\oplus y=(xy+x'y')'`),r`$x\oplus y=x+y$, if $xy=0$`,m(r`(x\oplus y)\oplus z=x\oplus(y\oplus z)`),m(r`(x+y)\oplus z=x\oplus(y+z)`)]),
  question(68,2019,2,r`What is the minimum number of 2-input NOR gates required to implement 4-variable function expressed in sum-of-minterms form as $f=\Sigma(0,2,5,7,8,10,13,15)$? Assume that all the inputs and their complements are available ______.`,[]),
  question(69,2019,2,r`Consider three 4-variable functions $f_1,f_2,f_3$, which are expressed in sum-of-minterms as
$$f_1=\Sigma(0,2,5,8,14)$$
$$f_2=\Sigma(2,3,6,8,14,15)$$
$$f_3=\Sigma(2,7,11,14)$$
For the following circuit with one AND gate and one XOR gate, the output function $f$ can be expressed as:
[IMG_1]`,[m(r`\Sigma(7,8,11)`),m(r`\Sigma(2,14)`),m(r`\Sigma(0,2,3,5,6,7,8,11,14,15)`),m(r`\Sigma(2,7,8,11,14)`)],{diagram:'digital-logic-1-69',notes:['Stem on book page 197 / PDF page 4; circuit, options and year on book page 198 / PDF page 5.']}),
  question(70,2020,2,r`Consider the Boolean function $z(a,b,c)$:
[IMG_1]
Which one of the following minterm lists represents the circuit given above?`,[m(r`z=\Sigma(2,4,5,6,7)`),m(r`z=\Sigma(1,4,5,6,7)`),m(r`z=\Sigma(0,1,3,7)`),m(r`z=\Sigma(2,3,5)`)],{diagram:'digital-logic-1-70'}),
  question(71,2021,2,r`Consider the following Boolean expression:
$$F=(X+Y+Z)(\overline X+Y)(\overline Y+Z)$$
Which of the following Boolean expressions is/are equivalent to $\overline F$?`,[
    m(r`X\overline Y+\overline Y\overline Z+\overline X\overline Y\overline Z`),m(r`(\overline X+\overline Y+\overline Z)(X+\overline Y)(Y+\overline Z)`),m(r`(X+\overline Z)(\overline Y+\overline Z)`),m(r`X\overline Y+\overline Z`)],{setNum:'1'}),
  question(72,2021,2,r`Consider a Boolean function $f(w,x,y,z)$ such that
$$\begin{aligned}f(w,0,0,z)&=1\\f(1,x,1,z)&=x+z\\f(w,1,y,z)&=wz+y\end{aligned}$$
The number of literals in the minimal sum-of-products expression of $f$ is ______.`,[],{setNum:'2'}),
  question(73,2024,1,r`Consider the circuit shown below where the gates may have propagation delays. Assume that all signal transitions occur instantaneously and that wires have no delays. Which of the following statements about the circuit is/are CORRECT?
[IMG_1]`,[
    r`With no propagation delays, the output $Y$ is always logic Zero`,r`With no propagation delays, the output $Y$ is always logic One`,r`With propagation delays, the output $Y$ can have a transient logic Zero after $X$ transitions from logic One to logic Zero`,r`With propagation delays, the output $Y$ can have a transient logic One after $X$ transitions from logic Zero to logic One`],{setNum:'1',diagram:'digital-logic-1-73',optLayout:'1col',notes:['Options continue at the top of the next column on book page 198.']}),
  question(74,2024,2,r`Consider a Boolean expression given by $F(X,Y,Z)=\Sigma(3,5,6,7)$. Which of the following statements is/are CORRECT?`,[
    m(r`F(X,Y,Z)=\Pi(0,1,2,4)`),r`$F(X,Y,Z)$ is independent of input $Y$`,m(r`F(X,Y,Z)=XY+YZ+XZ`),r`$F(X,Y,Z)$ is independent of input $X$`],{setNum:'1'}),
  question(75,2024,1,r`For a Boolean variable $x$, which of the following statements is/are FALSE?`,[m(r`x\cdot x=0`),m(r`x+\overline x=1`),m('x+1=x'),m(r`x\cdot1=x`)],{setNum:'2'}),
  question(76,2024,2,r`Consider 4-variable functions $f_1,f_2,f_3,f_4$ expressed in sum-of-minterms form as given below:
$$\begin{aligned}
f_1&=\Sigma(0,2,3,5,7,8,11,13)\\
f_2&=\Sigma(1,3,5,7,11,13,15)\\
f_3&=\Sigma(0,1,4,11)\\
f_4&=\Sigma(0,2,6,13)
\end{aligned}$$
[IMG_1]
With respect to the circuit given above, which of the following options is/are CORRECT?`,[
    m(r`Y=\Sigma(0,1,2,11,13)`),m(r`Y=\Sigma(0,1,2,3,4,5,6,7)`),m(r`Y=\Pi(8,9,10,11,12,13,14,15)`),m(r`Y=\Pi(3,4,5,6,7,8,9,10,12,14,15)`)],{setNum:'2',diagram:'digital-logic-1-76',optLayout:'1col'}),
];
export const DIGITAL_LOGIC_FUNCTIONS_IMPORT={subject:'9. Digital Logic',chapter:'1. Logic Functions and Minimizations',sourceHash,questions};
