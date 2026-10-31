/**
 * Beer colour from a grain bill: MCU → SRM by Morey.
 */

import { emptyResult, readInputs, withDefaultItem } from '../../core/tool.js';
import { KG_PER_LB, L_PER_GAL, ebcToSrm, srmToEbc, srmToLovibond } from '../../core/units.js';

/**
 * Malt colour units: Σ lb × °L / gal.
 * @param {{ kg: number, lovibond: number }[]} malts
 * @param {number} litres
 */
export function maltColorUnits(malts, litres) {
  const gallons = litres / L_PER_GAL;
  return malts.reduce((sum, malt) => sum + malt.kg / KG_PER_LB * malt.lovibond, 0) / gallons;
}

/**
 * Beer colour by Morey: SRM = 1.4922 × MCU^0.6859.
 * @param {number} mcu
 */
export function moreySrm(mcu) {
  return 1.4922 * mcu ** 0.6859;
}

const inputs = [
  { id: 'volume', type: 'number', default: 20, min: 0.1, max: 100000, step: 0.5, unit: 'l', label: { cs: 'Objem piva', en: 'Beer volume' } },
  {
    id: 'scale', type: 'select', default: 'ebc', label: { cs: 'Barva sladu v', en: 'Malt colour in' },
    options: [
      { value: 'ebc', label: { cs: 'EBC', en: 'EBC' } },
      { value: 'lovibond', label: { cs: '°L (Lovibond)', en: '°L (Lovibond)' } },
    ],
  },
  {
    id: 'malts', type: 'list', min: 1, max: 20, label: { cs: 'Slad', en: 'Malt' },
    fields: [
      { id: 'kg', type: 'number', default: 4.5, min: 0, max: 10000, step: 0.1, unit: 'kg', label: { cs: 'Hmotnost', en: 'Weight' } },
      { id: 'color', type: 'number', default: 4, min: 0, max: 3000, step: 1, label: { cs: 'Barva sladu', en: 'Malt colour' } },
    ],
  },
];

const outputs = [
  { id: 'ebc', label: { cs: 'Barva piva', en: 'Beer colour' }, unit: 'EBC', precision: 0 },
  { id: 'srm', label: { cs: 'Barva piva', en: 'Beer colour' }, unit: 'SRM', precision: 1 },
  { id: 'mcu', label: { cs: 'MCU', en: 'MCU' }, unit: '', precision: 1 },
];

export default {
  id: 'recipe-color',
  kind: 'calculator',
  category: 'color',
  tags: ['beer'],
  name: { cs: 'Barva piva z receptu', en: 'Beer colour from a recipe' },
  description: {
    cs: 'Odhad barvy piva ze sypání: barevné jednotky sladu (MCU = lb × °L / gal) převedené na SRM podle Moreyho a na EBC. Odhad nezahrnuje tmavnutí při varu ani ztráty barvy kvašením, proto se od skutečnosti může lišit o několik EBC.',
    en: 'Estimated beer colour from the grain bill: malt colour units (MCU = lb × °L / gal) converted to SRM by Morey and to EBC. It ignores darkening in the boil and colour lost in fermentation, so it may differ from reality by a few EBC.',
  },
  keywords: {
    cs: ['barva', 'barva piva', 'ebc', 'srm', 'mcu', 'morey', 'sypání', 'slad', 'recept'],
    en: ['colour', 'color', 'beer color', 'ebc', 'srm', 'mcu', 'morey', 'grain bill', 'recipe'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, withDefaultItem(values, 'malts'));
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { volume, scale, malts } = read.values;
    const lovibond = (/** @type {number} */ color) => (scale === 'ebc' ? srmToLovibond(ebcToSrm(color)) : color);
    const mcu = maltColorUnits(
      malts.map((/** @type {any} */ malt) => ({ kg: malt.kg, lovibond: Math.max(0, lovibond(malt.color)) })),
      volume,
    );
    const srm = moreySrm(mcu);
    return { values: { ebc: srmToEbc(srm), srm, mcu }, warnings: [] };
  },
  references: [
    { title: 'Morey, D.: Approximating beer color – SRM = 1.4922 × MCU^0.6859 (1990s, widely used in brewing software)' },
    { title: 'Daniels, R.: Designing Great Beers. Brewers Publications, 1996 – malt colour units' },
  ],
};
