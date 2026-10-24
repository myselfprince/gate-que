import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import AdmZip from 'adm-zip';
import { jsonError, parseJson, rateLimit, requireMutationAccess, validateExportPayload, ValidationError } from '@/lib/api-utils';
import { buildThumbnailHtml, normalizeCutout, normalizeThumbnailSettings } from '@/lib/thumbnail-render.mjs';

export const runtime = 'nodejs';

export async function POST(request) {
  const denied = requireMutationAccess(request);
  if (denied) return denied;
  let browser, onAbort;
  try {
    const data = await parseJson(request);
    const { subject, chapter, questions } = validateExportPayload(data);
    const mode = data.mode || 'zip';
    if (!['preview', 'single', 'zip'].includes(mode)) throw new ValidationError('Thumbnail export mode is invalid.');
    const limited = rateLimit(request, mode === 'preview' ? 'thumbnail-preview' : 'thumbnail-export', { limit: mode === 'preview' ? 40 : 5, windowMs: 60_000 });
    if (limited) return limited;
    let settings, cutout;
    try { settings = normalizeThumbnailSettings(data.thumbnailSettings); cutout = normalizeCutout(data.cutout); }
    catch (error) { throw new ValidationError(error.message); }
    if (data.headlines !== undefined && (!Array.isArray(data.headlines) || data.headlines.length > 250 || data.headlines.some(item => typeof item !== 'string' || item.length > 200))) throw new ValidationError('Thumbnail headlines are invalid.');
    if (data.questionNumbers !== undefined && (!Array.isArray(data.questionNumbers) || data.questionNumbers.length !== questions.length || new Set(data.questionNumbers).size !== questions.length || data.questionNumbers.some(number => !Number.isInteger(number) || number < 1 || number > 1000))) throw new ValidationError('Thumbnail question numbers are invalid.');
    let items = questions.map((question, index) => ({ question, number: data.questionNumbers?.[index] ?? index + 1, headline: data.headlines?.[index] }));
    if (mode !== 'zip') {
      if (!Number.isInteger(data.questionIndex) || data.questionIndex < 0 || data.questionIndex >= items.length) throw new ValidationError('Choose a question to preview.');
      items = [items[data.questionIndex]];
    } else if (!settings.includeBlanks) items = items.filter(item => !item.question.isBlank);
    if (!items.length) throw new ValidationError('No questions selected for thumbnails.');
    browser = await puppeteer.launch({ headless: true, args: ['--disable-dev-shm-usage', '--disable-gpu'] });
    onAbort = () => { browser?.close().catch(() => {}); };
    request.signal.addEventListener('abort', onAbort, { once: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: mode === 'preview' ? 1 : settings.resolution / 1280 });
    // Render one card at a time so large chapter ZIPs do not retain hundreds of MathJax trees.
    const zip = mode === 'zip' ? new AdmZip() : null;
    const warnings = [];
    for (const item of items) {
      if (request.signal.aborted) throw Error('Export cancelled.');
      const html = buildThumbnailHtml({ subject, chapter, items: [item], settings, cutout: mode === 'preview' ? null : cutout, origin: new URL(request.url).origin });
      await page.setContent(html, { waitUntil: 'load', timeout: 25000 });
      await page.waitForSelector('html[data-ready="true"]', { timeout: 25000 });
      const status = await page.evaluate(() => ({ error: window.thumbnailError, warnings: window.thumbnailWarnings || [] }));
      if (status.error) return jsonError(status.error, 422);
      warnings.push(...status.warnings);
      const image = await (await page.$(`#q-${item.number}`)).screenshot({ type: 'png' });
      if (zip) zip.addFile(`Question_${item.number}.png`, Buffer.from(image));
      else return new NextResponse(image, { headers: { 'Content-Type': 'image/png', 'Content-Disposition': `attachment; filename="Question_${item.number}.png"`, 'Cache-Control': 'no-store', 'X-Thumbnail-Warnings': encodeURIComponent(JSON.stringify(warnings)) } });
    }
    zip.addFile('thumbnail-settings.json', Buffer.from(JSON.stringify({ subject, chapter, thumbnailSettings: settings, cutoutIncluded: Boolean(cutout), questionNumbers: items.map(item => item.number), warnings }, null, 2)));
    return new NextResponse(zip.toBuffer(), { headers: { 'Content-Type': 'application/zip', 'Content-Disposition': 'attachment; filename="youtube-thumbnails.zip"', 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (request.signal.aborted) return jsonError('Thumbnail export cancelled.', 499);
    if (error instanceof ValidationError) return jsonError(error.message);
    console.error('Thumbnail export failed:', error);
    return jsonError('Thumbnail export failed. Check the image assets and browser setup, then try again.', 500);
  } finally { if (onAbort) request.signal.removeEventListener('abort', onAbort); await browser?.close().catch(() => {}); }
}
