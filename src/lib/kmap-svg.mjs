import { GROUP_COLOURS, cubeExpression, groupCube, groupFragments, kmapLayout, normalizeKmap } from './kmap.mjs';
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[char]);
const text = (x, y, label, size = 18, extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="${size}" ${extra}>${escape(label)}</text>`;
const expression = (bits, variables) => bits.split('').map((bit, index) => variables[index] + (bit === '0' ? "'" : '')).join('');
export function kmapArtwork(input, {
  interactive = false,
  selected = []
} = {}) {
  const data = normalizeKmap(input),
    layout = kmapLayout(data),
    {
      cell
    } = layout,
    names = data.variables,
    panelVars = names.slice(0, layout.panelBits),
    rowVars = names.slice(layout.panelBits, layout.panelBits + layout.rowBits),
    colVars = names.slice(layout.panelBits + layout.rowBits);
  let body = `<g font-family="Arial,Segoe UI Symbol,sans-serif" fill="#172438">`;
  if (data.showTitle) body += text(layout.width / 2, 27, `${data.title} · F(${names.split('').join(', ')})`, 21, 'font-weight="700"');
  for (const panel of layout.panels) {
    if (layout.panelBits) body += text(panel.gridX + layout.cols.length * cell / 2, panel.y + 6, `${panelVars} = ${panel.code}`, 17, 'font-weight="700" fill="#466990"');
    body += `<path d="M ${panel.gridX - 48} ${panel.gridY - 48} L ${panel.gridX} ${panel.gridY}" fill="none" stroke="#172438" stroke-width="1.5"/>`;
    body += text(panel.gridX - 37, panel.gridY - 7, rowVars, 16, 'font-weight="700" fill="#25755e"') + text(panel.gridX - 4, panel.gridY - 37, colVars, 16, 'font-weight="700" fill="#25755e"');
    layout.cols.forEach((code, c) => body += text(panel.gridX + (c + .5) * cell, panel.gridY - 19, data.showExpressions ? expression(code, colVars) : code, 17));
    layout.rows.forEach((code, r) => body += text(panel.gridX - 26, panel.gridY + (r + .5) * cell, data.showExpressions ? expression(code, rowVars) : code, 17));
  }
  for (const item of layout.cells) {
    const value = data.values[item.term],
      highlight = interactive && selected.includes(item.term);
    body += `<g ${interactive ? `data-minterm="${item.term}" tabindex="0" role="button" aria-label="Minterm ${item.term}, value ${value || 'blank'}"` : ''}><rect x="${item.x}" y="${item.y}" width="${cell}" height="${cell}" fill="${highlight ? '#d8ebff' : '#ffffff'}" stroke="#253b52" stroke-width="1.3"/>`;
    if (data.showMinterms) body += text(item.x + cell - 12, item.y + 13, item.term, 10, 'fill="#7d8b9c"');
    body += text(item.x + cell / 2, item.y + cell / 2 + 3, value, 32, `font-weight="600" fill="${value === 'X' ? '#a77914' : '#172438'}"`);
    body += '</g>';
  }
  data.groups.forEach((group, index) => {
    const colour = GROUP_COLOURS[index % GROUP_COLOURS.length];
    for (const fragment of groupFragments(group, layout)) body += `<rect x="${fragment.x + index % 3 * 2}" y="${fragment.y + index % 3 * 2}" width="${Math.max(8, fragment.width - index % 3 * 4)}" height="${Math.max(8, fragment.height - index % 3 * 4)}" rx="15" stroke="${colour}" stroke-width="3" fill="${colour}" fill-opacity="0.06" pointer-events="none"/>`;
    const x = layout.width * (index % 2 ? .75 : .25),
      y = layout.height - 30 - Math.floor((data.groups.length - 1) / 2) * 30 + Math.floor(index / 2) * 30;
    body += text(x, y, `G${index + 1} = ${cubeExpression(groupCube(group, data.numVars), data.variables, data.mode)}`, 16, `fill="${colour}" font-weight="700"`);
  });
  return {
    body: body + '</g>',
    width: layout.width,
    height: layout.height,
    layout
  };
}
export function kmapSvg(input, {
  background = 'white'
} = {}) {
  const data = normalizeKmap(input),
    art = kmapArtwork(data);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${art.width}" height="${art.height}" viewBox="0 0 ${art.width} ${art.height}"><title>${escape(data.title)}</title>${background === 'transparent' ? '' : `<rect width="100%" height="100%" fill="#ffffff"/>`}${art.body}</svg>`;
}
export function kmapLatex(input) {
  const data = normalizeKmap(input),
    layout = kmapLayout(data);
  const tex = value => String(value).replace(/[\\{}%&#_$]/g, char => ({
    '\\': '\\textbackslash{}',
    '{': '\\{',
    '}': '\\}',
    '%': '\\%',
    '&': '\\&',
    '#': '\\#',
    '_': '\\_',
    '$': '\\$'
  })[char]);
  const lines = ['\\documentclass[tikz,border=4mm]{standalone}', '\\usepackage[T1]{fontenc}', '\\begin{document}', '\\begin{tikzpicture}[x=0.018cm,y=-0.018cm,every node/.style={font=\\large}]'];
  if (data.showTitle) lines.push(`\\node[font=\\Large\\bfseries] at (${layout.width / 2},27) {${tex(data.title)}: $F(${data.variables.split('').join(',')})$};`);
  for (const panel of layout.panels) {
    if (layout.panelBits) lines.push(`\\node at (${panel.gridX + layout.cols.length * layout.cell / 2},${panel.y + 6}) {$${data.variables.slice(0, layout.panelBits)}=${panel.code}$};`);
    lines.push(`\\draw (${panel.gridX - 48},${panel.gridY - 48}) -- (${panel.gridX},${panel.gridY});`);
    lines.push(`\\node[text=green!45!black] at (${panel.gridX - 37},${panel.gridY - 7}) {$${data.variables.slice(layout.panelBits, layout.panelBits + layout.rowBits)}$};`, `\\node[text=green!45!black] at (${panel.gridX - 4},${panel.gridY - 37}) {$${data.variables.slice(layout.panelBits + layout.rowBits)}$};`);
    layout.cols.forEach((code, c) => lines.push(`\\node at (${panel.gridX + (c + .5) * layout.cell},${panel.gridY - 19}) {${code}};`));
    layout.rows.forEach((code, r) => lines.push(`\\node at (${panel.gridX - 26},${panel.gridY + (r + .5) * layout.cell}) {${code}};`));
  }
  for (const item of layout.cells) {
    lines.push(`\\draw (${item.x},${item.y}) rectangle ++(${layout.cell},${layout.cell});`, `\\node at (${item.x + layout.cell / 2},${item.y + layout.cell / 2 + 3}) {${data.values[item.term]}};`);
    if (data.showMinterms) lines.push(`\\node[font=\\tiny,text=gray] at (${item.x + layout.cell - 12},${item.y + 13}) {${item.term}};`);
  }
  data.groups.forEach((group, index) => {
    lines.push(`\\definecolor{group${index}}{HTML}{${GROUP_COLOURS[index % GROUP_COLOURS.length].slice(1)}}`);
    for (const f of groupFragments(group, layout)) lines.push(`\\draw[group${index},thick,rounded corners=5pt] (${f.x},${f.y}) rectangle ++(${f.width},${f.height});`);
  });
  lines.push('\\end{tikzpicture}', '\\end{document}');
  return lines.join('\n');
}
