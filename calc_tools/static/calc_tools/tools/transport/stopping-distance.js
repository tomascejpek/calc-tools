/**
 * Stopping distance of a car: reaction and braking distance.
 */

import { G0 } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/** Tyre–road friction coefficients (typical values for braking). */
export const FRICTION = { dry: 0.8, wet: 0.5, gravel: 0.4, snow: 0.2, ice: 0.1 };

const inputs = [
  { id: 'speed', type: 'number', default: 90, min: 0, max: 400, step: 5, unit: 'km/h', label: { cs: 'Rychlost', en: 'Speed' } },
  {
    id: 'surface', type: 'select', default: 'dry', label: { cs: 'Vozovka', en: 'Road' },
    options: [
      { value: 'dry', label: { cs: 'suchý asfalt (μ ≈ 0,8)', en: 'dry asphalt (μ ≈ 0.8)' } },
      { value: 'wet', label: { cs: 'mokrý asfalt (μ ≈ 0,5)', en: 'wet asphalt (μ ≈ 0.5)' } },
      { value: 'gravel', label: { cs: 'štěrk (μ ≈ 0,4)', en: 'gravel (μ ≈ 0.4)' } },
      { value: 'snow', label: { cs: 'ujetý sníh (μ ≈ 0,2)', en: 'packed snow (μ ≈ 0.2)' } },
      { value: 'ice', label: { cs: 'led (μ ≈ 0,1)', en: 'ice (μ ≈ 0.1)' } },
    ],
  },
  { id: 'reaction', type: 'number', default: 1, min: 0, max: 5, step: 0.1, unit: 's', label: { cs: 'Reakční doba (pozorný řidič ≈ 1 s)', en: 'Reaction time (alert driver ≈ 1 s)' } },
  { id: 'slope', type: 'number', default: 0, min: -30, max: 30, step: 1, unit: '%', label: { cs: 'Sklon (+ do kopce, − z kopce)', en: 'Gradient (+ uphill, − downhill)' } },
];

const outputs = [
  { id: 'total', label: { cs: 'Celková dráha zastavení', en: 'Total stopping distance' }, unit: 'm', precision: 0 },
  { id: 'reactionDistance', label: { cs: 'Reakční dráha', en: 'Reaction distance' }, unit: 'm', precision: 1 },
  { id: 'braking', label: { cs: 'Brzdná dráha', en: 'Braking distance' }, unit: 'm', precision: 1 },
  { id: 'time', label: { cs: 'Doba do zastavení', en: 'Time to stop' }, unit: 's', precision: 1 },
];

export default {
  id: 'stopping-distance',
  kind: 'calculator',
  category: 'transport',
  tags: ['transport'],
  name: { cs: 'Brzdná dráha', en: 'Stopping distance' },
  description: {
    cs: 'Dráha zastavení auta: reakční dráha (než řidič začne brzdit) a brzdná dráha s = v² / (2 · μ · g) podle povrchu vozovky. Dvojnásobná rychlost znamená čtyřnásobnou brzdnou dráhu. Skutečná dráha závisí na pneumatikách, brzdách a ABS; hodnoty berte jako orientační.',
    en: 'Stopping distance of a car: the reaction distance (before the driver starts braking) and the braking distance s = v² / (2 · μ · g) by road surface. Double the speed means four times the braking distance. The real distance depends on tyres, brakes and ABS; treat the values as indicative.',
  },
  keywords: {
    cs: ['brzdná dráha', 'dráha zastavení', 'reakční doba', 'rychlost', 'autoškola', 'náledí', 'mokrá silnice'],
    en: ['stopping distance', 'braking distance', 'reaction time', 'speed', 'driving', 'ice', 'wet road'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { speed, surface, reaction, slope } = read.values;
    const v = speed / 3.6;
    const angle = Math.atan(slope / 100);
    const deceleration = G0 * (FRICTION[/** @type {keyof typeof FRICTION} */ (surface)] * Math.cos(angle) + Math.sin(angle));
    if (deceleration <= 0) return emptyResult(outputs, [{ cs: 'Na tomto sklonu a povrchu auto nezastaví.', en: 'The car cannot stop on this slope and surface.' }]);
    const braking = v * v / (2 * deceleration);
    return { values: { total: v * reaction + braking, reactionDistance: v * reaction, braking, time: reaction + v / deceleration }, warnings: [] };
  },
  references: [{ title: 'Halliday, D., Resnick, R., Walker, J.: Fundamentals of Physics – friction; road friction values after accident reconstruction literature' }],
};
