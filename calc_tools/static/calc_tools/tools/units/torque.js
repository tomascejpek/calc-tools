/**
 * Torque converter.
 */

import { unitTable } from '../../core/converter.js';
import { STANDARD_GRAVITY } from './acceleration.js';
import { LBF } from './force.js';

const table = unitTable([
  ['Ncm', 0.01, 'N·cm'],
  ['Nm', 1, 'N·m'],
  ['kNm', 1e3, 'kN·m'],
  ['kpm', STANDARD_GRAVITY, { cs: 'kp·m', en: 'kgf·m' }],
  ['lbfft', LBF * 0.3048, 'lbf·ft'],
  ['lbfin', LBF * 0.0254, 'lbf·in'],
], { defaultUnit: 'Nm', defaultValue: 100, min: null });

export default {
  id: 'torque',
  kind: 'converter',
  category: 'units-mechanics',
  tags: [],
  name: { cs: 'Převod točivého momentu', en: 'Torque converter' },
  description: {
    cs: 'Převod točivého momentu (kroutícího momentu) mezi newtonmetry, kilopondmetry a librostopami či libropalci, např. pro momentový klíč.',
    en: 'Converts torque between newton-metres, kilogram-force metres and pound-feet or pound-inches, e.g. for a torque wrench.',
  },
  keywords: {
    cs: ['točivý moment', 'kroutící moment', 'moment', 'newtonmetr', 'nm', 'kpm', 'momentový klíč', 'utahovací moment'],
    en: ['torque', 'moment', 'newton metre', 'nm', 'pound-foot', 'lb-ft', 'torque wrench'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'NIST Special Publication 811: Guide for the Use of the SI, appendix B', url: 'https://www.nist.gov/pml/special-publication-811' },
  ],
};
