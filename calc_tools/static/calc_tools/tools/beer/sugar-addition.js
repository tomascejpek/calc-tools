/**
 * Sugar or malt extract to raise the gravity of wort.
 */

import { readGravities, scaleInput } from '../../core/gravity.js';
import { emptyResult, readInputs } from '../../core/tool.js';
import { wortDensity } from '../../core/units.js';

/**
 * Extract per kg of each sweetener as sold, as a fraction. Glucose is sold
 * as the monohydrate (180.16 / 198.17); dry and liquid malt extract and
 * honey after their usual water content (44, 36 and 37 PPG of 46.2).
 */
export const SWEETENER_EXTRACT = {
  sucrose: 1,
  glucose: 180.16 / 198.17,
  dme: 0.95,
  lme: 0.78,
  honey: 0.80,
};

/**
 * Kilograms of a sweetener that raise wort to the target gravity. Mass
 * balance: (E + m·y) / (M + m) = P₂ / 100.
 * @param {number} mass wort mass, kg
 * @param {number} plato current gravity, °P
 * @param {number} targetPlato °P
 * @param {number} extractFraction extract per kg of the sweetener
 * @returns {number | null}
 */
export function sweetenerKg(mass, plato, targetPlato, extractFraction) {
  const target = targetPlato / 100;
  if (extractFraction <= target) return null;
  return (target * mass - mass * plato / 100) / (extractFraction - target);
}

/** Select options of sweeteners shared by tools. */
export const SWEETENER_OPTIONS = [
  { value: 'sucrose', label: { cs: 'sacharóza (řepný, třtinový cukr)', en: 'sucrose (table sugar)' } },
  { value: 'glucose', label: { cs: 'glukóza (hroznový cukr)', en: 'glucose (dextrose)' } },
  { value: 'dme', label: { cs: 'sušený sladový extrakt', en: 'dry malt extract' } },
  { value: 'lme', label: { cs: 'tekutý sladový extrakt', en: 'liquid malt extract' } },
  { value: 'honey', label: { cs: 'med', en: 'honey' } },
];

const inputs = [
  { id: 'volume', type: 'number', default: 20, min: 0.1, max: 100000, step: 0.5, unit: 'l', label: { cs: 'Objem mladiny', en: 'Wort volume' } },
  scaleInput('plato'),
  { id: 'gravity', type: 'number', default: 11, step: 0.1, label: { cs: 'Současná hustota', en: 'Current gravity' } },
  { id: 'target', type: 'number', default: 12, step: 0.1, label: { cs: 'Cílová hustota', en: 'Target gravity' } },
  { id: 'sweetener', type: 'select', default: 'sucrose', label: { cs: 'Přidat', en: 'Add' }, options: SWEETENER_OPTIONS },
];

const outputs = [
  { id: 'grams', label: { cs: 'Přidat', en: 'Amount to add' }, unit: 'g', precision: 0 },
  { id: 'finalVolume', label: { cs: 'Výsledný objem', en: 'Final volume' }, unit: 'l', precision: 1 },
];

export default {
  id: 'sugar-addition',
  kind: 'calculator',
  category: 'corrections',
  tags: ['beer'],
  name: { cs: 'Zvýšení stupňovitosti cukrem nebo extraktem', en: 'Raising gravity with sugar or extract' },
  description: {
    cs: 'Kolik cukru, sladového extraktu nebo medu přidat do mladiny, aby dosáhla cílové stupňovitosti. Počítá z hmotnostní bilance extraktu, takže zahrnuje i zvětšení objemu po rozpuštění.',
    en: 'How much sugar, malt extract or honey to add to wort to reach a target gravity. Uses the mass balance of extract, so the volume added by the sweetener is included.',
  },
  keywords: {
    cs: ['cukr', 'sladový extrakt', 'dme', 'glukóza', 'med', 'zvýšení stupňovitosti', 'korekce', 'og', 'cílová hustota'],
    en: ['sugar', 'dme', 'dry malt extract', 'liquid malt extract', 'dextrose', 'honey', 'raise gravity', 'gravity correction'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const gravity = readGravities(inputs, read.values, ['gravity', 'target']);
    if (gravity.warnings.length) return emptyResult(outputs, gravity.warnings);
    const { gravity: plato, target } = gravity.plato;
    if (target < plato) {
      return emptyResult(outputs, [{
        cs: 'Cílová hustota je nižší než současná; použijte ředění vodou.',
        en: 'The target gravity is below the current one; dilute with water instead.',
      }]);
    }
    const mass = read.values.volume * wortDensity(Math.max(0, plato));
    const fraction = SWEETENER_EXTRACT[/** @type {keyof typeof SWEETENER_EXTRACT} */ (read.values.sweetener)];
    const kg = sweetenerKg(mass, Math.max(0, plato), target, fraction);
    if (kg === null) {
      return emptyResult(outputs, [{ cs: 'Tímto přídavkem cílové hustoty dosáhnout nelze.', en: 'This sweetener cannot reach the target gravity.' }]);
    }
    return { values: { grams: kg * 1000, finalVolume: (mass + kg) / wortDensity(target) }, warnings: [] };
  },
  references: [
    { title: 'Kunze, W.: Technology Brewing and Malting – extract balance' },
    { title: 'Palmer, J.: How to Brew, 4th ed., table of typical extract potentials (sucrose 46, DME 44, LME 36, honey 35–38 PPG)' },
  ],
};
