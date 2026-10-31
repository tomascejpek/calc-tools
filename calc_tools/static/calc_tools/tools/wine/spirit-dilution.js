/**
 * Diluting spirit with water to a target strength, including volume
 * contraction.
 */

import { massFractionFromAbv, mixtureDensity } from '../../core/ethanol.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Water needed to dilute spirit, by mass balance of ethanol with densities
 * from the International Alcoholometric Tables, so the contraction of
 * water–ethanol mixtures is included. Volumes at 20 °C.
 * @param {number} litres spirit
 * @param {number} abv % vol of the spirit
 * @param {number} targetAbv % vol, above zero and at most abv
 * @returns {{ water: number, finalVolume: number } | null} litres
 */
export function dilute(litres, abv, targetAbv) {
  const p1 = massFractionFromAbv(abv);
  const p2 = massFractionFromAbv(targetAbv);
  if (p1 === null || p2 === null || p2 <= 0) return null;
  const mass = litres * mixtureDensity(p1, 20);
  const finalMass = mass * p1 / p2;
  return {
    water: (finalMass - mass) / mixtureDensity(0, 20),
    finalVolume: finalMass / mixtureDensity(p2, 20),
  };
}

const inputs = [
  { id: 'volume', type: 'number', default: 1, min: 0.001, max: 1000000, step: 0.1, unit: 'l', label: { cs: 'Objem destilátu', en: 'Spirit volume' } },
  { id: 'abv', type: 'number', default: 70, min: 0.1, max: 100, step: 0.1, unit: { cs: '% obj.', en: '% ABV' }, label: { cs: 'Současná síla', en: 'Current strength' } },
  { id: 'target', type: 'number', default: 45, min: 0.1, max: 100, step: 0.1, unit: { cs: '% obj.', en: '% ABV' }, label: { cs: 'Cílová síla', en: 'Target strength' } },
];

const outputs = [
  { id: 'water', label: { cs: 'Přidat vody', en: 'Water to add' }, unit: 'l', precision: 3 },
  { id: 'finalVolume', label: { cs: 'Výsledný objem', en: 'Final volume' }, unit: 'l', precision: 3 },
  { id: 'simpleWater', label: { cs: 'Voda podle prostého poměru (bez kontrakce)', en: 'Water by simple ratio (no contraction)' }, unit: 'l', precision: 3 },
];

export default {
  id: 'spirit-dilution',
  kind: 'calculator',
  category: 'wine',
  tags: ['spirits'],
  name: { cs: 'Ředění destilátu', en: 'Diluting spirit' },
  description: {
    cs: 'Kolik vody přidat do destilátu pro cílovou sílu v % obj. Směs vody a alkoholu má menší objem než součet obou (kontrakce), proto výpočet vychází z hmotnosti alkoholu a hustot podle mezinárodních alkoholometrických tabulek. Objemy platí při 20 °C. Pro srovnání ukáže i prostý poměr, který vody podhodnotí.',
    en: 'How much water to add to spirit for a target strength in % ABV. A water–alcohol mix takes less volume than the sum of its parts (contraction), so the calculation uses the mass of alcohol and densities from the International Alcoholometric Tables. Volumes are at 20 °C. For comparison it also shows the simple ratio, which underestimates the water.',
  },
  keywords: {
    cs: ['ředění', 'destilát', 'pálenka', 'slivovice', 'lihovina', 'síla', 'voda', 'kontrakce', 'alkohol', 'stáčecí síla'],
    en: ['dilution', 'proofing', 'spirit', 'distillate', 'brandy', 'water', 'contraction', 'abv', 'bottling strength'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { volume, abv, target } = read.values;
    if (target > abv) {
      return emptyResult(outputs, [{ cs: 'Cílová síla musí být nižší než současná.', en: 'The target strength must be below the current one.' }]);
    }
    const result = dilute(volume, abv, target);
    if (result === null) return emptyResult(outputs, [{ cs: 'Výpočet se nezdařil.', en: 'The calculation failed.' }]);
    return { values: { ...result, simpleWater: volume * (abv / target - 1) }, warnings: [] };
  },
  references: [
    { title: 'OIML R 22 International Alcoholometric Tables, formula as in Council Directive 76/766/EEC', url: 'https://eur-lex.europa.eu/eli/dir/1976/766/oj/eng' },
  ],
};
