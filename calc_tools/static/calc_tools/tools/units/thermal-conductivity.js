/**
 * Thermal conductivity converter.
 */

import { unitTable } from '../../core/converter.js';

/** BTU_IT per hour, foot and °F in W/(m·K). */
const BTU_H_FT_F = 1055.05585262 / 3600 / 0.3048 * 1.8;

const table = unitTable([
  ['W-mK', 1, 'W/(m·K)'],
  ['mW-mK', 1e-3, 'mW/(m·K)'],
  ['W-cmK', 100, 'W/(cm·K)'],
  ['kcal-hmK', 4186.8 / 3600, 'kcal/(h·m·K)'],
  ['btu-hftF', BTU_H_FT_F, 'BTU/(h·ft·°F)'],
  ['btuin-hft2F', BTU_H_FT_F / 12, 'BTU·in/(h·ft²·°F)'],
], { defaultUnit: 'W-mK', defaultValue: 1 });

export default {
  id: 'thermal-conductivity',
  kind: 'converter',
  category: 'units-heat',
  tags: [],
  name: { cs: 'Převod tepelné vodivosti', en: 'Thermal conductivity converter' },
  description: {
    cs: 'Převod součinitele tepelné vodivosti λ mezi W/(m·K), kcal/(h·m·K) a anglosaskými jednotkami BTU/(h·ft·°F) a BTU·in/(h·ft²·°F), v nichž se udávají izolace. Kilokalorie je mezinárodní (4186,8 J).',
    en: 'Converts thermal conductivity λ between W/(m·K), kcal/(h·m·K) and the US units BTU/(h·ft·°F) and BTU·in/(h·ft²·°F) used for insulation. The kilocalorie is the International Table one (4186.8 J).',
  },
  keywords: {
    cs: ['tepelná vodivost', 'součinitel tepelné vodivosti', 'lambda', 'izolace', 'w/m k'],
    en: ['thermal conductivity', 'lambda', 'k-value', 'insulation', 'w/m k', 'btu'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'NIST Special Publication 811: Guide for the Use of the SI, appendix B', url: 'https://www.nist.gov/pml/special-publication-811' },
  ],
};
