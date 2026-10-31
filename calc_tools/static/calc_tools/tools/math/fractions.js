/**
 * Exact arithmetic with fractions, mixed numbers and decimals.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** @typedef {{ n: bigint, d: bigint }} Fraction numerator and positive denominator */

/**
 * @param {bigint} a
 * @param {bigint} b
 */
export function gcdBig(a, b) {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y) [x, y] = [y, x % y];
  return x;
}

/**
 * @param {bigint} n
 * @param {bigint} d non-zero
 * @returns {Fraction}
 */
export function reduce(n, d) {
  const sign = d < 0n ? -1n : 1n;
  const g = gcdBig(n, d) || 1n;
  return { n: sign * n / g, d: sign * d / g };
}

/** Accepted forms: 3, -3, 3/4, 1 1/2, -1 1/2, 0.25, 0,25. */
export const FRACTION_PATTERN = /^-?\d{1,15}(?:[.,]\d{1,15}|\s+\d{1,15}\/\d{1,15}|\/\d{1,15})?$/;

/**
 * Parses a fraction, mixed number, integer or decimal.
 * @param {string} text matching FRACTION_PATTERN
 * @returns {Fraction | null} null for a zero denominator
 */
export function parseFraction(text) {
  const negative = text.startsWith('-');
  const body = negative ? text.slice(1) : text;
  let result;
  const decimal = body.match(/^(\d+)[.,](\d+)$/);
  const mixed = body.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  const simple = body.match(/^(\d+)\/(\d+)$/);
  if (decimal) {
    const scale = 10n ** BigInt(decimal[2].length);
    result = reduce(BigInt(decimal[1]) * scale + BigInt(decimal[2]), scale);
  } else if (mixed) {
    const d = BigInt(mixed[3]);
    if (d === 0n) return null;
    result = reduce(BigInt(mixed[1]) * d + BigInt(mixed[2]), d);
  } else if (simple) {
    const d = BigInt(simple[2]);
    if (d === 0n) return null;
    result = reduce(BigInt(simple[1]), d);
  } else {
    result = { n: BigInt(body), d: 1n };
  }
  return negative ? { n: -result.n, d: result.d } : result;
}

/**
 * @param {'add' | 'subtract' | 'multiply' | 'divide' | 'simplify'} operation
 * @param {Fraction} a
 * @param {Fraction} b
 * @returns {Fraction | null} null when dividing by zero
 */
export function operate(operation, a, b) {
  switch (operation) {
    case 'add': return reduce(a.n * b.d + b.n * a.d, a.d * b.d);
    case 'subtract': return reduce(a.n * b.d - b.n * a.d, a.d * b.d);
    case 'multiply': return reduce(a.n * b.n, a.d * b.d);
    case 'divide': return b.n === 0n ? null : reduce(a.n * b.d, a.d * b.n);
    default: return reduce(a.n, a.d);
  }
}

/** @param {Fraction} f */
export function fractionText({ n, d }) {
  return d === 1n ? String(n) : `${n}/${d}`;
}

/** @param {Fraction} f */
export function mixedText({ n, d }) {
  const negative = n < 0n;
  const abs = negative ? -n : n;
  const whole = abs / d;
  const rest = abs % d;
  const sign = negative ? '-' : '';
  if (rest === 0n) return `${sign}${whole}`;
  return whole === 0n ? `${sign}${rest}/${d}` : `${sign}${whole} ${rest}/${d}`;
}

const HINT = { cs: 'Např. 3/4, 1 1/2, -2/3 nebo 0,25.', en: 'E.g. 3/4, 1 1/2, -2/3 or 0.25.' };

const inputs = [
  { id: 'a', type: 'text', default: '1/2', maxLength: 40, pattern: FRACTION_PATTERN, hint: HINT, label: { cs: 'První zlomek', en: 'First fraction' } },
  {
    id: 'operation', type: 'select', default: 'add', label: { cs: 'Operace', en: 'Operation' },
    options: [
      { value: 'add', label: { cs: '+ sčítání', en: '+ add' } },
      { value: 'subtract', label: { cs: '− odčítání', en: '− subtract' } },
      { value: 'multiply', label: { cs: '× násobení', en: '× multiply' } },
      { value: 'divide', label: { cs: '÷ dělení', en: '÷ divide' } },
      { value: 'simplify', label: { cs: 'jen zkrátit první zlomek', en: 'only simplify the first fraction' } },
    ],
  },
  { id: 'b', type: 'text', default: '1/3', maxLength: 40, pattern: FRACTION_PATTERN, hint: HINT, label: { cs: 'Druhý zlomek', en: 'Second fraction' } },
];

const outputs = [
  { id: 'fraction', type: 'text', label: { cs: 'Výsledek (zkrácený zlomek)', en: 'Result (in lowest terms)' } },
  { id: 'mixed', type: 'text', label: { cs: 'Smíšené číslo', en: 'Mixed number' } },
  { id: 'decimal', label: { cs: 'Desetinné číslo', en: 'Decimal' }, significant: 15 },
];

export default {
  id: 'fractions',
  kind: 'calculator',
  category: 'math-arithmetic',
  tags: ['math'],
  name: { cs: 'Zlomky', en: 'Fractions' },
  description: {
    cs: 'Sčítání, odčítání, násobení a dělení zlomků a smíšených čísel s přesným výsledkem v základním tvaru. Zlomky zapisujte jako 3/4, smíšená čísla jako 1 1/2; desetinné číslo (0,25) se převede na zlomek (1/4).',
    en: 'Adds, subtracts, multiplies and divides fractions and mixed numbers with an exact result in lowest terms. Write fractions as 3/4, mixed numbers as 1 1/2; a decimal (0.25) is turned into a fraction (1/4).',
  },
  keywords: {
    cs: ['zlomky', 'zlomek', 'krácení', 'smíšené číslo', 'čitatel', 'jmenovatel', 'společný jmenovatel'],
    en: ['fractions', 'fraction', 'simplify', 'lowest terms', 'mixed number', 'numerator', 'denominator'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const a = parseFraction(read.values.a);
    const b = parseFraction(read.values.b);
    if (a === null || b === null) return emptyResult(outputs, [{ cs: 'Jmenovatel nesmí být nula.', en: 'The denominator must not be zero.' }]);
    const result = operate(read.values.operation, a, b);
    if (result === null) return emptyResult(outputs, [{ cs: 'Dělení nulou.', en: 'Division by zero.' }]);
    return { values: { fraction: fractionText(result), mixed: mixedText(result), decimal: Number(result.n) / Number(result.d) }, warnings: [] };
  },
  references: [{ title: 'Wikipedia: Fraction', url: 'https://en.wikipedia.org/wiki/Fraction' }],
};
