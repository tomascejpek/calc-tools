/**
 * Scaling a recipe to a number of servings or a different pan.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  {
    id: 'mode', type: 'select', default: 'servings', label: { cs: 'Přepočítat podle', en: 'Scale by' },
    options: [
      { value: 'servings', label: { cs: 'počtu porcí', en: 'number of servings' } },
      { value: 'round', label: { cs: 'průměru kulaté formy', en: 'diameter of a round pan' } },
      { value: 'rectangle', label: { cs: 'rozměrů obdélníkové formy', en: 'size of a rectangular pan' } },
    ],
  },
  { id: 'from', type: 'number', default: 4, min: 0.01, max: 1e6, step: 1, label: { cs: 'Původně (porce, průměr nebo délka v cm)', en: 'Original (servings, diameter or length in cm)' } },
  { id: 'to', type: 'number', default: 6, min: 0.01, max: 1e6, step: 1, label: { cs: 'Nově (porce, průměr nebo délka v cm)', en: 'New (servings, diameter or length in cm)' } },
  { id: 'fromWidth', type: 'number', default: 20, min: 0.01, max: 1e6, step: 1, unit: 'cm', label: { cs: 'Původní šířka (obdélník)', en: 'Original width (rectangle)' } },
  { id: 'toWidth', type: 'number', default: 25, min: 0.01, max: 1e6, step: 1, unit: 'cm', label: { cs: 'Nová šířka (obdélník)', en: 'New width (rectangle)' } },
  {
    id: 'ingredients', type: 'list', min: 1, max: 30, label: { cs: 'Surovina', en: 'Ingredient' },
    fields: [
      { id: 'name', type: 'text', optional: true, maxLength: 40, pattern: /^[\p{L}\p{N} ,.%()/-]+$/u, label: { cs: 'Název (nepovinný)', en: 'Name (optional)' } },
      { id: 'amount', type: 'number', default: 200, min: 0, max: 1e9, step: 1, label: { cs: 'Množství (v jakékoli jednotce)', en: 'Amount (in any unit)' } },
    ],
  },
];

const outputs = [
  { id: 'factor', label: { cs: 'Násobek', en: 'Factor' }, unit: '×', significant: 4 },
  { id: 'amounts', type: 'list', label: { cs: 'Nové množství suroviny', en: 'New amount of ingredient' }, significant: 4 },
];

export default {
  id: 'recipe-scaling',
  kind: 'calculator',
  category: 'food-kitchen',
  tags: ['food'],
  name: { cs: 'Přepočet receptu', en: 'Scaling a recipe' },
  description: {
    cs: 'Přepočet surovin na jiný počet porcí nebo jinou velikost formy. U kulaté formy rozhoduje plocha, tedy čtverec průměru: z 20 cm na 26 cm je to 1,69× víc. Doba pečení se nepřepočítává úměrně – vyšší vrstva potřebuje déle a nižší teplotu, tenčí méně.',
    en: 'Scales ingredients to another number of servings or pan size. For a round pan the area counts, i.e. the square of the diameter: from 20 cm to 26 cm is 1.69 times more. Baking time does not scale in proportion – a deeper layer needs longer and a lower temperature, a thinner one less.',
  },
  keywords: {
    cs: ['přepočet receptu', 'porce', 'škálování receptu', 'forma na pečení', 'dortová forma', 'průměr formy', 'recept'],
    en: ['recipe scaling', 'scale recipe', 'servings', 'portions', 'cake pan', 'pan size', 'recipe converter'],
  },
  inputs,
  outputs,
  compute(values) {
    const source = values && typeof values === 'object' ? /** @type {Record<string, any>} */ (values) : {};
    // Example recipe when called without a list; a form passes its own list
    const defaults = [{}, { amount: 3 }, { amount: 0.5 }];
    const read = readInputs(inputs, { ...source, ingredients: Object.hasOwn(source, 'ingredients') && source.ingredients != null ? source.ingredients : defaults });
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { mode, from, to, fromWidth, toWidth, ingredients } = read.values;
    const factor = mode === 'servings' ? to / from : mode === 'round' ? (to / from) ** 2 : to * toWidth / (from * fromWidth);
    return { values: { factor, amounts: ingredients.map((/** @type {any} */ item) => item.amount * factor) }, warnings: [] };
  },
  references: [{ title: 'Corriher, S. O.: BakeWise – adjusting recipes for pan sizes' }],
};
