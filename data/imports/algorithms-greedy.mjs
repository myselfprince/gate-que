const raw = String.raw;
const sourceHash = 'a92eb7d6acfa00d9f6891c2b63110e4f284f3cef99be07ce127ec4910b55b91a';
// Visually transcribed from PDF page 6 / book page 457, including the
// reference solution for the historical subjective question 3.1.
const answers = [raw`$O(m+n)$`,'B','C','B','B','B','D','B','A','A','C','A','D','D','A','D','A','B','C','A','D','A','C','D','A','D','D','A','D','B','C','D','D','B','D','C','D','D','D','B','B','B','C','D','D','B','A','B','358','69','B','D','A','7','B','B','8','A','225','16','4','D','511','B','99','D','BC','3','929','D','AB','A','A','ABC','24','B','B','16','60','D'];

function question(number, year, marks, text, options = [], extra = {}) {
  const {notes = [], ...fields} = extra;
  let bookPages = [number<=8?447:number<=16?448:number<=26?449:number<=35?450:number<=43?451:number<=52?452:number<=60?453:number<=69?454:number<=75?455:456];
  if(number===8) bookPages=[447,448];
  if(number===16) bookPages=[448,449];
  if(number===35) bookPages=[450,451];
  if(number===69) bookPages=[454,455];
  const answer=answers[number-1];
  return {
    id:`madeeasy-algorithms-greedy-3-${number}`,text,code:'',year:String(year),marks:String(marks),setNum:'',
    rawTopic:'Greedy Method',diagram:'',ext:'.png',
    optA:options[0]||'',optB:options[1]||'',optC:options[2]||'',optD:options[3]||'',
    questionType:number===1?'SUBJECTIVE':options.length?(answer.length>1?'MSQ':'MCQ'):'NAT',
    correctOptions:options.length?[...answer]:[],natAnswer:options.length?'':answer,
    isBlank:false,isPosLocked:false,isCodeOptions:false,isProof:number===1,
    needsManualOptionFix:false,optLayout:'auto',tempPaste:'',...fields,
    source:{file:'7. Algorithms/3. Greedy Method.pdf',sha256:sourceHash,questionNumber:`3.${number}`,
      bookPages,pdfPages:[...new Set(bookPages.map(p=>Math.floor((p-446)/2)+1))],answerKeyPdfPage:6,
      notes:['Answer transcribed from the printed chapter key, PDF page 6 / book page 457.',...notes]},
  };
}

