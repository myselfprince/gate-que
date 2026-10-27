const raw = String.raw;
const sourceHash = 'b626ea3c6f9591e887dc07217525a86f18e041edef3adfe2ecd42324a56e6492';
// Transcribed from the complete printed key on PDF page 5, book page 425.
const answers = ['BD','C','B','D','D','A','C','A','B','C','C','C','C','D','A','D','D','C','C','B','B','C','B','D','D','B','B','A','A','D','B','B','C','A','A','C','C','D','B','A','110','D','A','A','D','C','D','2.32','C','C','B','C','B','5','D','B','B','C','A','B','A','AC','AD','BD','C','A','3','D'];

function question(number, year, marks, text, options = [], extra = {}) {
  const {notes = [], ...fields} = extra;
  let bookPages = [number <= 10 ? 417 : number <= 19 ? 418 : number <= 29 ? 419 : number <= 39 ? 420 : number <= 47 ? 421 : number <= 56 ? 422 : number <= 64 ? 423 : 424];
  if ([20,21].includes(number)) bookPages = [418,419];
  if (number === 48) bookPages = [421,422];
  const answer = answers[number-1];
  return {
    id: `madeeasy-algorithms-analysis-1-${number}`, text, code: '', year: String(year), marks: String(marks), setNum: '',
    rawTopic: 'Algorithm Analysis and Asymptotic Notations', diagram: '', ext: '.png',
    optA: options[0] || '', optB: options[1] || '', optC: options[2] || '', optD: options[3] || '',
    questionType: options.length ? answer.length > 1 ? 'MSQ' : 'MCQ' : 'NAT',
    correctOptions: options.length ? [...answer] : [], natAnswer: options.length ? '' : answer,
    isBlank: false, isPosLocked: false, isCodeOptions: false, isProof: false,
    needsManualOptionFix: false, optLayout: 'auto', tempPaste: '', ...fields,
    source: {
      file: '7. Algorithms/1. Algo. Analysis and Asymptotic Notations.pdf', sha256: sourceHash, questionNumber: `1.${number}`,
      bookPages, pdfPages: [...new Set(bookPages.map(page => Math.floor((page-416)/2)+1))],
      answerKeyPdfPage: 5,
      notes: ['Answer transcribed from the printed chapter key, PDF page 5 / book page 425.', ...notes],
    },
  };
}

const common20 = `Common Data for Q.1.20 & Q.1.21:
Consider the following C function:
[CODE]
`;
const code20 = `double foo(int n)
{
  int i;
  double sum;
  if (n == 0) return 1.0;
  else {
    sum = 0.0;
    for (i = 0; i < n; i++)
      sum += foo(i);
    return sum;
  }
}`;
const common32 = `Common Data Questions Q.1.32 and Q.1.33:
Consider the following C functions:
[CODE]
`;
const code32 = `int f1(int n)
{
  if (n == 0 || n == 1) return n;
  else return (2 * f1(n-1) + 3 * f1(n-2));
}
int f2(int n)
{
  int i;
  int X[N], Y[N], Z[N];
  X[1] = 1; Y[1] = 2; Z[1] = 3;
  for (i = 2; i <= n; i++) {
    X[i] = Y[i-1] + Z[i-2];
    Y[i] = 2 * X[i];
    Z[i] = 3 * X[i];
  }
  return X[n];
}`;

