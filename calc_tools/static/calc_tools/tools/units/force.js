/**
 * Force converter.
 */

import { unitTable } from '../../core/converter.js';
import { STANDARD_GRAVITY } from './acceleration.js';

/** Pound-force in newtons (0.45359237 kg × standard gravity). */
export const LBF = 0.45359237 * STANDARD_GRAVITY;

const table = unitTable([
  ['mN', 1e-3, 'mN'],
  ['N', 1, 'N'],
  ['kN', 1e3, 'kN'],
  ['MN', 1e6, 'MN'],
  ['dyn', 1e-5, 'dyn'],
  ['kp', STANDARD_GRAVITY, { cs: 'kp (kilopond)', en: 'kgf (kilogram-force)' }],
  ['lbf', LBF, 'lbf'],
], { defaultUnit: 'N', defaultValue: 100, min: null });

export default {
  id: 'force',
  kind: 'converter',
  category: 'units-mechanics',
  tags: [],
  name: { cs: 'Převod síly', en: 'Force converter' },
  description: {
    cs: 'Převod síly mezi newtony, dyny, kilopondy (kp = kgf, 9,80665 N) a librami síly (lbf).',
    en: 'Converts force between newtons, dynes, kilograms-force (kgf = kp, 9.80665 N) and pounds-force (lbf).',
  },
  keywords: {
    cs: ['síla', 'newton', 'kilopond', 'kp', 'kgf', 'lbf', 'dyn', 'tah'],
    en: ['force', 'newton', 'kilogram-force', 'kgf', 'kilopond', 'pound-force', 'lbf', 'dyne', 'thrust'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'NIST Special Publication 811: Guide for the Use of the SI, appendix B', url: 'https://www.nist.gov/pml/special-publication-811' },
  ],
};
