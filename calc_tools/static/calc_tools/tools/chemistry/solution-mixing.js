/**
 * Mixing two solutions to a target concentration (cross rule, alligation).
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'high', type: 'number', default: 96, min: 0, max: 1e9, step: 1, unit: '%', label: { cs: 'Koncentrace silnějšího roztoku', en: 'Concentration of the stronger solution' } },
  { id: 'low', type: 'number', default: 0, min: 0, max: 1e9, step: 1, unit: '%', label: { cs: 'Koncentrace slabšího roztoku (voda = 0)', en: 'Concentration of the weaker solution (water = 0)' } },
  { id: 'target', type: 'number', default: 40, min: 0, max: 1e9, step: 1, unit: '%', label: { cs: 'Cílová koncentrace', en: 'Target concentration' } },
  { id: 'total', type: 'number', default: 1000, min: 0, max: 1e15, step: 10, label: { cs: 'Množství směsi (g nebo ml)', en: 'Amount of mixture (g or ml)' } },
];

const outputs = [
  { id: 'highParts', label: { cs: 'Dílů silnějšího roztoku', en: 'Parts of the stronger solution' }, significant: 6 },
  { id: 'lowParts', label: { cs: 'Dílů slabšího roztoku', en: 'Parts of the weaker solution' }, significant: 6 },
  { id: 'highAmount', label: { cs: 'Silnějšího roztoku', en: 'Stronger solution' }, significant: 6 },
  { id: 'lowAmount', label: { cs: 'Slabšího roztoku', en: 'Weaker solution' }, significant: 6 },
];

export default {
  id: 'solution-mixing',
  kind: 'calculator',
  category: 'chemistry-solutions',
  tags: ['chemistry'],
  name: { cs: 'Míchání roztoků (křížové pravidlo)', en: 'Mixing solutions (cross rule)' },
  description: {
    cs: 'Křížové pravidlo: silnějšího roztoku se vezme (cíl − slabší) dílů a slabšího (silnější − cíl) dílů. Z 96 % a vody na 40 % je to 40 dílů na 56. Platí pro hmotnostní procenta a hmotnosti; s objemovými procenty a objemy jen přibližně, kvůli kontrakci (pro lihoviny použijte ředění destilátu).',
    en: 'Cross rule: take (target − weaker) parts of the stronger solution and (stronger − target) parts of the weaker one. From 96 % and water to 40 % it is 40 parts to 56. It holds for mass percent and masses; for volume percent and volumes only roughly, due to contraction (use spirit dilution for spirits).',
  },
  keywords: {
    cs: ['křížové pravidlo', 'míchání roztoků', 'směšovací rovnice', 'koncentrace', 'ředění', 'aligace'],
    en: ['cross rule', 'alligation', 'mixing solutions', 'pearson square', 'concentration', 'dilution'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { high, low, target, total } = read.values;
    if (high <= low) return emptyResult(outputs, [{ cs: 'Silnější roztok musí mít vyšší koncentraci než slabší.', en: 'The stronger solution must be more concentrated than the weaker.' }]);
    if (target < low || target > high) {
      return emptyResult(outputs, [{ cs: 'Cílová koncentrace musí ležet mezi koncentracemi obou roztoků.', en: 'The target must lie between the two concentrations.' }]);
    }
    const highParts = target - low;
    const lowParts = high - target;
    const share = highParts / (highParts + lowParts);
    return { values: { highParts, lowParts, highAmount: total * share, lowAmount: total * (1 - share) }, warnings: [] };
  },
  references: [{ title: 'Wikipedia: Alligation', url: 'https://en.wikipedia.org/wiki/Alligation' }],
};
