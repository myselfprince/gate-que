const raw = String.raw;
const sourceHash = '938e1832c310c1ec6db3b9f95fa54c67db0c15817df326c3467b55f52ee81e61';

function question(number, year, marks, text, options = [], extra = {}) {
  const {notes = [], ...fields} = extra;
  const bookPages = number === 8 ? [472,473] : [number <= 7 ? 472 : 473];
  return {
    id: `madeeasy-algorithms-dynamic-4-${number}`, text, code: '', year: String(year), marks: String(marks), setNum: '',
    rawTopic: 'Dynamic Programming', diagram: '', ext: '.png',
    optA: options[0] || '', optB: options[1] || '', optC: options[2] || '', optD: options[3] || '',
    questionType: options.length ? 'MCQ' : 'NAT', correctOptions: [], natAnswer: '',
    isBlank: false, isPosLocked: false, isCodeOptions: false, isProof: false,
    needsManualOptionFix: false, optLayout: 'auto', tempPaste: '', ...fields,
    source: {
      file: '7. Algorithms/4. Dynamic Prog.pdf', sha256: sourceHash, questionNumber: `4.${number}`,
      bookPages, pdfPages: [1], answerKeyPdfPage: null, answerKeyStatus: 'not-supplied',
      notes: ['Both supplied scanned spreads were visually reviewed. Dynamic Programming Q4.1-Q4.14 occupy PDF page 1 / book pages 472-473. PDF page 2 is the next chapter, P and NP Concepts (book pages 476-477), whose key does not answer this chapter. No Dynamic Programming answer key is supplied; answer intentionally left empty.', ...notes],
    },
  };
}

const common56 = raw`Linked Answers Questions 4.5 and 4.6
The subset-sum problem is defined as follows. Given a set of $n$ positive integers, $S=\{a_1,a_2,a_3,\ldots,a_n\}$ and a positive integer $W$ is there a subset $S'$ whose elements sum of $W$? A dynamic program for solving this problem uses a 2-dimensional Boolean array, $Y$ with $n$ rows and $W-1$ columns $X[i,j]$, $1\le i\le n$, $0\le j\le W$, is TRUE if and only if there is a subset of $\{a_1,a_2,\ldots,a_i\}$ whose elements sum to $j$.
`;
const subsetNote = 'The linked passage is printed with array Y, then X[i,j], and W-1 columns despite indices 0 through W. These inconsistencies and the printed phrase "sum of W" are preserved; no repair is inferred.';
const common78 = raw`Common Data for Question 4.7 and 4.8
A subsequence of a given sequence is just the given sequence with some elements (possibly none or all) left out. We are given two sequences $X[m]$ and $Y[n]$ of lengths $m$ and $n$, respectively, with indexes of $X$ and $Y$ starting from 0.
`;
const recurrence7 = raw`We wish to find the length of the longest common subsequence (LCS) of $X[n]$ and $Y[n]$ as $l(m,n)$, where an incomplete recursive definition for the function $l(i,j)$ to compute the length of the LCS of $X[m]$ and $Y[n]$ is given below:
$$l(i,j)=\begin{cases}
0, & \text{if either }i=0\text{ or }j=0,\\
\mathrm{expr1}, & \text{if }i,j>0\text{ and }x[i-1]=Y[j-1],\\
\mathrm{expr2}, & \text{if }i,j>0\text{ and }x[i-1]\ne Y[j-1].
\end{cases}$$
`;
const lcsNote = 'The Q4.7 stem prints X[n] where the shared passage gives X[m], and lower-case x in the recurrence. The printed notation is retained.';

