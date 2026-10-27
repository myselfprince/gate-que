/* eslint-disable @next/next/no-img-element -- Small server previews and local canvas assets. */
import { useEffect, useRef, useState } from 'react';
import { editorForQuestion, layerBoxStyle, layerContentStyle, layerImageStyle, questionSlideWindow, SLIDES_PER_GROUP } from '@/lib/thumbnail-editor.mjs';
import styles from './ThumbnailStudio.module.css';

function SlidePreview({ image, editor }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(.1);
  useEffect(() => {
    const node = ref.current;
    const observer = new ResizeObserver(() => { if (node.clientWidth) setScale(node.clientWidth / 1280); });
    observer.observe(node); return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={styles.slidePreview}>
    {image ? <img src={image} alt="" draggable={false} /> : <span className={styles.slidePlaceholder}>Preparing preview…</span>}
    <div className={styles.slideLayers} style={{ transform: `scale(${scale})` }}>
      {editor.layers.filter(layer => !layer.hidden).map(layer => <div key={layer.id} style={{ ...layerBoxStyle(layer), filter: layer.shadow ? `drop-shadow(0 8px ${layer.shadow}px #0009)` : 'none' }}>
        <div style={layerContentStyle(layer)}>{layer.type === 'image' ? <img src={editor.assets.find(asset => asset.id === layer.assetId)?.dataUrl} alt="" draggable={false} style={layerImageStyle(layer)} /> : layer.type === 'text' ? layer.text : null}</div>
      </div>)}
    </div>
  </div>;
}

export default function ThumbnailSlides({ metadata, design, ready, selectedId, disabled, onSelect, previews }) {
  const window = questionSlideWindow(metadata, selectedId);
  const listRef = useRef(null), keyboardNavigation = useRef(false);
  useEffect(() => {
    const list = listRef.current, card = list?.querySelector('[aria-current="true"]');
    if (!card) return;
    if (keyboardNavigation.current) { card.focus({ preventScroll: true }); keyboardNavigation.current = false; }
    if (card.offsetTop < list.scrollTop) list.scrollTop = card.offsetTop;
    else if (card.offsetTop + card.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = card.offsetTop + card.offsetHeight - list.clientHeight;
  }, [selectedId, window.start]);
  function navigateWithArrow(event) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault(); event.stopPropagation();
    if (disabled || !ready) return;
    const index = metadata.findIndex(entry => entry.question_id === selectedId);
    const next = metadata[index + (event.key === 'ArrowDown' ? 1 : -1)];
    if (next) { keyboardNavigation.current = true; onSelect(next.question_id); }
  }
  return <aside className={styles.slidesPanel} aria-label="Question slides">
    <div className={styles.slidesHeading}><h3>Question slides</h3><span>{window.start + 1}–{window.start + window.entries.length} / {window.total}</span></div>
    <p className={styles.slidesHelp}>Scroll & select · ↑ ↓ to navigate</p>
    <div className={styles.slidePager}>
      <button className={styles.secondary} aria-label="Previous 10 slides" disabled={disabled || !ready || window.start === 0} onClick={() => onSelect(metadata[Math.max(0, window.start - SLIDES_PER_GROUP)]?.question_id)}>← 10</button>
      <button className={styles.secondary} aria-label="Next 10 slides" disabled={disabled || !ready || window.start + SLIDES_PER_GROUP >= window.total} onClick={() => onSelect(metadata[window.start + SLIDES_PER_GROUP]?.question_id)}>10 →</button>
    </div>
    <div ref={listRef} className={styles.slideList} aria-label="Scrollable question previews" aria-busy={window.entries.some(entry => !previews.images.has(entry.question_id) && !previews.errors.has(entry.question_id))} onKeyDown={navigateWithArrow}>
      {window.entries.map(entry => <button key={entry.question_id} type="button" className={styles.slideCard} data-question-id={entry.question_id} aria-label={`Edit thumbnail for Q${entry.index}`} aria-current={entry.question_id === selectedId ? 'true' : undefined} disabled={disabled || !ready} onClick={() => onSelect(entry.question_id)}>
        <SlidePreview image={previews.images.get(entry.question_id)?.dataUrl} editor={editorForQuestion(design, entry.question_id)} />
        <span className={styles.slideCaption}><strong>Q{entry.index}</strong><span>{entry.year}</span>{Object.hasOwn(design.questionLayers || {}, entry.question_id) && <i title="Individual design" aria-label="Individual design">●</i>}</span>
        <span className={styles.slideTopic}>{entry.topic}</span>
      </button>)}
    </div>
    {window.entries.some(entry => previews.errors.has(entry.question_id)) && <div className={styles.slidesError} role="status"><p>Some previews could not load.</p><button className={styles.textButton} onClick={previews.retry}>Retry slides</button></div>}
  </aside>;
}
