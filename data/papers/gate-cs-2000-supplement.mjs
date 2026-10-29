// Transcriptions follow the supplied year-wise 2000.pdf, including its flattened Q1-Q69 numbering.
const mcq=(text,options)=>({text,...Object.fromEntries(options.map((v,i)=>['opt'+String.fromCharCode(65+i),v]))});
export const additions={
 3:mcq(String.raw`The determinant of the matrix $\begin{bmatrix}2&0&0&0\\8&1&7&2\\2&0&2&0\\9&0&6&1\end{bmatrix}$ is`,['4','0','15','20']),
 7:mcq('To put the 8085 microprocessor in the wait state',['Lower the HOLD input','Lower the READY input','Raise the HOLD input','Raise the READY input']),
 9:mcq('The 8085 microprocessor responds to the presence of an interrupt',["As soon as the TRAP pin becomes high",'By checking the TRAP pin for high status at the end of each instruction fetch','By checking the TRAP pin for high status at the end of the execution of each instruction','By checking the TRAP pin for high status at regular intervals']),
 19:mcq('Which of the following derivations does a top-down parser use while parsing an input string? The input is assumed to be scanned in left to right order.',['Leftmost derivation','Leftmost derivation traced out in reverse','Rightmost derivation','Rightmost derivation traced out in reverse']),
 20:mcq('Which of the following need not necessarily be saved on a context switch between processes?',['General purpose registers','Translation lookaside buffer','Program counter','All of the above']),
 24:mcq('X, Y and Z are closed intervals of unit length on the real line. The overlap of X and Y is half a unit. The overlap of Y and Z is also half a unit. Let the overlap of X and Z be k units. Which of the following is true?',['k must be 1','k must be 0','k can take any value between 0 and 1','None of the above']),
 26:mcq(String.raw`Let $S=\sum_{i=3}^{100}i\log_2 i$ and $T=\int_2^{100}x\log_2 x\,dx$. Which of the following statements is true?`,[String.raw`$S>T$`,'$S=T$','$S<T$ and $2S>T$',String.raw`$2S\leq T$`]),
 27:mcq(String.raw`A polynomial $p(x)$ satisfies $p(1)=p(3)=p(5)=1$ and $p(2)=p(4)=-1$. The minimum degree of such a polynomial is`,['1','2','3','4']),
 32:mcq('Consider the following decision problems:\n(P1) Does a given finite state machine accept a given string?\n(P2) Does a given context free grammar generate an infinite number of strings?\nWhich of the following statements is true?',['Both P1 and P2 are decidable','Neither P1 nor P2 is decidable','Only P1 is decidable','Only P2 is decidable']),
 40:mcq(String.raw`Consider the following functions: $f(n)=3n^{\sqrt n}$, $g(n)=2^{\sqrt n\log_2 n}$, $h(n)=n!$. Which of the following is true?`,['$h(n)$ is $O(f(n))$','$h(n)$ is $O(g(n))$','$g(n)$ is not $O(f(n))$','$f(n)$ is $O(g(n))$']),
 44:mcq(String.raw`Given the following expression grammar: $E\to E*F\mid F+E\mid F$, $F\to F-F\mid id$. Which of the following is true?`,['* has higher precedence than +','- has higher precedence than *','+ and - have the same precedence','+ has higher precedence than *']),
};
// Reference solutions are authored explanations, with a per-question GateOverflow discussion URL.
export const objectiveAnswers={
 1:['C','At most two cards can be drawn from each of four suits without a triple: eight cards. The ninth guarantees a triple.'],
 2:['A','Pair v[i,j] with v[j,i]; their sum is zero, and diagonal entries are zero.'],
 3:['A','Expansion along the first row and then the second column gives 2 times 2 times 1 = 4.'],
 4:['C','Both regular expressions generate every string over {a,b}.'],
 5:['B','The grammar generates the positive even-length strings of zeroes: 00(00)*.'],
 6:['C',"Positive 43 has the ordinary binary representation 00101011 in eight-bit two's complement."],
 7:['B','READY low inserts wait states. HOLD requests the buses for another bus master.'],
 8:['B','Pipelining improves throughput. A single instruction still traverses all stages, with pipeline-register overhead, so its latency need not decrease.'],
 9:['C','The interrupt is serviced at an instruction boundary after the current instruction finishes.'],
 10:['C','Indirect addressing corresponds to pointers; immediate addressing to constants; autodecrement addressing to loops.'],
 11:['A','s is an array of ten pointers to struct node.'],
 12:['D','X loses the allocated address, Y dereferences freed storage, and Z dereferences an uninitialized pointer.'],
 13:['C','Depth-first search uses a stack, breadth-first search uses a queue, and heaps support sorting.'],
 14:['C','Only (1 (2 3 4) (5 6 7)) gives each represented internal node exactly two subtrees.'],
 15:['A','The array is sorted, so checking the sum of its two smallest elements is sufficient and takes constant time.'],
 16:['A','Aliasing means different variables or names refer to the same memory location.'],
 17:['C','The short array uses 10 bytes; the union uses max(4,8)=8 bytes. Ignoring alignment, the total is 18 bytes.'],
 18:['C','The tokens are printf, (, the string literal, comma, i, comma, &, i, ), semicolon: ten.'],
 19:['A','A top-down parser constructs a leftmost derivation while scanning left to right.'],
 20:['B','The TLB can be invalidated or tagged by address space instead of being saved and restored on a context switch.'],
 21:['B','Every process can hold its first mutex while waiting for its neighbour: circular wait and deadlock.'],
 22:['B','A B+ tree has high fanout, reducing the number of slow disk accesses.'],
 23:['C','Basic relational algebra has no aggregation operator to compute the sum of salaries.'],
 24:['D','With Y fixed, each of X and Z must be shifted by +1/2 or -1/2 relative to Y. Their overlap is therefore either 1 or 0, not every intermediate value. GateOverflow also displays a conflicting C key; this dataset uses the interval argument and documents the conflict.'],
 25:['D','If both event probabilities are p, independence gives 2p-p^2=1, hence (p-1)^2=0 and p=1.'],
 26:['A','x log2(x) is strictly increasing on [2,100]. Each right-endpoint rectangle i log2(i) exceeds the integral over [i-1,i], so S>T.'],
 27:['D','p(x)-1 has roots 1,3,5. A cubic would have p(x)-1=k(x-1)(x-3)(x-5), whose values at 2 and 4 have opposite signs, so it cannot give -2 at both. A degree-four interpolant exists.'],
 28:['C','The equivalence classes are the even and odd integers.'],
 29:[null,String.raw`No option is valid for every set as written. For $S=\{\emptyset\}$, $P(S)\cap P(P(S))=\{\emptyset,\{\emptyset\}\}$, disproving B. A, C and D are also false. B is the customary answer only under an unstated restriction on S. Excluded from automatic scoring; review manually.`],
 30:['A','The premises give a=true and b=c. Thus if a AND b holds, a AND c also holds, making the implication true.'],
 31:[null,'No option is necessarily true. The languages {epsilon} and a+ each have a two-state minimal complete DFA and are counterexamples to D. D is the customary intended answer under an extra alternating-transition assumption. Excluded from automatic scoring; review manually.'],
 32:['A','A finite automaton can be simulated on a finite input. Infiniteness of a context-free language is decidable using productive/reachable variable cycles.'],
 33:['C','Substitution of x=1,y=0,z=1,w=1 satisfies all four Boolean equations.'],
 34:['C','A and B are equivalent to y(w+x). C additionally includes wx, producing a 1 at specified zero cells.'],
 35:['A','The three successive output states starting from (P,Q)=(0,1) are (1,0), (1,1), (1,0).'],
 36:['B','1600 times 400 times 24 bits requires 1,920,000 bytes, more than 1 MB. The other listed modes fit.'],
 37:['B','A+B cancels exactly, then adding C gives X=1. A+C rounds to A at this magnitude in 32-bit floating point, so Y becomes 0 after adding B.'],
 38:['A','Reversing the first k elements and the remaining n-k elements, followed by reversing the whole array, rotates left by k positions.'],
 39:['D','A complete tree can have only a root and a left child. Its last inorder node is the root, whereas its last preorder node is the child. Other complete trees disprove the remaining equalities.'],
 40:['D','g(n)=n^(sqrt(n)), so f(n)=3g(n). The factorial grows faster than both.'],
 41:['C','The maximum-weight edge can be a bridge, in which case it belongs to the minimum spanning tree. The minimum-weight edge is forced by the cut property and distinct weights ensure uniqueness.'],
 42:['C','If u has an unvisited neighbour, DFS visits one before backtracking. Therefore a nonadjacent next discovery can occur only after u has no child, making u a leaf in the DFS tree.'],
 43:['A','The static count accumulates 0+1+2+3+4, yielding 10.'],
 44:['B','Subtraction is derived within F, which appears as an operand of multiplication within E, so subtraction binds more tightly than multiplication.'],
 45:['D','0.9999 times 1 microsecond plus 0.0001 times 10000 microseconds equals 1.9999 microseconds, using the convention in the supplied options.'],
 46:['C','Requiring no requests after a release does not prevent circular wait during the earlier allocation phase.'],
 47:['B','Every Y value occurs once, so Y determines both X and Z. Z=2 occurs with different X and Y values, disproving the other choices.'],
 48:['A','The Cartesian product projects to the tuples of r only when s is nonempty; DISTINCT also removes duplicates from r.'],
 49:['C','For x=NULL, x!=5 evaluates false under the stipulated rule, but NOT(x=5) is true.'],
};
export const descriptive={
  "50": {
    "subject": "1. Discrete Maths",
    "text": "Consider the sequence $s_1=s_2=1$ and $s_i=1+\\min(s_{i-1},s_{i-2})$ for $i>2$. Prove by induction on n that $s_n=\\lceil n/2\\rceil$.",
    "referenceAnswer": "Base cases n=1 and n=2 give 1. Assume the formula for n-1 and n-2. Since $\\lceil(n-2)/2\\rceil\\leq\\lceil(n-1)/2\\rceil$, the recurrence gives $s_n=1+\\lceil(n-2)/2\\rceil=\\lceil n/2\\rceil$. This completes strong induction.",
    "questionType": "SUBJECTIVE",
    "isProof": true
  },
  "51": {
    "subject": "1. Discrete Maths",
    "text": "Let $S=\\{0,1,2,3,4,5,6,7\\}$ and $\\otimes$ denote multiplication modulo 8: $x\\otimes y=(xy)\\bmod8$.\n(a) Prove that $(\\{0,1\\},\\otimes)$ is not a group.\n(b) Write three distinct groups $(G,\\otimes)$ where $G\\subset S$ and G has two elements.",
    "referenceAnswer": "(a) The identity is 1, but 0 has no multiplicative inverse, so this is not a group. (b) Choose {1,3}, {1,5}, and {1,7}. In each set the nonidentity element squares to 1 modulo 8. Closure, identity and inverses hold, and associativity is inherited from integer multiplication.",
    "questionType": "SUBJECTIVE",
    "isProof": true
  },
  "52": {
    "subject": "1. Discrete Maths",
    "text": "A multiset is an unordered collection of elements where elements may repeat any number of times. Its size counts repetitions.\n(a) What is the number of multisets of size 4 that can be constructed from n distinct elements so that at least one element occurs exactly twice?\n(b) How many multisets can be constructed from n distinct elements?",
    "referenceAnswer": "(a) The disjoint multiplicity patterns are (2,1,1) and (2,2). Their counts are $n\\binom{n-1}{2}$ and $\\binom n2$, giving $n(n-1)^2/2$. (b) For n>=1 there are countably infinitely many finite multisets because their size is unrestricted. If a size r had been fixed, the count would instead be $\\binom{n+r-1}{r}$. For n=0 only the empty multiset exists.",
    "questionType": "SUBJECTIVE",
    "isProof": true
  },
  "53": {
    "subject": "1. Discrete Maths",
    "text": "Let S be a set of n elements {1,2,...,n}, and G a graph with $2^n$ vertices, each corresponding to a distinct subset of S. Two vertices are adjacent if the symmetric difference of their sets has exactly two elements. The symmetric difference is $(R_1\\setminus R_2)\\cup(R_2\\setminus R_1)$.\n(a) Every vertex has the same degree. What is it?\n(b) How many connected components does G have?",
    "referenceAnswer": "(a) Choose the two elements whose membership is toggled, giving degree $\\binom n2$. (b) For n>=1 there are two components: even-cardinality subsets and odd-cardinality subsets. Each edge preserves parity. Any two subsets of the same parity differ by an even number of elements and can be connected by toggling them in pairs. For n=0 the graph has one vertex and one component.",
    "questionType": "SUBJECTIVE",
    "isProof": true
  },
  "54": {
    "subject": "2. TOC",
    "text": "(a) Construct a minimal finite state machine over {0,1} accepting all strings that contain neither substring 00 nor substring 11.\n(b) Consider $S\\to aSAb\\mid\\epsilon$, $A\\to bA\\mid\\epsilon$, with start symbol S. This grammar generates strings $a^i b^j$ for i,j>=0. What condition do i and j satisfy?",
    "referenceAnswer": "(a) A minimal complete DFA has start state s, state z (last input 0), state o (last input 1), and dead state d. Accept s,z,o. Transitions: s: 0->z,1->o; z: 0->d,1->o; o: 0->z,1->d; d loops on both. These states are pairwise distinguishable. (b) Each a introduces at least one b, so j>=i. More precisely the language is {epsilon} union {a^i b^j : 1<=i<=j}; when i=0, only j=0 is possible.",
    "questionType": "SUBJECTIVE",
    "isProof": true
  },
  "55": {
    "subject": "2. TOC",
    "text": "A pushdown automaton is shown below. Labels d,s/s' denote input d and replacement of stack contents s by s'.\n[IMG_1]\n(a) Introduce two edges so that it accepts $\\{x2x^R:x\\in\\{0,1\\}^*\\}$ by empty stack.\n(b) Describe a nondeterministic PDA with three states that accepts $\\{0^n1^m:n\\leq m\\leq2n\\}$ by empty stack.",
    "referenceAnswer": "(a) Add the q0 loop 0,s/0s and the q1 loop 0,0s/s. Existing q0 and q1 loops handle 1, and the middle 2 switches states without changing the stack. (b) In q0, for each 0 nondeterministically push one or two X symbols. On the first 1 move to q1 and pop an X; in q1 each further 1 pops one X. When only the bottom marker remains, epsilon-transition to q2 and pop it. Also allow q0->q2 on epsilon with only the bottom marker, to accept n=m=0. No 0-transition is allowed after leaving q0. Thus each 0 accounts for either one or two 1s.",
    "questionType": "SUBJECTIVE",
    "isProof": true,
    "diagram": "q55-pda"
  },
  "56": {
    "subject": "9. Digital Logic",
    "text": "Design a logic circuit converting a single digit BCD number to that number modulo six. Do not detect illegal input.\n(a) Write the truth table. Label input bits $I_1,I_2,\\ldots$ and output bits $R_1,R_2,\\ldots$, with subscript 1 least significant. Use 1 for truth.\n(b) Draw circuits for the output bits using, in total, two two-input AND gates, one two-input OR gate and two NOT gates.",
    "referenceAnswer": "(a) BCD input -> output: 0000->000, 0001->001, 0010->010, 0011->011, 0100->100, 0101->101, 0110->000, 0111->001, 1000->010, 1001->011. Inputs 1010 through 1111 are don't-cares. (b) $R_1=I_1$, $R_2=I_4+(I_2\\overline{I_3})$, $R_3=I_3\\overline{I_2}$. Two inverters produce the complements of I2 and I3, two AND gates produce the products, and one OR combines the R2 terms.",
    "questionType": "SUBJECTIVE",
    "isProof": true
  },
  "57": {
    "subject": "4. COA",
    "text": "The 8085 instruction IN 09H is stored as DA at address 3050H and 09 at 3051H. The incomplete timing diagram is shown below.\n[IMG_1]\n(a) Give the hexadecimal contents of boxes A, B, C and D.\n(b) Give the states of ALE and RD at T1,T2,T3,T4.\n(c) Complete: The signal telling the peripheral to put data on the bus is generated by combining signals _____.",
    "referenceAnswer": "(a) A=DA, B=09, C=09, D=51, all hexadecimal. The cycles fetch opcode DA from 3050H, operand 09 from 3051H, then read port 09H (the port address is repeated on the high address byte). (b) For the opcode-fetch cycle at T1,T2,T3,T4: ALE=1,0,0,0 and active-low RD=1,0,0,1. (c) Combine IO/M and active-low RD: active-low IOR = RD OR NOT(IO/M).",
    "questionType": "SUBJECTIVE",
    "isProof": true,
    "diagram": "q57-timing"
  },
  "58": {
    "subject": "4. COA",
    "text": "Consider the following 8085 program segment, where B and C contain BCD values.\n[CODE]\n(a) For B=44,C=25 and B=33,C=46 at S1: (i) find A when control reaches S2; (ii) find D and E when control reaches S4.\n(b) In general, give D and E as functions of B and C at S4.",
    "referenceAnswer": "For B=44H,C=25H: 99H-25H=74H, then +44H=B8H; DAA gives A=18H with carry at S2. At S4, D=00H and E=19H. For B=33H,C=46H: 99H-46H=53H, then +33H=86H; A=86H with no carry at S2. The negative-result path gives D=FFH,E=13H at S4. Generally E is the packed-BCD magnitude |B-C|; D=00H for B>=C and FFH for B<C. This solution is derived by tracing the supplied program; no answer is posted on its GateOverflow page.",
    "questionType": "SUBJECTIVE",
    "isProof": true,
    "code": "S1: MVI A, 99H\n    MVI D, 00H\n    SUB C\n    ADD B\n    DAA\nS2: JC S3\n    MOV E, A\n    MVI A, 99H\n    SUB E\n    MOV E, A\n    JZ S4\n    MVI D, FFH\n    JMP S4\nS3: INR A\n    DAA\n    MOV E, A\nS4: ..."
  },
  "59": {
    "subject": "4. COA",
    "text": "An instruction pipeline has five stages, each taking 2 ns, and all instructions use all five stages. Branch instructions are not overlapped: the following instruction is not fetched until the branch completes. Under ideal conditions:\n(a) Calculate average instruction execution time if 20% of executed instructions are branches, ignoring conditional branches.\n(b) 80% of branches are conditional and 50% of those are taken. If a conditional branch is not taken, following instructions can overlap. Calculate average instruction execution time.",
    "referenceAnswer": "Steady-state time is 2 ns per instruction plus four lost pipeline cycles (8 ns) for each branch that stalls. (a) 2+0.20*8=3.6 ns. (b) The fraction of all instructions causing a stall is 0.20*(0.20+0.80*0.50)=0.12. Average time is 2+0.12*8=2.96 ns. Initial fill and final drain are ignored.",
    "questionType": "SUBJECTIVE",
    "isProof": true
  },
  "60": {
    "subject": "6. Data Structures",
    "text": "A stack implementation supports PUSH, POP, and REVERSE, which reverses the stack.\n(a) Implement a queue: ENQUEUE must use one operation, DEQUEUE three operations.\n(b) Evaluate the postfix expression 5 2 * 3 4 + 5 2 * * + using a stack. Show the contents (i) after 5 2 * 3 4 +; (ii) after 5 2 * 3 4 + 5 2; (iii) at the end.",
    "referenceAnswer": "(a) ENQUEUE(x)=PUSH(x). DEQUEUE: REVERSE; x=POP; REVERSE; return x. (b) Listing bottom to top: (i) [10,7]; (ii) [10,7,5,2]; (iii) [80]. The final calculation is 10+(3+4)*(5*2)=80.",
    "questionType": "SUBJECTIVE",
    "isProof": true
  },
  "61": {
    "subject": "8. C Prog",
    "text": "Consider the line $y=(n/m)x$, where n and m are positive integers.\n(a) If mq-np<0, is point (p,q) above, below or on the line?\n(b) Fill the boxes in the following function to return true iff the segment with endpoints (p,q),(r,s) intersects the line. Give box numbers and contents.\n[CODE]",
    "referenceAnswer": "(a) Below, since q<(n/m)p. (b) Box 1: =; box 2: =; box 3: <; box 4: >; box 5: >; box 6: <. Equivalently define f=mq-np and g=ms-nr; return f=0 OR g=0 OR (f<0 AND g>0) OR (f>0 AND g<0). This includes endpoints on the line and collinear segments.",
    "questionType": "SUBJECTIVE",
    "isProof": true,
    "code": "1 function dash(n,m,p,q,r,s: integer): boolean;\n2 begin\n3   dash := false;\n4   if (m*q-n*p) [1] 0 then dash := true;\n5   if (m*s-n*r) [2] 0 then dash := true;\n6   if ((m*q-n*p) [3] 0) and ((m*s-n*r) [4] 0) then dash := true;\n7   if ((m*q-n*p) [5] 0) and ((m*s-n*r) [6] 0) then dash := true;\n8 end;"
  },
  "62": {
    "subject": "8. C Prog",
    "text": "Arrays p[1...N] and q[1...N] are initially uninitialized; count is initially zero. Consider set and is_set below.\n[CODE]\n(a) After set(7); set(3); set(9), give count, q[1],q[2],q[3],p[7],p[3],p[9].\n(b) Complete: The first count elements of ____ contain values i such that set(____) has been called.\n(c) Prove is_set(i) returns false if set(i) has never been called, regardless of p[i].",
    "referenceAnswer": "(a) count=3; q[1]=7,q[2]=3,q[3]=9; p[7]=1,p[3]=2,p[9]=3. (b) q; i. (c) If the arbitrary p[i] is out of [1,count], the range check returns false. Otherwise q[p[i]] is an initialized entry holding an index j actually supplied to set(j). If set(i) was never called, j!=i, so the second check returns false. The original assumes a safe mathematical model of uninitialized array cells; reading indeterminate C values requires additional care.",
    "questionType": "SUBJECTIVE",
    "isProof": true,
    "code": "set(i) {\n  count = count + 1;\n  q[count] = i;\n  p[i] = count;\n}\nis_set(i) {\n  if (p[i] <= 0 || p[i] > count) return false;\n  if (q[p[i]] != i) return false;\n  return true;\n}"
  },
  "63": {
    "subject": "7. Algorithms",
    "text": "The recursive Fibonacci program below is given an array f[0...M] with all entries initially zero.\n[CODE]\n(a) Fill the boxes so computed Fibonacci numbers are stored and reused. Give box numbers and contents.\n(b) Give the time complexity of computing fib(n).",
    "referenceAnswer": "Box 1: f[n]!=0. Box 2: f[n]. Box 3: f[n]=t. A positive computed Fibonacci value is memoized before returning. Each argument 2 through n is computed once; each computation does constant extra work. Time is Theta(n), with Theta(n) memo storage and recursion depth.",
    "questionType": "SUBJECTIVE",
    "isProof": true,
    "code": "fib(n) {\n  if (n > M) error();\n  if (n == 0) return 0;\n  if (n == 1) return 1;\n  if ([1])\n    return [2];\n  t = fib(n-1) + fib(n-2);\n  [3];\n  return t;\n}"
  },
  "64": {
    "subject": "7. Algorithms",
    "text": "An array contains four occurrences of 0, five of 1, and three of 2, in any order. Sort it using swaps of arbitrary pairs of elements.\n(a) What is the minimum number of swaps needed in the worst case?\n(b) Give an ordering attaining this maximum.",
    "referenceAnswer": "(a) Seven swaps. (b) One example is [1,1,1,1,2,2,2,0,0,0,0,1]. Its three target blocks have sizes 4,5,3. All 12 elements are misplaced. Resolve two reciprocal 0/1 pairs and one reciprocal 1/2 pair in three swaps. The remaining six misplacements form two directed 3-cycles, costing two swaps each: 3+2*2=7. Exhaustive enumeration of arrangements with multiplicities 4,5,3 verifies no arrangement requires more than seven.",
    "questionType": "SUBJECTIVE",
    "isProof": true
  },
  "65": {
    "subject": "10. Compiler Design",
    "text": "Consider this pseudo-Pascal program.\n[CODE]\nWhat does it output under (a) call-by-value and static scope; (b) call-by-reference and dynamic scope?",
    "referenceAnswer": "(a) Call by value, static scope: 12, 7, 10, 5, each on a new line. P has local x=7. Its Q(x) receives z=7 and adds global x=5, printing 12; P then prints its unchanged local x=7. Main calls Q(5), which prints 10, and main prints its unchanged x=5. (b) Call by reference, dynamic scope: 14, 14, 10, 10. Inside P, Q aliases local x=7; its dynamically scoped x refers to the same cell, so both become 14. Main still has x=5; its Q aliases that cell and doubles it to 10, which main also prints.",
    "questionType": "SUBJECTIVE",
    "isProof": true,
    "code": "program main;\nvar x: integer;\nprocedure Q(z: integer);\nbegin\n  z := z + x;\n  writeln(z)\nend;\nprocedure P(y: integer);\nvar x: integer;\nbegin\n  x := y + 2;\n  Q(x);\n  writeln(x)\nend;\nbegin\n  x := 5;\n  P(x);\n  Q(x);\n  writeln(x)\nend."
  },
  "66": {
    "subject": "10. Compiler Design",
    "text": "Consider the following syntax directed translation scheme. Attributes are evaluated immediately after each bottom-up reduction.\n$E\\to E_1*T\\quad\\{E.val=E_1.val*T.val\\}$\n$E\\to T\\quad\\{E.val=T.val\\}$\n$T\\to F-T_1\\quad\\{T.val=F.val-T_1.val\\}$\n$T\\to F\\quad\\{T.val=F.val\\}$\n$F\\to2\\quad\\{F.val=2\\}$\n$F\\to4\\quad\\{F.val=4\\}$\n(a) Construct a parse tree for 4-2-4*2 and compute E.val.\n(b) Without changing the grammar, use synthesized attributes to find E.red, the number of reductions.",
    "referenceAnswer": "(a) Subtraction is right associative and binds more tightly than multiplication, so the parse is (4-(2-4))*2, yielding 12. Tree: E(E(T(F(4),-,T(F(2),-,T(F(4))))),*,T(F(2))). (b) For every production A->symbols, set A.red=1+sum(B.red over nonterminal children B). Thus E->E1*T adds E1.red+T.red+1; E->T adds T.red+1; T->F-T1 adds F.red+T1.red+1; T->F adds F.red+1; each terminal F production sets F.red=1. For the given expression E.red=10.",
    "questionType": "SUBJECTIVE",
    "isProof": true
  },
  "67": {
    "subject": "5. Operating Systems",
    "text": "Fill boxes 1,2,3 to solve readers-writers using one binary semaphore mutex initialized to 1 and busy waiting.\n[CODE]\n(b) Can writers starve?",
    "referenceAnswer": "Box 1: signal(mutex). Box 2: signal(mutex). Box 3: R>0 || W>0. These release the lock both when a reader enters and when it retries, and prevent a writer from entering while another writer or any reader is active. Yes, writers can starve because an unending succession of readers can keep R positive.",
    "questionType": "SUBJECTIVE",
    "isProof": true,
    "code": "int R=0, W=0;\nReader() {\nL1: wait(mutex);\n    if (W==0) { R=R+1; [1]; }\n    else { [2]; goto L1; }\n    /* do the read */\n    wait(mutex); R=R-1; signal(mutex);\n}\nWriter() {\nL2: wait(mutex);\n    if ([3]) { signal(mutex); goto L2; }\n    W=1; signal(mutex);\n    /* do the write */\n    wait(mutex); W=0; signal(mutex);\n}"
  },
  "68": {
    "subject": "12. DBMS",
    "text": "An empty B+ tree has room for at most five keys in each leaf and internal node.\n(a) Insert 1,2,...,10 in order. Show the tree after six insertions and after all ten.\n(b) Instead of splitting an overflowing node, first move a value to its left sibling if one exists and is not full; otherwise split. Show the tree after inserting 1,...,9.\n(c) If a node holds at most m keys and a long increasing sequence is inserted, give approximate average leaf occupancy (i) normally; (ii) using the policy in (b).",
    "referenceAnswer": "Use a 3/3 leaf split when the sixth key overflows a leaf, and copy the right leaf's minimum into the parent. (a) After 6: root [4], leaves [1,2,3] -> [4,5,6]. After 10: root [4,7], leaves [1,2,3] -> [4,5,6] -> [7,8,9,10]. (b) After 9: root [5], leaves [1,2,3,4] -> [5,6,7,8,9]. On inserting 9 the right leaf overflows and shifts 4 to the left leaf, updating separator 4 to 5. (c) Approximately m/2 keys normally, versus approximately m with redistribution to the left; ignore the last leaf and constant rounding effects.",
    "questionType": "SUBJECTIVE",
    "isProof": true
  },
  "69": {
    "subject": "12. DBMS",
    "text": "A bank database has one relation transaction(transno,acctno,date,amount), where deposits have positive amounts and withdrawals negative amounts.\n(a) Define SQL view TP(acctno,T1.date,T2.amount) for every pair of transactions T1,T2 on the same account with T2.date <= T1.date.\n(b) Using only TP, find the minimum balance ever reached by each account, excluding its initial zero balance. Assume at most one transaction per account per day and at least one transaction per account. Use an intermediate view V.",
    "referenceAnswer": "(a) CREATE VIEW TP(acctno, txdate, amount) AS SELECT T1.acctno, T1.date, T2.amount FROM transaction T1 JOIN transaction T2 ON T1.acctno=T2.acctno AND T2.date<=T1.date;\n(b) CREATE VIEW V AS SELECT acctno, txdate, SUM(amount) AS balance FROM TP GROUP BY acctno, txdate;\nSELECT acctno, MIN(balance) AS min_balance FROM V GROUP BY acctno;\nRetain duplicates in TP: equal amounts from different transactions must each contribute to SUM. The daily cumulative balances include only actual transaction dates, excluding the initial zero.",
    "questionType": "SUBJECTIVE",
    "isProof": true
  }
};
