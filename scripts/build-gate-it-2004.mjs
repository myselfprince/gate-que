import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {bookMap,additions} from '../data/papers/gate-it-2004-supplement.mjs';
import {answers} from '../data/papers/gate-it-2004-answers.mjs';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
import {preparePaperAssets} from '../src/lib/year-paper-assets-server.mjs';
const S=String.raw,base='data/backups/gate-it-2004',slug='gate-it-2004',title='GATE IT 2004';
const book=JSON.parse(await fs.readFile(base+'/book-2004.json','utf8'));
const all=JSON.parse(await fs.readFile(base+'/book-search.json','utf8'));
const refs=JSON.parse(await fs.readFile(base+'/reference-2004.json','utf8')).filter(r=>r.title.startsWith('GATE IT 2004 | Question:'));
const sourceFile='D:/Gate PYQs Year Wise - PDFs/2004 it.pdf';
const sourceSha256=createHash('sha256').update(await fs.readFile(sourceFile)).digest('hex');
if(sourceSha256!=='b54c54f17e183e8c0362d9c263b2d8fabb3207c3b6c4d1aafce6c825dbab7008')throw new Error('Unexpected PDF');
const manual=new Set([11,12,34,40,41,44,50,57,60,71,72,74]);
const reviewed=new Set([11,12,34,40,46,47,49,63,71,72,82,84,89,90]);
const keys={
8:['Digital Logic.pdf',1,'1.21','B'],10:['COA.pdf',2,'2.9','B'],12:['COA.pdf',4,'4.9','A'],
14:['OS.pdf',3,'1.21','A'],42:['COA.pdf',1,'1.6','B'],43:['Digital Logic.pdf',4,'4.20','A'],
44:['Digital Logic.pdf',1,'1.22','B'],46:['COA.pdf',1,'1.7','D'],47:['COA.pdf',3,'3.6','C'],
48:['OS.pdf',9,'4.28','B'],49:['COA.pdf',2,'2.10','A'],50:['COA.pdf',3,'3.7','A'],
51:['COA.pdf',5,'5.10','C'],52:['C Prog. & Data Structures.pdf',3,'3.12','D'],
54:['C Prog. & Data Structures.pdf',5,'5.19','D'],62:['OS.pdf',11,'5.13','C'],
63:['OS.pdf',7,'3.4','A'],64:['OS.pdf',3,'1.22','C'],65:['OS.pdf',5,'2.13','D'],
66:['OS.pdf',9,'4.29','D'],67:['OS.pdf',11,'5.14','B'],
21:['DBMS.pdf',10,'5.4','C'],73:['DBMS.pdf',2,'1.2','B'],74:['DBMS.pdf',6,'3.9','D'],
75:['DBMS.pdf',4,'2.18','B'],76:['DBMS.pdf',6,'3.10','C'],77:['DBMS.pdf',10,'5.5','D'],
78:['DBMS.pdf',6,'3.11','C'],79:['DBMS.pdf',12,'6.5','C']
};
const issues={
2:'Book swaps the 35 and 30 pairwise-intersection labels and prints final option 30; source labels and option 35 restored.',
5:'Source final option is 2n-2 rather than book 2n-1.',
11:'Wrong-year book candidate (2011). Selected scan says 50 characters and option C 0.5 Mbps, unlike 80 and 0.8 in reference.',
12:'Selected scan hit rate 0.5 differs from 0.8 in book/discussion; source B 12.5 differs from book 12.8. Supplied Made Easy A also disagrees with the derived reference-variant C. Both scan and book print memory time 500 ns.',
31:'Book uses P,Q,R,S identifiers; source uses 1,2,3,4. Source third argument has conjunction between not-q and p; book has disjunction. Labels and connective restored.',
34:'Selected scan duplicates B/C; D is algebraically equal too. Single-answer grading disabled.',
40:'Literal source s-to-f transition has epsilon stack argument. Acceptance convention is unstated; discussion variants differ.',
41:'Source repeats delta(B,a) with conflicting destinations. It also prints B->bB rather than B->aB in intended option B; other distractor rules restored.',
44:'Source option B lacks a clear plus between AB-prime and AC-prime; literal source retained.',
46:'Selected scan B ends R2->R3, and D writes R2->M[100]; book differs. Both valid source D and book D preserve the intended final state.',
47:'Intended asynchronous variable-stage model disclosed; fixed synchronous clock is not specified.',
48:'Conventional sequential empty-line allocation is implicit; explicitly disclosed in solution.',
49:'Source I1/T4 is Bin,Cout; book prints PCin,Bout. Corrected only in copy.',
50:'Source ratio wording omits the compared operation type; preserved and self-assessed.',
55:'Book option A is malformed and C has wrong relation sign; source expressions restored.',
57:'Source recurrence II prints n-1k rather than n-1; literal defect retained.',
59:'Source historical implicit-int function definitions restored; standard-header spacing normalized.',
60:'Wrong-year candidate (2008). Source name wrt_it, main program and putch distractor restored. Output statement lies outside if.',
61:'Source f1 prints L,V, whereas source answer choices print U,V; original mismatch preserved.',
71:'Source option B is 500, not reference 50; no correct literal option.',
72:'MTBF convention and truncation distinguish C/D; self-assessed.',
73:'Source says A13 is multivalued despite referring to E2. Book instead says A23. Source text and C/D order restored.',
74:'Source first two student inserts omit dept_id despite claiming success; retained and self-assessed.',
80:'Source C is 011101100 rather than book 011101100 in its own order; final stuffed result is D.',
83:'Intended 10 kbps neglects serialization relative to round-trip time; exact ideal rate 9.524 kbps disclosed.',
89:'XML/DTD code stored as editable literal text; file labels are presentation labels.',
};
function pages(n){
if(n<=7)return [1];if(n<=16)return [2];if(n===17)return [2,3];if(n<=26)return [3];if(n<=32)return [4];if(n===33)return [4,5];if(n<=40)return [5];if(n===41)return [5,6];if(n<=47)return [6];if(n===48)return [6,7];if(n<=53)return [7];if(n===54)return [7,8];if(n<=57)return [8];if(n===58)return [8,9];if(n<=60)return [9];if(n===61)return [9,10];if(n<=64)return [10];if(n===65)return [10,11];if(n<=70)return [11];if(n===71)return [11,12];if(n<=76)return [12];if(n===77)return [12,13];if(n<=83)return [13];if(n===84)return [13,14];return [14];
}
const directory='public/Year Papers/'+title;await fs.mkdir(directory,{recursive:true});
const questions=[],corrections={};
for(let n=1;n<=90;n++){
const source=n===11?all.find(q=>q.id==='a031585b-2c1d-4526-b214-ac680eac26a0'):n===60?all.find(q=>q.id==='y6o5wmr4f'):bookMap[n]===undefined?null:book[bookMap[n]];
const q=structuredClone(source||additions[n]);if(!q)throw new Error('Missing Q'+n);
if(source){
 const names=(q.diagram||'').split(',').map(s=>s.trim()).filter(Boolean),renamed=new Map();
 for(const name of new Set([...names,...['optA','optB','optC','optD'].flatMap(k=>q[k]?.startsWith('IMG:')?[q[k].slice(4).trim()]:[])])){
  const dest='q'+n+'-'+name;renamed.set(name,dest);
  await fs.copyFile(path.join('public',source.assetSubject||source.subject,source.assetChapter||source.chapter,name+(source.ext||'.png')),path.join(directory,dest+(source.ext||'.png')));
 }
 q.diagram=names.map(name=>renamed.get(name)).join(',');
 for(const k of ['optA','optB','optC','optD'])if(q[k]?.startsWith('IMG:'))q[k]='IMG:'+renamed.get(q[k].slice(4).trim());
}
if(n===2){q.text='In a class of 200 students, 125 students have taken Programming Language course, 85 students have taken Data Structures course, 65 students have taken Computer Organization course; 50 students have taken both Programming Language and Data Structures, 35 students have taken both Programming Language and Computer Organization, 30 students have taken both Data Structures and Computer Organization; 15 students have taken all the three courses. How many students have not taken any of the three courses?';q.optD='35';}
if(n===5)q.optD='$2n-2$';
if(n===11){q.text=q.text.replace('$80$','$50$');q.optC='$0.5\\text{ Mbps}$';}
if(n===12){q.text=q.text.replace('0.8','0.5');q.optB='12.5 ns';}
if(n===31){q.text=q.text.replace('P:','1.').replace('Q:','2.').replace('R:','3.').replace('S:','4.').replace(S`(\neg q \vee p)`,S`(\neg q \wedge p)`);q.optA='1 and 2';q.optB='1 and 3';q.optC='1 and 4';q.optD='1, 2, 3 and 4';}
if(n===32)q.pdfStyle={fontSize:16,minFontSize:11,lineSpacing:1.1};
if(n===40){q.text=S`Let $M=(K,\Sigma,\Gamma,\Delta,s,F)$ be a pushdown automaton, where $K=\{s,f\}$, $F=\{f\}$, $\Sigma=\{a,b\}$, $\Gamma=\{a\}$ and
$$\Delta=\left\{\begin{array}{l}((s,a,\epsilon),(s,a)),\ ((s,b,\epsilon),(s,a)),\\((s,a,\epsilon),(f,\epsilon)),\\((f,a,a),(f,\epsilon)),\ ((f,b,a),(f,\epsilon))\end{array}\right\}$$
Which one of the following strings is not a member of $L(M)$?`;q.pdfStyle={fontSize:16,minFontSize:11};}
if(n===41){q.optB=S`$\{A\to aA,A\to bB,B\to bB,B\to aA,B\to\epsilon\}$`;q.optC=S`$\{A\to bB,A\to aB,B\to aA,B\to bA,A\to\epsilon\}$`;q.optD=S`$\{A\to aA,A\to bA,B\to bB,B\to aA,A\to\epsilon\}$`;q.pdfStyle={fontSize:16,minFontSize:11};}
if(n===42){q.text=q.text.replace('(i)','1.').replace('(ii)','2.').replace('(iii)','3.');q.optA='1 only';q.optB='2 only';q.optC='3 only';q.optD='1 and 3 only';}
if(n===41)q.text=q.text.replace(S`\delta(B, b) = A`,S`\delta(B, a) = A`);
if(n===44)q.optB=S`$AB'AC'+A'C$`;
if(n===46){q.optB=S`$\begin{array}{l}M[100]\to R2\\R1\to R2\\R2\to R3\end{array}$`;q.optD=S`$\begin{array}{l}R1\to R2\\R1\to R3\\R2\to M[100]\end{array}$`;}
if(n===49){q.text=q.text.replace(S`\mathrm{PCin,Bout}`,S`\mathrm{Bin,Cout}`);q.pdfStyle={fontSize:15,minFontSize:11};}
if(n===50)q.text='In an enhancement of a design of a CPU, the speed of a floating point unit has been increased by 20% and the speed of a fixed point unit has been increased by 10%. What is the overall achieved if the ratio of the number of fixed point operations is 2:3 and the floating point operation used to take twice the time taken by the fixed point operation in the original design?';
if(n===55){q.optA='$f(n)+h(n)=O(g(n)+h(n))$';q.optC=S`$h(n)\ne O(f(n))$`;}
if(n===57)q.text=q.text.replace('2T(n-1)+1','2T(n-1k)+1');
if(n===58){q.code=q.code.replace('< stdio.h >','<stdio.h>');q.isCodeOptions=true;q.pdfStyle={fontSize:15,minFontSize:10};}
if(n===59){q.code='#include <stdio.h>\nint funcf(int x);\nint funcg(int y);\nmain() {\n    int x = 5, y = 10, count;\n    for (count = 1; count <= 2; ++count) {\n        y += funcf(x) + funcg(x);\n        printf("%d ", y);\n    }\n}\nfuncf(int x) {\n    int y;\n    y = funcg(x);\n    return y;\n}\nfuncg(int x) {\n    static int y = 10;\n    y += 1;\n    return (y + x);\n}';q.pdfStyle={fontSize:16,minFontSize:11};}
if(n===60){
q.text='Choose the correct option to fill the ?1 and ?2 so that the program prints an input string in reverse order. Assume that the input string is terminated by a new line character.\n[CODE]';
q.code='#include <stdio.h>\nvoid wrt_it (void);\nint main (void)\n{\n    printf ("Enter Text");\n    printf ("\\n");\n    wrt_it();\n    printf ("\\n");\n    return 0;\n}\nvoid wrt_it (void)\n{\n    int c;\n    if (?1)\n        wrt_it();\n    ?2\n}';
q.optA="?1 is getchar() != '\\n'\n?2 is getchar(c);";q.optB="?1 is (c = getchar()) != '\\n'\n?2 is getchar(c);";q.optC="?1 is c != '\\n'\n?2 is putch(c);";q.optD="?1 is (c = getchar()) != '\\n'\n?2 is putchar(c);";q.isCodeOptions=true;q.pdfStyle={fontSize:15,minFontSize:10};
}
if(n===61){q.code='#include <stdio.h>\ntypedef struct { char *a; char *b; } t;\nvoid f1(t s); void f2(t *p);\nmain() {\n    static t s = {"A", "B"};\n    printf("%s %s\\n", s.a, s.b); f1(s);\n    printf("%s %s\\n", s.a, s.b); f2(&s);\n}\nvoid f1(t s) {\n    s.a = "L"; s.b = "V";\n    printf("%s %s\\n", s.a, s.b);\n    return; }\nvoid f2(t *p) {\n    p->a = "V"; p->b = "W";\n    printf("%s %s\\n", p->a, p->b);\n    return; }';q.optLayout='2col';q.pdfStyle={fontSize:15,minFontSize:12,lineSpacing:1.1};}
if(n===65)q.pdfStyle={fontSize:15,minFontSize:10};
if(n===73){q.text=q.text.replace('A23 is a multi-valued','A13 is a multi-valued');q.optC='4';q.optD='5';}
if(n===74){q.code="Insert into department values (1, 'Mathematics')\nInsert into department values (2, 'Physics')\nInsert into student values (1, 'Nvin')\nInsert into student values (2, 'Mukesh')\nInsert into student values (3, 'Gita', 1)\n\nSelect * from student, department";q.pdfStyle={fontSize:16,minFontSize:11};}
if(n===78)q.pdfStyle={fontSize:15,minFontSize:10};
if(n===80){q.optC='$011101100$';q.optD='$0110101100$';}
if(n===82)q.text=q.text.replace('$400,\\mu s$','$400\\,\\mu s$');
if(n===84){q.text=q.text.replace('I. 0010111 II. 0110110 III. 1011010 IV. 0111010','\n1. 0010111\n2. 0110110\n3. 1011010\n4. 0111010');q.optA='1 and 3';q.optB='1, 2 and 3';q.optC='2 and 4';q.optD='1, 2, 3 and 4';}
if(n===89)q.pdfStyle={fontSize:16,minFontSize:11};
if(n===90)q.pdfStyle={fontSize:15,minFontSize:10};
const ref=refs.find(r=>Number(r.title.match(/Question:\s*(\d+)/)?.[1])===n);if(!ref)throw new Error('Missing reference '+n);
const fields={...q};for(const k of ['_id','chapterId','source','solutionUrl','gateOverflowUrl','tempPaste'])delete fields[k];
const [answer,referenceAnswer]=answers[n];
const answerSources=[{kind:'authored-reference',status:'independently-derived',official:false},{kind:'gateoverflow',url:ref.url,status:reviewed.has(n)?'discussion-reviewed':'question-mapping-from-local-cache; answer-not-individually-cross-checked',official:false}];
if(keys[n]){const [file,pdfPage,question,printed]=keys[n];answerSources.push({kind:'made-easy-key',file:'C:/Users/Prince/Desktop/MadeEasy PYQ PDF/All Subject Solutions Keys/'+file,pdfPage,question,printed,status:'visually-checked',official:false});}
if(source?.source)answerSources.push({kind:'book-stored-provenance',...source.source,status:'retained-book-provenance; not-an-official-key'});
const record={...fields,id:slug+'-q'+String(n).padStart(2,'0'),key:'yearpaper:'+slug+':'+n,datasetId:slug,chapter:n<=30?'One-mark questions':'Two-mark questions',assetSubject:'Year Papers',assetChapter:title,year:'2004',examPaper:'IT',setNum:'',paperQuestionNumber:String(n),originalLabel:String(n),marks:String(n<=30?1:2),questionType:'MCQ',correctOptions:[answer],natAnswer:'',isProof:false,isBlank:false,isPosLocked:false,sectionId:n<=30?'one':'two',sectionName:n<=30?'One-mark questions':'Two-mark questions',referenceAnswer,manualReview:manual.has(n)||n===61,gateOverflowUrl:ref.url,answerSources,verificationStatus:manual.has(n)||n===61?'source-defect-or-disputed-manual-review':keys[n]||reviewed.has(n)?'independent-review-with-source-cross-check':'independent-authored-review',source:{file:sourceFile,sha256:sourceSha256,pdfPages:pages(n),originalLabel:String(n),displayedSourceNumber:String(n),...(source?{copiedFrom:{chapterId:source.chapterId,questionId:source.id,year:source.year,subject:source.subject,chapter:source.chapter,bookLabel:source.source?.questionNumber||'',recordSha256:createHash('sha256').update(JSON.stringify(source)).digest('hex')}}:{}),issues:issues[n]?[issues[n]]:[]}};
if(n===1)record.exportInstruction='ONE-MARK QUESTIONS (1-30). Select one option. Total paper: 150 marks. Practice settings: 180 minutes, zero penalty; duration and penalty are not stated in the selected scan.';
if(n===31)record.exportInstruction='TWO-MARK QUESTIONS (31-90). No optional questions or General Aptitude section appear in this source. Preserve source defects; consult the separate solutions only after attempting.';
if(source)corrections[n]=['text','code','optA','optB','optC','optD','marks','questionType','correctOptions'].filter(k=>JSON.stringify(source[k])!==JSON.stringify(record[k]));
questions.push(record);
}
const manualQs=questions.filter(q=>q.manualReview),manualMarks=manualQs.reduce((s,q)=>s+Number(q.marks),0);
const paper=validateYearPaper({slug,datasetId:slug,title,year:'2004',examPaper:'IT',setNum:'',questionCount:90,totalMarks:150,availableMarks:150,durationMinutes:180,negativeFraction:0,verified:true,sourceUrl:refs.find(r=>r.title==='GATE IT 2004 | Question: 1').url,sourceSha256,instructions:[
'Verified header: GATE-2004, INFORMATION TECHNOLOGY. The selected 14-page 2004 it.pdf is one paper with no set or session label. Its physical filename is unchanged.',
'Q1-Q30 are one-mark MCQs; Q31-Q90 are two-mark MCQs, 150 marks total. No General Aptitude, descriptive section or optional-question rule appears. All source positions and option order are retained.',
'The selected scan omits duration and negative-marking instructions. Practice uses 180 minutes and zero penalty; these are practice settings, not verified official 2004 rules.',
'All 90 positions have authored worked references. No official key was located. Per-question provenance distinguishes visually read Made Easy keys, reviewed GATE Overflow discussions and cache-only question mappings.',
'Source defects or interpretation disputes at Q'+manualQs.map(q=>q.paperQuestionNumber).join(', Q')+' require post-submission self-assessment ('+manualMarks+' marks). The remaining '+(150-manualMarks)+' marks are automatically graded. Conventional keys and alternative interpretations appear only in review.',
'Independent IT year-paper copies preserve the original book records, IDs, order, locks, answers and metadata. The timer, responses, navigation and review markers autosave and resume in this browser.'
],questions});
const prepared=await preparePaperAssets(paper,'public');
await fs.writeFile('data/papers/'+slug+'.json',JSON.stringify(prepared.paper,null,2)+'\n');
const report={sourceFile,sourceSha256,questions:90,copied:questions.filter(q=>q.source.copiedFrom).length,added:questions.filter(q=>!q.source.copiedFrom).length,bookSearchCount:all.length,madeEasyKeyChecks:Object.keys(keys).length,reviewedDiscussions:[...reviewed],manualReview:manualQs.map(q=>Number(q.paperQuestionNumber)),manualMarks,corrections,coverage:questions.map(q=>({number:q.paperQuestionNumber,pages:q.source.pdfPages,source:q.source.copiedFrom,status:q.verificationStatus,issues:q.source.issues}))};
await fs.writeFile(base+'/content-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,coverage:undefined,corrections:undefined},null,2));
