const raw=String.raw;
const sourceHash='fae38049bc4f47e237f9ba4378bc2182f7eb8815c95f306f4666689e6df95bb0';
const answers=['C','D','B','B','D','D','D','B','D','D','A','B','C','B','D','C','B','B','C','C','150','C','C','C','C'];
function question(n,year,marks,text,options=[],extra={}) {
  const {notes=[],...fields}=extra;
  return {id:`madeeasy-algorithms-miscellaneous-6-${n}`,text,code:'',year:String(year),marks:String(marks),setNum:'',
    rawTopic:'Miscellaneous Topics',diagram:'',ext:'.png',optA:options[0]||'',optB:options[1]||'',optC:options[2]||'',optD:options[3]||'',
    questionType:options.length?'MCQ':'NAT',correctOptions:options.length?[answers[n-1]]:[],natAnswer:options.length?'':answers[n-1],
    isBlank:false,isPosLocked:false,isCodeOptions:false,isProof:false,needsManualOptionFix:false,optLayout:'auto',tempPaste:'',...fields,
    source:{file:'7. Algorithms/6. Muscellaneous Topics.pdf',sha256:sourceHash,questionNumber:`6.${n}`,
      bookPages:[n<=9?478:n<=19?479:480],pdfPages:[n<=19?1:2],answerKeyPdfPage:2,
      notes:['Both supplied scanned spreads visually reviewed. Questions occupy book pages 478-480; the Answers / Miscellaneous Topics key is on PDF page 2, book page 481. Explanations below the key are excluded.',...notes]}};
}
const shared=raw`Common Data for Q. 6.8 & Q. 6.9
In a permutation $a_1\ldots a_n$ of $n$ distinct integers, an inversion is a pair $(a_i,a_j)$ such that $i<j$ and $a_i>a_j$.
`;
const questions=[
  question(1,1996,2,raw`The minimum number of interchanges needed to convert the array
89, 19, 40, 17, 12, 10, 2, 5, 7, 11, 6, 9, 70 into a heap with maximum element at the root is`,['0','1','2','3']),
  question(2,1996,2,raw`The average number of key comparisons done on a successful sequential search in list of length $n$ is`,[raw`$\log n$`,raw`$\frac{n-1}{2}$`,raw`$\frac{n}{2}$`,raw`$\frac{n+1}{2}$`]),
  question(3,1997,1,raw`The correct matching for the following pairs is
List-I
A. All pairs shortest paths
B. Quick Sort
C. Minimum weight spanning tree
D. Connected Components
List-II
1. Greedy
2. Depth-First search
3. Dynamic Programming
4. Divide and Conquer
Codes:`,['A - 2 B - 4 C - 1 D - 3','A - 3 B - 4 C - 1 D - 2','A - 3 B - 4 C - 2 D - 1','A - 4 B - 1 C - 2 D - 3'],{optLayout:'1col'}),
  question(4,1998,1,raw`Give the correct matching for the following pairs:
$$\begin{array}{ll}\text{List-I}&\text{List-II}\\\text{A. }O(\log n)&\text{P. Selection}\\\text{B. }O(n)&\text{Q. Insertion sort}\\\text{C. }O(n\log n)&\text{R. Binary search}\\\text{D. }O(n^2)&\text{S. Merge sort}\end{array}$$
Codes:`,['A - R B - P C - Q D - S','A - R B - P C - S D - Q','A - P B - R C - S D - Q','A - P B - S C - R D - Q'],{optLayout:'1col'}),
  question(5,1999,1,raw`Suppose we want to arrange the $n$ numbers stored in an array such that all negative values occur before all positive ones. Minimum number of exchanges required in the worst case is`,[raw`$n-1$`,'n',raw`$n+1$`,'None of these'],{notes:['Stem continues from the bottom of the first column to the top of the second column on book page 478.']}),
  question(6,1999,1,'The number of articulation points of the following graph is\n[IMG_1]',['0','1','2','3'],{diagram:'miscellaneous-6-6-graph'}),
  question(7,1999,2,raw`If $T_1=O(1)$, give the correct matching for the following pairs:
$$\begin{array}{ll}\text{(m) }T_n=T_{n-1}+n&\text{(u) }T_n=O(n)\\\text{(n) }T_n=T_{\frac{n}{2}}+n&\text{(v) }T_n=O(n\log n)\\\text{(o) }T_n=T_{n/2}+n\log n&\text{(w) }T_n=O(n^2)\\\text{(p) }T_n=T_{n-1}+\log n&\text{(x) }T_n=O(\log^2 n)\end{array}$$`,[
    'm - w, n - v, o - u, p - x','m - w, n - u, o - x, p - v','m - v, n - w, o - x, p - u','m - w, n - u, o - v, p - v',
  ],{optLayout:'1col',notes:['Recurrence (n) prints the subscript n/2 as a stacked fraction. Option D repeats v for o and p, and candidate (x) is O(log^2 n); key marks D. Printed options and key retained without inferring corrections.']}),
  question(8,2003,2,shared+raw`If all permutations are equally likely, what is the expected number of inversions in a randomly chosen permutation of $1\ldots n$?`,[
    raw`$\frac{n(n-1)}{2}$`,raw`$\frac{n(n-1)}{4}$`,raw`$\frac{n(n+1)}{4}$`,raw`$2n\lfloor\log_2 n\rfloor$`,
  ]),
  question(9,2003,2,shared+raw`What would be the worst case time complexity of the insertion sort algorithm, if the inputs are restricted to permutations of $1\ldots n$ with at most $n$ inversions?`,[
    raw`$\Theta(n^2)$`,raw`$\Theta(n\log n)$`,raw`$\Theta(n^{1.5})$`,raw`$\Theta(n)$`,
  ]),
  question(10,2004,2,'Suppose each set is represented as a linked list with elements in arbitrary order. Which of the operations among union, intersection, membership, cardinality will be the slowest?',[
    'union only','intersection, membership','membership, cardinality','union, intersection',
  ]),
  question(11,2004,2,raw`A program takes as input a balanced binary search tree with $n$ leaf nodes and computes the value of a function $g(x)$ for each node $x$. If the cost of computing $g(x)$ is min(number of leaf-nodes in left-subtree of $x$, number of leaf-nodes in right-subtree of $x$) then the worst case time complexity of the program is`,[
    raw`$\Theta(n)$`,raw`$O(n\log n)$`,raw`$O(n)^2$`,raw`$O(2^n)$`,
  ],{notes:['Option C is printed O(n)^2 and key marks A. Source wording, asymptotic symbols and key retained for review.']}),
  question(12,2006,1,raw`A scheme for storing binary trees in an array $X$ is as follows. Indexing of $X$ starts at 1 instead of 0. The root is stored at $X[1]$. For a node stored at $X[i]$, the left child, if any, is stored in $X[2i]$ and the right child, if any, in $X[2i+1]$. To be able to store any binary tree on $n$ vertices, the minimum size of $X$ should be`,[
    raw`$\log_2 n$`,'n',raw`$2n+1$`,raw`$2n$`,
  ],{notes:['The source visibly prints option B as n (no exponent); answer key marks B. The general-tree statement and printed options appear inconsistent; preserved without replacing B by an inferred exponential expression.']}),
  question(13,2006,1,'Which one the following inplace sorting algorithms needs the minimum number of swaps?',['Quicksort','Insertion sort','Selection sort','Heap sort']),
  question(14,2006,1,raw`An element in an array $X$ is called a leader if it is greater than all the elements to the right of it in $X$. The best algorithm to find all leaders in an array.`,[
    'Solves it in linear time using a left to right pass of the array',
    'Solves in linear time using a right to left pass',
    raw`Solves it is using divide and conquer in time $\Theta(n\log n)$`,raw`Solves it in time $\Theta(n^2)$`,
  ],{optLayout:'1col'}),
  question(15,2006,2,raw`A set $X$ can be represented by an array $x[n]$ as follows:
$$x[i]=\begin{cases}1;&\text{if }i\in X\\0;&\text{otherwise}\end{cases}$$
Consider the following algorithm in which $x$, $y$, and $z$ are boolean arrays of size $n$:
[CODE]
The set $Z$ computed by the algorithm is`,[
    raw`$(X\cup Y)$`,raw`$(X\cap Y)$`,raw`$(X-Y)\cap(Y-X)$`,raw`$(X-Y)\cup(Y-X)$`,
  ],{code:raw`algorithm zzz (x[ ], y[ ], z[ ])
{
    int i;
    for (i = 0; i < n; ++ i)
        z[i] = (x[i] /\ ~y[i]) \/ (~x[i] /\ y[i]);
}`,notes:['Algorithm header is at the bottom of the first column; body and options continue at the top of the second column on book page 479. Printed logical wedge/vee are represented in the separate editable code field by /\\ and \\/ respectively; no executable-language operator is inferred.']}),
  question(16,2006,2,raw`Given two arrays of numbers $a_1,\ldots,a_n$ and $b_1,\ldots,b_n$ where each number is 0 or 1, the fastest algorithm to find the largest span $(i,j)$ such that $a_i+a_{i+1}+\ldots+a_j=b_i+b_{i+1}+\ldots+b_j$, or report that there is no such span,`,[
    raw`Takes $O(3^n)$ and $\Omega(2^n)$ time if hashing is permitted`,
    raw`Takes $O(n^3)$ and $\Omega(n^{2.5})$ time in the key comparison model`,
    raw`Takes $\Theta(n)$ time and space`,raw`Takes $O(\sqrt{n})$ time only if the sum of the $2n$ elements is an even number`,
  ],{optLayout:'1col'}),
  question(17,2006,2,'Which of the following is the correct decomposition of the directed graph given below into its strongly connected components?\n[IMG_1]',[
    raw`$\{P,Q,R,S\},\{T\},\{U\},\{V\}$`,raw`$\{P,Q,R,S,T,V\},\{U\}$`,raw`$\{P,Q,S,T,V\},\{R\},\{U\}$`,raw`$\{P,Q,R,S,T,U,V\}$`,
  ],{diagram:'miscellaneous-6-17-graph',optLayout:'1col'}),
  question(18,2008,2,raw`If we use Radix Sort to sort $n$ integers in the range $(n^{k/12},n^k]$, for some $k>0$ which is independent of $n$, the time taken would be`,[
    raw`$\Theta(n)$`,raw`$\Theta(kn)$`,raw`$\Theta(n\log n)$`,raw`$\Theta(n^2)$`,
  ]),
  question(19,2013,2,raw`The number of elements that can be sorted in $\Theta(\log n)$ time using heap sort is`,[
    raw`$\Theta(1)$`,raw`$\Theta(\sqrt{\log n})$`,raw`$\Theta\left(\frac{\log n}{\log\log n}\right)$`,raw`$\Theta(\log n)$`,
  ]),
  question(20,2014,1,'Consider the directed graph given below:\n[IMG_1]\nWhich one of the following is TRUE?',[
    'The graph does not have any topological ordering.','Both PQRS and SRQP are topological orderings.','Both PSRQ and SPRQ are topological orderings.','PSRQ is the only topological ordering.',
  ],{setNum:'1',diagram:'miscellaneous-6-20-graph',optLayout:'1col'}),
  question(21,2014,2,raw`Suppose you want to move from 0 to 100 on the number line. In each step, you either move right by a unit distance or you take a shortcut. A shortcut is simply a pre-specified pair of integers $i,j$ with $i<j$. Given a shortcut $i,j$ if you are at position $i$ on the number line, you may directly move to $j$. Suppose $T(k)$ denotes the smallest number of steps needed to move from $k$ to 100. Suppose further that there is at most 1 shortcut involving any number, and in particular from 9 there is a shortcut to 15.
Let $y$ and $z$ be such that $T(9)=1+\min(T(y),T(z))$. Then the value of the product $yz$ is ________.`,[],{setNum:'3'}),
  question(22,2015,1,raw`Match the following:
List-I
A. Prim's algorithm for minimum spanning tree
B. Floyd-Warshall algorithm for all pairs shortest paths
C. Mergesort
D. Hamiltonian circuit
List-II
1. Backtracking
2. Greedy method
3. Dynamic programming
4. Divide and conquer
Codes (A, B, C, D):`,['3, 2, 4, 1','1, 2, 4, 3','2, 3, 4, 1','2, 1, 3, 4'],{setNum:'1'}),
  question(23,2015,2,raw`Given below are some algorithms, and some algorithm design paradigms.
List-I
A. Dijkstra's Shortest Path
B. Floyd-Warshall algorithm to compute all pairs shortest path
C. Binary search on a sorted array
D. Backtracking search on a graph
List-II
1. Divide and Conquer
2. Dynamic Programming
3. Greedy design
4. Depth-first search
5. Breadth-first search
Match the above algorithms (List-I) to the corresponding design paradigm (List-II) they follow.
Codes (A, B, C, D):`,['1, 3, 1, 5','3, 3, 1, 5','3, 2, 1, 4','3, 2, 1, 5'],{setNum:'2'}),
  question(24,2017,1,raw`Consider the following table:
$$\begin{array}{|l|l|}\hline\text{Algorithms}&\text{Design Paradigms}\\\hline\text{(P) Kruskal}&\text{(i) Divide and Conquer}\\\hline\text{(Q) Quicksort}&\text{(ii) Greedy}\\\hline\text{(R) Floyd-Warshall}&\text{(iii) Dynamic Programming}\\\hline\end{array}$$
Match the algorithms to the design paradigms they are based on.`,[
    raw`$(P)\leftrightarrow(ii),\ (Q)\leftrightarrow(iii),\ (R)\leftrightarrow(i)$`,
    raw`$(P)\leftrightarrow(iii),\ (Q)\leftrightarrow(i),\ (R)\leftrightarrow(ii)$`,
    raw`$(P)\leftrightarrow(ii),\ (Q)\leftrightarrow(i),\ (R)\leftrightarrow(iii)$`,
    raw`$(P)\leftrightarrow(i),\ (Q)\leftrightarrow(ii),\ (R)\leftrightarrow(iii)$`,
  ],{setNum:'1',optLayout:'1col'}),
  question(25,2016,1,'The Floyd-Warshall algorithm for all-pair shortest paths computation is based on',[
    'Greedy paradigm','Divide-and-conquer paradigm','Dynamic Programming paradigm','Neither Greedy nor Divide-and-Conquer nor Dynamic Programming paradigm.',
  ],{setNum:'2',optLayout:'1col'}),
];
export const ALGORITHMS_MISCELLANEOUS_IMPORT={subject:'7. Algorithms',chapter:'6. Miscellaneous Topics',sourceHash,questions};
