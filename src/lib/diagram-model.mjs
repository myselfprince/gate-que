import { normalizeKmap } from './kmap.mjs';

export const DIAGRAM_VERSION = 1;
export const GRID = 20;
export const SYMBOLS = [['and', 'AND', 'Logic gates'], ['or', 'OR', 'Logic gates'], ['not', 'NOT', 'Logic gates'], ['nand', 'NAND', 'Logic gates'], ['nor', 'NOR', 'Logic gates'], ['xor', 'XOR', 'Logic gates'], ['xnor', 'XNOR', 'Logic gates'], ['buffer', 'Buffer', 'Logic gates'], ['tristate', 'Tri-state', 'Logic gates'], ['input', 'Input / constant', 'Digital blocks'], ['output', 'Output', 'Digital blocks'], ['junction', 'Junction', 'Digital blocks'], ['mux', 'Multiplexer', 'Digital blocks'], ['demux', 'Demultiplexer', 'Digital blocks'], ['decoder', 'Decoder', 'Digital blocks'], ['encoder', 'Encoder', 'Digital blocks'], ['half-adder', 'Half adder', 'Digital blocks'], ['full-adder', 'Full adder', 'Digital blocks'], ['adder', 'Adder', 'Digital blocks'], ['multiplier', 'Multiplier', 'Digital blocks'], ['alu', 'ALU', 'Digital blocks'], ['register', 'Register', 'Digital blocks'], ['counter', 'Counter', 'Digital blocks'], ['dff', 'D flip-flop', 'Digital blocks'], ['jkff', 'JK flip-flop', 'Digital blocks'], ['tff', 'T flip-flop', 'Digital blocks'], ['srff', 'SR latch', 'Digital blocks'], ['clock', 'Clock', 'Digital blocks'], ['ground', 'Ground', 'Digital blocks'], ['memory', 'Memory / RAM', 'Digital blocks'], ['state', 'State (DFA / NFA)', 'Automata & graphs'], ['accept', 'Accepting state', 'Automata & graphs'], ['start', 'Start state', 'Automata & graphs'], ['vertex', 'Graph vertex', 'Automata & graphs'], ['rectangle', 'Process / block', 'Shapes & flowcharts'], ['rounded', 'Start / end', 'Shapes & flowcharts'], ['diamond', 'Decision', 'Shapes & flowcharts'], ['parallelogram', 'Input / output', 'Shapes & flowcharts'], ['ellipse', 'Ellipse', 'Shapes & flowcharts'], ['database', 'Database', 'Shapes & flowcharts'], ['text', 'Text / equation', 'Shapes & flowcharts'], ['table', 'Table / array', 'Shapes & flowcharts'], ['linked-node', 'Linked-list node', 'Shapes & flowcharts'], ['stack', 'Stack', 'Shapes & flowcharts'], ['resistor', 'Resistor', 'Electrical'], ['capacitor', 'Capacitor', 'Electrical'], ['opamp', 'Op-amp', 'Electrical'], ['source', 'Voltage source', 'Electrical']].map(([type, label, category]) => ({
  type,
  label,
  category
}));
export const ALL_TYPES = new Set([...SYMBOLS.map(symbol => symbol.type), 'freehand', 'line', 'arrow', 'kmap']);
export const MATH_SYMBOLS = {
  'Logic & automata': ['ε', '∅', 'Σ', 'δ', '→', '↔', '⇒', '⇔', '¬', '∧', '∨', '⊕', '⊙', '⊤', '⊥', '∀', '∃', '⊢', '⊨', '∈', '∉', '⊆', '⊂', '∪', '∩', '×', '*', 'λ'],
  'Math & relations': ['≤', '≥', '≠', '≈', '≡', '∞', '∑', '∏', '√', '±', '÷', '·', '∂', '∫', '∴', '∵', '∝', '⌈', '⌉', '⌊', '⌋', '²', '³', 'ⁿ', '₀', '₁', '₂', '₃', 'ₙ'],
  'Greek & arrows': ['α', 'β', 'γ', 'Δ', 'θ', 'Θ', 'μ', 'π', 'ρ', 'σ', 'τ', 'φ', 'Φ', 'ω', 'Ω', '↑', '↓', '←', '↦', '↗', '↘', '⟲', '↺', '‖', '⊗', '⊙']
};
export const uid = () => globalThis.crypto.randomUUID();
export const snap = (value, enabled = true) => enabled ? Math.round(value / GRID) * GRID : value;
export const isState = node => ['state', 'accept', 'start', 'vertex'].includes(node.type);
export const clone = value => JSON.parse(JSON.stringify(value));
export function emptyDiagram(title = 'Untitled diagram') {
  return {
    version: DIAGRAM_VERSION,
    title,
    width: 1600,
    height: 1000,
    nodes: [],
    edges: [],
    theme: 'light'
  };
}
export function createNode(type, x = 160, y = 160, patch = {}) {
  const symbol = SYMBOLS.find(item => item.type === type);
  let width = 120,
    height = 90;
  if (['state', 'accept', 'start', 'vertex', 'ellipse'].includes(type)) width = height = 80;
  if (['input', 'output', 'clock', 'ground', 'resistor', 'capacitor'].includes(type)) {
    width = 90;
    height = 60;
  }
  if (type === 'junction') width = height = 16;
  if (type === 'text') {
    width = 200;
    height = 55;
  }
  if (type === 'table') {
    width = 320;
    height = 144;
  }
  if (type === 'stack') {
    width = 100;
    height = 180;
  }
  if (['mux', 'demux', 'decoder', 'encoder', 'memory', 'register', 'counter', 'alu'].includes(type)) {
    width = 140;
    height = 140;
  }
  return {
    id: uid(),
    type,
    x,
    y,
    width,
    height,
    label: isState({
      type
    }) ? 'q0' : type === 'text' ? 'Your text' : type === 'table' ? '' : symbol?.label || '',
    inputs: ['mux', 'encoder'].includes(type) ? 4 : 2,
    outputs: ['demux', 'decoder'].includes(type) ? 4 : 1,
    bits: 4,
    rotation: 0,
    fontSize: 20,
    strokeWidth: 2.5,
    color: '',
    fill: '',
    initial: type === 'start',
    accepting: type === 'accept',
    cells: type === 'table' ? [['A', 'B', 'Y'], ['0', '0', '0'], ['0', '1', '1'], ['1', '0', '1']] : undefined,
    ...patch
  };
}
export function nodePorts(node) {
  const {
    width: w,
    height: h,
    type
  } = node;
  const ports = [];
  const side = (count, sideName, labels = [], prefix = sideName) => {
    for (let index = 0; index < count; index++) {
      const fraction = (index + 1) / (count + 1);
      ports.push({
        id: `${prefix}${index}`,
        x: sideName === 'left' ? 0 : sideName === 'right' ? w : w * fraction,
        y: sideName === 'top' ? 0 : sideName === 'bottom' ? h : h * fraction,
        label: labels[index] ?? (sideName === 'left' ? `I${index}` : sideName === 'right' ? `Y${index}` : ''),
        direction: sideName === 'right' ? 'out' : 'in',
        side: sideName
      });
    }
  };
  if (type === 'freehand' || type === 'line' || type === 'arrow' || type === 'text' || type === 'kmap') return [];
  if (isState(node) || ['rectangle', 'rounded', 'diamond', 'ellipse', 'parallelogram', 'database', 'table', 'stack', 'linked-node'].includes(type)) {
    ports.push({
      id: 'left',
      x: 0,
      y: h / 2,
      side: 'left'
    }, {
      id: 'right',
      x: w,
      y: h / 2,
      side: 'right'
    }, {
      id: 'top',
      x: w / 2,
      y: 0,
      side: 'top'
    }, {
      id: 'bottom',
      x: w / 2,
      y: h,
      side: 'bottom'
    });
  } else if (type === 'junction') ports.push({
    id: 'dot',
    x: w / 2,
    y: h / 2,
    side: 'right'
  });else if (type === 'input' || type === 'clock' || type === 'ground') side(1, 'right', [node.label || 'OUT']);else if (type === 'output') side(1, 'left', ['IN']);else if (['not', 'buffer', 'tristate'].includes(type)) {
    side(1, 'left', ['A']);
    side(1, 'right', ['Y']);
    if (type === 'tristate') side(1, 'bottom', ['EN']);
  } else if (['mux', 'encoder'].includes(type)) {
    side(node.inputs, 'left');
    side(type === 'encoder' ? Math.max(1, Math.ceil(Math.log2(node.inputs))) : 1, 'right');
    if (type === 'mux') side(Math.max(1, Math.ceil(Math.log2(node.inputs))), 'bottom', Array.from({
      length: 6
    }, (_, i) => `S${i}`));
  } else if (['demux', 'decoder'].includes(type)) {
    side(type === 'decoder' ? Math.max(1, Math.ceil(Math.log2(node.outputs))) : 1, 'left');
    side(node.outputs, 'right');
    if (type === 'demux') side(Math.max(1, Math.ceil(Math.log2(node.outputs))), 'bottom', Array.from({
      length: 6
    }, (_, i) => `S${i}`));
  } else if (type === 'half-adder') {
    side(2, 'left', ['A', 'B']);
    side(2, 'right', ['Sum', 'Carry']);
  } else if (type === 'full-adder') {
    side(3, 'left', ['A', 'B', 'Cin']);
    side(2, 'right', ['Sum', 'Cout']);
  } else if (type === 'adder') {
    side(2, 'left', [`A[${node.bits - 1}:0]`, `B[${node.bits - 1}:0]`]);
    side(2, 'right', ['Sum', 'Cout']);
  } else if (type === 'multiplier') {
    side(2, 'left', [`A[${node.bits - 1}:0]`, `B[${node.bits - 1}:0]`]);
    side(1, 'right', [`P[${2 * node.bits - 1}:0]`]);
  } else if (['dff', 'jkff', 'tff', 'srff'].includes(type)) {
    side(['jkff', 'srff'].includes(type) ? 2 : 1, 'left', type === 'jkff' ? ['J', 'K'] : type === 'srff' ? ['S', 'R'] : type === 'tff' ? ['T'] : ['D']);
    side(2, 'right', ['Q', 'Q̅']);
    if (type !== 'srff') side(1, 'bottom', ['CLK']);
  } else if (['register', 'counter'].includes(type)) {
    side(1, 'left', [type === 'counter' ? 'EN' : `D[${node.bits - 1}:0]`]);
    side(1, 'right', [`Q[${node.bits - 1}:0]`]);
    side(2, 'bottom', ['CLK', 'RST']);
  } else if (type === 'memory') {
    side(3, 'left', ['Addr', 'Data', 'WE']);
    side(1, 'right', ['Data']);
    side(1, 'bottom', ['CLK']);
  } else if (type === 'alu') {
    side(2, 'left', ['A', 'B']);
    side(2, 'right', ['Y', 'Flags']);
    side(1, 'bottom', ['Op']);
  } else if (['resistor', 'capacitor', 'source'].includes(type)) {
    side(1, 'left', ['']);
    side(1, 'right', ['']);
  } else if (type === 'opamp') {
    side(2, 'left', ['+', '−']);
    side(1, 'right', ['Vout']);
  } else {
    side(Math.max(2, node.inputs || 2), 'left');
    side(1, 'right', ['Y']);
  }
  return ports;
}
export function portPosition(node, portId) {
  const port = nodePorts(node).find(port => port.id === portId);
  if (!port) return null;
  const radians = (node.rotation || 0) * Math.PI / 180;
  const dx = port.x - node.width / 2,
    dy = port.y - node.height / 2;
  return {
    ...port,
    x: node.x + node.width / 2 + dx * Math.cos(radians) - dy * Math.sin(radians),
    y: node.y + node.height / 2 + dx * Math.sin(radians) + dy * Math.cos(radians)
  };
}
export function nodeBounds(node) {
  const rotated = (node.rotation || 0) % 180 !== 0;
  const width = rotated ? node.height : node.width,
    height = rotated ? node.width : node.height;
  return {
    x: node.x + node.width / 2 - width / 2,
    y: node.y + node.height / 2 - height / 2,
    width,
    height
  };
}
export function contentBounds(project, margin = 40) {
  const rectangles = project.nodes.map(nodeBounds);
  for (const edge of project.edges) {
    const geometry = edgeGeometry(edge, project.nodes);
    rectangles.push(...[...(edge.points || []), geometry.label, ...(geometry.extents || [])].filter(Boolean).map(point => ({
      x: point.x - 40,
      y: point.y - 25,
      width: 80,
      height: 50
    })));
  }
  if (!rectangles.length) return {
    x: 0,
    y: 0,
    width: project.width,
    height: project.height
  };
  const x = Math.min(...rectangles.map(r => r.x)) - margin,
    y = Math.min(...rectangles.map(r => r.y)) - margin;
  return {
    x,
    y,
    width: Math.max(...rectangles.map(r => r.x + r.width)) - x + margin,
    height: Math.max(...rectangles.map(r => r.y + r.height)) - y + margin
  };
}
function stateAnchor(node, towards) {
  const cx = node.x + node.width / 2,
    cy = node.y + node.height / 2,
    dx = towards.x - cx,
    dy = towards.y - cy;
  const divisor = Math.sqrt((dx / (node.width / 2)) ** 2 + (dy / (node.height / 2)) ** 2) || 1;
  return {
    x: cx + dx / divisor,
    y: cy + dy / divisor
  };
}
export function edgeGeometry(edge, nodes) {
  const source = nodes.find(node => node.id === edge.source.nodeId),
    target = nodes.find(node => node.id === edge.target.nodeId);
  if (!source || !target) return {
    path: '',
    label: {
      x: 0,
      y: 0
    }
  };
  const center = n => ({
    x: n.x + n.width / 2,
    y: n.y + n.height / 2
  });
  const points = edge.points || [];
  let start = portPosition(source, edge.source.portId) || center(source),
    end = portPosition(target, edge.target.portId) || center(target);
  if (source.id === target.id) {
    const c = center(source),
      r = source.width / 2,
      side = edge.loopSide || 'top',
      offset = Number(edge.bend ?? 65);
    const sign = side === 'bottom' ? 1 : -1;
    start = {
      x: c.x - r * .65,
      y: c.y + sign * source.height * .38
    };
    end = {
      x: c.x + r * .65,
      y: start.y
    };
    const control1 = {
        x: c.x - r * 1.8,
        y: start.y + sign * offset * 2
      },
      control2 = {
        x: c.x + r * 1.8,
        y: end.y + sign * offset * 2
      };
    return {
      path: `M ${start.x} ${start.y} C ${control1.x} ${control1.y} ${control2.x} ${control2.y} ${end.x} ${end.y}`,
      label: {
        x: c.x + (edge.labelX || 0),
        y: start.y + sign * offset * 1.5 + (edge.labelY || 0)
      },
      extents: [control1, control2],
      start,
      end
    };
  }
  if (isState(source)) start = stateAnchor(source, points[0] || center(target));
  if (isState(target)) end = stateAnchor(target, points.at(-1) || center(source));
  if (edge.style === 'curve' && !points.length) {
    const dx = end.x - start.x,
      dy = end.y - start.y,
      len = Math.hypot(dx, dy) || 1,
      bend = Number(edge.bend ?? 45);
    const control = {
      x: (start.x + end.x) / 2 - dy / len * bend,
      y: (start.y + end.y) / 2 + dx / len * bend
    };
    return {
      path: `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`,
      label: {
        x: (start.x + 2 * control.x + end.x) / 4 + (edge.labelX || 0),
        y: (start.y + 2 * control.y + end.y) / 4 - 10 + (edge.labelY || 0)
      },
      extents: [control],
      start,
      end
    };
  }
  let vertices = [start, ...points, end];
  if (edge.style === 'orthogonal') {
    vertices = [start];
    const targets = [...points, end];
    let previous = start;
    for (const next of targets) {
      if (!points.length && ['top', 'bottom'].includes(start.side)) {
        const middle = (previous.y + next.y) / 2;
        vertices.push({
          x: previous.x,
          y: middle
        }, {
          x: next.x,
          y: middle
        });
      } else {
        const middle = points.length ? next.x : (previous.x + next.x) / 2;
        vertices.push({
          x: middle,
          y: previous.y
        }, {
          x: middle,
          y: next.y
        });
      }
      vertices.push(next);
      previous = next;
    }
  }
  const mid = points[Math.floor(points.length / 2)] || {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2
  };
  return {
    path: vertices.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' '),
    label: {
      x: mid.x + (edge.labelX || 0),
      y: mid.y - 12 + (edge.labelY || 0)
    },
    start,
    end
  };
}
export function createEdge(source, target, nodes, patch = {}) {
  const state = nodes.some(node => [source.nodeId, target.nodeId].includes(node.id) && isState(node));
  return {
    id: uid(),
    source: {
      ...source
    },
    target: {
      ...target
    },
    label: '',
    style: state ? 'curve' : 'orthogonal',
    arrow: state,
    color: '',
    strokeWidth: 2.5,
    bend: source.nodeId === target.nodeId ? 65 : 0,
    points: [],
    ...patch
  };
}
export function resizeNode(node, width, height) {
  const w = Math.max(node.type === 'junction' ? 8 : 40, Math.min(2000, width)),
    h = Math.max(node.type === 'junction' ? 8 : 30, Math.min(2000, height));
  if (['freehand', 'line', 'arrow'].includes(node.type) && node.points) return {
    ...node,
    width: w,
    height: h,
    points: node.points.map(p => ({
      x: p.x * w / node.width,
      y: p.y * h / node.height
    }))
  };
  return {
    ...node,
    width: w,
    height: h
  };
}
export function removeItems(project, ids) {
  const nodes = project.nodes.filter(node => !ids.includes(node.id));
  return {
    ...project,
    nodes,
    edges: project.edges.filter(edge => !ids.includes(edge.id) && nodes.some(node => node.id === edge.source.nodeId) && nodes.some(node => node.id === edge.target.nodeId))
  };
}
export function duplicateItems(project, ids, offset = 40) {
  const selected = project.nodes.filter(node => ids.includes(node.id)),
    mapping = new Map(selected.map(node => [node.id, uid()]));
  const nodes = selected.map(node => ({
    ...clone(node),
    id: mapping.get(node.id),
    x: node.x + offset,
    y: node.y + offset
  }));
  const edges = project.edges.filter(edge => mapping.has(edge.source.nodeId) && mapping.has(edge.target.nodeId)).map(edge => ({
    ...clone(edge),
    id: uid(),
    source: {
      ...edge.source,
      nodeId: mapping.get(edge.source.nodeId)
    },
    target: {
      ...edge.target,
      nodeId: mapping.get(edge.target.nodeId)
    },
    points: (edge.points || []).map(p => ({
      x: p.x + offset,
      y: p.y + offset
    }))
  }));
  return {
    project: {
      ...project,
      nodes: [...project.nodes, ...nodes],
      edges: [...project.edges, ...edges]
    },
    ids: nodes.map(node => node.id)
  };
}
export function validateDiagram(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.nodes) || !Array.isArray(value.edges) || value.nodes.length > 500 || value.edges.length > 1500) throw Error('Choose a valid diagram JSON (up to 500 symbols and 1,500 connections).');
  const number = (v, fallback, min = -20000, max = 20000) => {
    const n = v ?? fallback;
    if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max) throw Error('Diagram contains an invalid coordinate or size.');
    return n;
  };
  const str = (v = '', max = 2000) => {
    if (typeof v !== 'string' || v.length > max) throw Error('A diagram label is too long.');
    return v;
  };
  const color = v => {
    if (!v) return '';
    if (!/^#[\da-f]{6}$/i.test(v)) throw Error('Diagram contains an invalid colour.');
    return v;
  };
  const identifier = v => {
    if (typeof v !== 'string' || !/^[\w-]{1,100}$/.test(v)) throw Error('Diagram contains an invalid ID.');
    return v;
  };
  const nodes = value.nodes.map(node => {
    if (!ALL_TYPES.has(node.type)) throw Error('Diagram contains an unsupported symbol.');
    const result = {
      id: identifier(node.id),
      type: node.type,
      x: number(node.x, 0),
      y: number(node.y, 0),
      width: number(node.width, 120, 8, 2000),
      height: number(node.height, 90, 8, 2000),
      label: str(node.label),
      inputs: number(node.inputs, 2, 1, 64),
      outputs: number(node.outputs, 1, 1, 64),
      bits: number(node.bits, 4, 1, 64),
      rotation: number(node.rotation, 0, 0, 270),
      fontSize: number(node.fontSize, 20, 8, 96),
      strokeWidth: number(node.strokeWidth, 2.5, .5, 12),
      color: color(node.color),
      fill: color(node.fill),
      initial: node.initial === true,
      accepting: node.accepting === true
    };
    if (!Number.isInteger(result.inputs) || !Number.isInteger(result.outputs) || !Number.isInteger(result.bits) || ![0, 90, 180, 270].includes(result.rotation)) throw Error('Diagram pin counts or rotation are invalid.');
    if (node.cells !== undefined) {
      if (!Array.isArray(node.cells) || node.cells.length > 40 || node.cells.some(row => !Array.isArray(row) || row.length > 20)) throw Error('Tables support up to 40 rows and 20 columns.');
      result.cells = node.cells.map(row => row.map(cell => str(cell, 200)));
    }
    if (node.points !== undefined) {
      if (!Array.isArray(node.points) || node.points.length > 5000) throw Error('Drawing has too many points.');
      result.points = node.points.map(p => ({
        x: number(p.x, 0),
        y: number(p.y, 0)
      }));
    }
    if (node.kmap !== undefined) result.kmap = normalizeKmap(node.kmap);
    if (node.type === 'kmap' && !result.kmap) throw Error('Embedded K-Map data is missing.');
    return result;
  });
  if (new Set(nodes.map(node => node.id)).size !== nodes.length) throw Error('Diagram has duplicate IDs.');
  const edges = value.edges.map(edge => {
    const endpoint = point => {
      const node = nodes.find(node => node.id === point?.nodeId);
      if (!node) throw Error('A connection refers to a missing symbol.');
      const portId = str(point.portId, 50);
      if (portId !== 'auto' && !nodePorts(node).some(port => port.id === portId)) throw Error('A connection refers to a missing pin.');
      return {
        nodeId: node.id,
        portId
      };
    };
    if (!['straight', 'orthogonal', 'curve'].includes(edge.style)) throw Error('Connection style is invalid.');
    if (edge.points !== undefined && (!Array.isArray(edge.points) || edge.points.length > 100)) throw Error('A wire has too many bends.');
    return {
      id: identifier(edge.id),
      source: endpoint(edge.source),
      target: endpoint(edge.target),
      label: str(edge.label, 300),
      style: edge.style,
      arrow: edge.arrow === true,
      dashed: edge.dashed === true,
      color: color(edge.color),
      strokeWidth: number(edge.strokeWidth, 2.5, .5, 12),
      bend: number(edge.bend, 0, -500, 500),
      labelX: number(edge.labelX, 0, -2000, 2000),
      labelY: number(edge.labelY, 0, -2000, 2000),
      loopSide: edge.loopSide === 'bottom' ? 'bottom' : 'top',
      points: (edge.points || []).map(p => ({
        x: number(p.x, 0),
        y: number(p.y, 0)
      }))
    };
  });
  if (new Set([...nodes, ...edges].map(item => item.id)).size !== nodes.length + edges.length) throw Error('Diagram has duplicate IDs.');
  return {
    version: 1,
    title: str(value.title || 'Untitled diagram', 100),
    width: number(value.width, 1600, 200, 6000),
    height: number(value.height, 1000, 200, 6000),
    theme: value.theme === 'dark' ? 'dark' : 'light',
    nodes,
    edges
  };
}
