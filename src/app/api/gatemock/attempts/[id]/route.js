import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MockAttempt from '@/models/MockAttempt';
import { tokenHash, publicAttempt, finishExpired } from '@/lib/gatemock-server';
import { gradeAttempt, validateAttemptState } from '@/lib/gatemock.mjs';
import { parseJson, rateLimit, isSameOrigin, jsonError, unexpectedError } from '@/lib/api-utils';
export const runtime = 'nodejs';

async function handle(request, context, action) {
  if (action !== 'read' && !isSameOrigin(request)) return jsonError('Cross-origin requests are not allowed.', 403);
  const limited = rateLimit(request, 'mock-attempt', { limit: 180, windowMs: 60000 }); if (limited) return limited;
  const { id } = await context.params;
  const token = request.headers.get('authorization')?.replace(/^Bearer /, '') || '';
  if (!/^[a-f0-9]{64}$/.test(token) || !/^[a-f0-9-]{36}$/.test(id)) return jsonError('Attempt not found.', 404);
  try {
    await dbConnect(); let attempt = await MockAttempt.findOne({ _id: id, tokenHash: tokenHash(token) }).lean();
    if (!attempt) return jsonError('Attempt not found.', 404);
    attempt = await finishExpired(MockAttempt, attempt);
    if (action === 'read' || attempt.finishedAt) return NextResponse.json({ success: true, attempt: publicAttempt(attempt) });
    const body = await parseJson(request, 100000);
    if (!Number.isInteger(body.revision) || body.revision !== attempt.revision) return jsonError('This attempt changed in another tab. Reload before continuing.', 409);
    let state; try { state = validateAttemptState(body.state, attempt.questions); } catch (error) { return jsonError(error.message); }
    // Check the deadline again after parsing; never accept answers arriving late.
    if (Date.now() >= new Date(attempt.expiresAt).getTime()) {
      attempt = await finishExpired(MockAttempt, attempt);
      return NextResponse.json({ success: true, attempt: publicAttempt(attempt) });
    }
    const finished = action === 'submit' ? { finishedAt: new Date(), result: gradeAttempt(attempt.questions, state, attempt.negativeFraction) } : {};
    const saved = await MockAttempt.findOneAndUpdate({ _id: id, tokenHash: tokenHash(token), revision: body.revision, finishedAt: null },
      { $set: { state, ...finished }, $inc: { revision: 1 } }, { new: true }).lean();
    if (!saved) return jsonError('This attempt changed in another tab. Reload before continuing.', 409);
    return NextResponse.json({ success: true, attempt: publicAttempt(saved) });
  } catch (error) { if (error.name === 'ValidationError') return jsonError(error.message); console.error('Mock attempt failed:', error.name); return unexpectedError(); }
}
export const GET = (request, context) => handle(request, context, 'read');
export const PUT = (request, context) => handle(request, context, 'save');
export const POST = (request, context) => handle(request, context, 'submit');
