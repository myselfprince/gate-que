import fs from 'node:fs/promises';
const base='data/backups/gate-it-2004';
const book=JSON.parse(await fs.readFile(base+'/book-search.json','utf8'));
const paper=JSON.parse(await fs.readFile('data/papers/gate-it-2004.json','utf8'));
const fields=['text','code','optA','optB','optC','optD'];
const normalize=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const fingerprint=q=>fields.map(k=>normalize(q[k])).join('|');
const tokens=q=>new Set(normalize(fields.map(k=>q[k]).join(' ')).split(' ').filter(t=>t.length>1));
const index=book.map(q=>({q,t:tokens(q),f:fingerprint(q)}));
const score=(a,b)=>{let i=0;for(const v of a)if(b.has(v))i++;return i/(a.size+b.size-i||1);};
const rows=paper.questions.map(q=>{
 const t=tokens(q),ranked=index.map(item=>({id:item.q.id,chapterId:item.q.chapterId,year:item.q.year,similarity:Number(score(t,item.t).toFixed(4))})).sort((a,b)=>b.similarity-a.similarity);
 const source=book.find(s=>s.id===q.source.copiedFrom?.questionId&&s.chapterId===q.source.copiedFrom?.chapterId);
 const duplicateIds=source?index.filter(item=>item.f===fingerprint(source)).map(item=>item.q.id):[];
 return {number:q.paperQuestionNumber,decision:source?'independent-book-copy-with-scan-comparison':'source-transcription',selected:source?.id,selectedYear:source?.year,selectedPaperTag:source?.examPaper||'blank',exactDuplicateIds:duplicateIds,topCandidates:ranked.slice(0,4),copyOnlyCorrections:source?fields.filter(k=>source[k]!==q[k]):[],sourceIssues:q.source.issues};
});
const report={searchedDocuments:book.length,sourcePositions:rows.length,wrongYearMatches:rows.filter(r=>r.selected&&r.selectedYear!=='2004').map(r=>({number:r.number,id:r.selected,bookYear:r.selectedYear})),duplicateSelections:rows.filter(r=>r.exactDuplicateIds.length>1).map(r=>({number:r.number,ids:r.exactDuplicateIds})),rows};
await fs.writeFile(base+'/book-match-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,rows:undefined},null,2));
