const t=String.raw;
export const bookMap={1:0,2:44,3:9,5:26,6:31,7:32,8:35,9:53,10:19,11:52,12:6,13:1,14:43,15:45,16:25,17:3,18:24,19:20,20:21,21:50,22:15,23:16,24:12,25:7,26:4,27:49,29:28,30:30,31:36,32:37,33:51,34:17,35:33,36:42,37:2,38:5,39:27,40:29,41:39,42:38,43:48,44:14,45:18,46:8,47:34,48:10,49:11,50:46,51:47,52:40,53:41,54:22,55:23};
const q=(text,opts,code='')=>({text,code,diagram:'',...Object.fromEntries(opts.map((v,i)=>['opt'+'ABCD'[i],v]))});
export const additions={
4:q(t`Assuming $P\ne NP$, which of the following is TRUE?`,[t`$\text{NP-complete}=\text{NP}$`,t`$\text{NP-complete}\cap P=\emptyset$`,t`$\text{NP-hard}=\text{NP}$`,t`$P=\text{NP-complete}$`]),
28:q(t`The bisection method is applied to compute a zero of the function $f(x)=x^4-x^3-x^2-4$ in the interval $[1,9]$. The method converges to a solution after ______ iterations.`,['1','3','5','7']),
56:q(t`The cost function for a product in a firm is given by $5q^2$, where $q$ is the amount of production. The firm can sell the product at a market price of Rs. 50 per unit. The number of units to be produced by the firm such that the profit is maximized is`,['5','10','15','25']),
57:q('Choose the most appropriate alternative from the options given below to complete the following sentence:\nDespite several ________ the mission succeeded in its attempt to resolve the conflict.',['attempts','setbacks','meetings','delegations']),
58:q('Which one of the following options is the closest in meaning to the word given below?\nMitigate',['Diminish','Divulge','Dedicate','Denote']),
59:q('Choose the grammatically INCORRECT sentence:',['They gave us the money back less the service charges of Three Hundred rupees.',"This country’s expenditure is not less than that of Bangladesh.",'The committee initially asked for a funding of Fifty Lakh rupees, but later settled for a lesser sum.',"This country’s expenditure on educational reforms is very less."]),
60:q('Choose the most appropriate alternative from the options given below to complete the following sentence:\nSuresh’s dog is the one ________ was hurt in the stampede.',['that','which','who','whom']),
61:q('Wanted Temporary, Part-time persons for the post of Field Interviewer to conduct personal interviews to collect and collate economic data. Requirements: High School-pass, must be available for Day, Evening and Saturday work. Transportation paid, expenses reimbursed.\n\nWhich one of the following is the best inference from the above advertisement?',['Gender-discriminatory','Xenophobic','Not designed to make the post attractive','Not gender-discriminatory']),
62:q(t`A political party orders an arch for the entrance to the ground in which the annual convention is being held. The profile of the arch follows the equation $y=2x-0.1x^2$ where $y$ is the height of the arch in meters. The maximum possible height of the arch is`,['8 meters','10 meters','12 meters','14 meters']),
63:q('An automobile plant contracted to buy shock absorbers from two suppliers X and Y. X supplies 60% and Y supplies 40% of the shock absorbers. All shock absorbers are subjected to a quality test. The ones that pass the quality test are considered reliable. Of X’s shock absorbers, 96% are reliable. Of Y’s shock absorbers, 72% are reliable.\n\nThe probability that a randomly chosen shock absorber, which is found to be reliable, is made by Y is',['0.288','0.334','0.667','0.720']),
64:q('Which of the following assertions are CORRECT?\nP: Adding 7 to each entry in a list adds 7 to the mean of the list\nQ: Adding 7 to each entry in a list adds 7 to the standard deviation of the list\nR: Doubling each entry in a list doubles the mean of the list\nS: Doubling each entry in a list leaves the standard deviation of the list unchanged',['P, Q','Q, R','P, R','R, S']),
65:q('Given the sequence of terms, AD CG FK JP, the next term is',['OV','OW','PV','PW']),
};
export function restoreSource(q,n){
 if(n===3){q.code=t`char inChar = 'A';
switch (inChar) {
case 'A': printf("Choice A\ n");
case 'B':
case 'C': printf("Choice B");
case 'D':
case 'E':
default: printf(" No Choice");
}`;q.optC='Choice A\nChoice B No Choice';}
 if(n===9){q.optA=t`One, at $\pi/2$`;q.optD=t`Two, at $\pi/4$ and $3\pi/2$`;}
 if(n===25)q.text=t`Given the language $L=\{ab,aa,baa\}$, which of the following strings are in $L^*$?
1) abaabaaabaa
2) aaaabaaaa
3) baaaaabaaaab
4) baaaaabaa`;
 if(n===27)q.code='T1: read(P);\n    read(Q);\n    if P = 0 then Q := Q + 1;\n    write(Q).\nT2: read(Q);\n    read(P);\n    if Q = 0 then P := P + 1;\n    write(P).';
 if(n===32)q.code='AcquireLock(L){\n    while (Fetch_And_Add(L,1))\n        L = 1;\n}\n\nReleaseLock(L){\n    L = 0;\n}';
 if(n===34)q.text=q.text.replace('a quarter of Organization','a quarter to Organization');
 if(n===36)q.code='Program main;\n    Var ...\n    Procedure A1;\n        Var ...\n        Call A2;\n    End A1\n    Procedure A2;\n        Var ...\n        Procedure A21;\n            Var ...\n            Call A1;\n        End A21\n        Call A21;\n    End A2\n    Call A1;\nEnd main.';
 if(n===37)q.optD=t`$2(2^n-2)$`;
 if(n===38)q.optC='90';
 if(n===40)q.optB='SBDT';
 if(n===43){q.text=q.text.replace('$R_1(A,B)$',t`$R_1(\underline A,B)$`).replace('$R_2(C,D)$',t`$R_2(\underline C,D)$`);}
 if(n===46){q.text=q.text.replace('partially complete','partially completed');
 const entries=[[['1','0','','',''],['','','','1',''],['0','','','',''],['','','0','','']],[['','0','','','1'],['','1','','',''],['','','','0',''],['','0','','','']],[['','1','','','0'],['','1','','',''],['','','0','',''],['','0','','','']],[['','1','','','0'],['','','','1',''],['0','','','',''],['','','0','','']]];
 for(let i=0;i<4;i++)q['opt'+'ABCD'[i]]='$'+t`\begin{array}{c|ccccc}&00&01&10&11&q\\\hline`+entries[i].map((row,j)=>['00','01','10','11'][j]+'&'+row.join('&')).join(t`\\`)+t`\end{array}`+'$';
 }
 if(n===47){q.text=q.text.replace('as the height(root)','as height(root)');q.code='int height(treeptr n)\n{\n    if (n == NULL) return -1;\n    if (n->left == NULL)\n        if (n->right == NULL) return 0;\n        else return [B1]; // Box 1\n    else {\n        h1 = height(n->left);\n        if (n->right == NULL) return (1+h1);\n        else {\n            h2 = height(n->right);\n            return [B2]; // Box 2\n        }\n    }\n}';q.optD='B1: (1+height(n->right))\nB2: max(h1, h2)';}
 if(n===48||n===49){q.text='Common Data for Questions 48 and 49:\n'+q.text;q.isCodeOptions=true;for(const l of 'ABCD')q['opt'+l]=q['opt'+l].replaceAll('$\\quad $ ','');}
 if(n===50||n===51)q.text=q.text.replace('Common Data for Questions 3.25 and 3.26:','Common Data for Questions 50 and 51:').replace(t`\text{Phone}&\text{Age}`,t`\text{Phone}&\text{Area}`);
 if(n===52||n===53)q.text='Statement for Linked Answer Questions 52 and 53:\n'+q.text;
 if(n===52){q.optC=q.optC.replace(t`\operatorname{FOLLOW}(B)=\$`,t`\operatorname{FOLLOW}(B)=\emptyset`);q.optD=q.optD.replace(t`\{a,b,\$\}`,t`\{a,b\}`);}
 if(n===53)q.optB=q.optB.replace(t`E2:S\to bAaB,B\to\varepsilon`,t`E2:S\to bAaB,S\to\varepsilon`);
 if(n===54||n===55)q.text=q.text.replace('Linked Answer Q.4.38 & Q.4.39:','Statement for Linked Answer Questions 54 and 55:');
 for(const number of [26,36])if(n===number)for(const letter of 'ABCD')q['opt'+letter]='IMG:q'+n+'-'+letter.toLowerCase();
 const diagrams={12:'q12-nfa',26:'q26-graph',40:'q40-graph',46:'q46-dfa'};q.diagram=diagrams[n]||'';
 return q;
}
