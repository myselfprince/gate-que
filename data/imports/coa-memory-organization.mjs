const raw = String.raw;
const sourceHash = 'e1b88198e1018531aee17191441bfe1c70efd30be87a44b1f08a771b14af5bfd';

function question(number, year, marks, text, options = [], extra = {}) {
  const {notes = [], ...fields} = extra;
  let bookPages = [number <= 12 ? 281 : number <= 21 ? 282 : number <= 29 ? 283 : number <= 40 ? 284 : number <= 50 ? 285 : number <= 59 ? 286 : number <= 68 ? 287 : number <= 72 ? 288 : 289];
  if (number === 12) bookPages = [281,282];
  if ([20,21].includes(number)) bookPages = [282,283];
  if ([30,31].includes(number)) bookPages = [283,284];
  if (number === 40) bookPages = [284,285];
  return {
    id: `madeeasy-coa-memory-4-${number}`, text, code: '', year: String(year), marks: String(marks), setNum: '',
    rawTopic: 'Cache Memory', diagram: '', ext: '.png',
    optA: options[0] || '', optB: options[1] || '', optC: options[2] || '', optD: options[3] || '',
    natAnswer: '', correctOptions: [], questionType: !options.length ? 'NAT' : [3,68,70,73].includes(number) ? 'MSQ' : 'MCQ',
    isBlank: false, isPosLocked: false, isCodeOptions: false, isProof: false,
    needsManualOptionFix: false, optLayout: 'auto', tempPaste: '', ...fields,
    source: {
      file: '4. COA/4. Memory Organization.pdf', sha256: sourceHash, questionNumber: `4.${number}`,
      bookPages, pdfPages: [...new Set(bookPages.map(page => Math.floor((page-280)/2)+1))],
      answerKeyPdfPage: null, answerKeyStatus: 'not-supplied',
      notes: ['The supplied five-spread PDF ends at Q4.74 (book page 289); no answer key or explanations for this chapter are supplied. Answer intentionally left empty.', ...notes],
    },
  };
}

const common18 = raw`Common Data for Q.4.18 & Q.4.19:
Consider two cache organizations: The first one is 32 KB 2-way set associative with 32-byte block size. The second one is of the same size but direct mapped. The size and address is 32 bits in both cases. A 2-to-1 multiplexer has latency of 0.6 ns while a $k$-bit comparator has a latency of $k/10$ ns. The hit latency of the set associative organization is $h_1$ while that of the direct mapped one is $h_2$.
`;
const common20 = raw`Common Data for Q.4.20 & Q.4.21:
A CPU has a 32 KB direct mapped cache with 128-byte block size. Suppose $A$ is a two dimensional array of size $512\times512$ with elements that occupy 8-bytes each. Consider the following two C code segments, $\mathrm{P}_1$ and $\mathrm{P}_2$.
[CODE]
P1 and P2 are executed independently with the same initial state, namely, the array $A$ is not in the cache and $i$, $j$, $x$ are in registers. Let the number of cache misses experienced by P1 be $M_1$ and that for P2 be $M_2$.
`;
const code20 = `P1: for (i = 0; i < 512; i++) {
      for (j = 0; j < 512; j++) {
        x += A[i][j];
      }
    }
P2: for (i = 0; i < 512; i++) {
      for (j = 0; j < 512; j++) {
        x += A[j][i];
      }
    }`;
const common23 = raw`Common Data for Q.4.23 & Q.4.24:
Consider a machine with a byte addressable main memory of $2^{16}$ bytes. Assume that a direct mapped data cache consisting of 32 lines of 64 bytes each is used in the system. A $50\times50$ two-dimensional array of bytes is stored in the main memory starting from memory location 1100 H. Assume that the data cache is initially empty. The complete array is accessed twice. Assume that the contents of the data cache do not change in between the two accesses.
`;
const common25 = `Common Data for Q.4.25 & Q.4.26:
Consider a computer with a 4-ways set-associative mapped cache of the following characteristics: a total of 1 MB of main memory, a word size of 1 byte, a block size of 128 words and a cache size of 8 KB.
`;
const common29 = raw`Common Data for Q.4.29 to 4.30:
Consider a machine with a 2-way set associative data cache of size 64 Kbytes and block size 16 bytes. The cache is managed using 32 bit virtual addresses and the page size is 4 Kbytes. A program to be run on this machine begins as follows:
[CODE]
The size of double is 8 bytes. Array APR is in memory starting at the beginning of virtual page 0xFF000 and stored in row major order. The cache is initially empty and no pre-fetching is done. The only data memory references made by the program are those to array APR.
`;
const code29 = `double APR[1024][1024];
int i, j;
/* Initialize array APR to 0.0 */
for (i = 0; i < 1024; i++)
  for (j = 0; j < 1024; j++)
    APR[i][j] = 0.0;`;
