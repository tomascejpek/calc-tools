/**
 * Preparing a solution of a given concentration from a solid or a stock liquid.
 */

import { formulaMass } from '../../core/chemistry.js';
import { emptyResult, readInputs } from '../../core/tool.js';
import { BAD_FORMULA, FORMULA_INPUT } from './molar-mass.js';

const inputs = [
  {
    id: 'source', type: 'select', default: 'liquid', label: { cs: 'Ze', en: 'From' },
    options: [
      { value: 'solid', label: { cs: 'pevné látky (navážit)', en: 'a solid (weigh)' } },
      { value: 'liquid', label: { cs: 'koncentrovaného roztoku (odměřit)', en: 'a concentrated liquid (measure)' } },
    ],
  },
  { id: 'formula', ...FORMULA_INPUT, default: 'HCl', label: { cs: 'Vzorec látky (jak se prodává, i s hydrátem)', en: 'Formula (as sold, with any hydrate)' } },
  { id: 'volume', type: 'number', default: 1000, min: 0.001, max: 1e12, step: 10, unit: 'ml', label: { cs: 'Objem výsledného roztoku', en: 'Final volume' } },
  { id: 'concentration', type: 'number', default: 0.1, min: 0, max: 1e6, step: 0.01, label: { cs: 'Cílová koncentrace', en: 'Target concentration' } },
  {
    id: 'unit', type: 'select', default: 'mol', label: { cs: 'Jednotka koncentrace', en: 'Concentration unit' },
    options: [
      { value: 'mol', label: { cs: 'mol/l', en: 'mol/l' } },
      { value: 'g', label: { cs: 'g/l', en: 'g/l' } },
      { value: 'wv', label: { cs: '% hmotnost/objem (g/100 ml)', en: '% w/v (g/100 ml)' } },
    ],
  },
  { id: 'purity', type: 'number', default: 37, min: 0.01, max: 100, step: 0.5, unit: '%', label: { cs: 'Čistota, u roztoku obsah látky (% hm.)', en: 'Purity; for a liquid its strength (% w/w)' } },
  { id: 'density', type: 'number', default: 1.18, min: 0.1, max: 25, step: 0.01, unit: 'g/ml', label: { cs: 'Hustota koncentrovaného roztoku (37% HCl 1,18)', en: 'Density of the concentrated liquid (37 % HCl 1.18)' } },
];

const outputs = [
  { id: 'grams', label: { cs: 'Navážit', en: 'Weigh out' }, unit: 'g', significant: 5 },
  { id: 'millilitres', label: { cs: 'Odměřit (koncentrovaného roztoku)', en: 'Measure (of the concentrated liquid)' }, unit: 'ml', significant: 5 },
  { id: 'molarMass', label: { cs: 'Molární hmotnost', en: 'Molar mass' }, unit: 'g/mol', significant: 6 },
];

export default {
  id: 'solution-prep',
  kind: 'calculator',
  category: 'chemistry-solutions',
  tags: ['chemistry'],
  name: { cs: 'Příprava roztoku dané koncentrace', en: 'Preparing a solution' },
  description: {
    cs: 'Kolik látky navážit nebo kolik koncentrovaného roztoku odměřit pro daný objem roztoku zadané koncentrace (mol/l, g/l nebo % hm./obj.). Zohlední čistotu a hydrát podle vzorce (CuSO4·5H2O). Látku rozpusťte v menším množství vody a doplňte na objem. Kyselinu vždy lijte do vody, ne naopak.',
    en: 'How much substance to weigh or how much concentrated liquid to measure for a volume of solution at a given concentration (mol/l, g/l or % w/v). Accounts for purity and the hydrate in the formula (CuSO4·5H2O). Dissolve in less water and make up to volume. Always pour acid into water, never the other way.',
  },
  keywords: {
    cs: ['příprava roztoku', 'navážka', 'molarita', 'mol/l', 'koncentrovaná kyselina', 'čistota', 'roztok'],
    en: ['solution preparation', 'make a solution', 'molarity', 'mol/l', 'concentrated acid', 'purity', 'weigh out'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { source, formula, volume, concentration, unit, purity, density } = read.values;
    const molar = formulaMass(formula);
    if (molar === null) return emptyResult(outputs, [BAD_FORMULA]);
    const gramsPerLitre = unit === 'mol' ? concentration * molar : unit === 'g' ? concentration : concentration * 10;
    const pure = gramsPerLitre * volume / 1000;
    const grams = pure / (purity / 100);
    return { values: { grams, millilitres: source === 'liquid' ? grams / density : null, molarMass: molar }, warnings: [] };
  },
  references: [{ title: 'Harris, D. C.: Quantitative Chemical Analysis – preparing solutions' }],
};
