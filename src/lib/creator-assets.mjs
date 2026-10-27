const dbName = 'gate-creator-assets-v1';
export function cutoutAsset(action, value, key = 'thumbnail-cutout') {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('assets');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('assets', action === 'get' ? 'readonly' : 'readwrite');
      const store = transaction.objectStore('assets');
      const item = action === 'get' ? store.get(key) : action === 'delete' ? store.delete(key) : store.put(value, key);
      transaction.oncomplete = () => { resolve(item.result); db.close(); };
      transaction.onerror = () => { reject(transaction.error); db.close(); };
      transaction.onabort = () => { reject(transaction.error || Error('Image storage was interrupted.')); db.close(); };
    };
  });
}

export async function readPngCutout(file) {
  if (!file || !['image/png', 'image/jpeg', 'image/webp', 'image/gif', ''].includes(file.type) || !/\.(png|jpe?g|webp|gif)$/i.test(file.name)) throw Error('Choose a PNG, JPG, WebP or GIF image.');
  if (file.size > 20 * 1024 * 1024) throw Error('Choose an image smaller than 20 MB.');
  const image = await createImageBitmap(file);
  try {
    if (image.width * image.height > 60_000_000) throw Error('Choose an image below 60 megapixels.');
    let scale = Math.min(1, 1800 / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    let dataUrl;
    do {
      canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      dataUrl = canvas.toDataURL('image/png'); scale *= .8;
    } while (dataUrl.length > 4 * 1024 * 1024 && Math.max(canvas.width, canvas.height) > 400);
    if (dataUrl.length > 4 * 1024 * 1024) throw Error('This image is too complex. Try a smaller image.');
    return { dataUrl, width: canvas.width, height: canvas.height, name: file.name.slice(0, 100) };
  } finally { image.close(); }
}

let editorWrites = Promise.resolve();
export const editorAsset = (action, value, chapterKey = '') => {
  const key = chapterKey ? `thumbnail-editor-v3:${chapterKey}` : 'thumbnail-editor-v2';
  const pending = editorWrites.catch(() => {}).then(() => cutoutAsset(action, value, key));
  if (action !== 'get') editorWrites = pending;
  return pending;
};

export async function trimTransparentImage(asset) {
  const bytes = Uint8Array.from(atob(asset.dataUrl.split(',')[1]), char => char.charCodeAt(0));
  const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
  try {
    const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
    const context = canvas.getContext('2d', { willReadFrequently: true }); context.drawImage(bitmap, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let left = canvas.width, top = canvas.height, right = -1, bottom = -1;
    for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
      if (pixels[(y * canvas.width + x) * 4 + 3] > 8) { left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y); }
    }
    if (right < left) throw Error('This image is fully transparent.');
    if (left === 0 && top === 0 && right === canvas.width - 1 && bottom === canvas.height - 1) return null;
    const output = document.createElement('canvas'); output.width = right - left + 1; output.height = bottom - top + 1;
    output.getContext('2d').drawImage(canvas, left, top, output.width, output.height, 0, 0, output.width, output.height);
    return { name: asset.name, dataUrl: output.toDataURL('image/png'), width: output.width, height: output.height };
  } finally { bitmap.close(); }
}
