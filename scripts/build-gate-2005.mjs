import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {bookMap,additions} from '../data/papers/gate-cs-2005-supplement.mjs';
import {answers} from '../data/papers/gate-cs-2005-answers.mjs';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
import {preparePaperAssets} from '../src/lib/year-paper-assets-server.mjs';
const S=String.raw,base='data/backups/gate-2005',slug='gate-cs-2005',title='GATE CS 2005';
const book=JSON.parse(await fs.readFile(base+'/book-2005.json','utf8'));
const all=JSON.parse(await fs.readFile(base+'/book-search.json','utf8'));
const refs=JSON.parse(await fs.readFile(base+'/reference-2005.json','utf8')).filter(r=>r.title.startsWith('GATE CSE 2005 | Question:'));
const sourceFile='D:/Gate PYQs Year Wise - PDFs/2005.pdf';
const sourceSha256=createHash('sha256').update(await fs.readFile(sourceFile)).digest('hex');
if(sourceSha256!=='4444090943ce9093ca672ddc0aa981bf3fb09559ba0bd1bc7c1588a82d199724')throw new Error('Unexpected source PDF');
const manual=new Set([14,36,55,61,68,70,72]);
const reviewed=new Set([4,7,14,15,19,32,48,50,55,61,68,70,71,72,83,86,88,89,90]);
// Only these supplied key leaves were read directly in this import.
const keys={7:['Algorithms.pdf',3,'1.17','D'],37:['Algorithms.pdf',3,'1.18','C'],81:['Algorithms.pdf',3,'1.20','B'],82:['Algorithms.pdf',3,'1.21','B'],15:['Digital Logic.pdf',1,'1.26','A'],18:['Digital Logic.pdf',1,'1.27','A'],19:['COA.pdf',1,'1.9','B'],20:['COA.pdf',1,'1.10','B'],65:['COA.pdf',1,'1.11','D'],66:['COA.pdf',1,'1.12','C']};
Object.assign(keys,{
60:['Compiler Design.pdf',5,'2.12','B'],61:['Compiler Design.pdf',3,'1.9','C'],14:['Compiler Design.pdf',5,'2.11','B'],
62:['Digital Logic.pdf',3,'3.12','A'],64:['Digital Logic.pdf',3,'3.13','D'],68:['COA.pdf',3,'3.9','A'],
69:['COA.pdf',5,'5.14','B'],70:['COA.pdf',5,'5.15','B'],21:['COA.pdf',5,'5.13','B'],
72:['OS.pdf',3,'1.26','D'],79:['COA.pdf',2,'2.16','B'],80:['COA.pdf',2,'2.17','B'],
87:['Algorithms.pdf',7,'3.14','D'],88:['Algorithms.pdf',7,'3.15','A'],34:['Algorithms.pdf',7,'3.16','D']});
const issues={
2:'Exact ADT content found in a book record tagged 2004; copied with provenance, without changing the book tag.',
4:'Selected scan option C says (i), (ii) and (iv); source order retained.',
5:'Source prints the score interval (0,100), while discussion uses [0,100]. Intended fifty counters retained.',
6:'Multiplicity of spanning trees assumes n>=3, unstated in the source.',
10:'Source option A is 6; book option A is 0. Only the paper copy is corrected.',
19:'Supplied Made Easy key B differs from independent daisy-chain/vector derivation C; book key remains untouched.',
31:'Source has no getchar call and prints %d\\n for sum; book typo %dn and extra getchar removed in copy.',
33:'Source last sequence includes 9; book prints 0. Corrected only in the copy.',
35:'Source final distractor is 42, unlike book 35.',
36:'Source C prints z(k-1)+1 (undefined z), while D is n(k-1). The book silently uses n at C. Literal source retained; conventional C after z->n correction is self-assessed.',
39:'Source uses ceiling(log n) lists and floor(n/log n) elements; matched full-content book record with those rounding symbols.',
42:'Source option A lists union then intersection; book reverses their order. Equivalent content restored literally.',
48:'Selected scan has -3x3 in equation 1 and +2x2,+4x2 in equations 2,3. Book signs differ; literal scan matrix is nonsingular.',
50:'Selected scan prints five options A=1,B=i,C=i+1,D=2i,E=2^i. Book/discussion omit A=1 and key i+1 as B. Final source key is C.',
55:'The source separator after c^m in L2 is malformed, appearing as + n,m>0 on the next line. Literal expression retained; conventional intended language uses a separator before n,m>0. No automatic grading.',
61:'fro(...) is an identifier function call in historical C; Made Easy C conflicts with A. Modern C requires an undeclared-function diagnostic. Manual review.',
62:'Source X waveform and edge sampling are used; all five output entries retained.',
64:'Source state Q0Q1 order and all return arrows preserved as editable transitions.',
66:'Book re-labels code and addressing modes with a different list convention. Source numbered code and lettered modes restored.',
68:'Source instruction 3 is I3: S R2,R0, unlike the book repeated I2/A opcode. Intended forwarding hardware is unstated; manual review.',
70:'Selected source says one 4-byte word, unlike book one-byte wording; source restored. Printed key 25 is approximate, not exact with decimal or binary KB.',
71:'Selected scan repeats the same forall i, si<m distractor at A and B; book/discussion B instead say si<n. Both source distractors are retained; unique sufficient condition C is derived independently.',
72:'Conventional virtual address model gives C; Made Easy D differs. %d for &a is nonportable; literal source retained for manual review.',
78:'Source scheme uses final attribute H; historical typography can resemble F. Answer sets all use H.',
79:'Shared data repeated on both independent question pages; source common-data identifiers 79 and 80 retained.',
80:'Source memory-cycle overlap model retained; answer B takes three cycles after first-word fetch.',
82:'Malformed book stem corrected from the selected scan; function and memoization details kept editable.',
83:'Source has blank A; text MST is labeled B, shortest path C, each path D, longest path E. Five source slots are preserved; the reference four-option key A maps to source B.',
85:'Grammar and semantic equations are editable; no answer or precedence annotation is added to the active question.',
87:'T4 and T5 have equal profits but different deadlines. Exhaustive feasible-subset enumeration finds a unique optimal subset, omitting T4 and T6; their equal profits do not create a second optimum.',
89:'Eight stored fraction bits are truncated; no official key is claimed.',
90:'Interpretation follows the source instruction to shift the previous field and pad only zero bits; direct requantization can differ in the last bit.'};
const label=n=>n<=80?String(n):`${81+Math.floor((n-81)/2)}${n%2?'a':'b'}`;
function pages(n){if(n<=8)return[1];if(n===9)return[1,2];if(n<=18)return[2];if(n===19)return[2,3];if(n<=28)return[3];if(n===29)return[3,4];if(n<=35)return[4];if(n===36)return[4,5];if(n<=45)return[5];if(n===46)return[5,6];if(n<=52)return[6];if(n===53)return[6,7];if(n<=60)return[7];if(n===61)return[7,8];if(n<=65)return[8];if(n===66)return[8,9];if(n<=71)return[9];if(n===72)return[9,10];if(n<=78)return[10];if(n<=80)return[10,11];if(n<=84)return[11];if(n<=86)return[11,12];return[12];}
const directory='public/Year Papers/'+title;await fs.mkdir(directory,{recursive:true});
const questions=[],corrections={};
for(let n=1;n<=90;n++){
 const source=n===2?all.find(q=>q.id==='7jjdjm8io'):bookMap[n]===undefined?null:book[bookMap[n]];
 const q=structuredClone(source||additions[n]);if(!q)throw new Error('Missing Q'+n);
 if(source){
  const names=(q.diagram||'').split(',').map(s=>s.trim()).filter(Boolean),renamed=new Map();
  for(const name of new Set([...names,...['optA','optB','optC','optD'].flatMap(k=>q[k]?.startsWith('IMG:')?[q[k].slice(4).trim()]:[])])){
   const dest='q'+n+'-'+name;renamed.set(name,dest);
   await fs.copyFile(path.join('public',source.assetSubject||source.subject,source.assetChapter||source.chapter,name+(source.ext||'.png')),path.join(directory,dest+(source.ext||'.png')));
  }
  q.diagram=names.map(name=>renamed.get(name)).join(',');for(const k of ['optA','optB','optC','optD'])if(q[k]?.startsWith('IMG:'))q[k]='IMG:'+renamed.get(q[k].slice(4).trim());
 }
 if(n===9)q.diagram='q9-hasse';
 if(n===10)q.optA='6';
 if(n===15)q.diagram='q15-circuit';
 if(n===31){q.code=q.code.replace('printf ("%dn", sum);','printf ("%d\\n", sum);').replace(/\s*getchar\(\);/,'');}
 if(n===33)q.optD='95, 50, 60, 40, 27, 23, 22, 25, 10, 9, 15, 29';
 if(n===35)q.optD='42';
 if(n===36){q.text='In a complete k-ary tree, every internal node has exactly k children. The number of leaves in such a tree with n internal nodes is:';q.optC='$z(k-1)+1$';q.optD='$n(k-1)$';}
 if(n===42)q.optA=S`$R\cup S$, $R\cap S$ are both equivalence relations`;
 if(n===47){q.text='Which one of the following graphs is NOT planar?\nThe graphs G1, G2, G3 and G4 appear in source order in options A, B, C and D.';q.diagram='';q.optA='IMG:q47-g1';q.optB='IMG:q47-g2';q.optC='IMG:q47-g3';q.optD='IMG:q47-g4';q.optLayout='2col';q.pdfStyle={fontSize:16,minFontSize:11};}
 if(n===48)q.text=S`Consider the following system of equations in three real variables $x_1,x_2,x_3$:
$$\begin{aligned}2x_1-x_2-3x_3&=1\\3x_1+2x_2+5x_3&=2\\-x_1+4x_2+x_3&=3\end{aligned}$$
This system of equations has`;
 if(n===50){q.optA='1';q.optB='$i$';q.optC='$i+1$';q.optD='$2i$';q.optE='$2^i$';}
 if(n===53)q.diagram='q53-machine';
 if(n===55)q.text=S`Consider the languages $L_1=\{a^n b^n c^m : n,m>0\}$ and $L_2=\{a^n b^m c^m + n,m>0\}$. Which one of the following statements is FALSE?`;
 if(n===62)q.diagram='q62-circuit,q62-timing';
 if(n===60)q.optD='$n_1=n_2=n_3$';
 if(n===61)q.code='int main() {                 /* Line 1 */\n    int I, N;                /* Line 2 */\n    fro (I=0, I<N, I++);     /* Line 3 */\n}';
 if(n===63)q.diagram='q63-machine';
 if(n===64)q.diagram='q64-circuit';
 if(n===66){q.text=S`Match each of the high level language statements given on the left hand side with the most natural addressing mode from those listed on the right hand side.
[CODE]
(a) Indirect addressing
(b) Indexed addressing
(c) Autoincrement`;q.code='1. A[I] = B[J];\n2. while (*A++);\n3. int temp = *x;';q.optA='(1,c), (2,b), (3,a)';q.optB='(1,a), (2,c), (3,b)';q.optC='(1,b), (2,c), (3,a)';q.optD='(1,a), (2,b), (3,c)';}
 if(n===68){q.code='I1: L R0, loc1; R0 <- M[loc1]\nI2: A R0, R0;   R0 <- R0 + R0\nI3: S R2, R0;   R2 <- R2 - R0';q.text=q.text.replace('RD stage it used','RD stage is used');}
 if(n===70)q.text=q.text.replace('whenever one byte word','whenever one 4 byte word');
 if(n===71)q.optB=S`$\forall i,\ s_i<m$`;
 if(n===74)q.text=q.text.replace('$46.4,\\mu s$','$46.4\\,\\mu s$');
 if(n===76)q.optD='(3,4), (4,3) and (6,4)';
 if(n===77)q.text='The relation book(title, price) contains the titles and prices of different books. Assuming that no two books have the same price, what does the following SQL query list?\n[CODE]';
 if(n===90)q.optC='49 D0';
 if(n===79||n===80){q.diagram='q79-80-datapath';q.text=q.text.replace('Common Data for Q.2.16 & Q.2.17:','Common Data for Questions 79 and 80:');}
 if(n===81||n===82){q.text='Statement for Linked Answer Questions 81(a) & 81(b):\nConsider the following C-function:\n[CODE]\n'+(n===81?'81(a). The space complexity of the above function is:':S`81(b). Suppose we modify the above function foo() and store the values of foo(i), $0\le i<n$, as and when they are computed. With this modification, the time complexity for function foo() is significantly reduced. The space complexity of the modified function would be:`);}
 if(n===85||n===86)q.text=q.text.replace('Common Data for Q. 3.9 & Q. 3.10:','Statement for Linked Answer Questions 83(a) & 83(b):');
 if(n===87||n===88)q.text=q.text.replace('Common Data for Q.3.14 and Q.3.15:','Statement for Linked Answer Questions 84(a) & 84(b):');
 if(n===89||n===90){q.diagram='q85-format';q.text=q.text.replace('Common Data Q.4.25 & Q.4.26:','Statement for Linked Answer Questions 85(a) & 85(b):');}
 const display=label(n),ref=refs.find(r=>r.title.match(/Question:\s*(\d+(?:-?[ab])?)/)?.[1].replaceAll('-','')===display);if(!ref)throw new Error('No reference Q'+display);
 const fields={...q};for(const k of ['_id','chapterId','source','solutionUrl','gateOverflowUrl','tempPaste','natRange','pdfStyle'])delete fields[k];
 const [key,referenceAnswer]=answers[n];
 const answerSources=[{kind:'authored-reference',status:'independently-derived',official:false},{kind:'gateoverflow',url:ref.url,status:reviewed.has(n)?'discussion-reviewed':'question-mapping-from-local-cache; answer-not-individually-cross-checked',official:false}];
 if(keys[n]){const[file,pdfPage,question,printed]=keys[n];answerSources.push({kind:'made-easy-key',file:'C:/Users/Prince/Desktop/MadeEasy PYQ PDF/All Subject Solutions Keys/'+file,pdfPage,question,printed,status:'visually-checked',official:false});}
 if(source?.source)answerSources.push({kind:'book-stored-provenance',...source.source,status:'retained-book-provenance; not-an-official-key'});
 const sectionId=n<=30?'one':n<=80?'two':'linked',sectionName=n<=30?'One-mark questions':n<=80?'Two-mark questions':'Linked answer pairs';
 const record={...fields,id:slug+'-q'+String(n).padStart(2,'0'),key:'yearpaper:'+slug+':'+n,datasetId:slug,chapter:sectionName,assetSubject:'Year Papers',assetChapter:title,year:'2005',examPaper:'CS',setNum:'',paperQuestionNumber:String(n),originalLabel:n<=80?display:display.replace(/([ab])$/,'($1)'),marks:String(n<=30?1:2),questionType:'MCQ',correctOptions:[key],natAnswer:'',isProof:false,isBlank:false,isPosLocked:false,sectionId,sectionName,referenceAnswer,manualReview:manual.has(n),gateOverflowUrl:ref.url,answerSources,verificationStatus:manual.has(n)?'source-defect-or-disputed-manual-review':keys[n]||reviewed.has(n)?'independent-review-with-source-cross-check':'independent-authored-review',pdfStyle:{fontSize:17,minFontSize:10,lineSpacing:1.12,...(q.pdfStyle||{})},
 source:{file:sourceFile,sha256:sourceSha256,pdfPages:pages(n),originalLabel:display,displayedSourceNumber:display,...(source?{copiedFrom:{chapterId:source.chapterId,questionId:source.id,year:source.year,subject:source.subject,chapter:source.chapter,bookLabel:source.source?.questionNumber||'',recordSha256:createHash('sha256').update(JSON.stringify(source)).digest('hex')}}:{}),issues:issues[n]?[issues[n]]:[]}};
 if(n>=81){record.text=`Source question ${record.originalLabel}\n`+record.text;if(n%2===0){record.dependsOnKey='yearpaper:'+slug+':'+(n-1);record.negativeFraction=0;}}
 if(n===1)record.exportInstruction='ONE-MARK QUESTIONS (1-30). Paper: 150 marks; practice timer: 180 minutes. Wrong answers lose 0.25 mark. Historical practice rules are corroborated by an archived instruction-page reproduction; the selected scan omits the instructions leaf.';
 if(n===31)record.exportInstruction='TWO-MARK QUESTIONS (31-80). Wrong answers lose 0.5 mark. All questions are compulsory; there is no General Aptitude section in this source.';
 if(n===81)record.exportInstruction='LINKED ANSWERS (81a-85b): two marks per part. Wrong part (a) loses 0.5 mark. Part (b) has no penalty and earns marks only if its part (a) is correct. Source defects are explained in the separate solutions.';
 if(source)corrections[n]=['text','code','optA','optB','optC','optD','optE','marks','questionType','correctOptions'].filter(k=>JSON.stringify(source[k])!==JSON.stringify(record[k]));
 questions.push(record);
}
const manualQs=questions.filter(q=>q.manualReview),manualMarks=manualQs.reduce((s,q)=>s+Number(q.marks),0);
const paper=validateYearPaper({slug,datasetId:slug,title,year:'2005',examPaper:'CS',setNum:'',questionCount:90,totalMarks:150,availableMarks:150,durationMinutes:180,negativeFraction:.25,verified:true,sourceUrl:questions[0].gateOverflowUrl,sourceSha256,instructions:[
'Verified selected header: GATE-2005, COMPUTER SCIENCE & ENGINEERING. One 12-page paper; no set/session label. The physical filename 2005.pdf is unchanged.',
'Q1-Q30: one mark each; Q31-Q80: two marks each; linked 81(a)-85(b): two marks per part. There are 90 answer positions, 85 top-level numbers and 150 marks. No General Aptitude or optional questions appear.',
'Practice uses 180 minutes, 0.25 penalty per one-mark MCQ and 0.5 per two-mark MCQ/linked part (a). Linked part (b) has zero penalty and is evaluated only after a correct part (a). The selected scan omits its instruction leaf; these historical practice settings are corroborated by an archived reproduction, not an authenticated official rulebook: https://www.onestopgate.com/downloads/computer-science/cs2005.pdf',
'Original linked labels and statements are retained alongside sequential navigation numbers 1-90. Shared data are repeated so every question is independently usable.',
'Every position has an authored worked reference, not an official key. Per-question provenance distinguishes visually checked supplied keys, reviewed GATE Overflow discussions and cache-only mappings.',
'Q'+manualQs.map(q=>q.originalLabel).join(', Q')+' require post-submission self-assessment ('+manualMarks+' marks). A dependent part remains unscored until its prerequisite is assessed correct. Disagreements and literal scan defects are documented in review.',
'All book matches are independent copies with new IDs, keys and assets. The book, previous papers and existing attempts are preserved. Responses, review markers and the timer autosave and resume in this browser.'
],questions});
const prepared=await preparePaperAssets(paper,'public');await fs.writeFile('data/papers/'+slug+'.json',JSON.stringify(prepared.paper,null,2)+'\n');
const report={sourceFile,sourceSha256,questions:90,copied:questions.filter(q=>q.source.copiedFrom).length,added:questions.filter(q=>!q.source.copiedFrom).length,bookSearchCount:all.length,visuallyCheckedKeys:Object.keys(keys).length,reviewedDiscussions:[...reviewed],manualReview:manualQs.map(q=>q.originalLabel),manualMarks,corrections,coverage:questions.map(q=>({number:q.paperQuestionNumber,label:q.originalLabel,pages:q.source.pdfPages,source:q.source.copiedFrom,status:q.verificationStatus,issues:q.source.issues}))};
await fs.writeFile(base+'/content-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,corrections:undefined,coverage:undefined},null,2));
