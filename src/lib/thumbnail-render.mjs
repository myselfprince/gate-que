import { cleanLabel } from './youtube-metadata.mjs';
import { normalizePngImage, normalizeThumbnailEditor, layerBoxStyle, layerContentStyle, layerImageStyle } from './thumbnail-editor.mjs';
export { normalizePngImage as normalizeCutout } from './thumbnail-editor.mjs';

export const THUMBNAIL_WIDTH = 1280;
export const THUMBNAIL_HEIGHT = 720;
export const DEFAULT_THUMBNAIL_SETTINGS = {
  template: 'question', theme: 'dark', textSide: 'left', contentWidth: 64, fontSize: 34,
  accent: '#a6e3a1', brand: 'G4Gate', resolution: 1920, showAnswer: false, includeBlanks: false,
  overlayX: 70, overlayY: 15, overlayWidth: 28, overlayOpacity: 1, overlayFlip: false,
  backgroundColor: '#10131c', customBackground: false, showQuestion: true,
};
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const bounded = (value, fallback, min, max) => {
  const number = Number(value ?? fallback);
  if (!Number.isFinite(number)) throw Error('Thumbnail settings contain an invalid number.');
  return Math.max(min, Math.min(max, number));
};
export function normalizeThumbnailSettings(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Thumbnail settings are invalid.');
  const result = { ...DEFAULT_THUMBNAIL_SETTINGS };
  for (const [key, allowed] of Object.entries({ template: ['question', 'topic'], theme: ['dark', 'navy', 'light'], textSide: ['left', 'right'], resolution: [1280, 1920, 3840] })) {
    if (value[key] !== undefined && !allowed.includes(value[key])) throw Error(`Thumbnail ${key} is invalid.`);
    result[key] = value[key] ?? result[key];
  }
  for (const [key, min, max] of [['contentWidth', 40, 100], ['fontSize', 22, 54], ['overlayX', -400, 400], ['overlayY', -400, 400], ['overlayWidth', .5, 400], ['overlayOpacity', 0, 1]]) result[key] = bounded(value[key], result[key], min, max);
  for (const key of ['showAnswer', 'includeBlanks', 'overlayFlip', 'customBackground']) result[key] = value[key] === true;
  result.showQuestion = value.showQuestion !== false;
  if (value.backgroundColor !== undefined && !/^#[\da-f]{6}$/i.test(value.backgroundColor)) throw Error('Thumbnail background must be a hex colour.');
  result.backgroundColor = value.backgroundColor ?? result.backgroundColor;
  if (value.accent !== undefined && !/^#[\da-f]{6}$/i.test(value.accent)) throw Error('Thumbnail accent must be a hex colour.');
  result.accent = value.accent ?? result.accent;
  if (value.brand !== undefined && (typeof value.brand !== 'string' || value.brand.length > 60)) throw Error('Thumbnail branding is too long.');
  result.brand = value.brand ?? result.brand;
  return result;
}

// Percent coordinates refer to the top-left of the actual image, not its centre.
export function cutoutPlacement(settings, cutout) {
  if (!cutout) return null;
  const width = settings.overlayWidth;
  const height = width * THUMBNAIL_WIDTH / THUMBNAIL_HEIGHT * cutout.height / cutout.width;
  return { width, height, x: settings.overlayX, y: settings.overlayY };
}

function questionMarkup(question, origin, subject, chapter) {
  const image = name => `<img src="${escape(`${origin}/${[subject, chapter, `${name}${question.ext || '.png'}`].map(encodeURIComponent).join('/')}`)}" alt="Question diagram" />`;
  const names = String(question.diagram || '').split(',').map(name => name.trim()).filter(name => /^[A-Za-z0-9 .()_-]+$/.test(name) && name !== 'auto');
  const used = new Set();
  let text = escape(question.text).replace(/\[IMG_(\d+)\]|\[DIAGRAM_PLACEHOLDER\]/g, (match, number) => {
    const index = number ? Number(number) - 1 : 0;
    if (!names[index]) return '';
    used.add(index); return `<div class="diagram">${image(names[index])}</div>`;
  });
  const code = question.code ? `<pre>${escape(question.code)}</pre>` : '';
  if (text.includes('[CODE]')) text = text.replaceAll('[CODE]', code);
  else text += code;
  text += names.filter((_, index) => !used.has(index)).map(name => `<div class="diagram">${image(name)}</div>`).join('');
  const options = ['A', 'B', 'C', 'D'].filter(letter => question[`opt${letter}`]).map(letter => {
    const value = question[`opt${letter}`];
    const content = value.startsWith('IMG:') ? (/^[A-Za-z0-9 .()_-]+$/.test(value.slice(4).trim()) ? image(value.slice(4).trim()) : '[Invalid diagram]') : escape(value);
    return `<div class="option"><b>(${letter})</b> <span${question.isCodeOptions ? ' class="option-code"' : ''}>${content}</span></div>`;
  }).join('');
  const twoCols = question.optLayout === '2col' || question.optLayout !== '1col' && ['A','B','C','D'].every(letter => (question[`opt${letter}`] || '').length <= 65 && !(question[`opt${letter}`] || '').includes('$$'));
  return `<div class="question-text">${text}</div>${options ? `<div class="options ${twoCols ? 'two-cols' : ''}">${options}</div>` : ''}`;
}

const css = style => Object.entries(style).filter(([, value]) => value !== undefined).map(([key, value]) => `${key.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`)}:${value}`).join(';');
function editorMarkup(editor) {
  return editor.layers.filter(layer => !layer.hidden).map(layer => {
    const asset = editor.assets.find(asset => asset.id === layer.assetId);
    const content = layer.type === 'image' ? `<img alt="${escape(layer.name)}" src="${asset.dataUrl}" style="${css(layerImageStyle(layer))}" />` : layer.type === 'text' ? escape(layer.text) : '';
    return `<div class="editor-layer" style="${css(layerBoxStyle(layer))};filter:${layer.shadow ? `drop-shadow(0 8px ${layer.shadow}px #0009)` : 'none'}"><div style="${css(layerContentStyle(layer))}">${content}</div></div>`;
  }).join('');
}
export function buildThumbnailHtml({ subject, chapter, items, settings: input, cutout = null, editor = null, origin }) {
  const settings = normalizeThumbnailSettings(input);
  const design = editor ? normalizeThumbnailEditor(editor) : null;
  const placement = cutoutPlacement(settings, cutout);
  const themes = { dark: ['#10131c', '#f1f3fa', '#a6adc8', '#1c2231'], navy: ['#0c2040', '#f1f5ff', '#b1c5e7', '#152e51'], light: ['#f6f7fc', '#141b2e', '#4b5875', '#e6eaf5'] };
  const [themeBackground, foreground, muted, surface] = themes[settings.theme];
  const background = settings.customBackground ? settings.backgroundColor : themeBackground;
  const needsMath = settings.showQuestion && settings.template === 'question' && items.some(({ question }) => ['text', 'optA', 'optB', 'optC', 'optD', ...(settings.showAnswer ? ['natAnswer'] : [])].some(key => /\$|\\[([]/.test(question[key] || '')));
  const cards = items.map(({ question, number, headline }) => {
    const overlay = design ? editorMarkup(design) : cutout ? `<img class="cutout" alt="Custom cutout" src="${normalizePngImage(cutout.dataUrl).dataUrl}" style="left:${placement.x}%;top:${placement.y}%;width:${placement.width}%;height:${placement.height}%;opacity:${settings.overlayOpacity};transform:scaleX(${settings.overlayFlip ? -1 : 1})" />` : '';
    const questionBody = !settings.showQuestion ? '' : question.isBlank ? '<div class="blank">Blank placeholder</div>' : questionMarkup(question, origin, subject, chapter) + (settings.showAnswer && question.natAnswer && !question.isProof ? `<div class="answer">Answer: ${escape(question.natAnswer)}</div>` : '');
    return `<article class="thumbnail ${settings.template}" id="q-${number}"><div class="topline"><span>${escape(cleanLabel(subject))}</span><span>${escape(settings.brand)}</span></div><div class="meta"><div class="exam-year">GATE ${escape(question.examPaper || 'CS')} ${escape(question.year)}${question.setNum ? `<span class="set-label"> · Set ${escape(question.setNum)}</span>` : ''}</div><div class="marks-badge" aria-label="${escape(question.marks)} ${String(question.marks) === '1' ? 'mark' : 'marks'}"><strong>${escape(question.marks)}</strong><span>${String(question.marks) === '1' ? 'MARK' : 'MARKS'}</span></div></div><div class="fit-area" style="width:${settings.contentWidth}%;"><div class="fit-inner">${settings.template === 'topic' ? `<p class="chapter">${escape(cleanLabel(chapter))}</p><h1>${escape(headline || question.rawTopic || cleanLabel(chapter))}</h1><p class="topic-label">PREVIOUS YEAR QUESTION</p>` : questionBody}</div></div><div class="bottomline"><span>${escape(cleanLabel(chapter))}</span></div>${overlay}</article>`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8">${needsMath ? `<script>window.MathJax={tex:{inlineMath:[['$','$'],['\\\\(','\\\\)']],displayMath:[['$$','$$'],['\\\\[','\\\\]']]},startup:{typeset:false}};</script><script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>` : ''}<style>
    *{box-sizing:border-box}body{margin:0;background:${background};font-family:Arial,Helvetica,sans-serif;color:${foreground}}.thumbnail{position:relative;width:1280px;height:720px;overflow:hidden;background:${background};box-shadow:inset 0 8px 0 ${settings.accent};margin:0 0 20px}.topline{display:flex;justify-content:space-between;padding:34px 44px 0;color:${muted};font-size:20px;font-weight:700;letter-spacing:1px}.meta{font-size:36px;font-weight:800;margin:30px 44px 0;color:${foreground}}.meta span{font-size:24px;color:${muted};font-weight:400}.fit-area{position:absolute;${settings.textSide}:44px;top:174px;max-width:calc(100% - 88px);height:454px;overflow:hidden}.fit-inner{font-size:${settings.fontSize}px;line-height:1.4;transform-origin:top left;overflow-wrap:anywhere}.question-text{white-space:pre-wrap}.options{margin-top:24px;display:grid;gap:12px 24px;font-size:.85em}.two-cols{grid-template-columns:1fr 1fr}.option{display:flex;gap:12px;align-items:baseline;min-width:0}.option span{white-space:pre-wrap;min-width:0}.option-code,pre{font-family:Consolas,monospace;white-space:pre-wrap}pre{font-size:.82em;background:${surface};padding:18px;border-radius:10px;line-height:1.4;margin:16px 0}.diagram{margin:12px 0;line-height:0}.diagram img{max-width:100%;max-height:220px;object-fit:contain}.option img{max-width:100%;max-height:100px}.answer{margin-top:20px;color:${muted};font-size:.8em}.bottomline{position:absolute;bottom:24px;left:44px;right:44px;display:flex;justify-content:space-between;font-size:16px;color:${muted};gap:20px}.bottomline span:first-child{max-width:85%}.cutout{position:absolute;object-fit:contain;max-width:none;max-height:none;z-index:2;pointer-events:none}.chapter{color:${muted};font-size:26px;margin:18px 0}.topic h1{font-size:78px;line-height:1.08;letter-spacing:-2px;margin:18px 0 30px}.topic-label{font-size:22px;font-weight:bold;color:${muted};letter-spacing:3px}.blank{color:${muted};font-size:56px;padding-top:90px}mjx-container{max-width:100%}
    .meta{display:flex;align-items:center;gap:24px}.meta .marks-badge{display:inline-flex;align-items:center;gap:10px;padding:9px 18px;background:#f9e2af;color:#272113;border:1px solid #ffeac1;border-radius:12px;box-shadow:0 3px 12px #0002;line-height:1}.marks-badge strong{font-size:42px;font-weight:900}.meta .marks-badge span{font-size:20px;font-weight:800;letter-spacing:1px;color:#443619}.meta .set-label{font-size:22px}
    ${!settings.showQuestion ? '.topline,.meta,.fit-area,.bottomline{display:none}' : ''}
  </style></head><body>${cards}<script>
    (async()=>{try{
      await Promise.all(Array.from(document.images).map(image=>image.complete?Promise.resolve():new Promise(resolve=>{image.onload=resolve;image.onerror=resolve})));
      if(${needsMath}){await window.MathJax?.startup?.promise;
      if(!window.MathJax?.typesetPromise) throw new Error('Math rendering could not load. Check your connection and try again.');
      await window.MathJax.typesetPromise();}await document.fonts.ready;
      const missing=Array.from(document.images).filter(image=>!image.naturalWidth);if(missing.length)throw new Error(missing.length+' diagram or cutout image(s) could not load. Check the question images.');
      window.thumbnailWarnings=[];
      document.querySelectorAll('.fit-area').forEach(area=>{const inner=area.firstElementChild;const scale=Math.min(1,area.clientHeight/inner.scrollHeight,area.clientWidth/inner.scrollWidth);inner.style.transform='scale('+scale+')';if(scale<.6)window.thumbnailWarnings.push(area.closest('article').id.replace('q-','Q')+': small question text; try a topic thumbnail or increase text width.');});
    }catch(error){window.thumbnailError=error.message}finally{document.documentElement.dataset.ready='true'}})();
  </script></body></html>`;
}
