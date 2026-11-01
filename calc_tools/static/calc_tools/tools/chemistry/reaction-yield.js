/**
 * Theoretical and percentage yield of a reaction.
 */

import { formulaMass, hillKey, parseFormula } from '../../core/chemistry.js';
import { emptyResult, readInputs } from '../../core/tool.js';
import { EQUATION_INPUT, balanceText } from './balance-equation.js';
import { FORMULA_INPUT } from './molar-mass.js';

/**
 * Index of a species in a list by composition.
 * @param {string[]} species
 * @param {string} formula
 */
function findSpecies(species, formula) {
  try {
    const key = hillKey(parseFormula(formula));
    return species.findIndex((item) => hillKey(parseFormula(item)) === key);
  } catch {
    return -1;
  }
}

const inputs = [
  { id: 'equation', ...EQUATION_INPUT, default: 'C6H12O6 = C2H5OH + CO2', label: { cs: 'Rovnice (vyčíslí se sama)', en: 'Equation (balanced automatically)' } },
  { id: 'reactant', ...FORMULA_INPUT, default: 'C6H12O6', label: { cs: 'Výchozí látka (v nedostatku)', en: 'Limiting reactant' } },
  { id: 'mass', type: 'number', default: 1000, min: 0, max: 1e15, step: 1, unit: 'g', label: { cs: 'Hmotnost výchozí látky', en: 'Mass of the reactant' } },
  { id: 'product', ...FORMULA_INPUT, default: 'C2H5OH', label: { cs: 'Produkt', en: 'Product' } },
  { id: 'actual', type: 'number', optional: true, default: 460, min: 0, max: 1e15, step: 1, unit: 'g', label: { cs: 'Skutečně získaný produkt', en: 'Product actually obtained' } },
];

const outputs = [
  { id: 'theoretical', label: { cs: 'Teoretický výtěžek', en: 'Theoretical yield' }, unit: 'g', significant: 6 },
  { id: 'yield', label: { cs: 'Výtěžek', en: 'Percentage yield' }, unit: '%', significant: 4 },
  { id: 'moles', label: { cs: 'Látkové množství produktu', en: 'Amount of product' }, unit: 'mol', significant: 6 },
];

export default {
  id: 'reaction-yield',
  kind: 'calculator',
  category: 'chemistry-stoichiometry',
  tags: ['chemistry'],
  name: { cs: 'Výtěžek reakce', en: 'Reaction yield' },
  description: {
    cs: 'Kolik produktu může reakce teoreticky dát z dané hmotnosti výchozí látky (podle vyčíslené rovnice a molárních hmotností) a jaký je skutečný výtěžek v procentech. Výchozí látka se bere jako ta v nedostatku. Příklad: z 1 kg glukózy vznikne kvašením nejvýš 511 g ethanolu.',
    en: 'How much product a reaction can give in theory from a mass of reactant (from the balanced equation and molar masses) and the actual percentage yield. The reactant is taken as the limiting one. Example: 1 kg of glucose ferments to at most 511 g of ethanol.',
  },
  keywords: {
    cs: ['výtěžek', 'teoretický výtěžek', 'stechiometrie', 'reakce', 'výtěžnost', 'limitující reaktant'],
    en: ['reaction yield', 'theoretical yield', 'percent yield', 'stoichiometry', 'limiting reactant'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { equation, reactant, mass, product, actual } = read.values;
    const result = balanceText(equation);
    if ('error' in result) return emptyResult(outputs, [/** @type {any} */ (result.error)]);
    const r = findSpecies(result.reactants, reactant);
    const p = findSpecies(result.products, product);
    if (r < 0 || p < 0) {
      return emptyResult(outputs, [{ cs: 'Výchozí látka musí být na levé a produkt na pravé straně rovnice.', en: 'The reactant must be on the left and the product on the right of the equation.' }]);
    }
    const coefR = Number(result.coefficients[r]);
    const coefP = Number(result.coefficients[result.reactants.length + p]);
    const moles = mass / /** @type {number} */ (formulaMass(reactant)) * coefP / coefR;
    const theoretical = moles * /** @type {number} */ (formulaMass(product));
    const warnings = actual !== null && actual > theoretical
      ? [{ cs: 'Získáno víc než teoreticky možné – zkontrolujte hmotnosti nebo čistotu produktu.', en: 'More than theoretically possible – check the masses or the product purity.' }]
      : [];
    return { values: { theoretical, yield: actual === null || theoretical === 0 ? null : actual / theoretical * 100, moles }, warnings };
  },
  references: [{ title: 'Atkins, P., de Paula, J.: Physical Chemistry – reaction stoichiometry' }],
};
