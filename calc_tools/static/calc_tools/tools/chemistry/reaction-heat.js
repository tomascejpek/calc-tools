/**
 * Reaction enthalpy from standard enthalpies of formation (Hess's law).
 */

import { equationText, hillKey, parseFormula } from '../../core/chemistry.js';
import { bilingual } from '../../core/format.js';
import { emptyResult, readInputs } from '../../core/tool.js';
import { EQUATION_INPUT, balanceText } from './balance-equation.js';

/**
 * Standard enthalpies of formation at 25 °C, kJ/mol, keyed by Hill formula
 * (water separately by phase). NIST Chemistry WebBook / CRC Handbook.
 */
export const FORMATION_ENTHALPY = {
  CO2: -393.51, CO: -110.53, CH4: -74.87, C2H6: -84.0, C3H8: -103.8, C4H10: -125.6, C8H18: -250.1,
  C2H4: 52.4, C2H2: 227.4, CH4O: -239.2, C2H6O: -277.6, C6H12O6: -1273.3, C12H22O11: -2226.1, C2H4O2: -484.3,
  H3N: -45.9, NO: 91.3, NO2: 33.2, N2O: 81.6, O2S: -296.8, O3S: -395.7, H2S: -20.6, ClH: -92.3, FH: -273.3,
  ClNa: -411.2, HNaO: -425.8, HKO: -424.6, CCaO3: -1207.6, CaO: -634.9, CaH2O2: -985.2, MgO: -601.6,
  Al2O3: -1675.7, Fe2O3: -824.2, Fe3O4: -1118.4, H2O4S: -814.0, HNO3: -174.1, H2O2: -187.8, O3: 142.7,
  CHNaO3: -950.8, CNa2O3: -1130.7,
};

/** Elements in their standard state have zero enthalpy of formation. */
const STANDARD_ELEMENTS = new Set(['H2', 'N2', 'O2', 'F2', 'Cl2', 'Br2', 'I2', 'P4', 'S8']);

/**
 * @param {string} formula
 * @param {'liquid' | 'gas'} water
 * @param {Record<string, number>} overrides by Hill formula
 * @returns {number | null}
 */
export function formationEnthalpy(formula, water, overrides) {
  const counts = parseFormula(formula);
  const key = hillKey(counts);
  if (Object.hasOwn(overrides, key)) return overrides[key];
  if (key === 'H2O') return water === 'gas' ? -241.83 : -285.83;
  if (counts.size === 1 && (STANDARD_ELEMENTS.has(key) || [...counts.values()][0] === 1)) return 0;
  return Object.hasOwn(FORMATION_ENTHALPY, key) ? FORMATION_ENTHALPY[/** @type {keyof typeof FORMATION_ENTHALPY} */ (key)] : null;
}

/**
 * Parses "Fe2O3 = -824.2; Al2O3: -1675.7".
 * @param {string | null} text
 * @returns {Record<string, number> | null}
 */
export function parseOverrides(text) {
  /** @type {Record<string, number>} */
  const result = {};
  if (!text) return result;
  for (const part of text.split(/[;\n]+/).map((item) => item.trim()).filter(Boolean)) {
    const match = part.match(/^([A-Za-z0-9()[\]·*.]+)\s*[:=]\s*([-+]?\d+(?:[.,]\d+)?)$/);
    if (!match) return null;
    try {
      result[hillKey(parseFormula(match[1]))] = Number(match[2].replace(',', '.'));
    } catch {
      return null;
    }
  }
  return result;
}

const inputs = [
  { id: 'equation', ...EQUATION_INPUT, default: 'CH4 + O2 = CO2 + H2O', label: { cs: 'Rovnice (vyčíslí se sama)', en: 'Equation (balanced automatically)' } },
  {
    id: 'water', type: 'select', default: 'liquid', label: { cs: 'Voda v rovnici', en: 'Water in the equation' },
    options: [
      { value: 'liquid', label: { cs: 'kapalná (spalné teplo)', en: 'liquid (higher heating value)' } },
      { value: 'gas', label: { cs: 'pára (výhřevnost)', en: 'vapour (lower heating value)' } },
    ],
  },
  {
    id: 'overrides', type: 'text', optional: true, maxLength: 500, pattern: /^[A-Za-z0-9()[\]·*.\s:=;,+-]+$/,
    hint: { cs: 'Ve tvaru vzorec = kJ/mol, oddělené středníkem.', en: 'As formula = kJ/mol, separated by semicolons.' },
    label: { cs: 'Další slučovací entalpie (např. Fe2O3 = -824,2)', en: 'More enthalpies of formation (e.g. Fe2O3 = -824.2)' },
  },
];

