const raw = String.raw;
const sourceHash = '06a0870de3ef2626055b76a9397ca64389af901de19ab79c2ddae67c9986c1f2';
// Transcribed against every rendered page/column, including the printed key.
export const CALCULUS_ANSWERS = ['D','D','B','B','B','C','B','A','A','B','D','B','D','B','A','C','-2','A','A','4','A','C','-1','C','C','A','1','9','C','6','C','0.289','A','C','0.25','19','-0.5','BD','0','D','C','D'];
function question(number, year, marks, text, options = [], extra = {}) {
  const {notes = [], ...fields} = extra;
  const bookPage = number <= 12 ? 113 : number <= 24 ? 114 : number <= 39 ? 115 : 116;
  const answer = CALCULUS_ANSWERS[number-1];
  return {
    id: `madeeasy-maths-calculus-7-${number}`, text, code: '', year: String(year), marks: String(marks), setNum: '',
    rawTopic: 'Calculus', diagram: '', ext: '.png',
    optA: options[0] || '', optB: options[1] || '', optC: options[2] || '', optD: options[3] || '',
    questionType: number === 38 ? 'MSQ' : options.length ? 'MCQ' : 'NAT',
    correctOptions: options.length ? [...answer] : [], natAnswer: options.length ? '' : answer,
    isBlank: false, isPosLocked: false, isCodeOptions: false, isProof: false,
    needsManualOptionFix: false, optLayout: 'auto', tempPaste: '', ...fields,
    source: {
      file: '11. Engg. Maths/3. Calculus.pdf', sha256: sourceHash, questionNumber: `7.${number}`,
      bookPages: [bookPage], pdfPages: [bookPage === 113 ? 1 : bookPage <= 115 ? 2 : 3], answerKeyPdfPage: 3,
      notes: ['All three supplied scanned spreads were visually reviewed. Calculus Q7.1-Q7.42 occupy book pages 113-116. Answers are transcribed from the Calculus key on book page 117 (PDF page 3). Previous Linear Algebra explanations on book page 112 and Calculus explanations on page 117 are excluded. No question diagrams or code occur in this source.', ...notes],
    },
  };
}
const questions = [
  question(1,1995,1,raw`If at every point of a certain curve, the slope of the tangent equals $\dfrac{-2x}{y}$ the curve is`,['A straight line','A parabola','A circle','An ellipse']),
  question(2,1996,1,raw`The formula used to compute an approximation for the second derivative of a function $f$ at a point $x_0$ is`,[
    raw`$\dfrac{f(x_0+h)+f(x_0-h)}{2}$`,raw`$\dfrac{f(x_0+h)-f(x_0-h)}{2h}$`,
    raw`$\dfrac{f(x_0+h)+2f(x_0)+f(x_0-h)}{h^2}$`,raw`$\dfrac{f(x_0+h)-2f(x_0)+f(x_0-h)}{h^2}$`,
  ]),
  question(3,1997,2,raw`What is the maximum value of the function $f(x)=2x^2-2x+6$ in the interval $[0,2]$?`,['6','10','12','5.5']),
  question(4,1998,1,raw`Consider the function $y=|x|$ in the interval $[-1,1]$. In this interval, the function is`,['continuous and differentiable','continuous but not differentiable','differentiable but not continuous','neither continuous nor differentiable']),
  question(5,2005,2,raw`What is the value of $\displaystyle\int_0^{2\pi}(x-\pi)^3(\cos x)\,dx$`,[raw`$-1$`,'0','1',raw`$\pi$`]),
  question(6,2006,2,raw`The following definite integral evaluates to
$$\int_{-\infty}^0 e^{-\left(\frac{x^2}{2}\right)}\,dx$$`,[raw`$\dfrac12$`,raw`$\pi\sqrt{10}$`,raw`$\sqrt{\dfrac\pi2}$`,raw`$\pi$`]),
  question(7,2008,2,raw`If $f(x)$ is defined as follows, what is the minimum value of $f(x)$ for $x\in(0,2]$?
$$f(x)=\begin{cases}\dfrac{25}{8x}&\text{when }x\le\dfrac32\\x+\dfrac1x&\text{otherwise}\end{cases}$$`,['2',raw`$2\left(\dfrac1{12}\right)$`,raw`$2\left(\dfrac16\right)$`,raw`$2\left(\dfrac12\right)$`],{notes:['Options B-D use the printed mixed-number notation 2(1/12), 2(1/6), 2(1/2), preserved verbatim in LaTeX. The source order places 2008 Q7.7 before 2007 Q7.8.']}),
  question(8,2007,1,raw`Consider the following two statements about the function $f(x)=|x|$
P: $f(x)$ is continuous for all real values of $x$
Q: $f(x)$ is differentiable for all real values of $x$
Which of the following is TRUE?`,['P is true and Q is false','P is false and Q is true','Both P and Q are true','Both P and Q are false']),
  question(9,2008,1,raw`$\displaystyle\lim_{x\to\infty}\dfrac{x-\sin x}{x+\cos x}$ equals`,['1',raw`$-1$`,raw`$\infty$`,raw`$-\infty$`]),
  question(10,2008,2,raw`A point on a curve is said to be an extremum if it is a local minimum or a local maximum. The number of distinct extrema for the curve $3x^4-16x^3+4x^2+37$ is`,['0','1','2','3'],{notes:['The polynomial is printed with +4x^2, and the supplied answer key says B (1). Both are preserved; this apparent source stem/key inconsistency needs editorial review, without silently correcting either.']}),
  question(11,2009,2,raw`$\displaystyle\int_0^{\pi/4}(1-\tan x)/(1+\tan x)\,dx$ evaluates to`,['0','1',raw`$\ln2$`,raw`$\dfrac12\ln2$`]),
  question(12,2010,1,raw`What is the value of $\displaystyle\lim_{n\to\infty}\left(1-\dfrac1n\right)^{2n}$?`,['0',raw`$e^{-2}$`,raw`$e^{-1/2}$`,'1']),
  question(13,2011,2,raw`Given $i=\sqrt{-1}$, what will be the evaluation of the definite integral $\displaystyle\int_0^{\pi/2}\dfrac{\cos x+i\sin x}{\cos x-i\sin x}\,dx$?`,['0','2',raw`$-i$`,raw`$i$`]),
  question(14,2012,1,raw`Consider the function $f(x)=\sin(x)$ in the interval $x\in\left[\dfrac\pi4,\dfrac{7\pi}4\right]$. The number and location(s) of the local minima of this function are`,[
    raw`One, at $\dfrac\pi2\;x\in\left[\dfrac\pi4,\dfrac{7\pi}4\right]$`,raw`One, at $\dfrac{3\pi}2$`,raw`Two, at $\dfrac\pi2$ and $\dfrac{3\pi}2$`,raw`Two, at $\dfrac{3\pi}4$ and $\dfrac{3\pi}2$`,
  ],{notes:['Option A includes the extra printed x in [pi/4,7pi/4] after pi/2; retained without correction.']}),
  question(15,2013,1,raw`Which one of the following functions is continuous at $x=3$?`,[
    raw`$f(x)=\begin{cases}2,&\text{if }x=3\\x-1,&\text{if }x>3\\\dfrac{x+3}{3},&\text{if }x<3\end{cases}$`,
    raw`$f(x)=\begin{cases}4,&\text{if }x=3\\8-x,&\text{if }x\ne3\end{cases}$`,
    raw`$f(x)=\begin{cases}x+3,&\text{if }x\le3\\x-4,&\text{if }x>3\end{cases}$`,
    raw`$f(x)=\dfrac1{x^3-27}$, if $x\ne3$`,
  ],{optLayout:'2col'}),
  question(16,2014,1,raw`Let the function
$$f(q)=\begin{vmatrix}\sin\theta&\cos\theta&\tan\theta\\\sin(\pi/6)&\cos(\pi/6)&\tan(\pi/6)\\\sin(\pi/3)&\cos(\pi/3)&\tan(\pi/3)\end{vmatrix}$$
where $\theta\in\left[\dfrac\pi6,\dfrac\pi3\right]$ and $f'(\theta)$ denote the derivative of $f$ with respect to $\theta$. Which of the following statements is/are TRUE?
I. There exists $\theta\in\left(\dfrac\pi6,\dfrac\pi3\right)$ such that $f'(\theta)=0$.
II. There exists $\theta\in\left(\dfrac\pi6,\dfrac\pi3\right)$ such that $f'(\theta)\ne0$.`,['I only','II only','Both I and II','Neither I nor II'],{setNum:'1',notes:['The opening function is printed f(q), although subsequent prose uses theta; the printed q is retained.']}),
  question(17,2014,2,raw`The function $f(x)=x\sin x$ satisfies the following equation: $f''(x)+f(x)+t\cos x=0$. The value of $t$ is ________.`,[],{setNum:'1'}),
  question(18,2014,2,raw`A function $f(x)$ is continuous in the interval $[0,2]$. It is known that $f(0)=f(2)=-1$ and $f(1)=1$. Which one of the following statements must be true?`,[
    raw`There exists a $y$ in the interval $(0,1)$ such that $f(y)=f(y+1)$`,
    raw`For every $y$ in the interval $(0,1)$, $f(y)=f(2-y)$`,
    raw`The maximum value of the function in the interval $(0,2)$ is 1`,
    raw`There exists a $y$ in the interval $(0,1)$ such that $f(y)=-f(2-y)$`,
  ],{setNum:'1'}),
  question(19,2014,1,raw`A non-zero polynomial $f(x)$ of degree 3 has roots at $x=1$, $x=2$ and $x=3$. Which one of the following must be TRUE?`,[raw`$f(0)f(4)<0$`,raw`$f(0)f(4)>0$`,raw`$f(0)+f(4)>0$`,raw`$f(0)+f(4)<0$`],{setNum:'2'}),
  question(20,2014,1,raw`If $\displaystyle\int_0^{2\pi}|x\sin x|\,dx=k\pi$, then the value of $k$ is equal to ________.`,[],{setNum:'3'}),
  question(21,2014,2,raw`The value of the integral given below is
$$\int_0^\pi x^2\cos x\,dx$$`,[raw`$-2\pi$`,raw`$\pi$`,raw`$-\pi$`,raw`$2\pi$`],{setNum:'3'}),
  question(22,2015,1,raw`$\displaystyle\lim_{x\to\infty}x^{1/x}$ is`,[raw`$\infty$`,'0','1','Not defined'],{setNum:'1'}),
  question(23,2015,2,raw`$\displaystyle\int_{1/\pi}^{2/\pi}\dfrac{\cos(1/x)}{x^2}\,dx=$ ________.`,[],{setNum:'1'}),
  question(24,2015,2,raw`Let $f(x)=x^{-(1/3)}$ and $A$ denote the area of the region bounded by $f(x)$ and the X-axis, when $x$ varies from $-1$ to 1. Which of the following statements is/are True?
1. $f$ is continuous in $[-1,1]$.
2. $f$ is not bounded in $[-1,1]$.
3. $A$ is nonzero and finite.`,['2 only','3 only','2 and 3 only','1, 2 and 3'],{setNum:'2'}),
  question(25,2015,1,raw`The value of $\displaystyle\lim_{x\to\infty}(1+x^2)^{e^{-x}}$ is`,['0',raw`$\dfrac12$`,'1',raw`$\infty$`],{setNum:'3'}),
  question(26,2015,2,raw`If for non-zero $x$, $af(x)+bf\left(\dfrac1x\right)=\dfrac1x-25$ where $a\ne b$ then $\displaystyle\int_1^2 f(x)\,dx$ is`,[
    raw`$\dfrac1{a^2-b^2}\left[a(\ln2-25)+\dfrac{47b}{2}\right]$`,
    raw`$\dfrac1{a^2-b^2}\left[a(2\ln2-25)-\dfrac{47b}{2}\right]$`,
    raw`$\dfrac1{a^2-b^2}\left[a(2\ln2-25)+\dfrac{47b}{2}\right]$`,
    raw`$\dfrac1{a^2-b^2}\left[a(\ln2-25)-\dfrac{47b}{2}\right]$`,
  ],{setNum:'3',optLayout:'1col',notes:['The source condition is a != b only; no additional restriction is invented.']}),
  question(27,2016,1,raw`$\displaystyle\lim_{x\to4}\dfrac{\sin(x-4)}{x-4}=$ ________.`,[],{setNum:'1'}),
  question(28,2016,1,raw`Let $f(x)$ be a polynomial and $g(x)=f'(x)$ be its derivative. If the degree of $(f(x)+f(-x))$ is 10, then the degree of $(g(x)-g(-x))$ is ________.`,[],{setNum:'2'}),
  question(29,2017,2,raw`The value of $\displaystyle\lim_{x\to1}\dfrac{x^7-2x^5+1}{x^3-3x^2+2}$`,['is 0',raw`is $-1$`,'is 1','Does not exist'],{setNum:'1'}),
  question(30,2017,1,raw`Consider a quadratic equation $x^2-13x+36=0$ with coefficients in a base '$b$'. The solutions of this equation, in the same base '$b$' are $x=5$ and $x=6$. Then $b=$ ________.`,[],{setNum:'2',notes:['This base-number question is printed inside Calculus and is kept in its source chapter/order, without reassignment.']}),
  question(31,2017,1,raw`If $f(x)=R\sin\left(\dfrac{\pi x}{2}\right)+S$, $f'\left(\dfrac12\right)=\sqrt2$ and $\displaystyle\int_0^1 f(x)\,dx=\dfrac{2R}{\pi}$, then the constants $R$ and $S$ are, respectively`,[
    raw`$\dfrac2\pi$ and $\dfrac{16}\pi$`,raw`$\dfrac2\pi$ and 0`,raw`$\dfrac4\pi$ and 0`,raw`$\dfrac4\pi$ and $\dfrac{16}\pi$`,
  ],{setNum:'2'}),
  question(32,2018,1,raw`The value of $\displaystyle\int_0^{\pi/4}x\cos(x^2)\,dx$ correct to three decimal places (assuming that $\pi=3.14$) is ________.`),
  question(33,2019,1,raw`Compute $\displaystyle\lim_{x\to3}\dfrac{x^4-81}{2x^2-5x-3}$`,[raw`$\dfrac{108}7$`,raw`$\dfrac{53}{12}$`,'1','Limit does not exists']),
  question(34,2020,1,raw`Consider the functions:
I. $e^{-x}$
II. $x^2-\sin x$
III. $\sqrt{x^3+1}$
Which of the above functions is/are increasing everywhere in $[0,1]$?`,['I and III only','II and III only','III only','II only']),
  question(35,2021,1,raw`Consider the following expression:
$$\lim_{x\to-3}\dfrac{\sqrt{2x+22}-4}{x+3}$$
The value of the above expression (rounded to 2 decimal places) is ________.`,[],{setNum:'1'}),
  question(36,2021,1,raw`Suppose that $f:\mathbb{R}\to\mathbb{R}$ is a continuous function on the interval $[-3,3]$ and a differentiable function in the interval $(-3,3)$ such that for every $x$ in the interval, $f'(x)\le2$. If $f(-3)=7$, then $f(3)$ is at most ________.`,[],{setNum:'2'}),
  question(37,2022,1,raw`The value of the following limit is ________.
$$\lim_{x\to0+}\dfrac{\sqrt{x}}{1-e^{2\sqrt{x}}}$$`),
  question(38,2023,1,raw`Let $f(x)=x^3+15x^2-33x-36$ be a real-valued function.
Which of the following statements is/are TRUE?`,[raw`$f(x)$ does not have a local maximum.`,raw`$f(x)$ has a local maximum.`,raw`$f(x)$ does not have a local minimum.`,raw`$f(x)$ has a local minimum.`]),
  question(39,2023,1,raw`The value of the definite integral $\displaystyle\int_{-3}^3\int_{-2}^2\int_{-1}^1(4x^2y-z^3)\,dz\,dy\,dx$ is ________. (Rounded off to the nearest integer)`),
  question(40,2024,1,raw`Let $f:\mathbb{R}\to\mathbb{R}$ be a function such that $f(x)=\max\{x,x^3\}$, $x\in\mathbb{R}$, where $\mathbb{R}$ is the set of all real numbers. The set of all points where $f(x)$ is NOT differentiable is`,[raw`$\{0,1\}$`,raw`$\{-1,1,2\}$`,raw`$\{-2,-1,1\}$`,raw`$\{-1,0,1\}$`],{setNum:'1'}),
  question(41,2024,1,raw`Let $f(x)$ be a continuous function from $\mathbb{R}$ to $\mathbb{R}$ such that
$$f(x)=1-f(2-x)$$
Which one of the following options is the CORRECT value of $\displaystyle\int_0^2 f(x)\,dx$?`,['0',raw`$-1$`,'1','2'],{setNum:'2'}),
  question(42,2024,2,raw`Let $x$ and $y$ be random variables, not necessarily independent, that take real values in the interval $[0,1]$. Let $z=xy$ and let the mean values of $x,y,z$ be $\bar{x},\bar{y},\bar{z}$ respectively. Which one of the following statements is TRUE?`,[
    raw`$\bar{z}=\bar{x}\bar{y}$`,raw`$\bar{z}\ge\bar{x}\bar{y}$`,raw`$\bar{z}\le\bar{x}\bar{y}$`,raw`$\bar{z}\le\bar{x}$`,
  ],{setNum:'2',notes:['This random-variable question is printed inside Calculus and is kept in its source chapter/order, without reassignment.']}),
];
export const CALCULUS_IMPORT = {subject:'11. Engg. Maths',chapter:'3. Calculus',sourceHash,questions};
