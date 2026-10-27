import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  applyUnary,
  evaluateTokens,
  formatNumber,
} from '../src/lib/scientificCalculator.mjs';

const number = (value) => ({ type: 'number', value: String(value) });
const operator = (value) => ({ type: 'operator', value });
const paren = (value) => ({ type: 'paren', value });


test('expression evaluation respects precedence and brackets', () => {
  assert.equal(evaluateTokens([number(2), operator('+'), number(3), operator('*'), number(4)]), 14);
  assert.equal(evaluateTokens([
    paren('('), number(2), operator('+'), number(3), paren(')'), operator('*'), number(4),
  ]), 20);
});

test('GATE scientific binary operations calculate powers, roots, logs and modulo', () => {
  assert.equal(evaluateTokens([number(2), operator('pow'), number(10)]), 1024);
  assert.equal(evaluateTokens([number(27), operator('root'), number(3)]), 3);
  assert.equal(evaluateTokens([number(2), operator('logbase'), number(32)]), 5);
  assert.equal(evaluateTokens([number(17), operator('mod'), number(5)]), 2);
});

test('angle mode applies to trig and inverse trig functions', () => {
  assert.ok(Math.abs(applyUnary('sin', 30, 'deg') - 0.5) < 1e-12);
  assert.ok(Math.abs(applyUnary('sin', Math.PI / 2, 'rad') - 1) < 1e-12);
  assert.ok(Math.abs(applyUnary('asin', 0.5, 'deg') - 30) < 1e-12);
});

test('unary scientific operations cover the reference keypad', () => {
  assert.equal(applyUnary('factorial', 5), 120);
  assert.equal(applyUnary('percent', 25), 0.25);
  assert.equal(applyUnary('cbrt', -8), -2);
  assert.equal(applyUnary('reciprocal', 4), 0.25);
  assert.equal(applyUnary('log2', 32), 5);
});

test('domain errors return calculator-friendly failures', () => {
  assert.throws(() => applyUnary('sqrt', -1), /non-negative/);
  assert.throws(() => applyUnary('factorial', 2.5), /whole number/);
  assert.throws(() => evaluateTokens([number(1), operator('/'), number(0)]), /divide by zero/);
  assert.throws(() => evaluateTokens([paren('('), number(2), operator('+'), number(3)]), /brackets/);
});

test('display formatting stays compact without hiding very small values', () => {
  assert.equal(formatNumber(0.30000000000000004), '0.3');
  assert.equal(formatNumber(1e-12), '1e-12');
});

