/**
 * Bitterness from a hop stand or whirlpool below boiling.
 */

import { emptyResult, readInputs, withDefaultItem } from '../../core/tool.js';
import { PELLET_FACTOR, alphaMgPerLitre, tinsethUtilization } from './ibu.js';

/** Activation temperature of alpha-acid isomerisation, K (Malowicki 2005). */
export const ISOMERISATION_K = 11858;

/**
 * Isomerisation rate at a temperature relative to boiling (100 °C), by the
 * Arrhenius equation k = 7.9·10¹¹ · e^(−11858 / T).
 * @param {number} celsius
 */
export function relativeIsomerisation(celsius) {
  return Math.exp(ISOMERISATION_K * (1 / 373.15 - 1 / (celsius + 273.15)));
}

/**
 * IBU of hops held in hot wort: Tinseth's utilisation for the stand time,
 * scaled by the relative isomerisation rate at the stand temperature.
 * @param {{ grams: number, alpha: number, minutes: number, celsius: number, litres: number, gravity: number, pellets?: boolean }} stand
 */
export function hopStandIbu({ grams, alpha, minutes, celsius, litres, gravity, pellets = false }) {
  return tinsethUtilization(gravity, minutes) * relativeIsomerisation(celsius)
    * alphaMgPerLitre(grams, alpha, litres) * (pellets ? PELLET_FACTOR : 1);
}

const inputs = [
  { id: 'volume', type: 'number', default: 20, min: 0.1, max: 100000, step: 0.5, unit: 'l', label: { cs: 'Objem mladiny', en: 'Wort volume' } },
  { id: 'og', type: 'number', default: 1.050, min: 1.000, max: 1.200, step: 0.001, unit: 'SG', label: { cs: 'Hustota mladiny', en: 'Wort gravity' } },
  { id: 'temperature', type: 'number', default: 80, min: 40, max: 100, step: 1, unit: '°C', label: { cs: 'Teplota hop standu', en: 'Hop stand temperature' } },
  { id: 'minutes', type: 'number', default: 20, min: 0, max: 240, step: 5, unit: 'min', label: { cs: 'Doba hop standu', en: 'Hop stand time' } },
  {
    id: 'hops', type: 'list', min: 1, max: 10, label: { cs: 'Chmelová dávka', en: 'Hop addition' },
    fields: [
      { id: 'grams', type: 'number', default: 50, min: 0, max: 100000, step: 1, unit: 'g', label: { cs: 'Hmotnost', en: 'Weight' } },
      { id: 'alpha', type: 'number', default: 10, min: 0, max: 25, step: 0.1, unit: '%', label: { cs: 'Alfa hořké kyseliny', en: 'Alpha acids' } },
      {
        id: 'form', type: 'select', default: 'pellet', label: { cs: 'Forma', en: 'Form' },
        options: [
          { value: 'leaf', label: { cs: 'hlávkový', en: 'whole leaf' } },
          { value: 'pellet', label: { cs: 'granule', en: 'pellets' } },
        ],
      },
    ],
  },
];

const outputs = [
  { id: 'ibu', label: { cs: 'Hořkost z hop standu', en: 'Bitterness from the hop stand' }, unit: 'IBU', precision: 1 },
  { id: 'additions', type: 'list', label: { cs: 'Dávka', en: 'Addition' }, unit: 'IBU', precision: 1 },
  { id: 'relativeRate', label: { cs: 'Rychlost izomerace oproti varu', en: 'Isomerisation rate relative to boiling' }, unit: '%', precision: 0 },
];

export default {
  id: 'hop-stand',
  kind: 'calculator',
  category: 'hops',
  tags: ['beer'],
  name: { cs: 'Hop stand a whirlpool (IBU)', en: 'Hop stand and whirlpool (IBU)' },
  description: {
    cs: 'Hořkost z chmele přidaného po skončení varu a ponechaného v horké mladině. Využití podle Tinsetha pro dobu hop standu se násobí poměrem rychlosti izomerace alfa kyselin při dané teplotě a při varu (Arrheniova rovnice podle Malowického). Počítá s konstantní teplotou; mladina, která během standu chladne, dá méně.',
    en: 'Bitterness from hops added after the boil and left in hot wort. Tinseth\'s utilisation for the stand time is multiplied by the ratio of the alpha-acid isomerisation rate at the stand temperature to that at boiling (Arrhenius equation after Malowicki). Assumes a constant temperature; wort that cools during the stand gives less.',
  },
  keywords: {
    cs: ['hop stand', 'whirlpool', 'vířivá káď', 'chmelení', 'aroma', 'po varu', 'hořkost', 'ibu', 'izomerace'],
    en: ['hop stand', 'whirlpool', 'flameout', 'steep', 'aroma hops', 'ibu', 'isomerization'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, withDefaultItem(values, 'hops'));
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { volume, og, temperature, minutes, hops } = read.values;
    const additions = hops.map((/** @type {any} */ hop) => hopStandIbu({
      grams: hop.grams, alpha: hop.alpha, minutes, celsius: temperature, litres: volume, gravity: og, pellets: hop.form === 'pellet',
    }));
    const ibu = additions.reduce((/** @type {number} */ sum, /** @type {number} */ value) => sum + value, 0);
    return { values: { ibu, additions, relativeRate: relativeIsomerisation(temperature) * 100 }, warnings: [] };
  },
  references: [
    { title: 'Malowicki, M. G., Shellhammer, T. H.: Isomerization and degradation kinetics of hop (Humulus lupulus) acids in a model wort-boiling system. J. Agric. Food Chem. 53 (2005)' },
    { title: 'Tinseth, G.: Glenn\'s Hop Utilization Numbers', url: 'https://www.realbeer.com/hops/research.html' },
  ],
};
