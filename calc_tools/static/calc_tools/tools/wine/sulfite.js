/**
 * Sulfiting wine: free SO₂ for a molecular SO₂ target and the metabisulfite
 * to add.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** pKa₁ of sulfurous acid in wine. */
export const SO2_PKA = 1.81;

/** Share of SO₂ in each additive by mass. */
export const SO2_SOURCES = {
  potassium: 2 * 64.066 / 222.32,
  sodium: 2 * 64.066 / 190.11,
};

/** K₂S₂O₅ in one Campden tablet, g. */
export const CAMPDEN_GRAMS = 0.44;

/**
 * Free SO₂ that holds a given molecular SO₂ at a given pH, mg/l.
 * @param {number} molecular mg/l
 * @param {number} pH
 */
export function freeSo2ForMolecular(molecular, pH) {
  return molecular * (1 + 10 ** (pH - SO2_PKA));
}

const inputs = [
  { id: 'volume', type: 'number', default: 20, min: 0.1, max: 1000000, step: 1, unit: 'l', label: { cs: 'Objem vína', en: 'Wine volume' } },
  { id: 'ph', type: 'number', default: 3.4, min: 2.8, max: 4.2, step: 0.01, label: { cs: 'pH vína', en: 'Wine pH' } },
  { id: 'molecular', type: 'number', default: 0.8, min: 0, max: 2, step: 0.1, unit: 'mg/l', label: { cs: 'Cílový molekulární SO₂', en: 'Target molecular SO₂' } },
  { id: 'current', type: 'number', default: 0, min: 0, max: 200, step: 1, unit: 'mg/l', label: { cs: 'Současný volný SO₂', en: 'Current free SO₂' } },
  {
    id: 'source', type: 'select', default: 'potassium', label: { cs: 'Přípravek', en: 'Additive' },
    options: [
      { value: 'potassium', label: { cs: 'pyrosiřičitan draselný (K₂S₂O₅)', en: 'potassium metabisulfite (K₂S₂O₅)' } },
      { value: 'sodium', label: { cs: 'pyrosiřičitan sodný (Na₂S₂O₅)', en: 'sodium metabisulfite (Na₂S₂O₅)' } },
    ],
  },
];

const outputs = [
  { id: 'freeTarget', label: { cs: 'Potřebný volný SO₂', en: 'Free SO₂ needed' }, unit: 'mg/l', precision: 0 },
  { id: 'addition', label: { cs: 'Přidat SO₂', en: 'SO₂ to add' }, unit: 'mg/l', precision: 0 },
  { id: 'grams', label: { cs: 'Přidat pyrosiřičitanu', en: 'Metabisulfite to add' }, unit: 'g', precision: 2 },
  { id: 'campden', label: { cs: 'Tablet Campden (0,44 g K₂S₂O₅)', en: 'Campden tablets (0.44 g K₂S₂O₅)' }, unit: '', precision: 1 },
];

export default {
  id: 'sulfite',
  kind: 'calculator',
  category: 'wine',
  tags: ['wine', 'cider', 'mead'],
  name: { cs: 'Síření vína (SO₂, pyrosiřičitan)', en: 'Sulfiting wine (SO₂, metabisulfite)' },
  description: {
    cs: 'Kolik pyrosiřičitanu přidat, aby víno mělo dost volného SO₂. Ochranně působí molekulární SO₂, jehož podíl klesá s rostoucím pH: volný SO₂ = molekulární × (1 + 10^(pH − 1,81)). Pro bílá vína se cílí 0,8 mg/l, pro červená 0,5 mg/l. Pyrosiřičitan draselný obsahuje 57,6 % SO₂.',
    en: 'How much metabisulfite to add so the wine holds enough free SO₂. Protection comes from molecular SO₂, whose share falls as the pH rises: free SO₂ = molecular × (1 + 10^(pH − 1.81)). White wines aim at 0.8 mg/l, reds at 0.5 mg/l. Potassium metabisulfite holds 57.6 % SO₂.',
  },
  keywords: {
    cs: ['síření', 'siření', 'so2', 'oxid siřičitý', 'pyrosiřičitan', 'disiřičitan', 'campden', 'víno', 'mošt', 'volný so2', 'molekulární so2'],
    en: ['sulfite', 'sulphite', 'so2', 'sulfur dioxide', 'metabisulfite', 'campden', 'wine', 'free so2', 'molecular so2'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { volume, ph, molecular, current, source } = read.values;
    const freeTarget = freeSo2ForMolecular(molecular, ph);
    const addition = Math.max(0, freeTarget - current);
    const grams = addition * volume / 1000 / SO2_SOURCES[/** @type {keyof typeof SO2_SOURCES} */ (source)];
    const potassium = addition * volume / 1000 / SO2_SOURCES.potassium;
    const warnings = freeTarget > 60
      ? [{ cs: 'Při tak vysokém pH je potřeba hodně SO₂; zvažte okyselení vína.', en: 'At such a high pH a lot of SO₂ is needed; consider acidifying the wine.' }]
      : [];
    return { values: { freeTarget, addition, grams, campden: potassium / CAMPDEN_GRAMS }, warnings };
  },
  references: [
    { title: 'Margalit, Y.: Concepts in Wine Chemistry. Wine Appreciation Guild – molecular SO₂, pKa 1.81' },
    { title: 'Wikipedia: Potassium metabisulfite', url: 'https://en.wikipedia.org/wiki/Potassium_metabisulfite' },
  ],
};
