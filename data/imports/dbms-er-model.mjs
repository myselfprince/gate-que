const raw = String.raw;
const sourceHash = 'aab96c4034d58b63448c7e115b78a124483163c42875a59c7c4b4dab2a917991';
function question(number, year, marks, text, options = [], extra = {}) {
  const {notes = [], ...fields} = extra;
  return {
    id: `madeeasy-dbms-er-model-1-${number}`, text, code: '', year: String(year), marks: String(marks), setNum: '', examPaper: 'CS',
    rawTopic: 'ER Model', diagram: '', ext: '.png', optA: options[0] || '', optB: options[1] || '', optC: options[2] || '', optD: options[3] || '',
    questionType: options.length ? 'MCQ' : 'NAT', correctOptions: [], natAnswer: '',
    isBlank: false, isPosLocked: false, isCodeOptions: false, isProof: false, needsManualOptionFix: false, optLayout: 'auto', tempPaste: '', ...fields,
    source: {file: '12. DBMS/1. ER Model.pdf', sha256: sourceHash, questionNumber: `1.${number}`,
      bookPages: [number <= 5 ? 597 : number <= 12 ? 598 : 599], pdfPages: [number <= 5 ? 1 : 2], answerKeyPdfPage: null, answerKeyStatus: 'not-supplied',
      notes: ['Both scanned spreads visually reviewed. No answer key is supplied; no answer inferred.',
        ...(number <= 5 ? ['The chapter-opening book page has no printed folio; page 597 follows from the next visible book page 598.'] : []), ...notes]},
  };
}
const common = 'Common Data for Questions 1.6 & 1.7:\nConsider the following ER diagram:\n[IMG_1]\n';
const q6 = 'The minimum number of tables needed to represent M, N, P, R1, R2 is';
export const DBMS_ER_MODEL_IMPORT = {
  subject: '12. DBMS', chapter: '1. ER Model', sourceHash,
  questions: [
    question(1,2004,2,`It is desired to design an object-oriented employee record system for a company. Each employee has a name, unique id and salary. Employees belong to different categories and their salary is determined by their category. The functions getName, getId and computeSalary are required. Given the class hierarchy below, possible locations for these functions are:
(i) getId is implemented in the superclass
(ii) getId is implemented in the subclass
(iii) getName is an abstract function in the superclass
(iv) getName is implemented in the superclass
(v) getName is implemented in the subclass
(vi) getSalary is an abstract function in the superclass
(vii) getSalary is implemented in the superclass
(viii) getSalary is implemented in the subclass
[IMG_1]
Choose the best design`,['(i), (iv), (vi), (viii)','(i), (iv), (vii)','(i), (iii), (v), (vi), (viii)','(ii), (v), (viii)'],{diagram:'er-model-1-1',notes:['The stem says computeSalary, while statements (vi)-(viii) say getSalary; the printed wording is preserved.']}),
    question(2,2004,2,`Consider the following entity relationship diagram (ERD), where two entities E1 and E2 have a relation R of cardinality $1:m$.
[IMG_1]
The attributes of E1 are A11, A12 and A13 where A11 is the key attribute. The attributes of E2 are A21, A22 and A23 where A21 is the key attribute and A23 is a multi-valued attribute. Relation R does not have any attribute. A relational database containing minimum number of tables with each table satisfying the requirements of the third normal form (3NF) is designed from the above ERD. The number of tables in the database is`,['2','3','5','4'],{diagram:'er-model-1-2'}),
    question(3,2005,1,`Consider the entities 'hotel room', and 'person' with a many to many relationship 'lodging' as shown below:
[IMG_1]
If we wish to store information about the rent payment to be made by person(s) occupying different hotel rooms, then this information should appear as an attribute of`,['Person','Hotel Room','Lodging','None of these'],{diagram:'er-model-1-3'}),
    question(4,2005,2,'Let $E_1$ and $E_2$ be two entities in an E/R diagram with simple single-valued attributes. $R_1$ and $R_2$ are two relationships between $E_1$ and $E_2$, where $R_1$ is one-to-many and $R_2$ is many-to-many. $R_1$ and $R_2$ do not have any attributes of their own. What is the minimum number of tables required to represent this situation in the relational model?',['2','3','4','5']),
    question(5,2005,2,raw`The following table has two attributes A and C where A is the primary key and C is the foreign key referencing A with on-delete cascade.
$$\begin{array}{|c|c|}\hline A&C\\\hline 2&4\\3&4\\4&3\\5&2\\7&2\\9&5\\6&4\\\hline\end{array}$$
The set of all tuples that must be additionally deleted to preserve referential integrity when the tuple (2, 4) is deleted is:`,['(3, 4) and (6, 4)','(5, 2) and (7, 2)','(5, 2) (7, 2) and (9, 5)','1'],{notes:['Option D is literally printed as 1; it is preserved without repair. The relation is stored as editable LaTeX.']}),
    question(6,2008,2,common+q6,['2','3','4','5'],{diagram:'er-model-1-6-7'}),
    question(7,2008,2,common+'Preceding Question 1.6: '+q6+'\n(a) 2   (b) 3   (c) 4   (d) 5\n\nWhich of the following is a correct attribute set for one of the tables for the correct answer to the above question?',[raw`$\{M1,M2,M3,P1\}$`,raw`$\{M1,P1,N1,N2\}$`,raw`$\{M1,P1,N1\}$`,raw`$\{M1,P1\}$`],{diagram:'er-model-1-6-7',notes:['Shared ER figure and the preceding Q1.6 are repeated to make the linked question self-contained.']}),
    question(8,2012,1,'Given the basic ER and relational models, which of the following is INCORRECT?',['An attribute of an entity can have more than one value','An attribute of an entity can be composite','In a row of a relational table, an attribute can have more than one value','In a row of a relational table, an attribute can have exactly one value or a NULL value']),
    question(9,2015,2,'Consider an Entity-Relationship (ER) model in which entity sets $E_1$ and $E_2$ are connected by an $m:n$ relationship $R_{12}$. $E_1$ and $E_3$ are connected by a $1:n$ (1 on the side of $E_1$ and n on the side of $E_3$) relationship $R_{13}$.\n$E_1$ has two single-valued attributes $a_{11}$ and $a_{12}$ of which $a_{11}$ is the key attribute. $E_2$ has two single-valued attributes $a_{21}$ and $a_{22}$ of which $a_{21}$ is the key attribute. $E_3$ has two single-valued attributes $a_{31}$ and $a_{32}$ of which $a_{31}$ is the key attribute. The relationships do not have any attributes.\nIf a relational model is derived from the above ER model, then the minimum number of relations that would be generated if all the relations are in 3NF is ______.',[],{setNum:'1',notes:['The stem continues from the bottom of the first column to the top of the second column on book page 598.']}),
    question(10,2017,1,'An ER model of a database consists of entity types A and B. These are connected by a relationship R which does not have its own attribute. Under which one of the following conditions, can the relational table for R be merged with that of A?',['Relationship R is one-to-many and the participation of A in R is total.','Relationship R is one-to-many and the participation of A in R is partial.','Relationship R is many-to-one and the participation of A in R is total.','Relationship R is many-to-one and the participation of A in R is partial.'],{setNum:'2'}),
    question(11,2018,1,'In an Entity-Relationship (ER) model, suppose R is a many-to-one relationship from entity set E1 to entity set E2. Assume that E1 and E2 participate totally in R and that the cardinality of E1 is greater than the cardinality of E2. Which one of the following is true about R?',['Every entity in E1 is associated with exactly one entity in E2.','Some entity in E1 is associated with more than one entity in E2.','Every entity in E2 is associated with exactly one entity in E1.','Every entity in E2 is associated with at most one entity in E1.']),
    question(12,2020,1,'Which one of the following is used to represent the supporting many-one relationships of a weak entity set in an entity-relationship diagram?',['Rectangles with double/bold border','Ovals with double/bold border','Ovals that contain underlined identifiers','Diamonds with double/bold border']),
    question(13,2024,1,'Let S be the specification: "Instructors teach courses. Students register for courses. Courses are allocated classrooms. Instructors guide students." Which one of the following ER diagrams CORRECTLY represents S?\n[IMG_1]',['(iii)','(ii)','(iv)','(i)'],{setNum:'1',diagram:'er-model-1-13',pdfStyle:{imageScale:1.5},notes:['All four labelled candidate diagrams are retained in one figure-only crop; option-to-diagram mapping remains editable text.']}),
    question(14,2024,1,'In the context of owner and weak entity sets in the ER (Entity-Relationship) data model, which one of the following statements is TRUE?',['The owner entity set MUST have total participation in the identifying relationship.','Neither weak entity set nor owner entity set MUST have total participation in the identifying relationship.','The weak entity set MUST have total participation in the identifying relationship.','Both weak and owner entity sets MUST have total participation in the identifying relationship.'],{setNum:'2'}),
  ],
};
