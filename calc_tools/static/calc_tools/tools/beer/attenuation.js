/**
 * Apparent and real attenuation, real extract, alcohol by Balling and
 * calories split into alcohol and carbohydrates.
 */

import { readGravities, scaleInput } from '../../core/gravity.js';
import { emptyResult, readInputs } from '../../core/tool.js';
import { abwToAbv } from '../../core/units.js';
import { realExtract } from './abv.js';

/**
 * Alcohol by weight by Balling: ABW = (OE − RE) / (2.0665 − 0.010665 × OE).
 * @param {number} originalExtract °P
 * @param {number} re real extract, °P
 */
export function ballingAbw(originalExtract, re) {
  return (originalExtract - re) / (2.0665 - 0.010665 * originalExtract);
}

/**
 * Energy per 100 ml from alcohol and from carbohydrates (ASBC, Hall 1995):
 * 6.9 kcal per g of alcohol, 4 kcal per g of real extract less 0.1 % ash.
 * @param {number} abw % w/w
 * @param {number} re °P
 * @param {number} fg SG
 */
export function caloriesPer100ml(abw, re, fg) {
  return { alcohol: 6.9 * abw * fg, carbohydrates: 4.0 * Math.max(0, re - 0.1) * fg };
}

/** kJ per kcal. */
export const KJ_PER_KCAL = 4.184;

const inputs = [
  scaleInput('plato'),
  { id: 'og', type: 'number', default: 12, step: 0.1, label: { cs: 'Původní extrakt (OG)', en: 'Original gravity (OG)' } },
  { id: 'fg', type: 'number', default: 3, step: 0.1, label: { cs: 'Zdánlivý extrakt (FG)', en: 'Final gravity (FG)' } },
  { id: 'serving', type: 'number', default: 500, min: 0, max: 10000, step: 10, unit: 'ml', label: { cs: 'Objem porce', en: 'Serving size' } },
];

const outputs = [
  { id: 'apparentAttenuation', label: { cs: 'Zdánlivé prokvašení', en: 'Apparent attenuation' }, unit: '%', precision: 1 },
  { id: 'realAttenuation', label: { cs: 'Skutečné prokvašení (RDF)', en: 'Real degree of fermentation (RDF)' }, unit: '%', precision: 1 },
  { id: 'realExtract', label: { cs: 'Skutečný extrakt', en: 'Real extract' }, unit: '°P', precision: 2 },
  { id: 'abw', label: { cs: 'Alkohol hmotnostně', en: 'Alcohol by weight' }, unit: { cs: '% hm.', en: '% ABW' }, precision: 2 },
  { id: 'abv', label: { cs: 'Alkohol', en: 'Alcohol by volume' }, unit: { cs: '% obj.', en: '% ABV' }, precision: 2 },
  { id: 'kcal', label: { cs: 'Energie v porci', en: 'Energy per serving' }, unit: 'kcal', precision: 0 },
  { id: 'kj', label: { cs: 'Energie v porci', en: 'Energy per serving' }, unit: 'kJ', precision: 0 },
  { id: 'kcalAlcohol', label: { cs: 'Z toho z alkoholu', en: 'Of which from alcohol' }, unit: 'kcal', precision: 0 },
  { id: 'kcalCarbohydrates', label: { cs: 'Z toho ze sacharidů', en: 'Of which from carbohydrates' }, unit: 'kcal', precision: 0 },
];

export default {
  id: 'attenuation',
  kind: 'calculator',
  category: 'fermentation',
  tags: ['beer'],
  name: { cs: 'Prokvašení a kalorie', en: 'Attenuation and calories' },
  description: {
    cs: 'Z původního a zdánlivého extraktu spočítá zdánlivé a skutečné prokvašení (RDF), skutečný extrakt (Balling), alkohol podle Ballinga a energetickou hodnotu porce rozdělenou na alkohol (6,9 kcal/g) a sacharidy (4 kcal/g).',
    en: 'From the original and apparent extract calculates apparent and real attenuation (RDF), real extract (Balling), alcohol by Balling and the energy of a serving split into alcohol (6.9 kcal/g) and carbohydrates (4 kcal/g).',
  },
  keywords: {
    cs: ['prokvašení', 'zdánlivé prokvašení', 'skutečné prokvašení', 'rdf', 'skutečný extrakt', 'zdánlivý extrakt', 'kalorie', 'energie', 'sacharidy', 'balling'],
    en: ['attenuation', 'apparent attenuation', 'real attenuation', 'rdf', 'real extract', 'calories', 'carbohydrates', 'balling', 'energy'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const gravity = readGravities(inputs, read.values, ['og', 'fg']);
    if (gravity.warnings.length) return emptyResult(outputs, gravity.warnings);
    const oe = gravity.plato.og;
    const ae = gravity.plato.fg;
    if (oe <= 0) {
      return emptyResult(outputs, [{ cs: 'Původní extrakt musí být vyšší než nula.', en: 'The original extract must be above zero.' }]);
    }
    if (ae > oe) {
      return emptyResult(outputs, [{ cs: 'Zdánlivý extrakt nemůže být vyšší než původní.', en: 'The apparent extract cannot be higher than the original.' }]);
    }
    const re = realExtract(oe, ae);
    const abw = ballingAbw(oe, re);
    const fg = gravity.sg.fg;
    const energy = caloriesPer100ml(abw, re, fg);
    const scale = read.values.serving / 100;
    const kcal = (energy.alcohol + energy.carbohydrates) * scale;
    return {
      values: {
        apparentAttenuation: (oe - ae) / oe * 100,
        realAttenuation: (oe - re) / oe * 100,
        realExtract: re,
        abw,
        abv: abwToAbv(abw, fg),
        kcal,
        kj: kcal * KJ_PER_KCAL,
        kcalAlcohol: energy.alcohol * scale,
        kcalCarbohydrates: energy.carbohydrates * scale,
      },
      warnings: [],
    };
  },
  references: [
    { title: 'Balling, C. J. N.: alcohol and real extract formulas, as given in Kunze, W.: Technology Brewing and Malting' },
    { title: 'Hall, M. L.: Brew by the Numbers – Add Up What\'s in Your Beer. Zymurgy, Summer 1995 (calories)' },
  ],
};
