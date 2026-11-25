'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_PDF_SETTINGS, PDF_PAGE_SIZES, PDF_PRESETS, normalizePdfSettings, migrateLegacyPdfSettings } from '@/lib/pdf-settings.mjs';
import PdfDecorationSettings from './PdfDecorationSettings';
import { loadWorkspaceSetting, workspaceSettingSaver } from '@/lib/workspace-settings-client';
import styles from './PdfSettingsPanel.module.css';

const storageKey = 'gate-pdf-settings-v2';
export default function PdfSettingsPanel({ settings, onChange, onValidityChange }) {
  const [templates, setTemplates] = useState({});
  const [name, setName] = useState('');
  const [notice, setNotice] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [revision, setRevision] = useState(0);
  const [savingAll, setSavingAll] = useState(false);
  const invalidFields = useRef(new Set());
  const report = useCallback((key, valid) => {
    if (valid) invalidFields.current.delete(key); else invalidFields.current.add(key);
    setInvalid(invalidFields.current.size > 0);
    onValidityChange?.(invalidFields.current.size === 0);
  }, [onValidityChange]);
  const saver = useRef(null), edited = useRef(false);
  // The database copy wins, so settings follow you across restarts, ports and browsers.
  // An older copy kept only in this browser is moved into the database once.
  useEffect(() => {
    let cancelled = false;
    const messages = { pending: 'Saving to the database…', saving: 'Saving to the database…', saved: 'Settings saved to the database.' };
    const saving = workspaceSettingSaver('pdf', { onStatus: (status, error) => {
      if (!cancelled) setNotice(status === 'error' ? `Not saved: ${error.message} Your changes stay active on this page; change a setting again to retry.` : messages[status]);
    } });
    saver.current = saving;
    const apply = value => {
      onChange(normalizePdfSettings(value.settings));
      setTemplates(Object.fromEntries(Object.entries(value.templates || {}).map(([key, template]) => [key, normalizePdfSettings(template)])));
    };
    let local = null;
    try {
      const current = localStorage.getItem(storageKey);
      const saved = JSON.parse(current || localStorage.getItem('gate-pdf-settings-v1') || 'null');
      const normalize = current ? normalizePdfSettings : migrateLegacyPdfSettings;
      if (saved?.settings) local = { settings: normalize(saved.settings), templates: Object.fromEntries(Object.entries(saved.templates || {}).map(([key, value]) => [key, normalize(value)])) };
    } catch { /* An unreadable browser copy is ignored; the database copy is authoritative. */ }
    loadWorkspaceSetting('pdf').then(value => {
      if (cancelled || edited.current) return;
      if (value) { apply(value); setNotice('Settings loaded. One design is used for every subject, chapter and topic.'); }
      else if (local) { apply(local); saving.save(local); setNotice('Settings from this browser are being copied to the database…'); }
    }, error => {
      if (cancelled || edited.current) return;
      if (local) apply(local);
      setNotice(`${error.message} ${local ? 'Using the copy saved in this browser.' : 'Defaults are active.'}`);
    });
    return () => { cancelled = true; saving.dispose(); };
  }, [onChange]);
  function save(next, nextTemplates = templates) {
    edited.current = true;
    onChange(next);
    saver.current?.save({ settings: next, templates: nextTemplates });
    // A browser copy is kept only as a fallback for when the database is unreachable.
    try { localStorage.setItem(storageKey, JSON.stringify({ settings: next, templates: nextTemplates })); } catch { /* Database save still runs. */ }
  }
  // Writes the current design to the database at once, without the usual short delay.
  async function saveForAllTopics() {
    edited.current = true;
    setSavingAll(true);
    try {
      await saver.current?.saveNow({ settings, templates });
      try { localStorage.setItem(storageKey, JSON.stringify({ settings, templates })); } catch { /* Database copy is saved. */ }
      setNotice(`Saved at ${new Date().toLocaleTimeString()}. These settings now apply to every subject, chapter and topic.`);
    } catch (error) {
      setNotice(`Not saved: ${error.message} Your changes stay active on this page; try again.`);
    } finally {
      setSavingAll(false);
    }
  }
  function update(key, value) {
    const next = { ...settings, [key]: value };
    if (key === 'fontSize') next.minFontSize = Math.min(next.minFontSize, value);
    save(normalizePdfSettings(next));
  }
  // Presets change the look only; Reset and saved templates also restore a page size.
  function applyPreset(value, { keepPageSize = false } = {}) {
    save({ ...value, ...(keepPageSize && { pageSize: settings.pageSize }) }); invalidFields.current.clear(); setInvalid(false); onValidityChange?.(true); setRevision(value => value + 1);
  }
  const matchesPreset = value => Object.keys(DEFAULT_PDF_SETTINGS).every(key => key === 'pageSize' || settings[key] === value[key]);
  return <section className={styles.panel} aria-label="PDF design settings">
    <div className={styles.heading}>
      <div><h3>Choose a look</h3><p className={styles.hint}>Start with a preset, then adjust what you need.</p></div>
      <button className={styles.reset} type="button" onClick={() => applyPreset(DEFAULT_PDF_SETTINGS)}>Reset</button>
    </div>
    <div className={styles.presets}>
      {Object.entries(PDF_PRESETS).map(([key, value]) => <button className={styles.preset} type="button" key={key} aria-pressed={matchesPreset(value)} onClick={() => applyPreset(value, { keepPageSize: true })}>{key}<small>{value.fontSize}pt · {value.theme === 'dark' ? 'Black' : 'White'}</small></button>)}
    </div>
    <div className={styles.grid}>
      <label>Page size<select aria-label="Page size" value={settings.pageSize} onChange={e => update('pageSize', e.target.value)}>
        {Object.entries(PDF_PAGE_SIZES).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
      </select></label>
      <label>Page theme<select aria-label="Page theme" value={settings.theme} onChange={e => update('theme', e.target.value)}><option value="dark">Black / white text</option><option value="light">White / black text</option></select></label>
      <label className={styles.fullWidth}>Text size: {settings.fontSize}pt<input aria-label="Preferred text size" type="range" min={8} max={32} step={1} value={settings.fontSize} onChange={e => update('fontSize', Number(e.target.value))} /></label>
    </div>
    <div className={styles.answer}>
      <label>Answers in PDF<select aria-label="PDF answer display" value={settings.answerMode || 'none'} onChange={e => update('answerMode', e.target.value)}><option value="none">Hide answers</option><option value="toggle">Show / hide on click</option><option value="footer">Show in page footer</option></select></label>
      <label className={styles.check}><input type="checkbox" checked={settings.includeAnswerKey} onChange={e => update('includeAnswerKey', e.target.checked)} /> Separate answer-key PDF</label>
    </div>
    {settings.answerMode === 'toggle' && <p className={styles.hint}>Stored answers start hidden. Click Show answer to reveal one in the preview, Chrome, Edge, Firefox or Acrobat.</p>}
    {invalid && <p className={styles.error} role="alert">Fix the highlighted settings before exporting.</p>}
    <div className={styles.groups}>
      <PdfDecorationSettings key={revision} settings={settings} update={update} report={report} />
      <details className={styles.group} name="pdf-design-options">
        <summary><span><strong>Page layout</strong><small>Margins, spacing, diagrams & working space</small></span></summary>
        <div className={styles.groupBody}>
          <div className={styles.grid}>
            {[
              ['minFontSize', 'Minimum text size', 8, settings.fontSize, 1, 'pt'],
              ['lineSpacing', 'Line spacing', 1.1, 1.8, 0.05, '×'],
              ['marginMm', 'Page margins', 8, 25, 1, 'mm'],
              ['imageScale', 'Diagram size', 0.5, 1.5, 0.05, '×'],
              ['workingLines', 'Working-space lines', 0, 10, 1, ''],
            ].map(([key, label, min, max, step, unit]) => <label key={key}>{label}: {Number(settings[key].toFixed(2))}{unit}<input aria-label={label} type="range" min={min} max={max} step={step} value={settings[key]} onChange={e => update(key, Number(e.target.value))} /></label>)}
            <label>If a question does not fit<select aria-label="PDF overflow handling" value={settings.overflow} onChange={e => update('overflow', e.target.value)}><option value="error">Stop and show the question</option><option value="warn">Shrink further and warn</option></select></label>
          </div>
          <p className={styles.hint}>Questions fit automatically down to the minimum text size. Check long questions in the preview.</p>
        </div>
      </details>
      <details className={styles.group} name="pdf-design-options">
        <summary><span><strong>Saved styles & extra files</strong><small>Reuse a design or include page images</small></span></summary>
        <div className={styles.groupBody}>
          <label className={styles.check}><input type="checkbox" checked={settings.includePageImages} onChange={e => update('includePageImages', e.target.checked)} /> Matching page images ZIP</label>
          <div className={styles.templates}>{Object.entries(templates).map(([key, value]) => <button type="button" className={styles.reset} key={key} onClick={() => applyPreset(value)}>{key}</button>)}</div>
          <div className={styles.templateForm}>
            <label>Save this design<input aria-label="Template name" maxLength={40} placeholder="e.g. My teaching style" value={name} onChange={e => setName(e.target.value)} /></label>
            <button type="button" disabled={!name.trim() || invalid} onClick={() => { const next = { ...templates, [name.trim()]: { ...settings } }; setTemplates(next); save(settings, next); setName(''); }}>Save template</button>
          </div>
        </div>
      </details>
    </div>
    <div className={styles.saveAll}>
      <button type="button" className={styles.saveAllButton} disabled={invalid || savingAll} onClick={saveForAllTopics}>{savingAll ? 'Saving…' : 'Save settings for all topics'}</button>
      <p className={styles.hint}>One PDF design is shared by every subject, chapter and topic, and changes also save automatically. Text and diagram sizes set on a single question in the editor still apply to that question.</p>
    </div>
    <p role="status" className={styles.notice}>{notice || 'Settings are saved automatically to the database.'}</p>
  </section>;
}
