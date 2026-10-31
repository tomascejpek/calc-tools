/**
 * Specific heat capacity converter.
 */

import { unitTable } from '../../core/converter.js';

const table = unitTable([
  ['J-kgK', 1, 'J/(kg·K)'],
  ['kJ-kgK', 1000, 'kJ/(kg·K)'],
  ['J-gK', 1000, 'J/(g·K)'],
  ['cal-gK', 4184, { cs: 'cal/(g·K) = kcal/(kg·K)', en: 'cal/(g·K) = kcal/(kg·K)' }],
  ['btu-lbF', 4186.8, 'BTU/(lb·°F)'],
], { defaultUnit: 'kJ-kgK', defaultValue: 4.18 });

export default {
  id: 'specific-heat',
  kind: 'converter',
  category: 'units-heat',
  tags: ['beer'],
  name: { cs: 'Převod měrné tepelné kapacity', en: 'Specific heat capacity converter' },
  description: {
    cs: 'Převod měrné tepelné kapacity mezi J/(kg·K), kJ/(kg·K), cal/(g·K) a BTU/(lb·°F). Voda má asi 4,18 kJ/(kg·K) = 1 cal/(g·K). Rozdíl teplot je v kelvinech i °C stejný.',
    en: 'Converts specific heat capacity between J/(kg·K), kJ/(kg·K), cal/(g·K) and BTU/(lb·°F). Water has about 4.18 kJ/(kg·K) = 1 cal/(g·K). A temperature difference is the same in kelvins and °C.',
  },
  keywords: {
    cs: ['měrná tepelná kapacita', 'tepelná kapacita', 'měrné teplo', 'kj/kg k', 'kalorie'],
    en: ['specific heat', 'specific heat capacity', 'heat capacity', 'j/kg k', 'btu/lb f'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'NIST Special Publication 811: Guide for the Use of the SI, appendix B (BTU_IT/(lb·°F) = 4186.8 J/(kg·K))', url: 'https://www.nist.gov/pml/special-publication-811' },
  ],
};
