/**
 * Rule of three for direct and inverse proportion.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * @param {'direct' | 'inverse'} kind
 * @param {number} a1
 * @param {number} b1
 * @param {number} a2
 * @returns {number | null}
 */
export function ruleOfThree(kind, a1, b1, a2) {
  if (kind === 'direct') return a1 === 0 ? null : b1 * a2 / a1;
  return a2 === 0 ? null : b1 * a1 / a2;
}

const inputs = [
  {
    id: 'kind', type: 'select', default: 'direct', label: { cs: 'Úměra', en: 'Proportion' },
    options: [
      { value: 'direct', label: { cs: 'přímá (víc → víc)', en: 'direct (more → more)' } },
      { value: 'inverse', label: { cs: 'nepřímá (víc → méně)', en: 'inverse (more → less)' } },
    ],
  },
  { id: 'a1', type: 'number', default: 3, step: 1, label: { cs: 'Známá hodnota A', en: 'Known value A' } },
  { id: 'b1', type: 'number', default: 60, step: 1, label: { cs: 'Odpovídající hodnota B', en: 'Matching value B' } },
  { id: 'a2', type: 'number', default: 5, step: 1, label: { cs: 'Nová hodnota A', en: 'New value A' } },
];

const outputs = [
  { id: 'b2', label: { cs: 'Hledaná hodnota B', en: 'Value B sought' }, significant: 12 },
];

export default {
  id: 'rule-of-three',
  kind: 'calculator',
  category: 'math-arithmetic',
  tags: ['math'],
  name: { cs: 'Trojčlenka', en: 'Rule of three' },
  description: {
    cs: 'Trojčlenka: když A₁ odpovídá B₁, kolik odpovídá A₂? Přímá úměra (3 kg stojí 60 Kč → 5 kg stojí 100 Kč): B₂ = B₁ · A₂ / A₁. Nepřímá úměra (3 dělníci za 60 h → 5 dělníků za 36 h): B₂ = B₁ · A₁ / A₂.',
    en: 'Rule of three: if A₁ goes with B₁, what goes with A₂? Direct proportion (3 kg cost 60 → 5 kg cost 100): B₂ = B₁ · A₂ / A₁. Inverse proportion (3 workers take 60 h → 5 workers take 36 h): B₂ = B₁ · A₁ / A₂.',
  },
  keywords: {
    cs: ['trojčlenka', 'úměra', 'přímá úměra', 'nepřímá úměra', 'poměr', 'přepočet'],
    en: ['rule of three', 'proportion', 'direct proportion', 'inverse proportion', 'ratio', 'cross multiplication'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { kind, a1, b1, a2 } = read.values;
    const b2 = ruleOfThree(kind, a1, b1, a2);
    if (b2 === null) return emptyResult(outputs, [{ cs: 'Dělení nulou.', en: 'Division by zero.' }]);
    return { values: { b2 }, warnings: [] };
  },
  references: [{ title: 'Wikipedia: Cross-multiplication – rule of three', url: 'https://en.wikipedia.org/wiki/Cross-multiplication' }],
};
