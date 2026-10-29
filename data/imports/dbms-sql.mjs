const raw = String.raw;
const sourceHash = '1d2a0491e11bf9150cee1fd246a9b33e8ee26d64ed23964b3588fef3ddeb8cd3';
// Tables are editable mathematics, including printed keys and misspelled headers.
function table(headers, rows) {
  const cell = v => String(v).startsWith('$') ? String(v).slice(1,-1) : raw`\text{${String(v).replaceAll('_',raw`\_`)}}`;
  return '$$'+raw`\begin{array}{|${'c|'.repeat(headers.length)}}\hline `+
    [headers,...rows].map(row=>row.map(cell).join('&')).join(raw`\\\hline `)+raw`\\\hline\end{array}`+'$$';
}
function beside(tables) {
  return '$$'+raw`\begin{array}{${'c'.repeat(tables.length)}}`+
    tables.map(([label])=>raw`\text{${label}}`).join('&')+raw`\\`+
    tables.map(([,body])=>body.slice(2,-2)).join('&')+raw`\end{array}`+'$$';
}
function question(n,year,marks,text,options=[],extra={}) {
  const {notes=[],...fields}=extra;
  const bookPages = n<=7?[616]:n<=12?[617]:n<=14?[618]:n<=19?[619]:n<=24?[620]:n<=30?[621]:n<=35?[622]:n<=39?[623]:[624];
  if(n===7)bookPages.push(617);
  if(n===12)bookPages.push(618);
  if(n===15||n===16)bookPages.unshift(618);
  if(n===30)bookPages.push(622);
  if(n===39)bookPages.push(624);
  const pdfPages=[...new Set(bookPages.map(p=>Math.floor((p-616)/2)+1))];
  return {id:`madeeasy-dbms-sql-3-${n}`,text,code:'',year:String(year),marks:String(marks),setNum:'',examPaper:'CS',
    rawTopic:'Structured Query Language (SQL)',diagram:'',ext:'.png',optA:options[0]||'',optB:options[1]||'',optC:options[2]||'',optD:options[3]||'',
    questionType:options.length?'MCQ':'NAT',correctOptions:[],natAnswer:'',isBlank:false,isPosLocked:false,isCodeOptions:false,isProof:false,
    needsManualOptionFix:false,optLayout:'auto',tempPaste:'',...fields,
    source:{file:'12. DBMS/3. Structure Query Language.pdf',sha256:sourceHash,questionNumber:`3.${n}`,bookPages,pdfPages,answerKeyPdfPage:5,
      notes:['All five scanned PDF spreads visually reviewed. Answer key: PDF page 5, book page 625. Tables transcribed as editable LaTeX.',
        ...(n<=7?['Chapter-opening book page 616 inferred from the facing printed folio 617.']:[]),...notes]}};
}
const drivers = `Directions for Questions 3.15 to 3.16:\nConsider a database with three relation instances shown below. The primary keys for the Drivers and Cars relation are did and cid respectively and the records are stored in ascending order of these primary keys as given in the tables. No indexing is available in the database.\n`+beside([
  ['D: Drivers relation',table(['$\\underline{\\mathrm{did}}$','dname','rating','age'],[[22,'Karthikeyan',7,25],[29,'Salman',1,33],[31,'Boris',8,55],[32,'Arnoldt',8,25],[58,'Schumacher',10,35],[64,'Sachin',7,35],[71,'Senna',10,16],[74,'Sachin',9,35],[85,'Rahul',3,25],[95,'Ralph',3,53]])],
  ['R: Reserves relation',table(['did','cid','day'],[[22,101,'10/10/06'],[22,102,'10/10/06'],[22,103,'08/10/06'],[22,104,'07/10/06'],[31,102,'10/11/06'],[31,103,'06/11/06'],[31,104,'12/11/06'],[64,101,'05/09/06'],[64,102,'08/09/06'],[74,103,'08/09/06']])],
  ['C: Cars relation',table(['$\\underline{\\mathrm{cid}}$','cname','colour'],[[101,'Renault','blue'],[102,'Renault','red'],[103,'Ferrari','green'],[104,'Jaguar','red']])]]);
const driverQuery = `select D.dname
from Drivers D
where D.did in (
  select R.did
  from Cars C, Reserves R
  where R.cid=C.cid and C.colour = 'red'
  intersect
  select R.did
  from Cars C, Reserves R
  where R.cid=C.cid and C.colour = 'green'
)`;
const school = raw`Directions for Questions 3.20 to 3.21:
Consider the following relational schema:
Student ($\underline{\text{school-id, sch-roll-no}}$, sname, saddress)
School ($\underline{\text{school-id}}$, sch-name, sch-address, sch-phone)
Enrolment (school-id, sch-roll-no, $\underline{\text{erollno, examname}}$)
ExamResult ($\underline{\text{erollno, examname}}$, marks)
`;
const abc = 'Common Data for Questions 3.25 and 3.26:\nConsider the following relations A, B and C:\nA:\n'+
  table(['Id','Name','Age'],[[12,'Arun',60],[15,'Shreya',24],[99,'Rohit',11]])+'\nB:\n'+
  table(['Id','Name','Age'],[[15,'Shreya',24],[25,'Hari',40],[98,'Rohit',20],[99,'Rohit',11]])+'\nC:\n'+
  table(['Id','Phone','Age'],[[10,2200,'02'],[99,2100,'01']]);
