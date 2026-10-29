const raw=String.raw;
const mcq=(text,options,subject)=>({text,optA:options[0],optB:options[1],optC:options[2],optD:options[3],subject});
export const additions={
9:mcq('A slow memory can be connected to 8085 by using',['INTR',raw`$\overline{\mathrm{RESET\ IN}}$`,'HOLD','READY'],'4. COA'),
15:mcq(raw`Consider an array representation of an $n$ element binary heap where the elements are stored from index 1 to index $n$ of the array. For the element stored at index $i$ of the array ($i\leq n$), the index of the parent is`,[raw`$i-1$`,raw`$\lfloor i/2\rfloor$`,raw`$\lceil i/2\rceil$`,raw`$(i+1)/2$`],'6. Data Structures'),
24:mcq('Suppose the adjacency relation of vertices in a graph is represented in a table Adj(X,Y). Which of the following queries cannot be expressed by a relational algebra expression of constant length?',['List all vertices adjacent to a given vertex','List all vertices which have self loops','List all vertices which belong to cycles of less than three vertices','List all vertices reachable from a given vertex'],'12. DBMS'),
25:mcq(raw`Let $r$ and $s$ be two relations over the relation schemes $R$ and $S$ respectively, and let $A$ be an attribute in $R$. Then the relational algebra expression $\sigma_{A=a}(r\bowtie s)$ is always equal to`,[raw`$\sigma_{A=a}(r)$`,'r',raw`$\sigma_{A=a}(r)\bowtie s$`,'None of the above'],'12. DBMS'),
41:mcq(raw`What is the minimum number of stacks of size $n$ required to implement a queue of size $n$?`,['One','Two','Three','Four'],'6. Data Structures'),
50:{...mcq(raw`Consider a relation geq which represents "greater than or equal to", that is, $(x,y)\in\mathrm{geq}$ only if $y\geq x$.
[CODE]
Which of the following is possible if a tuple $(x,y)$ is deleted?`,[raw`A tuple $(z,w)$ with $z>y$ is deleted`,raw`A tuple $(z,w)$ with $z>x$ is deleted`,raw`A tuple $(z,w)$ with $w<x$ is deleted`,raw`The deletion of $(x,y)$ is prohibited`],'12. DBMS'),code:'create table geq\n( lb integer not null,\n  ub integer not null,\n  primary key lb,\n  foreign key (ub) references geq on delete cascade\n)'}
};
export const objectiveAnswers={
1:['A',raw`For $n\geq2$, take $A=\mathrm{diag}(1,0)$ and $B=\mathrm{diag}(0,1)$: both singular, but $A+B=I$. Also $I$ and $-I$ are nonsingular but sum to zero. Both possibilities hold.`],
2:['B','R1 groups integers by parity; R3 groups nonzero rationals by sign. Both are equivalence relations. R2 is not reflexive, and R4 is not transitive: 1 relates to 3 and 3 to 5 but 1 does not relate to 5.'],
3:['A',raw`$F_1\equiv\neg P$ is satisfiable and $F_2\equiv\neg P\lor P$ is valid. A is the conventional intended answer. D is also logically true because every valid formula is satisfiable. Preserve the single-choice source; self-assess this defective MCQ after submission.`],
4:['A',raw`$S_1=(00)^+$ is regular. For $S_2$, a pumping-lemma argument on $0^p1^p0^{2p}$ changes the first block without changing the last block and violates the length constraint. Only S1 holds.`],
5:['B','Context-free languages are closed under union, but not under intersection or complement. Deterministic PDAs accept only the deterministic subclass.'],
6:['B',raw`Subset construction gives an upper bound of $2^N$ DFA states, and worst-case NFA families attain it. B is the intended worst-case answer. The printed phrase "maximum ... is at least" must not be read as a lower bound for every arbitrary NFA; many NFAs minimize to one DFA state.`],
7:['B','A cache block brings adjacent words together, exploiting spatial locality. Reusing the same word is temporal locality.'],
8:['D','Virtual memory supports larger address spaces and multiprogramming. Switching page tables and managing translations adds context-switch work; virtual memory does not generally reduce that overhead.'],
9:['D','READY inserts wait states while a slow memory completes a transfer. INTR requests an interrupt; HOLD requests the buses.'],
10:['D','A dedicated stack-pointer register is unnecessary: a general register or memory can implement a software stack, while link registers or saved return addresses support calls. Nested calls and interrupts remain possible. The supplied Made Easy chapter key prints A; this copy uses the independently justified D and records the conflict.'],
11:['A',raw`Use the don't-care cells to form the groups $xy$ and $y'z$. Their union covers all required ones and no required zeros, giving $xy+y'z$. Rows are yz and columns wx in the printed map.`],
12:['C','A software interrupt/trap transfers control to a privileged system handler, allowing a user program to request protected services.'],
13:['D','This question does not specify an instruction-set architecture. A one-way privilege drop can safely be non-privileged (the supplied Made Easy key D); other architectures use privileged return/control instructions (C). GATE Overflow discusses both. No architecture-independent single answer is established; self-assess this item.'],
14:['C',raw`Even random pivot choices can repeatedly select an extreme element. The worst recurrence is $T(n)=T(n-1)+\Theta(n)$, hence $\Theta(n^2)$; the expected complexity is different.`],
15:['B',raw`With 1-based heap indexing the children of node $j$ are $2j$ and $2j+1$, so the parent of a non-root index $i$ is $\lfloor i/2\rfloor$. Index 1 is the root and has no parent.`],
16:['B',raw`$f/g=n/(\log n)^9\to\infty$. Thus $g=O(f)$ and $f\notin O(g)$.`],
17:['C','Relocation assigns final load addresses and adjusts address-dependent code and data accordingly.'],
18:['A','An unambiguous grammar has a unique parse tree, with unique leftmost and rightmost derivations for a sentence. Their expansion orders need not be the same. LL(1) is top-down; LALR is stronger than SLR; an ambiguous grammar cannot be LR(k).'],
19:['B','Shortest-job-first completes short jobs earliest and is the conventional answer for maximizing completed jobs over an observation interval when runtimes are known. If throughput is measured only after all jobs finish and overheads are zero, work-conserving orders tie; that interpretation is a source-wording caveat.'],
20:['B','Swap space is disk-backed storage used to hold memory pages outside RAM.'],
21:['C',raw`FIFO can exhibit Belady's anomaly. For reference string 1,2,3,4,1,2,5,1,2,3,4,5 it has 9 faults with 3 frames and 10 with 4 frames.`],
22:['D','A disk needs a device driver to translate OS requests into controller operations. Registers, cache and main memory are directly managed by hardware.'],
23:['C','Each given dependency lies wholly in one component, so dependencies are preserved. The components share no attributes; their natural join is a Cartesian product and can add spurious tuples.'],
24:['D','Arbitrary reachability is transitive closure. A fixed-length relational algebra expression can combine only a bounded number of edges, whereas reachability may require an unbounded path. The other queries need bounded joins/selections.'],
25:['C',raw`A selection whose predicate uses only attributes of $r$ can be pushed below the natural join: $\sigma_{A=a}(r\bowtie s)=\sigma_{A=a}(r)\bowtie s$.`],
26:['B',raw`If the units digit is 0: $9\cdot8\cdot7=504$. If it is one of 2,4,6,8: $4\cdot8\cdot8\cdot7=1792$. Total $504+1792=2296$.`],
27:['C',raw`Take $A$ as the positive even integers and $B=C$ as the positive odd integers, giving an empty intersection with their union. For S2 choose $x=\sqrt2$, $y=-\sqrt2$, whose sum is zero.`],
28:['A',raw`Images preserve unions. Images need not preserve intersections: if distinct $a,b$ both map to 0, with $E=\{a\}$ and $F=\{b\}$, then $f(E\cap F)=\varnothing$ but $f(E)\cap f(F)=\{0\}$.`],
29:['B',raw`Assuming independent, uniformly distributed accident days, there are $7^7$ assignments and 7 favorable assignments. Probability $7/7^7=1/7^6$. The distribution assumption is implicit in the source.`],
30:['D','Use a product of residues: (number of a modulo 6, number of b modulo 8), giving 48 states. Every pair is reachable and any two pairs can be distinguished by appending suitable counts of a and b.'],
31:['D',raw`$L_3$ is the unary even-length language and is regular. Copy and even-palindrome languages $L_1,L_2$ are not regular, and unary square lengths $L_4$ are not eventually periodic, hence are not regular.`],
32:['B','Simulate M on w and accept when q is reached, so the property is semidecidable. Reduce halting to reaching a fresh halt state to prove undecidability.'],
33:['A',raw`At each rising edge the first flip-flop samples X, while the second samples $X\land\overline{Q_0}$ using the pre-edge value of $Q_0$. This generates a pulse at the first sampled rising X transition only, giving plot A. The source timing scale must be interpreted with setup/hold requirements; behavior in a violated setup window is not deterministic.`],
34:['A','Indirect addressing passes an array address as a parameter; indexed addressing selects array elements; base-register addressing supports relocating a program by changing its base.'],
35:['C',raw`$539=\mathtt{21B}_{16}$. With the implied 12-bit width, $2^{12}-539=3557=\mathtt{DE5}_{16}$. Wider representations sign-extend the leading D.`],
36:['C',raw`The first mux produces $x_1'$. The second selects between $x_1'$ and $x_1$, giving $f=x_1'x_2'+x_1x_2$, the XNOR function.`],
37:['B',raw`Tracing the shift register and XOR feedback gives $1\to2\to5\to3\to7\to6\to4\to1$. Thus option B matches the seven nonzero states.`],
38:['D','The 16-bit SP must reach the 16-bit MAR over the 8-bit bus in two cycles. Transfer r to MDR in one cycle; the memory write takes two more. SP decrements locally. Total 5 cycles (D). The supplied Made Easy control-unit key gives A (2); that ignores the required transfers and conflicts with the datapath and GATE Overflow analysis.'],
39:['C',raw`BFS discovers vertices in nondecreasing distance from the source. Earlier vertices can be in the same layer, so only $d(r,u)\leq d(r,v)$ is guaranteed for reached vertices.`],
40:['D',raw`Each of the $\binom n2=n(n-1)/2$ possible unordered distinct vertex pairs independently has or lacks an edge. Hence $2^{n(n-1)/2}$ labeled simple undirected graphs.`],
41:['B','Use two stacks: push into an input stack, and when the output stack empties, reverse the input stack into it. Pop from the output stack. This assumes stacks as the only unbounded auxiliary storage, without using recursive call-stack storage as a hidden second stack.'],
42:['B','The formal x aliases caller y=3; formals y and z both alias caller x. y=y+4 changes caller x to 14; z=x+y+z then sets caller x to 3+14+14=31. Caller y remains 3.'],
43:['C','P1 returns the address of a local automatic variable whose lifetime ends on return. P2 dereferences an uninitialized pointer. P3 allocates heap storage and is valid under the usual successful-allocation assumption; the caller must later free it.'],
44:['D','D creates a local n=3 and passes that variable by reference to W. Incrementing x changes it to 4, which is printed. Since 4 is not listed, select D. Dynamic scope does not redirect this explicit reference to the global n.'],
45:['C','Device, timer and power-failure signals can interrupt the current execution. The scheduler runs after control has entered the OS; it is not itself the interrupt source. The supplied Made Easy key prints A, which conflicts with this interpretation and the GATE Overflow discussion.'],
46:['C',raw`The virtual page count is $2^{32}/2^{12}=2^{20}$. Physical memory has $2^{26}/2^{12}=2^{14}$ frames, requiring at least 14 frame bits, rounded to a 2-byte entry in this estimate. The table is approximately $2^{20}\cdot2=2$ MiB; actual implementations may use larger entries.`],
47:['B','Process i waits when j wants to enter and turn favors j: flag[j] is true AND turn=j. Both variables are necessary for the Peterson tie-break rule under its atomic sequentially consistent model.'],
48:['C',raw`For $AB\to C$ and $C\to AD$, candidate keys include AB and BC. C is not a superkey because it cannot determine B, so $C\to AD$ violates BCNF. Decomposing into CAD and BC loses the ability to enforce $AB\to C$ locally. The other options have dependency-preserving BCNF decompositions.`],
49:['C','C is the conventional key: complementing R1 over an unrestricted universe is unsafe. However B is also unsafe when R1 has no tuple with A="x": its implication is vacuously true for every t, yielding an unbounded answer. Preserve all four expressions and self-assess this defective single-choice question.'],
50:['C',raw`Cascade follows referencing rows, possibly through several levels. A legal chain (1,2),(2,3),(3,4),(4,4) satisfies $y\geq x$. Deleting (3,4) removes (2,3) and then (1,2). For the last row, $w=2<x=3$, so C is possible. The relation name and prose "greater than" conflict with the printed inequality; this solution follows the explicit $y\geq x$.`]
};
const written=(subject,text,referenceAnswer,code='',diagram='')=>({subject,text,referenceAnswer,code,diagram});
export const descriptive={
51:written('1. Discrete Maths',raw`Answer the following:
(a) Prove that $\operatorname{powerset}(A\cap B)=\operatorname{powerset}(A)\cap\operatorname{powerset}(B)$.
(b) Let $\operatorname{sum}(n)=0+1+2+\cdots+n$ for all natural numbers $n$. Give an induction proof that for all natural numbers $m,n$:
$$\operatorname{sum}(m+n)=\operatorname{sum}(m)+\operatorname{sum}(n)+mn.$$`,raw`(a) For every set X, $X\subseteq A\cap B$ iff both $X\subseteq A$ and $X\subseteq B$. Thus membership in the left powerset is equivalent to membership in both right powersets.
(b) Fix m and induct on n. At n=0 both sides are sum(m). Assuming the identity at n, sum(m+n+1)=sum(m+n)+m+n+1 = sum(m)+sum(n)+mn+m+n+1 = sum(m)+sum(n+1)+m(n+1). Therefore it holds for every m,n.`),
52:written('1. Discrete Maths',raw`Consider $h:\mathbb N\times\mathbb N\to\mathbb N$ defined by $h(a,b)=(2a+1)2^b-1$, where $\mathbb N=\{0,1,2,\ldots\}$.
(a) Prove h is an injection (one-one).
(b) Prove h is a surjection (onto).`,raw`Every positive integer has a unique factorization into an odd positive factor and a power of 2. If h(a,b)=h(c,d), then $(2a+1)2^b=(2c+1)2^d$, so uniqueness gives b=d and a=c. For any n in N write $n+1=u2^b$ with u odd, then $a=(u-1)/2$ is a natural number and h(a,b)=n. This also gives an explicit inverse.`),
53:written('2. TOC',raw`Construct DFAs for the following languages:
(a) $L=\{w\in\{a,b\}^*:w\text{ has baab as a substring}\}$.
(b) $L=\{w\in\{a,b\}^*:w\text{ has an odd number of a's and an odd number of b's}\}$.`,raw`(a) States 0,1,2,3,4 record the longest suffix matching a prefix of baab; start 0, accepting absorbing state 4. Transition table (state: on a, on b): 0:0,1; 1:2,1; 2:3,1; 3:0,4; 4:4,4. These transitions fully specify the DFA.
(b) States EE,OE,EO,OO record parity of (a-count,b-count). Start EE, accept only OO. Input a toggles the first parity; input b toggles the second. All other transitions follow these toggles.`),
54:written('2. TOC',raw`Give a deterministic PDA for $L=\{a^ncb^{2n}:n\geq1\}$ over $\Sigma=\{a,b,c\}$. Specify the acceptance state.`,raw`Use bottom symbol Z and stack symbol X. Start q0; require a first a, pushing XX, and enter qA. Every additional a in qA pushes two more X. On c enter qB without changing the stack. Each b in qB pops one X. When only Z remains, take an epsilon transition to final qF. qF has no input transitions. Accept by final state with all input consumed. Undefined transitions reject. No epsilon move is available in qB with X on top, so the machine is deterministic, and the first-a requirement excludes n=0.`),
55:written('2. TOC',raw`Let decision problem X be: given a Turing machine M over $\Sigma$ and a word $w\in\Sigma^*$, does M loop forever on w? You may assume the halting problem is undecidable but partially decidable.
(a) Show X is undecidable.
(b) Show X is not even partially decidable.`,raw`X is exactly the complement of the halting problem. A decider for X could be negated to decide halting, a contradiction. If X also had a recognizer, dovetail it with the halting recognizer on the same instance. Exactly one would eventually accept, deciding halting. Therefore the nonhalting language is neither decidable nor semidecidable.`),
56:written('4. COA',raw`Consider a disk with following specifications: 20 surfaces, 1000 tracks/surface, 16 sectors/track, data density 1 KB/sector, rotation speed 3000 rpm. The operating system initiates the transfer between the disk and the memory sector-wise. Once the head has been placed on the right track, the disk reads a sector in a single scan. It reads bits from the sector while the head is passing over the sector. The read bits are formed into bytes in a serial-in-parallel-out buffer and each byte is then transferred to memory. The disk writing is exactly a complementary process.
For parts (c) and (d) below, assume memory read-write time = 0.1 micro-second/byte, interrupt driven transfer has an interrupt overhead = 0.4 micro-second, the DMA initialization and termination overhead is negligible compared to the total sector transfer time. DMA requests are always granted.
(a) What is the total capacity of the disk?
(b) What is the data transfer rate?
(c) What is the percentage of time the CPU is required for this disk I/O for byte-wise interrupt driven transfer?
(d) What is the maximum percentage of time the CPU is held up for this disk I/O for cycle-stealing DMA transfer?`,raw`Using 1 KB=1024 bytes: (a) $20\cdot1000\cdot16=320000$ KB = 327680000 bytes =312.5 MiB. (b) 3000 rpm=50 rotations/s; rate $50\cdot16\cdot1024=819200$ bytes/s (800 KiB/s). (c) Each byte consumes 0.4+0.1=0.5 microsecond CPU time, so utilization is $819200\cdot0.5\cdot10^{-6}=40.96\%$. (d) DMA steals one 0.1-microsecond memory cycle per byte, hence $819200\cdot0.1\cdot10^{-6}=8.192\%$. Decimal KB conventions give slightly different percentages; state the unit convention.`),
57:written('4. COA',raw`A CPU has 32-bit memory address and a 256 KB cache memory. The cache is organized as a 4-way set-associative cache with cache block size of 16 bytes.
(a) What is the number of sets in the cache?
(b) What is the size (in bits) of the tag field per cache block?
(c) What is the number and size of comparators required for tag matching?
(d) How many address bits are required to find the byte offset within a cache block?
(e) What is the total amount of extra memory (in bytes) required for the tag bits?`,raw`(a) Blocks=$2^{18}/2^4=2^{14}$; sets=$2^{14}/4=2^{12}=4096$. (b) Offset 4 bits and set index 12 bits leave $32-4-12=16$ tag bits. (c) Four parallel 16-bit equality comparators. (d) Four offset bits. (e) $2^{14}\cdot16/8=32768$ bytes=32 KiB for tags alone; valid/dirty/replacement bits are excluded because the question asks only for tag bits.`),
58:written('9. Digital Logic',raw`Answer the following:
(a) Is the 3-variable function $f=\Sigma(0,1,2,4)$ self-dual? Justify.
(b) Give a minimal product-of-sum form of the $b_3$ output of the following excess-3 to BCD converter.
[IMG_1]`,raw`(a) Yes. Complementary input pairs are (0,7),(1,6),(2,5),(3,4). In each pair exactly one minterm belongs to f, so $f(x)=\neg f(\neg x)$.
(b) Let $a_4,a_3,a_2,a_1$ have weights 8,4,2,1 and let $b_3$ be the BCD 4's bit. It is 1 at excess-3 inputs 7,8,9,10 and 0 at 3,4,5,6,11,12. Inputs 0,1,2,13,14,15 are don't-cares. A minimized POS is $b_3=(a_4+a_2)(a_3'+a_1)(a_3+a_2'+a_1')$. Exhaustive clause-cover minimization gives three clauses and seven literals; all ten valid digits agree.`, '', 'q58-converter'),
59:written('9. Digital Logic',raw`A sequential circuit takes an input stream of 0's and 1's and produces an output stream of 0's and 1's. Initially it replicates the input on its output until two consecutive 0's are encountered on the input. From then onward it produces an output stream which is the bit-wise complement of input stream until it encounters two consecutive 1's, whereupon the process repeats. An example of input and output stream is shown below.
The input stream: 101100|01001011|011
The desired output: 101100|10110100|011
S-K master-slave flip-flops are to be used to design the circuit.
(a) Give the state transition diagram.
(b) Give the minimized sum-of-product expressions for J and K inputs of one of its state flip-flops.`,raw`Interpret the inconsistent printed S-K/J,K notation as J-K flip-flops. Use A=00 (copy, no preceding 0), B=01 (copy, preceding 0), C=10 (invert, no preceding 1), D=11 (invert, preceding 1). Start A. Transitions labeled input/output: A:0/0 to B,1/1 to A; B:0/0 to C,1/1 to A; C:0/1 to C,1/0 to D; D:0/1 to C,1/0 to A. Thus the mode changes after the triggering pair, as in the example. For mode flip-flop M and second bit R, $J_M=R x'$ and $K_M=R x$. For completeness $J_R=M'x'+Mx$, $K_R=1$, and output $y=M\oplus x$. These equations implement the specified transition graph.`),
60:written('4. COA',raw`Consider a 5-stage pipeline IF (Instruction Fetch), ID (Instruction Decode and register read), EX (Execute), MEM (Memory), WB (Write Back). All memory or register reads take place in the second phase of a clock cycle, and writes in the first phase. Consider:
[CODE]
(a) Show all data dependencies between the four instructions.
(b) Identify data hazards.
(c) Can all hazards be avoided by forwarding?`,raw`RAW dependencies: I1 to I2 on r2, I1 to I3 on r2, I2 to I4 on r4, and I1 to I4 on r2. WAR name dependencies: I1 to I2 on r4, I1 to I4 on r3, and I2 to I4 on r3. I3 stores to memory and does not overwrite r2, so no WAW dependency exists here. In an in-order five-stage pipeline WAR creates no actual hazard. I1/I2, I1/I3 and I2/I4 overlap before ordinary register write-back and require forwarding; I1's write and I4's register read can share a cycle because writes precede reads. Full EX and store-data forwarding removes these RAW stalls; this assumes the forwarding network includes the store-data path. No load-use hazard occurs.`, 'I1: sub r2, r3, r4     /* r2 <- r3-r4 */\nI2: sub r4, r2, r3     /* r4 <- r2-r3 */\nI3: sw  r2, 100(r1)    /* M[r1+100] <- r2 */\nI4: sub r3, r4, r2     /* r3 <- r4-r2 */'),
61:written('8. C Prog',raw`Consider the following C program:
[CODE]
(a) What is its output?
(b) If abc(s) is called with a null-terminated string of length n (not counting the null character), how many characters are printed?`,raw`Let F(s) be the output. F(empty) is empty, and F(cs)=F(s)F(s)c. Thus F("3")="3", F("23")="332", and F("123")="3323321". The count satisfies T(0)=0 and T(n)=2T(n-1)+1, giving $T(n)=2^n-1$. The historical implicit-int main is retained in the question.`, 'void abc(char *s)\n{\n    if (s[0] == \'\\0\') return;\n    abc(s + 1);\n    abc(s + 1);\n    printf("%c", s[0]);\n}\nmain()\n{\n    abc("123");\n}'),
62:written('6. Data Structures',raw`Answer the following:
(a) Insert the keys 15,32,20,9,3,25,12,1 into an initially empty binary search tree, in that order. Show the final tree.
(b) Draw the tree after deleting 15.
(c) Complete S1,S2,S3 so the following function computes the depth of the binary tree rooted at t:
[CODE]`,raw`(a) Root 15; its children are 9 and 32. Node 9 has children 3 and 12; 3 has left child 1. Node 32 has left child 20, and 20 has right child 25. All other child links are null.
(b) Using inorder successor 20: root 20, left subtree unchanged, right child 32 with left child 25. Using predecessor 12 is also a valid deletion convention.
(c) S1: y=depth(t->right); S2: return x+1; S3: return y+1. Null trees have depth 0, so a leaf has depth 1.`, 'typedef struct tnode {\n    int key;\n    struct tnode *left, *right;\n} *Tree;\nint depth(Tree t)\n{\n    int x,y;\n    if (t == NULL) return 0;\n    x = depth(t->left);\n    /* S1 */ __________________;\n    if (x > y) return __________; /* S2 */\n    else return _______________; /* S3 */\n}'),
63:written('7. Algorithms',raw`Consider a weighted undirected graph with $V=\{n_1,n_2,n_3,n_4,n_5,n_6\}$ and
$$E=\{(n_1,n_2,2),(n_1,n_3,8),(n_1,n_6,3),(n_2,n_4,4),(n_2,n_5,12),(n_3,n_4,7),(n_4,n_5,9),(n_4,n_6,4)\}.$$
The third value is the edge weight.
(a) List edges of a minimum spanning tree.
(b) How many distinct minimum spanning trees exist?
(c) Is the minimum among the edge weights of an MST unique over all MSTs of a graph?
(d) Is the maximum among the edge weights of an MST unique over all MSTs of a graph?`,raw`(a) One MST is edges (n1,n2,2),(n1,n6,3),(n2,n4,4),(n3,n4,7),(n4,n5,9), total 25.
(b) Exactly two: replace (n2,n4,4) by (n4,n6,4) for the other. All other listed edges are forced by the cut/cycle choices.
(c),(d) Yes, the minimum and maximum weight VALUES are invariant. More strongly all MSTs have the same sorted multiset of edge weights, by the exchange/cut property. The actual edges attaining those values need not be unique.`),
64:written('10. Compiler Design',raw`Consider the grammar with terminals $\Sigma=\{a,(,),+,*\}$ and start symbol E:
$$E\to aA\mid(E),\qquad A\to+E\mid*E\mid\varepsilon.$$
(a) Compute FIRST and FOLLOW for E and A.
(b) Compute the LL(1) parsing table.`,raw`FIRST(E)={a,(}; FIRST(A)={+,*,epsilon}. FOLLOW(E)=FOLLOW(A)={),end-marker}. Non-error table entries are M[E,a]=E->aA, M[E,(]=E->(E), M[A,+]=A->+E, M[A,*]=A->*E, M[A,)]=A->epsilon, M[A,end-marker]=A->epsilon. Every other entry is an error. No cell has two productions, so this grammar is LL(1).`),
65:written('10. Compiler Design',raw`The syntax of the repeat-until statement is given by the following grammar:
$$S\to\mathrm{repeat}\ S_1\ \mathrm{until}\ E$$
where E stands for expressions, S and S1 stand for statements. The non-terminals S and S1 have an attribute code that represents generated code. The non-terminal B has two attributes. The attribute code represents generated code to evaluate the expression and store its truth value in a distinct variable, and the attribute varName contains the name of the variable in which the truth value is stored. The truth value stored in the variable is 1 if E is true, 0 if E is false.
Give a syntax-directed definition to generate three-address code for the repeat-until statement. Assume that you can call a function, newlabel() that returns a distinct label for a statement. Use the operator '||' to concatenate two strings and the function gen(s) to generate a line containing the string s.`,raw`The source's isolated B is interpreted as E, the expression symbol in the production. Let L=newlabel(). Set S.code = gen(L+":") || S1.code || E.code || gen("if "+E.varName+" == 0 goto "+L). The body executes before the condition; if the condition is false, execution repeats, otherwise it falls through. Use a fresh L for every repeat statement so nested loops do not share labels.`),
66:written('10. Compiler Design',raw`Answer the following:
(a) Remove left recursion from $S\to Sa\mid Sb\mid a\mid b$.
(b) For $S\to aSbS\mid bSaS\mid\varepsilon$, construct all possible parse trees for abab. Is the grammar ambiguous?`,raw`(a) S->aT|bT and T->aT|bT|epsilon.
(b) Exactly two trees, represented fully by bracketed expansions:
S(a,S(epsilon),b,S(a,S(epsilon),b,S(epsilon)))
S(a,S(b,S(epsilon),a,S(epsilon)),b,S(epsilon)).
The first uses root split a|epsilon|b|ab; the second a|ba|b|epsilon. A root bSaS cannot derive a string beginning with a. These exhaust the positions of the root's explicit b. Two trees for the same word prove ambiguity.`),
67:written('5. Operating Systems',raw`Two concurrent processes P1,P2 want to use resources R1,R2 in a mutually exclusive manner. Both resources are initially free. Their programs are:
[CODE]
(a) Is mutual exclusion guaranteed? If not, show an interleaving violating it.
(b) Can deadlock occur? Show an interleaving if so.
(c) Exchange Q1 with Q3 and Q2 with Q4. Is mutual exclusion now guaranteed? Can deadlock occur?`,raw`The supplied scan makes P1 acquire R1 first and P2 acquire R2 first. This differs from the same-order P2 used in parts of the web discussion; follow the printed code.
(a) If "use" means overlapping S5/Q5 critical sections, exclusion is guaranteed for this one-pass program with atomic individual reads/writes: P1 must pass S3 before Q2 while P2 must pass Q3 before S2 for simultaneous entry, but program order would require S2<S3<Q2<Q3<S2, impossible. Flag ownership alone is not exclusive: S1,Q1,Q2,Q3,S2,Q4 gives both processes claiming R1; P1 then waits for R2. State which interpretation is used.
(b) Yes. S1,S2 lets P1 hold R1; Q1,Q2 lets P2 hold R2. P1 waits at S3 while P2 waits at Q3: circular wait.
(c) Both now acquire R1 first, removing the opposite-order circular wait (assuming fair execution). Exclusion now fails: with Q labels referring to their original statements, S1,Q3,S2,Q4,S3,Q1,S4,Q2,S5,Q5 passes both free checks before competing sets and permits both critical sections. Atomic test-and-set or locks are needed. Exhaustive interleaving checks confirm these critical-section/deadlock outcomes for the supplied one-pass program.`, 'P1:                            P2:\nS1: while(R1 is busy) do no-op; Q1: while(R2 is busy) do no-op;\nS2: set R1 <- busy;            Q2: set R2 <- busy;\nS3: while(R2 is busy) do no-op; Q3: while(R1 is busy) do no-op;\nS4: set R2 <- busy;            Q4: set R1 <- busy;\nS5: use R1 and R2;             Q5: use R1 and R2;\nS6: set R1 <- free;            Q6: set R2 <- free;\nS7: set R2 <- free;            Q7: set R1 <- free;'),
68:written('5. Operating Systems',raw`A disk has 100 tracks numbered 0 to 99, rotates at 3000 rpm, has 100 sectors/track, and takes 0.2 millisecond to move between successive tracks.
(a) Requests arrive for tracks 32,7,45,5,10. With the elevator algorithm, starting at 25 moving toward larger tracks, what is the total seek time?
(b) Given an initial set of 100 arbitrary requests, no new arrivals, and head initially at 0, what is the worst-case time to complete all requests using the elevator algorithm?`,raw`(a) Under SCAN, move 25->32->45->99->10->7->5. Travel=74+94=168 tracks, seek time=33.6 ms. Under LOOK (turn at last pending request 45), travel=20+40=60 tracks, giving 12 ms. "Elevator" alone does not distinguish these conventions; accept a consistently stated convention.
(b) One outward pass reaches at most 99, so worst seek=19.8 ms. At 50 rev/s, a rotation is 20 ms and one sector is 0.2 ms. The usual conservative bound charges up to one rotation latency plus one sector per request: 19.8+100(20+0.2)=2039.8 ms. If sector-aligned latency is capped at 99 sector times, the tighter bound is 19.8+100(19.8+0.2)=2019.8 ms. Request layout and rotational timing assumptions are unspecified, so these are documented bounds, not a uniquely established official value.`),
69:written('12. DBMS',raw`Consider examinee(regno,name,score), where regno is the primary key and score is real.
(a) Using $\Pi,\sigma,\rho,\times$, find names appearing more than once.
(b) Write SQL listing regno of examinees scoring above the average.
(c) appears(regno,centr_code) specifies exam centres. Write SQL listing centr_code with an examinee scoring greater than 80.`,raw`(a) Rename two copies e1,e2. Return $\Pi_{e1.name}(\sigma_{e1.name=e2.name\ \land\ e1.regno\ne e2.regno}(\rho_{e1}(examinee)\times\rho_{e2}(examinee)))$. Different registration numbers distinguish people with the same name.
(b) SELECT regno FROM examinee WHERE score > (SELECT AVG(score) FROM examinee);
(c) SELECT DISTINCT a.centr_code FROM appears a JOIN examinee e ON a.regno=e.regno WHERE e.score>80;`),
70:written('12. DBMS',raw`Construct a $B^+$ tree with fan-out (number of pointers per node) 3 for keys 80,50,10,70,30,100,90, starting from an empty tree and inserting in that order.
(a) Show the tree after inserting 10, after inserting 30, and after inserting 90. Intermediate trees need not be shown.
(b) Delete 30, then 10, and show the tree after each deletion.`,raw`Convention: internal nodes have at most 3 children, leaves at most 2 keys; split an overflowing leaf of 3 keys as 2 left/1 right; copy the first right-leaf key up. Square brackets denote internal keys; parentheses are linked leaves.
After 10: root [80], leaves (10,50)|(80).
After 30: root [70]; left internal [50] with leaves (10,30)|(50); right internal [80] with leaves (70)|(80).
After 90: root [70]; left [50] with (10,30)|(50); right [80,100] with (70)|(80,90)|(100).
After deleting 30: root [70]; left [50] with (10)|(50); right [80,100] unchanged.
After deleting 10: merge its empty leaf with (50), then redistribute a child from the right internal sibling. Root [80]; left [70] with (50)|(70); right [100] with (80,90)|(100). All leaves remain linked in key order. Other consistently specified legal split/redistribution conventions can produce different valid trees.`)
};
