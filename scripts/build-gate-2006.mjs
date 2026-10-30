import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {bookMap,additions} from '../data/papers/gate-cs-2006-supplement.mjs';
import {answers} from '../data/papers/gate-cs-2006-answers.mjs';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
import {preparePaperAssets} from '../src/lib/year-paper-assets-server.mjs';
const S=String.raw,dir='data/backups/gate-2006',slug='gate-cs-2006',title='GATE CS 2006';
const book=JSON.parse(await fs.readFile(dir+'/book-2006.json','utf8'));
const all=JSON.parse(await fs.readFile(dir+'/book-search.json','utf8'));
const refs=JSON.parse(await fs.readFile(dir+'/reference-2006.json','utf8')).filter(r=>r.title.startsWith('GATE CSE 2006 | Question:'));
const sourceFile='D:/Gate PYQs Year Wise - PDFs/2006.pdf',sourceSha256=createHash('sha256').update(await fs.readFile(sourceFile)).digest('hex');
if(sourceSha256!=='8155cf736514df6a162efa0f458ae7484a98a54c54bf3f370769424f34162f36')throw new Error('Unexpected selected PDF');
const manual=new Set([13,18,24,36,38,39,63,66,69,70,79,83]);
const reviewed=new Set([2,12,13,18,24,28,31,36,38,39,53,56,63,66,67,69,70,72,79,82,83,85]);
const keys={1:['Algorithms.pdf',7,'3.17','A'],10:['Algorithms.pdf',7,'3.20','A'],11:['Algorithms.pdf',7,'3.18','B'],12:['Algorithms.pdf',7,'3.19','C'],15:['Algorithms.pdf',3,'1.22','C'],47:['Algorithms.pdf',7,'3.21','D'],51:['Algorithms.pdf',3,'1.23','B'],76:['Algorithms.pdf',7,'3.24','D'],77:['Algorithms.pdf',7,'3.25','A'],8:['Digital Logic.pdf',3,'3.15','C'],35:['Digital Logic.pdf',2,'2.15','A'],36:['Digital Logic.pdf',2,'2.16','A'],38:['Digital Logic.pdf',1,'1.28','*'],39:['Digital Logic.pdf',2,'2.17','C'],40:['Digital Logic.pdf',1,'1.29','C'],37:['Digital Logic.pdf',3,'3.14','C']};
const issues={
2:'Book option A loses its exponent; option C also loses its source exponent. Restored from selected scan.',
9:'Byte addressing and instruction alignment are implicit assumptions, as in the conventional reference.',
12:'Supplied key C (heap) conflicts with the unweighted linear-time wording. Independent paper-copy answer A; original key untouched.',
13:'Selected source right-child expression is X[2i-1], not X[2i+1]. Literal expression preserved; intended D requires a correction.',
18:'The source permits an empty sample but leaves its minimum undefined. Conventional n uses a zero-on-empty extension.',
20:'Selected scan record 2 prints old B=1200, conflicting with initial B=12000 and new B=10000. Literal record retained.',
24:'Arbitrary subsets can be empty, making min undefined. Conventional C requires nonempty A and B.',
25:'Selected source distractors are 2m-1 and 2n-1, unlike book +1 versions.',
31:'Search problem NP-hardness uses the conventional polynomial Turing reduction interpretation; no official key claimed.',
35:'Selected source bars and multiplexer wiring used; source diagram independently cropped.',
36:'Selected scan options A, B and D have heavily overprinted glyphs. All four original formula crops preserved; legible reconstruction retained only in review provenance.',
38:'No offered cover meets both exact function coverage and static-1-hazard freedom. Supplied key is an asterisk.',
39:'Source option B groups the complement over the product of sign bits; conventional B needs separate complements. Literal grouping preserved.',
47:'Graph edge d-c weighs 2 while d-e weighs 3; source diagram retained.',
49:'Source delete signature is delete(Q), unlike the stored delete(Q,x). Pseudocode retained in editable form.',
53:'Both source k expressions subtract 1, whereas loop invariant is k=i+j. D is independently verified.',
59:'Book choices B and C differ from selected scan. Source option order and character placement restored.',
63:'Book and discussion favor A, but virtual-memory removal has alternative cache/protection interpretations. Preserved with conventional A and explicit manual review.',
66:'Source option B uses max; discussion uses min for the necessary condition. Source C is max(xp,xq)>1. Literal source preserved.',
67:'Both queries use an inner self-join. Conventional shortcut B ignores missing maximum-rank rows; C is used for the literal SQL.',
69:'Universal runtime comparison needs a plan-cost convention not completely specified by the source. Conventional C reference only.',
70:'Two false choices C and D in a source single-choice question; not silently converted to MSQ.',
71:'Shared passage repeated on all three pages in original common-data block order.',
72:'Source option A is binom(n/2,2)*2^(n/2), unlike stored binom(n,2)*2^(n-2). Source restored.',
76:'Degraded array brackets in the scan are read as a[0] and a[4], corroborated by the complete description and book copy.',
77:'Original Q76 options repeated as common context; no answer annotation added.',
79:'Option B does not specify how to identify the first process of a new barrier generation. Conceptual repair only.',
80:'Conventional cache count assumes a line-aligned row-major array; the scan does not explicitly give its base address.',
82:'Selected scan topology cropped; stored placeholder removed only from independent copy.',
83:'One broadcast ping alone does not establish a forwarding table for every host. Conventional A assumes a fully learned table.',
85:'Source option D is max(l,m)+2, duplicating option A, unlike book max(l,m)+3. Both source options retained; manual review required.'
};
manual.add(85);
function pages(n){if(n<=7)return[1];if(n===8)return[1,2];if(n<=17)return[2];if(n<=24)return[3];if(n===25)return[3,4];if(n<=32)return[4];if(n<=36)return[5];if(n===37)return[5];if(n<=39)return[5];if(n===40)return[5,6];if(n<=46)return[6];if(n===47)return[6,7];if(n<=52)return[7];if(n===53)return[7,8];if(n<=57)return[8];if(n===58)return[8,9];if(n<=64)return[9];if(n===65)return[9,10];if(n<=68)return[10];if(n===69)return[10,11];if(n<=75)return[11];if(n===76)return[11,12];if(n<=80)return[12];if(n===81)return[12,13];return[13];}
const assetDir='public/Year Papers/'+title;await fs.mkdir(assetDir,{recursive:true});
await fs.copyFile(sourceFile,path.join(assetDir,'2006.pdf'));
const questions=[],corrections={};
for(let n=1;n<=85;n++){
 const source=bookMap[n]===undefined?null:book[bookMap[n]],q=structuredClone(source||additions[n]);if(!q)throw new Error('Missing Q'+n);
 if(source){
  const names=(q.diagram||'').split(',').map(s=>s.trim()).filter(Boolean),renamed=new Map();
  for(const name of new Set([...names,...['optA','optB','optC','optD'].flatMap(k=>q[k]?.startsWith('IMG:')?[q[k].slice(4).trim()]:[])])){
   const dest=`q${n}-${name}`;renamed.set(name,dest);
   await fs.copyFile(path.join('public',source.assetSubject||source.subject,source.assetChapter||source.chapter,name+(source.ext||'.png')),path.join(assetDir,dest+(source.ext||'.png')));
  }
  q.diagram=names.map(name=>renamed.get(name)).join(',');for(const k of ['optA','optB','optC','optD'])if(q[k]?.startsWith('IMG:'))q[k]='IMG:'+renamed.get(q[k].slice(4).trim());
 }
 if(n===2){q.optA=S`$z^{2^{xy}}$`;q.optC=S`$z^{2^{x+y}}$`;}
 if(n===11)q.optC=S`$\binom{n}{2}$`;
 if(n===13){q.text=q.text.replace('X[2i + 1]','X[2i - 1]').replace('X[2i+1]','X[2i-1]');q.optD='$2^n-1$';}
 if(n===20)q.text=q.text.replace('B old = 12000','B old = 1200');
 if(n===25){q.optC='$2m-1$';q.optD='$2n-1$';}
 if(n===26)q.optC=S`$\forall x[(\mathrm{tiger}(x)\vee\mathrm{lion}(x))\to((\mathrm{attacks}(x)\to\mathrm{hungry}(x))\vee\mathrm{threatened}(x))]$`;
 if(n===28){q.text=S`A logical binary relation $\odot$ is defined as follows:
$$\begin{array}{cc|c}A&B&A\odot B\\\hline\mathrm{True}&\mathrm{True}&\mathrm{True}\\\mathrm{True}&\mathrm{False}&\mathrm{True}\\\mathrm{False}&\mathrm{True}&\mathrm{False}\\\mathrm{False}&\mathrm{False}&\mathrm{True}\end{array}$$
Let $\sim$ be unary negation (NOT), with higher precedence than $\odot$. Which one of the following is equivalent to $A\land B$?`;q.diagram='';}
 // This truth table is B implies A; source D is the equivalent conjunction.
 if(n===35){q.diagram='q35-circuit';q.optC=S`$xz+xy+\overline{yz}$`;}
 if(n===36){q.diagram='q36-original-options';q.text+='\n[IMG_1]';q.optLayout='2col';for(const k of ['A','B','C','D'])q['opt'+k]='Expression ('+k.toLowerCase()+') in the source figure';}
 if(n===37)q.diagram='q37-circuit';
 if(n===38){q.text=q.text.replace('w_1,x_1,y_1,x_1','w_1,x_1,y_1,z_1')+'\nSource formula facsimile:\n[IMG_1]';q.diagram='q38-original-options';q.optB=S`$wxz,\;\overline wxy,\;wyz$`;q.optC=S`$wx\overline{yz},\;xz,\;w\overline x yz$`;}
 if(n===47)q.diagram='q47-graph';
 if(n===49)q.code=q.code.replace('delete(Q, x)','delete(Q)');
 if(n===59){q.optA='2 * 3 + 4';q.optB='2 * 3 4';q.optC='2 3 * 4 +';q.optD='2 3 4 + *';}
 if(n===66){q.optC=S`$\max(x_p,x_q)>1$`;}
 if(n===69)q.diagram='q69-plans';
 if(n===70)q.optD=S`$\{AB\}^+=\{ABCDFG\}$`;
 if(n>=71&&n<=73){q.text=S`Common Data for Questions 71, 72 and 73:
The $2^n$ vertices of graph $G$ correspond to all subsets of a set of size $n$, for $n\ge6$. Two vertices of $G$ are adjacent if and only if the corresponding sets intersect in exactly two elements.
`+(n===71?'The number of vertices of degree zero in G is':n===72?'The maximum degree of a vertex in G is':'The number of connected components in G is');}
 if(n===72)q.optA=S`$\binom{n/2}{2}2^{n/2}$`;
 if(n===74||n===75)q.text=q.text.replace('Common Data for Q.4.18 & Q.4.19:','Common Data for Questions 74 and 75:').replace('The size and address','The size of an address');
 if(n===76||n===77){q.text=q.text.replace('Common Data for Q.3.24 and Q.3.25:','Statement for Linked Answer Questions 76 and 77:').replace('Linked Q3.24','Question 76');}
 if(n===78||n===79)q.text=q.text.replace('Common Data for Q. 2.17 & 2.18:','Statement for Linked Answer Questions 78 and 79:');
 if(n===80||n===81)q.text=q.text.replace('Common Data for Q.4.20 & Q.4.21:','Statement for Linked Answer Questions 80 and 81:');
 if(n===82||n===83){q.diagram='q82-83-lans';q.text=q.text.replace('[DIAGRAM_PLACEHOLDER]','[IMG_1]');q.text='Statement for Linked Answer Questions 82 and 83:\n'+q.text;}
 if(n===84)q.text=q.text.replace('Linked data for Questions 2.17 and 2.18.','Statement for Linked Answer Questions 84 and 85.');
 if(n===85){q.text=q.text.replace('Linked data for Questions 2.17 and 2.18.','Statement for Linked Answer Questions 84 and 85.').replace('Q2.17','Question 84');q.optD=S`$\max(l,m)+2$`;}
 const ref=refs.find(r=>Number(r.title.match(/Question:\s*(\d+)/)?.[1])===n);if(!ref)throw new Error('Missing reference Q'+n);
 const [key,referenceAnswer]=answers[n],fields={...q};for(const k of ['_id','chapterId','source','solutionUrl','gateOverflowUrl','tempPaste','natRange','pdfStyle'])delete fields[k];
 const sectionId=n<=20?'one':n<=70?'two':n<=75?'common':'linked',sectionName={one:'One-mark questions',two:'Two-mark questions',common:'Common data questions',linked:'Linked answer pairs'}[sectionId];
 const answerSources=[{kind:'authored-reference',official:false,status:'independently-derived'},{kind:'gateoverflow',url:ref.url,official:false,status:reviewed.has(n)?'discussion-reviewed':'question-mapping-from-local-cache; answer-not-individually-cross-checked'}];
 if(keys[n]){const[file,pdfPage,question,printed]=keys[n];answerSources.push({kind:'made-easy-key',file:'C:/Users/Prince/Desktop/MadeEasy PYQ PDF/All Subject Solutions Keys/'+file,pdfPage,question,printed,official:false,status:'visually-checked'});}
 if(source?.source)answerSources.push({kind:'book-stored-provenance',...source.source,status:'retained-book-provenance; not-an-official-key'});
 const record={...fields,id:`${slug}-q${String(n).padStart(2,'0')}`,key:`yearpaper:${slug}:${n}`,datasetId:slug,year:'2006',examPaper:'CS',setNum:'',chapter:sectionName,assetSubject:'Year Papers',assetChapter:title,paperQuestionNumber:String(n),originalLabel:String(n),marks:String(n<=20?1:2),questionType:'MCQ',correctOptions:key?[key]:[],natAnswer:'',isBlank:false,isProof:false,isPosLocked:false,sectionId,sectionName,referenceAnswer,manualReview:manual.has(n),gateOverflowUrl:ref.url,answerSources,verificationStatus:manual.has(n)?'source-defect-or-disputed-manual-review':'independent-authored-review',pdfStyle:{fontSize:17,minFontSize:10,lineSpacing:1.12},source:{file:sourceFile,sha256:sourceSha256,pdfPages:pages(n),originalLabel:String(n),...(source?{copiedFrom:{chapterId:source.chapterId,questionId:source.id,year:source.year,subject:source.subject,chapter:source.chapter,bookLabel:source.source?.questionNumber||'',recordSha256:createHash('sha256').update(JSON.stringify(source)).digest('hex')}}:{}),issues:issues[n]?[issues[n]]:[]}};
 if(n>=76&&n%2===1){record.dependsOnKey=`yearpaper:${slug}:${n-1}`;record.negativeFraction=0;}
 if(n===1)record.exportInstruction='ONE-MARK QUESTIONS (1-20). GATE CS 2006: 85 questions, 150 marks, practice timer 180 minutes. Practice penalty: 0.25 per wrong one-mark answer. The selected scan omits its official instructions leaf.';
 if(n===21)record.exportInstruction='TWO-MARK QUESTIONS (21-70). Practice penalty: 0.5 per wrong answer. All source positions are retained, including defective items explained in the separate solutions.';
 if(n===71)record.exportInstruction='COMMON DATA QUESTIONS (71-75). Two marks each. Shared statements are repeated on each question page. No General Aptitude or optional questions occur in this source.';
 if(n===76)record.exportInstruction='LINKED ANSWERS (76-85). Two marks per question. Practice policy: a wrong first answer loses 0.5; the second has no penalty and earns marks only if the first is correct. These practice penalties are not asserted as authenticated official rules.';
 if(source)corrections[n]=['text','code','optA','optB','optC','optD','marks','questionType','correctOptions'].filter(k=>JSON.stringify(source[k])!==JSON.stringify(record[k]));
 questions.push(record);
}
const reviewQuestions=questions.filter(q=>q.manualReview).map(q=>q.paperQuestionNumber),reviewMarks=questions.filter(q=>q.manualReview).reduce((s,q)=>s+Number(q.marks),0);
const paper=validateYearPaper({slug,datasetId:slug,title,year:'2006',examPaper:'CS',setNum:'',questionCount:85,totalMarks:150,availableMarks:150,durationMinutes:180,negativeFraction:.25,verified:true,sourceUrl:'https://gateoverflow.in/exam/55/gate-cse-2006-original-paper',sourceSha256,instructions:[
'Selected 13-page header verified: GATE-2006, COMPUTER SCIENCE & ENGINEERING. One paper; no set/session label. Original physical filename 2006.pdf retained.',
'Original positions: Q1-20 one mark each; Q21-70 two marks; common-data Q71-75 two marks; linked pairs (76,77), (78,79), (80,81), (82,83), (84,85) two marks per answer. Total 85 MCQs, 150 marks. No optional questions or General Aptitude section.',
'180-minute practice timer is corroborated by the GATE Overflow original-paper catalog. The selected PDF has no instructions leaf. Practice uses a 25% wrong-answer penalty (0.25 or 0.5 mark), with zero penalty for linked second answers and credit conditional on a correct first answer. An authenticated official 2006 CS grading instruction has not been located; these are disclosed practice settings.',
'Every question has an authored worked reference, not an official answer key. Answer provenance distinguishes directly read supplied keys, reviewed GATE Overflow discussions, retained book provenance and cache-only question mappings.',
`Source defects/disagreements at Q${reviewQuestions.join(', Q')} require post-submission self-assessment (${reviewMarks} marks). They are not automatically declared correct or wrong. Linked second answers remain pending until manual prerequisites are assessed correct.`,
'Independent IDs, keys, copied assets and source-record provenance keep this dataset separate from all book records. Book-based subject and weighted mocks exclude these copies. Timer, responses, navigation and review markers autosave and resume.'
],questions});
const prepared=await preparePaperAssets(paper,'public');await fs.writeFile(`data/papers/${slug}.json`,JSON.stringify(prepared.paper,null,2)+'\n');
const report={sourceFile,sourceSha256,questions:85,copied:questions.filter(q=>q.source.copiedFrom).length,added:questions.filter(q=>!q.source.copiedFrom).length,searchedBookQuestions:all.length,manualReview:reviewQuestions,manualMarks:reviewMarks,directKeyCount:Object.keys(keys).length,corrections,coverage:questions.map(q=>({number:q.paperQuestionNumber,pages:q.source.pdfPages,copiedFrom:q.source.copiedFrom,issues:q.source.issues}))};
await fs.writeFile(dir+'/content-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,corrections:undefined,coverage:undefined},null,2));
