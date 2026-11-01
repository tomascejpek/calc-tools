/**
 * Estimated blood alcohol concentration by Widmark and the time to sober up.
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { ethanolGrams } from '../beer/alcohol-units.js';

/**
 * Widmark factor (distribution volume per body weight) by Seidl et al. 2000.
 * @param {'male' | 'female'} sex
 * @param {number} weight kg
 * @param {number} height cm
 */
export function widmarkFactor(sex, weight, height) {
  return sex === 'male'
    ? 0.31608 - 0.004821 * weight + 0.004632 * height
    : 0.31223 - 0.006446 * weight + 0.004466 * height;
}

/** Density of blood, kg/l: converts g/kg (‰ by mass) to g/l. */
const BLOOD_DENSITY = 1.055;

const inputs = [
  {
    id: 'drinks', type: 'list', min: 1, max: 30, label: { cs: 'Nápoj', en: 'Drink' },
    fields: [
      { id: 'volume', type: 'number', default: 500, min: 0, max: 10000, step: 10, unit: 'ml', label: { cs: 'Objem', en: 'Volume' } },
      { id: 'abv', type: 'number', default: 5, min: 0, max: 100, step: 0.1, unit: { cs: '% obj.', en: '% ABV' }, label: { cs: 'Obsah alkoholu', en: 'Alcohol by volume' } },
    ],
  },
  {
    id: 'sex', type: 'select', default: 'male', label: { cs: 'Pohlaví', en: 'Sex' },
    options: [
      { value: 'male', label: { cs: 'muž', en: 'male' } },
      { value: 'female', label: { cs: 'žena', en: 'female' } },
    ],
  },
  { id: 'weight', type: 'number', default: 80, min: 30, max: 300, step: 1, unit: 'kg', label: { cs: 'Hmotnost', en: 'Weight' } },
  { id: 'height', type: 'number', default: 180, min: 120, max: 230, step: 1, unit: 'cm', label: { cs: 'Výška', en: 'Height' } },
  { id: 'hours', type: 'number', default: 1, min: 0, max: 72, step: 0.5, unit: 'h', label: { cs: 'Doba od začátku pití', en: 'Hours since drinking began' } },
  { id: 'elimination', type: 'number', default: 0.15, min: 0.05, max: 0.35, step: 0.01, unit: '‰/h', label: { cs: 'Rychlost odbourávání (obvykle 0,10–0,20)', en: 'Elimination rate (usually 0.10–0.20)' } },
  { id: 'deficit', type: 'number', default: 10, min: 0, max: 40, step: 5, unit: '%', label: { cs: 'Resorpční deficit (nevstřebaná část)', en: 'Absorption deficit (part not absorbed)' } },
];

const outputs = [
  { id: 'peak', label: { cs: 'Nejvyšší možná hladina (vše vstřebáno najednou)', en: 'Highest possible level (all absorbed at once)' }, unit: '‰', precision: 2 },
  { id: 'now', label: { cs: 'Odhad hladiny teď', en: 'Estimated level now' }, unit: '‰', precision: 2 },
  { id: 'bloodGrams', label: { cs: 'Odhad hladiny teď', en: 'Estimated level now' }, unit: 'g/l', precision: 2 },
  { id: 'soberIn', label: { cs: 'Odbourání na nulu za', en: 'Back to zero in' }, unit: 'h', precision: 1 },
  { id: 'grams', label: { cs: 'Vypitý alkohol', en: 'Alcohol drunk' }, unit: 'g', precision: 1 },
];

const DRIVING_WARNING = {
  cs: 'Jen orientační odhad – skutečná hladina se liší i o desítky procent podle jídla, zdraví a léků. V Česku platí pro řidiče nulová tolerance: po alkoholu neřiďte, dokud si nejste jisti, že je hladina nulová, a raději počkejte déle.',
  en: 'A rough estimate only – the real level can differ by tens of percent with food, health and medication. Many countries, including Czechia, have zero tolerance for drivers: do not drive after drinking until you are sure the level is zero, and better wait longer.',
};

export default {
  id: 'blood-alcohol',
  kind: 'calculator',
  category: 'alcohol-health',
  tags: ['health', 'beer'],
  name: { cs: 'Alkohol v krvi (Widmark) a doba odbourání', en: 'Blood alcohol (Widmark) and time to sober up' },
  description: {
    cs: 'Odhad hladiny alkoholu v krvi podle Widmarkova vzorce: c = A / (m · r) − β · t, kde r (podíl tělesné vody) se počítá z pohlaví, hmotnosti a výšky podle Seidla. Odbourávání je asi 0,1–0,2 ‰ za hodinu a nedá se urychlit (káva ani spánek nepomohou). Výsledek je jen orientační a nesmí sloužit k rozhodnutí, zda řídit.',
    en: 'Estimates blood alcohol by the Widmark formula: c = A / (m · r) − β · t, with r (share of body water) from sex, weight and height after Seidl. Elimination is about 0.1–0.2 ‰ per hour and cannot be sped up (neither coffee nor sleep helps). The result is only indicative and must not be used to decide whether to drive.',
  },
  keywords: {
    cs: ['alkohol v krvi', 'promile', 'widmark', 'odbourání alkoholu', 'kdy můžu řídit', 'hladina alkoholu', 'opilost'],
    en: ['blood alcohol', 'bac', 'per mille', 'widmark', 'alcohol elimination', 'sober up', 'drink driving'],
  },
  inputs,
  outputs,
  compute(values) {
    const source = values && typeof values === 'object' ? /** @type {Record<string, any>} */ (values) : {};
    const read = readInputs(inputs, { ...source, drinks: Object.hasOwn(source, 'drinks') && source.drinks != null ? source.drinks : [{}] });
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { drinks, sex, weight, height, hours, elimination, deficit } = read.values;
    const grams = drinks.reduce((/** @type {number} */ sum, /** @type {any} */ drink) => sum + ethanolGrams(drink.volume, drink.abv), 0);
    const r = widmarkFactor(sex, weight, height);
    const peak = grams * (1 - deficit / 100) / (weight * r);
    const now = Math.max(0, peak - elimination * hours);
    return {
      values: { peak, now, bloodGrams: now * BLOOD_DENSITY, soberIn: now / elimination, grams },
      warnings: [DRIVING_WARNING],
    };
  },
  references: [
    { title: 'Widmark, E. M. P.: Die theoretischen Grundlagen und die praktische Verwendbarkeit der gerichtlich-medizinischen Alkoholbestimmung (1932)' },
    { title: 'Seidl, S., Jensen, U., Alt, A.: The calculation of blood ethanol concentrations in males and females. Int. J. Legal Med. 114 (2000)' },
  ],
};
