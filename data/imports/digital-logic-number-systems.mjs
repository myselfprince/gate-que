// Transcribed after visually reviewing all three scanned spreads and detail crops.
const r=String.raw;
const m=s=>`$${s}$`;
const sourceHash='ed9441210bdacb32ed28da2d4aff0f8f436be776f690e2fbbe1bdf293e699c28';
const sets={38:'1',39:'2',40:'2',41:'3',42:'1',43:'2',44:'1',45:'2',46:'2',51:'1',52:'1',53:'2',54:'2',55:'2',60:'1',61:'2',62:'2'};
function question(n,year,marks,text,options=[],extra={}) {
  const {notes=[],...fields}=extra;
  const bookPages=n<=14?[233]:n<=27?[234]:n===28?[234,235]:n<=41?[235]:n<=52?[236]:n===53?[236,237]:[237];
  return {id:`madeeasy-digital-logic-number-systems-4-${n}`,text,code:'',year:String(year),marks:String(marks),setNum:sets[n]||'',rawTopic:'Number Systems',diagram:'',ext:'.png',
    optA:options[0]||'',optB:options[1]||'',optC:options[2]||'',optD:options[3]||'',questionType:options.length?'MCQ':'NAT',correctOptions:[],natAnswer:'',
    isBlank:false,isPosLocked:false,isCodeOptions:false,isProof:false,needsManualOptionFix:false,optLayout:'auto',tempPaste:'',...fields,
    source:{file:'9. Digital Logic/4. Number Systems.pdf',sha256:sourceHash,questionNumber:`4.${n}`,bookPages,pdfPages:[...new Set(bookPages.map(p=>Math.floor((p-232)/2)+1))],answerKeyPdfPage:null,answerKeyStatus:'not-supplied',
      notes:['All three supplied scanned spreads visually reviewed. Number Systems Q4.1-Q4.62 occupy book pages 233-237. Previous-chapter explanations on book page 232 excluded. No answer key or Number Systems solutions are supplied; answer intentionally left empty.',...notes]}};
}
const common=r`Common Data Q.4.25 & Q.4.26:
Consider the following floating point format:
[IMG_1]
Mantissa is a pure fraction in sign-magnitude form.
`;
const questions=[
  question(1,1995,1,r`The number of 1's in the binary representation of $(3*4096+15*256+5*16+3)$ is`,['8','9','10','12']),
  question(2,1996,1,'A ROM is used to store the table for multiplication of two 8-bit unsigned integers. The size of ROM required is',[m(r`256\times16`),m(r`64\mathrm{K}\times8`),m(r`4\mathrm{K}\times16`),m(r`64\mathrm{K}\times16`)]),
  question(3,1996,1,"Booth's algorithm for integer multiplication gives worst performance when the multiplier pattern is",[m(r`101010\ldots1010`),m(r`100000\ldots001`),m(r`111111\ldots1111`),m(r`011111\ldots1110`)]),
  question(4,1996,1,r`Consider the following floating point number representation.
[IMG_1]
The exponent is in 2's complement representation and mantissa is in the sign magnitude representation. The range of the magnitude of the normalized numbers in this representation is`,['0 to 1','0.5 to 1',m(r`2^{-23}\text{ to }0.5`),m(r`0.5\text{ to }(1-2^{-23})`)],{diagram:'number-systems-4-4'}),
  question(5,1997,2,r`Given $sqrt{(224)_r}=(13)_r$. The value of the radix r is`,['10','8','5','6']),
  question(6,1999,1,"Booth's coding in 8 bits for the decimal number -57 is",[m('0-100+1000'),m('0-100+100-1'),m('0-1+100-10+1'),m('00-10+100-1')],{notes:['Printed compact Booth digit strings and signs retained; they are not evaluated as arithmetic expressions.']}),
  question(7,1999,2,'Zero has two representations in:',["Sign magnitude","1's complement","2's complement",'None of these'],{notes:['Historical four-option item is not explicitly labelled MSQ. Both the sign-magnitude and ones-complement wording raise a source ambiguity; original MCQ form retained with no inferred selection.']}),
  question(8,2000,1,"The number 43 in 2's complement representation is",['01010101','11010101','00101011','10101011']),
  question(9,2000,2,r`Consider the values $A=2.0\times10^{30}$, $B=-2.0\times10^{30}$, $C=1.0$ and the sequence. What will be the values of X and Y if the following sequence of statements are carried out
[CODE]`,[m('X=1.0,\;Y=1.0'),m('X=0.0,\;Y=1.0'),m('X=1.0,\;Y=0.0'),m('X=0.0,\;Y=0.0')],{code:'X := A + B\nY := A + C\nX := X + C\nY := Y + B'}),
  question(10,2001,2,r`The 2's complement representation of $(-539)_{10}$ in hexadecimal is`,['ABE','DBC','DE5','9E7']),
  question(11,2002,1,"In 2's complement addition, overflow",['is flagged whenever there is carry from sign bit addition','cannot occur when a positive value is added to a negative value','is flagged when the carries from sign bit and previous bit match','None of the above']),
  question(12,2002,1,'The decimal value 0.25',['is equivalent to binary 0.1','is equivalent to binary 0.01','is equivalent to binary 0.00111','can not be represented precisely in binary']),
  question(13,2002,1,"The 2's complement representation of the decimal value -15 is",['1111','11111','111111','10001']),
  question(14,2002,1,'Sign extension is the step in',['Floating point multiplication','Signed 16 bit integer addition','Arithmetic left shift','Converting a signed integer from one size to another'],{notes:['The scan labels both the third and fourth options (d). Options are stored in their printed order as A-D.']}),
  question(15,2003,1,"Assuming all numbers are in 2's complement representation, which of the following numbers is divisible by 11111011?",['11100111','11100100','11010111','11011011']),
  question(16,2003,2,r`The following is a scheme for floating point number representation using 16 bits.
[IMG_1]
Let s, e, and m be the numbers represented in binary in the sign, exponent, and mantissa fields respectively. Then the floating point number represented is
$$\begin{cases}(-1)^s(1+m\times2^{-9})2^{e-31},&\text{if the exponent}\ne111111\\0&\text{otherwise}\end{cases}$$
What is the maximum difference between two successive real numbers representable in this system?`,[m('2^{-40}'),m('2^{-9}'),m('2^{22}'),m('2^{31}')],{diagram:'number-systems-4-16'}),
  question(17,2004,1,r`If $73_x$ (in base-x number system) is equal to $54_y$, (in base-y number system), the possible values of x and y are`,['8, 16','10, 12','9, 13','8, 11']),
  question(18,2004,1,r`What is the result of evaluating the following two expressions using three-digit floating point arithmetic with rounding?
$$(113.+-111.)+7.51$$
$$113.+(-111.+7.51)$$`,['9.51 and 10.0 respectively','10.0 and 9.51 respectively','9.51 and 9.51 respectively','10.0 and 10.0 respectively']),
  question(19,2004,2,r`Let $A=1111\ 1010$ and $B=0000\ 1010$ be two 8-bit 2's complement numbers. Their product in 2's complement is`,['1100 0100','1001 1100','1010 0101','1101 0101']),
  question(20,2004,2,r`The number $(123456)_8$ is equivalent to`,[m(r`(A72E)_{16}\text{ and }(22130232)_4`),m(r`(A72E)_{16}\text{ and }(22131122)_4`),m(r`(A73E)_{16}\text{ and }(22130232)_4`),m(r`(A62E)_{16}\text{ and }(22120232)_4`)]),
  question(21,2005,1,"The range of integers that can be represented by an n bit 2's complement number system is",[m(r`-2^{n-1}\text{ to }(2^{n-1}-1)`),m(r`-(2^{n-1}-1)\text{ to }(2^{n-1}-1)`),m(r`-2^{n-1}\text{ to }2^{n-1}`),m(r`-(2^{n-1}+1)\text{ to }(2^{n-1}-1)`)]),
  question(22,2005,1,r`The hexadecimal representation of $657_8$ is`,['1AF','D78','D71','32F']),
  question(23,2005,1,"Using Booth's Algorithm for multiplication, the multiplier -57 will be recoded as",[m(r`0\ {-1}\ 0\ 0\ 1\ 0\ 0\ {-1}`),m(r`1\ 1\ 0\ 0\ 0\ 1\ 1\ 1`),m(r`0\ {-1}\ 0\ 0\ 1\ 0\ 0\ 0`),m(r`0\ 1\ 0\ 0\ {-1}\ 0\ 0\ 1`)]),
  question(24,2005,2,r`$(34.4)_8\times(23.4)_8$ evaluates to`,[m('(1053.6)_8'),m('(1053.2)_8'),m('(1024.2)_8'),'None of these']),
  question(25,2005,2,common+r`The decimal number $0.239\times2^{13}$ has the following hexadecimal representation without normalization and rounding off`,['0D 24','0D 4D','4D 0D','4D 3D'],{diagram:'number-systems-4-25-26'}),
  question(26,2005,2,common+r`The normalized representation for the above format is specified as follows. The mantissa has an implicit 1 preceding the binary (radix) point. Assume that only 0's are padded in while shifting a field. The normalized representation of the above number $(0.239\times2^{13})$ is`,['0A 20','11 34','4D D0','4A E8'],{diagram:'number-systems-4-25-26'}),
  question(27,2006,1,"The addition of 4-bit, two's complement, binary numbers 1101 and 0100 results in",['0001 and an overflow','1001 and no overflow','0001 and no overflow','1001 and an overflow']),
  question(28,2006,2,r`When multiplicand Y is multiplied by multiplier $\mathbf{X}=x_{n-1}\,x_{n-2},\ldots,x_0$ using bit-pair recoding in Booth's algorithm, partial products are generated according to the following table.
$$\begin{array}{c|c|c|c|c}\text{Row}&x_{i+1}&x_i&x_{i-1}&\text{Partial Product}\\\hline1&0&0&0&0\\2&0&0&1&Y\\3&0&1&0&Y\\4&0&1&1&2Y\\5&1&0&0&?\\6&1&0&1&-Y\\7&1&1&0&-Y\\8&1&1&1&?\end{array}$$
The partial products for rows 5 and 8 are`,[m(r`2Y\text{ and }Y`),m(r`-2Y\text{ and }2Y`),m(r`-2Y\text{ and }0`),m(r`0\text{ and }Y`)]),
  question(29,2007,2,r`$(C012.25)_H-(10111001110.101)_B=$`,[m('(135103.412)_O'),m('(564411.412)_O'),m('(564411.205)_O'),m('(135103.205)_O')]),
  question(30,2008,1,r`The following bit pattern represents a floating point number in IEEE 754 single precision format:
$$1\ 10000011\ 10100000000000000000000$$
The value of the number in decimal form is`,['-10','-13','-26','None of these']),
  question(31,2008,1,'In the IEEE floating point representation the hexadecimal value 0x00000000 corresponds to',[r`the normalized value $2^{-127}$`,r`the normalized value $2^{-126}$`,'the normalized value +0','the special value +0']),
  question(32,2008,1,r`Let a denote number system radix. The only value(s) of r that satisfy the equation $\sqrt{121}=11$, is/are`,['decimal 10','decimal 11','decimal 10 and 11',r`any value $\ge2$`],{notes:['The printed stem introduces a but subsequently uses r. This source inconsistency is preserved.']}),
  question(33,2008,2,r`The two numbers given below are multiplied using the Booth's algorithm.
Multiplicand: $0101\ 1010\ 1110\ 1110$
Multiplier: $0111\ 0111\ 1011\ 1101$
How many additions/Subtractions are required for the multiplication of the above two numbers?`,['6','8','10','12']),
  question(34,2009,1,r`$(1217)_8$ is equivalent to`,[m('(1217)_{16}'),m('(028F)_{16}'),m('(2297)_{10}'),m('(0B17)_{16}')]),
  question(35,2010,1,r`P is a 16-bit signed integer. The 2's complement representation of P is $(F87B)_{16}$. The 2's complement representation of $8*P$ is`,[m('(C3D8)_{16}'),m('(187B)_{16}'),m('(F878)_{16}'),m('(987B)_{16}')]),
  question(36,2012,1,'The decimal value 0.5 in IEEE single precision floating point representation has',['fraction bits of 000 ... 000 and exponent value of 0','fraction bits of 000 ... 000 and exponent value of -1','fraction bits of 100 ... 000 and exponent value of 0','no exact representation']),
  question(37,2013,1,"The smallest integer that can be represent by an 8-bit number in 2's complement form is",['-256','-128','-127','0']),
  question(38,2014,1,r`The base (or radix) of the number system such that the following equation holds is ______.
$$\frac{312}{20}=13.1$$`),
  question(39,2014,1,r`Consider the equation $(123)_5=(x8)_y$, with x and y as unknown. The number of possible solutions is ______.`),
  question(40,2014,2,'The value of a float type variable is represented using the single-precision 32-bit floating point format of IEEE-754 standard that uses 1 bit for sign, 8 bits for biased exponent and 23 bits for mantissa. A float type variable X is assigned the decimal value of -14.25. The representation of X in hexadecimal notation is',['C1640000H','416C0000H','41640000H','C16C0000H']),
  question(41,2015,2,r`Consider the equation $(43)_x=(y3)_8$, where x and y are unknown. The number of possible solutions is ______.`),
  question(42,2016,1,r`The 16-bit 2's complement representation of an integer is $1111\ 1111\ 1111\ 0101$; its decimal representation is ______.`),
  question(43,2016,1,r`Let X be the number of distinct 16-bit integers in 2's complement representation. Let Y be the number of distinct 16-bit integers in sign magnitude representation. Then $X-Y$ is ______.`),
  question(44,2017,1,r`The n-bit fixed-point representation of an unsigned real number X uses f bits for the fraction part. Let $i=n-f$. The range of decimal values for X in this representation is`,[m(r`2^{-f}\text{ to }2^i`),m(r`2^{-f}\text{ to }(2^i-2^{-f})`),m(r`0\text{ to }2^i`),m(r`0\text{ to }(2^i-2^{-f})`)]),
  question(45,2017,1,r`Given the following binary number in 32-bit (single precision) IEEE-754 format:
$$00111110011011010000000000000000$$
The decimal value closest to this floating-point number is`,[m(r`1.45\times10^1`),m(r`1.45\times10^{-1}`),m(r`2.27\times10^{-1}`),m(r`2.27\times10^1`)]),
  question(46,2017,1,'The representation of the value of a 16-bit unsigned integer X in hexadecimal number system is BCA9. The representation of the value of X in octal number system is',['571244','736251','571247','136251']),
  question(47,2018,2,r`Consider the unsigned 8-bit fixed point binary number representation below:
$$b_7\,b_6\,b_5\,b_4\,b_3\mathbin{.}b_2\,b_1\,b_0$$
where the position of the binary point is between $b_3$ and $b_2$. Assume $b_7$ is the most significant bit. Some of the decimal numbers listed below cannot be represented exactly in the above representation:
$$\begin{array}{ll}\text{(i)}\;31.500&\text{(ii)}\;0.875\\\text{(ii)}\;12.100&\text{(iv)}\;3.001\end{array}$$
Which one of the following statements is true?`,['None of (i), (ii), (iii), (iv) can be exactly represented.','Only (ii) cannot be exactly represented.','Only (iii) and (iv) cannot be exactly represented.','Only (i) and (ii) cannot be exactly represented.'],{notes:['The source labels both 0.875 and 12.100 as (ii), while options refer to (iii). Duplicate printed label retained.']}),
  question(48,2019,1,"In 16-bit 2's complement representation, the decimal number -28 is:",['1111 1111 0001 1100','1111 1111 1110 0100','0000 0000 1110 0100','1000 0000 1110 0100']),
  question(49,2019,1,r`Consider $Z=X-Y$, where X, Y and Z are all in sign-magnitude form. X and Y are each represented in n bits. To avoid overflow, the representation of Z would require a minimum of:`,[r`$n+2$ bits`,'n bits',r`$n-1$ bits`,r`$n+1$ bits`]),
  question(50,2020,2,r`Consider three registers R1, R2, and R3 that store numbers in IEEE-754 single precision floating point format. Assume that R1 and R2 contain the values (in hexadecimal notation) 0x42200000 and 0xC1200000, respectively.
If $\mathrm{R3}=\frac{\mathrm{R1}}{\mathrm{R2}}$, what is the value stored in R3?`,['0xC0800000','0x40800000','0x83400000','0xC8500000']),
  question(51,2021,1,'Let the representation of a number in base 3 be 210. What is the hexadecimal representation of the number?',['528','21','15','D2']),
  question(52,2021,1,r`Consider the following representation of a number in IEEE 754 single-precision floating point format with a bias of 127.
$$S:1\quad E:10000001\quad F:11110000000000000000000$$
Here S, E and F denote the sign, exponent and fraction components of the floating point representation.
The decimal value corresponding to the above representation (rounded to 2 decimal places) is ______.`),
  question(53,2021,1,r`The format of the single-precision floating-point representation of a real number as per the IEEE 754 standard is as follows:
[IMG_1]
Which of the following choices is correct with respect to the smallest normalized positive number represented using the standard?`,[
    'exponent = 00000000 and mantissa = 00000000000000000000001','exponent = 00000001 and mantissa = 00000000000000000000000','exponent = 00000001 and mantissa = 00000000000000000000001','exponent = 00000000 and mantissa = 00000000000000000000000'],{diagram:'number-systems-4-53',optLayout:'1col'}),
  question(54,2021,1,r`If x and y are two decimal digits and $(0.1101)_2=(0.8xy5)_{10}$, the decimal value of $x+y$ is ______.`),
  question(55,2021,2,'If the numerical value of a 2-byte unsigned integer on a little endian computer is 255 more than that on a big endian computer, which of the following choices represent(s) the unsigned integer on a little endian computer?',['0x6665','0x0001','0x0100','0x4243'],{questionType:'MSQ',notes:['Multiple-selection wording represent(s); stored as MSQ. No selections inferred without an answer key.']}),
  question(56,2022,1,r`Let R1 and R2 be two 4-bit registers that store numbers in 2's complement form. For the operation $\mathrm{R1}+\mathrm{R2}$, which one of the following values of R1 and R2 gives an arithmetic overflow?`,['R1 = 1011 and R2 = 1110','R1 = 1100 and R2 = 1010','R1 = 0011 and R2 = 0100','R1 = 1001 and R2 = 1111']),
  question(57,2022,2,r`Consider three floating point numbers A, B and C stored in registers $R_A$, $R_B$ and $R_C$, respectively as per IEEE-754 single precision floating point format. The 32-bit content stored in these registers (in hexadecimal form) are as follows.
$$\begin{array}{|c|c|c|}\hline R_A=\mathtt{0xC1400000}&R_B=\mathtt{0xC4210000}&R_C=\mathtt{0x41400000}\\\hline\end{array}$$
Which one of the following is FALSE?`,[m('A+C=0'),m('C=A+B'),m('B=3C'),m('(B-C)>0')],{notes:['The source register RB is printed as 0xC4210000. This value and all four options are retained literally; no correction or inferred answer.']}),
  question(58,2023,1,'A particular number is written as 132 in radix-4 representation. The same number in radix-5 representation is ______.'),
  question(59,2023,2,r`Consider the IEEE-754 single precision floating point numbers
$P=\mathtt{0xC1800000}$ and $Q=\mathtt{0x3F5C2EF4}$.
Which one of the following corresponds to the product of these numbers (i.e., $P\times Q$), represented in the IEEE-754 single precision format?`,['0x404C2EF4','0x405C2EF4','0xC15C2EF4','0xC14C2EF4']),
  question(60,2024,1,r`Consider a system that uses 5 bits for representing signed integers in 2's complement format. In this system, two integers A and B are represented as $A=01010$ and $B=11010$. Which one of the following operations will result in either an arithmetic overflow or an arithmetic underflow?`,[m('B-A'),m('A-B'),m('A+B'),m('2*B')]),
  question(61,2024,1,r`The format of a single-precision floating-point number as per the IEEE 754 standard is:
[IMG_1]
Choose the largest floating-point number among the following options.`,[
    m(r`\begin{array}{c|c|c}\text{Sign}&\text{Exponent}&\text{Mantissa}\\\hline0&0111\ 1111&1111\ 1111\ 1111\ 1111\ 1111\ 111\end{array}`),
    m(r`\begin{array}{c|c|c}\text{Sign}&\text{Exponent}&\text{Mantissa}\\\hline0&0111\ 1111&0000\ 0000\ 0000\ 0000\ 0000\ 000\end{array}`),
    m(r`\begin{array}{c|c|c}\text{Sign}&\text{Exponent}&\text{Mantissa}\\\hline0&1111\ 1110&1111\ 1111\ 1111\ 1111\ 1111\ 111\end{array}`),
    m(r`\begin{array}{c|c|c}\text{Sign}&\text{Exponent}&\text{Mantissa}\\\hline0&1111\ 1111&1111\ 1111\ 1111\ 1111\ 1111\ 111\end{array}`)],{diagram:'number-systems-4-61',optLayout:'1col'}),
  question(62,2024,2,'Which of the following is/are EQUAL to 224 in radix-5 (i.e. base-5) notation?',['121 in radix-7','100 in radix-8','64 in radix-10','50 in radix-16'],{questionType:'MSQ',notes:['Multiple-selection wording is/are EQUAL; stored as MSQ. No selections inferred without an answer key.']}),
];
export const NUMBER_SYSTEMS_IMPORT={subject:'9. Digital Logic',chapter:'4. Number Systems',sourceHash,questions};
