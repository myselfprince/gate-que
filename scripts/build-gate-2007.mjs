import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {bookMap,additions,restoreSource} from '../data/papers/gate-cs-2007-supplement.mjs';
import {answers} from '../data/papers/gate-cs-2007-answers.mjs';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
import {preparePaperAssets} from '../src/lib/year-paper-assets-server.mjs';
const dir='data/backups/gate-2007',slug='gate-cs-2007',title='GATE CS 2007';
const book=JSON.parse(await fs.readFile(dir+'/book-2007.json','utf8'));
const all=JSON.parse(await fs.readFile(dir+'/book-search.json','utf8'));
const refs=JSON.parse(await fs.readFile(dir+'/reference-2007.json','utf8')).filter(r=>r.title.startsWith('GATE CSE 2007 | Question:'));
const sourceFile='D:/Gate PYQs Year Wise - PDFs/2007.pdf',sourceSha256=createHash('sha256').update(await fs.readFile(sourceFile)).digest('hex');
if(sourceSha256!=='f3df0aaaf8a898ecd17380984636780d16d897a8d630463fdaab7f1d7187e463')throw new Error('Unexpected selected PDF');
const manual=new Set([4,15,40,44,51,54,61,62,67,69,80,81]);
const reviewed=new Set([15,21,25,28,31,32,33,40,44,54,58,62,67,69,79]);
const keys={15:['Algorithms.pdf',3,'1.24','D'],45:['Algorithms.pdf',3,'1.25','D'],50:['Algorithms.pdf',3,'1.26','B'],51:['Algorithms.pdf',3,'1.27','B'],41:['Algorithms.pdf',7,'3.26','D'],49:['Algorithms.pdf',7,'3.27','D'],47:['Algorithms.pdf',7,'3.30','B'],3:['Digital Logic.pdf',1,'1.31','C'],9:['Digital Logic.pdf',1,'1.32','B'],32:['Digital Logic.pdf',1,'1.36','D'],33:['Digital Logic.pdf',1,'1.37','D'],8:['Digital Logic.pdf',2,'2.20','C'],34:['Digital Logic.pdf',2,'2.21','C'],35:['Digital Logic.pdf',2,'2.18','B'],36:['Digital Logic.pdf',3,'3.19','C'],37:['COA.pdf',3,'3.16','B'],71:['COA.pdf',1,'1.19','D'],72:['COA.pdf',1,'1.20','A'],73:['COA.pdf',1,'1.21','C']};
const issues={
4:'Minimum-edge obstruction convention assumes no isolated extra vertices; literal nonplanarity permits them. Conventional B is self-assessed.',
5:'Book reverses source options B and C. Source order restored; diagram cropped independently from selected scan.',
10:'Source field name LINE is retained; this is the set index in a four-way cache.',
12:'Source option A is 2^h-1; book omitted the minus one. Source distractor restored.',
15:'Literal test count includes the exit test and is floor(log2(n))+2; source D counts successful tests/body iterations. Manual review; book key unchanged.',
16:'Source Group 1 P,Q,R and Group 2 labels restored instead of book List I A,B,C.',
20:'Book ends the question with a stray 1. Removed only from the paper copy.',
26:'Four source Hasse-diagram options separately cropped; all letter positions preserved.',
27:'Source prints x^T=[x1,x2,x3]^T, a redundant/inconsistent transpose notation. Literal notation retained; coordinate condition determines the intended subspace.',
31:'Source uses positive closure (+) in all four choices; book incorrectly uses Kleene star. Source restored.',
32:'Book replaces source combination choices with the P,Q,R,S expressions. Restored all four statements and original A-D choices.',
33:"Source connective is XY+X'Y', unlike the defective stored XY+XY'. Corrected only in independent copy.",
36:'Asynchronous-clear connection and unused 0011 inputs preserved in independent source crop.',
40:'Closed hashing does not explicitly identify its probing strategy; conventional B uses linear probing. Manual review.',
42:'Extra book include/main wrapper removed; exact selected source function retained as editable code.',
44:'No worst-case or m>0 qualifier is printed. Conventional logarithmic worst-case answer retained for self-assessment.',
46:'Book changes leftChild/rightChild declaration case and value assignment case. Exact selected scan capitalization restored in the independent copy.',
49:'Source option B explicitly adds e to T; omitted edge in book restored.',
51:'Source retains old-style function and redeclares n; as printed it is not valid modern C. Intended pseudocode bound B is separate, self-assessed.',
54:'Conventional direct basic-block translation needs three MOVs; algebraic reassociation of final value needs two. Optimization scope is unstated; manual review.',
61:'Source asks about arbitrary employee tables without a NOT NULL constraint. Conventional A assumes non-NULL salaries; manual review.',
62:'Conventional key D assumes nonempty functional-dependency determinants; empty determinants give a counterexample to A. Manual review.',
66:'Book swaps options C and D. Source C=20 metres and D=50 metres restored; key refers to final source option order.',
67:'C uses the historical exclusion of all-zero/all-one subnet numbers. If all subnet IDs are permitted, no offered option has 64 subnets and 1022 hosts. Manual review.',
69:'Sliding-window protocol/reliability assumptions are unspecified. Conventional C counts window labels, while go-back-N needs an extra sequence label. Manual review.',
71:'Common source table is retained on all three independent pages; HALT size one restored.',
74:'Source automaton includes unreachable q3 and accepting q1,q2; own crop repeated for Q75.',
76:'Selected source has six symbols a-f and probabilities totaling one. Book five-symbol variant omitted f; all four six-codeword choices restored.',
77:'Selected six-symbol source average 1.9375 at D differs from book five-symbol 1.781. Source restored.',
78:'Production columns restored to selected scan order: S->aB / S->bA, then B rules / A rules. Book prints reversed columns.',
79:'Full shared grammar in source production order and Q78 choices retained; source linked identifier restored.',
80:'Array traversal order is not explicitly stated. Conventional 56 misses assumes two identical sequential byte-address traversals. Manual review.',
81:'Source explicitly asks about the second traversal, unlike book wording; linked to manual Q80 and inherits its order assumption.'
};
function pages(n){for(const [end,p] of [[6,2],[14,3],[20,4],[25,5],[29,6],[34,7],[36,8],[40,9],[45,10],[48,11],[52,12],[55,13],[58,14],[62,15],[68,16],[70,17],[73,18],[77,19],[83,20],[85,21]])if(n<=end)return[p];}
const assetDir=path.join('public','Year Papers',title);await fs.mkdir(assetDir,{recursive:true});await fs.copyFile(sourceFile,path.join(assetDir,'2007.pdf'));
const questions=[],corrections={};
for(let n=1;n<=85;n++){
 const source=bookMap[n]===undefined?null:book[bookMap[n]];
 const q=restoreSource(structuredClone(source||additions[n]),n,book);if(!q)throw new Error('Missing Q'+n);
 // Every referenced image is freshly cropped from the selected paper, in this paper's own directory.
 const ref=refs.find(r=>Number(r.title.match(/Question:\s*(\d+)/)?.[1])===n);if(!ref)throw new Error('Missing reference Q'+n);
 const [key,referenceAnswer]=answers[n],fields={...q};for(const k of ['_id','chapterId','source','solutionUrl','gateOverflowUrl','tempPaste','natRange','pdfStyle'])delete fields[k];
 const sectionId=n<=20?'one':n<=70?'two':n<=75?'common':'linked',sectionName={one:'One-mark questions',two:'Two-mark questions',common:'Common data questions',linked:'Linked answer pairs'}[sectionId];
 const answerSources=[{kind:'authored-reference',official:false,status:'independently-derived'},{kind:'gateoverflow',url:ref.url,official:false,status:reviewed.has(n)?(n===28?'question-and-comment-reviewed; no-posted-worked-answer':'discussion-reviewed'):'question-mapping-from-local-cache; answer-not-individually-cross-checked'}];
 if(keys[n]){const[file,pdfPage,question,printed]=keys[n];answerSources.push({kind:'made-easy-key',file:'C:/Users/Prince/Desktop/MadeEasy PYQ PDF/All Subject Solutions Keys/'+file,pdfPage,question,printed,official:false,status:'visually-checked'});}
 if(source?.source)answerSources.push({kind:'book-stored-provenance',...source.source,status:'retained-book-provenance; not-an-official-key'});
 const record={...fields,id:`${slug}-q${String(n).padStart(2,'0')}`,key:`yearpaper:${slug}:${n}`,datasetId:slug,year:'2007',examPaper:'CS',setNum:'',chapter:sectionName,assetSubject:'Year Papers',assetChapter:title,paperQuestionNumber:String(n),originalLabel:String(n),marks:String(n<=20?1:2),questionType:'MCQ',correctOptions:[key],natAnswer:'',isBlank:false,isProof:false,isPosLocked:false,sectionId,sectionName,referenceAnswer,manualReview:manual.has(n),gateOverflowUrl:ref.url,answerSources,verificationStatus:manual.has(n)?'source-defect-or-convention-sensitive-manual-review':'independent-authored-review',pdfStyle:{fontSize:17,minFontSize:10,lineSpacing:1.12},source:{file:sourceFile,sha256:sourceSha256,pdfPages:pages(n),originalLabel:String(n),...(source?{copiedFrom:{chapterId:source.chapterId,questionId:source.id,year:source.year,subject:source.subject,chapter:source.chapter,bookLabel:source.source?.questionNumber||'',recordSha256:createHash('sha256').update(JSON.stringify(source)).digest('hex')}}:{}),issues:issues[n]?[issues[n]]:[]}};
 if(n===20)record.text=record.text.replace(/\?1$/,'?');
 if(n===69)for(const k of ['A','B','C','D'])record['opt'+k]=record['opt'+k].replace('\\left[','\\left\\lceil').replace('\\right]','\\right\\rceil');
 if(n>=76&&n%2===1){record.dependsOnKey=`yearpaper:${slug}:${n-1}`;record.negativeFraction=0;}
 if(n===1)record.exportInstruction='ONE-MARK QUESTIONS (1-20). GATE CS 2007: 85 objective questions, 150 marks, three hours. Attempt all questions. Each has one correct option. Wrong one-mark answer: -0.25. Unattempted: 0. Source instructions: PDF page 1.';
 if(n===21)record.exportInstruction='TWO-MARK QUESTIONS (21-70). Wrong answer: -0.5. Preserve one answer per question. Defective/convention-sensitive positions are explained and self-assessed after submission.';
 if(n===71)record.exportInstruction='COMMON DATA QUESTIONS (71-75). Two marks per question; wrong answer -0.5. Shared passages are repeated in full. No General Aptitude or optional questions occur in this paper.';
 if(n===76)record.exportInstruction='LINKED ANSWERS (76-85). Two marks each. Source page 1 exempts Q77,79,81,83,85 from negative marks. Practice dependency policy: a second answer earns credit only after a correct first answer; the scan labels linked pairs but does not explicitly document this dependency grading rule.';
 if(source)corrections[n]=['text','code','optA','optB','optC','optD','marks','questionType','correctOptions'].filter(k=>JSON.stringify(source[k])!==JSON.stringify(record[k]));questions.push(record);
}
const reviewQuestions=questions.filter(q=>q.manualReview).map(q=>q.paperQuestionNumber),reviewMarks=questions.filter(q=>q.manualReview).reduce((s,q)=>s+Number(q.marks),0);
const paper=validateYearPaper({slug,datasetId:slug,title,year:'2007',examPaper:'CS',setNum:'',questionCount:85,totalMarks:150,availableMarks:150,durationMinutes:180,negativeFraction:.25,verified:true,sourceUrl:'https://gateoverflow.in/tag/gatecse-2007',sourceSha256,instructions:[
'Verified selected scan header: 2007, CS: Computer Science and Engineering. Single paper, no set/session designation. Original filename 2007.pdf retained. All 21 supplied pages inspected; the end marker is on page 21. The header refers to 24 printed pages including rough-work leaves; the supplied file omits the final three rough-work leaves, with no question missing.',
'Source page 1: 85 objective questions, Q1-20 one mark each and Q21-85 two marks each, 150 marks, duration three hours. Attempt all. One correct answer per question. Four navigation blocks retain original order: Q1-20, Q21-70, common data Q71-75, five linked pairs Q76-85. No General Aptitude, written responses or optional questions.',
'Documented negative marking (source page 1): 0.25 for a wrong Q1-20; 0.5 for a wrong Q21-76,78,80,82,84; no negative marks at Q77,79,81,83,85; zero for unattempted. The digital MCQ interface permits only one selection.',
'Practice linked-credit policy: second answers (77,79,81,83,85) earn credit only if the first answer of that pair is correct. The scan calls these linked answers but does not explicitly state conditional-credit grading; this dependency is disclosed as a practice policy, not an authenticated official rule. Pending self-assessment of Q80 leaves Q81 credit pending.',
'Every position has an authored worked reference, not an official answer key. Provenance distinguishes directly read Made Easy key entries, reviewed GATE Overflow discussions, retained book provenance and cache-only mappings. No authenticated official answer key was supplied.',
`Literal source defects or convention-sensitive items Q${reviewQuestions.join(', Q')} (${reviewMarks} marks) require clearly labeled post-submission self-assessment. Conventional choices are references, not definite automatic outcomes.`,
'Independent question IDs, keys, diagram files and original-record provenance isolate this dataset from the book. Timer, saved responses, review markers, refresh/resume and automatic submission use the existing test environment.'
],questions});
const prepared=await preparePaperAssets(paper,'public');await fs.writeFile(`data/papers/${slug}.json`,JSON.stringify(prepared.paper,null,2)+'\n');
const report={sourceFile,sourceSha256,questions:85,copied:questions.filter(q=>q.source.copiedFrom).length,added:questions.filter(q=>!q.source.copiedFrom).length,searchedBookQuestions:all.length,manualReview:reviewQuestions,manualMarks:reviewMarks,directKeyCount:Object.keys(keys).length,reviewedDiscussions:[...reviewed],corrections,coverage:questions.map(q=>({number:q.paperQuestionNumber,pages:q.source.pdfPages,copiedFrom:q.source.copiedFrom,issues:q.source.issues}))};
await fs.writeFile(dir+'/content-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,corrections:undefined,coverage:undefined},null,2));
