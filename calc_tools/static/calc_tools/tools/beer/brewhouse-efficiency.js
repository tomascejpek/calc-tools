/**
 * Brewhouse efficiency: extract in the wort against the extract in the malt.
 */

import { readGravities, scaleInput } from '../../core/gravity.js';
import { emptyResult, readInputs, withDefaultItem } from '../../core/tool.js';
import { extractKg } from '../../core/units.js';

/** Fields of one fermentable in recipe lists. */
export const MALT_FIELDS = [
  { id: 'kg', type: 'number', default: 5, min: 0, max: 10000, step: 0.1, unit: 'kg', label: { cs: 'Hmotnost', en: 'Weight' } },
  { id: 'extract', type: 'number', default: 80, min: 0, max: 100, step: 0.5, unit: '%', label: { cs: 'Extrakt', en: 'Extract' } },
];

/**
 * Extract the malts could give, kg.
 * @param {{ kg: number, extract: number }[]} malts extract in %
 */
export function potentialExtract(malts) {
  return malts.reduce((sum, malt) => sum + malt.kg * malt.extract / 100, 0);
}

const inputs = [
  {
    id: 'malts', type: 'list', min: 1, max: 20, label: { cs: 'Slad', en: 'Malt' }, fields: MALT_FIELDS,
  },
  { id: 'volume', type: 'number', default: 25, min: 0.1, max: 100000, step: 0.5, unit: 'l', label: { cs: 'Objem mladiny', en: 'Wort volume' } },
  scaleInput('plato'),
  { id: 'gravity', type: 'number', default: 12, step: 0.1, label: { cs: 'Naměřená hustota', en: 'Measured gravity' } },
];

const outputs = [
  { id: 'efficiency', label: { cs: 'Varní výtěžnost', en: 'Brewhouse efficiency' }, unit: '%', precision: 1 },
  { id: 'extract', label: { cs: 'Extrakt v mladině', en: 'Extract in the wort' }, unit: 'kg', precision: 2 },
  { id: 'potential', label: { cs: 'Extrakt ve sladu', en: 'Extract in the malt' }, unit: 'kg', precision: 2 },
];

export default {
  id: 'brewhouse-efficiency',
  kind: 'calculator',
  category: 'efficiency',
  tags: ['beer'],
  name: { cs: 'Varní výtěžnost', en: 'Brewhouse efficiency' },
  description: {
    cs: 'Kolik extraktu ze sladu se dostalo do mladiny. Extrakt v mladině je objem × hustota × °P / 100 (objem při 20 °C), extrakt sladu je hmotnost × % extraktu z listu analýzy. Měřte objem a hustotu ve stejném místě: před chmelovarem pro výtěžnost rmutování, v kvasné nádobě pro celkovou varní výtěžnost.',
    en: 'How much of the malt extract got into the wort. Extract in the wort is volume × density × °P / 100 (volume at 20 °C); malt extract is weight × % extract from the malt analysis. Measure volume and gravity at the same point: before the boil for mash efficiency, in the fermenter for overall brewhouse efficiency.',
  },
  keywords: {
    cs: ['výtěžnost', 'varní výtěžnost', 'účinnost', 'efektivita', 'extrakt', 'rmutování', 'scezování'],
    en: ['brewhouse efficiency', 'mash efficiency', 'efficiency', 'extract', 'yield', 'lautering'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, withDefaultItem(values, 'malts'));
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const gravity = readGravities(inputs, read.values, ['gravity']);
    if (gravity.warnings.length) return emptyResult(outputs, gravity.warnings);
    const potential = potentialExtract(read.values.malts);
    if (potential <= 0) {
      return emptyResult(outputs, [{ cs: 'Zadejte slad s nenulovým extraktem.', en: 'Enter malt with a non-zero extract.' }]);
    }
    const plato = Math.max(0, gravity.plato.gravity);
    const extract = extractKg(plato, read.values.volume);
    const efficiency = extract / potential * 100;
    const warnings = efficiency > 100
      ? [{ cs: 'Výtěžnost nad 100 % – zkontrolujte objem, hustotu a navážku.', en: 'Efficiency above 100 % – check the volume, gravity and grain weight.' }]
      : [];
    return { values: { efficiency, extract, potential }, warnings };
  },
  references: [
    { title: 'Kunze, W.: Technology Brewing and Malting – brewhouse yield = wort volume × density × extract % / malt' },
    { title: 'Troester, K.: Understanding Efficiency', url: 'http://braukaiser.com/wiki/index.php/Understanding_Efficiency' },
  ],
};
