/**
 * Mechanical work and power.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'force', type: 'number', default: 500, min: -1e12, max: 1e12, step: 10, unit: 'N', label: { cs: 'Síla F', en: 'Force F' } },
  { id: 'distance', type: 'number', default: 10, min: 0, max: 1e12, step: 1, unit: 'm', label: { cs: 'Dráha s', en: 'Distance s' } },
  { id: 'angle', type: 'number', default: 0, min: 0, max: 180, step: 5, unit: '°', label: { cs: 'Úhel mezi silou a směrem pohybu', en: 'Angle between force and motion' } },
  { id: 'time', type: 'number', default: 20, min: 1e-9, max: 1e12, step: 1, unit: 's', label: { cs: 'Doba t', en: 'Time t' } },
];

const outputs = [
  { id: 'work', label: { cs: 'Práce W = F·s·cos α', en: 'Work W = F·s·cos α' }, unit: 'J', significant: 8 },
  { id: 'power', label: { cs: 'Výkon P = W / t', en: 'Power P = W / t' }, unit: 'W', significant: 8 },
  { id: 'kwh', label: { cs: 'Práce', en: 'Work' }, unit: 'kWh', significant: 6 },
];

export default {
  id: 'work-power',
  kind: 'calculator',
  category: 'physics-mechanics',
  tags: ['physics'],
  name: { cs: 'Práce a výkon', en: 'Work and power' },
  description: {
    cs: 'Mechanická práce W = F·s·cos α, kterou síla vykoná po dráze s, a výkon P = W / t. Síla kolmá na pohyb (α = 90°) práci nekoná, proti pohybu (α = 180°) koná práci zápornou.',
    en: 'Mechanical work W = F·s·cos α done by a force over distance s, and power P = W / t. A force at right angles to the motion (α = 90°) does no work, against the motion (α = 180°) negative work.',
  },
  keywords: {
    cs: ['práce', 'výkon', 'síla', 'joule', 'watt', 'mechanická práce'],
    en: ['work', 'power', 'force', 'joule', 'watt', 'mechanical work'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { force, distance, angle, time } = read.values;
    const cos = Math.abs(angle - 90) < 1e-12 ? 0 : Math.cos(angle * Math.PI / 180);
    const work = force * distance * cos + 0;
    return { values: { work, power: work / time, kwh: work / 3.6e6 }, warnings: [] };
  },
  references: [{ title: 'Halliday, D., Resnick, R., Walker, J.: Fundamentals of Physics – work and power' }],
};
