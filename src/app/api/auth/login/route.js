import { NextResponse } from 'next/server';
import { createSession, isAuthConfigured, isCorrectPassword, isAuthRequired, sessionCookieOptions, SESSION_COOKIE } from '@/lib/auth';
import { isSameOrigin, jsonError, parseJson, rateLimit, ValidationError } from '@/lib/api-utils';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    if (!isSameOrigin(request)) return jsonError('Cross-origin requests are not allowed.', 403);
    if (!isAuthRequired()) return NextResponse.json({ success: true, data: { authenticationRequired: false } });
    if (!isAuthConfigured()) return jsonError('Authentication is not configured. Set JWT_SECRET and APP_PASSWORD.', 503);

    const limited = rateLimit(request, 'login', { limit: 8, windowMs: 15 * 60 * 1000 });
    if (limited) return limited;

    const { password } = await parseJson(request, 16 * 1024);
    if (!isCorrectPassword(password)) return jsonError('Incorrect password.', 401);

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, createSession(), sessionCookieOptions());
    return response;
  } catch (error) {
    if (error instanceof ValidationError) return jsonError(error.message);
    console.error('Login failed:', error);
    return jsonError('Unable to sign in. Please try again.', 500);
  }
}
