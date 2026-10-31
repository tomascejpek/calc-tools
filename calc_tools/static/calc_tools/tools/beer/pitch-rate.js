/**
 * Yeast pitch rate: cells needed and how many packs or grams that is.
 */

import { readGravities, scaleInput } from '../../core/gravity.js';
import { emptyResult, readInputs } from '../../core/tool.js';
import { yeastViability } from './yeast-viability.js';

/** Typical pitch rates, million cells per ml per °P. */
export const PITCH_RATES = { ale: 0.75, hybrid: 1.0, lager: 1.5 };

/**
 * Billions of cells for a batch: rate (million/ml/°P) × ml × °P / 1000.
 * @param {number} rate million cells per ml per °P
 * @param {number} litres
 * @param {number} plato
 */
export function cellsNeeded(rate, litres, plato) {
  return rate * litres * plato;
}

const inputs = [
  { id: 'volume', type: 'number', default: 20, min: 0.1, max: 100000, step: 0.5, unit: 'l', label: { cs: 'Objem mladiny', en: 'Wort volume' } },
  scaleInput('plato'),
  { id: 'gravity', type: 'number', default: 12, step: 0.1, label: { cs: 'Stupňovitost mladiny', en: 'Wort gravity' } },
  {
    id: 'style', type: 'select', default: 'ale', label: { cs: 'Typ kvašení', en: 'Fermentation' },
    options: [
      { value: 'ale', label: { cs: `svrchní – ${String(PITCH_RATES.ale).replace('.', ',')} mil./ml/°P`, en: `ale – ${PITCH_RATES.ale} M/ml/°P` } },
      { value: 'hybrid', label: { cs: `hybridní – ${String(PITCH_RATES.hybrid).replace('.', ',')} mil./ml/°P`, en: `hybrid – ${PITCH_RATES.hybrid} M/ml/°P` } },
      { value: 'lager', label: { cs: `spodní (ležák) – ${String(PITCH_RATES.lager).replace('.', ',')} mil./ml/°P`, en: `lager – ${PITCH_RATES.lager} M/ml/°P` } },
      { value: 'custom', label: { cs: 'zadám sám', en: 'custom' } },
    ],
  },
  { id: 'rate', type: 'number', default: 1, min: 0.1, max: 5, step: 0.05, unit: { cs: 'mil./ml/°P', en: 'M/ml/°P' }, label: { cs: 'Vlastní dávka', en: 'Custom rate' } },
  { id: 'packCells', type: 'number', default: 100, min: 1, max: 10000, step: 1, unit: { cs: 'mld.', en: 'billion' }, label: { cs: 'Buněk v balení tekutých kvasnic', en: 'Cells per pack of liquid yeast' } },
  { id: 'packAge', type: 'number', default: 30, min: 0, max: 3650, step: 1, unit: { cs: 'dní', en: 'days' }, label: { cs: 'Stáří tekutých kvasnic', en: 'Age of liquid yeast' } },
  { id: 'dryCells', type: 'number', default: 10, min: 1, max: 50, step: 1, unit: { cs: 'mld./g', en: 'billion/g' }, label: { cs: 'Buněk v gramu sušených kvasnic', en: 'Cells per gram of dry yeast' } },
];

const outputs = [
  { id: 'cells', label: { cs: 'Potřeba buněk', en: 'Cells needed' }, unit: { cs: 'mld.', en: 'billion' }, precision: 0 },
  { id: 'dryGrams', label: { cs: 'Sušených kvasnic', en: 'Dry yeast' }, unit: 'g', precision: 0 },
  { id: 'packs', label: { cs: 'Balení tekutých kvasnic', en: 'Packs of liquid yeast' }, unit: '', precision: 1 },
  { id: 'rate', label: { cs: 'Použitá dávka', en: 'Rate used' }, unit: { cs: 'mil./ml/°P', en: 'M/ml/°P' }, precision: 2 },
];

export default {
  id: 'pitch-rate',
  kind: 'calculator',
  category: 'yeast',
  tags: ['beer'],
  name: { cs: 'Zákvasná dávka kvasnic', en: 'Yeast pitch rate' },
  description: {
    cs: 'Kolik kvasnic zakvasit: počet buněk = dávka (miliony buněk na ml a °P) × objem × stupňovitost. Svrchní kvasnice obvykle 0,75, spodní 1,5 milionu na ml a °P. Přepočítá potřebu na gramy sušených kvasnic a na balení tekutých podle jejich stáří.',
    en: 'How much yeast to pitch: cells = rate (million cells per ml per °P) × volume × gravity. Ale yeast usually 0.75, lager yeast 1.5 million per ml per °P. Converts the need to grams of dry yeast and to packs of liquid yeast by their age.',
  },
  keywords: {
    cs: ['kvasnice', 'zakvašení', 'zákvasná dávka', 'pitch rate', 'buňky', 'sušené kvasnice', 'tekuté kvasnice', 'ležák', 'ale'],
    en: ['pitch rate', 'pitching rate', 'yeast', 'cells', 'dry yeast', 'liquid yeast', 'lager', 'ale'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const gravity = readGravities(inputs, read.values, ['gravity']);
    if (gravity.warnings.length) return emptyResult(outputs, gravity.warnings);
    const { volume, style, packCells, packAge, dryCells } = read.values;
    const rate = style === 'custom' ? read.values.rate : PITCH_RATES[/** @type {keyof typeof PITCH_RATES} */ (style)];
    const plato = Math.max(0, gravity.plato.gravity);
    const cells = cellsNeeded(rate, volume, plato);
    const viable = packCells * yeastViability(packAge) / 100;
    const warnings = viable <= 0
      ? [{ cs: 'Tekuté kvasnice tohoto stáří už nejsou životaschopné.', en: 'Liquid yeast of this age is no longer viable.' }]
      : [];
    return { values: { cells, dryGrams: cells / dryCells, packs: viable > 0 ? cells / viable : null, rate }, warnings };
  },
  references: [
    { title: 'White, C., Zainasheff, J.: Yeast – The Practical Guide to Beer Fermentation. Brewers Publications, 2010 – pitch rates 0.75 / 1.5 million cells/ml/°P' },
    { title: 'Fermentis: dry yeast contains more than 6 billion viable cells per gram (technical data sheets)' },
  ],
};
