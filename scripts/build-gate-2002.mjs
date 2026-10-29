import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {additions,objectiveAnswers,descriptive} from '../data/papers/gate-cs-2002-supplement.mjs';
import {validateYearPaper} from '../src/lib/year-papers.mjs';
const base='data/backups/gate-2002';
const book=JSON.parse(await fs.readFile(`${base}/book-2002.json`,'utf8'));
const all=JSON.parse(await fs.readFile(`${base}/book-search.json`,'utf8'));
const refs=JSON.parse(await fs.readFile(`${base}/reference-2002.json`,'utf8'));
const slug='gate-cs-2002',title='GATE CS 2002',sourceFile='D:/Gate PYQs Year Wise - PDFs/2002.pdf';
const sourceSha256=createHash('sha256').update(await fs.readFile(sourceFile)).digest('hex');
if(sourceSha256!=='aaa059d0b47e32ade8ea98e4b9bf7e5615717145bbf48095490ea027b5c03a7e')throw new Error('Unexpected source PDF.');
const map={1:50,3:2,4:3,5:21,7:7,8:0,9:14,11:17,12:27,13:40,14:34,15:35,16:36,17:9,18:8,20:46,21:18,23:41,24:15,25:4,26:28,27:31,28:29,30:32,31:19,32:16,33:10,34:37,35:23,36:24,38:6,39:12,41:48,42:1,45:42,46:38,47:43,48:47,49:44,50:45,53:51,55:30,66:39};
const cross={19:'madeeasy-dbms-normalization-2-12',22:'madeeasy-os-process-management-1-15'};
const partial=new Set([53,55,66]),manual=new Set([37,39,46,50]);
const pages=n=>n<=9?[1]:n<=19?[2]:n<=25?[3]:n===26?[3]:n===27?[3,4]:n<=35?[4]:n===36?[4,5]:n<=45?[5]:n===46?[5,6]:n<=52?[6]:n===53?[6,7]:n<=57?[7]:n===58?[7,8]:n<=62?[8]:n===63?[8,9]:n<=65?[9]:n===66?[9,10]:[10];
const reviewedGO=new Set([18,26,29,37,39,43,46,50,55,56,57,59,60,63,64,65,66,68]);
const issues={
6:'Nonsingular matrices are understood to be square matrices of the same size over one field.',
15:'Five-bit width is implied by the matching option; wider two-complement encodings sign-extend it.',
25:'Simple graph is implicit: allowing parallel edges would make the maximum unbounded.',
26:'Book prints f2=Sigma(6,5); the selected source visibly prints Sigma(6,7), restored in this copy.',
27:'Source option B is xy\u0027z, whereas the book copy uses xy+z. Source order and expression restored.',
29:'The selected scan duplicates option A as option D (AC=0,CY=0); retained verbatim. The correct C is unambiguous.',
36:'C is the tightest listed complexity; larger big-O bounds also formally hold. Standard unit-cost arithmetic assumed.',
37:'Conventional D ignores the literal integer-node condition, which forces perfect trees; manual review.',
39:'A and C are both true under inclusive or. Conventional A is not silently graded.',
43:'Context-sensitive refers to the full language including semantic constraints, not merely a context-free syntax approximation.',
46:'Made Easy OS 1.17 prints D; reviewed GATE Overflow prefers B as the minimal sufficient characterization. Manual review.',
48:'The degree calculation assumes internal nodes with p pointers, p-1 keys and no extra node-header overhead.',
49:'The contrast is understood as BCNF versus 3NF-but-not-BCNF; BCNF is itself a subset of 3NF.',
50:'C is the schema-level conclusion; B also describes the displayed instance. Manual review.',
56:'Output sequence is sampled after each falling clock edge and subsequent combinational settling.',
57:'Base-16 normalization has no hidden leading bit. Nearest power of ten is interpreted logarithmically.',
60:'Source initialization omits the empty-path diagonal convention; the worked reference states it explicitly and keeps i as outermost intermediate-vertex loop.',
63:'Average offered salary can mean offer-weighted or equally weighted per student when several offers exist; both policies are explained.',
65:'B+ successful membership search depends on whether internal separator equality is conclusive; record lookup goes to a leaf. Both justified interpretations are accepted.',
66:'Printed TEST-AND-SET and enter-cs/leave-cs names use hyphens and are retained as historical pseudocode, not compilable C identifiers.',
68:'The printed int first=last=0 and buffer operations are historical pseudocode; one shared binary semaphore suffices in part b.',
70:'The selected scan prints the identifier terminal as di. It is retained in the question; the worked reference interprets this evident transposition as the usual id token for i,j,k.'
};
const keys={
5:['Algorithms.pdf',3,'1.4','D'],9:['COA.pdf',2,'2.5','A'],11:['COA.pdf',3,'3.2','A'],12:['Digital Logic.pdf',1,'1.14','B'],
13:['OS.pdf',9,'4.19','C'],19:['DBMS.pdf',4,'2.12','A'],20:['DBMS.pdf',8,'4.7','C'],21:['COA.pdf',3,'3.3','B'],
22:['OS.pdf',3,'1.15','B'],23:['OS.pdf',9,'4.20','B'],24:['COA.pdf',2,'2.6','B'],26:['Digital Logic.pdf',1,'1.15','A'],
27:['Digital Logic.pdf',2,'2.8','A'],28:['Digital Logic.pdf',1,'1.16','C'],30:['Digital Logic.pdf',3,'3.5','A'],
31:['COA.pdf',3,'3.4','D'],32:['COA.pdf',2,'2.7','D'],35:['Algorithms.pdf',3,'1.6','A'],36:['Algorithms.pdf',3,'1.7','C'],
45:['OS.pdf',9,'4.21','B'],46:['OS.pdf',3,'1.17','D'],47:['OS.pdf',11,'5.10','C'],48:['DBMS.pdf',12,'6.3','C'],
49:['DBMS.pdf',4,'2.13','C'],50:['DBMS.pdf',4,'2.14','C'],55:['Digital Logic.pdf',1,'1.17','Sol.'],66:['OS.pdf',3,'1.18','Sol.']
};
await fs.mkdir(`public/Year Papers/${title}`,{recursive:true});
const questions=[],corrections={};
for(let n=1;n<=70;n++){
 const source=cross[n]?all.find(q=>q.id===cross[n]):map[n]!==undefined?book[map[n]]:null;
 const q=structuredClone(source||additions[n]||descriptive[n]);if(!q)throw new Error(`Missing Q${n}`);
 if(partial.has(n))Object.assign(q,descriptive[n],{diagram:source.diagram||''});
 if(source){
  const names=(q.diagram||'').split(',').map(s=>s.trim()).filter(Boolean),rename=new Map();
  const assets=[...names,...['optA','optB','optC','optD'].flatMap(k=>q[k]?.startsWith('IMG:')?[q[k].slice(4).trim()]:[])];
  for(const name of new Set(assets)){
   const dest=`q${n}-${name}`;rename.set(name,dest);
   await fs.copyFile(path.join('public',source.assetSubject||source.subject,source.assetChapter||source.chapter,name+(source.ext||'.png')),path.join('public/Year Papers',title,dest+(source.ext||'.png')));
  }
  q.diagram=names.map(name=>rename.get(name)).join(',');
  for(const k of ['optA','optB','optC','optD'])if(q[k]?.startsWith('IMG:'))q[k]='IMG:'+rename.get(q[k].slice(4).trim());
 }
 // Every correction is confined to this independently identified copy.
 if(n===7)q.optC='Deterministic Context Free';
 if(n===14)q.optC='is equivalent to the binary value $0.00111\\ldots$';
 if(n===26)q.text=q.text.replace('\\Sigma(6,5)','\\Sigma(6,7)');
 if(n===27)q.optB="$xy'z$";
 if(n===42)q.text='The binary relation $S=\\varnothing$ (empty set) on set $A=\\{1,2,3\\}$ is';
 if(n===46){q.text='Which combination of the following features will suffice to characterize an OS as a multi-programmed OS?\n(a) More than one program may be loaded into main memory at the same time for execution.\n(b) If a program waits for certain events such as I/O, another program is immediately scheduled for execution.\n(c) If the execution of a program terminates, another program is immediately scheduled for execution.';q.optA='(a)';q.optB='(a) and (b)';q.optC='(a) and (c)';q.optD='(a), (b) and (c)';}
 if(n===56)q.pdfStyle={imageScale:1.45};
 if(n===70){q.text=q.text.replace('\\mathrm{id}','\\mathrm{di}');q.referenceAnswer='The scan prints di for the identifier token; interpret it as id, consistent with the identifiers i,j,k in the requested expression. '+q.referenceAnswer;}
 if(n===68){
  q.code=q.code.replace('semaphore b_full = 0;\nsemaphore b_empty = BUFFSIZE;','semaphore b_full = 0; semaphore b_empty = BUFFSIZE;')
   .replace('void producer() {\n  while (1) {','void producer() { while (1) {').replace('void consumer() {\n  while (1) {','void consumer() { while (1) {').replaceAll('  }\n}','} }');
  q.pdfStyle={fontSize:16,minFontSize:12,lineSpacing:1.1};
 }
 const originalLabel=n<=25?`1.${n}`:n<=50?`2.${n-25}`:String(n-48);
 const normalized=t=>t.replace(/-/g,'.');
 const ref=refs.find(q=>normalized(q.title.match(/Question:\s*([^,\s]+)/)?.[1]||'')===normalized(n===53?'5a':n===66?'18-a':originalLabel));
 if(!ref)throw new Error(`Missing discussion mapping for Q${n} (${originalLabel})`);
 const [correct,answer]=objectiveAnswers[n]||[];
 const answerSources=[{kind:'authored-reference',status:'independently-reviewed',official:false},
  {kind:'gateoverflow',url:ref.url,status:reviewedGO.has(n)?'discussion-reviewed':'question-mapping-from-local-cache; answer-not-individually-cross-checked',official:false}];
 if(keys[n]){const [file,pdfPage,question,printed]=keys[n];answerSources.push({kind:'made-easy-key',file:`C:/Users/Prince/Desktop/MadeEasy PYQ PDF/All Subject Solutions Keys/${file}`,pdfPage,question,printed,status:'visually-checked',official:false});}
 if(source?.source)answerSources.push({kind:'book-stored-provenance',...source.source,status:'retained-source-metadata; not-an-official-key'});
 const additionalReferences=n===53?refs.filter(q=>q.title.endsWith('5b')).map(q=>q.url):n===66?refs.filter(q=>q.title.endsWith('18-b')).map(q=>q.url):[];
 if(additionalReferences.length)answerSources.push(...additionalReferences.map(url=>({kind:'gateoverflow',url,status:reviewedGO.has(n)?'discussion-reviewed':'question-mapping-from-local-cache',official:false})));
 const sectionName=n<=25?'Section A - one mark':n<=50?'Section A - two marks':'Section B - descriptive';
 const fields={...q};delete fields._id;delete fields.chapterId;delete fields.source;
 const record={...fields,id:`${slug}-q${String(n).padStart(2,'0')}`,key:`yearpaper:${slug}:${n}`,datasetId:slug,
  subject:q.subject||'Computer Science',chapter:sectionName,assetSubject:'Year Papers',assetChapter:title,year:'2002',examPaper:'CS',setNum:'',
  paperQuestionNumber:String(n),originalLabel,marks:String(n<=25?1:n<=50?2:5),questionType:n<=50?'MCQ':'SUBJECTIVE',correctOptions:correct?[correct]:[],natAnswer:'',isProof:n>50,isBlank:false,isPosLocked:false,
  ...({1:{exportInstruction:'SECTION A - ONE MARK QUESTIONS (1-25). Select one option per question. Maximum 150 marks. Timed practice: 180 minutes, zero penalty (duration and penalty not stated in the supplied scan).'},26:{exportInstruction:'SECTION A - TWO MARK QUESTIONS (26-50). Select one option per question.'},51:{exportInstruction:'SECTION B - FIVE MARK WRITTEN QUESTIONS (51-70). Answer ANY FIFTEEN of these twenty questions.'}}[n]||{}),
  referenceAnswer:answer||q.referenceAnswer,manualReview:manual.has(n),sectionId:n<=25?'a1':n<=50?'a2':'b',sectionName,...(n>50?{sectionLimit:15}:{}),
  gateOverflowUrl:ref.url,answerSources,verificationStatus:manual.has(n)?'disputed-manual-review':n>50?'authored-worked-reference-self-assessment':keys[n]||reviewedGO.has(n)?'independent-review-with-source-cross-check':'independent-authored-review',
  source:{file:sourceFile,pdfPages:pages(n),originalLabel,displayedSourceNumber:String(n),
   copiedFrom:source?{chapterId:source.chapterId,questionId:source.id,subject:source.subject,chapter:source.chapter,year:source.year,scope:partial.has(n)?'partial-multipart-question':'full-question'}:null,
   bookSource:source?.source||null,referenceUrl:ref.url,additionalReferences,issues:issues[n]?[issues[n]]:[],answerBasis:'Authored worked reference; no official 2002 key was located.'}
 };
 if(n>50)for(const k of ['optA','optB','optC','optD'])record[k]='';
 if(source){const changed=['text','code','optA','optB','optC','optD','year','marks','correctOptions'].filter(k=>JSON.stringify(source[k])!==JSON.stringify(record[k]));if(changed.length)corrections[n]=changed;}
 questions.push(record);
}
const paper=validateYearPaper({slug,datasetId:slug,title,year:'2002',examPaper:'CS',setNum:'',questionCount:70,totalMarks:150,availableMarks:175,durationMinutes:180,negativeFraction:0,verified:true,
 sourceUrl:'https://gateoverflow.in/previous-years',sourceSha256,instructions:[
 'Verified selected scan: GATE 2002, Computer Science & Engineering; single paper with no set/session label. The visible header is 2002 even though the defective text layer reads 2001. Physical filename 2002.pdf is preserved.',
 'Section A: Q1-25 are one-mark MCQs and Q26-50 are two-mark MCQs. Section B: Q51-70 are five-mark written questions; answer ANY FIFTEEN. Maximum 150 marks; 175 marks of questions are available. No General Aptitude section belongs to this paper.',
 'The supplied ten-page scan does not state duration or negative marking. Practice settings are 180 minutes and zero MCQ penalty; these are not claimed as verified official 2002 rules.',
 'All 70 positions have authored worked references. No official 2002 answer key was located. Supplied Made Easy keys and selected GATE Overflow discussions were cross-checked; per-question provenance states the actual scope. Historical labels 1.1-1.25, 2.1-2.25 and 3-22 are retained alongside source positions 1-70.',
 'Q37, Q39, Q46 and Q50 are disputed or ambiguous single-choice items (8 marks) and require post-submission self-assessment. The other 46 MCQs have 67 automatically gradable marks. Source option defects and interpretation assumptions are documented in the worked references.',
 'Written responses autosave; the server enforces the limit of 15 nonempty Section B responses. Compare submitted responses with the worked references and save clearly labeled self-assessed marks. Q60, Q63 and Q65 include explicit interpretation policies.'
 ],questions});
