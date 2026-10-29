const raw = String.raw;
const sourceHash = '1556421d5e7360aec7b13f66076ab2cdd803e4318e11e6755763b6ded4208ec7';
function question(number, year, marks, text, options = [], extra = {}) {
  const {notes = [], ...fields} = extra;
  const bookPages = number <= 8 ? [632] : number === 9 ? [632,633] : number <= 12 ? [633] : number === 13 ? [633,634] : number <= 18 ? [634] : number === 19 ? [634,635] : number <= 24 ? [635] : number <= 29 ? [636] : number === 30 ? [636,637] : [637];
  return {
    id:`madeeasy-dbms-relational-model-4-${number}`, text, code:'', year:String(year), marks:String(marks), setNum:'', examPaper:'CS',
    rawTopic:'Relational Model: Relational Algebra and Tuple Calculus', diagram:'', ext:'.png',
    optA:options[0]||'',optB:options[1]||'',optC:options[2]||'',optD:options[3]||'',
    questionType:options.length?'MCQ':'NAT',correctOptions:[],natAnswer:'',
    isBlank:false,isPosLocked:false,isCodeOptions:false,isProof:false,needsManualOptionFix:false,optLayout:'auto',tempPaste:'',...fields,
    source:{file:'12. DBMS/4. Relational Model.pdf',sha256:sourceHash,questionNumber:`4.${number}`,bookPages,
      pdfPages:[...new Set(bookPages.map(p=>p<=633?1:p<=635?2:3))],answerKeyPdfPage:null,answerKeyStatus:'not-supplied',
      notes:['All three scanned PDF spreads visually reviewed. No answer key supplied; no answer inferred.',
        ...(bookPages.includes(632)?['Opening book folio 632 inferred from the facing printed folio 633.']:[]),...notes]},
  };
}
const suppliers = raw`Common Data for Questions 4.20 and 4.21:
Consider the following relational schema:
$\mathrm{Suppliers}(\underline{\mathrm{sid:integer}},\mathrm{sname:string},\mathrm{city:string},\mathrm{street:string})$
$\mathrm{Parts}(\underline{\mathrm{pid:integer}},\mathrm{pname:string},\mathrm{color:string})$
$\mathrm{Catalog}(\underline{\mathrm{sid:integer},\mathrm{pid:integer}},\mathrm{cost:real})$
`;
const studentTable = raw`\begin{array}{|r|l|r|r|}\hline
\mathrm{Roll}&\mathrm{Name}&\mathrm{Hostel}&\mathrm{Marks}\\\hline
1798&\text{Manoj Rathod}&7&95\\2154&\text{Soumic Banerjee}&5&68\\2369&\text{Gumma Reddy}&7&86\\2581&\text{Pradeep Pendse}&6&92\\2643&\text{Suhas Kulkarni}&5&78\\2711&\text{Nitin Kadam}&8&72\\2872&\text{Kiran Vora}&5&92\\2926&\text{Manoj Kunkalikar}&5&94\\2959&\text{Hemant Karkhanis}&7&88\\3125&\text{Rajesh Doshi}&5&82\\\hline\end{array}`;
const hobbyTable = raw`\begin{array}{|r|l|}\hline\mathrm{Roll}&\mathrm{Hobbyname}\\\hline
1798&\text{chess}\\1798&\text{music}\\2154&\text{music}\\2369&\text{swimming}\\2581&\text{cricket}\\2643&\text{chess}\\2643&\text{hockey}\\2711&\text{volleyball}\\2872&\text{football}\\2926&\text{cricket}\\2959&\text{photography}\\3125&\text{music}\\3125&\text{chess}\\\hline\end{array}`;

