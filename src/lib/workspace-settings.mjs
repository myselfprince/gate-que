// Workspace settings saved in MongoDB, so they survive server restarts, other ports and browsers.
// Each key has its own validator; unknown keys and malformed values are rejected.
import { normalizePdfSettings } from './pdf-settings.mjs';
import { DEFAULT_YOUTUBE_SETTINGS } from './youtube-metadata.mjs';

const MAX_PDF_TEMPLATES = 50;
const plainObject = (value, label) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  return value;
};
const text = (value, label, max, { multiline = false } = {}) => {
  if (typeof value !== 'string' || value.length > max || (!multiline && /[\x00-\x1f]/.test(value))) throw new Error(`${label} must be text of at most ${max} characters.`);
  return value;
};

function normalizePdfWorkspace(value) {
  plainObject(value, 'PDF settings');
  const templates = plainObject(value.templates ?? {}, 'PDF templates');
  const names = Object.keys(templates);
  if (names.length > MAX_PDF_TEMPLATES) throw new Error(`Save at most ${MAX_PDF_TEMPLATES} PDF templates.`);
  return {
    settings: normalizePdfSettings(plainObject(value.settings, 'PDF settings')),
    templates: Object.fromEntries(names.map(name => [text(name, 'Template name', 60).trim() || 'Template', normalizePdfSettings(templates[name])])),
  };
}

const YOUTUBE_LIMITS = { channelName: 100, website: 500, playlistUrl: 500, footer: 2000 };
function normalizeYouTubeSettings(value) {
  plainObject(value, 'YouTube settings');
  const result = { ...DEFAULT_YOUTUBE_SETTINGS };
  for (const [key, max] of Object.entries(YOUTUBE_LIMITS)) if (value[key] !== undefined) result[key] = text(value[key], `YouTube ${key}`, max, { multiline: key === 'footer' });
  if (value.titleStyle !== undefined) {
    if (!['topic', 'exam', 'question'].includes(value.titleStyle)) throw new Error('YouTube title style is invalid.');
    result.titleStyle = value.titleStyle;
  }
  for (const key of ['includeQuestion', 'includeAnswer']) {
    if (value[key] === undefined) continue;
    if (typeof value[key] !== 'boolean') throw new Error(`YouTube ${key} must be true or false.`);
    result[key] = value[key];
  }
  return result;
}

function normalizeScraperPrompt(value) {
  plainObject(value, 'Scraper prompt');
  if (typeof value.enabled !== 'boolean') throw new Error('Scraper prompt "enabled" must be true or false.');
  return { prompt: text(value.prompt, 'Scraper prompt', 50_000, { multiline: true }), enabled: value.enabled };
}

export const WORKSPACE_SETTINGS = Object.freeze({
  pdf: normalizePdfWorkspace,
  youtube: normalizeYouTubeSettings,
  'scraper-group-prompt': normalizeScraperPrompt,
});

export function normalizeWorkspaceSetting(key, value) {
  if (!Object.hasOwn(WORKSPACE_SETTINGS, key)) throw new Error('Unknown setting.');
  return WORKSPACE_SETTINGS[key](value);
}
