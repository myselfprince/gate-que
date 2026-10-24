import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { jsonError, requireReadAccess } from '@/lib/api-utils';

export const runtime = 'nodejs';
export async function GET(request, { params }) {
  const denied = requireReadAccess(request);
  if (denied) return denied;
  const { asset } = await params;
  const [folder, file] = asset;
  if (asset.length !== 2 || !['build', 'wasm', 'standard_fonts', 'cmaps'].includes(folder) || !/^[A-Za-z0-9_.-]+$/.test(file) || file.includes('..') || (folder === 'build' && file !== 'pdf.worker.min.mjs')) return jsonError('Viewer asset not found.', 404);
  try {
    const bytes = await fs.readFile(path.join(process.cwd(), 'node_modules', 'pdfjs-dist', folder, file));
    return new NextResponse(new Uint8Array(bytes), { headers: { 'Content-Type': file.endsWith('.mjs') ? 'application/javascript' : file.endsWith('.wasm') ? 'application/wasm' : 'application/octet-stream', 'Cache-Control': 'private, max-age=604800', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return jsonError('Viewer asset not found.', 404); }
}