const common35 = `Common Data for Q.4.35 & Q.4.36:
A computer system has an L1 and L2 cache, an L2 cache, and a main memory unit connected as shown below. The block size in L1 cache is 4 words. The block size in L2 cache is 16 words. The memory access times are 2 nanoseconds, 20 nanoseconds and 200 nanoseconds for L1 cache, L2 cache and main memory unit respectively.
[IMG_1]
`;
const common38 = `Linked Answer Q.4.38 & Q.4.39:
A computer has a 256 Kbyte, 4-way set associative, write back data cache with block size of 32 Bytes. The processor sends 32 bit addresses to the cache controller. Each cache tag directory entry contains, in addition to address tag, 2 valid bits, 1 modified bit and 1 replacement bit.
`;

export const MEMORY_ORGANIZATION_IMPORT = {
  subject: '4. COA', chapter: '4. Memory Organization', sourceHash,
  questions: [
    question(1,1995,1,'The principle of locality justifies the use of', ['Interrupts','DMA','Polling','Cache Memory']),
    question(2,1999,1,raw`The main memory of a computer has $2cm$ blocks while the cache has $2c$ blocks. If the cache uses the set associative mapping scheme with 2 blocks per set, then block $k$ of the main memory maps to the set`,[
      raw`$(k\bmod m)$ of the cache`,raw`$(k\bmod c)$ of the cache`,raw`$(k\bmod 2c)$ of the cache`,raw`$(k\bmod 2cm)$ of the cache`,
    ],{notes:['The printed capacity is 2cm (a product, not a superscript); retained as printed.']}),
    question(3,1999,2,'Which of the following is/are advantage of virtual memory?',[
      'Faster access to memory on an average.','Processes can be given protected address spaces.',
      'Linker can assign addresses independent of where the program will be loaded in physical memory.',
      'Programs larger than the physical memory size can be run.',
    ],{notes:['Multiple-selection wording is/are retained; classified MSQ, with no answer inferred.']}),
    question(4,2000,2,'A graphics card has on board memory of 1 MB. Which of the following modes can the card not support?',[
      raw`$1600\times400$ resolution with 256 colours on a 17 inch monitor`,
      raw`$1600\times400$ resolution with 16 million colours on a 14 inch monitor`,
      raw`$800\times400$ resolution with 16 million colours on a 17 inch monitor`,
      raw`$800\times800$ resolution with 256 colours on a 14 inch monitor`,
    ]),
    question(5,2001,1,'Which of the following requires a device driver?', ['Register','Cache','Main memory','Disk']),
    question(6,2001,1,'More than one word are put in one cache block to',[
      'exploit the temporal locality of reference in a program','exploit the spatial locality of reference in a program','reduce the miss penalty','None of the above',
    ]),
    question(7,2001,1,'Which of the following statements is false?',[
      'Virtual memory implements the translation of a program’s address space into physical memory address space',
      'Virtual memory allows each program to exceed the size of the primary memory',
      'Virtual memory increases the degree of multiprogramming','Virtual memory reduces the context switching overhead',
    ]),
    question(8,2002,1,'Which of the following is not a form of memory?', ['Instruction cache','Instruction Register','Instruction opcode','Translation look aside buffer']),
    question(9,2004,1,'Consider a system with 2 level cache. Access times of Level 1 cache, Level 2 cache and main memory are 1 ns, 10 ns, and 500 ns, respectively. The hit rates of Level 1 and Level 2 caches are 0.8 and 0.9, respectively. What is the average access time of the system ignoring the search time within the cache?', ['13.0 ns','12.8 ns','12.6 ns','12.4 ns']),
    question(10,2004,2,'Consider a small two-way set-associative cache memory, consisting of four blocks. For choosing the block to be replaced, use the least recently used (LRU) scheme. The number of cache misses for the following sequence of block addresses is\n8, 12, 0, 12, 8', ['2','3','4','5']),
    question(11,2005,1,'A dynamic RAM has a memory cycle time of 64 nsec. It has to be refreshed 100 times per msec and each refresh takes 100 nsec. What percentage of the memory cycle time is used for refreshing?', ['10','6.4','1','0.64']),
    question(12,2005,1,'Increasing the RAM of a computer typically improves performance because', ['Virtual memory increases','Larger RAMs are faster','Fewer page faults occur','Fewer segmentation faults occur'],{notes:['Options (c) and (d), and exam metadata, continue on PDF spread 2 / book page 282.']}),
    question(13,2005,2,'Consider a direct mapped cache of size 32 KB with block size 32 bytes. The CPU generates 32 bit addresses. The number of bits needed for cache indexing and the number of tag bits are respectively', ['10, 17','10, 22','15, 17','5, 17']),
    question(14,2005,2,'Consider a 2-way set associative cache memory with 4 sets and total 8 cache blocks (0-7) and a main memory with 128 blocks (0-127). What memory blocks will be present in the cache after the following sequence of memory block references if LRU policy is used for cache block replacement. Assuming that initially the cache did not have any memory block from the current job?\n0 5 3 9 7 0 16 55', ['0 3 5 7 16 55','0 3 5 7 9 16 55','0 5 7 9 16 55','3 5 7 9 16 55']),
    question(15,2006,2,'A cache line is 64 bytes. The main memory has latency 32 ns and bandwidth 1 GB/s. The time required to fetch the entire cache line from the main memory is', ['32 ns','64 ns','96 ns','128 ns']),
    question(16,2006,2,raw`A computer system has a level-1 instruction cache (I-cache), a level-1 data cache (D-cache) and a level-2 cache (L2-cache) with the following specifications:
$$\begin{array}{c|c|c|c}&\text{Capacity}&\text{Mapping method}&\text{Block size}\\\hline
\text{I-cache}&4\text{K words}&\text{Direct mapping}&4\text{ Words}\\
\text{D-cache}&4\text{K words}&\text{2-way set-associative mapping}&4\text{ Words}\\
\text{L2-cache}&64\text{K words}&\text{4-way set-associative mapping}&16\text{ Words}\end{array}$$
The length of the physical address of a word in the main memory is 30 bits. The capacity of the tag memory in the I-cache, D-cache and L2-cache is, respectively,`,[
      raw`$1\mathrm{K}\times18\text{-bit},\ 1\mathrm{K}\times19\text{-bit},\ 4\mathrm{K}\times16\text{-bit}$`,
      raw`$1\mathrm{K}\times16\text{-bit},\ 1\mathrm{K}\times19\text{-bit},\ 4\mathrm{K}\times18\text{-bit}$`,
      raw`$1\mathrm{K}\times16\text{-bit},\ 512\times18\text{-bit},\ 1\mathrm{K}\times16\text{-bit}$`,
      raw`$1\mathrm{K}\times18\text{-bit},\ 512\times18\text{-bit},\ 1\mathrm{K}\times18\text{-bit}$`,
    ],{optLayout:'1col',notes:['The source repeats the specifications as run-on text below the table. All values are retained once in the editable table; redundant repetition omitted.']}),
    question(17,2006,2,raw`A CPU has a cache with block size 64 bytes. The main memory has $k$ banks, each bank being $c$ bytes wide. Consecutive $c$-byte chunks are mapped on consecutive banks with wrap-around. All the $k$ banks can be accessed in parallel, but two accesses to the same bank must be serialized. A cache block access may involve multiple iterations of parallel bank accesses depending on the amount of data obtained by accessing all the $k$ banks in parallel. Each iteration requires decoding the bank numbers to be accessed in parallel and this takes $k/2$ ns. The latency of one bank access is 80 ns. If $c=2$ and $k=24$, then latency of retrieving a cache block starting at address zero from main memory is`, ['92 ns','104 ns','172 ns','184 ns']),
    question(18,2006,2,common18+raw`The value of $h_1$ is`, ['2.4 ns','2.3 ns','1.8 ns','1.7 ns']),
    question(19,2006,2,common18+raw`The value of $h_2$ is`, ['2.4 ns','2.3 ns','1.8 ns','1.7 ns']),
    question(20,2006,2,common20+raw`The value of $M_1$ is`, ['0','2048','16384','262144'],{code:code20}),
    question(21,2006,2,common20+raw`The value of the ratio $M_1/M_2$ is`, ['0',raw`$\frac{1}{16}$`,raw`$\frac{1}{8}$`,'16'],{code:code20}),
    question(22,2007,1,'Consider a 4-way set associative cache consisting of 128 lines with a line size of 64 words. The CPU generates a 20-bit address of a word in main memory. The number of bits in the TAG, SET and WORD fields respectively', ['9, 6, 5','7, 7, 6','7, 5, 8','9, 5, 6']),
    question(23,2007,2,common23+'How many data cache misses will occur in total?', ['48','50','56','59']),
    question(24,2007,2,common23+'Which of the following lines of the data cache will be replaced by new blocks in accessing the array', ['line 4 to line 11','line 4 to line 12','line 0 to line 7','line 0 to line 8']),
    question(25,2008,2,common25+'The numbers of bits in the TAG, SET and WORD fields, respectively are:', ['7, 6, 7','8, 5, 7','8, 6, 6','9, 4, 7']),
    question(26,2008,2,common25+'While accessing the memory location 0C795H by the CPU, the contents of the TAG field of the corresponding cache line is', ['000011000','110001111','00011000','110010101']),
    question(27,2008,2,raw`For inclusion to hold between two cache level L1 and L2 in a multilevel cache hierarchy, which of the following are necessary?
1. L1 must be a write-through cache
2. L2 must be a write-through cache
3. The associativity of L2 must be greater that of L1
4. The L2 cache must be at least as large as the L1 cache`, ['4 only','1 and 2 only','1, 2 and 4 only','1, 2, 3, and 4']),
    question(28,2008,2,'In an instruction execution pipeline, the earliest that the data TLB (Translation Look a side Buffer) can be accessed is', ['before effective address calculation has started','during effective address calculation','after effective address calculation has completed','after data cache lookup has completed']),
    question(29,2008,2,common29+'The total size of the tags in the cache directory is', ['32 kbits','34 kbits','64 kbits','68 kbits'],{code:code29}),
    question(30,2008,2,common29+'Which of the following array elements has the same cache index as APR[0][0]?', ['APR[0][4]','APR[4][0]','APR[0][5]','APR[5][0]'],{code:code29,notes:['Question is on book page 284; required shared program/data is on book page 283 (previous PDF spread).']}),
    question(31,2008,2,common29+'The cache hit ratio for this initialization loop is', ['0%','25%','50%','75%'],{code:code29,notes:['Although the printed common-data heading names Q4.29 to Q4.30, Q4.31 explicitly refers to the same initialization loop; its program/data is repeated here for a self-contained question.']}),
    question(32,2009,1,raw`How many $32\mathrm{K}\times1$ RAM chips are needed to provide a memory capacity of 256 K-bytes?`, ['8','32','64','128'],{rawTopic:'Memory Chip Design'}),
    question(33,2009,2,'Consider a 4-way set associative cache (initially empty) with total 16 cache blocks. The main memory consists of 256 blocks and the request for memory blocks is in the following order:\n0, 255, 1, 4, 3, 8, 133, 159, 216, 129, 63, 8, 48, 32, 73, 92, 155\nWhich one of the following memory block will NOT be in cache if LRU replacement policy is used?', ['3','8','129','216']),
    question(34,2010,1,raw`A main memory unit with a capacity of 4 megabytes is built using $1\mathrm{M}\times1$-bit DRAM chips. Each DRAM chip has 1K rows of cells with 1K cells in each row. The time taken for a single refresh operation is 100 nanoseconds. The time required to perform one refresh operation on all the cells in the memory unit is`, ['100 nanoseconds',raw`$100\times2^{10}$ nanoseconds`,raw`$100\times2^{20}$ nanoseconds`,raw`$3200\times2^{20}$ nanoseconds`],{rawTopic:'Memory Chip Design'}),
    question(35,2010,2,common35+'When there is a miss in L1 cache and a hit in L2 cache, a block is transferred from L2 cache to L1 cache. What is the time taken for this transfer?', ['2 nanoseconds','20 nanoseconds','22 nanoseconds','88 nanoseconds'],{diagram:'coa-memory-4-35-36-cache',notes:['The repeated phrase an L2 cache in the source is retained. Options continue at the top of the next column.']}),
    question(36,2010,2,common35+'When there is a miss in both L1 cache and L2 cache, first a block is transferred from main memory to L2 cache, and then a block is transferred from L2 cache to L1 cache. What is the total time taken for these transfers?', ['222 nanoseconds','888 nanoseconds','902 nanoseconds','968 nanoseconds'],{diagram:'coa-memory-4-35-36-cache'}),
    question(37,2011,2,'An 8KB direct-mapped write back cache is organized as multiple blocks, each of size 32 bytes. The processor generates 32 bit addresses. The cache controller maintains the tag information for each cache block comprising of the following.\n1 Valid bit\n1 Modified bit\nAs many bits as the minimum needed to identify the memory block mapped in the cache.\nWhat is the total size of memory needed at the cache controller to store meta-data (tags) for the cache?', ['4864 bits','6144 bits','6656 bits','5376 bits']),
    question(38,2012,2,common38+'The number of bits in the tag field of an address is', ['11','14','16','27']),
    question(39,2012,2,common38+'The size of the cache tag directory is', ['160 Kbits','136 Kbits','40 Kbits','32 Kbits']),
    question(40,2013,1,raw`In a $k$-way set associative cache, the cache is divided into $v$ sets, each of which consists of $k$ lines. The lines of a set are placed in sequence one after the other. The lines in set $s$ are sequenced before the lines in set $(s+1)$. The main memory blocks are numbered 0 onwards. The main memory block numbered $j$ must be mapped to any one of the cache lines from`,[
      raw`$(j\bmod v)\times k$ to $(j\bmod v)\times k+(k-1)$`,
      raw`$(j\bmod v)\times j$ to $(j\bmod v)+(k-1)$`,
      raw`$(j\bmod k)$ to $(j\bmod k)+(v-1)$`,
      raw`$(j\bmod k)\times v$ to $(j\bmod k)\times v+(v-1)$`,
    ],{optLayout:'1col',notes:['Options continue on book page 285. Option (b) retains the printed j multiplier.']}),
    question(41,2013,2,raw`A RAM chip has a capacity of 1024 words of 8 bits each $(1\mathrm{K}\times8)$. The number of $2\times4$ decoders with enable line needed to construct a $16\mathrm{K}\times16$ RAM from $1\mathrm{K}\times8$ RAM is`, ['4','5','6','7'],{rawTopic:'Memory Chip Design'}),
    question(42,2014,2,raw`An access sequence of cache block addresses of length $N$ contains $n$ unique block addresses. The number of unique block addresses between two consecutive accesses to the same block address is bounded above by $k$. What is the miss ratio if the access sequence is passed through a cache of associativity $A\geq k$ exercising least-recently used replacement policy?`, [raw`$\frac{n}{N}$`,raw`$\frac{1}{N}$`,raw`$\frac{1}{A}$`,raw`$\frac{k}{n}$`],{setNum:'1'}),
    question(43,2014,1,'A 4-way set-associative cache memory unit with a capacity of 16 KB is built using a block size of 8 words. The word length is 32 bits. The size of the physical address space is 4 GB. The number of bits for the TAG field is ______.', [],{setNum:'2',questionType:'NAT'}),
    question(44,2014,2,'In designing a computer’s cache system, the cache block (or cache line) size is an important parameter. Which one of the following statements is correct in this context?', [
      'A smaller block size implies better spatial locality',
      'A smaller block size implies a smaller cache tag and hence lower cache tag overhead',
      'A smaller block size implies a larger cache tag and hence lower cache hit time',
      'A smaller block size incurs a lower cache miss penalty',
    ],{setNum:'2'}),
    question(45,2014,2,'If the associativity of a processor cache is doubled while keeping the capacity and block size unchanged, which one of the following is guaranteed to be NOT affected?', ['Width of tag comparator','Width of set index decoder','Width of way selection multiplexor','Width of processor to main memory data bus'],{setNum:'2',notes:['Option (d) and exam metadata continue at the top of the right column.']}),
    question(46,2014,2,'Consider a main memory system that consists of 8 memory modules attached to the system bus, which is one word wide. Whenever a request is made, the bus is occupied for 100 nanoseconds (ns) by the data, address, and control signals. During the same 100 ns, and for 500 ns thereafter, the addressed memory module executes one cycle accepting and storing the data. The (internal) operation of different memory modules may overlap in time, but only one request can be on the bus at any time.\nThe maximum number of stores (of one word each) that can be initiated in 1 millisecond is ______.', [],{setNum:'2',rawTopic:'Memory Chip Design'}),
    question(47,2014,2,'The memory access time is 1 nanosecond for a read operation with a hit in cache, 5 nanoseconds for a read operation with a miss in cache, 2 nanoseconds for a write operation with a hit in cache and 10 nanoseconds for a write operation with a miss in cache. Execution of a sequence of instructions involves 100 instruction fetch operations, 60 memory operand read operations and 40 memory operand write operations. The cache hit-ratio is 0.9. The average memory access time (in nanoseconds) in executing the sequence of instructions is ______.', [],{setNum:'3'}),
    question(48,2015,1,'Assume that for a certain processor, a read request takes 50 nanoseconds on a cache miss and 5 nanoseconds on a cache hit. Suppose while running a program, it was observed that 80% of the processor’s read requests result in a cache hit. The average read access time in nanoseconds is ______.', [],{setNum:'2'}),
    question(49,2015,1,raw`Consider a machine with a byte addressable main memory of $2^{20}$ bytes, block size of 16 bytes and a direct mapped cache having $2^{12}$ cache lines. Let the addresses of two consecutive bytes in main memory be $(\mathrm{E201F})_{16}$ and $(\mathrm{E2020})_{16}$. What are the tag and cache line address (in hex) for main memory address $(\mathrm{E201F})_{16}$?`, ['E, 201','F, 201','E, E20','2, 01F'],{setNum:'3'}),
    question(50,2016,1,'A processor can support a maximum memory of 4 GB, where the memory is word-addressable (a word consists of two bytes). The size of the address bus of the processor is at least ______ bits.', [],{setNum:'1',rawTopic:'Memory Chip Design'}),
    question(51,2016,2,'The width of the physical address on a machine is 40 bits. The width of the tag field in a 512 KB 8-way set associative cache is ______ bits.', [],{setNum:'2'}),
    question(52,2016,2,'A file system uses an in-memory cache to cache disk blocks. The miss rate of the cache is shown in the figure. The latency to read a block from the cache is 1 ms and to read a block from the disk is 10 ms. Assume that the cost of checking whether a block exists in the cache is negligible. Available cache sizes are in multiples of 10 MB.\n[IMG_1]\nThe smallest cache size required to ensure an average read latency of less than 6 ms is ______ MB.', [],{setNum:'2',diagram:'coa-memory-4-52-miss-rate'}),
    question(53,2017,2,'Consider a 2-way set associative cache with 256 blocks and uses LRU replacement. Initially the cache is empty. Conflict misses are those misses which occur due to contention of multiple blocks for the same cache set. Compulsory misses occur due to first time access to the block. The following sequence of accesses to memory blocks\n(0, 128, 256, 128, 0, 128, 256, 128, 1, 129, 257, 129, 1, 129, 257, 129)\nis repeated 10 times. The number of conflict misses experienced by the cache is ______.', [],{setNum:'1'}),
    question(54,2017,2,raw`A cache memory unit with capacity of $N$ words and block size of $B$ words is to be designed. If it is designed as a direct mapped cache, the length of the TAG field is 10 bits. If the cache unit is now designed as a 16-way set-associative cache, the length of the TAG field is ______ bits.`, [],{setNum:'1'}),
    question(55,2017,1,raw`Consider a two-level cache hierarchy with $\mathrm{L}_1$ and $\mathrm{L}_2$ caches. An application incurs 1.4 memory accesses per instruction on average. For this application, the miss rate of $\mathrm{L}_1$ cache is 0.1; the $\mathrm{L}_2$ cache experiences, on average, 7 misses per 1000 instructions. The miss rate of $\mathrm{L}_2$ expressed correct to two decimal places is ______.`, [],{setNum:'1',notes:['Sentence continues at the top of the next column on book page 286.']}),
    question(56,2017,2,raw`Consider a machine with a byte addressable main memory of $2^{32}$ bytes divided into blocks of size 32 bytes. Assume that a direct mapped cache having 512 cache lines is used with this machine. The size of the tag field is ______ bits.`, [],{setNum:'2'}),
    question(57,2017,2,raw`The read access times and the hit ratios for different caches in a memory hierarchy are as given below:
$$\begin{array}{c|c|c}\text{Code}&\text{Read access time (in nanoseconds)}&\text{Hit ratio}\\\hline
\text{I-cache}&2&0.8\\\text{D-cache}&2&0.9\\\text{L2-cache}&8&0.9\end{array}$$
The read access time of main memory is 90 nanoseconds. Assume that the caches use the referred word-first read policy and the write back policy. Assume that all the caches are direct mapped caches. Assume that the dirty bit is always 0 for all the blocks in the caches. In execution of a program, 60% of memory reads are for instruction fetch and 40% are for memory operand fetch. The average read access time in nanoseconds (upto 2 decimal places) is ______.`, [],{setNum:'2',notes:['Table header Code and phrase referred word-first are retained as printed.']}),
    question(58,2017,2,raw`In a two-level cache system, the access times of $\mathrm{L}_1$ and $\mathrm{L}_2$ caches are 1 and 8 clock cycles, respectively. The miss penalty from the $\mathrm{L}_2$ cache to main memory is 18 clock cycles. The miss rate of $\mathrm{L}_1$ cache is twice that of $\mathrm{L}_2$. The average memory access time (AMAT) of this cache system is 2 cycles. The miss rates of $\mathrm{L}_1$ and $\mathrm{L}_2$ respectively are:`, ['0.111 and 0.056','0.056 and 0.111','0.0892 and 0.1784','0.1784 and 0.0892'],{setNum:'2'}),
    question(59,2018,1,raw`A 32-bit wide main memory unit with a capacity of 1 GB is built using $256\mathrm{M}\times4$-bit DRAM chips. The number of rows of memory cells in the DRAM chip is $2^{14}$. The time taken to perform one refresh operation is 50 nanoseconds. The refresh period is 2 milliseconds. The percentage (rounded to the closest integer) of the time available for performing the memory read/write operations in the main memory unit is ______.`, [],{rawTopic:'Memory Chip Design'}),
    question(60,2018,2,raw`The size of the physical address space of a processor is $2^P$ bytes. The word length is $2^W$ bytes. The capacity of cache memory is $2^N$ bytes. The size of each cache block is $2^M$ words. For a $K$-way set-associative cache memory, the length (in number of bits) of the tag field is`, [raw`$P-N-\log_2 K$`,raw`$P-N+\log_2 K$`,raw`$P-N-M-W-\log_2 K$`,raw`$P-N-M-W+\log_2 K$`]),
    question(61,2019,1,'A certain processor uses a fully associative cache of size 16 kB. The cache block size is 16 bytes. Assume that the main memory is byte addressable and uses a 32-bit address. How many bits are required for the Tag and the Index fields respectively in the addresses generated by the processor?', ['28 bits and 0 bits','24 bits and 0 bits','28 bits and 4 bits','24 bits and 4 bits']),
    question(62,2019,2,raw`A certain processor deploys a single-level cache. The cache block size is 8 words and the word size is 4 bytes. The memory system uses a 60 MHz clock. To service a cache miss, the memory controller first takes 1 cycle to accept the starting address of the block, it then takes 3 cycles to fetch all the eight words of the block, and finally transmits the words of the requested block at the rate of 1 word per cycle. The maximum bandwidth for the memory system when the program running on the processor issues a series of read operations is ______ $\times10^6$ bytes/sec.`),
    question(63,2020,1,'A direct mapped cache memory of 1 MB has a block size of 256 bytes. The cache has an access time of 3 ns and a hit rate of 94%. During a cache miss, it takes 20 ns to bring the first word of a block from the main memory, while each subsequent word takes 5 ns. The word size is 64 bits. The average memory access time in ns (round off to 1 decimal place) is ______.'),
    question(64,2020,2,raw`A computer system with a word length of 32 bits has a 16 MB byte-addressable main memory and a 64 KB, 4-way set associative cache memory with a block size of 256 bytes. Consider the following four physical addresses represented in hexadecimal notation.
$\mathrm{A1}=\text{0x42C8A4},\quad\mathrm{A2}=\text{0x546888},$
$\mathrm{A3}=\text{0x6A289C},\quad\mathrm{A4}=\text{0x5E4880}$
Which one of the following is TRUE?`, ['A1 and A3 are mapped to the same cache set.','A2 and A3 are mapped to the same cache set.','A3 and A4 are mapped to the same cache set.','A1 and A4 are mapped to different cache sets.'],{notes:['Options continue at the top of the right column on book page 287.']}),
    question(65,2021,1,raw`Consider a computer system with a byte-addressable primary memory of size $2^{32}$ bytes. Assume the computer system has a direct-mapped cache of size 32 KB $(1\ \mathrm{KB}=2^{10}\text{ bytes})$, and each cache block is of size 64 bytes. The size of the tag field is ______ bits.`, [],{setNum:'1'}),
    question(66,2021,2,raw`Assume a two-level inclusive cache hierarchy, L1 and L2, where L2 is the larger of the two. Consider the following statements.
$S_1$: Read misses in a write through L1 cache do not result in writebacks of dirty lines to the L2.
$S_2$: Write allocate policy must be used in conjunction with write through caches and no-write-allocate policy is “used with writeback caches.
Which of the following statements is correct?`, [raw`$S_1$ is true and $S_2$ is true.`,raw`$S_1$ is true and $S_2$ is false.`,raw`$S_1$ is false and $S_2$ is true.`,raw`$S_1$ is false and $S_2$ is false.`],{setNum:'2',notes:['The stray opening quotation mark before used in statement S2 is printed in the source and retained.']}),
    question(67,2021,1,raw`Consider a set-associative cache of size 2 KB $(1\ \mathrm{KB}=2^{10}\text{ bytes})$ with a block size of 64 bytes. Assume that the cache is byte-addressable and a 32-bit address is used for accessing the cache. If the width of the tag field is 22 bits, the associativity of the cache is ______.`, [],{setNum:'2'}),
    question(68,2022,1,'Let WB and WT be two set associative cache organizations that use LRU algorithm for cache block replacement. WB is a write back cache and WT is a write through cache. Which of the following statements is/are FALSE?', [
      'Each cache block in WB and WT has a dirty bit.',
      'Every write hit in WB leads to a data transfer from cache to main memory.',
      'Eviction of a block from WT will not lead to data transfer from cache to main memory.',
      'A read miss in WB will never lead to eviction of a dirty block from WB.',
    ]),
    question(69,2022,1,'A cache memory that has a hit rate of 0.8 has an access latency 10 ns and miss penalty 100 ns. An optimization is done on the cache to reduce the miss rate. However, the optimization results in an increase of cache access latency to 15 ns, whereas the miss penalty is not affected. The minimum hit rate (round off to two decimal places) needed after the optimization such that it should not increase the average memory access time is ______.'),
    question(70,2022,2,'Consider a system with 2 KB direct mapped data cache with a block size of 64 bytes. The system has a physical address space of 64 KB and a word length of 16 bits. During the execution of a program, four data words P, Q, R, and S are accessed in that order 10 times (i.e., PQRS PQRS ...). Hence, there are 40 accesses to data cache altogether. Assume that the data cache is initially empty and no other data words are accessed by the program. The addresses of the first bytes of P, Q, R, and S are 0xA248, 0xC28A, 0xCA8A, and 0xA262, respectively. For the execution of the above program, which of the following statements is/are TRUE with respect to the data cache?', ['Every access to S is a hit.','Once P is brought to the cache it is never evicted.','At the end of the execution only R and S reside in the cache.','Every access to R evicts Q from the cache.'],{notes:['Question continues from the left to the right column on book page 288.']}),
    question(71,2023,2,'A 4 kilobyte (KB) byte-addressable memory is realized using four 1 KB memory blocks. Two input address lines (IA4 and IA3) are connected to the chip select (CS) port of these memory blocks through a decoder as shown in the figure. The remaining ten input address lines from IA11 - IA0 are connected to the address port of the blocks. The chip select (CS) is active high.\n[IMG_1]\nThe input memory addresses (IA11 - IA0), in decimal, for the starting locations (Addr=0) of each block (indicated as X1, X2, X3, X4 in the figure) are among the options given below. Which one of the following options is CORRECT?', ['(0, 1, 2, 3)','(0, 1024, 2048, 3072)','(0, 8, 16, 24)','(0, 0, 0, 0)'],{diagram:'coa-memory-4-71-chip-select',rawTopic:'Memory Chip Design'}),
    question(72,2023,2,'An 8-way set associative cache of size 64 KB (1 KB = 1024 bytes) is used in a system with 32-bit address. The address is sub-divided into TAG, INDEX, and BLOCK OFFSET.\nThe number of bits in the TAG is ______.'),
    question(73,2024,2,'Consider two set-associative cache memory architectures: WBC, which uses the write back policy, and WTC, which uses the write through policy. Both of them use the LRU (Least Recently Used) block replacement policy. The cache memory is connected to the main memory. Which of the following statements is/are TRUE?', [
      'A write hit in WBC can modify the value of the dirty bit of a cache block',
      'A read miss in WTC never triggers a write back operation of a cache block to main memory',
      'A write miss in WTC always writes the victim cache block to main memory before loading the missed block to the cache',
      'A read miss in WBC never evicts a dirty block',
    ],{setNum:'1'}),
    question(74,2024,2,'A given program has 25% load/store instructions. Suppose the ideal CPI (cycles per instruction) without any memory stalls is 2. The program exhibits 2% miss rate on instruction cache and 8% miss rate on data cache. The miss penalty is 100 cycles. The speedup (rounded off to two decimal places) achieved with a perfect cache (i.e., with NO data or instruction cache misses) is ______.', [],{setNum:'1'}),
  ],
};
