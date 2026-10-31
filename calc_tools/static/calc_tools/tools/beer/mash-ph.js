/**
 * Rough estimate of mash pH from the grist and the residual alkalinity.
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { CACO3_PER_DH, residualAlkalinity } from '../../core/water.js';
import { ALKALINITY_INPUTS, alkalinityAsCaco3 } from './residual-alkalinity.js';

/** pH shift of a 12 °P wort per °dH of residual alkalinity (Kolbach). */
export const PH_PER_DH = 0.03;

/**
 * Estimated pH of the mash.
 * @param {number} distilledPh pH of the grist mashed in distilled water
 * @param {number} ra residual alkalinity, mg/l as CaCO₃
 */
export function estimateMashPh(distilledPh, ra) {
  return distilledPh + PH_PER_DH * ra / CACO3_PER_DH;
}

/** Typical pH of grists in distilled water. */
export const GRIST_PH = { pale: 5.75, amber: 5.55, dark: 5.35 };

const inputs = [
  {
    id: 'grist', type: 'select', default: 'pale', label: { cs: 'Sypání', en: 'Grist' },
    options: [
      { value: 'pale', label: { cs: 'světlé (plzeňský slad)', en: 'pale (pilsner malt)' } },
      { value: 'amber', label: { cs: 'polotmavé (s karamelovým sladem)', en: 'amber (with crystal malt)' } },
      { value: 'dark', label: { cs: 'tmavé (s praženým sladem)', en: 'dark (with roasted malt)' } },
      { value: 'custom', label: { cs: 'zadám pH v destilované vodě', en: 'enter the distilled water pH' } },
    ],
  },
  { id: 'distilledPh', type: 'number', default: 5.7, min: 4.5, max: 6.5, step: 0.01, label: { cs: 'pH sypání v destilované vodě', en: 'Grist pH in distilled water' } },
  { id: 'calcium', type: 'number', default: 50, min: 0, max: 1000, step: 1, unit: 'mg/l', label: { cs: 'Vápník (Ca²⁺)', en: 'Calcium (Ca²⁺)' } },
  { id: 'magnesium', type: 'number', default: 10, min: 0, max: 500, step: 1, unit: 'mg/l', label: { cs: 'Hořčík (Mg²⁺)', en: 'Magnesium (Mg²⁺)' } },
  ...ALKALINITY_INPUTS,
];

const outputs = [
  { id: 'ph', label: { cs: 'Odhad pH rmutu', en: 'Estimated mash pH' }, unit: '', precision: 2 },
  { id: 'ra', label: { cs: 'Zbytková alkalita', en: 'Residual alkalinity' }, unit: { cs: 'mg/l CaCO₃', en: 'mg/l as CaCO₃' }, precision: 0 },
];

export default {
  id: 'mash-ph',
  kind: 'calculator',
  category: 'water-chemistry',
  tags: ['beer'],
  name: { cs: 'Odhad pH rmutu', en: 'Mash pH estimate' },
  description: {
    cs: 'Orientační odhad pH rmutu: pH sypání v destilované vodě plus 0,03 za každý °dH zbytkové alkality (Kolbach, pro běžnou hustotu rmutu). Skutečné pH závisí na sladu a hustotě rmutu, proto ho změřte; cílem bývá 5,2–5,6 při teplotě místnosti.',
    en: 'Rough estimate of the mash pH: grist pH in distilled water plus 0.03 for every °dH of residual alkalinity (Kolbach, for a usual mash thickness). The real pH depends on the malt and mash thickness, so measure it; the usual target is 5.2–5.6 at room temperature.',
  },
  keywords: {
    cs: ['ph', 'ph rmutu', 'rmut', 'kyselost', 'zbytková alkalita', 'voda', 'kolbach'],
    en: ['mash ph', 'ph', 'acidity', 'residual alkalinity', 'water', 'kolbach'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { grist, distilledPh, calcium, magnesium, alkalinity, alkalinityUnit } = read.values;
    const basePh = grist === 'custom' ? distilledPh : GRIST_PH[/** @type {keyof typeof GRIST_PH} */ (grist)];
    const ra = residualAlkalinity(alkalinityAsCaco3(alkalinity, alkalinityUnit), calcium, magnesium);
    const ph = estimateMashPh(basePh, ra);
    const warnings = [];
    if (ph < 5.2) warnings.push({ cs: 'pH pod 5,2 – zvažte méně kyselé přídavky nebo alkalitu.', en: 'pH below 5.2 – consider less acid or more alkalinity.' });
    if (ph > 5.6) warnings.push({ cs: 'pH nad 5,6 – zvažte okyselení nebo vodu s nižší alkalitou.', en: 'pH above 5.6 – consider acidifying or water with lower alkalinity.' });
    return { values: { ph, ra }, warnings };
  },
  references: [
    { title: 'Kolbach, P.: Der Einfluss des Brauwassers auf das pH von Würze und Bier. Monatsschrift für Brauerei 6 (1953) – 0.03 pH per °dH RA' },
    { title: 'Troester, K.: The effect of brewing water and grist composition on the pH of the mash, braukaiser.com (2009)' },
  ],
};
