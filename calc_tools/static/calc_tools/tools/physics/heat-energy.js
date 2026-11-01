/**
 * Heat to warm or cool a body: Q = m·c·ΔT.
 */

import { SPECIFIC_HEAT_OPTIONS, specificHeatOf } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'mass', type: 'number', default: 30, min: 0, max: 1e12, step: 0.5, unit: 'kg', label: { cs: 'Hmotnost (u vody kg ≈ l)', en: 'Mass (for water kg ≈ l)' } },
  { id: 'material', type: 'select', default: 'water', label: { cs: 'Látka (měrná tepelná kapacita, kJ/(kg·K))', en: 'Substance (specific heat, kJ/(kg·K))' }, options: SPECIFIC_HEAT_OPTIONS },
  { id: 'custom', type: 'number', default: 4.186, min: 0.01, max: 100, step: 0.01, unit: 'kJ/(kg·K)', label: { cs: 'Vlastní měrná tepelná kapacita', en: 'Custom specific heat' } },
  { id: 'from', type: 'number', default: 15, min: -273.15, max: 5000, step: 1, unit: '°C', label: { cs: 'Počáteční teplota', en: 'Initial temperature' } },
  { id: 'to', type: 'number', default: 78, min: -273.15, max: 5000, step: 1, unit: '°C', label: { cs: 'Konečná teplota', en: 'Final temperature' } },
];

const outputs = [
  { id: 'kj', label: { cs: 'Teplo Q', en: 'Heat Q' }, unit: 'kJ', significant: 6 },
  { id: 'kwh', label: { cs: 'Teplo Q', en: 'Heat Q' }, unit: 'kWh', significant: 6 },
  { id: 'kcal', label: { cs: 'Teplo Q', en: 'Heat Q' }, unit: 'kcal', significant: 6 },
];

export default {
  id: 'heat-energy',
  kind: 'calculator',
  category: 'physics-thermal',
  tags: ['physics', 'beer'],
  name: { cs: 'Teplo pro ohřev (Q = m·c·ΔT)', en: 'Heat for warming (Q = m·c·ΔT)' },
  description: {
    cs: 'Kolik tepla je potřeba k ohřátí (nebo kolik se uvolní při ochlazení) tělesa: Q = m·c·ΔT. Ohřátí 30 l vody z 15 na 78 °C potřebuje asi 7,9 MJ = 2,2 kWh. Nezahrnuje změnu skupenství ani ztráty do okolí.',
    en: 'How much heat warms a body (or is released when it cools): Q = m·c·ΔT. Heating 30 l of water from 15 to 78 °C takes about 7.9 MJ = 2.2 kWh. Phase changes and losses to the surroundings are not included.',
  },
  keywords: {
    cs: ['teplo', 'ohřev', 'měrná tepelná kapacita', 'energie', 'kalorimetrie', 'ohřátí vody', 'kwh'],
    en: ['heat', 'heating', 'specific heat', 'energy', 'calorimetry', 'heating water', 'kwh'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { mass, material, custom, from, to } = read.values;
    const kj = mass * specificHeatOf(material, custom) * (to - from);
    return { values: { kj, kwh: kj / 3600, kcal: kj / 4.184 }, warnings: [] };
  },
  references: [{ title: 'Engineering ToolBox: Specific heat of common substances', url: 'https://www.engineeringtoolbox.com/specific-heat-capacity-d_391.html' }],
};
