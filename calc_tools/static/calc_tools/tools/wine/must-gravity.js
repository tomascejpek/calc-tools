/**
 * Must weight: SG ⇄ °Oechsle ⇄ °Brix ⇄ °KMW ⇄ °NM.
 */

import { platoToSg, sgToPlato, solveIncreasing } from '../../core/units.js';

/** @param {number} sg */
export function sgToOechsle(sg) {
  return (sg - 1) * 1000;
}

/** @param {number} oechsle */
export function oechsleToSg(oechsle) {
  return 1 + oechsle / 1000;
}

/**
 * °KMW (Babo, sugar % by mass) from °Oechsle: Oe = KMW × (4.54 + 0.022 × KMW).
 * @param {number} oechsle
 */
export function oechsleToKmw(oechsle) {
  return (-4.54 + Math.sqrt(4.54 ** 2 + 4 * 0.022 * oechsle)) / (2 * 0.022);
}

/** @param {number} kmw */
export function kmwToOechsle(kmw) {
  return kmw * (4.54 + 0.022 * kmw);
}

/**
 * Sugar in must, g/l: sugar % by mass (°KMW) × density.
 * @param {number} sg
 */
export function sugarGramsPerLitre(sg) {
  return Math.max(0, oechsleToKmw(sgToOechsle(sg))) * 10 * sg;
}

/**
 * °NM (normalizovaný moštoměr): kg of sugar in 100 l of must.
 * @param {number} sg
 */
export function sgToNm(sg) {
  return sugarGramsPerLitre(sg) / 10;
}

/**
 * @param {number} nm
 * @returns {number | null}
 */
export function nmToSg(nm) {
  return solveIncreasing(sgToNm, nm, 1, 1.2);
}

const TO_SG = {
  sg: (/** @type {number} */ value) => value,
  oechsle: oechsleToSg,
  brix: platoToSg,
  kmw: (/** @type {number} */ value) => oechsleToSg(kmwToOechsle(value)),
  nm: nmToSg,
};

const FROM_SG = {
  sg: (/** @type {number} */ value) => value,
  oechsle: sgToOechsle,
  brix: sgToPlato,
  kmw: (/** @type {number} */ value) => oechsleToKmw(sgToOechsle(value)),
  nm: sgToNm,
};

export default {
  id: 'must-gravity',
  kind: 'converter',
  category: 'wine',
  tags: ['wine'],
  name: { cs: 'Cukernatost moštu (°NM, °Oe, °Bx, °KMW)', en: 'Must weight (°Oe, °Bx, °KMW, °NM)' },
  description: {
    cs: 'Převod cukernatosti moštu mezi stupni Oechsle, Brix, Klosterneuburského moštoměru (°KMW, hmotnostní % cukru) a normalizovaného moštoměru (°NM, kg cukru ve 100 l moštu). °KMW se počítá podle Oe = KMW × (4,54 + 0,022 × KMW), °NM = °KMW × hustota moštu.',
    en: 'Converts must weight between degrees Oechsle, Brix, Klosterneuburger Mostwaage (°KMW, sugar % by mass) and the Czech normalised must meter (°NM, kg of sugar in 100 l of must). °KMW uses Oe = KMW × (4.54 + 0.022 × KMW), °NM = °KMW × must density.',
  },
  keywords: {
    cs: ['mošt', 'cukernatost', 'moštoměr', 'normalizovaný moštoměr', 'nm', 'oechsle', 'brix', 'kmw', 'víno', 'cukr'],
    en: ['must', 'must weight', 'oechsle', 'brix', 'kmw', 'babo', 'normalised must meter', 'wine', 'sugar'],
  },
  units: [
    { id: 'nm', default: 20, label: { cs: '°NM', en: '°NM' }, precision: 1, min: 0, max: 44 },
    { id: 'oechsle', label: { cs: '°Oe', en: '°Oe' }, precision: 0, min: 0, max: 200 },
    { id: 'brix', label: { cs: '°Bx', en: '°Bx' }, precision: 1, min: 0, max: 44 },
    { id: 'kmw', label: { cs: '°KMW', en: '°KMW' }, precision: 1, min: 0, max: 37 },
    { id: 'sg', label: { cs: 'SG', en: 'SG' }, precision: 3, min: 1, max: 1.2 },
  ],
  toBase(value, unitId) {
    if (!Object.hasOwn(TO_SG, unitId)) return null;
    return TO_SG[/** @type {keyof typeof TO_SG} */ (unitId)](value);
  },
  fromBase(value, unitId) {
    if (!Object.hasOwn(FROM_SG, unitId)) return null;
    return FROM_SG[/** @type {keyof typeof FROM_SG} */ (unitId)](value);
  },
  references: [
    { title: 'Wikipedia: Must weight (°Oe, °KMW, °Bx)', url: 'https://en.wikipedia.org/wiki/Must_weight' },
    { title: 'Normalizovaný moštoměr (ČSN): 1 °NM = 1 kg cukru ve 100 l moštu' },
  ],
};
