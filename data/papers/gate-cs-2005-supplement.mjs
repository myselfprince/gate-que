// Indices refer to the immutable inspection snapshot, not book display numbers.
export const bookMap={1:31,5:125,6:103,7:90,8:6,9:7,10:17,12:169,13:8,14:145,15:111,16:119,17:120,18:112,19:78,20:77,21:99,22:87,23:65,24:64,25:50,26:63,27:62,28:165,29:156,30:162,31:33,32:32,33:134,34:108,35:96,36:135,37:92,38:105,39:39,40:3,41:4,42:9,43:10,44:15,45:41,46:11,47:18,48:173,49:174,50:16,53:24,54:28,55:29,56:40,57:30,59:149,60:146,61:144,62:117,63:114,64:118,65:75,66:76,67:88,68:84,69:100,70:101,71:142,72:139,73:66,74:67,75:153,76:154,77:161,78:157,79:82,80:83,81:93,82:94,85:150,86:151,87:106,88:107,89:123,90:124};
const S=String.raw;
const mcq=(text,options,subject)=>({text,subject,code:'',diagram:'',ext:'.png',...Object.fromEntries(options.map((v,i)=>['opt'+String.fromCharCode(65+i),v]))});
const cut=S`Let $s$ and $t$ be two vertices in an undirected graph $G=(V,E)$ having distinct positive edge weights. Let $[X,Y]$ be a partition of $V$ such that $s\in X$ and $t\in Y$. Consider the edge $e$ having the minimum weight amongst all those edges that have one vertex in $X$ and one vertex in $Y$.`;
export const additions={
3:mcq(S`A common property of logic programming languages and functional languages is:`,['both are procedural languages',S`both are based on $\lambda$-calculus`,'both are declarative','both use Horn-clauses'],'8. C Prog'),
4:mcq(S`Which one of the following are essential features of an object-oriented programming language?
(i) Abstraction and encapsulation
(ii) Strictly-typedness
(iii) Type-safe property coupled with sub-type rule
(iv) Polymorphism in the presence of inheritance`,['(i) and (ii) only','(i) and (iv) only','(i), (ii) and (iv) only','(i), (iii) and (iv) only'],'8. C Prog'),
11:mcq(S`Let $G$ be a simple graph with 20 vertices and 100 edges. The size of the minimum vertex cover of $G$ is 8. Then, the size of the maximum independent set of $G$ is`,['12','8','less than 8','more than 12'],'1. Discrete Maths'),
51:mcq(S`Box $P$ has 2 red balls and 3 blue balls and box $Q$ has 3 red balls and 1 blue ball. A ball is selected as follows: (i) select a box (ii) choose a ball from the selected box such that each ball in the box is equally likely to be chosen. The probabilities of selecting boxes $P$ and $Q$ are $1/3$ and $2/3$, respectively. Given that a ball selected in the above process is a red ball, the probability that it came from the box $P$ is:`,['$4/19$','$5/19$','$2/9$','$19/30$'],'11. Engg. Maths'),
52:mcq(S`A random bit string of length $n$ is constructed by tossing a fair coin $n$ times and setting a bit to 0 or 1 depending on outcomes head and tail, respectively. The probability that two such randomly generated strings are not identical is:`,[S`$1/2^n$`,'$1-1/n$','$1/n!$',S`$1-1/2^n$`],'11. Engg. Maths'),
58:mcq(S`Consider the following two problems on undirected graphs:
$\alpha$: Given $G(V,E)$, does $G$ have an independent set of size $|V|-4$?
$\beta$: Given $G(V,E)$, does $G$ have an independent set of size 5?
Which one of the following is TRUE?`,[S`$\alpha$ is in P and $\beta$ is NP-complete`,S`$\alpha$ is NP-complete and $\beta$ is in P`,S`Both $\alpha$ and $\beta$ are NP-complete`,S`Both $\alpha$ and $\beta$ are in P`],'7. Algorithms'),
83:mcq('Statement for Linked Answer Questions 82(a) & 82(b):\n'+cut+'\n82(a). The edge e must definitely belong to:', ['[Blank option in the selected scan]','the minimum weighted spanning tree of G','the weighted shortest path from s to t','each path from s to t','the weighted longest path from s to t'],'7. Algorithms'),
84:mcq('Statement for Linked Answer Questions 82(a) & 82(b):\n'+cut+'\n82(b). Let the weight of an edge e denote the congestion on that edge. The congestion on a path is defined to be the maximum of the congestions on the edges of the path. We wish to find the path from s to t having minimum congestion. Which one of the following paths is always such a path of minimum congestion?', ['a path from s to t in the minimum weight spanning tree','a weighted shortest path from s to t','an Euler walk from s to t','Hamiltonian path from s to t'],'7. Algorithms'),
};
