/**
 * Bitterness (IBU) by Tinseth, Rager, Garetz or Daniels for several hop
 * additions.
 */

import { gravityPoints } from '../../core/units.js';
import { emptyResult, readInputs, withDefaultItem } from '../../core/tool.js';

/** Extra utilisation of pellets compared with whole hops. */
export const PELLET_FACTOR = 1.1;

/**
 * Tinseth hop utilisation.
 * @param {number} gravity wort gravity, SG
 * @param {number} minutes boil time
 */
export function tinsethUtilization(gravity, minutes) {
  const bigness = 1.65 * 0.000125 ** (gravity - 1);
  const boilTime = (1 - Math.exp(-0.04 * minutes)) / 4.15;
  return bigness * boilTime;
}

/**
 * Rager hop utilisation, without the gravity adjustment.
 * @param {number} minutes boil time
 */
export function ragerUtilization(minutes) {
  return (18.11 + 13.86 * Math.tanh((minutes - 31.32) / 18.27)) / 100;
}

/**
 * Gravity adjustment of Rager and Daniels: utilisation is divided by
 * 1 + (G − 1.050) / 0.2 above a boil gravity of 1.050.
 * @param {number} boilGravity SG
 */
export function gravityAdjustment(boilGravity) {
  return 1 + Math.max(0, (boilGravity - 1.050) / 0.2);
}

const DANIELS_LIMITS = [10, 20, 30, 45, 60, 75];
const DANIELS = {
  leaf: [0.05, 0.12, 0.15, 0.19, 0.22, 0.24, 0.27],
  pellet: [0.06, 0.15, 0.19, 0.24, 0.27, 0.30, 0.34],
};

/**
 * Daniels hop utilisation table (Designing Great Beers), without the gravity
 * adjustment.
 * @param {number} minutes boil time
 * @param {boolean} [pellets]
 */
export function danielsUtilization(minutes, pellets = false) {
  const index = DANIELS_LIMITS.findIndex((limit) => minutes < limit);
  const table = pellets ? DANIELS.pellet : DANIELS.leaf;
  return table[index === -1 ? table.length - 1 : index];
}

const GARETZ_LIMITS = [10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80];
const GARETZ = [0, 0.02, 0.05, 0.08, 0.11, 0.14, 0.16, 0.18, 0.19, 0.20, 0.21, 0.22, 0.23];

/**
 * Garetz hop utilisation table (Using Hops), before the combined adjustment.
 * @param {number} minutes boil time
 */
export function garetzUtilization(minutes) {
  const index = GARETZ_LIMITS.findIndex((limit) => minutes <= limit);
  return GARETZ[index === -1 ? GARETZ.length - 1 : index];
}

/**
 * Alpha acids dissolved, mg/l.
 * @param {number} grams
 * @param {number} alpha %
 * @param {number} litres
 */
export function alphaMgPerLitre(grams, alpha, litres) {
  return alpha / 100 * grams * 1000 / litres;
}

/**
 * IBU of one hop addition by Tinseth.
 * @param {{ grams: number, alpha: number, minutes: number, litres: number, gravity: number, pellets?: boolean }} addition
 *   alpha in %, litres of wort at the end of the boil
 */
export function tinsethIbu({ grams, alpha, minutes, litres, gravity, pellets = false }) {
  return tinsethUtilization(gravity, minutes) * alphaMgPerLitre(grams, alpha, litres) * (pellets ? PELLET_FACTOR : 1);
}

/**
 * @typedef {object} Hop
 * @property {number} grams
 * @property {number} alpha %
 * @property {number} minutes
 * @property {boolean} pellets
 */

/**
 * @typedef {object} Boil
 * @property {number} litres wort at the end of the boil
 * @property {number} gravity original gravity of that wort, SG
 * @property {number} [boilLitres] volume actually boiled, for partial boils
 * @property {number} [elevation] metres above sea level (Garetz)
 */

/**
 * IBU of each addition by the chosen method.
 * @param {'tinseth' | 'rager' | 'garetz' | 'daniels'} method
 * @param {Hop[]} hops
 * @param {Boil} boil
 * @returns {number[]}
 */
export function ibuByMethod(method, hops, { litres, gravity, boilLitres = litres, elevation = 0 }) {
  const concentration = litres / boilLitres;
  const boilGravity = 1 + concentration * (gravity - 1);
  const alpha = hops.map((hop) => alphaMgPerLitre(hop.grams, hop.alpha, litres) * (hop.pellets && method !== 'daniels' ? PELLET_FACTOR : 1));

  if (method === 'tinseth') return hops.map((hop, i) => tinsethUtilization(boilGravity, hop.minutes) * alpha[i]);
  if (method === 'rager') return hops.map((hop, i) => ragerUtilization(hop.minutes) * alpha[i] / gravityAdjustment(boilGravity));
  if (method === 'daniels') return hops.map((hop, i) => danielsUtilization(hop.minutes, hop.pellets) * alpha[i] / gravityAdjustment(boilGravity));

  // Garetz: the hopping-rate factor depends on the result, so iterate
  const gravityFactor = gravityAdjustment(boilGravity);
  const temperatureFactor = elevation / 0.3048 / 550 * 0.02 + 1;
  const raw = hops.map((hop, i) => garetzUtilization(hop.minutes) * alpha[i]);
  const sum = raw.reduce((total, value) => total + value, 0);
  let ibu = sum / (gravityFactor * temperatureFactor);
  let hoppingFactor = 1;
  for (let i = 0; i < 100; i++) {
    hoppingFactor = concentration * ibu / 260 + 1;
    const next = sum / (gravityFactor * hoppingFactor * temperatureFactor);
    if (Math.abs(next - ibu) < 1e-10) break;
    ibu = next;
  }
  return raw.map((value) => value / (gravityFactor * hoppingFactor * temperatureFactor));
}

