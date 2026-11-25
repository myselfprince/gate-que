import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WorkspaceSetting from '@/models/WorkspaceSetting';
import { WORKSPACE_SETTINGS, normalizeWorkspaceSetting } from '@/lib/workspace-settings.mjs';
import { jsonError, parseJson, rateLimit, requireMutationAccess, requireReadAccess, unexpectedError } from '@/lib/api-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const known = key => Object.hasOwn(WORKSPACE_SETTINGS, key);
const body = setting => setting ? { value: setting.value, updatedAt: setting.updatedAt } : null;

export async function GET(request, { params }) {
  const denied = requireReadAccess(request); if (denied) return denied;
  const { key } = await params;
  if (!known(key)) return jsonError('Unknown setting.', 404);
  try {
    await dbConnect();
    const setting = await WorkspaceSetting.findOne({ key }).lean();
    // A saved value that no longer validates (for example after a rule change) is ignored, not served.
    let data = body(setting);
    if (data) { try { data.value = normalizeWorkspaceSetting(key, data.value); } catch { data = null; } }
    return NextResponse.json({ success: true, data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Settings GET error:', error);
    return unexpectedError();
  }
}

export async function PUT(request, { params }) {
  const denied = requireMutationAccess(request); if (denied) return denied;
  const { key } = await params;
  if (!known(key)) return jsonError('Unknown setting.', 404);
  // Sliders save as they move; the client debounces, and this bounds a runaway loop.
  const limited = rateLimit(request, `settings-${key}`, { limit: 240, windowMs: 60000 }); if (limited) return limited;
  try {
    let value;
    try { value = normalizeWorkspaceSetting(key, (await parseJson(request))?.value); }
    catch (error) { return jsonError(error.message); }
    await dbConnect();
    const setting = await WorkspaceSetting.findOneAndUpdate({ key }, { $set: { value } }, { returnDocument: 'after', upsert: true, runValidators: true }).lean();
    return NextResponse.json({ success: true, data: body(setting) });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return unexpectedError();
  }
}
