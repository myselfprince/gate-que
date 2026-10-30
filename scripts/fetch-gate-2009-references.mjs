import fs from 'node:fs/promises';
import {load} from 'cheerio';
const dir='data/backups/gate-2009',out='tmp/gate2009/discussions';
await fs.mkdir(out,{recursive:true});
const refs=JSON.parse(await fs.readFile(dir+'/reference-2009.json','utf8'));
let next=0;const report=[];
await Promise.all(Array.from({length:4},async()=>{
 while(next<refs.length){const r=refs[next++],n=Number(r.title.match(/Question:\s*(\d+)/)[1]);
  try{const response=await fetch(r.url,{signal:AbortSignal.timeout(25000)});if(!response.ok)throw new Error('HTTP '+response.status);
   const html=await response.text(),$=load(html);$('script,style').remove();
   await fs.writeFile(`${out}/${n}.txt`,r.url+'\n'+$('.qa-q-view').text()+'\nANSWERS\n'+$('.qa-a-list').text());
   await fs.writeFile(`${out}/${n}.html`,html);
   report.push({n,url:r.url,ok:true,answerCount:$('.qa-a-list-item').length});
  }catch(e){report.push({n,url:r.url,ok:false,error:e.message});}
 }
}));
report.sort((a,b)=>a.n-b.n);await fs.writeFile(dir+'/reference-fetch.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({fetched:report.filter(r=>r.ok).length,failed:report.filter(r=>!r.ok)}));
