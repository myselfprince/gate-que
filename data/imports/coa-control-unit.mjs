const raw = String.raw;
const sourceHash = '0c3d64c73a79bac06e3c1fea0b50d842c9803af995b25f7eb457c5cdd3df9d33';
// Printed Answers table: PDF spread 3, book page 265.
const answers = ['A,B','B','C','A','A','B','D','C','B','A','A','B','D','B','B','B','B','B','D','C','C','C','D','D','5','D','10.2'];

function question(number, year, marks, text, options = [], extra = {}) {
  const bookPages = number <= 9 ? [261] : number <= 15 ? [262] : number <= 23 ? [263] : [264];
  const {notes = [], ...fields} = extra;
  return {
    id: `madeeasy-coa-control-2-${number}`, text, code: '', year: String(year), marks: String(marks), setNum: '',
    rawTopic: 'ALU Data Path and Control Unit', diagram: '', ext: '.png',
    optA: options[0] || '', optB: options[1] || '', optC: options[2] || '', optD: options[3] || '',
    natAnswer: options.length ? '' : answers[number-1], correctOptions: options.length ? answers[number-1].split(',') : [],
    questionType: !options.length ? 'NAT' : number === 1 ? 'MSQ' : 'MCQ',
    isBlank: false, isPosLocked: false, isCodeOptions: false, isProof: false,
    needsManualOptionFix: false, optLayout: 'auto', tempPaste: '', ...fields,
    source: {
      file: '4. COA/2. Control Unit Design.pdf', sha256: sourceHash, questionNumber: `2.${number}`,
      bookPages, pdfPages: [number <= 9 ? 1 : number <= 23 ? 2 : 3], answerKeyPdfPage: 3,
      notes: ['Answer key: book page 265, Answers - Control Unit Design.', ...notes],
    },
  };
}

const common16 = raw`Common Data for Q.2.16 & Q.2.17:
Consider the following data path of a CPU
[IMG_1]
The ALU, the bus and all the registers in the data path are of identical size. All operations including incrementation of the PC and the GPRs are to be carried out in the ALU. Two clock cycles are needed for memory read operation - the first one for loading address in the MAR and the next one for loading data from the memory bus into the MDR.
`;