const questions = [
  question(1,1998,1,'Which one of the following algorithm design techniques is used in finding all pairs of shortest distances in a graph?',[
    'Dynamic programming','Backtracking','Greedy','Divide and Conquer',
  ]),
  question(2,2004,2,raw`Two matrices $M_1$ and $M_2$ are to be stored in arrays $A$ and $B$ respectively. Each array can be stored either in row-major or column-major order in contiguous memory locations. The time complexity of an algorithm to compute $M_1\times M_2$ will be`,[
    'best if A is in row-major, and B is in column-major order',
    'best if both are in row-major order',
    'best if both are in column-major order',
    'independent of the storage scheme',
  ]),
  question(3,2008,2,'A B-tree of order 4 is built from scratch by 10 successive insertions. What is the maximum number of node splitting operations that may take place?',[
    '3','4','5','6',
  ],{notes:['This B-tree question is printed as Q4.3 in Dynamic Programming and is retained in the source chapter and order.']}),
  question(4,2008,2,raw`The subset-sum problem is defined as follows:
Given a set $S$ of $n$ positive integers and a positive integer $W$; determine whether there is a subset of $S$ whose elements sum to $W$.
An algorithm $Q$ solves this problem in $O(nW)$ time. Which of the following statements is false?`,[
    raw`$Q$ solves the subset-sum problem in polynomial time when the input is encoded in unary`,
    raw`$Q$ solves the subset-sum problem in polynomial time when the input is encoded in binary`,
    'The subset sum problem belongs to the class NP',
    'The subset sum problem in NP-hard',
  ]),
  question(5,2008,2,common56+raw`Which of the following is valid for $2\le i\le n$ and $a_i\le j\le W$?`,[
    raw`$X[i,j]=X[i-1,j]\lor X[i,j-a_i]$`,
    raw`$X[i,j]=X[i-1,j]\lor X[i-1,j-a_i]$`,
    raw`$X[i,j]=X[i-1,j]\land X[i,j-a_i]$`,
    raw`$X[i,j]=X[i-1,j]\land X[i-1,j-a_i]$`,
  ],{notes:[subsetNote]}),
  question(6,2008,2,common56+raw`Which entry of the array $X$, if TRUE, implies that there is a subset whose elements sum to $W$?`,[
    raw`$X[1,W]$`,raw`$X[n,0]$`,raw`$X[n,W]$`,raw`$X[n-1,n]$`,
  ],{notes:[subsetNote,'Option D is printed X[n-1,n] and is transcribed without changing the second index.']}),
  question(7,2009,2,common78+recurrence7+'Which one of the following options is correct?',[
    raw`$\mathrm{expr1}\equiv l(i-1,j)+1$`,
    raw`$\mathrm{expr1}\equiv l(i,j-1)$`,
    raw`$\mathrm{expr2}\equiv\max\bigl(l(i-1,j),l(i,j-1)\bigr)$`,
    raw`$\mathrm{expr2}\equiv\max\bigl(l(i-1,j-1),l(i,j)\bigr)$`,
  ],{notes:[lcsNote]}),
  question(8,2009,2,common78+recurrence7+raw`The values of $l(i,j)$ could be obtained by dynamic programming based on the correct recursive definition of $l(i,j)$ of the form given above, using an array $L[M,N]$, where $M=m+1$ and $N=n+1$, such that $L[i,j]=l(i,j)$.
Which one of the following statements would be TRUE regarding the dynamic programming solution for the recursive definition of $l(i,j)$?`,[
    raw`All elements of $L$ should be initialized to 0 for the values of $l(i,j)$ to be properly computed`,
    raw`The values of $l(i,j)$ may be computed in a row major order or column major order of $L[M,N]$`,
    raw`The values of $l(i,j)$ cannot be computed in either row major order or column major order of $L[M,N]$`,
    raw`$L[p,q]$ needs to be computed before $L[r,s]$ if either $p<r$ or $q<s$`,
  ],{notes:[lcsNote,'The stem begins on book page 472; all four options continue at the top of book page 473. The shared passage and Q4.7 recurrence are repeated here to keep the dependent question self-contained.']}),
  question(9,2011,1,raw`An algorithm to find the length of the longest monotonically increasing sequence of numbers in an array $A[0:n-1]$ is given below.
Let $L_i$ denotes the length of the longest monotonically increasing sequence starting at index $i$ in the array
Initialize $L_{n-1}=1$
For all $i$ such that $0\le i\le n-2$
$$L_i=\begin{cases}1+L_{i+1}, & \text{If }A[i]<A[i+1]\\1, & \text{Otherwise}\end{cases}$$
Finally the length of the longest monotonically increasing sequence is $\operatorname{Max}(L_0,L_1,\ldots,L_{n+1})$.
Which of the following statements is TRUE?`,[
    'The algorithm uses dynamic programming paradigm',
    'The algorithm has a linear complexity and uses branch and bound paradigm',
    'The algorithm has a non-linear polynomial complexity and uses branch and bound paradigm',
    'The algorithm uses divide and conquer paradigm',
  ],{notes:['The printed final Max expression ends in L_(n+1), despite the earlier array range 0:n-1. This printed index is retained. The displayed recurrence is editable mathematics, not a program listing.']}),
  question(10,2013,1,raw`What is the time complexity of Bellman-Ford single-source shortest path algorithm on a complete graph of $n$ vertices?`,[
    raw`$\Theta(n^2)$`,raw`$\Theta(n^2\log n)$`,raw`$\Theta(n^3)$`,raw`$\Theta(n^3\log n)$`,
  ]),
  question(11,2014,2,raw`Consider two strings $A=\text{"qpqrr"}$ and $B=\text{"pqprqrp"}$. Let $x$ be the length of the longest common subsequence (not necessarily contiguous) between $A$ and $B$ and let $y$ be the number of such longest common subsequences between $A$ and $B$. Then $x+10y=$ ________.`,[],{setNum:'2'}),
  question(12,2016,2,raw`Consider the weighted undirected graph given by with 4 vertices, where the weight of edge $\{i,j\}$ is the entry $W_{ij}$ in the matrix $W$.
$$W=\begin{bmatrix}0&2&8&5\\2&0&5&8\\8&5&0&x\\5&8&x&0\end{bmatrix}$$
The largest possible integer value of $x$, for which at least one shortest path between some pair of vertices will contain the edge with weight $x$ is ________.`,[],{setNum:'1',notes:['The printed opening "graph given by with 4 vertices" is retained. The matrix is editable LaTeX, not a diagram crop.']}),
  question(13,2016,2,raw`Let $A_1$, $A_2$, $A_3$ and $A_4$ be four matrices of dimensions $10\times5$, $5\times20$, $20\times10$, and $10\times5$, respectively. The minimum number of scalar multiplications required to find the product $A_1A_2A_3A_4$ using the basic matrix multiplication method is ________.`,[],{setNum:'2'}),
  question(14,2018,2,raw`Assume that multiplying a matrix $G_1$ of dimension $p\times q$ with another matrix $G_2$ of dimension $q\times r$ requires $pqr$ scalar multiplications. Computing the product of $n$ matrices $G_1G_2G_3\ldots G_n$ can be done by parenthesizing in different ways. Define $G_iG_{i+1}$ as an explicitly computed pair for a given parenthesization if they are directly multiplied. For example, in the matrix multiplication chain $G_1G_2G_3G_4G_5G_6$ using parenthesization $(G_1(G_2G_3))(G_4(G_5G_6))$, $G_2G_3$ and $G_5G_6$ are the only explicitly computed pairs.
Consider a matrix multiplication chain $F_1F_2F_3F_4F_5$, where matrices $F_1$, $F_2$, $F_3$, $F_4$ and $F_5$ are of dimensions $2\times25$, $25\times3$, $3\times16$, $16\times1$ and $1\times1000$, respectively. In the parenthesization of $F_1F_2F_3F_4F_5$ that minimizes the total number of scalar multiplications, the explicitly computed pairs are`,[
    raw`$F_1F_2$, $F_3F_4$ only`,raw`$F_2F_3$ only`,raw`$F_3F_4$ only`,raw`$F_1F_2$, $F_4F_5$ only`,
  ]),
];

export const DYNAMIC_PROGRAMMING_IMPORT = {
  subject: '7. Algorithms', chapter: '4. Dynamic Programming', sourceHash, questions,
};
