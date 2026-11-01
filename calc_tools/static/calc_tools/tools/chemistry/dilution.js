/**
 * Dilution c₁V₁ = c₂V₂.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  {
    id: 'find', type: 'select', default: 'v1', label: { cs: 'Hledám', en: 'Find' },
    options: [
      { value: 'v1', label: { cs: 'objem zásobního roztoku V₁', en: 'stock volume V₁' } },
      { value: 'c2', label: { cs: 'výslednou koncentraci c₂', en: 'final concentration c₂' } },
      { value: 'v2', label: { cs: 'výsledný objem V₂', en: 'final volume V₂' } },
      { value: 'c1', label: { cs: 'koncentraci zásobního roztoku c₁', en: 'stock concentration c₁' } },
    ],
  },
  { id: 'c1', type: 'number', default: 80, min: 1e-15, max: 1e9, step: 1, label: { cs: 'Koncentrace zásobního roztoku c₁', en: 'Stock concentration c₁' } },
  { id: 'v1', type: 'number', default: 10, min: 1e-15, max: 1e12, step: 1, label: { cs: 'Objem zásobního roztoku V₁', en: 'Stock volume V₁' } },
  { id: 'c2', type: 'number', default: 5, min: 1e-15, max: 1e9, step: 1, label: { cs: 'Výsledná koncentrace c₂', en: 'Final concentration c₂' } },
  { id: 'v2', type: 'number', default: 1000, min: 1e-15, max: 1e12, step: 1, label: { cs: 'Výsledný objem V₂', en: 'Final volume V₂' } },
];

const outputs = [
  { id: 'c1', label: { cs: 'c₁', en: 'c₁' }, significant: 6 },
  { id: 'v1', label: { cs: 'V₁', en: 'V₁' }, significant: 6 },
  { id: 'c2', label: { cs: 'c₂', en: 'c₂' }, significant: 6 },
  { id: 'v2', label: { cs: 'V₂', en: 'V₂' }, significant: 6 },
  { id: 'solvent', label: { cs: 'Doplnit rozpouštědla V₂ − V₁', en: 'Solvent to add V₂ − V₁' }, significant: 6 },
];

export default {
  id: 'dilution',
  kind: 'calculator',
  category: 'chemistry-solutions',
  tags: ['chemistry'],
  name: { cs: 'Ředění roztoku (c₁V₁ = c₂V₂)', en: 'Dilution (c₁V₁ = c₂V₂)' },
  description: {
    cs: 'Ředění: množství rozpuštěné látky se nemění, c₁·V₁ = c₂·V₂. Koncentrace i objemy mohou být v libovolných, ale stejných jednotkách (%, mol/l, g/l; ml, l). Kolik ml 80% kyseliny mléčné na 1 l 5% roztoku? 62,5 ml. Objemová kontrakce při mísení se zanedbává.',
    en: 'Dilution: the amount of dissolved substance stays the same, c₁·V₁ = c₂·V₂. Concentrations and volumes may be in any units as long as they match (%, mol/l, g/l; ml, l). How many ml of 80 % lactic acid for 1 l of 5 % solution? 62.5 ml. Volume contraction on mixing is ignored.',
  },
  keywords: {
    cs: ['ředění', 'c1v1 c2v2', 'zředění', 'zásobní roztok', 'koncentrace', 'objem', 'roztok'],
    en: ['dilution', 'c1v1 c2v2', 'dilute', 'stock solution', 'concentration', 'volume', 'solution'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    let { c1, v1, c2, v2 } = read.values;
    const { find } = read.values;
    if (find === 'v1') v1 = c2 * v2 / c1;
    else if (find === 'c2') c2 = c1 * v1 / v2;
    else if (find === 'v2') v2 = c1 * v1 / c2;
    else c1 = c2 * v2 / v1;
    if (c2 > c1 * (1 + 1e-12)) {
      return emptyResult(outputs, [{ cs: 'Ředěním nelze koncentraci zvýšit.', en: 'Dilution cannot raise the concentration.' }]);
    }
    return { values: { c1, v1, c2, v2, solvent: v2 - v1 }, warnings: [] };
  },
  references: [{ title: 'Harris, D. C.: Quantitative Chemical Analysis – preparing solutions by dilution' }],
};
