/**
 * Balanced draught line length.
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { PSI_PER_BAR } from '../../core/units.js';
import { kegPressurePsi } from './keg-carbonation.js';

/** bar per metre from psi per foot. */
const BAR_M_PER_PSI_FT = 1 / PSI_PER_BAR / 0.3048;

/** Resistance of vinyl beer lines, bar/m (Draught Beer Quality Manual). */
export const LINE_RESISTANCE = {
  'vinyl-3/16': 3 * BAR_M_PER_PSI_FT,
  'vinyl-1/4': 0.85 * BAR_M_PER_PSI_FT,
  'vinyl-5/16': 0.4 * BAR_M_PER_PSI_FT,
  'vinyl-3/8': 0.2 * BAR_M_PER_PSI_FT,
};

/** Hydrostatic pressure of beer per metre of rise, bar/m (ρ·g, SG 1.010). */
export const LIFT_BAR_PER_M = 1.010 * 9.80665 * 0.01;

/**
 * Line length whose resistance balances the keg pressure.
 * @param {number} pressureBar gauge pressure in the keg
 * @param {number} riseM height of the tap above the keg (negative below)
 * @param {number} resistance bar/m
 * @param {number} tapBar pressure left at the tap
 */
export function balancedLength(pressureBar, riseM, resistance, tapBar) {
  return (pressureBar - riseM * LIFT_BAR_PER_M - tapBar) / resistance;
}

const inputs = [
  { id: 'volumes', type: 'number', default: 2.5, min: 1, max: 5, step: 0.1, unit: { cs: 'obj. CO₂', en: 'vol. CO₂' }, label: { cs: 'Nasycení piva', en: 'Beer carbonation' } },
  { id: 'temperature', type: 'number', default: 4, min: -2, max: 25, step: 0.5, unit: '°C', label: { cs: 'Teplota piva v sudu', en: 'Beer temperature in the keg' } },
  { id: 'rise', type: 'number', default: 0.5, min: -10, max: 30, step: 0.1, unit: 'm', label: { cs: 'Výška kohoutu nad sudem', en: 'Tap height above the keg' } },
  {
    id: 'line', type: 'select', default: 'vinyl-3/16', label: { cs: 'Hadice', en: 'Line' },
    options: [
      { value: 'vinyl-3/16', label: { cs: 'PVC, vnitřní průměr 3/16" (4,8 mm)', en: 'vinyl, 3/16" (4.8 mm) inner diameter' } },
      { value: 'vinyl-1/4', label: { cs: 'PVC, vnitřní průměr 1/4" (6,4 mm)', en: 'vinyl, 1/4" (6.4 mm) inner diameter' } },
      { value: 'vinyl-5/16', label: { cs: 'PVC, vnitřní průměr 5/16" (7,9 mm)', en: 'vinyl, 5/16" (7.9 mm) inner diameter' } },
      { value: 'vinyl-3/8', label: { cs: 'PVC, vnitřní průměr 3/8" (9,5 mm)', en: 'vinyl, 3/8" (9.5 mm) inner diameter' } },
      { value: 'custom', label: { cs: 'zadám odpor hadice', en: 'enter the line resistance' } },
    ],
  },
  { id: 'resistance', type: 'number', default: 0.5, min: 0.01, max: 5, step: 0.01, unit: 'bar/m', label: { cs: 'Odpor hadice', en: 'Line resistance' } },
  { id: 'tapPressure', type: 'number', default: 0.07, min: 0, max: 1, step: 0.01, unit: 'bar', label: { cs: 'Zbytkový tlak na kohoutu', en: 'Pressure left at the tap' } },
];

const outputs = [
  { id: 'length', label: { cs: 'Délka hadice', en: 'Line length' }, unit: 'm', precision: 2 },
  { id: 'pressure', label: { cs: 'Přetlak v sudu', en: 'Keg gauge pressure' }, unit: 'bar', precision: 2 },
  { id: 'resistance', label: { cs: 'Odpor hadice', en: 'Line resistance' }, unit: 'bar/m', precision: 3 },
];

export default {
  id: 'beer-line',
  kind: 'calculator',
  category: 'packaging',
  tags: ['beer'],
  name: { cs: 'Délka pivní hadice', en: 'Draught line length' },
  description: {
    cs: 'Jak dlouhou hadici použít, aby pivo teklo z kohoutu klidně a nepěnilo. Přetlak potřebný pro nasycení piva se má spotřebovat odporem hadice a převýšením, na kohoutu zbude jen malý tlak. Odpory PVC hadic jsou z příručky Draught Beer Quality Manual; skutečné hadice se liší, proto raději začněte delší a zkracujte.',
    en: 'How long a line to use so beer pours calmly without foaming. The gauge pressure needed for carbonation should be used up by line resistance and the rise to the tap, leaving only a little at the faucet. Vinyl line resistances come from the Draught Beer Quality Manual; real lines vary, so start longer and trim.',
  },
  keywords: {
    cs: ['pivní hadice', 'hadice', 'výčep', 'vyvážený výčep', 'pěnění', 'délka hadice', 'kohout', 'sud', 'tlak'],
    en: ['beer line', 'draught line', 'draft line', 'line balancing', 'foaming', 'faucet', 'keg', 'kegerator', 'pressure'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { volumes, temperature, rise, line, tapPressure } = read.values;
    const pressure = kegPressurePsi(volumes, temperature) / PSI_PER_BAR;
    const resistance = line === 'custom' ? read.values.resistance : LINE_RESISTANCE[/** @type {keyof typeof LINE_RESISTANCE} */ (line)];
    const length = balancedLength(pressure, rise, resistance, tapPressure);
    if (!(length > 0)) {
      return emptyResult(outputs, [{
        cs: 'Tlak v sudu nestačí na převýšení a zbytkový tlak; zvyšte nasycení nebo snižte kohout.',
        en: 'The keg pressure does not cover the rise and the tap pressure; raise the carbonation or lower the tap.',
      }]);
    }
    return { values: { length, pressure, resistance }, warnings: [] };
  },
  references: [
    { title: 'Brewers Association: Draught Beer Quality Manual – line resistance and system balance', url: 'https://www.draughtquality.org/' },
  ],
};
