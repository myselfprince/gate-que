const raw = String.raw;
const sourceHash = '8aa38459f735217253db118956b6de251bab9118150ee24868d263a3ddb0add3';
// Transcribed from the printed Answers table, PDF spread 4 / book page 255.
const answers = ['C','A','B','A','C','B','D','C','B','B','D','C','C','D','D','A','B','D','D','A','C','B','A','D','B','D','D',
  '16383','A','D','16','500','D','-16','A','D','32','B','1034','14','50','B','3','34','32'];

function question(number, year, marks, setNum, text, options = [], extra = {}) {
  const bookPages = number <= 6 ? [248] : number === 7 ? [248,249] : number <= 14 ? [249]
    : number === 15 ? [249,250] : number <= 20 ? [250] : number === 21 ? [250,251]
      : number <= 27 ? [251]
        : number <= 34 ? [252] : number === 35 || number === 38 ? [252,253] : number <= 41 ? [253] : [254];
  // Q1.25 continues across the two columns of book page 251, not a page boundary.
  const pages = [...new Set(bookPages)];
  const answer = answers[number-1];
  const {notes = [], ...fields} = extra;
  return {
    id: `madeeasy-coa-cpu-1-${number}`, text, code: '', year: String(year), marks: String(marks), setNum,
    rawTopic: 'CPU Architecture and Addressing Modes', diagram: '', ext: '.png',
    optA: options[0] || '', optB: options[1] || '', optC: options[2] || '', optD: options[3] || '',
    natAnswer: options.length ? '' : answer, correctOptions: options.length ? [answer] : [],
    questionType: options.length ? 'MCQ' : 'NAT', isBlank: false, isPosLocked: false,
    isCodeOptions: false, isProof: false, needsManualOptionFix: false, optLayout: 'auto', tempPaste: '',
    ...fields,
    source: {
      file: '4. COA/1. CPU Arch. and Address. Modes.pdf', sha256: sourceHash,
      questionNumber: `1.${number}`, bookPages: pages,
      pdfPages: [...new Set(pages.map(page => Math.floor((page - 248) / 2) + 1))],
      answerKeyPdfPage: 4,
      notes: ['Answer key: book page 255, Answers - CPU Architecture and Addressing Modes.', ...notes],
    },
  };
}

const program3 = `    MOV B, #0    ; B <- 0
    MOV C, #8    ; C <- 8
Z:  CMP C, #0    ; Compare C with 0
    JZ  X        ; Jump to X if 0 flag is set
    SUB C, #1    ; C <- C - 1
    RRC A, #1    ; Rotate right A through carry by one bit
    JC  Y        ; Jump to Y if any carry flag is set
    JMP Z        ; Jump to Z
Y:  ADD B, #1    ; B <- B + 1
    JMP Z        ; Jump to Z
X:`;
const common3 = 'Common Data for Q.1.3 & Q.1.4:\nConsider the following assembly language program for a hypothetical processor. A, B and C are 8 bit registers. The meanings of various instructions are shown as comments.\n[CODE]\n';
const program8 = `Instruction    ; Operation                    ; Size (words)
MOV R1,5000    ; R1 <- Memory[5000]           ; 2
MOV R2,(R1)    ; R2 <- Memory[(R1)]           ; 1
ADD R2,R3      ; R2 <- R2 + R3                ; 1
MOV 6000,R2    ; Memory[6000] <- R2           ; 2
HALT           ; Machine halts                ; 1`;
const common8 = 'Common Data for Q.1.8 to Q.1.10:\nConsider the following program segment for a hypothetical CPU having three user registers R1, R2 and R3.\n[CODE]\n';
const program19 = `Instruction    ; Operation          ; Size (no. of words)
MOV R1,(3000)  ; R1 <- M[3000]     ; 2
LOOP:
MOV R2,M[R3]   ; R2 <- M[R3]       ; 1
ADD R2,R1      ; R2 <- R1 + R2     ; 1
MOV (R3),R2    ; M[R3] <- R2       ; 1
INC R3         ; R3 <- R3 + 1      ; 1
DEC R1         ; R1 <- R1 - 1      ; 1
BNZ LOOP       ; Branch on not zero ; 2
HALT           ; Stop`;
const common19 = 'Common Data for Q.1.19 to Q.1.21:\nConsider the following program segment. Here R1, R2 and R3 are the general purpose registers.\n[CODE]\nAssume that the content of memory location 3000 is 10 and the content of the register R3 is 2000. The content of each of the memory locations from 2000 to 2010 is 100. The program is loaded from the memory location 1000. All the numbers are in decimal.\n';

