/**
 * Grams of alcohol and standard drinks in a serving.
 */

import { STANDARD_DRINK_G, ethanolGrams } from '../../core/units.js';
import { emptyResult, readInputs } from '../../core/tool.js';

export { ethanolGrams };

/** Grams of ethanol in one standard drink by definition. */
export const STANDARD_DRINKS = {
  who: STANDARD_DRINK_G,
  us: 14,
  uk: 8,
  au: 10,
  ca: 13.45,
};

/** Energy of ethanol, kcal per gram (EU Regulation 1169/2011: 29 kJ/g). */
export const ETHANOL_KCAL_PER_G = 29 / 4.184;

const inputs = [
  { id: 'volume', type: 'number', default: 500, min: 0, max: 100000, step: 10, unit: 'ml', label: { cs: 'Objem nápoje', en: 'Drink volume' } },
  { id: 'abv', type: 'number', default: 5, min: 0, max: 100, step: 0.1, unit: { cs: '% obj.', en: '% ABV' }, label: { cs: 'Obsah alkoholu', en: 'Alcohol by volume' } },
  { id: 'servings', type: 'number', default: 1, min: 0, max: 1000, step: 1, label: { cs: 'Počet porcí', en: 'Number of servings' } },
  {
    id: 'standard', type: 'select', default: 'who', label: { cs: 'Standardní nápoj', en: 'Standard drink' },
    options: [
      { value: 'who', label: { cs: '10 g (WHO, ČR, většina Evropy)', en: '10 g (WHO, most of Europe)' } },
      { value: 'uk', label: { cs: '8 g (britská jednotka alkoholu)', en: '8 g (UK unit of alcohol)' } },
      { value: 'au', label: { cs: '10 g (Austrálie)', en: '10 g (Australia)' } },
      { value: 'ca', label: { cs: '13,45 g (Kanada)', en: '13.45 g (Canada)' } },
      { value: 'us', label: { cs: '14 g (USA)', en: '14 g (USA)' } },
    ],
  },
];

const outputs = [
  { id: 'grams', label: { cs: 'Alkohol', en: 'Alcohol' }, unit: 'g', precision: 1 },
  { id: 'drinks', label: { cs: 'Standardní nápoje', en: 'Standard drinks' }, unit: '', precision: 1 },
  { id: 'kcal', label: { cs: 'Energie z alkoholu', en: 'Energy from alcohol' }, unit: 'kcal', precision: 0 },
];

export default {
  id: 'alcohol-units',
  kind: 'calculator',
  category: 'alcohol-health',
  tags: ['beer'],
  name: { cs: 'Gramy alkoholu a standardní nápoje', en: 'Alcohol grams and standard drinks' },
  description: {
    cs: 'Kolik gramů čistého alkoholu obsahuje nápoj daného objemu a síly (hustota ethanolu 0,789 g/ml), kolik je to standardních nápojů a kolik energie má samotný alkohol (7 kcal/g). Standardní nápoj se v zemích liší: 10 g podle WHO a českých doporučení, britská jednotka 8 g, v USA 14 g.',
    en: 'How many grams of pure alcohol drinks of a given volume and strength contain (ethanol density 0.789 g/ml), how many standard drinks that is and how much energy the alcohol alone has (7 kcal/g). The standard drink differs by country: 10 g by WHO, the UK unit 8 g, 14 g in the USA.',
  },
  keywords: {
    cs: ['gramy alkoholu', 'standardní nápoj', 'standardní dávka', 'jednotka alkoholu', 'alkohol', 'půllitr', 'kolik alkoholu', 'kalorie z alkoholu'],
    en: ['alcohol units', 'standard drink', 'grams of alcohol', 'ethanol', 'alcohol calories'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { volume, abv, servings, standard } = read.values;
    const grams = ethanolGrams(volume, abv) * servings;
    const drink = STANDARD_DRINKS[/** @type {keyof typeof STANDARD_DRINKS} */ (standard)];
    return { values: { grams, drinks: grams / drink, kcal: grams * ETHANOL_KCAL_PER_G }, warnings: [] };
  },
  references: [
    { title: 'WHO: International Guide for Monitoring Alcohol Consumption and Related Harm (2000), standard drink of 10 g', url: 'https://iris.who.int/handle/10665/66529' },
    { title: 'Wikipedia: Standard drink – definitions by country', url: 'https://en.wikipedia.org/wiki/Standard_drink' },
    { title: 'Regulation (EU) No 1169/2011, Annex XIV – energy conversion factors (alcohol 29 kJ/g)', url: 'https://eur-lex.europa.eu/eli/reg/2011/1169/oj' },
  ],
};
