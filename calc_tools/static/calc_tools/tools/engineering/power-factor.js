/**
 * Power factor correction: capacitor bank for a target cos φ.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'power', type: 'number', default: 50, min: 0.001, max: 1e7, step: 1, unit: 'kW', label: { cs: 'Činný výkon', en: 'Active power' } },
  { id: 'current', type: 'number', default: 0.75, min: 0.01, max: 1, step: 0.01, label: { cs: 'Současný účiník cos φ₁', en: 'Present power factor cos φ₁' } },
  { id: 'target', type: 'number', default: 0.95, min: 0.01, max: 1, step: 0.01, label: { cs: 'Cílový účiník cos φ₂', en: 'Target power factor cos φ₂' } },
  { id: 'voltage', type: 'number', default: 400, min: 1, max: 1e6, step: 1, unit: 'V', label: { cs: 'Sdružené napětí', en: 'Line voltage' } },
  { id: 'frequency', type: 'number', default: 50, min: 1, max: 1000, step: 1, unit: 'Hz', label: { cs: 'Frekvence', en: 'Frequency' } },
];

const outputs = [
  { id: 'kvar', label: { cs: 'Potřebný kompenzační výkon', en: 'Compensation needed' }, unit: 'kvar', significant: 4 },
  { id: 'deltaMicrofarad', label: { cs: 'Kapacita na fázi, zapojení do trojúhelníku', en: 'Capacitance per phase, delta connection' }, unit: 'µF', significant: 4 },
  { id: 'starMicrofarad', label: { cs: 'Kapacita na fázi, zapojení do hvězdy', en: 'Capacitance per phase, star connection' }, unit: 'µF', significant: 4 },
  { id: 'currentReduction', label: { cs: 'Snížení proudu', en: 'Current reduction' }, unit: '%', significant: 3 },
];

export default {
  id: 'power-factor',
  kind: 'calculator',
  category: 'eng-electric',
  tags: ['engineering'],
  name: { cs: 'Kompenzace účiníku', en: 'Power factor correction' },
  description: {
    cs: 'Jaký kompenzační výkon kondenzátorů zvýší účiník z cos φ₁ na cos φ₂: Qc = P · (tg φ₁ − tg φ₂), a jaká je kapacita na fázi třífázové baterie v trojúhelníku nebo hvězdě. Distributor v Česku vyžaduje u odběratelů na vysokém napětí účiník aspoň 0,95; nedokompenzování i překompenzování se platí.',
    en: 'Which capacitor compensation raises the power factor from cos φ₁ to cos φ₂: Qc = P · (tan φ₁ − tan φ₂), and the capacitance per phase of a three-phase bank in delta or star. Utilities typically require at least 0.95; both under- and over-compensation are charged.',
  },
  keywords: {
    cs: ['kompenzace účiníku', 'účiník', 'cos fí', 'kondenzátor', 'jalový výkon', 'kvar', 'kompenzační baterie'],
    en: ['power factor correction', 'power factor', 'capacitor bank', 'reactive power', 'kvar', 'compensation'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { power, current, target, voltage, frequency } = read.values;
    if (target <= current) return emptyResult(outputs, [{ cs: 'Cílový účiník musí být vyšší než současný.', en: 'The target power factor must be higher than the present one.' }]);
    const tan = (/** @type {number} */ cos) => Math.sqrt(1 - cos * cos) / cos;
    const kvar = power * (tan(current) - tan(target));
    const omega = 2 * Math.PI * frequency;
    // Per phase: delta sees the line voltage, star the phase voltage
    const perPhase = kvar * 1000 / 3;
    return {
      values: {
        kvar,
        deltaMicrofarad: perPhase / (omega * voltage ** 2) * 1e6,
        starMicrofarad: perPhase / (omega * (voltage / Math.sqrt(3)) ** 2) * 1e6,
        currentReduction: (1 - current / target) * 100,
      },
      warnings: [],
    };
  },
  references: [{ title: 'IEC 60831-1: Shunt power capacitors of the self-healing type for AC systems' }],
};
