import { contentBounds, edgeGeometry, isState, nodePorts } from './diagram-model.mjs';
import { kmapArtwork } from './kmap-svg.mjs';
export const escapeSvg = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[char]);
export const diagramPalette = theme => theme === 'dark' ? {
  paper: '#141c29',
  ink: '#e5edf9',
  muted: '#9badc8',
  accent: '#276ea8',
  surface: '#202d40',
  grid: '#314159'
} : {
  paper: '#ffffff',
  ink: '#172438',
  muted: '#62748b',
  accent: '#d9edff',
  surface: '#edf4fb',
  grid: '#e4ebf2'
};
const line = (x1, y1, x2, y2, extra = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${extra}/>`;
const text = (x, y, value, size = 20, anchor = 'middle', extra = '') => `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" font-size="${size}" stroke="none" fill="currentColor" ${extra}>${escapeSvg(value)}</text>`;
function multiline(x, y, value, size, width, anchor = 'middle') {
  const maxChars = Math.max(4, Math.floor(width / (size * .56)));
  const lines = String(value || '').split('\n').flatMap(paragraph => {
    const words = paragraph.split(' '),
      result = [];
    let current = '';
    for (const word of words) {
      if (current && `${current} ${word}`.length > maxChars) {
        result.push(current);
        current = '';
      }
      current += (current ? ' ' : '') + word;
    }
    return [...result, current];
  });
  return lines.map((value, index) => text(x, y + (index - (lines.length - 1) / 2) * size * 1.25, value, size, anchor)).join('');
}
export function nodeSvg(node, palette = diagramPalette('light')) {
  const {
      width: w,
      height: h,
      type
    } = node,
    ink = node.color || palette.ink,
    fill = node.fill || palette.paper,
    fs = node.fontSize || 20;
  let shape = '',
    label = true,
    labels = false;
  const path = d => `<path d="${d}"/>`;
  const ports = nodePorts(node);
  if (type === 'kmap') {
    const art = kmapArtwork(node.kmap);
    shape = `<svg x="0" y="0" width="${w}" height="${h}" viewBox="0 0 ${art.width} ${art.height}">${art.body}</svg>`;
    label = false;
  } else if (isState(node)) {
    shape = `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2 - 2}" ry="${h / 2 - 2}"/>`;
    if (node.accepting || type === 'accept') shape += `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${Math.max(4, w / 2 - 9)}" ry="${Math.max(4, h / 2 - 9)}"/>`;
    if (node.initial || type === 'start') shape += line(-38, h / 2, -4, h / 2) + path(`M -12 ${h / 2 - 6} L -4 ${h / 2} L -12 ${h / 2 + 6}`);
  } else if (['and', 'nand', 'or', 'nor', 'xor', 'xnor', 'not', 'buffer', 'tristate'].includes(type)) {
    const inverted = ['nand', 'nor', 'xnor', 'not'].includes(type);
    if (type === 'and' || type === 'nand') shape = path(`M 18 8 H ${w / 2} A ${w / 2 - 18} ${h / 2 - 8} 0 0 1 ${w / 2} ${h - 8} H 18 Z`);else if (['or', 'nor', 'xor', 'xnor'].includes(type)) {
      shape = path(`M 14 8 Q ${w * .58} 8 ${w - 18} ${h / 2} Q ${w * .58} ${h - 8} 14 ${h - 8} Q 42 ${h / 2} 14 8 Z`);
      if (['xor', 'xnor'].includes(type)) shape += path(`M 5 8 Q 33 ${h / 2} 5 ${h - 8}`).replace('/>', ' fill="none"/>');
    } else shape = path(`M 18 8 L ${w - 22} ${h / 2} L 18 ${h - 8} Z`);
    for (const port of ports.filter(port => port.side === 'left')) {
      const y = port.y,
        ratio = Math.max(0, Math.min(1, (y - 8) / (h - 16))),
        x = ['or', 'nor', 'xor', 'xnor'].includes(type) ? 14 + 14 * 4 * ratio * (1 - ratio) : 18;
      shape += line(0, y, x, y);
    }
    if (inverted) shape += `<circle cx="${w - 12}" cy="${h / 2}" r="5"/>` + line(w - 7, h / 2, w, h / 2);else shape += line(w - 18, h / 2, w, h / 2);
    if (type === 'tristate') shape += line(w / 2, h, w / 2, h * .7);
    shape += text(w * .46, h / 2, node.label, Math.min(14, fs));
    label = false;
  } else if (type === 'junction') {
    shape = `<circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) / 2}" fill="${ink}"/>`;
    label = false;
  } else if (type === 'input') shape = path(`M 0 8 H ${w - 22} L ${w - 7} ${h / 2} L ${w - 22} ${h - 8} H 0 Z`) + line(w - 7, h / 2, w, h / 2);else if (type === 'output') shape = path(`M 12 8 H ${w} V ${h - 8} H 12 L 0 ${h / 2} Z`);else if (type === 'clock') {
    shape = path(`M 10 ${h * .7} H ${w * .25} V ${h * .3} H ${w * .5} V ${h * .7} H ${w * .7} V ${h * .3} H ${w - 10}`).replace('/>', ' fill="none"/>') + line(w - 10, h / 2, w, h / 2);
    label = false;
  } else if (type === 'ground') {
    shape = line(0, h / 2, w / 2, h / 2) + line(w / 2, h / 2, w / 2, h * .68) + line(w * .25, h * .68, w * .75, h * .68) + line(w * .32, h * .8, w * .68, h * .8) + line(w * .41, h * .9, w * .59, h * .9);
    label = false;
  } else if (type === 'resistor') {
    shape = path(`M 0 ${h / 2} H ${w * .18} L ${w * .26} ${h * .25} L ${w * .38} ${h * .75} L ${w * .5} ${h * .25} L ${w * .62} ${h * .75} L ${w * .74} ${h * .25} L ${w * .82} ${h / 2} H ${w}`).replace('/>', ' fill="none"/>');
    label = false;
  } else if (type === 'capacitor') {
    shape = line(0, h / 2, w * .44, h / 2) + line(w * .44, h * .2, w * .44, h * .8) + line(w * .56, h * .2, w * .56, h * .8) + line(w * .56, h / 2, w, h / 2);
    label = false;
  } else if (type === 'source') {
    shape = `<circle cx="${w / 2}" cy="${h / 2}" r="${h * .4}"/>` + line(0, h / 2, w / 2 - h * .4, h / 2) + line(w / 2 + h * .4, h / 2, w, h / 2) + text(w / 2, h * .38, '+', 16) + text(w / 2, h * .64, '−', 16);
    label = false;
  } else if (type === 'opamp') {
    shape = path(`M 14 8 L ${w - 10} ${h / 2} L 14 ${h - 8} Z`);
    labels = true;
  } else if (type === 'mux') {
    shape = path(`M 14 4 L ${w - 14} 24 V ${h - 24} L 14 ${h - 4} Z`);
    labels = true;
  } else if (type === 'demux') {
    shape = path(`M 14 24 L ${w - 14} 4 V ${h - 4} L 14 ${h - 24} Z`);
    labels = true;
  } else if (type === 'alu') {
    shape = path(`M 14 4 L ${w - 14} 24 V ${h - 24} L 14 ${h - 4} V ${h * .6} L 30 ${h / 2} L 14 ${h * .4} Z`);
    labels = true;
  } else if (type === 'diamond') shape = path(`M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z`);else if (type === 'parallelogram') shape = path(`M 20 0 H ${w} L ${w - 20} ${h} H 0 Z`);else if (type === 'ellipse') shape = `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2 - 2}" ry="${h / 2 - 2}"/>`;else if (type === 'database') {
    shape = path(`M 0 18 C 0 -6 ${w} -6 ${w} 18 V ${h - 18} C ${w} ${h + 6} 0 ${h + 6} 0 ${h - 18} Z`) + path(`M 0 18 C 0 42 ${w} 42 ${w} 18`).replace('/>', ' fill="none"/>');
  } else if (type === 'table') {
    const cells = node.cells || [['A', 'B'], ['0', '1']],
      rows = Math.max(1, cells.length),
      cols = Math.max(1, ...cells.map(row => row.length)),
      cw = w / cols,
      ch = h / rows;
    shape = `<rect width="${w}" height="${h}"/><rect width="${w}" height="${ch}" fill="${node.fill || palette.surface}" stroke="none"/>`;
    for (let r = 0; r <= rows; r++) shape += line(0, r * ch, w, r * ch);
    for (let c = 0; c <= cols; c++) shape += line(c * cw, 0, c * cw, h);
    cells.forEach((row, r) => row.forEach((cell, c) => {
      shape += multiline((c + .5) * cw, (r + .5) * ch, cell, Math.min(fs, ch * .5, 20), cw - 10);
    }));
    label = false;
  } else if (type === 'stack') {
    shape = path(`M 0 0 V ${h} H ${w} V 0`).replace('/>', ' fill="none"/>');
    const rows = (node.label || 'top\nB\nA').split('\n');
    rows.forEach((value, index) => {
      const y = (index + 1) * h / rows.length;
      shape += line(0, y, w, y) + text(w / 2, y - h / rows.length / 2, value, Math.min(fs, 22));
    });
    label = false;
  } else if (type === 'linked-node') shape = `<rect width="${w}" height="${h}" rx="3"/>` + line(w * .68, 0, w * .68, h) + text(w * .84, h / 2, '•', 24);else if (type === 'freehand') {
    shape = path((node.points || []).map((p, index) => `${index ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ')).replace('/>', ' fill="none"/>');
    label = false;
  } else if (type === 'line' || type === 'arrow') {
    const start = node.points?.[0] || {
        x: 0,
        y: 0
      },
      end = node.points?.at(-1) || {
        x: w,
        y: h
      };
    shape = line(start.x, start.y, end.x, end.y);
    if (type === 'arrow') {
      const angle = Math.atan2(end.y - start.y, end.x - start.x),
        x = end.x - 14 * Math.cos(angle - .5),
        y = end.y - 14 * Math.sin(angle - .5),
        x2 = end.x - 14 * Math.cos(angle + .5),
        y2 = end.y - 14 * Math.sin(angle + .5);
      shape += path(`M ${x} ${y} L ${end.x} ${end.y} L ${x2} ${y2}`).replace('/>', ' fill="none"/>');
    }
    label = false;
  } else if (type === 'text') {
    shape = multiline(w / 2, h / 2, node.label, fs, w);
    label = false;
  } else {
    shape = `<rect x="12" y="4" width="${w - 24}" height="${h - 8}" rx="${type === 'rounded' ? Math.min(h / 2, 24) : 5}"/>`;
    labels = !['rectangle', 'rounded', 'kmap'].includes(type);
  }
  if (labels) for (const port of ports) {
    const left = port.side === 'left',
      right = port.side === 'right',
      bottom = port.side === 'bottom';
    shape += line(port.x, port.y, left ? 14 : right ? w - 14 : port.x, bottom ? h - 12 : port.y) + text(left ? 20 : right ? w - 20 : port.x, bottom ? h - 20 : port.y, port.label, Math.min(12, h / (Math.max(node.inputs, node.outputs) + 1) * .7), left ? 'start' : right ? 'end' : 'middle');
  }
  if (label) shape += multiline(w / 2, h / 2, node.label, Math.min(fs, labels ? 17 : fs), w * (type === 'diamond' ? .55 : .8));
  return `<g transform="translate(${node.x} ${node.y}) rotate(${node.rotation || 0} ${w / 2} ${h / 2})" stroke="${ink}" color="${ink}" stroke-width="${node.strokeWidth || 2.5}" fill="${fill}" stroke-linecap="round" stroke-linejoin="round" font-family="Arial,Segoe UI Symbol,sans-serif">${shape}</g>`;
}
export function edgeSvg(edge, nodes, palette = diagramPalette('light')) {
  const geometry = edgeGeometry(edge, nodes);
  if (!geometry.path) return '';
  const color = edge.color || palette.ink;
  const marker = edge.arrow ? `<defs><marker id="arrow-${edge.id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="${color}"/></marker></defs>` : '';
  const label = edge.label ? `<text x="${geometry.label.x}" y="${geometry.label.y}" font-family="Arial,Segoe UI Symbol,sans-serif" font-size="18" text-anchor="middle" fill="${color}" stroke="${palette.paper}" stroke-width="5" paint-order="stroke" stroke-linejoin="round">${escapeSvg(edge.label)}</text>` : '';
  return `${marker}<path d="${geometry.path}" fill="none" stroke="${color}" stroke-width="${edge.strokeWidth || 2.5}" stroke-linecap="round" stroke-linejoin="round" ${edge.dashed ? 'stroke-dasharray="8 6"' : ''} ${edge.arrow ? `marker-end="url(#arrow-${edge.id})"` : ''}/>${label}`;
}
export function diagramSvg(project, {
  crop = true,
  background = 'theme'
} = {}) {
  const palette = diagramPalette(background === 'white' ? 'light' : project.theme);
  const bounds = crop ? contentBounds(project) : {
    x: 0,
    y: 0,
    width: project.width,
    height: project.height
  };
  // Initial-state arrows extend beyond the state's own bounding box; content padding reserves them.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(bounds.width)}" height="${Math.ceil(bounds.height)}" viewBox="${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}" role="img" aria-label="${escapeSvg(project.title)}"><title>${escapeSvg(project.title)}</title>${background === 'transparent' ? '' : `<rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" fill="${background === 'white' ? '#ffffff' : palette.paper}"/>`}${project.edges.map(edge => edgeSvg(edge, project.nodes, palette)).join('')}${project.nodes.map(node => nodeSvg(node, palette)).join('')}</svg>`;
}
