'use client';

import { useEffect, useState } from 'react';
import {
  applyUnary,
  evaluateTokens,
  formatExpression,
  formatNumber,
} from '@/lib/scientificCalculator.mjs';
import styles from './ScientificCalculator.module.css';

const numberToken = (value) => ({ type: 'number', value: String(value) });
const operatorToken = (value) => ({ type: 'operator', value });
const parenToken = (value) => ({ type: 'paren', value });
const COMPLETE_NUMBER = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

const UNARY_LABELS = {
  sin: 'sin', cos: 'cos', tan: 'tan', asin: 'sin⁻¹', acos: 'cos⁻¹', atan: 'tan⁻¹',
  sinh: 'sinh', cosh: 'cosh', tanh: 'tanh', asinh: 'sinh⁻¹', acosh: 'cosh⁻¹', atanh: 'tanh⁻¹',
  log2: 'log₂', ln: 'ln', log10: 'log', exp: 'eˣ', pow10: '10ˣ', square: 'x²', cube: 'x³',
  sqrt: '√', cbrt: '∛', reciprocal: '1/x', abs: '|x|', factorial: 'n!', percent: '%',
};

function isCompleteNumber(value) {
  return COMPLETE_NUMBER.test(value) && Number.isFinite(Number(value));
}

function useCalculatorState() {
  const [tokens, setTokens] = useState([]);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(0);
  const [history, setHistory] = useState('');
  const [error, setError] = useState('');
  const [angleMode, setAngleMode] = useState('deg');
  const [memory, setMemory] = useState(0);
  const [overwrite, setOverwrite] = useState(false);
  const [afterEquals, setAfterEquals] = useState(false);

  const resetCalculation = () => {
    setTokens([]);
    setInput('');
    setResult(0);
    setHistory('');
    setError('');
    setOverwrite(false);
    setAfterEquals(false);
  };

  const prepareFreshEntry = () => {
    setTokens([]);
    setHistory('');
    setAfterEquals(false);
  };

  const fail = (problem) => {
    setHistory(formatExpression(tokens, input));
    setInput('');
    setError(problem instanceof Error ? problem.message : String(problem));
    setOverwrite(true);
    setAfterEquals(false);
  };

  const digit = (value) => {
    if (error) resetCalculation();
    if (afterEquals) prepareFreshEntry();

    if (overwrite || error || afterEquals) {
      setInput(value);
      setOverwrite(false);
      return;
    }

    const digitCount = input.replace(/[^0-9]/g, '').length;
    if (digitCount >= 16) return;
    if (input === '0') setInput(value);
    else if (input === '-0') setInput(`-${value}`);
    else setInput((current) => current + value);
  };

  const decimal = () => {
    if (error) resetCalculation();
    if (afterEquals) prepareFreshEntry();
    if (overwrite || error || afterEquals) {
      setInput('0.');
      setOverwrite(false);
      return;
    }
    if (/e/i.test(input)) return;
    if (input.includes('.')) return;
    setInput(input === '-' ? '-0.' : `${input || '0'}.`);
  };

  const exponent = () => {
    if (error || !isCompleteNumber(input) || /e/i.test(input)) return;
    if (afterEquals) {
      setTokens([]);
      setHistory('');
      setAfterEquals(false);
    }
    setInput(`${input}e`);
    setOverwrite(false);
  };

  const toggleSign = () => {
    if (error) return;
    if (/e-$/i.test(input)) {
      setInput(input.slice(0, -1));
      return;
    }
    if (/e$/i.test(input)) {
      setInput(`${input}-`);
      return;
    }
    if (input) {
      setInput(input.startsWith('-') ? input.slice(1) : `-${input}`);
      setOverwrite(false);
      return;
    }
    if (tokens.at(-1)?.type === 'paren' && tokens.at(-1)?.value === '(') {
      setInput('-');
      return;
    }
    setInput(formatNumber(-result));
    setOverwrite(true);
  };

  const backspace = () => {
    if (error || afterEquals) {
      resetCalculation();
      return;
    }
    if (overwrite) {
      setInput('');
      setOverwrite(false);
      return;
    }
    setInput((current) => current.slice(0, -1));
  };

  const constant = (value) => {
    if (error) resetCalculation();
    if (afterEquals) prepareFreshEntry();
    setInput(formatNumber(value));
    setOverwrite(true);
  };

  const operator = (operation) => {
    if (error) return;
    let next = [...tokens];

    if (afterEquals && isCompleteNumber(input)) {
      next = [numberToken(input)];
      setHistory('');
    } else if (isCompleteNumber(input)) {
      next.push(numberToken(input));
    } else if (input) {
      return;
    } else if (next.length === 0) {
      next.push(numberToken(result));
    }

    const last = next.at(-1);
    if (last?.type === 'operator') next[next.length - 1] = operatorToken(operation);
    else if (last?.type === 'number' || (last?.type === 'paren' && last.value === ')')) next.push(operatorToken(operation));
    else return;

    setTokens(next);
    setInput('');
    setError('');
    setOverwrite(false);
    setAfterEquals(false);
  };

  const keyboardMinus = () => {
    const last = tokens.at(-1);
    if (error || (!input && (!last || last.type === 'operator' || (last.type === 'paren' && last.value === '(')))) {
      if (error) resetCalculation();
      setInput('-');
      setOverwrite(false);
    } else if (/e$/i.test(input)) {
      setInput(`${input}-`);
      setOverwrite(false);
    } else operator('-');
  };

  const openParen = () => {
    if (error) resetCalculation();
    let next = error || afterEquals ? [] : [...tokens];
    if (afterEquals) setHistory('');

    if (isCompleteNumber(input)) {
      next.push(numberToken(input), operatorToken('*'));
    } else {
      const last = next.at(-1);
      if (last?.type === 'number' || (last?.type === 'paren' && last.value === ')')) {
        next.push(operatorToken('*'));
      }
    }
    next.push(parenToken('('));
    setTokens(next);
    setInput('');
    setError('');
    setOverwrite(false);
    setAfterEquals(false);
  };

  const closeParen = () => {
    if (error || (input && !isCompleteNumber(input))) return;
    const next = [...tokens];
    if (isCompleteNumber(input)) next.push(numberToken(input));
    const opens = next.filter((token) => token.type === 'paren' && token.value === '(').length;
    const closes = next.filter((token) => token.type === 'paren' && token.value === ')').length;
    const last = next.at(-1);
    if (opens <= closes || !(last?.type === 'number' || (last?.type === 'paren' && last.value === ')'))) return;
    next.push(parenToken(')'));
    setTokens(next);
    setInput('');
    setOverwrite(false);
  };

  const equals = () => {
    if (error || (input && !isCompleteNumber(input))) return;
    let expression = [...tokens];
    if (isCompleteNumber(input)) expression.push(numberToken(input));
    if (expression.at(-1)?.type === 'operator') return;

    const opens = expression.filter((token) => token.type === 'paren' && token.value === '(').length;
    const closes = expression.filter((token) => token.type === 'paren' && token.value === ')').length;
    if (opens > closes) {
      expression = expression.concat(Array.from({ length: opens - closes }, () => parenToken(')')));
    }

    try {
      const value = evaluateTokens(expression.length ? expression : [numberToken(result)]);
      setResult(value);
      setInput(formatNumber(value));
      setHistory(`${formatExpression(expression)} =`);
      setTokens([]);
      setError('');
      setOverwrite(true);
      setAfterEquals(true);
    } catch (problem) {
      fail(problem);
    }
  };

  const unary = (operation) => {
    if (error) return;
    const hasInput = isCompleteNumber(input);
    if (input && !hasInput) return;
    if (!hasInput && tokens.length) return;
    const value = hasInput ? Number(input) : result;
    try {
      const calculated = applyUnary(operation, value, angleMode);
      setResult(calculated);
      setInput(formatNumber(calculated));
      if (!tokens.length) setHistory(`${UNARY_LABELS[operation]}(${formatNumber(value)})`);
      setError('');
      setOverwrite(true);
    } catch (problem) {
      fail(problem);
    }
  };

  const currentValue = () => isCompleteNumber(input) ? Number(input) : result;

  const memoryAction = (action) => {
    if (action === 'clear') {
      setMemory(0);
      return;
    }
    if (action === 'recall') {
      if (afterEquals) prepareFreshEntry();
      setInput(formatNumber(memory));
      setError('');
      setOverwrite(true);
      return;
    }
    const value = currentValue();
    if (action === 'store') setMemory(value);
    if (action === 'add') setMemory((current) => current + value);
    if (action === 'subtract') setMemory((current) => current - value);
  };

  return {
    angleMode,
    backspace,
    closeParen,
    constant,
    decimal,
    digit,
    display: error || input || formatNumber(result),
    equals,
    error,
    exponent,
    expression: history || formatExpression(tokens),
    memory,
    memoryAction,
    keyboardMinus,
    openParen,
    operator,
    resetCalculation,
    setAngleMode,
    toggleSign,
    unary,
  };
}

