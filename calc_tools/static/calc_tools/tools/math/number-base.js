/**
 * Whole numbers between bases 2 to 36, of any length.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';

/**
 * Parses a whole number in a base, ignoring spaces, underscores and a 0x/0b/0o prefix matching the base.
 * @param {string} text
 * @param {number} base 2–36
 * @returns {bigint | null} null for a digit outside the base
 */
export function parseInBase(text, base) {
  let body = text.toLowerCase().replace(/[\s_]/g, '');
  const negative = body.startsWith('-');
  if (negative || body.startsWith('+')) body = body.slice(1);
  const prefix = { 16: '0x', 8: '0o', 2: '0b' }[/** @type {16 | 8 | 2} */ (base)];
  if (prefix && body.startsWith(prefix)) body = body.slice(2);
  if (!body) return null;
  let value = 0n;
  const big = BigInt(base);
  for (const char of body) {
    const digit = DIGITS.indexOf(char);
    if (digit < 0 || digit >= base) return null;
    value = value * big + BigInt(digit);
  }
  return negative ? -value : value;
}

/**
 * @param {bigint} value
 * @param {number} base 2–36
 */
export function toBase(value, base) {
  const sign = value < 0n ? '-' : '';
  return sign + (value < 0n ? -value : value).toString(base).toUpperCase();
}

const inputs = [
  {
    id: 'value', type: 'text', default: 'FF', maxLength: 300, pattern: /^[-+]?[0-9a-zA-Z_ ]+$/,
    hint: { cs: 'Číslice 0–9 a písmena A–Z, případně znaménko.', en: 'Digits 0–9 and letters A–Z, optionally a sign.' },
    label: { cs: 'Číslo', en: 'Number' },
  },
  { id: 'from', type: 'number', default: 16, min: 2, max: 36, step: 1, label: { cs: 'Ze soustavy (základ)', en: 'From base' } },
  { id: 'to', type: 'number', default: 36, min: 2, max: 36, step: 1, label: { cs: 'Do soustavy (základ)', en: 'To base' } },
];

const outputs = [
  { id: 'binary', type: 'text', label: { cs: 'Dvojková (2)', en: 'Binary (2)' } },
  { id: 'octal', type: 'text', label: { cs: 'Osmičková (8)', en: 'Octal (8)' } },
  { id: 'decimal', type: 'text', label: { cs: 'Desítková (10)', en: 'Decimal (10)' } },
  { id: 'hexadecimal', type: 'text', label: { cs: 'Šestnáctková (16)', en: 'Hexadecimal (16)' } },
  { id: 'target', type: 'text', label: { cs: 'Zvolená soustava', en: 'Chosen base' } },
];

export default {
  id: 'number-base',
  kind: 'calculator',
  category: 'math-numbers',
  tags: ['math'],
  name: { cs: 'Převod číselných soustav', en: 'Number base converter' },
  description: {
    cs: 'Převod celého čísla libovolné délky mezi soustavami o základu 2 až 36: dvojkovou, osmičkovou, desítkovou, šestnáctkovou i jakoukoli jinou. Číslice nad 9 se píší písmeny A–Z; mezery a podtržítka se ignorují, předpony 0x, 0o a 0b jsou povolené.',
    en: 'Converts a whole number of any length between bases 2 to 36: binary, octal, decimal, hexadecimal and any other. Digits above 9 are letters A–Z; spaces and underscores are ignored, the prefixes 0x, 0o and 0b are allowed.',
  },
  keywords: {
    cs: ['číselné soustavy', 'dvojková', 'binární', 'osmičková', 'šestnáctková', 'hexadecimální', 'desítková', 'převod soustav', 'základ'],
    en: ['number base', 'radix', 'binary', 'octal', 'hexadecimal', 'hex', 'decimal', 'base conversion'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { value, from, to } = read.values;
    if (!Number.isInteger(from) || !Number.isInteger(to)) {
      return emptyResult(outputs, [{ cs: 'Základ soustavy musí být celé číslo.', en: 'The base must be a whole number.' }]);
    }
    const number = parseInBase(value, from);
    if (number === null) {
      return emptyResult(outputs, [{ cs: `Číslo obsahuje číslici, která v soustavě o základu ${from} není.`, en: `The number has a digit that does not exist in base ${from}.` }]);
    }
    return {
      values: {
        binary: toBase(number, 2), octal: toBase(number, 8), decimal: toBase(number, 10), hexadecimal: toBase(number, 16), target: toBase(number, to),
      },
      warnings: [],
    };
  },
  references: [{ title: 'Wikipedia: Positional notation', url: 'https://en.wikipedia.org/wiki/Positional_notation' }],
};
