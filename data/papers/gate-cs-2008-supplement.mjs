const S=String.raw;
// Indices refer to the immutable book-2008.json inspection snapshot.
export const bookMap={1:165,2:4,3:161,4:116,5:108,6:117,7:119,8:109,10:43,11:141,12:143,13:42,14:66,16:153,17:67,18:29,19:120,20:140,24:6,25:166,26:111,27:159,28:162,29:160,30:0,31:3,32:104,33:75,34:73,35:83,36:78,37:76,38:84,39:90,40:91,41:94,42:106,43:98,44:95,45:107,46:125,47:126,48:22,49:19,50:23,51:24,52:20,53:21,55:142,56:65,57:64,58:70,59:68,60:36,61:37,62:41,63:132,64:130,65:135,66:131,67:137,68:151,69:148,70:154,71:85,72:86,73:87,74:92,75:93,76:79,77:80,78:7,79:8,80:96,81:97,82:144,83:145,84:99,85:100};
export const additions={
9:{subject:'2. TOC',text:S`Which of the following is true for the language $\{a^p\mid p\text{ is a prime}\}$?`,optA:'It is not accepted by a Turing Machine',optB:'It is regular but not context-free',optC:'It is context-free but not regular',optD:'It is neither regular nor context-free, but accepted by a Turing machine'},
15:{subject:'12. DBMS',text:S`Which of the following tuple relational calculus expression(s) is/are equivalent to $\forall t\in r(P(t))$?
I. $\neg\exists t\in r(P(t))$
II. $\exists t\notin r(P(t))$
III. $\neg\exists t\in r(\neg P(t))$
IV. $\exists t\notin r(\neg P(t))$`,optA:'I only',optB:'II only',optC:'III only',optD:'III and IV only'},
21:{subject:'11. Engg. Maths',text:S`The minimum number of equal length subintervals needed to approximate $\displaystyle\int_1^2 xe^x\,dx$ to an accuracy of at least $\frac13\times10^{-6}$ using the trapezoidal rule is`,optA:'$1000e$',optB:'1000',optC:'$100e$',optD:'100'},
22:{subject:'11. Engg. Maths',text:S`The Newton-Raphson iteration $x_{n+1}=\frac12\left(x_n+\frac{R}{x_n}\right)$ can be used to compute the`,optA:'square of $R$',optB:'reciprocal of $R$',optC:'square root of $R$',optD:'logarithm of $R$'},
23:{subject:'1. Discrete Maths',text:'Which of the following statements is true for every planar graph on n vertices?',optA:'The graph is connected',optB:'The graph is Eulerian',optC:'The graph has a vertex-cover of size at most $3n/4$',optD:'The graph has an independent set of size at least $n/3$'},
54:{subject:'10. Compiler Design',text:`Which of the following are true?
I. A programming language which does not permit global variables of any kind and has no nesting of procedures/functions, but permits recursion can be implemented with static storage allocation
II. Multi-level access link (or display) arrangement is needed to arrange activation records only if the programming language being implemented has nesting of procedures/functions
III. Recursion in programming languages cannot be implemented with dynamic storage allocation
IV. Nesting of procedures/functions and recursion require a dynamic heap allocation scheme and cannot be implemented with a stack-based allocation scheme for activation records
V. Programming languages which permit a function to return a function as its result cannot be implemented with a stack-based storage allocation scheme for activation records`,optA:'II and V only',optB:'I, III and IV only',optC:'I, II and V only',optD:'II, III and V only'}
};
const cacheText=`Common Data for Questions 71, 72 and 73:
Consider a machine with a 2-way set associative data cache of size 64 Kbytes and block size 16 bytes. The cache is managed using 32 bit virtual addresses and the page size is 4 Kbytes. A program to be run on this machine begins as follows:
[CODE]
The size of double is 8 Bytes. Array ARR is located in memory starting at the beginning of virtual page 0xFF000 and stored in row major order. The cache is initially empty and no pre-fetching is done. The only data memory references made by the program are those to array ARR.
`;
const cacheCode=`double ARR[1024][1024];
int i, j;
/* Initialize array ARR to 0.0 */
for (i = 0; i < 1024; i++)
    for (j = 0; j < 1024; j++)
        ARR[i][j] = 0.0;`;
