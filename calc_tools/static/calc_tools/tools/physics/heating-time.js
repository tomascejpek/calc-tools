/**
 * Time to heat a liquid with a given power.
 */

import { SPECIFIC_HEAT_OPTIONS, specificHeatOf } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'mass', type: 'number', default: 30, min: 0, max: 1e9, step: 0.5, unit: 'kg', label: { cs: 'Množství (u vody kg ≈ l)', en: 'Amount (for water kg ≈ l)' } },
  { id: 'material', type: 'select', default: 'water', label: { cs: 'Kapalina', en: 'Liquid' }, options: SPECIFIC_HEAT_OPTIONS },
  { id: 'custom', type: 'number', default: 4.186, min: 0.01, max: 100, step: 0.01, unit: 'kJ/(kg·K)', label: { cs: 'Vlastní měrná tepelná kapacita', en: 'Custom specific heat' } },
  { id: 'from', type: 'number', default: 15, min: -50, max: 5000, step: 1, unit: '°C', label: { cs: 'Počáteční teplota', en: 'Initial temperature' } },
  { id: 'to', type: 'number', default: 100, min: -50, max: 5000, step: 1, unit: '°C', label: { cs: 'Cílová teplota', en: 'Target temperature' } },
  { id: 'power', type: 'number', default: 3000, min: 1, max: 1e9, step: 100, unit: 'W', label: { cs: 'Příkon topení', en: 'Heater power' } },
  { id: 'efficiency', type: 'number', default: 90, min: 1, max: 100, step: 1, unit: '%', label: { cs: 'Účinnost (ztráty do okolí)', en: 'Efficiency (losses to the surroundings)' } },
  { id: 'price', type: 'number', default: 6, min: 0, max: 1e6, step: 0.1, label: { cs: 'Cena elektřiny za kWh', en: 'Electricity price per kWh' } },
];

const outputs = [
  { id: 'minutes', label: { cs: 'Doba ohřevu', en: 'Heating time' }, unit: 'min', precision: 0 },
  { id: 'energy', label: { cs: 'Spotřebovaná energie', en: 'Energy used' }, unit: 'kWh', precision: 2 },
  { id: 'cost', label: { cs: 'Cena', en: 'Cost' }, precision: 2 },
  { id: 'rate', label: { cs: 'Rychlost ohřevu', en: 'Heating rate' }, unit: '°C/min', precision: 2 },
];

export default {
  id: 'heating-time',
  kind: 'calculator',
  category: 'physics-thermal',
  tags: ['physics', 'beer'],
  name: { cs: 'Doba ohřevu podle příkonu', en: 'Heating time by power' },
  description: {
    cs: 'Za jak dlouho ohřeje topná spirála nebo varná deska daný objem: t = m·c·ΔT / (P·η). 30 l vody z 15 °C k varu s 3kW spirálou trvá asi 66 minut. Účinnost zohledňuje ztráty do okolí; u zakryté izolované nádoby bývá 85–95 %, na otevřeném plynu méně. Do varu nepočítá odpar.',
    en: 'How long a heating element or hob takes to heat a volume: t = m·c·ΔT / (P·η). 30 l of water from 15 °C to the boil with a 3 kW element takes about 66 minutes. Efficiency accounts for losses; a covered, insulated pot reaches 85–95 %, an open gas burner less. Boiling off is not included.',
  },
  keywords: {
    cs: ['doba ohřevu', 'ohřev vody', 'topná spirála', 'příkon', 'varná konvice', 'za jak dlouho', 'rmutovací pánev', 'cena elektřiny'],
    en: ['heating time', 'heating water', 'heating element', 'power', 'kettle', 'how long', 'brew kettle', 'electricity cost'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { mass, material, custom, from, to, power, efficiency, price } = read.values;
    if (to <= from) return emptyResult(outputs, [{ cs: 'Cílová teplota musí být vyšší než počáteční.', en: 'The target must be warmer than the start.' }]);
    const heat = mass * specificHeatOf(material, custom) * (to - from) * 1000;
    const seconds = heat / (power * efficiency / 100);
    const energy = power * seconds / 3.6e6;
    return {
      values: { minutes: seconds / 60, energy, cost: energy * price, rate: (to - from) / (seconds / 60) },
      warnings: material === 'water' && to > 100 ? [{ cs: 'Voda nad 100 °C se při normálním tlaku vaří; teplo na odpar počítá jiný nástroj.', en: 'Water above 100 °C boils at normal pressure; boil-off heat is in another tool.' }] : [],
    };
  },
  references: [{ title: 'Halliday, D., Resnick, R., Walker, J.: Fundamentals of Physics – heat capacity' }],
};
