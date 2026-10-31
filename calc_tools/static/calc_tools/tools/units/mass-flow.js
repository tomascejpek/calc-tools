/**
 * Mass flow rate converter.
 */

import { unitTable } from '../../core/converter.js';

const LB = 0.45359237;

const table = unitTable([
  ['g-s', 1e-3, 'g/s'],
  ['kg-s', 1, 'kg/s'],
  ['kg-min', 1 / 60, 'kg/min'],
  ['kg-h', 1 / 3600, 'kg/h'],
  ['t-h', 1000 / 3600, 't/h'],
  ['lb-s', LB, 'lb/s'],
  ['lb-min', LB / 60, 'lb/min'],
  ['lb-h', LB / 3600, 'lb/h'],
], { defaultUnit: 'kg-h', defaultValue: 100 });

export default {
  id: 'mass-flow',
  kind: 'converter',
  category: 'units-flow',
  tags: [],
  name: { cs: 'Převod hmotnostního průtoku', en: 'Mass flow converter' },
  description: {
    cs: 'Převod hmotnostního průtoku mezi gramy a kilogramy za sekundu, kilogramy za minutu a hodinu, tunami za hodinu a librami za sekundu, minutu a hodinu.',
    en: 'Converts mass flow between grams and kilograms per second, kilograms per minute and hour, tonnes per hour and pounds per second, minute and hour.',
  },
  keywords: {
    cs: ['hmotnostní průtok', 'průtok', 'kg/h', 't/h', 'kg/s'],
    en: ['mass flow', 'mass flow rate', 'kg/h', 't/h', 'lb/h'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'NIST Special Publication 811: Guide for the Use of the SI', url: 'https://www.nist.gov/pml/special-publication-811' },
  ],
};
