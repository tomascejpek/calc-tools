/**
 * Illuminance converter.
 */

import { unitTable } from '../../core/converter.js';

const table = unitTable([
  ['lx', 1, { cs: 'lx (lux = lm/m²)', en: 'lx (lux = lm/m²)' }],
  ['klx', 1000, 'klx'],
  ['fc', 1 / 0.09290304, { cs: 'fc (foot-candle = lm/ft²)', en: 'fc (foot-candle = lm/ft²)' }],
  ['ph', 1e4, { cs: 'ph (phot = lm/cm²)', en: 'ph (phot = lm/cm²)' }],
], { defaultUnit: 'lx', defaultValue: 500 });

export default {
  id: 'illuminance',
  kind: 'converter',
  category: 'units-light',
  tags: [],
  name: { cs: 'Převod osvětlenosti', en: 'Illuminance converter' },
  description: {
    cs: 'Převod osvětlenosti mezi luxy, kiloluxy, foot-candle a photy. Kancelář potřebuje asi 500 lx, přímé slunce dává kolem 100 klx. Převod mezi lumeny, kandelami a luxy počítá samostatná kalkulačka.',
    en: 'Converts illuminance between lux, kilolux, foot-candles and phots. An office needs about 500 lx, direct sunlight gives around 100 klx. Lumens, candelas and lux are linked by a separate calculator.',
  },
  keywords: {
    cs: ['osvětlenost', 'osvětlení', 'lux', 'lx', 'foot-candle', 'světlo'],
    en: ['illuminance', 'lux', 'lx', 'foot-candle', 'footcandle', 'light level'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'NIST Special Publication 811: Guide for the Use of the SI, appendix B', url: 'https://www.nist.gov/pml/special-publication-811' },
  ],
};
