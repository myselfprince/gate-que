import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {additions,objectiveAnswers,descriptive} from '../data/papers/gate-cs-2001-supplement.mjs';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
const book=JSON.parse(await fs.readFile('data/backups/gate-2001/book-2001.json','utf8'));
const all=JSON.parse(await fs.readFile('data/backups/gate-2001/book-search.json','utf8'));
const refs=JSON.parse(await fs.readFile('data/backups/gate-2001/reference-2001.json','utf8'));
const slug='gate-cs-2001',title='GATE CS 2001';
const map={2:2,3:1,4:7,5:11,6:8,7:20,8:21,10:35,11:24,12:17,13:31,14:23,16:22,17:43,18:44,19:32,20:36,21:41,22:42,23:45,26:5,27:3,28:4,29:48,30:9,31:10,32:15,33:26,34:16,35:28,36:25,37:27,38:18,39:29,40:6,42:12,43:13,44:14,45:34,46:38,47:37,48:46,49:47};
const sourcePages={1:[1],2:[1],3:[1],4:[1],5:[1],6:[1],7:[2],8:[2],9:[2],10:[2],11:[2],12:[2],13:[2],14:[2],15:[2],16:[2,3],17:[3],18:[3],19:[3],20:[3],21:[3],22:[3],23:[3],24:[3],25:[3],26:[4],27:[4],28:[4],29:[4],30:[4],31:[4],32:[4],33:[4,5],34:[5],35:[5],36:[5],37:[5],38:[5],39:[5,6],40:[6],41:[6],42:[6],43:[6],44:[6],45:[6],46:[6,7],47:[7],48:[7],49:[7],50:[7],51:[7],52:[7],53:[7],54:[7],55:[7,8],56:[8],57:[8],58:[8],59:[8],60:[8,9],61:[9],62:[9],63:[9],64:[9],65:[9,10],66:[10],67:[10],68:[10],69:[10],70:[10]};
const reviewedGO=new Set([3,6,10,13,23,38,45,48,49,50,56,58,59,67,68,70]);
const issues={
3:'A is intended, but D is also true because valid implies satisfiable. Manual assessment.',
6:'Printed "maximum ... at least" wording is retained; key B is the worst-case state-complexity bound.',
10:'Made Easy OS chapter 2.7 key A conflicts with independently justified D.',
13:'Architecture not specified; C and D depend on instruction-set design. Manual assessment.',
15:'Parent formula assumes i>1; the root has no parent.',
19:'SJF is the intended observation-interval interpretation; all-work-completed throughput can tie.',
33:'Setup/hold assumptions are required; scan says period 40 ns, book copy says >=40 ns. Original restored.',
35:'Twelve-bit width is implied by three-hex-digit options.',
38:'Made Easy Control Unit Design 2.4 key A conflicts with the five required bus/write cycles (D).',
45:'Made Easy OS 1.16 key A conflicts with scheduler interpretation C.',
46:'Two-byte page-table-entry estimate; real entry metadata/alignment can increase storage.',
49:'C is conventional key, but B is unsafe under vacuous truth. Manual assessment.',
50:'Name/prose "greater than" conflicts with explicit y>=x; follow the printed inequality. SQL primary-key syntax retained.',
56:'Binary/decimal KB and overlapping versus serialized transfer assumptions change CPU percentages.',
59:'Scan prints S-K but asks for J,K. Reference explicitly interprets this as J-K. Trigger bits are output before the mode changes.',
65:'Scan inconsistently calls the expression nonterminal B once; context and production use E.',
67:'Supplied scan has P2 acquire R2 then R1. Some web discussion uses a different order. Reference follows the supplied scan.',
68:'Elevator may mean SCAN or LOOK; rotation/transfer worst-case conventions differ. Both explained.',
70:'Leaf capacity and split convention are not fully specified. Reference states a valid convention; other valid trees may be accepted.'
};
const keyChecks={
10:{file:'OS.pdf',pdfPage:5,question:'2.7',printed:'A'},
11:{file:'Digital Logic.pdf',pdfPage:1,question:'1.13',printed:'A'},
12:{file:'COA.pdf',pdfPage:2,question:'2.3',printed:'C'},
13:{file:'OS.pdf',pdfPage:3,question:'1.13',printed:'D'},
22:{file:'COA.pdf',pdfPage:4,question:'4.5',printed:'D'},
33:{file:'Digital Logic.pdf',pdfPage:3,question:'3.3',printed:'A'},
34:{file:'COA.pdf',pdfPage:1,question:'1.2',printed:'A'},
36:{file:'Digital Logic.pdf',pdfPage:2,question:'2.7',printed:'C'},
37:{file:'Digital Logic.pdf',pdfPage:3,question:'3.4',printed:'B'},
38:{file:'COA.pdf',pdfPage:2,question:'2.4',printed:'A'},
45:{file:'OS.pdf',pdfPage:3,question:'1.16',printed:'A'}
};
await fs.mkdir(`public/Year Papers/${title}`,{recursive:true});
const corrections={};const questions=[];
for(let n=1;n<=70;n++){
 const source=n===1?all.find(q=>q.id==='madeeasy-maths-linear-algebra-6-11'):map[n]!==undefined?book[map[n]]:null;
 if(n===1&&!source)throw new Error('Missing cross-year match.');
 const q=structuredClone(source||additions[n]||descriptive[n]);if(!q)throw new Error(`Missing Q${n}`);
 const originalLabel=n<=25?`1.${n}`:n<=50?`2.${n-25}`:String(n-48);
 const ref=refs.find(q=>q.title.match(/GATE CSE 2001 \| Question:\s*([\d.]+(?:-[abc])?)/)?.[1]===originalLabel)
   ||(n===23?{url:'https://gateoverflow.in/716/gate2001-1-23-ugcnet-june2012-iii-18'}:null)
   ||(n===69?refs.find(q=>q.title.includes('Question: 21-a')):null);
 if(!ref)throw new Error(`Missing discussion mapping ${n}/${originalLabel}`);
 if(source){
  const names=(q.diagram||'').split(',').map(s=>s.trim()).filter(Boolean);const rename=new Map();
  const assets=[...names,...['optA','optB','optC','optD'].flatMap(k=>q[k]?.startsWith('IMG:')?[q[k].slice(4).trim()]:[])];
  for(const name of new Set(assets)){
   const dest=`q${n}-${name}`;rename.set(name,dest);
   await fs.copyFile(path.join('public',q.assetSubject||q.subject,q.assetChapter||q.chapter,name+(q.ext||'.png')),path.join('public/Year Papers',title,dest+(q.ext||'.png')));
  }
  q.diagram=names.map(name=>rename.get(name)).join(',');
  for(const k of ['optA','optB','optC','optD'])if(q[k]?.startsWith('IMG:'))q[k]='IMG:'+rename.get(q[k].slice(4).trim());
 }
 if(n===14)q.optB='$O(n\\lg n)$';
 if(n===27)q.text=q.text.replace('B \\cap C','B \\cup C');
 if(n===28)q.text+='\nWhich of the following is true about S1 and S2?';
 if(n===33)q.text=q.text.replace('$C\\geq40$','$C=40$');
 if(n===36){q.optB="$f=x_1'x_2+x_1x_2'$";q.optD="$f=x_1'+x_2'$";}
 const [correct,answer]=objectiveAnswers[n]||[];
 const answerSources=[{kind:'authored-reference',status:'independently-reviewed',official:false},
  {kind:'gateoverflow',url:ref.url,status:reviewedGO.has(n)?'discussion-reviewed':'question-mapping-from-local-cache; solution-not-individually-cross-checked',official:false}];
 if(keyChecks[n])answerSources.push({kind:'made-easy-key',...keyChecks[n],file:`C:/Users/Prince/Desktop/MadeEasy PYQ PDF/All Subject Solutions Keys/${keyChecks[n].file}`,status:'visually-checked',official:false});
 if(source?.source)answerSources.push({kind:'book-stored-provenance',...source.source,status:'retained-source-metadata; not-an-official-key'});
 const sectionName=n<=25?'Section A - one mark':n<=50?'Section A - two marks':'Section B - descriptive';
 const fields={...q};delete fields._id;delete fields.chapterId;delete fields.source;
 const referenceAnswer=(answer||q.referenceAnswer)+(n===56?' The web discussion also offers a serialized-buffer denominator, giving about 29.06% for interrupts (binary KB); the single-scan transfer wording motivates the overlapping 40.96% reference here.':'');
 const record={...fields,id:`${slug}-q${String(n).padStart(2,'0')}`,key:`yearpaper:${slug}:${n}`,datasetId:slug,
  subject:q.subject||'Computer Science',chapter:sectionName,assetSubject:'Year Papers',assetChapter:title,
  year:'2001',examPaper:'CS',setNum:'',paperQuestionNumber:String(n),originalLabel,marks:String(n<=25?1:n<=50?2:5),
  questionType:n<=50?'MCQ':'SUBJECTIVE',correctOptions:correct?[correct]:[],natAnswer:'',isProof:n>50,isBlank:false,isPosLocked:false,
  ...({1:{exportInstruction:'SECTION A - ONE MARK QUESTIONS (1-25). Select one option for each question. Paper maximum: 150 marks. Timed practice: 180 minutes, zero penalty (duration and penalty are not stated in the supplied scan).'},26:{exportInstruction:'SECTION A - TWO MARK QUESTIONS (26-50). Select one option for each question.'},51:{exportInstruction:'SECTION B - FIVE MARK QUESTIONS (51-70). Answer ANY FIFTEEN of these twenty written questions.'}}[n]||{}),
  referenceAnswer,manualReview:[3,13,49].includes(n),sectionId:n<=25?'a1':n<=50?'a2':'b',sectionName,...(n>50?{sectionLimit:15}:{}),
  gateOverflowUrl:ref.url,answerSources,verificationStatus:[3,13,49].includes(n)?'disputed-manual-review':n>50?'authored-worked-reference-self-assessment':keyChecks[n]||reviewedGO.has(n)?'independent-review-with-source-cross-check':'independent-authored-review',
  source:{file:'D:/Gate PYQs Year Wise - PDFs/2001.pdf',pdfPages:sourcePages[n],originalLabel,displayedSourceNumber:String(n),
   copiedFrom:source?{chapterId:source.chapterId,questionId:source.id,subject:source.subject,chapter:source.chapter,year:source.year}:null,
   bookSource:source?.source||null,referenceUrl:ref.url,issues:issues[n]?[issues[n]]:[],answerBasis:'Authored worked reference; no official 2001 key was located.',
   additionalReferences:n===69?refs.filter(q=>/Question: 21-[bc]/.test(q.title)).map(q=>q.url):[]}
 };
 if(source){const changed=['text','code','optA','optB','optC','optD','year','marks','correctOptions'].filter(k=>JSON.stringify(source[k])!==JSON.stringify(record[k]));if(changed.length)corrections[n]=changed;}
 questions.push(record);
}
const paper=validateYearPaper({slug,datasetId:slug,title,year:'2001',examPaper:'CS',setNum:'',questionCount:70,totalMarks:150,availableMarks:175,durationMinutes:180,negativeFraction:0,verified:true,
 sourceUrl:'https://gateoverflow.in/previous-years',sourceSha256:createHash('sha256').update(await fs.readFile('D:/Gate PYQs Year Wise - PDFs/2001.pdf')).digest('hex'),
 instructions:[
 'Original 2001 structure: Section A has 25 one-mark MCQs (Q1-25) and 25 two-mark MCQs (Q26-50); Section B has 20 five-mark written questions (Q51-70). Attempt any 15 written questions. Maximum 150 marks; 175 marks of questions are available.',
 'No General Aptitude section belongs to this paper. Original order and multipart written questions are retained. Source scan uses 1-70; historical discussion labels use 1.1-1.25, 2.1-2.25 and 3-22.',
 'The supplied ten-page scan does not document duration or negative marking. This practice paper uses 180 minutes and zero MCQ penalty; these are disclosed practice settings, not verified official 2001 grading rules.',
 'All 70 questions have authored worked references, clearly separated from official answers. No official 2001 key was located. Relevant supplied Made Easy keys and GATE Overflow discussions are cross-checked selectively; per-question provenance records the scope.',
 'Q3, Q13 and Q49 have ambiguous or conflicting single-choice interpretations and require post-submission self-assessment (4 marks). The other 47 MCQs are automatically graded (71 marks). Q10, Q38 and Q45 use explained corrections to conflicting Made Easy keys.',
 'Written responses autosave; the server enforces at most 15 answered Section B questions. After submission, compare with the worked reference and record clearly labeled self-assessed marks. Q56, Q59, Q67, Q68 and Q70 include source/interpretation notes.'
 ],questions});
