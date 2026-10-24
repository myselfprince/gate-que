export const DEFAULT_PDF_SETTINGS = Object.freeze({ fontSize: 18, minFontSize: 8, lineSpacing: 26 / 18, marginMm: 14, imageScale: 1, workingLines: 0, theme: 'dark', overflow: 'error', showSolutions: true, showWebsite: true, includePageImages: false, includeAnswerKey: false });
export const PDF_PRESETS = Object.freeze({
  Classic: DEFAULT_PDF_SETTINGS,
  Teaching: { ...DEFAULT_PDF_SETTINGS, fontSize: 24, minFontSize: 16 },
  Readable: { ...DEFAULT_PDF_SETTINGS, fontSize: 20, minFontSize: 14 },
  Print: { ...DEFAULT_PDF_SETTINGS, fontSize: 16, minFontSize: 12, theme: 'light', lineSpacing: 1.35, marginMm: 18 },
});

const ranges = { fontSize: [8, 32], minFontSize: [8, 32], lineSpacing: [1.1, 1.8], marginMm: [8, 25], imageScale: [0.5, 1.5], workingLines: [0, 10] };
export function normalizePdfSettings(value = {}, { partial = false } = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('PDF settings must be an object.');
  const result = partial ? {} : { ...DEFAULT_PDF_SETTINGS };
  for (const [key, [min, max]] of Object.entries(ranges)) {
    if (partial && ['marginMm', 'workingLines'].includes(key)) continue;
    if (value[key] === undefined) continue;
    if (typeof value[key] !== 'number' || !Number.isFinite(value[key]) || value[key] < min || value[key] > max || (['fontSize', 'minFontSize', 'marginMm', 'workingLines'].includes(key) && !Number.isInteger(value[key]))) throw new Error(`PDF ${key} must be between ${min} and ${max}.`);
    result[key] = value[key];
  }
  for (const [key, allowed] of Object.entries({ theme: ['dark', 'light'], overflow: ['error', 'warn'] })) {
    if (partial && key === 'theme') continue;
    if (value[key] === undefined) continue;
    if (!allowed.includes(value[key])) throw new Error(`PDF ${key} is invalid.`);
    result[key] = value[key];
  }
  for (const key of ['showSolutions', 'showWebsite', 'includePageImages', 'includeAnswerKey']) {
    if (partial) continue;
    if (value[key] === undefined) continue;
    if (typeof value[key] !== 'boolean') throw new Error(`PDF ${key} must be a checkbox value.`);
    result[key] = value[key];
  }
  if (result.minFontSize > result.fontSize) throw new Error('Minimum PDF font cannot exceed the preferred font.');
  return result;
}

export function questionPdfSettings(settings, overrides) {
  const partial = normalizePdfSettings(overrides, { partial: true });
  const combined = { ...normalizePdfSettings(settings), ...partial };
  if (partial.fontSize !== undefined && partial.minFontSize === undefined) combined.minFontSize = Math.min(combined.minFontSize, partial.fontSize);
  return normalizePdfSettings(combined);
}
