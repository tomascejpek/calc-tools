/**
 * Series resistor for LEDs, with the nearest standard value.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** E12 and E24 standard resistor values in one decade. */
export const E_SERIES = {
  e12: [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2],
  e24: [1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1],
};

/**
 * The smallest standard value not below the given resistance.
 * @param {number} ohms > 0
 * @param {'e12' | 'e24'} series
 */
export function nextStandard(ohms, series) {
  const decade = 10 ** Math.floor(Math.log10(ohms));
  for (const base of [...E_SERIES[series], 10]) {
    const value = Number((base * decade).toPrecision(3));
    if (value >= ohms * (1 - 1e-12)) return value;
  }
  return 10 * decade;
}

const inputs = [
  { id: 'supply', type: 'number', default: 12, min: 0.1, max: 1000, step: 0.1, unit: 'V', label: { cs: 'Napájecí napětí', en: 'Supply voltage' } },
  { id: 'forward', type: 'number', default: 2.0, min: 0.5, max: 50, step: 0.1, unit: 'V', label: { cs: 'Napětí LED v propustném směru (červená ≈ 2, bílá a modrá ≈ 3)', en: 'LED forward voltage (red ≈ 2, white and blue ≈ 3)' } },
  { id: 'current', type: 'number', default: 20, min: 0.01, max: 10000, step: 1, unit: 'mA', label: { cs: 'Proud LED', en: 'LED current' } },
  { id: 'count', type: 'number', default: 1, min: 1, max: 100, step: 1, label: { cs: 'Počet LED v sérii', en: 'LEDs in series' } },
  {
    id: 'series', type: 'select', default: 'e12', label: { cs: 'Řada odporů', en: 'Resistor series' },
    options: [
      { value: 'e12', label: { cs: 'E12', en: 'E12' } },
      { value: 'e24', label: { cs: 'E24', en: 'E24' } },
    ],
  },
];

const outputs = [
  { id: 'resistance', label: { cs: 'Potřebný odpor', en: 'Resistance needed' }, unit: 'Ω', significant: 4 },
  { id: 'standard', label: { cs: 'Nejbližší vyšší hodnota z řady', en: 'Next standard value up' }, unit: 'Ω', significant: 4 },
  { id: 'actualCurrent', label: { cs: 'Skutečný proud se standardním odporem', en: 'Actual current with the standard resistor' }, unit: 'mA', significant: 4 },
  { id: 'power', label: { cs: 'Výkon na odporu', en: 'Power in the resistor' }, unit: 'mW', significant: 4 },
];

export default {
  id: 'led-resistor',
  kind: 'calculator',
  category: 'physics-electric',
  tags: ['physics'],
  name: { cs: 'Předřadný odpor pro LED', en: 'LED series resistor' },
  description: {
    cs: 'Odpor, který omezí proud LED: R = (U − n·U_LED) / I. Vybere nejbližší vyšší hodnotu z řady E12 nebo E24 (proud tak bude o něco menší, ne větší) a spočítá výkon na odporu – volte rezistor s aspoň dvojnásobnou výkonovou rezervou.',
    en: 'The resistor that limits an LED\'s current: R = (V − n·V_LED) / I. Picks the next value up from the E12 or E24 series (so the current ends a little lower, not higher) and works out the resistor power – choose a resistor rated for at least twice that.',
  },
  keywords: {
    cs: ['led', 'předřadný odpor', 'rezistor', 'dioda', 'proud led', 'e12', 'e24'],
    en: ['led', 'series resistor', 'current limiting resistor', 'resistor', 'diode', 'e12', 'e24'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { supply, forward, count, series } = read.values;
    if (!Number.isInteger(count)) return emptyResult(outputs, [{ cs: 'Počet LED musí být celé číslo.', en: 'The number of LEDs must be a whole number.' }]);
    const current = read.values.current / 1000;
    const drop = supply - forward * count;
    if (drop <= 0) return emptyResult(outputs, [{ cs: 'Napájecí napětí nestačí na rozsvícení LED.', en: 'The supply voltage is too low to light the LEDs.' }]);
    const resistance = drop / current;
    const standard = nextStandard(resistance, series);
    const actual = drop / standard;
    return { values: { resistance, standard, actualCurrent: actual * 1000, power: drop * actual * 1000 }, warnings: [] };
  },
  references: [
    { title: 'IEC 60063: Preferred number series for resistors and capacitors (E series)' },
    { title: 'Horowitz, P., Hill, W.: The Art of Electronics, 3rd ed. – LEDs' },
  ],
};
