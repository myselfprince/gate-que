import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {additions,objectiveAnswers,descriptive} from '../data/papers/gate-cs-2000-supplement.mjs';
const book=JSON.parse(await fs.readFile('data/backups/gate-2000/book-2000.json','utf8'));
const reference=JSON.parse(await fs.readFile('data/backups/gate-2000/reference-2000.json','utf8'));
// Original position -> index in the immutable, read-only inspection snapshot.
const copyMap={1:3,2:23,4:5,5:6,6:21,8:15,10:14,11:9,12:10,13:8,14:26,15:17,16:11,17:12,18:32,21:28,22:38,23:37,25:39,28:1,29:2,30:0,31:7,33:18,34:19,35:20,36:16,37:22,38:24,39:27,41:4,42:25,43:13,45:30,46:29,47:33,48:36,49:35};
const assetSubject='Year Papers',assetChapter='GATE CS 2000';
const assetDir=path.join('public',assetSubject,assetChapter);
await fs.mkdir(assetDir,{recursive:true});
const questions=[];
for(let number=1;number<=69;number++){
 const source=copyMap[number]!==undefined?book[copyMap[number]]:null;
 const q=structuredClone(source||additions[number]||descriptive[number]);
 if(!q)throw new Error(`Missing Q${number}`);
 const historical=number<=23?`1.${number}`:number<=49?`2.${number-23}`:String(number-47);
 const link=reference.find(r=>r.title.match(/Question:\s*([\d.]+)/)?.[1]===historical);
 if(!link)throw new Error(`Missing reference Q${number}`);
 if(source){
  const names=(q.diagram||'').split(',').map(s=>s.trim()).filter(Boolean);
  const rename=new Map();
  for(const name of new Set([...names,...['optA','optB','optC','optD'].flatMap(k=>q[k]?.startsWith('IMG:')?[q[k].slice(4).trim()]:[])])){
   const dest=`q${number}-${name}`;rename.set(name,dest);
   await fs.copyFile(path.join('public',q.subject,q.chapter,name+(q.ext||'.png')),path.join(assetDir,dest+(q.ext||'.png')));
  }
  q.diagram=names.map(n=>rename.get(n)).join(',');
  for(const k of ['optA','optB','optC','optD'])if(q[k]?.startsWith('IMG:'))q[k]='IMG:'+rename.get(q[k].slice(4).trim());
 }
 // Year-paper corrections never touch the source documents or their assets.
 if(number===11)q.code='struct node {\n  int i;\n  float j;\n};\nstruct node *s[10];';
 if(number===13){q.text='The most appropriate matching for the following pairs is:\nX: depth-first search; Y: breadth-first search; Z: sorting.\n1: heap; 2: queue; 3: stack.';q.diagram='';q.optA='X-1, Y-2, Z-3';q.optB='X-2, Y-1, Z-3';q.optC='X-3, Y-2, Z-1';q.optD='X-2, Y-3, Z-1';}
 if(number===14){q.optA='(1 2 (4 5 6 7))';q.optB='(1 ((2 3 4) 5 6) 7)';q.optC='(1 (2 3 4) (5 6 7))';q.optD='(1 (2 3 NULL) (4 5))';}
 if(number===17){q.text="Consider the following C declaration.\n[CODE]\nAssume short, float and long occupy 2, 4 and 8 bytes respectively. Ignoring alignment, what is the memory requirement for t?";q.code='struct {\n  short x[5];\n  union { float y; long z; } u;\n} t;';}
 if(number===29)q.optD=String.raw`$S\notin P(S)$`;
 if(number===35)q.text=q.text.replace('After the clock cycles','After three clock cycles');
 if(number===37){q.optA='$X=1.0, Y=1.0$';q.optB='$X=1.0, Y=0.0$';q.optC='$X=0.0, Y=1.0$';q.optD='$X=0.0, Y=0.0$';q.text+=' on a computer using 32-bit floating-point numbers.';}
 if(number===43)q.marks='2';
 const [correct,explanation]=objectiveAnswers[number]||[];
 const chapter=number<=23?'Section A - one mark':number<=49?'Section A - two marks':'Section B - descriptive';
 const {chapterId,source:bookSource,...fields}=q;
 questions.push({...fields,id:`gate-cs-2000-q${String(number).padStart(2,'0')}`,key:`yearpaper:gate-cs-2000:${number}`,datasetId:'gate-cs-2000',
  subject:q.subject||link.subjects[0]||'Computer Science',chapter,assetSubject,assetChapter,year:'2000',examPaper:'CS',setNum:'',
  paperQuestionNumber:String(number),originalLabel:historical,marks:String(number<=23?1:number<=49?2:5),
  questionType:number<=49?'MCQ':'SUBJECTIVE',correctOptions:correct?[correct]:[],natAnswer:'',isBlank:false,
  referenceAnswer:explanation||q.referenceAnswer,manualReview:[29,31].includes(number),
  sectionId:number<=23?'a1':number<=49?'a2':'b',sectionName:chapter,sectionLimit:number>=50?15:undefined,
  gateOverflowUrl:link.url,source:{file:'D:/Gate PYQs Year Wise - PDFs/2000.pdf',originalLabel:historical,
   copiedFrom:source?{chapterId:source.chapterId,questionId:source.id,subject:source.subject,chapter:source.chapter}:null,
   bookSource:bookSource||null,answerBasis:source?.correctOptions?.length?'Made Easy key and independent review':'Reference discussion and independent worked solution',referenceUrl:link.url},
 });
}
const paper={slug:'gate-cs-2000',datasetId:'gate-cs-2000',title:'GATE CS 2000',year:'2000',examPaper:'CS',setNum:'',
 questionCount:69,totalMarks:150,availableMarks:175,durationMinutes:180,negativeFraction:0,verified:true,
 sourceUrl:'https://gateoverflow.in/previous-years',sourceSha256:createHash('sha256').update(await fs.readFile('D:/Gate PYQs Year Wise - PDFs/2000.pdf')).digest('hex'),
 instructions:['Original 2000 format: 23 one-mark MCQs, 26 two-mark MCQs, and 20 five-mark descriptive questions. Attempt any 15 descriptive questions. Maximum: 150 marks in 180 minutes.',
 'General Aptitude was not part of this paper. The modern aptitude section has 10 questions worth 15 marks; it is not appended to this historical paper.',
 'The supplied PDF states no negative-marking rule. This practice reconstruction uses zero penalty, not an asserted official historical penalty.',
 'Q29 and Q31 have no universally correct option as written. Their reference explanations are included; these 4 marks require manual review. Q24 uses mathematically correct D despite a conflicting displayed web key.',
 'Written responses are saved. Descriptive answers and disputed items need self-assessment after submission; automatic score covers the other 47 MCQs (71 marks).'],
 questions};
await fs.writeFile('data/papers/gate-cs-2000.json',JSON.stringify(paper,null,2)+'\n');
console.log(JSON.stringify({questions:questions.length,copied:questions.filter(q=>q.source.copiedFrom).length,added:questions.filter(q=>!q.source.copiedFrom).length,automatic:questions.filter(q=>q.correctOptions.length).length,availableMarks:questions.reduce((s,q)=>s+Number(q.marks),0)},null,2));
