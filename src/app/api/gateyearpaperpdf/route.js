import {NextResponse} from 'next/server';
import dbConnect from '@/lib/mongodb';
import YearPaper from '@/models/YearPaper';
import {scanYearPaperPdfs,readG4GatePreparedPapers,g4GatePackageProgress} from '@/lib/gate-year-paper-tracker-server.mjs';
import {YEAR_PDF_ROOT,YEAR_PROMPT_TARGETS,yearPaperProgress,compareYearPdfs} from '@/lib/gate-year-paper-tracker.mjs';
import {requireReadAccess,rateLimit,jsonError} from '@/lib/api-utils';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request){
  const denied=requireReadAccess(request);if(denied)return denied;
  const limited=rateLimit(request,'year-pdf-tracker',{limit:30,windowMs:60000});if(limited)return limited;
  const target=new URL(request.url).searchParams.get('target')||'editor';
  if(!Object.hasOwn(YEAR_PROMPT_TARGETS,target))return jsonError('Choose a valid destination project.');
  const [folder,database]=await Promise.allSettled([
    scanYearPaperPdfs(),
    target==='g4gate'?readG4GatePreparedPapers():(async()=>{await dbConnect();return YearPaper.find({}).lean();})(),
  ]);
  if(folder.status==='rejected')return jsonError(`Could not read the PDF folder: ${YEAR_PDF_ROOT}. Check that the drive is connected.`,503);
  const papers=database.status==='fulfilled'?database.value:null;
  const files=folder.value.map(file=>({...file,progress:(target==='g4gate'?g4GatePackageProgress:yearPaperProgress)(file,papers)})).sort(compareYearPdfs);
  return NextResponse.json({success:true,root:YEAR_PDF_ROOT,target,projectPath:YEAR_PROMPT_TARGETS[target].projectPath,files,databaseAvailable:target==='editor'&&Boolean(papers),statusAvailable:Boolean(papers),
    warning:papers?null:target==='g4gate'?'G4Gate package status is unavailable. Prompts still work; check that the destination project and data/gate-imports folder are available.':'Database status is unavailable. You can still copy prompts; completion checks will return when the database reconnects.',
    refreshedAt:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
}
