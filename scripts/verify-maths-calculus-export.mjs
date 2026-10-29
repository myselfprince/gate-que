import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import AdmZip from 'adm-zip';
import puppeteer from 'puppeteer';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';
import { collectLatexImages } from '../src/lib/latex-source.mjs';
import { loadWorkspaceQuestions } from './helpers/load-workspace.mjs';

const [input,outputDir]=process.argv.slice(2);
if(!input || !outputDir) throw new Error('Provide the verified database read-back JSON and an output directory.');
const payload=JSON.parse(await fs.readFile(input,'utf8'));
assert.equal(payload.questions.length,42);
await fs.mkdir(outputDir,{recursive:true});
const origin='http://127.0.0.1:3137';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--port','3137','--hostname','127.0.0.1'],{
  env:{...process.env,AUTH_REQUIRED:'false'},windowsHide:true,stdio:['ignore','pipe','pipe'],
});
let logs='';let browser;
server.stdout.on('data',(chunk)=>{logs=(logs+chunk).slice(-16000);});
server.stderr.on('data',(chunk)=>{logs=(logs+chunk).slice(-16000);});
const post=(route,body)=>fetch(`${origin}/api/${route}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(240000)});
try {
  let ready=false;
  for(let i=0;i<80;i++) {
    if(server.exitCode!==null) throw new Error(logs);
    try {ready=(await fetch(`${origin}/api/auth/session`)).ok;} catch { /* wait for the local QA server */ }
    if(ready)break;
    await new Promise((resolve)=>setTimeout(resolve,250));
  }
  assert.ok(ready,'QA server did not become ready');
  for(const file of collectLatexImages(payload.questions)) {
    const response=await fetch(`${origin}/${encodeURIComponent(payload.subject)}/${encodeURIComponent(payload.chapter)}/${encodeURIComponent(file)}`);
    assert.equal(response.status,200,`Missing image ${file}`);
  }
  const latexResponse=await post('export-latex',payload);
  assert.equal(latexResponse.status,200,await latexResponse.clone().text());
  const latexBytes=Buffer.from(await latexResponse.arrayBuffer());
  const latexZip=new AdmZip(latexBytes);
  assert.equal(latexZip.readAsText('main.tex'),buildQuestionPages(payload));
  const portable=JSON.parse(latexZip.readAsText('chapter.json'));
  assert.equal(portable.questions.length,42);
  // Export validation makes the existing CS default explicit in chapter.json.
  assert.deepEqual(portable.questions,payload.questions.map(q=>({...q,examPaper:q.examPaper||'CS'})));
  assert.ok(portable.questions.every(q=>q.source.answerKeyPdfPage===3 && (q.questionType==='NAT' ? Boolean(q.natAnswer) : q.correctOptions.length>0)));
  assert.equal(latexZip.getEntries().filter((entry)=>entry.entryName.startsWith('images/')).length,0);
  await fs.writeFile(path.join(outputDir,'Maths-Calculus-Editable-LaTeX.zip'),latexBytes);
  const pdfResponse=await post('export-pdf',payload);
  assert.equal(pdfResponse.status,200,pdfResponse.status===200?'':`${await pdfResponse.text()}\n${logs}`);
  const pdfBytes=Buffer.from(await pdfResponse.arrayBuffer());
  const pdfZip=new AdmZip(pdfBytes);
  assert.equal(pdfZip.getEntries().length,3);
  await fs.writeFile(path.join(outputDir,'Maths-Calculus-Black-PDFs.zip'),pdfBytes);
  for(const entry of pdfZip.getEntries()) await fs.writeFile(path.join(outputDir,entry.entryName),entry.getData());

  browser=await puppeteer.launch({headless:true});
  const page=await browser.newPage();
  await page.setViewport({width:1900,height:1100,deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',(error)=>errors.push(error.message));
  await page.setRequestInterception(true);
  page.on('request',async(request)=>{
    const url=new URL(request.url());
    if(url.pathname.startsWith('/api/')) {
      // Persistence is mocked only for editor rendering QA; no preference or
      // autosave requests from this browser reach the actual database.
      const data=url.pathname==='/api/preferences'?{lastSubject:payload.subject,lastChapter:payload.chapter}:{...payload,lockCount:0};
      await request.respond({status:200,contentType:'application/json',body:JSON.stringify({success:true,data})});
    } else await request.continue();
  });
  await page.goto(origin,{waitUntil:'networkidle2',timeout:42000});
  await loadWorkspaceQuestions(page);
  await page.waitForSelector('#question-42',{timeout:30000});
  await page.waitForFunction(()=>Boolean(window.MathJax?.typesetPromise),{timeout:42000});
  await page.evaluate(async()=>{
    await window.MathJax.startup.promise;
    await window.MathJax.typesetPromise([document.getElementById('questions_container')]);
    await document.fonts.ready;
    await new Promise((resolve)=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  });
  const preview=await page.evaluate(()=>({
    questions:document.querySelectorAll('.question-card').length,
    mathErrors:[...document.querySelectorAll('mjx-merror')].map((element)=>element.textContent),
    unknownMathCommands:[...document.querySelectorAll('mjx-container')].filter(element=>/\\[A-Za-z]+/.test(element.textContent)).map(element=>element.textContent),
    expressions:document.querySelectorAll('mjx-container').length,
    rawMath:[...document.querySelectorAll('.preview-pane')].filter((element)=>/\$[^$]+\$/.test(element.textContent)).length,
    brokenImages:[...document.querySelectorAll('.preview-pane img')].filter((element)=>!element.complete||element.naturalWidth===0).map((element)=>element.src),
    overflowingQuestions:[...document.querySelectorAll('.preview-pane')].filter((element)=>element.scrollWidth>element.clientWidth+2).map((element)=>element.id),
  }));
  assert.equal(preview.questions,42);
  assert.ok(preview.expressions>0);
  assert.deepEqual(preview.mathErrors,[]);
  assert.deepEqual(preview.unknownMathCommands,[]);
  assert.equal(preview.rawMath,0);
  assert.deepEqual(preview.brokenImages,[]);
  assert.deepEqual(preview.overflowingQuestions,[]);
  assert.deepEqual(errors,[]);
  await page.evaluate(()=>{
    for(const element of document.querySelectorAll('[style]')) {
      if(['sticky','fixed'].includes(element.style.position)) element.style.position='static';
    }
  });
  for(const number of Array.from({length:42},(_,i)=>i+1)) {
    const element=await page.$(`#question-${number} .question-card`);
    await element.screenshot({path:path.join(outputDir,`preview-7-${number}.png`)});
  }
  const result={pdfStatus:200,pdfParts:3,questions:42,latexMatchesPdfLayout:true,portableImages:0,preview,errors};
  await fs.writeFile(path.join(outputDir,'export-qa.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
} finally {
  await fs.writeFile(path.join(outputDir,'export-server.log'),logs);
  if(browser)await browser.close();
  server.kill();
  if(server.exitCode===null)await once(server,'exit');
}
