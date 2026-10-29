const raw = String.raw;
const sourceHash = 'e90e2db4cee3877cc55b5300d274bb84ec09928c74008fc6cacce3621a3233c2';

function question(number, year, marks, text, options = [], extra = {}) {
  const {notes = [], ...fields} = extra;
  const bookPages = number <= 10 ? [75] : number <= 20 ? [76] : number <= 28 ? [77]
    : number === 29 ? [77,78] : number <= 40 ? [78] : number <= 53 ? [79] : number <= 62 ? [80] : [81];
  return {
    id: `madeeasy-maths-probability-5-${number}`, text, code: '', year: String(year), marks: String(marks), setNum: '',
    rawTopic: 'Probability', diagram: '', ext: '.png',
    optA: options[0] || '', optB: options[1] || '', optC: options[2] || '', optD: options[3] || '',
    questionType: options.length ? 'MCQ' : 'NAT', correctOptions: [], natAnswer: '',
    isBlank: false, isPosLocked: false, isCodeOptions: false, isProof: false,
    needsManualOptionFix: false, optLayout: 'auto', tempPaste: '', ...fields,
    source: {
      file: '11. Engg. Maths/1. Probability.pdf', sha256: sourceHash, questionNumber: `5.${number}`,
      bookPages, pdfPages: number <= 10 ? [1] : number <= 28 ? [2] : number === 29 ? [2,3] : number <= 53 ? [3] : [4],
      answerKeyPdfPage: null, answerKeyStatus: 'not-supplied',
      notes: ['All four supplied scanned spreads were visually reviewed. Probability Q5.1-Q5.69 occupy book pages 75-81. Book page 74 on PDF page 1 contains previous-chapter explanations and is excluded. No Probability answer key is supplied; answer intentionally left empty.', ...notes],
    },
  };
}

