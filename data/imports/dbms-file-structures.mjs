const raw=String.raw;
const sourceHash='6a32ebac6bd3897877038afddbe516d8f9df745c2ea467fcd54fd78eb57653d2';
const bplus=raw`$B^+$`;
function q(n,year,marks,text,options=[],extra={}) {
  const {notes=[],...fields}=extra;
  const bookPages=n<=9?[656]:n<=19?[657]:n<=26?[658]:[659];
  if(n===19)bookPages.push(658);
  return {id:`madeeasy-dbms-file-structures-6-${n}`,text,code:'',year:String(year),marks:String(marks),setNum:'',examPaper:'CS',rawTopic:'File Structures',
    diagram:'',ext:'.png',optA:options[0]||'',optB:options[1]||'',optC:options[2]||'',optD:options[3]||'',
    questionType:options.length?'MCQ':'NAT',correctOptions:[],natAnswer:'',isBlank:false,isPosLocked:false,isCodeOptions:false,
    isProof:false,needsManualOptionFix:false,optLayout:'auto',tempPaste:'',...fields,
    source:{file:'12. DBMS/6. File Structures.pdf',sha256:sourceHash,questionNumber:`6.${n}`,bookPages,
      pdfPages:[...new Set(bookPages.map(p=>Math.floor((p-656)/2)+1))],answerKeyPdfPage:2,
      notes:['Both scanned PDF spreads visually reviewed. Answer key: PDF page 2 / book page 659. Explanations excluded.',
        ...(n<=9?['Chapter-opening book page 656 inferred from facing printed folio 657.']:[]),...notes]}};
}
const joinPassage='A database table T1 has 2000 records and occupies 80 disk blocks. Another table T2 has 400 records and occupies 20 disk blocks. These two tables have to be joined as per a specified join condition that needs to be evaluated for every pair of records from these two tables. The memory buffer space available can hold exactly one block of records for T1 and one block of records for T2 simultaneously at any point in time. No index is available on either table.';
const treePassage=`Consider the ${bplus} tree in the adjoining figure, where each node has at most two keys and three links.\n[IMG_1]`;
export const DBMS_FILE_STRUCTURES_IMPORT={subject:'12. DBMS',chapter:'6. File Structures',sourceHash,questions:[
  q(1,1999,1,'Which of the following is correct?',[
    `B-trees are for storing data on disk and ${bplus} trees are for main memory.`,
    `Range queries are faster on ${bplus} trees.`,
    `B-trees are for primary indexes and ${bplus} trees are for secondary indexes.`,
    `The height of a ${bplus} tree is independent of the number of records.`]),
  q(2,2000,1,`${bplus} trees are preferred to binary trees in databases because`,[
    'Disk capacities are greater than memory capacities','Disk access is much slower than memory access',
    'Disk data transfer rates are much less than memory data transfer rates','Disks are more reliable than memory']),
  q(3,2002,2,`A ${bplus} tree index is to be built on the Name attribute of the relation STUDENT. Assume that all student names are of length 8 bytes, disk blocks are of size 512 bytes, and index pointers are of size 4 bytes. Given this scenario, what would be the best choice of the degree (i.e. the number of pointers per node) of the ${bplus}-tree?`,['16','42','43','44']),
  q(4,2004,2,`The order of an internal node in a ${bplus} tree index is the maximum number of children it can have. Suppose that a child pointer takes 6 bytes, the search field value takes 14 bytes, and the block size is 512 bytes. What is the order of the internal node?`,['24','25','26','27']),
  q(5,2004,2,raw`Consider a table T in a relational database with a key field K. A B-tree of order p is used as an access structure on K, where p denotes the maximum number of tree pointers in a B-tree index node. Assume that K is 10 bytes long; disk block size is 512 bytes; each data pointer $P_D$ is 8 bytes long and each block pointer $P_B$ is 5 bytes long. In order for each B-tree node to fit in a single disk block, the maximum value of p is`,['20','22','23','32']),
  q(6,2005,1,`Which one of the following is a key factor for preferring ${bplus} trees to binary search trees for indexing database relations?`,[
    'Database relations have a large number of record',
    'Database relations are sorted on the primary key',
    `${bplus} trees require less memory than binary search trees`,'Data transfer from disks is in blocks'],{notes:['Option A prints "a large number of record"; wording retained.']}),
  q(7,2005,1,'A B-tree used as an index for a large database table has four levels including the root node. If a new key is inserted in this index, then the maximum number of nodes that could be newly created in the process are',['5','4','3','2']),
  q(8,2005,2,joinPassage+'\nIf Nested-loop join algorithm is employed to perform the join, with the most appropriate choice of table to be used in outer loop, the number of block accesses required for reading the data are',['800000','40080','32020','100'],{notes:['Shared passage for linked questions 6.8 and 6.9 reproduced in both records.']}),
  q(9,2005,2,joinPassage+'\nIf, instead of Nested-loop join, Block nested-loop join is used, again with the most appropriate choice of table in the outer loop, the reduction in number of block accesses required for reading the data will be',['0','30400','38400','798400'],{notes:['Shared passage for linked questions 6.8 and 6.9 reproduced in both records.']}),
  q(10,2006,2,`In a database file structure, the search key field is 9 bytes long, the block size is 512 bytes, a record pointer is 7 bytes and a block pointer is 6 bytes. The largest possible order of a non-leaf node in a ${bplus} tree implementing this file structure is`,['23','24','34','44']),
  q(11,2007,2,`The order of a leaf node in a ${bplus} tree is the maximum number of (value, data record pointer) pairs it can hold. Given that the block size is 1K bytes, data record pointer is 7 bytes long, the value field is 9 bytes long and a block pointer is 6 bytes long, what is the order of the leaf node?`,['63','64','67','68']),
  q(12,2007,2,treePassage+'\nKeys K15 and then K25 are inserted into this tree in that order. Exactly how many of the following nodes (disregarding the links) will be present in the tree after the two insertions?\n'+raw`$$\boxed{\mathrm{K30}\mid\mathrm{K50}}\quad\boxed{\mathrm{K25}\mid\mathrm{K30}}\quad\boxed{\mathrm{K20}\mid\mathrm{K25}}\quad\boxed{\mathrm{K50}\mid\mathrm{K20}}$$`,['1','2','3','4'],{diagram:'file-structures-6-12-13',notes:['Shared initial tree for 6.12 and 6.13 cropped from book page 657. Candidate node contents transcribed as editable LaTeX in printed order.']}),
  q(13,2007,2,treePassage+'\nKeys K15 and then K25 are inserted into this tree in that order.\n'+`Now the key K50 is deleted from the ${bplus} tree resulting after the two insertions made earlier. Consider the following statements about the ${bplus} tree resulting after this deletion.\n(i) The height of the tree remains the same.\n(ii) The node `+raw`$\boxed{\mathrm{k20}}$`+' (disregarding the links) is present in the tree.\n(iii) The root node remains unchanged (disregarding the links).\nWhich one of the following options is true?',[
    'Statements (i) and (ii) are true','Statements (ii) and (iii) are true','Statements (iii) and (i) are true','All the statements are false'],
    {diagram:'file-structures-6-12-13',notes:['Shared initial tree and prerequisite insertions from 6.12 repeated so the linked question is self-contained. Printed lowercase k20 retained.']}),
  q(14,2008,1,'A clustering index is defined on the fields which are of type',[
    'Non-key and ordering','Non-key and non-ordering','Key and ordering','Key and non-ordering'],{notes:['Question starts at bottom of first column of book page 657; options continue at top of second column.']}),
  q(15,2008,2,'Consider a file of 16384 records. Each record is 32 bytes long and its key field is of size 6 bytes. The file is ordered on a non-key field, and the file organization is unspanned. The file is stored in a file system with block size 1024 bytes, and the size of a block pointer is 10 bytes. If the secondary index is built on the key field of the file, and a multilevel index scheme is used to store the secondary index, the number of first-level and second-level blocks in the multilevel index are respectively',['8 and 0','128 and 6','256 and 4','512 and 5']),
  q(16,2009,2,`The following key values are inserted into a ${bplus} tree in which order of the internal nodes is 3, and that of the leaf nodes is 2, in the sequence given below. The order of internal nodes is the maximum number of tree pointers in each node, and the order of leaf nodes is the maximum number of data items that can be stored in it. The ${bplus} tree is initially empty.\n10, 3, 6, 8, 4, 2, 1\nThe maximum number of times leaf nodes would get split up as a result of these insertions is`,['2','3','4','5']),
  q(17,2010,1,`Consider a ${bplus} tree in which the maximum number of keys in a node is 5. What is the minimum number of keys in any non-root node?`,['1','2','3','4']),
  q(18,2015,1,'A file is organized so that the ordering of data records is the same as or close to the ordering of data entries in some index. Then that index is called',['Dense','Sparse','Clustered','Unclustered'],{setNum:'1'}),
  q(19,2015,1,`With reference to the ${bplus} tree index of order 1 shown below, the minimum number of nodes (including the Root node) that must be fetched in order to satisfy the following query: "Get all records with a search key greater than or equal to 7 and less than 15" is _____.\n[IMG_1]`,[],{setNum:'2',diagram:'file-structures-6-19',notes:['Question on book page 657 continues with its tree and exam metadata at top of book page 658. Printed "order 1" preserved verbatim; it appears inconsistent with the illustrated tree (internal node has two keys).']}),
  q(20,2015,2,`Consider a ${bplus} tree in which the search key is 12 bytes long, block size is 1024 bytes, record pointer is 10 bytes long and block pointer is 8 bytes long. The maximum number of keys that can be accommodated in each non-leaf node of the tree is _____.`,[],{setNum:'3'}),
  q(21,2016,1,`${bplus} trees are considered BALANCED because`,[
    'the lengths of the paths from the root to all leaf nodes are all equal.',
    'the lengths of the paths from the root to all leaf nodes differ from each other by at most 1.',
    'the number of children of any two non-leaf sibling nodes differ by at most 1.',
    'the number of records in any two leaf nodes differ by at most 1.'],{setNum:'2'}),
  q(22,2017,2,`In a ${bplus} tree, if the search-key value is 8 bytes long, the block size is 512 bytes and the block pointer size is 2 bytes, then the maximum order of the ${bplus} tree is _____.`,[],{setNum:'2'}),
  q(23,2019,1,`Which one of the following statements is NOT correct about the ${bplus} tree data structure used for creating an index of a relational database table?`,[
    'Key values in each node are kept in sorted order','Each leaf node has a pointer to the next leaf node',
    `${bplus} tree is a height balanced tree`,'Non-leaf nodes have pointers to data records']),
  q(24,2020,2,`Consider a database implemented using ${bplus} tree for file indexing and installed on a disk drive with block size of 4 KB. The size of search key is 12 bytes and the size of tree/disk pointer is 8 bytes. Assume that the database has one million records. Also assume that no node of the ${bplus} tree and no records are present initially in main memory. Consider that each record fits into one disk block. The minimum number of disk accesses required to retrieve any record in the database is _____.`),
  q(25,2021,1,'A data file consisting of 1,50,000 student-records is stored on a hard disk with block size of 4096 bytes. The data file is sorted on the primary key RollNo. The size of a record pointer for this disk is 7 bytes. Each student-record has a candidate key attribute called ANum of size 12 bytes. Suppose an index file with records consisting of two fields, ANum value and the record pointer to the corresponding student record, is built and stored on the same disk. Assume that the records of data file and index file are not split across disk blocks. The number of blocks in the index file is _____.',[],{setNum:'2'}),
  q(26,2023,2,'Consider a database of fixed-length records, stored as an ordered file. The database has 25,000 records, with each record being 100 bytes, of which the primary key occupies 15 bytes. The data file is block-aligned in that each data record is fully contained within a block. The database is indexed by a primary index file, which is also stored as a block-aligned ordered file. The figure below depicts this indexing scheme.\n[IMG_1]\nSuppose the block size of the file system is 1024 bytes, and a pointer to a block occupies 5 bytes. The system uses binary search on the index file to search for a record with a given key. You may assume that a binary search on an index file of b blocks takes '+raw`$\lceil\log_2 b\rceil$`+' block accesses in the worst case. Given a key, the number of block accesses required to identify the block in the data file that may contain a record with the key, in the worst case, is _____.',[],{diagram:'file-structures-6-26',pdfStyle:{imageScale:0.8}}),
  q(27,2024,1,`In a ${bplus} tree, the requirement of at least half-full (50%) node occupancy is relaxed for which one of the following cases?`,[
    'Only the root node','Only the leftmost leaf node','All leaf nodes','All internal nodes'],{setNum:'1'}),
  q(28,2024,1,'Which of the following file organizations is/are I/O efficient for the scan operation in DBMS?',[
    'Heap','Sorted','Unclustered hash index','Unclustered tree index'],{setNum:'2',questionType:'MSQ'}),
]};
export const DBMS_FILE_STRUCTURES_ANSWER_KEY=['B','B','C','C','C','D','A','C','B','C','A','A','A','A','C','C','B','C','5','50','A','52','D','4','698','6','A','AB'];
DBMS_FILE_STRUCTURES_IMPORT.questions.forEach((question,index)=>{
  const answer=DBMS_FILE_STRUCTURES_ANSWER_KEY[index];
  if(question.questionType==='NAT')question.natAnswer=answer;
  else question.correctOptions=[...answer];
});
