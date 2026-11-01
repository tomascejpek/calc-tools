/**
 * Energy value of food from its nutrients (EU conversion factors).
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** Energy conversion factors, kJ per gram (Regulation (EU) No 1169/2011, Annex XIV). */
export const ENERGY_FACTORS = { carbohydrate: 17, polyol: 10, protein: 17, fat: 37, alcohol: 29, organicAcid: 13, fibre: 8 };

const grams = (/** @type {string} */ id, /** @type {number} */ value, /** @type {string} */ cs, /** @type {string} */ en) => ({
  id, type: 'number', default: value, min: 0, max: 1e6, step: 0.1, unit: 'g', label: { cs, en },
});

const inputs = [
  grams('protein', 10, 'Bílkoviny', 'Protein'),
  grams('fat', 5, 'Tuky', 'Fat'),
  grams('carbohydrate', 30, 'Sacharidy (využitelné)', 'Carbohydrates (available)'),
  grams('fibre', 3, 'Vláknina', 'Fibre'),
  grams('alcohol', 0, 'Alkohol (ethanol)', 'Alcohol (ethanol)'),
  grams('polyol', 0, 'Polyoly (sladidla)', 'Polyols'),
];

const outputs = [
  { id: 'kj', label: { cs: 'Energetická hodnota', en: 'Energy' }, unit: 'kJ', precision: 0 },
  { id: 'kcal', label: { cs: 'Energetická hodnota', en: 'Energy' }, unit: 'kcal', precision: 0 },
  { id: 'proteinShare', label: { cs: 'Energie z bílkovin', en: 'Energy from protein' }, unit: '%', precision: 0 },
  { id: 'fatShare', label: { cs: 'Energie z tuků', en: 'Energy from fat' }, unit: '%', precision: 0 },
  { id: 'carbohydrateShare', label: { cs: 'Energie ze sacharidů', en: 'Energy from carbohydrates' }, unit: '%', precision: 0 },
];

export default {
  id: 'food-energy',
  kind: 'calculator',
  category: 'nutrition',
  tags: ['health', 'food'],
  name: { cs: 'Energetická hodnota potravin (kJ ⇄ kcal)', en: 'Food energy (kJ ⇄ kcal)' },
  description: {
    cs: 'Energetická hodnota z obsahu živin podle převodních faktorů EU, jaké se používají na etiketách: bílkoviny a sacharidy 17 kJ (4 kcal) na gram, tuky 37 kJ (9 kcal), alkohol 29 kJ (7 kcal), vláknina 8 kJ (2 kcal), polyoly 10 kJ (2,4 kcal). 1 kcal = 4,184 kJ. Ukáže i podíl energie z jednotlivých živin.',
    en: 'Energy from the nutrient content by the EU conversion factors used on labels: protein and carbohydrates 17 kJ (4 kcal) per gram, fat 37 kJ (9 kcal), alcohol 29 kJ (7 kcal), fibre 8 kJ (2 kcal), polyols 10 kJ (2.4 kcal). 1 kcal = 4.184 kJ. Also shows the share of energy from each nutrient.',
  },
  keywords: {
    cs: ['energetická hodnota', 'kalorie', 'kj', 'kcal', 'bílkoviny', 'tuky', 'sacharidy', 'makroživiny', 'výživové údaje'],
    en: ['food energy', 'calories', 'kj', 'kcal', 'protein', 'fat', 'carbohydrates', 'macronutrients', 'nutrition label'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const v = read.values;
    const part = (/** @type {keyof typeof ENERGY_FACTORS} */ key) => v[key] * ENERGY_FACTORS[key];
    const kj = part('protein') + part('fat') + part('carbohydrate') + part('fibre') + part('alcohol') + part('polyol');
    const share = (/** @type {number} */ value) => (kj > 0 ? value / kj * 100 : 0);
    return {
      values: {
        kj,
        kcal: kj / 4.184,
        proteinShare: share(part('protein')),
        fatShare: share(part('fat')),
        carbohydrateShare: share(part('carbohydrate')),
      },
      warnings: [],
    };
  },
  references: [{ title: 'Regulation (EU) No 1169/2011 on food information to consumers, Annex XIV – conversion factors', url: 'https://eur-lex.europa.eu/eli/reg/2011/1169/oj' }],
};
