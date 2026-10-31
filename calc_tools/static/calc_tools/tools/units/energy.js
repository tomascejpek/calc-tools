/**
 * Energy converter, from electronvolts to kilowatt-hours.
 */

import { unitTable } from '../../core/converter.js';

/** Elementary charge, C (exact in the SI). */
export const ELEMENTARY_CHARGE = 1.602176634e-19;
/** International Table British thermal unit, J. */
export const BTU = 1055.05585262;

const table = unitTable([
  ['eV', ELEMENTARY_CHARGE, 'eV'],
  ['erg', 1e-7, 'erg'],
  ['J', 1, 'J'],
  ['kJ', 1e3, 'kJ'],
  ['MJ', 1e6, 'MJ'],
  ['cal', 4.184, { cs: 'cal (termochemická)', en: 'cal (thermochemical)' }],
  ['kcal', 4184, { cs: 'kcal (potravinová)', en: 'kcal (food Calorie)' }],
  ['Wh', 3600, 'Wh'],
  ['kWh', 3.6e6, 'kWh'],
  ['MWh', 3.6e9, 'MWh'],
  ['btu', BTU, 'BTU'],
  ['ftlbf', 0.3048 * 0.45359237 * 9.80665, 'ft·lbf'],
], { defaultUnit: 'kWh', defaultValue: 1 });

export default {
  id: 'energy',
  kind: 'converter',
  category: 'units-mechanics',
  tags: [],
  name: { cs: 'Převod energie', en: 'Energy converter' },
  description: {
    cs: 'Převod energie a práce mezi jouly, kalorie, watthodinami, BTU, elektronvolty, ergy a ft·lbf. Kalorie je termochemická (4,184 J), stejně jako potravinová kilokalorie na obalech; BTU je mezinárodní (IT).',
    en: 'Converts energy and work between joules, calories, watt-hours, BTU, electronvolts, ergs and ft·lbf. The calorie is the thermochemical one (4.184 J), as is the food kilocalorie on labels; the BTU is the International Table one.',
  },
  keywords: {
    cs: ['energie', 'práce', 'teplo', 'joule', 'kalorie', 'kilokalorie', 'kwh', 'kilowatthodina', 'btu', 'elektronvolt', 'ev'],
    en: ['energy', 'work', 'heat', 'joule', 'calorie', 'kilocalorie', 'kwh', 'kilowatt-hour', 'btu', 'electronvolt', 'ev'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'NIST Special Publication 811: Guide for the Use of the SI, appendix B', url: 'https://www.nist.gov/pml/special-publication-811' },
    { title: 'BIPM: The International System of Units (SI Brochure) – elementary charge', url: 'https://www.bipm.org/en/publications/si-brochure' },
  ],
};
