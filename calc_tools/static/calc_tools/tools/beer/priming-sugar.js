/**
 * Priming sugar for bottle conditioning.
 */

import { CO2_G_PER_L_PER_VOLUME, celsiusToFahrenheit } from '../../core/units.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Grams of CO₂ released by fermenting one gram of each sugar.
 * Sucrose: C₁₂H₂₂O₁₁ + H₂O → 4 C₂H₅OH + 4 CO₂ (4 × 44.01 / 342.30).
 * Glucose as sold (monohydrate): 2 × 44.01 / 198.17.
 * Honey: about 82 % fermentable sugars (glucose and fructose, 2 × 44.01 / 180.16).
 * Dry malt extract: about 68 % fermentable as sucrose equivalent.
 */
export const CO2_YIELD = {
  sucrose: 4 * 44.01 / 342.30,
  glucose: 2 * 44.01 / 198.17,
  dme: 0.68 * 4 * 44.01 / 342.30,
  honey: 0.82 * 2 * 44.01 / 180.16,
};

/**
 * CO₂ volumes left in beer after fermentation at 1 atm.
 * @param {number} celsius highest beer temperature after fermentation
 */
export function residualCo2(celsius) {
  const f = celsiusToFahrenheit(celsius);
  return 3.0378 - 0.050062 * f + 0.00026555 * f ** 2;
}

/**
 * Priming sugar in g/l.
 * @param {number} targetVolumes
 * @param {number} celsius
 * @param {keyof typeof CO2_YIELD} [sugar]
 */
export function primingSugarPerLitre(targetVolumes, celsius, sugar = 'sucrose') {
  const missing = Math.max(0, targetVolumes - residualCo2(celsius));
  return missing * CO2_G_PER_L_PER_VOLUME / CO2_YIELD[sugar];
}

const inputs = [
  { id: 'volumes', type: 'number', default: 2.5, min: 0, max: 6, step: 0.1, unit: { cs: 'obj. CO₂', en: 'vol. CO₂' }, label: { cs: 'Cílové nasycení', en: 'Target carbonation' } },
  { id: 'beer', type: 'number', default: 20, min: 0, max: 100000, step: 0.5, unit: 'l', label: { cs: 'Objem piva', en: 'Beer volume' } },
  { id: 'temperature', type: 'number', default: 18, min: -2, max: 35, step: 0.5, unit: '°C', label: { cs: 'Nejvyšší teplota piva po kvašení', en: 'Highest beer temperature after fermentation' } },
  {
    id: 'sugar', type: 'select', default: 'sucrose', label: { cs: 'Cukr', en: 'Sugar' },
    options: [
      { value: 'sucrose', label: { cs: 'sacharóza (řepný, třtinový cukr)', en: 'sucrose (table sugar)' } },
      { value: 'glucose', label: { cs: 'glukóza (hroznový cukr)', en: 'glucose (dextrose, corn sugar)' } },
      { value: 'dme', label: { cs: 'sušený sladový extrakt', en: 'dry malt extract' } },
      { value: 'honey', label: { cs: 'med', en: 'honey' } },
    ],
  },
];

const outputs = [
  { id: 'total', label: { cs: 'Cukr celkem', en: 'Total sugar' }, unit: 'g', precision: 0 },
  { id: 'perLitre', label: { cs: 'Cukr na litr', en: 'Sugar per litre' }, unit: 'g/l', precision: 1 },
  { id: 'residual', label: { cs: 'Zbytkový CO₂ v pivu', en: 'Residual CO₂ in beer' }, unit: { cs: 'obj. CO₂', en: 'vol. CO₂' }, precision: 2 },
];

export default {
  id: 'priming-sugar',
  kind: 'calculator',
  category: 'beer',
  tags: ['beer'],
  name: { cs: 'Cukr do lahví (nacukrování)', en: 'Priming sugar' },
  description: {
    cs: 'Kolik cukru přidat při stáčení do lahví pro požadované nasycení. Zohledňuje CO₂, který v pivu zůstal po kvašení (podle nejvyšší teploty piva), a druh cukru: glukóza se počítá jako monohydrát, med s 82 % zkvasitelných cukrů, sladový extrakt s 68 %.',
    en: 'How much sugar to add when bottling for the desired carbonation. Accounts for CO₂ left in the beer after fermentation (by the highest beer temperature) and the kind of sugar: glucose as monohydrate, honey with 82 % fermentable sugars, malt extract with 68 %.',
  },
  keywords: {
    cs: ['nacukrování', 'refermentace', 'dokvašení v lahvi', 'sycení', 'cukr', 'lahve', 'stáčení', 'glukóza', 'med', 'co2'],
    en: ['priming', 'priming sugar', 'bottle conditioning', 'carbonation', 'bottling', 'dextrose', 'corn sugar', 'honey', 'co2'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { volumes, beer, temperature, sugar } = read.values;
    const residual = residualCo2(temperature);
    const perLitre = primingSugarPerLitre(volumes, temperature, sugar);
    const warnings = [];
    if (volumes <= residual) {
      warnings.push({
        cs: 'Pivo už obsahuje tolik CO₂, kolik chcete; cukr není potřeba.',
        en: 'The beer already holds the target CO₂; no sugar is needed.',
      });
    }
    if (volumes > 3.5) {
      warnings.push({
        cs: 'Nad 3,5 objemu CO₂ používejte jen lahve určené pro vysoký tlak.',
        en: 'Above 3.5 volumes of CO₂ use only bottles rated for high pressure.',
      });
    }
    return { values: { total: perLitre * beer, perLitre, residual }, warnings };
  },
  references: [
    { title: 'Residual CO₂ at 1 atm: 3.0378 − 0.050062·T + 0.00026555·T² (T in °F), regression of CO₂ solubility data widely used in brewing calculators' },
    { title: 'Wikipedia: Sucrose (molar mass)', url: 'https://en.wikipedia.org/wiki/Sucrose' },
    { title: 'Wikipedia: Glucose (molar mass of the monohydrate)', url: 'https://en.wikipedia.org/wiki/Glucose' },
    { title: 'Wikipedia: Honey (composition)', url: 'https://en.wikipedia.org/wiki/Honey' },
  ],
};
