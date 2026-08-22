import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import AdmZip from 'adm-zip';
import { getSafeImageNames, jsonError, parseJson, rateLimit, requireMutationAccess, validateExportPayload, ValidationError } from '@/lib/api-utils';

export const runtime = 'nodejs';

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const imageUrl = (origin, subject, chapter, imageName, extension) => {
  const segments = [subject, chapter, `${imageName}${extension}`].map(encodeURIComponent);
  return `${origin}/${segments.join('/')}`;
};

const renderQuestion = (question, index, origin, subject, chapter, contentWidth) => {
  if (question.isBlank) {
    return `<div class="export-card" id="q-${index}" style="background: transparent; border: 4px dashed #45475a;"><div style="width: ${contentWidth}%; height: 350px; display: flex; align-items: center; justify-content: center;"><span style="color: #45475a; font-size: 36px; font-weight: bold;">[Blank Placeholder - Q${index}]</span></div></div><br/>`;
  }

  let text = escapeHtml(question.text).replace(/\r?\n/g, '<br>');
  getSafeImageNames(question.diagram).forEach((imageName, imageIndex) => {
    const source = imageUrl(origin, subject, chapter, imageName, question.ext);
    const imageTag = `<div class="img-placeholder"><img src="${source}" alt="Question diagram" /></div>`;
    const token = `[IMG_${imageIndex + 1}]`;
    if (text.includes(token)) text = text.replace(token, imageTag);
    else if (imageIndex === 0 && text.includes('[DIAGRAM_PLACEHOLDER]')) text = text.replace('[DIAGRAM_PLACEHOLDER]', imageTag);
    else text += imageTag;
  });
  text = text.replace(/\[IMG_\d+\]|\[DIAGRAM_PLACEHOLDER\]/g, '');

  const codeTag = question.code ? `<div class="code-block">${escapeHtml(question.code)}</div>` : '';
  const hasCodeToken = text.includes('[CODE]');
  if (hasCodeToken) text = text.replace('[CODE]', codeTag);
  else text += codeTag;

  const renderOption = (option) => {
    if (!option) return '';
    if (option.startsWith('IMG:')) {
      const imageName = option.slice(4).trim();
      if (!getSafeImageNames(imageName).length) return '[Invalid image name]';
      return `<img src="${imageUrl(origin, subject, chapter, imageName, question.ext)}" alt="Option diagram" style="max-height:80px; vertical-align:middle;"/>`;
    }
    const className = question.isCodeOptions ? 'option-code' : '';
    return `<span class="${className}">${escapeHtml(option).replace(/\r?\n/g, '<br>')}</span>`;
  };

  const hasOptions = question.optA || question.optB || question.optC || question.optD;
  const options = hasOptions
    ? `<div style="margin-top: 20px;"><div><strong>(A)</strong> ${renderOption(question.optA)}</div><div><strong>(B)</strong> ${renderOption(question.optB)}</div><div><strong>(C)</strong> ${renderOption(question.optC)}</div><div><strong>(D)</strong> ${renderOption(question.optD)}</div></div>`
    : (question.isProof ? '' : `<div style="margin-top:20px; color:#f38ba8;"><strong>NAT Answer:</strong> ${escapeHtml(question.natAnswer || '_________________')}</div>`);

  return `<div class="export-card" id="q-${index}"><div style="width: ${contentWidth}%;"><div class="meta">GATE ${escapeHtml(question.year)} | ${escapeHtml(question.marks)} Mark</div><div class="question-text">${text}</div>${options}</div></div><br/>`;
};

export async function POST(request) {
  const denied = requireMutationAccess(request);
  if (denied) return denied;
  const limited = rateLimit(request, 'export-images', { limit: 3, windowMs: 60_000 });
  if (limited) return limited;

  let browser;
  try {
    const { subject, chapter, questions, contentWidth } = validateExportPayload(await parseJson(request));
    if (!questions.length) return jsonError('At least one question is required for export.');
    const origin = new URL(request.url).origin;
    const cards = questions.map((question, index) => renderQuestion(question, index + 1, origin, subject, chapter, contentWidth)).join('');
    const html = `<!doctype html><html><head><meta charset="UTF-8" /><script>window.MathJax={tex:{inlineMath:[['$','$'],['\\\\(','\\\\)']],displayMath:[['$$','$$'],['\\\\[','\\\\]']]},startup:{typeset:false}};</script><script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script><style>body{background:#1a1a1b;color:#cdd6f4;font-family:sans-serif;padding:20px}.export-card{background:#000;padding:15px 20px;border-radius:10px;margin-bottom:20px;width:1100px;font-size:26px;display:inline-block}.meta{display:inline-block;background:#a6e3a1;color:#11111b;font-weight:900;margin-bottom:25px;font-size:38px;padding:2px 10px;border-radius:8px}.question-text{line-height:1.5}.code-block,.option-code{background:#181825;padding:15px;border:1px solid #45475a;font-family:monospace;white-space:pre-wrap;margin:15px 0;font-size:22px}.option-code{padding:0;border:0;margin:0}.img-placeholder{border:1px dashed #74c7ec;padding:10px;text-align:center;margin:10px 0}img{max-width:100%;max-height:350px}</style></head><body><div id="container">${cards}</div><script>window.MathJax.typesetPromise().then(()=>{const done=document.createElement('div');done.id='mathjax-done';document.body.appendChild(done);});</script></body></html>`;

    browser = await puppeteer.launch({
      headless: true,
      args: ['--disable-dev-shm-usage', '--disable-gpu']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1000, deviceScaleFactor: 3 });
    await page.setContent(html, { waitUntil: 'load', timeout: 20_000 });
    await page.waitForSelector('#mathjax-done', { timeout: 15_000 });

    const zip = new AdmZip();
    for (let index = 0; index < questions.length; index += 1) {
      const element = await page.$(`#q-${index + 1}`);
      if (element) zip.addFile(`Question_${index + 1}.png`, await element.screenshot({ type: 'png' }));
    }

    return new NextResponse(zip.toBuffer(), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="gate-pyqs-images.zip"',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    if (error instanceof ValidationError) return jsonError(error.message);
    console.error('Image export error:', error);
    return jsonError('Image export failed. Please try again.', 500);
  } finally {
    await browser?.close().catch((cleanupError) => console.error('Browser cleanup error:', cleanupError));
  }
}
