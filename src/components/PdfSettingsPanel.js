'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_PDF_SETTINGS, PDF_PRESETS, normalizePdfSettings } from '@/lib/pdf-settings.mjs';

const storageKey = 'gate-pdf-settings-v1';
export default function PdfSettingsPanel({ settings, onChange }) {
  const [templates, setTemplates] = useState({});
  const [name, setName] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
        if (saved?.settings) onChange(normalizePdfSettings(saved.settings));
        if (saved?.templates) setTemplates(Object.fromEntries(Object.entries(saved.templates).map(([key, value]) => [key, normalizePdfSettings(value)])));
      } catch { setNotice('Saved PDF settings could not be restored. Defaults are active.'); }
    }, 0);
    return () => clearTimeout(timer);
  }, [onChange]);
  function save(next, nextTemplates = templates) {
    onChange(next);
    try { localStorage.setItem(storageKey, JSON.stringify({ settings: next, templates: nextTemplates })); setNotice('Settings saved in this browser.'); }
    catch { setNotice('Settings are active, but this browser could not save them.'); }
  }
  function update(key, value) {
    const next = { ...settings, [key]: value };
    if (key === 'fontSize') next.minFontSize = Math.min(next.minFontSize, value);
    save(normalizePdfSettings(next));
  }
  return <details style={{ margin: '14px 0', background: '#181825', border: '1px solid #45475a', borderRadius: 8, padding: 14 }}>
    <summary style={{ cursor: 'pointer', color: '#cba6f7', fontWeight: 'bold' }}>PDF design settings · {settings.fontSize}pt · {settings.theme}</summary>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
      {Object.entries({ ...PDF_PRESETS, ...templates }).map(([key, value]) => <button type="button" key={key} onClick={() => save({ ...value })}>{key}</button>)}
      <button type="button" onClick={() => save({ ...DEFAULT_PDF_SETTINGS })}>Reset</button>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 18 }}>
      {[
        ['fontSize', 'Preferred text size', 8, 32, 1, 'pt'],
        ['minFontSize', 'Minimum text size', 8, settings.fontSize, 1, 'pt'],
        ['lineSpacing', 'Line spacing', 1.1, 1.8, 0.05, '×'],
        ['marginMm', 'Page margins', 8, 25, 1, 'mm'],
        ['imageScale', 'Diagram size', 0.5, 1.5, 0.05, '×'],
        ['workingLines', 'Working-space lines', 0, 10, 1, ''],
      ].map(([key, label, min, max, step, unit]) => <label key={key}>{label}: {Number(settings[key].toFixed(2))}{unit}<input aria-label={label} type="range" min={min} max={max} step={step} value={settings[key]} onChange={e => update(key, Number(e.target.value))} /></label>)}
      <label>Page theme<select value={settings.theme} onChange={e => update('theme', e.target.value)}><option value="dark">Black / white text</option><option value="light">White / black text</option></select></label>
      <label>If the question still does not fit<select value={settings.overflow} onChange={e => update('overflow', e.target.value)}><option value="error">Stop and show the question</option><option value="warn">Shrink further and warn</option></select></label>
    </div>
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
      <label><input type="checkbox" checked={settings.showSolutions} onChange={e => update('showSolutions', e.target.checked)} /> Video solution links</label>
      <label><input type="checkbox" checked={settings.showWebsite} onChange={e => update('showWebsite', e.target.checked)} /> g4gate.com footer</label>
      <label><input type="checkbox" checked={settings.includePageImages} onChange={e => update('includePageImages', e.target.checked)} /> Matching page images ZIP</label>
      <label><input type="checkbox" checked={settings.includeAnswerKey} onChange={e => update('includeAnswerKey', e.target.checked)} /> Separate answer-key PDF</label>
    </div>
    <p style={{ color: '#bac2de', fontSize: 13 }}>Auto-fit reflows each question down to the minimum size. Large questions may need a smaller font or diagram. Use the PDF preview to check the result.</p>
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <input aria-label="Template name" maxLength={40} placeholder="My template name" value={name} onChange={e => setName(e.target.value)} style={{ maxWidth: 240 }} />
      <button type="button" disabled={!name.trim()} onClick={() => { const next = { ...templates, [name.trim()]: { ...settings } }; setTemplates(next); save(settings, next); setName(''); }}>Save template</button>
      <span role="status" style={{ color: '#a6adc8', fontSize: 12 }}>{notice}</span>
    </div>
  </details>;
}
