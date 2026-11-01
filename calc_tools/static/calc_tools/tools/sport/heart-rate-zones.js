/**
 * Heart rate training zones from maximum (and resting) heart rate.
 */

import { bilingual } from '../../core/format.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/** Zones as shares of the heart rate reserve or of the maximum. */
export const ZONES = [[0.5, 0.6], [0.6, 0.7], [0.7, 0.8], [0.8, 0.9], [0.9, 1.0]];

const inputs = [
  { id: 'age', type: 'number', default: 40, min: 10, max: 100, step: 1, unit: { cs: 'let', en: 'years' }, label: { cs: 'Věk', en: 'Age' } },
  {
    id: 'formula', type: 'select', default: 'tanaka', label: { cs: 'Odhad maximální tepové frekvence', en: 'Maximum heart rate estimate' },
    options: [
      { value: 'tanaka', label: { cs: 'Tanaka: 208 − 0,7 × věk', en: 'Tanaka: 208 − 0.7 × age' } },
      { value: 'fox', label: { cs: '220 − věk', en: '220 − age' } },
      { value: 'measured', label: { cs: 'zadám naměřenou', en: 'enter a measured value' } },
    ],
  },
  { id: 'max', type: 'number', default: 185, min: 100, max: 230, step: 1, unit: { cs: 'tepů/min', en: 'bpm' }, label: { cs: 'Naměřená maximální tepová frekvence', en: 'Measured maximum heart rate' } },
  { id: 'resting', type: 'number', optional: true, default: 60, min: 30, max: 120, step: 1, unit: { cs: 'tepů/min', en: 'bpm' }, label: { cs: 'Klidová tepová frekvence (pro Karvonena)', en: 'Resting heart rate (for Karvonen)' } },
];

const ZONE_NAMES = [
  { cs: 'Zóna 1 – regenerace', en: 'Zone 1 – recovery' },
  { cs: 'Zóna 2 – vytrvalost, spalování tuků', en: 'Zone 2 – endurance, fat burning' },
  { cs: 'Zóna 3 – aerobní', en: 'Zone 3 – aerobic' },
  { cs: 'Zóna 4 – anaerobní práh', en: 'Zone 4 – threshold' },
  { cs: 'Zóna 5 – maximum', en: 'Zone 5 – maximum' },
];

const outputs = [
  { id: 'maximum', label: { cs: 'Maximální tepová frekvence', en: 'Maximum heart rate' }, unit: { cs: 'tepů/min', en: 'bpm' }, precision: 0 },
  ...ZONE_NAMES.map((label, i) => ({ id: `zone${i + 1}`, type: 'text', label })),
];

export default {
  id: 'heart-rate-zones',
  kind: 'calculator',
  category: 'sport',
  tags: ['sport', 'health'],
  name: { cs: 'Tepové zóny', en: 'Heart rate zones' },
  description: {
    cs: 'Pět tréninkových tepových zón (50–100 %). Se zadanou klidovou tepovou frekvencí se počítají z tepové rezervy podle Karvonena (přesnější), jinak z maxima. Maximum je odhad podle věku (Tanaka je přesnější než „220 − věk“, u jednotlivce se může lišit o ±10 tepů); nejpřesnější je naměřit ho zátěžovým testem.',
    en: 'Five training heart rate zones (50–100 %). With a resting heart rate given they come from the heart rate reserve by Karvonen (more accurate), otherwise from the maximum. The maximum is an age estimate (Tanaka is more accurate than "220 − age" and may differ by ±10 bpm for an individual); a stress test measures it best.',
  },
  keywords: {
    cs: ['tepové zóny', 'tepová frekvence', 'maximální tep', 'karvonen', 'trénink', 'běh', 'kardio'],
    en: ['heart rate zones', 'heart rate', 'max heart rate', 'karvonen', 'training zones', 'running', 'cardio'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { age, formula, resting } = read.values;
    const maximum = formula === 'measured' ? read.values.max : formula === 'fox' ? 220 - age : 208 - 0.7 * age;
    if (resting !== null && resting >= maximum) return emptyResult(outputs, [{ cs: 'Klidová frekvence musí být nižší než maximální.', en: 'The resting rate must be below the maximum.' }]);
    const base = resting ?? 0;
    const zone = (/** @type {number[]} */ [low, high]) => bilingual((lang) => `${Math.round(base + (maximum - base) * low)}–${Math.round(base + (maximum - base) * high)} ${lang === 'cs' ? 'tepů/min' : 'bpm'}`);
    return {
      values: { maximum, ...Object.fromEntries(ZONES.map((range, i) => [`zone${i + 1}`, zone(range)])) },
      warnings: [],
    };
  },
  references: [
    { title: 'Tanaka, H., Monahan, K. D., Seals, D. R.: Age-predicted maximal heart rate revisited. J. Am. Coll. Cardiol. 37 (2001)' },
    { title: 'Karvonen, M. J. et al.: The effects of training on heart rate. Ann. Med. Exp. Biol. Fenn. 35 (1957)' },
  ],
};
