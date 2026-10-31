/**
 * Potential alcohol of must and sugar to add for a target strength.
 */

import { emptyResult, rangeWarning, readInputs } from '../../core/tool.js';
import mustGravity, { sugarGramsPerLitre } from './must-gravity.js';

/** Sugar fermenting to 1 % vol of alcohol, g/l (EU wine regulations). */
export const SUGAR_PER_PERCENT = 16.83;
/** Invert sugar formed from 1 g of sucrose (342.30 → 2 × 180.16). */
export const SUCROSE_TO_INVERT = 2 * 180.16 / 342.30;
/** Volume of 1 g of sucrose dissolved, ml. */
export const SUCROSE_VOLUME = 0.625;

/**
 * Potential alcohol, % vol.
 * @param {number} sugar g/l
 */
export function potentialAlcohol(sugar) {
  return sugar / SUGAR_PER_PERCENT;
}

/**
 * Grams of sucrose raising the sugar of must from one level to another,
 * accounting for the volume the sugar adds.
 * @param {number} litres must
 * @param {number} sugar current sugar, g/l
 * @param {number} targetSugar g/l
 */
export function chaptalisationGrams(litres, sugar, targetSugar) {
  return litres * (targetSugar - sugar) / (SUCROSE_TO_INVERT - SUCROSE_VOLUME / 1000 * targetSugar);
}

const inputs = [
  {
    id: 'scale', type: 'select', default: 'nm', label: { cs: 'Moštoměr', en: 'Scale' },
    options: mustGravity.units.map((unit) => ({ value: unit.id, label: unit.label })),
  },
  { id: 'gravity', type: 'number', default: 20, step: 0.1, label: { cs: 'Cukernatost moštu', en: 'Must weight' } },
  { id: 'volume', type: 'number', default: 50, min: 0.1, max: 1000000, step: 1, unit: 'l', label: { cs: 'Objem moštu', en: 'Must volume' } },
  { id: 'target', type: 'number', optional: true, min: 0, max: 20, step: 0.1, unit: { cs: '% obj.', en: '% ABV' }, label: { cs: 'Cílový alkohol (pro doslazení)', en: 'Target alcohol (for chaptalisation)' } },
];

const outputs = [
  { id: 'sugar', label: { cs: 'Cukr v moštu', en: 'Sugar in the must' }, unit: 'g/l', precision: 0 },
  { id: 'alcohol', label: { cs: 'Dosažitelný alkohol', en: 'Potential alcohol' }, unit: { cs: '% obj.', en: '% ABV' }, precision: 1 },
  { id: 'chaptalisation', label: { cs: 'Doslazení řepným cukrem', en: 'Sucrose to add' }, unit: 'kg', precision: 2 },
];

export default {
  id: 'potential-alcohol',
  kind: 'calculator',
  category: 'wine',
  tags: ['wine'],
  name: { cs: 'Dosažitelný alkohol z moštu', en: 'Potential alcohol of must' },
  description: {
    cs: 'Kolik alkoholu dá mošt po úplném prokvašení: 16,83 g cukru na litr dává 1 % obj. (předpis EU). Při zadání cílového alkoholu spočítá i doslazení řepným cukrem včetně objemu, který cukr přidá. Doslazování vína upravují předpisy; ověřte si, co je povoleno.',
    en: 'How much alcohol must gives when fully fermented: 16.83 g of sugar per litre gives 1 % vol (EU rules). With a target strength it also works out the sucrose to add, including the volume the sugar adds. Chaptalisation of wine is regulated; check what is allowed.',
  },
  keywords: {
    cs: ['dosažitelný alkohol', 'potenciální alkohol', 'mošt', 'víno', 'cukr', 'doslazení', 'cukření', 'normalizovaný moštoměr', 'oechsle'],
    en: ['potential alcohol', 'must', 'wine', 'sugar', 'chaptalisation', 'chaptalization', 'oechsle', 'brix'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { scale, gravity, volume, target } = read.values;
    const unit = mustGravity.units.find((candidate) => candidate.id === scale);
    if (!unit || gravity < unit.min || gravity > unit.max) {
      return emptyResult(outputs, [rangeWarning(inputs[1].label, unit?.min, unit?.max, unit?.label)]);
    }
    const sg = mustGravity.toBase(gravity, scale);
    if (sg === null) return emptyResult(outputs, [{ cs: 'Hodnotu nelze převést.', en: 'The value cannot be converted.' }]);
    const sugar = sugarGramsPerLitre(sg);
    const alcohol = potentialAlcohol(sugar);
    let chaptalisation = 0;
    const warnings = [];
    if (target !== null && target > alcohol) {
      chaptalisation = chaptalisationGrams(volume, sugar, target * SUGAR_PER_PERCENT) / 1000;
    } else if (target !== null) {
      warnings.push({ cs: 'Mošt dosáhne cílového alkoholu bez doslazení.', en: 'The must reaches the target alcohol without added sugar.' });
    }
    return { values: { sugar, alcohol, chaptalisation }, warnings };
  },
  references: [
    { title: 'EU wine legislation: 16.83 g of sugar per litre corresponds to 1 % vol of potential alcohol' },
    { title: 'Wikipedia: Must weight', url: 'https://en.wikipedia.org/wiki/Must_weight' },
  ],
};
