const S=String.raw;
// Indices in the immutable 2007 book-search snapshot; all full contents were compared with the selected scan.
export const bookMap={1:164,2:4,3:98,4:9,5:10,6:33,7:12,8:108,9:99,10:80,11:90,12:118,13:119,14:87,15:83,16:126,17:127,18:141,19:52,20:67,22:1,23:11,24:160,26:5,27:163,29:13,30:26,31:14,32:103,33:104,34:109,35:106,36:112,37:79,38:116,39:120,40:125,41:93,42:27,43:121,44:88,45:84,46:122,47:97,48:2,49:94,50:85,51:86,52:142,53:143,54:146,55:128,56:140,57:132,58:130,59:152,60:153,61:149,62:147,63:156,64:154,65:54,66:49,67:65,68:48,69:55,70:71,71:74,72:75,73:76,74:15,75:16,76:95,77:96,78:144,79:145,80:81,81:82,82:136,83:137,84:7,85:8};
export const additions={
21:{subject:'1. Discrete Maths',text:'How many different non-isomorphic Abelian groups of order 4 are there?',optA:'2',optB:'3',optC:'4',optD:'5'},
25:{subject:'11. Engg. Maths',text:S`Let $A$ be a $4\times4$ matrix with eigenvalues $-5,-2,1,4$. Which of the following is an eigenvalue of $\begin{bmatrix}A&I\\I&A\end{bmatrix}$, where $I$ is the $4\times4$ identity matrix?`,optA:'$-5$',optB:'$-7$',optC:'2',optD:'1'},
28:{subject:'11. Engg. Maths',text:S`Consider the series $x_{n+1}=\frac{x_n}{2}+\frac{9}{8x_n}$, $x_0=0.5$, obtained from the Newton-Raphson method. The series converges to`,optA:'1.5',optB:S`$\sqrt{2}$`,optC:'1.6',optD:'1.4'}
};
export function restoreSource(q,n,book){
 if(n===5){q.diagram='q5-dag';q.optB='1 3 2 4 5 6';q.optC='1 3 2 4 6 5';}
 if(n===10)q.text=q.text.replace('TAG, SET and WORD','TAG, LINE and WORD');
 if(n===12)q.optA='$2^h-1$';
 if(n===15)q.text=q.text.replace('segment of C code','segment of C-code');
 if(n===16){q.text='Group 1 contains some CPU scheduling algorithms and Group 2 contains some applications. Match entries in Group 1 to entries in Group 2.\nGroup 1: P. Gang Scheduling; Q. Rate Monotonic Scheduling; R. Fair Share Scheduling.\nGroup 2: 1. Guaranteed Scheduling; 2. Real-time Scheduling; 3. Thread Scheduling.';Object.assign(q,{optA:'P-3; Q-2; R-1',optB:'P-1; Q-2; R-3',optC:'P-2; Q-3; R-1',optD:'P-1; Q-3; R-2'});}
 if(n===26){q.text=q.text.replace(' [IMG_1]','');q.diagram='';for(const k of ['A','B','C','D'])q['opt'+k]='IMG:q26-'+k.toLowerCase();q.optLayout='2col';}
 if(n===27)q.text=S`Consider the set of (column) vectors defined by $X=\{x\in\mathbb R^3\mid x_1+x_2+x_3=0\}$, where $x^T=[x_1,x_2,x_3]^T$. Which of the following is TRUE?`;
 if(n===31)for(const k of ['A','B','C','D'])q['opt'+k]=q['opt'+k].replaceAll('^*','^+');
 if(n===32){q.text=S`Let $f(w,x,y,z)=\Sigma(0,4,5,7,8,9,13,15)$. Which of the following expressions are NOT equivalent to $f$?
(P) $x'y'z'+w'xy'+wy'z+xz$
(Q) $w'y'z'+wx'y'+xz$
(R) $w'y'z'+wx'y'+xyz+xy'z$
(S) $x'y'z'+wx'y'+w'y$`;Object.assign(q,{optA:'P only',optB:'Q and S',optC:'R and S',optD:'S only'});}
 if(n===33)q.text=q.text.replace("X*Y=XY+XY'","X*Y=XY+X'Y'");
 if(n===36)q.diagram='q36-counter';
 if(n===42){q.code='int f(int n) {\n    static int r = 0;\n    if (n <= 0) return 1;\n    if (n > 3) {\n        r = n;\n        return f(n-2)+2;\n    }\n    return f(n-1)+r;\n}';}
 if(n===46){q.code=q.code.replaceAll('leftchild','leftChild').replaceAll('rightchild','rightChild').replace('Value = 1','value = 1');q.optA='the number of nodes in the tree';}
 if(n===48)q.optB=q.optB.replace('for a which','for which');
 if(n===49)q.optB=q.optB.replace('by adding to T','by adding e to T').replace('by adding to $T$','by adding $e$ to $T$');
 if(n===51)q.code='int IsPrime(n)\n{\n    int i,n;\n    for (i=2; i <= sqrt(n); i++)\n        if (n%i == 0)\n        { printf("Not Prime\\n"); return 0; }\n    return 1;\n}';
 if(n===66){q.optC='$20$ metres of cable';q.optD='$50$ metres of cable';}
 if(n===68)q.text=q.text.replace('$11001001$','11001001');
 if(n>=71&&n<=73){q.text=q.text.replace('Common Data for Q.1.19 to Q.1.21:','Common Data for Questions 71, 72 and 73:');q.code=q.code.replace('MOV R2,M[R3]','MOV R2,(R3)').replace('HALT           ; Stop','HALT           ; Stop             ; 1');}
 if(n===74||n===75){q.diagram='q74-75-automaton';if(n===74)q.text=q.text.replace('Common Data for Q.1.45 & Q.1.46:','Common Data for Questions 74 and 75:').replace('Automation','Automaton');else q.text='Common Data for Questions 74 and 75:\nConsider the following Finite State Automaton:\n[IMG_1]\n'+q.text;}
 if(n===76||n===77){q.text=S`Statement for Linked Answer Questions 76 and 77:
Suppose the letters $a,b,c,d,e,f$ have probabilities $\frac12,\frac14,\frac18,\frac1{16},\frac1{32},\frac1{32}$, respectively.
`+(n===76?'Which of the following is the Huffman code for the letters a,b,c,d,e,f?':'Question 76 choices (in their original order):\n(A) 0,10,110,1110,11110,11111\n(B) 11,10,011,010,001,000\n(C) 11,10,01,001,0001,0000\n(D) 110,100,010,000,001,111\nWhat is the average length of the correct answer to Question 76?');if(n===76)Object.assign(q,{optA:'0, 10, 110, 1110, 11110, 11111',optB:'11, 10, 011, 010, 001, 000',optC:'11, 10, 01, 001, 0001, 0000',optD:'110, 100, 010, 000, 001, 111'});else q.optD='1.9375';}
 if(n===78||n===79){q.text='Statement for Linked Answer Questions 78 and 79:\n'+q.text;q.text=q.text.replace(S`\begin{array}{l}S\to bA\qquad S\to aB \\ A\to a\qquad B\to b \\ A\to aS\qquad B\to bS \\ A\to bAA\qquad B\to aBB\end{array}`,S`\begin{array}{ll}S\to aB&S\to bA\\B\to b&A\to a\\B\to bS&A\to aS\\B\to aBB&A\to bAA\end{array}`);if(n===79)q.text=q.text.replace('Q2.22 choices:','Question 78 choices:').replace('above question (2.22)','Question 78');}
 if(n===80||n===81){q.text=q.text.replace('Common Data for Q.4.23 & Q.4.24:','Statement for Linked Answer Questions 80 and 81:');if(n===81)q.text=q.text.replace('in accessing the array','in accessing the array for the second time?');}
 if(n===82||n===83)q.text='Statement for Linked Answer Questions 82 and 83:\n'+q.text;
 if(n===84)q.text='Statement for Linked Answer Questions 84 and 85:\n'+q.text;
 if(n===85)q.text='Statement for Linked Answer Questions 84 and 85:\n'+book[7].text.slice(0,book[7].text.indexOf('How many'))+'\n'+q.text;
 return q;
}
