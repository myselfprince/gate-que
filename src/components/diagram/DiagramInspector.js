'use client';

import { SYMBOLS, isState } from '@/lib/diagram-model.mjs';
import styles from './diagram.module.css';
export default function DiagramInspector({
  project,
  selected,
  updateNode,
  updateEdge,
  remove,
  duplicate,
  edit,
  arrange
}) {
  const node = selected.length === 1 ? project.nodes.find(node => node.id === selected[0]) : null;
  const edge = selected.length === 1 ? project.edges.find(edge => edge.id === selected[0]) : null;
  const num = (label, key, value, min, max, change, step = 1) => <label key={key}>{label}<input aria-label={label} type="number" value={value} min={min} max={max} step={step} onChange={event => {
      const n = Number(event.target.value);
      if (event.target.value !== '' && Number.isFinite(n) && n >= min && n <= max && (step !== 1 || Number.isInteger(n))) change({
        [key]: n
      });
    }} /></label>;
  const nodes = project.nodes.filter(node => selected.includes(node.id));
  return <aside className={styles.inspector} aria-label="Diagram properties">
    <div className={styles.panelHeading}><h2>Properties</h2><span>{selected.length ? `${selected.length} selected` : 'Nothing selected'}</span></div>
    {!selected.length && <div className={styles.emptyInspector}><div className={styles.emptyIcon}>↖</div><h3>Make it yours</h3><p>Select a symbol or wire to edit its label, pins, colours and layout.</p><p>Double-click a symbol to edit. Click or drag between the small pin circles to connect.</p><div className={styles.shortcutList}><span>V · select</span><span>C · connect</span><span>P · draw</span><span>T · text</span><span>Space + drag · pan</span><span>Ctrl/Cmd + Z · undo</span><span>Delete · remove</span></div></div>}
    {node && <>
      <p className={styles.muted}>{SYMBOLS.find(symbol => symbol.type === node.type)?.label || node.type}</p>
      {node.type !== 'kmap' && <label>Label / text<textarea aria-label="Symbol label" rows={3} value={node.label} onChange={e => updateNode({
          label: e.target.value.slice(0, 2000)
        })} /></label>}
      <button className={styles.secondary} onClick={() => edit(node)}>Edit {node.type === 'table' ? 'table cells' : node.type === 'kmap' ? 'K-Map cells' : 'label'}…</button>
      {node.type === 'kmap' && <p className={styles.muted}>Edit this map in K-Map studio, then send the updated vector back to this diagram.</p>}
      {node.type === 'table' && <p className={styles.muted}>{node.cells?.length || 0} rows · {Math.max(0, ...(node.cells || []).map(row => row.length))} columns. Add/remove rows in the cell editor.</p>}
      {isState(node) && <><label className={styles.check}><input type="checkbox" checked={node.initial || node.type === 'start'} onChange={e => updateNode({
            initial: e.target.checked,
            type: node.type === 'start' ? 'state' : node.type
          })} />Initial state</label><label className={styles.check}><input type="checkbox" checked={node.accepting || node.type === 'accept'} onChange={e => updateNode({
            accepting: e.target.checked,
            type: node.type === 'accept' ? 'state' : node.type
          })} />Accepting / final state</label><p className={styles.muted}>Use Connect, then click the same state twice for a self-loop.</p></>}
      {['and', 'or', 'nand', 'nor', 'xor', 'xnor', 'mux', 'encoder'].includes(node.type) && num('Number of inputs', 'inputs', node.inputs, 2, 64, patch => updateNode({
        ...patch,
        height: Math.max(90, patch.inputs * 20 + 20)
      }))}
      {['demux', 'decoder'].includes(node.type) && num('Number of outputs', 'outputs', node.outputs, 2, 64, patch => updateNode({
        ...patch,
        height: Math.max(100, patch.outputs * 20 + 20)
      }))}
      {['adder', 'multiplier', 'register', 'counter', 'memory', 'alu'].includes(node.type) && num('Bit width', 'bits', node.bits, 1, 64, updateNode)}
      <div className={styles.twoCols}>{num('Width', 'width', Math.round(node.width), 8, 2000, updateNode)}{num('Height', 'height', Math.round(node.height), 8, 2000, updateNode)}{num('X position', 'x', Math.round(node.x), -20000, 20000, updateNode)}{num('Y position', 'y', Math.round(node.y), -20000, 20000, updateNode)}{num('Text size', 'fontSize', node.fontSize, 8, 96, updateNode)}{num('Line width', 'strokeWidth', node.strokeWidth, .5, 12, updateNode, .5)}</div>
      <label>Rotation<select aria-label="Symbol rotation" value={node.rotation} onChange={e => updateNode({
          rotation: Number(e.target.value)
        })}>{[0, 90, 180, 270].map(value => <option key={value} value={value}>{value}°</option>)}</select></label>
      <div className={styles.twoCols}><label>Stroke / text<input aria-label="Symbol colour" type="color" value={node.color || (project.theme === 'dark' ? '#e5edf9' : '#172438')} onChange={e => updateNode({
            color: e.target.value
          })} /></label><label>Fill<input aria-label="Symbol fill" type="color" value={node.fill || (project.theme === 'dark' ? '#141c29' : '#ffffff')} onChange={e => updateNode({
            fill: e.target.value
          })} /></label></div>
      <button className={styles.subtle} onClick={() => updateNode({
        color: '',
        fill: ''
      })}>Use theme colours</button>
    </>}
    {edge && <>
      <label>Wire / transition label<textarea aria-label="Connection label" rows={2} value={edge.label} maxLength={300} placeholder="0, 1, ε, Cin, bus[7:0]…" onChange={e => updateEdge({
          label: e.target.value
        })} /></label>
      <label>Connection style<select aria-label="Connection style" value={edge.style} onChange={e => updateEdge({
          style: e.target.value
        })}><option value="orthogonal">Right-angle wire</option><option value="straight">Straight line</option><option value="curve">Curved transition</option></select></label>
      <label className={styles.check}><input type="checkbox" checked={edge.arrow} onChange={e => updateEdge({
          arrow: e.target.checked
        })} />Arrowhead</label>
      <label className={styles.check}><input type="checkbox" checked={Boolean(edge.dashed)} onChange={e => updateEdge({
          dashed: e.target.checked
        })} />Dashed line</label>
      <div className={styles.twoCols}>{num('Curve / loop bend', 'bend', edge.bend || 0, -500, 500, updateEdge)}{num('Wire width', 'strokeWidth', edge.strokeWidth, .5, 12, updateEdge, .5)}{num('Label X offset', 'labelX', edge.labelX || 0, -2000, 2000, updateEdge)}{num('Label Y offset', 'labelY', edge.labelY || 0, -2000, 2000, updateEdge)}</div>
      {edge.source.nodeId === edge.target.nodeId && <label>Self-loop position<select value={edge.loopSide || 'top'} onChange={e => updateEdge({
          loopSide: e.target.value
        })}><option value="top">Above state</option><option value="bottom">Below state</option></select></label>}
      <label>Wire colour<input aria-label="Connection colour" type="color" value={edge.color || (project.theme === 'dark' ? '#e5edf9' : '#172438')} onChange={e => updateEdge({
          color: e.target.value
        })} /></label>
      <div className={styles.buttonRow}><button className={styles.secondary} onClick={() => updateEdge({
          addBend: true
        })}>Add bend</button><button className={styles.secondary} onClick={() => updateEdge({
          points: []
        })}>Clear bends</button></div><p className={styles.muted}>Drag the blue bend handles or the label handle on the canvas. Double-click a wire to insert a bend.</p>
    </>}
    {nodes.length > 1 && <><h3>Arrange selection</h3><div className={styles.arrangeGrid}>{[['left', 'Align left'], ['top', 'Align top'], ['center', 'Centre vertically'], ['middle', 'Centre horizontally'], ['distribute', 'Space evenly']].map(([key, label]) => <button key={key} className={styles.secondary} onClick={() => arrange(key)}>{label}</button>)}</div><p className={styles.muted}>Drag any selected symbol to move the entire selection.</p></>}
    {nodes.length > 0 && <div className={styles.buttonRow}><button className={styles.secondary} onClick={() => arrange('front')}>Bring front</button><button className={styles.secondary} onClick={() => arrange('back')}>Send back</button></div>}
    {selected.length > 0 && <div className={styles.inspectorBottom}><button className={styles.secondary} disabled={!nodes.length} onClick={duplicate}>Duplicate</button><button className={styles.danger} onClick={remove}>Delete selected</button></div>}
  </aside>;
}
