import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {bookMap,otherBookMap,additions,restoreSource} from '../data/papers/gate-cs-2011-supplement.mjs';
import {answers} from '../data/papers/gate-cs-2011-answers.mjs';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
import {preparePaperAssets} from '../src/lib/year-paper-assets-server.mjs';
const dir='data/backups/gate-2011',slug='gate-cs-2011',title='GATE CS 2011';
const book=JSON.parse(await fs.readFile(dir+'/book-2011.json','utf8')),all=JSON.parse(await fs.readFile(dir+'/book-search.json','utf8'));
const refs=JSON.parse(await fs.readFile(dir+'/reference-2011.json','utf8'));
const mirror=JSON.parse(await fs.readFile(dir+'/historical-key-mirror.json','utf8'));
const mirrorKeys=JSON.parse(await fs.readFile(dir+'/historical-key-mirror-key.json','utf8'));
const sourceFile='D:/Gate PYQs Year Wise - PDFs/2011.pdf',sourceSha256=createHash('sha256').update(await fs.readFile(sourceFile)).digest('hex');
if(sourceSha256!=='d84d37b374ed77906a34c410f7fba96af7127808b7697466a0183aa4f82b3acc')throw new Error('Unexpected selected PDF');
const manual=new Set([2,22,59,60,62]),reviewed=new Set([2,42,59,60,62]);
const keys={13:['Digital Logic.pdf',1,'1.48','D'],14:['Digital Logic.pdf',1,'1.46','B'],15:['Digital Logic.pdf',3,'3.23','A'],50:['Digital Logic.pdf',3,'3.24','D'],51:['Digital Logic.pdf',3,'3.25','B'],21:['COA.pdf',1,'1.26','D'],36:['COA.pdf',1,'1.27','D'],41:['COA.pdf',3,'3.23','B'],28:['COA.pdf',5,'5.25','A'],44:['COA.pdf',5,'5.24','B'],29:['Algorithms.pdf',5,'2.27','B'],38:['Algorithms.pdf',5,'2.26','C'],23:['Algorithms.pdf',7,'3.41','B'],54:['Algorithms.pdf',7,'3.42','B'],55:['Algorithms.pdf',7,'3.43','C']};
const issues={
2:'Stored book key is A; historical booklet-A key mirror and reviewed discussion support D. Conventional HTTP port assumption is unstated. Preserve original options; post-submission self-assessment.',
3:'Book says two marks. Selected paper Q3 carries one mark; repaired only in the independent copy.',
4:'Book omits the final question sentence. Restored from source page 2.',
14:'Book year is 2010. Full content matches source 2011 Q14. Source option A has barred P and barred R; restored distractor only in copy.',
17:'Book year is 2010; full graph and options identify source 2011 Q17. Printed source option C says K3, rather than the book K4; literal typo preserved. Both specified graphs are planar.',
18:'Book year is 2010; expectation/variance content matches source 2011 Q18. Copied with corrected identity and one mark only in this dataset.',
22:'Source D is 011; book D is 11. Literal source begins capitalized Char, an undefined type without a supplied typedef. Source defect preserved in editable code; intended lowercase-char result C is a reference only, with self-assessment.',
25:'Selected source final Max ends Ln-1; book ends Ln+1. Source bound restored. Recurrence describes a contiguous run and omits traversal order; reference discloses this defect.',
28:'Book has truncated final clause and speedup prompt, and court typo. Complete device-to-memory clause, speedup question and count spelling restored from selected source page 8.',
39:'Historical textbook indexing comparison retained. Real implementation costs may vary; intended equality versus range distinction is explained.',
47:'Full original C comment and all six test rows retained in editable code/math, including historical software-testing material.',
51:'Four distinct states includes initial reset 000; recurring cycle has only three. Reference explicitly distinguishes these counts.',
52:'Book common passage labels Q4.22/Q4.23 and B5 restored to selected source labels Q52/Q53 and N5.',
53:'Full linked passage retained without duplicating prior prompt. Source page 1 conditions credit on Q52 and specifies no penalty here.',
54:'Historical graph weights and original linked labels restored; own selected-scan sample graph.',
55:'Source page 1 conditions credit on Q54 and specifies no penalty here.',
59:'Conventional B is challenged against D in the discussion. Literal item retained with post-submission self-assessment.',
60:'Conventional D (separate) competes with B (split), also an antonym. Source retained with post-submission self-assessment.',
62:'Conventional D uses inverse plotted dose from the vertical-axis definition. Literal direct-proportional reading selects A. Graph, axis labels and ambiguity retained; self-assessment.'
};
function pages(n){for(const [end,p] of [[6,2],[11,3],[16,4],[22,5],[25,6],[27,7],[31,8],[35,9],[39,10],[44,11],[46,12],[47,13],[51,14],[55,15],[61,16],[65,17]])if(n<=end)return[p];}
const assetDir=path.join('public','Year Papers',title);await fs.mkdir(assetDir,{recursive:true});await fs.copyFile(sourceFile,path.join(assetDir,'2011.pdf'));
const questions=[],corrections={};
for(let n=1;n<=65;n++){
 const source=otherBookMap[n]?all.find(q=>q.id===otherBookMap[n]):bookMap[n]===undefined?null:book[bookMap[n]];
 const q=restoreSource(structuredClone(source||additions[n]),n);if(!q)throw new Error('Missing Q'+n);
 const ref=refs.find(r=>Number(r.title.match(/Question:\s*(\d+)/)?.[1])===n);if(!ref)throw new Error('Missing reference Q'+n);
 const [key,referenceAnswer]=answers[n];if(key!==mirrorKeys[n])throw new Error('Historical key mismatch Q'+n);
 const fields={...q};for(const k of ['_id','chapterId','source','solutionUrl','gateOverflowUrl','tempPaste','natRange','pdfStyle','correctOptions','natAnswer'])delete fields[k];
 const sectionId=n<=25?'one':n<=47?'two':n<=51?'common':n<=55?'linked':'aptitude';
 const sectionName={one:'One-mark questions',two:'Two-mark questions',common:'Common data questions',linked:'Linked answer pairs',aptitude:'General Aptitude'}[sectionId];
 const answerSources=[{kind:'authored-reference',official:false,status:'independently-derived'},
 {kind:'historical-key-mirror',...mirror,pdfPage:n<=40?1:2,bookletCode:'A',question:String(n),printed:key,status:'downloaded-and-visually-checked; original-issuing-host-not-authenticated'},
 {kind:'gateoverflow',url:ref.url,official:false,status:reviewed.has(n)?'discussion-reviewed':'local-cache-mapping; direct-download-403; not-individually-cross-checked'}];
 if(keys[n]){const[file,pdfPage,question,printed]=keys[n];answerSources.push({kind:'made-easy-key',file:'C:/Users/Prince/Desktop/MadeEasy PYQ PDF/All Subject Solutions Keys/'+file,pdfPage,question,printed,official:false,status:'visually-checked'});}
 if(source?.source)answerSources.push({kind:'book-stored-provenance',...source.source,status:'retained-book-provenance; not-a-new-direct-key-check'});
 const record={...fields,id:`${slug}-q${String(n).padStart(2,'0')}`,key:`yearpaper:${slug}:${n}`,datasetId:slug,year:'2011',examPaper:'CS',setNum:'',chapter:sectionName,assetSubject:'Year Papers',assetChapter:title,paperQuestionNumber:String(n),originalLabel:String(n),marks:String(n<=25||(n>=56&&n<=60)?1:2),questionType:'MCQ',correctOptions:[key],natAnswer:'',isBlank:false,isProof:false,isPosLocked:false,sectionId,sectionName,referenceAnswer,manualReview:manual.has(n),gateOverflowUrl:ref.url,answerSources,verificationStatus:manual.has(n)?'disputed-key-or-interpretation; post-submission-self-assessment':'authored-derivation-and-historical-mirror-key-comparison',pdfStyle:{fontSize:17,minFontSize:10,lineSpacing:1.12},source:{file:sourceFile,sha256:sourceSha256,pdfPages:pages(n),bookletCode:'A',originalLabel:String(n),...(source?{copiedFrom:{chapterId:source.chapterId,questionId:source.id,year:source.year,subject:source.subject,chapter:source.chapter,bookLabel:source.source?.questionNumber||'',recordSha256:createHash('sha256').update(JSON.stringify(source)).digest('hex')}}:{}),issues:issues[n]?[issues[n]]:[]}};
 if(n===45){record.optLayout='2col';record.pdfStyle.imageScale=.6;}
 if(n===53||n===55){record.dependsOnKey=`yearpaper:${slug}:${n-1}`;record.negativeFraction=0;}
 if(n===1)record.exportInstruction='ONE-MARK QUESTIONS (1-25). GATE CS 2011, booklet A: 65 MCQs, 100 marks, 180 minutes. Wrong one-mark answer: -1/3; blank: 0. Attempt all. Original instructions: source page 1.';
 if(n===26)record.exportInstruction='TWO-MARK QUESTIONS (26-47). Two marks each; wrong answer -2/3. Original order, option order and historical syllabus are preserved.';
 if(n===48)record.exportInstruction='COMMON DATA (48-51). Two marks each; wrong answer -2/3. Complete shared passages are repeated on both relevant pages.';
 if(n===52)record.exportInstruction='LINKED ANSWERS (52-55). Two marks each. Q53/Q55 earn credit only if Q52/Q54 respectively are correct. No negative marks on Q53/Q55; wrong Q52/Q54: -2/3. Source page 1 explicitly documents these rules.';
 if(n===56)record.exportInstruction='GENERAL APTITUDE (56-65): ten questions, 15 marks. Q56-60: one mark, wrong -1/3; Q61-65: two marks, wrong -2/3. Disputed Q59/Q60/Q62 are self-assessed after submission. No optional sections or written questions.';
 if(source)corrections[n]=['text','code','optA','optB','optC','optD','year','marks','questionType','correctOptions','diagram'].filter(k=>JSON.stringify(source[k])!==JSON.stringify(record[k]));questions.push(record);
}
const paper=validateYearPaper({slug,datasetId:slug,title,year:'2011',examPaper:'CS',setNum:'',questionCount:65,totalMarks:100,availableMarks:100,durationMinutes:180,negativeFraction:1/3,verified:true,sourceUrl:'https://gateoverflow.in/exam/42/gate-2011',sourceSha256,instructions:[
'Verified source header: 2011, CS: Computer Science and Information Technology, Question Booklet Code A. This is a booklet permutation identifier, not a separate session; set/session remains blank. The selected physical filename 2011.pdf is preserved.',
'The selected scan has 17 pages, ending with Q65 and END OF THE QUESTION PAPER. Its cover says 20 pages including rough-work leaves; the final three rough-work leaves are absent, but all 65 questions are present. Only this selected year-wise PDF was imported.',
'Source page 1 specifies 65 objective questions, 100 marks and three hours. Q1-25 carry one mark; Q26-55 two marks; General Aptitude Q56-60 one mark and Q61-65 two marks. Ten aptitude questions carry 15 marks at the end. Attempt all; no section choices, NAT, MSQ or descriptive questions.',
'Original navigation order: one-mark technical Q1-25, two-mark technical Q26-47, common-data Q48-51, linked pairs Q52-55, General Aptitude Q56-65. One selected option per MCQ.',
'Documented penalties: wrong Q1-25 and Q56-60 lose 1/3 mark; wrong Q26-52, Q54 and Q61-65 lose 2/3 mark. Q53 and Q55 have no negative marking. Blanks earn zero.',
'Documented linked-credit rule: Q53 is evaluated only if Q52 is correct; Q55 only if Q54 is correct. Wrong or blank prerequisites make the second answer ineligible. The server enforces both prerequisites and zero second-answer penalties.',
'Every position has an authored worked reference and comparison with the historical booklet-A key mirrored at gatecse.in. The mirror was downloaded and visually checked, but its original issuing host was not authenticated; no official-key authentication is claimed. Fifteen Made Easy entries and five discussion pages were directly reviewed; all other discussion links are identified as cache-only mappings.',
'Q2, Q22, Q59, Q60 and Q62 (six marks) have conflicting keys, a source code defect or competing interpretations and use labeled post-submission self-assessment. Their conventional references are not definite automatic grades. Automatic maximum is 94 marks; self-assessed marks remain separate and bounded.',
'Copies have independent IDs, keys and diagram files, with book-record provenance. The original book collection and earlier papers are preserved. Timer, calculator, palette, autosave, refresh/resume and automatic submission use the existing test environment.'
],questions});
const prepared=await preparePaperAssets(paper,'public');await fs.writeFile(`data/papers/${slug}.json`,JSON.stringify(prepared.paper,null,2)+'\n');
const selectedIds=new Set(questions.map(q=>q.source.copiedFrom?.questionId));
const report={sourceFile,sourceSha256,bookletCode:'A',setNum:'',sourcePages:17,questions:65,copied:questions.filter(q=>q.source.copiedFrom).length,added:questions.filter(q=>!q.source.copiedFrom).length,searchedBookQuestions:all.length,excludedTaggedRecords:book.filter(q=>!selectedIds.has(q.id)).map(q=>({id:q.id,text:q.text,reason:'Not in the selected CS booklet-A source'})),manualReview:[...manual],manualMarks:6,directMadeEasyKeys:Object.keys(keys).length,mirrorKeyComparison:65,reviewedDiscussions:[...reviewed],corrections,coverage:questions.map(q=>({number:q.paperQuestionNumber,pages:q.source.pdfPages,copiedFrom:q.source.copiedFrom,issues:q.source.issues}))};
await fs.writeFile(dir+'/content-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,corrections:undefined,coverage:undefined},null,2));
