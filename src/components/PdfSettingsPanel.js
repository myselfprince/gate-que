'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_PDF_SETTINGS, PDF_PRESETS, normalizePdfSettings, migrateLegacyPdfSettings } from '@/lib/pdf-settings.mjs';
import PdfDecorationSettings from './PdfDecorationSettings';

const storageKey = 'gate-pdf-settings-v2';
export default function PdfSettingsPanel({ settings, onChange, onValidityChange }) {
  const [templates, setTemplates] = useState({});
  const [name, setName] = useState('');
  const [notice, setNotice] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [revision, setRevision] = useState(0);
  const invalidFields = useRef(new Set());
  const report = useCallback((key, valid) => {
    if (valid) invalidFields.current.delete(key); else invalidFields.current.add(key);
    setInvalid(invalidFields.current.size > 0);
    onValidityChange?.(invalidFields.current.size === 0);
  }, [onValidityChange]);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const current = localStorage.getItem(storageKey);
        const saved = JSON.parse(current || localStorage.getItem('gate-pdf-settings-v1') || 'null');
        const normalize = current ? normalizePdfSettings : migrateLegacyPdfSettings;
        if (saved?.settings) onChange(normalize(saved.settings));
        if (saved?.templates) setTemplates(Object.fromEntries(Object.entries(saved.templates).map(([key, value]) => [key, normalize(value)])));
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
  function applyPreset(value) {
    save({ ...value }); invalidFields.current.clear(); setInvalid(false); onValidityChange?.(true); setRevision(value => value + 1);
  }
  return <details open style={{ margin: '14px 0', background: '#181825', border: '1px solid #45475a', borderRadius: 8, padding: 14 }}>
    <summary style={{ cursor: 'pointer', color: '#cba6f7', fontWeight: 'bold' }}>PDF design settings · {settings.fontSize}pt · {settings.theme}</summary>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
      {Object.entries({ ...PDF_PRESETS, ...templates }).map(([key, value]) => <button type="button" key={key} onClick={() => applyPreset(value)}>{key}</button>)}
      <button type="button" onClick={() => applyPreset(DEFAULT_PDF_SETTINGS)}>Reset</button>
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
      <label>Answers in question PDF<select aria-label="PDF answer display" value={settings.answerMode || 'none'} onChange={e => update('answerMode', e.target.value)}><option value="none">Hide answers</option><option value="toggle">Show / hide answer on click</option><option value="footer">Small answer in page footer</option></select></label>
      <label><input type="checkbox" checked={settings.includePageImages} onChange={e => update('includePageImages', e.target.checked)} /> Matching page images ZIP</label>
      <label><input type="checkbox" checked={settings.includeAnswerKey} onChange={e => update('includeAnswerKey', e.target.checked)} /> Separate answer-key PDF</label>
    </div>
    {settings.answerMode === 'toggle' && <p style={{ color: '#bac2de', fontSize: 13 }}>Answers start hidden. Click Show / hide answer in the app preview or a PDF reader that supports layers. Use footer answers for printing or readers without layer support. Only questions with stored answers get a toggle.</p>}
    <PdfDecorationSettings key={revision} settings={settings} update={update} report={report} />
    <p style={{ color: '#bac2de', fontSize: 13 }}>Auto-fit reflows each question down to the minimum size. Large questions may need a smaller font or diagram. Use the PDF preview to check the result.</p>
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <input aria-label="Template name" maxLength={40} placeholder="My template name" value={name} onChange={e => setName(e.target.value)} style={{ maxWidth: 240 }} />
      <button type="button" disabled={!name.trim() || invalid} onClick={() => { const next = { ...templates, [name.trim()]: { ...settings } }; setTemplates(next); save(settings, next); setName(''); }}>Save template</button>
      <span role="status" style={{ color: '#a6adc8', fontSize: 12 }}>{notice}</span>
    </div>
  </details>;
}
