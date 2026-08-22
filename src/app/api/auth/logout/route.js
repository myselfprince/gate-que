import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth';
import { requireMutationAccess } from '@/lib/api-utils';

export async function POST(request) {
  const denied = requireMutationAccess(request);
  if (denied) return denied;

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 0, path: '/' });
  return response;
}
