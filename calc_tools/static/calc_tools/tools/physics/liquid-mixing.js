/**
 * Final temperature of mixed liquids (calorimetric equation).
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * @param {{ mass: number, temperature: number, specificHeat: number }[]} parts
 * @returns {number | null}
 */
export function mixedTemperature(parts) {
  const capacity = parts.reduce((sum, part) => sum + part.mass * part.specificHeat, 0);
  if (capacity <= 0) return null;
  return parts.reduce((sum, part) => sum + part.mass * part.specificHeat * part.temperature, 0) / capacity;
}

const inputs = [
  {
    id: 'parts', type: 'list', min: 2, max: 10, label: { cs: 'Kapalina', en: 'Liquid' },
    fields: [
      { id: 'mass', type: 'number', default: 20, min: 0, max: 1e9, step: 0.5, unit: 'kg', label: { cs: 'Hmotnost (u vody kg ≈ l)', en: 'Mass (for water kg ≈ l)' } },
      { id: 'temperature', type: 'number', default: 80, min: -273.15, max: 5000, step: 1, unit: '°C', label: { cs: 'Teplota', en: 'Temperature' } },
      { id: 'specificHeat', type: 'number', default: 4.186, min: 0.01, max: 100, step: 0.01, unit: 'kJ/(kg·K)', label: { cs: 'Měrná tepelná kapacita', en: 'Specific heat' } },
    ],
  },
];

/**
 * Two default liquids when none are given, as a form with min: 2 shows them.
 * @param {unknown} values
 */
function withTwoItems(values) {
  const source = values && typeof values === 'object' ? /** @type {Record<string, any>} */ (values) : {};
  return { ...source, parts: Object.hasOwn(source, 'parts') && source.parts != null ? source.parts : [{}, {}] };
}

const outputs = [
  { id: 'temperature', label: { cs: 'Výsledná teplota', en: 'Final temperature' }, unit: '°C', precision: 1 },
  { id: 'mass', label: { cs: 'Hmotnost směsi', en: 'Mass of the mixture' }, unit: 'kg', significant: 6 },
];

export default {
  id: 'liquid-mixing',
  kind: 'calculator',
  category: 'physics-thermal',
  tags: ['physics', 'beer'],
  name: { cs: 'Směšování kapalin (kalorimetrická rovnice)', en: 'Mixing liquids (calorimetric equation)' },
  description: {
    cs: 'Výsledná teplota po smíchání dvou a více kapalin: teplo odevzdané teplejšími se rovná teplu přijatému chladnějšími, T = Σ m·c·T / Σ m·c. Hodí se např. k namíchání vody na vystírání z horké a studené. Předpokládá žádné ztráty a žádné změny skupenství.',
    en: 'Final temperature after mixing two or more liquids: heat given off by the warmer ones equals heat taken up by the colder ones, T = Σ m·c·T / Σ m·c. Useful e.g. for mixing hot and cold water for mashing in. Assumes no losses and no phase changes.',
  },
  keywords: {
    cs: ['směšování', 'kalorimetrická rovnice', 'výsledná teplota', 'míchání vody', 'teplota směsi', 'rmutování'],
    en: ['mixing', 'calorimetry', 'final temperature', 'mixing water', 'mixture temperature', 'heat balance'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, withTwoItems(values));
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const temperature = mixedTemperature(read.values.parts);
    if (temperature === null) return emptyResult(outputs, [{ cs: 'Zadejte kapalinu s nenulovou hmotností.', en: 'Enter a liquid with a non-zero mass.' }]);
    return { values: { temperature, mass: read.values.parts.reduce((/** @type {number} */ sum, /** @type {any} */ part) => sum + part.mass, 0) }, warnings: [] };
  },
  references: [{ title: 'Halliday, D., Resnick, R., Walker, J.: Fundamentals of Physics – heat capacity and calorimetry' }],
};
