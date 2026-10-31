/**
 * Roman numerals ⇄ Arabic numbers (1–3999).
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const SYMBOLS = /** @type {[string, number][]} */ ([
  ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400], ['C', 100], ['XC', 90],
  ['L', 50], ['XL', 40], ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1],
]);

/** Canonical Roman numerals from I to MMMCMXCIX. */
export const ROMAN_PATTERN = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i;

/**
 * @param {number} n 1–3999
 */
export function toRoman(n) {
  let rest = n;
  let text = '';
  for (const [symbol, value] of SYMBOLS) {
    while (rest >= value) {
      text += symbol;
      rest -= value;
    }
  }
  return text;
}

/**
 * @param {string} text canonical Roman numeral
 */
export function fromRoman(text) {
  let rest = text.toUpperCase();
  let value = 0;
  for (const [symbol, amount] of SYMBOLS) {
    while (rest.startsWith(symbol)) {
      value += amount;
      rest = rest.slice(symbol.length);
    }
  }
  return value;
}

const inputs = [
  {
    id: 'value', type: 'text', default: '2026', maxLength: 20, pattern: /^(\d{1,4}|[IVXLCDM]{1,15})$/i,
    hint: { cs: 'Arabské číslo 1–3999 nebo římské číslo (např. MMXXVI).', en: 'An Arabic number 1–3999 or a Roman numeral (e.g. MMXXVI).' },
    label: { cs: 'Arabské nebo římské číslo', en: 'Arabic number or Roman numeral' },
  },
];

const outputs = [
  { id: 'roman', type: 'text', label: { cs: 'Římské číslo', en: 'Roman numeral' } },
  { id: 'arabic', label: { cs: 'Arabské číslo', en: 'Arabic number' }, precision: 0 },
];

export default {
  id: 'roman',
  kind: 'calculator',
  category: 'math-numbers',
  tags: ['math'],
  name: { cs: 'Římská čísla', en: 'Roman numerals' },
  description: {
    cs: 'Převod mezi arabskými a římskými čísly od 1 do 3999 (I až MMMCMXCIX). Zadejte jedno nebo druhé; římské číslo musí být v obvyklém tvaru (IV, ne IIII; XC, ne LXXXX).',
    en: 'Converts between Arabic numbers and Roman numerals from 1 to 3999 (I to MMMCMXCIX). Enter either; a Roman numeral must be in the standard form (IV, not IIII; XC, not LXXXX).',
  },
  keywords: {
    cs: ['římská čísla', 'římské číslice', 'arabská čísla', 'letopočet', 'mmxxvi'],
    en: ['roman numerals', 'roman numbers', 'arabic numbers', 'year', 'mmxxvi'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { value } = read.values;
    if (/^\d+$/.test(value)) {
      const n = Number(value);
      if (n < 1 || n > 3999) return emptyResult(outputs, [{ cs: 'Římsky lze zapsat jen čísla 1 až 3999.', en: 'Only numbers 1 to 3999 can be written in Roman numerals.' }]);
      return { values: { roman: toRoman(n), arabic: n }, warnings: [] };
    }
    if (!ROMAN_PATTERN.test(value)) {
      return emptyResult(outputs, [{ cs: 'Toto není římské číslo v obvyklém tvaru.', en: 'This is not a Roman numeral in the standard form.' }]);
    }
    const n = fromRoman(value);
    return { values: { roman: toRoman(n), arabic: n }, warnings: [] };
  },
  references: [{ title: 'Wikipedia: Roman numerals – standard form', url: 'https://en.wikipedia.org/wiki/Roman_numerals' }],
};
