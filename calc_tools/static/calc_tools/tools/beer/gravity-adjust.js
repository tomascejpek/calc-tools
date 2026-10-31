/**
 * Diluting or concentrating wort to a target gravity.
 */

import { readGravities, scaleInput } from '../../core/gravity.js';
import { emptyResult, readInputs } from '../../core/tool.js';
import { WATER_DENSITY_20, platoToSg, wortDensity } from '../../core/units.js';

/**
 * Water to add (positive) or boil off (negative) to move wort from one
 * gravity to another, keeping the extract mass.
 * @param {number} litres current volume at 20 °C
 * @param {number} plato current gravity, °P
 * @param {number} targetPlato °P, above zero
 * @returns {{ water: number, finalVolume: number }} water in l at 20 °C, volume in l
 */
export function adjustWithWater(litres, plato, targetPlato) {
  const mass = litres * wortDensity(plato);
  const extract = mass * plato / 100;
  const finalMass = extract * 100 / targetPlato;
  return { water: (finalMass - mass) / WATER_DENSITY_20, finalVolume: finalMass / wortDensity(targetPlato) };
}

const inputs = [
  { id: 'volume', type: 'number', default: 20, min: 0.1, max: 100000, step: 0.5, unit: 'l', label: { cs: 'Objem mladiny', en: 'Wort volume' } },
  scaleInput('plato'),
  { id: 'gravity', type: 'number', default: 13, step: 0.1, label: { cs: 'Současná hustota', en: 'Current gravity' } },
  { id: 'target', type: 'number', default: 12, step: 0.1, label: { cs: 'Cílová hustota', en: 'Target gravity' } },
];

const outputs = [
  { id: 'addWater', label: { cs: 'Přidat vody', en: 'Water to add' }, unit: 'l', precision: 2 },
  { id: 'boilOff', label: { cs: 'Odpařit', en: 'Water to boil off' }, unit: 'l', precision: 2 },
  { id: 'finalVolume', label: { cs: 'Výsledný objem', en: 'Final volume' }, unit: 'l', precision: 1 },
  { id: 'targetSg', label: { cs: 'Cílová hustota', en: 'Target gravity' }, unit: 'SG', precision: 3 },
];

export default {
  id: 'gravity-adjust',
  kind: 'calculator',
  category: 'corrections',
  tags: ['beer'],
  name: { cs: 'Ředění a zahuštění mladiny', en: 'Diluting or concentrating wort' },
  description: {
    cs: 'Kolik vody přidat do mladiny se stupňovitostí nad cílem, nebo kolik vody odpařit, když je pod cílem. Hmotnost extraktu zůstává stejná; objemy platí při 20 °C.',
    en: 'How much water to add to wort above the target gravity, or how much to boil off when it is below. The extract mass stays the same; volumes are at 20 °C.',
  },
  keywords: {
    cs: ['ředění', 'zahuštění', 'korekce', 'stupňovitost', 'cílová hustota', 'odpar', 'přidat vodu', 'og'],
    en: ['dilution', 'dilute', 'concentrate', 'boil off', 'gravity correction', 'target gravity', 'top up', 'og'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const gravity = readGravities(inputs, read.values, ['gravity', 'target']);
    if (gravity.warnings.length) return emptyResult(outputs, gravity.warnings);
    const { gravity: plato, target } = gravity.plato;
    if (plato <= 0 || target <= 0) {
      return emptyResult(outputs, [{ cs: 'Obě hustoty musí být vyšší než hustota vody.', en: 'Both gravities must be above that of water.' }]);
    }
    const { water, finalVolume } = adjustWithWater(read.values.volume, plato, target);
    return {
      values: { addWater: Math.max(0, water), boilOff: Math.max(0, -water), finalVolume, targetSg: platoToSg(target) },
      warnings: [],
    };
  },
  references: [
    { title: 'Kunze, W.: Technology Brewing and Malting – extract balance (extract mass = volume × density × °P / 100)' },
  ],
};
