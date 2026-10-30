const t=String.raw;
export const bookMap={1:41,2:16,3:46,4:17,6:36,11:37,12:43,13:32,15:33,16:38,19:1,20:40,21:20,22:6,23:29,24:2,25:24,26:5,27:42,28:28,29:26,30:0,31:50,32:44,33:47,34:48,35:39,36:21,38:25,40:49,41:22,42:3,43:23,44:27,45:4,46:45,48:7,49:8,50:34,51:35,52:18,53:19,54:30,55:31};
export const otherBookMap={14:'madeeasy-digital-logic-functions-1-46',17:'p5wksyqsw',18:'madeeasy-maths-probability-5-35'};
const q=(text,opts,code='')=>({text,code,diagram:'',...Object.fromEntries(opts.map((v,i)=>['opt'+'ABCD'[i],v]))});
export const additions={
5:q(t`A company needs to develop a strategy for software product development for which it has a choice of two programming languages L1 and L2. The number of lines of code (LOC) developed using L2 is estimated to be twice the LOC developed with L1. The product will have to be maintained for five years. Various parameters for the company are given in the table below.
$$\begin{array}{l|c|c}\text{Parameter}&\text{Language L1}&\text{Language L2}\\\hline\text{Man years needed for development}&\mathrm{LOC}/10000&\mathrm{LOC}/10000\\\text{Development Cost per man year}&\text{Rs. 10,00,000}&\text{Rs. 7,50,000}\\\text{Maintenance time}&\text{5 years}&\text{5 years}\\\text{Cost of maintenance per year}&\text{Rs. 1,00,000}&\text{Rs. 50,000}\end{array}$$
Total cost of the project includes cost of development and maintenance. What is the LOC for L1 for which the cost of the project using L1 is equal to the cost of the project using L2?`,['4000','5000','4333','4667']),
7:q('A company needs to develop digital signal processing software for one of its newest inventions. The software is expected to have 40000 lines of code. The company needs to determine the effort in person-months needed to develop this software using the basic COCOMO model. The multiplicative factor for this model is given as 2.8 for the software development on embedded systems, while the exponentiation factor is given as 1.20. What is the estimated effort in person-months?',['234.25','932.50','287.80','122.40']),
8:q('Which of the following pairs have DIFFERENT expressive power?',['Deterministic finite automata (DFA) and Non-deterministic finite automata (NFA)','Deterministic push down automata (DPDA) and Non-deterministic push down automata (NPDA)','Deterministic single-tape Turing machine and Non-deterministic single-tape Turing machine','Single-tape Turing machine and multi-tape Turing machine']),
9:q('HTML (HyperText Markup Language) has language elements which permit certain actions other than describing the structure of the web document. Which one of the following actions is NOT supported by pure HTML (without any server or client side scripting) pages?',['Embed web objects from different sites into the same page','Refresh the page automatically after a specified interval','Automatically redirect to another page upon download','Display the client time as part of the page']),
10:q('Which one of the following is NOT desired in a good Software Requirement Specifications (SRS) document?',['Functional Requirements','Non-Functional Requirements','Goals of Implementation','Algorithms for Software Implementation']),
37:q(t`Which of the given options provides the increasing order of asymptotic complexity of functions $f_1,f_2,f_3$ and $f_4$?
$$f_1(n)=2^n\qquad f_2(n)=n^{3/2}\qquad f_3(n)=n\log_2 n\qquad f_4(n)=n^{\log_2 n}$$`,[t`$f_3,f_2,f_4,f_1$`,t`$f_3,f_2,f_1,f_4$`,t`$f_2,f_3,f_1,f_4$`,t`$f_2,f_3,f_4,f_1$`]),
39:q(t`Consider a relational table $r$ with sufficient number of records, having attributes $A_1,A_2,\ldots,A_n$ and let $1\le p\le n$. Two queries Q1 and Q2 are given below.
Q1: $\pi_{A_1,\ldots,A_p}(\sigma_{A_p=c}(r))$ where $c$ is a constant
Q2: $\pi_{A_1,\ldots,A_p}(\sigma_{c_1\le A_p\le c_2}(r))$ where $c_1$ and $c_2$ are constants
The database can be configured to do ordered indexing on $A_p$ or hashing on $A_p$. Which of the following statements is TRUE?`,['Ordered indexing will always outperform hashing for both queries','Hashing will always outperform ordered indexing for both queries','Hashing will outperform ordered indexing on Q1, but not on Q2','Hashing will outperform ordered indexing on Q2, but not on Q1']),
47:q(t`The following is the comment written for a C function.
[CODE]
A software test engineer is assigned the job of doing black box testing. He comes up with the following test cases, many of which are redundant.
$$\begin{array}{c|rrr|rrr}\text{Test Case}&a&b&c&\text{root1}&\text{root2}&\text{Return Value}\\\hline T1&0.0&0.0&7.0&0.0&0.0&-1\\T2&0.0&1.0&3.0&0.0&0.0&-1\\T3&1.0&2.0&1.0&-1.0&-1.0&0\\T4&4.0&-12.0&9.0&1.5&1.5&0\\T5&1.0&-2.0&-3.0&3.0&-1.0&0\\T6&1.0&1.0&4.0&0.0&0.0&-1\end{array}$$
Which one of the following options provide the set of non-redundant tests using equivalence class partitioning approach from input perspective for black box testing?`,['T1, T2, T3, T6','T1, T3, T4, T5','T2, T4, T5, T6','T2, T3, T4, T5'],`/* This function computes the roots of a quadratic equation
   a.x^2 + b.x + c = 0. The function stores two real roots
   in *root1 and *root2 and returns the status of validity
   of roots. It handles four different kinds of cases.
   (i) When coefficient a is zero irrespective of discriminant
   (ii) When discriminant is positive
   (iii) When discriminant is zero
   (iv) When discriminant is negative.
   Only in case (ii) and (iii), the stored roots are valid.
   Otherwise 0 is stored in the roots. The function returns
   0 when the roots are valid and -1 otherwise.
   The function also ensures root1 >= root2.
   int get_QuadRoots(float a, float b, float c,
       float *root1, float *root2);
 */`),
56:q('Which of the following options is the closest in the meaning to the word below:\nInexplicable',['Incomprehensible','Indelible','Inextricable','Infallible']),
57:q(t`If $\operatorname{Log}(P)=(1/2)\operatorname{Log}(Q)=(1/3)\operatorname{Log}(R)$, then which of the following options is TRUE?`,[t`$P^2=Q^3R^2$`,t`$Q^2=PR$`,t`$Q^2=R^3P$`,t`$R=P^2Q^2$`]),
58:q('Choose the most appropriate word(s) from the options given below to complete the following sentence.\nI contemplated ________ Singapore for my vacation but decided against it.',['to visit','having to visit','visiting','for a visit']),
59:q('Choose the most appropriate word from the options given below to complete the following sentence.\nIf you are trying to make a strong impression on your audience, you cannot do so by being understated, tentative or __________.',['hyperbolic','restrained','argumentative','indifferent']),
60:q('Choose the word from the options given below that is most nearly opposite in the meaning to the given word:\nAmalgamate',['merge','split','collect','separate']),
61:q('Few school curricula include a unit on how to deal with bereavement and grief, and yet all students at some point in their lives suffer from losses through death and parting.\n\nBased on the above passage which topic would not be included in a unit on bereavement?',['how to write a letter of condolence','what emotional stages are passed through in the healing process','what the leading causes of death are','how to give support to a grieving friend']),
62:q(t`P, Q, R and S are four types of dangerous microbes recently found in a human habitat. The area of each circle with its diameter printed in brackets represents the growth of a single microbe surviving human immunity system within 24 hours of entering the body. The danger to human beings varies proportionately with the toxicity, potency and growth attributed to a microbe shown in the figure below:
[IMG_1]
A pharmaceutical company is contemplating the development of a vaccine against the most dangerous microbe. Which microbe should the company target in its first attempt?`,['P','Q','R','S']),
63:q(t`The variable cost (V) of manufacturing a product varies according to the equation $V=4q$, where $q$ is the quantity produced. The fixed cost (F) of production of same product reduces with $q$ according to the equation $F=100/q$. How many units should be produced to minimize the total cost $(V+F)$?`,['5','4','7','6']),
64:q('A transporter receives the same number of orders each day. Currently, he has some pending orders (backlog) to be shipped. If he uses 7 trucks, then at the end of the 4th day he can clear all the orders. Alternatively, if he uses only 3 trucks, then all the orders are cleared at the end of the 10th day. What is the minimum number of trucks required so that there will be no pending order at the end of the 5th day?',['4','5','6','7']),
65:q('A container originally contains 10 litres of pure spirit. From this container 1 litre of spirit is replaced with 1 litre of water. Subsequently 1 litre of the mixture is again replaced with 1 litre of water and this process is repeated one more time. How much spirit is now left in the container?',['7.58 litres','7.84 litres','7 litres','7.29 litres']),
};
export function restoreSource(q,n){
 if(n===4)q.text+='\nWhich is the application level protocol used in each activity?';
 if(n===12){q.text=q.text.replace('single record from','single record for');}
 if(n===14){q.optA=t`$(\overline P.Q+\overline R)$`;q.optB=t`$(P+\overline Q.\overline R)$`;}
 if(n===17){q.text=q.text.replace('$K_4$ and $Q_3$','K4 and Q3');q.optC='Q3 is planar while K3 is not';}
 if(n===22){q.optD='011';q.code='Char c[] = "GATE2011";\nchar *p = c;\nprintf("%s", p + p[3] - p[1]);';}
 if(n===25)q.text=q.text.replace('L_{n+1}','L_{n-1}');
 if(n===28){q.text=t`On a non-pipelined sequential processor, a program segment, which is a part of the interrupt service routine, is given to transfer 500 bytes from an I/O device to memory.
[CODE]
Assume that each statement in this program is equivalent to a machine instruction which takes one clock cycle to execute if it is a non-load/store instruction. The load-store instructions take two clock cycles to execute.
The designer of the system also has an alternate approach of using the DMA controller to implement the same transfer. The DMA controller requires 20 clock cycles for initialization and other overheads. Each DMA transfer cycle takes two clock cycles to transfer one byte of data from the device to the memory.
What is the approximate speedup when the DMA controller based design is used in place of the interrupt driven program based input-output?`;q.code='Initialize the address register\nInitialize the count to 500\nLOOP: Load a byte from device\n      Store in memory at address given by address register\n      Increment the address register\n      Decrement the count\n      If count != 0 go to LOOP';}
 if(n===33)q.text=q.text.replace('positive constant.','positive constants.');
 if(n===48||n===49){q.text='Common Data for Questions 48 and 49:\n'+q.text;q.code='unsigned int foo(unsigned int n, unsigned int r) {\n    if (n>0) return ((n%r) + foo(n/r, r));\n    else return 0;\n}';}
 if(n===50||n===51)q.text='Common Data for Questions 50 and 51:\n'+q.text;
 if(n===52||n===53){q.text=q.text.replace('Linked Data Question Q.4.22 and Q.4.23:','Statement for Linked Answer Questions 52 and 53:').replace('\\mathrm{B5}','\\mathrm{N5}').replace(/Previous question \(Q4\.22\):[\s\S]*?node, N3\?\n/,'');}
 if(n===54||n===55)q.text=q.text.replace('Linked Data Question 3.42 and 3.43:','Statement for Linked Answer Questions 54 and 55:');
 for(const number of [13,23,27,45])if(n===number)for(const letter of 'ABCD')q['opt'+letter]='IMG:q'+n+'-'+letter.toLowerCase();
 const diagrams={17:'q17-graphs',36:'q36-tree',41:'q41-pipeline',45:'q45-dfa',50:'q50-51-counter',51:'q50-51-counter',52:'q52-53-network',53:'q52-53-network',54:'q54-55-graph',55:'q54-55-graph',62:'q62-microbes'};
 q.diagram=diagrams[n]||'';
 return q;
}
