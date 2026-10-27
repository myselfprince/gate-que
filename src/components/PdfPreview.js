'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './PdfPreview.module.css';

function Thumbnail({ pdf, number, current, select }) {
  const element = useRef(null);
  const canvas = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); } }, { rootMargin: '100px' });
    observer.observe(element.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    let cancelled = false, render;
    pdf.getPage(number).then(page => {
      if (cancelled) return;
      const viewport = page.getViewport({ scale: 128 / page.getViewport({ scale: 1 }).width });
      canvas.current.width = Math.ceil(viewport.width); canvas.current.height = Math.ceil(viewport.height);
      render = page.render({ canvas: canvas.current, viewport });
      return render.promise;
    }).catch(error => { if (error.name !== 'RenderingCancelledException') console.error('PDF thumbnail:', error); });
    return () => { cancelled = true; render?.cancel(); };
  }, [pdf, number, visible]);
  return <button type="button" ref={element} className={styles.thumbnail} aria-label={`Preview page ${number}`} aria-current={current ? 'page' : undefined} onClick={() => select(number)}><canvas ref={canvas} width="128" height="90" />{number}</button>;
}

export default function PdfPreview({ url, data, compact = false, openLinksInNewTab = true }) {
  const [loaded, setLoaded] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState('fit');
  const [width, setWidth] = useState(800);
  const [pageSize, setPageSize] = useState({ width: 800, height: 565 });
  const [links, setLinks] = useState([]);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [finding, setFinding] = useState(false);
  const [findMessage, setFindMessage] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [layerRevision, setLayerRevision] = useState(0);
  const canvas = useRef(null), viewportRef = useRef(null), textRef = useRef(null), rootRef = useRef(null);
  useEffect(() => {
    let disposed = false, task;
    import('pdfjs-dist/build/pdf.mjs').then(async library => {
      if (disposed) return;
      library.GlobalWorkerOptions.workerSrc = `/api/pdf-viewer/build/pdf.worker.min.mjs?v=${library.version}`;
      task = library.getDocument({ ...(data ? { data: new Uint8Array(data.slice(0)) } : { url }), withCredentials: true, isEvalSupported: false, cMapUrl: '/api/pdf-viewer/cmaps/', cMapPacked: true, standardFontDataUrl: '/api/pdf-viewer/standard_fonts/', wasmUrl: '/api/pdf-viewer/wasm/' });
      const pdf = await task.promise;
      const outline = await pdf.getOutline();
      const optionalContentConfig = await pdf.getOptionalContentConfig();
      const flatten = entries => entries.flatMap(item => [item, ...flatten(item.items || [])]);
      const bookmarks = await Promise.all(flatten(outline || []).map(async item => ({ title: item.title, page: typeof item.dest?.[0] === 'object' ? (await pdf.getPageIndex(item.dest[0])) + 1 : 1 })));
      if (!disposed) { setLoaded({ pdf, library, optionalContentConfig }); setBookmarks(bookmarks); setPageNumber(1); setError(''); }
    }).catch(error => { if (!disposed) setError(error.message); });
    return () => { disposed = true; task?.destroy(); };
  }, [url, data]);
  useEffect(() => {
    if (!loaded || !viewportRef.current) return;
    const observer = new ResizeObserver(entries => setWidth(entries[0].contentRect.width));
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    let disposed = false, render, textLayer;
    const textContainer = textRef.current;
    (async () => {
      const page = await loaded.pdf.getPage(pageNumber);
      if (disposed) return;
      setLinks([]);
      const base = page.getViewport({ scale: 1 });
      const scale = zoom === 'fit' ? Math.max(0.2, (width - 32) / base.width) : Number(zoom);
      const viewport = page.getViewport({ scale });
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const target = canvas.current;
      delete target.dataset.renderedPage;
      delete target.dataset.renderedWidth;
      target.width = Math.floor(viewport.width * ratio); target.height = Math.floor(viewport.height * ratio);
      target.style.width = `${viewport.width}px`; target.style.height = `${viewport.height}px`;
      textContainer.replaceChildren();
      textContainer.style.setProperty('--total-scale-factor', String(scale));
      textContainer.style.setProperty('--scale-round-x', '1px'); textContainer.style.setProperty('--scale-round-y', '1px');
      setPageSize({ width: viewport.width, height: viewport.height });
      render = page.render({ canvas: target, viewport, optionalContentConfigPromise: Promise.resolve(loaded.optionalContentConfig), transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0] });
      await render.promise;
      if (disposed) return;
      const annotations = await page.getAnnotations();
      if (disposed) return;
      setLinks(annotations.filter(annotation => annotation.subtype === 'Link' && (annotation.setOCGState || /^https?:\/\//i.test(annotation.url || ''))).map(annotation => {
        const [x1, y1] = viewport.convertToViewportPoint(annotation.rect[0], annotation.rect[1]);
        const [x2, y2] = viewport.convertToViewportPoint(annotation.rect[2], annotation.rect[3]);
        return { id: annotation.id, url: annotation.url, setOCGState: annotation.setOCGState, left: Math.min(x1, x2), top: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) };
      }));
      const content = await page.getTextContent();
      if (disposed) return;
      textLayer = new loaded.library.TextLayer({ textContentSource: content, container: textContainer, viewport });
      await textLayer.render();
      if (!disposed) { target.dataset.renderedPage = String(pageNumber); target.dataset.renderedWidth = String(viewport.width); }
    })().catch(error => { if (!disposed && error.name !== 'RenderingCancelledException') setError(error.message); });
    return () => { disposed = true; render?.cancel(); textLayer?.cancel(); };
  }, [loaded, pageNumber, zoom, width, layerRevision]);
  async function find(event) {
    event.preventDefault();
    if (!loaded || !query.trim()) return;
    setFinding(true); setFindMessage('Searching PDF...');
    try {
      const found = [];
      for (let number = 1; number <= loaded.pdf.numPages; number++) {
        const content = await (await loaded.pdf.getPage(number)).getTextContent();
        if (content.items.map(item => item.str || '').join(' ').toLowerCase().includes(query.trim().toLowerCase())) found.push(number);
      }
      setMatches(found); setFindMessage(found.length ? `Found on ${found.length} pages` : 'No matching text');
      if (found.length) setPageNumber(found[0]);
    } catch (error) { setFindMessage(error.message); }
    finally { setFinding(false); }
  }
  return <div ref={rootRef} className={`${styles.viewer} ${compact ? styles.compact : ''}`} aria-label={compact ? 'Live PDF sample viewer' : 'Actual PDF preview'}>
    {error && <p role="alert" className={styles.message}>PDF preview: {error}</p>}
    {!loaded ? <p className={styles.message}>Loading PDF preview...</p> : <>
      {compact ? <div className={styles.toolbar}>
        <label>Zoom<select aria-label="Live PDF zoom" value={zoom} onChange={event => setZoom(event.target.value)}><option value="fit">Fit width</option>{[0.75, 1, 1.25, 1.5, 2, 3].map(scale => <option key={scale} value={scale}>{scale * 100}%</option>)}</select></label>
        <button type="button" onClick={() => rootRef.current.requestFullscreen?.()}>Full screen</button>
      </div> : <div className={styles.toolbar}>
        <button type="button" aria-label="Previous PDF page" disabled={pageNumber <= 1} onClick={() => setPageNumber(pageNumber - 1)}>←</button>
        <label>Page <input aria-label="PDF page number" type="number" min="1" max={loaded.pdf.numPages} value={pageNumber} onChange={event => setPageNumber(Math.max(1, Math.min(loaded.pdf.numPages, Number(event.target.value) || 1)))} style={{ width: 70 }} /> / {loaded.pdf.numPages}</label>
        <button type="button" aria-label="Next PDF page" disabled={pageNumber >= loaded.pdf.numPages} onClick={() => setPageNumber(pageNumber + 1)}>→</button>
        <label>Zoom<select aria-label="PDF zoom" value={zoom} onChange={event => setZoom(event.target.value)}><option value="fit">Fit width</option>{[0.75, 1, 1.25, 1.5, 2, 3].map(scale => <option key={scale} value={scale}>{scale * 100}%</option>)}</select></label>
        {Boolean(bookmarks.length) && <label>Bookmark<select aria-label="Jump to PDF question" value={bookmarks.some(item => item.page === pageNumber) ? pageNumber : ''} onChange={event => setPageNumber(Number(event.target.value))} style={{ maxWidth: 240 }}><option value="" disabled>Jump to chapter or question</option>{bookmarks.map((item, index) => <option key={index} value={item.page}>{item.title}</option>)}</select></label>}
        <button type="button" onClick={() => rootRef.current.requestFullscreen?.()}>Full screen</button>
        <form onSubmit={find} style={{ display: 'flex', gap: 6 }}><input aria-label="Find text in PDF" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find in PDF" style={{ width: 150 }} /><button disabled={finding} type="submit">Find</button></form>
        {Boolean(matches.length) && <button type="button" onClick={() => setPageNumber(matches.find(number => number > pageNumber) || matches[0])}>Next match</button>}
        <small role="status">{findMessage}</small>
      </div>}
      <div className={styles.layout}>
        {!compact && <aside className={styles.thumbnails} aria-label="PDF page thumbnails">{Array.from({ length: loaded.pdf.numPages }, (_, index) => <Thumbnail key={index + 1} pdf={loaded.pdf} number={index + 1} current={pageNumber === index + 1} select={setPageNumber} />)}</aside>}
        <div className={styles.viewport} ref={viewportRef}>
          <div className={styles.page} style={pageSize} data-pdf-page={compact ? undefined : pageNumber} data-sample-pdf-page={compact ? pageNumber : undefined}>
            <canvas aria-label={`PDF page ${pageNumber}`} ref={canvas} />
            <div ref={textRef} className={styles.textLayer} />
            {links.map(link => link.setOCGState ? <button key={link.id} className={styles.link} style={{ left: link.left, top: link.top, width: link.width, height: link.height, padding: 0, border: 0, background: 'transparent' }} aria-label="Show / hide answer" onClick={() => { loaded.optionalContentConfig.setOCGState(link.setOCGState); setLayerRevision(value => value + 1); }} /> : <a key={link.id} className={styles.link} style={{ left: link.left, top: link.top, width: link.width, height: link.height }} href={link.url} target={openLinksInNewTab ? '_blank' : '_self'} rel="noopener noreferrer" aria-label={`Open ${link.url}`} />)}
          </div>
        </div>
      </div>
    </>}
  </div>;
}
