'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GROUP_COLOURS, cubeExpression, emptyKmap, groupCube, kmapLayout, normalizeKmap, simplifyKmap, valuesFromTerms } from '@/lib/kmap.mjs';
import { kmapArtwork, kmapLatex, kmapSvg } from '@/lib/kmap-svg.mjs';
import { contentBounds, createNode, emptyDiagram, validateDiagram } from '@/lib/diagram-model.mjs';
import { safeFilename, saveDownload, svgPng } from '@/lib/diagram-export.mjs';
import styles from './KMapStudio.module.css';
const STORAGE = 'gate-kmap-v2';
const tools = [['cycle', 'Cycle', 'C'], ['1', 'Paint 1', '1'], ['0', 'Paint 0', '0'], ['X', 'Don’t-care', 'X'], ['erase', 'Erase', 'E'], ['group', 'Group cells', 'G']];
const list = (data, value) => data.values.flatMap((v, index) => v === value ? [index] : []).join(', ');
export default function KMapStudio() {
  const router = useRouter();
  const [editTarget, setEditTarget] = useState('');
  const [historyCounts, setHistoryCounts] = useState({
    undo: 0,
    redo: 0
  });
  function syncHistory() {
    setHistoryCounts({
      undo: undoRef.current.length,
      redo: redoRef.current.length
    });
    setRevision(value => value + 1);
  }
  const [data, setData] = useState(() => emptyKmap()),
    dataRef = useRef(data),
    undoRef = useRef([]),
    redoRef = useRef([]),
    paintRef = useRef(null),
    svgRef = useRef(null),
    fileRef = useRef(null),
    toastTimer = useRef(null);
  const [revision, setRevision] = useState(0),
    [ready, setReady] = useState(false),
    [tool, setTool] = useState('cycle'),
    [selected, setSelected] = useState([]),
    [zoom, setZoom] = useState(1),
    [vars, setVars] = useState('ABCD');
  const [terms, setTerms] = useState(''),
    [dontCares, setDontCares] = useState(''),
    [error, setError] = useState(''),
    [toast, setToast] = useState(''),
    [busy, setBusy] = useState(false),
    [background, setBackground] = useState('white'),
    [pngScale, setPngScale] = useState(3),
    [saved, setSaved] = useState('Restoring draft…');
  function notify(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 4000);
  }
  function stage(next) {
    dataRef.current = next;
    setData(next);
    setTerms(list(next, next.mode === 'pos' ? '0' : '1'));
    setDontCares(list(next, 'X'));
    setSaved('Saving browser draft…');
  }
  function remember(previous) {
    undoRef.current = [...undoRef.current, structuredClone(previous)].slice(-60);
    redoRef.current = [];
    syncHistory();
  }
  function apply(next) {
    remember(dataRef.current);
    stage(next);
    setError('');
  }
  function undo() {
    const previous = undoRef.current.pop();
    if (!previous) return;
    redoRef.current.push(structuredClone(dataRef.current));
    stage(previous);
    setVars(previous.variables);
    setSelected([]);
    syncHistory();
  }
  function redo() {
    const next = redoRef.current.pop();
    if (!next) return;
    undoRef.current.push(structuredClone(dataRef.current));
    stage(next);
    setVars(next.variables);
    setSelected([]);
    syncHistory();
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE);
        setEditTarget(sessionStorage.getItem('gate-kmap-edit-node') || '');
        if (saved) {
          const next = normalizeKmap(JSON.parse(saved));
          stage(next);
          setVars(next.variables);
        }
      } catch {
        notify('Saved K-Map could not be restored. Import a JSON backup if available.');
      }
      setReady(true);
    }, 0);
    return () => {
      clearTimeout(timer);
      clearTimeout(toastTimer.current);
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE, JSON.stringify(data));
        setSaved('Saved in this browser');
      } catch {
        setSaved('Storage full · download JSON to save');
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [data, ready]);
  useEffect(() => {
    const listener = event => {
      if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(event.target.tagName)) return;
      if (event.ctrlKey || event.metaKey) {
        if (event.key.toLowerCase() === 'z') {
          event.preventDefault();
          if (event.shiftKey) redo();else undo();
        }
        return;
      }
      const next = tools.find(item => item[2].toLowerCase() === event.key.toLowerCase());
      if (next) {
        event.preventDefault();
        setTool(next[0]);
      }
      if (event.key === 'Escape') setSelected([]);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  });
  const solution = useMemo(() => {
    try {
      return {
        value: simplifyKmap(data.values, data.variables, data.mode),
        error: ''
      };
    } catch (error) {
      return {
        value: null,
        error: error.message
      };
    }
  }, [data.values, data.variables, data.mode]);
  const art = kmapArtwork(data, {
      interactive: true,
      selected
    }),
    layout = kmapLayout(data),
    blankCount = data.values.filter(value => value === '').length;
  function paint(term, gesture) {
    if (gesture.touched.has(term)) return;
    gesture.touched.add(term);
    if (gesture.tool === 'group') {
      setSelected(previous => gesture.remove ? previous.filter(value => value !== term) : [...new Set([...previous, term])]);
      return;
    }
    const current = dataRef.current;
    if (current.values[term] === gesture.value) return;
    const values = [...current.values];
    values[term] = gesture.value;
    stage({
      ...current,
      values,
      groups: []
    });
    gesture.changed = true;
    setSelected([]);
  }
  function down(event) {
    const element = event.target.closest('[data-minterm]');
    if (!element) return;
    event.preventDefault();
    const term = Number(element.dataset.minterm),
      current = dataRef.current.values[term],
      value = tool === 'cycle' ? {
        '': '1',
        '1': '0',
        '0': 'X',
        'X': ''
      }[current] : tool === 'erase' ? '' : tool;
    const gesture = {
      tool,
      value,
      base: structuredClone(dataRef.current),
      touched: new Set(),
      remove: selected.includes(term)
    };
    paintRef.current = gesture;
    paint(term, gesture);
    svgRef.current.setPointerCapture(event.pointerId);
  }
  function move(event) {
    const gesture = paintRef.current;
    if (!gesture) return;
    const element = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-minterm]');
    if (element && svgRef.current.contains(element)) paint(Number(element.dataset.minterm), gesture);
  }
  function up(event) {
    if (paintRef.current?.changed) remember(paintRef.current.base);
    paintRef.current = null;
    if (svgRef.current.hasPointerCapture(event.pointerId)) svgRef.current.releasePointerCapture(event.pointerId);
  }
  function cellKey(event) {
    const term = Number(event.target.closest('[data-minterm]')?.dataset.minterm);
    if (!Number.isInteger(term)) return;
    const key = event.key.toUpperCase();
    if (['0', '1', 'X', 'DELETE', 'BACKSPACE', 'ENTER', ' '].includes(key)) {
      event.preventDefault();
      const value = key === 'ENTER' || key === ' ' ? {
        '': '1',
        '1': '0',
        '0': 'X',
        'X': ''
      }[data.values[term]] : ['DELETE', 'BACKSPACE'].includes(key) ? '' : key;
      if (tool === 'group' && (key === 'ENTER' || key === ' ')) {
        setSelected(previous => previous.includes(term) ? previous.filter(v => v !== term) : [...previous, term]);
        return;
      }
      const values = [...data.values];
      values[term] = value;
      apply({
        ...data,
        values,
        groups: []
      });
      return;
    }
    const delta = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -layout.cols.length,
      ArrowDown: layout.cols.length
    }[event.key];
    if (delta) {
      event.preventDefault();
      const index = layout.cells.findIndex(cell => cell.term === term),
        next = layout.cells[(index + delta + layout.cells.length) % layout.cells.length];
      svgRef.current.querySelector(`[data-minterm="${next.term}"]`)?.focus();
    }
  }
  function applyTerms() {
    try {
      const values = valuesFromTerms(data.numVars, terms, dontCares, data.mode);
      apply({
        ...data,
        values,
        groups: []
      });
      setSelected([]);
      notify('Terms applied. Remaining cells filled automatically.');
    } catch (error) {
      setError(error.message);
    }
  }
  function addGroup() {
    try {
      const cube = groupCube(selected, data.numVars),
        target = data.mode === 'pos' ? '0' : '1';
      if (cube.terms.some(term => data.values[term] !== target && data.values[term] !== 'X')) throw Error(`Group only ${target}s and don’t-cares for ${data.mode.toUpperCase()}.`);
      if (!cube.terms.some(term => data.values[term] === target)) throw Error('A group needs at least one required cell.');
      if (data.groups.some(group => group.length === cube.terms.length && group.every(term => cube.terms.includes(term)))) throw Error('This group already exists.');
      if (data.groups.length >= 64) throw Error('Use up to 64 groups.');
      apply({
        ...data,
        groups: [...data.groups, cube.terms]
      });
      setSelected([]);
      notify('Valid Boolean group added.');
    } catch (error) {
      setError(error.message);
    }
  }
  function renameVariables() {
    try {
      const next = normalizeKmap({
        ...data,
        variables: vars
      });
      apply(next);
    } catch (error) {
      setError(error.message);
      setVars(data.variables);
    }
  }
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      notify('Copied.');
    } catch {
      notify('Clipboard unavailable. Use a download instead.');
    }
  }
  async function download(kind) {
    setBusy(true);
    try {
      const name = safeFilename(data.title || `KMap_${data.numVars}Var`);
      if (kind === 'json') saveDownload(JSON.stringify(data, null, 2), `${name}.json`);else if (kind === 'tex') saveDownload(kmapLatex(data), `${name}.tex`, 'text/plain;charset=utf-8');else if (kind === 'svg') saveDownload(kmapSvg(data, {
        background
      }), `${name}.svg`, 'image/svg+xml;charset=utf-8');else if (kind === 'csv') {
        const rows = [['m', ...data.variables.split(''), 'F'], ...data.values.map((value, index) => [index, ...index.toString(2).padStart(data.numVars, '0').split(''), value])];
        saveDownload(rows.map(row => row.join(',')).join('\r\n'), `${name}_truth_table.csv`, 'text/csv;charset=utf-8');
      } else {
        const png = await svgPng(kmapSvg(data, {
          background
        }), pngScale);
        if (kind === 'clipboard') {
          if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) throw Error('Image clipboard is unavailable. Download PNG instead.');
          await navigator.clipboard.write([new ClipboardItem({
            'image/png': png
          })]);
        } else saveDownload(png, `${name}.png`, 'image/png');
      }
      notify(kind === 'clipboard' ? 'K-Map image copied.' : `${kind.toUpperCase()} downloaded.`);
    } catch (error) {
      notify(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function importFile(file) {
    if (!file) return;
    try {
      if (file.size > 1024 * 1024) throw Error('K-Map JSON must be smaller than 1 MB.');
      const next = normalizeKmap(JSON.parse(await file.text()));
      apply(next);
      setVars(next.variables);
      setSelected([]);
      notify('K-Map imported.');
    } catch (error) {
      setError(error.message);
    }
  }
  function sendToDiagram() {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(data));
      const raw = localStorage.getItem('gate-diagram-current-v1');
      let doc = raw ? validateDiagram(JSON.parse(raw)) : emptyDiagram('K-Map diagram');
      const bounds = contentBounds(doc, 0),
        x = doc.nodes.length ? bounds.x + bounds.width + 80 : 100;
      const previous = editTarget ? doc.nodes.find(node => node.id === editTarget && node.type === 'kmap') : null;
      if (!previous && doc.nodes.length >= 500) throw Error('The current diagram is full. Start another diagram before adding this map.');
      const node = previous ? { ...previous, kmap: normalizeKmap(data), label: data.title } : createNode('kmap', x, 100, {
        width: art.width,
        height: art.height,
        label: data.title,
        kmap: normalizeKmap(data)
      });
      doc = {
        ...doc,
        nodes: previous ? doc.nodes.map(item => item.id === previous.id ? node : item) : [...doc.nodes, node]
      };
      sessionStorage.setItem('gate-diagram-transfer', JSON.stringify(doc));
      sessionStorage.removeItem('gate-kmap-edit-node');
      router.push('/diagram-maker?import=kmap');
    } catch (error) {
      notify(error.message || 'K-Map could not be sent to the diagram workspace.');
    }
  }
  return <main className={styles.workspace}>
    <header className={styles.heading}><div><p className={styles.eyebrow}>G4Gate · Boolean design</p><h1>See the pattern. Simplify the logic.</h1><p>Paint, group and solve 2–6 variable Karnaugh maps. Export clean artwork in seconds.</p></div><nav className={styles.nav}><Link href="/">← Question editor</Link><Link href="/diagram-maker">Diagram studio ↗</Link></nav></header>
    <div className={styles.layout} data-history={revision}>
      <aside>
        <section className={styles.panel}><h2>Build your map</h2><span className={styles.status} role="status">{saved}</span><label>Title / filename<input aria-label="K-Map title" maxLength={100} value={data.title} onChange={e => apply({
              ...data,
              title: e.target.value
            })} /></label><div className={styles.twoCols}><label>Variables<select aria-label="K-Map variable count" value={data.numVars} onChange={e => {
                const next = emptyKmap(Number(e.target.value));
                apply(next);
                setVars(next.variables);
                setSelected([]);
              }}>{[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} variables</option>)}</select></label><label>Variable names<input aria-label="K-Map variable names" maxLength={6} value={vars} onChange={e => setVars(e.target.value.replace(/[^A-Za-z]/g, ''))} onBlur={renameVariables} onKeyDown={e => {
                if (e.key === 'Enter') e.currentTarget.blur();
              }} /></label></div><label>Minimise as<select aria-label="K-Map minimization form" value={data.mode} onChange={e => {
              apply({
                ...data,
                mode: e.target.value,
                groups: []
              });
              setSelected([]);
            }}><option value="sop">SOP · group the 1s</option><option value="pos">POS · group the 0s</option></select></label><label className={styles.check}><input type="checkbox" checked={data.showMinterms} onChange={e => apply({
              ...data,
              showMinterms: e.target.checked
            })} />Show minterm numbers</label><label className={styles.check}><input type="checkbox" checked={data.showExpressions} onChange={e => apply({
              ...data,
              showExpressions: e.target.checked
            })} />Variable expressions on axes</label><label className={styles.check}><input type="checkbox" checked={data.showTitle} onChange={e => apply({
              ...data,
              showTitle: e.target.checked
            })} />Include title in artwork</label><p className={styles.muted}>{data.numVars > 4 ? '5/6-variable maps use matching 4-variable panels. Corresponding cells in adjacent panels may be grouped.' : 'Rows and columns follow Gray-code order. Opposite edges are adjacent.'}</p></section>
        <section className={styles.panel}><h2>Enter terms directly</h2><label>{data.mode === 'pos' ? 'Maxterms (output = 0)' : 'Minterms (output = 1)'}<textarea aria-label="K-Map required terms" rows={3} value={terms} onChange={e => setTerms(e.target.value)} placeholder="0, 2, 8, 10 or 0-3" /></label><label>Don’t-care terms<textarea aria-label="K-Map dont-care terms" rows={2} value={dontCares} onChange={e => setDontCares(e.target.value)} placeholder="1, 3, 9" /></label><button className={`${styles.primary} ${styles.full}`} onClick={applyTerms}>Apply term lists</button><p className={styles.muted}>Allowed: 0–{(1 << data.numVars) - 1}. Other cells become {data.mode === 'pos' ? '1' : '0'}.</p>{error && <p className={styles.error} role="alert">{error}</p>}<button className={styles.secondary} onClick={() => {
            const next = emptyKmap(4);
            next.values = valuesFromTerms(4, '0,2,8,10', '', 'sop');
            apply(next);
            setVars('ABCD');
            setSelected([]);
            notify('Wrap-around example loaded.');
          }}>Try a wrap-around example</button></section>
        <section className={styles.panel}><h2>Export & reuse</h2><div className={styles.twoCols}><label>PNG resolution<select value={pngScale} onChange={e => setPngScale(Number(e.target.value))}>{[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}×</option>)}</select></label><label>Background<select value={background} onChange={e => setBackground(e.target.value)}><option value="white">White</option><option value="transparent">Transparent</option></select></label></div><div className={styles.exportBar}>{[['png', 'PNG'], ['svg', 'SVG'], ['tex', 'LaTeX'], ['json', 'JSON'], ['csv', 'Truth table CSV'], ['clipboard', 'Copy PNG']].map(([kind, label]) => <button key={kind} disabled={busy} className={kind === 'png' ? styles.primary : styles.secondary} onClick={() => download(kind)}>{busy ? 'Working…' : label}</button>)}</div><div className={styles.exportBar}><button className={styles.secondary} onClick={() => fileRef.current?.click()}>Import K-Map JSON</button><input hidden ref={fileRef} type="file" accept="application/json,.json" onChange={e => {
              importFile(e.target.files?.[0]);
              e.target.value = '';
            }} /><button className={styles.primary} onClick={sendToDiagram}>{editTarget ? 'Update map in diagram ↗' : 'Add to diagram studio ↗'}</button></div><p className={styles.muted}>Add the map as a vector object to your current diagram, then draw circuits or notes around it. Drafts are saved in this browser.</p></section>
      </aside>
      <div style={{
        minWidth: 0
      }}>
        <section className={styles.panel} aria-label="K-Map editor"><div className={styles.tools}><span>Paint / select</span>{tools.map(([id, label, key]) => <button key={id} aria-pressed={tool === id} aria-label={`K-Map ${label} tool`} title={`${label} (${key})`} onClick={() => setTool(id)}>{label}</button>)}</div><div className={styles.row} style={{
            marginBottom: 16
          }}><button className={styles.secondary} disabled={!historyCounts.undo} onClick={undo}>↶ Undo</button><button className={styles.secondary} disabled={!historyCounts.redo} onClick={redo}>↷ Redo</button><button className={styles.secondary} onClick={() => {
              apply({
                ...data,
                values: data.values.map(value => value || '0'),
                groups: []
              });
              setSelected([]);
            }}>Fill blanks with 0</button><button className={styles.danger} onClick={() => {
              apply({
                ...data,
                values: Array(1 << data.numVars).fill(''),
                groups: []
              });
              setSelected([]);
            }}>Clear map</button></div>
          <div className={styles.preview}><svg ref={svgRef} aria-label="Interactive Karnaugh map" role="group" viewBox={`0 0 ${art.width} ${art.height}`} width={art.width * zoom} height={art.height * zoom} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={cellKey} dangerouslySetInnerHTML={{
              __html: art.body
            }} /></div>
          <div className={styles.previewFooter}><span className={styles.muted}>{data.values.filter(v => v === '1').length} ones · {data.values.filter(v => v === '0').length} zeros · {data.values.filter(v => v === 'X').length} don’t-cares · {blankCount} blank</span><label>Zoom <input aria-label="K-Map zoom" type="range" min=".5" max="1.5" step=".1" value={zoom} onChange={e => setZoom(Number(e.target.value))} />{Math.round(zoom * 100)}%</label></div>
          <p className={`${styles.muted} ${styles.tip}`}>Click to cycle blank → 1 → 0 → X. Drag to paint several cells. Use 0 / 1 / X on a focused cell, and arrow keys to move.</p>
          {tool === 'group' && <div className={styles.selection}><strong>{selected.length} cells selected</strong><p className={styles.muted}>{selected.length ? `Terms: ${[...selected].sort((a, b) => a - b).join(', ')}` : 'Click or drag to choose a Boolean group. Wrap-around groups are supported.'}</p><div className={styles.row}><button className={styles.primary} disabled={!selected.length} onClick={addGroup}>Add group</button><button className={styles.secondary} onClick={() => setSelected([])}>Clear selection</button></div></div>}
        </section>
        <section className={styles.panel} aria-label="K-Map simplification"><div className={styles.row} style={{
            justifyContent: 'space-between'
          }}><h2>Boolean simplification</h2><span className={styles.badge}>{data.mode.toUpperCase()} · {solution.value ? solution.value.exact ? 'Minimum cover' : 'Valid cover · search capped' : `${blankCount} blank cells`}</span></div>{solution.value ? <><div className={styles.formula} aria-label="Simplified expression">F = {solution.value.expression}</div><p className={styles.muted}>Uses {solution.value.groups.length} group{solution.value.groups.length === 1 ? '' : 's'} · {solution.value.primeCount} prime implicants. Don’t-cares are used only where they help. Apostrophe denotes NOT.</p><div className={styles.row}><button className={styles.primary} onClick={() => {
                apply({
                  ...data,
                  groups: solution.value.groups
                });
                setSelected([]);
              }}>Show suggested groups</button><button className={styles.secondary} onClick={() => copy(`F = ${solution.value.expression}`)}>Copy expression</button><button className={styles.secondary} onClick={() => copy(`F = ${solution.value.latex}`)}>Copy LaTeX</button></div></> : <p className={styles.muted}>{solution.error} Use term lists or “Fill blanks with 0” to complete the map.</p>}</section>
        <section className={styles.panel}><h2>Your groups</h2>{!data.groups.length && <p className={styles.muted}>Select “Group cells” to add your own groups, or use the suggested minimum cover. Groups are checked for power-of-two size and Boolean adjacency.</p>}{data.groups.map((group, index) => <div key={group.join(',')} className={styles.groupRow}><span style={{
              background: GROUP_COLOURS[index % GROUP_COLOURS.length]
            }} /><strong>G{index + 1}</strong><p>{cubeExpression(groupCube(group, data.numVars), data.variables, data.mode)} <small style={{
                color: '#91a5bf'
              }}>· {group.join(', ')}</small></p><button aria-label={`Remove group ${index + 1}`} onClick={() => apply({
              ...data,
              groups: data.groups.filter((_, i) => i !== index)
            })}>×</button></div>)}</section>
        <details className={styles.panel}><summary style={{
            cursor: 'pointer',
            color: '#b9cbe2'
          }}>Truth table · {1 << data.numVars} rows</summary><div className={styles.truthTable}><table><thead><tr><th>m</th>{data.variables.split('').map(variable => <th key={variable}>{variable}</th>)}<th>F</th></tr></thead><tbody>{data.values.map((value, index) => <tr key={index}><td>{index}</td>{index.toString(2).padStart(data.numVars, '0').split('').map((bit, i) => <td key={i}>{bit}</td>)}<td><select aria-label={`Truth table output ${index}`} value={value} onChange={e => {
                      const values = [...data.values];
                      values[index] = e.target.value;
                      apply({
                        ...data,
                        values,
                        groups: []
                      });
                    }}><option value="">—</option><option>0</option><option>1</option><option>X</option></select></td></tr>)}</tbody></table></div></details>
      </div>
    </div>
    {toast && <div role="status" className={styles.toast}>{toast}</div>}
  </main>;
}
