/**
 * Honey or sugar for a must of a target gravity and volume.
 */

import { readGravities, scaleInput } from '../../core/gravity.js';
import { emptyResult, readInputs } from '../../core/tool.js';
import { wortDensity } from '../../core/units.js';
import { SWEETENER_EXTRACT } from '../beer/sugar-addition.js';

/**
 * Sweetener and base liquid for a must of a given volume and gravity. Mass
 * balance of extract: m·y + (M − m)·P₀ = M·P.
 * @param {number} litres final must volume
 * @param {number} targetPlato °P of the must
 * @param {number} basePlato °P of the liquid (water 0, juice more)
 * @param {number} extractFraction extract per kg of the sweetener
 * @returns {{ kg: number, liquid: number } | null} kg of sweetener, l of liquid
 */
export function mustRecipe(litres, targetPlato, basePlato, extractFraction) {
  const mass = litres * wortDensity(targetPlato);
  const target = targetPlato / 100;
  const base = basePlato / 100;
  if (extractFraction <= base) return null;
  const kg = mass * (target - base) / (extractFraction - base);
  return { kg, liquid: (mass - kg) / wortDensity(basePlato) };
}

const inputs = [
  { id: 'volume', type: 'number', default: 20, min: 0.1, max: 100000, step: 0.5, unit: 'l', label: { cs: 'Objem moštu', en: 'Must volume' } },
  scaleInput('sg'),
  { id: 'target', type: 'number', default: 1.100, step: 0.001, label: { cs: 'Cílová hustota', en: 'Target gravity' } },
  { id: 'base', type: 'number', default: 1.000, step: 0.001, label: { cs: 'Hustota vody nebo šťávy', en: 'Gravity of the water or juice' } },
  {
    id: 'sweetener', type: 'select', default: 'honey', label: { cs: 'Sladidlo', en: 'Sweetener' },
    options: [
      { value: 'honey', label: { cs: 'med', en: 'honey' } },
      { value: 'sucrose', label: { cs: 'sacharóza (řepný cukr)', en: 'sucrose (table sugar)' } },
      { value: 'glucose', label: { cs: 'glukóza (hroznový cukr)', en: 'glucose (dextrose)' } },
    ],
  },
];

const outputs = [
  { id: 'kg', label: { cs: 'Sladidla', en: 'Sweetener' }, unit: 'kg', precision: 2 },
  { id: 'liquid', label: { cs: 'Vody nebo šťávy', en: 'Water or juice' }, unit: 'l', precision: 1 },
  { id: 'plato', label: { cs: 'Cílová hustota', en: 'Target gravity' }, unit: '°P', precision: 1 },
];

export default {
  id: 'mead-sugar',
  kind: 'calculator',
  category: 'mead',
  tags: ['mead', 'cider'],
  name: { cs: 'Med nebo cukr na cílovou hustotu', en: 'Honey or sugar for a target gravity' },
  description: {
    cs: 'Kolik medu nebo cukru a kolik vody či jablečné šťávy smíchat, aby vznikl mošt daného objemu a hustoty. Med se počítá s 80 % extraktu. U cideru zadejte hustotu šťávy (obvykle 1,040–1,055).',
    en: 'How much honey or sugar and how much water or apple juice to mix for a must of a given volume and gravity. Honey is taken as 80 % extract. For cider enter the gravity of the juice (usually 1.040–1.055).',
  },
  keywords: {
    cs: ['medovina', 'med', 'cider', 'jablečná šťáva', 'mošt', 'cukr', 'og', 'hustota', 'mead'],
    en: ['mead', 'honey', 'cider', 'apple juice', 'must', 'sugar', 'og', 'gravity'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const gravity = readGravities(inputs, read.values, ['target', 'base']);
    if (gravity.warnings.length) return emptyResult(outputs, gravity.warnings);
    const target = Math.max(0, gravity.plato.target);
    const base = Math.max(0, gravity.plato.base);
    if (target < base) {
      return emptyResult(outputs, [{ cs: 'Cílová hustota nemůže být nižší než hustota šťávy.', en: 'The target gravity cannot be below the gravity of the juice.' }]);
    }
    const fraction = SWEETENER_EXTRACT[/** @type {keyof typeof SWEETENER_EXTRACT} */ (read.values.sweetener)];
    const recipe = mustRecipe(read.values.volume, target, base, fraction);
    if (recipe === null || recipe.liquid < 0) {
      return emptyResult(outputs, [{ cs: 'Tuto hustotu tímto sladidlem připravit nelze.', en: 'This gravity cannot be reached with this sweetener.' }]);
    }
    return { values: { ...recipe, plato: target }, warnings: [] };
  },
  references: [
    { title: 'Schramm, K.: The Compleat Meadmaker. Brewers Publications, 2003 – honey about 80 % sugars' },
    { title: 'Kunze, W.: Technology Brewing and Malting – extract balance' },
  ],
};
