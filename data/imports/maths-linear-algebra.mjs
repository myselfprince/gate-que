const raw = String.raw;
const sourceHash = 'db82237929f2ad56a350754384712fa8e74edf893fb7cc827830d06e9bcd9337';

function question(number, year, marks, text, options = [], extra = {}) {
  const {notes = [], ...fields} = extra;
  const page = number <= 9 ? 95 : number <= 18 ? 96 : number <= 28 ? 97 : number <= 40 ? 98 : number <= 51 ? 99 : number <= 61 ? 100 : 101;
  return {
    id: `madeeasy-maths-linear-algebra-6-${number}`, text, code: '', year: String(year), marks: String(marks), setNum: '',
    rawTopic: 'Linear Algebra', diagram: '', ext: '.png',
    optA: options[0] || '', optB: options[1] || '', optC: options[2] || '', optD: options[3] || '',
    questionType: options.length ? 'MCQ' : 'NAT', correctOptions: [], natAnswer: '',
    isBlank: false, isPosLocked: false, isCodeOptions: false, isProof: false,
    needsManualOptionFix: false, optLayout: 'auto', tempPaste: '', ...fields,
    source: {
      file: '11. Engg. Maths/2. Linear Algebra.pdf', sha256: sourceHash, questionNumber: `6.${number}`,
      bookPages: number === 51 ? [99,100] : [page], pdfPages: number === 51 ? [3,4] : [Math.floor((page-94)/2)+1],
      answerKeyPdfPage: null, answerKeyStatus: 'not-supplied',
      notes: ['All four supplied scanned spreads were visually reviewed. Linear Algebra Q6.1-Q6.68 occupy book pages 95-101. Book page 94 contains the previous Probability chapter explanations and is excluded. No Linear Algebra answer key is supplied; the answer is intentionally empty.', ...notes],
    },
  };
}

