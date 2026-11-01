/**
 * Uniformly accelerated motion.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'v0', type: 'number', default: 20, min: -1e8, max: 1e8, step: 1, unit: 'm/s', label: { cs: 'Počáteční rychlost v₀', en: 'Initial speed v₀' } },
  { id: 'a', type: 'number', default: -5, min: -1e8, max: 1e8, step: 0.5, unit: 'm/s²', label: { cs: 'Zrychlení a (záporné = brzdění)', en: 'Acceleration a (negative = braking)' } },
  { id: 't', type: 'number', default: 3, min: 0, max: 1e9, step: 0.5, unit: 's', label: { cs: 'Čas t', en: 'Time t' } },
];

const outputs = [
  { id: 'v', label: { cs: 'Rychlost v čase t', en: 'Speed at time t' }, unit: 'm/s', significant: 8 },
  { id: 's', label: { cs: 'Ujetá dráha s', en: 'Distance travelled s' }, unit: 'm', significant: 8 },
  { id: 'average', label: { cs: 'Průměrná rychlost', en: 'Average speed' }, unit: 'm/s', significant: 8 },
  { id: 'stopTime', label: { cs: 'Doba do zastavení', en: 'Time to stop' }, unit: 's', significant: 8 },
  { id: 'stopDistance', label: { cs: 'Brzdná dráha', en: 'Stopping distance' }, unit: 'm', significant: 8 },
];

export default {
  id: 'accelerated-motion',
  kind: 'calculator',
  category: 'physics-mechanics',
  tags: ['physics'],
  name: { cs: 'Rovnoměrně zrychlený pohyb', en: 'Uniformly accelerated motion' },
  description: {
    cs: 'Rychlost v = v₀ + a·t a dráha s = v₀·t + ½·a·t² při stálém zrychlení. Při brzdění (a < 0) spočítá i dobu do zastavení a brzdnou dráhu v₀² / (2|a|). Dráha nezahrnuje případný pohyb zpět po zastavení.',
    en: 'Speed v = v₀ + a·t and distance s = v₀·t + ½·a·t² at constant acceleration. When braking (a < 0) it also works out the time to stop and the stopping distance v₀² / (2|a|). The distance does not include any motion backwards after stopping.',
  },
  keywords: {
    cs: ['zrychlený pohyb', 'zrychlení', 'rychlost', 'dráha', 'brzdná dráha', 'brzdění', 'kinematika'],
    en: ['accelerated motion', 'acceleration', 'velocity', 'distance', 'stopping distance', 'braking', 'kinematics', 'suvat'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { v0, a, t } = read.values;
    const braking = a < 0 && v0 > 0;
    const stopTime = braking ? v0 / -a : null;
    const s = v0 * t + a * t * t / 2;
    return {
      values: {
        v: v0 + a * t,
        s,
        average: t > 0 ? s / t : v0,
        stopTime,
        stopDistance: braking ? v0 * v0 / (2 * -a) : null,
      },
      warnings: braking && t > /** @type {number} */ (stopTime)
        ? [{ cs: 'Těleso se zastaví dřív než v čase t; další hodnoty předpokládají pohyb zpět.', en: 'The body stops before time t; the values beyond assume it moves back.' }]
        : [],
    };
  },
  references: [{ title: 'Halliday, D., Resnick, R., Walker, J.: Fundamentals of Physics – motion with constant acceleration' }],
};
