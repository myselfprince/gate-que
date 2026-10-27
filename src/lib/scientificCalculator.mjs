// Pure calculator maths, kept outside React so the GATE keypad can be regression-tested.
// The UI builds an array of number, operator and parenthesis tokens; this module evaluates
// that array without eval(), Function(), or accepting arbitrary JavaScript from the display.

const OPERATORS = {
  '+': { precedence: 1, associativity: 'left', apply: (a, b) => a + b },
  '-': { precedence: 1, associativity: 'left', apply: (a, b) => a - b },
  '*': { precedence: 2, associativity: 'left', apply: (a, b) => a * b },
  '/': {
    precedence: 2,
    associativity: 'left',
    apply: (a, b) => {
      if (b === 0) throw new Error('Cannot divide by zero');
      return a / b;
    },
  },
  mod: {
    precedence: 2,
    associativity: 'left',
    apply: (a, b) => {
      if (b === 0) throw new Error('Cannot divide by zero');
      return a % b;
    },
  },
  pow: { precedence: 3, associativity: 'right', apply: (a, b) => a ** b },
  root: {
    precedence: 3,
    associativity: 'right',
    apply: (a, b) => nthRoot(a, b),
  },
  logbase: {
    precedence: 3,
    associativity: 'right',
    apply: (base, value) => {
      if (base <= 0 || base === 1 || value <= 0) throw new Error('Invalid logarithm');
      return Math.log(value) / Math.log(base);
    },
  },
};

export const OPERATOR_LABELS = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
  mod: 'mod',
  pow: '^',
  root: 'ʸ√',
  logbase: 'logᵧ',
};

const toRadians = (value, angleMode) => angleMode === 'deg' ? value * Math.PI / 180 : value;
const fromRadians = (value, angleMode) => angleMode === 'deg' ? value * 180 / Math.PI : value;

function nthRoot(value, degree) {
  if (degree === 0) throw new Error('Root degree cannot be zero');
  if (value < 0) {
    if (!Number.isInteger(degree) || Math.abs(degree % 2) !== 1) {
      throw new Error('Invalid real root');
    }
    return -((-value) ** (1 / degree));
  }
  return value ** (1 / degree);
}

function factorial(value) {
  if (!Number.isInteger(value) || value < 0) throw new Error('Factorial needs a whole number');
  if (value > 170) throw new Error('Result is too large');
  let result = 1;
  for (let current = 2; current <= value; current += 1) result *= current;
  return result;
}

function assertFiniteResult(value) {
  if (Number.isNaN(value)) throw new Error('Math error');
  if (!Number.isFinite(value)) throw new Error('Result is too large');
  return Object.is(value, -0) ? 0 : value;
}

export function applyUnary(operation, value, angleMode = 'deg') {
  if (!Number.isFinite(value)) throw new Error('Enter a valid number');

  let result;
  switch (operation) {
    case 'sin': result = Math.sin(toRadians(value, angleMode)); break;
    case 'cos': result = Math.cos(toRadians(value, angleMode)); break;
    case 'tan': result = Math.tan(toRadians(value, angleMode)); break;
    case 'asin':
      if (value < -1 || value > 1) throw new Error('sin⁻¹ accepts −1 to 1');
      result = fromRadians(Math.asin(value), angleMode);
      break;
    case 'acos':
      if (value < -1 || value > 1) throw new Error('cos⁻¹ accepts −1 to 1');
      result = fromRadians(Math.acos(value), angleMode);
      break;
    case 'atan': result = fromRadians(Math.atan(value), angleMode); break;
    case 'sinh': result = Math.sinh(value); break;
    case 'cosh': result = Math.cosh(value); break;
    case 'tanh': result = Math.tanh(value); break;
    case 'asinh': result = Math.asinh(value); break;
    case 'acosh':
      if (value < 1) throw new Error('cosh⁻¹ accepts values ≥ 1');
      result = Math.acosh(value);
      break;
    case 'atanh':
      if (value <= -1 || value >= 1) throw new Error('tanh⁻¹ accepts −1 to 1');
      result = Math.atanh(value);
      break;
    case 'log2':
      if (value <= 0) throw new Error('Logarithms need a positive number');
      result = Math.log2(value);
      break;
    case 'ln':
      if (value <= 0) throw new Error('Logarithms need a positive number');
      result = Math.log(value);
      break;
    case 'log10':
      if (value <= 0) throw new Error('Logarithms need a positive number');
      result = Math.log10(value);
      break;
    case 'exp': result = Math.exp(value); break;
    case 'pow10': result = 10 ** value; break;
    case 'square': result = value ** 2; break;
    case 'cube': result = value ** 3; break;
    case 'sqrt':
      if (value < 0) throw new Error('Square root needs a non-negative number');
      result = Math.sqrt(value);
      break;
    case 'cbrt': result = Math.cbrt(value); break;
    case 'reciprocal':
      if (value === 0) throw new Error('Cannot divide by zero');
      result = 1 / value;
      break;
    case 'abs': result = Math.abs(value); break;
    case 'factorial': result = factorial(value); break;
    case 'percent': result = value / 100; break;
    default: throw new Error('Unknown operation');
  }
  return assertFiniteResult(result);
}