export const ALGORITHMS_ANALYSIS_IMPORT = {
  subject: '7. Algorithms', chapter: '1. Algo. Analysis and Asymptotic Notations', sourceHash,
  questions: [
    question(1,1996,1,'Which of the following is false?',[
      raw`$100n\log n=O\!\left(\frac{n\log n}{100}\right)$`,raw`$\sqrt{\log n}=O(\log\log n)$`,
      raw`If $0<x<y$ then $n^x=O(n^y)$`,raw`$2n\ne O(nk)$`,
    ],{notes:['The printed key gives B and D; this historical multiple-answer question is stored as MSQ. Products 2n and nk in option D are retained as printed.']}),
    question(2,1997,1,raw`The concatenation of two lists is to be performed in $O(1)$ time. Which of the following implementations of a list should be used?`,[
      'Singly linked list','Doubly linked list','Circular doubly linked list','Array implementation of list',
    ]),
    question(3,2001,1,raw`Let $f(n)=n^2\log n$ and $g(n)=n(\log n)^{10}$ be two positive functions of $n$. Which of the following statements is correct?`,[
      raw`$f(n)=O(g(n))$ and $g(n)\ne O(f(n))$`,raw`$g(n)=O(f(n))$ and $f(n)\ne O(g(n))$`,
      raw`$f(n)\ne O(g(n))$ and $g(n)\ne O(f(n))$`,raw`$f(n)=O(g(n))$ and $g(n)=O(f(n))$`,
    ]),
    question(4,2002,1,raw`In the worst case, the number of comparisons needed to search singly linked list of length $n$ for a given element is`,[
      raw`$\log_2 n$`,raw`$\frac{n}{2}$`,raw`$\log_2 n-1$`,'$n$',
    ]),
    question(5,2002,2,raw`Consider the following functions:
$f(n)=3n^{\sqrt n}$
$g(n)=2^{\sqrt n\log_2 n}$
$h(n)=n!$
Which of the following is true?`,[
      '$h(n)$ is $O(f(n))$','$h(n)$ is $O(g(n))$','$g(n)$ is not $O(f(n))$','$f(n)$ is $O(g(n))$',
    ]),
    question(6,2002,2,raw`Consider the following algorithm for searching for a given number $x$ in an unsorted array $A[1\ldots n]$ having $n$ distinct values:
[CODE]
Assuming that $x$ is present on $A$, what is the expected number of comparisons made by the algorithm before it terminates?`,['$n$','$n-1$','$2n$',raw`$\frac{n}{2}$`],{code:'1. Choose an i uniformly at random from 1...n;\n2. If A[i] = x then Stop else Goto 1;'}),
    question(7,2002,2,raw`The running time of the following algorithm
[CODE]
is best described by`,['$O(n)$',raw`$O(\log n)$`,raw`$O(\log\log n)$`,'$O(1)$'],{code:'Procedure A(n)\nIf n <= 2 return (1) else return (A(ceil(sqrt(n))));',notes:['The ceiling brackets around sqrt(n) are represented by ceil(sqrt(n)) in the separate code field.']}),
    question(8,2003,1,raw`Consider the following three claims
1. $(n+k)^m=\Theta(n^m)$, where $k$ and $m$ are constants
2. $2^{n+1}=O(2^n)$
3. $2^{2n+1}=O(2^n)$
Which of these claims are correct?`,['1 and 2','1 and 3','2 and 3','1, 2 and 3']),
    question(9,2003,1,`Consider the following C function:
[CODE]
For large values of $y$, the return value of the function best approximates`,[
      '$x^y$','$e^x$',raw`$\ln(1+x)$`,'$x^x$',
    ],{code:`float f(float x, int y)
{
  float p, s; int i;
  for (s = 1, p = 1, i = 1; i < y; i++) {
    p *= x/i;
    s += p;
  }
  return s;
}`}),
    question(10,2003,2,raw`The cube root of a natural number $n$ is defined as the largest natural number $m$ such that $m^3\le n$. The complexity of computing the cube root of $n$ ($n$ is represented in binary notation) is`,[
      '$O(n)$ but not $O(n^{0.5})$',raw`$O(n^{0.5})$ but not $O((\log n)^k)$ for any constant $k>0$.`,
      raw`$O((\log n)^k)$ for some constant $k>0$, but not $O((\log\log n)^m)$ for any constant $m>0$`,
      raw`$O((\log\log n)^k)$ for some constant $k>0.5$, but not $O((\log\log n)^{0.5})$`,
    ]),
    question(11,2004,1,'The tightest lower bound on the number of comparisons, in the worst case, for comparison-based sorting is of the order of',[
      '$n$','$n^2$',raw`$n\log n$`,raw`$n\log^2 n$`,
    ]),
    question(12,2004,2,raw`What does the following algorithm approximate? (Assume $m>1$, $\varepsilon>0$).
[CODE]`,[raw`$\log m$`,'$m^2$','$m^{1/2}$','$m^{1/3}$'],{code:`x = m;
y = 1;
while (x - y > epsilon) {
  x = (x+y)/2;
  y = m/x;
}
print(x);`,notes:['The source epsilon is spelled epsilon in the editable code field; its meaning is preserved in the question.']}),
    question(13,2004,2,raw`Let $A[1,\ldots,n]$ be an array storing a bit (1 or 0) at each location, and $f(m)$ is a function whose time complexity is $\Theta(m)$. Consider the following program fragment written in a C like language:
[CODE]
The complexity of this program fragment is`,[raw`$\Omega(n^2)$`,raw`$\Omega(n\log n)$ and $O(n^2)$`,raw`$\Theta(n)$`,raw`$O(n\log n)$`],{code:`counter = 0;
for (i = 1; i < n; i++) {
  if (A[i] == 1) counter++;
  else {
    f(counter);
    counter = 0;
  }
}`}),
    question(14,2004,2,`The time complexity of the following C function is (assume $n>0$)
[CODE]`,[
      '$O(n)$',raw`$O(n\log n)$`,'$O(n^2)$','$O(2^n)$',
    ],{code:`int recursive(int n)
{
  if (n == 1) return (1);
  else return (recursive(n-1) + recursive(n-1));
}`}),
    question(15,2004,2,raw`The recurrence equation:
$T(1)=1$
$T(n)=2T(n-1)+n$, $n\ge2$
evaluates to`,['$2^{n+1}-n-2$','$2^n-n$','$2^{n+1}-2n-2$','$2^n+n$']),
    question(16,2004,2,raw`Let $f(n)$, $g(n)$ and $h(n)$ be functions defined for positive integers such that $f(n)=O(g(n))$, $g(n)\ne O(f(n))$, $g(n)=O(h(n))$, and $h(n)=O(g(n))$. Which one of the following statements is FALSE?`,[
      '$f(n)+g(n)=O(h(n))+h(n)$','$f(n)=O(h(n))$',raw`$h(n)\ne O(f(n))$`,raw`$f(n)h(n)\ne O(g(n)h(n))$`,
    ]),
    question(17,2005,1,'The time complexity of computing the transitive closure of a binary relation on a set of $n$ elements is known to be',[
      '$O(n)$',raw`$O(n\log n)$`,'$O(n^{3/2})$','$O(n^3)$',
    ]),
    question(18,2005,2,raw`Let $T(n)$ be a function defined by the recurrence
$T(n)=2T\!\left(\frac n2\right)+\sqrt n$ for $n\ge2$ and $T(1)=1$. Which of the following statements is TRUE?`,[
      raw`$T(n)=\Theta(\log n)$`,raw`$T(n)=\Theta(\sqrt n)$`,raw`$T(n)=\Theta(n)$`,raw`$T(n)=\Theta(n\log n)$`,
    ]),
    question(19,2005,2,raw`Suppose $T(n)=2T\!\left(\frac n2\right)+n$, $T(0)=T(1)=1$.
Which of the following is FALSE?`,[
      '$T(n)=O(n^2)$',raw`$T(n)=\Theta(n\log n)$`,raw`$T(n)=\Omega(n^2)$`,raw`$T(n)=O(n\log n)$`,
    ]),
    question(20,2005,2,common20+'The space complexity of the above function is',[
      '$O(1)$','$O(n)$','$O(n!)$','$O(n^n)$',
    ],{code:code20}),
    question(21,2005,2,common20+raw`The space complexity of the above function is foo() and store the values of foo(i), $0\le i<n$, as and when they are computed. With this modification, the time complexity for function foo() is significantly reduced. The space complexity of the modified function would be`,[
      '$O(1)$','$O(n)$','$O(n^2)$','$O(n!)$',
    ],{code:code20,notes:['The printed question begins with the malformed sentence "The space complexity of the above function is foo() and store the values ...". Retained verbatim; no missing wording inferred.']}),
    question(22,2006,1,`Consider the following C-program fragment in which $i$, $j$, and $n$ are integer variables.
[CODE]
Let Val(j) denote the value stored in the variable $j$ after termination of the for loop. Which one of the following is true?`,[
      raw`$\operatorname{val}(j)=\Theta(\log n)$`,raw`$\operatorname{val}(j)=\Theta(\sqrt n)$`,raw`$\operatorname{val}(j)=\Theta(n)$`,raw`$\operatorname{val}(j)=\Theta(n\log n)$`,
    ],{code:'for (i = n, j = 0; i > 0; i /= 2, j += i);'}),
    question(23,2006,2,raw`Consider the following is true?
$T(n)=2T\!\left(\left\lfloor\sqrt n\right\rfloor\right)+1$, $T(1)=1$
Which one of the following is true?`,[
      raw`$T(n)=\Theta(\log\log n)$`,raw`$T(n)=\Theta(\log n)$`,raw`$T(n)=\Theta(\sqrt n)$`,raw`$T(n)=\Theta(n)$`,
    ]),
    question(24,2007,1,`Consider the following segment of C code:
[CODE]
The number of comparisons made in the execution of the loop for any $n>0$ is`,[
      raw`$\lceil\log_2 n\rceil+1$`,'$n$',raw`$\lceil\log_2 n\rceil$`,raw`$\lfloor\log_2 n\rfloor+1$`,
    ],{code:`int j, n;
j = 1;
while (j <= n)
  j = j * 2;`}),
    question(25,2007,2,`What is the time complexity of the following recursive function:
[CODE]`,[
      raw`$\Theta(n^2)$`,raw`$\Theta(n\log_2 n)$`,raw`$\Theta(\log_2 n)$`,raw`$\Theta(\log_2\log_2 n)$`,
    ],{code:`int DoSomething(int n)
{
  if (n <= 2) return 1;
  else return DoSomething(floor(sqrt(n))) + n;
}`}),
    question(26,2007,2,'An array of $n$ numbers is given, where $n$ is an even number. The maximum as well as the minimum of these $n$ numbers needs to be determined. Which of the following is true about the number of comparisons needed?',[
      'At least $2n-c$ comparisons, for some constant $c$, are needed.','At most $1.5n-2$ comparisons are needed.',raw`At least $n\log_2 n$ comparisons are needed.`,'None of the above',
    ]),
    question(27,2007,2,`Consider the following C code segment:
[CODE]
Let $T(n)$ denote the number of times the for loop is executed by the program on input $n$. Which of the following is TRUE?`,[
      raw`$T(n)=O(\sqrt n)$ and $T(n)=\Omega(\sqrt n)$`,raw`$T(n)=O(\sqrt n)$ and $T(n)=\Omega(1)$`,raw`$T(n)=O(n)$ and $T(n)=\Omega(\sqrt n)$`,'None of these',
    ],{code:`int IsPrime(n)
{
  int i, n;
  for (i = 2; i <= sqrt(n); i++) {
    if (n % i == 0) {
      printf("Not Prime\\n");
      return 0;
    }
  }
  return 1;
}`,notes:['The source declares int i, n inside IsPrime(n); this printed declaration is retained.']}),
    question(28,2008,1,raw`Arrange the following functions in increasing asymptotic order:
$$\begin{array}{ll}A.\ n^{1/3}&B.\ e^n\\C.\ n^{7/4}&D.\ n\log^9 n\\E.\ 1.0000001^n&\end{array}$$`,[
      'A, D, C, E, B','D, A, C, E, B','A, C, D, E, B','A, C, D, B, E',
    ]),
    question(29,2008,2,raw`When $n=2^{2k}$ for some $k\ge0$, the recurrence relation $T(n)=\sqrt2\,T\!\left(\frac n2\right)+\sqrt n$, $T(1)=1$ evaluates to:`,[
      raw`$\sqrt n(\log n+1)$`,raw`$\sqrt n\log n$`,raw`$\sqrt n\log\sqrt n$`,raw`$n\log\sqrt n$`,
    ]),
    question(30,2008,2,raw`Consider the following functions:
$f(n)=2^n$
$g(n)=n!$
$h(n)=n^{\log n}$
Which of the following statements about the asymptotic behaviour of $f(n)$, $g(n)$, and $h(n)$ is true?`,[
      '$f(n)=O(g(n));\ g(n)=O(h(n))$',raw`$f(n)=\Omega(g(n));\ g(n)=O(h(n))$`,'$g(n)=O(f(n));\ h(n)=O(f(n))$',raw`$h(n)=O(f(n));\ g(n)=\Omega(f(n))$`,
    ]),
    question(31,2008,2,raw`The minimum number of comparison required to determine if an integer appears more than $\frac n2$ times in a sorted array of integers is`,[
      raw`$\Theta(n)$`,raw`$\Theta(\log n)$`,raw`$\Theta(\log^2 n)$`,raw`$\Theta(1)$`,
    ]),
    question(32,2008,2,common32+'The running time of f1(n) and f2(n) are',[
      raw`$\Theta(n)$ and $\Theta(n)$`,raw`$\Theta(2^n)$ and $\Theta(n)$`,raw`$\Theta(n)$ and $\Theta(2^n)$`,raw`$\Theta(2^n)$ and $\Theta(2^n)$`,
    ],{code:code32,notes:['The printed shared code uses uninitialized Z[0] at i=2 and has no definition of N. Retained as printed; the book answer is preserved.']}),
    question(33,2008,2,common32+'f1(8) and f2(8) return the values',[
      '1661 and 1640','59 and 59','1640 and 1640','1640 and 1661',
    ],{code:code32,notes:['The printed shared code uses uninitialized Z[0] at i=2 and has no definition of N. Retained as printed; the book answer is preserved.']}),
    question(34,2009,1,'What is the number of swaps required to sort $n$ elements using selection sort, in the worst case?',[
      raw`$\Theta(n)$`,raw`$\Theta(n\log n)$`,raw`$\Theta(n^2)$`,raw`$\Theta(n^2\log n)$`,
    ]),
    question(35,2009,2,raw`The running time of an algorithm is represented by the following recurrence relation:
$$T(n)=\begin{cases}n&n\le3\\T\!\left(\frac n3\right)+cn&\text{otherwise}\end{cases}$$
Which of the following represents the time complexity of the algorithm?`,[
      raw`$\Theta(n)$`,raw`$\Theta(n\log n)$`,raw`$\Theta(n^2)$`,raw`$\Theta(n^2\log n)$`,
    ]),
    question(36,2010,1,raw`Two alternative packages A and B are available for processing a database having $10^k$ records. Package A requires $0.0001n^2$ time units and package B requires $10n\log_{10}n$ time units to process $n$ records. What is the smallest value of $k$ for which package B will be preferred over A?`,['12','10','6','5']),
    question(37,2012,1,'Let $W(n)$ and $A(n)$ denote respectively, the worst case and average case running time of an algorithm executed on an input of size $n$. Which of the following is ALWAYS TRUE?',[
      raw`$A(n)=\Omega(W(n))$`,raw`$A(n)=\Theta(W(n))$`,'$A(n)=O(W(n))$','$A(n)=o(W(n))$',
    ]),
    question(38,2012,1,'The recurrence relation capturing the optimal execution time of the Towers of Hanoi problem with $n$ discs is',[
      '$T(n)=2T(n-2)+2$','$T(n)=2T(n-1)+n$',raw`$T(n)=2T\!\left(\frac n2\right)+1$`,'$T(n)=2T(n-1)+1$',
    ]),
    question(39,2013,2,`Consider the following function:
[CODE]
The return value of the function is`,[
      raw`$\Theta(n^2)$`,raw`$\Theta(n^2\log n)$`,raw`$\Theta(n^3)$`,raw`$\Theta(n^3\log n)$`,
    ],{code:`int unknown(int n)
{
  int i, j, k = 0;
  for (i = n/2; i <= n; i++)
    for (j = 2; j <= n; j = j*2)
      k = k + n/2;
  return (k);
}`}),
    question(40,2014,1,raw`Which one of the following correctly determines the solution of the recurrence relation with $T(1)=1$?
$$T(n)=2T\!\left(\frac n2\right)+\log n$$`,[
      raw`$\Theta(n)$`,raw`$\Theta(n\log n)$`,raw`$\Theta(n^2)$`,raw`$\Theta(\log n)$`,
    ],{setNum:'2'}),
    question(41,2014,2,raw`Suppose we have a balanced binary search tree $T$ holding $n$-numbers. We are given two numbers $L$ and $H$ and wish to sum up all the numbers in $T$ that lie between $L$ and $H$. Suppose there are $m$ such numbers in $T$.
If the tightest upper bound on the time to compute the sum is $O(n^a\log^b n+m^c\log^d n)$, the value of $a+10b+100c+1000d$ is ______.`,[],{setNum:'3'}),
    question(42,2015,2,`Consider the following C function:
[CODE]
Which one of the following most closely approximates the return value of the function fun1?`,[
      '$n^3$',raw`$n(\log n)^2$`,raw`$n\log n$`,raw`$n\log(\log n)$`,
    ],{setNum:'1',code:`int fun1(int n)
{
  int i, j, k, p, q = 0;
  for (i = 1; i < n; ++i) {
    p = 0;
    for (j = n; j > 1; j = j/2)
      ++p;
    for (k = 1; k < p; k = k*2)
      ++q;
  }
  return q;
}`}),
    question(43,2015,2,raw`An algorithm performs $(\log N)^{1/2}$ find operations, $N$ insert operations, $(\log N)^{1/2}$ delete operations, and $(\log N)^{1/2}$ decrease-key operations on a set of data items with keys drawn from a linearly ordered set. For a delete operation, a pointer is provided to the record that must be deleted. For the decrease-key operation, a pointer is provided to the record that has its key decreased. Which one of the following data structures is the most suited for the algorithm to use, if the goal is to achieve the best total asymptotic complexity considering all the operations?`,[
      'Unsorted array','Min-heap','Sorted array','Sorted doubly linked list',
    ],{setNum:'1'}),
    question(44,2015,1,'Consider a complete binary tree where the left and the right subtrees of the root are max-heaps. The lower bound for the number of operations to convert the tree to a heap is',[
      raw`$\Omega(\log n)$`,raw`$\Omega(n)$`,raw`$\Omega(n\log n)$`,raw`$\Omega(n^2)$`,
    ],{setNum:'2'}),
    question(45,2015,1,'An unordered list contains $n$ distinct elements. The number of comparisons to find an element in this list that is neither maximum nor minimum is',[
      raw`$\Theta(n\log n)$`,raw`$\Theta(n)$`,raw`$\Theta(\log n)$`,raw`$\Theta(1)$`,
    ],{setNum:'2'}),
    question(46,2015,1,raw`Consider the equality $\sum_{i=0}^{n}i^3=X$ and the following choices for $X$
$$\begin{array}{ll}\mathrm{I.}\ \Theta(n^4)&\mathrm{II.}\ \Theta(n^5)\\\mathrm{III.}\ O(n^5)&\mathrm{IV.}\ \Omega(n^3)\end{array}$$
The equality above remains correct if $X$ is replace by`,['Only I','Only II','I or III or IV but not II','II or III or IV but not I'],{setNum:'3'}),
    question(47,2015,2,raw`Let $f(n)=n$ and $g(n)=n^{(1+\sin n)}$, where $n$ is a positive integer. Which of the following statements is/are correct?
I. $f(n)=O(g(n))$
II. $f(n)=\Omega(g(n))$`,['Only I','Only II','Both I and II','Neither I nor II'],{setNum:'3'}),
    question(48,2016,2,raw`The given diagram shows the flow chart for a recursive function $A(n)$. Assume that all statements, except for the recursive calls, have $O(1)$ time complexity. If the worst case time complexity of this function is $O(n^\alpha)$, then the least possible value (accurate up to two decimal positions) of $\alpha$ is ______.
[IMG_1]`,[],{setNum:'2',diagram:'algorithms-analysis-1-48-flowchart'}),
    question(49,2016,1,raw`$N$ items are stored in a sorted doubly linked list. For a delete operation, a pointer is provided to the record to be deleted. For a decrease-key operation, a pointer is provided to the record on which the operation is to be performed. An algorithm performs the following operations on the list in this order: $\Theta(N)$ delete, $O(\log N)$ insert, $O(\log N)$ find, and $\Theta(N)$ decrease-key. What is the time complexity of all these operations put together?`,[
      raw`$O(\log^2 N)$`,'$O(N)$','$O(N^2)$',raw`$\Theta(N^2\log N)$`,
    ],{setNum:'2'}),
    question(50,2017,1,raw`Match the algorithms with their time complexities:
List-I (Algorithm)
(P) Towers of Hanoi with $n$ disks
(Q) Binary search given $n$ sorted numbers
(R) Heap sort given $n$ numbers at the worst case
(S) Addition of two $n\times n$ matrices
List-II (Time complexity)
(i) $\Theta(n^2)$
(ii) $\Theta(n\log n)$
(iii) $\Theta(2^n)$
(iv) $\Theta(\log n)$`,[
      'P - (iii), Q - (iv), R - (i), S - (ii)','P - (iv), Q - (iii), R - (i), S - (ii)',
      'P - (iii), Q - (iv), R - (ii), S - (i)','P - (iv), Q - (iii), R - (ii), S - (i)',
    ],{setNum:'2'}),
    question(51,2017,2,raw`Consider the recurrence function:
$$T(n)=\begin{cases}2T(\sqrt n)+1,&n>2\\2,&0<n\le2\end{cases}$$
Then $T(n)$ in terms of $\Theta$ notation is`,[
      raw`$\Theta(\log\log n)$`,raw`$\Theta(\log n)$`,raw`$\Theta(\sqrt n)$`,raw`$\Theta(n)$`,
    ],{setNum:'2'}),
    question(52,2017,2,`Consider the following C function:
[CODE]
Time complexity of fun in terms of $\\Theta$ notation is`,[
      raw`$\Theta(n\sqrt n)$`,raw`$\Theta(n^2)$`,raw`$\Theta(n\log n)$`,raw`$\Theta(n^2\log n)$`,
    ],{setNum:'2',code:`int fun(int n)
{
  int i, j;
  for (i = 1; i <= n; i++) {
    for (j = 1; j < n; j += i) {
      printf("%d %d", i, j);
    }
  }
}`}),
    question(53,2017,1,raw`Consider the following functions from positive integers to real numbers:
$$10,\ \sqrt n,\ n,\ \log_2 n,\ \frac{100}{n}$$
The CORRECT arrangement of the above functions in increasing order of asymptotic complexity is:`,[
      raw`$\log_2 n,\frac{100}{n},10,\sqrt n,n$`,raw`$\frac{100}{n},10,\log_2 n,\sqrt n,n$`,
      raw`$10,\frac{100}{n},\sqrt n,\log_2 n,n$`,raw`$\frac{100}{n},\log_2 n,10,\sqrt n,n$`,
    ],{setNum:'1'}),
    question(54,2017,2,'Let $A$ be an array of 31 numbers consisting of a sequence of 0\'s followed by a sequence of 1\'s. The problem is to find the smallest index $i$ such that $A[i]$ is 1 by probing the minimum number of locations in $A$. The worst case number of probes performed by an optimal algorithm is ______.',[],{setNum:'1'}),
    question(55,2020,1,'What is the worst case time complexity of inserting $n$ elements into an empty linked list, if the linked list needs to be maintained in sorted order?',[
      raw`$\Theta(n\log n)$`,raw`$\Theta(n)$`,raw`$\Theta(1)$`,raw`$\Theta(n^2)$`,
    ]),
    question(56,2020,1,'What is the worst case time complexity of inserting $n^2$ elements into an AVL-tree with $n$ elements initially?',[
      raw`$\Theta(n^4)$`,raw`$\Theta(n^2\log n)$`,raw`$\Theta(n^3)$`,raw`$\Theta(n^2)$`,
    ]),
    question(57,2020,1,raw`For parameters $a$ and $b$, both of which are $\omega(1)$, $T(n)=T(n^{1/a})+1$, and $T(b)=1$. Then $T(n)$ is`,[
      raw`$\Theta(\log_2\log_2 n)$`,raw`$\Theta(\log_a\log_b n)$`,raw`$\Theta(\log_b\log_a n)$`,raw`$\Theta(\log_{ab}n)$`,
    ]),
    question(58,2021,2,raw`Consider the following recurrence relation:
$$T(n)=\begin{cases}T\!\left(\left\lfloor\frac n2\right\rfloor\right)+T\!\left(\left\lfloor\frac{2n}{5}\right\rfloor\right)+7n&\text{if }n>0\\1&\text{if }n=0\end{cases}$$
Which one of the following options is correct?`,[
      raw`$T(n)=\Theta(n\log n)$`,raw`$T(n)=\Theta(n^{5/2})$`,raw`$T(n)=\Theta(n)$`,raw`$T(n)=\Theta((\log n)^{5/2})$`,
    ],{setNum:'1'}),
    question(59,2021,1,raw`Consider the following three functions:
$$f_1=10^n,\ f_2=n^{\log n},\ f_3=n^{\sqrt n}$$
Which one of the following options arranges the functions in the increasing order of asymptotic growth rate?`,[
      '$f_2,f_3,f_1$','$f_2,f_1,f_3$','$f_1,f_2,f_3$','$f_3,f_2,f_1$',
    ],{setNum:'1'}),
    question(60,2021,2,raw`For constants $a\ge1$ and $b>1$, consider the following recurrence defined on the non-negative integers:
$$T(n)=a\cdot T\!\left(\frac nb\right)+f(n)$$
Which one of the following options is correct about the recurrence $T(n)$?`,[
      raw`If $f(n)$ is $\Theta(n^{\log_b(a)})$, then $T(n)$ is $\Theta(n^{\log_b(a)})$.`,
      raw`If $f(n)$ is $O(n^{\log_b(a)-\varepsilon})$ for some $\varepsilon>0$, then $T(n)$ is $\Theta(n^{\log_b(a)})$.`,
      raw`If $f(n)$ is $\frac{n}{\log_2(n)}$, then $T(n)$ is $\Theta(\log_2(n))$.`,
      raw`If $f(n)$ is $n\log_2(n)$, then $T(n)$ is $\Theta(n\log_2(n))$.`,
    ],{setNum:'2'}),
    question(61,2022,1,'Which one of the following statements is TRUE for all positive functions $f(n)$?',[
      raw`$f(n^2)=\Theta(f(n)^2)$, when $f(n)$ is a polynomial`,'$f(n^2)=o(f(n)^2)$',
      '$f(n^2)=O(f(n)^2)$, when $f(n)$ is an exponential function',raw`$f(n^2)=\Omega(f(n)^2)$`,
    ]),
    question(62,2023,1,`Let $f$ and $g$ be functions of natural numbers given by $f(n)=n$ and $g(n)=n^2$.
Which of the following statements is/are TRUE?`,[
      raw`$f\in O(g)$`,raw`$f\in\Omega(g)$`,raw`$f\in o(g)$`,raw`$f\in\Theta(g)$`,
    ]),
    question(63,2023,2,`Consider functions Function 1 and Function 2 expressed in pseudocode as follows:
[CODE]
Let $f_1(n)$ and $f_2(n)$ denote the number of times the statement "x = x + 1" is executed in Function_1 and Function_2, respectively.
Which of the following statements is/are TRUE?`,[
      raw`$f_1(n)\in\Theta(f_2(n))$`,raw`$f_1(n)\in o(f_2(n))$`,raw`$f_1(n)\in\omega(f_2(n))$`,raw`$f_1(n)\in O(n)$`,
    ],{code:`Function 1
while n > 1 do
  for i = 1 to n do
    x = x + 1;
  end for
  n = floor(n/2);
end while

Function 2
for i = 1 to 100 * n do
  x = x + 1;
end for`,notes:['The floor brackets in the source pseudocode are represented by floor(n/2) in the separate editable code field.']}),
    question(64,2024,1,raw`Let $L_1$, $L_2$ be two regular languages and $L_3$ a language which is not regular. Which of the following statements is/are always TRUE?`,[
      raw`$L_1\cup L_3$ is not regular`,raw`$\overline{L_3}$ is not regular`,raw`$L_1=L_2$ if and only if $L_1\cap\overline{L_3}=\varnothing$`,raw`$\overline{L_1}\cup\overline{L_2}$ is regular`,
    ],{setNum:'1',notes:['This formal-language question is printed as Q1.64 inside this Algorithms chapter. Retained in the supplied book order, including L3 in option C.']}),
    question(65,2024,1,'Given an integer array of size $N$, we want to check if the array is sorted (in either ascending or descending order). An algorithm solves this problem by making a single pass through the array and comparing each element of the array only with its adjacent elements. The worst-case time complexity of this algorithm is',[
      raw`$\Omega(N)$ but not $O(N)$`,raw`$O(N)$ but not $\Omega(N)$`,raw`Both $O(N)$ and $\Omega(N)$`,raw`Neither $O(N)$ nor $\Omega(N)$`,
    ],{setNum:'1'}),
    question(66,2024,2,raw`Consider the following recurrence relation:
$$T(n)=\begin{cases}\sqrt n\,T(\sqrt n)+n&\text{for }n\ge1\\1&\text{for }n=1\end{cases}$$
Which one of the following options is CORRECT?`,[
      raw`$T(n)=\Theta(n\log\log n)$`,raw`$T(n)=\Theta(n^2\log n)$`,raw`$T(n)=\Theta(n\log n)$`,raw`$T(n)=\Theta(n^2\log\log n)$`,
    ],{setNum:'1',notes:['The source prints n >= 1 in the recursive branch and n = 1 in the base branch. This overlap is preserved; the answer A is taken from the supplied key.']}),
    question(67,2024,1,'Let $A$ be an array containing integer values. The distance of $A$ is defined as the minimum number of elements in $A$ that must be replaced with another integer so that the resulting array is in non-decreasing order. The distance of the array $[2,5,3,1,4,2,6]$ is ______.',[],{setNum:'2'}),
    question(68,2024,1,raw`Let $T(n)$ be the recurrence relation defined as follows:
$T(0)=1$,
$T(1)=2$ and
$T(n)=5T(n-1)-6T(n-2)$ for $n\ge2$
Which one of the following statements is TRUE?`,[
      raw`$T(n)=\Theta(n3^n)$`,raw`$T(n)=\Theta(n2^n)$`,raw`$T(n)=\Theta(3^n)$`,raw`$T(n)=\Theta(2^n)$`,
    ],{setNum:'2'}),
  ],
};
