/**
 * Lactic or phosphoric acid to lower the pH of brewing water.
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { CACO3_EQ, acidCharge, acidToTargetPh } from '../../core/water.js';
import { ALKALINITY_INPUTS, alkalinityAsCaco3 } from './residual-alkalinity.js';

/**
 * Acids sold to brewers: mass fraction, density (g/ml), molar mass and pKa.
 */
export const ACIDS = {
  lactic80: { fraction: 0.80, density: 1.18, molar: 90.08, pKas: [3.86] },
  lactic88: { fraction: 0.88, density: 1.21, molar: 90.08, pKas: [3.86] },
  phosphoric10: { fraction: 0.10, density: 1.05, molar: 97.995, pKas: [2.15, 7.20, 12.35] },
  phosphoric75: { fraction: 0.75, density: 1.57, molar: 97.995, pKas: [2.15, 7.20, 12.35] },
  phosphoric85: { fraction: 0.85, density: 1.685, molar: 97.995, pKas: [2.15, 7.20, 12.35] },
};

/**
 * mEq of acid that one ml of the solution gives at the target pH.
 * @param {keyof typeof ACIDS} id
 * @param {number} pH
 */
export function acidMeqPerMl(id, pH) {
  const acid = ACIDS[id];
  return acid.density * acid.fraction / acid.molar * 1000 * acidCharge(acid.pKas, pH);
}

const inputs = [
  { id: 'volume', type: 'number', default: 20, min: 0.1, max: 100000, step: 0.5, unit: 'l', label: { cs: 'Objem vody', en: 'Water volume' } },
  ...ALKALINITY_INPUTS,
  { id: 'ph', type: 'number', default: 7.5, min: 6, max: 9.5, step: 0.1, label: { cs: 'pH vody', en: 'Water pH' } },
  { id: 'target', type: 'number', default: 5.6, min: 4, max: 7, step: 0.1, label: { cs: 'Cílové pH', en: 'Target pH' } },
  {
    id: 'acid', type: 'select', default: 'lactic80', label: { cs: 'Kyselina', en: 'Acid' },
    options: [
      { value: 'lactic80', label: { cs: 'mléčná 80 %', en: 'lactic 80 %' } },
      { value: 'lactic88', label: { cs: 'mléčná 88 %', en: 'lactic 88 %' } },
      { value: 'phosphoric10', label: { cs: 'fosforečná 10 %', en: 'phosphoric 10 %' } },
      { value: 'phosphoric75', label: { cs: 'fosforečná 75 %', en: 'phosphoric 75 %' } },
      { value: 'phosphoric85', label: { cs: 'fosforečná 85 %', en: 'phosphoric 85 %' } },
    ],
  },
];

const outputs = [
  { id: 'ml', label: { cs: 'Přidat kyseliny', en: 'Acid to add' }, unit: 'ml', precision: 1 },
  { id: 'mlPerLitre', label: { cs: 'Kyseliny na litr', en: 'Acid per litre' }, unit: 'ml/l', precision: 3 },
  { id: 'meq', label: { cs: 'Neutralizovaná alkalita', en: 'Alkalinity neutralised' }, unit: 'mEq/l', precision: 2 },
];

export default {
  id: 'water-acidification',
  kind: 'calculator',
  category: 'water-chemistry',
  tags: ['beer'],
  name: { cs: 'Okyselení vody kyselinou', en: 'Water acidification' },
  description: {
    cs: 'Kolik kyseliny mléčné nebo fosforečné přidat do vody (typicky vyslazovací), aby klesla na cílové pH. Počítá rovnováhu uhličitanů v uzavřené nádobě: z alkality a pH vody určí obsah uhličitanů a spočítá, kolik kyseliny je třeba na cílové pH. Kyselina mléčná nad asi 1 ml/l může být cítit.',
    en: 'How much lactic or phosphoric acid to add to water (typically sparge water) to bring it down to a target pH. Solves the carbonate equilibrium in a closed vessel: works out the carbonate content from the alkalinity and pH of the water and the acid needed to reach the target pH. Lactic acid above about 1 ml/l may be tasted.',
  },
  keywords: {
    cs: ['kyselina mléčná', 'kyselina fosforečná', 'okyselení', 'ph', 'vyslazovací voda', 'alkalita', 'úprava vody'],
    en: ['lactic acid', 'phosphoric acid', 'acidification', 'sparge water', 'ph', 'alkalinity', 'water treatment'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { volume, alkalinity, alkalinityUnit, ph, target, acid } = read.values;
    if (target >= ph) {
      return emptyResult(outputs, [{ cs: 'Cílové pH musí být nižší než pH vody.', en: 'The target pH must be below the water pH.' }]);
    }
    const alk = alkalinityAsCaco3(alkalinity, alkalinityUnit) / CACO3_EQ;
    const meq = Math.max(0, acidToTargetPh(alk, ph, target));
    const mlPerLitre = meq / acidMeqPerMl(acid, target);
    const warnings = acid.startsWith('lactic') && mlPerLitre > 1
      ? [{ cs: 'Tolik kyseliny mléčné může být v pivu cítit; zvažte fosforečnou.', en: 'This much lactic acid may be tasted; consider phosphoric acid.' }]
      : [];
    return { values: { ml: mlPerLitre * volume, mlPerLitre, meq }, warnings };
  },
  references: [
    { title: 'Troester, K.: Sparge water acidification (braukaiser.com) – carbonate equilibrium method' },
    { title: 'Palmer, J., Kaminski, C.: Water – A Comprehensive Guide for Brewers. Brewers Publications, 2013' },
    { title: 'Wikipedia: Carbonic acid (pKa 6.35, 10.33), Lactic acid (pKa 3.86), Phosphoric acid (pKa 2.15, 7.20, 12.35)', url: 'https://en.wikipedia.org/wiki/Phosphoric_acid' },
  ],
};
