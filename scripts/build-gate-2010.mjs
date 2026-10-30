import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {bookMap,additions,restoreSource} from '../data/papers/gate-cs-2010-supplement.mjs';
import {answers} from '../data/papers/gate-cs-2010-answers.mjs';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
import {preparePaperAssets} from '../src/lib/year-paper-assets-server.mjs';
const dir='data/backups/gate-2010',slug='gate-cs-2010',title='GATE CS 2010';
const book=JSON.parse(await fs.readFile(dir+'/book-2010.json','utf8'));
const all=JSON.parse(await fs.readFile(dir+'/book-search.json','utf8'));
const refs=JSON.parse(await fs.readFile(dir+'/reference-2010.json','utf8'));
const sourceFile='D:/Gate PYQs Year Wise - PDFs/2010.pdf',sourceSha256=createHash('sha256').update(await fs.readFile(sourceFile)).digest('hex');
if(sourceSha256!=='c9ae2341cdf2a91b997fa0092bae579cc185c4d84b54af64cee5c01d28958801')throw new Error('Unexpected selected PDF');
const manual=new Set([34,48,49,63]);
const reviewed=new Set([32,33,34,48,49,62,63]);
const keys={12:['Algorithms.pdf',3,'1.36','C'],34:['Algorithms.pdf',7,'3.38','D'],50:['Algorithms.pdf',7,'3.39','D'],51:['Algorithms.pdf',7,'3.40','B'],6:['Digital Logic.pdf',1,'1.45','A'],31:['Digital Logic.pdf',1,'1.47','A'],9:['Digital Logic.pdf',2,'2.23','B'],32:['Digital Logic.pdf',3,'3.22','A'],37:['COA.pdf',1,'1.25','B'],33:['COA.pdf',3,'3.22','B']};
const issues={
6:'The book option C repeats m1. The selected source option C is m0+m2+m6+m7; restored only in the paper copy.',
11:'Source printf includes a space between the two integers; restored in editable code.',
17:'Book options C and D use L2 union L1 and L2 intersection L1. Source C and D are L2 intersection L3 and L2 union L3; original source order restored.',
19:'Both source tables and the full correlated SQL query transcribed as editable math and code.',
21:'Historical software-engineering question retained; own diagram crop from source page 5.',
22:'Historical software-engineering matching table retained as editable text/math.',
28:'Source separates four sequences on four lines; original labels and values restored.',
34:'Made Easy Greedy Method item 3.38 prints D; the independent include/exclude derivation and GATE Overflow support B. Conflicting source key documented; manual assessment.',
36:'Corrupted book NULL test, punctuation and capital P repaired against source scan in this copy only. Options restored as literal editable code.',
40:'Source option C says Only L1 and L2; book says L1 and L3. Source distractor restored.',
48:'Repeated an L2 cache in book is absent from selected source. Own bus diagram retained. Timing assumes read plus write with no overlap; source does not explicitly resolve timing convention. Manual assessment.',
49:'902 ns follows four 220-ns transfers and one 22-ns transfer; 968 ns appears in alternate conventions. Source access-time interpretation is disputed; manual assessment.',
50:'Original common-data labels 50 and 51 restored, keeping the entire matrix on each question page.',
51:'Original common-data labels 50 and 51 restored, keeping the entire matrix on each question page.',
52:'Original linked labels 52 and 53 restored; entire hash table repeated.',
53:'Original linked labels 52 and 53 restored; entire hash table repeated; official source page 1 explicitly conditions credit on Q52.',
54:'Original linked labels and own selected-scan router diagram replace book passage labels.',
55:'Shared passage repeated; the prior-question prompt is not duplicated. Official source page 1 explicitly conditions credit on Q54.',
63:'GATE Overflow accepted answer D is contested in its discussion, particularly against C because of regretfully. Literal reading item retained with manual assessment.'
};
function pages(n){for(const [end,p] of [[8,2],[14,3],[19,4],[24,5],[30,6],[32,7],[35,8],[39,9],[43,10],[47,11],[51,12],[53,13],[55,14],[61,15],[65,16]])if(n<=end)return[p];}
const assetDir=path.join('public','Year Papers',title);await fs.mkdir(assetDir,{recursive:true});await fs.copyFile(sourceFile,path.join(assetDir,'2010.pdf'));
const questions=[],corrections={};
for(let n=1;n<=65;n++){
 const source=bookMap[n]===undefined?null:book[bookMap[n]];
 const q=restoreSource(structuredClone(source||additions[n]),n);if(!q)throw new Error('Missing Q'+n);
 const ref=refs.find(r=>Number(r.title.match(/Question:\s*(\d+)/)?.[1])===n);if(!ref)throw new Error('Missing reference Q'+n);
 const [key,referenceAnswer]=answers[n],fields={...q};for(const k of ['_id','chapterId','source','solutionUrl','gateOverflowUrl','tempPaste','natRange','pdfStyle','correctOptions','natAnswer'])delete fields[k];
 const sectionId=n<=25?'one':n<=47?'two':n<=51?'common':n<=55?'linked':'aptitude';
 const sectionName={one:'One-mark questions',two:'Two-mark questions',common:'Common data questions',linked:'Linked answer pairs',aptitude:'General Aptitude'}[sectionId];
 const answerSources=[{kind:'authored-reference',official:false,status:'independently-derived'},{kind:'gateoverflow',url:ref.url,official:false,status:reviewed.has(n)?'discussion-reviewed':'local-cache-mapping; direct-download-403; not-individually-cross-checked'}];
 if(keys[n]){const[file,pdfPage,question,printed]=keys[n];answerSources.push({kind:'made-easy-key',file:'C:/Users/Prince/Desktop/MadeEasy PYQ PDF/All Subject Solutions Keys/'+file,pdfPage,question,printed,official:false,status:'visually-checked'});}
 if(source?.source)answerSources.push({kind:'book-stored-provenance',...source.source,status:'retained-book-provenance; not-an-official-key'});
 const record={...fields,id:`${slug}-q${String(n).padStart(2,'0')}`,key:`yearpaper:${slug}:${n}`,datasetId:slug,year:'2010',examPaper:'CS',setNum:'',chapter:sectionName,assetSubject:'Year Papers',assetChapter:title,paperQuestionNumber:String(n),originalLabel:String(n),marks:String(n<=25||(n>=56&&n<=60)?1:2),questionType:'MCQ',correctOptions:[key],natAnswer:'',isBlank:false,isProof:false,isPosLocked:false,sectionId,sectionName,referenceAnswer,manualReview:manual.has(n),gateOverflowUrl:ref.url,answerSources,verificationStatus:manual.has(n)?'disputed-key-or-interpretation; post-submission-self-assessment':'independent-authored-review',pdfStyle:{fontSize:17,minFontSize:10,lineSpacing:1.12},source:{file:sourceFile,sha256:sourceSha256,pdfPages:pages(n),originalLabel:String(n),...(source?{copiedFrom:{chapterId:source.chapterId,questionId:source.id,year:source.year,subject:source.subject,chapter:source.chapter,bookLabel:source.source?.questionNumber||'',recordSha256:createHash('sha256').update(JSON.stringify(source)).digest('hex')}}:{}),issues:issues[n]?[issues[n]]:[]}};
 if(n===53||n===55){record.dependsOnKey=`yearpaper:${slug}:${n-1}`;record.negativeFraction=0;}
 if(n===1)record.exportInstruction='ONE-MARK QUESTIONS (1-25). GATE CS 2010: 65 MCQs, 100 marks, 180 minutes. Wrong one-mark answer: -1/3; blank: 0. Attempt all. All original instructions are summarized in the test start dialog; source PDF page 1.';
 if(n===26)record.exportInstruction='TWO-MARK QUESTIONS (26-47). Wrong answer: -2/3. Question order, option order and historical syllabus are preserved. Disputed positions are self-assessed after submission.';
 if(n===48)record.exportInstruction='COMMON DATA (48-51). Two marks each; wrong answer -2/3. Both original common passages are repeated completely on their respective question pages.';
 if(n===52)record.exportInstruction='LINKED ANSWERS (52-55). Two marks each. Q53 and Q55 are evaluated only if Q52 and Q54 respectively are correct. No negative marks on Q53 or Q55; wrong Q52 or Q54: -2/3. These are explicit source page 1 rules.';
 if(n===56)record.exportInstruction='GENERAL APTITUDE (56-65): ten questions, 15 marks, in the original final position. Q56-60: one mark each, wrong -1/3. Q61-65: two marks each, wrong -2/3. No optional sections or written questions.';
 if(source)corrections[n]=['text','code','optA','optB','optC','optD','marks','questionType','correctOptions'].filter(k=>JSON.stringify(source[k])!==JSON.stringify(record[k]));questions.push(record);
}
const paper=validateYearPaper({slug,datasetId:slug,title,year:'2010',examPaper:'CS',setNum:'',questionCount:65,totalMarks:100,availableMarks:100,durationMinutes:180,negativeFraction:1/3,verified:true,sourceUrl:'https://gateoverflow.in/tag/gatecse-2010',sourceSha256,instructions:[
'Verified source header: 2010, CS: Computer Science and Information Technology. Single paper; no set/session designation. The exact selected 24-page scan and physical filename 2010.pdf are preserved. The end marker is on page 16; pages 17-24 are rough-work leaves.',
'Source page 1 specifies 65 objective questions, 100 marks and three hours. Q1-25 are one mark; Q26-55 two marks; General Aptitude Q56-60 one mark and Q61-65 two marks. Ten aptitude questions carry 15 marks. Attempt all; no section choices or descriptive questions.',
'Original order is retained in five navigation blocks: one-mark Q1-25, two-mark Q26-47, common-data Q48-51 (two pairs), linked answers Q52-55 (two pairs), General Aptitude Q56-65. Each MCQ permits one selected option.',
'Documented negative marking, source page 1: wrong Q1-25 and Q56-60 lose 1/3 mark; wrong Q26-52, Q54 and Q61-65 lose 2/3 mark. Q53 and Q55 have no penalty. Unattempted questions earn zero.',
'Documented linked-credit rule, source page 1: Q53 is evaluated only if Q52 is correctly answered; Q55 only if Q54 is correctly answered. A wrong or blank first answer makes the second ineligible for credit. The server enforces both the prerequisite and zero second-question penalty.',
'Every question has an independently authored worked reference, not an authenticated official key. Provenance distinguishes visually checked Made Easy key entries, individually reviewed GATE Overflow discussions and cache-only question links. Direct automated discussion downloads returned HTTP 403; accessible web discussions were used for targeted checks.',
'Disputed Q34, Q48, Q49 and Q63 (8 marks) are retained literally and require labeled post-submission self-assessment. Q34 has a conflicting printed Made Easy key; Q48-49 depend on cache timing assumptions; Q63 has competing reading interpretations. Conventional reference choices are not definite automatic grades.',
'Independent question IDs, keys, diagram assets and original-record provenance isolate this paper from book records and book-based mocks. Timer, calculator, palette, autosave, refresh/resume and automatic submission use the existing test environment.'
],questions});
const prepared=await preparePaperAssets(paper,'public');await fs.writeFile(`data/papers/${slug}.json`,JSON.stringify(prepared.paper,null,2)+'\n');
const report={sourceFile,sourceSha256,questions:65,copied:questions.filter(q=>q.source.copiedFrom).length,added:questions.filter(q=>!q.source.copiedFrom).length,searchedBookQuestions:all.length,excludedTaggedRecords:book.filter((q,i)=>!Object.values(bookMap).includes(i)).map(q=>({id:q.id,text:q.text,reason:'Not present in the exact selected paper'})),manualReview:[...manual],manualMarks:8,directKeyCount:Object.keys(keys).length,reviewedDiscussions:[...reviewed],corrections,coverage:questions.map(q=>({number:q.paperQuestionNumber,pages:q.source.pdfPages,copiedFrom:q.source.copiedFrom,issues:q.source.issues}))};
await fs.writeFile(dir+'/content-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,corrections:undefined,coverage:undefined},null,2));
