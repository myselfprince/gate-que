import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import puppeteer from 'puppeteer';
const require=createRequire(import.meta.url);require('@next/env').loadEnvConfig(process.cwd(),true,{info(){},error(){}});
const origin='http://localhost:3000';let browser,cookie='';
try{
 const check=await fetch(origin+'/api/gateyearpaperpdf');
 if(check.status===401){const r=await fetch(origin+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:process.env.APP_PASSWORD})});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];}
 const r=await fetch(origin+'/api/gateyearpaperpdf',{headers:cookie?{Cookie:cookie}:{}});assert.equal(r.status,200);const data=await r.json();
 const selected=data.files.find(f=>f.filename==='2009.pdf');assert.equal(selected.sha256,'d260584d7a0fdd14f3c7bd262e3e48c25eb6b2f75fe4df8889993b1b1c41b83a');assert.equal(selected.progress.complete,true);assert.equal(selected.progress.count,60);assert.equal(selected.progress.slug,'gate-cs-2009');
 browser=await puppeteer.launch({headless:true});if(cookie){const i=cookie.indexOf('=');await browser.setCookie({name:cookie.slice(0,i),value:cookie.slice(i+1),url:origin});}
 const page=await browser.newPage();page.setDefaultTimeout(60000);await page.setViewport({width:1440,height:1000});await page.goto(origin+'/gateyearpaperpdf',{waitUntil:'domcontentloaded'});await page.waitForSelector('[data-filename="2009.pdf"]');await page.type('input[type=search]','2009');
 assert.equal(await page.$eval('[data-filename="2009.pdf"] input',e=>e.checked&&e.disabled),true);assert.match(await page.$eval('[data-filename="2009.pdf"]',e=>e.textContent),/60\/60/);
 await page.click('[data-filename="2009.pdf"] button');await page.screenshot({path:'tmp/gate2009/browser/tracker.png',fullPage:true});
 await fs.writeFile('data/backups/gate-2009/tracker-verification.json',JSON.stringify({apiPassed:true,browserPassed:true,filename:selected.filename,sourceSha256:selected.sha256,progress:selected.progress,checkboxCheckedAndReadOnly:true},null,2));console.log('2009 tracker API and browser: matching source SHA, derived 60/60 completion, checked disabled checkbox.');
}finally{if(browser)await browser.close();}
