/**
 * Alcohol, attenuation, real extract and calories from original and final gravity.
 */

import { abvToAbw, isNumber, platoToSg, sgToPlato } from '../../core/units.js';
import { emptyResult, rangeWarning, readInputs } from '../../core/tool.js';

/**
 * Standard homebrew formula: ABV = 131.25 × (OG − FG).
 * @param {number} og SG
 * @param {number} fg SG
 */
export function abvStandard(og, fg) {
  return 131.25 * (og - fg);
}

/**
 * Alternative formula, more accurate for strong beers (Hall 1995, after Daniels).
 * @param {number} og SG
 * @param {number} fg SG
 */
export function abvAlternative(og, fg) {
  return (76.08 * (og - fg) / (1.775 - og)) * (fg / 0.794);
}

/**
 * Real extract by Balling: RE = 0.1808 × OE + 0.8192 × AE.
 * @param {number} originalExtract °P
 * @param {number} apparentExtract °P
 */
export function realExtract(originalExtract, apparentExtract) {
  return 0.1808 * originalExtract + 0.8192 * apparentExtract;
}

/**
 * Energy of beer in kcal per 100 ml (ASBC formula as given by Hall 1995).
 * @param {number} abw % w/w
 * @param {number} re real extract, °P
 * @param {number} fg SG
 */
export function kcalPer100ml(abw, re, fg) {
  return (6.9 * abw + 4.0 * (re - 0.1)) * fg;
}

const SCALES = {
  sg: { min: 0.990, max: 1.200, unit: 'SG' },
  plato: { min: -2.6, max: 44, unit: '°P' },
};

const inputs = [
  {
    id: 'scale', type: 'select', default: 'sg', label: { cs: 'Jednotka hustoty', en: 'Gravity unit' },
    options: [
      { value: 'sg', label: { cs: 'SG', en: 'SG' } },
      { value: 'plato', label: { cs: '°P', en: '°P' } },
    ],
  },
  { id: 'og', type: 'number', default: 1.050, step: 0.001, label: { cs: 'Původní hustota (OG)', en: 'Original gravity (OG)' } },
  { id: 'fg', type: 'number', default: 1.010, step: 0.001, label: { cs: 'Konečná hustota (FG)', en: 'Final gravity (FG)' } },
  {
    id: 'method', type: 'select', default: 'standard', label: { cs: 'Vzorec', en: 'Formula' },
    options: [
      { value: 'standard', label: { cs: 'standardní – 131,25 × (OG − FG)', en: 'standard – 131.25 × (OG − FG)' } },
      { value: 'alternative', label: { cs: 'alternativní – pro silná piva', en: 'alternative – for strong beers' } },
    ],
  },
];

const outputs = [
  { id: 'abv', label: { cs: 'Alkohol', en: 'Alcohol by volume' }, unit: { cs: '% obj.', en: '% ABV' }, precision: 1 },
  { id: 'abw', label: { cs: 'Alkohol hmotnostně', en: 'Alcohol by weight' }, unit: { cs: '% hm.', en: '% ABW' }, precision: 1 },
  { id: 'apparentAttenuation', label: { cs: 'Zdánlivé prokvašení', en: 'Apparent attenuation' }, unit: '%', precision: 0 },
  { id: 'realAttenuation', label: { cs: 'Skutečné prokvašení', en: 'Real attenuation' }, unit: '%', precision: 0 },
  { id: 'realExtract', label: { cs: 'Skutečný extrakt', en: 'Real extract' }, unit: '°P', precision: 1 },
  { id: 'kcal', label: { cs: 'Energie v 0,5 l', en: 'Energy per 0.5 l' }, unit: 'kcal', precision: 0 },
];

export default {
  id: 'abv',
  kind: 'calculator',
  category: 'fermentation',
  tags: ['beer'],
  name: { cs: 'Obsah alkoholu', en: 'Alcohol content (ABV)' },
  description: {
    cs: 'Obsah alkoholu z původní a konečné hustoty (v SG nebo °P), zdánlivé a skutečné prokvašení, skutečný extrakt podle Ballinga a energetická hodnota. Standardní vzorec stačí pro běžná piva, alternativní je přesnější u silných piv.',
    en: 'Alcohol content from original and final gravity (in SG or °P), apparent and real attenuation, real extract by Balling and energy content. The standard formula suits ordinary beers, the alternative one is more accurate for strong beers.',
  },
  keywords: {
    cs: ['alkohol', 'procenta', 'abv', 'prokvašení', 'skutečný extrakt', 'zdánlivý extrakt', 'kalorie', 'energie', 'og', 'fg', 'stupňovitost', 'hustota'],
    en: ['abv', 'alcohol', 'attenuation', 'real extract', 'apparent extract', 'calories', 'original gravity', 'final gravity'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { scale, og, fg, method } = read.values;
    const range = SCALES[/** @type {'sg' | 'plato'} */ (scale)];
    const warnings = [];
    for (const input of [inputs[1], inputs[2]]) {
      const value = read.values[input.id];
      if (value < range.min || value > range.max) warnings.push(rangeWarning(input.label, range.min, range.max, range.unit));
    }
    if (warnings.length) return emptyResult(outputs, warnings);

    const ogSg = scale === 'plato' ? platoToSg(og) : og;
    const fgSg = scale === 'plato' ? platoToSg(fg) : fg;
    if (ogSg <= 1) {
      return emptyResult(outputs, [{ cs: 'Původní hustota musí být vyšší než hustota vody.', en: 'The original gravity must be above that of water.' }]);
    }
    if (fgSg > ogSg) {
      return emptyResult(outputs, [{ cs: 'Konečná hustota nemůže být vyšší než původní.', en: 'The final gravity cannot be higher than the original gravity.' }]);
    }

    const abv = method === 'alternative' ? abvAlternative(ogSg, fgSg) : abvStandard(ogSg, fgSg);
    const abw = abvToAbw(abv, fgSg);
    const oe = sgToPlato(ogSg);
    const ae = sgToPlato(fgSg);
    const re = realExtract(oe, ae);
    const kcal = kcalPer100ml(abw, re, fgSg) * 5;
    if (method === 'standard' && ogSg > 1.070) {
      warnings.push({
        cs: 'U piv s OG nad 1,070 dává standardní vzorec nižší hodnoty; zvažte alternativní vzorec.',
        en: 'For OG above 1.070 the standard formula underestimates; consider the alternative formula.',
      });
    }
    return {
      values: {
        abv,
        abw,
        apparentAttenuation: (oe - ae) / oe * 100,
        realAttenuation: (oe - re) / oe * 100,
        realExtract: re,
        kcal: isNumber(kcal) && kcal > 0 ? kcal : 0,
      },
      warnings,
    };
  },
  references: [
    { title: 'Hall, M. L.: Brew by the Numbers – Add Up What\'s in Your Beer. Zymurgy, Summer 1995 (ABV, ABW, real extract, calories)' },
    { title: 'Daniels, R.: Designing Great Beers. Brewers Publications, 1996' },
    { title: 'Wikipedia: Beer measurement', url: 'https://en.wikipedia.org/wiki/Beer_measurement' },
  ],
};
