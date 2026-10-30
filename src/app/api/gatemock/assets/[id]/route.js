import {NextResponse} from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import {PAPER_ASSET_COLLECTION} from '@/lib/year-paper-assets.mjs';
import {readPaperAsset} from '@/lib/year-paper-assets-server.mjs';
import {jsonError} from '@/lib/api-utils';
export const runtime='nodejs';
export async function GET(_request,{params}) {
 const {id}=await params;
 if(!/^[a-f0-9]{64}$/.test(id))return jsonError('Diagram not found.',404);
 try {
  await dbConnect();const asset=await readPaperAsset(mongoose.connection.db.collection(PAPER_ASSET_COLLECTION),id);
  if(!asset)return jsonError('Diagram not found.',404);
  return new NextResponse(new Uint8Array(asset.data),{headers:{'Content-Type':asset.contentType,'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}});
 } catch(error) {console.error('Paper diagram failed:',error.name);return jsonError('Diagram unavailable.',500);}
}
