export const PAPER_ASSET_COLLECTION = 'yearpaperassets';
export const MAX_PAPER_ASSET_BYTES = 8 * 1024 * 1024;
const types = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp' };
const safeSegment = value => typeof value === 'string' && value.length > 0 && value.length < 200 && /^[A-Za-z0-9 .()_-]+$/.test(value) && !['.', '..'].includes(value);

export function questionAssetPaths(question) {
  const names = (question.diagram || '').split(',').map(name => name.trim()).filter(Boolean);
  const optionImages = ['A', 'B', 'C', 'D', 'E'].map(letter => question[`opt${letter}`]).filter(text => /^IMG:/i.test(text || '')).map(text => text.slice(4).trim());
  if (!names.length && !optionImages.length) return [];
  const subject = question.assetSubject || question.subject, chapter = question.assetChapter || question.chapter;
  const ext = question.ext || '.png';
  if (![subject, chapter, ...names, ...optionImages].every(safeSegment) || !/^\.(png|jpe?g|webp|gif)$/.test(ext)) throw new Error('Invalid paper diagram path.');
  return [...new Set([...names, ...optionImages])].map(name => `${subject}/${chapter}/${name}${ext}`);
}

export function assetContentType(path) {
  return types[path.split('.').at(-1)];
}

// Frozen attempts use immutable uploaded versions; old book/legacy paths remain valid.
export function questionDiagramUrl(question, name) {
  const subject=question.assetSubject||question.subject,chapter=question.assetChapter||question.chapter;
  const ext=question.ext||'.png';
  if(![subject,chapter,name].every(safeSegment)||!/^\.(png|jpe?g|webp|gif)$/.test(ext))return null;
  const parts=[subject,chapter,name+ext],assetPath=parts.join('/');
  if(question.assetIds!==undefined){
    const id=question.assetIds?.[assetPath];
    return /^[a-f0-9]{64}$/.test(id||'')?`/api/gatemock/assets/${id}`:null;
  }
  return '/'+parts.map(encodeURIComponent).join('/');
}

// Absent manifests identify legacy papers whose diagrams are bundled with the tracker.
// A declared manifest must be complete; never silently substitute an older bundled image.
export function paperAssetFiles(paper) {
  if (paper.assetManifest === undefined) return null;
  const manifest = paper.assetManifest;
  if (!manifest || manifest.version !== 1 || !Array.isArray(manifest.files) || manifest.files.length > 2000) throw new Error('Invalid paper asset manifest.');
  const expected = new Set(paper.questions.flatMap(questionAssetPaths));
  const files = new Map();
  for (const file of manifest.files) {
    if (!file || !expected.has(file.path) || files.has(file.path) || !/^[a-f0-9]{64}$/.test(file.id)
      || !Number.isInteger(file.byteLength) || file.byteLength < 1 || file.byteLength > MAX_PAPER_ASSET_BYTES
      || file.contentType !== assetContentType(file.path)) throw new Error('Invalid paper asset entry.');
    files.set(file.path, file);
  }
  if (files.size !== expected.size) throw new Error('Incomplete paper asset manifest.');
  return files;
}

export function paperAssetAvailability(papers, storedAssets, bundledAssets) {
  const stored = new Map(storedAssets.map(asset => [asset._id, asset]));
  const manifests = new Map();
  for (const paper of papers) {
    try { manifests.set(paper, paperAssetFiles(paper)); } catch { manifests.set(paper, false); }
  }
  return (path, paper) => {
    const files = manifests.get(paper);
    if (files === null) return bundledAssets.has(path);
    const file = files && files.get(path), asset = file && stored.get(file.id);
    return Boolean(asset && asset.byteLength === file.byteLength && asset.contentType === file.contentType);
  };
}

export function withPaperAssetIds(paper) {
  const files = paperAssetFiles(paper);
  return { ...paper, questions: paper.questions.map(question => {
    const { assetIds: ignored, ...content } = question;
    return { ...content, ...(files ? { assetIds: Object.fromEntries(questionAssetPaths(question).map(path => [path, files.get(path).id])) } : {}) };
  }) };
}
