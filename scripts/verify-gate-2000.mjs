import { selectYearPaper, beginSelectedPaper, reviewQuestion, saveSelfAssessment } from './mock-browser-helpers.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import puppeteer from 'puppeteer';
const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd(),true,{info(){},error(){}});
const origin='http://127.0.0.1:3000';
const paper=JSON.parse(await fs.readFile('data/papers/gate-cs-2000.json','utf8'));
const attempts=[];
let cookie='',browser;
async function api(url,{method='GET',body,token,status=200}={}){
 const response=await fetch(origin+url,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const data=await response.json();assert.equal(response.status,status,JSON.stringify(data));return data;
}
try{
 const check=await fetch(origin+'/api/gatemock/admin');
 if(check.status===401){const r=await fetch(origin+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:process.env.APP_PASSWORD})});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];}
 const catalog=await api('/api/gatemock/catalog');
 assert.equal(catalog.count,2647); // Seven saved book entries are blank placeholders.
 const year=catalog.years.find(p=>p.id==='2000|CS|');
 assert.equal(year.available,69);assert.equal(year.coverage.ready,true);assert.equal(year.coverage.marks,150);
 assert.doesNotMatch(JSON.stringify(catalog),/correctOptions|referenceAnswer|copiedFrom/);
 const created=await api('/api/gatemock/attempts',{method:'POST',body:{mode:'year',year:'2000',examPaper:'CS'}});
 const {id}=created.attempt,token=created.token;attempts.push(id);
 assert.equal(created.attempt.totalMarks,150);assert.equal(created.attempt.questions.length,69);assert.equal(created.attempt.exact,true);
 assert.doesNotMatch(JSON.stringify(created.attempt),/correctOptions|referenceAnswer|copiedFrom|natAnswer|tokenHash/);
 await api(`/api/gatemock/attempts/${id}/assessment`,{method:'POST',token,body:{revision:0,key:paper.questions[49].key,marks:5},status:400});
 const state={...created.attempt.state,responses:paper.questions.filter(q=>q.correctOptions.length).map(q=>({key:q.key,value:q.correctOptions}))};
 state.responses.push(...paper.questions.slice(49,64).map(q=>({key:q.key,value:'Written answer\nwith a second line.'})));
 const tooMany={...state,responses:[...state.responses,{key:paper.questions[64].key,value:'sixteenth answer'}]};
 await api(`/api/gatemock/attempts/${id}`,{method:'PUT',token,body:{revision:0,state:tooMany},status:400});
 const saved=await api(`/api/gatemock/attempts/${id}`,{method:'PUT',token,body:{revision:0,state}});
 assert.equal(saved.attempt.state.responses.length,62);
 const finished=await api(`/api/gatemock/attempts/${id}`,{method:'POST',token,body:{revision:1,state}});
 assert.equal(finished.attempt.result.score,71);assert.equal(finished.attempt.result.totalMarks,150);
 assert.equal(finished.attempt.result.ungraded,17);assert.ok(finished.attempt.result.entries.every(e=>e.referenceAnswer));
 const assessed=await api(`/api/gatemock/attempts/${id}/assessment`,{method:'POST',token,body:{revision:2,key:paper.questions[49].key,marks:4.5}});
 assert.equal(assessed.attempt.result.score,75.5);assert.equal(assessed.attempt.result.selfAssessed,1);
 await api(`/api/gatemock/attempts/${id}/assessment`,{method:'POST',token,body:{revision:3,key:paper.questions[49].key,marks:6},status:400});
 await api(`/api/gatemock/attempts/${id}/assessment`,{method:'POST',token,body:{revision:3,key:paper.questions[0].key,marks:1},status:400});
 await api(`/api/gatemock/attempts/${id}/assessment`,{method:'POST',token:'0'.repeat(64),body:{revision:3,key:paper.questions[49].key,marks:5},status:404});
 for(const query of ['format=pdf&theme=dark','format=pdf&theme=light','format=key','format=zip']){
  const r=await fetch(origin+'/api/gatemock/papers/gate-cs-2000/export?'+query,{headers:cookie?{Cookie:cookie}:{}});
  assert.equal(r.status,200,await r.clone().text().then(t=>t.slice(0,150)));const b=Buffer.from(await r.arrayBuffer());assert.ok(b.length>10000);
  assert.equal(b.subarray(0,query==='format=zip'?2:4).toString(),query==='format=zip'?'PK':'%PDF');
 }
 console.log('API: coverage, secrecy, 15-response limit, autosave, submission, assessment and all four downloads passed.');
 await fs.mkdir('tmp/gate2000/browser',{recursive:true});
 browser=await puppeteer.launch({headless:true});const page=await browser.newPage();
 if(cookie){const n=cookie.indexOf('=');await browser.setCookie({name:cookie.slice(0,n),value:cookie.slice(n+1),url:origin});}
 await page.setViewport({width:1440,height:1000});
 const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
 await page.goto(origin+'/gatemock',{waitUntil:'networkidle2'});
 await selectYearPaper(page, '2000');
 await page.screenshot({path:'tmp/gate2000/browser/builder.png',fullPage:true});
 const startResponse=page.waitForResponse(r=>r.url().endsWith('/api/gatemock/attempts')&&r.request().method()==='POST');
 await beginSelectedPaper(page);
 const live=await(await startResponse).json();attempts.push(live.attempt.id);
 await page.waitForSelector('input[type=radio]');await page.click('input[type=radio]');
 await page.waitForFunction(()=>[...document.querySelectorAll('[role=status]')].some(e=>e.textContent==='Saved'));
 await page.screenshot({path:'tmp/gate2000/browser/objective.png',fullPage:true});
 await page.evaluate(()=>[...document.querySelectorAll('[role=tab]')].find(b=>b.textContent.includes('Section B')).click());
 await page.waitForSelector('textarea[aria-label="Written response"]');
 await page.type('textarea','Base cases n=1,2. Use strong induction on n.');
 await page.waitForFunction(()=>[...document.querySelectorAll('[role=status]')].some(e=>e.textContent==='Saved'));
 await page.reload({waitUntil:'networkidle2'});await page.waitForSelector('textarea');
 assert.equal(await page.$eval('textarea',e=>e.value),'Base cases n=1,2. Use strong induction on n.');
 await page.screenshot({path:'tmp/gate2000/browser/written.png',fullPage:true});
 await page.click('[aria-label="Open scientific calculator"]');await page.waitForSelector('[aria-label="Close calculator"]');await page.click('[aria-label="Close calculator"]');
 await page.click('[aria-label="Submit test"]');await page.waitForSelector('dialog[open]');
 await page.evaluate(()=>[...document.querySelectorAll('dialog button')].find(b=>b.textContent==='Confirm submit').click());
 await page.waitForFunction(()=>document.body.textContent.includes('Your result & solutions'));
 await reviewQuestion(page, 50);
 await page.waitForSelector('[aria-label="Self-assessed marks Q50"]');
 await page.type('[aria-label="Self-assessed marks Q50"]','4');
 await saveSelfAssessment(page);
 await page.waitForFunction(()=>document.body.textContent.includes('1 responses self-assessed'));
 await page.screenshot({path:'tmp/gate2000/browser/review.png',fullPage:true});
 await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Choose another paper →').click());
 await page.setViewport({width:390,height:844});await page.screenshot({path:'tmp/gate2000/browser/mobile.png',fullPage:true});
 assert.deepEqual(pageErrors,[]);
 console.log('Browser: MCQ response, written response, refresh/resume, calculator, submission and self-assessment passed; desktop and mobile screenshots saved.');
}finally{
 if(browser)await browser.close();
 const {MongoClient}=require('mongoose').mongo;const db=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
 try{await db.connect();await db.db().collection('mockattempts').deleteMany({_id:{$in:attempts}});}finally{await db.close();}
}
