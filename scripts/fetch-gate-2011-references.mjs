import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';
const dir='data/backups/gate-2011',out='tmp/gate2011/discussions';await fs.mkdir(out,{recursive:true});
const refs=JSON.parse(await fs.readFile(dir+'/reference-2011.json','utf8'));
let next=0;const report=[];
await Promise.all(Array.from({length:4},async()=>{while(next<refs.length){
 const r=refs[next++],n=Number(r.title.match(/Question:\s*(\d+)/)[1]);
 try{const response=await fetch(r.url,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error('HTTP '+response.status);
 const html=await response.text(),$=load(html);$('script,style').remove();
 await fs.writeFile(`${out}/${n}.txt`,r.url+'\n'+$('.qa-q-view').text()+'\nANSWERS\n'+$('.qa-a-list').text());
 report.push({n,url:r.url,ok:true,answerCount:$('.qa-a-list-item').length});
 }catch(e){report.push({n,url:r.url,ok:false,error:e.message});}
}}));
report.sort((a,b)=>a.n-b.n);await fs.writeFile(dir+'/reference-fetch.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({fetched:report.filter(r=>r.ok).length,failed:report.filter(r=>!r.ok).length}));
const url='https://gatecse.in/w/images/2/27/Key2011.pdf';
const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error('Key mirror HTTP '+response.status);
const bytes=Buffer.from(await response.arrayBuffer());if(bytes.subarray(0,5).toString()!=='%PDF-')throw new Error('Not PDF');
await fs.writeFile(`${dir}/historical-key-mirror.pdf`,bytes);
await fs.writeFile(`${dir}/historical-key-mirror.json`,JSON.stringify({url,sha256:createHash('sha256').update(bytes).digest('hex'),official:false,status:'historical-key-mirror; original-issuing-host-not-authenticated'},null,2));
console.log('Historical key mirror saved; official origin is not authenticated.');