/** Select options of the IBU methods. */
export const METHOD_OPTIONS = [
  { value: 'tinseth', label: { cs: 'Tinseth', en: 'Tinseth' } },
  { value: 'rager', label: { cs: 'Rager', en: 'Rager' } },
  { value: 'garetz', label: { cs: 'Garetz', en: 'Garetz' } },
  { value: 'daniels', label: { cs: 'Daniels', en: 'Daniels' } },
];

const inputs = [
  { id: 'method', type: 'select', default: 'tinseth', label: { cs: 'Metoda', en: 'Method' }, options: METHOD_OPTIONS },
  { id: 'volume', type: 'number', default: 20, min: 0.1, max: 100000, step: 0.5, unit: 'l', label: { cs: 'Objem mladiny', en: 'Wort volume' } },
  { id: 'og', type: 'number', default: 1.050, min: 1.000, max: 1.200, step: 0.001, unit: 'SG', label: { cs: 'Hustota mladiny', en: 'Wort gravity' } },
  { id: 'boilVolume', type: 'number', optional: true, min: 0.1, max: 100000, step: 0.5, unit: 'l', label: { cs: 'Objem při chmelovaru (částečný var)', en: 'Boil volume (partial boil)' } },
  { id: 'elevation', type: 'number', default: 0, min: -500, max: 5000, step: 50, unit: 'm', label: { cs: 'Nadmořská výška (Garetz)', en: 'Elevation (Garetz)' } },
  {
    id: 'hops', type: 'list', min: 1, max: 10, label: { cs: 'Chmelová dávka', en: 'Hop addition' },
    fields: [
      { id: 'grams', type: 'number', default: 20, min: 0, max: 100000, step: 1, unit: 'g', label: { cs: 'Hmotnost', en: 'Weight' } },
      { id: 'alpha', type: 'number', default: 4, min: 0, max: 25, step: 0.1, unit: '%', label: { cs: 'Alfa hořké kyseliny', en: 'Alpha acids' } },
      { id: 'minutes', type: 'number', default: 60, min: 0, max: 240, step: 5, unit: 'min', label: { cs: 'Doba varu', en: 'Boil time' } },
      {
        id: 'form', type: 'select', default: 'leaf', label: { cs: 'Forma', en: 'Form' },
        options: [
          { value: 'leaf', label: { cs: 'hlávkový', en: 'whole leaf' } },
          { value: 'pellet', label: { cs: 'granule', en: 'pellets' } },
        ],
      },
    ],
  },
];

const outputs = [
  { id: 'ibu', label: { cs: 'Hořkost celkem', en: 'Total bitterness' }, unit: 'IBU', precision: 0 },
  { id: 'additions', type: 'list', label: { cs: 'Dávka', en: 'Addition' }, unit: 'IBU', precision: 1 },
  { id: 'buGu', label: { cs: 'Poměr BU:GU', en: 'BU:GU ratio' }, unit: '', precision: 2 },
];

export default {
  id: 'ibu',
  kind: 'calculator',
  category: 'hops',
  tags: ['beer'],
  name: { cs: 'Hořkost (IBU)', en: 'Bitterness (IBU)' },
  description: {
    cs: 'Výpočet hořkosti v jednotkách IBU pro jednu i více chmelových dávek podle Tinsetha, Ragera, Garetze nebo Danielse. Granule mají o 10 % vyšší využití než hlávkový chmel (Daniels má pro ně vlastní tabulku). Při částečném varu zadejte objem při chmelovaru; Garetz zohledňuje i nadmořskou výšku. Poměr BU:GU ukazuje vyváženost hořkosti a sladkosti.',
    en: 'Bitterness in IBU for one or more hop additions by Tinseth, Rager, Garetz or Daniels. Pellets get 10 % higher utilisation than whole hops (Daniels has its own table for them). For a partial boil enter the boil volume; Garetz also accounts for elevation. The BU:GU ratio shows the balance of bitterness and sweetness.',
  },
  keywords: {
    cs: ['hořkost', 'ibu', 'chmel', 'chmelení', 'tinseth', 'rager', 'garetz', 'daniels', 'alfa', 'hořké kyseliny', 'granule', 'var', 'bu:gu'],
    en: ['ibu', 'bitterness', 'hops', 'hopping', 'tinseth', 'rager', 'garetz', 'daniels', 'alpha acids', 'pellets', 'bu:gu'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, withDefaultItem(values, 'hops'));
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { method, volume, og, boilVolume, elevation, hops } = read.values;
    const additions = ibuByMethod(
      method,
      hops.map((/** @type {any} */ hop) => ({ ...hop, pellets: hop.form === 'pellet' })),
      { litres: volume, gravity: og, boilLitres: boilVolume ?? volume, elevation },
    );
    const ibu = additions.reduce((sum, value) => sum + value, 0);
    const points = gravityPoints(og);
    return { values: { ibu, additions, buGu: points > 0 ? ibu / points : null }, warnings: [] };
  },
  references: [
    { title: 'Tinseth, G.: Glenn\'s Hop Utilization Numbers', url: 'https://www.realbeer.com/hops/research.html' },
    { title: 'Rager, J.: Calculating Hop Bitterness in Beer. Zymurgy, Special Issue 1990' },
    { title: 'Garetz, M.: Using Hops. HopTech, 1994' },
    { title: 'Daniels, R.: Designing Great Beers. Brewers Publications, 1996' },
    { title: 'Hall, M. L.: What\'s Your IBU? Zymurgy, Special Issue 1997 (comparison of the methods)' },
  ],
};
