import {NextResponse} from 'next/server';
import dbConnect from '@/lib/mongodb';
import YearPaper from '@/models/YearPaper';
import {scanYearPaperPdfs} from '@/lib/gate-year-paper-tracker-server.mjs';
import {YEAR_PDF_ROOT,yearPaperProgress,compareYearPdfs} from '@/lib/gate-year-paper-tracker.mjs';
import {requireReadAccess,rateLimit,jsonError} from '@/lib/api-utils';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request){
  const denied=requireReadAccess(request);if(denied)return denied;
  const limited=rateLimit(request,'year-pdf-tracker',{limit:30,windowMs:60000});if(limited)return limited;
  const [folder,database]=await Promise.allSettled([
    scanYearPaperPdfs(),
    (async()=>{await dbConnect();return YearPaper.find({}).lean();})(),
  ]);
  if(folder.status==='rejected')return jsonError(`Could not read the PDF folder: ${YEAR_PDF_ROOT}. Check that the drive is connected.`,503);
  const papers=database.status==='fulfilled'?database.value:null;
  const files=folder.value.map(file=>({...file,progress:yearPaperProgress(file,papers)})).sort(compareYearPdfs);
  return NextResponse.json({success:true,root:YEAR_PDF_ROOT,files,databaseAvailable:Boolean(papers),
    warning:papers?null:'Database status is unavailable. You can still copy prompts; completion checks will return when the database reconnects.',
    refreshedAt:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
}
