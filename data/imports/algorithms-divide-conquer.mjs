const raw = String.raw;
const sourceHash = '9f7deecd91fd52146914409e245a924f7b772c0abaa9441449978e45b74f1672';
// Complete printed key: PDF page 4, book page 441. Preserve its Q2.32 anomaly.
const answers = 'A C D A C B B B A C A B B A B B A A B C A D C B B C B C B C C 162 A B B B A B D D 29 0.08 B B C D A D D 9'.split(' ');
function question(number, year, marks, text, options = [], extra = {}) {
  const {notes = [], ...fields} = extra;
  let bookPages = [number <= 10 ? 435 : number <= 21 ? 436 : number <= 29 ? 437 : number <= 37 ? 438 : number <= 46 ? 439 : 440];
  if ([20,21].includes(number)) bookPages = [436,437];
  if (number === 37) bookPages = [438,439];
  const answer = answers[number-1];
  return {
    id: `madeeasy-algorithms-divide-conquer-2-${number}`, text, code: '', year: String(year), marks: String(marks), setNum: '',
    rawTopic: 'Divide and Conquer', diagram: '', ext: '.png',
    optA: options[0] || '', optB: options[1] || '', optC: options[2] || '', optD: options[3] || '',
    questionType: options.length ? 'MCQ' : 'NAT', correctOptions: options.length ? [answer] : [], natAnswer: options.length ? '' : answer,
    isBlank: false, isPosLocked: false, isCodeOptions: false, isProof: false, needsManualOptionFix: false, optLayout: 'auto', tempPaste: '', ...fields,
    source: {
      file: '7. Algorithms/2. Divide and Conquer.pdf', sha256: sourceHash, questionNumber: `2.${number}`,
      bookPages, pdfPages: [...new Set(bookPages.map(page => Math.floor((page-434)/2)+1))], answerKeyPdfPage: 4,
      notes: ['Answer transcribed from the printed chapter key, PDF page 4 / book page 441.', ...notes],
    },
  };
}
const common20 = `Linked Answers Q.2.20 and Q.2.21:
Consider the following C program that attempts to locate an element $x$ in an array Y[] using binary search. The program is erroneous.
[CODE]
`;
const code20 = `1.  f(int Y[10], int x) {
2.    int i, j, k;
3.    i = 0; j = 9;
4.    do {
5.      k = (i + j) / 2;
6.      if (Y[k] < x) i = k; else j = k;
7.    } while ((Y[k] != x) && (i < j));
8.    if (Y[k] == x)
        printf("x is in the array");
9.    else
        printf("x is not in the array");
10. }`;
const common22 = `Directions for Question 2.22 to 2.24:
A Binary Search Tree (BST) stores values in the range 37 to 573. Consider the following sequence of keys.
I. 81, 537, 102, 439, 285, 376, 305
II. 52, 97, 121, 195, 242, 381, 472
III. 142, 248, 520, 386, 345, 270, 307
IV. 550, 149, 507, 395, 463, 402, 270
`;
export const ALGORITHMS_DIVIDE_CONQUER_IMPORT = {
  subject: '7. Algorithms', chapter: '2. Divide and Conquer', sourceHash,
  questions: [
    question(1,1995,1,'Merge sort uses',['Divide and conquer strategy','Backtracking approach','Heuristic search','Greedy approach']),
    question(2,1995,1,'For merging two sorted lists of sizes $m$ and $n$ into a sorted list of size $m+n$, we required comparisons of',[
      '$O(m)$','$O(n)$','$O(m+n)$',raw`$O(\log m+\log n)$`,
    ]),
    question(3,1995,1,raw`Which of the following statements is true?
I. As the number of entries in a hash table increases, the number of collisions increases.
II. Recursive programs are efficient.
III. The worst case complexity for Quicksort is $O(n^2)$.
IV. Binary search using a linear linked list is efficient.`,['I and II','II and III','I and IV','I and III']),
    question(4,1996,2,raw`The recurrence relation
$T(1)=2$
$T(n)=3T\!\left(\frac{n}{4}\right)+n$
Has the solution $T(n)$ equal to`,['$O(n)$',raw`$O(\log n)$`,'$O(n^{3/4})$','None of these']),
    question(5,1996,2,raw`Quicksort is run on two inputs shown below to sort in ascending order
(i) $1,2,3,\ldots,n$
(ii) $n,n-1,n-2,\ldots,2,1$
Let $C_1$ and $C_2$ be the number of comparisons made for the inputs (i) and (ii) respectively. Then,`,['$C_1<C_2$','$C_1>C_2$','$C_1=C_2$','we cannot say anything for arbitrary $n$']),
    question(6,1997,2,raw`Let $T(n)$ be the function defined by $T(1)=1$,
$T(n)=2T\!\left(\left\lfloor\frac{n}{2}\right\rfloor\right)+\sqrt n$ for $n\ge2$. Which of the following statements is true?`,[
      raw`$T(n)=O(\sqrt n)$`,'$T(n)=O(n)$',raw`$T(n)=O(\log n)$`,'None of these',
    ]),
    question(7,1999,1,'A sorting technique is called stable if',[
      raw`it takes $O(n\log n)$ time`,'it maintains the relative order of occurrence of non-distinct elements','it uses divide and conquer paradigm','it takes $O(n)$ space',
    ]),
    question(8,1999,1,`If one uses straight two-way merge sort algorithm to sort the following elements in ascending order:
20, 47, 15, 8, 9, 4, 40, 30, 12, 17
then the order of these elements after second pass of the algorithm is`,[
      '8, 9, 15, 20, 47, 4, 12, 17, 30, 40','8, 15, 20, 47, 4, 9, 30, 40, 12, 17','15, 20, 47, 4, 8, 9, 12, 30, 40, 17','4, 8, 9, 15, 20, 47, 12, 17, 30, 40',
    ]),
    question(9,2000,1,raw`Let $s$ be a sorted array of $n$ integers. Let $t(n)$ denote the time taken for the most efficient algorithm to determine if there are two elements with sum less than 1000 in $s$. Which of the following statements is true?`,[
      '$t(n)$ is $O(1)$',raw`$n\le t(n)\le n\log_2 n$`,raw`$n\log_2 n\le t(n)<\frac{n}{2}$`,raw`$t(n)=\left\lceil\frac{n}{2}\right\rceil$`,
    ]),
    question(10,2001,1,'Randomized quicksort is an extension of quicksort where the pivot is chosen randomly. What is the worst case complexity of sorting $n$ numbers using randomized quicksort?',[
      '$O(n)$',raw`$(n\log n)$`,'$O(n^2)$','$O(n!)$',
    ],{notes:['Option B is printed as (n log n), without a big-O prefix; preserved.']}),
    question(11,2003,1,raw`The usual $\Theta(n^2)$ implementation of Insertion Sort to sort an array uses linear search to identify the position where an element is to be inserted into the already sorted part of the array. If instead, we use binary search to identify the position, the worst-case running time will`,[
      raw`remain $\Theta(n^2)$`,raw`become $\Theta(n(\log n)^2)$`,raw`become $\Theta(n\log n)$`,raw`become $\Theta(n)$`,
    ]),
    question(12,2003,1,raw`Let $T(n)$ be the number of different binary search trees on $n$ distinct elements.
Then $T(n)=\displaystyle\sum_{k=1}^{n}T(k-1)T(x)$, where $x$ is`,['$n-k+1$','$n-k$','$n-k-1$','$n-k-2$']),
    question(13,2004,2,raw`Consider a list of recursive algorithms and a list of recurrence relations as shown below. Each recurrence relation corresponds to exactly one algorithm and is used to derive the time complexity of the algorithm.
List-I (Recursive Algorithm)
P. Binary search
Q. Merge sort
R. Quick sort
S. Tower of Hanoi
List-II (Recurrence Relation)
I. $T(n)=T(n-k)+T(k)+cn$
II. $T(n)=2T(n-1)+1$
III. $T(n)=2T(n/2)+cn$
IV. $T(n)=T(n/2)+1$
Which of the following is the correct match between the algorithms and their recurrence relations?
Codes (P, Q, R, S):`,['II, III, IV, I','IV, III, I, II','III, II, IV, I','IV, II, I, III']),
    question(14,2005,2,raw`Suppose there are $\log n$ sorted lists of $\frac{n}{\log n}$ elements each. The time complexity of producing a sorted list of all these elements is:
(Hint: Use a heap data structure)`,[
      raw`$O(n\log\log n)$`,raw`$\Theta(n\log n)$`,raw`$\Omega(n\log n)$`,raw`$\Omega(n^{3/2})$`,
    ]),
    question(15,2005,2,'How many distinct binary search trees can be created out of 4 distinct keys?',['5','14','24','35']),
    question(16,2006,2,'The median of $n$ elements can be found in $O(n)$ time. Which one of the following is correct about the complexity of quick sort, in which median is selected as pivot?',[
      raw`$\Theta(n)$`,raw`$\Theta(n\log n)$`,raw`$\Theta(n^2)$`,raw`$\Theta(n^3)$`,
    ]),
    question(17,2007,1,'Which of the following sorting algorithms has the lowest worst-case complexity?',['Merge sort','Bubble sort','Quick sort','Selection sort']),
    question(18,2007,2,raw`In the following C function, let $n\ge m$.
[CODE]
How many recursive calls are made by this function?`,[
      raw`$\Theta(\log_2 n)$`,raw`$\Omega(n)$`,raw`$\Theta(\log_2\log_2 n)$`,raw`$\Theta(\sqrt n)$`,
    ],{code:`int gcd(n, m)
{
  if (n % m == 0) return m;
  n = n % m;
  return gcd(m, n);
}`}),
    question(19,2008,2,raw`Consider the Quicksort algorithm. Suppose there is a procedure for finding a pivot element which splits the list into two sub-lists each of which contains at least one-fifth of the elements. Let $T(n)$ be the number of comparisons required to sort $n$ elements. Then`,[
      raw`$T(n)\le2T\!\left(\frac{n}{5}\right)+n$`,raw`$T(n)\le T\!\left(\frac{n}{5}\right)+T\!\left(\frac{4n}{5}\right)+n$`,raw`$T(n)\le2T\!\left(\frac{4n}{5}\right)+n$`,raw`$T(n)\le2T\!\left(\frac{n}{2}\right)+n$`,
    ]),
    question(20,2008,2,common20+'On which of the following contents of Y and $x$ does the program fail?',[
      'Y is [1 2 3 4 5 6 7 8 9 10] and $x<10$','Y is [1 3 5 7 9 11 13 15 17 19] and $x<1$','Y is [2 2 2 2 2 2 2 2 2 2] and $x>2$','Y is [2 4 6 8 10 12 14 16 18 20] and $2<x<20$ and $x$ is even',
    ],{code:code20,notes:['Shared erroneous program begins on book page 436 and continues on book page 437. Line labels are retained for Q2.21.']}),
    question(21,2008,2,common20+'The correction needed in the program to make it work properly is',[
      'change line 6 to: if (Y[k] < x) i = k + 1; else j = k - 1;',
      'change line 6 to: if (Y[k] < x) i = k - 1; else j = k + 1;',
      'change line 6 to: if (Y[k] < x) i = k; else j = k;',
      'change line 7 to: while ((Y[k] == x) && (i < j));',
    ],{code:code20,notes:['The same shared program is included with both linked questions.']}),
    question(22,2008,2,common22+'Suppose the BST has been unsuccessfully searched for key 273. Which all of the above sequences list nodes in the order in which we could have encountered them in the search?',[
      'II and III only','I and III only','III and IV only','III only',
    ]),
    question(23,2008,2,common22+'Which of the following statements is TRUE?',[
      'I, II and IV are inorder sequences of three different BSTs','I is a preorder sequence of some BST with 439 as the root','II is an inorder sequence of some BST where 121 is the root and 52 is a leaf','IV is a postorder sequence of some BST with 149 as the root',
    ]),
    question(24,2008,2,common22+'How many distinct BSTs can be constructed with 3 distinct keys?',['4','5','6','9'],{notes:['The printed common directions cover Q2.22-Q2.24; retained for all three.']}),
    question(25,2009,2,raw`In quick sort, for sorting $n$ elements, the $\left(\frac{n}{4}\right)$th smallest element is selected as pivot using an $O(n)$ time algorithm. What is the worst case time complexity of the quick sort?`,[
      raw`$\Theta(n)$`,raw`$\Theta(n\log n)$`,raw`$\Theta(n^2)$`,raw`$\Theta(n^2\log n)$`,
    ]),
    question(26,2011,2,raw`Four matrices $M_1,M_2,M_3$ and $M_4$ of dimensions $p\times q$, $q\times r$, $r\times s$ and $s\times t$ respectively can be multiplied in several ways with different number of total scalar multiplications. For example when multiplied as $((M_1\times M_2)\times(M_3\times M_4))$, the total number of scalar multiplications is $pqr+rst+prt$. When multiplied as $(((M_1\times M_2)\times M_3)\times M_4)$, the total number of scalar multiplications is $pqr+prs+pst$.
If $p=10$, $q=100$, $r=20$, $s=5$ and $t=80$, then the minimum number of scalar multiplications needed is`,['248000','44000','19000','25000']),
    question(27,2011,2,raw`We are given a set of $n$ distinct elements and an unlabeled binary tree with $n$ nodes. In how many ways can we populate the tree with the given set so that it becomes a binary search tree?`,['0','1','$n!$',raw`$\frac{\binom{2n}{n}}{n+1}$`]),
    question(28,2012,1,raw`The worst case running time to search for an element in a balanced binary search tree with $n2^n$ elements is`,[
      raw`$\Theta(n\log n)$`,raw`$\Theta(n2^n)$`,raw`$\Theta(n)$`,raw`$\Theta(\log n)$`,
    ]),
    question(29,2012,2,raw`A list of $n$ strings, each of length $n$, is sorted into lexicographic order using the merge sort algorithm. The worst case running time of this computation is`,[
      raw`$O(n\log n)$`,raw`$O(n^2\log n)$`,raw`$O(n^2+\log n)$`,'$O(n^2)$',
    ]),
    question(30,2013,1,'Which one of the following is the tightest upper bound that represents the time complexity of inserting an object into a binary search tree of $n$ nodes?',[
      '$O(1)$',raw`$O(\log n)$`,'$O(n)$',raw`$O(n\log n)$`,
    ]),
    question(31,2014,1,'Let $P$ be a quicksort program to sort numbers in ascending order using the first element as the pivot. Let $t_1$ and $t_2$ be the number of comparisons made by $P$ for the inputs [1 2 3 4 5] and [4 1 5 3 2] respectively. Which one of the following holds?',[
      '$t_1=5$','$t_1<t_2$','$t_1>t_2$','$t_1=t_2$',
    ],{setNum:'1'}),
    question(32,2014,2,'The minimum number of comparisons required to find the minimum and the maximum of 100 numbers is ______.',[],{
      setNum:'1',notes:['Printed answer key gives 162. This conflicts with the usual optimal comparison count 148 for 100 numbers. The supplied answer 162 is preserved without substitution; answer-key discrepancy needs editorial review.'],
    }),
    question(33,2014,1,'You have an array of $n$ elements. Suppose you implement quicksort by always choosing the central element of the array as the pivot. Then the tightest upper bound for the worst case performance is',[
      '$O(n^2)$',raw`$O(n\log n)$`,raw`$\Theta(n\log n)$`,'$O(n^3)$',
    ],{setNum:'3'}),
    question(34,2014,2,raw`Consider the C function given below. Assume that the array list A contains $n$ ($>0$) elements, sorted in ascending order.
[CODE]
Which one of the following statements about the function ProcessArray is CORRECT?`,[
      'It will run into an infinite loop when $x$ is not in listA.','It is an implementation of binary search.','It will always find the maximum element in listA.','It will return $-1$ even when $x$ is present in listA.',
    ],{setNum:'3',code:`int ProcessArray(int *listA, int x, int n)
{
  int i, j, k;
  i = 0;
  j = n - 1;
  do
  {
    k = (i + j) / 2;
    if (x <= listA[k])
      j = k - 1;
    if (listA[k] <= x)
      i = k + 1;
  } while (i <= j);
  if (listA[k] == x)
    return(k);
  else
    return -1;
}`}),
    question(35,2015,1,raw`Which one of the following is the recurrence equation for the worst case time complexity of the Quicksort algorithm for sorting $n$ ($\ge2$) numbers? In the recurrence equations given in the options below, $c$ is a constant.`,[
      raw`$T(n)=2T\!\left(\frac{n}{2}\right)+cn$`,'$T(n)=T(n-1)+T(1)+cn$','$T(n)=2T(n-1)+cn$',raw`$T(n)=T\!\left(\frac{n}{2}\right)+cn$`,
    ],{setNum:'1'}),
    question(36,2015,1,'What are the worst-case complexities of insertion and deletion of a key in a binary search tree?',[
      raw`$\Theta(\log n)$ for both insertion and deletion`,raw`$\Theta(n)$ for both insertion and deletion`,raw`$\Theta(n)$ for insertion and $\Theta(\log n)$ for deletion`,raw`$\Theta(\log n)$ for insertion and $\Theta(n)$ for deletion`,
    ],{setNum:'1'}),
    question(37,2015,2,raw`Suppose you are provided with the following function declaration in the C programming language.
The function treats the first element of a[] as a pivot, and rearranges the array so that all elements less than or equal to the pivot is in the left part of the array, and all elements greater than the pivot is in the right part. In addition, it moves the pivot so that the pivot is the last element of the left part. The return value is the number of elements in the left part.
The following partially given function in the C programming language is used to find the $k$th smallest element in an array a[] of size $n$ using the partition function. We assume $k\le n$.
[CODE]
The missing argument lists are respectively`,[
      '(a, left_end, k) and (a+left_end+1, n-left_end-1, k-left_end-1)',
      '(a, left_end, k) and (a, n-left_end-1, k-left_end-1)',
      '(a+left_end+1, n-left_end-1, k-left_end-1) and (a, left_end, k)',
      '(a, n-left_end-1, k-left_end-1) and (a, left_end, k)',
    ],{setNum:'2',code:`int partition(int a[], int n);

int kth_smallest(int a[], int n, int k)
{
  int left_end = partition(a, n);
  if (left_end + 1 == k)
  {
    return a[left_end];
  }
  if (left_end + 1 > k)
  {
    return kth_smallest(______);
  }
  else
  {
    return kth_smallest(______);
  }
}`,notes:['Code continues from PDF page 3 / book page 438 to book page 439. The printed partition description says its return value is the number of elements in the left part, while the caller uses it as a pivot index; this inconsistency is retained.']}),
    question(38,2015,2,'Assume that a mergesort algorithm in the worst case takes 30 seconds for an input of size 64. Which of the following most closely approximates the maximum input size of a problem that can be solved in 6 minutes?',['256','512','1024','2048'],{setNum:'3'}),
    question(39,2016,1,'The worst case running times of Insertion sort, Merge sort and Quick sort, respectively, are:',[
      raw`$\Theta(n\log n)$, $\Theta(n\log n)$, and $\Theta(n^2)$`,raw`$\Theta(n^2)$, $\Theta(n^2)$, and $\Theta(n\log n)$`,raw`$\Theta(n^2)$, $\Theta(n\log n)$, and $\Theta(n\log n)$`,raw`$\Theta(n^2)$, $\Theta(n\log n)$, and $\Theta(n^2)$`,
    ],{setNum:'1'}),
    question(40,2016,1,raw`Assume that the algorithms considered here sort the input sequences in ascending order. If the input is already in ascending order, which of the following are TRUE?
I. Quicksort runs in $\Theta(n^2)$ time
II. Bubblesort runs in $\Theta(n^2)$ time
III. Mergesort runs in $\Theta(n)$ time
IV. Insertion sort runs in $\Theta(n)$ time`,['I and II only','I and III only','II and IV only','I and IV only'],{setNum:'2'}),
    question(41,2019,1,raw`Consider a sequence of 14 elements: $A=[-5,-10,6,3,-1,-2,13,4,-9,-1,4,12,-3,0]$. The subsequence sum $S(i,j)=\sum_{k=1}^{j}A[k]$. Determine the maximum of $S(i,j)$, where $0\le i\le j<14$. (Divide and conquer approach may be used.)`,[],{
      notes:['The printed summation lower limit is k=1, despite the notation S(i,j) and zero-based bounds. It is retained as printed. The key gives 29; the source formula/bounds discrepancy needs editorial review.'],
    }),
    question(42,2019,1,'An array of 25 distinct elements is to be sorted using quicksort. Assume that the pivot element is chosen uniformly at random. The probability that the pivot element gets placed in the worst possible location in the first round of partitioning (rounded off to 2 decimal places) is ______.'),
    question(43,2019,2,raw`Consider the following statements:
I. The smallest element in a max-heap is always at a leaf node.
II. The second largest element in a max-heap is always a child of the root node.
III. A max-heap can be constructed from a binary search tree in $\Theta(n)$ time.
IV. A binary search tree can be constructed from a max-heap in $\Theta(n)$ time.
Which of the above statements are TRUE?`,['II, III and IV','I, II and III','I, III and IV','I, II and IV']),
    question(44,2019,2,raw`There are $n$ unsorted arrays: $A_1,A_2,\ldots,A_n$. Assume that $n$ is odd. Each of $A_1,A_2,\ldots,A_n$ contains $n$ distinct elements. There are no common elements between any two arrays. The worst-case time complexity of computing the median of the medians of $A_1,A_2,\ldots,A_n$ is`,[
      raw`$O(n\log n)$`,'$O(n^2)$','$O(n)$',raw`$\Omega(n^2\log n)$`,
    ]),
    question(45,2020,2,raw`In a balanced binary search tree with $n$ elements, what is the worst case time complexity of reporting all elements in range $[a,b]$? Assume that the number of reported elements is $k$.`,[
      raw`$\Theta(\log n)$`,raw`$\Theta(n\log k)$`,raw`$\Theta(\log n+k)$`,raw`$\Theta(k\log n)$`,
    ]),
    question(46,2021,1,raw`Consider the following array:
$\begin{array}{|c|c|c|c|c|c|c|c|}\hline23&32&45&69&72&73&89&97\\\hline\end{array}$
Which algorithm out of the following options uses the least number of comparisons (among the array elements) to sort the above array in ascending order?`,['Quicksort using the last element as pivot','Selection sort','Mergesort','Insertion sort'],{setNum:'1'}),
    question(47,2021,1,raw`Let $P$ be an array containing $n$ integers. Let $t$ be the lowest upper bound on the number of comparisons of the array elements, required to find the minimum and maximum values in an arbitrary array of $n$ elements. Which one of the following choices is correct?`,[
      raw`$t>n$ and $t\le3\left\lceil\frac{n}{2}\right\rceil$`,raw`$t>3\left\lceil\frac{n}{2}\right\rceil$ and $t\le2n-2$`,raw`$t>2n-2$`,raw`$t>\lceil\log_2(n)\rceil$ and $t\le n$`,
    ],{setNum:'1'}),
    question(48,2021,1,'What is the worst-case number of arithmetic operations performed by recursive binary search on a sorted array of size $n$?',[
      raw`$\Theta(n)$`,raw`$\Theta(n^2)$`,raw`$\Theta(\sqrt n)$`,raw`$\Theta(\log_2(n))$`,
    ],{setNum:'2'}),
    question(49,2024,2,raw`Let $G$ be an undirected connected graph in which every edge has a positive integer weight. Suppose that every spanning tree in $G$ has even weight. Which of the following statements is/are TRUE for every such graph $G$?`,[
      'All edges in $G$ have even weight.','In each cycle $C$ in $G$, all edges in $C$ have even weight.','All edges in $G$ have even weight OR all edges in $G$ have odd weight.','In each cycle $C$ in $G$, either all edges in $C$ have even weight OR all edges in $C$ have odd weight.',
    ],{setNum:'2',questionType:'MSQ',notes:['Multiple-selection wording is/are TRUE is preserved; this MSQ has only D in the supplied answer key. The graph-theory question remains in its printed chapter/order.']}),
    question(50,2024,2,'The number of distinct minimum-weight spanning trees of the following graph is ______.\n[IMG_1]',[],{
      setNum:'2',diagram:'algorithms-divide-conquer-2-50-graph',notes:['Graph-only crop from PDF page 4 / book page 440. The question remains in the supplied chapter/order.'],
    }),
  ],
};
