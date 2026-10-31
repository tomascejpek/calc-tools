/**
 * Powers, roots and logarithms.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Real n-th root; odd roots of negative numbers are real too.
 * @param {number} x
 * @param {number} n
 * @returns {number | null}
 */
export function realRoot(x, n) {
  if (n === 0) return null;
  if (x >= 0) return x ** (1 / n);
  return Number.isInteger(n) && Math.abs(n) % 2 === 1 ? -((-x) ** (1 / n)) : null;
}

/**
 * @param {number} x
 * @param {number} base
 * @returns {number | null}
 */
export function logBase(x, base) {
  if (x <= 0 || base <= 0 || base === 1) return null;
  return Math.log(x) / Math.log(base);
}

const finite = (/** @type {number | null} */ value) => (value !== null && Number.isFinite(value) ? value + 0 : null);

const inputs = [
  { id: 'x', type: 'number', default: 8, step: 1, label: { cs: 'Číslo x', en: 'Number x' } },
  { id: 'y', type: 'number', default: 2, step: 1, label: { cs: 'Exponent, odmocnitel nebo základ y', en: 'Exponent, root index or base y' } },
];

const outputs = [
  { id: 'power', label: { cs: 'Mocnina xʸ', en: 'Power xʸ' }, significant: 12 },
  { id: 'root', label: { cs: 'Odmocnina ʸ√x', en: 'Root ʸ√x' }, significant: 12 },
  { id: 'log', label: { cs: 'Logaritmus logᵧ x', en: 'Logarithm logᵧ x' }, significant: 12 },
  { id: 'ln', label: { cs: 'Přirozený logaritmus ln x', en: 'Natural logarithm ln x' }, significant: 12 },
  { id: 'log10', label: { cs: 'Dekadický logaritmus log x', en: 'Common logarithm log x' }, significant: 12 },
  { id: 'exp', label: { cs: 'eˣ', en: 'eˣ' }, significant: 12 },
];

export default {
  id: 'power-log',
  kind: 'calculator',
  category: 'math-algebra',
  tags: ['math'],
  name: { cs: 'Mocniny a logaritmy', en: 'Powers and logarithms' },
  description: {
    cs: 'Pro čísla x a y spočítá mocninu xʸ, y-tou odmocninu z x, logaritmus x o základu y, přirozený a dekadický logaritmus x a eˣ. Lichá odmocnina záporného čísla je reálná (³√−8 = −2); hodnoty, které v reálných číslech neexistují, zůstanou prázdné.',
    en: 'For numbers x and y works out the power xʸ, the y-th root of x, the logarithm of x to base y, the natural and common logarithm of x and eˣ. An odd root of a negative number is real (³√−8 = −2); values that do not exist in real numbers stay empty.',
  },
  keywords: {
    cs: ['mocnina', 'odmocnina', 'logaritmus', 'přirozený logaritmus', 'ln', 'log', 'exponent', 'exponenciála'],
    en: ['power', 'exponent', 'root', 'logarithm', 'natural logarithm', 'ln', 'log', 'exponential'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { x, y } = read.values;
    const result = {
      power: finite(x ** y),
      root: finite(realRoot(x, y)),
      log: finite(logBase(x, y)),
      ln: x > 0 ? Math.log(x) + 0 : null,
      log10: x > 0 ? Math.log10(x) + 0 : null,
      exp: finite(Math.exp(x)),
    };
    const warnings = Object.values(result).some((value) => value === null)
      ? [{ cs: 'Některé hodnoty v reálných číslech neexistují nebo jsou příliš velké.', en: 'Some values do not exist in real numbers or are too large.' }]
      : [];
    return { values: result, warnings };
  },
  references: [{ title: 'Wikipedia: Logarithm', url: 'https://en.wikipedia.org/wiki/Logarithm' }],
};
