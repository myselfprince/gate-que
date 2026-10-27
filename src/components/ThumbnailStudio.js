'use client';
/* eslint-disable @next/next/no-img-element -- Local images and rendered previews use natural canvas coordinates. */
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_THUMBNAIL_SETTINGS, cutoutPlacement, normalizeCutout, normalizeThumbnailSettings } from '@/lib/thumbnail-render.mjs';
import { CANVAS_WIDTH, CANVAS_HEIGHT, EMPTY_EDITOR, MAX_EDITOR_LAYERS, newLayer, normalizeThumbnailEditor, layerBoxStyle, layerContentStyle, layerImageStyle, resizeLayer, snapLayer, editorForQuestion, setQuestionLayers, applyCutoutPlacement, questionSlideWindow } from '@/lib/thumbnail-editor.mjs';
import { cutoutAsset, editorAsset, readPngCutout, trimTransparentImage } from '@/lib/creator-assets.mjs';
import ThumbnailInspector from './ThumbnailInspector';
import ThumbnailSlides from './ThumbnailSlides';
import useThumbnailPreviews from './useThumbnailPreviews';
import styles from './ThumbnailStudio.module.css';

const INITIAL = { settings: DEFAULT_THUMBNAIL_SETTINGS, editor: EMPTY_EDITOR };
const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const editable = target => target?.closest('input, textarea, select, [contenteditable="true"]');
function download(content, name, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function ThumbnailStudio({ subject, chapter, questions, metadata, selectedId, onSelect, active, notify }) {
  const [project, setProject] = useState(INITIAL), projectRef = useRef(project);
  const [selected, setSelected] = useState(''), [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false);
  const [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [saved, setSaved] = useState('Loading design…'), [revision, setRevision] = useState(0);
  const [historyCounts, setHistoryCounts] = useState([0, 0]), history = useRef({ past: [], future: [], group: '' });
  const [tab, setTab] = useState('design'), [zoom, setZoom] = useState(1), [fit, setFit] = useState(.6);
  const [snapping, setSnapping] = useState(true), [grid, setGrid] = useState(false), [guides, setGuides] = useState([]), [dropping, setDropping] = useState(false);
  const viewportRef = useRef(null), stageRef = useRef(null), studioRef = useRef(null);
  const fileRef = useRef(null), importRef = useRef(null), replaceRef = useRef(null);
  const drag = useRef(null), exportController = useRef(null), dropDepth = useRef(0), restored = useRef(false);
  const { settings, editor: design } = project;
  const chapterKey = JSON.stringify([subject, chapter]);
  const entry = metadata.find(item => item.question_id === selectedId) || metadata[0];
  const editor = editorForQuestion(design, entry?.question_id);
  const slides = questionSlideWindow(metadata, entry?.question_id);
  const question = questions.find(item => item.id === entry?.question_id);
  const layer = editor.layers.find(item => item.id === selected), asset = editor.assets.find(item => item.id === layer?.assetId);
  const scale = fit * zoom;
  const hasEntry = Boolean(entry);
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const stored = await editorAsset('get', undefined, chapterKey) || await editorAsset('get');
        let next;
        if (stored) next = { settings: normalizeThumbnailSettings(stored.settings), editor: normalizeThumbnailEditor(stored.editor) };
        else {
          const oldSettings = normalizeThumbnailSettings(JSON.parse(localStorage.getItem('gate-thumbnail-settings-v1') || '{}'));
          const oldAsset = await cutoutAsset('get');
          let design = EMPTY_EDITOR;
          if (oldAsset) {
            const image = { ...normalizeCutout(oldAsset.dataUrl), id: crypto.randomUUID(), name: oldAsset.name || 'Cutout' };
            design = { version: 1, assets: [image], layers: [newLayer('image', { assetId: image.id, name: image.name, ...cutoutPlacement(oldSettings, image), opacity: oldSettings.overlayOpacity, flipX: oldSettings.overlayFlip })] };
          }
          next = { settings: oldSettings, editor: normalizeThumbnailEditor(design) };
        }
        if (!cancelled) { projectRef.current = next; setProject(next); }
      } catch { if (!cancelled) setNotice('Saved design could not be restored. You can import a project backup.'); }
      finally { if (!cancelled) { restored.current = true; setReady(true); } }
    }, 0);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [chapterKey]);
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      setSaved('Saving…');
      editorAsset('put', { version: 2, ...project }, chapterKey).then(() => { if (projectRef.current === project) setSaved('Saved in this browser'); }, () => { setSaved('Not saved'); setNotice('Browser storage is unavailable. Download a project backup to keep this design.'); });
    }, 500);
    return () => clearTimeout(timer);
  }, [project, ready, chapterKey]);
  useEffect(() => () => {
    exportController.current?.abort();
    if (restored.current) void editorAsset('put', { version: 2, ...projectRef.current }, chapterKey).catch(() => {});
  }, [chapterKey]);
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(() => { if (viewport.clientWidth) setFit(Math.max(.12, (viewport.clientWidth - 112) / CANVAS_WIDTH)); });
    observer.observe(viewport); return () => observer.disconnect();
  }, [hasEntry]);
  function checkpoint(group = '') {
    const h = history.current;
    if (!group || h.group !== group) { h.past = [...h.past, { project: projectRef.current, questionId: entry?.question_id, selected }].slice(-50); h.future = []; }
    h.group = group; setHistoryCounts([h.past.length, h.future.length]);
  }
  function commit(next, record = true, group = '') {
    if (!ready) return;
    if (record) checkpoint(group);
    projectRef.current = next; setProject(next); setSaved('Saving…');
  }
  function updateSettings(patch, group = '') {
    try { commit({ ...projectRef.current, settings: normalizeThumbnailSettings({ ...projectRef.current.settings, ...patch }) }, true, group); }
    catch (error) { setError(error.message); }
  }
  function updateLayer(id, patch, record = true, group = '') {
    const current = projectRef.current;
    const layers = editorForQuestion(current.editor, entry.question_id).layers.map(item => item.id === id ? { ...item, ...patch } : item);
    commit({ ...current, editor: setQuestionLayers(current.editor, entry.question_id, layers) }, record, group);
  }
  function patchLayer(patch, group = '') {
    if (!layer || layer.locked) return;
    try { updateLayer(layer.id, normalizeThumbnailEditor({ ...editor, layers: [{ ...layer, ...patch }] }).layers[0], true, group); }
    catch (error) { setError(error.message); }
  }
  function travel(direction) {
    const h = history.current, source = direction === 'undo' ? h.past : h.future;
    if (!source.length || drag.current) return;
    const next = source.pop(); (direction === 'undo' ? h.future : h.past).push({ project: projectRef.current, questionId: entry?.question_id, selected });
    h.group = ''; projectRef.current = next.project; setProject(next.project); setSelected(next.selected); onSelect(next.questionId); setSaved('Saving…'); setHistoryCounts([h.past.length, h.future.length]); setGuides([]);
  }
  function addLayer(type, patch = {}) {
    const current = projectRef.current;
    const layers = editorForQuestion(current.editor, entry.question_id).layers;
    if (layers.length >= MAX_EDITOR_LAYERS) return setError(`Use at most ${MAX_EDITOR_LAYERS} layers.`);
    const item = newLayer(type, { x: 8, y: 18, width: type === 'text' ? 56 : 30, height: type === 'text' ? 24 : 32, ...patch });
    commit({ ...current, editor: setQuestionLayers(current.editor, entry.question_id, [...layers, item]) }); setSelected(item.id); setTab('object');
  }
  function removeLayer() {
    if (!layer || layer.locked) return;
    const current = projectRef.current;
    commit({ ...current, editor: setQuestionLayers(current.editor, entry.question_id, editor.layers.filter(item => item.id !== layer.id)) }); setSelected('');
  }
  function duplicateLayer() {
    if (layer) addLayer(layer.type, { ...layer, id: crypto.randomUUID(), name: `${layer.name.slice(0, 90)} copy`, x: Math.min(400, layer.x + 2), y: Math.min(400, layer.y + 2), locked: false });
  }
  function reorder(id, offset) {
    const current = projectRef.current, layers = [...editorForQuestion(current.editor, entry.question_id).layers], index = layers.findIndex(item => item.id === id);
    const destination = Math.max(0, Math.min(layers.length - 1, index + offset));
    if (index < 0 || destination === index) return;
    layers.splice(destination, 0, layers.splice(index, 1)[0]); commit({ ...current, editor: setQuestionLayers(current.editor, entry.question_id, layers) });
  }
  async function upload(files, point, replacementId) {
    if (!ready || uploading) return;
    setUploading(true); setError('');
    try {
      const list = Array.from(files);
      if (!list.length) return;
      if (list.length + editor.layers.length - (replacementId ? 1 : 0) > MAX_EDITOR_LAYERS) throw Error(`Use at most ${MAX_EDITOR_LAYERS} layers.`);
      const images = [];
      for (const file of list) images.push({ ...await readPngCutout(file), id: crypto.randomUUID() });
      const current = projectRef.current; let layers = [...editorForQuestion(current.editor, entry.question_id).layers];
      images.forEach((image, index) => {
        const height = Math.min(68, 32 * CANVAS_WIDTH / CANVAS_HEIGHT * image.height / image.width);
        const width = height * CANVAS_HEIGHT / CANVAS_WIDTH * image.width / image.height;
        if (replacementId && index === 0) layers = layers.map(item => item.id === replacementId ? { ...item, assetId: image.id, name: image.name, crop: { top: 0, right: 0, bottom: 0, left: 0 } } : item);
        else layers.push(newLayer('image', { assetId: image.id, name: image.name, width, height, x: (point?.x ?? 78) - width / 2 + index * 2, y: (point?.y ?? 55) - height / 2 + index * 2 }));
      });
      commit({ ...current, editor: normalizeThumbnailEditor(setQuestionLayers(current.editor, entry.question_id, layers, [...current.editor.assets, ...images])) });
      setSelected(replacementId || layers.at(-1).id); setTab('object'); setNotice(`${images.length} image(s) added to Q${entry.index}. Drag a corner to resize; move beyond any canvas edge. GIFs use the first frame.`);
    } catch (error) { setError(error.message); }
    finally { setUploading(false); }
  }
  async function trimImage() {
    if (!asset || !layer || layer.locked) return;
    setUploading(true); setError('');
    try {
      const trimmed = await trimTransparentImage(asset);
      if (!trimmed) return setNotice('There are no transparent borders to trim.');
      const image = { ...trimmed, id: crypto.randomUUID() }, current = projectRef.current;
      const layers = editorForQuestion(current.editor, entry.question_id).layers.map(item => item.id === layer.id ? { ...item, assetId: image.id, crop: { top: 0, right: 0, bottom: 0, left: 0 }, height: item.width * CANVAS_WIDTH / CANVAS_HEIGHT * image.height / image.width } : item);
      commit({ ...current, editor: normalizeThumbnailEditor(setQuestionLayers(current.editor, entry.question_id, layers, [...current.editor.assets, image])) }); setNotice('Transparent borders trimmed. Align the visible subject directly to an edge.');
    } catch (error) { setError(error.message); }
    finally { setUploading(false); }
  }
  function startTransform(event, id, action = 'move') {
    if (event.button !== 0 || !ready) return;
    event.preventDefault(); event.stopPropagation(); setSelected(id); setTab('object');
    const item = editorForQuestion(projectRef.current.editor, entry.question_id).layers.find(item => item.id === id);
    if (!item || item.locked) return;
    studioRef.current.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = stageRef.current.getBoundingClientRect();
    drag.current = { id, action, layer: item, pointerX: event.clientX, pointerY: event.clientY, rect,
      angle: Math.atan2(event.clientY - (rect.top + (item.y + item.height / 2) / 100 * rect.height), event.clientX - (rect.left + (item.x + item.width / 2) / 100 * rect.width)) };
  }
  function moveTransform(event) {
    const d = drag.current;
    if (!d) return;
    const dx = (event.clientX - d.pointerX) / d.rect.width * CANVAS_WIDTH, dy = (event.clientY - d.pointerY) / d.rect.height * CANVAS_HEIGHT;
    if (!d.recorded) {
      if (Math.abs(dx) + Math.abs(dy) < .1) return;
      checkpoint(); d.recorded = true;
    }
    let patch;
    if (d.action === 'move') {
      patch = { x: d.layer.x + dx / CANVAS_WIDTH * 100, y: d.layer.y + dy / CANVAS_HEIGHT * 100 };
      if (snapping && !event.altKey) {
        const snap = snapLayer({ ...d.layer, ...patch }, editorForQuestion(projectRef.current.editor, entry.question_id).layers, .6 / zoom); patch = snap.patch; setGuides(snap.guides);
      } else setGuides([]);
    } else if (d.action === 'rotate') {
      const angle = Math.atan2(event.clientY - (d.rect.top + (d.layer.y + d.layer.height / 2) / 100 * d.rect.height), event.clientX - (d.rect.left + (d.layer.x + d.layer.width / 2) / 100 * d.rect.width));
      let rotation = d.layer.rotation + (angle - d.angle) * 180 / Math.PI;
      if (event.shiftKey) rotation = Math.round(rotation / 15) * 15;
      patch = { rotation: ((rotation + 540) % 360) - 180 };
    } else patch = resizeLayer(d.layer, d.action, dx, dy, event.shiftKey ? !d.layer.aspectLocked : d.layer.aspectLocked);
    patch = Object.fromEntries(Object.entries(patch).map(([key, value]) => [key, Math.max(key === 'x' || key === 'y' ? -400 : key === 'rotation' ? -360 : .5, Math.min(key === 'height' ? 800 : 400, value))]));
    updateLayer(d.id, patch, false);
  }
  function endTransform() { drag.current = null; setGuides([]); history.current.group = ''; }
  function chooseQuestion(id) {
    if (!id || busy || uploading || drag.current) return;
    const target = editorForQuestion(projectRef.current.editor, id);
    setSelected(target.layers.some(item => item.id === selected) ? selected : target.layers.find(item => item.type === 'image')?.id || '');
    setGuides([]); history.current.group = ''; onSelect(id);
  }
  function applyPlacementToAll() {
    if (!layer || layer.type !== 'image') return;
    try {
      const current = projectRef.current;
      commit({ ...current, editor: normalizeThumbnailEditor(applyCutoutPlacement(current.editor, entry.question_id, layer.id, questions.map(question => question.id))) });
      setNotice(`Applied this cutout's position and size to all ${metadata.length} questions. Individual images and photo adjustments are preserved. Undo reverses this action.`);
    } catch (error) { setError(error.message); }
  }
  function onKeyDown(event) {
    if (editable(event.target) || !ready) return;
    const key = event.key.toLowerCase(), mod = event.ctrlKey || event.metaKey;
    if (key === 'pagedown' || key === 'pageup') { event.preventDefault(); chooseQuestion(metadata[slides.index + (key === 'pagedown' ? 1 : -1)]?.question_id); }
    else if (mod && key === 'z') { event.preventDefault(); travel(event.shiftKey ? 'redo' : 'undo'); }
    else if (mod && key === 'y') { event.preventDefault(); travel('redo'); }
    else if (mod && key === 'd') { event.preventDefault(); duplicateLayer(); }
    else if (key === 'escape') { if (drag.current) endTransform(); else setSelected(''); }
    else if (key === 'delete' || key === 'backspace') { event.preventDefault(); removeLayer(); }
    else if (layer && !layer.locked && key.startsWith('arrow')) {
      event.preventDefault(); const amount = event.shiftKey ? 10 : 1;
      patchLayer({ x: layer.x + (key === 'arrowright' ? amount : key === 'arrowleft' ? -amount : 0) / CANVAS_WIDTH * 100, y: layer.y + (key === 'arrowdown' ? amount : key === 'arrowup' ? -amount : 0) / CANVAS_HEIGHT * 100 }, 'nudge');
    } else if (mod && (key === '[' || key === ']') && layer) { event.preventDefault(); reorder(layer.id, key === '[' ? -1 : 1); }
  }
  function onDrop(event) {
    event.preventDefault(); setDropping(false); dropDepth.current = 0;
    if (!event.dataTransfer.files.length) return;
    const rect = stageRef.current.getBoundingClientRect();
    const point = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom ? { x: (event.clientX - rect.left) / rect.width * 100, y: (event.clientY - rect.top) / rect.height * 100 } : undefined;
    void upload(event.dataTransfer.files, point);
  }
  function onPaste(event) {
    if (editable(event.target)) return;
    const files = [...event.clipboardData.items].filter(item => item.type.startsWith('image/')).map(item => item.getAsFile()).filter(Boolean);
    if (files.length) { event.preventDefault(); void upload(files); }
  }
  async function importProject(file) {
    setError('');
    try {
      if (file.size > 12 * 1024 * 1024) throw Error('Choose a project smaller than 12 MB.');
      const data = JSON.parse(await file.text());
      if (data.format !== 'g4gate-thumbnail' || data.version !== 2) throw Error('Choose a G4Gate thumbnail project backup.');
      commit({ settings: normalizeThumbnailSettings(data.settings), editor: normalizeThumbnailEditor(data.editor) }); setSelected(''); setNotice('Project imported. You can undo this change.');
    } catch (error) { setError(error.message); }
  }
  const { template, theme, textSide, contentWidth, fontSize, accent, brand, showAnswer, backgroundColor, customBackground, showQuestion } = settings;
  const previewRequest = JSON.stringify({ subject, chapter, questions: question ? [question] : [], questionNumbers: [entry?.index], headlines: [entry?.topic || ''], questionIndex: 0, thumbnailSettings: { template, theme, textSide, contentWidth, fontSize, accent, brand, showAnswer, backgroundColor, customBackground, showQuestion } });
  const previews = useThumbnailPreviews({ subject, chapter, questions, metadata, settings, ready, selectedId: entry?.question_id, revision });
  const rendered = previews.images.get(entry?.question_id);
  const preview = rendered?.dataUrl || '';
  const currentPreview = Boolean(preview);
  const previewError = previews.errors.get(entry?.question_id);
  const warnings = rendered?.warnings || [];
  const loading = ready && !currentPreview && !previewError;
  async function exportImages(mode) {
    setBusy(true); setError('');
    const controller = new AbortController(); exportController.current = controller;
    const snapshot = projectRef.current;
    try {
      const payload = mode === 'single' ? JSON.parse(previewRequest) : { subject, chapter, questions, headlines: questions.map(item => metadata.find(entry => entry.question_id === item.id)?.topic || '') };
      const response = await fetch('/api/thumbnail-export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, mode, thumbnailSettings: snapshot.settings, editor: mode === 'single' ? editorForQuestion(snapshot.editor, entry.question_id) : snapshot.editor }), signal: controller.signal });
      if (!response.ok) throw Error((await response.json()).error || 'Thumbnail export failed.');
      const blob = await response.blob();
      download(blob, mode === 'single' ? `Question_${entry.index}.png` : `${subject}_${chapter}_Thumbnails.zip`.replace(/[^a-zA-Z0-9_.-]+/g, '_'), blob.type);
      if (mode === 'single' && blob.size > 2 * 1024 * 1024) setNotice('Downloaded. This PNG exceeds 2 MB; choose a smaller resolution if your upload requires it.');
      notify(mode === 'single' ? `Downloaded Q${entry.index} thumbnail.` : 'Downloaded chapter thumbnails with your design.');
    } catch (error) { if (error.name === 'AbortError') setNotice('Export cancelled.'); else setError(error.message); }
    finally { setBusy(false); exportController.current = null; }
  }
  if (!entry) return null;
  return <section ref={studioRef} className={styles.studio} aria-label="Thumbnail studio" tabIndex={-1} onKeyDown={onKeyDown} onPaste={onPaste} onPointerDownCapture={() => { history.current.group = ''; }} onBlurCapture={() => { history.current.group = ''; }}
    onDragEnter={e => { if ([...e.dataTransfer.types].includes('Files')) { e.preventDefault(); dropDepth.current++; setDropping(true); } }}
    onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }} onDragLeave={e => { e.preventDefault(); if (--dropDepth.current <= 0) { setDropping(false); dropDepth.current = 0; } }} onDrop={onDrop}>
    <header className={styles.heading}><div><p className={styles.eyebrow}>G4Gate · Creative studio</p><h2>Make it yours.</h2><p className={styles.muted}>Drop images, build with layers, and take your design right to the edge.</p></div><span className={styles.saveStatus} role="status">{saved}</span></header>
    <input ref={fileRef} hidden multiple type="file" aria-label="Upload images" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => { void upload(e.target.files); e.target.value = ''; }} />
    <input ref={replaceRef} hidden type="file" aria-label="Replace selected image" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => { if (e.target.files.length) void upload(e.target.files, undefined, selected); e.target.value = ''; }} />
    <input ref={importRef} hidden type="file" aria-label="Import thumbnail project" accept="application/json,.json" onChange={e => { if (e.target.files[0]) void importProject(e.target.files[0]); e.target.value = ''; }} />
    <div className={styles.topbar}><div className={styles.actions}><button className={styles.primary} disabled={!ready || uploading} onClick={() => fileRef.current.click()}>{uploading ? 'Preparing…' : '+ Upload images'}</button><button className={styles.secondary} disabled={!ready} onClick={() => addLayer('text')}>+ Text</button><button className={styles.secondary} disabled={!ready} onClick={() => addLayer('shape')}>+ Shape</button></div><div className={styles.actions}><button className={styles.secondary} aria-label="Undo design edit" title="Ctrl+Z" disabled={!historyCounts[0]} onClick={() => travel('undo')}>↶ Undo</button><button className={styles.secondary} aria-label="Redo design edit" title="Ctrl+Shift+Z" disabled={!historyCounts[1]} onClick={() => travel('redo')}>↷ Redo</button><button className={styles.secondary} disabled={!ready} onClick={() => download(JSON.stringify({ format: 'g4gate-thumbnail', version: 2, ...projectRef.current }), 'thumbnail-project.json', 'application/json')}>Save project</button><button className={styles.secondary} disabled={!ready || uploading} onClick={() => importRef.current.click()}>Open project</button></div></div>
    <div className={styles.layout}>
      <ThumbnailInspector {...{ tab, setTab, settings, editor, layer, asset, ready, uploading, selected, setSelected, updateSettings, patchLayer, updateLayer, reorder, trimImage, duplicateLayer, removeLayer, applyPlacementToAll }} questionNumber={entry.index} questionCount={metadata.length} browse={() => fileRef.current.click()} replace={() => replaceRef.current.click()} reset={() => { const current = projectRef.current; commit({ ...current, editor: setQuestionLayers(current.editor, entry.question_id, []) }); setSelected(''); }} />
      <div className={styles.workarea}>
        <div className={styles.canvasBar}><div className={styles.questionArrows}><button className={styles.secondary} aria-label="Previous question" title="Previous question (Page Up)" disabled={!ready || busy || uploading || slides.index === 0} onClick={() => chooseQuestion(metadata[slides.index - 1]?.question_id)}>←</button><strong>{slides.index + 1} / {metadata.length}</strong><button className={styles.secondary} aria-label="Next question" title="Next question (Page Down)" disabled={!ready || busy || uploading || slides.index === metadata.length - 1} onClick={() => chooseQuestion(metadata[slides.index + 1]?.question_id)}>→</button></div><label>Question<select aria-label="Thumbnail question" disabled={busy || uploading} value={entry.question_id} onChange={e => chooseQuestion(e.target.value)}>{metadata.map(item => <option key={item.question_id} value={item.question_id}>Q{item.index} · {item.year} · {item.topic}</option>)}</select></label><span>16:9 · {settings.resolution} × {settings.resolution * 9 / 16}</span></div>
        <div className={styles.editScope}>Editing Q{entry.index} · Cutout and layer changes are saved for this question.</div>
        <div className={styles.preloadStatus} role="status" aria-label="Question preload progress">{previews.completed === previews.total && previews.total > 0 ? `All ${previews.total} questions ready · instant navigation` : `Preloading questions: ${previews.completed} / ${previews.total} ready`}{previews.failed > 0 && <button className={styles.textButton} onClick={previews.retry}>Retry failed previews</button>}</div>
        <div className={styles.slidesWorkspace}>
        <ThumbnailSlides {...{ metadata, design, ready, previews }} selectedId={entry.question_id} disabled={busy || uploading} onSelect={chooseQuestion} />
        <div className={styles.canvasEditor}>
        <div ref={viewportRef} className={`${styles.viewport} ${dropping ? styles.dropActive : ''}`} tabIndex={0} aria-label="Design canvas. Paste or drop images here." onPointerDown={e => { if (e.target === e.currentTarget) setSelected(''); }}>
          <div className={styles.canvasFrame} style={{ width: CANVAS_WIDTH * scale, height: CANVAS_HEIGHT * scale }}>
            <div ref={stageRef} className={styles.stage} data-testid="thumbnail-canvas" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${scale})` }} aria-busy={loading} onPointerDown={e => { if (e.target === e.currentTarget) setSelected(''); }} onPointerMove={moveTransform} onPointerUp={endTransform} onPointerCancel={endTransform} onLostPointerCapture={endTransform}>
              <div className={styles.artboard} onPointerDown={() => setSelected('')}>
                {currentPreview ? <img className={styles.base} src={preview} alt={`Q${entry.index} thumbnail preview`} draggable={false} /> : <div className={styles.placeholder}>{previewError ? 'Preview could not load. Retry below.' : ready ? 'Loading question preview…' : 'Your preview will appear here.'}</div>}
                {editor.layers.filter(item => !item.hidden).map(item => <div key={item.id} role="button" tabIndex={item.locked ? -1 : 0} aria-label={`Select ${item.name}`} aria-pressed={selected === item.id} data-layer-id={item.id} className={`${styles.canvasLayer} ${item.locked ? styles.lockedLayer : ''}`} style={{ ...layerBoxStyle(item), filter: item.shadow ? `drop-shadow(0 8px ${item.shadow}px #0009)` : 'none' }} onPointerDown={e => startTransform(e, item.id)} onFocus={() => setSelected(item.id)} onDoubleClick={() => { setSelected(item.id); setTab('object'); }}>
                  <div style={layerContentStyle(item)}>{item.type === 'image' ? <img src={editor.assets.find(asset => asset.id === item.assetId)?.dataUrl} alt="" draggable={false} style={layerImageStyle(item)} /> : item.type === 'text' ? item.text : null}</div>
                </div>)}
                {grid && <div className={styles.grid} />}
              </div>
              {guides.map(guide => <div key={guide.axis} className={styles.guide} style={guide.axis === 'x' ? { left: `${guide.value}%`, top: 0, height: '100%', width: 0 } : { top: `${guide.value}%`, left: 0, width: '100%', height: 0 }} />)}
              {layer && !layer.hidden && <div className={styles.selection} data-testid="layer-selection" style={{ ...layerBoxStyle(layer), opacity: 1, '--handle': `${11 / scale}px`, '--stroke': `${1.5 / scale}px`, '--rotate-offset': `${32 / scale}px` }} onPointerDown={e => startTransform(e, layer.id)}>
                <span className={styles.layerBadge} style={{ fontSize: 11 / scale, bottom: `calc(100% + ${8 / scale}px)`, padding: `${3 / scale}px ${7 / scale}px` }}>{layer.locked ? 'Locked · ' : ''}{layer.name} · {Math.round(layer.width * 12.8)} × {Math.round(layer.height * 7.2)}</span>
                {!layer.locked && <>{HANDLES.map(handle => <button key={handle} className={`${styles.handle} ${styles[handle]}`} aria-label={`Resize ${handle}`} onPointerDown={e => startTransform(e, layer.id, handle)} />)}<button className={styles.rotateHandle} aria-label="Rotate selected layer" title="Drag to rotate · Shift snaps to 15°" onPointerDown={e => startTransform(e, layer.id, 'rotate')}>↻</button></>}
              </div>}
            </div>
          </div>
          {dropping && <div className={styles.dropMessage}>Drop images to add them to your design</div>}
        </div>
        <div className={styles.canvasFooter}><div className={styles.actions}><label className={styles.check}><input type="checkbox" checked={snapping} onChange={e => setSnapping(e.target.checked)} />Snap</label><label className={styles.check}><input type="checkbox" checked={grid} onChange={e => setGrid(e.target.checked)} />Grid</label><button className={styles.textButton} onClick={async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await studioRef.current.requestFullscreen(); } catch { setNotice('Fullscreen is unavailable in this browser.'); } }}>Fullscreen</button></div><div className={styles.actions}><button className={styles.iconButton} aria-label="Zoom out" disabled={zoom <= .5} onClick={() => setZoom(n => Math.max(.5, n - .25))}>−</button><button className={styles.textButton} aria-label="Fit canvas to workspace" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}% · Fit</button><button className={styles.iconButton} aria-label="Zoom in" disabled={zoom >= 3} onClick={() => setZoom(n => Math.min(3, n + .25))}>+</button></div></div>
        </div>
        </div>
        <p className={styles.hint}>Drag to move · Corners resize · ↻ rotates · Shift: constrain · Alt: bypass snapping · Arrow keys: 1px / Shift: 10px · Ctrl+Z: undo</p>
        <div className={styles.exportPanel}><div><h3>Ready for your next upload.</h3><p className={styles.muted}>Your canvas edges are the export edges. The chapter ZIP keeps each question&apos;s individual cutout placement and layers.</p></div><div className={styles.exportSettings}><label>PNG resolution<select aria-label="PNG resolution" value={settings.resolution} disabled={busy} onChange={e => updateSettings({ resolution: Number(e.target.value) })}><option value={1280}>1280 × 720</option><option value={1920}>1920 × 1080</option><option value={3840}>3840 × 2160 · 4K</option></select></label><label className={styles.check}><input type="checkbox" checked={settings.includeBlanks} disabled={busy} onChange={e => updateSettings({ includeBlanks: e.target.checked })} />Include blank placeholders</label></div><div className={styles.actions}><button className={styles.primary} disabled={!ready || busy || uploading || !currentPreview || loading} onClick={() => exportImages('single')}>Download Q{entry.index} PNG</button><button className={styles.secondary} disabled={!ready || busy || uploading || !currentPreview || loading} onClick={() => exportImages('zip')}>Chapter ZIP · {settings.includeBlanks ? questions.length : metadata.length}</button><button className={styles.textButton} disabled={loading} onClick={() => setRevision(n => n + 1)}>Refresh preview</button>{busy && <button className={styles.danger} onClick={() => exportController.current?.abort()}>Cancel export</button>}</div></div>
        {(loading || !currentPreview && !error) && <p role="status" className={styles.muted}>Updating question preview…</p>}
        {busy && <p role="status" className={styles.muted}>Rendering your images. Keep this tab open until the download starts.</p>}
        {warnings.map(warning => <p key={warning} className={styles.warning}>{warning}</p>)}
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {previewError && <p role="alert" className={styles.error}>{previewError} <button className={styles.textButton} onClick={previews.retry}>Retry preview</button></p>}
        {notice && <p role="status" className={styles.warning}>{notice}</p>}
      </div>
    </div>
  </section>;
}
