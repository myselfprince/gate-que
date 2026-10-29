import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {bookMap,additions,answers} from '../data/papers/gate-cs-2004-supplement.mjs';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
import {preparePaperAssets} from '../src/lib/year-paper-assets-server.mjs';
const S=String.raw,base='data/backups/gate-2004';
const book=JSON.parse(await fs.readFile(`${base}/book-2004.json`,'utf8'));
const refs=JSON.parse(await fs.readFile(`${base}/reference-2004.json`,'utf8')).filter(r=>r.title.startsWith('GATE CSE 2004 | Question:'));
const slug='gate-cs-2004',title='GATE CS 2004',sourceFile='D:/Gate PYQs Year Wise - PDFs/2004.pdf';
const sourceSha256=createHash('sha256').update(await fs.readFile(sourceFile)).digest('hex');
if(sourceSha256!=='ba48acc7ffb92c1722d6efc85bd324a1001e35f5bb1b8766dddbf3d629e081a5')throw new Error('Unexpected source PDF.');
const manual=new Set([14,47,49,62,63,71,76,82,83,87,89]);
const reviewed=new Set([10,14,33,34,36,37,47,49,54,62,63,71,73,76,77,78,81,85,87,88,89,90]);
// Only key pages visually read during this import are designated visually checked.
const keys={
3:['C Prog. & Data Structures.pdf',3,'3.8','D'],4:['C Prog. & Data Structures.pdf',5,'5.15','B'],5:['C Prog. & Data Structures.pdf',3,'3.9','B'],6:['C Prog. & Data Structures.pdf',5,'5.16','D'],
8:['Compiler Design.pdf',5,'2.10','B'],9:['Compiler Design.pdf',3,'1.8','C'],10:['Compiler Design.pdf',7,'3.6','B'],11:['OS.pdf',3,'1.20','A'],12:['OS.pdf',9,'4.25','D'],13:['DBMS.pdf',8,'4.8','B'],14:['DBMS.pdf',4,'2.16','A'],16:['CN.pdf',7,'3.4','B'],17:['Digital Logic.pdf',1,'1.20','D'],18:['Digital Logic.pdf',3,'3.7','C'],20:['COA.pdf',1,'1.5','C'],21:['OS.pdf',9,'4.26','A'],25:['Discrete Mathemetics.pdf',5,'5.13','A'],29:['Algorithms.pdf',3,'1.11','C'],
35:['C Prog. & Data Structures.pdf',5,'5.18','B'],36:['C Prog. & Data Structures.pdf',3,'3.10','C'],37:['Algorithms.pdf',7,'3.9','A'],38:['C Prog. & Data Structures.pdf',3,'3.11','A'],40:['Algorithms.pdf',13,'6.10','D'],42:['Algorithms.pdf',3,'1.12','C'],43:['C Prog. & Data Structures.pdf',5,'5.17','D'],44:['Algorithms.pdf',7,'3.6','B'],45:['Compiler Design.pdf',7,'3.7','C'],46:['OS.pdf',3,'1.23','A'],47:['OS.pdf',9,'4.27','D'],48:['OS.pdf',5,'2.12','D'],49:['OS.pdf',11,'5.12','C'],50:['DBMS.pdf',4,'2.17','B'],51:['DBMS.pdf',8,'4.9','D'],52:['DBMS.pdf',12,'6.4','C'],
55:['CN.pdf',7,'3.11','A'],56:['CN.pdf',7,'3.12','D'],57:['CN.pdf',7,'3.13','B'],58:['Digital Logic.pdf',2,'2.11','B'],59:['Digital Logic.pdf',1,'1.23','A'],60:['Digital Logic.pdf',2,'2.12','A'],61:['Digital Logic.pdf',3,'3.8','D'],62:['Digital Logic.pdf',2,'2.10','A'],63:['COA.pdf',1,'1.8','C'],64:['COA.pdf',1,'1.10','B'],67:['COA.pdf',5,'5.8','A'],68:['COA.pdf',5,'5.9','D'],69:['COA.pdf',3,'3.8','C'],74:['Discrete Mathemetics.pdf',5,'5.16','D'],78:['Discrete Mathemetics.pdf',5,'5.17','A'],80:['Discrete Mathemetics.pdf',5,'5.18','D'],82:['Algorithms.pdf',3,'1.13','C'],83:['Algorithms.pdf',3,'1.14','D'],84:['Algorithms.pdf',3,'1.15','A'],85:['Algorithms.pdf',13,'6.11','A']};
const issues={
1:'Book says structures programming; selected source says structured programming.',
7:'Selected scan D says 3 or 4, not the book’s 3 and 4.',
11:'Original numbered statements restored; historical user-thread model is assumed.',
13:'Book C contains an extra set difference absent from this selected scan; source expression restored.',
14:'The foreign-key constraint needed by conventional A is unstated. Without it the minimum join cardinality is 0. Enroll.courseno spelling restored.',
15:'Group lists restored as editable text to avoid splitting or shrinking a wide table.',
32:'Book A ends the reversed suffix at d_(m-i), an off-by-one error; selected source ends at d_(m-i+1).',
33:'Source C says gnirt, not duplicated gnirts. Code is a segment; the loop variable declaration is not printed.',
34:'Stem says computeSalary while the numbered alternatives say getSalary. Both source names retained.',
36:'Made Easy printed C contradicts the circular-queue rear-pointer construction. Independent derivation and discussion resolve A; original book key untouched.',
38:'All postfix/prefix option strings restored in source order, including non-answer typos.',
41:'Source code whitespace restored to valid operators and comment delimiters; no algorithm change.',
43:'Source structure identifier is CellNode; editable code retains the original max recurrence.',
44:'Selected scan graph has a different arrow direction on the S/U diagonal than the cleaner book diagram. Source graph crop used; finalization order remains B.',
47:'Scan D is 1230 ns, whereas supplied book copy D is 1260 ns. Independent two-level translation gives 1260; manual assessment avoids silently replacing the scan option.',
49:'No listed option is the exact inode maximum. Conventional C is its dominant-term approximation.',
53:'Primary-key underline on name restored from scan.',
54:'Conventional B computes the strict win on the next backoff draw; repeated tie rounds are not included.',
55:'Routing table restored from scan as editable text, replacing the book placeholder.',
56:'Shared data restored with its own network crop. Copied book placeholder replaced only in year-paper copy.',
57:'Shared data originally spans Q56-Q57; repeated for independent navigation.',
62:'Supplied key A conflicts with the usual complete-sum delay B. Implementation and gate-polarity assumptions are debated; manual review.',
63:'Supplied key C assumes the HALT start address; after-HALT sequential PC gives D. Hypothetical halt semantics are unspecified; manual review.',
70:'Source prints P OR Q, while book prints P AND Q. Literal scan formula preserved.',
71:'Scan has first right-hand side +1 and third equation x-3y=3. Book/discussion instead have -1 and x+3y=3. Literal scan is inconsistent; manual review.',
72:'Incomplete group operation table restored as editable math rather than image.',
76:'Cover by a union of rows/columns gives bound a+b; rectangular support interpretation gives min(a,b). Ambiguous cover wording retained; manual review.',
82:'Source loop is i<=n and source D is O(n), not book i<n and O(n log n). Both C and D are true; manual review.',
83:'Printed assumption is a>0, but the function parameter is n. Intended positive-n interpretation disclosed only in review.',
84:'Source D prints 2^(n-1)+n, unlike book 2^n+n. Source expression retained.',
85:'Book options and key differ. Source has four Theta options and correct B; supplied key A is independently refuted by per-level summation.',
87:'Low-resolution source exponent read as m-n; reference book and discussion use m+n. Missing nonnegative-exponent constraint and uncertain sign disclosed; manual review.',
88:'Source heading says grammar G; conventional source uses positive closure {a,b}+. Grammar and all four options retained.',
89:'Selected scan uses i<=j, while the book copy uses i<j. Nonrepeating enumeration convention required for the authored index-order decision argument; manual review.'};
const pageMap=n=>n<=8?[1]:n<=14?[2]:n===15?[2,3]:n<=24?[3]:n<=33?[4]:n===34?[4,5]:n<=38?[5]:n===39?[5,6]:n<=45?[6]:n===46?[6,7]:n<=52?[7]:n===53?[7,8]:n<=59?(n===59?[8,9]:[8]):n<=65?(n===63||n===64?[9]:[9]):n===66?[9,10]:n<=69?[10]:n===70?[10]:n<=73?[10]:n===74?[10,11]:n<=78?[11]:n===79?[11]:n<=82?[11]:n===83?[11,12]:n<=87?[12]:n===88?[12]:[12];
const directory=`public/Year Papers/${title}`;await fs.mkdir(directory,{recursive:true});
const sharedNetwork=S`Common data for Q56-Q57:
Consider three IP networks A, B and C. Host $H_A$ in network A sends messages each containing 180 bytes of application data to a host $H_C$ in network C. The TCP layer prefixes a 20 byte header to the message. This passes through an intermediate network B. The maximum packet size, including 20 byte IP header, in each network is:
A: 1000 bytes
B: 100 bytes
C: 1000 bytes
The networks A and B are connected through a 1 Mbps link, while B and C are connected by a 512 Kbps link (bps = bits per second).
[IMG_1]`;
const questions=[],corrections={};
for(let n=1;n<=90;n++){
 const source=bookMap[n]===undefined?null:book[bookMap[n]],q=structuredClone(source||additions[n]);if(!q)throw new Error(`Missing Q${n}`);
 if(source){
  if([44,55,56,57,72].includes(n))q.diagram='';
  const names=(q.diagram||'').split(',').map(s=>s.trim()).filter(Boolean),renamed=new Map();
  for(const name of new Set([...names,...['optA','optB','optC','optD'].flatMap(k=>q[k]?.startsWith('IMG:')?[q[k].slice(4).trim()]:[])])){
   const dest=`q${n}-${name}`;renamed.set(name,dest);
   await fs.copyFile(path.join('public',source.assetSubject||source.subject,source.assetChapter||source.chapter,name+(source.ext||'.png')),path.join(directory,dest+(source.ext||'.png')));
  }
  q.diagram=names.map(name=>renamed.get(name)).join(',');
  for(const k of ['optA','optB','optC','optD'])if(q[k]?.startsWith('IMG:'))q[k]='IMG:'+renamed.get(q[k].slice(4).trim());
 }
 if(n===1)q.text='The goal of structured programming is to';
 if(n===7)q.optD='3 or 4';
 if(n===11){q.text=q.text.replace('(i)','1.').replace('(ii)','2.').replace('(iii)','3.').replace('(iv)','4.');q.optA='2, 3 and 4 only';q.optB='2 and 3 only';q.optC='1 and 3 only';q.optD='1 and 2 only';}
 if(n===13){q.optC=S`$\Pi_D(r_1\bowtie_{C\ne D}r_2)$`;q.optD=S`$\Pi_C(r_1\bowtie_{C=D}r_2)$`;}
 if(n===14)q.text=q.text.replace('\\text{course}', '\\text{courseno}');
 if(n===15)q.text='Choose the best matching between Group 1 and Group 2.\nGroup 1\nP. Data link layer\nQ. Network layer\nR. Transport layer\nGroup 2\n1. Ensures reliable transport of data over a physical point-to-point link\n2. Encodes/decodes data for physical transmission\n3. Allows end-to-end communication between two processes\n4. Routes data from one network node to the next';
 if(n===20){q.text='Which of the following addressing modes are suitable for program relocation at run time?\n(i) Absolute addressing\n(ii) Based addressing\n(iii) Relative addressing\n(iv) Indirect addressing';q.optA='(i) and (iv)';q.optB='(i) and (ii)';q.optC='(ii) and (iii)';q.optD='(i), (ii) and (iv)';}
 if(n===32){q.text=q.text.replace('i^{\\text{th}}','j^{\\text{th}}');q.optA=S`$n=d_1d_2\ldots d_{m-j}$ and $\mathrm{rev}=d_md_{m-1}\ldots d_{m-j+1}$`;q.optB=S`$n=d_{m-j+1}\ldots d_{m-1}d_m$ or $\mathrm{rev}=d_{m-j}\ldots d_2d_1$`;}
 if(n===33){q.code=q.code.replace('int i;\n','');q.optC='gnirt';}
 if(n===35){q.text=q.text.replace('1. Preorder','(i) preorder').replace('2. Inorder','(ii) inorder').replace('3. Preorder','(iii) preorder').replace('4. Level','(iv) level');q.optA='(i) only';q.optB='(ii), (iii)';q.optC='(iii) only';q.optD='(iv) only';}
 if(n===34)q.pdfStyle={fontSize:16,minFontSize:12,imageScale:.5,lineSpacing:1.1};
 if(n===37)q.pdfStyle={fontSize:18,minFontSize:14,imageScale:.65};
 if(n===38){q.isCodeOptions=false;q.optA=S`$abc\times+def\wedge\wedge-$`;q.optB=S`$abc\times+de\wedge f\wedge-$`;q.optC=S`$ab+c\times d-e\wedge f\wedge$`;q.optD=S`$-+a\times bc\wedge\wedge def$`;}
 if(n===41)q.code=q.code.replace('> 0* /','> 0 */').replace('m! = n','m != n').replace('% d','%d');
 if(n===43)q.pdfStyle={fontSize:17,minFontSize:12};
 if(n===44)q.diagram='q44-source-graph';
 if(n===47)q.optD='1230 nanoseconds';
 if(n===51)q.pdfStyle={fontSize:16,minFontSize:12};
 if(n===53)q.text=q.text.replace('Employee (name, sex, salary, deptName)',S`$\mathrm{Employee}(\underline{\mathrm{name}},\mathrm{sex},\mathrm{salary},\mathrm{deptName})$`);
 if(n===55){q.text=S`The routing table of a router is shown below:
$$\begin{array}{lll}\mathrm{Destination}&\mathrm{Subnet\ Mask}&\mathrm{Interface}\\128.75.43.0&255.255.255.0&\mathrm{Eth0}\\128.75.43.0&255.255.255.128&\mathrm{Eth1}\\192.12.17.5&255.255.255.255&\mathrm{Eth3}\\\mathrm{default}&&\mathrm{Eth2}\end{array}$$
On which interfaces will the router forward packets addressed to destinations 128.75.43.16 and 192.12.17.10 respectively?`;}
 if(n===56||n===57){q.diagram='q56-network';q.text=sharedNetwork+'\n'+(n===56?'Assuming that the packets are correctly delivered, how many bytes, including headers, are delivered to the IP layer at the destination for one application message, in the best case? Consider only data packets.':S`What is the rate at which application data is transferred to host $H_C$? Ignore errors, acknowledgments, and other overheads.`);q.pdfStyle={fontSize:16,minFontSize:12,imageScale:.8};}
 if(n===63||n===64){q.text=q.text.replace('Common Data for Q.1.8 to Q.1.10:','Common data for Q63-Q64:').replace('byte addressable with size 32 bits','byte addressable with word size 32 bits');q.pdfStyle={fontSize:15,minFontSize:11};}
 if(n===70)q.text=S`The following propositional statement is
$$(P\rightarrow(Q\vee R))\rightarrow((P\vee Q)\rightarrow R)$$`;
 if(n===71){q.text=S`How many solutions does the following system of linear equations have?
$$\begin{aligned}-x+5y&=1\\x-y&=2\\x-3y&=3\end{aligned}$$`;q.optD='none';}
 if(n===72){q.text=S`The following is the incomplete operation table of a 4-element group.
$$\begin{array}{c|cccc}*&e&a&b&c\\\hline e&e&a&b&c\\a&a&b&c&e\\b&&&&\\c&&&&\end{array}$$
The last row of the table is`;}
 if(n===82){q.code=q.code.replace('i < n','i <= n');q.optD=S`$O(n)$`;}
 if(n===83)q.text=q.text.replace('n>0','a>0');
 if(n===84)q.optD=S`$2^{n-1}+n$`;
 if(n===85){q.optA=S`$\Theta(n)$`;q.optB=S`$\Theta(n\log n)$`;q.optC=S`$\Theta(n^2)$`;q.optD=S`$\Theta(n^2\log n)$`;}
 if(n===87)q.text=S`The language $\{a^m b^n c^{m-n}\mid m,n\ge1\}$ is`;
 if(n===88)q.text=q.text.replace('grammar C','grammar G');
 if(n===89)q.text=q.text.replace('i<j',S`i\le j`);
 const ref=refs.find(r=>Number(r.title.match(/Question:\s*(\d+)/)?.[1])===n);if(!ref)throw new Error(`No source discussion mapping Q${n}`);
 const [key,referenceAnswer]=answers[n],fields={...q};for(const k of ['_id','chapterId','source','solutionUrl','gateOverflowUrl','tempPaste'])delete fields[k];
 const sectionName=n<=30?'One-mark questions':'Two-mark questions';
 const answerSources=[{kind:'authored-reference',status:'independently-derived',official:false},{kind:'gateoverflow',url:ref.url,status:reviewed.has(n)?'discussion-reviewed':'question-mapping-from-local-cache; answer-not-individually-cross-checked',official:false}];
 if(keys[n]){const [file,pdfPage,question,printed]=keys[n];answerSources.push({kind:'made-easy-key',file:`C:/Users/Prince/Desktop/MadeEasy PYQ PDF/All Subject Solutions Keys/${file}`,pdfPage,question,printed,status:'visually-checked',official:false});}
 if(source?.source)answerSources.push({kind:'book-stored-provenance',...source.source,status:'retained-book-provenance; not-an-official-key'});
 const record={...fields,id:`${slug}-q${String(n).padStart(2,'0')}`,key:`yearpaper:${slug}:${n}`,datasetId:slug,
 subject:q.subject,chapter:sectionName,assetSubject:'Year Papers',assetChapter:title,year:'2004',examPaper:'CS',setNum:'',paperQuestionNumber:String(n),originalLabel:String(n),
 marks:String(n<=30?1:2),questionType:'MCQ',correctOptions:[key],natAnswer:'',isProof:false,isBlank:false,isPosLocked:false,sectionId:n<=30?'one':'two',sectionName,referenceAnswer,manualReview:manual.has(n),gateOverflowUrl:ref.url,answerSources,
 verificationStatus:manual.has(n)?'source-defect-or-disputed-manual-review':reviewed.has(n)||keys[n]?'independent-review-with-source-cross-check':'independent-authored-review',
 source:{file:sourceFile,sha256:sourceSha256,pdfPages:pageMap(n),originalLabel:String(n),displayedSourceNumber:String(n),
 ...(source?{copiedFrom:{chapterId:source.chapterId,questionId:source.id,year:source.year,subject:source.subject,chapter:source.chapter,bookLabel:source.source?.questionNumber||'',recordSha256:createHash('sha256').update(JSON.stringify(source)).digest('hex')}}:{}),issues:issues[n]?[issues[n]]:[]}};
 if(n===1)record.exportInstruction='ONE-MARK QUESTIONS (1-30). Select one option per question. Paper maximum: 150 marks. Practice timer: 180 minutes; zero penalty. Duration and penalty are not stated in the selected scan.';
 if(n===31)record.exportInstruction='TWO-MARK QUESTIONS (31-90). Select one option per question. No optional-question rule or General Aptitude section appears in the selected scan.';
 if(source){const changed=['text','code','optA','optB','optC','optD','marks','questionType','correctOptions'].filter(k=>JSON.stringify(source[k])!==JSON.stringify(record[k]));if(changed.length)corrections[n]=changed;}
 questions.push(record);
}
const paper=validateYearPaper({slug,datasetId:slug,title,year:'2004',examPaper:'CS',setNum:'',questionCount:90,totalMarks:150,availableMarks:150,durationMinutes:180,negativeFraction:0,verified:true,sourceUrl:'https://gateoverflow.in/998/gate-cse-2004-question-1',sourceSha256,instructions:[
'Verified header: GATE-2004, COMPUTER SCIENCE & ENGINEERING. The selected 12-page 2004.pdf is one paper with no set or session label. The physical filename is unchanged.',
'Q1-Q30 are one-mark MCQs; Q31-Q90 are two-mark MCQs. All 90 positions are preserved in original order, totaling 150 marks. No General Aptitude, descriptive section or optional-question rule appears. Shared data are repeated with each linked question.',
'The selected scan omits duration and negative-marking instructions. This practice uses 180 minutes and zero penalty; these are explicitly practice settings, not verified official 2004 grading rules. The -0.25 inside Q74 belongs to that hypothetical question only.',
'Every position has an authored worked reference. No official key was located. Per-question sources distinguish independent derivation, visually checked Made Easy keys, reviewed GATE Overflow discussions and question mappings from the local cache.',
'Q14, Q47, Q49, Q62, Q63, Q71, Q76, Q82, Q83, Q87 and Q89 have source defects or interpretation disputes. Their 21 marks require labeled post-submission self-assessment; the remaining 129 marks are automatically graded. Other resolved book-key errors and scan differences are disclosed in review.',
'These are independent year-paper copies. The original book text, options, answers, diagrams, IDs, locks, order and metadata remain unchanged. Responses, timer, review markers and navigation autosave and resume in this browser.'
],questions});
const prepared=await preparePaperAssets(paper,'public');
await fs.writeFile(`data/papers/${slug}.json`,JSON.stringify(prepared.paper,null,2)+'\n');
const report={identity:{year:'2004',examPaper:'CS',setNum:'',sourceFile,sourceSha256},questionCount:90,copied:questions.filter(q=>q.source.copiedFrom).length,added:questions.filter(q=>!q.source.copiedFrom).length,yearTagged:book.length,bookSearchCount:JSON.parse(await fs.readFile(`${base}/book-search.json`,'utf8')).length,madeEasyKeyChecks:Object.keys(keys).length,reviewedDiscussions:[...reviewed],manualReview:[...manual],manualMarks:questions.filter(q=>q.manualReview).reduce((s,q)=>s+Number(q.marks),0),corrections,
 duplicates:[{positions:[36],bookIds:[book[35].id,book[107].id],selected:book[107].id},{positions:[54],bookIds:[book[46].id,book[51].id],selected:book[51].id},{positions:[56],bookIds:[book[45].id,book[59].id],selected:book[59].id}],coverage:questions.map(q=>({number:q.paperQuestionNumber,pages:q.source.pdfPages,status:q.verificationStatus,issues:q.source.issues,copiedFrom:q.source.copiedFrom}))};
await fs.writeFile(`${base}/content-audit.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({copied:report.copied,added:report.added,madeEasyKeyChecks:report.madeEasyKeyChecks,manual:report.manualReview,manualMarks:report.manualMarks},null,2));