const questions = [
  question(1,1995,1,raw`The rank of the following $(n+1)\times(n+1)$ matrix, where $a$ is a real number is
$$\begin{bmatrix}1&a&a^2&\cdots&a^n\\1&a&a^2&\cdots&a^n\\\vdots&\vdots&\vdots&&\vdots\\1&a&a^2&\cdots&a^n\end{bmatrix}$$`,[
    '1','2',raw`$n$`,'Depends on the value of a',
  ]),
  question(2,1996,1,raw`Let $AX=B$ be a system of linear equations where $A$ is an $m\times n$ matrix and $b$ is a $m\times1$ column vector and $X$ is a $n\times1$ column vector of unknown. Which of the following is false?`,[
    raw`The system has a solution if and only if, both $A$ and the augmented matrix $[A,B]$ have the same rank.`,
    raw`If $m<n$ and $B$ is the zero vector, then the system has infinitely many solutions.`,
    raw`If $m=n$ and $B$ is non-zero vector, then the system has a unique solution.`,
    raw`The system will have only a trivial solution when $m=n$, $B$ is the zero vector and $\operatorname{rank}(A)=n$.`,
  ],{notes:['The opening prints AX=B followed by lower-case b; the letter case is preserved.']}),
  question(3,1996,2,raw`The matrices $\begin{bmatrix}\cos\theta&-\sin\theta\\\sin\theta&\cos\theta\end{bmatrix}$ and $\begin{bmatrix}a&0\\0&b\end{bmatrix}$ commute under multiplication`,[
    raw`if $a=b$ or $\theta=n\pi$, $n$ is an integer`,'always','never',raw`if $a\cos\theta\ne b\sin\theta$`,
  ]),
  question(4,1997,1,raw`The determinant of the matrix
$$\begin{bmatrix}6&-8&1&1\\0&2&4&6\\0&0&4&8\\0&0&0&-1\end{bmatrix}$$
is`,['11',raw`$-48$`,'0',raw`$-24$`]),
  question(5,1997,2,raw`Let $a=(a_{ij})$ be an $n$-rowed square matrix and $I_{12}$ be the matrix obtained by interchanging the first and second rows of the $n$-rowed Identity matrix. Then $AI_{12}$ is such that its first`,[
    'row the same as its second row','row is the same as the second row of A','column is the same as the second column A','row is all zero',
  ],{notes:['The stem names the matrix a=(a_ij), then uses A; the printed wording of options A and C is preserved.']}),
  question(6,1998,1,raw`Consider the following set of equations:
$$\begin{aligned}x+2y&=5\\4x+8y&=12\\3x+6y+3z&=15\end{aligned}$$
This set`,['has a unique solution','has no solution','has finite number of solutions','has infinite number of solutions']),
  question(7,1998,2,raw`The rank of the matrix given below is
$$\begin{bmatrix}1&4&8&7\\0&0&3&0\\4&2&3&1\\3&12&24&21\end{bmatrix}$$`,['3','1','2','4']),
  question(8,1998,2,raw`Consider the following determinant:
$$\Delta=\begin{vmatrix}1&a&bc\\1&b&ca\\1&c&ab\end{vmatrix}$$
Which of the following is a factor of $\Delta$?`,[raw`$a+b$`,raw`$a-b$`,raw`$a+b+c$`,raw`$abc$`]),
  question(9,2000,1,raw`An $n\times n$ array $v$ is defined as follows:
$$v[i,j]=i-j\text{ for all }i,j,\quad1\le i\le n,\;1\le j\le n$$
The sum of the elements of the array $v$ is`,['0',raw`$n-1$`,raw`$n^2-3n+2$`,raw`$n^2\dfrac{n+1}{2}$`]),
  question(10,2001,1,raw`The determinant of the matrix
$$\begin{bmatrix}2&0&0&0\\8&1&7&2\\2&0&2&0\\9&0&6&1\end{bmatrix}$$
is`,['4','0','15','20']),
  question(11,2002,1,raw`Consider the following statements:
$S_1$: The sum of two singular $n\times n$ matrices may be non-singular.
$S_2$: The sum of two $n\times n$ non-singular matrices may be singular.
Which of the following statements is correct?`,[
    raw`$S_1$ and $S_2$ are both true`,raw`$S_1$ is true, $S_2$ is false`,raw`$S_1$ is false, $S_2$ is true`,raw`$S_1$ and $S_2$ are both false`,
  ]),
  question(12,2002,1,raw`The rank of the matrix $\begin{bmatrix}1&1\\0&0\end{bmatrix}$ is`,['4','2','1','0']),
  question(13,2002,2,raw`Obtain the eigen values of the matrix
$$A=\begin{bmatrix}1&2&34&49\\0&2&43&94\\0&0&-2&104\\0&0&0&-1\end{bmatrix}$$`,[],{questionType:'SUBJECTIVE',notes:['The source asks to obtain eigenvalues without options or an answer blank. Retained as SUBJECTIVE rather than inventing MCQ options or treating this historical question as NAT.']}),
  question(14,2003,2,raw`Consider the following system of linear equations
$$\begin{bmatrix}2&1&-4\\4&3&-12\\1&2&-8\end{bmatrix}\begin{bmatrix}x\\y\\z\end{bmatrix}=\begin{bmatrix}\alpha\\5\\7\end{bmatrix}$$
Notice that the second and the third columns of the coefficient matrix are linearly dependent. For how many values of $\alpha$, does this system of equations have infinitely many solutions?`,['0','1','2','Infinitely many']),
  question(15,2004,1,raw`Let $A,B,C,D$ be $n\times n$ matrices, each with non-zero determinant. If $ABCD=I$, then $B^{-1}$ is`,[
    raw`$D^{-1}C^{-1}A^{-1}$`,raw`$CDA$`,raw`$ADC$`,'does not necessarily exist',
  ]),
  question(16,2004,1,raw`What values of $x,y$ and $z$ satisfy the following system of linear equations?
$$\begin{bmatrix}1&2&3\\1&3&4\\2&2&3\end{bmatrix}\begin{bmatrix}x\\y\\z\end{bmatrix}=\begin{bmatrix}6\\8\\12\end{bmatrix}$$`,[
    raw`$x=6,\;y=3,\;z=2$`,raw`$x=12,\;y=3,\;z=-4$`,raw`$x=6,\;y=6,\;z=-4$`,raw`$x=12,\;y=-3,\;z=0$`,
  ]),
  question(17,2004,2,raw`Let $A$ be an $n\times n$ matrix of the following form.
$$A=\begin{bmatrix}
3&1&0&0&\cdots&0&0&0\\
1&3&1&0&\cdots&0&0&0\\
0&1&3&1&0&\cdots&0&0\\
0&0&1&3&1&\cdots&0&0\\
\vdots&&&&&&&\vdots\\
0&0&0&0&\cdots&1&3&1\\
0&0&0&0&\cdots&0&1&3
\end{bmatrix}_{n\times n}$$
What is the value of the determinant of $A$?`,[
    raw`$\left(\dfrac{5+\sqrt3}{2}\right)^{n-1}\left(\dfrac{5\sqrt3+7}{2\sqrt3}\right)+\left(\dfrac{5-\sqrt3}{2}\right)^{n-1}\left(\dfrac{5\sqrt3-7}{2\sqrt3}\right)$`,
    raw`$\left(\dfrac{7+\sqrt5}{2}\right)^{n-1}\left(\dfrac{7\sqrt5+3}{2\sqrt5}\right)+\left(\dfrac{7-\sqrt5}{2}\right)^{n-1}\left(\dfrac{7\sqrt5-3}{2\sqrt5}\right)$`,
    raw`$\left(\dfrac{3+\sqrt7}{2}\right)^{n-1}\left(\dfrac{3\sqrt7+5}{2\sqrt7}\right)+\left(\dfrac{3-\sqrt7}{2}\right)^{n-1}\left(\dfrac{3\sqrt7-5}{2\sqrt7}\right)$`,
    raw`$\left(\dfrac{3+\sqrt5}{2}\right)^{n-1}\left(\dfrac{3\sqrt5+7}{2\sqrt5}\right)+\left(\dfrac{3-\sqrt5}{2}\right)^{n-1}\left(\dfrac{3\sqrt5-7}{2\sqrt5}\right)$`,
  ]),
  question(18,2004,2,raw`If matrix $X=\begin{bmatrix}a&1\\-a^2+a-1&1-a\end{bmatrix}$ and $X^2-X+I=O$ ($I$ is the identity matrix and $O$ is the zero matrix), then the inverse of $X$ is`,[
    raw`$\begin{bmatrix}1-a&-1\\a^2&a\end{bmatrix}$`,
    raw`$\begin{bmatrix}1-a&-1\\a^2-a+1&a\end{bmatrix}$`,
    raw`$\begin{bmatrix}-a&1\\-a^2+a-1&1-a\end{bmatrix}$`,
    raw`$\begin{bmatrix}a^2-a+1&a\\1&1-a\end{bmatrix}$`,
  ]),
  question(19,2004,2,raw`How many solutions does the following system of linear equations have?
$$\begin{aligned}-x+5y&=-1\\x-y&=2\\x+3y&=3\end{aligned}$$`,['Infinitely many','Two distinct solutions','Unique','None of these']),
  question(20,2005,1,raw`The determinant of the matrix given below is
$$\begin{bmatrix}0&1&0&2\\-1&1&1&3\\0&0&0&1\\1&-2&0&1\end{bmatrix}$$`,[raw`$-1$`,'0','1','2']),
  question(21,2005,2,raw`Consider the following system of equations in three real variables $x_1,x_2$ and $x_3$
$$\begin{aligned}2x_1-x_2+3x_3&=1\\3x_1-2x_2+5x_3&=2\\-x_1-4x_2+x_3&=3\end{aligned}$$
This system of equations has`,['no solution','a unique solution','more than one but a finite number of solutions','an infinite number of solutions']),
  question(22,2005,2,raw`What are the eigenvalues of the following $2\times2$ matrix?
$$\begin{bmatrix}2&-1\\-4&5\end{bmatrix}$$`,[raw`$-1$ and $1$`,'1 and 6','2 and 5',raw`$4$ and $-1$`]),
  question(23,2006,2,raw`$F$ is an $n\times n$ real matrix. $b$ is an $n\times1$ real vector. Suppose there are two $n\times1$ vectors, $u$ and $v$ such that $u\ne v$, and $Fu=b$, $Fv=b$.
Which one of the following statements is false?`,[
    raw`Determinant of $F$ is zero`,raw`There are an infinite number of solutions to $Fx=b$`,raw`There is an $x\ne0$ such that $Fx=0$`,raw`$F$ must have two identical rows`,
  ]),
  question(24,2006,2,raw`What are the eigenvalues of the matrix $P$ given below:
$$P=\begin{pmatrix}a&1&0\\1&a&1\\0&1&a\end{pmatrix}$$`,[
    raw`$a,\;a-\sqrt2,\;a+\sqrt2$`,raw`$a,\;a,\;a$`,raw`$0,\;a,\;2a$`,raw`$-a,\;2a,\;2a$`,
  ]),
  question(25,2007,1,raw`Let $A$ be the matrix $\begin{bmatrix}3&1\\1&2\end{bmatrix}$. What is the maximum value of $x^TAx$ where the maximum is taken over all $x$ that are the unit eigenvectors of $A$?`,[
    '3',raw`$\dfrac{5+\sqrt5}{2}$`,'3',raw`$\dfrac{5-\sqrt5}{2}$`,
  ],{notes:['Options A and C both print 3; the duplicate option values are preserved.']}),
  question(26,2007,2,raw`Consider the set of (column) vectors defined by $X=\{x\in\mathbb R^3\mid x_1+x_2+x_3=0,\text{ where }X^T=[x_1,x_2,x_3]^T\}$. Which of the following is TRUE?`,[
    raw`$\{[1,-1,0]^T,[1,0,-1]^T\}$ is a basis for the subspace $X$.`,
    raw`$\{[1,-1,0]^T,[1,0,-1]^T\}$ is a linearly independent set, but it does not span $X$ and therefore is not a basis of $X$`,
    raw`$X$ is not a subspace for $\mathbb R^3$`,'None of the above',
  ],{notes:['The source writes X^T=[x_1,x_2,x_3]^T in its set definition; the inconsistent upper-case X and transpose are preserved.']}),
  question(27,2008,1,raw`The following system of equations
$$\begin{aligned}x_1+x_2+2x_3&=1\\x_1+2x_3+3x_3&=2\\x_1+4x_2+ax_3&=4\end{aligned}$$
has a unique solution. The only possible value(s) for $a$ is/are`,[
    '0','either 0 or 1',raw`one of $0,1$ or $-1$`,'any real number other than 5',
  ],{notes:['The second printed equation has 2x_3+3x_3. It is retained literally; no x_2 is substituted. The bundled choices make this an MCQ despite is/are wording.']}),
  question(28,2008,2,raw`How many of the following matrices have an eigenvalue 1?
$$\begin{bmatrix}1&0\\0&0\end{bmatrix},\quad\begin{bmatrix}0&1\\0&0\end{bmatrix},\quad\begin{bmatrix}1&-1\\1&1\end{bmatrix}\quad\text{and}\quad\begin{bmatrix}-1&0\\1&-1\end{bmatrix}$$`,['one','two','three','four']),
  question(29,2008,2,raw`If $M$ is a square matrix with a zero determinant, which of the following assertion(s) is (are) correct?
S1: Each row of $M$ can be represented as a linear combination of the other rows
S2: Each column of $M$ can be represented as a linear combination of the other columns
S3: $MX=O$ has a nontrivial solution
S4: $M$ has an inverse`,['S3 and S2','S1 and S4','S1 and S3','S1, S2 and S3'],{notes:['The grouped assertion combinations are MCQ options, not independently selectable MSQ assertions.']}),
  question(30,2010,2,raw`Consider the following matrix:
$$A=\begin{bmatrix}2&3\\x&y\end{bmatrix}$$
If the eigenvalues of $A$ are 4 and 8, then`,[
    raw`$x=4,\;y=10$`,raw`$x=5,\;y=8$`,raw`$x=-3,\;y=9$`,raw`$x=-4,\;y=10$`,
  ]),
  question(31,2011,2,raw`Consider the matrix as given below:
$$\begin{bmatrix}1&2&3\\0&4&7\\0&0&3\end{bmatrix}$$
Which one of the following options provides the CORRECT values of the eigenvalues of the matrix?`,['1, 4, 3','3, 7, 3','7, 3, 2','1, 2, 3']),
  question(32,2012,1,raw`Let $A$ be the $2\times2$ matrix with elements $a_{11}=a_{12}=a_{21}=+1$ and $a_{22}=-1$.
Then the eigenvalues of the matrix $A^{19}$ are`,[
    raw`$1024$ and $-1024$`,raw`$1024\sqrt2$ and $-1024\sqrt2$`,raw`$4\sqrt2$ and $-4\sqrt2$`,raw`$512\sqrt2$ and $-512\sqrt2$`,
  ]),
  question(33,2013,1,raw`Which one of the following does NOT equal
$$\begin{vmatrix}1&x&x^2\\1&y&y^2\\1&z&z^2\end{vmatrix}?$$`,[
    raw`$\begin{vmatrix}1&x(x+1)&x+1\\1&y(y+1)&y+1\\1&z(z+1)&z+1\end{vmatrix}$`,
    raw`$\begin{vmatrix}1&x+1&x^2+1\\1&y+1&y^2+1\\1&z+1&z^2+1\end{vmatrix}$`,
    raw`$\begin{vmatrix}0&x-y&x^2-y^2\\0&y-z&y^2-z^2\\1&z&z^2\end{vmatrix}$`,
    raw`$\begin{vmatrix}2&x+y&x^2+y^2\\2&y+z&y^2+z^2\\1&z&z^2\end{vmatrix}$`,
  ]),
  question(34,2014,1,raw`Consider the following system of equations:
$$\begin{aligned}3x+2y&=1\\4x+7z&=1\\x+y+z&=3\\x-2y+7z&=0\end{aligned}$$
The number of solutions for this system is ______.`,[],{setNum:'1'}),
  question(35,2014,1,raw`The value of the dot product of the eigenvectors corresponding to any pair of different eigen values of a 4-by-4 symmetric positive definite matrix is ______.`,[],{setNum:'1'}),
  question(36,2014,1,raw`If the matrix $A$ is such that
$$A=\begin{bmatrix}2\\-4\\7\end{bmatrix}\begin{bmatrix}1&9&5\end{bmatrix}$$
then the determinant of $A$ is equal to ______.`,[],{setNum:'2'}),
  question(37,2014,2,raw`The product of the non-zero eigenvalues of the matrix
$$\begin{bmatrix}1&0&0&0&1\\0&1&1&1&0\\0&1&1&1&0\\0&1&1&1&0\\1&0&0&0&1\end{bmatrix}$$
is ______.`,[],{setNum:'2'}),
  question(38,2014,1,raw`Which one of the following statements is TRUE about every $n\times n$ matrix with only real eigenvalues?`,[
    'If the trace of the matrix is positive and the determinant of the matrix is negative, at least one of its eigenvalues is negative.',
    'If the trace of the matrix is positive, all its eigenvalues are positive.',
    'If the determinant of the matrix is positive, all its eigenvalues are positive.',
    'If the product of the trace and determinant of the matrix is positive, all its eigenvalues are positive.',
  ],{setNum:'3'}),
  question(39,2014,1,raw`If $V_1$ and $V_2$ are 4-dimensional subspaces of a 6-dimensional vector space $V$, then the smallest possible dimension of $V_1\cap V_2$ is ______.`,[],{setNum:'3'}),
  question(40,2014,1,raw`The minimum number of arithmetic operations required to evaluate the polynomial $P(X)=X^5+4X^3+6X+5$ for a given value of $X$, using only one temporary variable is ______.`,[],{setNum:'3'}),
  question(41,2015,2,raw`Consider the following $2\times2$ matrix $A$ where two elements are unknown and are marked by 'a' and 'b'. The eigenvalues of this matrix are $-1$ and 7. What are the values of 'a' and 'b'?
$$A=\begin{pmatrix}1&4\\b&a\end{pmatrix}$$`,[
    raw`$a=6,\;b=4$`,raw`$a=4,\;b=6$`,raw`$a=3,\;b=5$`,raw`$a=5,\;b=3$`,
  ],{setNum:'1'}),
  question(42,2015,1,raw`The larger of the two eigenvalues of the matrix $\begin{bmatrix}4&5\\2&1\end{bmatrix}$ is ______.`,[],{setNum:'2'}),
  question(43,2015,2,raw`Perform the following operations on the matrix
$$\begin{bmatrix}3&4&45\\7&9&105\\13&2&195\end{bmatrix}.$$
1. Add the third row to the second row.
2. Subtract the third column from the first column.
The determinant of the resultant matrix is ______.`,[],{setNum:'2'}),
  question(44,2015,1,raw`In the given matrix $\begin{bmatrix}1&-1&2\\0&1&0\\1&2&1\end{bmatrix}$, one of the eigenvalues is 1. The eigenvectors corresponding to the eigenvalue 1 are`,[
    raw`$\{\alpha(4,2,1)\mid\alpha\ne0,\alpha\in\mathbb R\}$`,
    raw`$\{\alpha(-4,2,1)\mid\alpha\ne0,\alpha\in\mathbb R\}$`,
    raw`$\{\alpha(\sqrt2,0,1)\mid\alpha\ne0,\alpha\in\mathbb R\}$`,
    raw`$\{\alpha(-\sqrt2,0,1)\mid\alpha\ne0,\alpha\in\mathbb R\}$`,
  ],{setNum:'3'}),
  question(45,2015,1,raw`In the LU decomposition of the matrix $\begin{bmatrix}2&2\\4&9\end{bmatrix}$, if the diagonal elements of $U$ are both 1, then the lower diagonal entry $l_{22}$ of $L$ is ______.`,[],{setNum:'1',notes:['The printed question calls l_22 a lower diagonal entry; the subscript and wording are retained.']}),
  question(46,2015,2,raw`If the following system has non-trivial solution,
$$\begin{aligned}px+qy+rz&=0\\qx+ry+pz&=0\\rx+py+qz&=0\end{aligned}$$
then which one of the following options is TRUE?`,[
    raw`$p-q+r=0$ or $p=q=-r$`,raw`$p+q-r=0$ or $p=-q=r$`,raw`$p+q+r=0$ or $p=q=r$`,raw`$p-q+r=0$ or $p=-q=-r$`,
  ],{setNum:'3',notes:['The stem is in book page 99 left column; all four options continue at the top of the right column.']}),
  question(47,2016,1,raw`Two eigenvalues of a $3\times3$ real matrix $P$ are $(2+\sqrt{-1})$ and 3. The determinant of $P$ is ______.`,[],{setNum:'1'}),
  question(48,2016,1,raw`Consider the systems, each consisting of $m$ linear equations in $n$ variables.
I. If $m<n$, then all such systems have a solution.
II. If $m>n$, then none of these systems has a solution.
III. If $m=n$, then there exists a system which has a solution.
Which one of the following is CORRECT?`,['I, II and III are true','Only II and III are true','Only III is true','None of them is true'],{setNum:'2'}),
  question(49,2016,1,raw`Suppose that the eigenvalues of matrix $A$ are 1, 2, 4. The determinant of $(A^{-1})^T$ is ______.`,[],{setNum:'2'}),
  question(50,2017,1,raw`Let $c_1,\ldots,c_n$ be scalars, not all zero, such that
$$\sum_{i=1}^n c_i a_i=0\quad\text{where }a_i\text{ are column vectors in }\mathbb R^n.$$
Consider the set of linear equations
$$Ax=b$$
where $A=[a_1,\ldots,a_n]$ and $b=\sum_{i=1}^n a_i$. The set of equations has`,[
    raw`a unique solution at $x=J_n$ where $J_n$ denotes a $n$-dimensional vector of all 1`,
    'no solution','infinitely many solutions','finitely many solutions',
  ],{setNum:'1'}),
  question(51,2017,2,raw`Let $A$ be $n\times n$ real valued square symmetric matrix of rank 2 with $\sum_{i=1}^n\sum_{j=1}^n A_{ij}^2=50$. Consider the following statements.
I. One eigenvalue must be in $[-5,5]$.
II. The eigenvalue with the largest magnitude must be strictly greater than 5.
Which of the above statements about eigenvalues of $A$ is/are necessarily CORRECT?`,[
    'Both I and II','I only','II only','Neither I nor II',
  ],{setNum:'1',notes:['The stem and assertions are on PDF spread 3 / book page 99; its concluding question, all four grouped MCQ options and exam reference continue on PDF spread 4 / book page 100.']}),
  question(52,2017,1,raw`Let $P=\begin{bmatrix}1&1&-1\\2&-3&4\\3&-2&3\end{bmatrix}$ and $Q=\begin{bmatrix}-1&-2&-1\\6&12&6\\5&10&5\end{bmatrix}$ be two matrices. Then the rank of $P+Q$ is ______.`,[],{setNum:'2'}),
  question(53,2017,1,raw`If the characteristic polynomial of a $3\times3$ matrix $M$ over $\mathbb R$ (the set of real numbers) is $\lambda^3-4\lambda^2+a\lambda+30$, $a\in\mathbb R$ and one eigenvalue of $M$ is 2, then the largest among the absolute values of the eigenvalues of $M$ is ______.`,[],{setNum:'2'}),
  question(54,2018,1,raw`Consider a matrix $A=uv^T$ where $u=\begin{pmatrix}1\\2\end{pmatrix}$, $v=\begin{pmatrix}1\\1\end{pmatrix}$. Note that $v^T$ denotes the transpose of $v$. The largest eigenvalue of $A$ is ______.`),
  question(55,2018,2,raw`Consider a matrix $P$ whose only eigenvectors are the multiples of $\begin{bmatrix}1\\4\end{bmatrix}$.
Consider the following statements:
I. $P$ does not have an inverse.
II. $P$ has a repeated eigenvalue.
III. $P$ cannot be diagonalized.
Which one of the following options is correct?`,[
    'Only I and III are necessarily true','Only II is necessarily true','Only I and II are necessarily true','Only II and III are necessarily true',
  ]),
  question(56,2019,1,raw`Let $X$ be a square matrix. Consider the following two statements on $X$.
I. $X$ is invertible.
II. Determinant of $X$ is non-zero.
Which one of the following is TRUE?`,[
    'I implies II; II does not imply I.','II implies I; I does not imply II.','I and II are equivalent statements.','I does not imply II; II does not imply I.',
  ]),
  question(57,2019,2,raw`Consider the following matrix:
$$R=\begin{bmatrix}1&2&4&8\\1&3&9&27\\1&4&16&64\\1&5&25&125\end{bmatrix}$$
The absolute value of the product of Eigen values of $R$ is ______.`),
  question(58,2020,2,raw`Let $A$ and $B$ be two $n\times n$ matrices over real numbers. Let $\operatorname{rank}(M)$ and $\det(M)$ denote the rank and determinant of a matrix $M$, respectively. Consider the following statements:
I. $\operatorname{rank}(AB)=\operatorname{rank}(A)\operatorname{rank}(B)$
II. $\det(AB)=\det(A)\det(B)$
III. $\operatorname{rank}(A+B)\le\operatorname{rank}(A)+\operatorname{rank}(B)$
IV. $\det(A+B)\le\det(A)+\det(B)$
Which of the above statements are TRUE?`,['III and IV only','II and III only','I and IV only','I and II only']),
  question(59,2021,2,raw`Consider the following matrix:
$$\begin{pmatrix}0&1&1&1\\1&0&1&1\\1&1&0&1\\1&1&1&0\end{pmatrix}$$
The largest eigenvalue of the above matrix is ______.`,[],{setNum:'1'}),
  question(60,2021,1,raw`Suppose that $P$ is a $4\times5$ matrix such that every solution of the equation $Px=0$ is a scalar multiple of $[2\;5\;4\;3\;1]^T$. The rank of $P$ is ______.`,[],{setNum:'2'}),
  question(61,2022,1,raw`Consider the following two statements with respect to the matrices $A_{m\times n}$, $B_{n\times m}$, $C_{n\times n}$ and $D_{n\times n}$.
Statement 1: $\operatorname{tr}(AB)=\operatorname{tr}(BA)$
Statement 2: $\operatorname{tr}(CD)=\operatorname{tr}(DC)$
where $\operatorname{tr}(\,)$ represents the trace of a matrix. Which one of the following holds?`,[
    'Statement 1 is correct and Statement 2 is wrong.','Statement 1 is wrong and Statement 2 is correct.','Both Statement 1 and Statement 2 are correct.','Both Statement 1 and Statement 2 are wrong.',
  ]),
  question(62,2022,2,raw`Consider solving the following system of simultaneous equations using $LU$ decomposition.
$$\begin{aligned}x_1+x_2-2x_3&=4\\x_1+3x_2-x_3&=7\\2x_1+x_2-5x_3&=7\end{aligned}$$
where $L$ and $U$ are denoted as
$$L=\begin{pmatrix}L_{11}&0&0\\L_{21}&L_{22}&0\\L_{31}&L_{32}&L_{33}\end{pmatrix},\quad U=\begin{pmatrix}U_{11}&U_{12}&U_{13}\\0&U_{22}&U_{23}\\0&0&U_{33}\end{pmatrix}$$
Which one of the following is the correct combination of values for $L_{32}$, $U_{32}$, and $x_1$?`,[
    raw`$L_{32}=2,\;U_{33}=-\dfrac12,\;x_1=-1$`,
    raw`$L_{32}=2,\;U_{32}=2,\;x_1=-1$`,
    raw`$L_{32}=-\dfrac12,\;U_{33}=2,\;x_1=0$`,
    raw`$L_{32}=-\dfrac12,\;U_{33}=-\dfrac12,\;x_1=0$`,
  ],{notes:['The stem prints U_32, option B also prints U_32, and options A/C/D print U_33. This source inconsistency is retained, without inferred correction.']}),
  question(63,2022,2,raw`Which of the following is/are the eigen vector(s) for the matrix given below?
$$\begin{pmatrix}-9&-6&-2&-4\\-8&-6&-3&-1\\20&15&8&5\\32&21&7&12\end{pmatrix}$$`,[
    raw`$\begin{pmatrix}-1\\1\\0\\1\end{pmatrix}$`,raw`$\begin{pmatrix}1\\0\\-1\\0\end{pmatrix}$`,raw`$\begin{pmatrix}-1\\0\\2\\2\end{pmatrix}$`,raw`$\begin{pmatrix}0\\1\\-3\\0\end{pmatrix}$`,
  ],{questionType:'MSQ'}),
  question(64,2023,1,raw`Let and $A=\begin{bmatrix}1&2&3&4\\4&1&2&3\\3&4&1&2\\2&3&4&1\end{bmatrix}$ and $B=\begin{bmatrix}3&4&1&2\\4&1&2&3\\1&2&3&4\\2&3&4&1\end{bmatrix}$.
Let $\det(A)$ and $\det(B)$ denote the determinants of the matrices $A$ and $B$, respectively. Which one of the options given below is TRUE?`,[
    raw`$\det(A)=\det(B)$`,raw`$\det(B)=-\det(A)$`,raw`$\det(A)=0$`,raw`$\det(AB)=\det(A)+\det(B)$`,
  ],{notes:['The printed opening "Let and A" is preserved.']}),
  question(65,2023,1,raw`Let $A$ be the adjacency matrix of the graph with vertices $\{1,2,3,4,5\}$.
[IMG_1]
Let $\lambda_1,\lambda_2,\lambda_3,\lambda_4$ and $\lambda_5$ be the five eigenvalues of $A$. Note that these eigenvalues need not be distinct.
The value of $\lambda_1+\lambda_2+\lambda_3+\lambda_4+\lambda_5=$ ______.`,[],{diagram:'linear-algebra-6-65-graph'}),
  question(66,2024,1,raw`The product of all eigen values of the matrix
$$\begin{bmatrix}1&2&3\\4&5&6\\7&8&9\end{bmatrix}$$
is`,['0','1',raw`$-1$`,'2'],{setNum:'1'}),
  question(67,2024,2,raw`Let $A$ be any $n\times m$ matrix, where $m>n$. Which of the following statements is/are TRUE about the system of linear equations $Ax=0$?`,[
    raw`There exist at least $m-n$ linearly independent solutions to this system`,
    raw`There exists a solution in which at least $n$ variables are non-zero`,
    raw`There exists a non-zero solution in which at least $m-n$ variables are 0`,
    raw`There exist $m-n$ linearly independent vectors such that every solution is a linear combination of these vectors`,
  ],{questionType:'MSQ',setNum:'1'}),
  question(68,2024,2,raw`Let $A$ be an $n\times n$ matrix over the set of all real numbers $\mathbb R$. Let $B$ be a matrix obtained from $A$ by swapping two rows. Which of the following statements is/are TRUE?`,[
    raw`If the trace of $A$ is zero, then the trace of $B$ is also zero.`,
    raw`If $A$ is invertible, then $B$ is also invertible.`,
    raw`If $A$ is symmetric, then $B$ is also symmetric.`,
    raw`The determinant of $B$ is the negative of the determinant of $A$.`,
  ],{questionType:'MSQ',setNum:'2'}),
];

export const LINEAR_ALGEBRA_IMPORT = {
  subject: '11. Engg. Maths', chapter: '2. Linear Algebra', sourceHash, questions,
};