export const CPU_ADDRESSING_IMPORT = {
  subject: '4. COA', chapter: '1. CPU Arch. and Address. Modes', sourceHash,
  questions: [
    question(1,2000,1,'',raw`The most appropriate matching for the following pairs
$$\begin{array}{ll}X.\ \text{Indirect addressing}&1.\ \text{Loops}\\Y.\ \text{Immediate addressing}&2.\ \text{Pointers}\\Z.\ \text{Auto decrement addressing}&3.\ \text{Constants}\end{array}$$`,
    ['X - 3 Y - 2 Z - 1','X - 1 Y - 3 Z - 2','X - 2 Y - 3 Z - 1','X - 3 Y - 1 Z - 2']),
    question(2,2001,2,'',`Which is the most appropriate match for the items in the first column with the items in the second column
List-I
X. Indirect Addressing
Y. Indexed Addressing
Z. Base Register Addressing
List-II
I. Array implementation
II. Writing re-locatable code
III. Passing array as parameter`,['(X, III) (Y, I) (Z, II)','(X, II) (Y, III) (Z, I)','(X, III) (Y, II) (Z, I)','(X, I) (Y, III) (Z, II)']),
    question(3,2003,2,'',common3+raw`If the initial value of register A is $A_0$, the value of register B after the program execution will be`,
    [raw`the number of 0 bits in $A_0$`,raw`the number of 1 bits in $A_0$`,raw`$A_0$`,'8'],{code:program3}),
    question(4,2003,2,'',common3+'Which of the following instructions when inserted at location X will ensure that the value of register A after program execution is the same as its initial value?',
    ['RRC A, #1','NOP; no operation','LRC A, #1; left rotate A through carry flag by one bit','ADD A, #1'],{code:program3,isCodeOptions:true}),
    question(5,2004,1,'',`Which of the following addressing modes are suitable for program relocation at run time?
1. Absolute addressing
2. Based addressing
3. Relative addressing
4. Indirect addressing`,['1 and 4','1 and 2','2 and 3','1, 2 and 4']),
    question(6,2004,2,'',raw`Using a 4-bit 2's complement arithmetic, which of the following additions will result in an overflow?
(i) $1100 + 1100$    (ii) $0011 + 0111$
(iii) $1111 + 0111$`,['(i) only','(ii) only','(iii) only','(i) and (iii) only']),
    question(7,2004,2,'',raw`If we use internal data forwarding to speed up the performance of a CPU (R1, R2 and R3 are registers and M[100] is a memory reference), then the sequence of operations
$$\begin{array}{l}R1\to M[100]\\M[100]\to R2\\M[100]\to R3\end{array}$$
can be replaced by`,[
      raw`$\begin{array}{l}R1\to R3\\R2\to M[100]\end{array}$`,
      raw`$\begin{array}{l}M[100]\to R2\\R1\to R2\\R1\to R3\end{array}$`,
      raw`$\begin{array}{l}R1\to M[100]\\R2\to R3\end{array}$`,
      raw`$\begin{array}{l}R1\to R2\\R1\to R3\\R1\to M[100]\end{array}$`,
    ]),
    question(8,2004,2,'',common8+'Consider that the memory is byte addressable with size 32 bits, and the program has been loaded starting from memory location 1000 (decimal). If an interrupt occurs while the CPU has been halted after executing the HALT instruction, the return address (in decimal) saved in the stack will be',
    ['1007','1020','1024','1028'],{code:program8,notes:['Printed answer C (1024) retained from the source key without correction.']}),
    question(9,2004,2,'',common8+'Consider that the memory is word addressable with size 32 bits, and the program has been loaded starting from memory location 1000 (decimal). If an interrupt occurs during the ADD instruction, what will be the return address pushed on to the stack.',
    ['1007','1004','1005','1016'],{code:program8}),
    question(10,2004,2,'',common8+`Let the clock cycles required for various operations be as follows:
Register to/from memory transfer: 3 clock cycles
ADD with both operands in register: 1 clock cycle
Instruction fetch and decode: 2 clock cycles per word
The total number of clock cycles required to execute the program is`,['29','24','23','20'],{code:program8}),
    question(11,2005,2,'',raw`Consider a three word machine instruction
$\mathrm{ADD}\ A[R_0], @B$
The first operand (destination) 'A [R0]' uses indexed addressing mode with R0 as the index register. The second operand (source) "@B" uses indirect addressing mode. A and B are memory addresses residing at the second and the third words, respectively. The first word of the instruction specifies the opcode, the index register designation and the source and destination addressing modes. During execution of ADD instruction, the two operands are added and stored in the destination (first operand).
The number of memory cycles needed during the execution cycle of the instruction is`,['3','4','5','6']),
    question(12,2005,2,'',`Match List-I with List-II and select the correct answer using the codes given below the lists:
List-I (code):
[CODE]
List-II
1. Indirect addressing
2. Indexed addressing
3. Autoincrement
Codes (A, B, C):`,['3, 2, 1','1, 3, 2','2, 3, 1','1, 2, 3'],{
      code:'A. A[I] = B[J];\nB. while[*A++];\nC. int temp = *x;',
      notes:['List-I item B is printed while[*A++];, with square brackets; preserved as printed.'],
    }),
    question(13,2006,1,'','A CPU has 24-bit instructions. A program starts at address 300 (in decimal). Which one of the following is a legal program counter (all values in decimal)?',['400','500','600','700']),
    question(14,2006,2,'','Which of the following statements about relative addressing mode is FALSE?',[
      'It enables reduced instruction size','It allows indexing of array elements with same instruction','It enables easy relocation of data','It enables faster address calculations than absolute addressing',
    ]),
    question(15,2006,2,'',`The memory locations 1000, 1001 and 1020 have data values 18, 1 and 16 respectively before the following program is executed.
[CODE]
Which of the statements below is TRUE after the program is executed?`,[
      'Memory location 1000 has value 20','Memory location 1020 has value 20','Memory location 1021 has value 20','Memory location 1001 has value 20',
    ],{code:`MOV    Rs, 1          ; Move immediate
LOAD   Rd, 1000(Rs)   ; Load from memory
ADDI   Rd, 1000       ; Add immediate
STOREI 0(Rd), 20      ; Store immediate`}),
    question(16,2006,2,'',`Consider a new instruction named branch-on-bit-set (mnemonic bbs). The instruction "bbs reg, pos, label" jumps to label if bit in position pos of register operand reg is one. A register is 32 bits wide and the bits are numbered 0 to 31, bit in position 0 being the least significant. Consider the following emulation of this instruction on a processor that does not have bbs implemented.
[CODE]
The variable temp is a temporary register. For correct emulation, the variable mask must be generated by`,[
      raw`$\mathrm{mask}\leftarrow\mathrm{0x1}\ll\mathrm{pos}$`,raw`$\mathrm{mask}\leftarrow\mathrm{0xffffffff}\gg\mathrm{pos}$`,raw`$\mathrm{mask}\leftarrow\mathrm{pos}$`,raw`$\mathrm{mask}\leftarrow\mathrm{0xf}$`,
    ],{code:'temp <- reg and mask\nBranch to label if temp is non-zero'}),
    question(17,2007,2,'',raw`Data forwarding techniques can be used to speed up the operation in presence of data dependencies. Consider the following replacements of LHS with RHS.
(i) $R1\to\mathrm{Loc},\ \mathrm{Loc}\to R2\equiv R1\to R2,\ R1\to\mathrm{Loc}$
(ii) $R1\to\mathrm{Loc},\ \mathrm{Loc}\to R2\equiv R1\to R2$
(iii) $R1\to\mathrm{Loc},\ R2\to\mathrm{Loc}\equiv R1\to\mathrm{Loc}$
(iv) $R1\to\mathrm{Loc},\ R2\to\mathrm{Loc}\equiv R2\to\mathrm{Loc}$
In which of the following options, will the result of executing the RHS be the same as executing the LHS irrespective of the instructions that follow?`,['(i) and (iii)','(i) and (iv)','(ii) and (iii)','(ii) and (iv)']),
    question(18,2007,2,'',raw`Following table indicates the latencies of operations between the instruction producing the result and instruction using the result.
$$\begin{array}{l|l|r}\text{Instruction producing result}&\text{Instruction using result}&\text{Latency}\\\text{ALU Operation}&\text{ALU Operation}&2\\\text{ALU Operation}&\text{Store}&2\\\text{Load}&\text{ALU Operation}&1\\\text{Load}&\text{Store}&0\end{array}$$
Consider the following code segment.
[CODE]
What is the number of cycles needed to execute the above code segment assuming each instruction takes one cycle to execute?`,['7','10','13','14'],{code:`Load R1, Loc1;    Load R1 from memory location Loc1
Load R2, Loc2;    Load R2 from memory location Loc2
Add R1, R2, R1;   Add R1 and R2 and save result in R1
Dec R2;           Decrement R2
Dec R1;           Decrement R1
Mpy R1, R2, R3;   Multiply R1 and R2 and save result in R3
Store R3, Loc3;   Store R3 in memory location Loc3`}),
    question(19,2007,2,'',common19+'Assume that the memory is word addressable. The number of memory references for accessing the data in executing the program completely is',['10','11','20','21'],{code:program19}),
    question(20,2007,2,'',common19+'Assume that the memory is word addressable. After the execution of this program, the content of memory location 2010 is',['100','101','102','110'],{code:program19}),
    question(21,2007,2,'',common19+'Assume that the memory is byte addressable and the word size is 32 bits. If an interrupt occurs during the execution of the instruction "INC R3", what return address will be pushed on to the stack?',['1005','1020','1024','1040'],{code:program19}),
    question(22,2008,1,'',raw`A processor that has carry, overflow and sign flag bits as part of its program status word (PSW) performs addition of the following two 2's complement numbers $01001101$ and $11101001$. After the execution of this addition operation, the status of the carry, overflow and sign flags, respectively will be:`,['1, 1, 0','1, 0, 0','0, 1, 0','1, 0, 1']),
    question(23,2008,2,'',raw`Assume that $EA=(X)+$ is the effective address equal to the contents of location X, with X incremented by one word length after the effective address is calculated; $EA=-(X)$ is the effective address equal to the contents of location X, with X decremented by one word length before the effective address is calculated; $EA=(X)-$ is the effective address equal to the contents of location X, with X decremented by one word length after the effective address is calculated. The format of the instruction is (opcode, source, destination), which means $(\mathrm{destination}\leftarrow\mathrm{source}\ \mathrm{op}\ \mathrm{destination})$. Using X as a stack pointer, which of the following instructions can pop the top two elements from the stack, perform the addition operation and push the result back to the stack.`,['ADD (X)-, (X)','ADD (X), (X)-','ADD -(X), (X)+','ADD -(X), (X)'],{isCodeOptions:true}),
    question(24,2008,2,'',`Which of the following must be true for the RFE (Return from Exception) instruction on a general purpose processor.
1. It must be a trap instruction
2. It must be a privileged instruction
3. An exception can not be allowed to occur during execution of an RFE instruction.`,['1 only','2 only','1 and 2 only','1, 2 and 3 only']),
    question(25,2010,2,'',`The program below uses six temporary variables a, b, c, d, e, f.
[CODE]
Assuming that all operations take their operands from registers, what is the minimum number of registers needed to execute this program without spilling?`,['2','3','4','6'],{code:`a = 1
b = 10
c = 20
d = a + b
e = c + d
f = c + e
b = c + e
e = b + f
d = 5 + e
return d + f`}),
    question(26,2011,1,'','Consider a hypothetical processor with a instruction of type LW R1, 20(R2), which during execution reads a 32-bit word from memory and stores it in a 32-bit register R1. The effective address of the memory location is obtained by the addition of a constant 20 and the contents of register R2. Which of the following best reflects the addressing mode implemented by this instruction for the operand in memory?',[
      'Immediate Addressing','Register Addressing','Register Indirect Scaled Addressing','Base Indexed Addressing',
    ]),
    question(27,2011,2,'',`Consider evaluating the following expression tree on a machine with load-store architecture in which memory can be accessed only through load and store instructions. The variables a, b, c, d and e are initially stored in memory. The binary operators used in this expression tree can be evaluated by the machine only when the operands are in registers. The instructions produce result only in a register. If no intermediate results can be stored in memory, what is the minimum number of registers needed to evaluate this expression?
[IMG_1]`,['2','9','5','3'],{diagram:'coa-cpu-1-27-tree'}),
    question(28,2014,1,'1','A machine has a 32-bit architecture, with 1-word long instructions. It has 64 registers, each of which is 32 bits long. It needs to support 45 instructions, which have an immediate operand in addition to two register operands. Assuming that the immediate operand is an unsigned integer, the maximum value of the immediate operand is ________.'),
    question(29,2015,1,'1',`For computers based on three-address instruction formats, each address field can be used to specify which of the following:
S1: A memory operand
S2: A processor register
S3: An implied accumulator register`,['Either S1 or S2','Either S2 or S3','Only S2 and S3','All of S1, S2 and S3']),
    question(30,2015,2,'2',raw`Consider a processor with byte-addressable memory. Assume that all registers, including Program Counter (PC) and Program Status Word (PSW), are of size 2 bytes. A stack in the main memory is implemented from memory location $(0100)_{16}$ and it grows upward. The stack pointer (SP) points to the top element of the stack. The current value of SP is $(016E)_{16}$. The CALL instruction is of two words, the first word is the op-code and the second word is the starting address of the subroutine (one word = 2 bytes). The CALL instruction is implemented as follows:
- Store the current value of PC in the stack.
- Store the value of PSW register in the stack.
- Load the starting address of the subroutine in PC.
The content of PC just before the fetch of a CALL instruction is $(5FA0)_{16}$. After execution of the CALL instruction, the value of the stack pointer is`,[raw`$(016A)_{16}$`,raw`$(016C)_{16}$`,raw`$(0170)_{16}$`,raw`$(0172)_{16}$`]),
    question(31,2016,1,'2','A processor has 40 distinct instructions and 24 general purpose registers. A 32-bit instruction word has an opcode, two register operands and an immediate operand. The number of bits available for the immediate operand field is ________.'),
    question(32,2016,2,'2','Consider a processor with 64 registers and an instruction set of size twelve. Each instruction has five distinct fields, namely, opcode, two source register identifiers, one destination register identifier, and a twelve-bit immediate value. Each instruction must be stored in memory in a byte-aligned fashion. If a program has 100 instructions, the amount of memory (in bytes) consumed by the program text is ________.'),
    question(33,2017,1,'1',`Consider the C struct defined below:
[CODE]
The base address of student is available in register R1. The field student, grade can be accessed efficiently using`,[
      'Post-increment addressing mode, (R1)+','Pre-decrement addressing mode, -(R1)','Register direct addressing mode, R1',"Index addressing mode, X(R1). where X is an offset represented in 2's complement 16-bit representation.",
    ],{code:'struct data {\n    int marks[100];\n    char grade;\n    int cnumber;\n};\nstruct data student;',notes:['The source prose prints "student, grade" with a comma; retained as printed.']}),
    question(34,2017,2,'1',raw`Consider a RISC machine where each instruction is exactly 4 bytes long. Conditional and unconditional branch instructions use PC-relative addressing mode with Offset specified in bytes to the target location of the branch instruction. Further the Offset is always with respect to the address of the next instruction in the program sequence. Consider the following instruction sequence
[CODE]
If the target of the branch instruction is $i$, then the decimal value of the Offset is ________.`,[],{code:`Instr. No.   Instruction
i            add R2, R3, R4
i + 1        sub R5, R6, R7
i + 2        cmp R1, R9, R10
i + 3        beq R1, Offset`}),
    question(35,2018,1,'',`The following are some events that occur after a device controller issues an interrupt while process L is under execution.
(P) The processor pushes the process status of L onto the control stack.
(Q) The processor finishes the execution of the current instruction.
(R) The processor executes the interrupt service routine.
(S) The processor pops the process status of L from the control stack.
(T) The processor loads the new PC value based on the interrupt.
Which one of the following is the correct order in which the events above occur?`,['QPTRS','PTRSQ','TRPQS','QTPRS']),
    question(36,2018,1,'',`Consider the following processor design characteristics:
I. Register-to-register arithmetic operations only.
II. Fixed-length instruction format.
III. Hardwired control unit.
Which of the characteristics above are used in the design of a RISC processor?`,['I and II only','II and III only','I and III only','I, II and III']),
    question(37,2018,2,'','A processor has 16 integer registers (R0, R1, ..., R15) and 64 floating point registers (F0, F1, ..., F63). It uses a 2-byte instruction format. There are four categories of instructions: Type-1, Type-2, Type-3 and Type-4. Type-1 category consists of four instructions, each with 3 integer register operands (3Rs). Type-2 category consists of eight instructions, each with 2 floating point register operands (2Fs). Type-3 category consists of fourteen instructions, each with one integer register operand and one floating point register operand (1R+1F). Type-4 category consists of N instructions, each with a floating point register operand (1F). The maximum value of N is ________.'),
    question(38,2019,1,'',raw`The chip selects logic for a certain DRAM chip in memory system design is shown below. Assume that memory has 16 address lines denoted by $A_{15}$ to $A_0$. What is the range of addresses (in hexadecimal) of the memory system that can get enabled by the chip select (CS) signal?
[IMG_1]`,['DA00 to DFFF','C800 to CFFF','C800 to C8FF','CA00 to CAFF'],{diagram:'coa-cpu-1-38-chip-select'}),
    question(39,2020,1,'',raw`If there are $m$ input lines and $n$ output lines for a decoder that is used to uniquely address a byte addressable 1 KB RAM, then the minimum value of $m+n$ is ________.`),
    question(40,2020,2,'','A processor has 64 registers and uses 16-bit instruction format. It has two types of instructions: I-type and R-type. Each I-type instruction contains an opcode, a register name, and a 4-bit immediate value. Each R-type instruction contains an opcode and two register names. If there are 8 distinct I-type opcodes, then the maximum number of distinct R-type opcodes is ________.'),
    question(41,2021,2,'1',`Consider the following instruction sequence where registers R1, R2 and R3 are general purpose and MEMORY[X] denotes the content at the memory location X.
[CODE]
Assume that the content of the memory location 5000 is 10 and the content of the register R3 is 3000. The content of each of the memory locations from 3000 to 3010 is 50. The instruction sequence starts from the memory location 1000. All the numbers are in decimal format. Assume that the memory is byte addressable.
After the execution of the program, the content of memory location 3010 is ________.`,[],{code:`Instruction    ; Semantics                                  ; Size (bytes)
MOV R1,(5000)  ; R1 <- MEMORY[5000]                         ; 4
MOV R2,(R3)    ; R2 <- MEMORY[R3]                           ; 4
ADD R2,R1      ; R2 <- R1 + R2                              ; 2
MOV (R3),R2    ; MEMORY[R3] <- R2                           ; 4
INC R3         ; R3 <- R3 + 1                               ; 2
DEC R1         ; R1 <- R1 - 1                               ; 2
BNZ 1004       ; Branch if not zero to given absolute address ; 2
HALT           ; Stop                                        ; 1`}),
    question(42,2023,2,'',`Consider the given C-code and its corresponding assembly code, with a few operands U1-U4 being unknown. Some useful information as well as the semantics of each unique assembly instruction is annotated as inline comments in the code. The memory is byte-addressable.
[CODE]
Which one of the following options is a CORRECT replacement for operands in the position (U1, U2, U3, U4) in the above assembly code?`,['(8, 4, 1, L02)','(3, 4, 4, L01)','(8, 1, 1, L02)','(3, 1, 1, L01)'],{code:`// C-code
int a[10], b[10], i;
// int is 32-bit
for (i=0; i<10; i++)
    a[i] = b[i] * 8;

; assembly-code (; indicates comments)
; r1-r5 are 32-bit integer registers
; initialize r1=0, r2=10
; initialize r3, r4 with base address of a, b
L01: jeq r1, r2, end; if(r1==r2) goto end
L02: lw r5, 0(r4); r5 <- Memory[r4+0]
L03: shl r5, r5, U1; r5 <- r5 << U1
L04: sw r5, 0(r3); Memory[r3+0] <- r5
L05: add r3, r3, U2; r3 <- r3+U2
L06: add r4, r4, U3
L07: add r1, r1, 1
L08: jmp U4; goto U4
L09: end`}),
    question(43,2024,2,'1','The baseline execution time of a program on a 2 GHz single core machine is 100 nanoseconds (ns). The code corresponding to 90% of the execution time can be fully parallelized. The overhead for using an additional core is 10 ns when running on a multicore system. Assume that all cores in the multicore system run their share of the parallelized code for an equal amount of time.\nThe number of cores that minimize the execution time of the program is ________.'),
    question(44,2024,2,'2',raw`A processor uses a 32-bit instruction format and supports byte-addressable memory accesses. The ISA of the processor has 150 distinct instructions. The instructions are equally divided into two types, namely R-type and I-type, whose formats are shown below.
R-type Instruction Format:
$$\begin{array}{|c|c|c|c|c|}\hline\text{OPCODE}&\text{UNUSED}&\text{DST Register}&\text{SRC Register1}&\text{SRC Register2}\\\hline\end{array}$$
I-type Instruction Format:
$$\begin{array}{|c|c|c|c|}\hline\text{OPCODE}&\text{DST Register}&\text{SRC Register}&\#\ \text{Immediate value/address}\\\hline\end{array}$$
In the OPCODE, 1 bit is used to distinguish between I-type and R-type instructions and the remaining bits indicate the operation. The processor has 50 architectural registers, and all register fields in the instructions are of equal size.
Let $X$ be the number of bits used to encode the UNUSED field, $Y$ be the number of bits used to encode the OPCODE field, and $Z$ be the number of bits used to encode the immediate value/address field. The value of $X+2Y+Z$ is ________.`),
    question(45,2024,2,'2','A processor with 16 general purpose registers uses a 32-bit instruction format. The instruction format consists of an opcode field, an addressing mode field, two register operand fields, and a 16-bit scalar field. If 8 addressing modes are to be supported, the maximum number of unique opcodes possible for every addressing mode is ________.'),
  ],
};
