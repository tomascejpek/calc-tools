/**
 * Basal metabolic rate by Mifflin–St Jeor and daily energy needs.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Resting energy expenditure, kcal/day (Mifflin–St Jeor 1990).
 * @param {'male' | 'female'} sex
 * @param {number} weight kg
 * @param {number} height cm
 * @param {number} age years
 */
export function mifflinStJeor(sex, weight, height, age) {
  return 10 * weight + 6.25 * height - 5 * age + (sex === 'male' ? 5 : -161);
}

/** Physical activity levels. */
export const ACTIVITY = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9 };

const inputs = [
  {
    id: 'sex', type: 'select', default: 'male', label: { cs: 'Pohlaví', en: 'Sex' },
    options: [
      { value: 'male', label: { cs: 'muž', en: 'male' } },
      { value: 'female', label: { cs: 'žena', en: 'female' } },
    ],
  },
  { id: 'age', type: 'number', default: 35, min: 18, max: 120, step: 1, unit: { cs: 'let', en: 'years' }, label: { cs: 'Věk', en: 'Age' } },
  { id: 'weight', type: 'number', default: 75, min: 20, max: 400, step: 0.5, unit: 'kg', label: { cs: 'Hmotnost', en: 'Weight' } },
  { id: 'height', type: 'number', default: 178, min: 100, max: 250, step: 1, unit: 'cm', label: { cs: 'Výška', en: 'Height' } },
  {
    id: 'activity', type: 'select', default: 'light', label: { cs: 'Pohybová aktivita', en: 'Activity level' },
    options: [
      { value: 'sedentary', label: { cs: 'sedavá (× 1,2)', en: 'sedentary (× 1.2)' } },
      { value: 'light', label: { cs: 'lehká, 1–3× týdně sport (× 1,375)', en: 'light, sport 1–3× a week (× 1.375)' } },
      { value: 'moderate', label: { cs: 'střední, 3–5× týdně (× 1,55)', en: 'moderate, 3–5× a week (× 1.55)' } },
      { value: 'active', label: { cs: 'vysoká, 6–7× týdně (× 1,725)', en: 'high, 6–7× a week (× 1.725)' } },
      { value: 'veryActive', label: { cs: 'velmi vysoká, fyzická práce (× 1,9)', en: 'very high, physical work (× 1.9)' } },
    ],
  },
];

const outputs = [
  { id: 'bmr', label: { cs: 'Bazální metabolismus', en: 'Basal metabolic rate' }, unit: { cs: 'kcal/den', en: 'kcal/day' }, precision: 0 },
  { id: 'bmrKj', label: { cs: 'Bazální metabolismus', en: 'Basal metabolic rate' }, unit: { cs: 'kJ/den', en: 'kJ/day' }, precision: 0 },
  { id: 'total', label: { cs: 'Celkový denní výdej', en: 'Total daily energy expenditure' }, unit: { cs: 'kcal/den', en: 'kcal/day' }, precision: 0 },
  { id: 'totalKj', label: { cs: 'Celkový denní výdej', en: 'Total daily energy expenditure' }, unit: { cs: 'kJ/den', en: 'kJ/day' }, precision: 0 },
];

export default {
  id: 'basal-metabolism',
  kind: 'calculator',
  category: 'nutrition',
  tags: ['health'],
  name: { cs: 'Bazální metabolismus (Mifflin–St Jeor)', en: 'Basal metabolic rate (Mifflin–St Jeor)' },
  description: {
    cs: 'Klidový energetický výdej podle rovnice Mifflina a St Jeora (u dospělých nejpřesnější z běžných vzorců, odchylka u jednotlivce kolem ±10 %) a celkový denní výdej podle pohybové aktivity. Hodnota je odhad; při hubnutí nebo nemoci se řiďte radou lékaře či nutričního terapeuta.',
    en: 'Resting energy expenditure by the Mifflin–St Jeor equation (the most accurate common formula for adults, about ±10 % for an individual) and total daily expenditure by activity level. It is an estimate; when losing weight or ill, follow a doctor\'s or dietitian\'s advice.',
  },
  keywords: {
    cs: ['bazální metabolismus', 'klidový metabolismus', 'mifflin st jeor', 'energetický výdej', 'kalorie', 'denní příjem', 'hubnutí'],
    en: ['basal metabolic rate', 'bmr', 'mifflin st jeor', 'energy expenditure', 'tdee', 'calories', 'daily calories'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { sex, age, weight, height, activity } = read.values;
    const bmr = mifflinStJeor(sex, weight, height, age);
    const total = bmr * ACTIVITY[/** @type {keyof typeof ACTIVITY} */ (activity)];
    return { values: { bmr, bmrKj: bmr * 4.184, total, totalKj: total * 4.184 }, warnings: [] };
  },
  references: [
    { title: 'Mifflin, M. D., St Jeor, S. T. et al.: A new predictive equation for resting energy expenditure in healthy individuals. Am. J. Clin. Nutr. 51 (1990)' },
    { title: 'Frankenfield, D. et al.: Comparison of predictive equations for resting metabolic rate. J. Am. Diet. Assoc. 105 (2005)' },
  ],
};
