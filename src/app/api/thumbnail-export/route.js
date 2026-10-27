import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import AdmZip from 'adm-zip';
import { jsonError, parseJson, rateLimit, requireMutationAccess, validateExportPayload, ValidationError } from '@/lib/api-utils';
import { buildThumbnailHtml, normalizeCutout, normalizeThumbnailSettings } from '@/lib/thumbnail-render.mjs';
import { editorForQuestion, normalizeThumbnailEditor, SLIDES_PER_GROUP } from '@/lib/thumbnail-editor.mjs';
import { acquirePreviewPage } from '@/lib/thumbnail-preview-browser.mjs';

export const runtime = 'nodejs';

export async function POST(request) {
  const denied = requireMutationAccess(request);
  if (denied) return denied;
  let browser, onAbort, page, previewLease;
  try {
    const data = await parseJson(request);
    const { subject, chapter, questions } = validateExportPayload(data);
    const mode = data.mode || 'zip';
    if (!['preview', 'slides', 'review', 'single', 'zip'].includes(mode)) throw new ValidationError('Thumbnail export mode is invalid.');
    const batchPreview = mode === 'slides' || mode === 'review';
    if (batchPreview && questions.length > SLIDES_PER_GROUP) throw new ValidationError('Preview at most 10 slides at a time.');
    const limited = rateLimit(request, mode === 'review' ? 'thumbnail-review' : mode === 'slides' ? 'thumbnail-slides' : mode === 'preview' ? 'thumbnail-preview' : 'thumbnail-export', { limit: mode === 'review' ? 60 : mode === 'slides' ? 12 : mode === 'preview' ? 40 : 5, windowMs: 60_000 });
    if (limited) return limited;
    let settings, cutout, editor;
    try { settings = normalizeThumbnailSettings(data.thumbnailSettings); cutout = normalizeCutout(data.cutout); editor = data.editor ? normalizeThumbnailEditor(data.editor) : null; }
    catch (error) { throw new ValidationError(error.message); }
    if (data.headlines !== undefined && (!Array.isArray(data.headlines) || data.headlines.length > 250 || data.headlines.some(item => typeof item !== 'string' || item.length > 200))) throw new ValidationError('Thumbnail headlines are invalid.');
    if (data.questionNumbers !== undefined && (!Array.isArray(data.questionNumbers) || data.questionNumbers.length !== questions.length || new Set(data.questionNumbers).size !== questions.length || data.questionNumbers.some(number => !Number.isInteger(number) || number < 1 || number > 1000))) throw new ValidationError('Thumbnail question numbers are invalid.');
    let items = questions.map((question, index) => ({ question, number: data.questionNumbers?.[index] ?? index + 1, headline: data.headlines?.[index] }));
    if (mode === 'single' || mode === 'preview') {
      if (!Number.isInteger(data.questionIndex) || data.questionIndex < 0 || data.questionIndex >= items.length) throw new ValidationError('Choose a question to preview.');
      items = [items[data.questionIndex]];
    } else if (mode === 'zip' && !settings.includeBlanks) items = items.filter(item => !item.question.isBlank);
    if (!items.length) throw new ValidationError('No questions selected for thumbnails.');
    if (mode === 'review') { previewLease = await acquirePreviewPage(request.signal); page = previewLease.page; }
    else { browser = await puppeteer.launch({ headless: true, args: ['--disable-dev-shm-usage', '--disable-gpu'] }); page = await browser.newPage(); }
    onAbort = () => { if (previewLease) void page.close().catch(() => {}); else void browser?.close().catch(() => {}); };
    request.signal.addEventListener('abort', onAbort, { once: true });
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: mode === 'slides' ? .25 : mode === 'preview' || mode === 'review' ? 1 : settings.resolution / 1280 });
    if (batchPreview) {
      // One browser and one MathJax pass for ten small previews; never render the full chapter here.
      if (request.signal.aborted) throw Error('Preview cancelled.');
      await page.setContent(buildThumbnailHtml({ subject, chapter, items, settings, origin: new URL(request.url).origin }), { waitUntil: 'load', timeout: 25000 });
      await page.waitForSelector('html[data-ready="true"]', { timeout: 25000 });
      const status = await page.evaluate(() => ({ error: window.thumbnailError, warnings: window.thumbnailWarnings || [] }));
      if (status.error) return jsonError(status.error, 422);
      const slides = [];
      for (const item of items) {
        if (request.signal.aborted) throw Error('Preview cancelled.');
        const image = await (await page.$(`#q-${item.number}`)).screenshot(mode === 'review' ? { type: 'jpeg', quality: 90 } : { type: 'png' });
        slides.push({ questionId: item.question.id, number: item.number, dataUrl: `data:image/${mode === 'review' ? 'jpeg' : 'png'};base64,${Buffer.from(image).toString('base64')}`, warnings: status.warnings.filter(warning => warning.startsWith(`Q${item.number}:`)) });
      }
      return NextResponse.json({ slides }, { headers: { 'Cache-Control': 'no-store' } });
    }
    // Render one card at a time so large chapter ZIPs do not retain hundreds of MathJax trees.
    const zip = mode === 'zip' ? new AdmZip() : null;
    const warnings = [];
    for (const item of items) {
      if (request.signal.aborted) throw Error('Export cancelled.');
      const html = buildThumbnailHtml({ subject, chapter, items: [item], settings, cutout: mode === 'preview' ? null : cutout, editor: mode === 'preview' || !editor ? null : editorForQuestion(editor, item.question.id), origin: new URL(request.url).origin });
      await page.setContent(html, { waitUntil: 'load', timeout: 25000 });
      await page.waitForSelector('html[data-ready="true"]', { timeout: 25000 });
      const status = await page.evaluate(() => ({ error: window.thumbnailError, warnings: window.thumbnailWarnings || [] }));
      if (status.error) return jsonError(status.error, 422);
      warnings.push(...status.warnings);
      const image = await (await page.$(`#q-${item.number}`)).screenshot({ type: 'png' });
      if (zip) zip.addFile(`Question_${item.number}.png`, Buffer.from(image));
      else return new NextResponse(image, { headers: { 'Content-Type': 'image/png', 'Content-Disposition': `attachment; filename="Question_${item.number}.png"`, 'Cache-Control': 'no-store', 'X-Thumbnail-Warnings': encodeURIComponent(JSON.stringify(warnings)) } });
    }
    zip.addFile('thumbnail-settings.json', Buffer.from(JSON.stringify({ subject, chapter, thumbnailSettings: settings, layerCount: editor?.layers.length || 0, individualQuestionDesigns: Object.keys(editor?.questionLayers || {}).length, cutoutIncluded: Boolean(cutout), questionNumbers: items.map(item => item.number), warnings }, null, 2)));
    return new NextResponse(zip.toBuffer(), { headers: { 'Content-Type': 'application/zip', 'Content-Disposition': 'attachment; filename="youtube-thumbnails.zip"', 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (request.signal.aborted) return jsonError('Thumbnail export cancelled.', 499);
    if (error instanceof ValidationError) return jsonError(error.message);
    console.error('Thumbnail export failed:', error);
    return jsonError('Thumbnail export failed. Check the image assets and browser setup, then try again.', 500);
  } finally { if (onAbort) request.signal.removeEventListener('abort', onAbort); if (previewLease) await previewLease.release(); else await browser?.close().catch(() => {}); }
}
