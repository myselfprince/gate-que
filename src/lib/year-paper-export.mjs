import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {PDFDocument} from 'pdf-lib';
import AdmZip from 'adm-zip';
import {load} from 'cheerio';
import {exportQuestionPdf} from './pdf-export.mjs';
import {buildAnswerKey} from './answer-key.mjs';
import {escapeLatex} from './latex-source.mjs';
import {validateYearPaper} from './year-papers.mjs';

const run=promisify(execFile), active=new Map();
export async function exportYearPaper(paper,theme='dark') {
  validateYearPaper(paper);
  if(!['dark','light'].includes(theme))throw new Error('Choose a valid PDF theme.');
  const digest=createHash('sha256').update('year-paper-layout-v4').update(JSON.stringify(paper)).digest('hex');
  const key=`${paper.slug}-${theme}-${digest}`;
  if(active.has(key))return active.get(key);
  const job=build(paper,theme,digest);
  active.set(key,job);
  try{return await job;}finally{active.delete(key);}
}
async function build(paper,theme,digest){
  const directory=path.resolve('output/pdf');await fs.mkdir(directory,{recursive:true});
  const base=path.join(directory,paper.slug),pdfPath=`${base}.${theme==='light'?'print':'dark'}.pdf`;
  const keyPath=`${base}.solutions.pdf`,manifestPath=`${pdfPath}.json`;
  try{
    const manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
    if(manifest.digest===digest)return {slug:paper.slug,pdf:await fs.readFile(pdfPath),answerKey:await fs.readFile(keyPath),report:manifest.report,pdfPath,keyPath};
  }catch{/* Compile missing or changed exports. */}
  const exportQuestions=paper.questions.map(q=>q.exportInstruction?{...q,text:q.exportInstruction+'\n\n'+q.text}:q);
  const result=await exportQuestionPdf({subject:'Year Papers',chapter:paper.title,questions:exportQuestions,
    pdfSettings:{theme,fontSize:18,minFontSize:10,titleText:`${paper.title} - ${paper.totalMarks} marks - ${paper.durationMinutes} minutes`,titleMode:'first',showSolutions:false,showGateOverflow:false,includeAnswerKey:false,workingLines:2,showWatermark:true}},
    {checkpointDirectory:path.resolve('tmp/year-paper-export',paper.slug,theme)});
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'gate-year-key-'));
  let answerKey;
  try{
    const questions=paper.questions.map(q=>({...q,questionType:'SUBJECTIVE',isProof:true,correctOptions:[],answerDisposition:'standard',natAnswer:
      `${q.awardMarksToAll?'Marks to All - ':q.answerDisposition==='none-correct'?'None of the options is correct - ':q.manualReview?`Disputed item${q.correctOptions.length?`; conventional key (${q.correctOptions.join(', ')})`:''} - `:q.correctOptions.length?`(${q.correctOptions.join(', ')}) - `:''}${q.referenceAnswer || ''}`}));
    const tex=buildAnswerKey({subject:paper.title,chapter:'Answers and worked reference solutions',questions,pdfSettings:{theme:'light'}})
      .replace('Only available stored answers are included. Missing answers are marked explicitly.',paper.instructions.map(t=>escapeLatex(t)+'\\par\\smallskip').join('\n'))
      .replace(/(\\item\[\\textbf\{Q(\d+)\}\]\s)([\s\S]*?)(?=\\typeout\{GATEANSWER:|\\end\{enumerate\})/g,(match,start,number,body)=>{
        const q=paper.questions[Number(number)-1];
        if(!q.answerSources)return match;
        const key=q.answerSources.find(s=>s.kind==='made-easy-key');
        const notes=`Authored reference; ${q.verificationStatus}.${key?` Made Easy: ${path.basename(key.file)}, PDF p. ${key.pdfPage}, item ${key.question}, printed key ${key.printed}.`:''}`;
        const discussionId=new URL(q.gateOverflowUrl).pathname.split('/')[1];
        return start+body+'\\par\\smallskip{\\footnotesize '+escapeLatex(notes)+'\\par Reference: \\href{'+q.gateOverflowUrl+'}{GATE Overflow discussion '+escapeLatex(discussionId)+'}}\\par\n';
      })
      .replace(/(\\item\[\\textbf\{Q\d+\}\]\s)([\s\S]*?)(?=\\typeout\{GATEANSWER:|\\end\{enumerate\})/g,'$1\\begin{minipage}[t]{\\linewidth}\n$2\\end{minipage}\\par\\medskip\n');
    await fs.writeFile(path.join(temp,'solutions.tex'),tex);
    await run(process.env.PDFLATEX_BIN||'pdflatex',['-no-shell-escape','-halt-on-error','-interaction=nonstopmode','solutions.tex'],{cwd:temp,windowsHide:true,timeout:60000,maxBuffer:10*1024*1024});
    answerKey=await fs.readFile(path.join(temp,'solutions.pdf'));
    await fs.mkdir(path.resolve('tmp/year-paper-export',paper.slug),{recursive:true});
    await fs.writeFile(path.resolve('tmp/year-paper-export',paper.slug,'solutions-preview.pdf'),answerKey);
    const {stdout}=await run(process.env.PDFTOTEXT_BIN||'pdftotext',['-bbox',path.join(temp,'solutions.pdf'),'-'],{windowsHide:true,timeout:60000,maxBuffer:10*1024*1024});
    const xml=load(stdout,{xmlMode:true});
    for(const page of xml('page').toArray()){
      const width=Number(xml(page).attr('width')),height=Number(xml(page).attr('height'));
      for(const word of xml(page).find('word').toArray()){
        const node=xml(word);
        if(Number(node.attr('xMin')) < -1 || Number(node.attr('yMin')) < -1 || Number(node.attr('xMax')) > width+1 || Number(node.attr('yMax')) > height+1)throw new Error(`Solution text exceeds page bounds: ${node.text()} (${node.attr('xMin')},${node.attr('xMax')}; width ${width}).`);
      }
    }
    const labels=new Set(xml('word').toArray().map(w=>xml(w).text()));
    for(let i=1;i<=paper.questions.length;i++)if(!labels.has(`Q${i}`))throw new Error(`Solution Q${i} is missing from the exported PDF.`);
  }finally{await fs.rm(temp,{recursive:true,force:true});}
  const report={...result.report,solutionPages:(await PDFDocument.load(answerKey)).getPageCount()};
  await fs.writeFile(pdfPath,result.pdf);await fs.writeFile(keyPath,answerKey);
  await fs.writeFile(manifestPath,JSON.stringify({digest,report},null,2));
  return {slug:paper.slug,pdf:result.pdf,answerKey,report,pdfPath,keyPath};
}
export function yearPaperZip(result){
  const name=(result.slug||path.basename(result.pdfPath).replace(/\.(dark|print)\.pdf$/,'')).toUpperCase();
  if(!/^[A-Z0-9-]+$/.test(name))throw new Error('Invalid paper archive name.');
  const zip=new AdmZip();zip.addFile(`${name}-Questions.pdf`,result.pdf);zip.addFile(`${name}-Answers-and-Solutions.pdf`,result.answerKey);return zip.toBuffer();
}