await fs.writeFile(`data/papers/${slug}.json`,JSON.stringify(paper,null,2)+'\n');
const audit={questions:70,copied:questions.filter(q=>q.source.copiedFrom).length,added:questions.filter(q=>!q.source.copiedFrom).length,bookSearchCount:all.length,yearTagged:book.length,corrections,
 duplicateRepresentations:{8:[book[21].id,book[39].id],12:[book[17].id,book[30].id],17:[book[40].id,book[43].id],22:[book[19].id,book[42].id]},
 incorrectlyTaggedMatch:{paperNumber:1,bookYear:'2002',questionId:questions[0].source.copiedFrom.questionId},
 unrelatedYearTagged:[0,33,49].map(i=>({id:book[i].id,text:book[i].text})),
 coverage:questions.map(q=>({number:q.paperQuestionNumber,originalLabel:q.originalLabel,pages:q.source.pdfPages,copiedFrom:q.source.copiedFrom,status:q.verificationStatus,issues:q.source.issues}))};
await fs.writeFile('data/backups/gate-2001/content-audit.json',JSON.stringify(audit,null,2));
console.log(JSON.stringify({questions:audit.questions,copied:audit.copied,added:audit.added,manual:questions.filter(q=>q.manualReview).map(q=>q.paperQuestionNumber)},null,2));
