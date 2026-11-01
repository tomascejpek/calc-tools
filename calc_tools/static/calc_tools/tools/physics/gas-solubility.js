/**
 * Gas solubility in water by Henry's law, with temperature dependence.
 */

import { KELVIN } from '../../core/physics.js';
import { CO2_G_PER_L_PER_VOLUME } from '../../core/units.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Henry constants at 25 °C, mol/(kg·bar), and their temperature dependence
 * d(ln kH)/d(1/T) in K (NIST Chemistry WebBook, after Sander).
 */
export const HENRY = {
  co2: { kH: 0.034, slope: 2400, molar: 44.01 },
  o2: { kH: 0.0013, slope: 1500, molar: 32.00 },
  n2: { kH: 0.00065, slope: 1300, molar: 28.01 },
};

/**
 * Dissolved gas, mol per kg of water.
 * @param {keyof typeof HENRY} gas
 * @param {number} pressureBar partial pressure, absolute
 * @param {number} celsius
 */
export function dissolvedMoles(gas, pressureBar, celsius) {
  const { kH, slope } = HENRY[gas];
  const k = kH * Math.exp(slope * (1 / (celsius + KELVIN) - 1 / 298.15));
  return k * pressureBar;
}

const inputs = [
  {
    id: 'gas', type: 'select', default: 'co2', label: { cs: 'Plyn', en: 'Gas' },
    options: [
      { value: 'co2', label: { cs: 'oxid uhličitý CO₂', en: 'carbon dioxide CO₂' } },
      { value: 'o2', label: { cs: 'kyslík O₂', en: 'oxygen O₂' } },
      { value: 'n2', label: { cs: 'dusík N₂', en: 'nitrogen N₂' } },
    ],
  },
  { id: 'pressure', type: 'number', default: 2, min: 0, max: 100, step: 0.1, unit: 'bar', label: { cs: 'Parciální tlak plynu (absolutní)', en: 'Partial pressure of the gas (absolute)' } },
  { id: 'temperature', type: 'number', default: 4, min: 0, max: 80, step: 0.5, unit: '°C', label: { cs: 'Teplota vody', en: 'Water temperature' } },
];

const outputs = [
  { id: 'gramsPerLitre', label: { cs: 'Rozpuštěno', en: 'Dissolved' }, unit: 'g/l', significant: 4 },
  { id: 'mmolPerLitre', label: { cs: 'Rozpuštěno', en: 'Dissolved' }, unit: 'mmol/l', significant: 4 },
  { id: 'volumes', label: { cs: 'Objemy CO₂ (jen pro CO₂)', en: 'Volumes of CO₂ (CO₂ only)' }, unit: { cs: 'obj. CO₂', en: 'vol. CO₂' }, significant: 3 },
];

export default {
  id: 'gas-solubility',
  kind: 'calculator',
  category: 'physics-gases',
  tags: ['physics', 'beer'],
  name: { cs: 'Rozpustnost plynů (Henryho zákon)', en: 'Gas solubility (Henry\'s law)' },
  description: {
    cs: 'Kolik plynu se rozpustí ve vodě: rozpustnost roste úměrně parciálnímu tlaku a klesá s teplotou (van ’t Hoffova závislost Henryho konstanty). Platí pro čistou vodu; pivo s alkoholem a extraktem drží CO₂ trochu jinak, proto sycení piva počítejte nástrojem Sycení v sudu, který vychází z pivovarských tabulek.',
    en: 'How much gas dissolves in water: solubility grows in proportion to the partial pressure and falls with temperature (van ’t Hoff dependence of the Henry constant). Holds for pure water; beer with alcohol and extract holds CO₂ slightly differently, so for beer use the keg carbonation tool, which is based on brewing tables.',
  },
  keywords: {
    cs: ['henryho zákon', 'rozpustnost plynu', 'rozpustnost co2', 'oxid uhličitý', 'kyslík ve vodě', 'parciální tlak', 'sycení'],
    en: ['henry law', 'gas solubility', 'co2 solubility', 'carbon dioxide', 'dissolved oxygen', 'partial pressure', 'carbonation'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { gas, pressure, temperature } = read.values;
    const moles = dissolvedMoles(gas, pressure, temperature);
    const grams = moles * HENRY[/** @type {keyof typeof HENRY} */ (gas)].molar;
    return {
      values: { gramsPerLitre: grams, mmolPerLitre: moles * 1000, volumes: gas === 'co2' ? grams / CO2_G_PER_L_PER_VOLUME : null },
      warnings: [],
    };
  },
  references: [
    { title: 'NIST Chemistry WebBook: Henry\'s law data (Sander, R.)', url: 'https://webbook.nist.gov/chemistry/' },
    { title: 'Sander, R.: Compilation of Henry\'s law constants (version 4.0) for water as solvent. Atmos. Chem. Phys. 15 (2015)' },
  ],
};
