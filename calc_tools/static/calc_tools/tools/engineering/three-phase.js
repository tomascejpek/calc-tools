/**
 * Single- and three-phase AC power with the power factor.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  {
    id: 'system', type: 'select', default: 'three', label: { cs: 'Soustava', en: 'System' },
    options: [
      { value: 'three', label: { cs: 'třífázová (sdružené napětí, např. 400 V)', en: 'three-phase (line voltage, e.g. 400 V)' } },
      { value: 'single', label: { cs: 'jednofázová (např. 230 V)', en: 'single-phase (e.g. 230 V)' } },
    ],
  },
  {
    id: 'find', type: 'select', default: 'current', label: { cs: 'Hledám', en: 'Find' },
    options: [
      { value: 'current', label: { cs: 'proud z výkonu', en: 'current from power' } },
      { value: 'power', label: { cs: 'výkon z proudu', en: 'power from current' } },
    ],
  },
  { id: 'voltage', type: 'number', default: 400, min: 1, max: 1e6, step: 1, unit: 'V', label: { cs: 'Napětí', en: 'Voltage' } },
  { id: 'power', type: 'number', default: 11, min: 0, max: 1e7, step: 0.1, unit: 'kW', label: { cs: 'Činný výkon P', en: 'Active power P' } },
  { id: 'current', type: 'number', default: 16, min: 0, max: 1e6, step: 0.5, unit: 'A', label: { cs: 'Proud I', en: 'Current I' } },
  { id: 'cosphi', type: 'number', default: 0.85, min: 0.01, max: 1, step: 0.01, label: { cs: 'Účiník cos φ (odpor 1, motor 0,8–0,9)', en: 'Power factor cos φ (resistive 1, motor 0.8–0.9)' } },
];

const outputs = [
  { id: 'current', label: { cs: 'Proud (ve fázi)', en: 'Current (per line)' }, unit: 'A', significant: 4 },
  { id: 'power', label: { cs: 'Činný výkon P', en: 'Active power P' }, unit: 'kW', significant: 4 },
  { id: 'apparent', label: { cs: 'Zdánlivý výkon S', en: 'Apparent power S' }, unit: 'kVA', significant: 4 },
  { id: 'reactive', label: { cs: 'Jalový výkon Q', en: 'Reactive power Q' }, unit: 'kvar', significant: 4 },
];

export default {
  id: 'three-phase',
  kind: 'calculator',
  category: 'eng-electric',
  tags: ['engineering'],
  name: { cs: 'Třífázový výkon a účiník', en: 'Three-phase power and power factor' },
  description: {
    cs: 'Výkon a proud střídavého obvodu: třífázově P = √3 · U · I · cos φ (U sdružené, 400 V), jednofázově P = U · I · cos φ. Ukáže i zdánlivý výkon S = P / cos φ a jalový Q. 11kW spotřebič na 400 V s cos φ = 0,85 odebírá asi 18,7 A v každé fázi.',
    en: 'Power and current of an AC circuit: three-phase P = √3 · U · I · cos φ (line voltage, 400 V), single-phase P = U · I · cos φ. Also shows the apparent power S = P / cos φ and the reactive power Q. An 11 kW load on 400 V with cos φ = 0.85 draws about 18.7 A per line.',
  },
  keywords: {
    cs: ['třífázový výkon', 'tři fáze', '400 v', 'proud', 'účiník', 'cos fí', 'zdánlivý výkon', 'jalový výkon', 'kva'],
    en: ['three-phase power', 'three phase', '400 v', 'current', 'power factor', 'apparent power', 'reactive power', 'kva'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { system, find, voltage, cosphi } = read.values;
    const factor = system === 'three' ? Math.sqrt(3) : 1;
    const current = find === 'current' ? read.values.power * 1000 / (factor * voltage * cosphi) : read.values.current;
    const power = find === 'power' ? factor * voltage * current * cosphi / 1000 : read.values.power;
    const apparent = power / cosphi;
    return { values: { current, power, apparent, reactive: Math.sqrt(Math.max(0, apparent ** 2 - power ** 2)) }, warnings: [] };
  },
  references: [{ title: 'IEC 60050-131: International Electrotechnical Vocabulary – circuit theory (active, reactive, apparent power)' }],
};
