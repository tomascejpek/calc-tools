/**
 * Ohm's law and electric power: any two of U, I, R and P give the others.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * @param {'ui' | 'ur' | 'ir' | 'pu' | 'pi' | 'pr'} known the pair of known quantities
 * @param {{ u: number, i: number, r: number, p: number }} values
 * @returns {{ u: number, i: number, r: number, p: number } | null}
 */
export function ohm(known, { u, i, r, p }) {
  switch (known) {
    case 'ui': return i === 0 ? null : { u, i, r: u / i, p: u * i };
    case 'ur': return r === 0 ? null : { u, i: u / r, r, p: u * u / r };
    case 'ir': return { u: i * r, i, r, p: i * i * r };
    case 'pu': return u === 0 ? null : { u, i: p / u, r: u * u / p, p };
    case 'pi': return i === 0 ? null : { u: p / i, i, r: p / (i * i), p };
    case 'pr': return { u: Math.sqrt(p * r), i: Math.sqrt(p / r), r, p };
    default: return null;
  }
}

const inputs = [
  {
    id: 'known', type: 'select', default: 'pu', label: { cs: 'Znám', en: 'I know' },
    options: [
      { value: 'ui', label: { cs: 'napětí a proud', en: 'voltage and current' } },
      { value: 'ur', label: { cs: 'napětí a odpor', en: 'voltage and resistance' } },
      { value: 'ir', label: { cs: 'proud a odpor', en: 'current and resistance' } },
      { value: 'pu', label: { cs: 'výkon a napětí', en: 'power and voltage' } },
      { value: 'pi', label: { cs: 'výkon a proud', en: 'power and current' } },
      { value: 'pr', label: { cs: 'výkon a odpor', en: 'power and resistance' } },
    ],
  },
  { id: 'u', type: 'number', default: 230, min: 0, max: 1e9, step: 1, unit: 'V', label: { cs: 'Napětí U', en: 'Voltage U' } },
  { id: 'i', type: 'number', default: 10, min: 0, max: 1e9, step: 0.1, unit: 'A', label: { cs: 'Proud I', en: 'Current I' } },
  { id: 'r', type: 'number', default: 23, min: 1e-12, max: 1e15, step: 1, unit: 'Ω', label: { cs: 'Odpor R', en: 'Resistance R' } },
  { id: 'p', type: 'number', default: 3000, min: 1e-12, max: 1e12, step: 10, unit: 'W', label: { cs: 'Výkon P', en: 'Power P' } },
];

const outputs = [
  { id: 'u', label: { cs: 'Napětí U', en: 'Voltage U' }, unit: 'V', significant: 6 },
  { id: 'i', label: { cs: 'Proud I', en: 'Current I' }, unit: 'A', significant: 6 },
  { id: 'r', label: { cs: 'Odpor R', en: 'Resistance R' }, unit: 'Ω', significant: 6 },
  { id: 'p', label: { cs: 'Výkon P', en: 'Power P' }, unit: 'W', significant: 6 },
];

export default {
  id: 'ohms-law',
  kind: 'calculator',
  category: 'physics-electric',
  tags: ['physics'],
  name: { cs: 'Ohmův zákon a výkon', en: 'Ohm\'s law and power' },
  description: {
    cs: 'Ze dvou veličin dopočítá zbylé: U = R·I, P = U·I = R·I² = U²/R. Např. 3kW spirála na 230 V odebírá 13 A a má odpor 17,6 Ω. U střídavého proudu platí pro odporovou zátěž (topení, žárovka), ne pro motory.',
    en: 'Works out the rest from any two quantities: U = R·I, P = U·I = R·I² = U²/R. E.g. a 3 kW heating element at 230 V draws 13 A and has 17.6 Ω. With AC it holds for resistive loads (heaters, bulbs), not motors.',
  },
  keywords: {
    cs: ['ohmův zákon', 'napětí', 'proud', 'odpor', 'výkon', 'příkon', 'p = u·i', 'elektřina'],
    en: ['ohm law', 'voltage', 'current', 'resistance', 'power', 'p = vi', 'electricity', 'watts'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const result = ohm(read.values.known, /** @type {any} */ (read.values));
    if (result === null) return emptyResult(outputs, [{ cs: 'Dělení nulou – zadejte nenulové hodnoty.', en: 'Division by zero – enter non-zero values.' }]);
    return { values: result, warnings: [] };
  },
  references: [{ title: 'Halliday, D., Resnick, R., Walker, J.: Fundamentals of Physics – Ohm\'s law, power in circuits' }],
};
