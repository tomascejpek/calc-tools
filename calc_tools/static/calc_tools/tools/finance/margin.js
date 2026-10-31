/**
 * Margin and markup: price from cost and either of them, and back.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  {
    id: 'given', type: 'select', default: 'price', label: { cs: 'Znám', en: 'I know' },
    options: [
      { value: 'price', label: { cs: 'nákupní a prodejní cenu', en: 'cost and selling price' } },
      { value: 'margin', label: { cs: 'nákupní cenu a marži', en: 'cost and margin' } },
      { value: 'markup', label: { cs: 'nákupní cenu a přirážku', en: 'cost and markup' } },
    ],
  },
  { id: 'cost', type: 'number', default: 80, min: 0, max: 1e13, step: 1, label: { cs: 'Nákupní cena (náklad)', en: 'Cost' } },
  { id: 'price', type: 'number', default: 100, min: 0, max: 1e13, step: 1, label: { cs: 'Prodejní cena', en: 'Selling price' } },
  { id: 'percent', type: 'number', default: 25, min: -1e6, max: 1e6, step: 1, unit: '%', label: { cs: 'Marže nebo přirážka', en: 'Margin or markup' } },
];

const outputs = [
  { id: 'price', label: { cs: 'Prodejní cena', en: 'Selling price' }, precision: 2 },
  { id: 'profit', label: { cs: 'Zisk (hrubý)', en: 'Gross profit' }, precision: 2 },
  { id: 'margin', label: { cs: 'Marže (zisk / prodejní cena)', en: 'Margin (profit / price)' }, unit: '%', precision: 2 },
  { id: 'markup', label: { cs: 'Přirážka (zisk / nákupní cena)', en: 'Markup (profit / cost)' }, unit: '%', precision: 2 },
];

/**
 * @param {'price' | 'margin' | 'markup'} given
 * @param {{ cost: number, price: number, percent: number }} values
 * @returns {number | null} selling price, null when impossible
 */
export function sellingPrice(given, { cost, price, percent }) {
  if (given === 'price') return price;
  if (given === 'markup') return cost * (1 + percent / 100);
  return percent >= 100 ? null : cost / (1 - percent / 100);
}

export default {
  id: 'margin',
  kind: 'calculator',
  category: 'finance',
  tags: ['finance'],
  name: { cs: 'Marže a přirážka', en: 'Margin and markup' },
  description: {
    cs: 'Marže je zisk jako podíl prodejní ceny, přirážka zisk jako podíl nákupní ceny: zboží za 80 prodané za 100 má marži 20 % a přirážku 25 %. Z nákupní ceny a marže nebo přirážky spočítá prodejní cenu, z obou cen marži i přirážku.',
    en: 'Margin is profit as a share of the selling price, markup profit as a share of the cost: goods bought for 80 and sold for 100 have a 20 % margin and a 25 % markup. From the cost and a margin or markup it works out the selling price, from both prices the margin and the markup.',
  },
  keywords: {
    cs: ['marže', 'přirážka', 'zisk', 'prodejní cena', 'nákupní cena', 'obchodní přirážka', 'rabat'],
    en: ['margin', 'markup', 'profit', 'selling price', 'cost', 'gross margin', 'pricing'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { given, cost } = read.values;
    const price = sellingPrice(given, /** @type {any} */ (read.values));
    if (price === null) return emptyResult(outputs, [{ cs: 'Marže musí být menší než 100 %.', en: 'The margin must be below 100 %.' }]);
    const profit = price - cost;
    return {
      values: { price, profit, margin: price === 0 ? null : profit / price * 100, markup: cost === 0 ? null : profit / cost * 100 },
      warnings: price === 0 || cost === 0 ? [{ cs: 'Při nulové ceně nelze marži nebo přirážku vyjádřit.', en: 'With a zero price the margin or markup cannot be expressed.' }] : [],
    };
  },
  references: [{ title: 'Wikipedia: Markup (business) – margin vs markup', url: 'https://en.wikipedia.org/wiki/Markup_(business)' }],
};
