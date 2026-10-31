/**
 * Area converter: metric, agricultural and imperial units.
 */

import { unitTable } from '../../core/converter.js';

const table = unitTable([
  ['mm2', 1e-6, 'mm²'],
  ['cm2', 1e-4, 'cm²'],
  ['dm2', 1e-2, 'dm²'],
  ['m2', 1, 'm²'],
  ['a', 100, { cs: 'ar (a)', en: 'are (a)' }],
  ['ha', 1e4, { cs: 'hektar (ha)', en: 'hectare (ha)' }],
  ['km2', 1e6, 'km²'],
  ['in2', 0.00064516, { cs: 'čtvereční palec', en: 'square inch' }],
  ['ft2', 0.09290304, { cs: 'čtvereční stopa', en: 'square foot' }],
  ['yd2', 0.83612736, { cs: 'čtvereční yard', en: 'square yard' }],
  ['acre', 4046.8564224, { cs: 'akr', en: 'acre' }],
  ['mi2', 2589988.110336, { cs: 'čtvereční míle', en: 'square mile' }],
], { defaultUnit: 'm2', defaultValue: 1 });

/** Size of one unit in square metres. */
export const SQUARE_METRES = table.factors;

export default {
  id: 'area',
  kind: 'converter',
  category: 'units-basic',
  tags: [],
  name: { cs: 'Převod plochy', en: 'Area converter' },
  description: {
    cs: 'Převod plochy mezi metrickými jednotkami, ary, hektary a anglosaskými jednotkami (čtvereční palec, stopa, yard, míle a akr).',
    en: 'Converts area between metric units, ares, hectares and imperial units (square inch, foot, yard, mile and acre).',
  },
  keywords: {
    cs: ['plocha', 'výměra', 'rozloha', 'metr čtvereční', 'ar', 'hektar', 'akr', 'čtvereční'],
    en: ['area', 'square metre', 'square meter', 'are', 'hectare', 'acre', 'square foot', 'square mile'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'NIST Handbook 44, Appendix C: General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' },
  ],
};
