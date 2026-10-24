const raw = String.raw;
const sourceHash = '19a73f8062c04fc97904b750368e945cd2126f5953097ce99a5d7500c354d04b';
// Visually transcribed Answers - Instruction Pipelining, book p.275 / PDF spread 4.
const answers = 'B A B D D C A C A B C D C B B B C D A D D B B C B 4 1.6 C 1.54 3.2 13 B 3 33.28 4 28 1.508 219 2.16 17160 1.875 1.42 2040 B,C,D C 3'.split(' ');

function question(number, year, marks, text, options = [], extra = {}) {
  const {notes = [], ...fields} = extra;
  const bookPages = number < 9 ? [268] : number === 9 ? [268,269] : number <= 14 ? [269]
    : number < 22 ? [270] : number === 22 ? [270,271] : number <= 29 ? [271]
    : number < 37 ? [272] : number === 37 ? [272,273] : number <= 43 ? [273] : [274];
  return {
    id:`madeeasy-coa-pipeline-3-${number}`, text, code:'', year:String(year), marks:String(marks), setNum:'',
    rawTopic:'Pipeline Processor', diagram:'', ext:'.png',
    optA:options[0]||'', optB:options[1]||'', optC:options[2]||'', optD:options[3]||'',
    natAnswer:options.length?'':answers[number-1],
    correctOptions:options.length?answers[number-1].split(','):[],
    questionType:options.length?number>=44?'MSQ':'MCQ':'NAT',
    isBlank:false, isPosLocked:false, isCodeOptions:false, isProof:false,
    needsManualOptionFix:false, optLayout:'auto', tempPaste:'', ...fields,
    source:{
      file:'4. COA/3. Instructions Pipeline.pdf', sha256:sourceHash, questionNumber:`3.${number}`,
      bookPages, pdfPages:[number<=14?1:number<=29?2:number<=43?3:4], answerKeyPdfPage:4,
      notes:['Answer key: book page 275, Answers - Instruction Pipelining.', ...notes],
    },
  };
}

const common13 = raw`Common Data for Q.3.13 & 3.14:
A pipelined processor uses a 4-stage instruction pipeline with the following stages: Instruction fetch (IF), Instruction decode (ID), Execute (EX) and Writeback (WB). The arithmetic operations as well as the load and store operations are carried out in the EX stage. The sequence of instructions corresponding to the statement $X=(S-R*(P+Q))/T$ is given below. The values of variables P, Q, R, S and T are available in the registers R0, R1, R2, R3 and R4 respectively, before the execution of the instruction sequence.
[CODE]
`;
const commonCode13 = `ADD   R5, R0, R1 ; R5 -> R0 + R1
MUL   R6, R2, R5 ; R6 -> R2 * R5
SUB   R5, R3, R6 ; R5 -> R3 - R6
DIV   R6, R5, R4 ; R6 -> R5/R4
STORE R6, X      ; X <- R6`;
const common19 = 'Common Data for Q.3.19 & Q.3.20:\nDelayed branching can help in the handling of control hazards.\n';

