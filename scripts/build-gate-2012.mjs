import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {bookMap,additions,restoreSource} from '../data/papers/gate-cs-2012-supplement.mjs';
import {answers} from '../data/papers/gate-cs-2012-answers.mjs';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
import {preparePaperAssets} from '../src/lib/year-paper-assets-server.mjs';
const dir='data/backups/gate-2012',slug='gate-cs-2012',title='GATE CS 2012';
const book=JSON.parse(await fs.readFile(dir+'/book-2012.json','utf8')),all=JSON.parse(await fs.readFile(dir+'/book-search.json','utf8'));
const refs=JSON.parse(await fs.readFile(dir+'/reference-2012.json','utf8'));
const mirror=JSON.parse(await fs.readFile(dir+'/historical-key-mirror.json','utf8'));
const mirrorKeys=JSON.parse(await fs.readFile(dir+'/historical-key-mirror-key.json','utf8'));
const sourceFile='D:/Gate PYQs Year Wise - PDFs/2012.pdf',sourceSha256=createHash('sha256').update(await fs.readFile(sourceFile)).digest('hex');
if(sourceSha256!=='ff1031a54b710960b9b7f7e941ff299c0ce77952ee540816e040aa01fbb30269')throw new Error('Unexpected selected PDF');
const manual=new Set([9,15,63]),reviewed=new Set([9,15,20,24,29,32,34,40,45,60,63]);
const keys={2:['DBMS.pdf',4,'2.33','C'],15:['DBMS.pdf',6,'3.24','C'],50:['DBMS.pdf',6,'3.25','A'],51:['DBMS.pdf',6,'3.26','B'],5:['Algorithms.pdf',5,'2.28','C'],39:['Algorithms.pdf',5,'2.29','B'],18:['Algorithms.pdf',3,'1.37','C'],16:['Algorithms.pdf',3,'1.38','D'],29:['Algorithms.pdf',7,'3.44','D'],40:['Algorithms.pdf',7,'3.45','D'],6:['Digital Logic.pdf',1,'1.50','A'],30:['Digital Logic.pdf',1,'1.49','B'],19:['COA.pdf',2,'2.23','D'],20:['COA.pdf',3,'3.24','C'],36:['Compiler Design.pdf',9,'4.5','D'],52:['Compiler Design.pdf',5,'2.27','A'],53:['Compiler Design.pdf',5,'2.28','C']};
const issues={
3:'Historical key awards Marks to All. Literal source has backslash-space-n in the string; editable code retains the space. Newline repair gives intended C only as a worked reference.',
7:'Exponent -1 is unbiased; stored IEEE biased exponent is 126. The reference distinguishes them.',
9:'Source A and D restored from book transcription differences. Published key D counts the restricted-domain endpoint; book key B excludes endpoints. Both definitions are discussed; self-assessment.',
15:'Published and Made Easy key C conflicts with SQL semantics supporting B. Historical key retained as provenance; self-assessment.',
24:'Overbars lost by plain PDF extraction were checked visually and retained in editable math. Nonclosure alone must not be used as a proof of undecidability.',
25:'Strings separated onto original numbered lines, without altering their characters.',
29:'Historical Marks to All award overrides the book D and conditional worked argument for B. One-edge and tied-tree cases are disclosed.',
32:'Book has a semicolon after while, changing its body. Source has no semicolon; original loop restored only in this copy.',
34:'Book quarter-of typo restored to quarter-to. Reserved 245 prefix is literal source data, evaluated as the intended CIDR bit exercise.',
37:'Source option D is 2(2^n-2), not the book 2(2^{n-2}); distractor restored.',
38:'Source option C=90, whereas the book has 45. Correct cycle count 45 is absent from source choices. Source options restored and historical Marks to All applied.',
39:'Historical key awards Marks to All; ordinary merge-sort derivation B is a reference only.',
40:'Source B=SBDT; book has SVDT. Complete directed weighted diagram copied from selected source, with all labels.',
43:'Primary-key underlining restored from selected source.',
45:'Historical key awards Marks to All; book C and timing-convention differences are disclosed, not forced as an automatic key.',
46:'All five missing arcs in each of the four option tables transcribed as editable arrays; partial DFA cropped independently.',
47:'Full original pseudocode braces restored and extra parenthesis removed from book option D.',
48:'Common passage retained in full and all three output rows remain editable code.',
49:'Full shared program and both storage-class substitutions retained.',
50:'Book common labels 3.25/3.26 and C.Age restored to selected source Q50/Q51 and C.Area.',
51:'Full shared relations retained with source column Area; empty-subquery ALL is evaluated vacuously.',
52:'Source distractor C FOLLOW(B)=empty set and D FOLLOW(B)={a,b} restored from book differences.',
53:'Source B E2 contains S->epsilon, not the book B->epsilon. The source calls a conflicting table LL(1); that defect is preserved and explained.',
54:'Historical linked-pair label restored to source Q54/Q55.',
55:'Historical linked-pair label restored; status bits per line preserved exactly.',
60:'Historical key awards Marks to All despite conventional discussion answer A.',
63:'Exact probability is 1/3, whose three-decimal rounding is 0.333. Printed/key B=0.334 is nearest but defective; self-assessment.'
};
function pages(n){for(const [end,p]of [[5,2],[12,3],[21,4],[25,5],[29,6],[33,7],[35,8],[36,9],[43,10],[46,11],[47,12],[49,13],[51,14],[55,15],[62,16],[65,17]])if(n<=end)return[p];}
const assetDir=path.join('public','Year Papers',title);await fs.mkdir(assetDir,{recursive:true});await fs.copyFile(sourceFile,path.join(assetDir,'2012.pdf'));
const questions=[],corrections={};
for(let n=1;n<=65;n++){
 const source=bookMap[n]===undefined?null:book[bookMap[n]];
 const q=restoreSource(structuredClone(source||additions[n]),n);if(!q)throw new Error('Missing Q'+n);
 const ref=refs.find(r=>Number(r.title.match(/Question\s*:\s*(\d+)/)?.[1])===n);
 const url=ref?.url||(n===40?'https://gateoverflow.in/1765/gate-cse-2012-question-40':'');if(!url)throw new Error('Missing reference Q'+n);
 const [key,referenceAnswer]=answers[n],awardAll=mirrorKeys[n]==='Marks to All';
 if((key||'Marks to All')!==mirrorKeys[n])throw new Error('Historical key mismatch Q'+n);
 const fields={...q};for(const k of ['_id','chapterId','source','solutionUrl','gateOverflowUrl','tempPaste','natRange','pdfStyle','correctOptions','natAnswer','answerDisposition','specialNote','manualReview','dependsOnKey','negativeFraction','sectionLimit','assetIds'])delete fields[k];
 const sectionId=n<=25?'one':n<=47?'two':n<=51?'common':n<=55?'linked':'aptitude';
 const sectionName={one:'One-mark questions',two:'Two-mark questions',common:'Common data questions',linked:'Linked answer pairs',aptitude:'General Aptitude'}[sectionId];
 const answerSources=[{kind:'authored-reference',official:false,status:'independently-derived'},
 {kind:'historical-key-mirror',...mirror,pdfPage:n<=40?1:2,bookletCode:'A',question:String(n),printed:mirrorKeys[n],status:'downloaded-and-visually-checked; all-65-match-official-archive-search-index; direct-official-host-unavailable'},
 {kind:'gateoverflow',url,official:false,status:reviewed.has(n)?'discussion-reviewed-through-web-index-or-page':'local-cache-mapping; not-individually-cross-checked'}];
 if(keys[n]){const[file,pdfPage,question,printed]=keys[n];answerSources.push({kind:'made-easy-key',file:'C:/Users/Prince/Desktop/MadeEasy PYQ PDF/All Subject Solutions Keys/'+file,pdfPage,question,printed,official:false,status:'visually-checked'});}
 if(source)answerSources.push({kind:'book-stored-provenance',...source.source,storedOptions:source.correctOptions||[],status:'retained-book-provenance; not-a-new-direct-key-check'});
 const record={...fields,id:`${slug}-q${String(n).padStart(2,'0')}`,key:`yearpaper:${slug}:${n}`,datasetId:slug,year:'2012',examPaper:'CS',setNum:'',chapter:sectionName,assetSubject:'Year Papers',assetChapter:title,paperQuestionNumber:String(n),originalLabel:String(n),marks:String(n<=25||(n>=56&&n<=60)?1:2),questionType:'MCQ',correctOptions:key?[key]:[],natAnswer:'',isBlank:false,isProof:false,isPosLocked:false,sectionId,sectionName,referenceAnswer,manualReview:manual.has(n),...(awardAll?{awardMarksToAll:true}:{}),gateOverflowUrl:url,answerSources,verificationStatus:awardAll?'historical-key-all-candidate-award; authored-reference-not-a-forced-option':manual.has(n)?'disputed-key-or-source-defect; post-submission-self-assessment':'authored-derivation-and-historical-key-comparison',pdfStyle:{fontSize:17,minFontSize:10,lineSpacing:1.12},source:{file:sourceFile,sha256:sourceSha256,pdfPages:pages(n),bookletCode:'A',originalLabel:String(n),...(source?{copiedFrom:{chapterId:source.chapterId,questionId:source.id,year:source.year,subject:source.subject,chapter:source.chapter,bookLabel:source.source?.questionNumber||'',recordSha256:createHash('sha256').update(JSON.stringify(source)).digest('hex')}}:{}),issues:issues[n]?[issues[n]]:[]}};
 if([26,36,46].includes(n)){record.optLayout=n===36?'4col':'2col';record.pdfStyle.imageScale=n===26?.55:n===46?.65:.5;}
 if([48,49].includes(n)){record.optLayout='2col';record.pdfStyle.fontSize=15;}
 if(n===53||n===55){record.dependsOnKey=`yearpaper:${slug}:${n-1}`;record.negativeFraction=0;}
 if(n===1)record.exportInstruction='ONE-MARK QUESTIONS (1-25). GATE CS 2012, booklet A: 65 MCQs, 100 marks, 180 minutes. Wrong one-mark answer: -1/3; blank: 0. No section choices. Source page 1.';
 if(n===26)record.exportInstruction='TWO-MARK QUESTIONS (26-47). Two marks each; wrong answer -2/3. Original order, option order and historical syllabus retained.';
 if(n===48)record.exportInstruction='COMMON DATA (48-51). Two marks each; wrong answer -2/3. Shared passages are repeated in full.';
 if(n===52)record.exportInstruction='LINKED ANSWERS (52-55). Two marks each. Q53/Q55 earn credit only after correct Q52/Q54. Wrong first answer: -2/3; no penalty on second answers. Source page 1.';
 if(n===56)record.exportInstruction='GENERAL APTITUDE (56-65): ten questions, 15 marks. Q56-60: one mark, wrong -1/3; Q61-65: two marks, wrong -2/3. No optional or written questions.';
 if(source)corrections[n]=['text','code','optA','optB','optC','optD','marks','questionType','correctOptions','diagram'].filter(k=>JSON.stringify(source[k])!==JSON.stringify(record[k]));questions.push(record);
}
const paper=validateYearPaper({slug,datasetId:slug,title,year:'2012',examPaper:'CS',setNum:'',questionCount:65,totalMarks:100,availableMarks:100,durationMinutes:180,negativeFraction:1/3,verified:true,sourceUrl:'https://gateoverflow.in/tag/gatecse-2012',sourceSha256,instructions:[
'Verified selected header: 2012, CS: Computer Science & Information Technology, Question Booklet Code A. Booklet A identifies the option/question permutation, not a separate session; set/session stays blank. The physical filename 2012.pdf is preserved. All 20 source pages are present, including three final rough-work pages.',
'Source page 1 specifies three hours, 65 single-answer objective questions and 100 marks. Q1-25 carry one mark and Q26-55 two marks. General Aptitude is Q56-65, with five one-mark and five two-mark questions: ten questions totaling 15 marks.',
'Original navigation blocks: one-mark technical Q1-25; two-mark technical Q26-47; common data Q48-51; linked pairs Q52-55; General Aptitude Q56-65. Attempt all; no optional-section limits, descriptive answers, NAT or MSQ in this paper.',
'Documented penalties: wrong one-mark responses lose 1/3 mark; wrong two-mark responses lose 2/3 mark, except Q53 and Q55 which have no penalty. Ordinary blanks earn zero. Q53 is evaluated only if Q52 is correct, and Q55 only if Q54 is correct. The server enforces the source linked-credit rule.',
'All 65 entries have authored worked references and comparison with a downloaded historical booklet-A key. All 65 key entries agree with the indexed IIT Kanpur official GATE archive. The official archive host could not be downloaded directly (DNS/502); the locally retained PDF is a gatecse.in mirror and is not labeled an authenticated original download. Seventeen supplied Made Easy key entries and eleven relevant discussion pages/indexed discussions were checked separately; remaining discussion links are cache mappings.',
'The historical booklet-A key awards Marks to All for Q3, Q29, Q38, Q39, Q45 and Q60 (10 marks). This practice implements that wording as full marks for every candidate, including blanks. Those questions remain intact; their intended worked answers are explanatory and do not replace the award. Awards appear separately after submission and are hidden in active-attempt question data.',
'Q9 (endpoint convention), Q15 (published SQL key versus semantics) and Q63 (defective numeric approximation), totaling four marks, require post-submission self-assessment. Automatic maximum is 96 marks including the ten all-candidate award marks. Self-assessed marks are stored separately. Published key letters are reference provenance, not definite automatic grades for these disputes.',
'Question copies have independent IDs and keys, complete source-page provenance and independent diagram files. Original book records, prior papers and existing attempts are preserved. This dataset is excluded from book-based subject and weighted mocks.'
],questions});
const prepared=await preparePaperAssets(paper,'public');await fs.writeFile(`data/papers/${slug}.json`,JSON.stringify(prepared.paper,null,2)+'\n');
const selectedIds=new Set(questions.map(q=>q.source.copiedFrom?.questionId));
const report={sourceFile,sourceSha256,bookletCode:'A',setNum:'',sourcePages:20,questions:65,copied:questions.filter(q=>q.source.copiedFrom).length,added:questions.filter(q=>!q.source.copiedFrom).length,searchedBookQuestions:all.length,excludedTaggedRecords:book.filter(q=>!selectedIds.has(q.id)).map(q=>({id:q.id,text:q.text,reason:'Duplicate content of selected Q44; the keyed book copy was retained'})),manualReview:[...manual],manualMarks:4,awards:questions.filter(q=>q.awardMarksToAll).map(q=>q.paperQuestionNumber),awardMarks:10,directMadeEasyKeys:Object.keys(keys).length,mirrorKeyComparison:65,reviewedDiscussions:[...reviewed],corrections,coverage:questions.map(q=>({number:q.paperQuestionNumber,pages:q.source.pdfPages,copiedFrom:q.source.copiedFrom,issues:q.source.issues}))};
await fs.writeFile(dir+'/content-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,corrections:undefined,coverage:undefined},null,2));