function shouldPopOperator(stackOperator, incomingOperator) {
  if (stackOperator === '(') return false;
  const stack = OPERATORS[stackOperator];
  const incoming = OPERATORS[incomingOperator];
  if (!stack || !incoming) throw new Error('Invalid expression');
  if (incoming.associativity === 'left') return incoming.precedence <= stack.precedence;
  return incoming.precedence < stack.precedence;
}

function toPostfix(tokens) {
  const output = [];
  const stack = [];

  for (const token of tokens) {
    if (token.type === 'number') {
      const value = Number(token.value);
      if (!Number.isFinite(value)) throw new Error('Enter a valid number');
      output.push({ type: 'number', value });
      continue;
    }
    if (token.type === 'operator') {
      if (!OPERATORS[token.value]) throw new Error('Invalid expression');
      while (stack.length && shouldPopOperator(stack.at(-1), token.value)) {
        output.push({ type: 'operator', value: stack.pop() });
      }
      stack.push(token.value);
      continue;
    }
    if (token.type === 'paren' && token.value === '(') {
      stack.push('(');
      continue;
    }
    if (token.type === 'paren' && token.value === ')') {
      while (stack.length && stack.at(-1) !== '(') {
        output.push({ type: 'operator', value: stack.pop() });
      }
      if (stack.pop() !== '(') throw new Error('Check the brackets');
      continue;
    }
    throw new Error('Invalid expression');
  }

  while (stack.length) {
    const operator = stack.pop();
    if (operator === '(') throw new Error('Close all brackets');
    output.push({ type: 'operator', value: operator });
  }
  return output;
}

export function evaluateTokens(tokens) {
  if (!Array.isArray(tokens) || tokens.length === 0) throw new Error('Enter a calculation');
  const stack = [];
  for (const token of toPostfix(tokens)) {
    if (token.type === 'number') {
      stack.push(token.value);
      continue;
    }
    if (stack.length < 2) throw new Error('Complete the calculation');
    const right = stack.pop();
    const left = stack.pop();
    stack.push(assertFiniteResult(OPERATORS[token.value].apply(left, right)));
  }
  if (stack.length !== 1) throw new Error('Complete the calculation');
  return assertFiniteResult(stack[0]);
}

export function formatNumber(value) {
  const normalised = assertFiniteResult(Number(value));
  if (normalised === 0) return '0';
  const magnitude = Math.abs(normalised);
  if (magnitude >= 1e12 || magnitude < 1e-9) {
    return normalised.toExponential(10).replace(/\.0+(?=e)|(?<=\.\d*?)0+(?=e)/g, '').replace('e+', 'e');
  }
  return Number.parseFloat(normalised.toPrecision(12)).toString();
}

export function formatExpression(tokens, input = '') {
  const parts = tokens.map((token) => {
    if (token.type === 'operator') return OPERATOR_LABELS[token.value] || token.value;
    return String(token.value);
  });
  if (input) parts.push(input);
  return parts.join(' ');
}

