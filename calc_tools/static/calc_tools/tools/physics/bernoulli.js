/**
 * Bernoulli's equation along a streamline.
 */

import { G0 } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Pressure at point 2, Pa.
 * @param {{ p1: number, v1: number, h1: number, v2: number, h2: number, density: number }} flow SI units
 */
export function bernoulliPressure({ p1, v1, h1, v2, h2, density }) {
  return p1 + density * (v1 * v1 - v2 * v2) / 2 + density * G0 * (h1 - h2);
}

const inputs = [
  { id: 'p1', type: 'number', default: 200, min: 0, max: 1e7, step: 1, unit: 'kPa', label: { cs: 'Tlak v bodě 1 (absolutní)', en: 'Pressure at point 1 (absolute)' } },
  { id: 'v1', type: 'number', default: 1.5, min: 0, max: 1e4, step: 0.1, unit: 'm/s', label: { cs: 'Rychlost v bodě 1', en: 'Speed at point 1' } },
  { id: 'h1', type: 'number', default: 0, min: -1e5, max: 1e5, step: 0.5, unit: 'm', label: { cs: 'Výška bodu 1', en: 'Height of point 1' } },
  { id: 'v2', type: 'number', default: 3.4, min: 0, max: 1e4, step: 0.1, unit: 'm/s', label: { cs: 'Rychlost v bodě 2', en: 'Speed at point 2' } },
  { id: 'h2', type: 'number', default: 2, min: -1e5, max: 1e5, step: 0.5, unit: 'm', label: { cs: 'Výška bodu 2', en: 'Height of point 2' } },
  { id: 'density', type: 'number', default: 1000, min: 0.01, max: 25000, step: 1, unit: 'kg/m³', label: { cs: 'Hustota kapaliny', en: 'Liquid density' } },
];

const outputs = [
  { id: 'p2', label: { cs: 'Tlak v bodě 2', en: 'Pressure at point 2' }, unit: 'kPa', significant: 6 },
  { id: 'difference', label: { cs: 'Změna tlaku p₂ − p₁', en: 'Pressure change p₂ − p₁' }, unit: 'kPa', significant: 6 },
  { id: 'dynamic1', label: { cs: 'Dynamický tlak v bodě 1 ½ρv²', en: 'Dynamic pressure at point 1 ½ρv²' }, unit: 'kPa', significant: 6 },
];

export default {
  id: 'bernoulli',
  kind: 'calculator',
  category: 'physics-fluids',
  tags: ['physics'],
  name: { cs: 'Bernoulliho rovnice', en: 'Bernoulli\'s equation' },
  description: {
    cs: 'Tlak v druhém bodě proudící kapaliny podle Bernoulliho rovnice p + ½ρv² + ρgh = konst. Kde kapalina zrychlí nebo vystoupá výš, tlak klesne. Platí pro ideální kapalinu bez tření; ztráty v potrubí počítá Darcyho–Weisbachova rovnice. Rychlosti spočítá rovnice kontinuity.',
    en: 'Pressure at a second point of a flowing liquid by Bernoulli\'s equation p + ½ρv² + ρgh = const. Where the liquid speeds up or rises, the pressure drops. Holds for an ideal liquid without friction; pipe losses are given by the Darcy–Weisbach equation. Speeds follow from the continuity equation.',
  },
  keywords: {
    cs: ['bernoulliho rovnice', 'bernoulli', 'proudění', 'tlak', 'dynamický tlak', 'venturi'],
    en: ['bernoulli equation', 'bernoulli', 'fluid flow', 'pressure', 'dynamic pressure', 'venturi'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const v = read.values;
    const p2 = bernoulliPressure({ ...v, p1: v.p1 * 1000 }) / 1000;
    return {
      values: { p2, difference: p2 - v.p1, dynamic1: v.density * v.v1 * v.v1 / 2 / 1000 },
      warnings: p2 < 0 ? [{ cs: 'Vychází záporný absolutní tlak: kapalina by se zde odtrhla (kavitace).', en: 'The absolute pressure comes out negative: the liquid would cavitate here.' }] : [],
    };
  },
  references: [{ title: 'Halliday, D., Resnick, R., Walker, J.: Fundamentals of Physics – Bernoulli\'s equation' }],
};
