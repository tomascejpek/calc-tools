/**
 * Estimated alcohol content from the degree (°P) and expected attenuation,
 * answering the common Czech question "how strong is a ten".
 */

import { platoToSg } from '../../core/units.js';
import { emptyResult, readInputs } from '../../core/tool.js';
import { abvStandard } from './abv.js';

/** Typical apparent attenuation of each preset, %. */
export const PRESETS = {
  draught: 78,
  lager: 75,
  'low-alcohol': 12,
};

/**
 * Estimated ABV from original extract and apparent attenuation.
 * @param {number} plato original extract, °P
 * @param {number} attenuation apparent attenuation, %
 */
export function estimateAbv(plato, attenuation) {
  const og = platoToSg(plato);
  const fg = platoToSg(plato * (1 - attenuation / 100));
  return abvStandard(og, fg);
}

const inputs = [
  { id: 'plato', type: 'number', default: 10, min: 0, max: 40, step: 0.1, unit: '°P', label: { cs: 'Stupňovitost', en: 'Original extract' } },
  {
    id: 'preset', type: 'select', default: 'custom', label: { cs: 'Prokvašení', en: 'Attenuation' },
    options: [
      { value: 'custom', label: { cs: 'zadám sám', en: 'custom' } },
      { value: 'draught', label: { cs: `výčepní pivo (≈ ${PRESETS.draught} %)`, en: `Czech draught beer (≈ ${PRESETS.draught} %)` } },
      { value: 'lager', label: { cs: `ležák (≈ ${PRESETS.lager} %)`, en: `Czech lager (≈ ${PRESETS.lager} %)` } },
      { value: 'low-alcohol', label: { cs: `nealko, zastavené kvašení (≈ ${PRESETS['low-alcohol']} %)`, en: `non-alcoholic, arrested fermentation (≈ ${PRESETS['low-alcohol']} %)` } },
    ],
  },
  { id: 'attenuation', type: 'number', default: 75, min: 0, max: 100, step: 1, unit: '%', label: { cs: 'Zdánlivé prokvašení', en: 'Apparent attenuation' } },
];

const outputs = [
  { id: 'abv', label: { cs: 'Odhad alkoholu', en: 'Estimated alcohol' }, unit: { cs: '% obj.', en: '% ABV' }, precision: 1 },
  { id: 'attenuation', label: { cs: 'Použité prokvašení', en: 'Attenuation used' }, unit: '%', precision: 0 },
  { id: 'og', label: { cs: 'Původní hustota', en: 'Original gravity' }, unit: 'SG', precision: 3 },
  { id: 'fg', label: { cs: 'Konečná hustota', en: 'Final gravity' }, unit: 'SG', precision: 3 },
];

export default {
  id: 'degree-to-abv',
  kind: 'calculator',
  category: 'fermentation',
  tags: ['beer'],
  name: { cs: 'Alkohol podle stupňovitosti', en: 'Alcohol from degree Plato' },
  description: {
    cs: 'Kolik má desítka nebo dvanáctka? Odhad obsahu alkoholu ze stupňovitosti (původního extraktu v °P) a předpokládaného zdánlivého prokvašení. Skutečný obsah závisí na kvasnicích a postupu; přednastavení jsou orientační.',
    en: 'How strong is a Czech "ten" or "twelve"? Estimates alcohol from the original extract (°P) and an expected apparent attenuation. Actual strength depends on the yeast and process; presets are indicative.',
  },
  keywords: {
    cs: ['stupňovitost', 'stupně', 'desítka', 'jedenáctka', 'dvanáctka', 'kolik má', 'alkohol', 'prokvašení', 'výčepní', 'ležák', 'nealko'],
    en: ['degree', 'plato', 'alcohol estimate', 'abv', 'attenuation', 'czech lager', 'draught'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { plato, preset } = read.values;
    const attenuation = preset === 'custom' ? read.values.attenuation : PRESETS[/** @type {keyof typeof PRESETS} */ (preset)];
    const warnings = [];
    if (preset === 'low-alcohol') {
      warnings.push({
        cs: 'Většina nealkoholických piv se vyrábí odalkoholizací, ne zastaveným kvašením; odhad platí jen pro druhý případ.',
        en: 'Most non-alcoholic beers are dealcoholised rather than made by arrested fermentation; the estimate covers only the latter.',
      });
    }
    const og = platoToSg(plato);
    const fg = platoToSg(plato * (1 - attenuation / 100));
    return { values: { abv: abvStandard(og, fg), attenuation, og, fg }, warnings };
  },
  references: [
    { title: 'ASBC Methods of Analysis: Table for extract determination in wort and beer (SG ⇄ °Plato polynomial)' },
    { title: 'Wikipedia: Beer measurement', url: 'https://en.wikipedia.org/wiki/Beer_measurement' },
  ],
};
