/**
 * Momentum and one-dimensional collisions.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Velocities after a 1D collision.
 * @param {number} m1
 * @param {number} v1
 * @param {number} m2
 * @param {number} v2
 * @param {number} restitution 1 elastic, 0 perfectly inelastic
 */
export function collide(m1, v1, m2, v2, restitution) {
  const total = m1 + m2;
  const centre = (m1 * v1 + m2 * v2) / total;
  return {
    u1: centre - restitution * m2 * (v1 - v2) / total,
    u2: centre + restitution * m1 * (v1 - v2) / total,
  };
}

const inputs = [
  { id: 'm1', type: 'number', default: 2, min: 1e-9, max: 1e12, step: 0.1, unit: 'kg', label: { cs: 'Hmotnost 1. tělesa', en: 'Mass of body 1' } },
  { id: 'v1', type: 'number', default: 3, min: -1e8, max: 1e8, step: 0.1, unit: 'm/s', label: { cs: 'Rychlost 1. tělesa', en: 'Velocity of body 1' } },
  { id: 'm2', type: 'number', default: 1, min: 1e-9, max: 1e12, step: 0.1, unit: 'kg', label: { cs: 'Hmotnost 2. tělesa', en: 'Mass of body 2' } },
  { id: 'v2', type: 'number', default: 0, min: -1e8, max: 1e8, step: 0.1, unit: 'm/s', label: { cs: 'Rychlost 2. tělesa', en: 'Velocity of body 2' } },
  { id: 'restitution', type: 'number', default: 1, min: 0, max: 1, step: 0.1, label: { cs: 'Součinitel restituce (1 pružná, 0 dokonale nepružná srážka)', en: 'Coefficient of restitution (1 elastic, 0 perfectly inelastic)' } },
];

const outputs = [
  { id: 'p1', label: { cs: 'Hybnost 1. tělesa', en: 'Momentum of body 1' }, unit: 'kg·m/s', significant: 8 },
  { id: 'p2', label: { cs: 'Hybnost 2. tělesa', en: 'Momentum of body 2' }, unit: 'kg·m/s', significant: 8 },
  { id: 'u1', label: { cs: 'Rychlost 1. tělesa po srážce', en: 'Velocity of body 1 after' }, unit: 'm/s', significant: 8 },
  { id: 'u2', label: { cs: 'Rychlost 2. tělesa po srážce', en: 'Velocity of body 2 after' }, unit: 'm/s', significant: 8 },
  { id: 'energyLoss', label: { cs: 'Kinetická energie přeměněná srážkou', en: 'Kinetic energy lost in the collision' }, unit: 'J', significant: 8 },
];

export default {
  id: 'momentum',
  kind: 'calculator',
  category: 'physics-mechanics',
  tags: ['physics'],
  name: { cs: 'Hybnost a srážky', en: 'Momentum and collisions' },
  description: {
    cs: 'Hybnost p = m·v dvou těles a jejich rychlosti po přímé srážce. Celková hybnost se zachovává; u pružné srážky i kinetická energie, u nepružné se část přemění na teplo a deformaci. Rychlosti mají znaménko podle směru.',
    en: 'Momentum p = m·v of two bodies and their velocities after a head-on collision. Total momentum is conserved; in an elastic collision kinetic energy too, in an inelastic one part of it turns into heat and deformation. Velocities are signed by direction.',
  },
  keywords: {
    cs: ['hybnost', 'srážka', 'pružná srážka', 'nepružná srážka', 'zákon zachování hybnosti', 'restituce'],
    en: ['momentum', 'collision', 'elastic collision', 'inelastic collision', 'conservation of momentum', 'restitution'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { m1, v1, m2, v2, restitution } = read.values;
    const { u1, u2 } = collide(m1, v1, m2, v2, restitution);
    const energy = (/** @type {number} */ a, /** @type {number} */ b) => (m1 * a * a + m2 * b * b) / 2;
    const warnings = v1 <= v2 ? [{ cs: 'Těleso 1 těleso 2 nedohání, ke srážce nedojde.', en: 'Body 1 does not catch up with body 2; they do not collide.' }] : [];
    return {
      values: { p1: m1 * v1, p2: m2 * v2, u1: v1 <= v2 ? v1 : u1, u2: v1 <= v2 ? v2 : u2, energyLoss: v1 <= v2 ? 0 : Math.max(0, energy(v1, v2) - energy(u1, u2)) },
      warnings,
    };
  },
  references: [{ title: 'Halliday, D., Resnick, R., Walker, J.: Fundamentals of Physics – collisions in one dimension' }],
};
