/**
 * Volume converter, including US and imperial units and the US beer barrel.
 */

import { factorConversion } from '../../core/units.js';

const US_GALLON = 3.785411784;

/** Size of one unit in litres. */
export const LITRES = {
  ml: 0.001,
  l: 1,
  hl: 100,
  'us-floz': US_GALLON / 128,
  'us-pint': US_GALLON / 8,
  'us-gal': US_GALLON,
  'uk-pint': 0.56826125,
  'uk-gal': 4.54609,
  'us-bbl': US_GALLON * 31,
};

export default {
  id: 'volume',
  kind: 'converter',
  category: 'units',
  tags: [],
  name: { cs: 'Převod objemu', en: 'Volume converter' },
  description: {
    cs: 'Převod objemu mezi mililitry, litry, hektolitry a americkými i britskými jednotkami (unce, pinta, galon) a pivním barelem (31 US galonů).',
    en: 'Converts volume between millilitres, litres, hectolitres, US and imperial units (ounce, pint, gallon) and the US beer barrel (31 US gallons).',
  },
  keywords: {
    cs: ['objem', 'litr', 'hektolitr', 'mililitr', 'pinta', 'galon', 'unce', 'barel', 'sud'],
    en: ['volume', 'litre', 'liter', 'hectolitre', 'pint', 'gallon', 'fluid ounce', 'barrel', 'bbl'],
  },
  units: [
    { id: 'ml', label: { cs: 'ml', en: 'ml' }, precision: 0, min: 0 },
    { id: 'l', default: 1, label: { cs: 'l', en: 'l' }, precision: 3, min: 0 },
    { id: 'hl', label: { cs: 'hl', en: 'hl' }, precision: 4, min: 0 },
    { id: 'us-floz', label: { cs: 'US fl oz', en: 'US fl oz' }, precision: 2, min: 0 },
    { id: 'us-pint', label: { cs: 'US pinta', en: 'US pint' }, precision: 3, min: 0 },
    { id: 'us-gal', label: { cs: 'US galon', en: 'US gal' }, precision: 3, min: 0 },
    { id: 'uk-pint', label: { cs: 'UK pinta', en: 'UK pint' }, precision: 3, min: 0 },
    { id: 'uk-gal', label: { cs: 'UK galon', en: 'UK gal' }, precision: 3, min: 0 },
    { id: 'us-bbl', label: { cs: 'US barel (pivní)', en: 'US bbl (beer)' }, precision: 4, min: 0 },
  ],
  ...factorConversion(LITRES),
  references: [
    { title: 'NIST Handbook 44, Appendix C: General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' },
    { title: 'Wikipedia: Barrel (unit) – US beer barrel', url: 'https://en.wikipedia.org/wiki/Barrel_(unit)' },
  ],
};
