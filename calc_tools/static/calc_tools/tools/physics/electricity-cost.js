/**
 * Electricity used by an appliance and its cost.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'power', type: 'number', default: 2000, min: 0, max: 1e9, step: 10, unit: 'W', label: { cs: 'Příkon spotřebiče', en: 'Appliance power' } },
  { id: 'hours', type: 'number', default: 1, min: 0, max: 24, step: 0.25, unit: 'h', label: { cs: 'Provoz denně', en: 'Use per day' } },
  { id: 'days', type: 'number', default: 365, min: 0, max: 36500, step: 1, label: { cs: 'Počet dní', en: 'Number of days' } },
  { id: 'price', type: 'number', default: 6, min: 0, max: 1e6, step: 0.1, label: { cs: 'Cena za kWh (s DPH a poplatky)', en: 'Price per kWh (with tax and fees)' } },
];

const outputs = [
  { id: 'kwhDay', label: { cs: 'Spotřeba za den', en: 'Energy per day' }, unit: 'kWh', precision: 2 },
  { id: 'kwh', label: { cs: 'Spotřeba celkem', en: 'Total energy' }, unit: 'kWh', precision: 1 },
  { id: 'costDay', label: { cs: 'Cena za den', en: 'Cost per day' }, precision: 2 },
  { id: 'cost', label: { cs: 'Cena celkem', en: 'Total cost' }, precision: 2 },
];

export default {
  id: 'electricity-cost',
  kind: 'calculator',
  category: 'physics-electric',
  tags: ['physics'],
  name: { cs: 'Cena elektřiny za spotřebič', en: 'Electricity cost of an appliance' },
  description: {
    cs: 'Kolik spotřebič spotřebuje a stojí: W × h / 1000 × cena za kWh. Do ceny započtěte i distribuci, poplatky a DPH, nejlépe celkovou cenu z vyúčtování vydělenou spotřebou. Spotřebiče s termostatem (lednice, bojler) běží jen část doby.',
    en: 'How much an appliance uses and costs: W × h / 1000 × price per kWh. Include distribution, fees and VAT in the price, ideally the total from your bill divided by consumption. Appliances with a thermostat (fridge, water heater) run only part of the time.',
  },
  keywords: {
    cs: ['cena elektřiny', 'spotřeba elektřiny', 'kwh', 'spotřebič', 'kolik stojí', 'příkon', 'účet za elektřinu'],
    en: ['electricity cost', 'energy cost', 'power consumption', 'kwh', 'appliance', 'running cost', 'electric bill'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { power, hours, days, price } = read.values;
    const kwhDay = power * hours / 1000;
    return { values: { kwhDay, kwh: kwhDay * days, costDay: kwhDay * price, cost: kwhDay * days * price }, warnings: [] };
  },
  references: [{ title: 'Energetický regulační úřad: ceny elektřiny a jejich složky', url: 'https://www.eru.cz/' }],
};
