import fs from 'node:fs/promises';
const base='data/backups/gate-2005';
const all=JSON.parse(await fs.readFile(base+'/book-search.json','utf8'));
const paper=JSON.parse(await fs.readFile('data/papers/gate-cs-2005.json','utf8'));
const tokens=s=>new Set(s.toLowerCase().replace(/[^a-z0-9]/g,' ').split(' ').filter(t=>t.length>2));
const text=q=>['text','code','optA','optB','optC','optD','optE'].map(k=>q[k]||'').join(' ');
const corpus=all.map(q=>({q,t:tokens(text(q))}));
const search=paper.questions.map(q=>{
 const t=tokens(text(q));
 return {number:q.originalLabel,selected:q.source.copiedFrom?.questionId||null,candidates:corpus.map(b=>({id:b.q.id,year:b.q.year,subject:b.q.subject,score:[...t].filter(w=>b.t.has(w)).length/Math.max(1,new Set([...t,...b.t]).size),text:b.q.text.slice(0,180)})).sort((a,b)=>b.score-a.score).slice(0,5)};
});
await fs.writeFile(base+'/full-book-search.json',JSON.stringify(search,null,2));
await fs.writeFile('tmp/pdfs/mapped-2005.txt',paper.questions.map(q=>`Q${q.paperQuestionNumber} / ${q.originalLabel}\n${q.text}\nCODE ${q.code||''}\n${['A','B','C','D','E'].filter(k=>q['opt'+k]).map(k=>k+' '+q['opt'+k]).join('\n')}\nKEY ${q.correctOptions} MANUAL ${q.manualReview}`).join('\n\n'));
console.log(JSON.stringify({searched:all.length,transcribed:search.filter(q=>!q.selected).map(q=>q.number),duplicateCandidates:search.filter(q=>q.candidates.filter(c=>c.score>.82).length>1).map(q=>q.number)},null,2));
