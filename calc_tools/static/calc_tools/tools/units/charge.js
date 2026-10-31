/**
 * Electric charge and battery capacity: coulombs, ampere-hours and, at a
 * given voltage, watt-hours.
 */

import { isNumber } from '../../core/units.js';

/** Size of one unit in coulombs; watt-hours divide by the voltage. */
const COULOMBS = { C: 1, mAh: 3.6, Ah: 3600 };
const ENERGY = { mWh: 3.6, Wh: 3600, kWh: 3.6e6 };

/**
 * Coulombs per unit at a voltage.
 * @param {string} unitId
 * @param {number} volts
 * @returns {number | null}
 */
export function coulombsPerUnit(unitId, volts) {
  if (Object.hasOwn(COULOMBS, unitId)) return COULOMBS[/** @type {keyof typeof COULOMBS} */ (unitId)];
  if (Object.hasOwn(ENERGY, unitId) && isNumber(volts) && volts > 0) return ENERGY[/** @type {keyof typeof ENERGY} */ (unitId)] / volts;
  return null;
}

export default {
  id: 'charge',
  kind: 'converter',
  category: 'units-electric',
  tags: [],
  name: { cs: 'Převod náboje a kapacity baterie (Ah ⇄ Wh)', en: 'Charge and battery capacity (Ah ⇄ Wh)' },
  description: {
    cs: 'Převod elektrického náboje mezi coulomby, miliampérhodinami a ampérhodinami a při zadaném napětí i na watthodiny: Wh = Ah × V. Pro baterie použijte jmenovité napětí (Li-ion článek 3,6–3,7 V, olověný akumulátor 12 V).',
    en: 'Converts electric charge between coulombs, milliampere-hours and ampere-hours and, at a given voltage, to watt-hours: Wh = Ah × V. For batteries use the nominal voltage (Li-ion cell 3.6–3.7 V, lead-acid battery 12 V).',
  },
  keywords: {
    cs: ['náboj', 'kapacita baterie', 'baterie', 'akumulátor', 'ampérhodina', 'mah', 'ah', 'wh', 'watthodina', 'coulomb', 'powerbanka'],
    en: ['charge', 'battery capacity', 'battery', 'ampere-hour', 'mah', 'ah', 'wh', 'watt-hour', 'coulomb', 'power bank'],
  },
  units: [
    { id: 'mAh', default: 10000, label: { cs: 'mAh', en: 'mAh' }, significant: 6, min: 0 },
    { id: 'Ah', label: { cs: 'Ah', en: 'Ah' }, significant: 6, min: 0 },
    { id: 'C', label: { cs: 'C (coulomb)', en: 'C (coulomb)' }, significant: 6, min: 0 },
    { id: 'mWh', label: { cs: 'mWh', en: 'mWh' }, significant: 6, min: 0 },
    { id: 'Wh', label: { cs: 'Wh', en: 'Wh' }, significant: 6, min: 0 },
    { id: 'kWh', label: { cs: 'kWh', en: 'kWh' }, significant: 6, min: 0 },
  ],
  params: [
    { id: 'voltage', type: 'number', default: 3.7, min: 0.001, max: 1e6, step: 0.1, unit: 'V', label: { cs: 'Napětí', en: 'Voltage' } },
  ],
  // Base unit: coulomb
  toBase(value, unitId, params = {}) {
    const factor = coulombsPerUnit(unitId, params.voltage ?? 3.7);
    return factor === null ? null : value * factor;
  },
  fromBase(value, unitId, params = {}) {
    const factor = coulombsPerUnit(unitId, params.voltage ?? 3.7);
    return factor === null ? null : value / factor;
  },
  references: [
    { title: 'BIPM: The International System of Units (SI Brochure) – coulomb, hour', url: 'https://www.bipm.org/en/publications/si-brochure' },
  ],
};
