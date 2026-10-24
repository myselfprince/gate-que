'use client';

import { useEffect, useState } from 'react';
import { PAGE_POSITIONS, WATERMARK_POSITIONS } from '@/lib/pdf-settings.mjs';

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
  const check = (key, label) => <label key={key} style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '10px 0' }}><input type="checkbox" checked={settings[key]} onChange={event => update(key, event.target.checked)} /> {label}</label>;
  const range = (key, label, min, max, step = 1, unit = '') => <label key={key}>{label}: {key === 'watermarkOpacity' ? Math.round(settings[key] * 100) : settings[key]}{unit}<input aria-label={label} type="range" min={min} max={max} step={step} value={settings[key]} onChange={event => update(key, Number(event.target.value))} /></label>;
  const position = (key, label, positions = PAGE_POSITIONS) => <label key={key}>{label}<select aria-label={label} value={settings[key]} onChange={event => update(key, event.target.value)}>{positions.map(value => <option key={value} value={value}>{labelForPosition(value)}</option>)}</select></label>;
  const text = (key, label, maxLength, placeholder) => <TextSetting key={key} name={key} label={label} maxLength={maxLength} placeholder={placeholder} value={settings[key]} update={update} report={report} />;
  const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '8px 20px' };
  const group = { marginTop: 16, border: '1px solid #45475a', borderRadius: 6, padding: '8px 14px 14px', minWidth: 0 };
  return <>
    <fieldset style={group}><legend>Watermark / branding</legend>
      <div style={grid}>{check('showWatermark', 'Show background watermark')}{text('watermarkText', 'Watermark text', 80)}{position('watermarkPosition', 'Watermark position', WATERMARK_POSITIONS)}{range('watermarkOpacity', 'Watermark opacity', 0, 1, 0.01, '%')}{range('watermarkFontSize', 'Watermark size', 16, 96, 1, 'pt')}{range('watermarkAngle', 'Watermark angle', -90, 90, 1, '°')}{check('watermarkClickable', 'Make the watermark clickable')}</div>
      <p style={{ color: '#a6adc8', fontSize: 12, marginBottom: 0 }}>The watermark sits behind the question. A clickable watermark uses the website URL below; it is off by default so text selection stays clear.</p>
    </fieldset>
    <fieldset style={group}><legend>Video solution link</legend><div style={grid}>{check('showSolutions', 'Show video solution links')}{check('showSolutionIcon', 'Show red YouTube play icon')}{text('solutionLabel', 'Solution link label', 40)}{position('solutionPosition', 'Solution link position')}{range('solutionFontSize', 'Solution label size', 8, 16, 1, 'pt')}</div><p style={{ color: '#a6adc8', fontSize: 12, marginBottom: 0 }}>Each question uses its own YouTube URL and timestamp from the editor.</p></fieldset>
    <fieldset style={group}><legend>Website link</legend><div style={grid}>{text('websiteUrl', 'Website URL', 2000, 'https://g4gate.com')}{check('showWebsite', 'Show an extra website link')}{text('websiteLabel', 'Website link label', 80)}{position('websitePosition', 'Website link position')}</div></fieldset>
    <fieldset style={group}><legend>Page numbering</legend><div style={grid}>{check('showPageNumbers', 'Show page numbers')}{position('pageNumberPosition', 'Page number position')}{text('pageNumberTemplate', 'Page number format', 80, '{page} / {total}')}{range('pageNumberFontSize', 'Page number size', 8, 16, 1, 'pt')}</div><p style={{ color: '#a6adc8', fontSize: 12, marginBottom: 0 }}>Use {'{page}'} for the current PDF page and {'{total}'} for its total, for example Page {'{page}'} of {'{total}'}.</p></fieldset>
    <fieldset style={group}><legend>Title and question headings</legend><div style={grid}>
      <label>Subject / chapter title<select aria-label="Subject / chapter title" value={settings.titleMode} onChange={event => update('titleMode', event.target.value)}><option value="first">First page only</option><option value="every">Every page</option><option value="none">Hidden</option></select></label>
      {text('titleText', 'Custom title (optional)', 240, 'Leave empty to use subject and chapter')}
      <label>Title alignment<select aria-label="Title alignment" value={settings.titleAlignment} onChange={event => update('titleAlignment', event.target.value)}>{['left', 'center', 'right'].map(value => <option key={value} value={value}>{labelForPosition(value)}</option>)}</select></label>
      {range('titleFontSize', 'Title size', 8, 20, 1, 'pt')}{check('stripTitleNumbers', 'Remove numbering prefixes from subject / chapter')}{check('showQuestionNumber', 'Show question number')}{check('showQuestionMeta', 'Show exam year, marks and question type')}
    </div></fieldset>
    <fieldset style={group}><legend>Links and editing</legend>{check('openLinksInNewTab', 'Open PDF links in a new tab in the app preview')}<p style={{ color: '#a6adc8', fontSize: 12, marginBottom: 0 }}>Downloaded PDF web links follow the PDF reader’s tab/window settings. Text and URL edits apply on Enter or when you leave the field. Items sharing a header/footer position stack automatically.</p></fieldset>
  </>;
}
