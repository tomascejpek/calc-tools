/**
 * Baker's percentages: every ingredient relative to the total flour.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  {
    id: 'ingredients', type: 'list', min: 1, max: 20, label: { cs: 'Surovina', en: 'Ingredient' },
    fields: [
      { id: 'name', type: 'text', optional: true, maxLength: 40, pattern: /^[\p{L}\p{N} ,.%()-]+$/u, label: { cs: 'Název (nepovinný)', en: 'Name (optional)' } },
      { id: 'grams', type: 'number', default: 500, min: 0, max: 1e7, step: 1, unit: 'g', label: { cs: 'Hmotnost', en: 'Weight' } },
      {
        id: 'kind', type: 'select', default: 'flour', label: { cs: 'Druh', en: 'Kind' },
        options: [
          { value: 'flour', label: { cs: 'mouka (tvoří 100 %)', en: 'flour (makes up 100 %)' } },
          { value: 'water', label: { cs: 'voda nebo jiná tekutina', en: 'water or other liquid' } },
          { value: 'other', label: { cs: 'ostatní (sůl, droždí, tuk…)', en: 'other (salt, yeast, fat…)' } },
        ],
      },
    ],
  },
  { id: 'target', type: 'number', optional: true, min: 1, max: 1e7, step: 10, unit: 'g', label: { cs: 'Přepočítat na hmotnost těsta (nepovinné)', en: 'Scale to a dough weight (optional)' } },
];

const outputs = [
  { id: 'percent', type: 'list', label: { cs: 'Pekařská procenta suroviny', en: 'Baker\'s percentage of ingredient' }, unit: '%', precision: 1 },
  { id: 'scaled', type: 'list', label: { cs: 'Přepočtená hmotnost suroviny', en: 'Scaled weight of ingredient' }, unit: 'g', precision: 0 },
  { id: 'flour', label: { cs: 'Mouka celkem', en: 'Total flour' }, unit: 'g', precision: 0 },
  { id: 'hydration', label: { cs: 'Hydratace (voda / mouka)', en: 'Hydration (water / flour)' }, unit: '%', precision: 1 },
  { id: 'dough', label: { cs: 'Hmotnost těsta', en: 'Dough weight' }, unit: 'g', precision: 0 },
];

export default {
  id: 'bakers-percentage',
  kind: 'calculator',
  category: 'food-baking',
  tags: ['food'],
  name: { cs: 'Pekařská procenta', en: 'Baker\'s percentages' },
  description: {
    cs: 'Pekařská procenta vyjadřují každou surovinu jako podíl z celkové mouky (mouka = 100 %), takže recept snadno přepočtete na jiné množství: 500 g mouky, 350 g vody a 10 g soli je 100 : 70 : 2. Zadáte-li hmotnost těsta, přepočte všechny suroviny.',
    en: 'Baker\'s percentages give each ingredient as a share of the total flour (flour = 100 %), so a recipe scales easily: 500 g flour, 350 g water and 10 g salt is 100 : 70 : 2. With a dough weight given, all ingredients are scaled to it.',
  },
  keywords: {
    cs: ['pekařská procenta', 'pečení', 'chléb', 'těsto', 'recept', 'mouka', 'hydratace', 'přepočet receptu'],
    en: ['baker\'s percentage', 'bakers percent', 'baking', 'bread', 'dough', 'recipe', 'flour', 'hydration'],
  },
  inputs,
  outputs,
  compute(values) {
    const source = values && typeof values === 'object' ? /** @type {Record<string, any>} */ (values) : {};
    // Example recipe when called without a list; a form passes its own list
    const defaults = [{}, { grams: 350, kind: 'water' }, { grams: 10, kind: 'other' }];
    const read = readInputs(inputs, { ...source, ingredients: Object.hasOwn(source, 'ingredients') && source.ingredients != null ? source.ingredients : defaults });
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { ingredients, target } = read.values;
    const flour = ingredients.filter((/** @type {any} */ item) => item.kind === 'flour').reduce((/** @type {number} */ sum, /** @type {any} */ item) => sum + item.grams, 0);
    if (flour <= 0) return emptyResult(outputs, [{ cs: 'Recept musí obsahovat mouku.', en: 'The recipe needs flour.' }]);
    const water = ingredients.filter((/** @type {any} */ item) => item.kind === 'water').reduce((/** @type {number} */ sum, /** @type {any} */ item) => sum + item.grams, 0);
    const dough = ingredients.reduce((/** @type {number} */ sum, /** @type {any} */ item) => sum + item.grams, 0);
    const factor = target === null ? 1 : target / dough;
    return {
      values: {
        percent: ingredients.map((/** @type {any} */ item) => item.grams / flour * 100),
        scaled: ingredients.map((/** @type {any} */ item) => item.grams * factor),
        flour,
        hydration: water / flour * 100,
        dough,
      },
      warnings: [],
    };
  },
  references: [{ title: 'Hamelman, J.: Bread – A Baker\'s Book of Techniques and Recipes – baker\'s percentage' }],
};
