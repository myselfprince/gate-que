// The editor and server export share a 1280 × 720 coordinate system.
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const MAX_EDITOR_LAYERS = 40;
export const EMPTY_EDITOR = { version: 1, assets: [], layers: [], questionLayers: {} };
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const number = (value, fallback, min, max) => {
  const n = Number(value ?? fallback);
  if (!Number.isFinite(n)) throw Error('An editor value is not a valid number.');
  return clamp(n, min, max);
};
const colour = (value, fallback) => {
  if (value === undefined) return fallback;
  if (!/^#[\da-f]{6}$/i.test(value)) throw Error('Choose a valid hex colour.');
  return value;
};
const label = (value, fallback, max = 100) => {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || value.length > max) throw Error('An editor label is too long.');
  return value;
};
export function normalizePngImage(dataUrl = '') {
  if (!dataUrl) return null;
  if (typeof dataUrl !== 'string' || dataUrl.length > 4 * 1024 * 1024 || !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(dataUrl)) throw Error('Use a PNG image smaller than 3 MB after processing.');
  const header = Uint8Array.from(atob(dataUrl.split(',')[1].slice(0, 44)), char => char.charCodeAt(0));
  if (header.length < 24 || header.slice(0, 8).join(',') !== '137,80,78,71,13,10,26,10' || String.fromCharCode(...header.slice(12, 16)) !== 'IHDR') throw Error('The image is not a valid PNG.');
  const view = new DataView(header.buffer);
  const width = view.getUint32(16), height = view.getUint32(20);
  if (!width || !height || width > 6000 || height > 6000 || width * height > 24_000_000) throw Error('Image dimensions are too large.');
  return { dataUrl, width, height };
}
export function newLayer(type, patch = {}) {
  return {
    id: globalThis.crypto.randomUUID(), type, name: type === 'text' ? 'Your headline' : type === 'shape' ? 'Rectangle' : 'Image',
    x: 60, y: 12, width: 30, height: 60, rotation: 0, opacity: 1, locked: false, hidden: false,
    flipX: false, flipY: false, aspectLocked: type === 'image', radius: 0, shadow: 0,
    brightness: 100, contrast: 100, saturation: 100, grayscale: 0, sepia: 0, blur: 0,
    crop: { top: 0, right: 0, bottom: 0, left: 0 }, text: 'Your headline', fontSize: 72,
    color: '#ffffff', fill: '#89b4fa', fontFamily: 'Arial', bold: true, align: 'left', shape: 'rectangle',
    ...patch,
  };
}
export function normalizeThumbnailEditor(value = EMPTY_EDITOR) {
  if (!value || value.version !== 1 || !Array.isArray(value.layers) || !Array.isArray(value.assets)) throw Error('Choose a valid thumbnail project.');
  if (value.layers.length > MAX_EDITOR_LAYERS || value.assets.length > 250) throw Error(`Use at most ${MAX_EDITOR_LAYERS} layers per design and 250 shared images.`);
  const ids = new Set(); let total = 0;
  const assets = value.assets.map(asset => {
    if (!asset || typeof asset.id !== 'string' || !/^[\w-]{1,100}$/.test(asset.id) || ids.has(asset.id)) throw Error('Image asset IDs are invalid.');
    ids.add(asset.id);
    const png = normalizePngImage(asset.dataUrl);
    if (!png) throw Error('An image asset is missing.');
    total += asset.dataUrl.length;
    if (total > 8 * 1024 * 1024) throw Error('Design images exceed 8 MB. Remove an image or use smaller files.');
    return { id: asset.id, name: label(asset.name, 'Image'), ...png };
  });
  function normalizeLayers(input) {
    if (!Array.isArray(input) || input.length > MAX_EDITOR_LAYERS) throw Error(`Use at most ${MAX_EDITOR_LAYERS} layers per question.`);
    const layerIds = new Set();
    return input.map(raw => {
    if (!raw || !['image', 'text', 'shape'].includes(raw.type) || typeof raw.id !== 'string' || !/^[\w-]{1,100}$/.test(raw.id) || layerIds.has(raw.id)) throw Error('A design layer is invalid.');
    layerIds.add(raw.id);
    if (raw.type === 'image' && !ids.has(raw.assetId)) throw Error('An image layer has no matching asset.');
    const result = { id: raw.id, type: raw.type, name: label(raw.name, raw.type), assetId: raw.type === 'image' ? raw.assetId : undefined };
    for (const [key, fallback, min, max] of [
      ['x', 60, -400, 400], ['y', 12, -400, 400], ['width', 30, .5, 400], ['height', 60, .5, 800],
      ['rotation', 0, -360, 360], ['opacity', 1, 0, 1], ['radius', 0, 0, 360], ['shadow', 0, 0, 80],
      ['brightness', 100, 0, 200], ['contrast', 100, 0, 200], ['saturation', 100, 0, 200],
      ['grayscale', 0, 0, 100], ['sepia', 0, 0, 100], ['blur', 0, 0, 20], ['fontSize', 72, 10, 250],
    ]) result[key] = number(raw[key], fallback, min, max);
    for (const key of ['locked', 'hidden', 'flipX', 'flipY', 'bold']) result[key] = raw[key] === true;
    result.aspectLocked = raw.aspectLocked !== false;
    result.crop = Object.fromEntries(['top', 'right', 'bottom', 'left'].map(key => [key, number(raw.crop?.[key], 0, 0, 90)]));
    if (result.crop.top + result.crop.bottom > 95 || result.crop.left + result.crop.right > 95) throw Error('Keep at least 5% of the image when cropping.');
    result.text = label(raw.text, '', 2000);
    result.color = colour(raw.color, '#ffffff'); result.fill = colour(raw.fill, '#89b4fa');
    result.fontFamily = ['Arial', 'Georgia', 'Impact', 'Courier New'].includes(raw.fontFamily) ? raw.fontFamily : 'Arial';
    result.align = ['left', 'center', 'right'].includes(raw.align) ? raw.align : 'left';
    result.shape = ['rectangle', 'ellipse'].includes(raw.shape) ? raw.shape : 'rectangle';
    return result;
    });
  }
  const overrides = value.questionLayers ?? {};
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides) || Object.keys(overrides).length > 1000) throw Error('Question designs are invalid.');
  const questionLayers = Object.fromEntries(Object.entries(overrides).map(([id, layers]) => {
    if (!id || id.length > 200 || ['__proto__', 'constructor', 'prototype'].includes(id)) throw Error('A question design ID is invalid.');
    return [id, normalizeLayers(layers)];
  }));
  return { version: 1, assets, layers: normalizeLayers(value.layers), questionLayers };
}
export function editorForQuestion(editor, questionId) {
  const layers = Object.hasOwn(editor.questionLayers || {}, questionId) ? editor.questionLayers[questionId] : editor.layers;
  return { version: 1, layers, assets: editor.assets.filter(asset => layers.some(layer => layer.assetId === asset.id)) };
}
export function setQuestionLayers(editor, questionId, layers, assets = editor.assets) {
  const questionLayers = { ...editor.questionLayers, [questionId]: layers };
  const used = new Set([editor.layers, ...Object.values(questionLayers)].flatMap(list => list.filter(layer => layer.type === 'image').map(layer => layer.assetId)));
  return { ...editor, questionLayers, assets: assets.filter(asset => used.has(asset.id)) };
}
// Only geometry is shared. Existing replacements, crops, effects and other layers stay individual.
export function applyCutoutPlacement(editor, questionId, layerId, questionIds) {
  const source = editorForQuestion(editor, questionId).layers.find(layer => layer.id === layerId && layer.type === 'image');
  if (!source) throw Error('Select a cutout image first.');
  const { x, y, width, height } = source;
  const apply = layers => {
    const match = layers.find(layer => layer.id === source.id);
    if (match) return layers.map(layer => layer.id === source.id ? { ...layer, x, y, width, height } : layer);
    if (layers.length >= MAX_EDITOR_LAYERS) throw Error('A question already has 40 layers. Remove a layer there before applying to all.');
    return [...layers, { ...source }];
  };
  const ids = new Set(questionIds);
  const questionLayers = Object.fromEntries(Object.entries(editor.questionLayers || {}).map(([id, layers]) => [id, ids.has(id) ? apply(layers) : layers]));
  return { ...editor, layers: apply(editor.layers), questionLayers };
}
export const SLIDES_PER_GROUP = 10;
export function questionSlideWindow(entries, selectedId) {
  const index = Math.max(0, entries.findIndex(entry => entry.question_id === selectedId));
  const start = Math.floor(index / SLIDES_PER_GROUP) * SLIDES_PER_GROUP;
  return { index, start, entries: entries.slice(start, start + SLIDES_PER_GROUP), total: entries.length };
}
export function layerBoxStyle(layer) {
  return { position: 'absolute', left: `${layer.x}%`, top: `${layer.y}%`, width: `${layer.width}%`, height: `${layer.height}%`, transform: `rotate(${layer.rotation}deg)`, transformOrigin: 'center', opacity: layer.opacity };
}
export function layerContentStyle(layer) {
  return {
    width: '100%', height: '100%', overflow: 'hidden', position: 'relative',
    transform: `scale(${layer.flipX ? -1 : 1},${layer.flipY ? -1 : 1})`,
    borderRadius: layer.type === 'shape' && layer.shape === 'ellipse' ? '50%' : `${layer.radius}px`,
    background: layer.type === 'shape' ? layer.fill : undefined,
    color: layer.color, fontFamily: layer.fontFamily, fontSize: `${layer.fontSize}px`, fontWeight: layer.bold ? 800 : 400,
    textAlign: layer.align, lineHeight: 1.12, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere',
    filter: `brightness(${layer.brightness}%) contrast(${layer.contrast}%) saturate(${layer.saturation}%) grayscale(${layer.grayscale}%) sepia(${layer.sepia}%) blur(${layer.blur}px)`,
  };
}
export function layerImageStyle(layer) {
  const { top, right, bottom, left } = layer.crop;
  return { position: 'absolute', display: 'block', maxWidth: 'none', width: `${10000 / (100 - left - right)}%`, height: `${10000 / (100 - top - bottom)}%`, left: `${-left * 100 / (100 - left - right)}%`, top: `${-top * 100 / (100 - top - bottom)}%`, pointerEvents: 'none' };
}
// Resizing in the layer's rotated axes keeps the opposite corner/edge fixed.
export function resizeLayer(layer, handle, dx, dy, keepAspect = layer.aspectLocked) {
  const angle = layer.rotation * Math.PI / 180, cos = Math.cos(angle), sin = Math.sin(angle);
  const localX = dx * cos + dy * sin, localY = -dx * sin + dy * cos;
  const w = layer.width * CANVAS_WIDTH / 100, h = layer.height * CANVAS_HEIGHT / 100;
  const sx = handle.includes('e') ? 1 : handle.includes('w') ? -1 : 0;
  const sy = handle.includes('s') ? 1 : handle.includes('n') ? -1 : 0;
  let nw = clamp(w + sx * localX, 6.4, 5120), nh = clamp(h + sy * localY, 3.6, 5760);
  if (keepAspect) {
    let scale = sx && sy ? (Math.abs(localX / w) > Math.abs(localY / h) ? nw / w : nh / h) : sx ? nw / w : nh / h;
    scale = clamp(scale, Math.max(6.4 / w, 3.6 / h), Math.min(5120 / w, 5760 / h));
    nw = w * scale; nh = h * scale;
  }
  const shiftX = sx * (nw - w) / 2, shiftY = sy * (nh - h) / 2;
  return { width: nw / CANVAS_WIDTH * 100, height: nh / CANVAS_HEIGHT * 100,
    x: layer.x + ((w - nw) / 2 + shiftX * cos - shiftY * sin) / CANVAS_WIDTH * 100,
    y: layer.y + ((h - nh) / 2 + shiftX * sin + shiftY * cos) / CANVAS_HEIGHT * 100 };
}
export function snapLayer(layer, others, threshold = .7) {
  // Use axis-aligned bounds for rotated layers so visible edges snap, too.
  const a = layer.rotation * Math.PI / 180;
  const bw = Math.abs(layer.width * Math.cos(a)) + Math.abs(layer.height * 720 / 1280 * Math.sin(a));
  const bh = Math.abs(layer.height * Math.cos(a)) + Math.abs(layer.width * 1280 / 720 * Math.sin(a));
  const start = [layer.x + (layer.width - bw) / 2, layer.y + (layer.height - bh) / 2];
  const size = [bw, bh], guides = []; const patch = {};
  for (const [axis, key, dimension] of [[0, 'x', 'width'], [1, 'y', 'height']]) {
    const targets = [0, 50, 100, ...others.filter(l => l.id !== layer.id && !l.hidden && l.rotation === 0).flatMap(l => [l[key], l[key] + l[dimension] / 2, l[key] + l[dimension]])];
    let best = threshold, offset = 0, target;
    for (const anchor of [start[axis], start[axis] + size[axis] / 2, start[axis] + size[axis]]) for (const t of targets) {
      if (Math.abs(t - anchor) < best) { best = Math.abs(t - anchor); offset = t - anchor; target = t; }
    }
    patch[key] = layer[key] + offset;
    if (target !== undefined) guides.push({ axis: key, value: target });
  }
  return { patch, guides };
}
