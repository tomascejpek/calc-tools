/**
 * Acid dissociation constant: Ka ⇄ pKa, with the conjugate Kb ⇄ pKb.
 */

/** pKw at 25 °C. */
const PKW = 14;

const TO_PKA = {
  ka: (/** @type {number} */ v) => (v > 0 ? -Math.log10(v) : null),
  pka: (/** @type {number} */ v) => v,
  kb: (/** @type {number} */ v) => (v > 0 ? PKW + Math.log10(v) : null),
  pkb: (/** @type {number} */ v) => PKW - v,
};

const FROM_PKA = {
  ka: (/** @type {number} */ v) => 10 ** -v,
  pka: (/** @type {number} */ v) => v,
  kb: (/** @type {number} */ v) => 10 ** -(PKW - v),
  pkb: (/** @type {number} */ v) => PKW - v,
};

export default {
  id: 'dissociation-constant',
  kind: 'converter',
  category: 'chemistry-ph',
  tags: ['chemistry'],
  name: { cs: 'Disociační konstanta (Ka ⇄ pKa)', en: 'Dissociation constant (Ka ⇄ pKa)' },
  description: {
    cs: 'Převod disociační konstanty kyseliny Ka na pKa = −log Ka a na konstantu konjugované zásady: Ka · Kb = Kw, pKa + pKb = 14 (při 25 °C). Čím menší pKa, tím silnější kyselina.',
    en: 'Converts an acid dissociation constant Ka to pKa = −log Ka and to the constant of the conjugate base: Ka · Kb = Kw, pKa + pKb = 14 (at 25 °C). The smaller the pKa, the stronger the acid.',
  },
  keywords: {
    cs: ['disociační konstanta', 'ka', 'pka', 'kb', 'pkb', 'konjugovaná zásada', 'síla kyseliny'],
    en: ['dissociation constant', 'ka', 'pka', 'kb', 'pkb', 'conjugate base', 'acid strength'],
  },
  units: [
    { id: 'pka', default: 4.76, label: { cs: 'pKa', en: 'pKa' }, precision: 3, min: -10, max: 30 },
    { id: 'ka', label: { cs: 'Ka', en: 'Ka' }, significant: 4, min: 0 },
    { id: 'pkb', label: { cs: 'pKb (konjugované zásady)', en: 'pKb (of the conjugate base)' }, precision: 3, min: -16, max: 24 },
    { id: 'kb', label: { cs: 'Kb (konjugované zásady)', en: 'Kb (of the conjugate base)' }, significant: 4, min: 0 },
  ],
  // Base unit: pKa
  toBase(value, unitId) {
    return Object.hasOwn(TO_PKA, unitId) ? TO_PKA[/** @type {keyof typeof TO_PKA} */ (unitId)](value) : null;
  },
  fromBase(value, unitId) {
    return Object.hasOwn(FROM_PKA, unitId) ? FROM_PKA[/** @type {keyof typeof FROM_PKA} */ (unitId)](value) : null;
  },
  references: [{ title: 'Harris, D. C.: Quantitative Chemical Analysis – Ka, Kb and Kw' }],
};
