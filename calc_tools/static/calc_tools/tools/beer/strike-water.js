/**
 * Strike water temperature for mashing in.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** Heat capacity of malt relative to the same mass of water (Palmer). */
export const GRAIN_HEAT_CAPACITY = 0.41;

/**
 * Temperature of the strike water so that the mash settles at the target.
 * Heat balance: water · (Tw − T) = c · grain · (T − Tgrain).
 * @param {number} ratio water to grain, l/kg
 * @param {number} grainTemp °C
 * @param {number} targetTemp °C
 */
export function strikeTemperature(ratio, grainTemp, targetTemp) {
  return targetTemp + GRAIN_HEAT_CAPACITY / ratio * (targetTemp - grainTemp);
}

const inputs = [
  { id: 'grain', type: 'number', default: 5, min: 0.01, max: 10000, step: 0.1, unit: 'kg', label: { cs: 'Hmotnost sladu', en: 'Grain weight' } },
  { id: 'water', type: 'number', default: 15, min: 0.1, max: 100000, step: 0.5, unit: 'l', label: { cs: 'Vystírací voda', en: 'Strike water' } },
  { id: 'grainTemp', type: 'number', default: 20, min: -10, max: 50, step: 0.5, unit: '°C', label: { cs: 'Teplota sladu', en: 'Grain temperature' } },
  { id: 'target', type: 'number', default: 65, min: 30, max: 80, step: 0.5, unit: '°C', label: { cs: 'Cílová teplota rmutu', en: 'Target mash temperature' } },
  { id: 'tunLoss', type: 'number', default: 0, min: 0, max: 20, step: 0.5, unit: '°C', label: { cs: 'Přídavek na ohřátí kádě', en: 'Allowance for heating the tun' } },
];

const outputs = [
  { id: 'temperature', label: { cs: 'Teplota vystírací vody', en: 'Strike water temperature' }, unit: '°C', precision: 1 },
  { id: 'ratio', label: { cs: 'Poměr voda/slad', en: 'Water to grain ratio' }, unit: 'l/kg', precision: 2 },
  { id: 'mashVolume', label: { cs: 'Objem rmutu', en: 'Mash volume' }, unit: 'l', precision: 1 },
];

/** Volume taken by one kg of grain in the mash, l (Palmer: 0.32 qt/lb). */
export const GRAIN_VOLUME = 0.67;

export default {
  id: 'strike-water',
  kind: 'calculator',
  category: 'mash',
  tags: ['beer'],
  name: { cs: 'Teplota vystírací vody', en: 'Strike water temperature' },
  description: {
    cs: 'Na kolik ohřát vodu pro vystírání, aby rmut po smíchání se sladem měl cílovou teplotu. Slad má tepelnou kapacitu 0,41 vody. Studená káď odebere další teplo; zadejte o kolik stupňů vodu přihřát navíc (předehřátá káď 0 °C).',
    en: 'How hot the strike water must be so that the mash reaches the target temperature once mixed with the grain. Grain has 0.41 of the heat capacity of water. A cold tun takes extra heat; enter how many degrees to add (pre-heated tun 0 °C).',
  },
  keywords: {
    cs: ['vystírání', 'vystírací voda', 'nálevová voda', 'rmutování', 'infuze', 'teplota vody', 'rmut', 'poměr voda slad'],
    en: ['strike water', 'mash in', 'infusion', 'mash temperature', 'strike temperature', 'mash thickness'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { grain, water, grainTemp, target, tunLoss } = read.values;
    if (grainTemp >= target) {
      return emptyResult(outputs, [{ cs: 'Slad musí být chladnější než cílový rmut.', en: 'The grain must be colder than the target mash.' }]);
    }
    const ratio = water / grain;
    const temperature = strikeTemperature(ratio, grainTemp, target) + tunLoss;
    const warnings = [];
    if (temperature > 100) {
      warnings.push({
        cs: 'Voda by musela být nad bodem varu; přidejte víc vody nebo rmutujte v krocích.',
        en: 'The water would have to be above boiling; use more water or mash in steps.',
      });
    }
    if (ratio < 2 || ratio > 6) {
      warnings.push({
        cs: 'Obvyklý poměr voda/slad je 2,5 až 5 l/kg.',
        en: 'A usual water to grain ratio is 2.5 to 5 l/kg.',
      });
    }
    return { values: { temperature, ratio, mashVolume: water + grain * GRAIN_VOLUME }, warnings };
  },
  references: [
    { title: 'Palmer, J.: How to Brew, 4th ed., ch. 16 – Infusion equations: Tw = (0.41 / r)(T2 − T1) + T2', url: 'https://howtobrew.com/book/section-3/the-methods-of-mashing/calculations-for-boiling-water-additions' },
  ],
};
