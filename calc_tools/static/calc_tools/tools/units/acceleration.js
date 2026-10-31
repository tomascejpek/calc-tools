/**
 * Acceleration converter.
 */

import { unitTable } from '../../core/converter.js';

/** Standard acceleration of gravity, m/s². */
export const STANDARD_GRAVITY = 9.80665;

const table = unitTable([
  ['m-s2', 1, 'm/s²'],
  ['gal', 0.01, { cs: 'Gal (cm/s²)', en: 'Gal (cm/s²)' }],
  ['g', STANDARD_GRAVITY, { cs: 'g (normální tíhové zrychlení)', en: 'g (standard gravity)' }],
  ['ft-s2', 0.3048, 'ft/s²'],
], { defaultUnit: 'g', defaultValue: 1, min: null });

export default {
  id: 'acceleration',
  kind: 'converter',
  category: 'units-basic',
  tags: [],
  name: { cs: 'Převod zrychlení', en: 'Acceleration converter' },
  description: {
    cs: 'Převod zrychlení mezi m/s², galy, násobky normálního tíhového zrychlení g (9,80665 m/s²) a ft/s². Záporná hodnota je zpomalení.',
    en: 'Converts acceleration between m/s², gals, multiples of standard gravity g (9.80665 m/s²) and ft/s². A negative value is deceleration.',
  },
  keywords: {
    cs: ['zrychlení', 'tíhové zrychlení', 'přetížení', 'g', 'gal'],
    en: ['acceleration', 'g-force', 'standard gravity', 'gal', 'm/s2'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'BIPM: The International System of Units (SI Brochure) – standard acceleration of gravity', url: 'https://www.bipm.org/en/publications/si-brochure' },
  ],
};