const subset=S`Statement for Linked Answer Questions 80 and 81:
The subset-sum problem is defined as follows. Given a set of $n$ positive integers, $S=\{a_1,a_2,a_3,\ldots,a_n\}$, and a positive integer $W$, is there a subset of $S$ whose elements sum to $W$? A dynamic program for solving this problem uses a 2-dimensional Boolean array, $X$, with $n$ rows and $W+1$ columns. $X[i,j]$, $1\le i\le n$, $0\le j\le W$, is TRUE if and only if there is a subset of $\{a_1,a_2,\ldots,a_i\}$ whose elements sum to $j$.
`;
export function restoreSource(q,n,book){
 if(n===3){q.text=S`The following system of equations
$$\begin{aligned}x_1+x_2+2x_3&=1\\x_1+2x_2+3x_3&=2\\x_1+4x_2+\alpha x_3&=4\end{aligned}$$
has a unique solution. The only possible value(s) for $\alpha$ is/are`;q.optD='any real number';}
 if(n===5)q.text=q.text.replace('map\n','map?\n');
 if(n===6){q.text=S`Let $r$ denote number system radix. The only value(s) of $r$ that satisfy the equation $\sqrt{121_r}=11_r$ is/are`;q.optD='any value $>2$';}
 if(n===8){q.text=S`Given $f_1$, $f_3$ and $f$ in canonical sum of products form (in decimal) for the circuit
[IMG_1]
$$f_1=\Sigma m(4,5,6,7,8),\quad f_3=\Sigma m(1,6,15),\quad f=\Sigma m(1,6,8,15)$$
then $f_2$ is`;q.diagram='q8-circuit';}
 if(n===19)q.diagram='q19-graph';
 if(n===24)q.text=S`Let $P=\sum_{\substack{1\le i\le2k\\i\text{ odd}}}i$ and $Q=\sum_{\substack{1\le i\le2k\\i\text{ even}}}i$, where $k$ is a positive integer. Then`;
 if(n===25)q.text=q.text.replace('3x^4-16x^3+4x^2+37','3x^4-16x^3+24x^2+37');
 if(n===31){q.text=q.text.replace('1.','I.').replace('2.','II.').replace('3.','III.').replace('4.','IV.');Object.assign(q,{optA:'Only I and II',optB:'Only I, II and III',optC:'Only I, II and IV',optD:'All of I, II, III and IV'});}
 if(n===32)q.text=q.text.replace('the latency','the seek latency');
 if(n===35)Object.assign(q,{optA:'IV only',optB:'I and IV only',optC:'I, III and IV only',optD:'I, II, III and IV'});
 if(n>=33&&n<=37){q.text=q.text.replace(/(^|\n)1\./g,'$1I.').replace(/(^|\n)2\./g,'$1II.').replace(/(^|\n)3\./g,'$1III.').replace(/(^|\n)4\./g,'$1IV.');if(n!==35)for(const k of ['A','B','C','D'])q['opt'+k]=q['opt'+k].replace(/\b1\b/g,'I').replace(/\b2\b/g,'II').replace(/\b3\b/g,'III');}
 if(n===45)q.diagram='q45-graph';
 if(n===49){q.diagram='';q.text=S`Given below are two finite state automata ($\rightarrow$ indicates the start state and F indicates a final state).
$$\begin{array}{c|cc}Y&a&b\\\hline\to1&1&2\\2\ (F)&2&1\end{array}\qquad
\begin{array}{c|cc}Z&a&b\\\hline\to1&2&2\\2\ (F)&1&1\end{array}$$
Which of the following represents the product automaton $Z\times Y$?`;
 const rows={A:[[ 'S','R'],['R','S'],['Q','P'],['Q','P']],B:[['S','Q'],['R','S'],['Q','P'],['P','Q']],C:[['Q','S'],['R','S'],['Q','P'],['Q','P']],D:[['S','Q'],['S','R'],['Q','P'],['Q','P']]};
 for(const k of Object.keys(rows)){const r=rows[k];q['opt'+k]=S`$\begin{array}{c|cc}&a&b\\\hline\to P&`+r[0].join('&')+S`\\Q&`+r[1].join('&')+S`\\R\ (F)&`+r[2].join('&')+S`\\S&`+r[3].join('&')+S`\end{array}$`;}q.optLayout='2col';}
 if(n===51){q.text=S`Match the following:
E. Checking that identifiers are declared before their use
F. Number of formal parameters in the declaration of a function agrees with the number of actual parameters in a use of that function
G. Arithmetic expressions with matched pairs of parentheses
H. Palindromes
P. $L=\{a^nb^mc^nd^m\mid n\ge1,m\ge1\}$
Q. $X\to XbX\mid XcX\mid dXf\mid g$
R. $L=\{wcw\mid w\in(a\mid b)^*\}$
S. $X\to bXb\mid cXc\mid\epsilon$`;Object.assign(q,{optA:'E-P, F-R, G-Q, H-S',optB:'E-R, F-P, G-S, H-Q',optC:'E-R, F-P, G-Q, H-S',optD:'E-P, F-R, G-S, H-Q'});}
 if(n===52){q.text=S`Match the following NFAs with the regular expressions they correspond to.
[IMG_1]
1. $\epsilon+0(01^*1+00)^*01^*$
2. $\epsilon+0(10^*1+00)^*0$
3. $\epsilon+0(10^*1+10)^*1$
4. $\epsilon+0(10^*1+10)^*10^*$`;q.diagram='q52-nfas';Object.assign(q,{optA:'P-2, Q-1, R-3, S-4',optB:'P-1, Q-3, R-2, S-4',optC:'P-1, Q-2, R-3, S-4',optD:'P-3, Q-2, R-1, S-4',optLayout:'2col'});q.pdfStyle={fontSize:17,minFontSize:10,imageScale:1.5};}
 if(n===53){q.text=S`Which of the following are regular sets?
I. $\{a^nb^{2m}\mid n\ge0,m\ge0\}$
II. $\{a^nb^m\mid n=2m\}$
III. $\{a^nb^m\mid n\ne m\}$
IV. $\{xcy\mid x,y\in\{a,b\}^*\}$`;Object.assign(q,{optA:'I and IV only',optB:'I and III only',optC:'I only',optD:'IV only'});}
 if(n===60)q.code=q.code.replace('**ppz += 1;','**ppz += 1;');
 if(n===61)q.optB="?1 is (c = getchar()) != '\\n')\n?2 is getchar(c);";
 if(n===62)q.code=q.code.replace('Void rearrange','void rearrange');
 if(n>=71&&n<=73){q.text=cacheText+{71:'The total size of the tags in the cache directory is',72:'Which of the following array elements has the same cache index as ARR[0][0]?',73:'The cache hit ratio for this initialization loop is'}[n];q.code=cacheCode;for(const k of ['A','B','C','D'])q['opt'+k]=q['opt'+k].replaceAll('APR','ARR');}
 if(n===74||n===75){q.text='Common Data for Questions 74 and 75:\nConsider the following C functions:\n[CODE]\n'+(n===74?'The running time of f1(n) and f2(n) are':'f1(8) and f2(8) return the values');q.code=book[93].code;}
 if(n===76){q.text='Statement for Linked Answer Questions 76 and 77:\nDelayed branching can help in the handling of control hazards.\nFor all delayed conditional branch instructions, irrespective of whether the condition evaluates to true or false,';}
 if(n===77){q.text=q.text.replace('Common Data for Q.3.19 & Q.3.20:','Statement for Linked Answer Questions 76 and 77:');q.code=q.code.replace('R6x','R6');}
 if(n===78||n===79){q.text=S`Statement for Linked Answer Questions 78 and 79:
Let $x_n$ denote the number of binary strings of length $n$ that contain no consecutive 0s.
`+(n===78?S`Which of the following recurrences does $x_n$ satisfy?`:S`The value of $x_5$ is`);if(n===79)q.optD='16';}
 if(n===80||n===81)q.text=subset+(n===80?S`Which of the following is valid for $2\le i\le n$ and $a_i\le j\le W$?`:'Which entry of the array X, if TRUE, implies that there is a subset whose elements sum to W?');
 if(n===82||n===83){q.diagram='q82-83-er';q.text='Statement for Linked Answer Questions 82 and 83:\nConsider the following ER diagram:\n[IMG_1]\n'+(n===82?'The minimum number of tables needed to represent M, N, P, R1, R2 is':'Which of the following is a correct attribute set for one of the tables for the correct answer to Question 82?\nQuestion 82 choices: (A) 2; (B) 3; (C) 4; (D) 5.');}
 if(n===84||n===85){q.text=q.text.replace('Linked Answers Q.2.20 and Q.2.21:','Statement for Linked Answer Questions 84 and 85:');q.code=book[99].code;if(n===85){q.optC='change line 6 to: if (Y[k] <= x) i = k; else j = k;';q.optD='change line 7 to: } while ((Y[k] == x) && (i < j));';}}
 return q;
}
