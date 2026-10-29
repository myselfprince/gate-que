import fs from 'node:fs/promises';
import {exportYearPaper,yearPaperZip} from '../src/lib/year-paper-export.mjs';
const paper=JSON.parse(await fs.readFile('data/papers/gate-cs-2000.json','utf8'));
for(const theme of ['dark','light']){
 const result=await exportYearPaper(paper,theme);
 if(theme==='dark')await fs.writeFile('output/pdf/gate-cs-2000.zip',yearPaperZip(result));
 console.log(JSON.stringify({theme,...result.report,pdfPath:result.pdfPath,keyPath:result.keyPath}));
}
