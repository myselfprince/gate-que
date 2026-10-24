export const GROUP_COLOURS = ['#2776cf', '#d34268', '#179775', '#a46ad2', '#d58b18', '#159bb1', '#924d27', '#5f70bd'];
export const grayCodes = bits => Array.from({
  length: 1 << bits
}, (_, index) => (index ^ index >> 1).toString(2).padStart(bits, '0')).map(code => bits ? code : '');
export const bitCount = value => {
  let count = 0;
  while (value) {
    count += value & 1;
    value >>>= 1;
  }
  return count;
};
const bigCount = value => {
  let count = 0;
  while (value) {
    value &= value - 1n;
    count++;
  }
  return count;
};
export function emptyKmap(numVars = 4) {
  return {
    version: 1,
    numVars,
    variables: 'ABCDEF'.slice(0, numVars),
    title: 'Karnaugh map',
    mode: 'sop',
    values: Array(1 << numVars).fill(''),
    groups: [],
    showMinterms: true,
    showExpressions: false,
    showTitle: true
  };
}
export function normalizeKmap(value) {
  if (!value || value.version !== 1 || !Number.isInteger(value.numVars) || value.numVars < 2 || value.numVars > 6) throw Error('Choose a valid K-Map with 2–6 variables.');
  const n = value.numVars;
  if (typeof value.variables !== 'string' || value.variables.length !== n || !/^[A-Za-z]+$/.test(value.variables) || new Set(value.variables).size !== n) throw Error(`Enter ${n} different variable letters.`);
  if (!Array.isArray(value.values) || value.values.length !== 1 << n || value.values.some(v => !['', '0', '1', 'X'].includes(v))) throw Error('K-Map cell data is invalid.');
  if (typeof value.title !== 'string' || value.title.length > 100) throw Error('K-Map title is too long.');
  if (!Array.isArray(value.groups) || value.groups.length > 64) throw Error('K-Map grouping data is invalid.');
  const mode = value.mode === 'pos' ? 'pos' : 'sop',
    target = mode === 'pos' ? '0' : '1';
  const groups = value.groups.map(group => {
    if (!Array.isArray(group)) throw Error('K-Map group is invalid.');
    const cube = groupCube(group, n);
    if (cube.terms.some(term => value.values[term] !== target && value.values[term] !== 'X') || !cube.terms.some(term => value.values[term] === target)) throw Error('A group contains an incompatible cell.');
    return cube.terms;
  });
  return {
    version: 1,
    numVars: n,
    variables: value.variables,
    title: value.title,
    mode,
    values: [...value.values],
    groups,
    showMinterms: value.showMinterms !== false,
    showExpressions: value.showExpressions === true,
    showTitle: value.showTitle !== false
  };
}
export function parseTerms(text, numVars) {
  if (typeof text !== 'string' || text.length > 2000) throw Error('Term list is too long.');
  if (!text.trim()) return [];
  const terms = new Set(),
    limit = (1 << numVars) - 1;
  for (const token of text.split(/[\s,;]+/).filter(Boolean)) {
    const match = /^(\d+)(?:-(\d+))?$/.exec(token);
    if (!match) throw Error(`Invalid term “${token}”. Use numbers or ranges, such as 1, 3, 8-11.`);
    const start = Number(match[1]),
      end = Number(match[2] ?? match[1]);
    if (start > end || start < 0 || end > limit) throw Error(`Terms must be between 0 and ${limit}.`);
    for (let term = start; term <= end; term++) terms.add(term);
  }
  return [...terms].sort((a, b) => a - b);
}
export function valuesFromTerms(numVars, terms, dontCares, mode = 'sop') {
  const required = parseTerms(terms, numVars),
    xs = parseTerms(dontCares, numVars);
  if (required.some(term => xs.includes(term))) throw Error('A term cannot be both required and a don’t-care.');
  const values = Array(1 << numVars).fill(mode === 'pos' ? '1' : '0');
  required.forEach(term => values[term] = mode === 'pos' ? '0' : '1');
  xs.forEach(term => values[term] = 'X');
  return values;
}
export function groupCube(terms, numVars) {
  if (!Array.isArray(terms) || !terms.length || terms.some(term => !Number.isInteger(term) || term < 0 || term >= 1 << numVars)) throw Error('Choose valid cells for the group.');
  const values = [...new Set(terms)].sort((a, b) => a - b);
  if (values.length !== terms.length) throw Error('A group contains duplicate cells.');
  if ((values.length & values.length - 1) !== 0) throw Error('A group must contain 1, 2, 4, 8, 16, 32 or 64 cells.');
  const mask = values.reduce((mask, term) => mask | term ^ values[0], 0),
    bits = values[0] & ~mask;
  if (2 ** bitCount(mask) !== values.length) throw Error('These cells do not form an adjacent Boolean group. Wrap-around and matching panels are allowed.');
  return {
    bits,
    mask,
    terms: values
  };
}
export const cubeMatches = (cube, term) => (term & ~cube.mask) === cube.bits;
export function cubeExpression(cube, variables, mode = 'sop', latex = false) {
  const letters = variables.split(''),
    parts = [];
  letters.forEach((letter, index) => {
    const bit = 1 << letters.length - 1 - index;
    if (cube.mask & bit) return;
    const negated = mode === 'sop' ? !(cube.bits & bit) : Boolean(cube.bits & bit);
    parts.push(negated ? latex ? `\\overline{${letter}}` : `${letter}'` : letter);
  });
  if (!parts.length) return mode === 'sop' ? '1' : '0';
  return mode === 'sop' ? parts.join('') : `(${parts.join(' + ')})`;
}
export function simplifyKmap(values, variables, mode = 'sop', searchLimit = 100000) {
  const n = variables.length;
  if (n < 2 || n > 6 || values.length !== 1 << n) throw Error('K-Map dimensions are invalid.');
  if (values.some(value => !['0', '1', 'X'].includes(value))) throw Error('Fill every blank cell with 0, 1 or X before simplifying.');
  const target = mode === 'pos' ? '0' : '1',
    required = values.flatMap((value, index) => value === target ? [index] : []),
    allowed = values.flatMap((value, index) => value === target || value === 'X' ? [index] : []);
  if (!required.length) return {
    expression: mode === 'pos' ? '1' : '0',
    latex: mode === 'pos' ? '1' : '0',
    groups: [],
    cubes: [],
    exact: true,
    primeCount: 0
  };
  let current = allowed.map(bits => ({
    bits,
    mask: 0
  }));
  const primes = new Map();
  while (current.length) {
    const used = new Set(),
      next = new Map();
    for (let i = 0; i < current.length; i++) for (let j = i + 1; j < current.length; j++) {
      const a = current[i],
        b = current[j],
        diff = a.bits ^ b.bits;
      if (a.mask !== b.mask || bitCount(diff) !== 1) continue;
      used.add(i);
      used.add(j);
      const cube = {
        bits: a.bits & ~diff,
        mask: a.mask | diff
      };
      next.set(`${cube.bits}/${cube.mask}`, cube);
    }
    current.forEach((cube, index) => {
      if (!used.has(index) && required.some(term => cubeMatches(cube, term))) primes.set(`${cube.bits}/${cube.mask}`, cube);
    });
    current = [...next.values()];
  }
  const candidates = [...primes.values()].map(cube => ({
    ...cube,
    literals: n - bitCount(cube.mask),
    coverage: required.reduce((bits, term, index) => cubeMatches(cube, term) ? bits | 1n << BigInt(index) : bits, 0n)
  }));
  const all = (1n << BigInt(required.length)) - 1n,
    essential = new Set();
  required.forEach((_, index) => {
    const covering = candidates.flatMap((cube, i) => cube.coverage & 1n << BigInt(index) ? [i] : []);
    if (covering.length === 1) essential.add(covering[0]);
  });
  const covered = [...essential].reduce((mask, index) => mask | candidates[index].coverage, 0n),
    initialUncovered = all & ~covered;
  const initial = [...essential];
  let best = [...initial],
    remaining = initialUncovered;
  while (remaining) {
    let chosen = -1,
      score = -Infinity;
    for (let i = 0; i < candidates.length; i++) {
      const count = bigCount(candidates[i].coverage & remaining),
        s = count * 100 - candidates[i].literals;
      if (count && s > score) {
        chosen = i;
        score = s;
      }
    }
    if (chosen < 0) throw Error('Unable to cover the requested terms.');
    best.push(chosen);
    remaining &= ~candidates[chosen].coverage;
  }
  const cost = list => list.reduce((sum, index) => sum + candidates[index].literals, 0);
  let bestLiterals = cost(best),
    visited = 0,
    exact = true;
  const cache = new Map();
  function search(chosen, uncovered, literals) {
    if (++visited > searchLimit) {
      exact = false;
      return;
    }
    if (!uncovered) {
      if (chosen.length < best.length || chosen.length === best.length && literals < bestLiterals) {
        best = [...chosen];
        bestLiterals = literals;
      }
      return;
    }
    if (chosen.length >= best.length) return;
    const key = uncovered.toString(),
      prior = cache.get(key);
    if (prior && (prior.count < chosen.length || prior.count === chosen.length && prior.literals <= literals)) return;
    cache.set(key, {
      count: chosen.length,
      literals
    });
    let options = null;
    for (let bit = 0; bit < required.length; bit++) if (uncovered & 1n << BigInt(bit)) {
      const next = candidates.flatMap((cube, i) => cube.coverage & 1n << BigInt(bit) ? [i] : []);
      if (!options || next.length < options.length) options = next;
    }
    options.sort((a, b) => bigCount(candidates[b].coverage & uncovered) - bigCount(candidates[a].coverage & uncovered) || candidates[a].literals - candidates[b].literals);
    for (const index of options) {
      if (!exact) return;
      search([...chosen, index], uncovered & ~candidates[index].coverage, literals + candidates[index].literals);
    }
  }
  search(initial, initialUncovered, cost(initial));
  const cubes = best.map(index => candidates[index]).sort((a, b) => a.bits - b.bits || a.mask - b.mask),
    groups = cubes.map(cube => allowed.filter(term => cubeMatches(cube, term)));
  const expression = cubes.map(cube => cubeExpression(cube, variables, mode)).join(mode === 'sop' ? ' + ' : ' · '),
    latex = cubes.map(cube => cubeExpression(cube, variables, mode, true)).join(mode === 'sop' ? ' + ' : ' \\cdot ');
  return {
    expression,
    latex,
    groups,
    cubes: cubes.map(({
      bits,
      mask
    }) => ({
      bits,
      mask
    })),
    exact,
    primeCount: candidates.length
  };
}
export function mapConfig(numVars) {
  const panelBits = Math.max(0, numVars - 4),
    rowBits = numVars <= 4 ? Math.floor(numVars / 2) : 2,
    colBits = numVars - panelBits - rowBits;
  return {
    panelBits,
    rowBits,
    colBits,
    panels: grayCodes(panelBits),
    rows: grayCodes(rowBits),
    cols: grayCodes(colBits)
  };
}
export function kmapLayout(data) {
  const config = mapConfig(data.numVars),
    cell = 72,
    gap = 34,
    panelW = config.cols.length * cell + 92,
    panelH = config.rows.length * cell + 100,
    columns = config.panels.length > 1 ? 2 : 1,
    rows = Math.ceil(config.panels.length / columns),
    top = data.showTitle ? 64 : 28;
  const panels = config.panels.map((code, index) => {
    const x = 26 + index % columns * (panelW + gap),
      y = top + Math.floor(index / columns) * (panelH + gap);
    return {
      code,
      x,
      y,
      gridX: x + 64,
      gridY: y + 58,
      index
    };
  });
  const cells = [];
  panels.forEach(panel => config.rows.forEach((row, r) => config.cols.forEach((col, c) => cells.push({
    term: parseInt(panel.code + row + col, 2),
    x: panel.gridX + c * cell,
    y: panel.gridY + r * cell,
    row: r,
    col: c,
    panel: panel.index,
    rowCode: row,
    colCode: col
  }))));
  return {
    ...config,
    cell,
    panels,
    cells,
    width: columns * panelW + (columns - 1) * gap + 52,
    height: top + rows * panelH + (rows - 1) * gap + 30 + (data.groups.length ? Math.ceil(data.groups.length / 2) * 30 + 30 : 0)
  };
}
function runs(values) {
  const result = [];
  for (const value of [...new Set(values)].sort((a, b) => a - b)) {
    const last = result.at(-1);
    if (last && last[1] + 1 === value) last[1] = value;else result.push([value, value]);
  }
  return result;
}
export function groupFragments(terms, layout) {
  const fragments = [];
  for (const panel of layout.panels) {
    const cells = layout.cells.filter(cell => cell.panel === panel.index && terms.includes(cell.term));
    if (!cells.length) continue;
    for (const [r0, r1] of runs(cells.map(cell => cell.row))) for (const [c0, c1] of runs(cells.map(cell => cell.col))) fragments.push({
      x: panel.gridX + c0 * layout.cell + 4,
      y: panel.gridY + r0 * layout.cell + 4,
      width: (c1 - c0 + 1) * layout.cell - 8,
      height: (r1 - r0 + 1) * layout.cell - 8,
      panel: panel.index
    });
  }
  return fragments;
}
