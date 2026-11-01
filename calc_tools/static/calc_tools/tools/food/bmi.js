/**
 * Body mass index for adults.
 */

import { bilingual } from '../../core/format.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/** WHO categories: upper limits and names. */
const CATEGORIES = [
  { below: 18.5, cs: 'podváha', en: 'underweight' },
  { below: 25, cs: 'normální hmotnost', en: 'normal weight' },
  { below: 30, cs: 'nadváha', en: 'overweight' },
  { below: 35, cs: 'obezita I. stupně', en: 'obesity class I' },
  { below: 40, cs: 'obezita II. stupně', en: 'obesity class II' },
  { below: Infinity, cs: 'obezita III. stupně', en: 'obesity class III' },
];

const inputs = [
  { id: 'weight', type: 'number', default: 75, min: 1, max: 700, step: 0.5, unit: 'kg', label: { cs: 'Hmotnost', en: 'Weight' } },
  { id: 'height', type: 'number', default: 178, min: 50, max: 280, step: 1, unit: 'cm', label: { cs: 'Výška', en: 'Height' } },
];

const outputs = [
  { id: 'bmi', label: { cs: 'BMI', en: 'BMI' }, unit: 'kg/m²', precision: 1 },
  { id: 'category', type: 'text', label: { cs: 'Kategorie (WHO)', en: 'Category (WHO)' } },
  { id: 'healthyRange', type: 'text', label: { cs: 'Hmotnost pro BMI 18,5–25', en: 'Weight for BMI 18.5–25' } },
];

export default {
  id: 'bmi',
  kind: 'calculator',
  category: 'nutrition',
  tags: ['health'],
  name: { cs: 'BMI (index tělesné hmotnosti)', en: 'BMI (body mass index)' },
  description: {
    cs: 'Index tělesné hmotnosti BMI = hmotnost / výška² a kategorie podle WHO. Je to hrubé měřítko pro dospělé: nerozlišuje svaly a tuk, nezohledňuje věk ani rozložení tuku a pro děti, sportovce, těhotné a seniory se nehodí. Nenahrazuje lékařské vyšetření.',
    en: 'Body mass index BMI = weight / height² and the WHO category. It is a rough measure for adults: it does not tell muscle from fat, ignores age and fat distribution and does not suit children, athletes, pregnant women or the elderly. It does not replace a medical check.',
  },
  keywords: {
    cs: ['bmi', 'index tělesné hmotnosti', 'nadváha', 'obezita', 'podváha', 'ideální váha', 'hmotnost'],
    en: ['bmi', 'body mass index', 'overweight', 'obesity', 'underweight', 'healthy weight'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { weight, height } = read.values;
    const metres = height / 100;
    const bmi = weight / (metres * metres);
    const category = /** @type {typeof CATEGORIES[number]} */ (CATEGORIES.find((item) => bmi < item.below));
    return {
      values: {
        bmi,
        category: { cs: category.cs, en: category.en },
        healthyRange: bilingual((lang, number) => `${number(Math.round(18.5 * metres * metres * 10) / 10)}–${number(Math.round(25 * metres * metres * 10) / 10)} kg`),
      },
      warnings: [],
    };
  },
  references: [{ title: 'WHO: Body mass index – BMI', url: 'https://www.who.int/data/gho/data/themes/topics/topic-details/GHO/body-mass-index' }],
};
