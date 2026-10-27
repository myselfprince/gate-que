'use client';
import { useState } from 'react';
export default function MockCalculator() {
  const [a, setA] = useState('0'), [b, setB] = useState('0'), [operation, setOperation] = useState('+'), [answer, setAnswer] = useState('0');
  function calculate() {
    const x = Number(a), y = Number(b);
    const operations = { '+': () => x + y, '−': () => x - y, '×': () => x * y, '÷': () => x / y, 'xʸ': () => x ** y,
      '√x': () => Math.sqrt(x), 'ln x': () => Math.log(x), 'log₁₀ x': () => Math.log10(x), 'sin x°': () => Math.sin(x * Math.PI / 180), 'cos x°': () => Math.cos(x * Math.PI / 180) };
    const result = operations[operation](); setAnswer(Number.isFinite(result) ? String(Number(result.toPrecision(12))) : 'Undefined');
  }
  return <details><summary>Calculator</summary><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: 12 }}>
    <label>x<input type="number" step="any" value={a} onChange={e => setA(e.target.value)} /></label>
    <label>Operation<select value={operation} onChange={e => setOperation(e.target.value)}>{['+', '−', '×', '÷', 'xʸ', '√x', 'ln x', 'log₁₀ x', 'sin x°', 'cos x°'].map(op => <option key={op}>{op}</option>)}</select></label>
    <label>y<input type="number" step="any" value={b} onChange={e => setB(e.target.value)} /></label><button onClick={calculate}>Calculate</button><output style={{ padding: 12 }}>{answer}</output>
  </div></details>;
}
