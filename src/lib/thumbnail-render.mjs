import { cleanLabel } from './youtube-metadata.mjs';

export const THUMBNAIL_WIDTH = 1280;
export const THUMBNAIL_HEIGHT = 720;
export const DEFAULT_THUMBNAIL_SETTINGS = {
  template: 'question', theme: 'dark', textSide: 'left', contentWidth: 64, fontSize: 34,
  accent: '#a6e3a1', brand: 'G4Gate', resolution: 1920, showAnswer: false, includeBlanks: false,
  overlayX: 70, overlayY: 15, overlayWidth: 28, overlayOpacity: 1, overlayFlip: false,
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
  for (const [key, min, max] of [['contentWidth', 40, 100], ['fontSize', 22, 54], ['overlayX', 0, 100], ['overlayY', 0, 100], ['overlayWidth', 5, 80], ['overlayOpacity', .1, 1]]) result[key] = bounded(value[key], result[key], min, max);
  for (const key of ['showAnswer', 'includeBlanks', 'overlayFlip']) result[key] = value[key] === true;
  if (value.accent !== undefined && !/^#[\da-f]{6}$/i.test(value.accent)) throw Error('Thumbnail accent must be a hex colour.');
  result.accent = value.accent ?? result.accent;
  if (value.brand !== undefined && (typeof value.brand !== 'string' || value.brand.length > 60)) throw Error('Thumbnail branding is too long.');
  result.brand = value.brand ?? result.brand;
  return result;
}

export function normalizeCutout(dataUrl = '') {
  if (!dataUrl) return null;
  if (typeof dataUrl !== 'string' || dataUrl.length > 4 * 1024 * 1024 || !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(dataUrl)) throw Error('Use a PNG cutout smaller than 3 MB.');
  const header = Uint8Array.from(atob(dataUrl.split(',')[1].slice(0, 44)), char => char.charCodeAt(0));
  if (header.length < 24 || header.slice(0, 8).join(',') !== '137,80,78,71,13,10,26,10' || String.fromCharCode(...header.slice(12, 16)) !== 'IHDR') throw Error('The cutout is not a valid PNG image.');
  const view = new DataView(header.buffer);
  const width = view.getUint32(16), height = view.getUint32(20);
  if (!width || !height || width > 6000 || height > 6000 || width * height > 24_000_000) throw Error('Cutout dimensions are too large.');
  return { dataUrl, width, height };
}

// Percent coordinates refer to the top-left of the actual image, not its centre.
export function cutoutPlacement(settings, cutout) {
  if (!cutout) return null;
  const width = Math.min(settings.overlayWidth, 100 * (cutout.width / cutout.height) * THUMBNAIL_HEIGHT / THUMBNAIL_WIDTH);
  const height = width * THUMBNAIL_WIDTH / THUMBNAIL_HEIGHT * cutout.height / cutout.width;
  return { width, height, x: Math.max(0, Math.min(100 - width, settings.overlayX)), y: Math.max(0, Math.min(100 - height, settings.overlayY)) };
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

export function buildThumbnailHtml({ subject, chapter, items, settings: input, cutout = null, origin }) {
  const settings = normalizeThumbnailSettings(input);
  const placement = cutoutPlacement(settings, cutout);
  const themes = { dark: ['#10131c', '#f1f3fa', '#a6adc8', '#1c2231'], navy: ['#0c2040', '#f1f5ff', '#b1c5e7', '#152e51'], light: ['#f6f7fc', '#141b2e', '#4b5875', '#e6eaf5'] };
  const [background, foreground, muted, surface] = themes[settings.theme];
  const cards = items.map(({ question, number, headline }) => {
    const overlay = cutout ? `<img class="cutout" alt="Custom cutout" src="${cutout.dataUrl}" style="left:${placement.x}%;top:${placement.y}%;width:${placement.width}%;height:${placement.height}%;opacity:${settings.overlayOpacity};transform:scaleX(${settings.overlayFlip ? -1 : 1})" />` : '';
    const questionBody = question.isBlank ? '<div class="blank">Blank placeholder</div>' : questionMarkup(question, origin, subject, chapter) + (settings.showAnswer && question.natAnswer && !question.isProof ? `<div class="answer">Answer: ${escape(question.natAnswer)}</div>` : '');
    return `<article class="thumbnail ${settings.template}" id="q-${number}"><div class="topline"><span>${escape(cleanLabel(subject))}</span><span>${escape(settings.brand)}</span></div><div class="meta">GATE ${escape(question.year)} <span>· ${escape(question.marks)} ${String(question.marks) === '1' ? 'mark' : 'marks'} · Q${number}${question.setNum ? ` · Set ${escape(question.setNum)}` : ''}</span></div><div class="fit-area" style="width:${settings.contentWidth}%;"><div class="fit-inner">${settings.template === 'topic' ? `<p class="chapter">${escape(cleanLabel(chapter))}</p><h1>${escape(headline || question.rawTopic || cleanLabel(chapter))}</h1><p class="topic-label">PREVIOUS YEAR QUESTION</p>` : questionBody}</div></div><div class="bottomline"><span>${escape(cleanLabel(chapter))}</span><span>Q${number}</span></div>${overlay}</article>`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><script>window.MathJax={tex:{inlineMath:[['$','$'],['\\\\(','\\\\)']],displayMath:[['$$','$$'],['\\\\[','\\\\]']]},startup:{typeset:false}};</script><script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script><style>
    *{box-sizing:border-box}body{margin:0;background:${background};font-family:Arial,Helvetica,sans-serif;color:${foreground}}.thumbnail{position:relative;width:1280px;height:720px;overflow:hidden;background:${background};box-shadow:inset 0 8px 0 ${settings.accent};margin:0 0 20px}.topline{display:flex;justify-content:space-between;padding:34px 44px 0;color:${muted};font-size:20px;font-weight:700;letter-spacing:1px}.meta{font-size:36px;font-weight:800;margin:30px 44px 0;color:${foreground}}.meta span{font-size:24px;color:${muted};font-weight:400}.fit-area{position:absolute;${settings.textSide}:44px;top:174px;max-width:calc(100% - 88px);height:454px;overflow:hidden}.fit-inner{font-size:${settings.fontSize}px;line-height:1.4;transform-origin:top left;overflow-wrap:anywhere}.question-text{white-space:pre-wrap}.options{margin-top:24px;display:grid;gap:12px 24px;font-size:.85em}.two-cols{grid-template-columns:1fr 1fr}.option{display:flex;gap:12px;align-items:baseline;min-width:0}.option span{white-space:pre-wrap;min-width:0}.option-code,pre{font-family:Consolas,monospace;white-space:pre-wrap}pre{font-size:.82em;background:${surface};padding:18px;border-radius:10px;line-height:1.4;margin:16px 0}.diagram{margin:12px 0;line-height:0}.diagram img{max-width:100%;max-height:220px;object-fit:contain}.option img{max-width:100%;max-height:100px}.answer{margin-top:20px;color:${muted};font-size:.8em}.bottomline{position:absolute;bottom:24px;left:44px;right:44px;display:flex;justify-content:space-between;font-size:16px;color:${muted};gap:20px}.bottomline span:first-child{max-width:85%}.cutout{position:absolute;object-fit:contain;max-width:none;max-height:none;z-index:2;pointer-events:none}.chapter{color:${muted};font-size:26px;margin:18px 0}.topic h1{font-size:78px;line-height:1.08;letter-spacing:-2px;margin:18px 0 30px}.topic-label{font-size:22px;font-weight:bold;color:${muted};letter-spacing:3px}.blank{color:${muted};font-size:56px;padding-top:90px}mjx-container{max-width:100%}
  </style></head><body>${cards}<script>
    (async()=>{try{
      await Promise.all(Array.from(document.images).map(image=>image.complete?Promise.resolve():new Promise(resolve=>{image.onload=resolve;image.onerror=resolve})));
      await window.MathJax?.startup?.promise;
      if(!window.MathJax?.typesetPromise) throw new Error('Math rendering could not load. Check your connection and try again.');
      await window.MathJax.typesetPromise();await document.fonts.ready;
      const missing=Array.from(document.images).filter(image=>!image.naturalWidth);if(missing.length)throw new Error(missing.length+' diagram or cutout image(s) could not load. Check the question images.');
      window.thumbnailWarnings=[];
      document.querySelectorAll('.fit-area').forEach(area=>{const inner=area.firstElementChild;const scale=Math.min(1,area.clientHeight/inner.scrollHeight,area.clientWidth/inner.scrollWidth);inner.style.transform='scale('+scale+')';if(scale<.6)window.thumbnailWarnings.push(area.closest('article').id.replace('q-','Q')+': small question text; try a topic thumbnail or increase text width.');});
    }catch(error){window.thumbnailError=error.message}finally{document.documentElement.dataset.ready='true'}})();
  </script></body></html>`;
}
