'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {YEAR_PDF_ROOT,YEAR_PROJECT_PATH,paperLabel,buildYearPaperPrompt} from '@/lib/gate-year-paper-tracker.mjs';
import styles from './GateYearPaperTracker.module.css';

const STORAGE='g4gate-year-paper-prompts-v1';
const fileKey=file=>`${file.filename}|${file.sha256}`;
const fileSize=size=>`${(size/1024/1024).toFixed(1)} MB`;

export default function GateYearPaperTracker(){
  const [catalog,setCatalog]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const [selected,setSelected]=useState(''),[search,setSearch]=useState(''),[paperFilter,setPaperFilter]=useState('all'),[statusFilter,setStatusFilter]=useState('all');
  const [adjustments,setAdjustments]=useState({}),[copied,setCopied]=useState({}),[notice,setNotice]=useState(''),[copying,setCopying]=useState(''),[copyFailed,setCopyFailed]=useState(false),[storageWarning,setStorageWarning]=useState(false);
  const history=useRef({selected:'',adjustments:{},copied:{}}),copyLock=useRef(false),preview=useRef(null);
  const refresh=useCallback(async signal=>{
    setLoading(true);setError('');
    try{
      const response=await fetch('/api/gateyearpaperpdf',{cache:'no-store',signal});const data=await response.json();
      if(!response.ok||!data.success)throw new Error(data.error||'Could not load source PDFs.');
      setCatalog(data);
      setSelected(current=>data.files.some(f=>f.filename===current)?current:(data.files.find(f=>!f.progress.complete)||data.files[0])?.filename||'');
    }catch(e){if(e.name!=='AbortError')setError(e.message);}
    finally{if(!signal?.aborted)setLoading(false);}
  },[]);
  useEffect(()=>{
    const controller=new AbortController();
    const timer=setTimeout(()=>{
      try{
        const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');
        if(saved&&typeof saved==='object'){
          const clean={selected:typeof saved.selected==='string'?saved.selected:'',adjustments:saved.adjustments&&typeof saved.adjustments==='object'?saved.adjustments:{},copied:saved.copied&&typeof saved.copied==='object'?saved.copied:{}};
          history.current=clean;setSelected(clean.selected);setAdjustments(clean.adjustments);setCopied(clean.copied);
        }
      }catch{setStorageWarning(true);}
      void refresh(controller.signal);
    },0);
    return()=>{clearTimeout(timer);controller.abort();};
  },[refresh]);
  function remember(change){
    history.current={...history.current,...change};
    try{localStorage.setItem(STORAGE,JSON.stringify(history.current));}catch{setStorageWarning(true);}
  }
  function choose(file){setSelected(file.filename);remember({selected:file.filename});setCopyFailed(false);}
  const files=catalog?.files||[],chosen=files.find(f=>f.filename===selected);
  const display=file=>({...file,...adjustments[fileKey(file)]});
  const visible=files.filter(file=>{
    const identity=display(file),isCopied=Boolean(copied[fileKey(file)]);
    return (paperFilter==='all'||identity.examPaper===paperFilter)
      && (statusFilter==='all'||statusFilter==='complete'&&file.progress.complete||statusFilter==='pending'&&!file.progress.complete||statusFilter==='copied'&&isCopied)
      && `${file.filename} ${paperLabel(identity)} ${file.path}`.toLowerCase().includes(search.toLowerCase().trim());
  });
  const completed=files.filter(f=>f.progress.complete).length,copiedCount=files.filter(f=>copied[fileKey(f)]).length;
  const pending=visible.filter(f=>!f.progress.complete),done=visible.filter(f=>f.progress.complete);
  const next=pending.find(f=>!copied[fileKey(f)])||pending[0];
  let prompt='',promptError='';
  if(chosen){try{prompt=buildYearPaperPrompt(chosen,adjustments[fileKey(chosen)]);}catch(e){promptError=e.message;}}
  async function copyPrompt(file){
    if(copyLock.current)return;
    let text;try{text=buildYearPaperPrompt(file,adjustments[fileKey(file)]);}catch(e){choose(file);setNotice(e.message);return;}
    copyLock.current=true;choose(file);setCopying(file.filename);setNotice('');
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard is unavailable.');
      await navigator.clipboard.writeText(text);
      const value={...history.current.copied,[fileKey(file)]:new Date().toISOString()};setCopied(value);remember({copied:value});
      setNotice(`Full prompt copied: ${file.filename}. Ab ise apne coding chat mein paste karein.`);
    }catch{
      setCopyFailed(true);setNotice('Clipboard copy nahi hua. Full prompt neeche selected hai; Ctrl+C ya apne device ka Copy use karein.');
      requestAnimationFrame(()=>{preview.current?.focus();preview.current?.select();preview.current?.scrollIntoView({behavior:'smooth',block:'center'});});
    }finally{copyLock.current=false;setCopying('');}
  }
  function changeIdentity(key,value){
    const nextValue={...adjustments,[fileKey(chosen)]:{...adjustments[fileKey(chosen)],[key]:value}};
    setAdjustments(nextValue);remember({adjustments:nextValue});setCopyFailed(false);
  }
  function downloadPrompt(){
    const url=URL.createObjectURL(new Blob([prompt],{type:'text/plain;charset=utf-8'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download=chosen.filename.replace(/\.pdf$/i,'.prompt.txt');anchor.click();setTimeout(()=>URL.revokeObjectURL(url),0);
  }
  function rows(items){return items.map(file=>{
    const identity=display(file),isCopied=Boolean(copied[fileKey(file)]),active=file.filename===selected;
    return <article key={file.filename} className={`${styles.row} ${active?styles.selected:''} ${file.progress.complete?styles.done:''}`} data-filename={file.filename}>
      <input type="checkbox" checked={file.progress.complete} disabled aria-label={`Verified database completion for ${file.filename}`} />
      <div className={styles.fileInfo}><button className={styles.fileName} onClick={()=>choose(file)} aria-pressed={active}>{file.filename}</button><span className={styles.identity}>{paperLabel(identity)} <span>· {fileSize(file.size)}</span></span>
        <div className={styles.badges}><span className={file.progress.complete?styles.completeBadge:styles.statusBadge}>{file.progress.label}</span>{isCopied&&<span className={styles.copiedBadge}>Prompt copied</span>}{file.identityNote&&<span className={styles.reviewBadge}>Check paper identity</span>}</div>
        {file.identityNote&&<p className={styles.fileNote}>{file.identityNote}</p>}
      </div>
      <div className={styles.rowActions}><button onClick={()=>choose(file)} aria-label={`Preview prompt for ${file.filename}`}>Preview</button><button className={styles.copyButton} disabled={Boolean(copying)} onClick={()=>copyPrompt(file)} aria-label={`Copy prompt for ${file.filename}`}>{copying===file.filename?'Copying…':'Copy prompt'}</button></div>
    </article>;
  });}
  return <main className={styles.page}>
    <header className={styles.header}><div><span className={styles.eyebrow}>G4GATE · YEAR PAPER WORKSPACE</span><h1>One PDF. One complete paper.</h1><p>Year-wise GATE PDF choose karein, exact file ka full prompt copy karein, aur apne coding chat mein paste karein.</p></div><nav aria-label="Workspace navigation"><Link href="/pdf-tracker">Book PDF tracker ↗</Link><Link href="/gatemock">Mock lab ↗</Link><Link href="/">← Editor</Link></nav></header>
    <section className={styles.overview} aria-label="Year-paper progress">
      <div className={styles.source}><span>SOURCE FOLDER</span><code>{YEAR_PDF_ROOT}</code><small>Live folder scan · PDF files only</small></div>
      <div className={styles.stats}><div><strong>{catalog?files.length:'—'}</strong><span>Source PDFs</span></div><div><strong>{catalog?.databaseAvailable?files.length-completed:'—'}</strong><span>Pending in database</span></div><div><strong>{catalog?.databaseAvailable?completed:'—'}</strong><span>Verified complete</span></div><div><strong>{copiedCount}</strong><span>Prompts copied</span></div></div>
      <div className={styles.progress} role="progressbar" aria-label="Verified year-paper completion" aria-valuemin={0} aria-valuemax={files.length||1} aria-valuenow={completed}><span style={{width:`${files.length?completed/files.length*100:0}%`}} /></div>
      <div className={styles.toolbar}><button className={styles.primary} disabled={loading||Boolean(copying)||!next} onClick={()=>copyPrompt(next)}>{copying?'Copying…':'Copy next pending prompt →'}</button><button disabled={loading} onClick={()=>void refresh()}>{loading?'Scanning folder & DB…':'↻ Refresh folder & DB'}</button><p>Tick sirf verified dataset se aata hai. <strong>Copied ≠ completed.</strong></p></div>
    </section>
    {error&&<div className={styles.warning} role="alert">{error} <button disabled={loading} onClick={()=>void refresh()}>Retry</button></div>}
    {catalog?.warning&&<p className={styles.warning} role="alert">{catalog.warning}</p>}
    {storageWarning&&<p className={styles.warning}>Browser copy-history storage is unavailable. Prompts and database completion still work.</p>}
    <p className={copyFailed?styles.warning:styles.notice} role="status" aria-live="polite">{notice||(loading?'Source PDFs aur database completion load ho rahe hain…':'Choose a file to preview or copy its complete build prompt. Your book questions stay separate.')}</p>
    <div className={styles.workspace}><section className={styles.library} aria-label="Source PDF library" aria-busy={loading}>
      <div className={styles.filters}><label className={styles.search}>Search PDFs<input type="search" placeholder="Year, filename, paper or set…" value={search} onChange={e=>setSearch(e.target.value)} /></label><label>Paper<select value={paperFilter} onChange={e=>setPaperFilter(e.target.value)}><option value="all">All papers</option><option value="CS">CS</option><option value="IT">IT</option><option value="DA">DA</option></select></label><label>Status<select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">All PDFs</option><option value="pending">Pending</option><option value="complete">Complete</option><option value="copied">Prompt copied</option></select></label></div>
      <div className={styles.listHeading}><h2>Question papers</h2><span>{visible.length} of {files.length} PDFs</span></div>
      {loading&&!catalog&&<p className={styles.empty}>Reading the source folder…</p>}
      {!loading&&!visible.length&&<div className={styles.empty}><h3>{files.length?'No matching PDFs':'No PDF files found'}</h3><p>{files.length?'Try a different search or filter.':'Add question-paper PDFs to the source folder, then refresh.'}</p></div>}
      {pending.length>0&&<div className={styles.fileGroup}>{rows(pending)}</div>}
      {done.length>0&&<><h3 className={styles.completedHeading}>Verified in database <span>{done.length}</span></h3><div className={styles.fileGroup}>{rows(done)}</div></>}
    </section>
    <aside className={styles.previewPanel} aria-label="Full year-paper prompt preview">
      <div className={styles.previewHeading}><span className={styles.eyebrow}>READY TO PASTE</span><span>{prompt.length.toLocaleString()} characters</span></div><h2>{chosen?paperLabel(display(chosen)):'Select a question paper'}</h2>
      {chosen&&<><p className={styles.path}>{chosen.path}</p>{chosen.identityNote&&<p className={styles.identityWarning}>{chosen.identityNote}</p>}<div className={styles.identityFields}><label>Year<input aria-label="Prompt year" type="text" inputMode="numeric" maxLength={4} value={display(chosen).year} onChange={e=>changeIdentity('year',e.target.value)} /></label><label>Paper<select aria-label="Prompt paper" value={display(chosen).examPaper} onChange={e=>changeIdentity('examPaper',e.target.value)}><option value="CS">CS</option><option value="IT">IT</option><option value="DA">DA</option></select></label><label>Set / session<input aria-label="Prompt set or session" type="text" maxLength={16} value={display(chosen).setNum} placeholder="Single paper" onChange={e=>changeIdentity('setNum',e.target.value)} /></label></div>
        <p className={styles.helper}>Inputs filename se identify hote hain; prompt actual PDF header verify karne ko kehta hai. Changes sirf is prompt par apply honge.</p>
        {promptError&&<p className={styles.warning} role="alert">{promptError}</p>}
        <textarea ref={preview} aria-label="Full year-paper build prompt" readOnly value={prompt} spellCheck={false} onFocus={e=>e.target.select()} />
        <div className={styles.previewActions}><button className={styles.primary} disabled={Boolean(copying)||Boolean(promptError)} onClick={()=>copyPrompt(chosen)}>Copy full prompt</button><button disabled={Boolean(promptError)} onClick={downloadPrompt}>Download .txt</button><button disabled={Boolean(promptError)} onClick={()=>{preview.current?.focus();preview.current?.select();setNotice('Full prompt selected. Press Ctrl+C or use your device’s Copy action.');}}>Select all</button></div>
        <p className={styles.safety}>Prompt includes: source checksum, unchanged book data, answer verification, complete mock environment, PDF exports and final checks.</p>
      </>}
    </aside></div>
    <footer className={styles.footer}><span>Project: <code>{YEAR_PROJECT_PATH}</code></span><p>This page prepares prompts. A paper becomes complete only after its separate dataset is built, verified and matched to the source PDF.</p></footer>
  </main>;
}
