/**
 * Lever and pulley block: force needed to hold or lift a load.
 */

import { G0 } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  {
    id: 'machine', type: 'select', default: 'lever', label: { cs: 'Stroj', en: 'Machine' },
    options: [
      { value: 'lever', label: { cs: 'páka', en: 'lever' } },
      { value: 'pulley', label: { cs: 'kladkostroj', en: 'pulley block' } },
    ],
  },
  { id: 'load', type: 'number', default: 50, min: 0, max: 1e9, step: 1, unit: 'kg', label: { cs: 'Hmotnost břemene', en: 'Load mass' } },
  { id: 'loadArm', type: 'number', default: 0.3, min: 0, max: 1e6, step: 0.05, unit: 'm', label: { cs: 'Páka: rameno břemene', en: 'Lever: load arm' } },
  { id: 'effortArm', type: 'number', default: 1.2, min: 1e-9, max: 1e6, step: 0.05, unit: 'm', label: { cs: 'Páka: rameno síly', en: 'Lever: effort arm' } },
  { id: 'ropes', type: 'number', default: 4, min: 1, max: 100, step: 1, label: { cs: 'Kladkostroj: počet nosných lan', en: 'Pulley: supporting rope segments' } },
  { id: 'efficiency', type: 'number', default: 100, min: 1, max: 100, step: 1, unit: '%', label: { cs: 'Účinnost', en: 'Efficiency' } },
];

const outputs = [
  { id: 'force', label: { cs: 'Potřebná síla', en: 'Force needed' }, unit: 'N', significant: 6 },
  { id: 'forceKg', label: { cs: 'Odpovídá tíze', en: 'Equivalent to the weight of' }, unit: 'kg', significant: 6 },
  { id: 'advantage', label: { cs: 'Převod síly', en: 'Mechanical advantage' }, unit: '×', significant: 6 },
  { id: 'travel', label: { cs: 'Dráha síly na 1 m zdvihu břemene', en: 'Effort travel per 1 m of load lift' }, unit: 'm', significant: 6 },
];

export default {
  id: 'lever-pulley',
  kind: 'calculator',
  category: 'physics-mechanics',
  tags: ['physics'],
  name: { cs: 'Páka a kladkostroj', en: 'Lever and pulley' },
  description: {
    cs: 'Jakou silou zvednete břemeno pákou (rovnováha momentů F₁·r₁ = F₂·r₂) nebo kladkostrojem (síla se dělí počtem nosných lan). Co se ušetří na síle, přidá se na dráze. Účinnost zohlední tření.',
    en: 'The force that lifts a load with a lever (balance of moments F₁·r₁ = F₂·r₂) or a pulley block (the force is divided by the number of supporting ropes). What is saved in force is added in distance. Efficiency accounts for friction.',
  },
  keywords: {
    cs: ['páka', 'kladka', 'kladkostroj', 'rameno', 'moment síly', 'převod', 'zvedání'],
    en: ['lever', 'pulley', 'block and tackle', 'mechanical advantage', 'moment', 'lifting'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { machine, load, loadArm, effortArm, ropes, efficiency } = read.values;
    if (machine === 'pulley' && !Number.isInteger(ropes)) {
      return emptyResult(outputs, [{ cs: 'Počet lan musí být celé číslo.', en: 'The number of ropes must be a whole number.' }]);
    }
    if (machine === 'lever' && loadArm === 0) {
      return {
        values: { force: 0, forceKg: 0, advantage: null, travel: null },
        warnings: [{ cs: 'Břemeno leží v ose otáčení; páka žádnou sílu nepotřebuje.', en: 'The load sits on the pivot; the lever needs no force.' }],
      };
    }
    const ideal = machine === 'lever' ? effortArm / loadArm : ropes;
    const advantage = ideal * efficiency / 100;
    const force = load * G0 / advantage;
    return { values: { force, forceKg: force / G0, advantage, travel: ideal }, warnings: [] };
  },
  references: [{ title: 'Halliday, D., Resnick, R., Walker, J.: Fundamentals of Physics – torque and equilibrium' }],
};
