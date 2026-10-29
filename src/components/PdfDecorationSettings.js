'use client';

import { useEffect, useState } from 'react';
import { PAGE_POSITIONS, WATERMARK_POSITIONS } from '@/lib/pdf-settings.mjs';
import styles from './PdfSettingsPanel.module.css';

function TextSetting({ name, label, value, update, report, maxLength, placeholder }) {
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => { setDraft(value); setError(''); report(name, true); }, 0);
    return () => clearTimeout(timer);
  }, [value, name, report]);
  function apply() {
    try { update(name, draft); setError(''); report(name, true); }
    catch (error) { setError(error.message); report(name, false); }
  }
  return <label>{label}<input aria-label={label} value={draft} maxLength={maxLength} placeholder={placeholder} onChange={event => setDraft(event.target.value)} onBlur={apply} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); apply(); } }} aria-invalid={Boolean(error)} />{error && <small role="alert" style={{ color: '#f38ba8' }}>{error} Changes have not been applied.</small>}</label>;
}

const labelForPosition = value => value.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
export default function PdfDecorationSettings({ settings, update, report }) {
  const check = (key, label) => <label key={key} className={styles.check}><input type="checkbox" checked={settings[key]} onChange={event => update(key, event.target.checked)} /> {label}</label>;
  const range = (key, label, min, max, step = 1, unit = '') => <label key={key}>{label}: {key === 'watermarkOpacity' ? Math.round(settings[key] * 100) : settings[key]}{unit}<input aria-label={label} type="range" min={min} max={max} step={step} value={settings[key]} onChange={event => update(key, Number(event.target.value))} /></label>;
  const position = (key, label, positions = PAGE_POSITIONS) => <label key={key}>{label}<select aria-label={label} value={settings[key]} onChange={event => update(key, event.target.value)}>{positions.map(value => <option key={value} value={value}>{labelForPosition(value)}</option>)}</select></label>;
  const text = (key, label, maxLength, placeholder) => <TextSetting key={key} name={key} label={label} maxLength={maxLength} placeholder={placeholder} value={settings[key]} update={update} report={report} />;
  return <>
    <details className={styles.group} name="pdf-design-options">
      <summary><span><strong>Solution & website links</strong><small>YouTube, GateOverflow & your website</small></span></summary>
      <div className={styles.groupBody}>
        <fieldset className={styles.fieldset}><legend>YouTube solution</legend><div className={styles.grid}>{check('showSolutions', 'Show video solution links')}{check('showSolutionIcon', 'Show red YouTube play icon')}{text('solutionLabel', 'Solution link label', 40)}{position('solutionPosition', 'Solution link position')}{range('solutionFontSize', 'Solution label size', 8, 16, 1, 'pt')}</div></fieldset>
        <fieldset className={styles.fieldset}><legend>GateOverflow solution</legend><div className={styles.grid}>{check('showGateOverflow', 'Show GateOverflow solution links')}{text('gateOverflowLabel', 'GateOverflow link label', 40)}{position('gateOverflowPosition', 'GateOverflow link position')}{range('gateOverflowFontSize', 'GateOverflow label size', 8, 16, 1, 'pt')}</div></fieldset>
        <p className={styles.hint}>Add each question’s YouTube and GateOverflow URLs in the question editor. Available links appear automatically.</p>
        <fieldset className={styles.fieldset} style={{ marginTop: 18 }}><legend>Your website</legend><div className={styles.grid}>{check('showWebsite', 'Show website link on every page')}{text('websiteUrl', 'Website URL', 2000, 'https://g4gate.com')}{text('websiteLabel', 'Website link label', 80)}{position('websitePosition', 'Website link position')}</div><p className={styles.hint}>One website link, repeated on every PDF page.</p></fieldset>
        {check('openLinksInNewTab', 'Open PDF links in a new tab in the app preview')}
        <p className={styles.hint}>Text and URL edits apply on Enter or when you leave the field.</p>
      </div>
    </details>
    <details className={styles.group} name="pdf-design-options">
      <summary><span><strong>Branding & page labels</strong><small>Watermark, title & page numbers</small></span></summary>
      <div className={styles.groupBody}>
        <fieldset className={styles.fieldset}><legend>Watermark</legend>
          <div className={styles.grid}>{check('showWatermark', 'Show background watermark')}{text('watermarkText', 'Watermark text', 80)}{position('watermarkPosition', 'Watermark position', WATERMARK_POSITIONS)}{range('watermarkOpacity', 'Watermark opacity', 0, 1, 0.01, '%')}{range('watermarkFontSize', 'Watermark size', 16, 96, 1, 'pt')}{range('watermarkAngle', 'Watermark angle', -90, 90, 1, '°')}{check('watermarkClickable', 'Make the watermark clickable')}</div>
          <p className={styles.hint}>A clickable watermark opens the Website URL in the links section.</p>
        </fieldset>
        <fieldset className={styles.fieldset}><legend>Title and question headings</legend><div className={styles.grid}>
      <label>Subject / chapter title<select aria-label="Subject / chapter title" value={settings.titleMode} onChange={event => update('titleMode', event.target.value)}><option value="first">First page only</option><option value="every">Every page</option><option value="none">Hidden</option></select></label>
      {text('titleText', 'Custom title (optional)', 240, 'Leave empty to use subject and chapter')}
      <label>Title alignment<select aria-label="Title alignment" value={settings.titleAlignment} onChange={event => update('titleAlignment', event.target.value)}>{['left', 'center', 'right'].map(value => <option key={value} value={value}>{labelForPosition(value)}</option>)}</select></label>
      {range('titleFontSize', 'Title size', 8, 20, 1, 'pt')}{check('stripTitleNumbers', 'Remove numbering prefixes from subject / chapter')}{check('showQuestionNumber', 'Show question number')}{check('showQuestionMeta', 'Show exam year, marks and question type')}
        </div></fieldset>
        <fieldset className={styles.fieldset}><legend>Page numbers</legend><div className={styles.grid}>{check('showPageNumbers', 'Show page numbers')}{position('pageNumberPosition', 'Page number position')}{text('pageNumberTemplate', 'Page number format', 80, '{page} / {total}')}{range('pageNumberFontSize', 'Page number size', 8, 16, 1, 'pt')}</div><p className={styles.hint}>Use {'{page}'} for the current page and {'{total}'} for the total.</p></fieldset>
      </div>
    </details>
  </>;
}