export const CONTROL_UNIT_IMPORT = {
  subject: '4. COA', chapter: '2. Control Unit Design', sourceHash,
  questions: [
    question(1,1999,2,'RAID configurations of disks are used to provide',
      ['fault-tolerance','high speed','high data density','None of these'],
      {notes:['The printed answer key explicitly gives (a, b); stored as MSQ with both answers.']}),
    question(2,1999,2,'Arrange the following configuration for CPU in decreasing order of operating speeds: Hard wired control, vertical micro-programming, horizontal micro-programming.',[
      'Hard wired control, vertical micro-programming, horizontal micro-programming.',
      'Hard wired control, horizontal micro-programming, vertical micro-programming.',
      'Horizontal micro-programming, vertical micro-programming, Hard wired control.',
      'Vertical micro-programming, horizontal micro-programming, hard wired control.',
    ],{optLayout:'1col'}),
    question(3,2001,1,'A processor needs software interrupt to',[
      'test the interrupt system of the processor','implement co-routines',
      'obtain system services which need execution of privileged instructions','return from subroutine',
    ]),
    question(4,2001,2,raw`Consider the following data path of a simple non-pipelined CPU. The registers $A$, $B$, $A_1$, $A_2$, MDR, the bus and the ALU are 8-bit wide. SP and MAR are 16-bit registers. The MUX is of size $8\times(2:1)$ and the DEMUX is of size $8\times(1:2)$. Each memory operation takes 2 CPU clock cycles and uses MAR (Memory Address Register) and MDR (Memory Data Register). SP can be decremented locally.
[IMG_1]
The CPU instruction "push r", where $r=A$ or $B$, has the specification
$$\begin{aligned}\mathrm{M}[\mathrm{SP}]&\leftarrow r\\\mathrm{SP}&\leftarrow\mathrm{SP}-1\end{aligned}$$
How many CPU clock cycles are needed to execute the "push r" instruction?`,['2','3','4','5'],
      {diagram:'coa-control-2-4-datapath',notes:['Question continues from the left to the right column of book page 261. The diagram prints MUX 1:2 while the prose specifies MUX 8 x (2:1); both retained as printed.']}),
    question(5,2002,1,'A device employing INTR line for device interrupt puts the CALL instruction on the data bus while',
      [raw`$\overline{\mathrm{INTA}}$ is active`,'HOLD is active','READY is active','None of these']),
    question(6,2002,1,'The absolute addressing mode',[
      'the operand is inside the instruction','the address of the operand is inside the instruction',
      'the register containing the address of the operand is specified inside the instruction','the location of the operand is implicit',
    ]),
    question(7,2002,2,'Horizontal microprogramming',[
      'does not require use of signal decoders','results in larger sized microinstructions than vertical microprogramming',
      'uses one bit for each control signal','All of the above',
    ]),
    question(8,2003,1,raw`Consider an array multiplier for multiplying two $n$ bit numbers. If each gate in the circuit has a unit delay, the total delay of the multiplier is`,
      [raw`$\Theta(1)$`,raw`$\Theta(\log n)$`,raw`$\Theta(n)$`,raw`$\Theta(n^2)$`]),
    question(9,2004,1,raw`What is the minimum size of ROM required to store the complete truth table of an $8\text{-bit}\times8\text{-bit}$ multiplier?`,
      [raw`$32\ \mathrm{K}\times16$ bits`,raw`$64\ \mathrm{K}\times16$ bits`,raw`$16\ \mathrm{K}\times32$ bits`,raw`$64\ \mathrm{K}\times32$ bits`]),
    question(10,2004,2,raw`A CPU has only three instructions I1, I2 and I3, which use the following signals in time steps T1-T5:
$$\begin{array}{c|lllll}&\mathrm{T1}&\mathrm{T2}&\mathrm{T3}&\mathrm{T4}&\mathrm{T5}\\\hline
\mathrm{I1}&\mathrm{Ain,Bout,Cin}&\mathrm{PCout,Bin}&\mathrm{Zout,Ain}&\mathrm{PCin,Bout}&\mathrm{End}\\
\mathrm{I2}&\mathrm{Cin,Bout,Din}&\mathrm{Aout,Bin}&\mathrm{Zout,Ain}&\mathrm{Bin,Cout}&\mathrm{End}\\
\mathrm{I3}&\mathrm{Din,Aout}&\mathrm{Ain,Bout}&\mathrm{Zout,Ain}&\mathrm{Dout,Ain}&\mathrm{End}\end{array}$$
Which of the following logic functions will generate the hardwired control for the signal Ain?`,[
      '$T1.I1 + T2.I3 + T4.I3 + T3$','$ (T1 + T2 + T3).I3 + T1.I1 $',
      '$(T1 + T2).I1 + (T2 + T4).I3 + T3$','$(T1 + T2).I2 + (T1 + T3).I1 + T3$',
    ],{optLayout:'1col',notes:['Signal schedule transposed into an editable LaTeX table; all printed signal/time-step pairs retained.']}),
    question(11,2005,1,'Normally user programs are prevented from handling I/O directly by I/O instructions in them. For CPUs having explicit I/O instructions, such I/O protection is ensured by having the I/O instructions privileged. In a CPU with memory mapped I/O, there is no explicit I/O instruction. Which one of the following is true for a CPU with memory mapped I/O?',[
      'I/O protection is ensured by operating system routine(s)','I/O protection is ensured by a hardware trap',
      'I/O protection is ensured during system configuration','I/O protection is not possible',
    ],{notes:['Source prints "hangling" for "handling"; spelling normalized without changing meaning.']}),
    question(12,2005,1,'Which one of the following is true for a CPU having a single interrupt request line and a single interrupt grant line?',[
      'Neither vectored interrupt nor multiple interrupting devices are possible',
      'Vectored interrupts are not possible but multiple interrupting devices are possible',
      'Vectored interrupts and multiple interrupting devices are both possible',
      'Vectored interrupt is possible but multiple interrupting devices are not possible',
    ],{optLayout:'1col',notes:['Printed answer B retained; no replacement by an independently inferred answer.']}),
    question(13,2005,2,raw`A hardwired CPU uses 10 control signals S1 to S10 in various time steps T1 to T5 to implement 4 instructions I1 to I4 as shown below:
$$\begin{array}{c|ccccc}&\mathrm{T1}&\mathrm{T2}&\mathrm{T3}&\mathrm{T4}&\mathrm{T5}\\\hline
\mathrm{I1}&\mathrm{S1,S3,S5}&\mathrm{S2,S4,S6}&\mathrm{S1,S7}&\mathrm{S10}&\mathrm{S3,S8}\\
\mathrm{I2}&\mathrm{S1,S3,S5}&\mathrm{S8,S9,S10}&\mathrm{S5,S6,S7}&\mathrm{S6}&\mathrm{S10}\\
\mathrm{I3}&\mathrm{S1,S3,S5}&\mathrm{S7,S8,S10}&\mathrm{S2,S6,S9}&\mathrm{S10}&\mathrm{S1,S3}\\
\mathrm{I4}&\mathrm{S1,S3,S5}&\mathrm{S2,S6,S7}&\mathrm{S5,S10}&\mathrm{S6,S9}&\mathrm{S10}\end{array}$$
Which of the following pairs of expressions represent the circuit for generating control signals S5 and S10 respectively [$(Ij+Ik)Tn$ indicates that the control signal should be generated in time step Tn if the instruction being executed is Ij or Ik]?`,[
      '$S5=T1+I2.T3$ and $S10=(I1+I3).T4+(I2+I4).T5$',
      '$S5=T1+(I2+I4).T3$ and $S10=(I1+I3).T4+(I2+I4).T5$',
      '$S5=T1+(I2+I4).T3$ and $S10=(I2+I3+I4).T2+(I1+I3).T4+(I2+I4).T5$',
      '$S5=T1+(I2+I4).T3$ and $S10=(I2+I3).T2+I4.T3+(I1+I3).T4+(I2+I4).T5$',
    ],{optLayout:'1col'}),
    question(14,2005,2,raw`A line L in a circuit is said to have a stuck-at-0 fault if the line permanently has a logic value 0. Similarly a line L in a circuit is said to have a stuck-at-1 fault if the line permanently has a logic value 1. A circuit is said to have a multiple stuck-at fault if one or more lines have stuck at faults. The total number of distinct multiple stuck-at faults possible in a circuit with N lines is`,
      ['$3^N$','$3^N-1$','$2^N-1$','$2^N$']),
    question(15,2005,2,'An instruction set of a processor has 125 signals which can be divided into 5 groups of mutually exclusive signals as follows:\nGroup 1: 20 signals, Group 2: 70 signals, Group 3: 2 signals, Group 4: 10 signals, Group 5: 23 signals.\nHow many bits of the control words can be saved by using vertical microprogramming over horizontal microprogramming?',
      ['0','103','22','55']),
    question(16,2005,2,common16+raw`The instruction "add R0, R1" has the register transfer interpretation $R0\leftarrow R0+R1$. The minimum number of clock cycles needed for the execution cycle of this instruction is`,
      ['2','3','4','5'],{diagram:'coa-control-2-16-17-datapath'}),
    question(17,2005,2,common16+raw`The instruction "call Rn, sub" is a two word instruction. Assuming that PC is incremented during the fetch cycle of the first word of the instruction, its register transfer interpretation is
$$\begin{aligned}\mathrm{Rn}&\leftarrow\mathrm{PC}+1;\\\mathrm{PC}&\leftarrow\mathrm{M}[\mathrm{PC}];\end{aligned}$$
The minimum number of CPU clock cycles needed during the execution cycle of this instruction is`,
      ['2','3','4','5'],{diagram:'coa-control-2-16-17-datapath'}),
    question(18,2007,2,raw`The floating point unit of a processor using a design D takes $2t$ cycles compared to $t$ cycles taken by the fixed point unit. There are two more design suggestions D1 and D2. D1 uses 30% more cycles for fixed point unit but 30% less cycles for floating point unit as compared to D. D2 uses 40% less cycles for fixed point unit but 10% more cycles for floating point unit as compared to design D. For a given program which has 80% fixed point operations and 20% floating point operations, which of the following ordering reflects the relative performances of three designs? (Di > Dj denotes that Di is faster than Dj)`,
      ['$D1>D>D2$','$D2>D>D1$','$D1>D2>D$','$D>D1>D2$']),
    question(19,2008,2,'Consider a CPU where all the instructions require 7 clock cycles to complete execution. There are 140 instructions in the instruction set. It is found that 125 control signals are needed to be generated by the control unit. While designing the horizontal micro-programmed control unit, single address field format is used for branch control logic. What is the minimum size of the control word and control address register?',
      ['125, 7','125, 10','135, 9','135, 10']),
    question(20,2008,2,'Which of the following is/are true of the auto increment addressing mode?\n1. It is useful in creating self relocating code\n2. If it is included in an Instruction Set Architecture, then an additional ALU is required for effective address calculation.\n3. The amount of increment depends on the size of the data item accessed.',
      ['1 only','2 only','3 only','2 and 3 only']),
    question(21,2008,2,'The use of multiple register windows with overlap causes a reduction in the number of memory accesses for\n1. function locals and parameters\n2. register saves and restores\n3. instruction fetches',
      ['1 only','2 only','3 only','1, 2 and 3'],{notes:['Printed answer C retained exactly as supplied in the book answer key.']}),
    question(22,2009,1,'A CPU generally handles an interrupt by executing an interrupt service routine',[
      'as soon as an interrupt is raised','by checking the interrupt register at the end of each cycle',
      'by checking the interrupt register after finishing the execution of the current instruction',
      'by checking the interrupt register at fixed time intervals',
    ]),
    question(23,2012,1,'The amount of ROM needed to implement a 4 bit multiplier is',
      ['64 bits','128 bits','1 Kbits','2 Kbits']),
    question(24,2013,2,raw`Consider the following sequence of micro operations.
$$\begin{aligned}\mathrm{MBR}&\leftarrow\mathrm{PC}\\\mathrm{MAR}&\leftarrow\mathrm{X}\\\mathrm{PC}&\leftarrow\mathrm{Y}\\\mathrm{Memory}&\leftarrow\mathrm{MBR}\end{aligned}$$
Which one of the following is a possible operation performed by this sequence`,
      ['Instruction fetch','Operand fetch','Conditional branch','Initiation of interrupt service']),
    question(25,2020,1,'A multiplexer is placed between a group of 32 registers and an accumulator to regulate data movement such that at any given point in time the content of only one register will move to the accumulator, The minimum number of select lines needed for the multiplexer is ________.'),
    question(26,2020,1,raw`Consider the following data path diagram:
[IMG_1]
Consider an instruction: $R0\leftarrow R1+R2$. The following steps are used to execute it over the given data path. Assume that PC is incremented appropriately. The subscripts $r$ and $w$ indicate read and write operations, respectively.
$$\begin{array}{rl}1.&\mathrm{R2}_r,\mathrm{TEMP1}_r,\mathrm{ALU}_{\mathrm{add}},\mathrm{TEMP2}_w\\
2.&\mathrm{R1}_r,\mathrm{TEMP1}_w\\
3.&\mathrm{PC}_r,\mathrm{MAR}_w,\mathrm{MEM}_r\\
4.&\mathrm{TEMP2}_r,\mathrm{R0}_w\\
5.&\mathrm{MDR}_r,\mathrm{IR}_w\end{array}$$
Which one of the following is the correct order of execution of the above steps?`,
      ['3, 5, 1, 2, 4','2, 1, 4, 5, 3','1, 2, 4, 3, 5','3, 5, 2, 1, 4'],
      {diagram:'coa-control-2-26-datapath',notes:['Question and step list continue across the two columns of book page 264.']}),
    question(27,2023,1,raw`A keyboard connected to a computer is used at a rate of 1 keystroke per second. The computer system polls the keyboard every 10 ms (milli seconds) to check for a keystroke and consumes $100\ \mu\mathrm{s}$ (micro seconds) for each poll. If it is determined after polling that a key has been pressed, the system consumes an additional $200\ \mu\mathrm{s}$ to process the keystroke. Let $T_1$ denote the fraction of a second spent in polling and processing a keystroke.
In an alternative implementation, the system uses interrupts instead of polling. An interrupt is raised for every keystroke. It takes a total of 1 ms for servicing an interrupt and processing a keystroke. Let $T_2$ denote the fraction of a second spent in servicing the interrupt and processing a keystroke.
The ratio $\dfrac{T_1}{T_2}$ is ________. (Rounded off to one decimal place)`),
  ],
};
