/**
 * SI prefixes from quecto (10⁻³⁰) to quetta (10³⁰).
 */

import { SI_PREFIXES, englishPrefix, powerOfTen, unitTable } from '../../core/converter.js';

const SUPERSCRIPT = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };

/** @param {number} power */
function tenTo(power) {
  return `10${String(power).split('').map((char) => SUPERSCRIPT[/** @type {keyof typeof SUPERSCRIPT} */ (char)]).join('')}`;
}

const table = unitTable(SI_PREFIXES.map(([symbol, name, power]) => {
  const id = symbol === '' ? 'base' : symbol === 'µ' ? 'u' : /** @type {string} */ (symbol);
  const label = symbol === ''
    ? { cs: `bez předpony (${tenTo(0)})`, en: `no prefix (${tenTo(0)})` }
    : { cs: `${symbol} – ${name} (${tenTo(/** @type {number} */ (power))})`, en: `${symbol} – ${englishPrefix(/** @type {string} */ (name))} (${tenTo(/** @type {number} */ (power))})` };
  return [id, powerOfTen(/** @type {number} */ (power)), label];
}), { defaultUnit: 'k', defaultValue: 1, min: null });

export default {
  id: 'si-prefix',
  kind: 'converter',
  category: 'units-basic',
  tags: [],
  name: { cs: 'Předpony SI', en: 'SI prefixes' },
  description: {
    cs: 'Převod mezi všemi předponami soustavy SI od quekto (10⁻³⁰) po quetta (10³⁰), platí pro libovolnou jednotku: zadejte např. 1 k (kilo) a uvidíte 1000 bez předpony nebo 0,001 M (mega). Předpony ronna, quetta, ronto a quekto platí od roku 2022.',
    en: 'Converts between all SI prefixes from quecto (10⁻³⁰) to quetta (10³⁰), for any unit: enter e.g. 1 k (kilo) to see 1000 without a prefix or 0.001 M (mega). The prefixes ronna, quetta, ronto and quecto have been in use since 2022.',
  },
  keywords: {
    cs: ['předpony', 'předpona si', 'kilo', 'mega', 'giga', 'tera', 'mili', 'mikro', 'nano', 'piko', 'quetta', 'quekto', 'násobky'],
    en: ['si prefix', 'metric prefix', 'kilo', 'mega', 'giga', 'tera', 'milli', 'micro', 'nano', 'pico', 'quetta', 'quecto', 'multiples'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'BIPM: The International System of Units (SI Brochure), 9th ed., table 7 – SI prefixes (2022 update)', url: 'https://www.bipm.org/en/publications/si-brochure' },
  ],
};
