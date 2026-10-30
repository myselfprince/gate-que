import fs from 'node:fs/promises';
import {load} from 'cheerio';
const dir='data/backups/gate-2008',out='tmp/gate2008/discussions';await fs.mkdir(out,{recursive:true});
const refs=JSON.parse(await fs.readFile(dir+'/reference-2008.json','utf8')).filter(r=>r.title.startsWith('GATE CSE 2008 | Question:'));
let next=0;const report=[];
await Promise.all(Array.from({length:4},async()=>{
 while(next<refs.length){const r=refs[next++],n=Number(r.title.match(/Question:\s*(\d+)/)[1]);
  try{const response=await fetch(r.url,{signal:AbortSignal.timeout(25000)});if(!response.ok)throw new Error('HTTP '+response.status);
   const html=await response.text(),$=load(html);$('script,style').remove();
   const q=$('.qa-q-view').text(),a=$('.qa-a-list').text(),key=$('.qa-voting').text();
   await fs.writeFile(`${out}/${n}.txt`,r.url+'\n'+q+'\nANSWERS\n'+a+'\n'+key);await fs.writeFile(`${out}/${n}.html`,html);
   report.push({n,url:r.url,ok:true,answerCount:$('.qa-a-list-item').length,key:$('.qa-q-view').find('button').text()});
  }catch(e){report.push({n,url:r.url,ok:false,error:e.message});}
 }
}));
report.sort((a,b)=>a.n-b.n);await fs.writeFile(dir+'/reference-fetch.json',JSON.stringify(report,null,2));console.log(JSON.stringify({fetched:report.filter(r=>r.ok).length,failed:report.filter(r=>!r.ok)}));
