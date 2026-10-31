/**
 * Density converter.
 */

import { unitTable } from '../../core/converter.js';

const LB = 0.45359237;

const table = unitTable([
  ['kg-m3', 1, { cs: 'kg/m³ (= g/l)', en: 'kg/m³ (= g/l)' }],
  ['g-cm3', 1000, { cs: 'g/cm³ (= kg/l = g/ml)', en: 'g/cm³ (= kg/l = g/ml)' }],
  ['t-m3', 1000, 't/m³'],
  ['lb-ft3', LB / 0.028316846592, 'lb/ft³'],
  ['lb-usgal', LB / 0.003785411784, 'lb/US gal'],
  ['lb-ukgal', LB / 0.00454609, 'lb/UK gal'],
  ['lb-in3', LB / 0.000016387064, 'lb/in³'],
], { defaultUnit: 'g-cm3', defaultValue: 1 });

export default {
  id: 'density',
  kind: 'converter',
  category: 'units-concentration',
  tags: ['beer'],
  name: { cs: 'Převod hustoty', en: 'Density converter' },
  description: {
    cs: 'Převod hustoty mezi kg/m³ (totéž co g/l), g/cm³ (totéž co kg/l a g/ml) a librami na krychlovou stopu, galon a krychlový palec. Voda má při 4 °C hustotu 1 g/cm³.',
    en: 'Converts density between kg/m³ (same as g/l), g/cm³ (same as kg/l and g/ml) and pounds per cubic foot, gallon and cubic inch. Water at 4 °C has a density of 1 g/cm³.',
  },
  keywords: {
    cs: ['hustota', 'měrná hmotnost', 'kg/m3', 'g/cm3', 'g/ml', 'lb/gal'],
    en: ['density', 'specific mass', 'kg/m3', 'g/cm3', 'g/ml', 'lb/gal', 'lb/ft3'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'NIST Special Publication 811: Guide for the Use of the SI, appendix B', url: 'https://www.nist.gov/pml/special-publication-811' },
  ],
};
