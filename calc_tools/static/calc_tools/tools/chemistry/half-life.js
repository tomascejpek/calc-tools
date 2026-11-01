/**
 * Half-life of radioactive decay and reactions of order 0, 1 and 2.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Amount left after time t for a reaction of the given order with half-life
 * measured from the initial amount a0.
 * @param {0 | 1 | 2} order
 * @param {number} a0
 * @param {number} halfLife
 * @param {number} t same unit as halfLife
 */
export function remaining(order, a0, halfLife, t) {
  if (order === 1) return a0 * 2 ** (-t / halfLife);
  if (order === 0) return Math.max(0, a0 - a0 / (2 * halfLife) * t);
  return a0 / (1 + t / halfLife);
}

const UNITS = [
  { value: 's', label: { cs: 'sekundy', en: 'seconds' } },
  { value: 'min', label: { cs: 'minuty', en: 'minutes' } },
  { value: 'h', label: { cs: 'hodiny', en: 'hours' } },
  { value: 'd', label: { cs: 'dny', en: 'days' } },
  { value: 'yr', label: { cs: 'roky', en: 'years' } },
];

const inputs = [
  {
    id: 'order', type: 'select', default: '1', label: { cs: 'Řád reakce', en: 'Reaction order' },
    options: [
      { value: '1', label: { cs: '1. řád (radioaktivní rozpad, většina rozkladů)', en: '1st order (radioactive decay, most decompositions)' } },
      { value: '0', label: { cs: '0. řád (stálá rychlost)', en: '0th order (constant rate)' } },
      { value: '2', label: { cs: '2. řád', en: '2nd order' } },
    ],
  },
  { id: 'halfLife', type: 'number', default: 5730, min: 1e-30, max: 1e30, step: 1, label: { cs: 'Poločas (pro počáteční množství)', en: 'Half-life (for the initial amount)' } },
  { id: 'time', type: 'number', default: 10000, min: 0, max: 1e30, step: 1, label: { cs: 'Uplynulý čas (stejná jednotka)', en: 'Elapsed time (same unit)' } },
  { id: 'unit', type: 'select', default: 'yr', label: { cs: 'Jednotka času', en: 'Time unit' }, options: UNITS },
  { id: 'initial', type: 'number', default: 100, min: 0, max: 1e30, step: 1, label: { cs: 'Počáteční množství (g, mol, Bq, %…)', en: 'Initial amount (g, mol, Bq, %…)' } },
];

const outputs = [
  { id: 'remaining', label: { cs: 'Zbývá', en: 'Remaining' }, significant: 6 },
  { id: 'fraction', label: { cs: 'Zbývající podíl', en: 'Remaining share' }, unit: '%', significant: 6 },
  { id: 'halvings', label: { cs: 'Počet poločasů', en: 'Number of half-lives' }, significant: 6 },
  { id: 'rateConstant', label: { cs: 'Rychlostní konstanta 1. řádu ln 2 / t½ (za jednotku času)', en: 'First-order rate constant ln 2 / t½ (per time unit)' }, significant: 6 },
];

export default {
  id: 'half-life',
  kind: 'calculator',
  category: 'chemistry-kinetics',
  tags: ['chemistry'],
  name: { cs: 'Poločas rozpadu a reakce', en: 'Half-life of decay and reactions' },
  description: {
    cs: 'Kolik látky zbude po daném čase podle poločasu. U radioaktivního rozpadu a reakcí 1. řádu je poločas stálý: N = N₀ · 2^(−t/t½); uhlík ¹⁴C (5730 let) klesne za 10 000 let asi na 30 %. U reakcí 0. a 2. řádu se poločas mění s koncentrací, proto platí pro zadané počáteční množství.',
    en: 'How much substance is left after a time by its half-life. For radioactive decay and first-order reactions the half-life is constant: N = N₀ · 2^(−t/t½); carbon-14 (5730 years) falls to about 30 % in 10,000 years. For zero and second order the half-life changes with concentration, so it applies to the given initial amount.',
  },
  keywords: {
    cs: ['poločas rozpadu', 'poločas', 'radioaktivita', 'rozpad', 'kinetika', 'řád reakce', 'uhlík 14', 'datování'],
    en: ['half-life', 'radioactive decay', 'decay', 'kinetics', 'reaction order', 'carbon 14', 'dating', 'first order'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { halfLife, time, initial } = read.values;
    const order = /** @type {0 | 1 | 2} */ (Number(read.values.order));
    const left = remaining(order, initial, halfLife, time);
    return {
      values: { remaining: left, fraction: initial > 0 ? left / initial * 100 : 0, halvings: time / halfLife, rateConstant: Math.LN2 / halfLife },
      warnings: [],
    };
  },
  references: [
    { title: 'Atkins, P., de Paula, J.: Physical Chemistry – integrated rate laws and half-lives' },
    { title: 'NIST: Radionuclide half-life measurements (¹⁴C 5730 a)', url: 'https://www.nist.gov/pml/radionuclide-half-life-measurements' },
  ],
};
