export const PAGE_POSITIONS = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
export const WATERMARK_POSITIONS = [...PAGE_POSITIONS, 'center'];
export const DEFAULT_PDF_SETTINGS = Object.freeze({
  fontSize: 18, minFontSize: 8, lineSpacing: 26 / 18, marginMm: 14, imageScale: 1, workingLines: 0, theme: 'dark', overflow: 'error',
  showSolutions: true, solutionPosition: 'top-right', solutionLabel: 'Video sol.', solutionFontSize: 10, showSolutionIcon: true,
  showWatermark: true, watermarkText: 'g4gate.com', watermarkOpacity: 0.06, watermarkFontSize: 48, watermarkAngle: 0, watermarkPosition: 'center', watermarkClickable: false,
  showWebsite: false, websiteUrl: 'https://g4gate.com/', websiteLabel: 'g4gate.com', websitePosition: 'bottom-center',
  showPageNumbers: true, pageNumberPosition: 'bottom-right', pageNumberTemplate: '{page} / {total}', pageNumberFontSize: 9,
  titleMode: 'first', titleText: '', titleAlignment: 'left', titleFontSize: 12, stripTitleNumbers: true,
  showQuestionNumber: true, showQuestionMeta: true, openLinksInNewTab: true, includePageImages: false, includeAnswerKey: false,
});
export const PDF_PRESETS = Object.freeze({
  Classic: DEFAULT_PDF_SETTINGS,
  Teaching: { ...DEFAULT_PDF_SETTINGS, fontSize: 24, minFontSize: 16 },
  Readable: { ...DEFAULT_PDF_SETTINGS, fontSize: 20, minFontSize: 14 },
  Print: { ...DEFAULT_PDF_SETTINGS, fontSize: 16, minFontSize: 12, theme: 'light', lineSpacing: 1.35, marginMm: 18 },
});

const ranges = { fontSize: [8, 32], minFontSize: [8, 32], lineSpacing: [1.1, 1.8], marginMm: [8, 25], imageScale: [0.5, 1.5], workingLines: [0, 10], watermarkOpacity: [0, 1], watermarkFontSize: [16, 96], watermarkAngle: [-90, 90], solutionFontSize: [8, 16], pageNumberFontSize: [8, 16], titleFontSize: [8, 20] };
const questionStyleKeys = new Set(['fontSize', 'minFontSize', 'lineSpacing', 'imageScale', 'overflow']);
const integerKeys = new Set(['fontSize', 'minFontSize', 'marginMm', 'workingLines', 'watermarkFontSize', 'watermarkAngle', 'solutionFontSize', 'pageNumberFontSize', 'titleFontSize']);

export function normalizeWebsiteUrl(value) {
  if (typeof value !== 'string' || value.length > 2000) throw new Error('Website link must be a URL up to 2000 characters.');
  if (!value.trim()) return '';
  let url;
  try { url = new URL(value.trim()); } catch { throw new Error('Enter a complete website URL, starting with https://.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Website links must use http:// or https:// without a username or password.');
  // Keep PDF URLs TeX-safe without changing their destination.
  return url.href.replace(/[{}<>"^`]/g, character => encodeURIComponent(character));
}
export function normalizePdfSettings(value = {}, { partial = false } = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('PDF settings must be an object.');
  const result = partial ? {} : { ...DEFAULT_PDF_SETTINGS };
  for (const [key, [min, max]] of Object.entries(ranges)) {
    if (partial && !questionStyleKeys.has(key)) continue;
    if (value[key] === undefined) continue;
    if (typeof value[key] !== 'number' || !Number.isFinite(value[key]) || value[key] < min || value[key] > max || (integerKeys.has(key) && !Number.isInteger(value[key]))) throw new Error(`PDF ${key} must be between ${min} and ${max}.`);
    result[key] = value[key];
  }
  for (const [key, allowed] of Object.entries({ theme: ['dark', 'light'], overflow: ['error', 'warn'], solutionPosition: PAGE_POSITIONS, websitePosition: PAGE_POSITIONS, pageNumberPosition: PAGE_POSITIONS, watermarkPosition: WATERMARK_POSITIONS, titleMode: ['first', 'every', 'none'], titleAlignment: ['left', 'center', 'right'] })) {
    if (partial && !questionStyleKeys.has(key)) continue;
    if (value[key] === undefined) continue;
    if (!allowed.includes(value[key])) throw new Error(`PDF ${key} is invalid.`);
    result[key] = value[key];
  }
  for (const key of ['showSolutions', 'showWebsite', 'showSolutionIcon', 'showWatermark', 'watermarkClickable', 'showPageNumbers', 'stripTitleNumbers', 'showQuestionNumber', 'showQuestionMeta', 'openLinksInNewTab', 'includePageImages', 'includeAnswerKey']) {
    if (partial) continue;
    if (value[key] === undefined) continue;
    if (typeof value[key] !== 'boolean') throw new Error(`PDF ${key} must be a checkbox value.`);
    result[key] = value[key];
  }
  if (!partial) {
    for (const [key, max] of Object.entries({ watermarkText: 80, websiteLabel: 80, solutionLabel: 40, pageNumberTemplate: 80, titleText: 240 })) {
      if (value[key] === undefined) continue;
      if (typeof value[key] !== 'string' || value[key].length > max || /[\x00-\x1f]/.test(value[key])) throw new Error(`PDF ${key} must be a single line up to ${max} characters.`);
      result[key] = value[key];
    }
    if (value.websiteUrl !== undefined) result.websiteUrl = normalizeWebsiteUrl(value.websiteUrl);
  }
  if (result.minFontSize > result.fontSize) throw new Error('Minimum PDF font cannot exceed the preferred font.');
  return result;
}

export function migrateLegacyPdfSettings(value) {
  return normalizePdfSettings({ ...value, showWebsite: false, showWatermark: value?.showWebsite !== false });
}

export function questionPdfSettings(settings, overrides) {
  const partial = normalizePdfSettings(overrides, { partial: true });
  const combined = { ...normalizePdfSettings(settings), ...partial };
  if (partial.fontSize !== undefined && partial.minFontSize === undefined) combined.minFontSize = Math.min(combined.minFontSize, partial.fontSize);
  return normalizePdfSettings(combined);
}
