/**
 * Greatest common divisor and least common multiple of several integers.
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { gcdBig } from './fractions.js';

/** Whole numbers separated by spaces, commas or semicolons. */
export const INTEGER_LIST_PATTERN = /^-?\d{1,16}(?:[\s,;]+-?\d{1,16}){0,99}$/;

/**
 * @param {string} text
 * @returns {bigint[]}
 */
export function parseIntegers(text) {
  return text.split(/[\s,;]+/).filter(Boolean).map((part) => BigInt(part));
}

/**
 * @param {bigint[]} numbers
 */
export function gcdOf(numbers) {
  return numbers.reduce((acc, value) => gcdBig(acc, value), 0n);
}

/**
 * @param {bigint[]} numbers
 */
export function lcmOf(numbers) {
  return numbers.reduce((acc, value) => {
    if (acc === 0n || value === 0n) return 0n;
    const abs = value < 0n ? -value : value;
    return acc / gcdBig(acc, abs) * abs;
  }, 1n);
}

const inputs = [
  {
    id: 'numbers', type: 'text', default: '12, 18, 30', maxLength: 2000, pattern: INTEGER_LIST_PATTERN,
    hint: { cs: 'Celá čísla oddělená čárkou nebo mezerou, nejvýš 100.', en: 'Whole numbers separated by commas or spaces, at most 100.' },
    label: { cs: 'Čísla', en: 'Numbers' },
  },
];

const outputs = [
  { id: 'gcd', type: 'text', label: { cs: 'Největší společný dělitel (NSD)', en: 'Greatest common divisor (GCD)' } },
  { id: 'lcm', type: 'text', label: { cs: 'Nejmenší společný násobek (NSN)', en: 'Least common multiple (LCM)' } },
];

export default {
  id: 'gcd-lcm',
  kind: 'calculator',
  category: 'math-numbers',
  tags: ['math'],
  name: { cs: 'NSD a NSN', en: 'GCD and LCM' },
  description: {
    cs: 'Největší společný dělitel a nejmenší společný násobek dvou i více celých čísel (Eukleidův algoritmus). Počítá přesně i s velkými čísly.',
    en: 'Greatest common divisor and least common multiple of two or more whole numbers (Euclid\'s algorithm). Exact even for large numbers.',
  },
  keywords: {
    cs: ['nsd', 'nsn', 'největší společný dělitel', 'nejmenší společný násobek', 'dělitel', 'násobek', 'eukleidův algoritmus'],
    en: ['gcd', 'lcm', 'hcf', 'greatest common divisor', 'least common multiple', 'divisor', 'euclid'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const numbers = parseIntegers(read.values.numbers);
    if (numbers.length < 2) return emptyResult(outputs, [{ cs: 'Zadejte aspoň dvě čísla.', en: 'Enter at least two numbers.' }]);
    return { values: { gcd: String(gcdOf(numbers)), lcm: String(lcmOf(numbers)) }, warnings: [] };
  },
  references: [{ title: 'Wikipedia: Euclidean algorithm', url: 'https://en.wikipedia.org/wiki/Euclidean_algorithm' }],
};
