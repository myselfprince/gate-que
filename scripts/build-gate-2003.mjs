import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {additions,answers} from '../data/papers/gate-cs-2003-supplement.mjs';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
const S=String.raw,base='data/backups/gate-2003';
const book=JSON.parse(await fs.readFile(`${base}/book-2003.json`,'utf8'));
const all=JSON.parse(await fs.readFile(`${base}/book-search.json`,'utf8'));
const refs=JSON.parse(await fs.readFile(`${base}/reference-2003.json`,'utf8'));
const slug='gate-cs-2003',title='GATE CS 2003',sourceFile='D:/Gate PYQs Year Wise - PDFs/2003.pdf';
const sourceSha256=createHash('sha256').update(await fs.readFile(sourceFile)).digest('hex');
if(sourceSha256!=='96d31f045242668747703711ac67fa41d7a624f08e08af389d441681c357480d')throw new Error('Unexpected source PDF.');
const map={1:33,2:14,3:74,4:6,5:7,6:36,7:3,8:8,9:44,10:31,11:30,13:21,16:60,17:61,18:64,19:50,20:32,21:46,22:35,23:37,25:58,26:55,27:27,28:26,29:70,30:68,31:4,32:0,33:1,36:9,38:5,40:10,41:76,43:45,44:43,45:40,46:42,47:41,48:28,49:29,50:11,51:13,52:20,53:19,54:18,55:12,56:62,57:63,58:65,59:66,60:75,61:72,62:73,63:51,64:49,66:34,67:47,68:38,69:39,70:48,72:2,76:59,77:52,78:56,79:57,80:53,81:54,82:25,83:24,84:22,85:67,86:69,87:71,88:15,89:16,90:17};
const manual=new Set([15,18,24,35,37,42,45,60,65,72,74,84]);
// Only pages actually read through the web tool are called discussion-reviewed.
const reviewed=new Set([12,14,15,18,24,34,35,37,39,45,47,52,65,73,74,75,82,84]);
const keys={
1:['Algorithms.pdf',3,'1.9','B'],6:['Algorithms.pdf',5,'2.12','B'],10:['COA.pdf',3,'3.5','D'],11:['COA.pdf',2,'2.8','C'],
16:['Compiler Design.pdf',5,'2.6','D'],17:['Compiler Design.pdf',5,'2.7','B'],20:['Algorithms.pdf',3,'1.8','A'],
21:['C Prog. & Data Structures.pdf',6,'6.4','D'],22:['Algorithms.pdf',5,'2.11','A'],23:['Algorithms.pdf',7,'3.3','C'],
25:['OS.pdf',11,'5.11','A'],26:['OS.pdf',9,'4.22','C'],27:['CN.pdf',7,'3.1','D'],28:['CN.pdf',7,'3.2','D'],
29:['DBMS.pdf',10,'5.2','D'],30:['DBMS.pdf',6,'3.6','A'],44:['Digital Logic.pdf',3,'3.6','A'],
45:['Digital Logic.pdf',1,'1.18','?'],46:['Digital Logic.pdf',2,'2.9','A'],47:['Digital Logic.pdf',1,'1.19','D'],
48:['COA.pdf',1,'1.3','B'],49:['COA.pdf',1,'1.4','A'],56:['Compiler Design.pdf',5,'2.8','D'],57:['Compiler Design.pdf',5,'2.9','A'],
61:['Algorithms.pdf',13,'6.8','B'],62:['Algorithms.pdf',13,'6.9','D'],64:['C Prog. & Data Structures.pdf',3,'3.7','B'],
66:['Algorithms.pdf',3,'1.10','C'],67:['C Prog. & Data Structures.pdf',6,'6.5','B'],68:['Algorithms.pdf',7,'3.4','B'],
69:['Algorithms.pdf',7,'3.5','B'],70:['C Prog. & Data Structures.pdf',6,'6.6','D'],76:['Compiler Design.pdf',3,'1.7','C'],
77:['OS.pdf',3,'1.19','D'],78:['OS.pdf',9,'4.23','D'],79:['OS.pdf',9,'4.24','C'],80:['OS.pdf',5,'2.10','B'],81:['OS.pdf',5,'2.11','C'],
82:['CN.pdf',7,'3.3','D'],83:['CN.pdf',5,'2.1','D'],84:['CN.pdf',3,'1.1','B'],85:['DBMS.pdf',4,'2.15','D'],86:['DBMS.pdf',6,'3.7','C'],87:['DBMS.pdf',10,'5.3','D']};
const pages=n=>n===48||n===49?[6,7]:n===61||n===62?[8,9]:n<=8?[1]:n===9?[1,2]:n<=18?[2]:n===19?[2,3]:n<=27?[3]:n===28?[3,4]:n<=34?[4]:n===35?[4,5]:n<=42?[5]:n<=47?[6]:n<=53?[7]:n===54?[7,8]:n<=60?[8]:n<=66?[9]:n===67?[9,10]:n<=72?[10]:n===73||n===74?[10,11]:n<=78?[11]:n===79?[11,12]:n<=85?[12]:n===86?[12,13]:[13];
const issues={
3:'Book adds independence. It is absent from the selected scan and unnecessary since P(A)=1; removed from the copy.',
15:'Alphabetic versus length-lexicographic enumeration is ambiguous; conventional D retained for manual assessment.',
18:'Bottom-up attribute evaluation restrictions are unspecified; discussion disputes the conventional L-attributed answer.',
20:'The selected scan has 2^(2n) in claim III, not the book transcription 2^(2n+1).',
23:'Made Easy key C uses repeated heap deletion. Optimal fixed-rank selection is constant time, D.',
24:'Conventional C is disputed; dynamic value types, variable types and subtype polymorphism make the wording ambiguous.',
27:'Selected source C says discarded; retained despite a Made Easy transcription saying forwarded.',
35:'Selected scan visibly prints sqrt(n-1); the reference discussion and conventional B use sqrt(n+1). Literal scan has no listed general answer.',
37:'Printed subset/superset symbols omit equality; conventional A assumes inclusive subset. Literal proper-subset interpretation has no universal answer.',
38:'Both operation tables transcribed from source as editable math; all nine ordered pairs checked.',
39:'Source option D is 2^10*5^10*7^10 and skips prime 3. It is retained rather than replacing it with the discussion variant.',
42:'Graphical roots are approximate; plotted coordinate labels are low-resolution and not numerically consistent with the listed root decimals. Intended graphical answer A is self-assessed.',
45:'Minimum POS/SOP literal counts are 9/8, absent from options. Conventional C uses a nonminimal 10-literal SOP.',
49:'Nine-bit rotation reference assumes intervening arithmetic and comparison preserve carry; their carry effects are not defined in the hypothetical instruction comments.',
52:'Book loses the stars in Sigma* and iff; restored from the selected scan.',
53:'Transition table restored as editable math rather than retaining a placeholder. Historical blank symbol is B.',
60:'Convolution requires independent module execution times; independence is not stated. Source option D also differs from the book.',
64:'Made Easy key B is incorrect for general n. Lifetime derivation gives C; book key is untouched.',
65:'Selected scan omits what operation is requested. Discussion supplies insert G and a bottom-up split convention; both are disclosed only in review.',
69:'Book prints a_a for the first start event; selected source a_s restored in copy.',
72:'Selected scan option B joins the parents by OR, unlike the conventional AND version. Preserved; no unique literal-source answer is enforced.',
74:'Dynamic scope plus call-by-name environment/capture rules are unspecified; conventional B conflicts with capture-avoiding caller-environment semantics.',
78:'Reference uses serial TLB/cache/memory lookup with a 1 ns failed-cache lookup cost; other overlap assumptions can change the rounded result.',
80:'Source option D uses independent S/T wait/signal with initial S=1,T=0. Book has different operations and initialization; restored.',
82:'Noncontiguous historical subnet mask retained. B/C option order restored from selected scan.',
84:'Selected source labels options bps; conventional key B is in bytes/s (Bps). All numerical bit/s options are wrong.',
85:'Selected scan spells Date_of_Birth; book Data_of_Birth transposition restored in copy.',
86:'Unquoted Korth and A are printed pseudo-SQL constants, retained as source.',
88:'Loop bounds, log rounding and option wording restored from selected scan; every j>=3 is excluded by at least one nondivisor.',
90:'Book has uppercase P in one dereference; source lowercase p restored only in independent copy.'
};
await fs.mkdir(`public/Year Papers/${title}`,{recursive:true});
const questions=[],corrections={};
for(let n=1;n<=90;n++){
 const source=map[n]!==undefined?book[map[n]]:null;
 const q=structuredClone(source||additions[n]);if(!q)throw new Error(`Missing Q${n}`);
 if(source){
  // Retain all source-book fields in the new independent copy; relocate every asset.
  if([38,53].includes(n))q.diagram='';
  const names=(q.diagram||'').split(',').map(s=>s.trim()).filter(Boolean),renamed=new Map();
  for(const name of new Set([...names,...['optA','optB','optC','optD'].flatMap(k=>q[k]?.startsWith('IMG:')?[q[k].slice(4).trim()]:[])])){
   const dest=`q${n}-${name}`;renamed.set(name,dest);
   await fs.copyFile(path.join('public',source.assetSubject||source.subject,source.assetChapter||source.chapter,name+(source.ext||'.png')),path.join('public/Year Papers',title,dest+(source.ext||'.png')));
  }
  q.diagram=names.map(name=>renamed.get(name)).join(',');
  for(const k of ['optA','optB','optC','optD'])if(q[k]?.startsWith('IMG:'))q[k]='IMG:'+renamed.get(q[k].slice(4).trim());
 }
 if(n===2){q.text='Assume the following C variable declaration and expressions.\n[CODE]\nWhich will not give compile-time errors if used as left hand sides of assignment statements in a C program?';}
 if(n===3)q.text=q.text.replace(', and $A$ and $B$ are independent','');
 if(n===20)q.text=S`Consider the following three claims:
I. $(n+k)^m=\Theta(n^m)$, where $k$ and $m$ are constants.
II. $2^{n+1}=O(2^n)$.
III. $2^{2n}=O(2^n)$.
Which of these claims are correct?`;
 if(n===38){q.text=S`Consider the set $\{a,b,c\}$ with binary operators $+$ and $\times$ defined as follows:
$$\begin{array}{c|ccc}+&a&b&c\\\hline a&b&a&c\\b&a&b&c\\c&a&c&b\end{array}\qquad\begin{array}{c|ccc}\times&a&b&c\\\hline a&a&b&c\\b&b&c&a\\c&c&c&b\end{array}$$
For example, $a+c=c$, $c+a=a$, $c\times b=c$ and $b\times c=a$. Given the equations
$$(a\times x)+(a\times y)=c,\qquad (b\times x)+(c\times y)=c,$$
the number of solutions (ordered pairs $(x,y)$ satisfying the equations) is`;}
 if([48,49].includes(n)){q.text=q.text.replace('Common Data for Q.1.3 & Q.1.4:','Common data for Q48-Q49:');q.code=q.code.replace('; Rotate right A through carry by one bit','; Right rotate A through carry by one bit\n                ; Old carry and A bits move as a 9-bit ring');q.pdfStyle={fontSize:15,minFontSize:11};}
 if(n===47)q.pdfStyle={fontSize:18,minFontSize:14,imageScale:0.65};
 if(n===52){q.text=S`Consider two languages $L_1$ and $L_2$, each on the alphabet $\Sigma$. Let $f:\Sigma^*\to\Sigma^*$ be a polynomial time computable bijection such that $(\forall x)[x\in L_1\text{ iff }f(x)\in L_2]$. Further, let $f^{-1}$ be also polynomial time computable. Which of the following CANNOT be true?`;}
 if(n===53){q.text=q.text.replace('[DIAGRAM_PLACEHOLDER]',S`$$\begin{array}{c|ccc}&0&1&B\\\hline q_0&(q_1,1,R)&(q_1,1,R)&\mathrm{Halt}\\q_1&(q_1,1,R)&(q_0,1,L)&(q_0,B,L)\end{array}$$`);}
 if(n===59)q.text=q.text.replace("'X: = Y + Z'","'X = Y + Z'");
 if(n===60)q.optD=S`$\max\{f_1(t)+f_2(t)\}$`;
 if(n===61||n===62)q.text=q.text.replace('Common Data for Q. 6.8 & Q. 6.9','Common data for Q61-Q62');
 if(n===65){q.pdfStyle={fontSize:18,minFontSize:14,imageScale:1};q.optLayout='3col';}
 if(n===69)q.text=q.text.replace('$a_a\\ b_s','$a_s\\ b_s');
 if(n===72)q.optB=S`$(P\vee Q)\Rightarrow((P\vee R)\vee(Q\vee\neg R))$ is logically valid`;
 if(n===78||n===79)q.pdfStyle={fontSize:15,minFontSize:11,lineSpacing:1.15};
 if(n===80||n===81)q.text=q.text.replace('Common Data for Q. 2.10 & 2.11','Common data for Q80-Q81');
 if(n===80){q.optD='P(S) at W, V(S) at X, P(T) at Y, V(T) at Z, S initially 1 and T initially 0';q.text=q.text.replace("with '001100110011'","starting with '001100110011'");}
 if(n===82){q.optB='10.35.28.2 and 10.35.29.4';q.optC='191.203.31.87 and 191.234.31.88';}
 if(n===83)q.optD='None of the above';
 if(n===84){for(const l of ['A','B','C','D'])q[`opt${l}`]=q[`opt${l}`].replace('Bps','bps');}
 if(n===85)q.text=q.text.replace('Data\\_of\\_Birth','Date\\_of\\_Birth');
 if(n===88){q.text=q.text.replace('\\lceil','\\lfloor').replace('\\rceil','\\rfloor');q.optA=S`$\{m\mid m\le n,(\exists i)[m=i!]\}$`;q.optB=S`$\{m\mid m\le n,(\exists i)[m=i^2]\}$`;}
 if(n===90){q.code=q.code.replace('P->data','p->data');q.text=q.text.replace('defined below.','defined below.\n[CODE]\n');}
 const ref=refs.find(r=>Number(r.title.match(/Question:\s*(\d+)/)?.[1])===n);if(!ref)throw new Error(`Missing Q${n} discussion mapping.`);
 const [key,referenceAnswer]=answers[n];
 const fields={...q};for(const k of ['_id','chapterId','source','solutionUrl','gateOverflowUrl','tempPaste'])delete fields[k];
 const sectionName=n<=30?'One-mark questions':'Two-mark questions';
 const answerSources=[{kind:'authored-reference',status:'independently-reviewed',official:false},
  {kind:'gateoverflow',url:ref.url,status:reviewed.has(n)?'discussion-reviewed':'question-mapping-from-local-cache; answer-not-individually-cross-checked',official:false}];
 if(keys[n]){const [file,pdfPage,question,printed]=keys[n];answerSources.push({kind:'made-easy-key',file:`C:/Users/Prince/Desktop/MadeEasy PYQ PDF/All Subject Solutions Keys/${file}`,pdfPage,question,printed,status:'visually-checked',official:false});}
 if(source?.source)answerSources.push({kind:'book-stored-provenance',...source.source,status:'retained-book-provenance; not-an-official-key'});
 const record={...fields,id:`${slug}-q${String(n).padStart(2,'0')}`,key:`yearpaper:${slug}:${n}`,datasetId:slug,
  subject:q.subject||'Computer Science',chapter:sectionName,assetSubject:'Year Papers',assetChapter:title,year:'2003',examPaper:'CS',setNum:'',
  paperQuestionNumber:String(n),originalLabel:String(n),marks:String(n<=30?1:2),questionType:'MCQ',correctOptions:[key],natAnswer:'',isProof:false,isBlank:false,isPosLocked:false,
  sectionId:n<=30?'one':'two',sectionName,referenceAnswer,manualReview:manual.has(n),gateOverflowUrl:ref.url,answerSources,
  verificationStatus:manual.has(n)?'disputed-source-defect-manual-review':reviewed.has(n)||keys[n]?'independent-review-with-source-cross-check':'independent-authored-review',
  source:{file:sourceFile,sha256:sourceSha256,pdfPages:pages(n),originalLabel:String(n),displayedSourceNumber:String(n),
   ...(source?{copiedFrom:{chapterId:source.chapterId,questionId:source.id,year:source.year,subject:source.subject,chapter:source.chapter}}:{}),issues:issues[n]?[issues[n]]:[]}};
 if(n===1)record.exportInstruction='ONE-MARK QUESTIONS (1-30). Select one option per question. Paper maximum 150 marks. Timed practice: 180 minutes, zero penalty (duration and penalty not stated in selected scan).';
 if(n===31)record.exportInstruction='TWO-MARK QUESTIONS (31-90). Select one option per question. No optional questions or General Aptitude section.';
 if(source){const changed=['text','code','optA','optB','optC','optD','marks','questionType','correctOptions'].filter(k=>JSON.stringify(source[k])!==JSON.stringify(record[k]));if(changed.length)corrections[n]=changed;}
 questions.push(record);
}
const paper=validateYearPaper({slug,datasetId:slug,title,year:'2003',examPaper:'CS',setNum:'',questionCount:90,totalMarks:150,availableMarks:150,durationMinutes:180,negativeFraction:0,verified:true,
 sourceUrl:'https://gateoverflow.in/exam/58/gate-cse-2003-original-paper',sourceSha256,instructions:[
 'Verified header: GATE-2003, COMPUTER SCIENCE & ENGINEERING. The selected 13-page 2003.pdf contains one paper and has no set/session label. The physical source filename is preserved.',
 'Q1-Q30 are one-mark MCQs; Q31-Q90 are two-mark MCQs. All 90 positions are included in source order, totaling 150 marks. No General Aptitude, written-answer section or optional-question limit appears in this paper. Shared data are repeated with each linked question for independent navigation.',
 'The selected scan omits duration and negative-marking instructions. Timed practice explicitly uses 180 minutes and zero MCQ penalty. These are practice settings, not a claim to verified official 2003 grading rules.',
 'Every position has an authored worked reference and a mapped GATE Overflow discussion. No official answer key was located. Source-specific verification records distinguish independent derivation, retained book-key provenance, visually checked supplied keys and reviewed discussions.',
 'Q15, Q18, Q24, Q35, Q37, Q42, Q45, Q60, Q65, Q72, Q74 and Q84 contain source defects, disputed wording or interpretation differences. Their 21 marks require labeled post-submission self-assessment; the other 129 marks are automatically graded. The literal scan text and option order are retained, including omissions and misprints.',
 'These are independent paper copies. Book questions, keys, assets, locks, metadata and order are unchanged. Responses, timer, review markers and navigation autosave and resume in this browser.'
 ],questions});
