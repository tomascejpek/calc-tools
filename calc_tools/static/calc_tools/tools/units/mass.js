/**
 * Mass converter: grams, kilograms, ounces and pounds.
 */

import { factorConversion } from '../../core/units.js';

/** Size of one unit in grams. */
export const GRAMS = {
  g: 1,
  kg: 1000,
  oz: 28.349523125,
  lb: 453.59237,
};

export default {
  id: 'mass',
  kind: 'converter',
  category: 'units',
  tags: [],
  name: { cs: 'Převod hmotnosti', en: 'Mass converter' },
  description: {
    cs: 'Převod hmotnosti mezi gramy, kilogramy, uncemi a librami (avoirdupois).',
    en: 'Converts mass between grams, kilograms, ounces and pounds (avoirdupois).',
  },
  keywords: {
    cs: ['hmotnost', 'váha', 'gram', 'kilogram', 'unce', 'libra'],
    en: ['mass', 'weight', 'gram', 'kilogram', 'ounce', 'pound', 'oz', 'lb'],
  },
  units: [
    { id: 'g', default: 100, label: { cs: 'g', en: 'g' }, precision: 1, min: 0 },
    { id: 'kg', label: { cs: 'kg', en: 'kg' }, precision: 3, min: 0 },
    { id: 'oz', label: { cs: 'oz', en: 'oz' }, precision: 2, min: 0 },
    { id: 'lb', label: { cs: 'lb', en: 'lb' }, precision: 3, min: 0 },
  ],
  ...factorConversion(GRAMS),
  references: [
    { title: 'NIST Handbook 44, Appendix C: General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' },
  ],
};
