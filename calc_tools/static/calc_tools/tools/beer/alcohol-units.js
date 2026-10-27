/**
 * Grams of alcohol and standard drinks in a serving.
 */

import { STANDARD_DRINK_G, ethanolGrams } from '../../core/units.js';
import { emptyResult, readInputs } from '../../core/tool.js';

export { ethanolGrams };

const inputs = [
  { id: 'volume', type: 'number', default: 500, min: 0, max: 100000, step: 10, unit: 'ml', label: { cs: 'Objem nápoje', en: 'Drink volume' } },
  { id: 'abv', type: 'number', default: 5, min: 0, max: 100, step: 0.1, unit: '% obj.', label: { cs: 'Obsah alkoholu', en: 'Alcohol by volume' } },
];

const outputs = [
  { id: 'grams', label: { cs: 'Alkohol', en: 'Alcohol' }, unit: 'g', precision: 1 },
  { id: 'drinks', label: { cs: 'Standardní nápoje (10 g)', en: 'Standard drinks (10 g)' }, unit: '', precision: 1 },
];

export default {
  id: 'alcohol-units',
  kind: 'calculator',
  category: 'beer',
  tags: ['beer'],
  name: { cs: 'Gramy alkoholu a standardní nápoje', en: 'Alcohol grams and standard drinks' },
  description: {
    cs: 'Kolik gramů čistého alkoholu obsahuje nápoj daného objemu a síly a kolik je to standardních nápojů po 10 g (měřítko WHO a českých doporučení). Hustota ethanolu 0,789 g/ml.',
    en: 'How many grams of pure alcohol a drink of a given volume and strength contains, and how many 10 g standard drinks that is (the WHO measure). Ethanol density 0.789 g/ml.',
  },
  keywords: {
    cs: ['gramy alkoholu', 'standardní nápoj', 'jednotka alkoholu', 'alkohol', 'půllitr', 'kolik alkoholu'],
    en: ['alcohol units', 'standard drink', 'grams of alcohol', 'ethanol'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const grams = ethanolGrams(read.values.volume, read.values.abv);
    return { values: { grams, drinks: grams / STANDARD_DRINK_G }, warnings: [] };
  },
  references: [
    { title: 'WHO: International Guide for Monitoring Alcohol Consumption and Related Harm (2000), standard drink of 10 g', url: 'https://iris.who.int/handle/10665/66529' },
    { title: 'Wikipedia: Standard drink', url: 'https://en.wikipedia.org/wiki/Standard_drink' },
  ],
};