await fs.writeFile(`data/papers/${slug}.json`,JSON.stringify(paper,null,2)+'\n');
// Compare every position against the FULL book, not only year tags; retain candidates for audit.
const tokens=s=>new Set(String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').split(' ').filter(w=>w.length>2));
const similarity=(a,b)=>{const x=tokens(a),y=tokens(b);return [...x].filter(t=>y.has(t)).length/Math.max(1,new Set([...x,...y]).size);};
const fullSearch=questions.map(q=>({number:q.paperQuestionNumber,selected:q.source.copiedFrom,
 candidates:all.map(b=>({id:b.id,year:b.year,similarity:similarity(q.text+' '+q.code,b.text+' '+b.code)})).sort((a,b)=>b.similarity-a.similarity).slice(0,4)}));
const used=new Set(questions.map(q=>q.source.copiedFrom?.questionId));
const duplicates={5:[11,21],11:[13,17],13:[20,40],21:[18,33],30:[5,32]};
const audit={identity:{year:'2002',paper:'CS',setNum:'',visibleHeader:'GATE - 2002 / COMPUTER SCIENCE & ENGINEERING',textLayerHeader:'GATE - 2001',physicalFilename:'2002.pdf',sourceSha256},questions:70,
 copied:questions.filter(q=>q.source.copiedFrom).length,partiallyCopied:[...partial],added:questions.filter(q=>!q.source.copiedFrom).length,bookSearchCount:all.length,yearTagged:book.length,
 manualReview:[...manual],madeEasyKeyChecks:Object.keys(keys).length,discussionReviews:[...reviewedGO],corrections,
 duplicateRepresentations:Object.fromEntries(Object.entries(duplicates).map(([n,is])=>[n,is.map(i=>book[i].id)])),
 crossYearMatches:questions.filter(q=>q.source.copiedFrom&&q.source.copiedFrom.year!=='2002').map(q=>({number:q.paperQuestionNumber,...q.source.copiedFrom})),
 excludedYearTagged:book.filter(q=>!used.has(q.id)).map(q=>({id:q.id,text:q.text,reason:Object.values(duplicates).flat().some(i=>book[i].id===q.id)?'duplicate representation':'not in selected source paper'})),
 fullSearch,coverage:questions.map(q=>({number:q.paperQuestionNumber,originalLabel:q.originalLabel,pages:q.source.pdfPages,copiedFrom:q.source.copiedFrom,status:q.verificationStatus,issues:q.source.issues}))};
await fs.writeFile(`${base}/content-audit.json`,JSON.stringify(audit,null,2));
console.log(JSON.stringify({questions:audit.questions,copied:audit.copied,partial:[...partial],added:audit.added,manual:[...manual],keyChecks:audit.madeEasyKeyChecks,crossYear:audit.crossYearMatches},null,2));
