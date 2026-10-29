const raw = String.raw;
const sourceHash = '092c3a0695e1d58164b0b96215e94d84350eb9290d59f056a0da7fbbb0c215fa';
const answers = 'C C D C B B D C C C A A B 80 13 C B C'.split(' ');
// Blank cells are intentionally blank; comma-separated entries in D are literal.
const table = (cells) => '$\\begin{array}{|c|l|}\\hline ' + cells.map((value,index)=>`${index} & ${value} \\\\ \\hline`).join(' ') + '\\end{array}$';
const shared = raw`Linked Answer Questions 7.9 and 7.10:
A hash table of length 10 uses open addressing with hash function $h(k)=k\bmod 10$, and linear probing. After inserting 6 values into an empty hash table, the table is as shown below.
` + table(['','','42','23','34','52','46','33','','']);
function question(number, year, marks, text, options = [], extra = {}) {
  const {notes = [], ...fields} = extra;
  const bookPages = number < 8 ? [409] : number === 8 ? [409,410] : number < 16 ? [410] : number === 16 ? [410,411] : [411];
  return {
    id: `madeeasy-data-structures-hashing-7-${number}`, text, code: '', year: String(year), marks: String(marks), setNum: '', examPaper: 'CS',
    rawTopic: 'Hashing', diagram: '', ext: '.png',
    optA: options[0] || '', optB: options[1] || '', optC: options[2] || '', optD: options[3] || '',
    questionType: options.length ? 'MCQ' : 'NAT', correctOptions: options.length ? [answers[number-1]] : [], natAnswer: options.length ? '' : answers[number-1],
    isBlank: false, isPosLocked: false, isCodeOptions: false, isProof: false, needsManualOptionFix: false, optLayout: 'auto', tempPaste: '', ...fields,
    source: {
      file: '6. Data Structures/6. Hashing.pdf', sha256: sourceHash, questionNumber: `7.${number}`,
      bookPages, pdfPages: [...new Set(bookPages.map(page => page === 409 ? 1 : 2))], answerKeyPdfPage: 2,
      notes: ['Answer transcribed from the printed Hashing key, PDF page 2 / book page 411.', ...notes],
    },
  };
}
export const DATA_STRUCTURES_HASHING_IMPORT = {
  subject: '6. Data Structures', chapter: '6. Hashing', sourceHash,
  questions: [
    question(1,1996,1,'An advantage of chained hash table (external hashing) over the open addressing scheme is',[
      'worst case complexity of search operations is less','space used is less','deletion is easier','None of the above',
    ]),
    question(2,2004,1,raw`Given the following input (4322, 1334, 1471, 9679, 1989, 6171, 6173, 4199) and the hash function $x\bmod 10$, which of the following statements are true?
1. 9679, 1989, 4199 hash to the same value
2. 1471, 6171 hash to the same value
3. All elements hash to the same value
4. Each element hashes to a different value`,['1 only','2 only','1 and 2 only','3 and 4']),
    question(3,2005,1,raw`A hash table contains 10 buckets and uses linear probing to resolve collisions. The key values are integers and the hash function used is $\mathrm{key}\mathbin{\%}10$. If the values 43, 165, 62, 123, 142 are inserted in the table, in what location would the key value 142 be inserted?`,['2','3','4','6']),
    question(4,2006,1,`Which of the following statement(s) is TRUE?
I. A hash function takes a message of arbitrary length and generates a fixed length code.
II. A hash function takes a message of fixed length and generates a code of variable length.
III. A hash function may give the same hash value for distinct messages.`,['I only','II and III only','I and III only','II only']),
    question(5,2007,2,'Consider a hash function that distributes keys uniformly. The hash table size is 20. After hashing of how many keys will the probability that any new key hashed collides with an existing one exceed 0.5.', ['5','6','7','10']),
    question(6,2007,2,raw`Consider the hash table of size seven, with starting index zero, and a hash function $(3x+4)\bmod 7$. Assuming the hash table is initially empty, which of the following is the contents of the table when the sequence 1, 3, 8, 10 is inserted into the table using closed hashing? Note that - denotes an empty location in the table`,[
      '8, -, -, -, -, -, 10','1, 8, 10, -, -, -, 3','1, -, -, -, -, -, 3','1, 10, 8, -, -, -, 3',
    ]),
    question(7,2008,2,raw`Consider a hash table of size 11 that uses open addressing with linear probing. Let $h(k)=k\bmod 11$ be the hash function used. A sequence of records with keys 43 36 92 87 11 4 71 13 14 is inserted into an initially empty hash table, the bins of which are indexed from zero to ten. What is the index of the bin into which the last record is inserted?`,['3','4','6','7']),
    question(8,2009,2,raw`The keys 12, 18, 13, 2, 3, 23, 5 and 15 are inserted into an initially empty hash table of length 10 using open addressing with hash function $h(k)=k\bmod 10$ and linear probing. What is the resultant hash table?`,[
      table(['','','2','23','','15','','','18','']),
      table(['','','12','13','','5','','','18','']),
      table(['','','12','13','2','3','23','5','18','15']),
      table(['','','12,2','13,3,23','','5,15','','','18','']),
    ],{optLayout:'2col',notes:['Options A/B occur on book page 409; options C/D and year/marks continue on book page 410. Tables are transcribed as editable LaTeX, retaining blank cells and comma-separated entries.']}),
    question(9,2010,2,shared+'\nWhich one of the following choices gives a possible order in which the key values could have been inserted in the table?',[
      '46, 42, 34, 52, 23, 33','34, 42, 23, 52, 33, 46','46, 34, 42, 23, 52, 33','42, 46, 33, 23, 34, 52',
    ],{notes:['Shared passage/table for linked questions 7.9 and 7.10 repeated in both editable records so each exported page is self-contained.']}),
    question(10,2010,2,shared+'\nHow many different insertion sequences of the key values using the same hash function and linear probing will result in the hash table shown above?',[
      '10','20','30','40',
    ],{notes:['Shared passage/table for linked questions 7.9 and 7.10 repeated in both editable records so each exported page is self-contained.']}),
    question(11,2014,2,raw`Consider a hash table with 9 slots. The hash function is $h(k)=k\bmod 9$. The collisions are resolved by chaining. The following 9 keys are inserted in the order: 5, 28, 19, 15, 20, 33, 12, 17, 10. The maximum, minimum, and average chain lengths in the hash table, respectively, are`,[
      '3, 0, and 1','3, 3, and 3','4, 0, and 1','3, 0, and 2',
    ],{setNum:'1'}),
    question(12,2014,2,'Consider a hash table with 100 slots. Collisions are resolved using chaining. Assuming simple uniform hashing, what is the probability that the first 3 slots are unfilled after the first 3 insertions?',[
      raw`$\dfrac{97\times97\times97}{100^3}$`,raw`$\dfrac{99\times98\times97}{100^3}$`,
      raw`$\dfrac{97\times96\times95}{100^3}$`,raw`$\dfrac{97\times96\times95}{3!\times100^3}$`,
    ],{setNum:'3'}),
    question(13,2015,2,'Which one of the following hash functions on integers will distribute keys most uniformly over 10 buckets numbered 0 to 9 for i ranging from 0 to 2020?',[
      raw`$h(i)=i^2\bmod 10$`,raw`$h(i)=i^3\bmod 10$`,raw`$h(i)=(11*i^2)\bmod 10$`,raw`$h(i)=(12*i)\bmod 10$`,
    ],{setNum:'2'}),
    question(14,2015,1,raw`Given a hash table $T$ with 25 slots that stores 2000 elements, the load factor $\alpha$ for $T$ is _____.`,[],{setNum:'3'}),
    question(15,2020,1,raw`Consider a double hashing scheme in which the primary hash function is $h_1(k)=k\bmod 23$ and the secondary hash function is $h_2(k)=1+(k\bmod 19)$. Assume that the table size is 23. Then the address returned by probe 1 in the probe sequence (assume that the probe sequence begins at probe 0) for key value $k=90$ is _____.`),
    question(16,2021,2,raw`Consider a dynamic hashing approach for 4-bit integer keys:
1. There is a main hash table of size 4.
2. The 2 least significant bits of a key is used to index into the main hash table,
3. Initially, the main hash table entries are empty.
4. Thereafter, when more keys are hashed into it, to resolve collisions, the set of all keys corresponding to a main hash table entry is organized as a binary tree that grows on demand.
5. First, the 3rd least significant bit is used to divide the keys into left and right subtrees.
6. To resolve more collisions, each node of the binary tree is further sub-divided into left and right subtrees based on the 4th least significant bit.
7. A split is done only if it is needed, i.e., only when there is a collision.
Consider the following state of the hash table.
[IMG_1]
Which of the following sequences of key insertions can cause the above state of the hash table (assume the keys are in decimal notation)?`,[
      '9, 5, 13, 6, 10, 14','9, 5, 10, 6, 7, 1','10, 9, 6, 7, 5, 13','5, 9: 4, 13, 10, 7',
    ],{setNum:'1',diagram:'hashing-7-16',notes:['Items 1-6 are on book page 410; item 7, the diagram, options and exam header continue on book page 411.','Option D prints a colon after 9 (5, 9: 4, 13, 10, 7); punctuation retained literally.']}),
    question(17,2022,1,raw`Suppose we are given $n$ keys, $m$ hash table slots, and two simple uniform hash functions $h_1$ and $h_2$. Further suppose our hashing scheme uses $h_1$ for the odd keys and $h_2$ for the even keys. What is the expected number of keys in a slot?`,[
      raw`$\dfrac{m}{n}$`,raw`$\dfrac{n}{m}$`,raw`$\dfrac{2n}{m}$`,raw`$\dfrac{n}{2m}$`,
    ]),
    question(18,2023,1,raw`An algorithm has to store several keys generated by an adversary in a hash table. The adversary is malicious who tries to maximize the number of collisions. Let $k$ be the number of keys, $m$ be the number of slots in the hash table, and $k>m$. Which one of the following is the best hashing strategy to counteract the adversary?`,[
      raw`Division method, i.e., use the hash function $h(k)=k\bmod m$.`,
      raw`Multiplication method, i.e., use the hash function $h(k)=\lfloor m(kA-\lfloor kA\rfloor)\rfloor$, where $A$ is a carefully chosen constant.`,
      'Universal hashing method.',
      raw`If $k$ is a prime number, use Division method. Otherwise, use Multiplication method.`,
    ]),
  ],
};
