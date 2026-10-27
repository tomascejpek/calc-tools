/**
 * Bitterness (IBU) by Tinseth for several hop additions.
 */

import { gravityPoints } from '../../core/units.js';
import { emptyResult, readInputs } from '../../core/tool.js';

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
 * IBU of one hop addition by Tinseth.
 * @param {{ grams: number, alpha: number, minutes: number, litres: number, gravity: number, pellets?: boolean }} addition
 *   alpha in %, litres of wort at the end of the boil
 */
export function tinsethIbu({ grams, alpha, minutes, litres, gravity, pellets = false }) {
  const alphaMgPerL = alpha / 100 * grams * 1000 / litres;
  return tinsethUtilization(gravity, minutes) * alphaMgPerL * (pellets ? PELLET_FACTOR : 1);
}

const inputs = [
  { id: 'volume', type: 'number', default: 20, min: 0.1, max: 100000, step: 0.5, unit: 'l', label: { cs: 'Objem mladiny', en: 'Wort volume' } },
  { id: 'og', type: 'number', default: 1.050, min: 1.000, max: 1.200, step: 0.001, unit: 'SG', label: { cs: 'Hustota mladiny', en: 'Wort gravity' } },
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
          { value: 'pellet', label: { cs: 'granule (+10 %)', en: 'pellets (+10 %)' } },
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
  category: 'beer',
  tags: ['beer'],
  name: { cs: 'Hořkost (IBU)', en: 'Bitterness (IBU)' },
  description: {
    cs: 'Výpočet hořkosti v jednotkách IBU podle Tinsetha pro jednu i více chmelových dávek. Granule mají o 10 % vyšší využití než hlávkový chmel. Poměr BU:GU ukazuje vyváženost hořkosti a sladkosti.',
    en: 'Bitterness in IBU by Tinseth for one or more hop additions. Pellets are given 10 % higher utilisation than whole hops. The BU:GU ratio shows the balance of bitterness and sweetness.',
  },
  keywords: {
    cs: ['hořkost', 'ibu', 'chmel', 'chmelení', 'tinseth', 'alfa', 'hořké kyseliny', 'granule', 'var', 'bu:gu'],
    en: ['ibu', 'bitterness', 'hops', 'hopping', 'tinseth', 'alpha acids', 'pellets', 'bu:gu'],
  },
  inputs,
  outputs,
  compute(values) {
    const raw = values ?? {};
    const read = readInputs(inputs, { ...raw, hops: raw.hops ?? [{}] });
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { volume, og, hops } = read.values;
    const additions = hops.map((/** @type {any} */ hop) => tinsethIbu({
      grams: hop.grams, alpha: hop.alpha, minutes: hop.minutes, litres: volume, gravity: og, pellets: hop.form === 'pellet',
    }));
    const ibu = additions.reduce((/** @type {number} */ sum, /** @type {number} */ value) => sum + value, 0);
    const points = gravityPoints(og);
    return { values: { ibu, additions, buGu: points > 0 ? ibu / points : null }, warnings: [] };
  },
  references: [
    { title: 'Tinseth, G.: Glenn\'s Hop Utilization Numbers', url: 'https://www.realbeer.com/hops/research.html' },
  ],
};
