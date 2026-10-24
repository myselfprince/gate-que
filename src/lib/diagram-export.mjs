import { diagramSvg } from './diagram-svg.mjs';
export function saveDownload(content, name, type = 'application/json') {
  const blob = content instanceof Blob ? content : new Blob([content], {
    type
  });
  const url = URL.createObjectURL(blob),
    link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
export const safeFilename = value => String(value || 'diagram').replace(/[^\p{L}\p{N}_.-]+/gu, '_').slice(0, 100) || 'diagram';
export async function svgPng(svg, scale = 2) {
  const url = URL.createObjectURL(new Blob([svg], {
    type: 'image/svg+xml;charset=utf-8'
  }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const width = Math.ceil(image.naturalWidth * scale),
      height = Math.ceil(image.naturalHeight * scale);
    if (width > 16000 || height > 16000 || width * height > 50_000_000) throw Error('This PNG is too large. Use SVG, a smaller scale, or export fewer items.');
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(image, 0, 0, width, height);
    return await new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(Error('PNG export failed.')), 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}
export async function exportDiagram(project, kind, options = {}) {
  const filename = safeFilename(project.title);
  if (kind === 'json') {
    saveDownload(JSON.stringify(project, null, 2), `${filename}.json`);
    return;
  }
  const svg = diagramSvg(project, options);
  if (kind === 'svg') {
    saveDownload(svg, `${filename}.svg`, 'image/svg+xml;charset=utf-8');
    return;
  }
  const png = await svgPng(svg, options.scale || 2);
  if (kind === 'clipboard') {
    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw Error('Image clipboard is unavailable in this browser. Download PNG instead.');
    await navigator.clipboard.write([new ClipboardItem({
      'image/png': png
    })]);
  } else saveDownload(png, `${filename}.png`, 'image/png');
}
