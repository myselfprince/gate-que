const raw = String.raw;
const sourceHash = '09631d0c7973ec663deae638233f5a17f75e19661cba9484ef8902ab8c48f4fe';
const answers = 'A A A A B C A A A C 0 19'.split(' ');
function question(number, year, marks, text, options = [], extra = {}) {
  const {notes = [], ...fields} = extra;
  const bookPages = number < 7 ? [363] : number === 7 ? [363, 364] : [364];
  return {
    id: `madeeasy-data-structures-arrays-2-${number}`, text, code: '', year: String(year), marks: String(marks), setNum: '',
    rawTopic: 'Array', diagram: '', ext: '.png',
    optA: options[0] || '', optB: options[1] || '', optC: options[2] || '', optD: options[3] || '',
    questionType: options.length ? 'MCQ' : 'NAT', correctOptions: options.length ? [answers[number-1]] : [], natAnswer: options.length ? '' : answers[number-1],
    isBlank: false, isPosLocked: false, isCodeOptions: false, isProof: false, needsManualOptionFix: false, optLayout: 'auto', tempPaste: '', ...fields,
    source: {
      file: '6. Data Structures/1. Arrays.pdf', sha256: sourceHash, questionNumber: `2.${number}`,
      bookPages, pdfPages: [...new Set(bookPages.map(page => page === 363 ? 1 : 2))], answerKeyPdfPage: 2,
      notes: ['Answer transcribed from the printed Arrays key, PDF page 2 / book page 365.', ...notes],
    },
  };
}
export const DATA_STRUCTURES_ARRAYS_IMPORT = {
  subject: '6. Data Structures', chapter: '1. Arrays', sourceHash,
  questions: [
    question(1,1998,2,`Let A be a two-dimensional array declared as follows:
[CODE]
Assuming that each integer takes one memory location. The array is stored in row-major order and the first element of the array is stored at location 100, what is the address of the element A[i][j]?`,[
      '$15i+j+84$', '$15j+i+84$', '$10i+j+89$', '$10j+i+89$',
    ],{code:'A : array [1 ... 10] [1 ... 15] of integer;'}),
    question(2,2000,1,raw`An $n\times n$ array $v$ is defined as follows:
$v[i,j]=i-j$ for all $i,j$, $1\le i\le n$, $1\le j\le n$.
The sum of the elements of the array $v$ is`,['$0$','$n-1$','$n^2-3n+2$',raw`$\dfrac{n^2(n+1)}{2}$`]),
    question(3,2000,1,raw`Suppose you are given an array s[1...n] and a procedure reverse(s, i, j) which reverses the order of elements in between positions i and j (both inclusive). What does the following sequence do, where $1\le k\le n$:
[CODE]`,['Rotates s left by k positions','Leaves s unchanged','Reverses all elements of s','None of the above'],{code:`reverse(s, 1, k);
reverse(s, k + 1, n);
reverse(s, 1, n);`}),
    question(4,2005,1,`A program P reads in 500 integers in the range (0, 100) representing the scores of 500 students. It then prints the frequency of each score above 50, what would be the best way for P to store the frequencies?`,[
      'An array of 50 numbers','An array of 100 numbers','An array of 500 numbers','A dynamically allocated array of 550 numbers',
    ]),
    question(5,2005,2,`Let a be an array containing n integers in increasing order. The following algorithm determines whether there are two distinct numbers in the array whose difference is a specified number $S>0$.
[CODE]
Choose the correct expression for E.`,['a[j] - a[i] > S','a[j] - a[i] < S','a[i] - a[j] < S','a[i] - a[j] > S'],{code:`i = 0; j = 1;
while (j < n) {
    if (E) j++;
    else if (a[j] - a[i] == S) break;
    else i++;
}
if (j < n) printf("yes");
else printf("no");`}),
    question(6,2005,2,raw`Let a and b be two sorted arrays containing $n$ integers each, in non-decreasing order. Let c be a sorted array containing $2n$ integers obtained by merging the two arrays a and b. Assuming the arrays are indexed starting from 0, consider the following four statements:
I. $a[i]\ge b[i]\Rightarrow c[2i]\ge a[i]$
II. $a[i]\ge b[i]\Rightarrow c[2i]\ge b[i]$
III. $a[i]\ge b[i]\Rightarrow c[2i]\le a[i]$
IV. $a[i]\ge b[i]\Rightarrow c[2i]\le b[i]$
Which of the following is TRUE`,['Only I and II','Only I and IV','Only II and III','Only III and IV']),
    question(7,2014,2,`Consider the following C function in which size is the number of elements in the array E:
[CODE]
The value returned by the function MyX is the`,[
      'maximum possible sum of elements in any sub-array of array E.',
      'maximum element in any sub-array of array E.',
      'sum of the maximum elements in all possible sub-arrays of array E.',
      'sum of all the elements in the array E.',
    ],{setNum:'1',code:`int MyX(int *E, unsigned int size) {
    int Y = 0;
    int Z;
    int i, j, k;
    for (i = 0; i < size; i++)
        Y = Y + E[i];
    for (i = 0; i < size; i++)
        for (j = i; j < size; j++) {
            Z = 0;
            for (k = i; k <= j; k++)
                Z = Z + E[k];
            if (Z > Y)
                Y = Z;
        }
    return Y;
}`}),
    question(8,2014,1,raw`Let A be a square matrix of size $n\times n$. Consider the following pseudocode. What is the expected output?
[CODE]`,['The matrix A itself','Transpose of the matrix A','Adding 100 to the upper diagonal elements and subtracting 100 from lower diagonal elements of A','None of the above'],{setNum:'3',code:`C = 100;
for i = 1 to n do
    for j = 1 to n do
    {
        Temp = A[i][j] + C;
        A[i][j] = A[j][i];
        A[j][i] = Temp - C;
    }
for i = 1 to n do
    for j = 1 to n do
        output(A[i][j]);`}),
    question(9,2015,2,`What is the output of the following C code?
Assume that the address of x is 2000 (in decimal) and an integer requires four bytes of memory.
[CODE]`,['2036, 2036, 2036','2012, 4, 2204','2036, 10, 10','2012, 4, 6'],{setNum:'1',code:`int main()
{
    unsigned int x[4][3] =
        {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}, {10, 11, 12}};
    printf("%u, %u, %u", x+3, *(x+3), *(x+2)+3);
}`}),
    question(10,2015,2,raw`Consider the following two C code segments. $Y$ and $X$ are one and two dimensional arrays of size $n$ and $n\times n$ respectively, where $2\le n\le10$. Assume that in both code segments, elements of $Y$ are initialized to 0 and each element X[i][j] of array $X$ is initialized to $i+j$. Further assume that when stored in main memory all elements of $X$ are in same main memory page frame.
[CODE]
Which of the following statements is/are correct?
S1: Final contents of array $Y$ will be same in both code segments.
S2: Elements of array $X$ accessed inside the for loop shown in code segment 1 are contiguous in main memory.
S3: Elements of array $X$ accessed inside the for loop shown in code segment 2 are contiguous in main memory.`,['Only S2 is correct','Only S3 is correct','Only S1 and S2 are correct','Only S1 and S3 are correct'],{setNum:'3',code:`Code segment 1:
// initialize elements of Y to 0
// initialize elements X[i][j] of X to i+j
for (i = 0; i < n; i++)
    Y[i] += X[0][i];

Code segment 2:
// initialize elements of Y to 0
// initialize elements X[i][j] of X to i+j
for (i = 0; i < n; i++)
    Y[i] += X[i][0];`}),
    question(11,2015,2,raw`Suppose $c=\langle c[0],\ldots,c[k-1]\rangle$ is an array of length $k$, where all the entries are from the set $\{0,1\}$. For any positive integers $a$ and $n$, consider the following pseudocode.
[CODE]
If $k=4$, $c=\langle1,0,1,1\rangle$, $a=2$ and $n=8$, then the output of DOSOMETHING(c, a, n) is _____.`,[],{setNum:'3',code:`DOSOMETHING(c, a, n)
z ← 1
for i ← 0 to k - 1
    do z ← z² mod n
       if c[i] = 1
           then z ← (z × a) mod n
return z`}),
    question(12,2020,1,`Consider the following C program:
[CODE]
The output of the program is _____.`,[],{code:raw`#include<stdio.h>
int main() {
    int a[4][5] = {{1, 2, 3, 4, 5},
                   {6, 7, 8, 9, 10},
                   {11, 12, 13, 14, 15},
                   16, 17, 18, 19, 20});
    printf("%d"\n, *(*(a+**a+2)+3));
    return(0);
}`,notes:['Printed initializer ends with 20}); and printf places \\n outside the quoted format string ("%d"\\n); both preserved literally rather than silently corrected. The printed key gives 19. These syntax anomalies make the literal C program invalid.']}),
  ],
};
