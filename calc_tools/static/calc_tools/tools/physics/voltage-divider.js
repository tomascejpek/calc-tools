/**
 * Resistive voltage divider, optionally loaded.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'vin', type: 'number', default: 12, min: 0, max: 1e6, step: 0.1, unit: 'V', label: { cs: 'Vstupní napětí', en: 'Input voltage' } },
  { id: 'r1', type: 'number', default: 10, min: 1e-9, max: 1e12, step: 1, unit: 'kΩ', label: { cs: 'Horní odpor R₁', en: 'Top resistor R₁' } },
  { id: 'r2', type: 'number', default: 4.7, min: 1e-9, max: 1e12, step: 1, unit: 'kΩ', label: { cs: 'Dolní odpor R₂', en: 'Bottom resistor R₂' } },
  { id: 'load', type: 'number', optional: true, min: 1e-9, max: 1e12, step: 1, unit: 'kΩ', label: { cs: 'Zátěž na výstupu (nepovinné)', en: 'Load on the output (optional)' } },
];

const outputs = [
  { id: 'vout', label: { cs: 'Výstupní napětí', en: 'Output voltage' }, unit: 'V', significant: 6 },
  { id: 'ratio', label: { cs: 'Dělicí poměr', en: 'Division ratio' }, significant: 6 },
  { id: 'current', label: { cs: 'Proud děličem', en: 'Divider current' }, unit: 'mA', significant: 6 },
  { id: 'power', label: { cs: 'Ztrátový výkon v R₁', en: 'Power dissipated in R₁' }, unit: 'mW', significant: 6 },
];

export default {
  id: 'voltage-divider',
  kind: 'calculator',
  category: 'physics-electric',
  tags: ['physics'],
  name: { cs: 'Dělič napětí', en: 'Voltage divider' },
  description: {
    cs: 'Výstupní napětí odporového děliče Uout = Uin · R₂ / (R₁ + R₂). Zadaná zátěž se zapojí paralelně k R₂ a napětí sníží. Dělič se hodí pro měření a referenci, ne k napájení – proud zátěže by měl být mnohem menší než proud děličem.',
    en: 'Output voltage of a resistive divider Vout = Vin · R₂ / (R₁ + R₂). A given load sits in parallel with R₂ and lowers the voltage. A divider suits measurement and references, not powering – the load current should be much smaller than the divider current.',
  },
  keywords: {
    cs: ['dělič napětí', 'odporový dělič', 'výstupní napětí', 'rezistory', 'arduino'],
    en: ['voltage divider', 'resistive divider', 'output voltage', 'resistors', 'potential divider', 'arduino'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { vin, r1, load } = read.values;
    const r2 = load === null ? read.values.r2 : read.values.r2 * load / (read.values.r2 + load);
    const ratio = r2 / (r1 + r2);
    const current = vin / (r1 + r2);
    return { values: { vout: vin * ratio, ratio, current, power: current * current * r1 }, warnings: [] };
  },
  references: [{ title: 'Horowitz, P., Hill, W.: The Art of Electronics, 3rd ed. – voltage dividers' }],
};