export const INSTRUCTIONS_PIPELINE_IMPORT = {
  subject:'4. COA', chapter:'3. Instructions Pipeline', sourceHash,
  questions:[
    question(1,2000,1,'Comparing the time T1 taken for a single instruction on a pipelined CPU with time T2 taken on a non-pipelined but identical CPU, we can say that',[
      '$T1\\leq T2$','$T1\\geq T2$','$T1<T2$','T1 plus T2 is the time taken for one instruction fetch cycle',
    ]),
    question(2,2002,1,"In serial data transmission, every byte of data is padded with a '0' in the beginning and one or two '1's at the end of byte because",[
      'Receiver is to be synchronized for byte reception',"Receiver recovers lost '0's and '1's from these padded bits",
      'Padded bits are useful in parity computation','None of the above',
    ]),
    question(3,2002,1,"In 2's complement addition, overflow",[
      'is flagged whenever there is carry from sign bit addition',
      'cannot occur when a +ve value is added to a -ve value',
      'is flagged when the carries from sign bit and previous bit match','None of the above',
    ]),
    question(4,2002,2,'The performance of a pipelined processor suffers if',[
      'the pipeline stages have different delays','consecutive instructions are dependent on each other',
      'the pipeline stages share hardware resources','All of the above',
    ]),
    question(5,2003,1,raw`For a pipelined CPU with a single ALU, consider the following situations
1. The $j+1^{\mathrm{st}}$ instruction uses the result of the $j^{\mathrm{th}}$ instruction as an operand
2. The execution of a conditional jump instruction
3. The $j^{\mathrm{th}}$ and $j+1^{\mathrm{st}}$ instructions require the ALU at the same time
Which of the above can cause a hazard?`,['1 and 2 only','2 and 3 only','3 only','All the three']),
    question(6,2004,2,raw`Consider a pipeline processor with 4 stages S1 to S4. We want to execute the following loop:
[CODE]
where the time taken (in ns) by instructions I1 to I4 for stages S1 to S4 are given below:
$$\begin{array}{c|cccc}&\mathrm{S1}&\mathrm{S2}&\mathrm{S3}&\mathrm{S4}\\\hline
\mathrm{I1:}&1&2&1&2\\\mathrm{I2:}&2&1&2&1\\\mathrm{I3:}&1&1&2&1\\\mathrm{I4:}&2&1&2&1\end{array}$$
The output of I1 for i = 2 will be available after`,['11 ns','12 ns','13 ns','28 ns'],{code:'for (i = 1; i <= 1000; i++) {I1, I2, I3, I4}'}),
    question(7,2004,2,'In an enhancement of a design of a CPU, the speed of a floating point unit has been increased by 20% and the speed of a fixed point unit has been increased by 10%. What is the overall speedup achieved if the ratio of the number of floating point operations to the number of fixed point operations is 2 : 3 and the floating point operation used to take twice the time taken by the fixed point operation in the original design?',
      ['1.155','1.185','1.255','1.285']),
    question(8,2004,2,'A 4-stage pipeline has the stage delays as 150, 120, 160 and 140 nanoseconds respectively. Registers that are used between the stages have a delay of 5 nanoseconds each. Assuming constant clocking rate, the total time taken to process 1000 data items on this pipeline will be',
      ['120.4 microseconds','160.5 microseconds','165.5 microseconds','590.0 microseconds']),
    question(9,2005,2,raw`A 5 stage pipelined CPU has the following sequence of stages
IF - Instruction fetch from instruction memory,
RD - Instruction decode and register read,
EX - Execute: ALU operation for data and address computation,
MA - Data memory access - for write access the register read at RD stage it used,
WB - Register write back.
Consider the following sequence of instructions:
[CODE]
Let each stage take one clock cycle.
What is the number of clock cycles taken to complete the above sequence of instructions starting from the fetch of $I_1$?`,['8','10','12','15'],{
      code:'I1: L R0, Loc1; R0 <- M[Loc1]\nI2: A R0, R0; R0 <- R0 + R0\nI2: A R2, R0; R2 <- R2 - R0',
      notes:['Question continues from book page 268 to 269. The third instruction label is printed I2 again, and its A opcode accompanies subtraction; retained literally. The MA stage prose prints "it used".'],
    }),
    question(10,2005,2,'We have two designs D1 and D2 for a synchronous pipeline processor. D1 has 5 pipeline stages with execution times of 3 nsec, 2 nsec, 4 nsec, 2 nsec and 3 nsec while the design D2 has 8 pipeline stages each with 2 nsec execution time. How much time can be saved using design D2 over design D1 for executing 100 instructions?',
      ['214 nsec','202 nsec','86 nsec','-200 nsec']),
    question(11,2006,2,raw`A CPU has five-stages pipeline and runs at 1 GHz frequency. Instruction fetch happens in the first stage of the pipeline. A conditional branch instruction computes the target address and evaluates the condition in the third stage of the pipeline. The processor stops fetching new instructions following a conditional branch until the branch outcome is known. A program executes $10^9$ instructions out of which 20% are conditional branches. If each instruction takes one cycle to complete on average, then total execution time of the program is`,
      ['1.0 second','1.2 seconds','1.4 seconds','1.6 seconds']),
    question(12,2006,2,raw`The data path shown in the figure computes the number of 1s in the 32-bit input word corresponding to an unsigned even integer stored in the shift register. The unsigned counter, initially zero, is incremented if the most significant bit of the shift register is 1.
[IMG_1]
The microprogram for the control is shown in the table below with missing control words for microinstructions $I_1,I_2,\ldots,I_n$.
$$\begin{array}{c|ccc}\text{Micro-instruction}&\text{reset\_counter}&\text{shift\_left}&\text{load\_output}\\\hline
\mathrm{BEGIN}&1&0&0\\I_1&?&?&?\\\vdots&\vdots&&\vdots\\I_n&?&?&?\\\mathrm{END}&0&0&1\end{array}$$
The counter width $(k)$, the number of missing microinstructions $(n)$, and the control word for microinstructions $I_1,I_2,\ldots,I_n$ are, respectively,`,
      ['32, 5, 010','5, 32, 010','5, 31, 011','5, 31, 010'],{
        diagram:'coa-pipeline-3-12-datapath',notes:['Question continues across the two columns of book page 269. Microprogram table stored as editable LaTeX; figure-only crop retains every signal and arrow.'],
      }),
    question(13,2006,2,common13+'The number of Read-After-Write (RAW) dependencies, Write-After-Read (WAR) dependencies, and Write-After-Write (WAW) dependencies in the sequence of instructions are, respectively',
      ['2, 2, 4','3, 2, 3','4, 2, 2','3, 3, 2'],{code:commonCode13,notes:['Shared instruction sequence retained in each question; the first four transfer arrows point right in the printed source.']}),
    question(14,2006,2,common13+'The IF, ID and WB stages take 1 clock cycle each. The EX stage takes 1 clock cycle each for the ADD, SUB and STORE operations, and 3 clock cycles each for MUL and DIV operations. Operand forwarding from the EX stage to the ID stage is used. The number of clock cycles required to complete the sequence of instructions is',
      ['10','12','14','16'],{code:commonCode13,notes:['Shared instruction sequence retained in each question; the first four transfer arrows point right in the printed source.']}),
    question(15,2007,1,'A processor takes 12 cycles to complete an instruction 1. The corresponding pipelined processor uses 6 stages with the execution times of 3, 2, 5, 4, 6 and 2 cycles respectively. What is the asymptotic speedup assuming that a very large number of instructions are to be executed?',
      ['1.83','2','3','6'],{notes:['The source prints "an instruction 1."; retained without silently deleting the extra 1.']}),
    question(16,2007,2,raw`Consider a pipelined processor with the following four stages
IF: Instruction Fetch
ID: Instruction Decode and Operand Fetch
EX: Execute
WB: Write Back
The IF, ID and WB stages take one clock cycle each to complete the operation. The number of clock cycles for the EX stage depends on the instruction. The ADD and SUB instructions need 1 clock cycle and the MUL instruction need 3 clock cycles in the EX stage. Operand forwarding is used in the pipelined processor. What is the number of clock cycles taken to complete the following sequence of instructions?
[CODE]`,['7','8','10','14'],{
      code:'ADD R2, R1, R0 ; R2 <- R1 + R0\nMUL R4, R3, R2 ; R4 <- R3 * R2\nSUB R6, R5, R4 ; R6 <- R5 - R4',
    }),
    question(17,2008,2,'A nonpipelined single cycle processor operating at 100 MHz is converted into a synchronous pipelined processor with five stages requiring 2.5 nsec, 1.5 nsec, 2 nsec, 1.5 nsec and 2.5 nsec, respectively. The delay of the latches is 0.5 nsec. The speedup of the pipeline processor for a large number of instructions is',
      ['4.5','4.0','3.33','3.0']),
    question(18,2008,2,'Which of the following are NOT true in a pipelined processor?\n1. Bypassing can handle all Raw hazards.\n2. Register renaming can eliminate all register carried WAR hazards.\n3. Control hazard penalties can be eliminated by dynamic branch prediction.',
      ['1 and 2 only','1 and 3 only','2 and 3 only','1, 2 and 3']),
    question(19,2008,2,common19+'For all delayed conditional branch instructions, irrespective of whether the condition evaluates to true or false, A',[
      'the instruction following the conditional branch instruction in memory is executed',
      'the first instruction in the fall through path is executed','the first instruction in the taken path is executed',
      'the branch takes longer to execute than any other instruction',
    ]),
    question(20,2008,2,common19+raw`The following code is to run on a pipelined processor with one branch delay slot
[CODE]
Which of the instruction I1, I2, I3 or I4 can legitimately occupy the delay slot without any other program modification?`,['I1','I2','I3','I4'],{
      code:'I1: ADD R2 <- R7 + R8\nI2: SUB R4 <- R5 - R6x\nI3: ADD R1 <- R2 + R3\nI4: STORE Memory [R4] <- R1\nBRANCH to Label if R1 == 0',
      notes:['The printed second instruction ends in "R6x"; preserved literally rather than inventing a corrected operand. Printed answer D is unambiguous.'],
    }),
    question(21,2009,2,raw`Consider a 4 stage pipeline processor. The number of cycles needed by the four instructions I1, I2, I3, I4 in stages S1, S2, S3, S4 is shown below:
$$\begin{array}{c|cccc}&\mathrm{S1}&\mathrm{S2}&\mathrm{S3}&\mathrm{S4}\\\hline
\mathrm{I1}&2&1&1&1\\\mathrm{I2}&1&3&2&2\\\mathrm{I3}&2&1&1&3\\\mathrm{I4}&1&2&2&2\end{array}$$
What is the number of cycles needed to execute the following loop?
[CODE]`,['16','23','28','30'],{code:'for (i = 1 to 2) {I1; I2; I3; I4;}'}),
    question(22,2010,2,raw`A 5-stage pipelined processor has Instruction Fetch (IF), Instruction Decode (ID), Operand Fetch (OF), Perform Operation (PO) and Write Operand (WO) stages. The IF, ID, OF and WO stages take 1 clock cycle each for any instruction. The PO stage takes 1 clock cycle for ADD and SUB instructions 3 clock cycles for MUL instruction, and 6 clock cycles for DIV instruction respectively. Operand forwarding is used in the pipeline. What is the number of clock cycles needed to execute the following sequence of instructions?
[CODE]`,['13','15','17','19'],{
      code:'Instruction          Meaning of Instruction\nI0: MUL R2, R0, R1   R2 <- R0 * R1\nI1: DIV R5, R3, R4   R5 <- R3/R4\nI2: ADD R2, R5, R2   R2 <- R5 + R2\nI3: SUB R5, R2, R6   R5 <- R2 - R6',
      notes:['Question continues from book page 270 to options at the top of page 271.'],
    }),
    question(23,2011,2,raw`Consider an instruction pipeline with four stages (S1, S2, S3 and S4) each with combinational circuit only. The pipeline registers are required between each stage and at the end of the last stage. Delays for the stages and for the pipeline registers are as given in the figure
[IMG_1]
What is the approximate speed up of the pipeline in steady state under ideal conditions when compared to the corresponding non-pipeline implementation?`,['4.0','2.5','1.1','3.0'],{diagram:'coa-pipeline-3-23-stages'}),
    question(24,2012,1,'Register renaming is done in pipelined processors',[
      'as an alternative to register allocation at compile time','for efficient access to function parameters and local variables',
      'to handle certain kinds of hazards','as part of address translation',
    ]),
    question(25,2013,2,raw`Consider an instruction pipeline with five stages without any branch prediction: Fetch Instruction (FI), Decode Instruction (DI), Fetch Operand (FO), Execute Instruction (EI) and Write Operand (WO). The stage delays for FI, DI, FO, EI and WO are 5 ns, 7 ns, 10 ns, 8 ns and 6 ns, respectively. There are intermediate storage buffers after each stage and the delay of each buffer is 1 ns. A program consisting of 12 instruction $I_1,I_2,I_3,\ldots,I_{12}$ is execute in this pipelined processor. Instruction $I_4$ is the only branch instruction and its branch target is $I_9$. If the branch is taken during the execution of this program, the time (in ns) needed to complete the program is`,
      ['132','165','176','328']),
    question(26,2014,2,'Consider a 6-stage instruction pipeline, where all stages are perfectly balanced. Assume that there is no cycle-time overhead of pipelining. When an application is executing on this 6-stage pipeline, the speedup achieved with respect to non-pipelined execution if 25% of the instructions incur 2 pipeline stall cycles is ________.',[],{setNum:'1',notes:['Question continues across the two columns of book page 271.']}),
    question(27,2014,2,raw`Consider two processors $P_1$ and $P_2$ executing the same instruction set. Assume that under identical conditions, for the same input, a program running on $P_2$ takes 25% less time but incurs 20% more CPI (clock cycles per instruction) as compared to the program running on $P_1$. If the clock frequency of $P_1$ is 1 GHz, then the clock frequency of $P_2$ (in GHz) is ________.`,[],{setNum:'1'}),
    question(28,2014,1,'Consider the following processors (ns stands for nanoseconds). Assume that the pipeline registers have zero latency.\nP1: Four-stage pipeline with stage latencies 1 ns, 2 ns, 2 ns, 1 ns.\nP2: Four-stage pipeline with stage latencies 1 ns, 1.5 ns, 1.5 ns, 1.5 ns.\nP3: Five-stage pipeline with stage latencies 0.5 ns, 1 ns, 1 ns, 0.6 ns, 1 ns.\nP4: Five-stage pipeline with stage latencies 0.5 ns, 0.5 ns, 1 ns, 1 ns, 1.1 ns.\nWhich processor has the highest peak clock frequency?',
      ['P1','P2','P3','P4'],{setNum:'3'}),
    question(29,2014,2,raw`An instruction pipeline has five stages, namely, instruction fetch (IF), instruction decode and register fetch (ID/RF), instruction execution (EX), memory access (MEM), and register writeback (WB) with stage latencies 1 ns, 2.2 ns, 2 ns, 1 ns, and 0.75 ns, respectively (ns stands for nanoseconds). To gain in terms of frequency, the designers have decided to split the ID/RF stage into three stages (ID, RF1, RF2) each of latency $2.2/3$ ns. Also, the EX stage is split into two stages (EX1, EX2) each of latency 1 ns. The new design has a total of eight pipeline stages. A program has 20% branch instructions which execute in the EX stage and produce the next instruction pointer at the end of the EX stage in the old design and at the end of the EX2 stage in the new design. The IF stage stalls after fetching a branch instruction until the next instruction pointer is computed. All instructions other than the branch instruction have an average CPI of one in both the designs. The execution times of this program on the old and the new design are $P$ and $Q$ nanoseconds, respectively. The value of $P/Q$ is ________.`,[],{setNum:'3'}),
    question(30,2015,2,'Consider a non-pipelined processor with a clock rate of 2.5 gigahertz and average cycles per instruction of four. The same processor is upgraded to a pipelined processor with five stages; but due to the internal pipeline delay, the clock speed is reduced to 2 gigahertz. Assume that there are no stalls in the pipeline. The speed up achieved in this pipelined processor is ________.',[],{setNum:'1'}),
    question(31,2015,2,raw`Consider the sequence of machine instructions given below:
[CODE]
In the above sequence, R0 to R8 are general purpose registers. In the instructions shown, the first register stores the result of the operation performed on the second and the third registers. This sequence of instructions is to be executed in a pipelined instruction processor with the following 4 stages: (1) Instruction Fetch and Decode (IF), (2) Operand Fetch (OF), (3) Perform Operation (PO) and (4) Write back the Result (WB). The IF, OF and WB stages take 1 clock cycle each for any instruction. The PO stage takes 1 clock cycle for ADD or SUB instruction, 3 clock cycles for MUL instruction and 5 clock cycles for DIV instruction. The pipelined processor uses operand forwarding from the PO stage to the OF stage. The number of clock cycles taken for the execution of the above sequence of instructions is ________.`,[],{
      setNum:'2',code:'MUL R5, R0, R1\nDIV R6, R2, R3\nADD R7, R5, R6\nSUB R8, R7, R4',
    }),
    question(32,2015,2,raw`Consider the following code sequence having five instructions $I_1$ to $I_5$. Each of these instructions has the following format.
OP Ri, Rj, Rk
where operation OP is performed on contents of registers Rj and Rk and the result is stored in register Ri.
[CODE]
Consider the following three statements:
S1: There is an anti-dependence between instructions $I_2$ and $I_5$.
S2: There is an anti-dependence between instructions $I_2$ and $I_4$.
S3: Within an instruction pipeline an anti-dependence always creates one or more stalls.
Which one of above statements is/are correct?`,['Only S1 is true','Only S2 is true','Only S1 and S3 are true','Only S2 and S3 are true'],{
      setNum:'3',code:'I1: ADD R1, R2, R3\nI2: MUL R7, R1, R3\nI3: SUB R4, R1, R5\nI4: ADD R3, R2, R4\nI5: MUL R7, R8, R9',
      notes:['Question continues across the two columns of book page 272.'],
    }),
    question(33,2015,2,raw`Consider the following reservation table for a pipeline having three stages $S_1,S_2$ and $S_3$.
$$\begin{array}{c|ccccc}\text{Time }\longrightarrow&1&2&3&4&5\\\hline
S_1&X&&&&X\\S_2&&X&&X&\\S_3&&&X&&\end{array}$$
The minimum average latency (MAL) is ________.`,[],{setNum:'3',notes:['Reservation table transcribed into editable LaTeX with all five occupied cells.']}),
    question(34,2016,2,'The stage delays in a 4-stage pipeline are 800, 500, 400 and 300 picoseconds. The first stage (with delay 800 picoseconds) is replaced with a functionally equivalent design involving two stages with respective delays 600 and 350 picoseconds. The throughput increase of the pipeline is ________ percent.',[],{
      setNum:'1',notes:['Printed answer key is 33.28; preserved exactly, without replacing it with a recalculated value.'],
    }),
    question(35,2016,2,raw`Consider a 3 GHz (gigahertz) processor with a three-stage pipeline and stage latencies $\tau_1$, $\tau_2$, and $\tau_3$ such that $\tau_1=\dfrac{3\tau_2}{4}=2\tau_3$. If the longest pipeline stage is split into two pipeline stages of equal latency, the new frequency is ________ GHz, ignoring delays in the pipeline registers.`,[],{setNum:'2'}),
    question(36,2016,2,raw`Suppose the functions $F$ and $G$ can be computed in 5 and 3 nanoseconds by functional units $U_F$ and $U_G$, respectively. Given two instances of $U_F$ and two instances of $U_G$, it is required to implement the computation $F(G(X_i))$ for $1\leq i\leq10$. Ignoring all other delays, the minimum time required to complete this computation is ________ nanoseconds.`,[],{setNum:'2'}),
    question(37,2017,2,'Instruction execution in a processor is divided into 5 stages. Instruction Fetch (IF), Instruction Decode (ID), Operand Fetch (OF), Execute (EX) and Write Back (WB). These stages take 5, 4, 20, 10 and 3 nanoseconds (ns) respectively. A pipelined implementation of the processor requires buffering between each pair of consecutive stages with a delay of 2 ns. Two pipelined implementations of the processor are contemplated:\n(i) a naive pipeline implementation (NP) with 5 stages and\n(ii) an efficient pipeline (EP) where the OF stage is divided into stages OF1 and OF2 with execution times of 12 ns and 8 ns respectively.\nThe speedup (correct to two decimal places) achieved by EP over NP in executing 20 independent instructions with no hazards is ________.',[],{
      setNum:'1',notes:['Question continues from book page 272 to 273. Printed key 1.508 retained despite the question requesting two decimal places.'],
    }),
    question(38,2018,2,'The instruction pipeline of a RISC processor has the following stages. Instruction Fetch (IF), Instruction Decode (ID), Operand Fetch (OF), Perform Operation (PO) and Writeback (WB). The IF, ID, OF and WB stages take 1 clock cycle each for every instruction. Consider a sequence of 100 instructions. In the PO stage, 40 instructions take 3 clock cycles each, 35 instructions take 2 clock cycles each, and the remaining 25 instructions take 1 clock cycle each. Assume that there are no data hazards and no control hazards.\nThe number of clock cycles required for completion of execution of the sequence of instructions is ________.'),
    question(39,2020,2,'Consider a non-pipelined processor operating at 2.5 GHz. It takes 5 clock cycles to complete an instruction. You are going to make a 5-stage pipeline out of this processor. Overheads associated with pipelining force you to operate the pipelined processor at 2 GHz. In a given program, assume that 30% are memory instructions. 60% are ALU instructions and the rest are branch instructions. 5% of the memory instructions cause stalls of 50 clock cycles each due to cache misses and 50% of the branch instructions cause stalls of 2 cycles each. Assume that there are no stalls associated with the execution of ALU instructions. For this program, the speedup achieved by the pipelined processor over the non-pipelined processor (round off to 2 decimal places) is ________.'),
    question(40,2021,2,'A five-stage pipeline has stage delays of 150, 120, 150, 160 and 140 nanoseconds. The registers that are used between the pipeline stages have a delay of 5 nanoseconds each.\nThe total time to execute 100 independent instructions on this pipeline, assuming there are no pipeline stalls, is ________ nanoseconds.',[],{setNum:'1'}),
    question(41,2021,2,raw`Consider a pipelined processor with 5 stages. Instruction Fetch (IF), Instruction Decode (ID), Execute (EX), Memory Access (MEM), and Write Back (WB). Each stage of the pipeline, except the EX stage, takes one cycle. Assume that the ID stage merely decodes the instruction and the register read is performed in the EX stage. The EX stage takes one cycle for ADD instruction and two cycles for MUL instruction. Ignore pipeline register latencies. Consider the following sequence of 8 instructions:
[CODE]
Assume that every MUL instruction is data-dependent on the ADD instruction just before it and every ADD instruction (except the first ADD) is data-dependent on the MUL instruction just before it. The Speedup is defined as follows:
$$\text{Speedup}=\dfrac{\text{Execution time without operand forwarding}}{\text{Execution time with operand forwarding}}$$
The Speedup achieved in executing the given instruction sequence on the pipelined processor (rounded to 2 decimal places) is ________.`,[],{
      setNum:'2',code:'ADD, MUL, ADD, MUL,\nADD, MUL, ADD, MUL',
      notes:['Printed key 1.875 retained despite the question requesting two decimal places.'],
    }),
    question(42,2022,2,raw`A processor $X_1$ operating at 2 GHz has a standard 5-stage RISC instruction pipeline having a base CPI (cycles per instruction) of one without any pipeline hazards. For a given program P that has 30% branch instructions, control hazards incur 2 cycles stall for every branch. A new version of the processor $X_2$ operating at same clock frequency has an additional branch predictor unit (BPU) that completely eliminates stalls for correctly predicted branches. There is neither any savings nor any additional stalls for wrong predictions. There are no structural hazards and data hazards for $X_1$ and $X_2$. If the BPU has a prediction accuracy of 80%, the speed up (rounded off to two decimal places) obtained by $X_2$ over $X_1$ in executing P is ________.`),
    question(43,2023,1,'Consider a 3-stage pipelined processor having a delay of 10 ns (nanoseconds), 20 ns, and 14 ns, for the first, second, and the third stages, respectively. Assume that there is no other delay and the processor does not suffer from any pipeline hazards. Also assume that one instruction is fetched every cycle.\nThe total execution time for executing 100 instructions on this processor is ________ ns.'),
    question(44,2024,1,'Consider a 5-stage pipelined processor with Instruction Fetch (IF), Instruction Decode (ID), Execute (EX), Memory Access (MEM), and Register Writeback (WB) stages. Which of the following statements about forwarding is/are CORRECT?',[
      'Forwarding does not require any extra hardware to retrieve the data from the pipeline stages',
      'In a pipelined execution, forwarding means the result from a source stage of an earlier instruction is passed on to the destination stage of a later instruction',
      'In forwarding, data from the output of the MEM stage can be passed on to the input of the EX stage of the next instruction',
      'Forwarding cannot prevent all pipeline stalls',
    ],{setNum:'1',optLayout:'1col'}),
    question(45,2024,1,raw`An instruction format has the following structure:
Instruction Number: Opcode, destination reg, source reg-1, source reg-2
Consider the following sequence of instructions to be executed in a pipelined processor:
[CODE]
Which of the following statements is/are TRUE?`,[
      'There is a WAW dependency on R3 between I3 and I4','There is a WAR dependency on R3 between I1 and I2',
      'There is a RAW dependency on R3 between I1 and I2','There is a RAW dependency on R3 between I2 and I3',
    ],{setNum:'2',code:'I1: DIV R3, R1, R2\nI2: SUB R5, R3, R4\nI3: ADD R3, R5, R6\nI4: MUL R7, R3, R8',notes:['The is/are TRUE statement-selection question is MSQ even though the printed key selects only C.']}),
    question(46,2024,2,'A non-pipelined instruction execution unit operating at 2 GHz takes an average of 6 cycles to execute an instruction of a program P. The unit is then redesigned to operate a 5-stage pipeline at 2 GHz. Assume that the ideal throughput of the pipelined unit is 1 instruction per cycle. In the execution of program P, 20% instructions incur an average of 2 cycles stall due to data hazards and 20% instructions incur an average of 3 cycles stall due to control hazards. The speedup (rounded off to one decimal place) obtained by the pipelined design over the non-pipelined design is ________.',[],{setNum:'2'}),
  ],
};