const questions = [
  question(1,1995,2,raw`A bag contains 10 white balls and 15 black balls. Two balls are drawn in succession. The probability that one of them is black and the other is white is`,[
    raw`$\frac{2}{3}$`,raw`$\frac{4}{5}$`,raw`$\frac{1}{2}$`,raw`$\frac{1}{3}$`,
  ]),
  question(2,1996,1,'Two dice are thrown simultaneously. The probability that at least one of them will have 6 facing up is',[
    raw`$\frac{1}{36}$`,raw`$\frac{1}{3}$`,raw`$\frac{25}{36}$`,raw`$\frac{11}{36}$`,
  ]),
  question(3,1996,2,'The probability that top and bottom cards of a randomly shuffled deck are both aces is',[
    raw`$\frac{4}{52}\times\frac{4}{52}$`,raw`$\frac{4}{52}\times\frac{3}{52}$`,
    raw`$\frac{4}{52}\times\frac{3}{51}$`,raw`$\frac{4}{52}\times\frac{4}{51}$`,
  ]),
  question(4,1997,1,'The probability that it will rain today is 0.5. The probability that it will rain tomorrow is 0.6. The probability that it will rain either today or tomorrow is 0.7. What is the probability that it will rain today and tomorrow?',[
    '0.3','0.25','0.35','0.4',
  ]),
  question(5,1998,1,'A die is rolled three times. The probability that exactly one odd number turns up among the three outcomes is',[
    raw`$\frac{1}{6}$`,raw`$\frac{3}{8}$`,raw`$\frac{1}{8}$`,raw`$\frac{1}{2}$`,
  ]),
  question(6,1999,1,raw`Suppose that the expectation of a random variable $X$ is 5. Which of the following statements is true?`,[
    raw`There is a sample point at which $X$ has the value 5.`,
    raw`There is a sample point at which $X$ has value greater than 5.`,
    raw`There is a sample point at which $X$ has a value greater than or equal to 5.`,
    'None of the above',
  ],{notes:['Options A-B are at the bottom of the left column and options C-D continue at the top of the right column on book page 75.']}),
  question(7,1999,2,raw`Consider two events $E_1$ and $E_2$ such that probability of $E_1$, $\Pr[E_1]=\frac{1}{2}$, probability of $E_2$, $\Pr[E_2]=\frac{1}{3}$, and probability of $E_1$ and $E_2$, $\Pr[E_1\text{ and }E_2]=\frac{1}{5}$. Which of the following statements is/are true?`,[
    raw`$\Pr[E_1\text{ or }E_2]$ is $\frac{2}{3}$`,
    raw`Events $E_1$ and $E_2$ are independent`,raw`Events $E_1$ and $E_2$ are not independent`,
    raw`$\Pr\!\left[\frac{E_1}{E_2}\right]=\frac{4}{5}$`,
  ],{questionType:'MSQ',notes:['Multiple-select wording "is/are true" is preserved. The printed stacked E1/E2 conditional-probability notation in option D is retained. No answer is inferred.']}),
  question(8,2000,2,raw`$E1$ and $E2$ are events in a probability space satisfying the following constraints:
- $\Pr(E1)=\Pr(E2)$
- $\Pr(E1\cup E2)=1$
- $E1$ and $E2$ are independent
The value of $\Pr(E1)$, the probability of the event $E1$, is`,[
    '0',raw`$\frac{1}{4}$`,raw`$\frac{1}{2}$`,'1',
  ]),
  question(9,2001,2,'Seven (distinct) car accidents occurred in a week. What is the probability that they all occurred on the same day?',[
    raw`$\frac{1}{7^7}$`,raw`$\frac{1}{7^6}$`,raw`$\frac{1}{2^7}$`,raw`$\frac{7}{2^7}$`,
  ]),
  question(10,2002,2,'Four fair coins are tossed simultaneously. The probability that at least one head and one tail turn up is',[
    raw`$\frac{1}{16}$`,raw`$\frac{1}{8}$`,raw`$\frac{7}{8}$`,raw`$\frac{15}{16}$`,
  ]),
  question(11,2003,1,raw`Let $P(E)$ denote the probability of the event $E$.
Given $P(A)=1$, $P(B)=\frac{1}{2}$, and $A$ and $B$ are independent, the values of $P(A\mid B)$ and $P(B\mid A)$ respectively are`,[
    raw`$\frac{1}{4},\frac{1}{2}$`,raw`$\frac{1}{2},\frac{1}{4}$`,raw`$\frac{1}{2},1$`,raw`$1,\frac{1}{2}$`,
  ]),
  question(12,2003,2,raw`A program consists of two modules executed sequentially. Let $f_1(t)$ and $f_2(t)$ respectively denote the probability density functions of time taken to execute the two modules. The probability density function of the overall time taken to execute the program is given by`,[
    raw`$f_1(t)+f_2(t)$`,raw`$\int_0^t f_1(x)f_2(x)\,dx$`,raw`$\int_0^t f_1(x)f_2(t-x)\,dx$`,raw`$\max\{f_1(t),f_2(t)\}$`,
  ]),
  question(13,2004,1,'If a fair coin is tossed four times. What is the probability that two heads and two tails will result?',[
    raw`$\frac{3}{8}$`,raw`$\frac{1}{2}$`,raw`$\frac{5}{8}$`,raw`$\frac{3}{4}$`,
  ]),
  question(14,2004,1,raw`In a population of $N$ families, 50% of the families have three children, 30% of the families have two children and the remaining families have one child. What is the probability that a randomly picked child belongs to a family with two children?`,[
    raw`$\frac{3}{23}$`,raw`$\frac{6}{23}$`,raw`$\frac{3}{10}$`,raw`$\frac{3}{5}$`,
  ]),
  question(15,2004,2,raw`Let $X$ and $Y$ be two exponentially distributed and independent random variables with mean $\alpha$ and $\beta$, respectively. If $Z=\min(X,Y)$, then the mean of $Z$ is given by`,[
    raw`$\frac{1}{\alpha+\beta}$`,raw`$\min(\alpha,\beta)$`,raw`$\frac{\alpha\beta}{\alpha+\beta}$`,raw`$\alpha+\beta$`,
  ]),
  question(16,2004,2,raw`An examination paper has 150 multiple-choice questions of one mark each, with each question having four choices. Each incorrect answer fetches $-0.25$ marks. Suppose 1000 students choose all their answers randomly with uniform probability. The sum total of the expected marks obtained by all the students is`,[
    '0','2550','7525','9375',
  ],{notes:['Option C is printed 7525 and is retained without correction.']}),
  question(17,2004,2,raw`Two $n$ bit binary strings, $S_1$ and $S_2$ are chosen randomly with uniform probability. The probability that the Hamming distance between these strings (the number of bit positions where the two strings differ) is equal to $d$ is`,[
    raw`$\frac{\binom{n}{d}}{2^n}$`,raw`$\frac{\binom{n}{d}}{2^d}$`,raw`$\frac{d}{2^n}$`,raw`$\frac{1}{2^d}$`,
  ]),
  question(18,2004,2,raw`A point is randomly selected with uniform probability in the X-Y. Plane within the rectangle with corners at (0, 0), (1, 0), (1, 2) and (0, 2). If $p$ is the length of the position vector of the point, the expected value of $p^2$ is`,[
    raw`$\frac{2}{3}$`,'1',raw`$\frac{4}{3}$`,raw`$\frac{5}{3}$`,
  ]),
  question(19,2005,1,raw`Let $f(x)$ be the continuous probability density function of a random variable $X$. The probability that $a<X\le b$, is`,[
    raw`$f(b-a)$`,raw`$f(b)-f(a)$`,raw`$\int_a^b f(x)\,dx$`,raw`$\int_a^b xf(x)\,dx$`,
  ]),
  question(20,2005,1,'A bag contains 10 blue marbles, 20 green marbles and 30 red marbles. A marble is drawn from the bag, its colour recorded and it is put back in the bag. This process is repeated 3 times. The probability that no two of the marbles drawn have the same colour is',[
    raw`$\frac{1}{36}$`,raw`$\frac{1}{6}$`,raw`$\frac{1}{4}$`,raw`$\frac{1}{3}$`,
  ]),
  question(21,2005,2,'An unbiased coin is tossed repeatedly until the outcome of two successive tosses is the same. Assuming that the trials are independent, the expected number of tosses is',[
    '3','4','5','6',
  ]),
  question(22,2006,1,raw`In a certain town, the probability that it will rain in the afternoon is known to be 0.6. Moreover, meteorological data indicates that if the temperature at noon is less than or equal to $25^\circ\mathrm{C}$, the probability that it will rain in the afternoon is 0.4. The temperature at noon is equally likely to be above $25^\circ\mathrm{C}$, or at/below $25^\circ\mathrm{C}$.
What is the probability that it will rain in the afternoon on a day when the temperature at noon is above $25^\circ\mathrm{C}$?`,[
    '0.4','0.6','0.8','0.9',
  ]),
  question(23,2006,2,raw`When a coin is tossed, the probability of getting a Head is $p$, $0<p<1$. Let $N$ be the random variable denoting the number of tosses till the first Head appears, including the toss where the Head appears. Assuming that successive tosses are independent, the expected value of $N$ is`,[
    raw`$\frac{1}{p}$`,raw`$\frac{1}{1-p}$`,raw`$\frac{1}{p^2}$`,raw`$\frac{1}{1-p^2}$`,
  ]),
  question(24,2007,1,raw`Suppose there are two coins. The first coin gives heads with probability $\frac{5}{8}$ when tossed, while the second coin gives heads with probability $\frac{1}{4}$. One of the two coins is picked up at random with equal probability and tossed. What is the probability of obtaining heads?`,[
    raw`$\frac{7}{8}$`,raw`$\frac{1}{2}$`,raw`$\frac{7}{16}$`,raw`$\frac{5}{32}$`,
  ]),
  question(25,2007,2,'Suppose we uniformly and randomly select a permutation from the 20! permutations of 1, 2, 3, ..., 20. What is the probability that 2 appears at an earlier position than any other even number in the selected permutation?',[
    raw`$\frac{1}{2}$`,raw`$\frac{1}{10}$`,raw`$\frac{9!}{20!}$`,'None of these',
  ],{notes:['The stem is at the bottom of the left column and its options continue at the top of the right column on book page 77.']}),
  question(26,2007,2,'In a multi-user operating system on an average, 20 requests are made to use a particular resource per hour. The arrival of requests follows a Poisson distribution. The probability that either one, three or five requests are made in 45 minutes is given by:',[
    raw`$6.9\times10^6\times e^{-20}$`,raw`$1.02\times10^6\times e^{-20}$`,raw`$6.9\times10^3\times e^{-20}$`,raw`$1.02\times10^3\times e^{-20}$`,
  ],{notes:['All four printed options use e^(-20), despite the 45-minute interval in the stem. The source options are preserved without recalculation.']}),
  question(27,2008,1,raw`A sample space has two events $A$ and $B$ such that probabilities
$P(A\cap B)=1/2$, $P(\overline{A})=1/3$, $P(\overline{B})=1/3$.
What is $P(A\cup B)$?`,[
    raw`$\frac{11}{12}$`,raw`$\frac{10}{12}$`,raw`$\frac{9}{12}$`,raw`$\frac{8}{12}$`,
  ]),
  question(28,2008,2,raw`What is the probability that in a randomly chosen group of $r$ people at least three people have the same birthday?`,[
    raw`$\displaystyle 1-\frac{365\cdot364\cdots(365-r+1)}{365^r}$`,
    raw`$\displaystyle 1-\frac{365\cdot364\cdots(365-r+1)}{365^r}+\binom{r}{2}\cdot365\cdot\frac{364\cdot363\cdots(364-(r-2)+1)}{364^{r-2}}$`,
    raw`$\displaystyle 1-\frac{365\cdot364\cdots(365-r+1)}{365^r}-\binom{r}{2}\cdot365\cdot\frac{364\cdot363\cdots(364-(r-2)+1)}{364^{r-2}}$`,
    raw`$\displaystyle \frac{365\cdot364\cdots(365-r+1)}{365^r}$`,
  ],{optLayout:'1col',notes:['The denominators in the second terms of options B-C are printed 364^(r-2). The expressions are retained exactly rather than replaced by a corrected birthday formula.']}),
  question(29,2008,2,'Aishwarya studies either computer science or mathematics everyday. If she studies computer science on a day, then the probability that she studies mathematics the next day is 0.6. If she studies mathematics on a day, then the probability that she studies computer science the next day is 0.4. Given that Aishwarya studies computer science on Monday, what is the probability that she studies computer science on Wednesday?',[
    '0.24','0.36','0.4','0.6',
  ],{notes:['Stem on book page 77 / PDF page 2; options and year/marks continue at the top of book page 78 / PDF page 3.']}),
  question(30,2008,2,raw`Let $X$ be a random variable following normal distribution with mean $+1$ and variance 4. Let $Y$ be another normal variable with mean $-1$ and variance unknown. If $P(X\le-1)=P(Y\ge2)$ the standard deviation of $Y$ is`,[
    '3','2',raw`$\sqrt{2}$`,'1',
  ]),
  question(31,2009,2,'An unbalanced dice (with 6 faces, numbered from 1 to 6) is thrown. The probability that the face value is odd is 90% of the probability that the face value is even. The probability of getting any even numbered face is the same.\nIf the probability that the face is even given that it is greater than 3 is 0.75, which one of the following options is closest to the probability that the face value exceeds 3?',[
    '0.453','0.468','0.485','0.492',
  ]),
  question(32,2010,2,raw`Consider a company that assembles computers. The probability of a faulty assembly of any computer is $p$. The company therefore subjects each computer to a testing process. This testing process gives the correct result for any computer with a probability of $q$. What is the probability of a computer being declared faulty?`,[
    raw`$pq+(1-p)(1-q)$`,raw`$(1-q)p$`,raw`$(1-p)q$`,raw`$pq$`,
  ]),
  question(33,2010,2,raw`What is the probability that a divisor of $10^{99}$ is a multiple of $10^{96}$?`,[
    raw`$\frac{1}{625}$`,raw`$\frac{4}{625}$`,raw`$\frac{12}{625}$`,raw`$\frac{16}{625}$`,
  ]),
  question(34,2011,2,'If two fair coins are flipped and at least one of the outcomes is known to be a head, what is the probability that both outcomes are heads?',[
    raw`$\frac{1}{3}$`,raw`$\frac{1}{4}$`,raw`$\frac{1}{2}$`,raw`$\frac{2}{3}$`,
  ]),
  question(35,2010,2,raw`If the difference between the expectation of the square of a random variable $(\mathrm{E}[x^2])$ and the square of the expectation of the random variable $(\mathrm{E}[x])^2$ is denoted by $R$, then`,[
    raw`$R=0$`,raw`$R<0$`,raw`$R\ge0$`,raw`$R>0$`,
  ],{notes:['The book places this 2010 question after Q5.34 (2011). Printed numbering and order are preserved.']}),
  question(36,2011,2,raw`Consider the finite sequence of random values $X=[x_1,x_2,\ldots,x_n]$. Let $\mu_x$ be the mean and $\sigma_x$ be the standard deviation of $X$. Let another finite sequence $Y$ of equal length be derived from this as $y_i=a*x_i+b$, where $a$ and $b$ are positive constant. Let $\mu_y$ be the mean and $\sigma_y$ be the standard deviation of this sequence. Which one of the following statements is INCORRECT?`,[
    raw`Index position of mode of $X$ in $X$ is the same as the index position of mode of $Y$ in $Y$.`,
    raw`Index position of median of $X$ in $X$ is the same as the index position of median of $Y$ in $Y$.`,
    raw`$\mu_y=a\mu_x+b$`,raw`$\sigma_y=a\sigma_x+b$`,
  ]),
  question(37,2011,2,'A deck of 5 cards (each carrying a distinct number from 1 to 5) is shuffled thoroughly. Two cards are then removed one at a time from the deck. What is the probability that the two cards are selected with the number on the first card being one higher than the number on the second card?',[
    raw`$\frac{1}{5}$`,raw`$\frac{4}{25}$`,raw`$\frac{1}{4}$`,raw`$\frac{2}{5}$`,
  ]),
  question(38,2012,1,raw`Consider a random variable $X$ that takes values $+1$ and $-1$ with probability 0.5 each. The values of the cumulative distribution function $F(x)$ at $x=-1$ and $+1$ are`,[
    '0 and 0.5','0 and 1','0.5 and 1','0.25 and 0.75',
  ]),
  question(39,2012,2,'Suppose a fair six-sided die is rolled once. If the value on the die is 1, 2 or 3 then the die is rolled a second time. What is the probability that the sum total of values that turn up is at least 6?',[
    raw`$\frac{10}{21}$`,raw`$\frac{5}{12}$`,raw`$\frac{2}{3}$`,raw`$\frac{1}{6}$`,
  ]),
  question(40,2013,1,raw`Suppose $p$ is the number of cars per minute passing through a certain road junction between 5 PM, and $p$ has a Poisson distribution with mean 3. What is the probability of observing fewer than 3 cars during any given minute in this interval?`,[
    raw`$\frac{8}{2e^3}$`,raw`$\frac{9}{2e^3}$`,raw`$\frac{17}{2e^3}$`,raw`$\frac{26}{2e^3}$`,
  ],{notes:['The supplied source prints "between 5 PM, and p has" without a second time endpoint. This incomplete time phrase is preserved rather than completed.']}),
  question(41,2014,1,'Suppose you break a stick of unit length at a point chosen uniformly at random. Then the expected length of the shorter stick is ________.',[],{setNum:'1'}),
  question(42,2014,2,raw`Four fair six-sided dice are rolled. The probability that the sum of the results being 22 is $\frac{x}{1296}$. The value of $x$ is ________.`,[],{setNum:'1'}),
  question(43,2014,1,raw`The security system at an IT office is composed of 10 computers of which exactly four are working. To check whether the system is functional, the officials inspect four of the computers picked at random (without replacement). The system is deemed functional if at least three of the four computers inspected are working. Let the probability that the system is deemed functional be denoted by $p$.
Then $100p=$ ________.`,[],{setNum:'2'}),
  question(44,2014,2,'The probability that a given positive integer lying between 1 and 100 (both inclusive) is NOT divisible by 2, 3 or 5 is ________.',[],{setNum:'2'}),
  question(45,2014,2,raw`Let $S$ be a sample space and two mutually exclusive events $A$ and $B$ be such that $A\cup B=S$. If $P(\cdot)$ denotes the probability of the event, the maximum value of $P(A)P(B)$ is ________.`,[],{setNum:'3'}),
  question(46,2015,2,raw`Suppose $X_i$ for $i=1,2,3$ are independent and identically distributed random variables whose probability mass functions are
$$\Pr[X_i=0]=\Pr[X_i=1]=\frac{1}{2}\quad\text{for }i=1,2,3.$$
Define another random variable $Y=X_1X_2\oplus X_3$, where $\oplus$ denotes XOR. Then $\Pr[Y=0\mid X_3=0]=$ ________.`,[],{setNum:'3'}),
  question(47,2016,1,raw`A probability density function on the interval $[a,1]$ is given by $1/x^2$ and outside this interval the value of the function is zero. The value of $a$ is`,[],{setNum:'1'}),
  question(48,2016,2,raw`Consider the following experiment:
Step 1. Flip a fair coin twice.
Step 2. If the outcomes are (TAILS, HEADS) then output $Y$ and stop.
Step 3. If the outcomes are either (HEADS, HEADS) or (HEADS, TAILS), then output $N$ and stop.
Step 4. If the outcomes are (TAILS, TAILS), then go to Step 1.
The probability that the output of the experiment is $Y$ is ________ (up to two decimal places).`,[],{setNum:'1',notes:['The experiment starts at the bottom of the left column and its final sentence continues at the top of the right column on book page 79. The steps are prose instructions, not source code.']}),
  question(49,2016,1,'Suppose that a shop has an equal number of LED bulbs of two different types. The probability of an LED bulb lasting more than 100 hours given that it is of Type 1 is 0.7, and given that it is of Type 2 is 0.4. The probability that an LED bulb chosen uniformly at random lasts more than 100 hours is ________.',[],{setNum:'2'}),
  question(50,2017,1,raw`Let $X$ be a Gaussian random variable with mean 0 and variance $\sigma^2$. Let $Y=\max(X,0)$ where $\max(a,b)$ is the maximum of $a$ and $b$. The median of $Y$ is ________.`,[],{setNum:'1'}),
  question(51,2017,2,raw`$P$ and $Q$ are considering to apply for a job. The probability that $P$ applies for the job is $\frac{1}{4}$, the probability that $P$ applies for the job given that $Q$ applies for the job is $\frac{1}{2}$, and the probability that $Q$ applies for the job given that $P$ applies for the job is $\frac{1}{3}$. Then the probability that $P$ does not apply for the job given that $Q$ does not apply for the job is`,[
    raw`$\frac{4}{5}$`,raw`$\frac{5}{6}$`,raw`$\frac{7}{8}$`,raw`$\frac{11}{12}$`,
  ],{setNum:'2'}),
  question(52,2017,2,raw`For any discrete random variable $X$, with probability mass function $P(X=j)=p_j$, $p_j\ge0$, $j\in\{0,\ldots,N\}$, and $\sum_{j=0}^N p_j=1$, define the polynomial function $g_X(z)=\sum_{j=0}^N p_jz^j$. For a certain discrete random variable $Y$, there exists a scalar $\beta\in[0,1]$ such that $g_Y(z)=(1-\beta+\beta z)^N$. The expectation of $Y$ is`,[
    raw`$N\beta(1-\beta)$`,raw`$N\beta$`,raw`$N(1-\beta)$`,raw`Not expressible in terms of $N$ and $\beta$ alone`,
  ],{setNum:'2'}),
  question(53,2017,2,raw`If a random variable $X$ has a Poisson distribution with mean 5, then the expectation $\mathrm{E}[(X+2)^2]$ equals`,[],{setNum:'2'}),
  question(54,2018,1,'Two people, P and Q, decide to independently roll two identical dice, each with 6 faces, numbered 1 to 6. The person with the lower number wins. In case of a tie, they roll the dice repeatedly until there is no tie. Define a trial as a throw of the dice by P and Q. Assume that all 6 numbers on each dice are equi-probable and that all trials are independent. The probability (rounded to 3 decimal places) that one of them wins on the third trial is ________.'),
  question(55,2018,2,raw`Consider Guwahati (G) and Delhi (D) whose temperatures can be classified as high (H), medium (M) and low (L). Let $P(H_G)$ denote the probability that Guwahati has high temperature. Similarly, $P(M_G)$ and $P(L_G)$ denotes the probability of Guwahati having medium and low temperatures respectively. Similarly, we use $P(H_D)$, $P(M_D)$ and $P(L_D)$ for Delhi.
The following table gives the conditional probabilities for Delhi's temperature given Guwahati's temperature.
$$\begin{array}{c|ccc}
 & H_D & M_D & L_D\\\hline
H_G & 0.40 & 0.48 & 0.12\\
M_G & 0.10 & 0.65 & 0.25\\
L_G & 0.01 & 0.50 & 0.49
\end{array}$$
Consider the first row in the table above. The first entry denotes that if Guwahati has high temperature $(H_G)$ then the probability of Delhi also having a high temperature $(H_D)$ is 0.40; i.e., $P(H_D\mid H_G)=0.40$. Similarly, the next two entries are $P(M_D\mid H_G)=0.48$ and $P(L_D\mid H_G)=0.12$. Similarly for the other rows.
If it is known that $P(H_G)=0.2$, $P(M_G)=0.5$ and $P(L_G)=0.3$, then the probability (correct to two decimal places) that Guwahati has high temperature given that Delhi has high temperature is ________.`),
  question(56,2019,1,raw`Two numbers are chosen independently and uniformly at random from the set $\{1,2,\ldots,13\}$. The probability (rounded to 3 decimal places) that their 4-bit (unsigned) binary representations have the same most significant bit is ________.`),
  question(57,2019,2,raw`Suppose $Y$ is distributed uniformly in the open interval $(1,6)$. The probability that the polynomial $3x^2+6xY+3Y+6$ has only real roots is (rounded off to 1 decimal place) ________.`),
  question(58,2020,2,raw`For $n>2$, let $a\in\{0,1\}^n$ be a non-zero vector. Suppose that $x$ is chosen uniformly at random from $\{0,1\}^n$. Then, the probability that $\sum_{i=1}^n a_ix_i$ is an odd number is ________.`),
  question(59,2021,2,raw`Consider the two statements:
$S_1$: There exist random variables $X$ and $Y$ such that $(\mathrm{E}[(X-\mathrm{E}(X))(Y-\mathrm{E}(Y))])^2>\operatorname{Var}[X]\operatorname{Var}[Y]$.
$S_2$: For all random variables $X$ and $Y$,
$$\operatorname{Cov}[X,Y]=\mathrm{E}[|X-\mathrm{E}[X]|\,|Y-\mathrm{E}[Y]|].$$
Which one of the following choices is correct?`,[
    raw`Both $S_1$ and $S_2$ are false.`,raw`Both $S_1$ and $S_2$ are true.`,raw`$S_1$ is true, but $S_2$ is false.`,raw`$S_1$ is false, but $S_2$ is true.`,
  ],{setNum:'1',notes:['S1 has mismatched printed delimiters around its expectation/product. Matching delimiters are used for valid editable LaTeX while preserving the squared expectation and inequality. S2 explicitly contains absolute-value bars and these are retained.']}),
  question(60,2021,1,'The lifetime of a component of a certain type is a random variable whose probability density function is exponentially distributed with parameter 2. For a randomly picked component of this type, the probability that its lifetime exceeds the expected lifetime (rounded to 2 decimal places) is ________.',[],{setNum:'1'}),
  question(61,2021,2,raw`A sender (S) transmits a signal, which can be one of the two kinds: $H$ and $L$ with probabilities 0.1 and 0.9 respectively, to a receiver (R). In the graph below, the weight of edge $(u,v)$ is the probability of receiving $v$ when $u$ is transmitted, where $u,v\in\{H,L\}$. For example, the probability that the received signal is $L$ given the transmitted signal was $H$, is 0.7.
[DIAGRAM_PLACEHOLDER]
If the received signal is $H$, the probability that the transmitted signal was $H$ (rounded to 2 decimal places) is ________.`,[],{setNum:'1',diagram:'probability-5-61',notes:['The directed signal graph is a source-only crop. Its four probabilities and H/L/S/R labels are retained; prose remains editable.']}),
  question(62,2021,1,raw`For a given biased coin, the probability that the outcome of a toss is a head is 0.4. This coin is tossed 1,000 times. Let $X$ denote the random variable whose value is the number of times that head appeared in these 1,000 tosses. The standard deviation of $X$ (rounded to 2 decimal places) is ________.`,[],{setNum:'2'}),
  question(63,2021,2,raw`In an examination, a student can choose the order in which two questions (QuesA and QuesB) must be attempted.
- If the first question is answered wrong, the student gets zero marks.
- If the first question is answered correctly and the second question is not answered correctly, then the student gets the marks only for the first question.
- If both the questions are answered correctly, the student gets the sum of the marks of the two questions.
The following table shows the probability of correctly answering a question and the marks of the question respectively.
$$\begin{array}{c|c|c}
\text{Question} & \text{Probability of answering correctly} & \text{Marks}\\\hline
\text{QuesA} & 0.8 & 10\\
\text{QuesB} & 0.5 & 20
\end{array}$$
Assuming that the student always wants to maximize her expected marks in the examination, in which order should she attempt the questions and what is the expected marks for that order (assume that the questions are independent)?`,[
    'First QuesA and then QuesB. Expected marks 14.',
    'First QuesB and then QuesA. Expected marks 22.',
    'First QuesB and then QuesA. Expected marks 14.',
    'First QuesA and then QuesB. Expected marks 16.',
  ],{setNum:'2',optLayout:'1col'}),
  question(64,2021,2,raw`A bag has $r$ red balls and $b$ black balls. All balls are identical except for their colours. In a trial, a ball is randomly drawn from the bag, its colour is noted and then the ball is placed back into the bag along with another ball of the same colour. Note that the number of balls in the bag will increase by one, after the trial. A sequence of four such trials is conducted. Which one of the following choices gives the probability of drawing a red ball in the fourth trial?`,[
    raw`$\frac{r}{r+b}$`,raw`$\frac{r}{r+b+3}$`,
    raw`$\left(\frac{r}{r+b}\right)\left(\frac{r+1}{r+b+1}\right)\left(\frac{r+2}{r+b+2}\right)\left(\frac{r+3}{r+b+3}\right)$`,
    raw`$\frac{r+3}{r+b+3}$`,
  ],{setNum:'2',optLayout:'1col'}),
  question(65,2023,2,raw`Consider a random experiment where two fair coins are tossed. Let $A$ be the event that denotes HEAD on both the throws, $B$ be the event that denotes HEAD on the first throw, and $C$ be the event that denotes HEAD on the second throw. Which of the following statements is/are TRUE?`,[
    raw`$A$ and $B$ are independent.`,raw`$A$ and $C$ are independent.`,raw`$B$ and $C$ are independent.`,raw`$\operatorname{Prob}(B\mid C)=\operatorname{Prob}(B)$`,
  ],{questionType:'MSQ'}),
  question(66,2024,1,raw`Let $A$ and $B$ be two events in a probability space with $P(A)=0.3$, $P(B)=0.5$, and $P(A\cap B)=0.1$. Which of the following statements is/are TRUE?`,[
    raw`$P(A\cap B^c)=0.2$, where $B^c$ is the complement of the event $B$`,
    raw`The two events $A$ and $B$ are independent`,raw`$P(A\cup B)=0.7$`,
    raw`$P(A^c\cap B^c)=0.4$, where $A^c$ and $B^c$ are the complements of the events $A$ and $B$, respectively`,
  ],{setNum:'1',questionType:'MSQ'}),
  question(67,2024,1,raw`Consider a permutation sampled uniformly at random from the set of all permutations of $\{1,2,3,\ldots,n\}$ for some $n\ge4$. Let $X$ be the event that 1 occurs before 2 in the permutation, and $Y$ the event that 3 occurs before 4. Which one of the following statements is TRUE?`,[
    raw`Event $X$ is more likely than event $Y$`,raw`The events $X$ and $Y$ are independent`,raw`Either event $X$ or $Y$ must occur`,raw`The events $X$ and $Y$ are mutually exclusive`,
  ],{setNum:'1'}),
  question(68,2024,2,'A bag contains 10 red balls and 15 blue balls. Two balls are drawn randomly without replacement. Given that the first ball drawn is red, the probability (rounded off to 3 decimal places) that both balls drawn are red is ________.',[],{setNum:'1'}),
  question(69,2024,1,'When six unbiased dice are rolled simultaneously, the probability of getting all distinct numbers (i.e. 1, 2, 3, 4, 5 and 6) is',[
    raw`$\frac{5}{324}$`,raw`$\frac{11}{324}$`,raw`$\frac{1}{324}$`,raw`$\frac{7}{324}$`,
  ],{setNum:'2'}),
];

export const PROBABILITY_IMPORT = {subject:'11. Engg. Maths',chapter:'1. Probability',sourceHash,questions};
