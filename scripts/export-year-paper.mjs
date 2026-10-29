import fs from 'node:fs/promises';
import {exportYearPaper,yearPaperZip} from '../src/lib/year-paper-export.mjs';
const slug=process.argv[2];if(!/^gate-(cs|it)-\d{4}(?:-[a-z0-9-]+)?$/.test(slug))throw new Error('Pass a paper slug.');
const paper=JSON.parse(await fs.readFile(`data/papers/${slug}.json`,'utf8'));
for(const theme of ['dark','light']){
 const result=await exportYearPaper(paper,theme);
 if(theme==='light')await fs.writeFile(`output/pdf/${slug}.zip`,yearPaperZip({...result,pdf:await fs.readFile(`output/pdf/${slug}.dark.pdf`)}));
 console.log(JSON.stringify({theme,...result.report,pdfPath:result.pdfPath,keyPath:result.keyPath}));
}
