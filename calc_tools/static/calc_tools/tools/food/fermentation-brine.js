/**
 * Brine for lacto-fermented vegetables.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  {
    id: 'method', type: 'select', default: 'brine', label: { cs: 'Počítat', en: 'Count' },
    options: [
      { value: 'brine', label: { cs: 'solanku (sůl v roztoku)', en: 'the brine (salt in the solution)' } },
      { value: 'equilibrium', label: { cs: 'rovnovážně (zelenina + voda)', en: 'equilibrium (vegetables + water)' } },
      { value: 'dry', label: { cs: 'nasucho (zelí, sůl na zeleninu)', en: 'dry (sauerkraut, salt on vegetables)' } },
    ],
  },
  { id: 'water', type: 'number', default: 1000, min: 0, max: 1e7, step: 50, unit: 'g', label: { cs: 'Voda (1 ml ≈ 1 g)', en: 'Water (1 ml ≈ 1 g)' } },
  { id: 'vegetables', type: 'number', default: 1000, min: 0, max: 1e7, step: 50, unit: 'g', label: { cs: 'Zelenina', en: 'Vegetables' } },
  { id: 'percent', type: 'number', default: 3, min: 0.1, max: 25, step: 0.1, unit: '%', label: { cs: 'Slanost', en: 'Salt content' } },
];

const outputs = [
  { id: 'salt', label: { cs: 'Soli', en: 'Salt' }, unit: 'g', precision: 1 },
  { id: 'perLitre', label: { cs: 'Soli na litr vody', en: 'Salt per litre of water' }, unit: 'g/l', precision: 1 },
];

export default {
  id: 'fermentation-brine',
  kind: 'calculator',
  category: 'food-preserving',
  tags: ['food'],
  name: { cs: 'Solanka pro kvašení zeleniny', en: 'Brine for fermenting vegetables' },
  description: {
    cs: 'Kolik soli pro mléčné kvašení: okurky a zelenina v solance obvykle 3–5 %, zelí nasucho 1,5–2,5 % z hmotnosti zelí. Solanka počítá sůl jako podíl hotového roztoku (30 g soli + 970 g vody = 3 %), rovnovážně ze zeleniny i vody – zelenina pak skončí přesně na zadané slanosti. Používejte sůl bez jódu a protispékavých látek.',
    en: 'How much salt for lacto-fermentation: pickles and vegetables in brine usually 3–5 %, sauerkraut dry-salted 1.5–2.5 % of the cabbage weight. Brine counts the salt as a share of the finished solution (30 g salt + 970 g water = 3 %), equilibrium on vegetables and water – the vegetables then end at exactly the given saltiness. Use salt without iodine and anti-caking agents.',
  },
  keywords: {
    cs: ['solanka', 'kvašení zeleniny', 'mléčné kvašení', 'kysané zelí', 'okurky', 'nakládání', 'fermentace', 'kimči'],
    en: ['brine', 'fermenting vegetables', 'lacto fermentation', 'sauerkraut', 'pickles', 'kimchi', 'salt brine'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { method, water, vegetables, percent } = read.values;
    const share = percent / 100;
    let salt;
    if (method === 'brine') salt = water * share / (1 - share);
    else if (method === 'equilibrium') salt = (water + vegetables) * share;
    else salt = vegetables * share;
    const warnings = percent < 1.5
      ? [{ cs: 'Pod 1,5 % soli hrozí plíseň a měknutí zeleniny.', en: 'Below 1.5 % salt there is a risk of mould and soft vegetables.' }]
      : [];
    return { values: { salt, perLitre: water > 0 ? salt / water * 1000 : null }, warnings };
  },
  references: [{ title: 'Katz, S. E.: The Art of Fermentation – salting and brines' }],
};
