/**
 * Percentages: part, whole or percent from the other two.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  {
    id: 'find', type: 'select', default: 'part', label: { cs: 'Hledám', en: 'Find' },
    options: [
      { value: 'part', label: { cs: 'část – kolik je p % z celku', en: 'part – what is p % of the whole' } },
      { value: 'percent', label: { cs: 'procenta – kolik % je část z celku', en: 'percent – what % the part is of the whole' } },
      { value: 'whole', label: { cs: 'celek – z čeho je část p %', en: 'whole – of what the part is p %' } },
    ],
  },
  { id: 'part', type: 'number', default: 30, step: 1, label: { cs: 'Část', en: 'Part' } },
  { id: 'whole', type: 'number', default: 200, step: 1, label: { cs: 'Celek (100 %)', en: 'Whole (100 %)' } },
  { id: 'percent', type: 'number', default: 15, step: 1, unit: '%', label: { cs: 'Procenta', en: 'Percent' } },
];

const outputs = [
  { id: 'part', label: { cs: 'Část', en: 'Part' }, significant: 12 },
  { id: 'whole', label: { cs: 'Celek', en: 'Whole' }, significant: 12 },
  { id: 'percent', label: { cs: 'Procenta', en: 'Percent' }, unit: '%', significant: 12 },
];

/**
 * Works out the sought one of part, whole and percent from the other two.
 * @param {'part' | 'whole' | 'percent'} find
 * @param {{ part: number, whole: number, percent: number }} values
 * @returns {{ part: number, whole: number, percent: number } | null} null on division by zero
 */
export function completePercentage(find, { part, whole, percent }) {
  if (find === 'part') return { part: whole * percent / 100, whole, percent };
  if (find === 'whole') return percent === 0 ? null : { part, whole: part / percent * 100, percent };
  return whole === 0 ? null : { part, whole, percent: part / whole * 100 };
}

export default {
  id: 'percentage',
  kind: 'calculator',
  category: 'math-arithmetic',
  tags: ['math'],
  name: { cs: 'Procenta', en: 'Percentages' },
  description: {
    cs: 'Kolik je 15 % z 200, kolik procent je 30 z 200, nebo z čeho je 30 právě 15 %. Vyberte, co hledáte; ze zbylých dvou hodnot se dopočítá. Hledaná hodnota ve formuláři se nepoužije.',
    en: 'What is 15 % of 200, what percent 30 is of 200, or of what 30 is 15 %. Choose what you are looking for; it is worked out from the other two values. The sought value in the form is not used.',
  },
  keywords: {
    cs: ['procenta', 'procento', 'část', 'celek', 'kolik procent', 'podíl', 'sleva'],
    en: ['percentage', 'percent', 'part', 'whole', 'what percent', 'share', 'discount'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const result = completePercentage(read.values.find, /** @type {any} */ (read.values));
    if (result === null) {
      return emptyResult(outputs, [{ cs: 'Dělení nulou.', en: 'Division by zero.' }]);
    }
    return { values: result, warnings: [] };
  },
  references: [{ title: 'Wikipedia: Percentage', url: 'https://en.wikipedia.org/wiki/Percentage' }],
};
