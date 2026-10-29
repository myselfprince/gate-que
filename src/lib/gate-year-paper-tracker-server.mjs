import fs from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {YEAR_PDF_ROOT,identifyYearPdf} from './gate-year-paper-tracker.mjs';

const hashes=new Map();
export async function scanYearPaperPdfs(root=YEAR_PDF_ROOT){
  const entries=await fs.readdir(root,{withFileTypes:true});
  return Promise.all(entries.filter(e=>e.isFile()&&/\.pdf$/i.test(e.name)).map(async entry=>{
    const fullPath=path.join(root,entry.name),stat=await fs.stat(fullPath);
    const cacheKey=`${fullPath}|${stat.size}|${stat.mtimeMs}`;
    let sha256=hashes.get(cacheKey);
    if(!sha256){
      const hash=createHash('sha256');
      for await(const chunk of createReadStream(fullPath))hash.update(chunk);
      sha256=hash.digest('hex');hashes.set(cacheKey,sha256);
    }
    return {...identifyYearPdf(entry.name,sha256),path:fullPath,size:stat.size};
  }));
}
