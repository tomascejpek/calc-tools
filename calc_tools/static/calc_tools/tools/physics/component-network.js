/**
 * Resistors and capacitors in series and in parallel.
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { NUMBER_LIST_PATTERN, parseNumbers } from '../math/statistics.js';

/**
 * @param {number[]} values
 * @param {'resistor' | 'capacitor'} kind
 * @param {'series' | 'parallel'} connection
 */
export function combine(values, kind, connection) {
  const sum = (/** @type {number[]} */ list) => list.reduce((total, x) => total + x, 0);
  const reciprocal = (/** @type {number[]} */ list) => 1 / sum(list.map((x) => 1 / x));
  // Resistors add in series, capacitors in parallel
  const adds = (kind === 'resistor') === (connection === 'series');
  return adds ? sum(values) : reciprocal(values);
}

const inputs = [
  {
    id: 'kind', type: 'select', default: 'resistor', label: { cs: 'Součástky', en: 'Components' },
    options: [
      { value: 'resistor', label: { cs: 'rezistory (odpor)', en: 'resistors (resistance)' } },
      { value: 'capacitor', label: { cs: 'kondenzátory (kapacita)', en: 'capacitors (capacitance)' } },
    ],
  },
  {
    id: 'connection', type: 'select', default: 'parallel', label: { cs: 'Zapojení', en: 'Connection' },
    options: [
      { value: 'series', label: { cs: 'sériově (za sebou)', en: 'in series' } },
      { value: 'parallel', label: { cs: 'paralelně (vedle sebe)', en: 'in parallel' } },
    ],
  },
  {
    id: 'values', type: 'text', default: '100 220 330', maxLength: 2000, pattern: NUMBER_LIST_PATTERN,
    hint: { cs: 'Hodnoty oddělené mezerou nebo středníkem, ve stejné jednotce.', en: 'Values separated by spaces or semicolons, in one unit.' },
    label: { cs: 'Hodnoty (Ω, nebo µF…)', en: 'Values (Ω, or µF…)' },
  },
];

const outputs = [
  { id: 'total', label: { cs: 'Výsledná hodnota (ve stejné jednotce)', en: 'Total (in the same unit)' }, significant: 6 },
  { id: 'count', label: { cs: 'Počet součástek', en: 'Number of components' }, precision: 0 },
];

export default {
  id: 'component-network',
  kind: 'calculator',
  category: 'physics-electric',
  tags: ['physics'],
  name: { cs: 'Řazení odporů a kondenzátorů', en: 'Resistors and capacitors in series and parallel' },
  description: {
    cs: 'Výsledný odpor nebo kapacita sériového či paralelního zapojení. Odpory se sériově sčítají, paralelně se sčítají jejich převrácené hodnoty; u kondenzátorů je to naopak. Hodnoty zadejte ve stejné jednotce (např. všechny v kΩ); ve stejné jednotce vyjde i výsledek.',
    en: 'Total resistance or capacitance of a series or parallel connection. Resistances add in series and their reciprocals add in parallel; for capacitors it is the other way round. Enter the values in one unit (e.g. all in kΩ); the result is in the same unit.',
  },
  keywords: {
    cs: ['sériové zapojení', 'paralelní zapojení', 'odpory', 'rezistory', 'kondenzátory', 'výsledný odpor', 'kapacita'],
    en: ['series', 'parallel', 'resistors', 'capacitors', 'equivalent resistance', 'total capacitance'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const list = parseNumbers(read.values.values);
    if (list === null || !list.length) return emptyResult(outputs, [{ cs: 'Hodnoty musí být čísla.', en: 'The values must be numbers.' }]);
    if (list.length > 100) return emptyResult(outputs, [{ cs: 'Nejvýš 100 součástek.', en: 'At most 100 components.' }]);
    if (list.some((x) => !(x > 0))) return emptyResult(outputs, [{ cs: 'Hodnoty musí být kladné.', en: 'The values must be positive.' }]);
    return { values: { total: combine(list, read.values.kind, read.values.connection), count: list.length }, warnings: [] };
  },
  references: [{ title: 'Horowitz, P., Hill, W.: The Art of Electronics, 3rd ed. – resistors and capacitors in series and parallel' }],
};
