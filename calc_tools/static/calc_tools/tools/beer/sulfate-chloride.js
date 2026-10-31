/**
 * Sulfate to chloride ratio of brewing water.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'sulfate', type: 'number', default: 100, min: 0, max: 2000, step: 1, unit: 'mg/l', label: { cs: 'Sírany (SO₄²⁻)', en: 'Sulfate (SO₄²⁻)' } },
  { id: 'chloride', type: 'number', default: 50, min: 0, max: 2000, step: 1, unit: 'mg/l', label: { cs: 'Chloridy (Cl⁻)', en: 'Chloride (Cl⁻)' } },
];

const outputs = [
  { id: 'ratio', label: { cs: 'Poměr SO₄ : Cl', en: 'SO₄ : Cl ratio' }, unit: '', precision: 2 },
];

export default {
  id: 'sulfate-chloride',
  kind: 'calculator',
  category: 'water-chemistry',
  tags: ['beer'],
  name: { cs: 'Poměr síranů a chloridů', en: 'Sulfate to chloride ratio' },
  description: {
    cs: 'Poměr síranů a chloridů ve vodě. Nad 2 zdůrazní hořkost a suchost (IPA, pale ale), kolem 1 je vyvážený, pod 0,5 podpoří plnost a sladovost (NEIPA, stout, bock). Při velmi nízkých koncentracích obou iontů na poměru téměř nezáleží.',
    en: 'Ratio of sulfate to chloride in the water. Above 2 it accents bitterness and dryness (IPA, pale ale), around 1 it is balanced, below 0.5 it supports fullness and maltiness (NEIPA, stout, bock). At very low levels of both ions the ratio hardly matters.',
  },
  keywords: {
    cs: ['sírany', 'chloridy', 'poměr', 'so4', 'cl', 'voda', 'minerály', 'hořkost', 'plnost'],
    en: ['sulfate', 'chloride', 'ratio', 'so4', 'cl', 'water', 'minerals', 'balance'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { sulfate, chloride } = read.values;
    if (chloride === 0) {
      return emptyResult(outputs, [{ cs: 'Bez chloridů nelze poměr spočítat.', en: 'The ratio cannot be calculated without chloride.' }]);
    }
    return { values: { ratio: sulfate / chloride }, warnings: [] };
  },
  references: [
    { title: 'Palmer, J., Kaminski, C.: Water – A Comprehensive Guide for Brewers. Brewers Publications, 2013' },
  ],
};
