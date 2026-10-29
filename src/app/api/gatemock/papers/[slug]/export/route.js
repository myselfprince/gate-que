import {NextResponse} from 'next/server';
import dbConnect from '@/lib/mongodb';
import YearPaper from '@/models/YearPaper';
import {exportYearPaper,yearPaperZip} from '@/lib/year-paper-export.mjs';
import {requireReadAccess,rateLimit,jsonError} from '@/lib/api-utils';
export const runtime='nodejs';
export async function GET(request,context){
  const denied=requireReadAccess(request);if(denied)return denied;
  const limited=rateLimit(request,'year-paper-export',{limit:12,windowMs:60000});if(limited)return limited;
  const {slug}=await context.params;
  if(!/^[a-z0-9-]{1,80}$/.test(slug))return jsonError('Paper not found.',404);
  const url=new URL(request.url),format=url.searchParams.get('format')||'pdf',theme=url.searchParams.get('theme')||'dark';
  if(!['pdf','key','zip'].includes(format)||!['dark','light'].includes(theme))return jsonError('Choose a valid export format and theme.');
  try{
    await dbConnect();const paper=await YearPaper.findOne({slug}).lean();if(!paper)return jsonError('Paper not found.',404);
    // Serialize only persisted paper fields; Mongoose metadata must not invalidate the file cache.
    const {_id,createdAt,updatedAt,__v,...content}=paper;
    const result=await exportYearPaper(content,theme);
    const data=format==='key'?result.answerKey:format==='zip'?yearPaperZip(result):result.pdf;
    const filename=`${slug}${format==='key'?'-solutions':theme==='light'?'-print':''}.${format==='zip'?'zip':'pdf'}`;
    return new NextResponse(new Uint8Array(data),{headers:{'Content-Type':format==='zip'?'application/zip':'application/pdf','Content-Disposition':`attachment; filename="${filename}"`,'Cache-Control':'private, no-store'}});
  }catch(error){console.error('Year paper export failed:',error.name);return jsonError('PDF export failed. Please try again.',500);}
}
