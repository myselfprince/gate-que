const raw = String.raw;
const sourceHash = '4e81d5c512edbe016342f79be6bcde4e2c53124be6af9db2a1c6b439f84417b3';
// Complete printed key: PDF 2, book 405. Q6.1 refers to its printed solution.
const answers = ['', 'C','C','D','B','D','D','B','D','D','C','D','C','C','B','C','19','6','31','B','D','A','80','A','5040'];
function question(number, year, marks, text, options = [], extra = {}) {
  const {notes = [], ...fields} = extra;
  const bookPages = [number <= 6 ? 402 : number <= 16 ? 403 : 404];
  const answer = answers[number-1];
  return {
    id: `madeeasy-data-structures-graphs-6-${number}`, text, code: '', year: String(year), marks: String(marks), setNum: '',
    rawTopic: 'Graphs', diagram: '', ext: '.png',
    optA: options[0] || '', optB: options[1] || '', optC: options[2] || '', optD: options[3] || '',
    questionType: options.length ? 'MCQ' : 'NAT', correctOptions: options.length ? [...answer] : [], natAnswer: options.length ? '' : answer,
    isBlank: false, isPosLocked: false, isCodeOptions: false, isProof: false, needsManualOptionFix: false, optLayout: 'auto', tempPaste: '', ...fields,
    source: {
      file: '6. Data Structures/5. Graphs.pdf', sha256: sourceHash, questionNumber: `6.${number}`,
      bookPages, pdfPages: [number <= 16 ? 1 : 2], answerKeyPdfPage: 2,
      notes: ['Answer transcribed from the printed Graphs key, PDF page 2 / book page 405.', ...notes],
    },
  };
}
export const DATA_STRUCTURES_GRAPHS_IMPORT = {
  subject: '6. Data Structures', chapter: '5. Graphs', sourceHash,
  questions: [
    question(1,1998,2,'Write the adjacency matrix representation of the graph given in figure.\n[IMG_1]',[],{
      diagram:'graphs-6-1',questionType:'SUBJECTIVE',isProof:true,
      natAnswer:raw`$\begin{array}{c|ccccc} & P_1 & P_2 & P_3 & P_4 & P_5 \\ \hline P_1 & 0 & 1 & 0 & 0 & 0 \\ P_2 & 0 & 0 & 0 & 1 & 0 \\ P_3 & 1 & 0 & 0 & 0 & 0 \\ P_4 & 0 & 0 & 1 & 0 & 1 \\ P_5 & 1 & 1 & 0 & 0 & 0 \end{array}$`,
      notes:['Subjective matrix question; the key says Sol. Matrix transcribed from Q6.1 solution on PDF 2 / book 405, in row/column order P1,P2,P3,P4,P5.','Printed diagram and printed solution matrix disagree (e.g. horizontal P2-to-P5 arrow versus matrix P5-to-P2). Both retained literally; no corrected matrix invented.'],
    }),
    question(2,2000,2,raw`Let G be an undirected graph. Consider a depth-first traversal of G, and let T be the resulting depth-first search tree. Let u be a vertex in G and let v be the first new (unvisited) vertex visited after visiting u in the traversal. Which of the following statements is always true?`,[
      raw`$\{u,v\}$ must be an edge in G, and u is a descendant of v in T`,
      raw`$\{u,v\}$ must be an edge in G, and v is a descendant of u in T`,
      raw`If $\{u,v\}$ is not an edge in G then u is a leaf in T`,
      raw`If $\{u,v\}$ is not an edge in G then u and v must have the same parent in T`,
    ]),
    question(3,2001,2,raw`Consider an undirected unweighted graph G. Let a breadth-first traversal of G be done starting from a node r. Let d(r, u) and d(r, v) be the lengths of the shortest paths from r to u and v respectively in G. If u is visited before v during the breadth-first traversal, which of the following statement is correct?`,[
      '$d(r,u)<d(r,v)$','$d(r,u)>d(r,v)$',raw`$d(r,u)\le d(r,v)$`,'None of these',
    ]),
    question(4,2003,1,`Consider the following graph:\n[IMG_1]\nAmong the following sequences:\n1. a b e g h f\n2. a b f e h g\n3. a b f h g e\n4. a f g h b e\nWhich are depth first traversals of the above graph?`,[
      '1, 2 and 4 only','1 and 4 only','2, 3 and 4 only','1, 3 and 4 only',
    ],{diagram:'graphs-6-4',notes:['Question starts in left column and continues at top of right column on book page 402.']}),
    question(5,2003,2,raw`Let $G=(V,E)$ be an undirected graph with a subgraph $G_1=(V_1,E_1)$. Weights are assigned to edges of G as follows:
$$w(e)=\begin{cases}0 & \text{if }e\in E_1\\1 & \text{otherwise}\end{cases}$$
A single-source shortest path algorithm is executed on the weighted graph $(V,E,\mathbf{w})$ with an arbitrary vertex $v_1$ of $V_1$ as the source. Which of the following can always be inferred from the path costs computed?`,[
      raw`The number of edges in the shortest paths from $v_1$ to all vertices of G`,
      '$G_1$ is connected','$V_1$ forms a clique in G','$G_1$ is a tree',
    ]),
    question(6,2003,2,raw`Let $G=(V,E)$ be a direction graph with n vertices. A path from $v_i$ to $v_j$ in G is sequence of vertices $(v_i,v_{i+1},\ldots,v_j)$ such that $(v_k,v_{k+1})\in E$ for all k in i through $j-1$. A simple path is a path in which no vertex appears more than once. Let A be an $n\times n$ array initialized as follow:
$$A[j,k]=\begin{cases}1 & \text{if }(j,k)\in E\\0 & \text{otherwise}\end{cases}$$
Consider the following algorithm:
[CODE]
Which of the following statements is necessarily true for all j and k after terminal of the above algorithm?`,[
      raw`$A[j,k]\le n$`,
      raw`If $A[j,j]\ge n-1$, then G has a Hamiltonian cycle`,
      'If there exists a path from j to k, A[j, k] contains the longest path lengths from j to k',
      'If there exists a path from j to k, every simple path from j to k contain most A[j, k] edges',
    ],{code:`for i = 1 to n
    for j = 1 to n
        for k = 1 to n
            A[j, k] = max(A[j, k], (A[j, i] + A[i, k]));`,notes:['Printed wording "direction graph", "after terminal" and "contain most" preserved.']}),
    question(7,2005,1,'In a depth-first traversal of a graph G with n vertices, k edges are marked as tree edges. The number of connected components in G is',[
      '$k$','$k+1$','$n-k-1$','$n-k$',
    ]),
    question(8,2005,2,raw`Let G be a directed graph whose vertex set is the set of numbers from 1 to 100. There is an edge from a vertex i to a vertex j iff either $j=i+1$ or $j=3i$. The minimum number of edges in a path in G from vertex 1 to vertex 100 is`,['4','7','23','99']),
    question(9,2006,2,'Let T be a depth first search tree in a undirected graph G. Vertices u and v are leaves of this tree T. The degrees of both u and v in G are at least 2. Which one of the following statements is true?',[
      'There must exist a vertex w adjacent to both u and v in G',
      'There must exist a vertex whose removal disconnects u and v in G',
      'There must exist a cycle in G containing u and v',
      'There must exist a cycle in G containing u and all its neighbours in G',
    ]),
    question(10,2006,2,raw`Consider the depth-first-search of an undirected graph with 3 vertices P, Q, and R. Let discovery time d(u) represent the time instant when the vertex u is first visited, and finish time f(u) represent the time instant when the vertex u is last visited. Given that
$d(P)=5$ units, $f(P)=12$ units
$d(Q)=6$ units, $f(Q)=10$ units
$d(R)=14$ unit, $f(R)=18$ units
Which one of the following statements is TRUE about the graph?`,[
      'There is only one connected component',
      'There are two connected components, and P and R are connected',
      'There are two connected components, and Q and R are connected',
      'There are two connected components, and P and Q are connected',
    ],{notes:['Printed "with 3 vertices" and discovery/finish times retained literally; times exceed a standard three-vertex DFS clock.']}),
    question(11,2007,2,'What is the largest integer m such that every simple connected graph with n vertices and n edges contains at least m different spanning trees?',['1','2','3','n']),
    question(12,2007,2,'A depth-first search is performed on a directed acyclic graph. Let d[u] denote the time at which the vertex u is visited for the first time and f[u] denote the time at which the dfs call to the vertex u terminates. Which of the following statements is always true for all edges (u, v) in the graph?',[
      '$d[u]<d[v]$','$d[u]<f[v]$','$f[u]<f[v]$','$f[u]>f[v]$',
    ],{notes:['Statement continues from bottom of left column to top of right column on book page 403.']}),
    question(13,2008,1,'The most efficient algorithm for finding the number of connected components in an undirected graph on n vertices and m edges has time complexity.',[
      raw`$\Theta(n)$`,raw`$\Theta(m)$`,raw`$\Theta(m+n)$`,raw`$\Theta(mn)$`,
    ]),
    question(14,2008,1,'The Breadth First Search algorithm has been implemented using the queue data structure. One possible order of visiting the nodes of the following graph is\n[IMG_1]',[
      'MNOPQR','NQMPOR','QMNPRO','QMNPOR',
    ],{diagram:'graphs-6-14'}),
    question(15,2008,2,`Consider the following sequence of nodes for the undirected graph given below:\n[IMG_1]\n1. a b e f d g c\n2. a b e f c g d\n3. a d g e b c f\n4. a d b c g e f\nA Depth First Search (DFS) is started at node a. The nodes are listed in the order they are first visited. Which all of the above is (are) possible output(s)?`,[
      '1 and 3 only','2 and 3 only','2, 3 and 4 only','1, 2 and 3 only',
    ],{diagram:'graphs-6-15'}),
    question(16,2014,1,raw`Let G be a graph with n vertices and m edges. What is the tightest upper bound on the running time of Depth First Search on G, when G is represented as an adjacency matrix?`,[
      raw`$\Theta(n)$`,raw`$\Theta(n+m)$`,raw`$\Theta(n)^2$`,raw`$\Theta(m^2)$`,
    ],{setNum:'1',notes:['Option (c) prints the exponent outside the parentheses, Θ(n)²; retained as printed.']}),
    question(17,2014,1,'Suppose depth first search is executed on the graph below starting at some unknown vertex. Assume that a recursive call to visit a vertex is made only after first checking that the vertex has not been visited earlier. Then the maximum possible recursion depth (including the initial call) is.\n[IMG_1]',[],{diagram:'graphs-6-17',setNum:'3'}),
    question(18,2016,1,'Consider the following directed graph:\n[IMG_1]\nThe number of different topological ordering of the vertices of the graph is _____.',[],{diagram:'graphs-6-18',setNum:'1'}),
    question(19,2016,1,'Breadth First Search (BFS) is started on a binary tree beginning from the root vertex. There is a vertex t at a distance four from the root. If t is the n-th vertex in this BFS traversal, then the maximum possible value of n is _____.',[],{setNum:'2'}),
    question(20,2016,2,raw`In an adjacency list representation of an undirected simple graph $G=(V,E)$, each edge $(u,v)$ has two adjacency list entries: [v] in the adjacency list of u, and [u] in the adjacency list of v. These are called twins of each other. A twin pointer is a pointer from an adjacency list entry to its twin. If $|E|=m$ and $|V|=n$, and the memory size is not a constraint, what is the time complexity of the most efficient algorithm to set the twin pointer in each entry in each adjacency list?`,[
      raw`$\Theta(n^2)$`,raw`$\Theta(n+m)$`,raw`$\Theta(m^2)$`,raw`$\Theta(n^4)$`,
    ],{setNum:'2'}),
    question(21,2017,1,'The Breadth First Search (BFS) algorithm has been implemented using the queue data structure. Which one of the following is a possible order of visiting the nodes in the graph below?\n[IMG_1]',[
      'MNOPQR','NQMPOR','QMNROP','POQNMR',
    ],{diagram:'graphs-6-21',setNum:'2',notes:['Options continue at top of right column on book page 404.']}),
    question(22,2018,2,raw`Let G be a simple undirected graph. Let $T_D$ be a depth first search tree of G. Let $T_B$ be a breadth first search tree of G. Consider the following statements:
I. No edge of G is a cross edge with respect to $T_D$. (A cross edge in G is between two nodes neither of which is an ancestor of the other in $T_D$).
II. For every edge $(u,v)$ of G, if u is at depth i and v is at depth j in $T_B$, then $|i-j|=1$.
Which of the statements above must necessarily be true?`,['I only','II only','Both I and II','Neither I nor II']),
    question(23,2018,2,raw`The number of possible min-heaps containing each value from $\{1,2,3,4,5,6,7\}$ exactly once is _____.`),
    question(24,2021,2,raw`An articulation point in a connected graph is a vertex such that removing the vertex and its incident edges disconnects the graph into two or more connected components.
Let T be a DFS tree obtained by doing DFS in a connected undirected graph G.
Which of the following options is/are correct?`,[
      'Root of T is an articulation point in G if and only if it has 2 or more children.',
      'A leaf of T can be an articulation point in G.',
      'Root of T can never be an articulation point in G.',
      'If u is an articulation point in G such that x is an ancestor of u in T and y is a descendent of u in T, then all paths from x to y in G must pass through u.',
    ],{setNum:'1',questionType:'MSQ',notes:['2021 multiple-select question; the supplied key lists only (a), retained as the sole selected option.']}),
    question(25,2023,2,raw`Let $U=\{1,2,3\}$. Let $2^U$ denote the powerset of U. Consider an undirected graph G whose vertex set is $2^U$. For any $A,B\in 2^U$, $(A,B)$ is an edge in G if and only if (i) $A\ne B$, and (ii) either $A\subseteq B$ or $B\subseteq A$. For any vertex A in G, the set of all possible orderings in which the vertices of G can be visited in a Breadth First Search (BFS) starting from A is denoted by $B(A)$.
If $\phi$ denotes the empty set, then the cardinality of $B(\phi)$ is _____.`),
  ],
};
