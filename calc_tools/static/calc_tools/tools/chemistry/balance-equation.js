/**
 * Balancing chemical equations.
 */

import { balance, equationText, parseEquation } from '../../core/chemistry.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/** An equation: formulas joined by + on both sides of =, -> or →. */
export const EQUATION_INPUT = {
  type: 'text', maxLength: 300, pattern: /^[A-Za-z0-9()[\]{}·*.+\s=<>→⇌-]+$/,
  hint: { cs: 'Např. Fe + O2 = Fe2O3; strany oddělte =, -> nebo →, látky znaménkem +.', en: 'E.g. Fe + O2 = Fe2O3; separate the sides with =, -> or →, species with +.' },
};

/**
 * Parses and balances an equation; the warning when it fails.
 * @param {string} text
 */
export function balanceText(text) {
  const parsed = parseEquation(text);
  if (!parsed) {
    return { error: { cs: 'Rovnice musí mít dvě strany oddělené =, -> nebo →.', en: 'The equation needs two sides separated by =, -> or →.' } };
  }
  const { coefficients, reason } = balance(parsed.reactants, parsed.products);
  if (!coefficients) {
    const message = {
      unknown: { cs: 'Některý vzorec nelze přečíst.', en: 'A formula cannot be read.' },
      none: { cs: 'Rovnici nelze vyčíslit – zkontrolujte, zda jsou na obou stranách stejné prvky.', en: 'The equation cannot be balanced – check that both sides have the same elements.' },
      many: { cs: 'Rovnice má více nezávislých řešení (jde o více reakcí najednou); rozdělte ji.', en: 'The equation has several independent solutions (it is several reactions at once); split it.' },
    }[/** @type {'unknown' | 'none' | 'many'} */ (reason)];
    return { error: message };
  }
  return { ...parsed, coefficients };
}

const inputs = [
  { id: 'equation', ...EQUATION_INPUT, default: 'C8H18 + O2 = CO2 + H2O', label: { cs: 'Rovnice', en: 'Equation' } },
];

const outputs = [
  { id: 'balanced', type: 'text', label: { cs: 'Vyčíslená rovnice', en: 'Balanced equation' } },
  { id: 'coefficients', type: 'list', label: { cs: 'Koeficient', en: 'Coefficient' }, precision: 0 },
];

export default {
  id: 'balance-equation',
  kind: 'calculator',
  category: 'chemistry-stoichiometry',
  tags: ['chemistry'],
  name: { cs: 'Vyčíslení chemické rovnice', en: 'Balancing chemical equations' },
  description: {
    cs: 'Najde nejmenší celočíselné koeficienty, aby na obou stranách rovnice byl stejný počet atomů každého prvku (přesným řešením soustavy rovnic). Koeficienty zapsané před látkami se ignorují. Rovnice s náboji (iontové) zatím nepodporuje.',
    en: 'Finds the smallest whole coefficients so that both sides have the same number of atoms of each element (by solving the system exactly). Coefficients written before species are ignored. Equations with charges (ionic) are not supported yet.',
  },
  keywords: {
    cs: ['vyčíslení rovnice', 'chemická rovnice', 'koeficienty', 'stechiometrie', 'reakce', 'bilance'],
    en: ['balance equation', 'chemical equation', 'balancing', 'coefficients', 'stoichiometry', 'reaction'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const result = balanceText(read.values.equation);
    if ('error' in result) return emptyResult(outputs, [/** @type {any} */ (result.error)]);
    return {
      values: { balanced: equationText(result.reactants, result.products, result.coefficients), coefficients: result.coefficients.map(Number) },
      warnings: [],
    };
  },
  references: [{ title: 'Wikipedia: Chemical equation – matrix method of balancing', url: 'https://en.wikipedia.org/wiki/Chemical_equation#Matrix_method' }],
};