export const DBMS_SQL_IMPORT={subject:'12. DBMS',chapter:'3. Structure Query Language',sourceHash,questions:[
  question(1,1998,2,`Suppose we have a database consisting of the following three relations.
FREQUENTS (student, parlor) giving the parlors each student visits.
SERVES (parlor, ice-cream) indicating what kind of ice-creams each parlor serves.
LIKES (student, ice-cream) indicating what ice-creams each student likes.
(Assume that each student likes at least one ice-cream and frequents at least one parlor)
Express the following in SQL:
Print the students that frequent at least one parlor that serves some icecream that they like.`,[],{questionType:'SUBJECTIVE',isProof:true,natAnswer:`Select Student
From FREQUENTS
Where parlor in (select parlor from SERVES
 where ice-cream in (select ice-cream
 from LIKES where LIKES.student = FREQUENTS.student))`,notes:['Answer key says Sol.; SQL solution transcribed from the explanation on PDF page 5 / book page 625 into the existing answer field.']}),
  question(2,1999,2,`Which of the following is/are correct?`,['An SQL query automatically eliminates duplicates','An SQL query will not work if there are no indexes on the relations','SQL permits attribute names to be repeated in the same relation','None of the above']),
  question(3,1999,2,`Consider the set of relations:
EMP (Employee-no, Dept-no, Employee-name, Salary)
DEPT (Dept-no, Dept-name, Location)
Write an SQL query to:
(a) Find all employee names who work in departments located at 'Calcutta' and whose salary is greater than Rs.50,000.
(b) Calculate, for each department number, the number of employees with a salary greater than Rs.1,00,000.`,[],{questionType:'SUBJECTIVE',isProof:true,natAnswer:`(a) Select Employee-name From EMP
Where Salary > 50,000 and Dept-no in
(Select Dept-no from Dept where Location = 'Calcutta')
OR
Select EMP.Employee-name From EMP, DEPT
Where EMP.Dept-no = DEPT.Dept-no and DEPT.Location = 'Calcutta'
and EMP.Salary > 50,000
(b) Select Dept-no, count(Employee-no) From EMP
Where Salary > 1,00,000 group by Dept-no.`,notes:['Answer key says Sol.; both supplied SQL solutions (including the alternative for part a) are transcribed from PDF page 5 / book page 625. Printed numeric commas and identifiers retained.']}),
  question(4,2000,2,'In SQL, relations can contain null values, and comparisons with null values are treated as unknown. Suppose all comparisons with a null value are treated as false. Which of the following pairs is not equivalent?',[raw`$x=5$, not (not $(x=5)$)`,raw`$x=5$, $x>4$ and $x<6$, where $x$ is an integer`,raw`$x\ne5$, not $(x=5)$`,'None of the above']),
  question(5,2000,2,`Given relations r(w, x) and s(y, z), the result of
[CODE]
is guaranteed to be same as r, provided`,['r has no duplicates and s is non-empty','r and s have no duplicates','s has no duplicates and r is non-empty','r and s have the same number of tuples'],{code:'select distinct w, x\nfrom r, s'}),
  question(6,2003,1,raw`Consider the following SQL query:
[CODE]
For an arbitrary predicate p, this query is equivalent to which of the following relational algebra expressions?`,[
    raw`$\Pi_{a_1,a_2,\ldots,a_n}\,\sigma_p(r_1\times r_2\times\cdots\times r_m)$`,
    raw`$\Pi_{a_1,a_2,\ldots,a_n}\,\sigma_p(r_1\bowtie r_2\bowtie\cdots\bowtie r_m)$`,
    raw`$\Pi_{a_1,a_2,\ldots,a_n}\,\sigma_p(r_1\cup r_2\cup\cdots\cup r_m)$`,
    raw`$\Pi_{a_1,a_2,\ldots,a_n}\,\sigma_p(r_1\cap r_2\cap\cdots\cap r_m)$`],{code:'select distinct a_1, a_2, ..., a_n\nfrom r_1, r_2, ..., r_m\nwhere p'}),
  question(7,2003,2,`Consider the set of relations shown below and the SQL query that follow:
Students: (Roll_number, Name, Date_of_birth)
Courses: (Course_number, Course_name, Instructor)
Grades: (Roll_number, Course_number, Grade)
[CODE]
Which of the following is computed by the above query?`,['Names of students who have got an A grade in all courses taught by Korth','Names of students who have got an A grade in all courses','Name of students who have got an A grade in at least one of the courses taught by Korth','None of the above'],{code:`select distinct Name
from Students, Courses, Grades
where Students.Roll_number=Grades.Roll_number
and Courses.Instructor=Korth
and Courses.Course_number=Grades.Course_number
and Grades.Grade=A`,notes:['Options c and d continue at the top of book page 617. Unquoted Korth and A are retained as printed.']}),
  question(8,2004,2,`The employee information in a company is stored in the relation:
Employee (name, sex, salary, deptName)
Consider the following SQL query
[CODE]
It returns the names of the department in which`,['the average salary is more than the average salary in the company','the average salary of male employees is more than the average salary of all male employees in the company','the average salary of male employees is more than the average salary of employees in the same department','the average salary of male employees is more than the average salary in the company'],{code:`select deptName
from Employee
where sex = 'M'
group by deptName
having avg(salary) >
 (select avg(salary) from Employee)`}),
  question(9,2004,2,`A relational database contains two tables student and department in which student table has columns roll_no, name and dept_id and department table has columns dept_id and dept_name. The following insert statements were executed successfully to populate the empty tables:
[CODE]
How many rows and columns will be retrieved by the following SQL statement? Select * from student, department`,['0 row and 4 columns','3 rows and 4 columns','3 rows and 5 columns','6 rows and 5 columns'],{code:`Insert into department values (1, 'Mathematics')
Insert into department values (2, 'Physics')
Insert into student values (1, 'Navin', 1)
Insert into student values (2, 'Mukesh', 2)
Insert into student values (3, 'Gita', 1)

Select * from student, department`,notes:['The final SELECT is included in the code field as well as its printed inline mention for clarity.']}),
  question(10,2004,2,'A table T1 in a relational database has the following rows and columns:\n'+table(['roll_no','marks'],[[1,10],[2,20],[3,30],[4,'Null']])+`\nThe following sequence of SQL statements was successfully executed on table T1.
[CODE]
What is the output of the select statement?`,['18.75','20','25','Null'],{code:'Update T1 set marks = marks +5\nSelect avg(marks) from T1'}),
  question(11,2004,2,'Consider two tables in a relational database with columns and rows as follows:\nTable: Student\n'+table(['$\\underline{\\text{Roll\\_no}}$','Name','Dept_id'],[[1,'ABC',1],[2,'DEF',1],[3,'GHI',2],[4,'JKL',3]])+'\nTable: Department\n'+table(['$\\underline{\\text{Dept\\_id}}$','Dept_name'],[[1,'A'],[2,'B'],[3,'C']])+`\nRoll_no is the primary key of the Student table, Dept_id is the primary key of the Department table and Student.Dept_id is a foreign key from Department.Dept_id.
What will happen if we try to execute the following two SQL statements?
[CODE]`,['Both (i) and (ii) will fail','(i) will fail but (ii) will succeed','(i) will succeed but (ii) will fail','Both (i) and (ii) will succeed'],{code:'(i) update Student set Dept_id = Null where Roll_no = 1\n(ii) update Department set Dept_id = Null where Dept_id = 1'}),
  question(12,2005,2,`A company maintains records of sales made by its salespersons and pays them commission based on each individual's total sales made in a year. This data is maintained in a table with the following schema:
salesinfo = (salespersonid, totalsales, commission)
In a certain year, due to better business results, the company decides to further reward its salespersons by enhancing the commission paid to them as per the following formula:
If commission <= 50000, enhance it by 2%
If 50000 < commission <= 100000, enhance it by 4%
If commission > 100000, enhance it by 6%
The IT staff has written three different SQL scripts to calculate enhancement for each slab, each of the scripts is to run as a separate transaction as follows:
[CODE]
Which of the following options of running these transactions will update the commission of all salespersons correctly?`,['Execute T1 followed by T2 followed by T3','Execute T2, followed by T3; T1 running concurrently throughout','Execute T3 followed by T2; T1 running concurrently throughout','Execute T3 followed by T2 followed by T1'],{code:`T1 Update salesinfo
   Set commission = commission * 1.02
   Where commission <= 50000;
T2 Update salesinfo
   Set commission = commission * 1.04
   Where commission > 50000 and commission is <= 100000;
T3 Update salesinfo
   Set commission = commission * 1.06
   Where commission > 100000;`,notes:['Question continues from book page 617 to 618. The printed "commission is <= 100000" is retained.']}),
  question(13,2005,2,`In an inventory management system implemented at a trading corporation, there are several tables designed to hold all the information. Amongst these, the following two tables hold information on which items are supplied by which suppliers, and which warehouse keeps which items along with the stock-level of these items.
Supply = (supplierid, itemcode)
Inventory = (itemcode, warehouse, stocklevel)
For a specific information required by the management, following SQL query has been written
[CODE]
For the warehouse at Nagpur, this query will find all suppliers who`,['do not supply any item','supply exactly one item','supply one or more items','supply two or more items'],{code:`Select distinct STMP.supplierid
From Supply as STMP
Where not unique (Select ITMP.supplierid
From Inventory, Supply as ITMP
Where STMP.supplierid = ITMP.supplierid
And ITMP.itemcode = Inventory.itemcode
And Inventory.warehouse = 'Nagpur');`}),
  question(14,2005,2,`The relation book (title, price) contains the titles and prices of different books. Assuming that no two books have the same price, what does the following SQL
[CODE]`,['Titles of the four most expensive books','Title of the fifth most inexpensive book','Title of the fifth most expensive book','Titles of the five most expensive books'],{code:`select title
from book as B
where (select count(*)
 from book as T
 where T.price > B.Price) < 5`}),
  question(15,2006,2,drivers+'\nWhat is the output of the following SQL query?\n[CODE]',['Karthikeyan, Boris','Sachin, Salman','Karthikeyan, Boris, Sachin','Schumacher, Senna'],{code:driverQuery,notes:['Shared directions and all three tables on book page 618 repeated for standalone use; query is on book page 619.']}),
  question(16,2006,2,drivers+'\nThe SQL query in Question 3.15:\n[CODE]\nLet n be the number of comparisons performed when the above SQL query is optimally executed. If linear search is used to locate a tuple in a relation using primary key, then n lies in the range',['36 - 40','44 - 48','60 - 64','100 - 104'],{code:driverQuery,notes:['Shared tables and preceding query are repeated to preserve the linked question context.']}),
  question(17,2006,2,`Consider the relation account (customer, balance) where customer is a primary key and there are no null values. We would like to rank customers according to decreasing balance. The customer with the largest balance gets rank 1. Ties are not broken but ranks are skipped: if exactly two customers have the largest balance they each get rank 1 and rank 2 is not assigned.
[CODE]
Consider these statements about Query 1 and Query 2.
1. Query 1 will produce the same row set as Query 2 for some but not all databases.
2. Both Query 1 and Query 2 are correct implementations of the specification.
3. Query 1 is a correct implementation of the specification but Query 2 is not.
4. Neither Query 1 nor Query 2 is a correct implementation of the specification.
5. Assigning rank with a pure relational query takes less time than scanning in decreasing balance order and assigning ranks using ODBC.
Which two of the above statements are correct?`,['2 and 5','1 and 3','1 and 4','3 and 5'],{code:`Query 1: Select A.customer, count(B.customer)
from account A, account B
where A.balance <= B.balance Group by A.customer

Query 2: Select A.customer, 1 + count(B.customer)
from account A, account B
where A.balance < B.balance group by A.customer`,notes:['This remains one MCQ with four paired-statement options, not an MSQ.']}),
  question(18,2006,2,`Consider the relation enrolled (student, course) in which (student, course) is the primary key, and the relation paid (student, amount) where student is the primary key. Assume no null values and no foreign keys or integrity constraints. Given the following four queries:
[CODE]
Which one of the following statements is correct?`,['All queries return identical row sets for any database','Query 2 and Query 4 return identical row sets for all databases but there exist databases for which Query 1 and Query 2 return different row sets','There exist databases for which Query 3 returns strictly fewer rows than Query 2','There exist databases for which Query 4 will encounter an integrity violation at runtime'],{code:`Query 1: Select student from enrolled where
student in (select student from paid)
Query 2: Select student from paid where student
in (select student from enrolled)
Query 3: Select E.student from enrolled E, paid P
where E.student = P.student
Query 4: Select student from paid where exists
(select * from enrolled where enrolled.student = paid.student)`}),
  question(19,2007,2,raw`Consider the table employee ($\underline{\text{empId}}$, name, department, salary) and the two queries $Q_1$, $Q_2$ below. Assuming that department 5 has more than one employee, and we want to find the employees who get higher salary than anyone in the department 5, which one of the statements is TRUE for any arbitrary employee table?
[CODE]`,[raw`$Q_1$ is the correct query`,raw`$Q_2$ is the correct query`,raw`Both $Q_1$ and $Q_2$ produce the same answer`,raw`Neither $Q_1$ nor $Q_2$ is the correct query`],{code:`Q1: Select e.empId
From employee e
Where not exists
(Select * From employee s Where
 s.department="5" and s.salary>=e.salary)
Q2: Select e.empId
From employee e
Where e.salary > Any
(Select distinct salary From employee s
 Where s.department="5")`}),
  question(20,2008,2,school+'What does the following SQL query output?\n[CODE]',['for each school with more than 200 students appearing in exams, the name of the school and the number of 100s scored by its students','for each school with more than 200 students in it, the name of the school and the number of 100s scored by its students','for each school with more than 200 students in it, the name of the school and the number of its students scoring 100 in at least one exam','nothing; the query has a syntax error'],{code:`SELECT sch-name, COUNT(*)
FROM School C, Enrolment E, ExamResult R
WHERE E.school-id C.school-id
 AND E.examname = R.examname AND
 E.Erollno = R.erollno
 AND R.marks = 100 AND S.school-id IN
 (SELECT school-id
  FROM student
  GROUP BY school-id
  HAVING COUNT(*) > 200)
GROUP BY school-id`,notes:['Missing equality between E.school-id and C.school-id and the unbound S alias are printed source syntax, retained without correction.']}),
  question(21,2008,2,school+raw`Consider the following tuple relational calculus query.
$$\begin{aligned}\{t\mid\exists E\in\text{Enrolment}\;t=E.\text{school-id}\;\land\;&\{\lvert x\mid x\in\text{Enrolment}\land x.\text{school-id}=t\land\\
 &(\exists B\in\text{ExamResult}\;B.\text{erollno}=x.\text{erollno}\\
 &\land B.\text{examname}=x.\text{examname}\land B.\text{marks}>35)\rvert\}\\
 &\div\{\lvert x\mid x\in\text{Enrolment}\land x.\text{school-id}=t\rvert\}*100>35\}\end{aligned}$$
If a student needs to score more than 35 marks to pass an exam, what does the query return?`,['The empty set','schools with more than 35% of its students enrolled in some exam or the other','schools with a pass percentage above 35% over all exams taken together','schools with a pass percentage above 35% over each exam']),
  question(22,2011,2,raw`Consider a database table T containing two columns X and Y each of type integer. After the creation of the table, one record $(X=1,Y=1)$ is inserted in the table.
Let MX and MY denote the respective maximum values of X and Y among all records in the table at any point in time. Using MX and MY, new records are inserted in the table 128 times with X and Y values being $MX+1$, $2*MY+1$ respectively. It may be noted that each time after the insertion, values of MX and MY change.
What will be the output of the following SQL query after the steps mentioned above are carried out?
[CODE]`,['127','255','129','257'],{code:'SELECT Y FROM T WHERE X = 7;'}),
  question(23,2011,2,'Database table by name Loan_Records is given below:\n'+table(['Borrower','Bank_Manager','Loan_Amount'],[['Ramesh','Sunderajan','10000.00'],['Suresh','Ramgopal','5000.00'],['Mahesh','Sunderajan','7000.00']])+'\nWhat is the output of the following SQL query?\n[CODE]',['3','9','5','6'],{code:`SELECT count(*)
FROM (
 (SELECT Borrower, Bank_Manager FROM Loan_Records) AS S
 NATURAL JOIN
 (SELECT Bank_Manager, Loan_Amount FROM Loan_Records) AS T
);`}),
  question(24,2012,1,`Which of the following statements are TRUE about an SQL query?
P: An SQL query can contain a HAVING clause even if it does not have a GROUP BY clause
Q: An SQL query can contain a HAVING clause only if it has a GROUP BY clause
R: All attributes used in the GROUP BY clause must appear in the SELECT clause
S: Not all attributes used in the GROUP BY clause need to appear in the SELECT clause`,['P and R','P and S','Q and R','Q and S'],{notes:['Source answer key gives C (Q and R); stored exactly even though it conflicts with ordinary SQL semantics. No answer correction inferred.']}),
  question(25,2012,2,abc+raw`
How many tuples does the result of the following relational algebra expression contain? Assume that the schema of $A\cup B$ is the same as that of A.
$$(A\cup B)\bowtie_{A.\mathrm{Id}>40\,\lor\,C.\mathrm{Id}<15}C$$`,['7','4','5','9']),
  question(26,2012,2,abc+'\nHow many tuples does the result of the following SQL query contain?\n[CODE]',['4','3','0','1'],{code:`SELECT A.Id
FROM A
WHERE A.Age > All (SELECT B.Age
 FROM B
 WHERE B.Name='Arun')`}),
  question(27,2014,2,`Given the following schema:
employees(emp-id, first-name, last-name, hire-date, dept-id, salary)
departments(dept-id, dept-name, manager-id, location-id)
You want to display the last names and hire dates of all latest hires in their respective departments in the location ID 1700. You issue the following query:
[CODE]
What is the outcome?`,['It executes but does not give the correct result.','It executes and gives the correct result.','It generates an error because of pairwise comparison.','It generates an error because the GROUP BY clause cannot be used with table joins in a subquery.'],{setNum:'1',code:`SQL> SELECT last-name, hire-dat[unclear]
FROM employees
WHERE (dept-id, hire-date) IN
 (SELECT dept-id, MAX(hire-date) FROM
  employees JOIN departments USING(dept-id)
  WHERE location-id = 1700
  GROUP BY dept-id);`,notes:['Unresolved scan text: the identifier after SELECT last-name is visible only as hire-dat, with its final characters obscured. [unclear] explicitly marks the unreadable suffix; no characters invented. Answer B is legible in the source key.']}),
  question(28,2014,2,`SQL allows duplicate tuples in relations, and correspondingly defines the multiplicity of tuples in the result of joins. Which one of the following queries always gives the same answer as the nested query shown below:
[CODE]`,['select R.* from R, S where R.a = S.a','select distinct R.* from R, S where R.a = S.a','select R.* from R, (select distinct a from S) as S1 where R.a = S1.a','select R.* from R, S where R.a = S.a and is unique R'],{setNum:'2',code:'select * from R where a in (select S.a from S)',isCodeOptions:true}),
  question(29,2014,1,raw`What is the optimized version of the relational algebra expression $\pi_{A1}(\pi_{A2}(\sigma_{F1}(\sigma_{F2}(r))))$, where A1, A2 are sets of attributes in r with $A1\subseteq A2$ and F1, F2 are Boolean expressions based on the attributes in r?`,[raw`$\pi_{A1}(\sigma_{F1\land F2}(r))$`,raw`$\pi_{A1}(\sigma_{F1\lor F2}(r))$`,raw`$\pi_{A2}(\sigma_{F1\land F2}(r))$`,raw`$\pi_{A2}(\sigma_{F1\lor F2}(r))$`],{setNum:'3'}),
  question(30,2014,2,raw`Consider the following relational schema:
employee($\underline{\text{empId}}$, empName, empDept)
customer($\underline{\text{custId}}$, custName, salesRepId, rating)
salesRepId is a foreign key referring to empId of the employee relation. Assume that each employee makes a sale to at least one customer.
What does the following query return?
[CODE]`,["Names of all the employees with at least one of their customers having a 'GOOD' rating.","Names of all the employees with at most one of their customers having a 'GOOD' rating.","Names of all the employees with none of their customers having a 'GOOD' rating.","Names of all the employees with all their customers having a 'GOOD' rating."],{setNum:'3',code:`SELECT empName
FROM employee E
WHERE NOT EXISTS (SELECT custId
 FROM customer C
 WHERE C.salesRepId = E.empId
 AND C.rating <> 'GOOD');`,notes:['Options c and d continue on book page 622.']}),
  question(31,2015,2,'Consider the following relations:\nStudent\n'+table(['$\\underline{\\text{Roll\\_No}}$','Student_Name'],[[1,'Raj'],[2,'Rohit'],[3,'Raj']])+'\nPerformance\n'+table(['$\\underline{\\text{Roll\\_No}}$','$\\underline{\\text{Course}}$','Marks'],[[1,'Math',80],[1,'English',70],[2,'Math',75],[3,'English',80],[2,'Physics',65],[3,'Math',80]])+'\nConsider the following SQL query.\n[CODE]\nThe number of rows that will be returned by the SQL query is ______.',[],{setNum:'1',code:`SELECT S.Student_Name, sum(P.Marks)
FROM Student S, Performance P
WHERE S.Roll_No = P.Roll_No
GROUP BY S.Student_Name`}),
  question(32,2015,1,'SELECT operation in SQL is equivalent to',['the selection operation in relational algebra','the selection operation in relational algebra, except that SELECT in SQL retains duplicates','the projection operation in relational algebra','the projection operation in relational algebra, except that SELECT in SQL retains duplicates'],{setNum:'1'}),
  question(33,2015,1,raw`Consider the following relation:
Cinema ($\textit{theater, address, capacity}$)
Which of the following options will be needed at the end of the SQL query
[CODE]
such that it always finds the addresses of theaters with maximum capacity?`,['WHERE P1.capacity >= All (select P2.capacity from Cinema P2)','WHERE P1.capacity >= Any (select P2.capacity from Cinema P2)','WHERE P1.capacity > All (select max(P2.capacity) from Cinema P2)','WHERE P1.capacity > Any (select max(P2.capacity) from Cinema P2)'],{setNum:'3',code:'SELECT P1.address\nFROM Cinema P1',isCodeOptions:true}),
  question(34,2016,2,'Consider the following database table named water_schemes:\n'+table(['scheme_no','district_name','capacity'],[[1,'Ajmer',20],[1,'Bikaner',10],[2,'Bikaner',10],[3,'Bikaner',20],[1,'Churu',10],[2,'Churu',20],[1,'Dungargarh',10]])+'\nThe number of tuples returned by the following SQL query is:\n[CODE]',[],{setNum:'2',code:`with total (name, capacity) as
 select district_name, sum(capacity)
 from water_schemes
 group by district_name
with total_avg (capacity) as
 select avg(capacity)
 from total
select name
from total, total_avg
where total.capacity >= total_avg.capacity`,notes:['The repeated WITH and absent CTE parentheses are retained as printed.']}),
  question(35,2017,1,'Consider a database that has the relation schema EMP (EmpId, EmpName, and DeptName). An instance of the schema EMP and a SQL query on it are given below:\nEMP\n'+table(['EmpId','EmpName','DeptName'],Array.from({length:13},(_,i)=>[i+1,'XY'+String.fromCharCode(65+i),['AA','AA','AA','AA','AB','AB','AB','AC','AC','AC','AD','AD','AE'][i]]))+'\n[CODE]\nThe output of executing the SQL query is ______.',[],{setNum:'1',code:`SELECT AVG(EC.Num)
FROM EC
WHERE (DeptName, Num) IN
 (SELECT DeptName, COUNT(EmpId) AS
  EC(DeptName, Num)
  FROM EMP
  GROUP BY DeptName)`,notes:['Query text including the placement of EC(DeptName, Num) is preserved as printed; source answer is 2.6.']}),
  question(36,2017,2,'Consider the following database table named top_scorer.\ntop_scorer\n'+table(['player','country','goals'],[['Klose','Germany',16],['Ronaldo','Brazil',15],['G Muller','Germany',14],['Fontaine','France',13],['Pele','Brazil',12],['Klinsmann','Germany',11],['Kocsis','Hungary',11],['Batistuta','Argentina',10],['Cubillas','Peru',10],['Lato','Poland',10],['Lineker','England',10],['T Muller','Germany',10],['Rahn','Germany',10]])+'\nConsider the following SQL query:\n[CODE]\nThe number of tuples returned by the above SQL query is ______.',[],{setNum:'2',code:`SELECT ta.player FROM top_scorer AS ta
WHERE ta.goals > ALL (SELECT tb.goals
 FROM top_scorer AS tb
 WHERE tb.country = 'Spain')
AND ta.goals > ANY (SELECT tc.goals
 FROM top_scorer AS tc
 WHERE tc.country = 'Germany')`}),
  question(37,2018,1,raw`Consider the following two tables and four queries in SQL.
Book ($\underline{\text{isbn}}$, bname), Stock ($\underline{\text{isbn}}$, copies)
[CODE]
Which one of the queries above is certain to have an output that is a superset of the outputs of the other three queries?`,['Query 1','Query 2','Query 3','Query 4'],{code:`Query 1: SELECT B.isbn, S.copies
 FROM Book B INNER JOIN Stock S ON B.isbn = S.isbn;
Query 2: SELECT B.isbn, S.copies
 FROM Book B LEFT OUTER JOIN Stock S ON B.isbn = S.isbn;
Query 3: SELECT B.isbn, S.copies
 FROM Book B RIGHT OUTER JOIN Stock S ON B.isbn = S.isbn;
Query 4: SELECT B.isbn, S.copies
 FROM Book B FULL OUTER JOIN Stock S ON B.isbn = S.isbn;`}),
  question(38,2019,2,'A relational database contains two tables Student and Performance as shown below:\nStudent\n'+table(['$\\underline{\\text{Roll\\_no.}}$','Student_name'],[[1,'Amit'],[2,'Priya'],[3,'Vinit'],[4,'Rohan'],[5,'Smita']])+'\nPerformance\n'+table(['$\\underline{\\text{Roll\\_no.}}$','$\\underline{\\text{Student\\_code}}$','Marks'],[[1,'A',86],[1,'B',95],[1,'C',90],[2,'A',89],[2,'C',92],[3,'C',80]])+`\nThe primary key of the Student table is Roll_no. For the Performance table, the columns Roll_no. and Subject_code together form the primary key. Consider the SQL query given below:
[CODE]
The number of rows returned by the above SQL query is ______.`,[],{code:`SELECT S.Student_name, sum(P.Marks)
FROM Student S, Performance P
WHERE P.Marks > 84
GROUP BY S.Student_name;`,notes:['The Performance table header is printed Student_code while the prose says Subject_code; both are retained. No join condition is printed.']}),
  question(39,2020,1,'Consider a relational database containing the following schemas.\nCatalog\n'+table(['$\\underline{\\text{sno}}$','$\\underline{\\text{pno}}$','cost'],[['S1','P1',150],['S1','P2',50],['S1','P3',100],['S2','P4',200],['S2','P5',250],['S3','P1',250],['S3','P2',150],['S3','P5',300],['S3','P4',250]])+'\nSupplies\n'+table(['$\\underline{\\text{sno}}$','sname','location'],[['S1','M/s Royal furniture','Delhi'],['S2','M/s Balaji furniture','Bangalore'],['S3','M/s Premium furniture','Chennai']])+'\nParts\n'+table(['$\\underline{\\text{pno}}$','sname','part_spec'],[['P1','Table','Wood'],['P2','Chair','Wood'],['P3','Table','Steel'],['P4','Almirah','Steel'],['P5','Almirah','Wood']])+`\nThe primary key of each table is indicated by underlining the constituent fields.
[CODE]
The number of rows returned by the above SQL query is`,['2','5','4','0'],{code:`SELECT s.sno, s.name
FROM Suppliers s, Catalogue c
WHERE s.sno = c.sno AND
 cost > (SELECT AVG(cost)
 FROM Catalogue
 WHERE pno = 'P4'
 GROUP BY pno);`,notes:['Query continues on book page 624. Printed table names Catalog/Supplies and query names Catalogue/Suppliers differ; sname versus s.name also differs. All are preserved.']}),
  question(40,2021,2,raw`The relation scheme given below is used to store information about the employees of a company, where empId is the key and deptId indicates the department to which the employee is assigned. Each employee is assigned to exactly one department.
emp($\underline{\text{empId}}$, name, gender, salary, deptId)
Consider the following SQL query:
[CODE]
The above query gives, for each department in the company, the number of female employees whose salary is greater than the average salary of`,['Female employees in the department.','Employees in the department.','Female employees in the company.','Employees in the company.'],{setNum:'2',code:`select deptId, count(*)
from emp
where gender = "female" and salary > (select avg(salary) from emp)
group by deptId;`}),
  question(41,2022,2,raw`Consider the relational database with the following four schemas and their respective instances.
Student($\underline{\text{sNo}}$, sName, dNo) Dept($\underline{\text{dNo}}$, dName)
Course($\underline{\text{cNo}}$, cName, dNo) Register($\underline{\text{sNo, cNo}}$)
Student:
`+table(['$\\underline{\\text{sNo}}$','sName','dNo'],[['S01','James','D01'],['S02','Rocky','D02'],['S03','Jackson','D02'],['S04','Jane','D01'],['S05','Milli','D02']])+'\nDept:\n'+table(['$\\underline{\\text{dNo}}$','dName'],[['D01','CSE'],['D02','EEE']])+'\nCourse:\n'+table(['$\\underline{\\text{cNo}}$','sName','dNo'],[['C11','DS','D01'],['C12','OS','D01'],['C21','DE','D02'],['C22','PT','D02'],['C23','CV','D03']])+'\nRegister:\n'+table(['$\\underline{\\text{sNo}}$','$\\underline{\\text{cNo}}$'],[['S01','C11'],['S01','C12'],['S02','C11'],['S03','C21'],['S03','C22'],['S03','C23'],['S04','C11'],['S04','C12'],['S05','C11'],['S05','C21']])+`\nSQL Query:
[CODE]
The number of rows returned by the above SQL query is ______.`,[],{code:`SELECT * FROM Student AS S WHERE NOT EXIST
 (SELECT cNo FROM Course WHERE dNo = "D01" EXCEPT
 SELECT cNo FROM Register WHERE sNo = S.sNo)`,notes:['NOT EXIST (singular) and the Course instance header sName (schema says cName) are preserved as printed.']}),
  question(42,2023,2,'Consider the following table named Student in a relational database. The primary key of this table is rollNum.\nStudent\n'+table(['$\\underline{\\text{rollNum}}$','name','gender','marks'],[[1,'Naman','M',62],[2,'Aliya','F',70],[3,'Aliya','F',80],[4,'James','M',82],[5,'Swati','F',65]])+'\nThe SQL query below is executed on this database.\n[CODE]\nThe number of rows returned by the query is ______.',[],{code:`SELECT *
FROM Student
WHERE gender = 'F' AND marks > 65;`}),
]};
// Exact printed key, PDF p5 / book p625. "Sol." entries use the supplied solutions above.
export const DBMS_SQL_ANSWER_KEY=['Sol.','D','Sol.','C','A','A','C','D','D','C','C','D','D','D','A','C','C','B','B','D','C','A','C','C','A','B','B','C','A','D','2','D','A','2','2.6','7','D','5','C','D','2','2'];
DBMS_SQL_IMPORT.questions.forEach((q,i)=>{
  const answer=DBMS_SQL_ANSWER_KEY[i];
  if(q.questionType==='MCQ')q.correctOptions=[answer];
  if(q.questionType==='NAT'){q.natAnswer=answer;q.natRange={min:Number(answer),max:Number(answer)};}
});
// The four editable Q3.41 instances share one table row, as on the scan.
const q41=DBMS_SQL_IMPORT.questions[40];
const instances=[...q41.text.matchAll(/\$\$[\s\S]*?\$\$/g)].map(match=>match[0]);
q41.text=q41.text.replace(/Student:\n[\s\S]*?\nSQL Query:/,beside(['Student','Dept','Course','Register'].map((label,i)=>[label,instances[i]]))+'\nSQL Query:');
// Keep multiple relation instances together to avoid reducing the whole body
// to a tiny font solely because short tables were stacked vertically.
for(const [number,labels] of [[11,['Table: Student','Table: Department']],[25,['A:','B:','C:']],[26,['A:','B:','C:']],
  [31,['Student','Performance']],[38,['Student','Performance']],[39,['Catalog','Supplies','Parts']]]) {
  const q=DBMS_SQL_IMPORT.questions[number-1];
  const blocks=[...q.text.matchAll(/\$\$[\s\S]*?\$\$/g)].slice(0,labels.length);
  const start=q.text.indexOf(labels[0]+'\n');
  const last=blocks.at(-1);
  q.text=q.text.slice(0,start)+beside(labels.map((label,i)=>[label,blocks[i][0]]))+q.text.slice(last.index+last[0].length);
}
