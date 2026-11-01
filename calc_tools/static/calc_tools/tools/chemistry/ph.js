/**
 * pH of strong and weak monoprotic acids and bases, exactly from the charge balance.
 */

import { solveIncreasing } from '../../core/units.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/** Ionic product of water at 25 °C. */
export const KW = 1e-14;

/**
 * [H⁺] of an acid (Ka = Infinity for a strong one) at concentration c,
 * solving [H⁺] = c·Ka / ([H⁺] + Ka) + Kw / [H⁺].
 * @param {number} c mol/l
 * @param {number} ka
 */
export function acidHydrogen(c, ka) {
  const excess = (/** @type {number} */ logH) => {
    const h = 10 ** logH;
    const dissociated = Number.isFinite(ka) ? c * ka / (h + ka) : c;
    return h - dissociated - KW / h;
  };
  // excess() rises with [H⁺]; find its root on a log scale
  const logH = solveIncreasing(excess, 0, -16, 2);
  return logH === null ? null : 10 ** logH;
}

const inputs = [
  {
    id: 'kind', type: 'select', default: 'weakAcid', label: { cs: 'Látka', en: 'Substance' },
    options: [
      { value: 'strongAcid', label: { cs: 'silná kyselina (HCl, HNO₃)', en: 'strong acid (HCl, HNO₃)' } },
      { value: 'weakAcid', label: { cs: 'slabá kyselina (octová, mléčná)', en: 'weak acid (acetic, lactic)' } },
      { value: 'strongBase', label: { cs: 'silná zásada (NaOH, KOH)', en: 'strong base (NaOH, KOH)' } },
      { value: 'weakBase', label: { cs: 'slabá zásada (amoniak)', en: 'weak base (ammonia)' } },
    ],
  },
  { id: 'concentration', type: 'number', default: 0.1, min: 1e-12, max: 20, step: 0.01, unit: 'mol/l', label: { cs: 'Koncentrace', en: 'Concentration' } },
  { id: 'pk', type: 'number', default: 4.76, min: -2, max: 16, step: 0.01, label: { cs: 'pKa kyseliny, nebo pKb zásady (octová 4,76; mléčná 3,86; amoniak pKb 4,75)', en: 'pKa of the acid, or pKb of the base (acetic 4.76; lactic 3.86; ammonia pKb 4.75)' } },
];

const outputs = [
  { id: 'ph', label: { cs: 'pH', en: 'pH' }, precision: 2 },
  { id: 'poh', label: { cs: 'pOH', en: 'pOH' }, precision: 2 },
  { id: 'hydrogen', label: { cs: '[H⁺]', en: '[H⁺]' }, unit: 'mol/l', significant: 4 },
  { id: 'dissociation', label: { cs: 'Stupeň disociace', en: 'Degree of dissociation' }, unit: '%', significant: 4 },
];

export default {
  id: 'ph',
  kind: 'calculator',
  category: 'chemistry-ph',
  tags: ['chemistry'],
  name: { cs: 'pH kyselin a zásad', en: 'pH of acids and bases' },
  description: {
    cs: 'pH a pOH roztoku silné nebo slabé jednosytné kyseliny či zásady při 25 °C. Počítá přesně z bilance nábojů včetně disociace vody, takže platí i pro velmi zředěné roztoky (10⁻⁸ mol/l HCl má pH 6,98, ne 8). Vícesytné kyseliny počítá jen podle první disociace.',
    en: 'pH and pOH of a strong or weak monoprotic acid or base at 25 °C. Solves the charge balance exactly, including water dissociation, so it holds for very dilute solutions too (10⁻⁸ mol/l HCl has pH 6.98, not 8). Polyprotic acids are taken by their first dissociation only.',
  },
  keywords: {
    cs: ['ph', 'poh', 'kyselost', 'kyselina', 'zásada', 'disociace', 'pka', 'slabá kyselina', 'silná kyselina'],
    en: ['ph', 'poh', 'acidity', 'acid', 'base', 'dissociation', 'pka', 'weak acid', 'strong acid'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { kind, concentration, pk } = read.values;
    const base = kind === 'strongBase' || kind === 'weakBase';
    const k = kind === 'strongAcid' || kind === 'strongBase' ? Infinity : 10 ** -pk;
    // A base is the mirror image: its [OH⁻] follows the same balance
    const ion = acidHydrogen(concentration, k);
    if (ion === null) return emptyResult(outputs, [{ cs: 'Výpočet se nezdařil.', en: 'The calculation failed.' }]);
    const pIon = -Math.log10(ion);
    const ph = base ? 14 - pIon : pIon;
    const dissociated = Number.isFinite(k) ? k / (ion + k) : 1;
    return { values: { ph, poh: 14 - ph, hydrogen: 10 ** -ph, dissociation: dissociated * 100 }, warnings: [] };
  },
  references: [{ title: 'Harris, D. C.: Quantitative Chemical Analysis – systematic treatment of equilibrium' }],
};
