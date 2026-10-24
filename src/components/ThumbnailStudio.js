'use client';
/* eslint-disable @next/next/no-img-element -- The preview and cutout are locally generated blob/data URLs. */
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_THUMBNAIL_SETTINGS, cutoutPlacement, normalizeCutout, normalizeThumbnailSettings } from '@/lib/thumbnail-render.mjs';
import { cutoutAsset, readPngCutout } from '@/lib/creator-assets.mjs';
import styles from './ThumbnailStudio.module.css';

export default function ThumbnailStudio({ subject, chapter, questions, metadata, selectedId, onSelect, active, notify }) {
  const [settings, setSettings] = useState({ ...DEFAULT_THUMBNAIL_SETTINGS });
  const [cutout, setCutout] = useState(null);
  const [assetName, setAssetName] = useState('');
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState('');
  const [renderedRequest, setRenderedRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const stageRef = useRef(null);
  const drag = useRef(null);
  const exportController = useRef(null);
  const entry = metadata.find(item => item.question_id === selectedId) || metadata[0];
  const question = questions.find(item => item.id === entry?.question_id);
  const placement = cutoutPlacement(settings, cutout);
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const saved = JSON.parse(localStorage.getItem('gate-thumbnail-settings-v1') || 'null');
        if (saved && !cancelled) setSettings(normalizeThumbnailSettings(saved));
        const asset = await cutoutAsset('get');
        if (asset && !cancelled) { setCutout(normalizeCutout(asset.dataUrl)); setAssetName(asset.name); }
      } catch { if (!cancelled) setNotice('Saved thumbnail settings or cutout could not be restored.'); }
      finally { if (!cancelled) setReady(true); }
    }, 0);
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);
  useEffect(() => () => exportController.current?.abort(), []);
  function update(patch) {
    const next = normalizeThumbnailSettings({ ...settings, ...patch }); setSettings(next);
    try { localStorage.setItem('gate-thumbnail-settings-v1', JSON.stringify(next)); }
    catch { setNotice('Settings are active, but this browser could not save them.'); }
  }
  const { template, theme, textSide, contentWidth, fontSize, accent, brand, showAnswer } = settings;
  const previewRequest = JSON.stringify({ subject, chapter, questions: question ? [question] : [], questionNumbers: [entry?.index], headlines: [entry?.topic || ''], questionIndex: 0, thumbnailSettings: { template, theme, textSide, contentWidth, fontSize, accent, brand, showAnswer } });
  const currentPreview = preview && renderedRequest === previewRequest;
  useEffect(() => {
    if (!active || !ready || !question) return;
    const controller = new AbortController(); let objectUrl;
    const timer = setTimeout(async () => {
      setLoading(true); setError('');
      try {
        const response = await fetch('/api/thumbnail-export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...JSON.parse(previewRequest), mode: 'preview' }), signal: controller.signal });
        if (!response.ok) throw Error((await response.json()).error || 'Preview could not be generated.');
        objectUrl = URL.createObjectURL(await response.blob());
        if (controller.signal.aborted) { URL.revokeObjectURL(objectUrl); return; }
        setPreview(objectUrl); setRenderedRequest(previewRequest); setWarnings(JSON.parse(decodeURIComponent(response.headers.get('X-Thumbnail-Warnings') || '%5B%5D')));
      } catch (error) { if (error.name !== 'AbortError') { setPreview(''); setError(error.message); } }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 700);
    return () => { clearTimeout(timer); controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [active, ready, question, previewRequest, revision]);
  async function upload(file) {
    setUploading(true); setError('');
    try {
      const asset = await readPngCutout(file); const normalized = normalizeCutout(asset.dataUrl);
      setCutout(normalized); setAssetName(asset.name);
      try { await cutoutAsset('put', asset); setNotice('Cutout saved in this browser and applied to every thumbnail.'); }
      catch { setNotice('Cutout is active for this session. This browser could not save it.'); }
    } catch (error) { setError(error.message); }
    finally { setUploading(false); }
  }
  async function removeCutout() {
    setCutout(null); setAssetName('');
    try { await cutoutAsset('delete'); setNotice('Cutout removed.'); }
    catch { setNotice('Cutout removed for this session. Browser storage could not be updated.'); }
  }
  function move(event) {
    if (!drag.current || !placement) return;
    const rect = stageRef.current.getBoundingClientRect();
    update({ overlayX: drag.current.x + (event.clientX - drag.current.pointerX) / rect.width * 100, overlayY: drag.current.y + (event.clientY - drag.current.pointerY) / rect.height * 100 });
  }
  async function exportImages(mode) {
    setBusy(true); setError('');
    const controller = new AbortController(); exportController.current = controller;
    try {
      const payload = mode === 'single' ? JSON.parse(previewRequest) : { subject, chapter, questions, headlines: questions.map(item => metadata.find(entry => entry.question_id === item.id)?.topic || '') };
      const response = await fetch('/api/thumbnail-export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, mode, thumbnailSettings: settings, cutout: cutout?.dataUrl || '' }), signal: controller.signal });
      if (!response.ok) throw Error((await response.json()).error || 'Thumbnail export failed.');
      const blob = await response.blob(); const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = mode === 'single' ? `Question_${entry.index}.png` : `${subject}_${chapter}_Thumbnails.zip`.replace(/[^a-zA-Z0-9_.-]+/g, '_'); link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      if (mode === 'single' && blob.size > 2 * 1024 * 1024) setNotice('Downloaded. This PNG exceeds 2 MB; use a desktop YouTube upload or export at a smaller resolution for mobile.');
      notify(mode === 'single' ? `Downloaded Q${entry.index} thumbnail.` : 'Downloaded chapter thumbnails with your cutout.');
    } catch (error) { if (error.name === 'AbortError') setNotice('Export cancelled.'); else setError(error.message); }
    finally { setBusy(false); exportController.current = null; }
  }
  const slider = (key, label, min, max, step = 1, suffix = '%') => <label key={key}>{label}: {Math.round(settings[key] * (key === 'overlayOpacity' ? 100 : 1))}{suffix}<input aria-label={label} disabled={!ready || uploading} type="range" min={min} max={max} step={step} value={settings[key]} onChange={e => update({ [key]: Number(e.target.value) })} /></label>;
  if (!entry) return null;
  return <section aria-label="Thumbnail studio">
    <div style={{ margin: '12px 0 18px' }}><h2 style={{ color: '#f1f3fa', marginBottom: 6 }}>Thumbnail studio</h2><p className={styles.muted}>Add your transparent PNG once. Position it here and export images ready for your upload.</p></div>
    <div className={styles.layout}>
      <div className={styles.panel}>
        <h3>Design & cutout</h3>
        <label>Layout<select disabled={!ready} value={settings.template} onChange={e => update({ template: e.target.value })}><option value="question">Full question · auto-fit</option><option value="topic">Topic headline · large text</option></select></label>
        <label>Theme<select disabled={!ready} value={settings.theme} onChange={e => update({ theme: e.target.value })}><option value="dark">Midnight</option><option value="navy">Deep blue</option><option value="light">Paper</option></select></label>
        <label>Text position<select disabled={!ready} value={settings.textSide} onChange={e => update({ textSide: e.target.value })}><option value="left">Left side</option><option value="right">Right side</option></select></label>
        <div className={styles.sliders}>{slider('contentWidth', 'Text area width', 40, 100)}{slider('fontSize', 'Question text size', 22, 54, 1, 'px')}</div>
        <label>Accent colour <input aria-label="Thumbnail accent colour" disabled={!ready} type="color" value={settings.accent} onChange={e => update({ accent: e.target.value })} /></label>
        <label>Brand label<input disabled={!ready} maxLength={60} value={settings.brand} onChange={e => update({ brand: e.target.value })} /></label>
        <label className={styles.check}><input disabled={!ready} type="checkbox" checked={settings.showAnswer} onChange={e => update({ showAnswer: e.target.checked })} />Show stored NAT answer</label>
        <div className={styles.upload} style={{ marginTop: 20 }}><label style={{ marginTop: 0 }}>Your PNG cutout<input aria-label="Upload PNG cutout" disabled={!ready || uploading} type="file" accept="image/png,.png" onChange={e => { const file = e.target.files?.[0]; if (file) upload(file); e.target.value = ''; }} /></label><p className={styles.muted}>{uploading ? 'Preparing cutout…' : assetName || 'Use a PNG with its background already removed. Transparency is preserved.'}</p></div>
        {cutout && <>
          <div className={styles.sliders}>{slider('overlayX', 'Horizontal position', 0, 100)}{slider('overlayY', 'Vertical position', 0, 100)}{slider('overlayWidth', 'Cutout size', 5, 80)}{slider('overlayOpacity', 'Cutout opacity', .1, 1, .05)}</div>
          <label className={styles.check}><input type="checkbox" checked={settings.overlayFlip} onChange={e => update({ overlayFlip: e.target.checked })} />Flip cutout horizontally</label>
          <div className={styles.actions}><button className={styles.secondary} onClick={() => update({ overlayX: 70, overlayY: 15, overlayWidth: 28, textSide: 'left' })}>Right side</button><button className={styles.secondary} onClick={() => update({ overlayX: 0, overlayY: 15, overlayWidth: 28, textSide: 'right' })}>Left side</button><button className={styles.secondary} onClick={removeCutout}>Remove cutout</button></div>
          <p className={styles.muted}>Drag the cutout in the preview, or use the sliders. Position applies to all chapter thumbnails. Keep it clear of the question text.</p>
        </>}
        <div className={styles.actions}><button className={styles.secondary} disabled={!ready} onClick={() => update(DEFAULT_THUMBNAIL_SETTINGS)}>Reset design</button></div>
      </div>
      <div className={`${styles.panel} ${styles.preview}`}>
        <div className={styles.status}><h3>Preview your thumbnail</h3><span>16:9 · {settings.resolution} × {settings.resolution * 9 / 16}</span></div>
        <label>Question<select aria-label="Thumbnail question" value={entry.question_id} onChange={e => onSelect(e.target.value)}>{metadata.map(item => <option key={item.question_id} value={item.question_id}>Q{item.index} · {item.year} · {item.topic}</option>)}</select></label>
        <div className={styles.stage} ref={stageRef} aria-busy={loading}>
          {currentPreview ? <img className={styles.base} src={preview} alt={`Q${entry.index} thumbnail preview`} /> : <div className={styles.placeholder}>{loading || !error && ready ? 'Rendering question, maths and diagrams…' : 'Your preview will appear here.'}</div>}
          {placement && <button type="button" className={styles.cutout} aria-label="Drag PNG cutout; arrow keys move by one percent" style={{ left: `${placement.x}%`, top: `${placement.y}%`, width: `${placement.width}%`, height: `${placement.height}%`, opacity: settings.overlayOpacity }} onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); drag.current = { pointerX: event.clientX, pointerY: event.clientY, x: placement.x, y: placement.y }; }} onPointerMove={move} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onKeyDown={event => { const delta = { ArrowLeft: [-1,0], ArrowRight: [1,0], ArrowUp: [0,-1], ArrowDown: [0,1] }[event.key]; if (delta) { event.preventDefault(); update({ overlayX: placement.x + delta[0], overlayY: placement.y + delta[1] }); } }}><img src={cutout.dataUrl} alt="Your custom PNG cutout" draggable={false} style={{ transform: `scaleX(${settings.overlayFlip ? -1 : 1})` }} /></button>}
        </div>
        <p role="status" className={styles.muted}>{loading || !currentPreview && !error ? 'Updating preview…' : 'Preview and downloads use the same layout. The cutout stays inside the image.'}</p>
        {warnings.map(warning => <p key={warning} className={styles.warning}>{warning}</p>)}
        <label>PNG resolution<select value={settings.resolution} onChange={e => update({ resolution: Number(e.target.value) })}><option value={1280}>1280 × 720</option><option value={1920}>1920 × 1080</option><option value={3840}>3840 × 2160</option></select></label>
        <label className={styles.check}><input type="checkbox" checked={settings.includeBlanks} onChange={e => update({ includeBlanks: e.target.checked })} />Include blank placeholders in ZIP</label>
        <div className={styles.actions}><button className={styles.primary} disabled={!ready || busy || uploading || !currentPreview || loading} onClick={() => exportImages('single')}>Download Q{entry.index} PNG</button><button className={styles.primary} disabled={!ready || busy || uploading || !currentPreview || loading} onClick={() => exportImages('zip')}>Chapter thumbnails ZIP · {settings.includeBlanks ? questions.length : metadata.length}</button><button className={styles.secondary} disabled={loading} onClick={() => setRevision(value => value + 1)}>Refresh preview</button>{busy && <button className={styles.secondary} onClick={() => exportController.current?.abort()}>Cancel export</button>}</div>
        {busy && <p role="status" className={styles.muted}>Rendering your images. Keep this tab open until the download starts.</p>}
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {notice && <p role="status" className={styles.warning}>{notice}</p>}
      </div>
    </div>
  </section>;
}
