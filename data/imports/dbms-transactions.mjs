const raw = String.raw;
const sourceHash = '16985def50bfc94418b62c19aad1798a920288316c047092fa39f73bb3584cec';
// Row positions retain the chronological alignment of the printed schedules.
function table(headers, rows, lines = true) {
  const cell = v => v === '' ? '' : String(v).startsWith('$') ? String(v).slice(1,-1) : raw`\text{${v}}`;
  const rule = lines ? raw`\hline ` : '';
  return '$$'+raw`\begin{array}{${lines?'|':''}${headers.map(()=>lines?'l|':'l').join('')}}`+rule+
    [headers,...rows].map(row=>row.map(cell).join('&')).join(raw`\\`+(lines && rows.length<5?rule:''))+
    raw`\\`+rule+raw`\end{array}`+'$$';
}
function q(n,year,marks,text,options=[],extra={}) {
  const {notes=[],...fields}=extra;
  const bookPages=n<=6?[644]:n<=10?[645]:n<=17?[646]:n<=23?[647]:n<=29?[648]:n<=34?[649]:[650];
  if(n===10||n===17)bookPages.push(bookPages[0]+1);
  return {id:`madeeasy-dbms-transactions-5-${n}`,text,code:'',year:String(year),marks:String(marks),setNum:'',examPaper:'CS',rawTopic:'Transactions',
    diagram:'',ext:'.png',optA:options[0]||'',optB:options[1]||'',optC:options[2]||'',optD:options[3]||'',
    questionType:options.length?'MCQ':'NAT',correctOptions:[],natAnswer:'',isBlank:false,isPosLocked:false,isCodeOptions:false,
    isProof:false,needsManualOptionFix:false,optLayout:'auto',tempPaste:'',...fields,
    source:{file:'12. DBMS/5. Transactions and Concurrency Contorl.pdf',sha256:sourceHash,questionNumber:`5.${n}`,bookPages,
      pdfPages:[...new Set(bookPages.map(p=>Math.floor((p-644)/2)+1))],answerKeyPdfPage:4,
      notes:['All four scanned PDF spreads visually reviewed. Answer key: PDF page 4 / book page 651. Explanations excluded. Schedules transcribed as editable LaTeX.',
        ...(n<=6?['Chapter-opening book page 644 inferred from facing printed folio 645.']:[]),...notes]}};
}
const s1=['lock S(A);','read (A);','lock X(B);','read (B);','if A = 0','then B <- B+1;','write (B);'];
const s2=['lock S(B);','read (B);','lock X(A);','read (A);','if B != 0','then A <- A-1;','write (A);'];
// These listings are program text in a dedicated code field, including printed
// repeated unlock(A) in options B/C. They are not silently corrected.
const locking = [
  ['(A)',s1.map((v,i)=>i===2?'lock S(B);':v),s2.map((v,i)=>i===2?'lock S(A);':v),['commit;','unlock (A);','unlock (B);'],['commit;','unlock (B);','unlock (A);']],
  ['(B)',s1.map((v,i)=>i===0?'lock X(A);':v),s2.map((v,i)=>i===0?'lock X(B);':v),['unlock (A);','commit;','unlock (B);'],['unlock (A);','commit;','unlock (A);']],
  ['(C)',s1,s2,['unlock (A);','commit;','unlock (B);'],['unlock (A);','commit;','unlock (A);']],
  ['(D)',s1,s2,['unlock (A);','unlock (B);','commit;'],['unlock (A);','unlock (B);','commit;']],
].map(([label,a,b,at,bt])=>[
  `${label} S1: ${a.slice(0,4).join(' ')}`,
  '        '+[...a.slice(4),...at].join(' '),
  '    S2: '+b.slice(0,4).join(' '),
  '        '+[...b.slice(4),...bt].join(' '),
].join('\n')).join('\n');
function timeline(a,b) {return table(['$T_1$',...a], [['$T_2$',...b]]);}
export const DBMS_TRANSACTIONS_IMPORT={subject:'12. DBMS',chapter:'5. Transactions and Concurrency Contorl',sourceHash,questions:[
  q(1,1999,2,'For the schedule given below, which of the following is correct?\n'+table(['','',''],[
    ['1','Read A',''],['2','','Read B'],['3','Write A',''],['4','','Read A'],['5','','Write A'],['6','','Write B'],['7','Read B',''],['8','Write B','']],false),[
    'This schedule is serializable and can occur in a scheme using 2PL protocol.',
    'This schedule is serializable but cannot occur in a scheme using 2PL protocol.',
    'This schedule is not serializable but can occur in a scheme using 2PL protocol.',
    'This schedule is not serializable and cannot occur in a scheme using 2PL protocol.'],{notes:['The two transaction columns are unlabeled in the printed schedule; no transaction labels added.']}),
  q(2,2003,1,'Which of the following scenarios may lead to an irrecoverable error in a database system?',[
    'A transaction writes a data item after it is read by an uncommitted transaction',
    'A transaction reads a data item after it is read by an uncommitted transaction',
    'A transaction reads a data item after it is written by a committed transaction',
    'A transaction reads a data item after it is written by an uncommitted transaction']),
  q(3,2003,2,raw`Consider three data items D1, D2, and D3, and the following execution schedule of transactions T1, T2 and T3. In the diagram, R(D) and W(D) denote the actions reading and writing the data item D respectively.`+'\n'+table(['T1','T2','T3'],[
    ['','R(D3);',''],['','R(D2);',''],['','W(D2);',''],['','','R(D2);'],['','','R(D3);'],['R(D1);','',''],['W(D1);','',''],['','','W(D2);'],['','','W(D3);'],['','R(D1);',''],['R(D2);','',''],['W(D2);','',''],['','W(D1);','']]),[
    'The schedule is serializable as T2; T3; T1;', 'The schedule is serializable as T2; T1; T3;',
    'The schedule is serializable as T3; T2; T1;', 'The schedule is not serializable']),
  q(4,2004,1,'Which level of locking provides the highest degree of concurrency in a relational database?',[
    'Page','Table','Row','Page, table and row level locking allow the same degree of concurrency']),
  q(5,2004,2,'Consider the following schedule S of transactions T1 and T2:\n'+table(['T1','T2'],[
    ['Read(A)',''],['$A=A-10$',''],['','Read(A)'],['','$\\mathrm{Temp}=0.2*A$'],['','Write(A)'],['','Read(B)'],['Write(A)',''],['Read(B)',''],['$B=B+10$',''],['Write(B)',''],['','$B=B+\\mathrm{Temp}$'],['','Write(B)']])+'\nWhich of the following is TRUE about the schedule S?',[
    'S is serializable only as T1, T2','S is serializable only as T2, T1','S is serializable both as T1, T2 and T2, T1','S is not serializable either as T1 or as T2'],{notes:['Printed option D says "T1 or as T2"; preserved verbatim.']}),
  q(6,2005,1,"Amongst the ACID properties of a transaction, the 'Durability' property requires that the changes made to the database by a successful transaction persist",[
    'Except in case of an Operating System crash','Except in case of a Disk crash','Except in case of a power failure','Always, even if there is a failure of any kind']),
  q(7,2006,1,'Consider the following log sequence of two transactions on a bank account, with initial balance 12000, that transfer 2000 to a mortgage payment and, then apply a 5% interest.\n'+
    '1.  T1: start\n2.  T1: B old = 12000, new = 10000\n3.  T1: M old = 0, new = 2000\n4.  T1: commit\n5.  T2: start\n6.  T2: B old = 10000, new = 10500\n7.  T2: commit\n'+
    'Suppose the database system crashes just before log record 7 is written. When the system is restarted, which one statement is true of the recovery procedure?',[
    'We must redo log record 6 to set B to 10500','We must undo log record 6 to set B to 10000 and then redo log records 2 and 3',
    'We need not redo log records 2 and 3 because transaction T1 has committed','We can apply redo and undo operations in arbitrary order because they are idempotent']),
  q(8,2007,2,raw`Consider the following schedules involving two transactions. Which one of the following statements is TRUE?
$S_1:\ r_1(X);r_1(Y);r_2(X);r_2(Y);w_2(Y);w_1(X)$
$S_2:\ r_1(X);r_2(X);r_2(Y);W_2(Y);r_1(Y);w_1(X)$`,[
    raw`Both $S_1$ and $S_2$ are conflict serializable`,raw`$S_1$ is conflict serializable and $S_2$ is not conflict serializable`,
    raw`$S_1$ is not conflict serializable and $S_2$ is conflict serializable`,raw`Both $S_1$ and $S_2$ are not conflict serializable`],{notes:['Uppercase W in the second printed schedule retained.']}),
  q(9,2007,2,'Consider the following two transactions: $T_1$ and $T_2$.\n[CODE]\nWhich of the following schemes, using shared and exclusive locks, satisfy the requirements for strict two phase locking for the above transactions?',[
    'Scheme (A)','Scheme (B)','Scheme (C)','Scheme (D)'],{
    code:'Transactions:\nT1: read(A); read(B); If A = 0 then B <- B + 1; write(B);\nT2: read(B); read(A); If B != 0 then A <- A - 1; write(A);\nLocking schemes:\n'+locking,
    notes:['Programs and option schemes stored in a separate code field; option labels point to the matching scheme. The repeated unlock(A) in S2 of options B/C is printed in the source and retained.']}),
  q(10,2008,2,'Consider the following three schedules of transactions T1, T2 and T3. [Notation: In the following NYO represents the action Y (R for read, W for write) performed by transaction N on object O].\n'+
    raw`$S1:\ 2RA\ 2WA\ 3RC\ 2WB\ 3WA\ 3WC\ 1RA\ 1RB\ 1WA\ 1WB$`+'\n'+
    raw`$S2:\ 3RC\ 2RA\ 2WA\ 2WB\ 3WA\ 1RA\ 1RB\ 1WA\ 1WB\ 3WC$`+'\n'+
    raw`$S3:\ 2RA\ 3RC\ 3WA\ 2WA\ 2WB\ 3WC\ 1RA\ 1RB\ 1WA\ 1WB$`+'\nWhich of the following statements is TRUE?',[
    'S1, S2 and S3 are all conflict equivalent to each other','No two of S1, S2 and S3 are conflict equivalent to each other',
    'S2 is conflict equivalent to S3, but not to S1','S1 is conflict equivalent to S2, but not to S3']),
  q(11,2009,2,raw`Consider two transactions $T_1$ and $T_2$, and four schedules $S_1$, $S_2$, $S_3$, $S_4$ of $T_1$ and $T_2$ as given below:
$T_1:R_1[x]\ W_1[x]\ W_1[y]$
$T_2:R_2[x]\ R_2[y]\ W_2[y]$
$S_1:R_1[x]\ R_2[x]\ R_2[y]\ W_1[x]\ W_1[y]\ W_2[y]$
$S_2:R_1[x]\ R_2[x]\ R_2[y]\ W_1[x]\ W_2[y]\ W_1[y]$
$S_3:R_1[x]\ W_1[x]\ R_2[x]\ W_1[y]\ R_2[y]\ W_2[y]$
$S_4:R_2[x]\ R_2[y]\ R_1[x]\ W_1[x]\ W_1[y]\ W_2[y]$
Which of the above schedules are conflict-serializable?`,[raw`$S_1$ and $S_2$`,raw`$S_2$ and $S_3$`,raw`$S_3$ only`,raw`$S_4$ only`],{notes:['Supplied key B is retained. In the printed schedules S3 is conflict-serializable but S2 is not; key appears inconsistent with the question. No answer correction invented.']}),
  q(12,2010,1,'Which of the following concurrency control protocols ensure both conflict serializability and freedom from deadlock?\nI.  2-phase locking\nII.  Time-stamp ordering',[
    'I only','II only','Both I and II','Neither I nor II']),
  q(13,2010,2,'Consider the following schedule for transactions T1, T2 and T3:\n'+table(['T1','T2','T3'],[
    ['Read (X)','',''],['','Read (Y)',''],['','','Read (Y)'],['','Write (Y)',''],['Write (X)','',''],['','','Write (X)'],['','Read (X)',''],['','Write (X)','']],false)+
    '\nWhich one of the schedules below is the correct serialization of the above?',[raw`$T1\to T3\to T2$`,raw`$T2\to T1\to T3$`,raw`$T2\to T3\to T1$`,raw`$T3\to T1\to T2$`]),
  q(14,2012,2,'Consider the following transactions with data items P and Q initialized to zero:\n[CODE]\nAny non-serial interleaving of $T_1$ and $T_2$ for concurrent execution leads to',[
    'a serializable schedule','a schedule that is not conflict serializable','a conflict serializable schedule','a schedule for which a precedence graph cannot be drawn'],{
    code:'T1: read (P);\n    read (Q);\n    if P = 0 then Q: = Q + 1;\n    write (Q);\n\nT2: read (Q);\n    read (P);\n    if Q = 0 then P: = P + 1;\n    write (P);'}),
  q(15,2013,1,'An index is clustered, if',[
    'it is on a set of fields that form a candidate key.', 'it is on a set of fields that include the primary key.',
    'the data records of the file are organized in the same order as the data entries of the index',
    'the data records of the file are organized not in the same order as the data entries of the index.'],{notes:['Index question retained in this chapter exactly as printed.']}),
  q(16,2014,2,raw`Consider the following four schedules due to three transactions (indicated by the subscript) using read and write on a data item x, denoted by r(x) and w(x) respectively. Which one of them is conflict serializable?`,[
    raw`$r_1(x);r_2(x);w_1(x);r_3(x);w_2(x)$`,raw`$r_2(x);r_1(x);w_2(x);r_3(x);w_1(x)$`,
    raw`$r_3(x);r_2(x);r_1(x);w_2(x);w_1(x)$`,raw`$r_2(x);w_2(x);r_3(x);r_1(x);w_1(x)$`],{setNum:'1'}),
  q(17,2014,2,'Consider the following schedule of transactions T1, T2, T3 and T4:\n'+table(['T1','T2','T3','T4'],[
    ['','Reads(X)','',''],['','','Writes(X)',''],['','','Commit',''],['Writes(X)','','',''],['Commit','','',''],
    ['','Writes(Y)','',''],['','Reads(Z)','',''],['','Commit','',''],['','','','Reads(X)'],['','','','Reads(Y)'],['','','','Commit']])+ '\nWhich one of the following statements is CORRECT?',[
    'S is conflict-serializable but not recoverable','S is not conflict-serializable but is recoverable','S is both conflict-serializable and recoverable',
    'S is neither conflict-serializable nor is it recoverable'],{setNum:'2'}),
  q(18,2014,2,raw`Consider the transactions T1, T2, and T3 and the schedules S1 and S2 given below:
$T1:r1(X);r1(Z);w1(X);w1(Z)$
$T2:r2(Y);r2(Z);w2(Z)$
$T3:r3(Y);r3(X);w3(Y)$
$S1:r1(X);r3(Y);r3(X);r2(Y);r2(Z);w3(Y);w2(Z);r1(Z);w1(X);w1(Z)$
$S2:r1(X);r3(Y);r2(Y);r3(X);r1(Z);r2(Z);w3(Y);w1(X);w2(Z);w1(Z)$
Which one of the following statements about the schedules is TRUE?`,[
    'Only S1 is conflict-serializable.','Only S2 is conflict-serializable.','Both S1 and S2 are conflict-serializable.','Neither S1 nor S2 is conflict-serializable.'],{setNum:'3'}),
  q(19,2015,1,raw`Consider the following transaction involving two bank accounts x and y.
$\operatorname{read}(x);\ x:=x-50;\ \operatorname{write}(x);\ \operatorname{read}(y);\ y:=y+50;\ \operatorname{write}(y)$
The constraint that the sum of the accounts x and y should remain constant is that of`,['Atomicity','Consistency','Isolation','Durability'],{setNum:'2'}),
  q(20,2015,1,'Consider a simple checkpointing protocol and the following set of operations in the log.\n'+
    '(start, T4); (write, T4, y, 2, 3); (start, T1); (commit, T4); (write, T1, z, 5, 7);\n(checkpoint);\n(start, T2); (write, T2, x, 1, 9); (commit, T2); (start, T3); (write, T3, z, 7, 2);\n'+
    'If a crash happens now and the system tries to recover using both undo and redo operations, what are the contents of the undo list and the redo list',[
    'Undo: T3, T1; Redo: T2','Undo: T3, T1; Redo: T2, T4','Undo: none; Redo: T2, T4, T3, T1','Undo: T3, T1, T4; Redo: T2'],{setNum:'2'}),
  q(21,2015,2,'Consider the following partial Schedule S involving two transactions T1 and T2. Only the read and the write operations have been shown. The read operation on data item P is denoted by read(P) and the write operation on data item P is denoted by write(P).\n'+
    table(['Time instance','$T1$','$T2$'],[['1','read(A)',''],['2','write(A)',''],['3','','read(C)'],['4','','write(C)'],['5','','read(B)'],['6','','write(B)'],['7','','read(A)'],['8','','commit'],['9','read(B)','']])+
    '\nSuppose that the transaction T1 fails immediately after time instance 9. Which one of the following statements is correct?',[
    'T2 must be aborted and then both T1 and T2 must be restarted to ensure transaction atomicity',
    'Schedule S is non recoverable and cannot ensure transaction atomicity','Only T2 must be aborted and then restarted to ensure transaction atomicity',
    'Schedule S is recoverable and can ensure atomicity and nothing else needs to be done'],{setNum:'3'}),
  q(22,2016,1,'Consider the following directed graph:\n[IMG_1]\nThe number of different topological ordering of the vertices of the graph is _____.',[],{
    setNum:'1',diagram:'transactions-5-22',pdfStyle:{imageScale:0.7},notes:['Directed graph only cropped from PDF page 2 / book page 647.']}),
  q(23,2016,1,'Which one of the following is NOT a part of the ACID properties of database transactions?',[
    'Atomicity','Consistency','Isolation','Deadlock-freedom'],{setNum:'1'}),
  q(24,2016,2,raw`Consider the following two phase locking protocol. Suppose a transaction T accesses (for read or write operations), a certain set of objects $\{O_1,\ldots,O_k\}$. This is done in the following manner:
Step 1. T acquires exclusive locks to $O_1,\ldots,O_k$ in increasing order of their addresses.
Step 2. The required operations are performed.
Step 3. All locks are released.
This protocol will`,['guarantee serializability and deadlock-freedom','guarantee neither serializability nor deadlock-freedom',
    'guarantee serializability but not deadlock-freedom','guarantee deadlock-freedom but not serializability'],{setNum:'1'}),
  q(25,2016,1,raw`Suppose a database schedule S involves transactions $T_1,\ldots,T_n$. Construct the precedence graph of S with vertices representing the transactions and edges representing the conflicts. If S is serializable, which one of the following orderings of the vertices of the precedence graph is guaranteed to yield a serial schedule?`,[
    'Topological order','Depth-first order','Breadth-first order','Ascending order of transaction indices'],{setNum:'2'}),
  q(26,2016,2,raw`Consider the following database schedule with two transactions, $T_1$ and $T_2$.
$S=r_2(X);r_1(X);r_2(Y);w_1(X);r_1(Y);w_2(X);a_1;a_2$
where $r_i(Z)$ denotes a read operation by transaction $T_i$ on a variable Z, $w_i(Z)$ denotes a write operation by transaction $T_i$ on a variable Z and $a_i$ denotes abort by transaction $T_i$.
Which one of the following statements about the above schedule is TRUE?`,[
    'S is non-recoverable','S is recoverable, but has a cascading abort','S does not have a cascading abort','S is strict'],{setNum:'2'}),
  q(27,2017,2,raw`In a database system, unique timestamps are assigned to each transaction using Lamport's logical clock. Let $TS(T_1)$ and $TS(T_2)$ be the timestamps of transactions $T_1$ and $T_2$ respectively. Besides, $T_1$ holds a lock on the resource R and $T_2$ has requested a conflicting lock on the same resource R. The following algorithm is used to prevent deadlocks in the database system assuming that a killed transaction is restarted with the same timestamp.
[CODE]
Assume any transaction that is not killed terminates eventually. Which of the following is TRUE about the database system that uses the above algorithm to prevent deadlocks?`,[
    'The database system is both deadlock-free and starvation-free.','The database system is deadlock-free, but not starvation-free.',
    'The database system is starvation-free, but not deadlock-free.','The database system is neither deadlock-free nor starvation-free.'],{
    setNum:'1',code:'if TS(T2) < TS(T1) then\n    T1 is killed\nelse T2 waits'}),
  q(28,2017,2,raw`Two transactions $T_1$ and $T_2$ are given as
$T_1:r_1(X)\ w_1(X)\ r_1(Y)\ w_1(Y)$
$T_2:r_2(Y)\ w_2(Y)\ r_2(Z)\ w_2(Z)$
where $r_i(V)$ denotes a read operation by transaction $T_i$ on a variable V and $w_i(V)$ denotes a write operation by transaction $T_i$ on a variable V. The total number of conflict serializable schedules that can be formed by $T_1$ and $T_2$ is _____.`,[],{setNum:'2'}),
  q(29,2019,1,"Consider the following two statements about database transaction schedules:\nI.  Strict two-phase locking protocol generates conflict serializable schedules that are also recoverable.\nII.  Timestamp-ordering concurrency control protocol with Thomas' Write Rule can generate view serializable schedules that are not conflict serializable.\nWhich of the above statements is/are TRUE?",[
    'Neither I nor II','I only','II only','Both I and II']),
  q(30,2020,2,'Consider a schedule of transactions $T_1$ and $T_2$:\n'+timeline(
    ['RA','','','RC','','WD','','WD','Commit',''],['','RB','WB','','RD','','WC','','','Commit'])+
    '\nHere, RX stands for "Read(X)" and WX stands for "Write(X)". Which one of the following schedules is conflict equivalent to the above schedule?',[
      timeline(['','','','','RA','RC','WD','WB','Commit',''],['RB','WB','RD','WC','','','','','','Commit']),
      timeline(['','','','RA','RC','WD','WB','','Commit',''],['RB','WB','RD','','','','','WC','','Commit']),
      timeline(['RA','RC','WD','WB','','','','','Commit',''],['','','','','RB','WB','RD','WC','','Commit']),
      timeline(['RA','RC','WD','','','','WB','','Commit',''],['','','','RB','WB','RD','','WC','','Commit'])
    ],{optLayout:'1col',notes:['Source schedule prints WD twice in T1; the options print WB as the final write. This inconsistency is retained. Answer B is transcribed from supplied key.']}),
  q(31,2021,1,'Suppose a database system crashes again while recovering from a previous crash. Assume checkpointing is not done by the database either during the transactions or during recovery.\nWhich of the following statements is/are correct?',[
    'The same undo and redo list will be used while recovering again.','The system cannot recover any further.','The database will become inconsistent.',
    'All the transactions that are already undone and redone will not be recovered again.'],{setNum:'1',questionType:'MSQ'}),
  q(32,2021,2,raw`Let $r_i(z)$ and $w_i(z)$ denote read and write operations respectively on a data item z by a transaction $T_i$. Consider the following two schedules:
$S_1:r_1(x),r_1(y),r_2(x),r_2(y),w_2(y),w_1(x)$
$S_2:r_1(x),r_2(x),r_2(y),w_2(y),r_1(y),w_1(x)$
Which one of the following options is correct?`,[
    raw`$S_1$ is not conflict serializable, and $S_2$ is conflict serializable.`,raw`Neither $S_1$ nor $S_2$ is conflict serializable.`,
    raw`Both $S_1$ and $S_2$ are conflict serializable.`,raw`$S_1$ is conflict serializable, and $S_2$ is not conflict serializable.`],{setNum:'1'}),
  q(33,2021,2,raw`Let S be the following schedule of operations of three transactions $T_1$, $T_2$ and $T_3$ in a relational database system:
$R_2(Y),R_1(X),R_3(Z),R_1(Y),W_1(X),R_2(Z),W_2(Y),R_3(X),W_3(Z)$
Consider the statements P and Q below:
P: S is conflict-serializable.
Q: If $T_3$ commits before $T_1$ finishes, then S is recoverable.
Which one of the following choices is correct?`,['P is true and Q is false','Both P and Q are false','Both P and Q are true','P is false and Q is true'],{setNum:'2'}),
  q(34,2022,2,raw`Let $R_i(z)$ and $W_i(z)$ denote read and write operations on a data element z by a transaction $T_i$ respectively. Consider the schedule S with four transactions.
$S:R_4(x),R_2(x),R_3(x),R_1(y),W_1(y),W_2(x),W_3(y),R_4(y)$
Which one of the following serial schedules is conflict equivalent to S?`,[
    raw`$T_1\to T_3\to T_4\to T_2$`,raw`$T_1\to T_4\to T_3\to T_2$`,raw`$T_4\to T_1\to T_3\to T_2$`,raw`$T_3\to T_1\to T_4\to T_2$`]),
  q(35,2024,2,raw`Consider the following read-write schedule S over three transactions $T_1$, $T_2$ and $T_3$, where the subscripts in the schedule indicate transaction IDs:
$S:r_1(z);w_1(z);r_2(x);r_3(y);w_3(y);r_2(y);w_2(x);w_2(y);$
Which of the following transaction schedules is/are conflict equivalent to S?`,[
    raw`$T_3\ T_1\ T_2$`,raw`$T_1\ T_2\ T_3$`,raw`$T_3\ T_2\ T_1$`,raw`$T_1\ T_3\ T_2$`],{setNum:'1',questionType:'MSQ'}),
  q(36,2024,1,'Once the DBMS informs the user that a transaction has been successfully completed, its effect should persist even if the system crashes before all its changes are reflected on disk. This property is called',[
    'durability','atomicity','consistency','isolation'],{setNum:'2'}),
  q(37,2024,1,'Which of the following statements about the Two Phase Locking (2PL) protocol is/are TRUE?',[
    '2PL permits only serializable schedules',
    'With 2PL, a transaction always locks the data item being read or written just before every operation and always releases the lock just after the operation.',
    'With 2PL, once a lock is released on any data item inside a transaction, no more locks on any data item can be obtained inside that transaction.',
    'A deadlock is possible with 2PL.'],{setNum:'2',questionType:'MSQ'}),
]};
export const DBMS_TRANSACTIONS_ANSWER_KEY=['D','D','D','C','D','D','B','C','C','C','B','B','A','B','C','D','C','A','B','A','B','6','D','A','A','C','A','54','D','B','A','A','A','A','ACD','A','ACD'];
DBMS_TRANSACTIONS_IMPORT.questions.forEach((question,index)=>{
  const answer=DBMS_TRANSACTIONS_ANSWER_KEY[index];
  if(question.questionType==='NAT')question.natAnswer=answer;
  else question.correctOptions=[...answer];
});
