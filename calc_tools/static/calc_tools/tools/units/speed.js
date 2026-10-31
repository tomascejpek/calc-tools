/**
 * Speed converter.
 */

import { unitTable } from '../../core/converter.js';

const table = unitTable([
  ['m-s', 1, 'm/s'],
  ['km-h', 1 / 3.6, 'km/h'],
  ['mph', 0.44704, 'mph'],
  ['kn', 1852 / 3600, { cs: 'uzel (kn)', en: 'knot (kn)' }],
  ['ft-s', 0.3048, 'ft/s'],
], { defaultUnit: 'km-h', defaultValue: 100 });

/** Size of one unit in m/s. */
export const METRES_PER_SECOND = table.factors;

export default {
  id: 'speed',
  kind: 'converter',
  category: 'units-basic',
  tags: [],
  name: { cs: 'Převod rychlosti', en: 'Speed converter' },
  description: {
    cs: 'Převod rychlosti mezi metry za sekundu, kilometry za hodinu, mílemi za hodinu, uzly a stopami za sekundu.',
    en: 'Converts speed between metres per second, kilometres per hour, miles per hour, knots and feet per second.',
  },
  keywords: {
    cs: ['rychlost', 'km/h', 'm/s', 'mph', 'uzel', 'uzly'],
    en: ['speed', 'velocity', 'km/h', 'kph', 'mph', 'knot', 'm/s'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'NIST Special Publication 811: Guide for the Use of the SI', url: 'https://www.nist.gov/pml/special-publication-811' },
  ],
};
