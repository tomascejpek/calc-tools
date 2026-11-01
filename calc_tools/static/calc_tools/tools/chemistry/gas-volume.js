/**
 * Volume of a gas at standard or chosen conditions.
 */

import { formulaMass } from '../../core/chemistry.js';
import { KELVIN, R_GAS } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';
import { BAD_FORMULA, FORMULA_INPUT } from './molar-mass.js';

/** Temperature (°C) and pressure (kPa) of reference conditions. */
export const CONDITIONS = {
  stp: { t: 0, p: 101.325 },
  iupac: { t: 0, p: 100 },
  ntp: { t: 20, p: 101.325 },
  satp: { t: 25, p: 100 },
};

const inputs = [
  { id: 'formula', ...FORMULA_INPUT, default: 'CO2', label: { cs: 'Plyn (vzorec)', en: 'Gas (formula)' } },
  {
    id: 'known', type: 'select', default: 'mass', label: { cs: 'Znám', en: 'I know' },
    options: [
      { value: 'mass', label: { cs: 'hmotnost (g)', en: 'mass (g)' } },
      { value: 'moles', label: { cs: 'látkové množství (mol)', en: 'amount (mol)' } },
      { value: 'volume', label: { cs: 'objem (l)', en: 'volume (l)' } },
    ],
  },
  { id: 'value', type: 'number', default: 44.01, min: 0, max: 1e15, step: 1, label: { cs: 'Hodnota', en: 'Value' } },
  {
    id: 'conditions', type: 'select', default: 'stp', label: { cs: 'Podmínky', en: 'Conditions' },
    options: [
      { value: 'stp', label: { cs: 'normální (0 °C, 101,325 kPa) – 22,414 l/mol', en: 'standard (0 °C, 101.325 kPa) – 22.414 l/mol' } },
      { value: 'iupac', label: { cs: 'standardní IUPAC (0 °C, 100 kPa) – 22,711 l/mol', en: 'IUPAC standard (0 °C, 100 kPa) – 22.711 l/mol' } },
      { value: 'ntp', label: { cs: 'technické (20 °C, 101,325 kPa) – 24,055 l/mol', en: 'normal (20 °C, 101.325 kPa) – 24.055 l/mol' } },
      { value: 'satp', label: { cs: 'SATP (25 °C, 100 kPa) – 24,790 l/mol', en: 'SATP (25 °C, 100 kPa) – 24.790 l/mol' } },
      { value: 'custom', label: { cs: 'zadám teplotu a tlak', en: 'custom temperature and pressure' } },
    ],
  },
  { id: 'temperature', type: 'number', default: 20, min: -273.149, max: 1e5, step: 1, unit: '°C', label: { cs: 'Teplota (vlastní podmínky)', en: 'Temperature (custom)' } },
  { id: 'pressure', type: 'number', default: 101.325, min: 0.001, max: 1e7, step: 1, unit: 'kPa', label: { cs: 'Tlak absolutní (vlastní podmínky)', en: 'Absolute pressure (custom)' } },
];

const outputs = [
  { id: 'volume', label: { cs: 'Objem', en: 'Volume' }, unit: 'l', significant: 6 },
  { id: 'moles', label: { cs: 'Látkové množství', en: 'Amount' }, unit: 'mol', significant: 6 },
  { id: 'mass', label: { cs: 'Hmotnost', en: 'Mass' }, unit: 'g', significant: 6 },
  { id: 'molarVolume', label: { cs: 'Molární objem', en: 'Molar volume' }, unit: 'l/mol', significant: 6 },
  { id: 'density', label: { cs: 'Hustota plynu', en: 'Gas density' }, unit: 'g/l', significant: 5 },
];

export default {
  id: 'gas-volume',
  kind: 'calculator',
  category: 'chemistry-gases',
  tags: ['chemistry'],
  name: { cs: 'Objem plynu za normálních podmínek', en: 'Gas volume at standard conditions' },
  description: {
    cs: 'Převod mezi hmotností, látkovým množstvím a objemem plynu za normálních nebo zvolených podmínek (ideální plyn). Pozor, „normální podmínky“ se v různých oborech liší: 0 °C a 101,325 kPa (22,414 l/mol), 0 °C a 100 kPa podle IUPAC, 20 °C v technice. 44 g CO₂ zaujme za normálních podmínek 22,4 l.',
    en: 'Converts between mass, amount and volume of a gas at standard or chosen conditions (ideal gas). Note that "standard conditions" differ between fields: 0 °C and 101.325 kPa (22.414 l/mol), 0 °C and 100 kPa by IUPAC, 20 °C in engineering. 44 g of CO₂ takes 22.4 l at standard conditions.',
  },
  keywords: {
    cs: ['objem plynu', 'normální podmínky', 'molární objem', '22,4 l', 'stp', 'plyn', 'hustota plynu'],
    en: ['gas volume', 'standard conditions', 'molar volume', '22.4 l', 'stp', 'ntp', 'gas density'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { formula, known, value, conditions } = read.values;
    const molar = formulaMass(formula);
    if (molar === null) return emptyResult(outputs, [BAD_FORMULA]);
    const state = conditions === 'custom'
      ? { t: read.values.temperature, p: read.values.pressure }
      : CONDITIONS[/** @type {keyof typeof CONDITIONS} */ (conditions)];
    const molarVolume = R_GAS * (state.t + KELVIN) / state.p;
    const moles = known === 'mass' ? value / molar : known === 'moles' ? value : value / molarVolume;
    return { values: { volume: moles * molarVolume, moles, mass: moles * molar, molarVolume, density: molar / molarVolume }, warnings: [] };
  },
  references: [{ title: 'IUPAC Gold Book: standard conditions for gases', url: 'https://goldbook.iupac.org/terms/view/S05910' }],
};
