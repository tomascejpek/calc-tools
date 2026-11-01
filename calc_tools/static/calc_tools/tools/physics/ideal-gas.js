/**
 * Ideal gas law pV = nRT.
 */

import { KELVIN, R_GAS } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  {
    id: 'find', type: 'select', default: 'n', label: { cs: 'Hledám', en: 'Find' },
    options: [
      { value: 'p', label: { cs: 'tlak p', en: 'pressure p' } },
      { value: 'v', label: { cs: 'objem V', en: 'volume V' } },
      { value: 'n', label: { cs: 'látkové množství n', en: 'amount n' } },
      { value: 't', label: { cs: 'teplotu T', en: 'temperature T' } },
    ],
  },
  { id: 'p', type: 'number', default: 101.325, min: 1e-9, max: 1e9, step: 1, unit: 'kPa', label: { cs: 'Tlak p (absolutní)', en: 'Pressure p (absolute)' } },
  { id: 'v', type: 'number', default: 22.414, min: 1e-12, max: 1e12, step: 0.1, unit: 'l', label: { cs: 'Objem V', en: 'Volume V' } },
  { id: 'n', type: 'number', default: 1, min: 1e-15, max: 1e12, step: 0.1, unit: 'mol', label: { cs: 'Látkové množství n', en: 'Amount n' } },
  { id: 't', type: 'number', default: 0, min: -273.149, max: 1e6, step: 1, unit: '°C', label: { cs: 'Teplota T', en: 'Temperature T' } },
  { id: 'molar', type: 'number', optional: true, default: 44.01, min: 0.001, max: 1e6, step: 0.01, unit: 'g/mol', label: { cs: 'Molární hmotnost (pro hmotnost; CO₂ 44,01)', en: 'Molar mass (for the mass; CO₂ 44.01)' } },
];

const outputs = [
  { id: 'p', label: { cs: 'Tlak', en: 'Pressure' }, unit: 'kPa', significant: 6 },
  { id: 'v', label: { cs: 'Objem', en: 'Volume' }, unit: 'l', significant: 6 },
  { id: 'n', label: { cs: 'Látkové množství', en: 'Amount' }, unit: 'mol', significant: 6 },
  { id: 't', label: { cs: 'Teplota', en: 'Temperature' }, unit: '°C', significant: 6 },
  { id: 'mass', label: { cs: 'Hmotnost plynu', en: 'Gas mass' }, unit: 'g', significant: 6 },
  { id: 'density', label: { cs: 'Hustota plynu', en: 'Gas density' }, unit: 'g/l', significant: 6 },
];

export default {
  id: 'ideal-gas',
  kind: 'calculator',
  category: 'physics-gases',
  tags: ['physics'],
  name: { cs: 'Stavová rovnice ideálního plynu', en: 'Ideal gas law' },
  description: {
    cs: 'Stavová rovnice pV = nRT: ze tří veličin dopočítá čtvrtou, se zadanou molární hmotností i hmotnost a hustotu plynu. Tlak je absolutní (přetlak na manometru + atmosférický tlak). 1 mol ideálního plynu zaujímá za normálních podmínek 22,4 l.',
    en: 'The ideal gas law pV = nRT: works out the fourth quantity from three, and with the molar mass also the mass and density of the gas. The pressure is absolute (gauge reading + atmospheric pressure). 1 mol of an ideal gas takes 22.4 l at standard conditions.',
  },
  keywords: {
    cs: ['stavová rovnice', 'ideální plyn', 'pv = nrt', 'plyn', 'mol', 'látkové množství', 'molární objem'],
    en: ['ideal gas law', 'ideal gas', 'pv=nrt', 'gas', 'mole', 'amount of substance', 'molar volume'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { find, molar } = read.values;
    let p = read.values.p * 1000;
    let v = read.values.v / 1000;
    let { n } = read.values;
    let t = read.values.t + KELVIN;
    if (find === 'p') p = n * R_GAS * t / v;
    else if (find === 'v') v = n * R_GAS * t / p;
    else if (find === 'n') n = p * v / (R_GAS * t);
    else t = p * v / (n * R_GAS);
    const mass = molar === null ? null : n * molar;
    return { values: { p: p / 1000, v: v * 1000, n, t: t - KELVIN, mass, density: mass === null ? null : mass / (v * 1000) }, warnings: [] };
  },
  references: [{ title: 'NIST CODATA: molar gas constant R', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?r' }],
};
