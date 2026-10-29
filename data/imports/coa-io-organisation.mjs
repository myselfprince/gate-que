const raw = String.raw;
const sourceHash = '2206ec80774b9fdf9dc4d6593efd04fad40891a0fe152768b536b4d767d97d1e';
// Visually checked against the answer table on PDF page 3, book page 307.
// 5.7 says "Sol." in the table; the supplied explanation explicitly lists a,b,c,d.
const answers = ['30','A','C','B','C','D','A,B,C,D','A','D','C','D','A','B','B','B','C','D','A','B','D','C','C','C','B','A','D','14020','6.1','456','A','80000','A','C','B'];

function question(number, year, marks, text, options = [], extra = {}) {
  const bookPages = number <= 9 ? [303] : number <= 19 ? [304] : number === 20 ? [304,305]
    : number <= 27 ? [305] : number === 28 ? [305,306] : [306];
  const {notes = [], ...fields} = extra;
  return {
    id: `madeeasy-coa-io-5-${number}`, text, code: '', year: String(year), marks: String(marks), setNum: '',
    examPaper: 'CS', rawTopic: 'IO Organisation', diagram: '', ext: '.png',
    optA: options[0] || '', optB: options[1] || '', optC: options[2] || '', optD: options[3] || '',
    natAnswer: options.length ? '' : answers[number-1], correctOptions: options.length ? answers[number-1].split(',') : [],
    questionType: !options.length ? 'NAT' : number === 7 ? 'MSQ' : 'MCQ',
    isBlank: false, isPosLocked: false, isCodeOptions: false, isProof: false,
    needsManualOptionFix: false, optLayout: 'auto', tempPaste: '', ...fields,
    source: {
      file: '4. COA/5. IO Organisation.pdf', sha256: sourceHash, questionNumber: `5.${number}`,
      bookPages, pdfPages: number <= 9 ? [1] : number <= 27 ? [2] : number === 28 ? [2,3] : [3],
      answerKeyPdfPage: 3,
      notes: ['Answer key: PDF page 3, book page 307, Answers - IO Organization.', ...notes],
    },
  };
}

const linked11 = `Linked Answer Questions 5.11 and 5.12:
A disk has 8 equidistant tracks. The diameters of the innermost and outermost tracks are 1 cm and 8 cm respectively. The innermost track has a storage capacity of 10 MB.
`;
const common22 = raw`Common Data for Q.5.22 and Q.5.23:
A hard disk has 63 sectors per track, 10 platters each with 2 recording surfaces and 1000 cylinders. The address of a sector is given as a triple $\langle c,h,s\rangle$, where $c$ is the cylinder number, $h$ is the surface number and $s$ is the sector number. Thus, the $0^{\text{th}}$ sector is addressed as $\langle0,0,0\rangle$, the $1^{\text{st}}$ sector as $\langle0,0,1\rangle$, and so on.
`;

