/**
 * Yeast starter growth on a stir plate (Kai Troester's model).
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { extractKg } from '../../core/units.js';

/** Extract per kg of dry malt extract. */
export const DME_EXTRACT = 0.95;

/**
 * New cells grown in a stir plate starter, billions. Troester: below 1.4
 * billion cells per gram of extract growth is 1.4 billion per gram; from 1.4
 * to 3.5 it falls linearly as (2.33 − 0.67 × inoculation); above 3.5 there
 * is almost none.
 * @param {number} cells billions pitched into the starter
 * @param {number} extractGrams grams of extract in the starter
 */
export function starterGrowth(cells, extractGrams) {
  if (extractGrams <= 0) return 0;
  const inoculation = cells / extractGrams;
  if (inoculation < 1.4) return 1.4 * extractGrams;
  if (inoculation < 3.5) return Math.max(0, (2.33 - 0.67 * inoculation) * extractGrams);
  return 0;
}

const inputs = [
  { id: 'cells', type: 'number', default: 100, min: 0, max: 100000, step: 1, unit: { cs: 'mld.', en: 'billion' }, label: { cs: 'Živých buněk na začátku', en: 'Viable cells pitched' } },
  { id: 'volume', type: 'number', default: 2, min: 0.1, max: 1000, step: 0.1, unit: 'l', label: { cs: 'Objem startéru', en: 'Starter volume' } },
  { id: 'plato', type: 'number', default: 10, min: 1, max: 20, step: 0.5, unit: '°P', label: { cs: 'Stupňovitost startéru', en: 'Starter gravity' } },
];

const outputs = [
  { id: 'total', label: { cs: 'Buněk po namnožení', en: 'Cells after growth' }, unit: { cs: 'mld.', en: 'billion' }, precision: 0 },
  { id: 'growth', label: { cs: 'Nově narostlo', en: 'New cells' }, unit: { cs: 'mld.', en: 'billion' }, precision: 0 },
  { id: 'factor', label: { cs: 'Násobek', en: 'Growth factor' }, unit: '×', precision: 1 },
  { id: 'dme', label: { cs: 'Sušeného sladového extraktu', en: 'Dry malt extract' }, unit: 'g', precision: 0 },
  { id: 'inoculation', label: { cs: 'Buněk na gram extraktu', en: 'Cells per gram of extract' }, unit: { cs: 'mld./g', en: 'billion/g' }, precision: 2 },
];

export default {
  id: 'yeast-starter',
  kind: 'calculator',
  category: 'yeast',
  tags: ['beer'],
  name: { cs: 'Kvasnicový startér', en: 'Yeast starter' },
  description: {
    cs: 'Kolik buněk naroste ve startéru na magnetické míchačce a kolik sušeného sladového extraktu na něj rozpustit. Podle Kaie Troestera přiroste asi 1,4 miliardy buněk na gram extraktu, dokud na gram nepřipadá víc než 1,4 miliardy buněk; při větším zákvasu růst klesá a nad 3,5 miliardy na gram se zastaví. Bez míchačky počítejte asi s polovinou.',
    en: 'How many cells grow in a stir plate starter and how much dry malt extract to dissolve for it. After Kai Troester, about 1.4 billion cells grow per gram of extract while there are fewer than 1.4 billion cells per gram; with more yeast the growth falls and stops above 3.5 billion per gram. Without a stir plate expect about half.',
  },
  keywords: {
    cs: ['startér', 'kvasnicový startér', 'namnožení', 'růst kvasnic', 'míchačka', 'kvasnice', 'sladový extrakt'],
    en: ['starter', 'yeast starter', 'yeast growth', 'stir plate', 'propagation', 'dme', 'braukaiser'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { cells, volume, plato } = read.values;
    const extractGrams = extractKg(plato, volume) * 1000;
    const growth = starterGrowth(cells, extractGrams);
    const total = cells + growth;
    const warnings = growth === 0 && cells > 0
      ? [{ cs: 'Na tolik kvasnic je startér malý; kvasnice se téměř nemnoží.', en: 'The starter is too small for this much yeast; there is almost no growth.' }]
      : [];
    return {
      values: {
        total,
        growth,
        factor: cells > 0 ? total / cells : null,
        dme: extractGrams / DME_EXTRACT,
        inoculation: cells / extractGrams,
      },
      warnings,
    };
  },
  references: [
    { title: 'Troester, K.: Yeast growth in stir plate starters, braukaiser.com (2012)' },
  ],
};
