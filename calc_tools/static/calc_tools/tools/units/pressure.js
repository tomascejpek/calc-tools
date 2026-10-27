/**
 * Pressure converter: bar, kilopascal, psi and standard atmosphere.
 */

import { factorConversion } from '../../core/units.js';

/** Size of one unit in kilopascals. */
export const KILOPASCALS = {
  bar: 100,
  kpa: 1,
  psi: 6.894757293168,
  atm: 101.325,
};

export default {
  id: 'pressure',
  kind: 'converter',
  category: 'units',
  tags: [],
  name: { cs: 'Převod tlaku', en: 'Pressure converter' },
  description: {
    cs: 'Převod tlaku mezi bary, kilopascaly, psi a fyzikálními atmosférami. Hodí se např. pro tlak v sudu a na redukčním ventilu.',
    en: 'Converts pressure between bar, kilopascals, psi and standard atmospheres, e.g. for keg and regulator pressure.',
  },
  keywords: {
    cs: ['tlak', 'bar', 'kilopascal', 'psi', 'atmosféra', 'redukční ventil', 'sud'],
    en: ['pressure', 'bar', 'kpa', 'psi', 'atmosphere', 'regulator', 'keg'],
  },
  units: [
    { id: 'bar', default: 1, label: { cs: 'bar', en: 'bar' }, precision: 2 },
    { id: 'kpa', label: { cs: 'kPa', en: 'kPa' }, precision: 1 },
    { id: 'psi', label: { cs: 'psi', en: 'psi' }, precision: 1 },
    { id: 'atm', label: { cs: 'atm', en: 'atm' }, precision: 3 },
  ],
  ...factorConversion(KILOPASCALS),
  references: [
    { title: 'NIST Special Publication 811: Guide for the Use of the SI', url: 'https://www.nist.gov/pml/special-publication-811' },
  ],
};
