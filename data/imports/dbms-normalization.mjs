const raw = String.raw;
const sourceHash = 'e14abdc67112fd7d8c019186206bce776d3f64dd016dcd01db77e5513e8f29ba';
const key = ['Sol','A','D','D','C','Sol','B','A','B','C','C','A','C','C','D','A','B','B','A','C','D','B','A','B','CD','D','C','A','D','C','A','A','C','B','A','B','D','A','8','19','B','C','B','B','A','0','B','D','A','D','A','ABD','A','8','AC','ACD','50'];
function question(n,year,marks,text,options=[],extra={}) {
  const {notes=[],...fields}=extra;
  const answer=key[n-1];
  const bookPages=n<=8?[602]:n<=16?[603]:n===17?[603,604]:n<=27?[604]:n<=35?[605]:n<=44?[606]:n<=49?[607]:[608];
  const q={id:`madeeasy-dbms-normalization-2-${n}`,text,code:'',year:String(year),marks:String(marks),setNum:'',examPaper:'CS',
    rawTopic:'Functional Dependencies and Normalization',diagram:'',ext:'.png',
    optA:options[0]||'',optB:options[1]||'',optC:options[2]||'',optD:options[3]||'',
    questionType:answer==='Sol'?'SUBJECTIVE':options.length?(answer.length>1?'MSQ':'MCQ'):'NAT',
    correctOptions:options.length?[...answer]:[],natAnswer:options.length||answer==='Sol'?'':answer,
    isBlank:false,isPosLocked:false,isCodeOptions:false,isProof:answer==='Sol',needsManualOptionFix:false,optLayout:'auto',tempPaste:'',...fields,
    source:{file:'12. DBMS/2. Funcational Dependencies and Normalizaation.pdf',sha256:sourceHash,questionNumber:`2.${n}`,
      bookPages,pdfPages:[n<=17?1:n<=35?2:n<=49?3:4],answerKeyPdfPage:4,
      notes:['All four scanned spreads visually reviewed. Answer key: PDF page 4, book page 609.',
        ...(n<=8?['Chapter-opening book page 602 inferred from the following visible folio 603.']:[]),...notes]}};
  if(n===17)q.source.pdfPages=[1,2];
  return q;
}
const trueFalse=['S1 is TRUE and S2 is FALSE.','Both S1 and S2 are TRUE.','S1 is FALSE and S2 is TRUE.','Both S1 and S2 are FALSE.'];
const linked=raw`Linked Answer Questions 2.34 and 2.35:
Relation R has eight attributes ABCDEFGH. Fields of R contain only atomic values.
$F=\{CH\to G,\ A\to BC,\ B\to CFH,\ E\to A,\ F\to EG\}$ is a set of functional dependencies (FDs) so that F is exactly the set of FDs that hold for R.
`;
export const DBMS_NORMALIZATION_IMPORT={subject:'12. DBMS',chapter:'2. Funcational Dependencies and Normalizaation',sourceHash,questions:[
  question(1,1995,2,raw`(a) Consider the relation scheme $R(A,B,C)$ with the following functional dependencies:
$AB\to C$
$C\to A$
Show that the scheme R is in the Third Normal Form (3NF) but not in Boyce-Codd Normal Form (BCNF).
(b) Determine the minimal keys of relation R.`,[],{natAnswer:raw`(a) R is in 3NF but not in BCNF: $AB\to C$ is allowed in both; $C\to A$ has a determinant that is not a key, and A is prime, so it is allowed in 3NF but not BCNF. (b) Minimal keys: $\{AB,BC\}$.`,notes:['Answer key says Sol.; the supplied explanation on book page 609 provides the stored subjective answer.']}),
  question(2,1997,2,raw`For a database relation $R(a,b,c,d)$, where the domains of a, b, c, d include only atomic values, only the following functional dependencies and those that can be inferred from them hold:
$a\to c$
$b\to d$
This relation is`,['in first normal form but not in second normal form','in second normal form but not in third normal form','in third normal form','None of the above']),
  question(3,1997,2,raw`Let $R(a,b,c)$ and $S(d,e,f)$ be two relations in which d is the foreign key of S that refers to the primary key of R. Consider the following operations on R and S
(i) Insert into R
(ii) Insert into S
(iii) Delete from R
(iv) Delete from S
Which of the following is true about the referential integrity constraint above?`,['None of (i), (ii), (iii) or (iv) can cause its violation','All of (i), (ii), (iii) and (iv) can cause its violation','Both (i) and (iv) can cause its violation','Both (ii) and (iii) can cause its violation']),
  question(4,1998,1,'Which normal form is considered adequate for normal relational database design?',['2 NF','5 NF','4 NF','3 NF']),
  question(5,1998,1,raw`There are five records in a database:
$$\begin{array}{|l|r|l|c|}\hline \text{Name}&\text{Age}&\text{Occupation}&\text{Category}\\\hline \text{Rama}&27&\text{CON}&A\\ \text{Abdul}&22&\text{ENG}&A\\ \text{Jeniffer}&28&\text{DOC}&B\\ \text{Maya}&32&\text{SER}&D\\ \text{Dev}&24&\text{MUS}&C\\\hline\end{array}$$
There is an index file associated with this and it contains the values 1, 3, 2, 5 and 4. Which one of the fields is the index built from?`,['Age','Name','Occupation','Category']),
  question(6,1998,2,`Consider the following database relations containing the attributes:
Book_id
Subject_Category_of_book
Name_of_Author
Nationality_of_Author
With book_id as the primary key.
(a) What is the highest normal form satisfied by this relation?
(b) Suppose the attributes Book_title and Author_address are added to the relation, and the primary key is changed to {Name_of_Author, Book_title}, what will be the highest normal form satisfied by the relation?`,[],{natAnswer:'(a) BCNF. (b) Answer unavailable: the supplied solution is cut off.',notes:['The answer key says Sol. The supplied explanation gives BCNF for part (a); the explanation of part (b) is cut off at the end of the supplied PDF. Part (b) answer is unresolved and has not been inferred.']}),
  question(7,1999,1,raw`Let $R=(A,B,C,D,E,F)$ be a relation scheme with the following dependencies $C\to F$, $E\to A$, $EC\to D$, $A\to B$. Which of the following is a key for R?`,['CD','EC','AE','AC']),
  question(8,1999,2,raw`Consider the schema $R=(S\ T\ U\ V)$ and the dependencies $S\to T$, $T\to U$, $U\to V$ and $V\to S$. Let $R=(R1\text{ and }R2)$ be a decomposition such that $R1\cap R2=\phi$. The decomposition is`,['not in 2NF','in 2NF but not 3NF','in 3NF but not in 2NF','in both 2NF and 3NF'],{notes:['The printed question and answer A are preserved, including the unusual normal-form wording for a decomposition.']}),
  question(9,2000,2,raw`Given the following relation instance:
$$\begin{array}{ccc}X&Y&Z\\1&4&2\\1&5&3\\1&6&3\\3&2&2\end{array}$$
Which of the following functional dependencies are satisfied by the instance?`,[raw`$XY\to Z$ and $Z\to Y$`,raw`$YZ\to X$ and $Y\to Z$`,raw`$YZ\to X$ and $X\to Z$`,raw`$XZ\to Y$ and $Y\to X$`]),
  question(10,2001,1,raw`Consider a schema $R(A,B,C,D)$ and functional dependencies $A\to B$ and $C\to D$. Then the decomposition of R into $R_1(AB)$ and $R_2(CD)$ is`,['dependency preserving and lossless join','lossless join but not dependency preserving','dependency preserving but not lossless join','not dependency preserving and not lossless join']),
  question(11,2001,2,raw`$R(A,B,C,D)$ is a relation. Which of the following does not have a lossless join, dependency preserving BCNF decomposition?`,[raw`$A\to B,\ B\to CD$`,raw`$A\to B,\ B\to C,\ C\to D$`,raw`$AB\to C,\ C\to AD$`,raw`$A\to BCD$`]),
  question(12,2000,1,raw`Relation R with an associated set of functional dependencies, F, is decomposed into BCNF. The redundancy (arising out of functional dependencies) in the resulting set of relation is`,['Zero','More than zero but less than that of an equivalent 3NF decomposition',raw`Proportional to the size of $F^+$`,'Indeterminate']),
  question(13,2002,2,`Relation R is decomposed using a set of functional dependencies, F, and relation S is decomposed using another set of functional dependencies, G. One decomposition is definitely BCNF, the other is definitely 3 NF, but it is not known which is which. To make a guaranteed identification, which one of the following tests should be used on the decompositions? (Assume that the closures of F and G are available).`,['Dependency-preservation','Lossless-join','BCNF definition','3 NF definition']),
  question(14,2002,2,raw`From the following instance of a relation scheme $R(A,B,C)$, we can conclude that:
$$\begin{array}{|c|c|c|}\hline A&B&C\\\hline1&1&1\\1&1&0\\2&3&2\\2&3&2\\\hline\end{array}$$`,['A functionally determines B and B functionally determines C','A functionally determines B and B does not functionally determines C','B does not functionally determines C','A does not functionally determines B and B does not functionally determines C']),
  question(15,2003,2,raw`Consider the following functional dependencies in a database:
$\text{Data\_of\_Birth}\to\text{Age}$
$\text{Age}\to\text{Eligibility}$
$\text{Name}\to\text{Roll\_number}$
$\text{Roll\_number}\to\text{Name}$
$\text{Course\_number}\to\text{Course\_name}$
$\text{Course\_number}\to\text{Instructor}$
$(\text{Roll\_number},\text{Course\_number})\to\text{Grade}$
The relation (Roll_number, Name, Date_of_birth, Age) is`,['in second normal form but not in third normal form','in third normal form but not in BCNF','in BCNF','in none of the above'],{notes:['The first dependency is printed Data_of_Birth while the relation says Date_of_birth; both spellings are preserved.']}),
  question(16,2004,1,raw`Consider the following relation schema pertaining to a students database:
$\text{Student}(\underline{\text{rollno}},\text{name},\text{address})$
$\text{Enroll}(\underline{\text{rollno},\text{course}},\text{coursename})$
where the primary keys are shown underlined. The number of tuples in the student and Enroll tables are 120 and 8 respectively. What are the maximum and minimum number of tuples that can be present in (Student * Enroll), where '*' denotes natural join?`,['8, 8','120, 8','960, 8','960, 120']),
  question(17,2004,2,raw`The relation scheme student Performance (name, courseNo, rollNo, grade) has the following functional dependencies:
$\text{name},\text{courseNo}\to\text{grade}$
$\text{RollNo},\text{courseNo}\to\text{grade}$
$\text{name}\to\text{rollNo}$
$\text{rollNo}\to\text{name}$
The highest normal form of this relation scheme is`,['2 NF','3 NF','BCNF','4 NF'],{notes:['The stem is on book page 603; the final sentence, options and exam label continue on page 604 (PDF pages 1-2).']}),
  question(18,2004,2,'A relation Empdtl is defined with attributes empcode (unique), name, street, city, state and pincode. For any pincode, there is only one city and state. Also, for any given street, city and state, there is just one pincode. In normalization terms, Empdtl is a relation in',['1NF only','2NF and hence also in 1NF','3NF and hence also in 2NF and 1NF','BCNF and hence also in 3NF, 2NF an 1NF']),
  question(19,2005,1,raw`A table has fields F1, F2, F3, F4, F5 with the following functional dependencies:
$F1\to F3,\ F2\to F4,\ (F1,F2)\to F5$
In terms of Normalization, this table is in`,['1 NF','2 NF','3 NF','None of these']),
  question(20,2005,1,'Which one of the following statements about normal forms is FALSE?',['BCNF is stricter than 3 NF','Loss less, dependency-preserving decomposition into 3 NF is always possible','Loss less, dependency-preserving decomposition into BCNF is always possible','Any relation with two attributes is BCNF']),
  question(21,2005,2,raw`Consider a relation scheme $R=(A,B,C,D,E,H)$ on which the following functional dependencies hold:
$\{A\to B,\ BC\to D,\ E\to C,\ D\to A\}$
What are the candidate keys of R?`,['AE, BE','AE, BE, DE','AEH, BEH, BCH','AEH, BEH, DEH']),
  question(22,2005,2,raw`In a schema with attributes A, B, C, D and E following set of functional dependencies are given
$A\to B$
$A\to C$
$CD\to E$
$B\to D$
$E\to A$
Which of the following functional dependencies is NOT implied by the above set`,[raw`$CD\to AC$`,raw`$BD\to CD$`,raw`$BC\to CD$`,raw`$AC\to BC$`],{notes:['The dependency list continues from the first to the second column of book page 604.']}),
  question(23,2006,1,raw`Consider the relations $r_1(P,Q,R)$ and $r_2(R,S,T)$ with primary keys P and R respectively. The relation $r_1$ contains 2000 tuples and $r_2$ contains 2500 tuples. The maximum size of the join $r_1\bowtie r_2$ is:`,['2000','2500','4500','5000']),
  question(24,2006,2,raw`Consider a relation R with five attributes V, W, X, Y, and Z. The following functional dependencies hold: $VY\to W$, $WX\to Z$, and $ZY\to V$. Which of the following is a candidate key for R?`,['VXZ','VXY','VWXY','VWXYZ']),
  question(25,2006,2,raw`The following functional dependencies are given: $AB\to CD$, $AF\to D$, $DE\to F$, $C\to G$, $F\to E$, $G\to A$.
Which one of the following options is false?`,[raw`$\{CF\}^+=\{ACDEFG\}$`,raw`$\{BG\}^+=\{ABCDG\}$`,raw`$\{AF\}^+=\{ACDEFG\}$`,raw`$\{AB\}^+=\{ACDFG\}$`],{notes:['The printed stem says Which one, but the supplied answer key explicitly lists (c,d). Stored as MSQ with C,D; no option or key correction inferred.']}),
  question(26,2007,2,'Which one of the following statements is FALSE?',['Any relation with two attributes is in BCNF','A relation in which every key has only one attribute is in 2NF','A prime attribute can be transitively dependent on a key in 3NF relation','A prime attribute can be transitively dependent on a key in a BCNF relation.']),
  question(27,2007,2,raw`Consider the following implications relating to functional and multivalued dependencies given below, which may or may not be correct.
(i) If $A\twoheadrightarrow B$ and $A\twoheadrightarrow C$ then $A\to BC$
(ii) If $A\to B$ and $A\to C$ then $A\twoheadrightarrow BC$
(iii) If $A\twoheadrightarrow BC$ and $A\to B$ then $A\to C$
(iv) If $A\to BC$ and $A\to B$ then $A\twoheadrightarrow C$
Exactly how many of the above implications are valid?`,['0','1','2','3']),
  question(28,2008,2,raw`Let $R(A,B,C,D)$ be a relational schema with the following functional dependencies:
$A\to B,\ B\to C,\ C\to D\text{ and }D\to B$
The decomposition of R into (A, B), (B, C), (B, D)`,['Gives a lossless join, and is dependency preserving','Gives a lossless join, but is not dependency preserving','Does not give a lossless join, but is dependency preserving','Does not give a lossless join and is not dependency preserving']),
  question(29,2008,2,raw`Let $R(A,B,C,D,E,F,G)$ be a relational schema in which the following functional dependencies are known to hold:
$AB\to CD,\ DE\to P,\ C\to E,\ P\to C\text{ and }B\to G$
The relation schema R is`,['in BCNF','in 3NF, but not in BCNF','in 2NF, but not in 3NF','not in 2NF'],{notes:['P appears in the printed dependencies DE to P and P to C but not in the printed attribute list. Preserved as supplied.']}),
  question(30,2008,2,raw`Consider the following relational schemes for a library database:
Book (Title, Author, Catalog_no, Publisher, Year, price)
Collection (Title, Author, Catalog_no)
which the following functional dependencies:
I. $\text{Title Author}\to\text{Catalog\_no}$
II. $\text{Catalog\_no}\to\text{Title Author Publisher Year}$
III. $\text{Publisher Title Year}\to\text{Price}$
Assume {Author, Title} is the key for both schemes: which of the following statements is true?`,['Both Book and Collection are in BCNF','Both Book and Collection are in 3NF only','Book is in 2NF and Collection is in 3NF','Both Book and Collection are in 2NF only']),
  question(31,2010,2,raw`The following functional dependencies hold for relations $R(A,B,C)$ and $S(B,D,E)$:
$B\to A$
$A\to C$
The relation R contains 200 tuples and the relation S contains 100 tuples. What is the maximum number of tuples possible in the natural join $R\bowtie S$?`,['100','200','300','2000']),
  question(32,2011,1,`Consider a relational table with a single record from each registered student with the following attributes.
1. Registration_Num: Unique registration number of each registered student
2. UID: Unique identity number, unique at the national level for each citizen
3. BankAccount_Num: Unique account number at the bank. A student can have multiple accounts or joint accounts. This attribute stores the primary account number
4. Name: Name of the student
5. Hostel_Room: Room number of the hostel
Which of the following options is INCORRECT?`,['BankAccount_Num is a candidate key','Registration_Num can be a primary key','UID is a candidate key if all students are from the same country',raw`If S is a superkey such that $S\cap\text{UID}$ is NULL then $S\cup\text{UID}$ is also a superkey`]),
  question(33,2012,1,'Which of the following is TRUE?',['Every relation in 3NF is also in BCNF','A relation R is in 3NF if every non-prime attribute of R is fully functionally dependent on every key of R','Every relation in BCNF is also in 3NF','No relation can be in both BCNF and 3NF']),
  question(34,2013,2,linked+'How many candidate keys does the relation R have?',['3','4','5','6']),
  question(35,2013,2,linked+'The relation R is',['in 1NF, but not in 2NF','in 2NF, but not in 3NF','in 3NF, but not in BCNF','in BCNF']),
  question(36,2014,1,raw`Consider the relation scheme $R=(E,F,G,H,I,J,K,L,M,N)$ and the set of functional dependencies $\{E,F\}\to\{G\}$, $\{F\}\to\{I,J\}$, $\{E,H\}\to\{K,L\}$, $\{K\}\to\{M\}$, $\{L\}\to\{N\}$ on R. What is the key for R?`,[raw`$\{E,F\}$`,raw`$\{E,F,H\}$`,raw`$\{E,F,H,K,L\}$`,raw`$\{E\}$`],{setNum:'1'}),
  question(37,2014,1,`Given the following statements:
S1: A foreign key declaration can always be replaced by an equivalent check assertion in SQL.
S2: Given the table R(a,b,c) where a and b together form the primary key, the following is a valid table definition.
[CODE]
Which one of the following statements is CORRECT?`,trueFalse,{setNum:'1',code:'CREATE TABLE S (\n  a INTEGER,\n  d INTEGER,\n  e INTEGER,\n  PRIMARY KEY (d),\n  FOREIGN KEY (a) references R)'}),
  question(38,2014,2,raw`Given the following two statements:
S1: Every table with two single-valued attributes is in 1NF, 2NF, 3NF and BCNF.
S2: $AB\to C,\ D\to E,\ E\to C$ is a minimal cover for the set of functional dependencies $AB\to C,\ D\to E,\ AB\to E,\ E\to C$.
Which one of the following is CORRECT?`,trueFalse,{setNum:'1'}),
  question(39,2014,1,raw`The maximum number of superkeys for the relation schema $R(E,F,G,H)$ with E as the key is ______.`,[],{setNum:'2'}),
  question(40,2014,1,raw`Given an instance of the STUDENTS relation as shown below:
$$\begin{array}{|r|l|l|c|c|}\hline\text{StudentID}&\text{StudentName}&\text{StudentEmail}&\text{StudentAge}&\text{CPI}\\\hline2345&\text{Shankar}&\text{shankar@math}&X&9.4\\1287&\text{Swati}&\text{swati@ee}&19&9.5\\7853&\text{Shankar}&\text{shankar@cse}&19&9.4\\9876&\text{Swati}&\text{swati@mech}&18&9.3\\8765&\text{Ganesh}&\text{ganesh@civil}&19&8.7\\\hline\end{array}$$
For (StudentName, StudentAge) to be a key for this instance, the value X should NOT be equal to ______.`,[],{setNum:'2',notes:['Table at the bottom of column one and concluding sentence at the top of column two on book page 606 are joined.']}),
  question(41,2014,1,raw`A prime attribute of a relation scheme R is an attribute that appears`,['in all candidate keys of R.','in some candidate key of R.','in a foreign key of R.','only in the primary key of R.'],{setNum:'3'}),
  question(42,2015,1,raw`Consider the relation $X(P,Q,R,S,T,U)$ with the following set of functional dependencies
$$F=\left\{\begin{array}{l}\{P,R\}\to\{S,T\}\\\{P,S,U\}\to\{Q,R\}\end{array}\right\}$$
Which of the following is the trivial functional dependency in $F^+$ is closure of F?`,[raw`$\{P,R\}\to\{S,T\}$`,raw`$\{P,R\}\to\{R,T\}$`,raw`$\{P,S\}\to\{S\}$`,raw`$\{P,S,U\}\to\{Q\}$`],{setNum:'3'}),
  question(43,2016,1,raw`Which of the following is NOT a superkey in a relational schema with attributes V, W, X, Y, Z and primary key V Y?`,[raw`$VXYZ$`,raw`$VWXZ$`,raw`$VWXY$`,raw`$VWXYZ$`],{setNum:'1'}),
  question(44,2016,1,raw`A database of research articles in a journal uses the following schema:
(VOLUME, NUMBER, STARTPAGE, ENDPAGE, TITLE, YEAR, PRICE)
The primary key is (VOLUME, NUMBER, STARTPAGE, ENDPAGE) and the following functional dependencies exist in the schema.
$(\text{VOLUME},\text{NUMBER},\text{STARTPAGE},\text{ENDPAGE})\to\text{TITLE}$
$(\text{VOLUME},\text{NUMBER})\to\text{YEAR}$
$(\text{VOLUME},\text{NUMBER},\text{STARTPAGE},\text{ENDPAGE})\to\text{PRICE}$
The database is redesigned to use the following schemas.
(VOLUME, NUMBER, STARTPAGE, ENDPAGE, TITLE, PRICE)
(VOLUME, NUMBER, YEAR)
Which is the weakest normal form that the new database satisfies, but the old one does not?`,['1NF','2NF','3NF','BCNF'],{setNum:'1'}),
  question(45,2017,1,raw`The following functional dependencies hold true for the relational schema $R\{V,W,X,Y,Z\}$:
$V\to W$
$VW\to X$
$Y\to VX$
$Y\to Z$
Which of the following is irreducible equivalent for this set of functional dependencies?`,[raw`$V\to W$; $V\to X$; $Y\to V$; $Y\to Z$`,raw`$V\to W$; $W\to X$; $Y\to V$; $Y\to Z$`,raw`$V\to W$; $V\to X$; $Y\to V$; $Y\to X$; $Y\to Z$`,raw`$V\to W$; $W\to X$; $Y\to V$; $Y\to X$; $Y\to Z$`],{setNum:'1',optLayout:'1col'}),
  question(46,2017,1,raw`Consider the following tables $T_1$ and $T_2$:
$$T_1:\begin{array}{|c|c|}\hline P&Q\\\hline2&2\\3&8\\7&3\\5&8\\6&9\\8&5\\9&8\\\hline\end{array}\qquad T_2:\begin{array}{|c|c|}\hline R&S\\\hline2&2\\8&3\\3&2\\9&7\\5&7\\7&2\\\hline\end{array}$$
In table $T_1$, P is the primary key and Q is the foreign key referencing R in table $T_2$ with on-delete cascade and on-update cascade. In table $T_2$, R is the primary key and S is the foreign key referencing P in table $T_1$ with on-delete set NULL and on-update cascade. In order to delete record $\langle3,8\rangle$ from table $T_1$, the number of additional records that need to be deleted from table $T_1$ is ______.`,[],{setNum:'2'}),
  question(47,2018,2,raw`Consider the following four relational schemas. For each schema, all non-trivial functional dependencies are listed. The underlined attributes are the respective primary keys.
Schema I: $\text{Registration}(\underline{\text{rollno}},\text{courses})$
Field 'courses' is a set-valued attribute containing the set of courses a student has registered for.
Non-trivial functional dependencies: $\text{rollno}\to\text{courses}$
Schema II: $\text{Registration}(\underline{\text{rollno},\text{courseid}},\text{email})$
Non-trivial functional dependencies: $\text{rollno},\text{courseid}\to\text{email}$; $\text{email}\to\text{rollno}$
Schema III: $\text{Registration}(\underline{\text{rollno},\text{courseid}},\text{marks},\text{grade})$
Non-trivial functional dependencies: $\text{rollno},\text{courseid}\to\text{marks},\text{grade}$; $\text{marks}\to\text{grade}$
Schema IV: $\text{Registration}(\underline{\text{rollno},\text{courseid}},\text{credit})$
Non-trivial functional dependencies: $\text{rollno},\text{courseid}\to\text{credit}$; $\text{courseid}\to\text{credit}$
Which one of the relational schemas above is in 3NF but not in BCNF?`,['Schema I','Schema II','Schema III','Schema IV'],{notes:['Schema II begins at the bottom of column one and continues in column two on book page 607.']}),
  question(48,2019,2,raw`Let the set of functional dependencies $F=\{QR\to S,\ R\to P,\ S\to Q\}$ hold on a relation schema $X=(PQRS)$. X is not in BCNF. Suppose X is decomposed into two schemas Y and Z where $Y=(PR)$ and $Z=(QRS)$.
Consider the two statements given below:
I. Both Y and Z are in BCNF
II. Decomposition of X into Y and Z is dependency preserving and lossless
Which of the above statements is/are correct?`,['I only','Neither I nor II','Both I and II','II only']),
  question(49,2020,2,raw`Consider a relational table R that is in 3NF, but not in BCNF. Which one of the following statements is TRUE?`,[raw`R has a non-trivial functional dependency $X\to A$, where X is not a superkey and A is a prime attribute.`,raw`R has a non-trivial functional dependency $X\to A$, where X is not a superkey and A is a non-prime attribute and X is a proper subset of any key.`,raw`R has a non-trivial functional dependency $X\to A$, where X is not a superkey and A is a non-prime attribute and X is not a proper subset of some key.`,`A cell in R holds a set instead of an atomic value.`]),
  question(50,2021,2,raw`Consider the relation $R(P,Q,S,T,X,Y,Z,W)$ with the following functional dependencies
$PQ\to X;\ P\to YX;\ Q\to Y;\ Y\to ZW$
Consider the decomposition of the relation R into the constituent relations according to the following two decomposition schemes.
$D_1:R=[(P,Q,S,T);\ (P,T,X);\ (Q,Y);\ (Y,Z,W)]$
$D_2:R=[(P,Q,S);\ (T,X);\ (Q,Y);\ (Y,Z,W)]$
Which of the following options is correct?`,[raw`$D_1$ is a lossy decomposition, but $D_2$ is a lossless decomposition.`,raw`Both $D_1$ and $D_2$ are lossless decompositions.`,raw`Both $D_1$ and $D_2$ are lossy decompositions.`,raw`$D_1$ is a lossless decomposition, but $D_2$ is a lossy decomposition.`],{setNum:'1'}),
  question(51,2021,1,raw`Consider the following statements $S_1$ and $S_2$ about the relational data model:
$S_1$: A relation schema can have at most one foreign key.
$S_2$: A foreign key in a relation scheme R cannot be used to refer to tuples of R.`,[raw`Both $S_1$ and $S_2$ are false.`,raw`$S_1$ is true and $S_2$ is false.`,raw`$S_1$ is false and $S_2$ is true.`,raw`Both $S_1$ and $S_2$ are true.`],{setNum:'2'}),
  question(52,2021,2,raw`Suppose the following functional dependencies hold on a relation U with attributes P, Q, R, S and T:
$P\to QR,\ RS\to T$
Which of the following functional dependencies can be inferred from the above functional dependencies?`,[raw`$PS\to T$`,raw`$P\to R$`,raw`$R\to T$`,raw`$PS\to Q$`],{setNum:'2'}),
  question(53,2022,1,'In a relational data model, which one of the following statements is TRUE?',['A relation with only two attributes is always in BCNF.','If all attributes of a relation are prime attributes, then the relation is in BCNF.','Every relation has at least one non-prime attribute.','BCNF decompositions preserve functional dependencies.']),
  question(54,2022,1,raw`Consider a relation $R(A,B,C,D,E)$ with the following functional dependencies.
$AB\to C;\ BC\to D;\ C\to E;$
The number of superkeys in the relation R is ______.`),
  question(55,2024,1,'Which of the following statements about a relation R in first normal form (1NF) is/are TRUE?',['R cannot have a composite attribute','R cannot have a foreign key','R can have a multi-attribute key','R cannot have more than one candidate key'],{setNum:'1'}),
  question(56,2024,2,raw`The symbol $\to$ indicates functional dependency in the context of a relational database. Which of the following options is/are TRUE?`,[raw`$(X\to Y\text{ and }Y\to Z)$ implies $X\to Z$`,raw`$(X,Y)\to(Z,W)$ implies $X\to(Z,W)$`,raw`$((X,Y)\to Z\text{ and }W\to Y)$ implies $(X,W)\to Z$`,raw`$(X,Y)\to(Z,W)$ implies $(X,Y)\to Z$`],{setNum:'2'}),
  question(57,2024,2,raw`A functional dependency $F:X\to Y$ is termed as a useful functional dependency if and only if it satisfies all the following three conditions:
* X is not the empty set.
* Y is not the empty set.
* Intersection of X and Y is the empty set.
For a relation R with 4 attributes, the total number of possible useful functional dependencies is ______.`,[],{setNum:'2'}),
]};
