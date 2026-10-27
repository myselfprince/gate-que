import { randomBytes, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MockAttempt from '@/models/MockAttempt';
import { buildMock } from '@/lib/gatemock.mjs';
import { readMockBank, tokenHash, publicAttempt } from '@/lib/gatemock-server';
import { parseJson, rateLimit, isSameOrigin, jsonError, unexpectedError } from '@/lib/api-utils';
export const runtime = 'nodejs';
export async function POST(request) {
  if (!isSameOrigin(request)) return jsonError('Cross-origin requests are not allowed.', 403);
  const limited = rateLimit(request, 'mock-create', { limit: 12, windowMs: 60000 }); if (limited) return limited;
  try {
    const config = await parseJson(request, 30000);
    await dbConnect(); const { bank, papers } = await readMockBank();
    let built; try { built = buildMock(bank, config, papers); } catch (error) { return jsonError(error.message); }
    const token = randomBytes(32).toString('hex'), now = Date.now();
    const attempt = await MockAttempt.create({ _id: randomUUID(), tokenHash: tokenHash(token), ...built,
      startedAt: new Date(now), expiresAt: new Date(now + built.durationMinutes * 60000), purgeAt: new Date(now + 30 * 86400000),
      state: { responses: [], marked: [], visited: [built.questions[0].key], currentIndex: 0 }, revision: 0 });
    return NextResponse.json({ success: true, token, attempt: publicAttempt(attempt.toObject()) });
  } catch (error) { if (error.name === 'ValidationError') return jsonError(error.message); console.error('Mock creation failed:', error.name); return unexpectedError(); }
}
