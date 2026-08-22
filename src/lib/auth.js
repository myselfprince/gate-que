import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { isAuthRequired, SESSION_COOKIE } from '@/lib/auth-config';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const toBase64Url = (value) => Buffer.from(value).toString('base64url');

const getSecret = () => process.env.JWT_SECRET;

const sign = (value) => createHmac('sha256', getSecret()).update(value).digest('base64url');

const safelyEqual = (left, right) => {
  const leftBuffer = Buffer.from(left || '');
  const rightBuffer = Buffer.from(right || '');
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

export { isAuthRequired, SESSION_COOKIE };

export const isAuthConfigured = () => Boolean(getSecret() && process.env.APP_PASSWORD);

export const createSession = () => {
  const payload = toBase64Url(JSON.stringify({ exp: Date.now() + SESSION_TTL_SECONDS * 1000, nonce: randomBytes(16).toString('hex') }));
  return `${payload}.${sign(payload)}`;
};

export const hasValidSession = (request) => {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !getSecret()) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safelyEqual(signature, sign(payload))) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number.isFinite(session.exp) && session.exp > Date.now();
  } catch {
    return false;
  }
};

export const unauthorizedResponse = () => NextResponse.json(
  { success: false, error: 'Authentication is required.' },
  { status: 401 }
);

export const authConfigurationResponse = () => NextResponse.json(
  { success: false, error: 'Authentication is not configured. Set JWT_SECRET and APP_PASSWORD.' },
  { status: 503 }
);

export const requireAccess = (request) => {
  if (!isAuthRequired()) return null;
  if (!isAuthConfigured()) return authConfigurationResponse();
  return hasValidSession(request) ? null : unauthorizedResponse();
};

export const isCorrectPassword = (password) => {
  if (!isAuthConfigured() || typeof password !== 'string') return false;
  return safelyEqual(password, process.env.APP_PASSWORD);
};

export const sessionCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: SESSION_TTL_SECONDS,
  path: '/'
});
