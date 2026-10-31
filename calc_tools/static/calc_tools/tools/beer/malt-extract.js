/**
 * Malt extract potential: percent extract ⇄ PPG ⇄ points per kg per litre.
 */

import { KG_PER_LB, L_PER_GAL, factorConversion } from '../../core/units.js';

/** Gravity points of 1 lb of sucrose dissolved to 1 US gallon (100 % extract). */
export const SUCROSE_PPG = 46.214;
/** 1 PPG in gravity points per kg per litre. */
export const PKL_PER_PPG = L_PER_GAL / KG_PER_LB;

const conversion = factorConversion({
  percent: 1,
  ppg: 100 / SUCROSE_PPG,
  pkl: 100 / SUCROSE_PPG / PKL_PER_PPG,
});

/** @param {number} percent extract, % */
export function percentToPpg(percent) {
  return percent / 100 * SUCROSE_PPG;
}

/** @param {number} ppg */
export function ppgToPercent(ppg) {
  return ppg / SUCROSE_PPG * 100;
}

export default {
  id: 'malt-extract',
  kind: 'converter',
  category: 'efficiency',
  tags: ['beer'],
  name: { cs: 'Extrakt sladu (% ⇄ PPG)', en: 'Malt extract (% ⇄ PPG)' },
  description: {
    cs: 'Převod výtěžnosti sladu z listu analýzy (% extraktu, jemný šrot) na PPG z amerických receptů (body hustoty z 1 lb na 1 gal) a na body hustoty z 1 kg na 1 l. Čistá sacharóza má 100 % a 46,214 PPG.',
    en: 'Converts malt yield from a malt analysis (% extract, fine grind) to PPG used in US recipes (gravity points from 1 lb in 1 gal) and to points from 1 kg in 1 l. Pure sucrose is 100 % and 46.214 PPG.',
  },
  keywords: {
    cs: ['extrakt', 'výtěžnost sladu', 'ppg', 'potenciál', 'sladová analýza', 'fgdb', 'body hustoty'],
    en: ['extract', 'ppg', 'potential', 'malt yield', 'fine grind dry basis', 'fgdb', 'points per pound per gallon'],
  },
  units: [
    { id: 'percent', default: 80, label: { cs: '% extraktu', en: '% extract' }, precision: 1, min: 0, max: 100 },
    { id: 'ppg', label: { cs: 'PPG (body·gal/lb)', en: 'PPG (points·gal/lb)' }, precision: 1, min: 0, max: SUCROSE_PPG },
    { id: 'pkl', label: { cs: 'body·l/kg', en: 'points·l/kg' }, precision: 0, min: 0, max: SUCROSE_PPG * PKL_PER_PPG },
  ],
  toBase: conversion.toBase,
  fromBase: conversion.fromBase,
  references: [
    { title: 'Palmer, J.: How to Brew, 4th ed., ch. 18 – Extract potential; sucrose 46.214 PPG' },
    { title: 'Wikipedia: Gravity (alcoholic beverage)', url: 'https://en.wikipedia.org/wiki/Gravity_(alcoholic_beverage)' },
  ],
};
