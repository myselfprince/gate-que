import { NextResponse } from 'next/server';
import { requireReadAccess, jsonError, rateLimit } from '@/lib/api-utils';
import { normalizeGateOverflowUrl } from '@/lib/solution-links.mjs';
import { parseGateOverflowPage } from '@/lib/gateoverflow-reader.mjs';

export const runtime = 'nodejs';
const MAX_BYTES = 3 * 1024 * 1024;
export async function GET(request) {
  const denied = requireReadAccess(request); if (denied) return denied;
  const limited = rateLimit(request, 'admin-reference', { limit: 30, windowMs: 60000 }); if (limited) return limited;
  let url;
  try { url = normalizeGateOverflowUrl(new URL(request.url).searchParams.get('url')); if (!url) throw new Error('Enter a GATE Overflow question URL.'); }
  catch (error) { return jsonError(error.message); }
  try {
    const signal = AbortSignal.timeout(15000);
    let response;
    for (let redirects = 0; redirects < 4; redirects++) {
      response = await fetch(url, { signal, redirect: 'manual', cache: 'no-store', headers: { Accept: 'text/html' } });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get('location');
      await response.body?.cancel();
      if (!location) return jsonError('The reference website returned an invalid redirect.', 502);
      // Every redirect stays on the same validated public source.
      url = normalizeGateOverflowUrl(new URL(location, url).href);
    }
    if (!response.ok) { await response.body?.cancel(); return jsonError(`GATE Overflow could not be loaded here (HTTP ${response.status}). Open the original page, or use the saved explanation below.`, 502); }
    if (!response.headers.get('content-type')?.includes('text/html')) { await response.body?.cancel(); return jsonError('The reference must be an HTML question page.', 502); }
    const reader = response.body.getReader(), chunks = [];
    let bytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_BYTES) { await reader.cancel(); return jsonError('The reference page is too large.', 413); }
        chunks.push(Buffer.from(value));
      }
    } finally { reader.releaseLock(); }
    return NextResponse.json({ success: true, ...parseGateOverflowPage(Buffer.concat(chunks).toString('utf8'), url) }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return jsonError(error.name === 'TimeoutError' ? 'GATE Overflow took too long to respond. You can retry or open the original page.' : 'The discussion could not be loaded. Open the original page, or use the saved explanation below.', 502);
  }
}
