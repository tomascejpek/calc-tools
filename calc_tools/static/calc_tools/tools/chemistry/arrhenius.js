/**
 * Arrhenius equation: how temperature changes the rate of a reaction or the
 * shelf life of a product.
 */

import { KELVIN, R_GAS } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Rate ratio k₂ / k₁ between two temperatures.
 * @param {number} ea activation energy, kJ/mol
 * @param {number} t1 °C
 * @param {number} t2 °C
 */
export function rateRatio(ea, t1, t2) {
  return Math.exp(ea * 1000 / R_GAS * (1 / (t1 + KELVIN) - 1 / (t2 + KELVIN)));
}

/**
 * Activation energy from two rate constants, kJ/mol.
 * @param {number} k1
 * @param {number} t1 °C
 * @param {number} k2
 * @param {number} t2 °C
 */
export function activationEnergy(k1, t1, k2, t2) {
  return R_GAS * Math.log(k2 / k1) / (1 / (t1 + KELVIN) - 1 / (t2 + KELVIN)) / 1000;
}

const inputs = [
  {
    id: 'mode', type: 'select', default: 'shelf', label: { cs: 'Počítám', en: 'Calculate' },
    options: [
      { value: 'shelf', label: { cs: 'trvanlivost nebo rychlost při jiné teplotě', en: 'shelf life or rate at another temperature' } },
      { value: 'energy', label: { cs: 'aktivační energii ze dvou měření', en: 'activation energy from two measurements' } },
    ],
  },
  { id: 'ea', type: 'number', default: 70, min: 0.01, max: 1000, step: 1, unit: 'kJ/mol', label: { cs: 'Aktivační energie (stárnutí piva řádově 50–100)', en: 'Activation energy (beer staling roughly 50–100)' } },
  { id: 't1', type: 'number', default: 4, min: -273, max: 5000, step: 1, unit: '°C', label: { cs: 'Teplota 1', en: 'Temperature 1' } },
  { id: 't2', type: 'number', default: 20, min: -273, max: 5000, step: 1, unit: '°C', label: { cs: 'Teplota 2', en: 'Temperature 2' } },
  { id: 'value1', type: 'number', default: 12, min: 1e-30, max: 1e30, step: 1, label: { cs: 'Trvanlivost (nebo rychlost) při teplotě 1', en: 'Shelf life (or rate) at temperature 1' } },
  { id: 'value2', type: 'number', default: 3, min: 1e-30, max: 1e30, step: 1, label: { cs: 'Rychlost při teplotě 2 (pro aktivační energii)', en: 'Rate at temperature 2 (for the activation energy)' } },
];

const outputs = [
  { id: 'ratio', label: { cs: 'Zrychlení reakce k₂ / k₁', en: 'Rate increase k₂ / k₁' }, unit: '×', significant: 4 },
  { id: 'shelfLife', label: { cs: 'Trvanlivost při teplotě 2 (stejná jednotka)', en: 'Shelf life at temperature 2 (same unit)' }, significant: 4 },
  { id: 'rate', label: { cs: 'Rychlost při teplotě 2', en: 'Rate at temperature 2' }, significant: 4 },
  { id: 'q10', label: { cs: 'Q₁₀ (zrychlení na 10 °C)', en: 'Q₁₀ (increase per 10 °C)' }, significant: 4 },
  { id: 'ea', label: { cs: 'Aktivační energie', en: 'Activation energy' }, unit: 'kJ/mol', significant: 4 },
];

export default {
  id: 'arrhenius',
  kind: 'calculator',
  category: 'chemistry-kinetics',
  tags: ['chemistry', 'beer'],
  name: { cs: 'Arrheniova rovnice (teplota a trvanlivost)', en: 'Arrhenius equation (temperature and shelf life)' },
  description: {
    cs: 'Jak teplota zrychlí reakci: k₂/k₁ = exp(Ea/R · (1/T₁ − 1/T₂)). Trvanlivost se zkrátí stejným poměrem: pivo, které v lednici při 4 °C vydrží 12 měsíců, vydrží při 20 °C (Ea 70 kJ/mol) jen asi 2,3 měsíce. Ze dvou měření rychlosti spočítá aktivační energii. Platí, dokud se při jiné teplotě nemění mechanismus reakce.',
    en: 'How temperature speeds up a reaction: k₂/k₁ = exp(Ea/R · (1/T₁ − 1/T₂)). Shelf life shortens by the same ratio: beer that keeps 12 months in a fridge at 4 °C keeps only about 2.3 months at 20 °C (Ea 70 kJ/mol). From two rate measurements it works out the activation energy. Holds as long as the reaction mechanism does not change with temperature.',
  },
  keywords: {
    cs: ['arrheniova rovnice', 'aktivační energie', 'trvanlivost', 'stárnutí piva', 'rychlost reakce', 'q10', 'skladování'],
    en: ['arrhenius equation', 'activation energy', 'shelf life', 'beer staling', 'reaction rate', 'q10', 'storage', 'accelerated aging'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { mode, t1, t2, value1, value2 } = read.values;
    if (t1 <= -KELVIN || t2 <= -KELVIN) return emptyResult(outputs, [{ cs: 'Teplota pod absolutní nulou.', en: 'Temperature below absolute zero.' }]);
    let { ea } = read.values;
    if (mode === 'energy') {
      if (t1 === t2) return emptyResult(outputs, [{ cs: 'Měření musí být při různých teplotách.', en: 'The measurements must be at different temperatures.' }]);
      ea = activationEnergy(value1, t1, value2, t2);
    }
    const ratio = rateRatio(ea, t1, t2);
    const q10 = rateRatio(ea, t1, t1 + 10);
    return { values: { ratio, shelfLife: value1 / ratio, rate: value1 * ratio, q10, ea }, warnings: [] };
  },
  references: [
    { title: 'Atkins, P., de Paula, J.: Physical Chemistry – the Arrhenius equation' },
    { title: 'Vanderhaegen, B. et al.: The chemistry of beer aging – a critical review. Food Chemistry 95 (2006)' },
  ],
};
