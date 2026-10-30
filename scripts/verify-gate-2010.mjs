import {selectYearPaper,beginSelectedPaper,reviewQuestion,saveSelfAssessment} from './mock-browser-helpers.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import puppeteer from 'puppeteer';
import AdmZip from 'adm-zip';
import {questionAssetPaths} from '../src/lib/year-paper-assets.mjs';
const require=createRequire(import.meta.url);require('@next/env').loadEnvConfig(process.cwd(),true,{info(){},error(){}});
const {MongoClient}=require('mongoose').mongo,origin='http://127.0.0.1:3000',slug='gate-cs-2010';
const paper=JSON.parse(await fs.readFile(`data/papers/${slug}.json`,'utf8')),attempts=[];
const secret=/correctOptions|referenceAnswer|answerSources|copiedFrom|natAnswer|tokenHash|gateOverflowUrl/;
let cookie='',browser;
async function api(url,{method='GET',body,token,status=200}={}){
 const r=await fetch(origin+url,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const data=await r.json();assert.equal(r.status,status,JSON.stringify(data));return data;
}
const create=async(year='2010')=>{const r=await api('/api/gatemock/attempts',{method:'POST',body:{mode:'year',year,examPaper:'CS'}});attempts.push(r.attempt.id);return r;};
try {
 const check=await fetch(origin+'/api/gatemock/admin');
 if(check.status===401){const r=await fetch(origin+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:process.env.APP_PASSWORD})});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];}
 const catalog=await api('/api/gatemock/catalog');assert.equal(catalog.count,2647);assert.doesNotMatch(JSON.stringify(catalog),secret);
 for(const [year,count] of [['2000',69],['2001',70],['2002',70],['2003',90],['2004',90],['2005',90],['2006',85],['2010',65]]){const p=catalog.years.find(p=>p.id===`${year}|CS|`);assert.equal(p.available,count);assert.equal(p.coverage.ready,true);}
 const live=await create(),{id}=live.attempt,token=live.token;
 assert.equal(live.attempt.totalMarks,100);assert.equal(live.attempt.durationMinutes,180);assert.equal(live.attempt.negativeFraction,1/3);assert.equal(live.attempt.questions.length,65);assert.equal(live.attempt.exact,true);assert.doesNotMatch(JSON.stringify(live.attempt),secret);
 await api(`/api/gatemock/attempts/${id}`,{token:'0'.repeat(64),status:404});
 await api(`/api/gatemock/attempts/${id}/assessment`,{method:'POST',token,body:{revision:0,key:paper.questions[33].key,marks:1},status:400});
 const state={...live.attempt.state,responses:paper.questions.map(q=>({key:q.key,value:q.correctOptions.length?q.correctOptions:['A']})),marked:[paper.questions[0].key],currentIndex:64};
 await api(`/api/gatemock/attempts/${id}`,{method:'PUT',token,body:{revision:0,state:{...state,responses:[{key:paper.questions[0].key,value:'written'}]}},status:400});
 await api(`/api/gatemock/attempts/${id}`,{method:'PUT',token,body:{revision:0,state}});
 await api(`/api/gatemock/attempts/${id}`,{method:'PUT',token,body:{revision:0,state},status:409});
 const resume=await api(`/api/gatemock/attempts/${id}`,{token});assert.deepEqual(resume.attempt.state,state);assert.doesNotMatch(JSON.stringify(resume.attempt),secret);
 const result=await api(`/api/gatemock/attempts/${id}`,{method:'POST',token,body:{revision:1,state}});
 assert.equal(result.attempt.result.score,92);assert.equal(result.attempt.result.ungraded,4);assert.ok(result.attempt.result.entries.every(e=>e.referenceAnswer));
 const assessed=await api(`/api/gatemock/attempts/${id}/assessment`,{method:'POST',token,body:{revision:2,key:paper.questions[33].key,marks:.5}});assert.equal(assessed.attempt.result.score,92.5);
 await api(`/api/gatemock/attempts/${id}/assessment`,{method:'POST',token,body:{revision:3,key:paper.questions[33].key,marks:3},status:400});
 const frozen=await api(`/api/gatemock/attempts/${id}`,{method:'PUT',token,body:{revision:3,state:{...state,responses:[]}}});assert.equal(frozen.attempt.state.responses.length,65);
 const linked=await create(),ls={...linked.attempt.state,responses:[{key:paper.questions[0].key,value:['B']},{key:paper.questions[25].key,value:['B']},{key:paper.questions[51].key,value:['A']},{key:paper.questions[52].key,value:['C']}]};
 const lr=await api(`/api/gatemock/attempts/${linked.attempt.id}`,{method:'POST',token:linked.token,body:{revision:0,state:ls}});assert.equal(lr.attempt.result.score,-1.6667);assert.equal(lr.attempt.result.entries[52].status,'linked-ineligible');
 const expired=await create();const db=new MongoClient(process.env.MONGODB_URI);try{await db.connect();await db.db().collection('mockattempts').updateOne({_id:expired.attempt.id},{$set:{expiresAt:new Date(Date.now()-1000)}});}finally{await db.close();}
 const ex=await api(`/api/gatemock/attempts/${expired.attempt.id}`,{token:expired.token});assert.ok(ex.attempt.finishedAt);assert.equal(ex.attempt.result.score,0);
 // The new all-MCQ paper must preserve older descriptive responses and server choice limits.
 const older=JSON.parse(await fs.readFile('data/papers/gate-cs-2000.json','utf8')),old=await create('2000');
 const written={...old.attempt.state,responses:older.questions.slice(49,64).map(q=>({key:q.key,value:'Saved proof\n  with indentation.'}))};
 for(const method of ['PUT','POST'])await api(`/api/gatemock/attempts/${old.attempt.id}`,{method,token:old.token,body:{revision:0,state:{...written,responses:[...written.responses,{key:older.questions[64].key,value:'sixteenth'}]}},status:400});
 await api(`/api/gatemock/attempts/${old.attempt.id}`,{method:'PUT',token:old.token,body:{revision:0,state:written}});
 const or=await api(`/api/gatemock/attempts/${old.attempt.id}`,{token:old.token});assert.deepEqual(or.attempt.state.responses,written.responses);assert.doesNotMatch(JSON.stringify(or.attempt),secret);
 for(const [query,file] of [['format=pdf&theme=dark','dark.pdf'],['format=pdf&theme=light','print.pdf'],['format=key','solutions.pdf'],['format=zip','zip']]){
  const r=await fetch(origin+`/api/gatemock/papers/${slug}/export?`+query,{headers:cookie?{Cookie:cookie}:{}});assert.equal(r.status,200);const bytes=Buffer.from(await r.arrayBuffer());
  if(file==='zip'){const zip=new AdmZip(bytes);assert.equal(zip.getEntries().length,2);assert.deepEqual(zip.readFile('GATE-CS-2010-Questions.pdf'),await fs.readFile(`output/pdf/${slug}.dark.pdf`));assert.deepEqual(zip.readFile('GATE-CS-2010-Answers-and-Solutions.pdf'),await fs.readFile(`output/pdf/${slug}.solutions.pdf`));}
  else assert.deepEqual(bytes,await fs.readFile(`output/pdf/${slug}.${file}`));
 }
 console.log('API passed: source coverage, secrecy, all saved responses, resume, submission, penalties, linked gating, self-assessment, expiry, legacy written/choice limits, and four matching downloads.');
 await fs.mkdir('tmp/gate2010/browser',{recursive:true});browser=await puppeteer.launch({headless:true});const page=await browser.newPage();page.setDefaultTimeout(60000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 if(cookie){const i=cookie.indexOf('=');await browser.setCookie({name:cookie.slice(0,i),value:cookie.slice(i+1),url:origin});}
 page.on('console',message=>{if(message.type()==='error')console.log('Browser console:',message.text());});
 await page.setViewport({width:1440,height:1000});await page.goto(origin+`/gatemock?paper=${slug}`,{waitUntil:'domcontentloaded'});
 try{await selectYearPaper(page,'2010');}catch(error){await page.screenshot({path:'tmp/gate2010/browser/start-failure.png',fullPage:true});console.log('Browser start:',await page.evaluate(()=>({url:location.href,text:document.body.innerText.slice(0,3000)})),errors);throw error;}
 await page.screenshot({path:'tmp/gate2010/browser/catalog.png',fullPage:true});
 const response=page.waitForResponse(r=>r.url().endsWith('/api/gatemock/attempts')&&r.request().method()==='POST');await beginSelectedPaper(page);const ui=await(await response).json();attempts.push(ui.attempt.id);
 await page.waitForSelector('input[type=radio]');await page.click('input[type=radio]');await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Mark for Review & Next').click());
 for(let n=1;n<=65;n++){
  const tab={26:'Two-mark',48:'Common',52:'Linked',56:'General Aptitude'}[n];if(tab)await page.evaluate(t=>[...document.querySelectorAll('[role=tab]')].find(e=>e.textContent.includes(t)).click(),tab);
  await page.evaluate(n=>document.querySelector(`button[aria-label^="Question ${n},"]`).click(),n);
  await page.waitForFunction(key=>{const e=document.querySelector(`[data-question-key="${key}"]`);return e&&e.querySelector('[data-math-ready="true"]');},{},paper.questions[n-1].key);
  assert.equal(await page.$$eval('mjx-merror',es=>es.length),0,'Math Q'+n);
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-question-key] img')].every(im=>im.complete&&im.naturalWidth>0));
  assert.doesNotMatch(await page.$eval('[data-question-key]',e=>e.textContent),/Diagram unavailable/,'Diagram placeholder Q'+n);
  const expectedImages=questionAssetPaths(paper.questions[n-1]).length;
  assert.equal(await page.$$eval('[data-question-key] img',es=>es.length),expectedImages,'Missing diagram Q'+n);
  if([1,6,9,11,17,19,21,22,23,26,28,31,32,33,34,35,36,42,44,45,46,48,49,50,52,53,54,55,56,61,62,63,65].includes(n))await page.screenshot({path:`tmp/gate2010/browser/q${n}.png`});
 }
 await page.evaluate(()=>[...document.querySelectorAll('[role=tab]')].find(e=>e.textContent.includes('Two-mark')).click());
 await page.evaluate(()=>document.querySelector('button[aria-label^="Question 34,"]').click());await page.waitForFunction(()=>document.querySelector('[data-question-key="yearpaper:gate-cs-2010:34"]'));
 await page.click('input[type=radio]');await page.waitForFunction(()=>[...document.querySelectorAll('[role=status]')].some(e=>e.textContent==='Saved'));
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('input[type=radio]:checked');assert.equal(await page.$eval('[data-question-key]',e=>e.dataset.questionKey),'yearpaper:gate-cs-2010:34');
 await page.click('[aria-label="Open scientific calculator"]');await page.waitForSelector('[aria-label="Close calculator"]');await page.screenshot({path:'tmp/gate2010/browser/calculator.png'});await page.click('[aria-label="Close calculator"]');
 await page.click('[aria-label="Submit test"]');await page.waitForSelector('dialog[open]');await page.evaluate(()=>[...document.querySelectorAll('dialog button')].find(e=>e.textContent==='Confirm submit').click());await page.waitForFunction(()=>document.body.textContent.includes('Your result & solutions'));
 await reviewQuestion(page,34);await page.type('[aria-label="Self-assessed marks Q34"]','0.5');await saveSelfAssessment(page);await page.waitForFunction(()=>document.body.textContent.includes('1 responses self-assessed'));
 await page.screenshot({path:'tmp/gate2010/browser/review.png',fullPage:true});
 await page.evaluate(()=>[...document.querySelectorAll('button')].find(e=>e.textContent==='Choose another paper →').click());await page.setViewport({width:390,height:844});await page.screenshot({path:'tmp/gate2010/browser/mobile.png',fullPage:true});assert.deepEqual(errors,[]);
 await fs.writeFile('data/backups/gate-2010/live-verification.json',JSON.stringify({apiPassed:true,browserPassed:true,allQuestionScreens:65,questionMathErrors:0,imageErrors:0,pageErrors:errors,downloadsMatched:4,automaticMaximum:92,manualReview:4},null,2));
 console.log('Browser passed: all 65 questions, math, images, review markers, autosave, refresh/resume, calculator, submission, self-assessment, desktop and mobile.');
} finally {
 if(browser)await browser.close();const db=new MongoClient(process.env.MONGODB_URI);try{await db.connect();await db.db().collection('mockattempts').deleteMany({_id:{$in:attempts}});}finally{await db.close();}
}
