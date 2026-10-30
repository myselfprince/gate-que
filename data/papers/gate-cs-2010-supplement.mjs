const t=String.raw;
export const bookMap={1:3,3:1,4:2,5:53,6:29,7:22,8:34,9:32,10:4,11:10,12:25,13:42,14:44,15:15,16:17,17:14,18:48,20:46,23:38,24:41,25:37,26:49,27:50,28:5,29:52,30:0,31:31,32:33,33:21,34:26,35:11,36:13,37:20,38:43,39:7,40:9,41:8,42:47,43:45,44:12,45:39,46:40,47:16,48:23,49:24,50:27,51:28,52:35,53:36,54:18,55:19};
const q=(text,opts,code='')=>({text,code,...Object.fromEntries(opts.map((v,i)=>['opt'+'ABCD'[i],v]))});
export const additions={
2:q(t`Newton-Raphson method is used to compute a root of the equation $x^2-13=0$ with 3.5 as the initial value. The approximation after one iteration is`,['3.575','3.677','3.667','3.607']),
19:q(t`A relational schema for a train reservation database is given below:
$\mathrm{Passenger}(pid,pname,age)$
$\mathrm{Reservation}(pid,class,tid)$

Table: Passenger
$$\begin{array}{c|l|c}pid&pname&Age\\\hline0&\text{'Sachin'}&65\\1&\text{'Rahul'}&66\\2&\text{'Sourav'}&67\\3&\text{'Anil'}&69\end{array}$$
Table: Reservation
$$\begin{array}{c|l|c}pid&class&tid\\\hline0&\text{'AC'}&8200\\1&\text{'AC'}&8201\\2&\text{'SC'}&8201\\5&\text{'AC'}&8203\\1&\text{'SC'}&8204\\3&\text{'AC'}&8202\end{array}$$
What pids are returned by the following SQL query for the above instance of the tables?
[CODE]`,['1, 0','1, 2','1, 3','1, 5'],`SELECT pid
FROM Reservation
WHERE class = 'AC' AND
      EXISTS (SELECT *
              FROM Passenger
              WHERE age > 65 AND
                    Passenger.pid = Reservation.pid)`),
21:q('The cyclomatic complexity of each of the modules A and B shown below is 10. What is the cyclomatic complexity of the sequential integration shown on the right hand side?\n[IMG_1]',['19','21','20','10']),
22:q(t`What is the appropriate pairing of items in the two columns listing various activities encountered in a software life cycle?
$$\begin{array}{ll}P.\ \text{Requirements Capture}&1.\ \text{Module Development and Integration}\\Q.\ \text{Design}&2.\ \text{Domain Analysis}\\R.\ \text{Implementation}&3.\ \text{Structural and Behavioral Modeling}\\S.\ \text{Maintenance}&4.\ \text{Performance Tuning}\end{array}$$`,['P-3 Q-2 R-4 S-1','P-2 Q-3 R-1 S-4','P-3 Q-2 R-1 S-4','P-2 Q-3 R-4 S-1']),
56:q('Choose the most appropriate word from the options given below to complete the following sentence:\nHis rather casual remarks on politics __________ his lack of seriousness about the subject.',['masked','belied','betrayed','suppressed']),
57:q('Which of the following options is the closest in meaning to the word below:\nCircuitous',['cyclic','indirect','confusing','crooked']),
58:q('Choose the most appropriate word from the options given below to complete the following sentence:\nIf we manage to __________ our natural resources, we would leave a better planet for our children.',['uphold','restrain','cherish','conserve']),
59:q('25 persons are in a room. 15 of them play hockey, 17 of them play football and 10 of them play both hockey and football. Then the number of persons playing neither hockey nor football is:',['2','17','13','3']),
60:q('The question below consists of a pair of related words followed by four pairs of words. Select the pair that best expresses the relation in the original pair:\nUnemployed : Worker',['fallow : land','unaware : sleeper','wit : jester','renovated : house']),
61:q('If 137 + 276 = 435 how much is 731 + 672?',['1534','1403','1623','1513']),
62:q(t`Hari (H), Gita (G), Irfan (I) and Saira (S) are siblings (i.e., brothers and sisters). All were born on $1^{\mathrm{st}}$ January. The age difference between any two successive siblings (that is born one after another) is less than 3 years. Given the following facts:
i. Hari's age + Gita's age > Irfan's age + Saira's age.
ii. The age difference between Gita and Saira is 1 year. However, Gita is not the oldest and Saira is not the youngest.
iii. There are no twins.
In what order were they born (oldest first)?`,['HSIG','SGHI','IGSH','IHSG']),
63:q('Modern warfare has changed from large scale clashes of armies to suppression of civilian populations. Chemical agents that do their work silently appear to be suited to such warfare; and regretfully, there exist people in military establishments who think that chemical agents are useful tools for their cause.\n\nWhich of the following statements best sums up the meaning of the above passage:',['Modern warfare has resulted in civil strife.','Chemical agents are useful in modern warfare.','Use of chemical agents in warfare would be undesirable.','People in military establishments like to use chemical agents in war.']),
64:q('5 skilled workers can build a wall in 20 days; 8 semi-skilled workers can build a wall in 25 days; 10 unskilled workers can build a wall in 30 days. If a team has 2 skilled, 6 semi-skilled and 5 unskilled workers, how long will it take to build the wall?',['20 days','18 days','16 days','15 days']),
65:q('Given digits 2, 2, 3, 3, 3, 4, 4, 4, 4 how many distinct 4 digit numbers greater than 3000 can be formed?',['50','51','52','54'])
};
export function restoreSource(record,n){
 if(n===1)record.text=t`Let $G=(V,E)$ be a graph. Define $\xi(G)=\sum_d i_d\times d$, where $i_d$ is the number of vertices of degree $d$ in $G$. If $S$ and $T$ are two different trees with $\xi(S)=\xi(T)$, then`;
 if(n===6)record.optC=t`$m_0+m_2+m_6+m_7$`;
 if(n===9||n===31||n===32||n===21||n===54||n===55||n===48||n===49){record.diagram=({9:'q9-mux',21:'q21-modules',31:'q31-nor',32:'q32-flipflops',48:'q48-49-cache',49:'q48-49-cache',54:'q54-55-network',55:'q54-55-network'})[n];record.ext='.png';}
 if(n===11)record.code=record.code.replace('"%d%d\\n"','"%d %d\\n"');
 if(n===17){record.optC=t`$L_2\cap L_3$ is recursively enumerable`;record.optD=t`$L_2\cup L_3$ is recursively enumerable`;}
 if(n===23)record.text=record.text.replace('boolean','Boolean');
 if(n===28)record.text=t`The degree sequence of a simple graph is the sequence of the degrees of the nodes in the graph in decreasing order. Which of the following sequences can not be the degree sequence of any graph?
I. 7, 6, 5, 4, 4, 3, 2, 1
II. 6, 6, 6, 6, 3, 3, 2, 2
III. 7, 6, 6, 4, 4, 3, 2, 2
IV. 8, 7, 7, 6, 4, 2, 1, 1`;
 if(n===36){record.text='The following C function takes a singly-linked list as input argument. It modifies the list by moving the last element to the front of the list and returns the modified list. Some part of the code is left blank.\n[CODE]\nChoose the correct alternative to replace the blank line.';record.code=`typedef struct node {
    int value;
    struct node *next;
} Node;
Node *move_to_front(Node *head) {
    Node *p, *q;
    if ((head == NULL) || (head->next == NULL)) return head;
    q = NULL; p = head;
    while (p->next != NULL) {
        q = p;
        p = p->next;
    }
    __________________________________
    return head;
}`;['q = NULL; p->next = head; head = p;','q->next = NULL; head = p; p->next = head;','head = p; p->next = q; q->next = NULL;','q->next = NULL; p->next = head; head = p;'].forEach((v,i)=>record['opt'+'ABCD'[i]]=v);}
 if(n===40)record.optC='Only L1 and L2 are context free';
 if(n===44)record.text=record.text.replace('[CODE]The','[CODE]\nThe');
 if(n===48||n===49)record.text=record.text.replace(/Common Data for Q\.4\.35 & Q\.4\.36:/,'Common Data for Questions 48 and 49:').replace('an L1 and L2 cache, an L2 cache','an L1 cache, an L2 cache');
 if(n===50||n===51)record.text=record.text.replace('Common Data for Questions 3.39 and 3.40:','Common Data for Questions 50 and 51:');
 if(n===52||n===53)record.text=record.text.replace('Linked Answer Questions 7.9 and 7.10:','Statement for Linked Answer Questions 52 and 53:');
 if(n===54||n===55){record.text='Statement for Linked Answer Questions 54 and 55:\nConsider a network with 6 routers R1 to R6 connected with links having weights as shown in the following diagram.\n[IMG_1]\nAll the routers use the distance vector based routing algorithm to update their routing tables. Each router starts with its routing table initialized to contain an entry for each neighbour with the weight of the respective connecting link.\n'+(n===54?'After all the routing tables stabilize, how many links in the network will never be used for carrying any data?':'Suppose the weights of all unused links in the previous question are changed to 2 and the distance vector algorithm is used again until all routing tables stabilize. How many links will now remain unused?');}
 return record;
}
