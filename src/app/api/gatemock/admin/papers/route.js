import path from 'node:path';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import YearPaper from '@/models/YearPaper';
import { adminYearPaperSummary, validatePreparedYearPaper } from '@/lib/admin-year-papers.mjs';
import { preparePaperAssets, publishPaperAssets } from '@/lib/year-paper-assets-server.mjs';
import { PAPER_ASSET_COLLECTION } from '@/lib/year-paper-assets.mjs';
import { requireReadAccess, requireMutationAccess, parseJson, jsonError, unexpectedError, ValidationError } from '@/lib/api-utils';

export const runtime = 'nodejs';
export async function GET(request) {
  const denied = requireReadAccess(request); if (denied) return denied;
  try {
    await dbConnect();
    const papers = await YearPaper.find({}).sort({ year: -1, examPaper: 1, setNum: 1 }).lean();
    return NextResponse.json({ success: true, papers: papers.map(adminYearPaperSummary) }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { console.error('Year-paper admin read failed:', error.name); return unexpectedError(); }
}

export async function POST(request) {
  const denied = requireMutationAccess(request); if (denied) return denied;
  try {
    const body = await parseJson(request, 2 * 1024 * 1024);
    let paper;
    try { paper = validatePreparedYearPaper(body); } catch (error) { return jsonError(error.message); }
    await dbConnect();
    const existing = await YearPaper.exists({ $or: [{ slug: paper.slug }, { year: paper.year, examPaper: paper.examPaper, setNum: paper.setNum }] });
    if (existing) return jsonError('This previous-year paper already exists. Open its review page to edit answers or solution links.', 409);
    let prepared;
    try { prepared = await preparePaperAssets(paper, path.join(process.cwd(), 'public')); }
    catch { return jsonError('A diagram is missing or invalid. Prepare its referenced image files in the paper’s asset folder before importing.'); }
    await publishPaperAssets(YearPaper.db.collection(PAPER_ASSET_COLLECTION), prepared.documents);
    const saved = await YearPaper.create(prepared.paper);
    return NextResponse.json({ success: true, paper: adminYearPaperSummary(saved.toObject()) }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError || error.name === 'ValidationError') return jsonError(error.message);
    if (error.code === 11000) return jsonError('This year / paper / set already exists. Refresh the paper library.', 409);
    console.error('Year-paper import failed:', error.name); return unexpectedError();
  }
}
