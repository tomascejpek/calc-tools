/**
 * Building a sourdough levain from a starter in a chosen ratio.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'amount', type: 'number', default: 200, min: 1, max: 1e6, step: 10, unit: 'g', label: { cs: 'Potřebné množství kvásku', en: 'Levain needed' } },
  { id: 'starterParts', type: 'number', default: 1, min: 0.01, max: 100, step: 0.5, label: { cs: 'Poměr: dílů matky (startéru)', en: 'Ratio: parts of starter' } },
  { id: 'flourParts', type: 'number', default: 5, min: 0, max: 100, step: 0.5, label: { cs: 'Poměr: dílů mouky', en: 'Ratio: parts of flour' } },
  { id: 'waterParts', type: 'number', default: 5, min: 0, max: 100, step: 0.5, label: { cs: 'Poměr: dílů vody', en: 'Ratio: parts of water' } },
  { id: 'starterHydration', type: 'number', default: 100, min: 0, max: 500, step: 5, unit: '%', label: { cs: 'Hydratace matky', en: 'Starter hydration' } },
];

const outputs = [
  { id: 'starter', label: { cs: 'Matky (startéru)', en: 'Starter' }, unit: 'g', precision: 0 },
  { id: 'flour', label: { cs: 'Mouky', en: 'Flour' }, unit: 'g', precision: 0 },
  { id: 'water', label: { cs: 'Vody', en: 'Water' }, unit: 'g', precision: 0 },
  { id: 'hydration', label: { cs: 'Hydratace kvásku', en: 'Levain hydration' }, unit: '%', precision: 0 },
  { id: 'inoculation', label: { cs: 'Podíl matky na mouce', en: 'Starter as a share of flour' }, unit: '%', precision: 0 },
];

export default {
  id: 'sourdough',
  kind: 'calculator',
  category: 'food-baking',
  tags: ['food'],
  name: { cs: 'Kvásek (založení z matky)', en: 'Sourdough levain build' },
  description: {
    cs: 'Kolik matky, mouky a vody smíchat na potřebné množství kvásku v poměru, např. 1 : 5 : 5. Čím menší podíl matky, tím déle kvásek zraje (1 : 1 : 1 asi 4–6 hodin, 1 : 5 : 5 přes noc při pokojové teplotě). Ukáže i hydrataci výsledného kvásku.',
    en: 'How much starter, flour and water to mix for the levain needed in a ratio such as 1 : 5 : 5. The smaller the share of starter, the longer the levain takes to ripen (1 : 1 : 1 about 4–6 hours, 1 : 5 : 5 overnight at room temperature). Also shows the hydration of the resulting levain.',
  },
  keywords: {
    cs: ['kvásek', 'kvas', 'matka', 'startér', 'žitný kvas', 'levain', 'chléb', 'krmení kvásku'],
    en: ['sourdough', 'levain', 'starter', 'mother dough', 'feeding', 'bread', 'leaven'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { amount, starterParts, flourParts, waterParts, starterHydration } = read.values;
    const unit = amount / (starterParts + flourParts + waterParts);
    const starter = starterParts * unit;
    const flour = flourParts * unit;
    const water = waterParts * unit;
    const starterFlour = starter / (1 + starterHydration / 100);
    const totalFlour = flour + starterFlour;
    return {
      values: { starter, flour, water, hydration: totalFlour > 0 ? (water + starter - starterFlour) / totalFlour * 100 : null, inoculation: flour > 0 ? starter / flour * 100 : null },
      warnings: flour === 0 ? [{ cs: 'Bez mouky se kvásek nenakrmí.', en: 'Without flour the levain is not fed.' }] : [],
    };
  },
  references: [{ title: 'Hamelman, J.: Bread – A Baker\'s Book of Techniques and Recipes – sourdough builds' }],
};
