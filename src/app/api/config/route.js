import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AppConfig from '@/models/AppConfig';
import { DEFAULT_CONFIG } from '@/lib/syllabus';
import { jsonError, parseJson, requireMutationAccess, requireReadAccess, unexpectedError, validateConfigPayload, ValidationError } from '@/lib/api-utils';

export const runtime = 'nodejs';

export async function GET(request) {
  const denied = requireReadAccess(request);
  if (denied) return denied;
  try {
    await dbConnect();
    let config = await AppConfig.findOne({ configName: "default" });
    
    if (!config) {
      config = await AppConfig.create({
        configName: "default",
        ...DEFAULT_CONFIG
      });
    }
    
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Config GET error:', error);
    return unexpectedError();
  }
}

export async function POST(request) {
  const denied = requireMutationAccess(request);
  if (denied) return denied;
  try {
    await dbConnect();
    const { syllabus, topicMapping } = validateConfigPayload(await parseJson(request));
    const config = await AppConfig.findOneAndUpdate(
      { configName: "default" },
      { $set: { syllabus, topicMapping } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    if (error instanceof ValidationError) return jsonError(error.message);
    console.error('Config POST error:', error);
    return unexpectedError();
  }
}
