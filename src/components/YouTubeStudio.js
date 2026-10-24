'use client';

import { useEffect, useImperativeHandle, useState } from 'react';
import { DEFAULT_YOUTUBE_SETTINGS, buildYouTubeExport, normalizeTags, tagCost, youtubeCopyText, youtubeCsv } from '@/lib/youtube-metadata.mjs';
import styles from './YouTubeStudio.module.css';
import ThumbnailStudio from './ThumbnailStudio';

export function downloadFile(content, filename, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function YouTubeStudio({ ref, subject, chapter, questions, notify, active, children }) {
  const [settings, setSettings] = useState({ ...DEFAULT_YOUTUBE_SETTINGS });
  const [drafts, setDrafts] = useState({});
  const [selectedId, setSelectedId] = useState('');
  const [format, setFormat] = useState('json');
  const [exportScope, setExportScope] = useState('all');
  const [notice, setNotice] = useState('');
  const [studioView, setStudioView] = useState('metadata');
  const [ready, setReady] = useState(false);
  const storageKey = `gate-youtube-drafts-v1:${subject}:${chapter}`;
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setSettings({ ...DEFAULT_YOUTUBE_SETTINGS, ...JSON.parse(localStorage.getItem('gate-youtube-settings-v1') || '{}') });
        setDrafts(JSON.parse(localStorage.getItem(storageKey) || '{}'));
      } catch { setNotice('Saved YouTube drafts could not be restored.'); }
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [storageKey]);
  function saveSettings(key, value) {
    const next = { ...settings, [key]: value }; setSettings(next);
    try { localStorage.setItem('gate-youtube-settings-v1', JSON.stringify(next)); }
    catch { setNotice('Settings are active, but this browser could not save them.'); }
  }
  function saveDraft(id, next) {
    const updated = { ...drafts, [id]: next }; setDrafts(updated);
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); }
    catch { setNotice('Changes are active, but this browser could not save them.'); }
  }
  const entries = buildYouTubeExport(questions, { subject, chapter, settings }, drafts);
  const entry = entries.find(item => item.question_id === selectedId) || entries[0];
  const draft = drafts[entry?.question_id] || {};
  async function copy(text, message = 'Copied for YouTube.') {
    try { await navigator.clipboard.writeText(text); notify(message); }
    catch { notify('Clipboard access failed. Download a TXT file or copy from the fields.', 'error'); }
  }
  useImperativeHandle(ref, () => ({
    copyQuestion(id) {
      const item = entries.find(entry => entry.question_id === id);
      if (!ready) return notify('YouTube drafts are still loading. Please try again.', 'info');
      if (!item || item.warnings.length) return notify(item?.warnings[0] || 'Question not found.', 'error');
      return copy(youtubeCopyText(item), `Copied title, description and tags for Q${item.index}.`);
    },
    openQuestion(id) { setSelectedId(id); setStudioView('metadata'); },
  }));
  function exportData() {
    const selected = exportScope === 'current' ? [entry].filter(Boolean) : entries;
    const invalid = selected.find(item => item.warnings.length);
    if (invalid) return notify(`Q${invalid.index}: ${invalid.warnings[0]}`, 'error');
    if (!selected.length) return;
    const filename = `${subject}_${chapter}_YouTube`.replace(/[^a-zA-Z0-9_.-]+/g, '_');
    const content = format === 'json' ? JSON.stringify(selected, null, 2) : format === 'csv' ? youtubeCsv(selected) : selected.map(youtubeCopyText).join('\n\n' + '—'.repeat(48) + '\n\n');
    downloadFile(content, `${filename}.${format}`, format === 'json' ? 'application/json' : format === 'csv' ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8');
    notify(`Downloaded ${selected.length} YouTube ${selected.length === 1 ? 'entry' : 'entries'}.`);
  }
  if (!entries.length) return <div className={styles.empty}><h3>No questions to prepare yet</h3><p>Load or add questions in the editor, then return here. Blank placeholders are skipped.</p></div>;
  return <>
    <div className={styles.switcher} role="tablist" aria-label="YouTube tool"><button id="yt-metadata-tab" role="tab" aria-selected={studioView === 'metadata'} aria-controls="yt-metadata-panel" onClick={() => setStudioView('metadata')}>Title & description</button><button id="yt-thumbnail-tab" role="tab" aria-selected={studioView === 'thumbnails'} aria-controls="yt-thumbnail-panel" onClick={() => setStudioView('thumbnails')}>Thumbnails & cutout</button></div>
    <div id="yt-metadata-panel" role="tabpanel" aria-labelledby="yt-metadata-tab" hidden={studioView !== 'metadata'} className={styles.studio}>
      <aside>
        <section className={styles.panel} aria-label="YouTube defaults">
          <h3>Upload defaults</h3><p className={styles.muted}>Used for every question. Your settings and custom edits are saved in this browser.</p>
          <label>Channel name<input disabled={!ready} maxLength={80} value={settings.channelName} onChange={e => saveSettings('channelName', e.target.value)} /></label>
          <label>Website URL<input disabled={!ready} type="url" value={settings.website} onChange={e => saveSettings('website', e.target.value)} placeholder="https://your-site.com" /></label>
          <label>Chapter playlist URL<input disabled={!ready} type="url" value={settings.playlistUrl} onChange={e => saveSettings('playlistUrl', e.target.value)} placeholder="https://www.youtube.com/playlist?list=…" /></label>
          <label>Default title style<select disabled={!ready} value={settings.titleStyle} onChange={e => saveSettings('titleStyle', e.target.value)}><option value="topic">Topic first</option><option value="exam">Exam & year first</option><option value="question">Question hook</option></select></label>
          <label className={styles.check}><input disabled={!ready} type="checkbox" checked={settings.includeQuestion} onChange={e => saveSettings('includeQuestion', e.target.checked)} />Include question and options</label>
          <label className={styles.check}><input disabled={!ready} type="checkbox" checked={settings.includeAnswer} onChange={e => saveSettings('includeAnswer', e.target.checked)} />Include stored NAT answer</label>
          <label>Description footer<textarea disabled={!ready} rows={3} maxLength={1000} value={settings.footer} onChange={e => saveSettings('footer', e.target.value)} placeholder="Your links or call to action" /></label>
          <p className={styles.muted}>Custom titles and descriptions keep your edits when defaults change. Reset that question to regenerate them.</p>
        </section>
        <section className={styles.panel} aria-label="YouTube export">
          <h3>Export YT Data</h3><p className={styles.muted}>{entries.length} videos · original question numbers preserved · blank placeholders skipped.</p>
          <label>Export scope<select value={exportScope} onChange={e => setExportScope(e.target.value)}><option value="all">Whole chapter · {entries.length} videos</option><option value="current">Current question · Q{entry.index}</option></select></label>
          <label>File format<select value={format} onChange={e => setFormat(e.target.value)}><option value="json">JSON · video data</option><option value="csv">CSV · spreadsheet</option><option value="txt">TXT · ready to paste</option></select></label>
          <div className={styles.actions}><button className={styles.export} disabled={!ready} onClick={exportData}>Download {format.toUpperCase()}</button></div>
        </section>
      </aside>
      <section className={styles.panel} aria-label="YouTube metadata editor">
        <h3>Make each upload easy to find</h3><p className={styles.muted}>Start with a relevant topic and clear exam keywords. Review the generated copy against your video before publishing.</p>
        <label>Question<select aria-label="YouTube question" value={entry.question_id} onChange={e => setSelectedId(e.target.value)}>{entries.map(item => <option key={item.question_id} value={item.question_id}>Q{item.index} · {item.year} · {item.topic}</option>)}</select></label>
        <label>Focus topic / search phrase<input aria-label="YouTube focus topic" disabled={!ready} maxLength={120} value={draft.topic ?? ''} onChange={e => saveDraft(entry.question_id, { ...draft, topic: e.target.value })} placeholder={entry.topic} /></label>
        <div className={styles.fieldHeading}><label htmlFor="yt-title">Video title <span className={`${styles.count} ${entry.video_title.length > 100 ? styles.bad : ''}`}>{entry.video_title.length}/100</span></label><button className={styles.secondary} disabled={!ready || entry.warnings.length > 0} onClick={() => copy(entry.video_title, 'Title copied.')}>Copy title</button></div>
        <input id="yt-title" aria-invalid={entry.video_title.length > 100} disabled={!ready} value={entry.video_title} onChange={e => saveDraft(entry.question_id, { ...draft, title: e.target.value })} />
        <details><summary className={styles.muted} style={{ cursor: 'pointer', marginTop: 10 }}>Try another title</summary><div className={styles.suggestions}>{entry.title_suggestions.map((title, index) => <button key={index} disabled={!ready} onClick={() => saveDraft(entry.question_id, { ...draft, title })}>{title}</button>)}</div></details>
        <div className={styles.fieldHeading}><label htmlFor="yt-description">Description <span className={`${styles.count} ${entry.description.length > 5000 ? styles.bad : ''}`}>{entry.description.length}/5,000</span></label><button className={styles.secondary} disabled={!ready || entry.warnings.length > 0} onClick={() => copy(entry.description, 'Description copied.')}>Copy description</button></div>
        <textarea id="yt-description" aria-invalid={entry.description.length > 5000} rows={15} disabled={!ready} value={entry.description} onChange={e => saveDraft(entry.question_id, { ...draft, description: e.target.value })} />
        <div className={styles.fieldHeading}><label htmlFor="yt-tags">Tags <span className={styles.count}>{tagCost(entry.tags)}/500</span></label><button className={styles.secondary} disabled={!ready} onClick={() => copy(entry.tags.join(', '), 'Tags copied.')}>Copy tags</button></div>
        <textarea id="yt-tags" rows={2} disabled={!ready} value={draft.tags ?? entry.tags.join(', ')} onChange={e => saveDraft(entry.question_id, { ...draft, tags: e.target.value })} onBlur={() => { if (draft.tags !== undefined) saveDraft(entry.question_id, { ...draft, tags: normalizeTags(draft.tags).join(', ') }); }} />
        <p className={styles.muted}>Separate tags with commas. Duplicates and tags beyond the 500-character budget are removed on export.</p>
        {entry.warnings.map(warning => <p key={warning} role="alert" className={styles.bad}>{warning}</p>)}
        <div className={styles.actions}><button className={styles.primary} disabled={!ready || entry.warnings.length > 0} onClick={() => copy(youtubeCopyText(entry), `Copied upload pack for Q${entry.index}.`)}>Copy for YouTube</button><button className={styles.secondary} disabled={!ready || !Object.keys(draft).length} onClick={() => saveDraft(entry.question_id, {})}>Reset this question</button></div>
        <div className={styles.searchPreview}><h4>{entry.video_title}</h4><p className={styles.muted}>{settings.channelName} · {entry.description.split('\n').slice(0, 2).join('\n')}</p></div>
        <p className={styles.muted}>Preview of the title and opening description. Search results can display differently.</p>
        {notice && <p role="status" className={styles.notice}>{notice}</p>}
      </section>
    </div>
    <div id="yt-thumbnail-panel" role="tabpanel" aria-labelledby="yt-thumbnail-tab" hidden={studioView !== 'thumbnails'}>
      <ThumbnailStudio subject={subject} chapter={chapter} questions={questions} metadata={entries} selectedId={entry.question_id} onSelect={setSelectedId} active={active && studioView === 'thumbnails'} notify={notify} />
      {children}
    </div>
  </>;
}
