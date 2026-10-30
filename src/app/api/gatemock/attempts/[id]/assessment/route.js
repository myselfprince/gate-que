import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MockAttempt from '@/models/MockAttempt';
import { tokenHash, publicAttempt, refreshAttemptAnswers } from '@/lib/gatemock-server';
import { gradeAttempt } from '@/lib/gatemock.mjs';
import { isSameOrigin, parseJson, rateLimit, jsonError, unexpectedError } from '@/lib/api-utils';
export const runtime = 'nodejs';
export async function POST(request, context) {
  if (!isSameOrigin(request)) return jsonError('Cross-origin requests are not allowed.',403);
  const limited = rateLimit(request,'mock-assessment',{limit:90,windowMs:60000}); if(limited)return limited;
  const {id}=await context.params;
  const token=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';
  if(!/^[a-f0-9]{64}$/.test(token)||!/^[a-f0-9-]{36}$/.test(id))return jsonError('Attempt not found.',404);
  try {
    const body=await parseJson(request,10000);
    await dbConnect();
    let attempt=await MockAttempt.findOne({_id:id,tokenHash:tokenHash(token)}).lean();
    if(!attempt)return jsonError('Attempt not found.',404);
    attempt=await refreshAttemptAnswers(MockAttempt,attempt);
    if(!attempt.finishedAt)return jsonError('Submit the test before self-assessing written answers.');
    if(body.revision!==attempt.revision)return jsonError('Attempt changed. Refresh before assessing.',409);
    const entry=attempt.result.entries.find(e=>e.question.key===body.key);
    if(!entry?.manualReview || !entry.response || (Array.isArray(entry.response)&&!entry.response.length))return jsonError('Only answered manual-review questions can be self-assessed.');
    if(entry.question.dependsOnKey && entry.linkedEligible!==true)return jsonError('Assess the linked prerequisite as fully correct before assessing this part.');
    if(typeof body.marks!=='number'||!Number.isFinite(body.marks)||body.marks<0||body.marks>Number(entry.question.marks)||body.marks*2%1!==0)return jsonError('Choose marks in half-mark steps within the question maximum.');
    const manualScores=[...(attempt.result.manualScores||[]).filter(item=>item.key!==body.key),{key:body.key,marks:body.marks}];
    const result=gradeAttempt(attempt.questions,attempt.state,attempt.negativeFraction,manualScores);
    const saved=await MockAttempt.findOneAndUpdate({_id:id,tokenHash:tokenHash(token),revision:body.revision,finishedAt:{$ne:null}},{$set:{result},$inc:{revision:1}},{returnDocument:'after'}).lean();
    if(!saved)return jsonError('Attempt changed. Refresh before assessing.',409);
    return NextResponse.json({success:true,attempt:publicAttempt(saved)});
  } catch(error){console.error('Self-assessment failed:',error.name);return unexpectedError();}
}
