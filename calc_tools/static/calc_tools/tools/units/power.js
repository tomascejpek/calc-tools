/**
 * Power converter.
 */

import { unitTable } from '../../core/converter.js';
import { BTU } from './energy.js';

/** Mechanical horsepower, W (550 ft·lbf/s). */
export const HORSEPOWER = 550 * 0.3048 * 0.45359237 * 9.80665;
/** Metric horsepower (kůň, PS), W (75 kp·m/s). */
export const METRIC_HORSEPOWER = 75 * 9.80665;

const table = unitTable([
  ['mW', 1e-3, 'mW'],
  ['W', 1, 'W'],
  ['kW', 1e3, 'kW'],
  ['MW', 1e6, 'MW'],
  ['k', METRIC_HORSEPOWER, { cs: 'k (koňská síla, PS)', en: 'PS (metric horsepower)' }],
  ['hp', HORSEPOWER, { cs: 'hp (britská koňská síla)', en: 'hp (mechanical horsepower)' }],
  ['btu-h', BTU / 3600, 'BTU/h'],
  ['kcal-h', 4184 / 3600, 'kcal/h'],
], { defaultUnit: 'kW', defaultValue: 1 });

export default {
  id: 'power',
  kind: 'converter',
  category: 'units-mechanics',
  tags: [],
  name: { cs: 'Převod výkonu', en: 'Power converter' },
  description: {
    cs: 'Převod výkonu mezi watty, koňskými silami (metrický kůň 735,5 W, britská hp 745,7 W), BTU za hodinu a kilokaloriemi za hodinu.',
    en: 'Converts power between watts, horsepower (metric PS 735.5 W, mechanical hp 745.7 W), BTU per hour and kilocalories per hour.',
  },
  keywords: {
    cs: ['výkon', 'příkon', 'watt', 'kilowatt', 'koňská síla', 'kůň', 'hp', 'ps', 'btu'],
    en: ['power', 'watt', 'kilowatt', 'horsepower', 'hp', 'ps', 'metric horsepower', 'btu/h'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'NIST Special Publication 811: Guide for the Use of the SI, appendix B', url: 'https://www.nist.gov/pml/special-publication-811' },
  ],
};
