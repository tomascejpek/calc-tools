/**
 * Projectile motion (oblique throw) without air resistance.
 */

import { G0 } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * @param {number} speed m/s
 * @param {number} degrees launch angle above the horizontal
 * @param {number} height launch height above the landing level, m
 * @param {number} g m/s²
 */
export function projectile(speed, degrees, height, g) {
  const angle = degrees * Math.PI / 180;
  const vx = speed * Math.cos(angle);
  const vy = speed * Math.sin(angle);
  const time = (vy + Math.sqrt(vy * vy + 2 * g * height)) / g;
  return {
    range: vx * time,
    time,
    maxHeight: height + Math.max(0, vy) ** 2 / (2 * g),
    impactSpeed: Math.sqrt(vx * vx + vy * vy + 2 * g * height),
  };
}

const inputs = [
  { id: 'speed', type: 'number', default: 20, min: 0, max: 1e5, step: 1, unit: 'm/s', label: { cs: 'Počáteční rychlost', en: 'Launch speed' } },
  { id: 'angle', type: 'number', default: 45, min: -90, max: 90, step: 1, unit: '°', label: { cs: 'Úhel vrhu nad vodorovnou rovinou', en: 'Launch angle above horizontal' } },
  { id: 'height', type: 'number', default: 0, min: 0, max: 1e5, step: 0.5, unit: 'm', label: { cs: 'Výška vrhu nad místem dopadu', en: 'Launch height above the landing point' } },
  { id: 'g', type: 'number', default: G0, min: 0.01, max: 1000, step: 0.01, unit: 'm/s²', label: { cs: 'Tíhové zrychlení g', en: 'Gravity g' } },
];

const outputs = [
  { id: 'range', label: { cs: 'Dolet', en: 'Range' }, unit: 'm', significant: 6 },
  { id: 'maxHeight', label: { cs: 'Největší výška', en: 'Maximum height' }, unit: 'm', significant: 6 },
  { id: 'time', label: { cs: 'Doba letu', en: 'Flight time' }, unit: 's', significant: 6 },
  { id: 'impactSpeed', label: { cs: 'Rychlost dopadu', en: 'Impact speed' }, unit: 'm/s', significant: 6 },
];

export default {
  id: 'projectile',
  kind: 'calculator',
  category: 'physics-mechanics',
  tags: ['physics'],
  name: { cs: 'Šikmý vrh', en: 'Projectile motion' },
  description: {
    cs: 'Dolet, největší výška, doba letu a rychlost dopadu tělesa vrženého pod úhlem, i z vyvýšeného místa, bez odporu vzduchu. Ze stejné výšky dolétne nejdál vrh pod 45°. Úhel 0° je vodorovný vrh, záporný úhel míří dolů.',
    en: 'Range, maximum height, flight time and impact speed of a body thrown at an angle, also from a raised point, without air resistance. From the same height a 45° throw goes furthest. An angle of 0° is a horizontal throw, a negative angle points down.',
  },
  keywords: {
    cs: ['šikmý vrh', 'vodorovný vrh', 'vrh', 'dolet', 'balistika', 'trajektorie', 'parabola'],
    en: ['projectile motion', 'projectile', 'throw', 'range', 'trajectory', 'ballistics', 'launch angle'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { speed, angle, height, g } = read.values;
    if (speed === 0 && height === 0) return { values: { range: 0, maxHeight: 0, time: 0, impactSpeed: 0 }, warnings: [] };
    return { values: projectile(speed, angle, height, g), warnings: [] };
  },
  references: [{ title: 'Halliday, D., Resnick, R., Walker, J.: Fundamentals of Physics – projectile motion' }],
};
