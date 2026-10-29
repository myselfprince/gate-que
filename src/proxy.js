import { NextResponse } from 'next/server';
import { isAuthRequired, SESSION_COOKIE } from '@/lib/auth-config';

export function proxy(request) {
  if (!isAuthRequired()) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api/gatemock/') && !pathname.startsWith('/api/gatemock/admin')) return NextResponse.next();
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth/')) return NextResponse.next();
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ success: false, error: 'Authentication is required.' }, { status: 401 });
  }

  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/', '/gatemock/admin/:path*', '/scraper/:path*', '/scraped-view/:path*', '/status/:path*', '/pdf-tracker/:path*', '/gateyearpaperpdf/:path*', '/kmap-maker/:path*', '/diagram-maker/:path*', '/api/:path*']
};
