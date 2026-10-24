const dbName = 'gate-creator-assets-v1';
export function cutoutAsset(action, value) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('assets');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('assets', action === 'get' ? 'readonly' : 'readwrite');
      const store = transaction.objectStore('assets');
      const item = action === 'get' ? store.get('thumbnail-cutout') : action === 'delete' ? store.delete('thumbnail-cutout') : store.put(value, 'thumbnail-cutout');
      transaction.oncomplete = () => { resolve(item.result); db.close(); };
      transaction.onerror = () => { reject(transaction.error); db.close(); };
      transaction.onabort = () => { reject(transaction.error || Error('Image storage was interrupted.')); db.close(); };
    };
  });
}

export async function readPngCutout(file) {
  if (!file || !['image/png', ''].includes(file.type) || !/\.png$/i.test(file.name)) throw Error('Choose a transparent PNG cutout.');
  if (file.size > 15 * 1024 * 1024) throw Error('Choose a PNG smaller than 15 MB.');
  const image = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1800 / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    return { dataUrl: canvas.toDataURL('image/png'), name: file.name };
  } finally { image.close(); }
}
