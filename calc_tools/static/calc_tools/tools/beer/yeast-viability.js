/**
 * Viability of liquid yeast by its age.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** Viability lost per day by liquid yeast stored cold, % (Mr Malty: about 21 % a month). */
export const VIABILITY_LOSS_PER_DAY = 0.7;

/**
 * Viable share of liquid yeast after a number of days from production.
 * @param {number} days
 * @returns {number} %
 */
export function yeastViability(days) {
  return Math.max(0, 100 - VIABILITY_LOSS_PER_DAY * days);
}

const inputs = [
  { id: 'days', type: 'number', default: 30, min: 0, max: 3650, step: 1, unit: { cs: 'dní', en: 'days' }, label: { cs: 'Stáří od data výroby', en: 'Days since production' } },
  { id: 'cells', type: 'number', default: 100, min: 0, max: 100000, step: 1, unit: { cs: 'mld. buněk', en: 'billion cells' }, label: { cs: 'Buněk v balení při výrobě', en: 'Cells per pack at production' } },
];

const outputs = [
  { id: 'viability', label: { cs: 'Životaschopnost', en: 'Viability' }, unit: '%', precision: 0 },
  { id: 'viableCells', label: { cs: 'Živých buněk', en: 'Viable cells' }, unit: { cs: 'mld.', en: 'billion' }, precision: 0 },
];

export default {
  id: 'yeast-viability',
  kind: 'calculator',
  category: 'yeast',
  tags: ['beer'],
  name: { cs: 'Životnost tekutých kvasnic', en: 'Liquid yeast viability' },
  description: {
    cs: 'Kolik buněk v balení tekutých kvasnic ještě žije podle stáří od data výroby. Při skladování v lednici ubývá asi 0,7 % živých buněk denně (21 % za měsíc). Sušené kvasnice ztrácejí životaschopnost mnohem pomaleji.',
    en: 'How many cells in a pack of liquid yeast are still alive, by age from the production date. Stored refrigerated, about 0.7 % of the viable cells are lost per day (21 % a month). Dry yeast loses viability far more slowly.',
  },
  keywords: {
    cs: ['kvasnice', 'životaschopnost', 'životnost', 'viabilita', 'datum výroby', 'stáří kvasnic', 'tekuté kvasnice'],
    en: ['yeast', 'viability', 'production date', 'yeast age', 'liquid yeast', 'mr malty'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const viability = yeastViability(read.values.days);
    const warnings = viability < 50
      ? [{ cs: 'Méně než polovina buněk žije; připravte startér.', en: 'Fewer than half of the cells are alive; make a starter.' }]
      : [];
    return { values: { viability, viableCells: read.values.cells * viability / 100 }, warnings };
  },
  references: [
    { title: 'White, C., Zainasheff, J.: Yeast – The Practical Guide to Beer Fermentation. Brewers Publications, 2010' },
    { title: 'Mr Malty pitching rate calculator (viability model about 21 % loss per month)', url: 'https://www.mrmalty.com/calc/calc.html' },
  ],
};
