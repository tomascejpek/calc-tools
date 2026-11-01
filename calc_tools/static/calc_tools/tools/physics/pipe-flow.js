/**
 * Flow speed in pipes by the continuity equation.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'flow', type: 'number', default: 10, min: 0, max: 1e9, step: 0.5, unit: 'l/min', label: { cs: 'Průtok', en: 'Flow rate' } },
  { id: 'd1', type: 'number', default: 12, min: 0.01, max: 1e5, step: 0.5, unit: 'mm', label: { cs: 'Vnitřní průměr 1', en: 'Inner diameter 1' } },
  { id: 'd2', type: 'number', default: 8, min: 0.01, max: 1e5, step: 0.5, unit: 'mm', label: { cs: 'Vnitřní průměr 2 (zúžení)', en: 'Inner diameter 2 (narrowing)' } },
];

const outputs = [
  { id: 'v1', label: { cs: 'Rychlost v průměru 1', en: 'Speed in diameter 1' }, unit: 'm/s', significant: 6 },
  { id: 'v2', label: { cs: 'Rychlost v průměru 2', en: 'Speed in diameter 2' }, unit: 'm/s', significant: 6 },
  { id: 'area1', label: { cs: 'Průřez 1', en: 'Cross-section 1' }, unit: 'mm²', significant: 6 },
  { id: 'area2', label: { cs: 'Průřez 2', en: 'Cross-section 2' }, unit: 'mm²', significant: 6 },
];

export default {
  id: 'pipe-flow',
  kind: 'calculator',
  category: 'physics-fluids',
  tags: ['physics'],
  name: { cs: 'Průtok potrubím (rovnice kontinuity)', en: 'Pipe flow (continuity equation)' },
  description: {
    cs: 'Rychlost proudění v potrubí z průtoku a vnitřního průměru: v = Q / S. Podle rovnice kontinuity S₁·v₁ = S₂·v₂ se v užším místě proudění zrychlí s druhou mocninou poměru průměrů.',
    en: 'Flow speed in a pipe from the flow rate and inner diameter: v = Q / A. By the continuity equation A₁·v₁ = A₂·v₂ the flow speeds up in a narrower section with the square of the diameter ratio.',
  },
  keywords: {
    cs: ['průtok', 'potrubí', 'rovnice kontinuity', 'rychlost proudění', 'hadice', 'průřez'],
    en: ['pipe flow', 'continuity equation', 'flow velocity', 'flow rate', 'hose', 'cross-section'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { flow, d1, d2 } = read.values;
    const q = flow / 1000 / 60;
    const area = (/** @type {number} */ d) => Math.PI * (d / 2) ** 2;
    return {
      values: { v1: q / (area(d1) * 1e-6), v2: q / (area(d2) * 1e-6), area1: area(d1), area2: area(d2) },
      warnings: [],
    };
  },
  references: [{ title: 'Halliday, D., Resnick, R., Walker, J.: Fundamentals of Physics – equation of continuity' }],
};
