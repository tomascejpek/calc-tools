/**
 * Heat from burning fuels: higher and lower heating value.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Higher and lower heating value (MJ/kg) and density (kg per l for
 * liquids, per m³ at 15 °C and 101.325 kPa for gases, null for solids).
 */
export const FUELS = {
  naturalGas: { hhv: 54.0, lhv: 48.6, density: 0.73, state: 'gas' },
  methane: { hhv: 55.5, lhv: 50.0, density: 0.678, state: 'gas' },
  propane: { hhv: 50.35, lhv: 46.35, density: 1.865, state: 'gas' },
  butane: { hhv: 49.5, lhv: 45.75, density: 2.455, state: 'gas' },
  hydrogen: { hhv: 141.8, lhv: 120.0, density: 0.0852, state: 'gas' },
  petrol: { hhv: 46.4, lhv: 43.4, density: 0.745, state: 'liquid' },
  diesel: { hhv: 45.6, lhv: 42.6, density: 0.832, state: 'liquid' },
  ethanol: { hhv: 29.7, lhv: 26.8, density: 0.789, state: 'liquid' },
  wood: { hhv: 16.0, lhv: 14.4, density: null, state: 'solid' },
  pellets: { hhv: 19.0, lhv: 17.3, density: null, state: 'solid' },
  coal: { hhv: 29.0, lhv: 27.0, density: null, state: 'solid' },
};

const inputs = [
  {
    id: 'fuel', type: 'select', default: 'propane', label: { cs: 'Palivo', en: 'Fuel' },
    options: [
      { value: 'naturalGas', label: { cs: 'zemní plyn', en: 'natural gas' } },
      { value: 'methane', label: { cs: 'methan', en: 'methane' } },
      { value: 'propane', label: { cs: 'propan', en: 'propane' } },
      { value: 'butane', label: { cs: 'butan', en: 'butane' } },
      { value: 'hydrogen', label: { cs: 'vodík', en: 'hydrogen' } },
      { value: 'petrol', label: { cs: 'benzín', en: 'petrol' } },
      { value: 'diesel', label: { cs: 'nafta', en: 'diesel' } },
      { value: 'ethanol', label: { cs: 'ethanol (líh)', en: 'ethanol' } },
      { value: 'wood', label: { cs: 'dřevo (vysušené na 20 % vody)', en: 'wood (seasoned, 20 % moisture)' } },
      { value: 'pellets', label: { cs: 'dřevní pelety', en: 'wood pellets' } },
      { value: 'coal', label: { cs: 'černé uhlí', en: 'hard coal' } },
    ],
  },
  { id: 'amount', type: 'number', default: 1, min: 0, max: 1e12, step: 0.1, label: { cs: 'Množství (kg; u kapalin litry, u plynů m³ – viz jednotku)', en: 'Amount (kg; litres for liquids, m³ for gases – see the unit)' } },
  {
    id: 'unit', type: 'select', default: 'kg', label: { cs: 'Jednotka množství', en: 'Amount unit' },
    options: [
      { value: 'kg', label: { cs: 'kg', en: 'kg' } },
      { value: 'volume', label: { cs: 'l (kapaliny) nebo m³ (plyny)', en: 'l (liquids) or m³ (gases)' } },
    ],
  },
  { id: 'efficiency', type: 'number', default: 85, min: 1, max: 110, step: 1, unit: '%', label: { cs: 'Účinnost spotřebiče (vztaženo k výhřevnosti)', en: 'Appliance efficiency (on the lower heating value)' } },
];

const outputs = [
  { id: 'hhv', label: { cs: 'Spalné teplo', en: 'Higher heating value' }, unit: 'MJ', significant: 5 },
  { id: 'lhv', label: { cs: 'Výhřevnost', en: 'Lower heating value' }, unit: 'MJ', significant: 5 },
  { id: 'kwh', label: { cs: 'Výhřevnost', en: 'Lower heating value' }, unit: 'kWh', significant: 5 },
  { id: 'useful', label: { cs: 'Využité teplo', en: 'Useful heat' }, unit: 'kWh', significant: 5 },
  { id: 'mass', label: { cs: 'Hmotnost paliva', en: 'Fuel mass' }, unit: 'kg', significant: 5 },
];

export default {
  id: 'combustion-heat',
  kind: 'calculator',
  category: 'chemistry-thermo',
  tags: ['chemistry'],
  name: { cs: 'Spalné teplo a výhřevnost paliv', en: 'Heating value of fuels' },
  description: {
    cs: 'Kolik tepla dá spálení paliva: spalné teplo (s kondenzací vodní páry) a výhřevnost (bez ní), z nich využité teplo podle účinnosti spotřebiče. Kondenzační kotel může mít vůči výhřevnosti účinnost přes 100 %. Hodnoty jsou typické; skutečné palivo se liší podle složení a vlhkosti.',
    en: 'How much heat burning a fuel gives: the higher heating value (with the water vapour condensed) and the lower heating value (without), and from them the useful heat by the appliance efficiency. A condensing boiler can exceed 100 % on the lower heating value. Values are typical; real fuel varies with composition and moisture.',
  },
  keywords: {
    cs: ['spalné teplo', 'výhřevnost', 'palivo', 'propan', 'zemní plyn', 'dřevo', 'benzín', 'spalování', 'kwh'],
    en: ['heating value', 'calorific value', 'higher heating value', 'lower heating value', 'fuel', 'propane', 'natural gas', 'wood', 'combustion'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { fuel, amount, unit, efficiency } = read.values;
    const data = FUELS[/** @type {keyof typeof FUELS} */ (fuel)];
    if (unit === 'volume' && data.density === null) {
      return emptyResult(outputs, [{ cs: 'Tuhá paliva zadávejte v kg.', en: 'Enter solid fuels in kg.' }]);
    }
    const mass = unit === 'kg' ? amount : amount * /** @type {number} */ (data.density);
    const lhv = mass * data.lhv;
    return { values: { hhv: mass * data.hhv, lhv, kwh: lhv / 3.6, useful: lhv / 3.6 * efficiency / 100, mass }, warnings: [] };
  },
  references: [
    { title: 'Engineering ToolBox: Fuels – higher and lower calorific values', url: 'https://www.engineeringtoolbox.com/fuels-higher-calorific-values-d_169.html' },
  ],
};
