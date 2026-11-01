/**
 * Molar mass and mass composition from a chemical formula.
 */

import { ATOMIC_WEIGHTS, FORMULA_PATTERN, IUPAC_WEIGHTS, molarMass, parseFormula } from '../../core/chemistry.js';
import { bilingual } from '../../core/format.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/** The formula input shared by chemistry tools. */
export const FORMULA_INPUT = {
  type: 'text', maxLength: 100, pattern: FORMULA_PATTERN,
  hint: { cs: 'Např. H2O, Ca(OH)2, CuSO4·5H2O; velikost písmen rozhoduje (Co je kobalt, CO oxid uhelnatý).', en: 'E.g. H2O, Ca(OH)2, CuSO4·5H2O; letter case matters (Co is cobalt, CO carbon monoxide).' },
};

/** Warning for a formula that cannot be read. */
export const BAD_FORMULA = {
  cs: 'Vzorec nelze přečíst: zkontrolujte značky prvků, velikost písmen a závorky.',
  en: 'The formula cannot be read: check the element symbols, letter case and brackets.',
};

const inputs = [
  { id: 'formula', ...FORMULA_INPUT, default: 'CuSO4·5H2O', label: { cs: 'Vzorec', en: 'Formula' } },
];

const outputs = [
  { id: 'molarMass', label: { cs: 'Molární hmotnost', en: 'Molar mass' }, unit: 'g/mol', significant: 6 },
  { id: 'composition', type: 'text', label: { cs: 'Hmotnostní složení', en: 'Composition by mass' } },
  { id: 'atoms', label: { cs: 'Počet atomů ve vzorci', en: 'Atoms in the formula' }, precision: 0 },
];

export default {
  id: 'molar-mass',
  kind: 'calculator',
  category: 'chemistry-stoichiometry',
  tags: ['chemistry'],
  name: { cs: 'Molární hmotnost ze vzorce', en: 'Molar mass from a formula' },
  description: {
    cs: 'Molární hmotnost a hmotnostní podíly prvků podle chemického vzorce se závorkami a hydráty (CuSO4·5H2O, Ca(OH)2, K4[Fe(CN)6]). Atomové hmotnosti jsou standardní hodnoty IUPAC.',
    en: 'Molar mass and the mass share of each element from a chemical formula with brackets and hydrates (CuSO4·5H2O, Ca(OH)2, K4[Fe(CN)6]). Atomic weights are IUPAC standard values.',
  },
  keywords: {
    cs: ['molární hmotnost', 'molekulová hmotnost', 'vzorec', 'chemie', 'složení', 'hydrát', 'g/mol'],
    en: ['molar mass', 'molecular weight', 'formula weight', 'formula', 'chemistry', 'composition', 'hydrate'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    let counts;
    try {
      counts = parseFormula(read.values.formula);
    } catch {
      return emptyResult(outputs, [BAD_FORMULA]);
    }
    const mass = molarMass(counts);
    const composition = bilingual((lang, number) => [...counts]
      .map(([element, n]) => `${element} ${number(ATOMIC_WEIGHTS[/** @type {keyof typeof ATOMIC_WEIGHTS} */ (element)] * n / mass * 100)} %`)
      .join(', '), 4);
    return { values: { molarMass: mass, composition, atoms: [...counts.values()].reduce((sum, n) => sum + n, 0) }, warnings: [] };
  },
  references: [IUPAC_WEIGHTS],
};
