/**
 * Original gravity of a recipe from its fermentables and the efficiency.
 */

import { emptyResult, readInputs, withDefaultItem } from '../../core/tool.js';
import { platoFromExtract, platoToSg } from '../../core/units.js';
import { MALT_FIELDS } from './brewhouse-efficiency.js';

/**
 * Extract reaching the wort, kg. Mashed grain gives its extract times the
 * efficiency; sugars and malt extracts dissolve completely.
 * @param {{ kg: number, extract: number, mashed: boolean }[]} fermentables extract in %
 * @param {number} efficiency %
 */
export function recipeExtract(fermentables, efficiency) {
  return fermentables.reduce(
    (sum, item) => sum + item.kg * item.extract / 100 * (item.mashed ? efficiency / 100 : 1),
    0,
  );
}

const inputs = [
  {
    id: 'fermentables', type: 'list', min: 1, max: 20, label: { cs: 'Surovina', en: 'Fermentable' },
    fields: [
      ...MALT_FIELDS,
      {
        id: 'type', type: 'select', default: 'mashed', label: { cs: 'Druh', en: 'Kind' },
        options: [
          { value: 'mashed', label: { cs: 'slad, rmutuje se', en: 'grain, mashed' } },
          { value: 'dissolved', label: { cs: 'cukr nebo sladový extrakt', en: 'sugar or malt extract' } },
        ],
      },
    ],
  },
  { id: 'volume', type: 'number', default: 20, min: 0.1, max: 100000, step: 0.5, unit: 'l', label: { cs: 'Objem mladiny', en: 'Wort volume' } },
  { id: 'efficiency', type: 'number', default: 75, min: 1, max: 100, step: 1, unit: '%', label: { cs: 'Varní výtěžnost', en: 'Brewhouse efficiency' } },
];

const outputs = [
  { id: 'plato', label: { cs: 'Stupňovitost', en: 'Original extract' }, unit: '°P', precision: 1 },
  { id: 'og', label: { cs: 'Původní hustota', en: 'Original gravity' }, unit: 'SG', precision: 3 },
  { id: 'extract', label: { cs: 'Extrakt v mladině', en: 'Extract in the wort' }, unit: 'kg', precision: 2 },
];

export default {
  id: 'og-estimate',
  kind: 'calculator',
  category: 'efficiency',
  tags: ['beer'],
  name: { cs: 'Odhad stupňovitosti z receptu', en: 'Original gravity from a recipe' },
  description: {
    cs: 'Jakou stupňovitost (OG) bude mít mladina z dané sypání při očekávané varní výtěžnosti. Rmutovaný slad dává svůj extrakt krát výtěžnost, cukr a sladový extrakt se rozpustí celé. Objem je objem mladiny při 20 °C.',
    en: 'Which original gravity a grain bill gives at an expected brewhouse efficiency. Mashed grain gives its extract times the efficiency; sugar and malt extract dissolve completely. The volume is the wort volume at 20 °C.',
  },
  keywords: {
    cs: ['og', 'stupňovitost', 'původní hustota', 'recept', 'sypání', 'výtěžnost', 'extrakt', 'odhad'],
    en: ['original gravity', 'og', 'recipe', 'grain bill', 'efficiency', 'extract', 'estimate'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, withDefaultItem(values, 'fermentables'));
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { fermentables, volume, efficiency } = read.values;
    const extract = recipeExtract(
      fermentables.map((/** @type {any} */ item) => ({ ...item, mashed: item.type === 'mashed' })),
      efficiency,
    );
    const plato = platoFromExtract(extract, volume);
    if (plato === null) {
      return emptyResult(outputs, [{ cs: 'Tolik extraktu se do tohoto objemu nevejde.', en: 'This much extract does not fit into this volume.' }]);
    }
    return { values: { plato, og: platoToSg(plato), extract }, warnings: [] };
  },
  references: [
    { title: 'Kunze, W.: Technology Brewing and Malting – extract balance of the brewhouse' },
    { title: 'Palmer, J.: How to Brew, 4th ed., ch. 18 – Estimating the original gravity' },
  ],
};
