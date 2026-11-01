/**
 * How long a battery runs a load.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'capacity', type: 'number', default: 100, min: 0.001, max: 1e7, step: 1, unit: 'Ah', label: { cs: 'Kapacita baterie', en: 'Battery capacity' } },
  { id: 'voltage', type: 'number', default: 12, min: 0.1, max: 2000, step: 0.1, unit: 'V', label: { cs: 'Jmenovité napětí baterie', en: 'Battery nominal voltage' } },
  { id: 'load', type: 'number', default: 60, min: 0.001, max: 1e8, step: 1, unit: 'W', label: { cs: 'Příkon spotřebiče', en: 'Load power' } },
  { id: 'usable', type: 'number', default: 80, min: 1, max: 100, step: 5, unit: '%', label: { cs: 'Využitelná kapacita (olovo ≈ 50, LiFePO₄ ≈ 80–90)', en: 'Usable capacity (lead-acid ≈ 50, LiFePO₄ ≈ 80–90)' } },
  { id: 'efficiency', type: 'number', default: 90, min: 1, max: 100, step: 1, unit: '%', label: { cs: 'Účinnost měniče nebo regulátoru', en: 'Inverter or regulator efficiency' } },
];

const outputs = [
  { id: 'hours', label: { cs: 'Výdrž', en: 'Runtime' }, unit: 'h', significant: 4 },
  { id: 'energy', label: { cs: 'Využitelná energie', en: 'Usable energy' }, unit: 'Wh', significant: 4 },
  { id: 'current', label: { cs: 'Proud z baterie', en: 'Battery current' }, unit: 'A', significant: 4 },
];

export default {
  id: 'battery-runtime',
  kind: 'calculator',
  category: 'physics-electric',
  tags: ['physics'],
  name: { cs: 'Výdrž baterie', en: 'Battery runtime' },
  description: {
    cs: 'Jak dlouho baterie napájí spotřebič: t = kapacita × napětí × využitelný podíl × účinnost / příkon. Olověné baterie se nemají vybíjet pod polovinu, lithiové snesou hlubší vybití. Při velkém odběru je skutečná kapacita olověných baterií menší (Peukertův jev).',
    en: 'How long a battery powers a load: t = capacity × voltage × usable share × efficiency / power. Lead-acid batteries should not go below half, lithium ones take deeper discharge. At high draw the real capacity of lead-acid batteries is lower (Peukert effect).',
  },
  keywords: {
    cs: ['výdrž baterie', 'baterie', 'akumulátor', 'kapacita', 'ah', 'wh', 'powerbanka', 'záložní zdroj', 'měnič'],
    en: ['battery runtime', 'battery life', 'battery', 'capacity', 'ah', 'wh', 'power bank', 'ups', 'inverter'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { capacity, voltage, load, usable, efficiency } = read.values;
    const energy = capacity * voltage * usable / 100;
    return { values: { hours: energy * efficiency / 100 / load, energy, current: load / (efficiency / 100) / voltage }, warnings: [] };
  },
  references: [{ title: 'Linden, D., Reddy, T. B.: Handbook of Batteries – capacity and depth of discharge' }],
};
