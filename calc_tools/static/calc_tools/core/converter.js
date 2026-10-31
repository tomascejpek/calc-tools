/**
 * Builds converters whose units differ only by a factor from compact tables.
 * @module core/converter
 */

import { factorConversion } from './units.js';

/** @typedef {import('./i18n.js').Text} Text */

/**
 * @typedef {[id: string, factor: number, label: string | Text, extra?: Record<string, any>]} UnitRow
 *   factor is the size of one unit in the base unit
 */

/** Significant digits shown by default for general converters. */
export const DEFAULT_SIGNIFICANT = 6;

/**
 * Turns compact rows into unit descriptors and toBase/fromBase functions.
 * @param {UnitRow[]} rows
 * @param {{ defaultUnit: string, defaultValue: number, min?: number | null, significant?: number }} options
 *   min defaults to 0; null allows negative values
 */
export function unitTable(rows, { defaultUnit, defaultValue, min = 0, significant = DEFAULT_SIGNIFICANT }) {
  /** @type {Record<string, number>} */
  const factors = {};
  const units = rows.map(([id, factor, label, extra = {}]) => {
    factors[id] = factor;
    return {
      id,
      label: typeof label === 'string' ? { cs: label, en: label } : label,
      significant,
      ...(min === null ? {} : { min }),
      ...(id === defaultUnit ? { default: defaultValue } : {}),
      ...extra,
    };
  });
  return { units, factors, ...factorConversion(factors) };
}

/** SI prefixes from quecto to quetta: symbol, name and power of ten. */
export const SI_PREFIXES = [
  ['Q', 'quetta', 30], ['R', 'ronna', 27], ['Y', 'yotta', 24], ['Z', 'zetta', 21], ['E', 'exa', 18],
  ['P', 'peta', 15], ['T', 'tera', 12], ['G', 'giga', 9], ['M', 'mega', 6], ['k', 'kilo', 3],
  ['h', 'hekto', 2], ['da', 'deka', 1], ['', '', 0], ['d', 'deci', -1], ['c', 'centi', -2],
  ['m', 'mili', -3], ['µ', 'mikro', -6], ['n', 'nano', -9], ['p', 'piko', -12], ['f', 'femto', -15],
  ['a', 'atto', -18], ['z', 'zepto', -21], ['y', 'yokto', -24], ['r', 'ronto', -27], ['q', 'quekto', -30],
];

/** English names of the prefixes where they differ from the Czech ones. */
const ENGLISH_PREFIX = { hekto: 'hecto', deka: 'deca', mili: 'milli', mikro: 'micro', piko: 'pico', yokto: 'yocto', quekto: 'quecto' };

/**
 * 10 to a power, exact for negative powers too (1e-3 rather than 0.0010000000000000002).
 * @param {number} power
 */
export function powerOfTen(power) {
  return Number(`1e${power}`);
}

/**
 * Unit rows of a symbol with the chosen SI prefixes, e.g. mV, V, kV.
 * @param {string} symbol
 * @param {string[]} prefixes prefix symbols, '' for none
 * @returns {UnitRow[]}
 */
export function prefixedRows(symbol, prefixes) {
  return prefixes.map((prefix) => {
    const row = SI_PREFIXES.find(([candidate]) => candidate === prefix);
    if (!row) throw new Error(`Unknown SI prefix ${prefix}`);
    return [`${prefix === 'µ' ? 'u' : prefix}${symbol}`, powerOfTen(/** @type {number} */ (row[2])), `${prefix}${symbol}`];
  });
}

/**
 * English name of a Czech prefix name.
 * @param {string} name
 */
export function englishPrefix(name) {
  return ENGLISH_PREFIX[/** @type {keyof typeof ENGLISH_PREFIX} */ (name)] ?? name;
}
