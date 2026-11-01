/**
 * Latent heat of melting and evaporation, and boil-off by power.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** Latent heats, kJ/kg. */
export const LATENT_HEAT = {
  waterBoil: 2257,
  iceMelt: 334,
  ethanolBoil: 841,
};

const inputs = [
  {
    id: 'change', type: 'select', default: 'waterBoil', label: { cs: 'Změna skupenství', en: 'Phase change' },
    options: [
      { value: 'waterBoil', label: { cs: 'var vody při 100 °C (2257 kJ/kg)', en: 'boiling water at 100 °C (2257 kJ/kg)' } },
      { value: 'iceMelt', label: { cs: 'tání ledu při 0 °C (334 kJ/kg)', en: 'melting ice at 0 °C (334 kJ/kg)' } },
      { value: 'ethanolBoil', label: { cs: 'var ethanolu při 78 °C (841 kJ/kg)', en: 'boiling ethanol at 78 °C (841 kJ/kg)' } },
      { value: 'custom', label: { cs: 'zadám sám', en: 'custom' } },
    ],
  },
  { id: 'custom', type: 'number', default: 2257, min: 1, max: 1e5, step: 1, unit: 'kJ/kg', label: { cs: 'Vlastní skupenské teplo', en: 'Custom latent heat' } },
  { id: 'mass', type: 'number', default: 4, min: 0, max: 1e9, step: 0.1, unit: 'kg', label: { cs: 'Množství', en: 'Amount' } },
  { id: 'power', type: 'number', default: 3000, min: 1, max: 1e9, step: 100, unit: 'W', label: { cs: 'Příkon topení', en: 'Heater power' } },
  { id: 'efficiency', type: 'number', default: 90, min: 1, max: 100, step: 1, unit: '%', label: { cs: 'Účinnost', en: 'Efficiency' } },
];

const outputs = [
  { id: 'kj', label: { cs: 'Skupenské teplo', en: 'Latent heat' }, unit: 'kJ', significant: 6 },
  { id: 'kwh', label: { cs: 'Skupenské teplo', en: 'Latent heat' }, unit: 'kWh', significant: 6 },
  { id: 'minutes', label: { cs: 'Doba při daném příkonu', en: 'Time at the given power' }, unit: 'min', precision: 0 },
  { id: 'rate', label: { cs: 'Odpar (tání) za hodinu při daném příkonu', en: 'Evaporated (melted) per hour at the power' }, unit: 'kg/h', significant: 4 },
];

export default {
  id: 'latent-heat',
  kind: 'calculator',
  category: 'physics-thermal',
  tags: ['physics', 'beer'],
  name: { cs: 'Skupenské teplo a odpar', en: 'Latent heat and boil-off' },
  description: {
    cs: 'Teplo na vypaření nebo roztání dané látky a kolik se jí při daném příkonu vypaří za hodinu. 3kW spirála s 90% účinností odpaří při varu asi 4,3 l vody za hodinu – horní mez odparu při chmelovaru; skutečný odpar bývá menší, protože část výkonu pokryje ztráty.',
    en: 'Heat to evaporate or melt a substance and how much of it a given power evaporates per hour. A 3 kW element at 90 % efficiency boils off about 4.3 l of water an hour – an upper limit of boil-off during the boil; real boil-off is lower as part of the power covers losses.',
  },
  keywords: {
    cs: ['skupenské teplo', 'výparné teplo', 'odpar', 'var', 'tání', 'chmelovar', 'vypařování'],
    en: ['latent heat', 'heat of vaporization', 'boil-off', 'evaporation', 'boiling', 'melting', 'heat of fusion'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { change, custom, mass, power, efficiency } = read.values;
    const latent = change === 'custom' ? custom : LATENT_HEAT[/** @type {keyof typeof LATENT_HEAT} */ (change)];
    const kj = mass * latent;
    const useful = power * efficiency / 100;
    return { values: { kj, kwh: kj / 3600, minutes: kj * 1000 / useful / 60, rate: useful * 3600 / (latent * 1000) }, warnings: [] };
  },
  references: [{ title: 'Engineering ToolBox: Latent heat of melting and evaporation', url: 'https://www.engineeringtoolbox.com/latent-heat-melting-solids-d_96.html' }],
};
