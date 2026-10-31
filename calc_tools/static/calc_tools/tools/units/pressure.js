/**
 * Pressure converter: bar, kilopascal, psi and standard atmosphere.
 */

import { factorConversion } from '../../core/units.js';

/** Size of one unit in kilopascals. */
export const KILOPASCALS = {
  pa: 0.001,
  hpa: 0.1,
  kpa: 1,
  mpa: 1000,
  mbar: 0.1,
  bar: 100,
  psi: 6.894757293168,
  atm: 101.325,
  at: 98.0665,
  mmhg: 0.133322387415,
  torr: 101.325 / 760,
  inhg: 3.386389,
  mh2o: 9.80665,
};

export default {
  id: 'pressure',
  kind: 'converter',
  category: 'units-mechanics',
  tags: ['beer'],
  name: { cs: 'Převod tlaku', en: 'Pressure converter' },
  description: {
    cs: 'Převod tlaku mezi pascaly, bary, psi, fyzikálními a technickými atmosférami, milimetry rtuťového sloupce (torr), palci rtuti a metry vodního sloupce. Hodí se např. pro tlak v sudu a na redukčním ventilu. Záporná hodnota znamená podtlak, nejvýš do úplného vakua.',
    en: 'Converts pressure between pascals, bar, psi, standard and technical atmospheres, millimetres of mercury (torr), inches of mercury and metres of water. Useful e.g. for keg and regulator pressure. A negative value is a vacuum gauge reading, down to a full vacuum.',
  },
  keywords: {
    cs: ['tlak', 'bar', 'pascal', 'kilopascal', 'hektopascal', 'psi', 'atmosféra', 'mmhg', 'torr', 'vodní sloupec', 'krevní tlak', 'redukční ventil', 'sud'],
    en: ['pressure', 'bar', 'pascal', 'kpa', 'hpa', 'psi', 'atmosphere', 'mmhg', 'torr', 'inhg', 'water column', 'regulator', 'keg'],
  },
  // Negative values are gauge pressure below atmospheric, down to a full vacuum
  units: [
    ['bar', 'bar', 'bar', { default: 1, precision: 2 }],
    ['pa', 'Pa', 'Pa'],
    ['hpa', 'hPa', 'hPa'],
    ['kpa', 'kPa', 'kPa', { precision: 1 }],
    ['mpa', 'MPa', 'MPa'],
    ['mbar', 'mbar', 'mbar'],
    ['psi', 'psi', 'psi', { precision: 1 }],
    ['atm', 'atm (fyzikální atmosféra)', 'atm (standard atmosphere)', { precision: 3 }],
    ['at', 'at (technická atmosféra, kp/cm²)', 'at (technical atmosphere, kgf/cm²)'],
    ['mmhg', 'mmHg', 'mmHg'],
    ['torr', 'Torr', 'Torr'],
    ['inhg', 'inHg', 'inHg'],
    ['mh2o', 'm H₂O (vodní sloupec)', 'm H₂O (water column)'],
  ].map(([id, cs, en, extra]) => ({
    id,
    label: { cs: /** @type {string} */ (cs), en: /** @type {string} */ (en) },
    significant: 6,
    min: -KILOPASCALS.atm / KILOPASCALS[/** @type {keyof typeof KILOPASCALS} */ (id)],
    ...(/** @type {object} */ (extra) ?? {}),
  })),
  ...factorConversion(KILOPASCALS),
  references: [
    { title: 'NIST Special Publication 811: Guide for the Use of the SI', url: 'https://www.nist.gov/pml/special-publication-811' },
  ],
};
