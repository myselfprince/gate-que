import { NextResponse } from 'next/server';
import { hasValidSession, isAuthConfigured, isAuthRequired } from '@/lib/auth';

export async function GET(request) {
  const authenticationRequired = isAuthRequired();
  return NextResponse.json({
    success: true,
    data: {
      authenticationRequired,
      configured: !authenticationRequired || isAuthConfigured(),
      authenticated: !authenticationRequired || hasValidSession(request)
    }
  });
}
