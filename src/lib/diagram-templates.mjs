import { createEdge, createNode, emptyDiagram } from './diagram-model.mjs';
export const DIAGRAM_TEMPLATES = [['blank', 'Blank canvas', 'Start from scratch'], ['half-adder', 'Half adder', 'XOR + AND with shared inputs'], ['full-adder', 'Full adder', 'Two XORs, two ANDs and an OR'], ['dfa', 'DFA · even number of 1s', 'Start/final states, transitions and loops'], ['nfa', 'ε-NFA', 'Epsilon transition and nondeterminism'], ['mux', '4:1 MUX', 'Four data inputs and two select pins'], ['demux', '1:4 DEMUX', 'Data input, select pins and four outputs'], ['multiplier', '4-bit multiplier', 'Two 4-bit buses and an 8-bit product'], ['flip-flop', 'D flip-flop', 'Data, clock and complementary outputs'], ['flowchart', 'Decision flowchart', 'Process, condition and labelled branches'], ['table', 'Truth table', 'Editable input/output table'], ['linked-list', 'Linked list', 'Data and pointer compartments'], ['tree', 'Binary tree', 'Graph vertices and directed edges']].map(([id, title, description]) => ({
  id,
  title,
  description
}));
export function makeTemplate(id) {
  const project = emptyDiagram(DIAGRAM_TEMPLATES.find(item => item.id === id)?.title || 'Diagram');
  const add = (type, x, y, patch = {}) => {
    const node = createNode(type, x, y, patch);
    project.nodes.push(node);
    return node;
  };
  const wire = (source, target, from = 'right0', to = 'left0', patch = {}) => {
    const edge = createEdge({
      nodeId: source.id,
      portId: from
    }, {
      nodeId: target.id,
      portId: to
    }, project.nodes, patch);
    project.edges.push(edge);
    return edge;
  };
  if (id === 'half-adder' || id === 'full-adder') {
    const a = add('input', 100, 140, {
        label: 'A'
      }),
      b = add('input', 100, 300, {
        label: 'B'
      }),
      xor = add('xor', 360, 120),
      and = add('and', 360, 330),
      sum = add('output', id === 'full-adder' ? 940 : 640, 130, {
        label: 'Sum'
      }),
      carry = add('output', id === 'full-adder' ? 940 : 640, 340, {
        label: 'Carry'
      });
    wire(a, xor, 'right0', 'left0');
    wire(b, xor, 'right0', 'left1');
    wire(a, and, 'right0', 'left0', {
      points: [{
        x: 260,
        y: 150
      }, {
        x: 260,
        y: 360
      }]
    });
    wire(b, and, 'right0', 'left1');
    if (id === 'half-adder') {
      wire(xor, sum);
      wire(and, carry);
    } else {
      const cin = add('input', 100, 530, {
          label: 'Cin'
        }),
        xor2 = add('xor', 620, 120),
        and2 = add('and', 620, 450),
        or = add('or', 790, 330);
      wire(xor, xor2, 'right0', 'left0');
      wire(cin, xor2, 'right0', 'left1', {
        points: [{
          x: 560,
          y: 560
        }]
      });
      wire(xor, and2, 'right0', 'left0', {
        points: [{
          x: 530,
          y: 165
        }, {
          x: 530,
          y: 480
        }]
      });
      wire(cin, and2, 'right0', 'left1');
      wire(and, or, 'right0', 'left0');
      wire(and2, or, 'right0', 'left1');
      wire(xor2, sum);
      wire(or, carry);
    }
  } else if (id === 'dfa') {
    const a = add('start', 240, 260, {
        label: 'q₀',
        accepting: true,
        width: 100,
        height: 100
      }),
      b = add('state', 620, 260, {
        label: 'q₁',
        width: 100,
        height: 100
      });
    wire(a, a, 'auto', 'auto', {
      label: '0',
      bend: 65
    });
    wire(b, b, 'auto', 'auto', {
      label: '0',
      bend: 65
    });
    wire(a, b, 'auto', 'auto', {
      label: '1',
      bend: -75
    });
    wire(b, a, 'auto', 'auto', {
      label: '1',
      bend: -75
    });
    add('text', 230, 440, {
      label: 'Even number of 1s over Σ = {0, 1}',
      width: 500,
      height: 60
    });
  } else if (id === 'nfa') {
    const a = add('start', 180, 270, {
        label: 'q₀',
        width: 100,
        height: 100
      }),
      b = add('state', 500, 270, {
        label: 'q₁',
        width: 100,
        height: 100
      }),
      c = add('accept', 840, 270, {
        label: 'q₂',
        width: 100,
        height: 100
      });
    wire(a, b, 'auto', 'auto', {
      label: 'ε'
    });
    wire(b, b, 'auto', 'auto', {
      label: '0, 1',
      bend: 65
    });
    wire(b, c, 'auto', 'auto', {
      label: '1'
    });
    wire(a, c, 'auto', 'auto', {
      label: '1',
      bend: 230
    });
  } else if (id === 'mux') {
    const mux = add('mux', 440, 170, {
      label: 'MUX\n4 : 1',
      height: 240
    });
    for (let index = 0; index < 4; index++) {
      const input = add('input', 160, 190 + index * 55, {
        label: `D${index}`
      });
      wire(input, mux, 'right0', `left${index}`);
    }
    const s0 = add('input', 210, 520, {
        label: 'S0'
      }),
      s1 = add('input', 400, 570, {
        label: 'S1'
      }),
      out = add('output', 750, 265, {
        label: 'Y'
      });
    wire(s0, mux, 'right0', 'bottom0');
    wire(s1, mux, 'right0', 'bottom1');
    wire(mux, out);
  } else if (id === 'demux') {
    const demux = add('demux', 420, 180, {
        label: 'DEMUX\n1 : 4',
        height: 260
      }),
      input = add('input', 130, 280, {
        label: 'D'
      }),
      s0 = add('input', 170, 560, {
        label: 'S0'
      }),
      s1 = add('input', 400, 600, {
        label: 'S1'
      });
    wire(input, demux);
    wire(s0, demux, 'right0', 'bottom0');
    wire(s1, demux, 'right0', 'bottom1');
    for (let index = 0; index < 4; index++) {
      const out = add('output', 760, 210 + index * 65, {
        label: `Y${index}`
      });
      wire(demux, out, `right${index}`, 'left0');
    }
  } else if (id === 'multiplier') {
    const a = add('input', 130, 180, {
        label: 'A[3:0]',
        width: 120
      }),
      b = add('input', 130, 370, {
        label: 'B[3:0]',
        width: 120
      }),
      block = add('multiplier', 430, 190, {
        label: '4-bit\nMultiplier',
        width: 220,
        height: 230
      }),
      out = add('output', 850, 280, {
        label: 'P[7:0]',
        width: 130
      });
    wire(a, block);
    wire(b, block, 'right0', 'left1');
    wire(block, out);
  } else if (id === 'flip-flop') {
    const ff = add('dff', 400, 200, {
        label: 'D FF',
        width: 170,
        height: 180
      }),
      input = add('input', 130, 260, {
        label: 'D'
      }),
      clock = add('clock', 220, 490),
      q = add('output', 760, 230, {
        label: 'Q'
      }),
      notq = add('output', 760, 330, {
        label: 'Q̅'
      });
    wire(input, ff);
    wire(clock, ff, 'right0', 'bottom0');
    wire(ff, q);
    wire(ff, notq, 'right1', 'left0');
  } else if (id === 'flowchart') {
    const start = add('rounded', 410, 70, {
        label: 'Start',
        width: 160,
        height: 65
      }),
      read = add('parallelogram', 390, 210, {
        label: 'Read n',
        width: 200,
        height: 80
      }),
      decision = add('diamond', 385, 380, {
        label: 'n > 0?',
        width: 210,
        height: 130
      }),
      yes = add('rectangle', 160, 630, {
        label: 'Positive',
        width: 170,
        height: 80
      }),
      no = add('rectangle', 650, 630, {
        label: 'Non-positive',
        width: 190,
        height: 80
      });
    wire(start, read, 'bottom', 'top', {
      arrow: true
    });
    wire(read, decision, 'bottom', 'top', {
      arrow: true
    });
    wire(decision, yes, 'left', 'top', {
      arrow: true,
      label: 'Yes'
    });
    wire(decision, no, 'right', 'top', {
      arrow: true,
      label: 'No'
    });
  } else if (id === 'table') add('table', 230, 180, {
    width: 500,
    height: 300,
    fontSize: 22,
    cells: [['A', 'B', 'A ∧ B', 'A ∨ B', 'A ⊕ B'], ['0', '0', '0', '0', '0'], ['0', '1', '0', '1', '1'], ['1', '0', '0', '1', '1'], ['1', '1', '1', '1', '0']]
  });else if (id === 'linked-list') {
    const nodes = Array.from({
      length: 4
    }, (_, index) => add('linked-node', 160 + index * 260, 250, {
      label: String((index + 1) * 10),
      width: 150,
      height: 75
    }));
    for (let index = 0; index < nodes.length - 1; index++) wire(nodes[index], nodes[index + 1], 'right', 'left', {
      arrow: true
    });
    add('text', 1150, 270, {
      label: 'NULL',
      width: 100,
      height: 40
    });
  } else if (id === 'tree') {
    const root = add('vertex', 530, 100, {
        label: '8'
      }),
      a = add('vertex', 310, 300, {
        label: '4'
      }),
      b = add('vertex', 750, 300, {
        label: '12'
      }),
      c = add('vertex', 180, 530, {
        label: '2'
      }),
      d = add('vertex', 440, 530, {
        label: '6'
      });
    for (const [source, target] of [[root, a], [root, b], [a, c], [a, d]]) wire(source, target, 'auto', 'auto', {
      style: 'straight',
      arrow: false
    });
  }
  return project;
}
