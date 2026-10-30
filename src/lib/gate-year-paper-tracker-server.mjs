import fs from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {YEAR_PDF_ROOT,G4GATE_PROJECT_PATH,identifyYearPdf,yearPaperProgress} from './gate-year-paper-tracker.mjs';
import {paperAssetFiles} from './year-paper-assets.mjs';
import {isPaperImage} from './year-paper-assets-server.mjs';
import {validateYearPaper} from './year-papers.mjs';

const hashes=new Map();
const packages=new Map();

export function verifiedG4GatePackage(value) {
  if (value?.format !== 'g4gate-paper-package-v1' || !value.paper || !Array.isArray(value.assets)) throw new Error('Invalid G4Gate paper package.');
  const paper=value.paper, files=paperAssetFiles(paper);
  if(!files)throw new Error('The package needs its diagram manifest.');
  const expected=new Map([...files.values()].map(file=>[file.id,file])),seen=new Set();let total=0;
  for(const asset of value.assets){
    const file=expected.get(asset?.id);
    if(!file||seen.has(asset.id)||typeof asset.data!=='string'||asset.data.length>12*1024*1024||!/^[A-Za-z0-9+/]*={0,2}$/.test(asset.data))throw new Error('Invalid package image.');
    const bytes=Buffer.from(asset.data,'base64');
    if((total+=bytes.length)>64*1024*1024||bytes.length!==file.byteLength||!isPaperImage(bytes,file.contentType)||createHash('sha256').update(bytes).digest('hex')!==file.id)throw new Error('A package image is missing or corrupted.');
    seen.add(asset.id);
  }
  if(seen.size!==expected.size)throw new Error('The package is missing a diagram.');
  if(paper.verified)validateYearPaper(paper);
  return paper;
}

// Read prepared content only. Never load another project's env or connect to its database.
export async function readG4GatePreparedPapers(root=path.join(G4GATE_PROJECT_PATH,'data','gate-imports')){
  const entries=await fs.readdir(root,{withFileTypes:true}),papers=[];
  const manifest=JSON.parse(await fs.readFile(path.join(root,'manifest.json'),'utf8'));
  if(manifest.version!==1||!Array.isArray(manifest.papers)||new Set(manifest.papers.map(paper=>paper.slug)).size!==manifest.papers.length)throw new Error('Invalid prepared-paper manifest.');
  const indexed=new Map(manifest.papers.map(paper=>[paper.slug,paper]));
  for(const entry of entries.filter(entry=>entry.isFile()&&/^gate-(?:cs|it|da)-\d{4}(?:-[a-z0-9-]+)?\.json$/.test(entry.name))){
    const fullPath=path.join(root,entry.name),stat=await fs.stat(fullPath),cacheKey=`${fullPath}|${stat.size}|${stat.mtimeMs}`;
    let paper=packages.get(cacheKey);
    if(!paper){
      let value;
      try{
        if(stat.size>96*1024*1024)throw new Error('Paper package exceeds the supported size.');
        value=JSON.parse(await fs.readFile(fullPath,'utf8'));paper=verifiedG4GatePackage(value);
      }catch(error){
        paper={...(value?.paper&&typeof value.paper==='object'&&!Array.isArray(value.paper)?value.paper:{}),slug:entry.name.slice(0,-5),verified:false,packageError:error.message};
      }
      packages.set(cacheKey,paper);
    }
    const summary=indexed.get(entry.name.slice(0,-5));
    let error=paper.packageError;
    if(paper.slug!==entry.name.slice(0,-5)||!summary)error='The package needs its canonical filename and manifest entry.';
    else if(['title','year','examPaper','setNum','questionCount','totalMarks'].some(field=>summary[field]!==paper[field])
      ||summary.imageCount!==new Set((paper.assetManifest?.files||[]).map(file=>file.id)).size)error='Package and manifest metadata differ.';
    papers.push(error?{...paper,verified:false,packageError:error}:paper);
  }
  return papers;
}

export function g4GatePackageProgress(file,papers){
  if(!Array.isArray(papers))return {state:'unknown',complete:false,count:0,expected:null,label:'G4Gate package status unavailable',publication:'not-checked'};
  const progress=yearPaperProgress(file,papers),match=papers.find(paper=>file.sha256&&paper.sourceSha256===file.sha256);
  if(match?.packageError)return {...progress,state:'review',complete:false,label:`Package needs verification · ${match.packageError}`,publication:'not-checked'};
  return {...progress,...(progress.complete?{state:'prepared',label:`Verified package · ${progress.count}/${progress.expected} questions`}:{}),publication:'not-checked'};
}
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
