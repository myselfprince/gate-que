import { selectYearPaper, beginSelectedPaper, reviewQuestion, saveSelfAssessment } from './mock-browser-helpers.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import puppeteer from 'puppeteer';
import AdmZip from 'adm-zip';
const require=createRequire(import.meta.url);require('@next/env').loadEnvConfig(process.cwd(),true,{info(){},error(){}});
const {MongoClient}=require('mongoose').mongo;
const origin='http://127.0.0.1:3000',paper=JSON.parse(await fs.readFile('data/papers/gate-cs-2005.json','utf8'));
const attempts=[];let cookie='',browser;
async function api(url,{method='GET',body,token,status=200}={}){
 const r=await fetch(origin+url,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const data=await r.json();assert.equal(r.status,status,JSON.stringify(data));return data;
}
try{
 const check=await fetch(origin+'/api/gatemock/admin');
 if(check.status===401){const r=await fetch(origin+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:process.env.APP_PASSWORD})});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];}
 const catalog=await api('/api/gatemock/catalog');assert.equal(catalog.count,2647);
 for(const [year,count] of [['2000',69],['2001',70],['2002',70],['2003',90],['2004',90],['2005',90]]){const p=catalog.years.find(p=>p.id===`${year}|CS|`);assert.equal(p.available,count);assert.equal(p.coverage.ready,true);}
 assert.doesNotMatch(JSON.stringify(catalog),/correctOptions|referenceAnswer|copiedFrom/);
 const created=await api('/api/gatemock/attempts',{method:'POST',body:{mode:'year',year:'2005',examPaper:'CS'}});
 const {id}=created.attempt,token=created.token;attempts.push(id);
 assert.equal(created.attempt.totalMarks,150);assert.equal(created.attempt.questions.length,90);assert.equal(created.attempt.durationMinutes,180);assert.equal(created.attempt.negativeFraction,.25);assert.equal(created.attempt.exact,true);
 const secret=/correctOptions|referenceAnswer|answerSources|copiedFrom|natAnswer|tokenHash|gateOverflowUrl/;
 assert.doesNotMatch(JSON.stringify(created.attempt),secret);
 await api(`/api/gatemock/attempts/${id}`,{token:'0'.repeat(64),status:404});
 await api(`/api/gatemock/attempts/${id}/assessment`,{method:'POST',token,body:{revision:0,key:paper.questions[60].key,marks:2},status:400});
 const state={...created.attempt.state,responses:paper.questions.map(q=>({key:q.key,value:q.correctOptions})),marked:[paper.questions[0].key],currentIndex:89};
 await api(`/api/gatemock/attempts/${id}`,{method:'PUT',token,body:{revision:0,state:{...state,responses:[{key:paper.questions[0].key,value:'written response'}]}},status:400});
 const saved=await api(`/api/gatemock/attempts/${id}`,{method:'PUT',token,body:{revision:0,state}});assert.equal(saved.attempt.state.responses.length,90);
 await api(`/api/gatemock/attempts/${id}`,{method:'PUT',token,body:{revision:0,state},status:409});
 const resumed=await api(`/api/gatemock/attempts/${id}`,{token});assert.deepEqual(resumed.attempt.state,state);assert.doesNotMatch(JSON.stringify(resumed.attempt),secret);
 const finished=await api(`/api/gatemock/attempts/${id}`,{method:'POST',token,body:{revision:1,state}});
 assert.equal(finished.attempt.result.score,137);assert.equal(finished.attempt.result.ungraded,7);assert.equal(finished.attempt.result.entries.length,90);assert.ok(finished.attempt.result.entries.every(e=>e.referenceAnswer));
 const assessed=await api(`/api/gatemock/attempts/${id}/assessment`,{method:'POST',token,body:{revision:2,key:paper.questions[60].key,marks:1.5}});assert.equal(assessed.attempt.result.score,138.5);
 await api(`/api/gatemock/attempts/${id}/assessment`,{method:'POST',token,body:{revision:3,key:paper.questions[60].key,marks:3},status:400});
 await api(`/api/gatemock/attempts/${id}/assessment`,{method:'POST',token,body:{revision:3,key:paper.questions[0].key,marks:1},status:400});
 const frozen=await api(`/api/gatemock/attempts/${id}`,{method:'PUT',token,body:{revision:3,state:{...state,responses:[]}}});assert.equal(frozen.attempt.state.responses.length,90);
 const linked=await api('/api/gatemock/attempts',{method:'POST',body:{mode:'year',year:'2005',examPaper:'CS'}});attempts.push(linked.attempt.id);
 const linkedState={...linked.attempt.state,responses:[
  {key:paper.questions[49].key,value:['E']},
  {key:paper.questions[80].key,value:['A']},{key:paper.questions[81].key,value:paper.questions[81].correctOptions},
  {key:paper.questions[82].key,value:paper.questions[82].correctOptions},{key:paper.questions[83].key,value:['B']},
 ]};
 const linkedSaved=await api(`/api/gatemock/attempts/${linked.attempt.id}`,{method:'PUT',token:linked.token,body:{revision:0,state:linkedState}});
 assert.deepEqual(linkedSaved.attempt.state.responses[0].value,['E']);
 const linkedResult=await api(`/api/gatemock/attempts/${linked.attempt.id}`,{method:'POST',token:linked.token,body:{revision:1,state:linkedState}});
 assert.equal(linkedResult.attempt.result.score,1); // -.5 -.5 +0 +2 +0
 assert.equal(linkedResult.attempt.result.entries[81].status,'linked-ineligible');
 assert.equal(linkedResult.attempt.result.entries[83].earned,0);
 for(const [query,file] of [['format=pdf&theme=dark','dark.pdf'],['format=pdf&theme=light','print.pdf'],['format=key','solutions.pdf'],['format=zip','zip']]){
  const r=await fetch(origin+'/api/gatemock/papers/gate-cs-2005/export?'+query,{headers:cookie?{Cookie:cookie}:{}});assert.equal(r.status,200);const bytes=Buffer.from(await r.arrayBuffer());
  if(file!=='zip')assert.deepEqual(bytes,await fs.readFile(`output/pdf/gate-cs-2005.${file}`));
  else {const zip=new AdmZip(bytes);assert.equal(zip.getEntries().length,2);assert.deepEqual(zip.readFile('GATE-CS-2005-Questions.pdf'),await fs.readFile('output/pdf/gate-cs-2005.dark.pdf'));assert.deepEqual(zip.readFile('GATE-CS-2005-Answers-and-Solutions.pdf'),await fs.readFile('output/pdf/gate-cs-2005.solutions.pdf'));}
 }
 const expiry=await api('/api/gatemock/attempts',{method:'POST',body:{mode:'year',year:'2005',examPaper:'CS'}});attempts.push(expiry.attempt.id);
 const connection=new MongoClient(process.env.MONGODB_URI);try{await connection.connect();await connection.db().collection('mockattempts').updateOne({_id:expiry.attempt.id},{$set:{expiresAt:new Date(Date.now()-1000)}});}finally{await connection.close();}
 const expired=await api(`/api/gatemock/attempts/${expiry.attempt.id}`,{token:expiry.token});assert.ok(expired.attempt.finishedAt);assert.equal(expired.attempt.result.score,0);
 // Regression for existing written papers and their server-enforced choice rule.
 const older=JSON.parse(await fs.readFile('data/papers/gate-cs-2002.json','utf8'));
 const previous=await api('/api/gatemock/attempts',{method:'POST',body:{mode:'year',year:'2002',examPaper:'CS'}});attempts.push(previous.attempt.id);
 const written={...previous.attempt.state,responses:older.questions.slice(50,65).map(q=>({key:q.key,value:'Saved proof\n  with code and spaces.'}))};
 const tooMany={...written,responses:[...written.responses,{key:older.questions[65].key,value:'sixteenth response'}]};
 for(const method of ['PUT','POST'])await api(`/api/gatemock/attempts/${previous.attempt.id}`,{method,token:previous.token,body:{revision:0,state:tooMany},status:400});
 await api(`/api/gatemock/attempts/${previous.attempt.id}`,{method:'PUT',token:previous.token,body:{revision:0,state:written}});
 const previousResume=await api(`/api/gatemock/attempts/${previous.attempt.id}`,{token:previous.token});assert.deepEqual(previousResume.attempt.state.responses,written.responses);assert.doesNotMatch(JSON.stringify(previousResume.attempt),secret);
 await api(`/api/gatemock/attempts/${previous.attempt.id}`,{method:'POST',token:previous.token,body:{revision:1,state:written}});
 const previousGrade=await api(`/api/gatemock/attempts/${previous.attempt.id}/assessment`,{method:'POST',token:previous.token,body:{revision:2,key:older.questions[50].key,marks:4.5}});assert.equal(previousGrade.attempt.result.score,4.5);
 console.log('API: 90 responses, secrecy, resume, revision conflicts, scoring, self-assessment, frozen submission, expiry and four downloads pass (PDF bytes and ZIP member contents match). Existing written response/choice-limit regression passes.');
 await fs.mkdir('tmp/gate2005/browser',{recursive:true});browser=await puppeteer.launch({headless:true});const page=await browser.newPage();page.setDefaultTimeout(60000);const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
 if(cookie){const i=cookie.indexOf('=');await browser.setCookie({name:cookie.slice(0,i),value:cookie.slice(i+1),url:origin});}
 await page.setViewport({width:1440,height:1000});await page.goto(origin+'/gatemock?paper=gate-cs-2005',{waitUntil:'domcontentloaded'});
 await selectYearPaper(page, '2005');assert.match(await page.$eval('main',e=>e.textContent),/GATE CS 2005/);
 await page.screenshot({path:'tmp/gate2005/browser/builder.png',fullPage:true});
 const response=page.waitForResponse(r=>r.url().endsWith('/api/gatemock/attempts')&&r.request().method()==='POST');await beginSelectedPaper(page);const live=await(await response).json();attempts.push(live.attempt.id);
 await page.waitForSelector('input[type=radio]');await page.click('input[type=radio]');await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Mark for Review & Next').click());
 for(let n=1;n<=90;n++){
  if(n===81)await page.evaluate(()=>[...document.querySelectorAll('[role=tab]')].find(e=>e.textContent.includes('Linked')).click());
  if(n===31)await page.evaluate(()=>[...document.querySelectorAll('[role=tab]')].find(e=>e.textContent.includes('Two-mark')).click());
  await page.evaluate(number=>document.querySelector(`button[aria-label^="Question ${number},"]`).click(),n);
  await page.waitForFunction(key=>{const q=document.querySelector(`[data-question-key="${key}"]`);return q&&q.querySelector('[data-math-ready="true"]');},{},paper.questions[n-1].key);
  assert.equal(await page.$$eval('mjx-merror',nodes=>nodes.length),0,`Math error at Q${n}`);
  if(n>=81)assert.match(await page.$eval('[data-question-key]',e=>e.textContent),new RegExp('Original paper Q'+paper.questions[n-1].originalLabel.replace(/[()]/g,'\\$&')));
  if(n===50||n===83)assert.equal(await page.$$('[data-question-key="'+paper.questions[n-1].key+'"] input[type=radio]').then(v=>v.length),5);
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-question-key] img')].every(im=>im.complete&&im.naturalWidth>0));
  if([1,9,14,15,47,48,50,55,61,62,64,71,76,79,81,83,87,89,90].includes(n))await page.screenshot({path:`tmp/gate2005/browser/q${n}.png`});
 }
 await page.evaluate(()=>[...document.querySelectorAll('[role=tab]')].find(e=>e.textContent.includes('Two-mark')).click());
 await page.evaluate(()=>document.querySelector('button[aria-label^="Question 61,"]').click());await page.waitForFunction(()=>document.querySelector('[data-question-key="yearpaper:gate-cs-2005:61"]'));
 await page.click('input[type=radio]');await page.waitForFunction(()=>[...document.querySelectorAll('[role=status]')].some(e=>e.textContent==='Saved'));
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('input[type=radio]:checked');assert.equal(await page.$eval('[data-question-key]',e=>e.dataset.questionKey),'yearpaper:gate-cs-2005:61');
 await page.click('[aria-label="Open scientific calculator"]');await page.waitForSelector('[aria-label="Close calculator"]');await page.screenshot({path:'tmp/gate2005/browser/calculator.png'});await page.click('[aria-label="Close calculator"]');
 await page.click('[aria-label="Submit test"]');await page.waitForSelector('dialog[open]');await page.evaluate(()=>[...document.querySelectorAll('dialog button')].find(e=>e.textContent==='Confirm submit').click());await page.waitForFunction(()=>document.body.textContent.includes('Your result & solutions'));
 await reviewQuestion(page, 61);
 await page.type('[aria-label="Self-assessed marks Q61"]','1.5');await saveSelfAssessment(page);await page.waitForFunction(()=>document.body.textContent.includes('1 responses self-assessed'));
 await page.screenshot({path:'tmp/gate2005/browser/review.png'});
 await page.evaluate(()=>[...document.querySelectorAll('button')].find(e=>e.textContent==='Choose another paper →').click());await page.setViewport({width:390,height:844});await page.screenshot({path:'tmp/gate2005/browser/mobile.png',fullPage:true});
 assert.deepEqual(pageErrors,[]);
 const report={api:true,browser:true,mathQuestionsChecked:90,diagramsLoaded:true,fiveOptionsSavedAndRendered:true,linkedScoringAndPenalties:true,downloadPdfByteEquality:3,zipMemberByteEquality:2,expiry:true,bookBankCount:catalog.count,previousPapersReady:true,writtenAndChoiceLimitRegression:true,pageErrors,
 checks:['all positions','active key secrecy','all 90 responses saved','stale revision rejected','invalid token rejected','refresh/resume','review markers','calculator','submission','objective score 137','manual score saved','submitted state frozen','automatic expiration','downloads','existing written responses and 15-question server limit']};
 await fs.writeFile('data/backups/gate-2005/live-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{
 if(browser)await browser.close();
 const connection=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
 try{await connection.connect();await connection.db().collection('mockattempts').deleteMany({_id:{$in:attempts}});}finally{await connection.close();}
}
