import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import puppeteer from 'puppeteer';
import {buildYearPaperPrompt} from '../src/lib/gate-year-paper-tracker.mjs';
const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd(),true,{info(){},error(){}});
const {MongoClient,BSON}=require('mongoose').mongo;
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
const origin='http://localhost:3000',out=path.resolve('tmp/gate-year-paper-tracker-qa');
await fs.mkdir(out,{recursive:true});
const digest=value=>createHash('sha256').update(BSON.EJSON.stringify(value)).digest('hex');
let browser,cookie='';
try{
  await client.connect();const db=client.db();
  const snapshot=async()=>({chapters:await db.collection('chapters').find({}).sort({_id:1}).toArray(),papers:await db.collection('yearpapers').find({}).sort({_id:1}).toArray()});
  const before=digest(await snapshot());
  const unauth=await fetch(origin+'/api/gateyearpaperpdf');
  if(unauth.status===401){
    const login=await fetch(origin+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:process.env.APP_PASSWORD})});
    assert.equal(login.status,200);cookie=login.headers.get('set-cookie').split(';')[0];
  }
  const response=await fetch(origin+'/api/gateyearpaperpdf',{headers:cookie?{Cookie:cookie}:{}});
  const data=await response.json();assert.equal(response.status,200,JSON.stringify(data));
  assert.equal(data.files.length,51);assert.equal(data.databaseAvailable,true);
  assert.equal(data.files.find(f=>f.filename==='2000.pdf').progress.complete,true);
  assert.equal(data.files.find(f=>f.filename==='DA 2025 set 2.pdf').examPaper,'CS');
  assert.equal(data.files.some(f=>f.filename.endsWith('.7z')),false);
  assert.equal(new Set(data.files.map(f=>buildYearPaperPrompt(f))).size,51);
  assert.doesNotMatch(JSON.stringify(data),/correctOptions|referenceAnswer|tokenHash|mongodb/);
  browser=await puppeteer.launch({headless:true});
  await browser.defaultBrowserContext().overridePermissions(origin,['clipboard-read','clipboard-write','clipboard-sanitized-write']);
  if(cookie){const at=cookie.indexOf('=');await browser.setCookie({name:cookie.slice(0,at),value:cookie.slice(at+1),url:origin});}
  const page=await browser.newPage();await page.setViewport({width:1536,height:1100});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/gateyearpaperpdf',{waitUntil:'networkidle2'});
  await page.waitForSelector('[data-filename="2001.pdf"]');
  await page.bringToFront();
  await page.evaluate(()=>{
    const original=navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText=async text=>{try{return await original(text);}catch(e){window.__clipboardError={name:e.name,message:e.message,focused:document.hasFocus()};throw e;}};
  });
  const completeCount=await page.$$eval('article input[type=checkbox]:checked',els=>els.length);
  await page.screenshot({path:path.join(out,'desktop.png'),fullPage:false});
  await page.click('[aria-label="Copy prompt for 2001.pdf"]');
  await page.waitForFunction(()=>document.querySelector('[role=status]').textContent.includes('Full prompt copied: 2001.pdf'));
  const text=await page.evaluate(()=>navigator.clipboard.readText());assert.match(text,/YEAR: 2001/);assert.match(text,/EXACT SOURCE PDF: D:\\Gate PYQs Year Wise - PDFs\\2001.pdf/);
  assert.equal(await page.$$eval('article input[type=checkbox]:checked',els=>els.length),completeCount,'Copying must not tick completion.');
  await page.type('[aria-label="Prompt set or session"]','2');
  assert.match(await page.$eval('textarea',el=>el.value),/SET \/ SESSION: 2/);
  await page.reload({waitUntil:'networkidle2'});await page.waitForSelector('[aria-label="Prompt set or session"]');
  assert.equal(await page.$eval('[aria-label="Prompt set or session"]',el=>el.value),'2');
  assert.ok(await page.$eval('[data-filename="2001.pdf"]',el=>el.textContent.includes('Prompt copied')));
  await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Copy next pending prompt →').click());
  await page.waitForFunction(()=>document.querySelector('[role=status]').textContent.includes('Full prompt copied: 1991.pdf'));
  await page.type('input[type=search]','2014');assert.equal(await page.$$eval('article[data-filename]',els=>els.length),3);
  await page.click('input[type=search]');await page.keyboard.down('Control');await page.keyboard.press('A');await page.keyboard.up('Control');await page.keyboard.press('Backspace');
  await page.select('label:has(select) select','IT');
  assert.equal(await page.$$eval('article[data-filename]',els=>els.length),5);
  await page.select('label:has(select) select','DA');assert.equal(await page.$$eval('article[data-filename]',els=>els.length),2);
  await page.select('label:has(select) select','all');
  await page.click('[aria-label="Copy prompt for DA 2025 set 2.pdf"]');
  await page.waitForFunction(()=>document.querySelector('[role=status]').textContent.includes('Full prompt copied: DA 2025 set 2.pdf'));
  const corrected=await page.evaluate(()=>navigator.clipboard.readText());assert.match(corrected,/PAPER: CS/);assert.match(corrected,/SET \/ SESSION: 2/);assert.match(corrected,/DA 2025 set 2\.pdf/);
  await page.screenshot({path:path.join(out,'identity-correction.png'),fullPage:false});
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('Clipboard denied');}}}));
  await page.click('[aria-label="Copy prompt for 2010.pdf"]');
  await page.waitForFunction(()=>document.querySelector('[role=status]').textContent.includes('Clipboard copy nahi hua'));
  assert.match(await page.$eval('textarea',el=>el.value),/YEAR: 2010/);
  assert.equal(await page.$eval('textarea',el=>el.selectionEnd-el.selectionStart),await page.$eval('textarea',el=>el.value.length));
  assert.equal(await page.$eval('[data-filename="2010.pdf"]',el=>el.textContent.includes('Prompt copied')),false);
  await page.evaluate(()=>{delete navigator.clipboard;});
  const session=await page.createCDPSession();await session.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:out});
  await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Download .txt').click());
  let downloaded='';for(let i=0;i<40;i++){try{downloaded=await fs.readFile(path.join(out,'2010.prompt.txt'),'utf8');break;}catch{await new Promise(r=>setTimeout(r,100));}}
  assert.match(downloaded,/EXACT SOURCE PDF: D:\\Gate PYQs Year Wise - PDFs\\2010.pdf/);
  await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Copy full prompt').click());
  await page.waitForFunction(()=>document.querySelector('[role=status]').textContent.includes('Full prompt copied: 2010.pdf'));
  await page.setViewport({width:390,height:844});await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:path.join(out,'mobile.png'),fullPage:false});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Mobile has horizontal overflow.');
  // Simulate unavailable DB status without changing any real database documents.
  await page.setRequestInterception(true);
  page.on('request',req=>req.url().endsWith('/api/gateyearpaperpdf')?req.respond({status:200,contentType:'application/json',body:JSON.stringify({...data,databaseAvailable:false,warning:'Database status is unavailable. Prompts still work.',files:data.files.map(f=>({...f,progress:{state:'unknown',complete:false,count:0,expected:null,label:'Database status unavailable'}}))})}):req.continue());
  await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='↻ Refresh folder & DB').click());
  await page.waitForFunction(()=>document.body.textContent.includes('Prompts still work.'));
  assert.equal(await page.$$eval('article input[type=checkbox]:checked',els=>els.length),0);
  assert.equal(await page.$eval('[aria-label="Copy prompt for 2001.pdf"]',el=>el.disabled),false);
  assert.deepEqual(errors,[]);
  const after=digest(await snapshot());assert.equal(before,after,'Tracker must not modify book questions or year papers.');
  const report={pdfs:51,uniquePrompts:51,completed:data.files.filter(f=>f.progress.complete).length,bookAndYearPapersUnchanged:true,checks:['authentication','live folder inventory','source identity correction','exact source-specific prompt','real clipboard','copy does not tick completion','persisted copy history and metadata','next pending prompt','year and paper filters','manual clipboard fallback','download prompt text','mobile layout','database-offline copying'],databaseBefore:before,databaseAfter:after};
  await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}catch(error){
  if(browser){const pages=await browser.pages();const page=pages.at(-1);await page.screenshot({path:path.join(out,'failure.png'),fullPage:false});console.log('Browser diagnostics:',await page.evaluate(()=>({statuses:[...document.querySelectorAll('[role=status]')].map(n=>n.textContent),clipboard:window.__clipboardError,url:location.href})));}
  throw error;
}finally{if(browser)await browser.close();await client.close();}
