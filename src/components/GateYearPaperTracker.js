'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {YEAR_PDF_ROOT,YEAR_PROMPT_TARGETS,paperLabel,buildYearPaperPrompt} from '@/lib/gate-year-paper-tracker.mjs';
import styles from './GateYearPaperTracker.module.css';

const STORAGE='g4gate-year-paper-prompts-v2';
const fileKey=file=>`${file.filename}|${file.sha256}`;
const fileSize=size=>`${(size/1024/1024).toFixed(1)} MB`;

export default function GateYearPaperTracker(){
  const [target,setTarget]=useState('g4gate');
  const destination=YEAR_PROMPT_TARGETS[target],packageMode=target==='g4gate';
  const [catalog,setCatalog]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const [selected,setSelected]=useState(''),[search,setSearch]=useState(''),[paperFilter,setPaperFilter]=useState('all'),[statusFilter,setStatusFilter]=useState('all');
  const [adjustments,setAdjustments]=useState({}),[copied,setCopied]=useState({}),[notice,setNotice]=useState(''),[copying,setCopying]=useState(''),[copyFailed,setCopyFailed]=useState(false),[storageWarning,setStorageWarning]=useState(false);
  const history=useRef({selected:'',adjustments:{},copied:{}}),preferenceLoaded=useRef(false),copyLock=useRef(false),preview=useRef(null);
  const refresh=useCallback(async signal=>{
    setLoading(true);setError('');
    try{
      const response=await fetch(`/api/gateyearpaperpdf?target=${target}`,{cache:'no-store',signal});const data=await response.json();
      if(!response.ok||!data.success)throw new Error(data.error||'Could not load source PDFs.');
      if(signal?.aborted)return;
      setCatalog(data);
      setSelected(current=>data.files.some(f=>f.filename===current)?current:(data.files.find(f=>!f.progress.complete)||data.files[0])?.filename||'');
    }catch(e){if(e.name!=='AbortError')setError(e.message);}
    finally{if(!signal?.aborted)setLoading(false);}
  },[target]);
  useEffect(()=>{
    const controller=new AbortController();
    const timer=setTimeout(()=>{
      try{
        if(!preferenceLoaded.current){
          preferenceLoaded.current=true;
          const preferred=localStorage.getItem(`${STORAGE}:target`);
          if(preferred&&Object.hasOwn(YEAR_PROMPT_TARGETS,preferred)&&preferred!==target){setTarget(preferred);return;}
        }
        const saved=JSON.parse(localStorage.getItem(`${STORAGE}:${target}`)||(target==='editor'?localStorage.getItem('g4gate-year-paper-prompts-v1'):null)||'null');
        if(saved&&typeof saved==='object'){
          const clean={selected:typeof saved.selected==='string'?saved.selected:'',adjustments:saved.adjustments&&typeof saved.adjustments==='object'?saved.adjustments:{},copied:saved.copied&&typeof saved.copied==='object'?saved.copied:{}};
          history.current=clean;setSelected(clean.selected);setAdjustments(clean.adjustments);setCopied(clean.copied);
        }else{history.current={selected:'',adjustments:{},copied:{}};setSelected('');setAdjustments({});setCopied({});}
      }catch{setStorageWarning(true);}
      void refresh(controller.signal);
    },0);
    return()=>{clearTimeout(timer);controller.abort();};
  },[refresh,target]);
  function remember(change){
    history.current={...history.current,...change};
    try{localStorage.setItem(`${STORAGE}:${target}`,JSON.stringify(history.current));}catch{setStorageWarning(true);}
  }
  function changeTarget(value){
    if(!Object.hasOwn(YEAR_PROMPT_TARGETS,value))return;
    preferenceLoaded.current=true;history.current={selected:'',adjustments:{},copied:{}};
    try{localStorage.setItem(`${STORAGE}:target`,value);}catch{setStorageWarning(true);}
    setTarget(value);setCatalog(null);setLoading(true);setSelected('');setCopied({});setAdjustments({});setNotice('');setCopyFailed(false);
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
  if(chosen){try{prompt=buildYearPaperPrompt(chosen,adjustments[fileKey(chosen)],target);}catch(e){promptError=e.message;}}
  async function copyPrompt(file){
    if(copyLock.current)return;
    if(loading||catalog?.target!==target){setNotice('Wait for the selected project inventory to load.');return;}
    let text;try{text=buildYearPaperPrompt(file,adjustments[fileKey(file)],target);}catch(e){choose(file);setNotice(e.message);return;}
    copyLock.current=true;choose(file);setCopying(file.filename);setNotice('');
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard is unavailable.');
      await navigator.clipboard.writeText(text);
      const value={...history.current.copied,[fileKey(file)]:new Date().toISOString()};setCopied(value);remember({copied:value});
      setNotice(`Full prompt copied for ${destination.projectPath}: ${file.filename}. Isi project ke AI chat mein paste karein.`);
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
      <input type="checkbox" checked={file.progress.complete} disabled aria-label={`Verified ${packageMode?'package preparation':'database completion'} for ${file.filename}`} />
      <div className={styles.fileInfo}><button className={styles.fileName} onClick={()=>choose(file)} aria-pressed={active}>{file.filename}</button><span className={styles.identity}>{paperLabel(identity)} <span>· {fileSize(file.size)}</span></span>
        <div className={styles.badges}><span className={file.progress.complete?styles.completeBadge:styles.statusBadge}>{file.progress.label}</span>{isCopied&&<span className={styles.copiedBadge}>Prompt copied</span>}{file.identityNote&&<span className={styles.reviewBadge}>Check paper identity</span>}</div>
        {file.identityNote&&<p className={styles.fileNote}>{file.identityNote}</p>}
      </div>
      <div className={styles.rowActions}><button onClick={()=>choose(file)} aria-label={`Preview prompt for ${file.filename}`}>Preview</button><button className={styles.copyButton} disabled={loading||Boolean(copying)} onClick={()=>copyPrompt(file)} aria-label={`Copy prompt for ${file.filename}`}>{copying===file.filename?'Copying…':'Copy prompt'}</button></div>
    </article>;
  });}
  return <main className={styles.page}>
    <header className={styles.header}><div><span className={styles.eyebrow}>G4GATE · YEAR PAPER WORKSPACE</span><h1>One PDF. One complete paper.</h1><p>Year-wise GATE PDF choose karein, exact file ka full prompt copy karein, aur apne coding chat mein paste karein.</p></div><nav aria-label="Workspace navigation"><Link href="/pdf-tracker">Book PDF tracker ↗</Link><Link href="/gatemock">Mock lab ↗</Link><Link href="/">← Editor</Link></nav></header>
    <section className={styles.destination} aria-label="Prompt destination"><label>AI chat project<select aria-label="AI chat project" value={target} disabled={Boolean(copying)} onChange={event=>changeTarget(event.target.value)}>{Object.entries(YEAR_PROMPT_TARGETS).map(([value,project])=><option key={value} value={value}>{project.label}</option>)}</select></label><div><strong>Paste into the AI chat for this project</strong><code>{destination.projectPath}</code><p>{packageMode?'G4Gate prompts use /admin/gate, /gate and safe paper packages. No manual prompt editing needed.':'Editor prompts use the original year-paper database and PDF export workflow.'}</p></div></section>
    <section className={styles.overview} aria-label="Year-paper progress">
      <div className={styles.source}><span>SOURCE FOLDER</span><code>{YEAR_PDF_ROOT}</code><small>Live folder scan · PDF files only</small></div>
      <div className={styles.stats}><div><strong>{catalog?files.length:'—'}</strong><span>Source PDFs</span></div><div><strong>{catalog?.statusAvailable?files.length-completed:'—'}</strong><span>{packageMode?'Packages still to prepare':'Pending in database'}</span></div><div><strong>{catalog?.statusAvailable?completed:'—'}</strong><span>{packageMode?'Verified packages':'Verified complete'}</span></div><div><strong>{copiedCount}</strong><span>Prompts copied</span></div></div>
      <div className={styles.progress} role="progressbar" aria-label="Verified year-paper completion" aria-valuemin={0} aria-valuemax={files.length||1} aria-valuenow={completed}><span style={{width:`${files.length?completed/files.length*100:0}%`}} /></div>
      <div className={styles.toolbar}><button className={styles.primary} disabled={loading||Boolean(copying)||!next} onClick={()=>copyPrompt(next)}>{copying?'Copying…':'Copy next pending prompt →'}</button><button disabled={loading} onClick={()=>void refresh()}>{loading?'Checking selected project…':packageMode?'↻ Refresh folder & packages':'↻ Refresh folder & DB'}</button><p>{packageMode?'Tick means the matching local G4Gate package is verified.':'Tick sirf verified dataset se aata hai.'} <strong>{packageMode?'Prepared ≠ imported live.':'Copied ≠ completed.'}</strong></p></div>
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
      {done.length>0&&<><h3 className={styles.completedHeading}>{packageMode?'Verified packages':'Verified in database'} <span>{done.length}</span></h3><div className={styles.fileGroup}>{rows(done)}</div></>}
    </section>
    <aside className={styles.previewPanel} aria-label="Full year-paper prompt preview">
      <div className={styles.previewHeading}><span className={styles.eyebrow}>READY TO PASTE</span><span>{prompt.length.toLocaleString()} characters</span></div><h2>{chosen?paperLabel(display(chosen)):'Select a question paper'}</h2>
      {chosen&&<><p className={styles.path}>{chosen.path}</p>{chosen.identityNote&&<p className={styles.identityWarning}>{chosen.identityNote}</p>}<div className={styles.identityFields}><label>Year<input aria-label="Prompt year" type="text" inputMode="numeric" maxLength={4} value={display(chosen).year} onChange={e=>changeIdentity('year',e.target.value)} /></label><label>Paper<select aria-label="Prompt paper" value={display(chosen).examPaper} onChange={e=>changeIdentity('examPaper',e.target.value)}><option value="CS">CS</option><option value="IT">IT</option><option value="DA">DA</option></select></label><label>Set / session<input aria-label="Prompt set or session" type="text" maxLength={16} value={display(chosen).setNum} placeholder="Single paper" onChange={e=>changeIdentity('setNum',e.target.value)} /></label></div>
        <p className={styles.helper}>Inputs filename se identify hote hain; prompt actual PDF header verify karne ko kehta hai. Changes sirf is prompt par apply honge.</p>
        {promptError&&<p className={styles.warning} role="alert">{promptError}</p>}
        <textarea ref={preview} aria-label="Full year-paper build prompt" readOnly value={prompt} spellCheck={false} onFocus={e=>e.target.select()} />
        <div className={styles.previewActions}><button className={styles.primary} disabled={loading||Boolean(copying)||Boolean(promptError)} onClick={()=>copyPrompt(chosen)}>Copy full prompt</button><button disabled={Boolean(promptError)} onClick={downloadPrompt}>Download .txt</button><button disabled={Boolean(promptError)} onClick={()=>{preview.current?.focus();preview.current?.select();setNotice('Full prompt selected. Press Ctrl+C or use your device’s Copy action.');}}>Select all</button></div>
        <p className={styles.safety}>Prompt includes: source checksum, unchanged book data, answer verification, complete mock environment, PDF exports and final checks.</p>
      </>}
    </aside></div>
    <footer className={styles.footer}><span>AI chat project: <code>{destination.projectPath}</code></span><p>{packageMode?'Readiness is checked from local G4Gate packages and image checksums. Live import status is managed at g4gate.com/admin/gate; this page does not read or change production data.':'This page prepares editor prompts. Completion is derived from the verified separate dataset matched to its source PDF.'}</p></footer>
  </main>;
}
