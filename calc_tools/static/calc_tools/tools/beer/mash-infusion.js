/**
 * Hot water infusion to raise the mash to the next rest.
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { GRAIN_HEAT_CAPACITY } from './strike-water.js';

/**
 * Litres of hot water that raise the mash from one temperature to another.
 * Heat balance: added · (Tw − T2) = (c · grain + water) · (T2 − T1).
 * @param {{ grain: number, water: number, from: number, to: number, infusion: number }} mash
 *   grain kg, water l already in the mash, temperatures °C
 */
export function infusionVolume({ grain, water, from, to, infusion }) {
  return (to - from) * (GRAIN_HEAT_CAPACITY * grain + water) / (infusion - to);
}

const inputs = [
  { id: 'grain', type: 'number', default: 5, min: 0.01, max: 10000, step: 0.1, unit: 'kg', label: { cs: 'Hmotnost sladu', en: 'Grain weight' } },
  { id: 'water', type: 'number', default: 15, min: 0, max: 100000, step: 0.5, unit: 'l', label: { cs: 'Voda ve rmutu', en: 'Water in the mash' } },
  { id: 'from', type: 'number', default: 52, min: 20, max: 80, step: 0.5, unit: '°C', label: { cs: 'Současná teplota rmutu', en: 'Current mash temperature' } },
  { id: 'to', type: 'number', default: 63, min: 20, max: 80, step: 0.5, unit: '°C', label: { cs: 'Teplota další prodlevy', en: 'Next rest temperature' } },
  { id: 'infusion', type: 'number', default: 98, min: 50, max: 100, step: 0.5, unit: '°C', label: { cs: 'Teplota přilévané vody', en: 'Infusion water temperature' } },
];

const outputs = [
  { id: 'volume', label: { cs: 'Přilít vody', en: 'Water to add' }, unit: 'l', precision: 1 },
  { id: 'totalWater', label: { cs: 'Voda ve rmutu celkem', en: 'Total water in the mash' }, unit: 'l', precision: 1 },
  { id: 'ratio', label: { cs: 'Nový poměr voda/slad', en: 'New water to grain ratio' }, unit: 'l/kg', precision: 2 },
];

export default {
  id: 'mash-infusion',
  kind: 'calculator',
  category: 'mash',
  tags: ['beer'],
  name: { cs: 'Přilití vody na další prodlevu', en: 'Step infusion' },
  description: {
    cs: 'Kolik horké vody přilít do rmutu, aby se ohřál na další teplotní prodlevu (infuzní rmutování). Počítá s tepelnou kapacitou sladu 0,41 vody a bez tepelných ztrát.',
    en: 'How much hot water to add to the mash to raise it to the next rest (step infusion mashing). Uses a grain heat capacity of 0.41 of water and assumes no heat losses.',
  },
  keywords: {
    cs: ['infuze', 'infuzní rmutování', 'prodleva', 'teplotní krok', 'přilití', 'horká voda', 'rmutování', 'rmut'],
    en: ['step infusion', 'infusion', 'mash step', 'rest', 'boiling water addition', 'mash'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { grain, water, from, to, infusion } = read.values;
    if (to <= from) {
      return emptyResult(outputs, [{ cs: 'Další prodleva musí být teplejší než současný rmut.', en: 'The next rest must be warmer than the current mash.' }]);
    }
    if (infusion <= to) {
      return emptyResult(outputs, [{ cs: 'Přilévaná voda musí být teplejší než cílová prodleva.', en: 'The infusion water must be hotter than the target rest.' }]);
    }
    const volume = infusionVolume({ grain, water, from, to, infusion });
    const totalWater = water + volume;
    const ratio = totalWater / grain;
    const warnings = ratio > 6
      ? [{ cs: 'Rmut bude velmi řídký; zvažte dekokci nebo přímý ohřev.', en: 'The mash will be very thin; consider a decoction or direct heat.' }]
      : [];
    return { values: { volume, totalWater, ratio }, warnings };
  },
  references: [
    { title: 'Palmer, J.: How to Brew – Calculations for boiling water additions: Wa = (T2 − T1)(0.41·G + Wm) / (Tw − T2)', url: 'https://howtobrew.com/book/section-3/the-methods-of-mashing/calculations-for-boiling-water-additions' },
  ],
};