const tasks=raw`Common Data for Q.3.14 and Q.3.15:
We are given 9 tasks $T_1,T_2,\ldots,T_9$. The execution of each task requires one unit of time. We can execute one task at a time. $T_i$ has a profit $P_i$ and a deadline $d_i$; profit $P_i$ is earned if the task is completed before the end of the $d_i$th unit of time.
$$\begin{array}{c|rrrrrrrrr}
\text{Task}&T_1&T_2&T_3&T_4&T_5&T_6&T_7&T_8&T_9\\\hline
\text{Profit}&15&20&30&18&18&10&23&16&25\\
\text{Deadline}&7&2&5&3&4&5&2&7&3
\end{array}$$
`;
const ternary=raw`Common Data for Q.3.24 and Q.3.25:
A 3-ary max heap is like a binary max heap, but instead of 2 children, nodes have 3 children. A 3-ary heap can be represented by an array as follows: The root is stored in the first location, $a[0]$, nodes in the next level, from left to right, is stored from $a[1]$ to $a[3]$. The nodes from the second level of the tree from left to right are stored from $a[4]$ location onward. An item $x$ can be inserted into a 3-ary heap containing $n$ items by placing $x$ in the location $a[n]$ and pushing it up the tree to satisfy the heap property.
`;
const letters=raw`Common Data for Q.3.28 and Q.3.29:
Suppose the letters $a,b,c,d,e$ have probabilities $\frac12,\frac14,\frac18,\frac1{16},\frac1{32}$ respectively.
`;
const matrix=raw`Common Data for Questions 3.39 and 3.40:
Consider a complete undirected graph with vertex set $\{0,1,2,3,4\}$. Entry $W_{ij}$ in the matrix $W$ below is the weight of the edge $\{i,j\}$.
$$W=\begin{pmatrix}0&1&8&1&4\\1&0&12&4&9\\8&12&0&7&3\\1&4&7&0&2\\4&9&3&2&0\end{pmatrix}$$
`;
const linkedGraph=raw`Linked Data Question 3.42 and 3.43:
An undirected graph $G(V,E)$ contains $n$ ($n>2$) nodes named $v_1,v_2,\ldots,v_n$. Two nodes $v_i,v_j$ are connected if and only if $0<|i-j|\le2$. Each edge $(v_i,v_j)$ is assigned a weight $i+j$. A sample graph with $n=4$ is shown below.
[IMG_1]
`;
export const ALGORITHMS_GREEDY_IMPORT = {
  subject:'7. Algorithms',chapter:'3. Greedy Method',sourceHash,
  questions:[
    question(1,2002,2,raw`Complexity of Kruskal's algorithm for finding the minimum spanning tree of an undirected graph containing $n$ vertices and $m$ edges if the edges are sorted is ______.`,[],{notes:["The key says 'Sol.'; the supplied explanation on PDF page 6 / book page 457 gives O(m+n). This non-numerical historical fill-in is stored as SUBJECTIVE with an editable reference answer."]}),
    question(2,2002,2,raw`Let $G$ be an undirected connected graph with distinct edge weights. Let $e_{\max}$ be the edge with maximum weight and $e_{\min}$ the edge with minimum weight. Which of the following statements is false?`,[
      raw`Every minimum spanning tree of $G$ must contain $e_{\min}$`,raw`If $e_{\max}$ is in a minimum spanning tree, then its removal must disconnect $G$`,raw`No minimum spanning tree contains $e_{\max}$`,'$G$ has a unique minimum spanning tree',
    ],{notes:['The source key gives B for the false statement. With distinct weights, the displayed statement B is true and C can be false (e.g. when G is a tree). The supplied key is retained for review.']}),
    question(3,2003,1,raw`In a heap with $n$ elements with the smallest element at the root, the 7th smallest element can be found in time`,[raw`$\Theta(n\log n)$`,raw`$\Theta(n)$`,raw`$\Theta(\log n)$`,raw`$\Theta(1)$`]),
    question(4,2003,2,'What is the weight of a minimum spanning tree of the following graph?\n[IMG_1]',['29','31','38','41'],{diagram:'greedy-3-4-graph'}),
    question(5,2003,2,raw`The following are the starting and ending times of activities A, B, C, D, E, F, G, and H respectively in chronological order: "$a_a\ b_s\ c_s\ a_e\ d_s\ c_e\ e_s\ f_s\ b_e\ d_e\ g_s\ e_e\ f_e\ h_s\ g_e\ h_e$". Here, $x_s$ denotes the starting time and $x_e$ denotes the ending time of activity X. We need to schedule the activities in a set of rooms available to us. An activity can be scheduled in a room only if the room is reserved for the activity for its entire duration. What is the minimum number of rooms required?`,['3','4','5','6'],{notes:["The first activity start is printed as a_a (also repeated in the supplied explanation), rather than a_s; retained as printed."]}),
    question(6,2004,2,raw`Suppose we run Dijkstra's single source shortest-path algorithm on the following edge-weighted directed graph with vertex P as the source.
[IMG_1]
In what order do the nodes get included into the set of vertices for which the shortest path distances are finalized?`,['P, Q, R, S, T, U','P, Q, R, U, S, T','P, Q, R, U, T, S','P, Q, T, R, U, S'],{diagram:'greedy-3-6-graph'}),
    question(7,2004,2,raw`Consider the undirected graph below:
[IMG_1]
Using Prim's algorithm to construct a minimum spanning tree starting with the node A, which one of the following sequences of edges represents a possible order in which the edges would be added to construct the minimum spanning tree?`,[
      '(E,G), (C,F), (F,G), (A,D), (A,B), (A,C)','(A,D), (A,B), (A,C), (C,F), (G,E), (F,G)',
      '(A,B), (A,D), (D,F), (F,G), (G,E), (F,C)','(A,D), (A,B), (D,F), (F,C), (F,G), (G,E)',
    ],{diagram:'greedy-3-7-graph',optLayout:'1col'}),
    question(8,2004,2,raw`An array of integers of size $n$ can be converted into a heap by adjusting the heaps rooted at each internal node of the complete binary tree starting at the node $\lfloor(n-1)/2\rfloor$, and doing this adjustment up to the root node (root node is at index 0) in the order $\lfloor(n-1)/2\rfloor,\lfloor(n-3)/2\rfloor,\ldots,0$. The time required to construct a heap in this manner is`,[raw`$O(\log n)$`,'$O(n)$',raw`$O(n\log\log n)$`,raw`$O(n\log n)$`]),
    question(9,2004,2,'The elements 32, 15, 20, 30, 12, 25, 16 are inserted one by one in the given order into a maxHeap. The resultant maxHeap is',[
      'IMG:greedy-3-9-A','IMG:greedy-3-9-B','IMG:greedy-3-9-C','IMG:greedy-3-9-D',
    ],{optLayout:'2col'}),
    question(10,2005,1,raw`In the following table, the left column contains the names of standard graph algorithms and the right column contains the time complexities of the algorithms. Match each algorithm with its time complexity.
$$\begin{array}{ll|ll}
&\text{List-I}&&\text{List-II}\\
1.&\text{Bellman-Ford algorithm}&A.&O(m\log n)\\
2.&\text{Kruskal's algorithm}&B.&O(n^3)\\
3.&\text{Floyd-Warshall algorithm}&C.&O(nm)\\
4.&\text{Topological sorting}&D.&O(n+m)
\end{array}$$`,['1-C, 2-A, 3-B, 4-D','1-B, 2-D, 3-C, 4-A','1-C, 2-D, 3-A, 4-B','1-B, 2-A, 3-C, 4-D']),
    question(11,2005,1,raw`An undirected graph $G$ has $n$ nodes. Its adjacency matrix is given by an $n\times n$ square matrix whose
1. diagonal elements are 0's, and
2. non-diagonal elements are 1's.
Which one of the following is TRUE?`,[
      'Graph G has no minimum spanning tree (MST)',raw`Graph $G$ has a unique MST of cost $n-1$`,raw`Graph $G$ has multiple distinct MST's, each of cost $n-1$`,'Graph G has multiple spanning trees of different costs',
    ],{notes:['The source labels the four options (a), (d), (c), (d). Their printed order is preserved as A-D; the printed answer (c) identifies the third option.']}),
    question(12,2005,2,raw`Let $G$ be a weighted undirected graph and $e$ be an edge with maximum weight in $G$. Suppose there is a minimum weight spanning tree in $G$ containing the edge $e$. Which of the following statements is always TRUE?`,[
      'There exists a cutset in G having all edges of maximum weight.','There exists a cycle in G having all edges of maximum weight.',
      'Edge e cannot be contained in a cycle.','All edges in G have the same weight.',
    ]),
    question(13,2005,2,raw`Let $G(V,E)$ an undirected graph with positive edge weights. Dijkstra's single source-shortest path algorithm can be implemented using the binary heap data structure with time complexity?`,[
      '$O(|V|^2)$',raw`$O(|E|+|V|\log|V|)$`,raw`$O(|V|\log|V|)$`,raw`$O((|E|+|V|)\log|V|)$`,
    ]),
    question(14,2005,2,tasks+'Are all tasks completed in the schedule that gives maximum profit?',[
      'All tasks are completed',raw`$T_1$ and $T_6$ are left out`,raw`$T_1$ and $T_8$ are left out`,raw`$T_4$ and $T_6$ are left out`,
    ]),
    question(15,2005,2,tasks+'What is the maximum profit earned?',['147','165','167','175']),
    question(16,2005,2,'A Priority-Queue is implemented as a Max-Heap. Initially, it has 5 elements. The level-order traversal of the heap is given below:\n10, 8, 5, 3, 2\nTwo new elements \'1\' and \'7\' are inserted in the heap in that order. The level-order traversal of the heap after the insertion of the elements is',[
      '10, 8, 7, 5, 3, 2, 1','10, 8, 7, 2, 3, 1, 5','10, 8, 7, 1, 2, 3, 5','10, 8, 7, 3, 2, 1, 5',
    ]),
    question(17,2006,1,raw`Consider the polynomial $p(x)=a_0+a_1x+a_2x^2+a_3x^3$, where $a_i\ne0$, $\forall i$. The minimum number of multiplications needed to evaluate $p$ on an input $x$ is`,['3','4','6','9']),
    question(18,2006,1,raw`Consider a weighted complete graph $G$ on the vertex set $\{v_1,v_2,\ldots,v_n\}$ such that the weight of the edge $(v_i,v_j)$ is $2|i-j|$. The weight of a minimum spanning tree of $G$ is`,['$n-1$','$2n-2$',raw`$\left(\frac n2\right)$`,'$n^2$']),
    question(19,2006,1,"To implement Dijkstra's shortest path algorithm on unweighted graphs so that it runs in linear time, then data structure to be used is",['Queue','Stack','Heap','B-Tree'],{notes:['The supplied answer key prints (c), Heap. This conflicts with the linear-time unweighted-graph traversal wording (Queue); the printed answer is preserved for review.']}),
    question(20,2006,1,raw`In a binary max heap containing $n$ numbers, the smallest element can be found in time`,[raw`$\Theta(n)$`,raw`$\Theta(\log n)$`,raw`$\Theta(\log\log n)$`,raw`$\Theta(1)$`]),
    question(21,2006,2,raw`Consider the following graph:
[IMG_1]
Which one of the following cannot be the sequence of edges added, in that order, to a minimum spanning tree using Kruskal's algorithm?`,[
      '(a-b), (d-f), (b-f), (d-c), (d-e)','(a-b), (d-f), (d-c), (b-f), (d-e)',
      '(d-f), (a-b), (d-c), (b-f), (d-e)','(d-f), (a-b), (b-f), (d-e), (d-c)',
    ],{diagram:'greedy-3-21-graph',optLayout:'1col'}),
    question(22,2006,2,raw`The characters a to h have the set of frequencies based on the first 8 Fibonacci numbers as follows:
$a:1,\ b:1,\ c:2,\ d:3,\ e:5,\ f:8,\ g:13,\ h:21$
A Huffman code is used to represent the characters. What is the sequence of characters corresponding to the following code?
$110111100111010$`,['fdheg','ecgdf','dchfg','fehdg'],{notes:['The fourth option is mislabelled (c) in the source; option order is preserved as A-D.']}),
    question(23,2006,2,'Which of the following sequences of array elements forms a heap?',[
      '{23, 17, 14, 6, 13, 10, 1, 12, 7, 5}','{23, 17, 14, 6, 13, 10, 1, 5, 7, 12}',
      '{23, 17, 14, 7, 13, 10, 1, 5, 6, 12}','{23, 17, 14, 7, 13, 10, 1, 12, 5, 7}',
    ]),
    question(24,2006,2,ternary+'Which one of the following is a valid sequence of elements in an array representing 3-ary max heap?',[
      '1, 3, 5, 6, 8, 9','9, 6, 3, 1, 8, 5','9, 3, 6, 8, 5, 1','9, 5, 6, 8, 3, 1',
    ]),
    question(25,2006,2,ternary+`Linked Q3.24 asks which sequence represents a valid 3-ary max heap, with choices:
(A) 1, 3, 5, 6, 8, 9
(B) 9, 6, 3, 1, 8, 5
(C) 9, 3, 6, 8, 5, 1
(D) 9, 5, 6, 8, 3, 1
Suppose the elements 7, 2, 10, and 4 are inserted, in that order, into the valid 3-ary max heap found in the above question. Which one of the following is the sequence of items in the array representing the resultant heap?`,[
      '10, 7, 9, 8, 3, 1, 5, 2, 6, 4','10, 9, 8, 7, 6, 5, 4, 3, 2, 1','10, 9, 4, 5, 7, 6, 8, 2, 1, 3','10, 8, 6, 9, 7, 2, 3, 4, 1, 5',
    ],{notes:['The original linked question choices are repeated as context for an independent question page.']}),
    question(26,2007,2,'In an unweighted, undirected connected graph, the shortest path from a node S to every other node is computed most efficiently, in terms of time complexity, by',[
      "Dijkstra's algorithm starting from S.","Warshall's algorithm",'performing a DFS starting from S','performing a BFS starting from S',
    ]),
    question(27,2007,2,raw`Let $w$ be the minimum weight among all edge weights in an undirected connected graph. Let $e$ be a specific edge of weight $w$. Which of the following is FALSE?`,[
      'There is a minimum spanning tree containing e.',raw`If $e$ is not in a minimum spanning tree $T$, then in the cycle formed by adding to $T$, all edges have the same weight.`,
      'Every minimum spanning tree has an edge of weight w','e is present in every minimum spanning tree',
    ],{notes:['Option B omits the edge after "adding" in the printed sentence; wording is retained.']}),
    question(28,2007,2,letters+'Which of the following is the Huffman code for the letters a, b, c, d, e?',[
      '0, 10, 110, 1110, 1111','11, 10, 011, 010, 001','11, 10, 01, 001, 0001','110, 100, 010, 000, 001',
    ],{notes:['The five printed probabilities sum to 31/32; no missing probability or symbol is invented.']}),
    question(29,2007,2,letters+raw`Linked Q3.28 asks for the Huffman code for the letters $a,b,c,d,e$, with choices:
(A) 0, 10, 110, 1110, 1111
(B) 11, 10, 011, 010, 001
(C) 11, 10, 01, 001, 0001
(D) 110, 100, 010, 000, 001
What is the average length of the correct answer to above question?`,['3','2.1875','2.25','1.781'],{notes:['The printed probabilities sum to 31/32. The original linked question choices are repeated as context for an independent question page.']}),
    question(30,2007,2,raw`Consider the process of inserting an element into a Max Heap, where the Max Heap is represented by an array. Suppose we perform a binary search on the path from the new leaf to the root to find the position for the newly inserted element, the number of comparisons performed is`,[raw`$\Theta(\log_2 n)$`,raw`$\Theta(\log_2\log_2 n)$`,raw`$\Theta(n)$`,raw`$\Theta(n\log_2 n)$`]),
    question(31,2008,2,raw`For the undirected, weighted graph given below, which of the following sequences of edges represents a correct execution of Prim's algorithm to construct a Minimum Spanning Tree?
[IMG_1]`,[
      '(a,b), (d,f), (f,c), (g,i), (d,a), (g,h), (c,e), (f,h)',
      '(c,e), (c,f), (f,d), (d,a), (a,b), (g,h), (h,f), (g,i)',
      '(d,f), (f,c), (d,a), (a,b), (c,e), (f,h), (g,h), (g,i)',
      '(h,g), (g,i), (h,f), (f,c), (f,d), (d,a), (a,b), (c,e)',
    ],{diagram:'greedy-3-31-graph',optLayout:'1col'}),
    question(32,2008,2,raw`$G$ is a graph on $n$ vertices and $2n-2$ edges. The edges of $G$ can be partitioned into two edge-disjoint spanning trees. Which of the following is NOT true for $G$?`,[
      raw`For every subset of $k$ vertices, the induced subgraph has a most $2k-2$ edges.`,
      'The minimum cut in G has a least two edges','There are two edges-disjoint paths between every pair of vertices','There are two vertex-disjoint paths between every pair of vertices.',
    ]),
    question(33,2008,2,raw`Dijkstra's single source shortest path algorithm when run from vertex a in the below graph, computes the correct shortest path distance to
[IMG_1]`,[
      'Only vertex a','Only vertices a, e, f, g, h','Only vertices, a, b, c, d','All the vertices',
    ],{diagram:'greedy-3-33-graph'}),
    question(34,2009,1,raw`Which of the following statement(s) is/are correct regarding Bellman-Ford shortest path algorithm?
P. Always finds a negative weighted cycle, if one exists.
Q. Finds whether any negative weighted cycle is reachable from the source`,['P only','Q only','Both P and Q','Neither P nor Q']),
    question(35,2009,2,raw`Consider the following graph:
[IMG_1]
Which one of the following is NOT the sequence of edges added to the minimum spanning tree using Kruskal's algorithm?`,[
      '(b,e) (e,f) (a,c) (b,c) (f,g) (c,d)',
      '(b,e) (e,f) (a,c) (f,g) (b,c) (c,d)',
      '(b,e) (a,c) (e,f) (b,c) (f,g) (c,d)',
      '(b,e) (e,f) (b,c) (a,c) (f,g) (c,d)',
    ],{diagram:'greedy-3-35-graph',optLayout:'1col'}),
    question(36,2009,2,'Linked Answer Question 3.36 and 3.37:\nConsider a binary max-heap implemented using an array.\nWhich one of the following array represents a binary max-heap?',[
      '{25, 12, 16, 13, 10, 8, 14}','{25, 14, 13, 16, 10, 8, 12}','{25, 14, 16, 13, 10, 8, 12}','{25, 14, 12, 13, 10, 8, 16}',
    ]),
    question(37,2009,2,`Linked Answer Question 3.36 and 3.37:
Consider a binary max-heap implemented using an array.
Linked Q3.36 asks which array represents a binary max-heap, with choices:
(A) {25, 12, 16, 13, 10, 8, 14}
(B) {25, 14, 13, 16, 10, 8, 12}
(C) {25, 14, 16, 13, 10, 8, 12}
(D) {25, 14, 12, 13, 10, 8, 16}
What is the content of the array after two delete operations on the correct answer to the previous question?`,[
      '{14, 13, 12, 10, 8}','{14, 12, 13, 8, 10}','{14, 13, 8, 12, 10}','{14, 13, 12, 8, 10}',
    ],{notes:['The original linked question choices are repeated as context for an independent question page.']}),
    question(38,2010,2,raw`The weight of a sequence $a_0,a_1,\ldots,a_{n-1}$ of real numbers is defined as $a_0+\frac{a_1}{2}+\cdots+\frac{a_{n-1}}{2^{n-1}}$. A subsequence of a sequence is obtained by deleting some elements from the sequence, keeping the order of the remaining elements the same. Let $X$ denote the maximum possible weight of a subsequence of $a_0,a_1,\ldots,a_{n-1}$ and $Y$ the maximum possible weight of a subsequence of $a_1,a_2,\ldots,a_{n-1}$. Then $X$ is equal to`,[
      raw`$\max(Y,a_0+Y)$`,raw`$\max\left(Y,a_0+\frac Y2\right)$`,raw`$\max(Y,a_0+2Y)$`,raw`$a_0+\frac Y2$`,
    ],{notes:['The printed key gives D, whereas the displayed maximum-subsequence formulation suggests option B. The source answer and all options are retained for review.']}),
    question(39,2010,2,matrix+raw`What is the minimum possible weight of a spanning tree $T$ in this graph such that vertex 0 is a leaf node in the tree $T$?`,['7','8','9','10']),
    question(40,2010,2,matrix+raw`What is the minimum possible weight of a path $P$ from vertex 1 to vertex 2 in this graph such that $P$ contains at most 3 edges?`,['7','8','9','10']),
    question(41,2011,1,'A max-heap is a heap where the value of each parent is greater than or equal to the value of its children. Which of the following is a max-heap?',[
      'IMG:greedy-3-41-A','IMG:greedy-3-41-B','IMG:greedy-3-41-C','IMG:greedy-3-41-D',
    ],{optLayout:'2col'}),
    question(42,2011,2,linkedGraph+raw`What will be the cost of the Minimum Spanning Tree (MST) of such a graph with $n$ nodes?`,[
      raw`$\frac1{12}(11n^2-5n)$`,'$n^2-n+1$','$6n-11$','$2n+1$',
    ],{diagram:'greedy-3-42-43-graph'}),
    question(43,2011,2,linkedGraph+raw`The length of the path from $v_5$ to $v_6$ in the MST of previous question with $n=10$ is`,['11','25','31','41'],{diagram:'greedy-3-42-43-graph'}),
    question(44,2012,2,raw`Let $G$ be a weighted graph with edge weights greater than one and $G'$ be the graph constructed by squaring the weights of edge in $G$. Let $T$ and $T'$ be the minimum spanning trees of $G$ and $G'$ respectively, with total weights $t$ and $t'$. Which of the following statements is TRUE?`,[
      raw`$T'=T$ with total weight $t'=t^2$`,raw`$T'=T$ with total weight $t'<t^2$`,raw`$T'\ne T$ but total weight $t'=t^2$`,'None of the above',
    ]),
    question(45,2012,2,raw`Consider the directed graph shown in the figure below. There are multiple shortest paths between vertices S and T. Which one will be reported by Dijkstra's shortest path algorithm? Assume that, in any iteration, the shortest path to a vertex $v$ is updated only when a strictly shorter path to $v$ is discovered.
[IMG_1]`,['SDT','SVDT','SACDT','SACET'],{diagram:'greedy-3-45-graph',notes:['Option B is printed SVDT although no vertex V is shown in the source graph; retained as printed.']}),
    question(46,2013,1,raw`Which one of the following is the tightest upper bound that represents the number of swaps required to sort $n$ numbers using selection sort?`,[raw`$O(\log n)$`,'$O(n)$',raw`$O(n\log n)$`,'$O(n^2)$']),
    question(47,2014,1,'A priority queue is implemented as a Max-Heap. Initially, it has 5 elements. The level-order traversal of the heap is: 10, 8, 5, 3, 2. Two new elements 1 and 7 are inserted into the heap in that order. The level-order traversal of the heap after the insertion of the elements is:',[
      '10, 8, 7, 3, 2, 1, 5','10, 8, 7, 2, 3, 1, 5','10, 8, 7, 1, 2, 3, 5','10, 8, 7, 5, 3, 2, 1',
    ],{setNum:'2'}),
    question(48,2014,1,raw`Consider the tree arcs of a BFS traversal from a source node $W$ in an unweighted, connected, undirected graph. The tree $T$ formed by the tree arcs is a data structure for computing`,[
      'The shortest path between every pair of vertices.','The shortest path from W to every vertex in the graph.','The shortest paths from W to only those nodes that are leaves of T.','The longest path in the graph.',
    ],{setNum:'2'}),
    question(49,2014,2,raw`Suppose $P,Q,R,S,T$ are sorted sequences having lengths 20, 24, 30, 35, 50 respectively. They are to be merged into a single sequence by merging together two sequences at a time. The number of comparisons that will be needed in the worst case by the optimal algorithm for doing this is ______.`,[],{setNum:'2'}),
    question(50,2015,2,raw`The graph shown below has 8 edges with distinct integer edge weights. The minimum spanning tree (MST) is of weight 36 and contains the edges: $\{(A,C),(B,C),(B,E),(E,F),(D,F)\}$. The edge weights of only those edges which are in the MST are given in the figure shown below. The minimum possible sum of weights of all 8 edges of this graph is ______.
[IMG_1]`,[],{setNum:'1',diagram:'greedy-3-50-graph'}),
    question(51,2015,2,raw`Consider a max heap, represented by the array:
40, 30, 20, 10, 15, 16, 17, 8, 4.
$$\begin{array}{c|rrrrrrrrr}\text{Array Index}&1&2&3&4&5&6&7&8&9\\\hline\text{Value}&40&30&20&10&15&16&17&8&4\end{array}$$
Now consider that a value 35 is inserted into this heap. After insertion, the new heap is`,[
      '40, 30, 20, 10, 15, 16, 17, 8, 4, 35','40, 35, 20, 10, 30, 16, 17, 8, 4, 15',
      '40, 30, 20, 10, 35, 16, 17, 8, 4, 15','40, 35, 20, 10, 15, 16, 17, 8, 4, 30',
    ],{setNum:'1'}),
    question(52,2015,1,'Consider the following array of elements (89, 19, 50, 17, 12, 15, 2, 5, 7, 11, 6, 9, 100).\nThe minimum number of interchanges needed to convert it into a max-heap is',['4','5','2','3'],{setNum:'3'}),
    question(53,2016,1,raw`Let $G$ be a weighted connected undirected graph with distinct positive edge weights. If every edge weight is increased by the same value, then which of the following statements is/are TRUE?
P: Minimum spanning tree of $G$ does not change
Q: Shortest path between any pair of vertices does not change`,['P only','Q only','Neither P nor Q','Both P and Q'],{setNum:'1'}),
    question(54,2016,2,raw`Let $G$ be a complete undirected graph on 4 vertices, having 6 edges with weights being 1, 2, 3, 4, 5, and 6. The maximum possible weight that a minimum weight spanning tree of $G$ can have is ______.`,[],{setNum:'1'}),
    question(55,2016,2,raw`$G=(V,E)$ is an undirected simple graph in which each edge has a distinct weight, and $e$ is a particular edge of $G$. Which of the following statements about the minimum spanning trees (MSTs) of $G$ is/are TRUE?
I. If $e$ is the lightest edge of some cycle in $G$, then every MST of $G$ includes $e$.
II. If $e$ is the heaviest edge of some cycle in $G$, then every MST of $G$ excludes $e$.`,['I only','II only','Both I and II','Neither I nor II'],{setNum:'1'}),
    question(56,2016,2,raw`An operator $delete(i)$ for a binary heap data structure is to be designed to delete the item in the $i$-th node. Assume that the heap is implemented in an array and $i$ refers to the $i$-th index of the array. If the heap tree has depth $d$ (number of edges on the path from the root to the farthest leaf), then what is the time complexity to re-fix the heap efficiently after the removal of the element?`,[
      '$O(1)$','$O(d)$ but not $O(1)$','$O(2^d)$ but not $O(d)$','$O(d2^d)$ but not $O(2d)$',
    ],{setNum:'1'}),
    question(57,2016,2,'A complete binary min-heap is made by including each integer in [1, 1023] exactly once. The depth of a node in the heap is the length of the path from the root of the heap to that node. Thus, the root is at depth 0. The maximum depth at which integer 9 can appear is ______.',[],{setNum:'2'}),
    question(58,2017,2,raw`Let $G=(V,E)$ be any connected undirected edge-weighted graph. The weights of the edges in $E$ are positive and distinct. Consider the following statements:
I. Minimum Spanning Tree of $G$ is always unique.
II. Shortest path between any two vertices of $G$ is always unique.
Which of the above statements is/are necessarily true?`,['I only','II only','Both I and II','Neither I nor II'],{setNum:'1'}),
    question(59,2017,2,raw`A message is made up entirely of characters from the set $X=\{P,Q,R,S,T\}$. The table of probabilities for each of the characters is shown below:
$$\begin{array}{c|c}\text{Character}&\text{Probability}\\\hline P&0.22\\Q&0.34\\R&0.17\\S&0.19\\T&0.08\\\hline\text{Total}&1.00\end{array}$$
If a message of 100 characters from $X$ is encoded using Huffman coding, then the expected length of the encoded message in bits is ______.`,[],{setNum:'2'}),
    question(60,2018,2,raw`Consider the weights and values of items listed below. Note that there is only one unit of each item.
$$\begin{array}{c|c|c}\text{Item Number}&\text{Weight in (Kgs)}&\text{Value in (Rupees)}\\\hline1&10&60\\2&7&28\\3&4&20\\4&2&24\end{array}$$
The task is to pick a subset of these items such that their total weight is not more than 11 Kgs and their total value is maximized. Moreover, no item may be split. The total value of items picked by an optimal algorithm is denoted by $V_{\mathrm{opt}}$. A greedy algorithm sorts the items by their value-to-weight ratios in descending order and packs them greedily, starting from the first item in the ordered list. The total value of items picked by the greedy algorithm is denoted by $V_{\mathrm{greedy}}$.
The value of $V_{\mathrm{opt}}-V_{\mathrm{greedy}}$ is ______.`),
    question(61,2018,2,raw`Consider the following undirected graph $G$:
[IMG_1]
Choose a value of $x$ that will maximize the number of minimum weight spanning trees (MWSTs) of $G$. The number of MWSTs of $G$ for this value of $x$ is ______.`,[],{diagram:'greedy-3-61-graph'}),
    question(62,2019,2,raw`Let $G$ be any connected, weighted, undirected graph:
I. $G$ has a unique minimum spanning tree, if no two edges of $G$ have the same weight.
II. $G$ has a unique minimum spanning tree, if for every cut $G$, there is a unique minimum weight edge crossing the cut.
Which of the above two statements is/are TRUE?`,['Neither I nor II','I only','II only','Both I and II']),
    question(63,2020,2,'Consider the array representation of a binary min-heap containing 1023 elements. The minimum number of comparisons required to find the maximum in the heap ______.'),
    question(64,2020,2,raw`Let $G=(V,E)$ be a weighted undirected graph and let $T$ be a Minimum Spanning Tree (MST) of $G$ maintained using adjacency lists. Suppose a new weighted edge $(u,v)\in V\times V$ is added to $G$. The worst case time complexity of determining if $T$ is still an MST of the resultant graph is`,[
      raw`$\Theta(|E||V|)$`,raw`$\Theta(|V|)$`,raw`$\Theta(|E|+|V|)$`,raw`$\Theta(|E|\log|V|)$`,
    ]),
    question(65,2020,2,raw`Consider a graph $G=(V,E)$, where $V=\{v_1,v_2,\ldots,v_{100}\}$, $E=\{(v_i,v_j)\mid1\le i<j\le100\}$ and weight of the edge $(v_i,v_j)$ is $|i-j|$. The weight of minimum spanning tree of $G$ is ______.`),
    question(66,2020,2,raw`Let $G=(V,E)$ be a directed, weighted graph with weight function $w:E\to\mathbb{R}$. For some function $f:V\to\mathbb{R}$, for each edge $(u,v)\in E$, define $w'(u,v)$ as $w(u,v)+f(v)$.
Which one of the options completes the following sentence so that it is TRUE?
"The shortest paths in $G$ under $w$ are shortest paths under $w'$ too, ______."`,[
      raw`if and only if $f(u)$ is the distance from $s$ to $u$ in the graph obtained by adding a new vertex $s$ to $G$ and edges of zero weight from $s$ to every vertex of $G$`,
      raw`if and only if $\forall u\in V$, $f(u)$ is positive`,
      raw`if and only if $\forall u\in V$, $f(u)$ is negative`,
      raw`for every $f:V\to\mathbb{R}$`,
    ],{notes:["The scan prints w'(u,v)=w(u,v)+f(v), with no -f(u) term; the supplied key gives D. This source formula/key inconsistency is preserved rather than silently repaired."]}),
    question(67,2021,2,raw`Define $R_n$ to be the maximum amount earned by cutting a rod of length $n$ meters into one or more pieces of integer length and selling them. For $i>0$, let $p[i]$ denote the selling price of a rod whose length is $i$ meters. Consider the array of prices:
$p[1]=1,\ p[2]=5,\ p[3]=8,\ p[4]=9,$
$p[5]=10,\ p[6]=17,\ p[7]=18$
Which of the following statements is/are correct about $R_7$?`,[
      '$R_7=19$','$R_7=18$','$R_7$ is achieved by three different solutions.','$R_7$ cannot be achieved by a solution consisting of three pieces.',
    ],{setNum:'1'}),
    question(68,2021,1,raw`Consider the following undirected graph with edge weights as shown:
[IMG_1]
The number of minimum-weight spanning trees of the graph is ______.`,[],{setNum:'1',diagram:'greedy-3-68-graph'}),
    question(69,2021,1,raw`In a directed acyclic graph with a source vertex $s$, the quality-score of a directed path is defined to be the product of the weights of the edges on the path. Further, for a vertex $v$ other than $s$, the quality-score of $v$ is defined to be the maximum among the quality-scores of all the paths from $s$ to $v$. The quality-score of $s$ is assumed to be 1.
[IMG_1]
The sum of the quality-scores of all the vertices in the graph shown above is ______.`,[],{setNum:'2',diagram:'greedy-3-69-graph'}),
    question(70,2021,1,raw`Let $H$ be a binary min-heap consisting of $n$ elements implemented as an array. What is the worst case time complexity of an optimal algorithm to find the maximum element in $H$?`,[
      raw`$\Theta(\log n)$`,raw`$\Theta(1)$`,raw`$\Theta(n\log n)$`,raw`$\Theta(n)$`,
    ],{setNum:'2'}),
    question(71,2021,2,raw`Consider the following directed graph:
[IMG_1]
Which of the following is/are correct about the graph?`,[
      'The graph does not have a topological order.',
      'A depth-first traversal starting at vertex S classifies three directed edges as back edges.',
      raw`For each pair of vertices $u$ and $v$, there is a directed path from $u$ to $v$.`,
      'The graph does not have a strongly connected component.',
    ],{setNum:'2',diagram:'greedy-3-71-graph'}),
    question(72,2021,2,raw`Consider the string abbccdddeee. Each letter in the string must be assigned a binary code satisfying the following properties:
1. For any two letters, the code assigned to one letter must not be a prefix of the code assigned to the other letter.
2. For any two letters of the same frequency, the letter which occurs earlier in the dictionary order is assigned a code whose length is at most the length of the code assigned to the other letter.
Among the set of all binary code assignments which satisfy the above two properties, what is the minimum length of the encoded string?`,['23','25','21','30'],{setNum:'2'}),
    question(73,2021,1,raw`Let $G$ be a connected undirected weighted graph. Consider the following two statements.
$S_1$: There exists a minimum weight edge in $G$ which is present in every minimum spanning tree of $G$.
$S_2$: If every edge in $G$ has distinct weight, then $G$ has a unique minimum spanning tree.
Which one of the following options is correct?`,[
      '$S_1$ is false and $S_2$ is true.','Both $S_1$ and $S_2$ are false.','$S_1$ is true and $S_2$ is false.','Both $S_1$ and $S_2$ are true.',
    ],{setNum:'2'}),
    question(74,2022,2,raw`Consider a simple undirected weighted graph $G$, all of whose edge weights are distinct. Which of the following statements about the minimum spanning trees of $G$ is/are TRUE?`,[
      'The edge with the second smallest weight is always part of any minimum spanning tree of G.',
      'One or both of the edges with the third smallest and the fourth smallest weights are part of any minimum spanning tree of G.',
      raw`Suppose $S\subseteq V$ be such that $S\ne\varnothing$ and $S\ne V$. Consider the edge with the minimum weight such that one of its vertices is in $S$ and the other in $V\setminus S$. Such an edge will always be part of any minimum spanning tree of $G$.`,
      'G can have multiple minimum spanning trees.',
    ]),
    question(75,2022,2,raw`Let $G(V,E)$ be a directed graph, where $V=\{1,2,3,4,5\}$ is the set of vertices and $E$ is the set of directed edges, as defined by the following adjacency matrix $A$.
$$A[i][j]=\begin{cases}1,&1\le j\le i\le5\\0,&\text{otherwise}\end{cases}$$
$A[i][j]=1$ indicates a directed edge from node $i$ to node $j$. A directed spanning tree of $G$, rooted at $r\in V$, is defined as a subgraph $T$ of $G$ such that the undirected version of $T$ is a tree, and $T$ contains a directed path from $r$ to every other vertex in $V$. The number of such directed spanning trees rooted at vertex 5 is ______.`),
    question(76,2023,1,raw`Which one of the following sequences when stored in an array at locations $A[1],\ldots,A[10]$ forms a max-heap?`,[
      '23, 17, 10, 6, 13, 14, 1, 5, 7, 12','23, 17, 14, 7, 13, 10, 1, 5, 6, 12',
      '23, 17, 14, 6, 13, 10, 1, 5, 7, 15','23, 14, 17, 1, 10, 13, 16, 12, 7, 5',
    ]),
    question(77,2023,2,raw`Let $A$ be a priority queue for maintaining a set of elements. Suppose $A$ is implemented using a max-heap data structure. The operation Extract-Max$(A)$ extracts and deletes the maximum element from $A$. The operation Insert$(A,\mathrm{key})$ inserts a new element key in $A$. The properties of a max-heap are preserved at the end of each of these operations.
When $A$ contains $n$ elements, which one of the following statements about the worst case running time of these two operations is TRUE?`,[
      raw`Both Extract-Max$(A)$ and Insert$(A,\mathrm{key})$ run in $O(1)$.`,
      raw`Both Extract-Max$(A)$ and Insert$(A,\mathrm{key})$ run in $O(\log(n))$.`,
      raw`Extract-Max$(A)$ runs in $O(1)$ whereas Insert$(A,\mathrm{key})$ runs in $O(n)$.`,
      raw`Extract-Max$(A)$ runs in $O(1)$ whereas Insert$(A,\mathrm{key})$ runs in $O(\log(n))$.`,
    ]),
    question(78,2024,1,raw`The number of spanning trees in a complete graph of 4 vertices labelled $A,B,C$, and $D$ is ______.`,[],{setNum:'1'}),
    question(79,2024,2,raw`The number of edges present in the forest generated by the DFS traversal of an undirected graph $G$ with 100 vertices is 40. The number of connected components in $G$ is ______.`,[],{setNum:'1'}),
    question(80,2024,2,raw`Let $G$ be a directed graph and $T$ a depth first search (DFS) spanning tree in $G$ that is rooted at a vertex $u$. Suppose $T$ is also a breadth first search (BFS) tree in $G$, rooted at $u$. Which of the following statements is/are TRUE for every such graph $G$ and tree $T$?`,[
      'The only edges in G are the edges in T.','There are no cross-edges in G with respect to the tree T.','There are no back-edges in G with respect to the tree T.','There are no forward-edges in G with respect to the tree T.',
    ],{setNum:'1'}),
  ],
};
