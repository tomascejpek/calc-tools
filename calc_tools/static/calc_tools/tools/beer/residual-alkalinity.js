/**
 * Residual alkalinity of brewing water (Kolbach).
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { ALKALINITY_UNITS, CACO3_EQ, CACO3_PER_DH, residualAlkalinity } from '../../core/water.js';

/** Inputs for alkalinity in a chosen unit, shared by water tools. */
export const ALKALINITY_INPUTS = [
  { id: 'alkalinity', type: 'number', default: 150, min: 0, max: 2000, step: 1, label: { cs: 'Alkalita', en: 'Alkalinity' } },
  {
    id: 'alkalinityUnit', type: 'select', default: 'hco3', label: { cs: 'Alkalita zadána jako', en: 'Alkalinity given as' },
    options: [
      { value: 'hco3', label: { cs: 'HCO₃⁻ (hydrogenuhličitany), mg/l', en: 'HCO₃⁻ (bicarbonate), mg/l' } },
      { value: 'caco3', label: { cs: 'CaCO₃, mg/l', en: 'CaCO₃, mg/l' } },
      { value: 'mmol', label: { cs: 'KNK 4,5, mmol/l', en: 'alkalinity to pH 4.5, mEq/l' } },
      { value: 'dh', label: { cs: '°dH (uhličitanová tvrdost)', en: '°dH (carbonate hardness)' } },
    ],
  },
];

/**
 * Alkalinity as CaCO₃, mg/l, from the value and unit of the shared inputs.
 * @param {number} value
 * @param {string} unit
 */
export function alkalinityAsCaco3(value, unit) {
  return value * ALKALINITY_UNITS[/** @type {keyof typeof ALKALINITY_UNITS} */ (unit)];
}

const inputs = [
  { id: 'calcium', type: 'number', default: 50, min: 0, max: 1000, step: 1, unit: 'mg/l', label: { cs: 'Vápník (Ca²⁺)', en: 'Calcium (Ca²⁺)' } },
  { id: 'magnesium', type: 'number', default: 10, min: 0, max: 500, step: 1, unit: 'mg/l', label: { cs: 'Hořčík (Mg²⁺)', en: 'Magnesium (Mg²⁺)' } },
  ...ALKALINITY_INPUTS,
];

const outputs = [
  { id: 'ra', label: { cs: 'Zbytková alkalita', en: 'Residual alkalinity' }, unit: { cs: 'mg/l CaCO₃', en: 'mg/l as CaCO₃' }, precision: 0 },
  { id: 'raDh', label: { cs: 'Zbytková alkalita', en: 'Residual alkalinity' }, unit: '°dH', precision: 1 },
  { id: 'raMeq', label: { cs: 'Zbytková alkalita', en: 'Residual alkalinity' }, unit: 'mEq/l', precision: 2 },
  { id: 'alkalinity', label: { cs: 'Alkalita', en: 'Alkalinity' }, unit: { cs: 'mg/l CaCO₃', en: 'mg/l as CaCO₃' }, precision: 0 },
];

export default {
  id: 'residual-alkalinity',
  kind: 'calculator',
  category: 'water-chemistry',
  tags: ['beer'],
  name: { cs: 'Zbytková alkalita vody', en: 'Residual alkalinity' },
  description: {
    cs: 'Zbytková alkalita podle Kolbacha: alkalita minus vliv vápníku a hořčíku (Ca/1,4 + Mg/1,7, vše jako CaCO₃). Kladná zvyšuje pH rmutu a hodí se k tmavým pivům, záporná ho snižuje a hodí se ke světlým. Alkalitu najdete v rozboru vody jako HCO₃⁻ nebo KNK 4,5.',
    en: 'Residual alkalinity after Kolbach: alkalinity minus the effect of calcium and magnesium (Ca/1.4 + Mg/1.7, all as CaCO₃). Positive RA raises the mash pH and suits dark beers, negative RA lowers it and suits pale ones. Alkalinity is on water reports as HCO₃⁻ or alkalinity to pH 4.5.',
  },
  keywords: {
    cs: ['zbytková alkalita', 'alkalita', 'ra', 'kolbach', 'voda', 'tvrdost', 'hydrogenuhličitany', 'knk', 'vápník', 'hořčík'],
    en: ['residual alkalinity', 'alkalinity', 'ra', 'kolbach', 'water', 'hardness', 'bicarbonate', 'calcium', 'magnesium'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { calcium, magnesium, alkalinity, alkalinityUnit } = read.values;
    const alk = alkalinityAsCaco3(alkalinity, alkalinityUnit);
    const ra = residualAlkalinity(alk, calcium, magnesium);
    return { values: { ra, raDh: ra / CACO3_PER_DH, raMeq: ra / CACO3_EQ, alkalinity: alk }, warnings: [] };
  },
  references: [
    { title: 'Kolbach, P.: Der Einfluss des Brauwassers auf das pH von Würze und Bier. Monatsschrift für Brauerei 6 (1953)' },
    { title: 'Palmer, J., Kaminski, C.: Water – A Comprehensive Guide for Brewers. Brewers Publications, 2013' },
  ],
};
