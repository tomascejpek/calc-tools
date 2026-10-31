/**
 * Length converter: metric, imperial and nautical units.
 */

import { unitTable } from '../../core/converter.js';

const table = unitTable([
  ['nm', 1e-9, 'nm'],
  ['um', 1e-6, 'µm'],
  ['mm', 1e-3, 'mm'],
  ['cm', 1e-2, 'cm'],
  ['dm', 1e-1, 'dm'],
  ['m', 1, 'm'],
  ['km', 1e3, 'km'],
  ['in', 0.0254, { cs: 'palec (in)', en: 'inch (in)' }],
  ['ft', 0.3048, { cs: 'stopa (ft)', en: 'foot (ft)' }],
  ['yd', 0.9144, { cs: 'yard (yd)', en: 'yard (yd)' }],
  ['mi', 1609.344, { cs: 'míle (mi)', en: 'mile (mi)' }],
  ['nmi', 1852, { cs: 'námořní míle', en: 'nautical mile' }],
], { defaultUnit: 'm', defaultValue: 1 });

/** Size of one unit in metres. */
export const METRES = table.factors;

export default {
  id: 'length',
  kind: 'converter',
  category: 'units-basic',
  tags: [],
  name: { cs: 'Převod délky', en: 'Length converter' },
  description: {
    cs: 'Převod délky mezi metrickými jednotkami (nm až km), palci, stopami, yardy, mílemi a námořními mílemi. Palec je přesně 25,4 mm.',
    en: 'Converts length between metric units (nm to km), inches, feet, yards, miles and nautical miles. An inch is exactly 25.4 mm.',
  },
  keywords: {
    cs: ['délka', 'vzdálenost', 'metr', 'centimetr', 'milimetr', 'kilometr', 'palec', 'stopa', 'yard', 'míle', 'námořní míle'],
    en: ['length', 'distance', 'metre', 'meter', 'centimetre', 'kilometre', 'inch', 'foot', 'yard', 'mile', 'nautical mile'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'NIST Handbook 44, Appendix C: General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' },
  ],
};
