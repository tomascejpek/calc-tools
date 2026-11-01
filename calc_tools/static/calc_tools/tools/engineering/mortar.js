/**
 * Mortar for masonry and plaster for walls.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** Share of mortar in a wall by masonry type. */
export const MORTAR_SHARE = { brick: 0.25, block: 0.08, thinJoint: 0.015 };

const inputs = [
  {
    id: 'work', type: 'select', default: 'plaster', label: { cs: 'Práce', en: 'Work' },
    options: [
      { value: 'plaster', label: { cs: 'omítka (plocha × tloušťka)', en: 'plaster (area × thickness)' } },
      { value: 'brick', label: { cs: 'zdění z cihel plných (malta ≈ 25 % zdiva)', en: 'solid brick masonry (mortar ≈ 25 %)' } },
      { value: 'block', label: { cs: 'zdění z tvárnic na maltu (≈ 8 %)', en: 'blocks laid in mortar (≈ 8 %)' } },
      { value: 'thinJoint', label: { cs: 'broušené tvárnice na tenkovrstvou maltu (≈ 1,5 %)', en: 'thin-joint blocks (≈ 1.5 %)' } },
    ],
  },
  { id: 'area', type: 'number', default: 40, min: 0, max: 1e6, step: 1, unit: 'm²', label: { cs: 'Plocha stěny', en: 'Wall area' } },
  { id: 'thickness', type: 'number', default: 15, min: 1, max: 1000, step: 1, unit: 'mm', label: { cs: 'Tloušťka omítky nebo zdiva', en: 'Plaster or wall thickness' } },
  { id: 'yield', type: 'number', default: 15, min: 1, max: 100, step: 0.5, unit: { cs: 'l z pytle', en: 'l per bag' }, label: { cs: 'Výtěžnost pytle (údaj na obalu)', en: 'Bag yield (from the bag)' } },
  { id: 'waste', type: 'number', default: 10, min: 0, max: 50, step: 1, unit: '%', label: { cs: 'Rezerva na ztráty', en: 'Waste allowance' } },
];

const outputs = [
  { id: 'litres', label: { cs: 'Čerstvé malty', en: 'Fresh mortar' }, unit: 'l', precision: 0 },
  { id: 'bags', label: { cs: 'Pytlů suché směsi', en: 'Bags of dry mix' }, precision: 0 },
];

export default {
  id: 'mortar',
  kind: 'calculator',
  category: 'eng-material',
  tags: ['engineering'],
  name: { cs: 'Spotřeba malty a omítky', en: 'Mortar and plaster' },
  description: {
    cs: 'Kolik malty na omítku (plocha × tloušťka) nebo na zdění podle typu zdiva a kolik pytlů suché směsi podle výtěžnosti z obalu (obvykle 13–17 l čerstvé malty z 25 kg). Podíl malty ve zdivu je orientační; tvárnice s kapsami a dutinami spotřebují víc.',
    en: 'How much mortar for plastering (area × thickness) or for masonry by wall type, and how many bags of dry mix by the yield on the bag (usually 13–17 l of fresh mortar per 25 kg). The mortar share in masonry is approximate; blocks with pockets and voids use more.',
  },
  keywords: {
    cs: ['malta', 'omítka', 'zdění', 'spotřeba malty', 'pytle', 'suchá směs', 'tvárnice', 'cihly'],
    en: ['mortar', 'plaster', 'render', 'masonry', 'bricklaying', 'dry mix', 'bags', 'blocks'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { work, area, thickness, waste } = read.values;
    const volume = area * thickness / 1000;
    const share = work === 'plaster' ? 1 : MORTAR_SHARE[/** @type {keyof typeof MORTAR_SHARE} */ (work)];
    const litres = volume * share * 1000 * (1 + waste / 100);
    return { values: { litres, bags: Math.ceil(litres / read.values.yield) }, warnings: [] };
  },
  references: [{ title: 'ČSN EN 998-1, -2: Specifikace malt pro zdivo – malty pro vnitřní a vnější omítky, malty pro zdění' }],
};
