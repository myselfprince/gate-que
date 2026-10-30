import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {bookMap,additions,restoreSource} from '../data/papers/gate-cs-2008-supplement.mjs';
import {answers} from '../data/papers/gate-cs-2008-answers.mjs';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
import {preparePaperAssets} from '../src/lib/year-paper-assets-server.mjs';
const dir='data/backups/gate-2008',slug='gate-cs-2008',title='GATE CS 2008';
const book=JSON.parse(await fs.readFile(dir+'/book-2008.json','utf8'));
const all=JSON.parse(await fs.readFile(dir+'/book-search.json','utf8'));
const refs=JSON.parse(await fs.readFile(dir+'/reference-2008.json','utf8')).filter(r=>r.title.startsWith('GATE CSE 2008 | Question:'));
const sourceFile='D:/Gate PYQs Year Wise - PDFs/2008.pdf',sourceSha256=createHash('sha256').update(await fs.readFile(sourceFile)).digest('hex');
if(sourceSha256!=='f01fcd02a9a5544d1f89959eca288fe967bb537ed00513b46e5fe8f9f97f7202')throw new Error('Unexpected selected source PDF');
const manual=new Set([3,21,34,36,37,38,43,54,64,73,74,76,79,85]);
const reviewed=new Set([3,8,21,23,34,35,36,37,38,41,43,45,47,50,54,71,73,74,76,79,85]);
const keys={5:['Digital Logic.pdf',1,'1.39','A'],8:['Digital Logic.pdf',1,'1.40','C'],26:['Digital Logic.pdf',1,'1.42','A'],4:['Digital Logic.pdf',4,'4.31','D'],6:['Digital Logic.pdf',4,'4.32','D'],33:['COA.pdf',2,'2.20','C'],34:['COA.pdf',1,'1.24','D'],37:['COA.pdf',2,'2.21','C'],36:['COA.pdf',3,'3.18','D'],76:['COA.pdf',3,'3.19','A'],77:['COA.pdf',3,'3.20','D'],39:['Algorithms.pdf',3,'1.30','D'],40:['Algorithms.pdf',3,'1.31','B'],74:['Algorithms.pdf',3,'1.32','B'],75:['Algorithms.pdf',3,'1.33','C']};
const issues={
3:'Book second equation has 2x3+3x3 and its D excludes 5. Scan has 2x2+3x3 and D says any real number. Exact source restored; no correct choice.',
5:'Editable Karnaugh table and source option order retained. Blank cells denote zeros.',
6:'Radix subscripts r restored from the selected source; book omits them.',
8:'Source AND/OR circuit independently cropped. Exactly one offered f2 works although f2 outside f1 is unconstrained.',
19:'Source graph independently cropped; original BFS options preserved.',
21:'A is the conventional sufficient error-bound expression, not a literal integer minimum. Self-assessment disclosed.',
25:'Book prints 4x^2, selected source prints 24x^2. Corrected only in independent copy.',
34:'Supplied key D relies on terminology and exception-atomicity conventions; not an architecture-independent must. Manual review.',
35:'Source B is I and IV; C is I,III,IV. Book alters these statement combinations. Source restored.',
36:'Supplied Made Easy 3.18 key is D, but register renaming removes WAR hazards (II true). Authored B; disagreement requires self-assessment.',
37:'Made Easy 2.21 prints C, GO favors A; I and II may both hold for register windows broadly, while III is false. Manual review.',
38:'Conventional C assumes the final direct/indexed effective address; indirect-address translation can be earlier. Manual review.',
40:'Logarithmic bound is a worst-case comparison bound; favorable instances can take fewer comparisons.',
41:'Order four means at most four children; maximum five splits uses a permissible lower-median overflow split.',
42:'Path disjointness is internally vertex-disjoint; subset-edge bound conventionally concerns nonempty vertex subsets.',
43:'Conventional tight recurrence B and looser upper bound C are both inequalities. Pivot work unspecified. Manual review.',
45:'Independent source diagram retained. Direct Dijkstra/Bellman-Ford traces agree on all vertices for this source.',
49:'All six source transition tables transcribed to editable math, preserving each row, start arrow and accepting state.',
51:'Source E-H and P-S labels restored instead of book List I/II labels.',
52:'Four source NFAs freshly cropped together with their P-Q-R-S labels. Original regex and answer mappings restored.',
53:'Book mistakenly repeats b^n in II/III; scan has b^m. Source sets restored.',
54:'Conventional A assumes escaping closures; literal V also covers noncapturing returned functions. Manual review.',
60:'Historical void main and no includes are retained; worked trace uses intended usual C declarations.',
61:'D produces reversed non-newline characters but also prints the terminating newline at the base case. Literal code retained.',
62:'Lowercase void is printed in the selected scan; book Void corrected only in copy.',
63:'Initialization question is answered; no claim of full lost-wakeup correctness under every scheduling/semaphore convention.',
64:'Conventional answer presumes interrupt-driven I/O, absent from literal wording. Manual review.',
67:'Page tables are assumed aligned to their own 2 KiB sizes in the intended address-field calculation.',
69:'Collection is in BCNF and therefore also in 3NF; source C does not say 3NF only.',
71:'Shared array name is ARR, not book APR. Exact source passage/program repeated for Q71-73.',
72:'Shared source array restored; original element choices retained.',
73:'Store-miss policy unspecified. C assumes write-allocate; no-write-allocate gives A. Manual review.',
74:'Book Q74 omitted zero initialization present in source; restored. Recursive time is Theta(phi^n), not printed Theta(2^n). Manual review.',
75:'Complete shared code, including zero initializers, retained. N is an external capacity assumed at least 9 for f2(8).',
76:'Fall-through terminology may overlap with delay-slot instruction. Conventional A, manual review with linked Q77 pending.',
77:'Source operand is R6, not book R6x. Delay-slot shared statement retained.',
79:'Scan D is 16, unlike book 13. Correct count 13 has no matching scan option. Manual review; linked credit applies.',
80:'Source table is X with W+1 columns, unlike defective book Y/W-1 passage. Restored for both linked positions.',
81:'Full shared X/W+1 passage repeated, and original target-cell choices preserved.',
82:'Source ER diagram independently cropped with total participation and weak-entity notation, repeated for Q83.',
83:'Original source label and previous choices restored in shared linked context.',
84:'Original numbered binary-search program and all source contents/ranges retained.',
85:'Source option C uses <= (book has <). Conventional A fixes progress but still misses a last singleton due to i<j. Manual review.'
};
function pages(n){for(const [end,p] of [[7,2],[13,3],[20,4],[28,5],[35,6],[43,7],[48,8],[51,9],[53,10],[59,11],[62,12],[66,13],[70,14],[73,15],[76,16],[81,17],[85,18]])if(n<=end)return[n===77?16:p,...(n===77?[17]:[])];}
const assetDir=path.join('public','Year Papers',title);await fs.mkdir(assetDir,{recursive:true});await fs.copyFile(sourceFile,path.join(assetDir,'2008.pdf'));
const questions=[],corrections={};
for(let n=1;n<=85;n++){
 const source=bookMap[n]===undefined?null:book[bookMap[n]];
 const q=restoreSource(structuredClone(source||additions[n]),n,book);if(!q)throw new Error('Missing Q'+n);
 const ref=refs.find(r=>Number(r.title.match(/Question:\s*(\d+)/)?.[1])===n);if(!ref)throw new Error('Missing reference Q'+n);
 const [key,referenceAnswer]=answers[n],fields={...q};for(const k of ['_id','chapterId','source','solutionUrl','gateOverflowUrl','tempPaste','natRange','pdfStyle'])delete fields[k];
 const sectionId=n<=20?'one':n<=70?'two':n<=75?'common':'linked',sectionName={one:'One-mark questions',two:'Two-mark questions',common:'Common data questions',linked:'Linked answer pairs'}[sectionId];
 const answerSources=[{kind:'authored-reference',official:false,status:'independently-derived'},{kind:'gateoverflow',url:ref.url,official:false,status:reviewed.has(n)?(n===21?'question-and-error-bound-discussion-reviewed':'discussion-reviewed'):'question-mapping-from-local-cache; answer-not-individually-cross-checked'}];
 if(keys[n]){const[file,pdfPage,question,printed]=keys[n];answerSources.push({kind:'made-easy-key',file:'C:/Users/Prince/Desktop/MadeEasy PYQ PDF/All Subject Solutions Keys/'+file,pdfPage,question,printed,official:false,status:'visually-checked',...(printed!==key?{disagreement:true}:{})});}
 if(source?.source)answerSources.push({kind:'book-stored-provenance',...source.source,status:'retained-book-provenance; not-an-official-key'});
 const record={...fields,id:`${slug}-q${String(n).padStart(2,'0')}`,key:`yearpaper:${slug}:${n}`,datasetId:slug,year:'2008',examPaper:'CS',setNum:'',chapter:sectionName,assetSubject:'Year Papers',assetChapter:title,paperQuestionNumber:String(n),originalLabel:String(n),marks:String(n<=20?1:2),questionType:'MCQ',correctOptions:key?[key]:[],natAnswer:'',isBlank:false,isProof:false,isPosLocked:false,sectionId,sectionName,referenceAnswer,manualReview:manual.has(n),gateOverflowUrl:ref.url,answerSources,verificationStatus:manual.has(n)?'source-defect-or-convention-sensitive-manual-review':'independent-authored-review',pdfStyle:{fontSize:17,minFontSize:10,lineSpacing:1.12,...q.pdfStyle},source:{file:sourceFile,sha256:sourceSha256,pdfPages:pages(n),originalLabel:String(n),...(source?{copiedFrom:{chapterId:source.chapterId,questionId:source.id,year:source.year,subject:source.subject,chapter:source.chapter,bookLabel:source.source?.questionNumber||'',recordSha256:createHash('sha256').update(JSON.stringify(source)).digest('hex')}}:{}),issues:issues[n]?[issues[n]]:[]}};
 if(n>=76&&n%2===1){record.dependsOnKey=`yearpaper:${slug}:${n-1}`;record.negativeFraction=0;}
 if(n===1)record.exportInstruction='ONE-MARK QUESTIONS (1-20). GATE CS 2008: 85 objective questions, 150 marks, three hours. Attempt all; one option per question. Wrong one-mark answer: -0.25; unattempted: 0. Source instructions: PDF page 1.';
 if(n===21)record.exportInstruction='TWO-MARK QUESTIONS (21-70). Wrong answer: -0.5. Source defects and convention-sensitive items are explained and self-assessed after submission.';
 if(n===71)record.exportInstruction='COMMON DATA QUESTIONS (71-75). Two marks each; wrong answer -0.5. Full shared data repeated. No General Aptitude or optional questions.';
 if(n===76)record.exportInstruction='LINKED ANSWERS (76-85). Two marks each. Source page 1: the second answer is evaluated only after a correct first answer. No negative marks for Q77,79,81,83,85; wrong first answer -0.5.';
 if(source)corrections[n]=['text','code','optA','optB','optC','optD','marks','questionType','correctOptions'].filter(k=>JSON.stringify(source[k])!==JSON.stringify(record[k]));questions.push(record);
}
const reviewQuestions=questions.filter(q=>q.manualReview).map(q=>q.paperQuestionNumber),reviewMarks=questions.filter(q=>q.manualReview).reduce((s,q)=>s+Number(q.marks),0);
const paper=validateYearPaper({slug,datasetId:slug,title,year:'2008',examPaper:'CS',setNum:'',questionCount:85,totalMarks:150,availableMarks:150,durationMinutes:180,negativeFraction:.25,verified:true,sourceUrl:'https://gateoverflow.in/tag/gatecse-2008',sourceSha256,instructions:[
'Verified selected scan header: 2008, MAIN PAPER-CS, CS: Computer Science and Engineering. Single paper with no set/session designation; original filename 2008.pdf retained. All 18 supplied pages visually inspected, ending at END OF THE QUESTION PAPER on printed page 18/24. The header mentions 24 pages including rough work; the final six leaves are absent, with no missing numbered question.',
'Source page 1: all 85 questions are objective with one correct answer intended. Q1-20 carry one mark each and Q21-85 two marks each: 150 marks, 180 minutes. Attempt all. Navigation retains Q1-20, Q21-70, common data Q71-75 and five linked pairs Q76-85. No General Aptitude, written responses or optional limits belong to this paper.',
'Source page 1 documents wrong-answer deductions of 0.25 at Q1-20 and 0.5 at Q21-75 and Q76,78,80,82,84. Q77,79,81,83,85 have no negative marking. Unattempted questions score zero. Only one MCQ option is allowed.',
'Source page 1 explicitly makes the second question of each linked pair ineligible when its first question is wrong or unattempted. The server enforces that rule. A disputed first answer (Q76) leaves its second answer (Q77) pending until full-credit self-assessment; this is a transparent practice handling of a source ambiguity.',
'Every position has an authored worked reference, not an authenticated official answer key. Fifteen supplied Made Easy key entries were directly read; sources distinguish discussions read through the web tool from cache-only question mappings. No official key has been authenticated. Direct HTTP retrieval of all discussions was denied (403); provenance does not claim those were read.',
`Source-defective, disputed or convention-sensitive Q${reviewQuestions.join(', Q')} (${reviewMarks} marks) use post-submission self-assessment. Their conventional choices are references, not definite automatic outcomes. Source choices are preserved even where none is correct. Self-assessed marks are practice credit, not official adjudication.`,
'Independent IDs, keys, diagram files and original-record provenance isolate this paper from book-based subject and weighted mocks. Timer, autosave, review markers, refresh/resume and automatic submission use the existing historical-paper environment.'
],questions});
const prepared=await preparePaperAssets(paper,'public');await fs.writeFile(`data/papers/${slug}.json`,JSON.stringify(prepared.paper,null,2)+'\n');
const report={sourceFile,sourceSha256,sourcePages:18,questions:85,copied:questions.filter(q=>q.source.copiedFrom).length,added:questions.filter(q=>!q.source.copiedFrom).length,searchedBookQuestions:all.length,manualReview:reviewQuestions,manualMarks:reviewMarks,directKeyCount:Object.keys(keys).length,reviewedDiscussions:[...reviewed],corrections,coverage:questions.map(q=>({number:q.paperQuestionNumber,pages:q.source.pdfPages,copiedFrom:q.source.copiedFrom,issues:q.source.issues}))};
await fs.writeFile(dir+'/content-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,corrections:undefined,coverage:undefined},null,2));
