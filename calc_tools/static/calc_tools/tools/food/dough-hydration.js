/**
 * Dough hydration including the water in milk, eggs, butter and sourdough.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** Water content of liquids and fats, as a share. */
export const WATER_CONTENT = { milk: 0.87, egg: 0.75, butter: 0.16 };

const grams = (/** @type {string} */ id, /** @type {number} */ value, /** @type {string} */ cs, /** @type {string} */ en) => ({
  id, type: 'number', default: value, min: 0, max: 1e7, step: 1, unit: 'g', label: { cs, en },
});

const inputs = [
  grams('flour', 450, 'Mouka', 'Flour'),
  grams('water', 280, 'Voda', 'Water'),
  grams('milk', 0, 'Mléko (87 % vody)', 'Milk (87 % water)'),
  grams('eggs', 0, 'Vejce bez skořápky (75 % vody)', 'Eggs without shell (75 % water)'),
  grams('butter', 0, 'Máslo (16 % vody)', 'Butter (16 % water)'),
  grams('starter', 100, 'Kvásek', 'Sourdough starter'),
  { id: 'starterHydration', type: 'number', default: 100, min: 0, max: 500, step: 5, unit: '%', label: { cs: 'Hydratace kvásku', en: 'Starter hydration' } },
  { id: 'target', type: 'number', optional: true, default: 72, min: 1, max: 200, step: 1, unit: '%', label: { cs: 'Cílová hydratace (nepovinné)', en: 'Target hydration (optional)' } },
];

const outputs = [
  { id: 'hydration', label: { cs: 'Celková hydratace', en: 'Total hydration' }, unit: '%', precision: 1 },
  { id: 'totalFlour', label: { cs: 'Mouka celkem (i z kvásku)', en: 'Total flour (including starter)' }, unit: 'g', precision: 0 },
  { id: 'totalWater', label: { cs: 'Voda celkem', en: 'Total water' }, unit: 'g', precision: 0 },
  { id: 'addWater', label: { cs: 'Pro cílovou hydrataci přidat (− ubrat) vody', en: 'Water to add (− remove) for the target' }, unit: 'g', precision: 0 },
];

export default {
  id: 'dough-hydration',
  kind: 'calculator',
  category: 'food-baking',
  tags: ['food'],
  name: { cs: 'Hydratace těsta', en: 'Dough hydration' },
  description: {
    cs: 'Skutečná hydratace těsta = veškerá voda / veškerá mouka, včetně vody v mléce, vejcích, másle a mouky a vody v kvásku. Chleba mívá 65–80 %, bagety 70–75 %, pizza 60–70 %. Pro cílovou hydrataci ukáže, kolik vody přidat nebo ubrat.',
    en: 'True dough hydration = all water / all flour, including the water in milk, eggs and butter and the flour and water in the starter. Bread is usually 65–80 %, baguettes 70–75 %, pizza 60–70 %. For a target hydration it shows how much water to add or remove.',
  },
  keywords: {
    cs: ['hydratace', 'hydratace těsta', 'těsto', 'chléb', 'kvásek', 'pizza', 'voda v těstě'],
    en: ['hydration', 'dough hydration', 'dough', 'bread', 'sourdough', 'pizza', 'water content'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { flour, water, milk, eggs, butter, starter, starterHydration, target } = read.values;
    const starterFlour = starter / (1 + starterHydration / 100);
    const totalFlour = flour + starterFlour;
    const totalWater = water + (starter - starterFlour) + milk * WATER_CONTENT.milk + eggs * WATER_CONTENT.egg + butter * WATER_CONTENT.butter;
    if (totalFlour <= 0) return emptyResult(outputs, [{ cs: 'Těsto musí obsahovat mouku.', en: 'The dough needs flour.' }]);
    return {
      values: { hydration: totalWater / totalFlour * 100, totalFlour, totalWater, addWater: target === null ? null : totalFlour * target / 100 - totalWater },
      warnings: [],
    };
  },
  references: [{ title: 'Hamelman, J.: Bread – A Baker\'s Book of Techniques and Recipes – dough hydration' }],
};
