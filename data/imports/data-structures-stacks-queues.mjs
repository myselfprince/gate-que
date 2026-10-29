const raw = String.raw;
const sourceHash = 'd470dc8e1e5d08893ef10af72258c910f1637e9720b89683bfaf125af85154c8';
export const PRINTED_ANSWERS = 'B A A D POSTFIX C B D B C A D C A A B A A C 15 C A 256 C B B 86 0 8 ABD'.split(' ');
function question(number, year, marks, text, options = [], extra = {}) {
  const {notes = [], ...fields} = extra;
  const bookPages = number <= 9 ? [368] : number <= 15 ? [369] : number === 16 ? [369,370]
    : number <= 21 ? [370] : number === 22 ? [370,371] : number <= 27 ? [371] : number === 28 ? [371,372] : [372];
  const type = number === 5 ? 'SUBJECTIVE' : number === 30 ? 'MSQ' : options.length ? 'MCQ' : 'NAT';
  return {
    id:`madeeasy-data-structures-stacks-queues-3-${number}`,text,code:'',year:String(year),marks:String(marks),setNum:'',
    rawTopic:'Stacks and Queues',diagram:'',ext:'.png',
    optA:options[0]||'',optB:options[1]||'',optC:options[2]||'',optD:options[3]||'',
    questionType:type,correctOptions:options.length ? [...PRINTED_ANSWERS[number-1]] : [],
    natAnswer:options.length ? '' : number===5 ? '3 x 1 + log * a 2 / -' : PRINTED_ANSWERS[number-1],
    isBlank:false,isPosLocked:false,isCodeOptions:false,isProof:number===5,needsManualOptionFix:false,optLayout:'auto',tempPaste:'',...fields,
    source:{file:'6. Data Structures/2. Stack and Queues.pdf',sha256:sourceHash,questionNumber:`3.${number}`,
      bookPages,pdfPages:[...new Set(bookPages.map(page=>Math.floor((page-368)/2)+1))],answerKeyPdfPage:3,
      notes:[number===5 ? 'Printed key says Sol.; the postfix answer is transcribed from the supplied explanation, PDF page 3 / book page 373.'
        : 'Answer transcribed from the printed Stacks and Queues key, PDF page 3 / book page 373.',...notes]},
  };
}
export const DATA_STRUCTURES_STACKS_QUEUES_IMPORT = {
  subject:'6. Data Structures',chapter:'2. Stack and Queues',sourceHash,
  questions:[
    question(1,1995,2,raw`The postfix expression for the infix expression $A+B*(C+D)/F+D*E$ is`,[
      'AB + CD + *F/D+ E*','ABCD+*F/+DE*++','A *B + CD/F *DE++','A+*BCD/F* DE++',
    ],{notes:['Option B is printed with two trailing plus signs (ABCD+*F/+DE*++); retained literally. The explanation prints the postfix with one trailing plus. The printed key selects B.']}),
    question(2,1996,1,`Consider the following statements:
(i) First-in-first out types of computations are efficiently supported by STACKS.
(ii) Implementing LISTS on linked lists is more efficient than implementing LISTS on an array for almost all the basic LIST operations.
(iii) Implementing QUEUES on a circular array is more efficient than implementing QUEUES on a linear array with two indices.
(iv) Last-in-first-out type of computations are efficiently supported by QUEUES.`,[
      '(ii) & (iii) are true','(i) & (ii) are true','(iii) & (iv) are true','(ii) & (iv) are true',
    ]),
    question(3,1997,1,'Which of the following is essential for converting an infix expression to the post fix form efficiently?',[
      'An operator stack','An operand stack','An operand stack and an operator stack','A parse tree',
    ]),
    question(4,1997,2,`A priority queue Q is used to implement a stack that stores characters. PUSH (C) is implemented INSERT (Q, C, K) where K is an appropriate integer key chosen by the implementation. POP is implemented as DELETEMIN(Q). For a sequence of operations, the keys chosen are in`,[
      'non-increasing order','non-decreasing order','strictly increasing order','strictly decreasing order',
    ]),
    question(5,1998,2,raw`Compute the postfix equivalent of the following expression:
$$3*\log(x+1)-\frac{a}{2}$$`),
    question(6,1998,2,`What value would the following function return for the input x = 95?
[CODE]`,['89','90','91','92'],{code:`Function fun (x:integer): integer;
Begin
If x > 100 then fun = x - 10
Else fun := fun (fun (x + 11))
End;`}),
    question(7,2003,2,raw`Let S be a stack of size $n\ge1$. Starting with the empty stack, suppose we push the first $n$ natural numbers in sequence, and then perform $n$ pop operations. Assume that Push and Pop operation take $X$ seconds each, and $Y$ seconds elapse between the end of one such stack operation and the start of the next operation. For $m\ge1$, define the stack-life of m is the time elapsed from the end of push(m) to the start of the pop operation that removes m from S. The average stack-life of an element of this stack is`,[
      '$n(X+Y)$','$3Y+2X$','$n(X+Y)-X$','$Y+2X$',
    ]),
    question(8,2004,1,raw`A single array A[1...MAXSIZE] is used to implement two stacks. The two stacks grow from opposite ends of the array. Variables top1 and top2 ($\mathrm{top1}<\mathrm{top2}$) point to the location of the topmost element in each of the stacks. If the space is to be used efficiently, the condition for "stack full" is`,[
      raw`$(\mathrm{top1}=\mathrm{MAXSIZE}/2)\text{ and }(\mathrm{top2}=\mathrm{MAXSIZE}/2+1)$`,
      raw`$\mathrm{top1}+\mathrm{top2}=\mathrm{MAXSIZE}$`,
      raw`$(\mathrm{top1}=\mathrm{MAXSIZE}/2)\text{ or }(\mathrm{top2}=\mathrm{MAXSIZE})$`,
      raw`$\mathrm{top1}=\mathrm{top2}-1$`,
    ]),
    question(9,2004,1,'The best data structure to check whether an arithmetic expression has balanced parentheses is a',[
      'queue','stack','tree','list',
    ]),
    question(10,2004,2,`A circularly linked list is used to represent a Queue. A single variable p is used to access the Queue. To which node should p point such that both the operations enQueue and deQueue can be performed in constant time?
[IMG_1]`,['rear node','front node','not possible with a single pointer','node next to front'],{
      diagram:'stacks-queues-3-10',notes:['The supplied printed key selects C. This appears inconsistent with option A (rear pointer in a circular singly linked queue); the source key is preserved without silently correcting it.'],
    }),
    question(11,2004,2,raw`Assume that the operators $+$, $-$, $\times$ are left associative and $\wedge$ is right associative. The order of precedence (from highest to lowest) is $\wedge$, $\times$, $+$, $-$. The postfix expression corresponding to the infix expression $a+b\times c-d\wedge e\wedge f$ is`,[
      'abc × + def ^ ^ -','ab × + de ^ f ^','ab + c × d - e ^ f ^','- + a × bc ^ ^ def',
    ],{isCodeOptions:true}),
    question(12,2004,2,`A program attempts to generate as many permutations as possible of the string, 'abcd' by pushing the characters a, b, c, d in the same order onto a stack, but it may pop off the characters at any time. Which one of the following strings CANNOT be generated using this program?`,['abcd','dcba','cbad','cabd']),
    question(13,2005,1,raw`A function f defined on stacks of integers satisfies the following properties. $f(\phi)=0$ and $f(\mathrm{push}(S,i))=\max(f(S),0)+i$ for all stacks S and integers i. If a stack S contains the integers 2, -3, 2, -1, 2 in order from bottom to top, what is f(S)?`,['6','4','3','2']),
    question(14,2006,2,raw`An implementation of a queue Q, using two stacks S1 and S2, is given below
[CODE]
Let $n$ insert and $m$ ($\le n$) delete operations be performed in an arbitrary order on an empty queue Q. Let $x$ and $y$ be the number of push and pop operations performed respectively in the processes. Which one of the following is true for all $m$ and $n$?`,[
      raw`$n+m\le x\le2n\text{ and }2m\le y\le n+m$`,
      raw`$n+m\le x\le2n\text{ and }2m\le y\le2n$`,
      raw`$2m\le x<2n\text{ and }2m\le y\le n+m$`,
      raw`$2m\le x<2n\text{ and }2m\le y\le2n$`,
    ],{code:`void insert(Q, x)
{
    push(S1, x);
}
void delete(Q, x)
{
    if (stack-empty(S2)) then
        if (stack-empty(S1)) then
        {
            print("Q is empty");
            return;
        }
        else while (! stack-empty(S1))
        {
            x = pop(S1);
            push(S2, x);
        }
    x = pop(S2);
}`}),
    question(15,2007,2,raw`The following postfix expression with single digit operands is evaluated using a stack
$8\;2\;3\;\wedge\;/\;2\;3\;*\;+\;5\;1\;*\;-$
Note that $\wedge$ is the exponentiation operator. The top two elements of the stack after the first * is evaluated are`,['6, 1','5, 7','3, 2','1, 5']),
    question(16,2007,2,`Suppose you are given an implementation of a queue of integers. The operations that can be performed on the queue are:
(i) isEmpty (Q): returns true if the queue is empty, false otherwise.
(ii) delete (Q): deletes the element at the front of the queue and returns its value.
(iii) insert (Q, i): inserts the integer i at the rear of the queue.
Consider the following function:
[CODE]
What operation is performed by the above function f?`,[
      'Leaves the queue Q unchanged','Reverses the order of the elements in the queue Q',
      'Deletes the element at the front of the queue Q and inserts it at the rear keeping the other elements in the same order','Empties the queue Q',
    ],{code:`void f (queue Q)
{
    int i;
    if (! isEmpty (Q))
    {
        i = delete (Q);
        f(Q);
        insert (Q, i);
    }
}`}),
    question(17,2012,2,raw`Suppose a circular queue of capacity $(n-1)$ elements is implemented with an array of $n$ elements. Assume that the insertion and deletion operations are carried out using REAR and FRONT as array index variables, respectively. Initially, REAR = FRONT = 0. The conditions to detect queue full and queue empty are`,[
      raw`$\text{full: }(\mathrm{REAR}+1)\bmod n==\mathrm{FRONT}$
$\text{empty: }\mathrm{REAR}==\mathrm{FRONT}$`,
      raw`$\text{full: }(\mathrm{REAR}+1)\bmod n==\mathrm{FRONT}$
$\text{empty: }(\mathrm{FRONT}+1)\bmod n==\mathrm{REAR}$`,
      raw`$\text{full: }\mathrm{REAR}==\mathrm{FRONT}$
$\text{empty: }(\mathrm{REAR}+1)\bmod n==\mathrm{FRONT}$`,
      raw`$\text{full: }(\mathrm{FRONT}+1)\bmod n==\mathrm{REAR}$
$\text{empty: }\mathrm{REAR}==\mathrm{FRONT}$`,
    ]),
    question(18,2013,2,raw`Consider the following operation along with Enqueue and Dequeue operations on queues, where k is a global parameter.
[CODE]
What is the worst case time complexity of a sequence of $n$ queue operations on an initially empty queue?`,[
      raw`$\Theta(n)$`,raw`$\Theta(n+k)$`,raw`$\Theta(nk)$`,raw`$\Theta(n^2)$`,
    ],{code:`Multi-Dequeue (Q) {
    m = k;
    while (Q is not empty) and (m > 0) {
        Dequeue (Q);
        m = m - 1;
    }
}`}),
    question(19,2014,2,`Suppose a stack implementation supports an instruction REVERSE, which reverses the order of elements on the stack, in addition to the PUSH and POP instructions. Which one of the following statements is TRUE with respect to this modified stack?`,[
      'A queue cannot be implemented using this stack.',
      'A queue can be implemented where ENQUEUE takes a single instruction and DEQUEUE takes a sequence of two instructions.',
      'A queue can be implemented where ENQUEUE takes a sequence of three instructions and DEQUEUE takes a single instruction.',
      'A queue can be implemented where both ENQUEUE and DEQUEUE take a single instruction each.',
    ],{setNum:'2'}),
    question(20,2015,2,`Consider the C program below:
[CODE]
The value printed by the above program is _____.`,[],{setNum:'2',code:raw`#include <stdio.h>
int *A, stkTop;
int stkFunc (int opcode, int val)
{
    static int size=0, stkTop = 0;
    switch (opcode)
    {
        case -1: size = val; break;
        case 0: if (stkTop < size)
                    A[stkTop++] = val; break;
        default: if (stkTop)
                     return A[--stkTop];
    }
    return -1;
}
int main()
{
    int B[20]; A=B; stkTop = -1
    stkFunc (-1, 10);
    stkFunc (0, 5);
    stkFunc (0, 10);
    printf("%d\n", stkFunc (1, 0)+stkFunc (1, 0));
}`,notes:['The printed program omits the semicolon after stkTop = -1 in main; retained literally. The literal C program is invalid; printed answer 15 is preserved.']}),
    question(21,2015,1,raw`The result evaluating the postfix expression $10\;5\;+\;60\;6\;/\;*\;8\;-$ is`,[
      '284','213','142','71',
    ],{setNum:'3'}),
    question(22,2016,1,raw`A queue is implemented using an array such that ENQUEUE and DEQUEUE operations are performed efficiently. Which one of the following statements is CORRECT ($n$ refers to the number of items in the queue)?`,[
      'Both operations can be performed in $O(1)$ time',
      raw`At most one operation can be performed in $O(1)$ time but the worst case time for the other operation will be $\Omega(n)$`,
      raw`The worst case time complexity for both operations will be $\Omega(n)$`,
      raw`Worst case time complexity for both operations will be $\Omega(\log n)$`,
    ],{setNum:'1'}),
    question(23,2016,2,raw`Let Q denote a queue containing sixteen numbers and S be an empty stack. Head(Q) returns the element at the head of the queue Q without removing it from Q. Similarly Top(S) returns the element at the top of S without removing it from S. Consider the algorithm given below.
[CODE]
The maximum possible number of iterations of the while loop in the algorithm is _____.`,[],{setNum:'1',code:`while Q is not Empty do
    if S is Empty OR Top (S) <= Head (Q) then
        x := Dequeue (Q);
        Push (S, x);
    else
        x := Pop (S);
        Enqueue (Q, x);
    end
end`}),
    question(24,2016,2,raw`Consider the following New-order strategy for traversing a binary tree:
• Visit the root;
• Visit the right subtree using New-order;
• Visit the left subtree using New-order;
The New-order traversal of the expression tree corresponding to the reverse polish expression
$3\;4\;*\;5\;-\;2\;\wedge\;6\;7\;*\;1\;+\;-$ is given by`,[
      '+ - 1 6 7 * 2 ^ 5 - 3 4 *','- + 1 * 6 7 ^ 2 - 5 * 3 4',
      '- + 1 * 7 6 ^ 2 - 5 * 4 3','1 7 6 * + 2 5 4 3 * - ^ -',
    ],{setNum:'2',isCodeOptions:true}),
    question(25,2017,1,raw`A circular queue has been implemented using a singly linked list where each node consists of a value and a single pointer pointing to the next node. We maintain exactly two external pointers FRONT and REAR pointing to the front node and the rear node of the queue, respectively. Which of the following statements is/are CORRECT for such a circular queue so that insertion and deletion operations can be performed in $O(1)$ time?
I. Next pointer of front node points to the rear node.
II. Next pointer of rear node points to the front node.`,['I only','II only','Both I and II','Neither I nor II'],{setNum:'2'}),
    question(26,2018,1,raw`A queue is implemented using a non-circular singly linked list. The queue has a head pointer and a tail pointer, as shown in the figure. Let $n$ denote the number of nodes in the queue. Let enqueue be implemented by inserting a new node at the head and dequeue be implemented by deletion of a node from the tail.
[IMG_1]
Which of the following is the time complexity of the most time-efficient implementation of enqueue and dequeue, respectively, for this data structure?`,[
      raw`$\Theta(1),\Theta(1)$`,raw`$\Theta(1),\Theta(n)$`,raw`$\Theta(n),\Theta(1)$`,raw`$\Theta(n),\Theta(n)$`,
    ],{diagram:'stacks-queues-3-26'}),
    question(27,2021,1,`Consider the following sequence of operations on an empty stack.
[CODE]
The value of $s+q$ is _____.`,[],{setNum:'1',code:`Stack operations:
push(54); push(52); pop(); push(55);
push(62); s = pop();

Queue operations:
enqueue(21); enqueue(24); dequeue();
enqueue(28); enqueue(32); q = dequeue();`}),
    question(28,2022,2,raw`Consider the queues $Q_1$ containing four elements and $Q_2$ containing none (shown as the Initial State in the figure). The only operations allowed on these two queues are Enqueue(Q, element) and Dequeue(Q). The minimum number of Enqueue operations on $Q_1$ required to place the elements of $Q_1$ in $Q_2$ in reverse order (shown as the Final State in the figure) without using any additional storage is _____.
[IMG_1]`,[],{diagram:'stacks-queues-3-28'}),
    question(29,2023,2,raw`Consider a sequence of elements $a_0=1$, $a_1=5$, $a_2=7$, $a_2=8$, $a_4=9$, and $a_5=2$. The following operations are performed on a stack S and a queue Q, both of which are initially empty.
I: push the elements of a from a0 to a5 in that order into S.
II: enqueue the elements of a from a0 to a5 in that order into Q.
III: pop an element from S.
IV: dequeue an element from Q.
V: pop an element from S.
VI: dequeue an element from Q.
VII: dequeue an element from Q and push the same element into S.
VIII: Repeat operation VII three times.
IX: pop an element from S.
X: pop an element from S.
The top element of S after executing the above operations is _____.`,[],{
      notes:['The source prints a2 = 7 followed by a2 = 8 (duplicate subscript; a3 is not specified). Retained literally rather than inventing a corrected subscript. The supplied printed answer is 8.'],
    }),
    question(30,2024,2,`Let S1 and S2 be two stacks. S1 has capacity of 4 elements. S2 has capacity of 2 elements. S1 already has 4 elements: 100, 200, 300, and 400, whereas S2 is empty, as shown below.
[IMG_1]
Only the following three operations are available:
PushToS2: Pop the top element from S1 and push it on S2.
PushToS1: Pop the top element from S2 and push it on S1.
GenerateOutput: Pop the top element from S1 and output it to the user.
Note that the pop operation is not allowed on an empty stack and the push operation is not allowed on a full stack.
Which of the following output sequences can be generated by using the above operations?`,[
      '400, 200, 100, 300','200, 300, 400, 100','100, 200, 400, 300','300, 200, 400, 100',
    ],{setNum:'2',diagram:'stacks-queues-3-30'}),
  ],
};