await fs.writeFile(`data/papers/${slug}.json`,JSON.stringify(paper,null,2)+'\n');
const tokens=s=>new Set(String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').split(' ').filter(w=>w.length>2));
const similarity=(a,b)=>{const x=tokens(a),y=tokens(b);return [...x].filter(t=>y.has(t)).length/Math.max(1,new Set([...x,...y]).size);};
const content=q=>['text','code','optA','optB','optC','optD'].map(k=>q[k]||'').join(' ');
const fullSearch=questions.map(q=>({number:q.paperQuestionNumber,selected:q.source.copiedFrom,candidates:all.map(b=>({id:b.id,year:b.year,similarity:similarity(content(q),content(b))})).sort((a,b)=>b.similarity-a.similarity).slice(0,5)}));
const used=new Set(questions.map(q=>q.source.copiedFrom?.questionId));
const report={identity:{year:'2003',examPaper:'CS',setNum:'',sourceFile,sourceSha256},questionCount:90,copied:questions.filter(q=>q.source.copiedFrom).length,added:questions.filter(q=>!q.source.copiedFrom).length,
 bookSearchCount:all.length,yearTagged:book.length,madeEasyKeyChecks:Object.keys(keys).length,manualReview:[...manual],reviewedDiscussions:[...reviewed],corrections,
 excluded:book.filter(q=>!used.has(q.id)).map(q=>({id:q.id,text:q.text,reason:'duplicate representation of Q83'})),fullSearch,
 coverage:questions.map(q=>({number:q.paperQuestionNumber,pages:q.source.pdfPages,status:q.verificationStatus,issues:q.source.issues,copiedFrom:q.source.copiedFrom}))};
await fs.writeFile(`${base}/content-audit.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify({questions:90,copied:report.copied,added:report.added,excluded:report.excluded.length,manual:report.manualReview},null,2));
