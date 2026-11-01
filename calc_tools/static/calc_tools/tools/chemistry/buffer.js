/**
 * Buffers by the Henderson–Hasselbalch equation.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** pKa of common buffer systems at 25 °C. */
export const BUFFER_PKA = {
  acetate: 4.76,
  phosphate: 7.20,
  citrate: 4.76,
  carbonate: 6.35,
  lactate: 3.86,
  tris: 8.07,
  ammonia: 9.25,
};

const inputs = [
  {
    id: 'system', type: 'select', default: 'acetate', label: { cs: 'Pufr', en: 'Buffer' },
    options: [
      { value: 'acetate', label: { cs: 'octanový (pKa 4,76)', en: 'acetate (pKa 4.76)' } },
      { value: 'citrate', label: { cs: 'citrátový, 2. stupeň (pKa 4,76)', en: 'citrate, 2nd step (pKa 4.76)' } },
      { value: 'lactate', label: { cs: 'mléčnanový (pKa 3,86)', en: 'lactate (pKa 3.86)' } },
      { value: 'carbonate', label: { cs: 'hydrogenuhličitanový (pKa 6,35)', en: 'bicarbonate (pKa 6.35)' } },
      { value: 'phosphate', label: { cs: 'fosfátový H₂PO₄⁻/HPO₄²⁻ (pKa 7,20)', en: 'phosphate H₂PO₄⁻/HPO₄²⁻ (pKa 7.20)' } },
      { value: 'tris', label: { cs: 'Tris (pKa 8,07)', en: 'Tris (pKa 8.07)' } },
      { value: 'ammonia', label: { cs: 'amonný (pKa 9,25)', en: 'ammonium (pKa 9.25)' } },
      { value: 'custom', label: { cs: 'zadám pKa', en: 'custom pKa' } },
    ],
  },
  { id: 'pka', type: 'number', default: 4.76, min: -2, max: 16, step: 0.01, label: { cs: 'Vlastní pKa', en: 'Custom pKa' } },
  { id: 'acid', type: 'number', default: 0.1, min: 1e-12, max: 100, step: 0.01, unit: 'mol/l', label: { cs: 'Koncentrace kyseliny [HA]', en: 'Acid concentration [HA]' } },
  { id: 'base', type: 'number', default: 0.15, min: 1e-12, max: 100, step: 0.01, unit: 'mol/l', label: { cs: 'Koncentrace konjugované zásady [A⁻]', en: 'Conjugate base concentration [A⁻]' } },
  { id: 'target', type: 'number', optional: true, default: 5.0, min: -2, max: 16, step: 0.1, label: { cs: 'Cílové pH (pro poměr)', en: 'Target pH (for the ratio)' } },
];

const outputs = [
  { id: 'ph', label: { cs: 'pH pufru', en: 'Buffer pH' }, precision: 2 },
  { id: 'ratio', label: { cs: 'Poměr [A⁻] / [HA] pro cílové pH', en: 'Ratio [A⁻] / [HA] for the target pH' }, significant: 4 },
  { id: 'baseShare', label: { cs: 'Podíl zásady pro cílové pH', en: 'Base share for the target pH' }, unit: '%', significant: 4 },
];

export default {
  id: 'buffer',
  kind: 'calculator',
  category: 'chemistry-ph',
  tags: ['chemistry'],
  name: { cs: 'Pufry (Henderson–Hasselbalch)', en: 'Buffers (Henderson–Hasselbalch)' },
  description: {
    cs: 'pH pufru ze slabé kyseliny a její soli: pH = pKa + log([A⁻] / [HA]), a obráceně poměr složek pro požadované pH. Pufr dobře funguje v rozmezí pKa ± 1. Rovnice je přibližná – neplatí pro velmi zředěné pufry a nezahrnuje iontovou sílu.',
    en: 'pH of a buffer made of a weak acid and its salt: pH = pKa + log([A⁻] / [HA]), and the other way round the ratio for a desired pH. A buffer works well within pKa ± 1. The equation is approximate – it fails for very dilute buffers and ignores ionic strength.',
  },
  keywords: {
    cs: ['pufr', 'henderson hasselbalch', 'tlumivý roztok', 'pka', 'ph', 'octanový pufr', 'fosfátový pufr'],
    en: ['buffer', 'henderson hasselbalch', 'buffer solution', 'pka', 'ph', 'acetate buffer', 'phosphate buffer'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { system, acid, base, target } = read.values;
    const pka = system === 'custom' ? read.values.pka : BUFFER_PKA[/** @type {keyof typeof BUFFER_PKA} */ (system)];
    const ph = pka + Math.log10(base / acid);
    const ratio = target === null ? null : 10 ** (target - pka);
    const warnings = Math.abs(ph - pka) > 1 || (target !== null && Math.abs(target - pka) > 1)
      ? [{ cs: 'Mimo pKa ± 1 pufr málo tlumí; zvolte systém s bližším pKa.', en: 'Outside pKa ± 1 the buffer has little capacity; choose a system with a closer pKa.' }]
      : [];
    return { values: { ph, ratio, baseShare: ratio === null ? null : ratio / (1 + ratio) * 100 }, warnings };
  },
  references: [{ title: 'Harris, D. C.: Quantitative Chemical Analysis – buffers; pKa values from CRC Handbook of Chemistry and Physics' }],
};