export const IO_ORGANISATION_IMPORT = {
  subject: '4. COA', chapter: '5. IO Organisation', sourceHash,
  questions: [
    question(1,1995,2,'If the disk is rotating at 3600 rpm, determine the effective data transfer rate which is defined as the number of bytes transferred per second between disk and memory. (Given size of track = 512 bytes)',[],{
      notes:['The printed numeric key is 30; the supplied explanation labels this as 30 Kbps. The stem asks for bytes per second. Stored the printed numeric key without inventing a replacement value or NAT range; source units are inconsistent.','Historical numerical question with no supplied options; represented as NAT.'],
    }),
    question(2,1996,1,'For the daisy chain scheme of connecting I/O devices, which of the following statements is true?',[
      'It gives non-uniform priority to various devices','It gives uniform priority to all devices',
      'It is only useful for connecting slow devices to a processor device','It requires a separate interrupt pin on the processor for each device',
    ],{optLayout:'1col'}),
    question(3,1996,2,'A micro program control unit is required to generate a total of 25 control signals. Assume that during any microinstruction at most two control signals are active. Minimum number of bits required in the control word to generate the required control signal',
      ['2','25','10','12']),
    question(4,1997,1,raw`The correct matching for the following pairs is
$$\begin{array}{ll}
\text{A. DMA I/O}&\text{1. High speed RAM}\\
\text{B. Cache}&\text{2. Disk}\\
\text{C. Interrupt I/O}&\text{3. Printer}\\
\text{D. Condition code Register}&\text{4. ALU}
\end{array}$$
Codes:`,[
      '$A-4, B-3, C-1, D-2$','$A-2, B-1, C-3, D-4$',
      '$A-4, B-3, C-2, D-1$','$A-2, B-3, C-4, D-1$',
    ],{notes:['Matching table preserved as editable LaTeX.']}),
    question(5,1997,1,'I/O redirection',[
      'implies changing the name of a file','can be employed to use an existing file as input file for a program',
      'implies connection 2 programs through a pipe','None of the above',
    ],{notes:['Printed answer C retained exactly; source wording is not silently corrected.']}),
    question(6,1998,2,'Formatting of floppy disk refers to',[
      'arranging the data on the disk in contiguous fashion','writing the directory','erasing the system area',
      'writing identification information on all tracks and sectors',
    ],{notes:['Options C and D continue at the top of the next column of book page 303.']}),
    question(7,1999,2,'The main differences(s) between a CISC and A RISC processor is/are that a RISC processor typically',[
      'has fewer instructions','has fewer addressing modes','has more registers','is easier to implement using hard-wired control logic',
    ],{notes:['Answer table refers to Sol.; the supplied explanation on book page 307 explicitly lists (a), (b), (c), (d). Stored as MSQ with all four correct options.']}),
    question(8,2004,2,raw`The microinstructions stored in the control memory of a processor have a width of 26 bits. Each microinstruction is divided into three fields: a micro-operation field of 13 bits, a next address field ($X$), and a MUX select field ($Y$). There are 8 status bits in the inputs of the MUX.
[IMG_1]
How many bits are there in the $X$ and $Y$ fields, and what is the size of the control memory in number of words?`,
      ['10, 3, 1024','8, 5, 256','5, 8, 2048','10, 3, 512'],{diagram:'coa-io-5-8-control-memory',notes:['Diagram cropped from the supplied scan; surrounding prose remains editable text.']}),
    question(9,2004,2,'A hard disk with a transfer rate of 10 M bytes/second is constantly transferring data to memory using DMA. The processor runs at 600 MHz, and takes 300 and 900 clock cycles to initiate and complete DMA transfer respectively. If the size of the transfer is 20 Kbytes, what is the percentage of processor time consumed for the transfer operation?',
      ['5.0%','1.0%','0.5%','0.1%'],{notes:['Printed answer D retained. The supplied explanation also contains an intermediate 0.19% before its final 0.10%; no independently inferred answer substituted.']}),
    question(10,2004,2,raw`The storage area of a disk has innermost diameter of 10 cm and outermost diameter of 20 cm. The maximum storage density of the disk is 1400 bits/cm. The disk rotates at a speed of 4200 RPM. The main memory of a computer has 64-bit word length and $1\ \mu\text{s}$ cycle time. If cycle stealing is used for data transfer from the disk, the percentage of memory cycles stolen for transferring one word is`,
      ['0.5%','1%','5%','10%']),
    question(11,2005,2,linked11+'What is the total amount of data that can be stored on the disk if it is used with a drive that rotates it with (i) Constant Linear Velocity (ii) Constant Angular Velocity?',[
      '(i) 80 MB (ii) 2040 MB','(i) 2040 MB (ii) 80 MB','(i) 80 MB (ii) 360 MB','(i) 360 MB (ii) 80 MB',
    ],{optLayout:'1col',notes:['Shared passage for linked questions 5.11 and 5.12 repeated so the question can be exported independently.']}),
    question(12,2005,2,linked11+raw`If the disk has 20 sectors per track and is currently at the end of the $5^{\text{th}}$ sector of the inner-most track and the head can move at a speed of 10 meters/sec and it is rotating at constant angular velocity of 6000 RPM, how much time will it take to read 1 MB contiguous data starting from the sector 4 of the outer-most track?`,
      ['13.5 ms','10 ms','9.5 ms','20 ms'],{notes:['Shared passage for linked questions 5.11 and 5.12 retained in full.']}),
    question(13,2005,1,'What is the swap space in the disk used for?',[
      'Saving temporary html pages','Saving process data','Storing the superblock','Storing device drivers',
    ]),
    question(14,2005,2,raw`A device with data transfer rate 10 KB/sec is connected to a CPU. Data is transferred byte-wise. Let the interrupt overhead be $4\ \mu\text{sec}$. The byte transfer time between the device interface register and CPU or memory is negligible. What is the minimum performance gain of operating the device under interrupt mode over operating it under program controlled mode?`,
      ['15','25','35','45']),
    question(15,2005,2,'Consider a disk drive with the following specifications.\n16 surfaces, 512 tracks/surface, 512 sectors/track, 1 KB/sector, rotation speed 3000 rpm. The disk is operated in cycle stealing mode whereby whenever one byte word is ready it is sent to memory; similarly, for writing, the disk interface reads a 4 byte word from the memory in each DMA cycle. Memory cycle time is 40 nsec. The maximum percentage of time that the CPU gets blocked during DMA operation is',
      ['10','25','40','50'],{notes:['The printed "one byte word" read wording and "4 byte word" write wording are both preserved.']}),
    question(16,2006,1,'Which of the following DMA transfer modes and interrupt handling mechanisms will enable the highest I/O band-width?',[
      'Transparent DMA and Polling interrupts','Cycle-stealing and Vectored interrupts',
      'Block transfer and Vectored interrupts','Block transfer and Polling interrupts',
    ],{optLayout:'1col'}),
    question(17,2007,1,'Which of the following systems is a most likely candidate example of a pipe and filter architecture?',[
      'Expert system','DB repository','Aircraft flight controller','Signal processing',
    ]),
    question(18,2007,1,'Consider a disk pack with 16 surfaces, 128 tracks per surface and 256 sectors per track. 512 bytes of data are stored in a bit serial manner in a sector. The capacity of the disk pack and the number of bits required to specify a particular sector in the disk are respectively',
      ['256 Mbyte, 19 bits','256 Mbyte, 28 bits','512 Mbyte, 20 bits','64 Gbyte, 28 bits']),
    question(19,2007,2,'Consider a Direct Mapped Cache with 8 cache blocks (numbered 0-7). If the memory block requests are in the following order 3, 5, 2, 8, 0, 63, 9, 16, 20, 17, 25, 18, 30, 24, 2, 63, 5, 82, 17, 24. Which of the following memory blocks will not be in the cache at the end of the sequence?',
      ['3','18','20','30']),
    question(20,2007,2,raw`A hard disk system has the following parameters:
Number of tracks = 500
Number of sectors/track = 100
Number of bytes/sector = 500
Time taken by the head to move from one track to adjacent track = 1 ms
Rotation speed = 600 rpm.
What is the average time taken for transferring 250 bytes from the disk?`,
      ['300.5 ms','255.5 ms','255 ms','300 ms'],{notes:['Question continues from book page 304, right column, to book page 305, left column.']}),
    question(21,2008,2,'For a magnetic disk with concentric circular tracks, the latency is not linearly proportional to the seek distance due to',[
      'non-uniform distribution of requests','arm starting and stopping inertia',
      'higher capacity of tracks on the periphery of the platter','use of unfair arm scheduling policies.',
    ],{notes:['Printed answer C retained as source evidence. It appears inconsistent with the stem (option B describes arm inertia); no external or inferred correction applied.']}),
    question(22,2009,2,common22+raw`The address $\langle400,16,29\rangle$ corresponds to sector number:`,
      ['505035','505036','505037','505038'],{notes:['Common data for 5.22 and 5.23 repeated in full.']}),
    question(23,2009,2,common22+raw`The address of $1039^{\text{th}}$ sector is`,[
      raw`$\langle0,15,31\rangle$`,raw`$\langle0,16,30\rangle$`,raw`$\langle0,16,31\rangle$`,raw`$\langle0,17,31\rangle$`,
    ],{notes:['Common data for 5.22 and 5.23 repeated in full.']}),
    question(24,2011,2,'An application loads 100 libraries at start-up. Loading each library requires exactly one disk access. The seek time of the disk to a random location is given as 10 ms. Rotational speed of the disk is 6000 rpm. If all 100 libraries are loaded from random locations on the disk, how long does it take to load all libraries? (The time to transfer data from the disk block once the head has been positioned at the start of the block may be neglected.)',
      ['0.50 s','1.50 s','1.25 s','1.00 s']),
    question(25,2011,2,raw`On a non-pipelined sequential processor, a program segment, which is a part of the interrupt service routine, is given to transfer 500 bytes from an I/O device to memory.
[CODE]
Assume that each statement in this program is equivalent to a machine instruction which takes one clock cycle to execute if it is a non-load/store instruction. The load-store instructions take two clock cycles to execute.
The designer of the system also has an alternate approach of using the DMA controller to implement the same transfer. The DMA controller requires 20 clock cycles for initialization and other overhead. Each DMA transfer cycle takes two clock cycles to transfer one byte of data from interrupt driven program based input-output?`,
      ['3.4','4.4','5.1','6.7'],{
        code:'Initialize the address register\nInitialize the count to 500\nLOOP: Load a byte from device\nStore in memory at address given by address register\nIncrement the address register\nDecrement the court\nIf count != 0 go to LOOP',
        notes:['Question continues across columns on book page 305; program is stored separately in code.','Source typo "Decrement the court" retained as printed.','Unresolved source wording: the final sentence ends "from interrupt driven program based input-output?" and omits the explicit comparison being asked. Retained exactly; did not invent a speedup prompt. Printed answer A (3.4) retained.'],
      }),
    question(26,2013,2,raw`Consider a hard disk with 16 recording surfaces (0-15) having 16384 cylinders (0-16383) and each cylinder contain 64 sectors (0-63). Data storage capacity in each sector is 512 bytes. Data are organized cylinder-wise and addressing format is $\langle\text{cylinder no., surface no., sector no.}\rangle$. A file of size 42797 KB is stored in the disk and the starting disk location of the file is $\langle1200,9,40\rangle$. What is the cylinder number of the last sector of the file, if it is stored in a contiguous manner?`,
      ['1281','1282','1283','1284']),
    question(27,2015,2,'Consider a disk pack with a seek time of 4 milliseconds and rotational speed of 10000 rotations per minute (RPM). It has 600 sectors per track and each sector can store 512 bytes of data. Consider a file stored in the disk. The file contains 2000 sectors. Assume that every sector access necessitates a seek, and the average rotational latency for accessing each sector is half of the time for one complete rotation. The total time (in milliseconds) needed to read the entire file is ______.',
      [],{setNum:'1'}),
    question(28,2015,2,raw`Consider a typical disk that rotates at 15000 rotations per minute (RPM) and has a transfer rate of $50\times10^6$ bytes/sec. If the average seek time of the disk is twice the average rotational delay and the controller's transfer time is 10 times the disk transfer time, the average time (in milliseconds) to read or write a 512 byte sector of the disk is ______.`,
      [],{setNum:'2',notes:['Question continues from PDF page 2/book page 305 to PDF page 3/book page 306.']}),
    question(29,2016,2,'The size of the data count register of a DMA controller is 16 bits. The processor needs to transfer a file of 29,154 kilobytes from disk to main memory. The memory is byte addressable. The minimum number of times the DMA controller needs to get the control of the system bus from the processor to transfer the file from the disk to main memory is ______.',
      [],{setNum:'1'}),
    question(30,2020,1,`Consider the following statements:
I. Daisy chaining is used to assign priorities in attending interrupts.
II. When a device raises a vectored interrupt, the CPU does polling to identify the source of interrupt.
III. In polling, the CPU periodically checks the status bits to know if any device needs its attention.
IV. During DMA, both the CPU and DMA controller can be bus masters at the same time.
Which of the above statements is/are TRUE?`,
      ['I and III only','I and II only','III only','I and IV only']),
    question(31,2021,1,'Consider a computer system with DMA support. The DMA module is transferring one 8-bit character in one CPU cycle from a device to memory through cycle stealing at regular intervals. Consider a 2 MHz processor. If 0.5% processor cycles are used for DMA, the data transfer rate of the device is ______ bits per second.',
      [],{setNum:'2'}),
    question(32,2022,1,'Which one of the following facilitates transfer of bulk data from hard disk to main memory with the highest throughput?',[
      'DMA based I/O transfer','Interrupt driven I/O transfer','Polling based I/O transfer','Programmed I/O transfer',
    ]),
    question(33,2024,1,'Which one of the following statements is FALSE?',[
      'In the cycle stealing mode of DMA, one word of data is transferred between an I/O device and main memory in a stolen cycle',
      'The CPU can start executing an interrupt service routine faster with vectored interrupts than with non-vectored interrupts',
      'Programmed I/O mechanism has a better CPU utilization than the interrupt driven I/O mechanism',
      'For bulk data transfer, the burst mode of DMA has a higher throughput than the cycle stealing mode',
    ],{setNum:'1',optLayout:'1col'}),
    question(34,2024,1,'Consider a computer with a 4 MHz processor. Its DMA controller can transfer 8 bytes in 1 cycle from a device to main memory through cycle stealing at regular intervals. Which one of the following is the data transfer rate (in bits per second) of the DMA controller if 1% of the processor cycles are used for DMA?',
      ['3,200','25,60,000','32,000','2,56,000'],{setNum:'2'}),
  ],
};
