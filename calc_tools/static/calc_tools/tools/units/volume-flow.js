/**
 * Volumetric flow rate converter.
 */

import { unitTable } from '../../core/converter.js';

const table = unitTable([
  ['ml-min', 1e-3 / 60, 'ml/min'],
  ['l-s', 1, 'l/s'],
  ['l-min', 1 / 60, 'l/min'],
  ['l-h', 1 / 3600, 'l/h'],
  ['m3-h', 1000 / 3600, 'm³/h'],
  ['m3-s', 1000, 'm³/s'],
  ['usgpm', 3.785411784 / 60, { cs: 'US galon/min (GPM)', en: 'US gal/min (GPM)' }],
  ['ukgpm', 4.54609 / 60, { cs: 'UK galon/min', en: 'UK gal/min' }],
  ['cfm', 28.316846592 / 60, { cs: 'ft³/min (CFM)', en: 'ft³/min (CFM)' }],
], { defaultUnit: 'l-min', defaultValue: 10 });

export default {
  id: 'volume-flow',
  kind: 'converter',
  category: 'units-flow',
  tags: ['beer'],
  name: { cs: 'Převod objemového průtoku', en: 'Volume flow converter' },
  description: {
    cs: 'Převod objemového průtoku mezi litry za sekundu, minutu a hodinu, krychlovými metry za hodinu a sekundu, galony za minutu (GPM) a krychlovými stopami za minutu (CFM), např. pro čerpadla a chladiče.',
    en: 'Converts volume flow between litres per second, minute and hour, cubic metres per hour and second, gallons per minute (GPM) and cubic feet per minute (CFM), e.g. for pumps and chillers.',
  },
  keywords: {
    cs: ['průtok', 'objemový průtok', 'l/min', 'm3/h', 'gpm', 'cfm', 'čerpadlo'],
    en: ['flow rate', 'volume flow', 'l/min', 'm3/h', 'gpm', 'cfm', 'pump'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'NIST Handbook 44, Appendix C: General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' },
  ],
};