const outputs = [
  { id: 'enthalpy', label: { cs: 'Reakční entalpie ΔH° (pro vyčíslenou rovnici)', en: 'Reaction enthalpy ΔH° (for the balanced equation)' }, unit: 'kJ', significant: 6 },
  { id: 'balanced', type: 'text', label: { cs: 'Vyčíslená rovnice', en: 'Balanced equation' } },
  { id: 'kind', type: 'text', label: { cs: 'Reakce je', en: 'The reaction is' } },
];

export default {
  id: 'reaction-heat',
  kind: 'calculator',
  category: 'chemistry-thermo',
  tags: ['chemistry'],
  name: { cs: 'Reakční teplo (Hessův zákon)', en: 'Reaction enthalpy (Hess\'s law)' },
  description: {
    cs: 'Reakční entalpie ze standardních slučovacích entalpií: ΔH° = Σ ΔHf°(produkty) − Σ ΔHf°(reaktanty). Obsahuje tabulku běžných látek; chybějící doplňte ve tvaru vzorec = kJ/mol. Záporná hodnota znamená, že reakce teplo uvolňuje (exotermní). Platí pro 25 °C a standardní tlak.',
    en: 'Reaction enthalpy from standard enthalpies of formation: ΔH° = Σ ΔHf°(products) − Σ ΔHf°(reactants). Includes a table of common substances; add missing ones as formula = kJ/mol. A negative value means the reaction releases heat (exothermic). Holds for 25 °C and standard pressure.',
  },
  keywords: {
    cs: ['reakční teplo', 'reakční entalpie', 'hessův zákon', 'slučovací entalpie', 'exotermní', 'endotermní', 'termochemie'],
    en: ['reaction enthalpy', 'heat of reaction', 'hess law', 'enthalpy of formation', 'exothermic', 'endothermic', 'thermochemistry'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { equation, water } = read.values;
    const overrides = parseOverrides(read.values.overrides);
    if (overrides === null) return emptyResult(outputs, [{ cs: 'Doplňkové entalpie nejsou ve tvaru vzorec = kJ/mol.', en: 'The extra enthalpies are not in the form formula = kJ/mol.' }]);
    const result = balanceText(equation);
    if ('error' in result) return emptyResult(outputs, [/** @type {any} */ (result.error)]);
    const species = [...result.reactants, ...result.products];
    const enthalpies = species.map((formula) => formationEnthalpy(formula, water, overrides));
    const missing = species.filter((_, i) => enthalpies[i] === null);
    if (missing.length) {
      return emptyResult(outputs, [{
        cs: `Chybí slučovací entalpie pro: ${missing.join(', ')}. Doplňte ji do pole Další slučovací entalpie.`,
        en: `Missing enthalpy of formation for: ${missing.join(', ')}. Add it to More enthalpies of formation.`,
      }]);
    }
    const enthalpy = species.reduce((sum, _, i) => {
      const sign = i < result.reactants.length ? -1 : 1;
      return sum + sign * Number(result.coefficients[i]) * /** @type {number} */ (enthalpies[i]);
    }, 0);
    return {
      values: {
        enthalpy,
        balanced: equationText(result.reactants, result.products, result.coefficients),
        kind: enthalpy < 0
          ? bilingual((lang, number) => (lang === 'cs' ? `exotermní, uvolní ${number(-enthalpy)} kJ` : `exothermic, releases ${number(-enthalpy)} kJ`), 6)
          : bilingual((lang, number) => (lang === 'cs' ? `endotermní, spotřebuje ${number(enthalpy)} kJ` : `endothermic, absorbs ${number(enthalpy)} kJ`), 6),
      },
      warnings: [],
    };
  },
  references: [
    { title: 'NIST Chemistry WebBook – standard enthalpies of formation', url: 'https://webbook.nist.gov/chemistry/' },
    { title: 'CRC Handbook of Chemistry and Physics – standard thermodynamic properties of chemical substances' },
  ],
};
