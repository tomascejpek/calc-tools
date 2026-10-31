/**
 * Concentration of a solution: mass and volume fractions, ppm, mg/l and
 * mol/l, linked by the density of the solution, the density of the
 * dissolved substance and its molar mass.
 */

import { isNumber } from '../../core/units.js';

/**
 * @typedef {object} Solution
 * @property {number} density solution, kg/l
 * @property {number | null} [soluteDensity] pure dissolved substance, kg/l
 * @property {number | null} [molarMass] g/mol
 */

/**
 * mg of substance per litre of solution in one unit, or null when a needed
 * property is missing.
 * @param {string} unitId
 * @param {Solution} solution
 * @returns {number | null}
 */
export function mgPerLitreOfUnit(unitId, { density, soluteDensity = null, molarMass = null }) {
  switch (unitId) {
    case 'mg-l': return 1;
    case 'g-l': return 1000;
    case 'wv': return 10000; // g per 100 ml
    case 'ww': return density * 1e4; // 1 % of 1 kg in a litre of density ρ
    case 'ppm': return density; // mg per kg of solution
    case 'ppb': return density / 1000;
    case 'vv': return isNumber(soluteDensity) ? soluteDensity * 1e4 : null;
    case 'mol-l': return isNumber(molarMass) ? molarMass * 1000 : null;
    case 'mmol-l': return isNumber(molarMass) ? molarMass : null;
    default: return null;
  }
}

/**
 * @param {Record<string, any>} params
 * @returns {Solution}
 */
function solution(params) {
  return { density: params?.density ?? 1, soluteDensity: params?.soluteDensity ?? null, molarMass: params?.molarMass ?? null };
}

export default {
  id: 'concentration',
  kind: 'converter',
  category: 'units-concentration',
  tags: [],
  name: { cs: 'Převod koncentrace', en: 'Concentration converter' },
  description: {
    cs: 'Převod koncentrace roztoku mezi mg/l, g/l, hmotnostními procenty (% hm.), procenty hmotnost/objem, ppm, ppb, objemovými procenty (% obj.) a molaritou (mol/l). Hmotnostní procenta a ppm potřebují hustotu roztoku (zředěné vodné roztoky ≈ 1 kg/l), % obj. hustotu čisté rozpuštěné látky a mol/l její molární hmotnost. Objemová procenta nezahrnují kontrakci při mísení.',
    en: 'Converts solution concentration between mg/l, g/l, percent by mass (% w/w), percent weight per volume, ppm, ppb, percent by volume (% v/v) and molarity (mol/l). Mass percent and ppm need the solution density (dilute aqueous solutions ≈ 1 kg/l), % v/v the density of the pure substance and mol/l its molar mass. Volume percent ignores the contraction on mixing.',
  },
  keywords: {
    cs: ['koncentrace', 'hmotnostní procenta', 'objemová procenta', 'ppm', 'ppb', 'mg/l', 'molarita', 'mol/l', 'roztok', 'ředění'],
    en: ['concentration', 'mass fraction', 'percent by weight', 'volume fraction', 'ppm', 'ppb', 'mg/l', 'molarity', 'mol/l', 'solution'],
  },
  units: [
    { id: 'mg-l', default: 1000, label: { cs: 'mg/l', en: 'mg/l' }, significant: 6, min: 0 },
    { id: 'g-l', label: { cs: 'g/l', en: 'g/l' }, significant: 6, min: 0 },
    { id: 'ww', label: { cs: '% hm. (w/w)', en: '% w/w' }, significant: 6, min: 0, max: 100 },
    { id: 'wv', label: { cs: '% hmotnost/objem (g/100 ml)', en: '% w/v (g/100 ml)' }, significant: 6, min: 0 },
    { id: 'vv', label: { cs: '% obj. (v/v)', en: '% v/v' }, significant: 6, min: 0, max: 100 },
    { id: 'ppm', label: { cs: 'ppm (mg/kg)', en: 'ppm (mg/kg)' }, significant: 6, min: 0, max: 1e6 },
    { id: 'ppb', label: { cs: 'ppb (µg/kg)', en: 'ppb (µg/kg)' }, significant: 6, min: 0, max: 1e9 },
    { id: 'mol-l', label: { cs: 'mol/l', en: 'mol/l' }, significant: 6, min: 0 },
    { id: 'mmol-l', label: { cs: 'mmol/l', en: 'mmol/l' }, significant: 6, min: 0 },
  ],
  params: [
    { id: 'density', type: 'number', default: 1, min: 0.5, max: 25, step: 0.001, unit: 'kg/l', label: { cs: 'Hustota roztoku', en: 'Solution density' } },
    { id: 'soluteDensity', type: 'number', optional: true, min: 0.1, max: 25, step: 0.001, unit: 'kg/l', label: { cs: 'Hustota rozpuštěné látky (pro % obj.)', en: 'Density of the substance (for % v/v)' } },
    { id: 'molarMass', type: 'number', optional: true, min: 0.5, max: 1e6, step: 0.01, unit: 'g/mol', label: { cs: 'Molární hmotnost (pro mol/l)', en: 'Molar mass (for mol/l)' } },
  ],
  // Base unit: mg/l
  toBase(value, unitId, params = {}) {
    const factor = mgPerLitreOfUnit(unitId, solution(params));
    return factor === null ? null : value * factor;
  },
  fromBase(value, unitId, params = {}) {
    const factor = mgPerLitreOfUnit(unitId, solution(params));
    return factor === null ? null : value / factor;
  },
  references: [
    { title: 'IUPAC Gold Book: mass fraction, volume fraction, amount concentration', url: 'https://goldbook.iupac.org/' },
  ],
};
