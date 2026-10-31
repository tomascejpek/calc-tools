/**
 * Staggered nutrient additions for mead (TOSNA).
 */

import { readGravities, scaleInput } from '../../core/gravity.js';
import { emptyResult, readInputs } from '../../core/tool.js';
import { L_PER_GAL } from '../../core/units.js';

/** Nitrogen requirement factors of yeast strains used by TOSNA. */
export const NITROGEN_FACTORS = { low: 0.75, medium: 0.9, high: 1.25 };
/** Effective YAN of Fermaid O assumed by TOSNA, ppm per g/gal. */
export const FERMAID_O_EFFECTIVE_PPM = 50;
/** Go-Ferm per gram of dry yeast. */
export const GO_FERM_PER_YEAST = 1.25;

/**
 * Total Fermaid O by TOSNA, g: °Bx × 10 × factor / 50 × gallons.
 * @param {number} brix
 * @param {number} factor nitrogen requirement factor
 * @param {number} litres
 */
export function tosnaFermaidO(brix, factor, litres) {
  const yan = brix * 10 * factor;
  return yan / FERMAID_O_EFFECTIVE_PPM * litres / L_PER_GAL;
}

const inputs = [
  { id: 'volume', type: 'number', default: 20, min: 0.1, max: 100000, step: 0.5, unit: 'l', label: { cs: 'Objem moštu', en: 'Must volume' } },
  scaleInput('sg'),
  { id: 'og', type: 'number', default: 1.100, step: 0.001, label: { cs: 'Původní hustota', en: 'Original gravity' } },
  {
    id: 'requirement', type: 'select', default: 'medium', label: { cs: 'Nároky kvasinek na dusík', en: 'Yeast nitrogen requirement' },
    options: [
      { value: 'low', label: { cs: 'nízké (např. DV10, EC-1118)', en: 'low (e.g. DV10, EC-1118)' } },
      { value: 'medium', label: { cs: 'střední (např. 71B, D47)', en: 'medium (e.g. 71B, D47)' } },
      { value: 'high', label: { cs: 'vysoké (např. K1-V1116, RC212)', en: 'high (e.g. K1-V1116, RC212)' } },
    ],
  },
  { id: 'yeast', type: 'number', default: 10, min: 0, max: 10000, step: 1, unit: 'g', label: { cs: 'Sušené kvasinky', en: 'Dry yeast' } },
];

const outputs = [
  { id: 'yan', label: { cs: 'Potřeba dusíku (YAN)', en: 'Nitrogen needed (YAN)' }, unit: 'mg/l', precision: 0 },
  { id: 'total', label: { cs: 'Fermaid O celkem', en: 'Total Fermaid O' }, unit: 'g', precision: 1 },
  { id: 'perAddition', label: { cs: 'Fermaid O na jednu ze 4 dávek', en: 'Fermaid O per each of 4 additions' }, unit: 'g', precision: 1 },
  { id: 'goFerm', label: { cs: 'Go-Ferm do rehydratace', en: 'Go-Ferm for rehydration' }, unit: 'g', precision: 1 },
  { id: 'water', label: { cs: 'Voda na rehydrataci', en: 'Rehydration water' }, unit: 'ml', precision: 0 },
];

export default {
  id: 'tosna',
  kind: 'calculator',
  category: 'mead',
  tags: ['mead'],
  name: { cs: 'Výživa kvasinek pro medovinu (TOSNA)', en: 'Mead nutrients (TOSNA)' },
  description: {
    cs: 'Stupňovité přidávání organické výživy Fermaid O podle protokolu TOSNA: celková dávka = °Bx × 10 × nároky kvasinek / 50 g na galon, rozdělená do čtyř stejných dávek po 24, 48 a 72 hodinách a při odbourání 1/3 cukru (nejpozději 7. den). Go-Ferm se dává 1,25 g na gram kvasinek do 20× více vody.',
    en: 'Staggered additions of the organic nutrient Fermaid O by the TOSNA protocol: total dose = °Bx × 10 × yeast requirement / 50 g per gallon, split into four equal additions at 24, 48 and 72 hours and at the 1/3 sugar break (day 7 at the latest). Go-Ferm is 1.25 g per gram of yeast in 20 times as much water.',
  },
  keywords: {
    cs: ['medovina', 'tosna', 'výživa', 'živiny', 'fermaid', 'go-ferm', 'dusík', 'yan', 'kvasinky', 'stupňovité přidávání'],
    en: ['mead', 'tosna', 'nutrients', 'staggered nutrient additions', 'fermaid o', 'go-ferm', 'yan', 'nitrogen'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const gravity = readGravities(inputs, read.values, ['og']);
    if (gravity.warnings.length) return emptyResult(outputs, gravity.warnings);
    const brix = Math.max(0, gravity.plato.og);
    const factor = NITROGEN_FACTORS[/** @type {keyof typeof NITROGEN_FACTORS} */ (read.values.requirement)];
    const total = tosnaFermaidO(brix, factor, read.values.volume);
    const goFerm = read.values.yeast * GO_FERM_PER_YEAST;
    return {
      values: { yan: brix * 10 * factor, total, perAddition: total / 4, goFerm, water: goFerm * 20 },
      warnings: [],
    };
  },
  references: [
    { title: 'Moutela, S.: TOSNA – Tailored Organic Staggered Nutrient Additions (meadmaderight.com)' },
    { title: 'Lallemand / Scott Laboratories: Fermaid O and Go-Ferm technical data sheets', url: 'https://files.scottlab.com/uploads/Fermaid%20O%20TDS.pdf' },
  ],
};