// Continue tall editable tables in adjacent blocks, keeping the printed row order.
function tableBlocks(table, rowsPerBlock) {
  const parts = table.split(raw`\\\hline`);
  if (parts.length !== 3) throw new Error('Unexpected reviewed table structure');
  const rows = parts[1].trim().split(raw`\\`);
  return Array.from({length:Math.ceil(rows.length/rowsPerBlock)},(_,i)=>
    parts[0]+raw`\\\hline`+rows.slice(i*rowsPerBlock,(i+1)*rowsPerBlock).join(raw`\\`)+raw`\\\hline`+parts[2]).join(raw`\quad `);
}
export const DBMS_RELATIONAL_MODEL_IMPORT = {
  subject:'12. DBMS',chapter:'4. Relational Model',sourceHash,
  questions:[
    question(1,1996,2,raw`A library relational database system uses the following schema
USERS (User#, UserName, HomeTown)
BOOK (Book#, BookTitle, AuthorName)
ISSUED (Book#, User#, Date)
Explain in one English sentence, what each of the following relational algebra queries is designed to determine.
(a) $\sigma_{\mathrm{User\#}=6}(\pi_{\mathrm{User\#},\mathrm{BookTitle}}((\mathrm{USERS}\bowtie\mathrm{ISSUED})\bowtie\mathrm{BOOK}))$
(b) $\sigma_{\mathrm{AuthorName}}(\mathrm{BOOK}\bowtie(\sigma_{\mathrm{HomeTown}=\mathrm{Delhi}}(\mathrm{USERS}\bowtie\mathrm{ISSUED})))$`,[],{questionType:'SUBJECTIVE',isProof:true,notes:['Two descriptive subparts, not MCQ options. Part (b) prints sigma with AuthorName; preserved without replacing it with projection.']}),
    question(2,1998,2,raw`Which of the following query transformations (i.e. replacing the LHS expression by the RHS expression) is incorrect? $R_1$ and $R_2$ are relations, $C_1,C_2$ are selection conditions and $A_1,A_2$ are attributes of $R_1$?`,[
      raw`$\sigma_{c_1}(\sigma_{c_2}(R_1))\to\sigma_{c_2}(\sigma_{c_1}(R_1))$`,
      raw`$\sigma_{c_1}(\pi_{A_1}(R_1))\to\pi_{A_1}(\sigma_{c_1}(R_1))$`,
      raw`$\sigma_{c_1}(R_1\cup R_2)\to\sigma_{c_1}(R_1)\cup\sigma_{c_1}(R_2)$`,
      raw`$\pi_{A_1}(\sigma_{c_1}(R_1))\to\sigma_{c_1}(\pi_{A_1}(R_1))$`],{optLayout:'1col'}),
    question(3,1999,1,raw`Consider the join of a relation R with a relation S. If R has m tuples and S has n tuples then the maximum and minimum sizes of the join respectively are`,[raw`$m+n$ and $0$`,raw`$mn$ and $0$`,raw`$m+n$ and $|m-n|$`,raw`$mn$ and $m+n$`]),
    question(4,1999,1,raw`The relational algebra expression equivalent to the following tuple calculus expression:
$\{t\mid t\in r\land(t[A]=10\land t[B]=20)\}$ is`,[
      raw`$\sigma_{(A=10\lor B=20)}(r)$`,raw`$\sigma_{(A=10)}(r)\cup\sigma_{(B=20)}(r)$`,raw`$\sigma_{(A=10)}(r)\cap\sigma_{(B=20)}(r)$`,raw`$\sigma_{(A=10)}(r)-\sigma_{(B=20)}(r)$`],{optLayout:'1col'}),
    question(5,2000,1,raw`Given the relations:
employee (name, salary, deptno), and
department (deptno, deptname, address)
Which of the following queries cannot be expressed using the basic relational algebra operations $(\sigma,\pi,\times,\bowtie,\cup,\cap,-)$?`,['Department address of every employee','Employees whose name is the same as their department name','The sum of all employees salaries','All employees of a given department']),
    question(6,2001,2,'Which of the following relational calculus expressions is not safe?',[
      raw`$\{t\mid\exists u\in R_1\,(t[A]=u[A])\land\neg\exists s\in R_2\,(t[A]=s[A])\}$`,
      raw`$\{t\mid\forall u\in R_1\,(u[A]=\text{"x"}\Rightarrow\exists s\in R_2\,(t[A]=s[A]\land s[A]=u[A]))\}$`,
      raw`$\{t\mid\neg(t\in R_1)\}$`,
      raw`$\{t\mid\exists u\in R_1\,(t[A]=u[A])\land\exists s\in R_2\,(t[A]=s[A])\}$`],{optLayout:'1col'}),
    question(7,2002,1,'With regard to the expressive power of the formal relational query languages, which of the following statements is true?',['Relational algebra is more powerful than relational calculus','Relational algebra has the same power as relational calculus','Relational algebra has the same power as safe relational calculus','None of the above']),
    question(8,2004,1,raw`Let $R_1(\underline{A},B,C)$ and $R_2(\underline{D},E)$ be two relation schemas, where the primary keys are shown underlined, and let C be a foreign key in $R_1$ referring to $R_2$. Suppose there is no violation of the above referential integrity constraint in the corresponding relation instances $r_1$ and $r_2$. Which one of the following relational algebra expressions would necessarily produce an empty relation?`,[
      raw`$\Pi_D(r_2)-\Pi_C(r_1)$`,raw`$\Pi_C(r_1)-\Pi_D(r_2)$`,raw`$\Pi_D(r_1\bowtie_{C\ne D}R_2)-\Pi_C(r_1)$`,raw`$\Pi_C(r_1\bowtie_{C=D}R_2)$`],{notes:['Options (c)/(d) print uppercase R2 although the stem names the instance r2; retained.']}),
    question(9,2004,2,raw`Consider the relation $\mathrm{Student}(\underline{\mathrm{name}},\mathrm{sex},\mathrm{marks})$, where the primary key is shown underlined, pertaining to students in a class that has at least one boy and one girl. What does the following relational algebra expression produce?
(Note: $\rho$ is rename operator)
$$\begin{aligned}
&\Pi_{\mathrm{name}}(\sigma_{\mathrm{sex}=\mathrm{female}}(\mathrm{Student}))-\\
&\Pi_{\mathrm{name}}(\mathrm{Student}\bowtie_{(\mathrm{sex}=\mathrm{female}\land x=\mathrm{male}\land\mathrm{marks}\le m)}\rho_{n,x,m}(\mathrm{Student}))
\end{aligned}$$`,['names of girl students with the highest marks','names of girl students with more marks than some boy student','names of girl students with marks not less than some boy student','names of girl students with more marks than all the boy students'],{notes:['Stem continues from book page 632 to page 633; both folios recorded.']}),
    question(10,2005,1,raw`Let r be a relation instance with schema $R=(A,B,C,D)$. We define $r_1=\Pi_{A,B,C}(r)$ and $r_2=\Pi_{A,D}(r)$. Let $S=r_1*r_2$ where $*$ denotes natural join. Given that the decomposition of r into $r_1$ and $r_2$ is lossy, which one of the following is TRUE?`,[raw`$s\subset r$`,raw`$r\cup s=r$`,raw`$r\subset s$`,raw`$r*s=s$`],{notes:['Capital S in the definition and lowercase s in the options are preserved.']}),
    question(11,2005,2,raw`A table 'student' with schema (roll, name, hostel, marks), and another table 'hobby' with schema (roll, hobbyname) contains records as shown below:
Table Student (first block) and Table Hobby (last two blocks); rows continue from left to right:
$$`+studentTable+raw`\qquad `+tableBlocks(hobbyTable,7)+raw`$$
The following SQL query is executed on the above tables:
[CODE]
Relations S and H with the same schema as those of the two tables respectively contain the same information as tuples. A new relation $S'$ is obtained by the following relational algebra operation:
$$S'=\Pi_{\mathrm{hostel}}((\sigma_{\mathrm{S.roll}=\mathrm{H.roll}}(\sigma_{\mathrm{marks}>75\ \mathrm{and}\ \mathrm{roll}>2000\ \mathrm{and}\ \mathrm{roll}<3000}(S)))\times(H))$$
The difference between the number of rows output by the SQL statement and the number of tuples in $S'$ is`,['6','4','2','0'],{
      code:'select hostel\nfrom student natural join hobby\nwhere marks >= 75 and roll between 2000 and\n3000;',
      notes:['All 10 student and 13 hobby rows transcribed. SQL >=75/BETWEEN and algebra >75/strict roll bounds retained as printed. The printed algebra closes the selection before the cross product; parentheses retained.']}),
    question(12,2006,1,'Which of the following relational query languages have the same expressive power?\nI. Relational algebra.\nII. Tuple relational calculus restricted to safe expressions.\nIII. Domain relational calculus restricted to safe expressions.',['II and III only','I and II only','I and III only','I, II and III']),
    question(13,2006,2,raw`Consider the relation enrolled (student, course) in which (student, course) is the primary key, and the relation paid (student, amount) where student is the primary key. Assume no null values and no foreign keys or integrity constraints. Assume that amounts 6000, 7000, 8000, 9000 and 10000 were each paid by 20% of the students. Consider these query plans (Plan 1 on left, Plan 2 on right) to "list all courses taken by students who have paid more than x."
[IMG_1]
A disk seek takes 4 ms. disk data transfer bandwidth is 300 MB/s and checking a tuple to see if amount is greater than x takes $10\,\mu\mathrm{s}$. Which of the following statements is correct?`,['Plan 1 and Plan 2 will not output identical row sets for all databases','A course may be listed more than once in the output of Plan 1 for some databases','For x = 5000, Plan 1 executes faster than Plan 2 for all databases','For x = 9000, Plan 1 executes slower than Plan 2 for all databases'],{diagram:'relational-model-4-13',notes:['Query-plan figure is a diagram-only source crop. Stem and options continue onto the following spread/book page 634.']}),
    question(14,2007,2,raw`Consider a selection of the form $\sigma_{A\le100}(r)$, where r is a relation with 1000 tuples. Assume that the attribute values for A among the tuples are uniformly distributed in the interval [0, 500]. Which one of the following options is the best estimate of the number of tuples returned by the given selection query?`,['50','100','150','200']),
    question(15,2007,2,raw`Consider the following relation schemas:
b-Schema = (b-name, b-city, assets)
a-Schema = (a-num, b-name, bal)
d-Schema = (c-name, a-number)
Let branch, account and depositor be respectively instances of the above schemas. Assume that account and depositor relations are much bigger than the branch relation.
Consider the following query:
$$\Pi_{\text{c-name}}(\sigma_{\text{b-city}=\text{"Agra"}\land\mathrm{bal}<0}(\mathrm{branch}\bowtie(\mathrm{account}\bowtie\mathrm{depositor})))$$
Which of the following queries is the most efficient version of the above query?`,[
      raw`$\Pi_{\text{c-name}}(\sigma_{\mathrm{bal}<0}(\sigma_{\text{b-city}=\text{"Agra"}}\mathrm{branch}\bowtie\mathrm{account})\bowtie\mathrm{depositor})$`,
      raw`$\Pi_{\text{c-name}}(\sigma_{\text{b-city}=\text{"Agra"}}\mathrm{branch}\bowtie(\sigma_{\mathrm{bal}<0}\mathrm{account}\bowtie\mathrm{depositor}))$`,
      raw`$\Pi_{\text{c-name}}(\sigma_{\text{b-city}=\text{"Agra"}}\mathrm{branch}\bowtie\sigma_{\text{b-city}=\text{"Agra"}\land\mathrm{bal}<0}\mathrm{account}\bowtie\mathrm{depositor})$`,
      raw`$\Pi_{\text{c-name}}(\sigma_{\text{b-city}=\text{"Agra"}}\mathrm{branch}\bowtie(\sigma_{\text{b-city}=\text{"Agra"}\land\mathrm{bal}<0}\mathrm{account}\bowtie\mathrm{depositor}))$`],{optLayout:'1col',notes:['a-num versus a-number in the printed schemas is preserved.']}),
    question(16,2007,2,raw`Information about a collection of students is given by the relation $\mathrm{studInfo}(\underline{\mathrm{studId}},\mathrm{name},\mathrm{sex})$. The relation $\mathrm{enroll}(\underline{\mathrm{studId},\mathrm{CourseId}})$ gives which student has enrolled for (or taken) what course(s). Assume that every course is taken by at least one male and at least one female student. What does the following relational algebra expression represent?
$$\Pi_{\mathrm{courseId}}((\Pi_{\mathrm{studId}}(\sigma_{\mathrm{sex}=\text{"female"}}(\mathrm{studInfo}))\times\Pi_{\mathrm{courseId}}(\mathrm{enroll}))-\mathrm{enroll})$$`,['Courses in which all the female students are enrolled','Courses in which a proper subset of female students are enrolled','Courses in which only male students are enrolled','None of the above'],{notes:['CourseId/courseId capitalization retained as printed; expression continues at the next column.']}),
    question(17,2007,2,raw`Consider the relation $\mathrm{employee}(\underline{\mathrm{name}},\mathrm{sex},\mathrm{supervisorName})$ with name as the key. supervisorName gives the name of the supervisor of the employee under consideration. What does the following Tuple Relational Calculus query produce?
$$\{e.\mathrm{name}\mid\mathrm{employee}(e)\land(\forall x)[\neg\mathrm{employee}(x)\lor x.\mathrm{supervisorName}\ne e.\mathrm{name}\lor x.\mathrm{sex}=\text{"male"}]\}$$`,['Names of employees with a male supervisor','Names of employees with no immediate male subordinates','Names of employees with no immediate female subordinates','Names of employees with a female supervisor']),
    question(18,2008,2,raw`Let R and S be two relations with the following schema:
$R(\underline{P,Q},R1,R2,R3)$
$S(\underline{P,Q},S1,S2)$
where $\{P,Q\}$ is the key for both schemas. Which of the following queries are equivalent?
I. $\Pi_P(R\bowtie S)$
II. $\Pi_P(R)\bowtie\Pi_P(S)$
III. $\Pi_P(\Pi_{P,Q}(R)\cap\Pi_{P,Q}(S))$
IV. $\Pi_P(\Pi_{P,Q}(R)-(\Pi_{P,Q}(R)-\Pi_{P,Q}(S)))$`,['Only I and II','Only I and III','Only I, II and III','Only I, III and IV']),
    question(19,2009,2,raw`Let R and S be relational schemes such that $R=\{a,b,c\}$ and $S=\{c\}$. Now consider the following queries on the database:
I. $\pi_{R-S}(r)-\pi_{R-S}(\pi_{R-S}(r)\times S-\pi_{R-S,S}(r))$
II. $\{t\mid t\in\pi_{R-S}(r)\land\forall u\in s(\exists v\in r(u=v[s]\land t=v[R-S]))\}$
III. $\{t\mid t\in\pi_{R-S}(r)\land\forall v\in r(\exists u\in s(u=v[s]\land t=v[R-S]))\}$
IV.
[CODE]
Which of the above queries are equivalent?`,['I and II','I and III','II and IV','III and IV'],{code:'Select R.a, R.b\nfrom R, S\nwhere R.c = S.c',notes:['Question spans book pages 634-635. Formula I prints capital S as the cross-product operand and R-S,S as the final projection subscript; formulas II/III print v[s]. These source inconsistencies are preserved.']}),
    question(20,2009,2,suppliers+`Consider the following relational query on the above database:
[CODE]
Assume that relations corresponding to the above schema are not empty. Which one of the following is the correct interpretation of the above query?`,['Find the names of all suppliers who have supplied a non-blue part','Find the names of all suppliers who have not supplied a non-blue part','Find the names of all suppliers who have supplied only blue parts','Find the names of all suppliers who have not supplied only blue parts'],{code:"SELECT S.sname\nFROM Suppliers S\nWHERE S.sid NOT IN (SELECT C.sid\n    FROM Catalog C\n    WHERE C.pid NOT IN (SELECT P.pid\n        FROM Parts P\n        WHERE P.color <> 'blue'))"}),
    question(21,2009,2,suppliers+'Assume that, in the suppliers relation above, each supplier and each street within a city has a unique name, and (sname, city) forms a candidate key. No other functional dependencies are implied other than those implied by primary and candidate keys. Which one of the following is TRUE about the above schema?',['The schema is in BCNF','The schema is in 3NF but not in BCNF','The schema is in 2NF but not in 3NF','The schema is not in 2NF'],{notes:['Complete common schema repeated so this question is independently editable/exportable.']}),
    question(22,2012,2,raw`Suppose $R_1(A,B)$ and $R_2(C,D)$ are two relation schemes. Let $r_1$ and $r_2$ be the corresponding relation instances. B is a foreign key that refers to C in $R_2$. If data in $r_1$ and $r_2$ satisfy referential integrity constraints, which of the following is ALWAYS TRUE?`,[raw`$\Pi_B(r_1)-\Pi_C(r_2)=\phi$`,raw`$\Pi_C(r_2)-\Pi_B(r_1)=\phi$`,raw`$\Pi_B(r_1)=\Pi_C(r_2)$`,raw`$\Pi_B(r_1)-\Pi_C(r_2)\ne\phi$`]),
    question(23,2013,2,raw`Consider the following relational schema:
$\mathrm{Student}(\underline{\mathrm{rollno:integer}};\ \mathrm{sname\ string})$
$\mathrm{Courses}(\underline{\mathrm{courseno:integer}},\mathrm{cname:string})$
$\mathrm{Registration}(\underline{\mathrm{rollno:integer},\mathrm{courseno:integer}},\mathrm{percent:real})$
Which of the following queries are equivalent to this query in English?
"Find the distinct names of all students who score more than 90% in the course numbered 107"
I.
[CODE]
II. $\Pi_{\mathrm{sname}}(\sigma_{\mathrm{courseno}=107\land\mathrm{percent}>90}(\mathrm{Regis\text{-}tration}\bowtie\mathrm{Student}))$
III.
$$\begin{aligned}&\{T\mid\exists S\in\mathrm{Students},\exists R\in\mathrm{Registration}\\
&(S.\mathrm{rollno}=R.\mathrm{rollno}\land R.\mathrm{courseno}=107\\
&\land R.\mathrm{percent}>90\land T.\mathrm{sname}=S.\mathrm{sname})\}\end{aligned}$$
IV.
$$\begin{aligned}&\{\langle S_N\rangle\mid\exists S_R\exists R_P(\langle S_R,S_N\rangle\in\mathrm{Student}\\
&\land\langle S_R,107,R_P\rangle\in\mathrm{Registration}\land R_P>90)\}\end{aligned}$$`,['I, II, III and IV','I, II and III only','I, II and IV only','I, III and IV only'],{code:'SELECT DISTINCT S.sname\nFROM Students as S, Registration as R\nWHERE R.rollno=S.roll.no AND\nR.courseno=107 and R.percent>90',notes:['Printed Student/Students, rollno/roll.no and Regis-tration naming retained; no silent SQL/schema repairs.']}),
    question(24,2014,2,raw`Consider a join (relation algebra) between relations $r(R)$ and $s(S)$ using the nested loop method. There are 3 buffers each of size equal to disk block size, out of which one buffer is reserved for intermediate results.
Assuming $\mathrm{size}(r(R))<\mathrm{size}(s(S))$, the join will have fewer number of disk block accesses if`,['relation r(R) is in the outer loop.','relation s(S) is in the outer loop.','join selection factor between r(R) and s(S) is more than 0.5.','join selection factor between r(R) and s(S) is less than 0.5.'],{setNum:'2'}),
    question(25,2014,2,raw`Consider the relational schema given below, where eId of the dependent is a foreign key referring to empId of the relation employee. Assume that every employee has at least one associated dependent in the dependent relation.
$\mathrm{employee}(\underline{\mathrm{empId}},\mathrm{empName},\mathrm{empAge})$
$\mathrm{dependent}(\underline{\mathrm{depId},\mathrm{eId}},\mathrm{depName},\mathrm{depAge})$
Consider the following relational algebra query:
$$\Pi_{\mathrm{empId}}(\mathrm{employee})-\Pi_{\mathrm{empId}}(\mathrm{employee}\bowtie_{(\mathrm{empId}=\mathrm{eId})\land(\mathrm{empAge}\le\mathrm{depAge})}\mathrm{dependent})$$
The above query evaluates to the set of empIds of employees whose age is greater than that of`,['some dependent.','all dependents.','some of his/her dependents.','all of his/her dependents.'],{setNum:'3'}),
    question(26,2015,1,raw`Consider two relations $R_1(A,B)$ with the tuples (1, 5), (3, 7) and $R_2(A,C)=(1,7),(4,9)$.
Assume that R(A,B,C) is the full natural outer join of $R_1$ and $R_2$. Consider the following tuples of the form (A,B,C): a = (1, 5, null), b = (1, null, 7), c = (3, null, 9), d = (4, 7, null), e = (1, 5, 7), f = (3, 7, null), g = (4, null, 9). Which of the following statements is correct?`,['R contains a, b, e, f, g but not c, d','R contains all of a, b, c, d, e, f, g','R contains e, f, g but not a, b','R contains e but not f, g'],{setNum:'2'}),
    question(27,2017,1,raw`Consider a database that has the relation schemas EMP(EmpId, EmpName, Deptid) and DEPT(DeptName, Deptid). Note that the Deptid can be permitted to be NULL in the relation EMP. Consider the following queries on the database expressed in tuple relational calculus.
I. $\{t\mid\exists u\in\mathrm{EMP}(t[\mathrm{EmpName}]=u[\mathrm{EmpName}]\land\forall v\in\mathrm{DEPT}(t[\mathrm{DeptId}]\ne v[\mathrm{DeptId}]))\}$
II. $\{t\mid\exists u\in\mathrm{EMP}(t[\mathrm{EmpName}]=u[\mathrm{EmpName}]\land\exists v\in\mathrm{DEPT}(t[\mathrm{DeptId}]\ne v[\mathrm{DeptId}]))\}$
III. $\{t\mid\exists u\in\mathrm{EMP}(t[\mathrm{EmpName}]=u[\mathrm{EmpName}]\land\exists v\in\mathrm{DEPT}(t[\mathrm{DeptId}]=v[\mathrm{DeptId}]))\}$
Which of the above queries are safe?`,['I and II only','I and III only','II and III only','I, II and III'],{setNum:'1',notes:['Deptid/DeptId capitalization retained.']}),
    question(28,2017,2,raw`Consider a database that has the relation schema CR(StudentName, CourseName). An instance of the schema CR is given below:
CR (rows continue from left to right)
$$`+tableBlocks(raw`\begin{array}{|c|c|}\hline\text{Student Name}&\text{Course Name}\\\hline
\mathrm{SA}&\mathrm{CA}\\\mathrm{SA}&\mathrm{CB}\\\mathrm{SA}&\mathrm{CC}\\\mathrm{SB}&\mathrm{CB}\\\mathrm{SB}&\mathrm{CC}\\\mathrm{SC}&\mathrm{CA}\\\mathrm{SC}&\mathrm{CB}\\\mathrm{SC}&\mathrm{CC}\\\mathrm{SD}&\mathrm{CA}\\\mathrm{SD}&\mathrm{CB}\\\mathrm{SD}&\mathrm{CC}\\\mathrm{SD}&\mathrm{CD}\\\mathrm{SE}&\mathrm{CD}\\\mathrm{SE}&\mathrm{CA}\\\mathrm{SE}&\mathrm{CB}\\\mathrm{SF}&\mathrm{CA}\\\mathrm{SF}&\mathrm{CB}\\\mathrm{SF}&\mathrm{CC}\\\hline\end{array}`,9)+raw`$$
The following query is made on the database.
$$\begin{aligned}T_1&\leftarrow\pi_{\mathrm{CourseName}}(\sigma_{\mathrm{StudentName}=\text{'SA'}}(\mathrm{CR}))\\T_2&\leftarrow\mathrm{CR}\div T_1\end{aligned}$$
The number of rows in $T_2$ is ______.`,[],{setNum:'1',notes:['All 18 CR rows stored as editable LaTeX in printed order.']}),
    question(29,2018,2,raw`Consider the relations $r(A,B)$ and $s(B,C)$, where s.B is a primary key and r.B is a foreign key referencing s.B. Consider the query
$$Q:r\bowtie(\sigma_{B<5}(s))$$
Let LOJ denote the natural left outer-join operation. Assume that r and s contain no null values.
Which one of the following queries is NOT equivalent to Q?`,[raw`$\sigma_{B<5}(r\bowtie s)$`,raw`$\sigma_{B<5}(r\;\mathrm{LOJ}\;s)$`,raw`$r\;\mathrm{LOJ}\;(\sigma_{B<5}(s))$`,raw`$\sigma_{B<5}(r)\;\mathrm{LOJ}\;s$`]),
    question(30,2019,2,raw`Consider the following relations P(X, Y, Z), Q(X, Y, T) and R(Y, V).
$$\begin{array}{c}\mathrm{P}\\\begin{array}{|c|c|c|}\hline X&Y&Z\\\hline X1&Y1&Z1\\X1&Y1&Z2\\X2&Y2&Z2\\X2&Y4&Z4\\\hline\end{array}\end{array}\quad
\begin{array}{c}\mathrm{Q}\\\begin{array}{|c|c|c|}\hline X&Y&T\\\hline X2&Y1&2\\X1&Y2&5\\X1&Y1&6\\X3&Y3&1\\\hline\end{array}\end{array}\quad
\begin{array}{c}\mathrm{R}\\\begin{array}{|c|c|}\hline Y&V\\\hline Y1&V1\\Y3&V2\\Y2&V3\\Y2&V2\\\hline\end{array}\end{array}$$
How many tuples will be returned by the following relational algebra query?
$$\begin{aligned}&\Pi_X(\sigma_{(\mathrm{P.Y}=\mathrm{R.Y}\land\mathrm{R.V}=\mathrm{V2})}(\mathrm{P}\times\mathrm{R}))-\\&\Pi_X(\sigma_{(\mathrm{Q.Y}=\mathrm{R.Y}\land\mathrm{Q.T}>2)}(\mathrm{Q}\times\mathrm{R}))\end{aligned}$$`,[],{notes:['Tables on book page 636; expression continues on page 637. All relation rows are editable LaTeX.']}),
    question(31,2021,1,raw`A relation $r(A,B)$ in a relational database has 1200 tuples. The attribute A has integer values ranging from 6 to 20, and the attribute B has integer values ranging from 1 to 20. Assume that the attributes A and B are independently distributed.
The estimated number of tuples in the output of $\sigma_{(A>10)\lor(B=18)}(r)$ is ______.`,[],{setNum:'1'}),
    question(32,2021,2,raw`The following relation records the age of 500 employees of a company, where empNo (indicating the employee number) is the key:
$\mathrm{empAge}(\underline{\mathrm{empNo}},\mathrm{age})$
Consider the following relational algebra expression:
$$\Pi_{\mathrm{empNo}}(\mathrm{empAge}\bowtie_{(\mathrm{age}>\mathrm{age1})}\rho_{\mathrm{empNo1},\mathrm{age1}}(\mathrm{empAge}))$$
What does the above expression generate?`,['Employee numbers of all employees whose age is not the minimum.','Employee numbers of all employees whose age is the minimum.','Employee numbers of only those employees whose age is the maximum.','Employee numbers of only those employees whose age is more than the age of exactly one other employee.'],{setNum:'1'}),
    question(33,2022,1,raw`Consider the following three relations in a relational database.
$\mathrm{Employee}(\underline{\mathrm{eId}},\mathrm{Name}),\ \mathrm{Brand}(\underline{\mathrm{bId}},\mathrm{bName}),\ \mathrm{Own}(\underline{\mathrm{eId},\mathrm{bId}})$
Which of the following relational algebra expressions return the set of eIds who own all the brands?`,[
      raw`$\pi_{\mathrm{eId}}(\pi_{\mathrm{eId},\mathrm{bId}}(\mathrm{Own})/\pi_{\mathrm{bId}}(\mathrm{Brand}))$`,
      raw`$\pi_{\mathrm{eId}}(\mathrm{Own})-\pi_{\mathrm{eId}}((\pi_{\mathrm{eId}}(\mathrm{Own})\times\pi_{\mathrm{bId}}(\mathrm{Brand}))-\pi_{\mathrm{eId},\mathrm{bId}}(\mathrm{Own}))$`,
      raw`$\pi_{\mathrm{eId}}(\pi_{\mathrm{eId},\mathrm{bId}}(\mathrm{Own})/\pi_{\mathrm{bId}}(\mathrm{Own}))$`,
      raw`$\pi_{\mathrm{eId}}((\pi_{\mathrm{eId}}(\mathrm{Own})\times\pi_{\mathrm{bId}}(\mathrm{Own}))/\pi_{\mathrm{bId}}(\mathrm{Brand}))$`],{questionType:'MSQ',optLayout:'1col',paperQuestionNumber:'25',notes:['MSQ type verified against official GATE 2022 CS Q25, in the Q23-Q27 MSQ section: https://gate2026.iitg.ac.in/doc/download/2022/cs_2022.pdf . No external answer key used.']}),
    question(34,2023,1,'Which of the options given below refers to the degree (or arity) of a relation in relational database systems?',['Number of attributes of its relation schema.','Number of tuples stored in the relation.','Number of entries in the relation.','Number of distinct domains of its relation schema.']),
    question(35,2024,1,raw`Consider the following two relations, $R(A,B)$ and $S(A,C)$:
$$\begin{array}{c}R\\\begin{array}{|c|c|}\hline A&B\\\hline10&20\\20&30\\30&40\\30&50\\50&95\\\hline\end{array}\end{array}\qquad
\begin{array}{c}S\\\begin{array}{|c|c|}\hline A&B\\\hline10&90\\30&45\\40&80\\\hline\end{array}\end{array}$$
The total number of tuples obtained by evaluating the following expression
$$\sigma_{B<C}(R\bowtie_{\mathrm{R.A}=\mathrm{S.A}}S)$$
is ______.`,[],{setNum:'1',notes:['Printed S table header is A,B, while stem specifies S(A,C) and selection uses C. Preserved the table header B without correction.']}),
    question(36,2024,2,raw`The relation schema, $\mathrm{Person}(\underline{\mathrm{pid}},\mathrm{city})$, describes the city of residence for every person uniquely identified by pid. The following relational algebra operators are available: selection, projection, cross product, and rename.
To find the list of cities where at least 3 persons reside, using the above operators, the minimum number of cross product operations that must be used is`,['1','2','4','3'],{setNum:'2'}),
  ],
};
