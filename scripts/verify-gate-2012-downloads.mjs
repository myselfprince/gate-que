import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import AdmZip from 'adm-zip';
const require=createRequire(import.meta.url);require('@next/env').loadEnvConfig(process.cwd(),true,{info(){},error(){}});
const origin='http://localhost:3000',slug='gate-cs-2012';let cookie='';
if((await fetch(origin+'/api/gatemock/admin')).status===401){
 const r=await fetch(origin+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:process.env.APP_PASSWORD})});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];
}
for(const [query,file]of [['format=pdf&theme=dark','dark.pdf'],['format=pdf&theme=light','print.pdf'],['format=key','solutions.pdf'],['format=zip','zip']]){
 const r=await fetch(`${origin}/api/gatemock/papers/${slug}/export?${query}`,{headers:cookie?{Cookie:cookie}:{}});assert.equal(r.status,200);
 const bytes=Buffer.from(await r.arrayBuffer());
 if(file==='zip'){
  const zip=new AdmZip(bytes);assert.equal(zip.getEntries().length,2);
  for(const [name,variant]of [['GATE-CS-2012-Questions.pdf','dark.pdf'],['GATE-CS-2012-Answers-and-Solutions.pdf','solutions.pdf']])assert.deepEqual(zip.readFile(name),await fs.readFile(`output/pdf/${slug}.${variant}`));
 }else assert.deepEqual(bytes,await fs.readFile(`output/pdf/${slug}.${file}`));
}
const report=JSON.parse(await fs.readFile('data/backups/gate-2012/live-verification.json','utf8'));report.downloadsAfterSolutionFix=true;
await fs.writeFile('data/backups/gate-2012/live-verification.json',JSON.stringify(report,null,2));
console.log('All four live downloads match the final PDFs, including full cancelled-item worked references.');