function Key({ children, kind = 'function', wide = false, tall = false, label, onClick }) {
  return (
    <button
      type="button"
      className={`${styles.key} ${styles[kind]} ${wide ? styles.wide : ''} ${tall ? styles.tall : ''}`}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function ScriptedLabel({ base, sup, sub, tail = '' }) {
  return (
    <span className={styles.scriptedLabel}>
      <span>{base}</span>
      {sup && <span className={styles.superscript}>{sup}</span>}
      {sub && <span className={styles.subscript}>{sub}</span>}
      {tail && <span>{tail}</span>}
    </span>
  );
}

function CalculatorHelp({ keyboardEnabled = false }) {
  return (
    <div className={styles.helpContent} aria-labelledby="calculator-help-title">
      <h2 id="calculator-help-title">Calculator Instructions</h2>
      <p>
        Allows you to perform basic and complex mathematical operations such as modulus, square root,
        cube root, trigonometric, exponential, logarithmic, hyperbolic functions, etc.<br />
        You can operate the calculator using the buttons provided on screen with your mouse.
      </p>

      <h3 className={styles.dos}>Do&apos;s:</h3>
      <ul>
        <li>Be sure to press [C] when beginning a new calculation.</li>
        <li>Simply an equation using parenthesis and other mathematical operators.</li>
        <li>Use the predefined operations such as p (Pi), log, Exp to save time during calculation.</li>
        <li>Use memory function for calculating cumulative totals.</li>
      </ul>
      <p className={styles.helpStrong}>
        [M+]: Will add displayed value to memory.<br />
        [MR]: Will recall the value stored in memory.<br />
        [M-]: Subtracts the displayed value from memory.
      </p>
      <ul>
        <li>Be sure select the angle unit (Deg or Rad) before beginning any calculation.</li>
      </ul>
      <p className={styles.helpStrong}>Note: By default angle unit is set as Degree</p>

      <h3 className={styles.donts}>Dont&apos;s:</h3>
      <ul>
        <li>Perform multiple operations together.</li>
        <li>Leave parenthesis unbalanced.</li>
        <li>Change the angle unit (Deg or Rad) while performing a calculation..</li>
      </ul>

      <h3 className={styles.limitations}>Limitations:</h3>
      <ul>
        <li>{keyboardEnabled ? 'Keyboard enabled: use numbers, +, −, *, /, ^, %, parentheses, and E for an exponent. Enter or = calculates, Backspace deletes, and Escape or C clears.' : 'Keyboard operation is disabled.'}</li>
        <li>The output for a Factorial calculation is precise up to 14 digits.</li>
        <li>The output for Logarithmic and Hyperbolic calculations is precise up to 5 digits.</li>
        <li>Modulus (mod) operation performed on decimal numbers with 15 digits would not be precise.</li>
      </ul>
      <p className={styles.helpStrong}>
        Use mod operation only if the number comprises of less than 15 digits i.e. mod operation provides
        best results for smaller numbers.
      </p>
      <ul>
        <li>The range of value supported by the calculator is 10(-323) to 10(308).</li>
      </ul>
    </div>
  );
}

function CalculatorSurface({ calculator, inPictureInPicture = false, onMinimize, minimized = false, onCloseWindow, keyboardEnabled = false, targetWindow }) {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!keyboardEnabled || showHelp || !targetWindow) return;
    const keydown = (event) => {
      if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      if (target?.isContentEditable || target?.closest?.('textarea, select, input:not([type="radio"]):not([type="checkbox"])')) return;
      const key = event.key;
      let action;
      if (/^[0-9]$/.test(key)) action = () => calculator.digit(key);
      else if (key === '.') action = calculator.decimal;
      else if (key === '-') action = calculator.keyboardMinus;
      else if (['+', '*', '/'].includes(key)) action = () => calculator.operator(key);
      else if (key === 'e' || key === 'E') action = calculator.exponent;
      else if (key === '^') action = () => calculator.operator('pow');
      else if (key === '%') action = () => calculator.unary('percent');
      else if (key === '(') action = calculator.openParen;
      else if (key === ')') action = calculator.closeParen;
      else if (key === 'Enter' || key === '=') action = calculator.equals;
      else if (key === 'Backspace') action = calculator.backspace;
      else if (['Escape', 'Delete', 'c', 'C'].includes(key)) action = calculator.resetCalculation;
      if (!action) return;
      event.preventDefault(); event.stopPropagation();
      action();
    };
    targetWindow.addEventListener('keydown', keydown);
    return () => targetWindow.removeEventListener('keydown', keydown);
  }, [calculator, keyboardEnabled, showHelp, targetWindow]);

  return (
    <section className={styles.calculator} aria-label="GATE scientific calculator">
      <header className={styles.calculatorHeader}>
        <span>Scientific Calculator</span>
        <button type="button" className={styles.helpButton} onClick={() => setShowHelp((visible) => !visible)}>
          {showHelp ? 'Back' : 'Help'}
        </button>
        {onMinimize && <button type="button" className={styles.popoutButton} onClick={onMinimize} aria-label={minimized ? 'Restore calculator' : 'Minimize calculator'} title={minimized ? 'Restore calculator' : 'Minimize calculator'}>−</button>}
        {onCloseWindow && (
          <button type="button" className={styles.closeButton} onClick={onCloseWindow} aria-label="Close calculator" title="Close calculator" />
        )}
      </header>

      {showHelp ? <div className={styles.helpBody}><CalculatorHelp keyboardEnabled={keyboardEnabled} /></div> : (
        <div className={styles.body}>
          <output className={styles.expression} aria-label="Calculation expression">{calculator.expression}</output>
          <div className={styles.valueBox} aria-live="polite" aria-atomic="true">
            {calculator.memory !== 0 && <span className={styles.memoryStatus}>M</span>}
            <output aria-label="Calculation result" className={`${styles.value} ${calculator.error ? styles.error : ''}`}>{calculator.display}</output>
          </div>

          <div className={styles.utilityRow}>
            <button type="button" className={styles.smallKey} onClick={() => calculator.operator('mod')}>mod</button>
            <fieldset className={styles.angleToggle}>
              <legend className={styles.srOnly}>Angle mode</legend>
              <label>
                <input type="radio" name={inPictureInPicture ? 'pip-angle' : 'angle'} checked={calculator.angleMode === 'deg'} onChange={() => calculator.setAngleMode('deg')} />
                Deg
              </label>
              <label>
                <input type="radio" name={inPictureInPicture ? 'pip-angle' : 'angle'} checked={calculator.angleMode === 'rad'} onChange={() => calculator.setAngleMode('rad')} />
                Rad
              </label>
            </fieldset>
            <span className={styles.utilitySpacer} aria-hidden="true" />
            <div className={styles.memoryKeys}>
              <button type="button" onClick={() => calculator.memoryAction('clear')}>MC</button>
              <button type="button" onClick={() => calculator.memoryAction('recall')}>MR</button>
              <button type="button" onClick={() => calculator.memoryAction('store')}>MS</button>
              <button type="button" onClick={() => calculator.memoryAction('add')}>M+</button>
              <button type="button" onClick={() => calculator.memoryAction('subtract')}>M-</button>
            </div>
          </div>

          <div className={styles.keypad}>
          <Key label="Hyperbolic sine" onClick={() => calculator.unary('sinh')}>sinh</Key>
          <Key label="Hyperbolic cosine" onClick={() => calculator.unary('cosh')}>cosh</Key>
          <Key label="Hyperbolic tangent" onClick={() => calculator.unary('tanh')}>tanh</Key>
          <Key label="Enter exponent" onClick={calculator.exponent}>Exp</Key>
          <Key label="Open bracket" onClick={calculator.openParen}>(</Key>
          <Key label="Close bracket" onClick={calculator.closeParen}>)</Key>
          <Key kind="danger" wide label="Backspace" onClick={calculator.backspace}><span className={styles.backArrow}>←</span></Key>
          <Key kind="danger" label="Clear" onClick={calculator.resetCalculation}>C</Key>
          <Key kind="danger" label="Change sign" onClick={calculator.toggleSign}>+/-</Key>
          <Key label="Square root" onClick={() => calculator.unary('sqrt')}>√</Key>

          <Key label="Inverse hyperbolic sine" onClick={() => calculator.unary('asinh')}><ScriptedLabel base="sinh" sup="-1" /></Key>
          <Key label="Inverse hyperbolic cosine" onClick={() => calculator.unary('acosh')}><ScriptedLabel base="cosh" sup="-1" /></Key>
          <Key label="Inverse hyperbolic tangent" onClick={() => calculator.unary('atanh')}><ScriptedLabel base="tanh" sup="-1" /></Key>
          <Key label="Log base 2" onClick={() => calculator.unary('log2')}><ScriptedLabel base="log" sub="2" tail="x" /></Key>
          <Key label="Natural logarithm" onClick={() => calculator.unary('ln')}>ln</Key>
          <Key label="Common logarithm" onClick={() => calculator.unary('log10')}>log</Key>
          <Key kind="number" label="7" onClick={() => calculator.digit('7')}>7</Key>
          <Key kind="number" label="8" onClick={() => calculator.digit('8')}>8</Key>
          <Key kind="number" label="9" onClick={() => calculator.digit('9')}>9</Key>
          <Key kind="operator" label="Divide" onClick={() => calculator.operator('/')}>/</Key>
          <Key kind="operator" label="Percent" onClick={() => calculator.unary('percent')}>%</Key>

          <Key label="Pi" onClick={() => calculator.constant(Math.PI)}>π</Key>
          <Key label="Euler's number" onClick={() => calculator.constant(Math.E)}>e</Key>
          <Key label="Factorial" onClick={() => calculator.unary('factorial')}>n!</Key>
          <Key label="Logarithm with base" onClick={() => calculator.operator('logbase')}><ScriptedLabel base="log" sub="y" tail="x" /></Key>
          <Key label="e to the power x" onClick={() => calculator.unary('exp')}><ScriptedLabel base="e" sup="x" /></Key>
          <Key label="10 to the power x" onClick={() => calculator.unary('pow10')}><ScriptedLabel base="10" sup="x" /></Key>
          <Key kind="number" label="4" onClick={() => calculator.digit('4')}>4</Key>
          <Key kind="number" label="5" onClick={() => calculator.digit('5')}>5</Key>
          <Key kind="number" label="6" onClick={() => calculator.digit('6')}>6</Key>
          <Key kind="operator" label="Multiply" onClick={() => calculator.operator('*')}><span className={styles.largeOperator}>*</span></Key>
          <Key kind="operator" label="Reciprocal" onClick={() => calculator.unary('reciprocal')}>1/x</Key>

          <Key label="Sine" onClick={() => calculator.unary('sin')}>sin</Key>
          <Key label="Cosine" onClick={() => calculator.unary('cos')}>cos</Key>
          <Key label="Tangent" onClick={() => calculator.unary('tan')}>tan</Key>
          <Key label="Power" onClick={() => calculator.operator('pow')}><ScriptedLabel base="x" sup="y" /></Key>
          <Key label="Cube" onClick={() => calculator.unary('cube')}><ScriptedLabel base="x" sup="3" /></Key>
          <Key label="Square" onClick={() => calculator.unary('square')}><ScriptedLabel base="x" sup="2" /></Key>
          <Key kind="number" label="1" onClick={() => calculator.digit('1')}>1</Key>
          <Key kind="number" label="2" onClick={() => calculator.digit('2')}>2</Key>
          <Key kind="number" label="3" onClick={() => calculator.digit('3')}>3</Key>
          <Key kind="operator" label="Subtract" onClick={() => calculator.operator('-')}><span className={styles.largeOperator}>-</span></Key>
          <Key kind="equals" tall label="Equals" onClick={calculator.equals}>=</Key>

          <Key label="Inverse sine" onClick={() => calculator.unary('asin')}><ScriptedLabel base="sin" sup="-1" /></Key>
          <Key label="Inverse cosine" onClick={() => calculator.unary('acos')}><ScriptedLabel base="cos" sup="-1" /></Key>
          <Key label="Inverse tangent" onClick={() => calculator.unary('atan')}><ScriptedLabel base="tan" sup="-1" /></Key>
          <Key label="Y root of X" onClick={() => calculator.operator('root')}><span className={styles.scriptedLabel}><span className={styles.rootIndex}>y</span><span>√x</span></span></Key>
          <Key label="Cube root" onClick={() => calculator.unary('cbrt')}>∛</Key>
          <Key label="Absolute value" onClick={() => calculator.unary('abs')}>|x|</Key>
          <Key kind="number" wide label="0" onClick={() => calculator.digit('0')}>0</Key>
          <Key kind="number" label="Decimal point" onClick={calculator.decimal}>.</Key>
          <Key kind="operator" label="Add" onClick={() => calculator.operator('+')}>+</Key>
          </div>
        </div>
      )}
    </section>
  );
}

// Adapted from the user's tracker calculator; the maths and keypad are shared verbatim.
export default function ScientificCalculator({ onClose, onMinimize, minimized }) {
  const calculator = useCalculatorState();
  return <CalculatorSurface calculator={calculator} onCloseWindow={onClose} onMinimize={onMinimize} minimized={minimized} />;
}
