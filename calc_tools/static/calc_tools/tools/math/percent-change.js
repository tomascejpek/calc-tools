/**
 * Change between two values in percent and in percentage points.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'from', type: 'number', default: 80, step: 1, label: { cs: 'Původní hodnota', en: 'Original value' } },
  { id: 'to', type: 'number', default: 100, step: 1, label: { cs: 'Nová hodnota', en: 'New value' } },
];

const outputs = [
  { id: 'change', label: { cs: 'Změna', en: 'Change' }, unit: '%', significant: 10 },
  { id: 'difference', label: { cs: 'Rozdíl (u procent v procentních bodech)', en: 'Difference (percentage points for percentages)' }, significant: 12 },
  { id: 'ratio', label: { cs: 'Poměr nová / původní', en: 'Ratio new / original' }, unit: '×', significant: 10 },
];

/**
 * Relative change in percent.
 * @param {number} from
 * @param {number} to
 * @returns {number | null}
 */
export function percentChange(from, to) {
  return from === 0 ? null : (to - from) / Math.abs(from) * 100;
}

export default {
  id: 'percent-change',
  kind: 'calculator',
  category: 'math-arithmetic',
  tags: ['math'],
  name: { cs: 'Procentní změna a procentní body', en: 'Percent change and percentage points' },
  description: {
    cs: 'O kolik procent se hodnota změnila: z 80 na 100 je to +25 %, ze 100 na 80 −20 %. Když jsou obě hodnoty samy procenta (např. úroková sazba 4 % → 5 %), je rozdíl v procentních bodech (+1 p. b.), zatímco relativní změna je +25 %.',
    en: 'By how many percent a value changed: from 80 to 100 it is +25 %, from 100 to 80 −20 %. When both values are percentages themselves (e.g. an interest rate of 4 % → 5 %), the difference is in percentage points (+1 pp) while the relative change is +25 %.',
  },
  keywords: {
    cs: ['procentní změna', 'nárůst', 'pokles', 'procentní body', 'p. b.', 'zdražení', 'zlevnění', 'meziroční'],
    en: ['percent change', 'percentage change', 'increase', 'decrease', 'percentage points', 'growth'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { from, to } = read.values;
    if (from === 0) {
      return emptyResult(outputs, [{ cs: 'Změnu z nuly nelze vyjádřit v procentech.', en: 'A change from zero cannot be expressed in percent.' }]);
    }
    return { values: { change: percentChange(from, to), difference: to - from, ratio: to / from }, warnings: [] };
  },
  references: [{ title: 'Wikipedia: Percentage point', url: 'https://en.wikipedia.org/wiki/Percentage_point' }],
};
