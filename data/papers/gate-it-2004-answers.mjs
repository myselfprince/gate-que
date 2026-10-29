// Authored worked references; source checks and disputes are recorded by the builder.
export const answers={
  "1": [
    "B",
    "Total children = (0.5*3+0.3*2+0.2)*N=2.3N; children in two-child families =0.6N. Required probability =0.6/2.3=6/23."
  ],
  "2": [
    "C",
    "Inclusion-exclusion gives 125+85+65-50-35-30+15=175 taking at least one course. Thus 200-175=25 take none. The book interchanges two intersection labels; their sum is unchanged."
  ],
  "3": [
    "C",
    "Negating C moves the quantifiers to exists x, for all y and negates the implication. Since not((a AND b) implies c) equals a AND b AND not c, C equals the stem."
  ],
  "4": [
    "C",
    "R1 sends 1 and 7 to 2,8; 3 to 6; and 5 to 4. R2 sends 2 and 8 to 2; 6 to 2,4; and 4 to 4. Composition is {(1,2),(3,2),(3,4),(5,4),(7,2)}."
  ],
  "5": [
    "A",
    "A forest on n vertices with c components has n-c edges. Its maximum is a connected tree with n-1 edges. The selected scan's last distractor is 2n-2."
  ],
  "6": [
    "C",
    "Subtract row 1 from row 2 to obtain y+z=2; subtract twice row 1 from row 3 to obtain -2y-3z=0. Hence z=-4, y=6 and x=6."
  ],
  "7": [
    "C",
    "A, B and D can generate any word by splitting it into one-letter factors. C forces each a into an ab block and cannot generate the word a."
  ],
  "8": [
    "B",
    "Let t=NAND(a,b), u=NAND(a,t), v=NAND(b,t); NAND(u,v) is a XOR b. This uses four two-input NAND gates, the minimum when no complemented inputs or other gates are supplied."
  ],
  "9": [
    "C",
    "Deterministic context-free languages are a proper subset of context-free languages. DPDA and NPDA therefore do not accept the same class. The other three assertions are standard valid properties."
  ],
  "10": [
    "B",
    "Two 8-bit operands give 16 address bits and hence 2^16=64K input combinations. Each product needs 16 bits, so ROM size is 64K by 16 bits."
  ],
  "11": [
    "B",
    "Source defect: this scan prints 50 characters/line, whereas the book and discussion print 80. The literal scan gives average rate 50*8/(100 microseconds)=4 Mbps (or active-sweep rate 5 Mbps), neither offered. The 80-character reference variant gives conventional B, 6.4 Mbps. Self-assess this preserved variant."
  ],
  "12": [
    "C",
    "Source defect: this scan prints L1 hit rate 0.5, whereas the book/discussion use 0.8. Both print main-memory time 500 ns. Ignoring miss search times, the literal values give .5*1+.5*.9*10+.5*.1*500=30 ns, absent. The reference variant gives .8*1+.2*.9*10+.2*.1*500=12.6 ns, C. Self-assess."
  ],
  "13": [
    "D",
    "Copy the successor's payload into x and bypass/free the successor. Because x is intermediate, it has a successor; logical deletion takes O(1). This conventional answer permits payload copying and does not require freeing the identical node allocation."
  ],
  "14": [
    "A",
    "A thread has its own execution stack and registers. Threads of one process share its address space and process resources, including its file descriptor table."
  ],
  "15": [
    "B",
    "For x in {0,1}, 1-x maps 0 to 1 and 1 to 0. The other expressions fail this truth table; 1%x is undefined at zero."
  ],
  "16": [
    "B",
    "In the intended Unix argument notation, mv x y renames x to y; cp x y followed by rm x has the same final filename effect if both succeed. The scan prints commas as argument separators. Read literally by a shell those commas are filename characters, so the answer assumes the intended separator notation."
  ],
  "17": [
    "A",
    "Basic COCOMO uses estimated size (traditionally KLOC) to calculate person-month effort by a power law, then development duration from effort. Thus size is the input and effort/duration are the estimates."
  ],
  "18": [
    "D",
    "Use cases identify actors and the externally visible system services they require. A UML use case diagram therefore captures functional user requirements."
  ],
  "19": [
    "B",
    "Historical SW-CMM level 5 adds Defect Prevention together with Technology Change Management and Process Change Management. Hence the missing practice is defect prevention."
  ],
  "20": [
    "B",
    "Configuration management identifies configurable artifacts and controls versions, baselines and changes. Scheduling and staffing are broader project-management functions, so B is the specific function."
  ],
  "21": [
    "C",
    "Row locks restrict the smallest listed unit, letting transactions access different rows concurrently even on the same page. Page and table locks block more unrelated work."
  ],
  "22": [
    "B",
    "Packet switching introduces queueing and variable delay. Reserved circuits usually provide more predictable timing, making the claim of lower variation for packet switching false."
  ],
  "23": [
    "A",
    "TCP provides reliable ordered byte delivery and congestion response, but reserves no bandwidth and guarantees no minimum communication rate."
  ],
  "24": [
    "B",
    "In this historical HTTP/TCP setting, HTTP transfers representations; HTML describes page structure. URLs can contain query data and HTTP responses can check links. B is false."
  ],
  "25": [
    "A",
    "For confidentiality, encrypt with the receiver's public key and decrypt with the receiver's matching private key. The alternatives name the wrong owner or a public decryption key."
  ],
  "26": [
    "C",
    "The /26 mask leaves six host bits: 2^6=64 addresses. Excluding subnet and broadcast addresses leaves 62 conventional usable hosts."
  ],
  "27": [
    "D",
    "The historical question assumes globally administered Ethernet MAC addresses, intended to be globally unique. Therefore the largest listed domain is the Internet. Duplicated, spoofed and locally administered addresses are outside this assumption."
  ],
  "28": [
    "A",
    "TCP numbers positions in its byte stream. A segment carries the sequence number of its first data byte, rather than one independent sequence number per segment."
  ],
  "29": [
    "D",
    "JSP supplies request, response and session as implicit objects. Session assumes the default session-enabled page setting. All three are usable without explicit declaration."
  ],
  "30": [
    "D",
    "Telnet, FTP and HTTP are application protocols. J2EE application servers host Enterprise JavaBeans. CLS-compliant .NET languages support cross-language inheritance within common type-system rules. All three statements are intended true."
  ],
  "31": [
    "C",
    "Argument 1: not s forces not r, then p OR r forces p, and not p OR q forces q. Argument 4: p and p implies r give r, so q OR not r forces q. Argument 2 fails for p=false,q=true,r=true; argument 3 fails for p=true,q=false,r=false. Thus 1 and 4."
  ],
  "32": [
    "D",
    "Expansion gives D(n)=3D(n-1)-D(n-2), D(0)=1,D(1)=3. Characteristic roots are (3+sqrt(5))/2 and (3-sqrt(5))/2. Initial conditions give the coefficients (3sqrt(5)+7)/(2sqrt(5)) and (3sqrt(5)-7)/(2sqrt(5)) in D."
  ],
  "33": [
    "C",
    "Independence gives P(min(X,Y)>z)=exp(-z/alpha-z/beta). Its rate is 1/alpha+1/beta, so the mean is alpha*beta/(alpha+beta)."
  ],
  "34": [
    "B",
    "Interchange summations: sum H(j)=sum from k=1 to n of (n-k+1)/k=(n+1)H(n)-n. This scan duplicates that expression in B and C. D is also equivalent because H(n+1)=H(n)+1/(n+1). Multiple correct choices require self-assessment."
  ],
  "35": [
    "A",
    "These are derangements: !5=5!*(1-1+1/2!-1/3!+1/4!-1/5!)=44."
  ],
  "36": [
    "B",
    "X^2-X+I=0 implies X(I-X)=I, hence X inverse=I-X=[[1-a,-1],[a^2-a+1,a]], option B."
  ],
  "37": [
    "D",
    "The degree sum is 54. The specified vertices contribute 6*2+3*4=24. The remaining (54-24)/3=10 vertices give 6+3+10=19 total."
  ],
  "38": [
    "C",
    "At x=3, the three Lagrange terms are -2/3, 4 and 16/3. Their sum is 26/3=8 2/3."
  ],
  "39": [
    "B",
    "Under the usual simple-root and bracketing hypotheses, false position is linear with a retained root bracket, Newton is quadratic, secant has order about 1.62, and unrestricted fixed-point iteration has no convergence guarantee. Match Q-III,R-II,S-I,T-IV."
  ],
  "40": [
    "D",
    "The scan prints the s-to-f transition with an epsilon stack argument. Empty-stack acceptance of that literal variant accepts the listed odd words with middle a and rejects bab. Acceptance by final state admits bab too; discussion variants instead pop a on that transition. Preserve the scan and self-assess because the acceptance convention and transition differ."
  ],
  "41": [
    "B",
    "Automaton conversion requires A->aA|bB and B->aB|bA|epsilon. The intended B is this rule set. The scan repeats delta(B,a) with conflicting destinations and prints B->bB instead of B->aB in B. Preserve both defects and self-assess."
  ],
  "42": [
    "B",
    "Signed four-bit range is -8 to 7. -4-4=-8 and -1+7=6 fit; 3+7=10 does not. Only addition 2 overflows."
  ],
  "43": [
    "A",
    "Octal 123456 gives binary 001010011100101110. Grouping into nibbles gives A72E; pairs give base-4 22130232."
  ],
  "44": [
    "B",
    "Minterms are 1,3,4,5,6. A'C covers 1,3; AB' covers 4,5; AC' covers 4,6. Thus AB'+AC'+A'C, intended B. The selected scan's first plus in B is missing/unclear (printed AB' AC'+A'C), so the literal option is defective; self-assess."
  ],
  "45": [
    "C",
    "T1 sends 12 bits per character, so 1200/12=100 characters/s. T2 sends 30 useful characters per 33*8 bits: 1200*30/264=136.36, approximately 136 characters/s."
  ],
  "46": [
    "D",
    "After R1->R2 and R1->R3, writing R2->M[100] preserves the original R1 in all three destinations. This is the selected scan's D; the book instead writes R1->M[100], also equivalent. Source B's final transfer is R2->R3."
  ],
  "47": [
    "C",
    "For the intended variable-duration asynchronous pipeline, finish(i,j)=max(finish(i-1,j),finish(i,j-1))+duration(i,j). S4 completions for I1,I2,I3,I4,I1 are 6,7,9,11,13 ns. Thus C. A fixed two-nanosecond clock gives a different value; the practice uses the intended variable-stage convention."
  ],
  "48": [
    "B",
    "Assume empty lines are initially filled in numeric order. Immediately before 7, lines contain [35,3,25,8,16,6,45,22]; line 5, holding 6, is least recently used. Therefore 7 replaces line 5."
  ],
  "49": [
    "A",
    "Ain is active at I1/T1, I3/T2, I3/T4 and every instruction's T3. OR these conditions: T1.I1+T2.I3+T4.I3+T3, option A."
  ],
  "50": [
    "A",
    "The scan omits the compared quantity in its ratio of fixed-point operations. The book/discussion specify floating:fixed=2:3, giving old time 7 and new time 4/1.2+3/1.1, hence speedup 1.155. The scan's wording is incomplete; preserve it and self-assess."
  ],
  "51": [
    "C",
    "The inner track holds pi*10*1400 bits; at 70 revolutions/s this is about 3.079 million bits/s or 48106 64-bit words/s. One microsecond of memory per word steals 4.81 percent, approximately 5 percent."
  ],
  "52": [
    "D",
    "To output c first, push a,b,c and pop c. Now b is on top, preventing a before b. Thus cabd is impossible; the other orders can be produced."
  ],
  "53": [
    "B",
    "The bottom-up sift-down work sums to at most n*sum(h/2^(h+1)), a convergent series times n. The tight construction time is Theta(n), conventionally B."
  ],
  "54": [
    "D",
    "Preorder ABCD makes A the root. Inorder BCAD puts B,C on its left and D on its right. The left subtree has root B with right child C. Diagram D has exactly this structure."
  ],
  "55": [
    "D",
    "Since f=O(g), multiplication by eventually nonnegative h gives fh=O(gh), contradicting D. As g and h have the same asymptotic order, B and C follow; A follows by adding the bounds."
  ],
  "56": [
    "D",
    "From A, choose AD=7 then AB=10. With the AC=22 tie resolved toward DF=22, next choose FC=4, FG=5 and GE=2 across the current cut. This is the sequence in D."
  ],
  "57": [
    "B",
    "Binary search uses IV, merge sort III, quicksort I, and Hanoi II. Hence P-IV,Q-III,R-I,S-II. The scan prints n-1k in II; the extraneous k is a source defect, with intended recurrence 2T(n-1)+1."
  ],
  "58": [
    "C",
    "Swap each pair M[i][j],M[j][i] once by restricting j>=i. C uses that triangular loop and the correct temporary-variable order. A swaps every off-diagonal pair twice; B and D assign an uninitialized temporary."
  ],
  "59": [
    "A",
    "funcg's static y increases on each call. The first two returns are 16,17, making main's y=43. The next returns 18,19 make it 80. Evaluation order within each sum does not alter these totals."
  ],
  "60": [
    "D",
    "Intended D reads c=getchar(), recurses until newline, and prints c while returning. The source places ?2 outside the if, so the base call also emits its newline before the reversed letters. The clean reverse-only algorithm would put both recursion and putchar inside the if body. Preserve the source code and self-assess."
  ],
  "61": [
    "B",
    "The literal scan prints A B / L V / A B / V W: f1 changes only a copy and prints L,V, while f2 changes the original by pointer. All offered choices instead use U,V on line 2. Conventional B belongs to the book variant with U in f1. No source option matches, so self-assess."
  ],
  "62": [
    "C",
    "Starting upward at 120, SSTF visits 115,110,130,80,70,30,25,20 and reverses three times. FCFS visits 30,70,115,130,110,80,20,25 and reverses four times. The initial move after 120 is included."
  ],
  "63": [
    "A",
    "Wait edges always run from larger to smaller timestamps, precluding a cycle. Older requesters can repeatedly be killed by a stream of newer holders while retaining their original timestamps, so starvation remains possible. Deadlock-free but not starvation-free."
  ],
  "64": [
    "C",
    "Each iteration doubles all existing processes. After n iterations there are 2^n processes, including the original; newly created count is 2^n-1."
  ],
  "65": [
    "D",
    "Producer waits for empty and signals full; consumer waits for full and signals empty. Mutex protects both buffer operations. Thus P(empty),V(full),P(full),V(empty)."
  ],
  "66": [
    "D",
    "A 4 KiB page has 12 offset bits. A 30-bit physical address therefore needs 18 frame-number bits, leaving at most 32-18=14 entry bits for other information."
  ],
  "67": [
    "B",
    "Addressable data blocks =10+128+128^2+128^3. At 1024 bytes each, capacity is 2164402176 bytes, approximately 2 GiB, option B."
  ],
  "68": [
    "A",
    "T1 ends at 10, T2 at 25, T3 at 43 and T4 at 40. T5 must start at 43. T1-T2-T3-T5 is the critical path, so T3 has zero slack."
  ],
  "69": [
    "C",
    "There are two binary decisions: while and if. Cyclomatic complexity of this connected structured module is decisions+1=3."
  ],
  "70": [
    "D",
    "Cubing the size relation makes E*t^4 constant for fixed L,P,B. Halving t multiplies effort by 16, so 20*16=320 person months."
  ],
  "71": [
    "B",
    "Detection fraction is 16/20=.8. Estimated natural errors before testing =200/.8=250, leaving 250-200=50. The selected scan misprints option B as 500 rather than discussion B=50. No literal option matches; self-assess."
  ],
  "72": [
    "D",
    "If 25 days denotes uptime, availability=600/(600+6)*100=99.0099 percent, approximately D. If MTBF denotes the complete failure-repair cycle, uptime is 594 hours and availability=594/600=99 percent, C. Both conventions appear in the discussion, so self-assess."
  ],
  "73": [
    "B",
    "One table stores E1, another stores E2 with E1's key as a foreign key, and a third stores E1\u0027s multivalued A13. The book instead places the multivalue on E2.A23; the table count is unchanged. The attribute-free 1:m relation needs no fourth table. Minimum is three."
  ],
  "74": [
    "D",
    "Assuming the stated successful inserts, there are three student rows and two department rows. Cartesian product yields 6 rows and 3+2=5 columns. However this scan omits dept_id values in the first two student inserts; literal SQL would fail. Preserve this defect and self-assess."
  ],
  "75": [
    "B",
    "The single-attribute key empcode prevents partial-key dependencies, giving 2NF. Pincode determines nonprime city and state without being a superkey, violating 3NF and BCNF."
  ],
  "76": [
    "C",
    "The update gives 15,25,35,NULL. AVG excludes NULL, so it is (15+25+35)/3=25."
  ],
  "77": [
    "D",
    "Conflicts on A imply both T1 before T2 and T2 before T1, forming a cycle. The schedule is not conflict-serializable. The full source schedule is retained."
  ],
  "78": [
    "C",
    "An unconstrained foreign key can be NULL, so statement (i) succeeds. A primary key cannot be NULL, so statement (ii) fails."
  ],
  "79": [
    "C",
    "A node stores p block pointers and p-1 key/data-pointer pairs: 5p+18(p-1)<=512. Hence 23p<=530 and maximum integer p=23."
  ],
  "80": [
    "D",
    "For flag 0111, insert 0 after every two consecutive data 1 bits. Processing 01110110 gives 0110101100. This complete stuffed string is option D in the selected scan."
  ],
  "81": [
    "C",
    "Sender's N outstanding sequence numbers must not overlap the receiver's M potentially confused positions after wraparound. Minimum space is N+M, reducing to N+1 for go-back-N and 2N for equal selective-repeat windows."
  ],
  "82": [
    "C",
    "Serialization is 800 microseconds and ring latency 400 microseconds. Under delayed token reinsertion, count frame return plus token circulation: cycle=800+2*400=1600 microseconds, giving 8000/.0016=5 Mbps, C. This convention is explicitly used by the matching discussion."
  ],
  "83": [
    "B",
    "Frame serialization is 800/20000=.04 s and round-trip propagation .8 s. Ten outstanding frames give 8000/.84=9.524 kbps; the intended B=10 kbps neglects serialization compared with propagation. The listed value is an approximation."
  ],
  "84": [
    "A",
    "For the assumed binary linear parity-check code, XOR closure of the three independent words yields additional nonzero words 1100110,1011010,0111100,0010111. Offered I and III belong; II and IV do not. Thus A."
  ],
  "85": [
    "B",
    "Each host's success rate is .2*(.8)^(n-1). Requiring at least .16 gives n<=2; two hosts meet it exactly."
  ],
  "86": [
    "D",
    "Fragment offset and IP source/destination addresses belong to IP. A destination port belongs to TCP or UDP at the transport layer."
  ],
  "87": [
    "C",
    "IPv4 nonfinal fragment data is a multiple of eight bytes. First-network data fragments are 1176 and 924 bytes; the second network permits 376 data bytes per nonfinal fragment. Each first fragment splits into three, making six 20-byte headers, total 120 bytes."
  ],
  "88": [
    "B",
    "In slow start, each new-data acknowledgment can add one MSS=2000 bytes. From 4000 bytes, two acknowledgments allow 8000, below the maximum 12000."
  ],
  "89": [
    "A",
    "The document has the declared myMessage root and exactly one message child containing character data, as required by the DTD. With that DTD available, it is both well-formed and valid."
  ],
  "90": [
    "D",
    "These href values are an absolute URL, a root-relative path, a document-relative path, and a relative path with a fragment. All four are valid link targets."
  ]
};
