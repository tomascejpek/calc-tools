/**
 * Radioactivity converter: becquerels and curies.
 */

import { unitTable } from '../../core/converter.js';

/** One curie, Bq (exact by definition). */
export const CURIE = 3.7e10;

const table = unitTable([
  ['Bq', 1, 'Bq'],
  ['kBq', 1e3, 'kBq'],
  ['MBq', 1e6, 'MBq'],
  ['GBq', 1e9, 'GBq'],
  ['TBq', 1e12, 'TBq'],
  ['pCi', CURIE * 1e-12, 'pCi'],
  ['nCi', CURIE * 1e-9, 'nCi'],
  ['uCi', CURIE * 1e-6, 'µCi'],
  ['mCi', CURIE * 1e-3, 'mCi'],
  ['Ci', CURIE, 'Ci'],
  ['dpm', 1 / 60, { cs: 'rozpadů za minutu (dpm)', en: 'disintegrations per minute (dpm)' }],
], { defaultUnit: 'Bq', defaultValue: 1000 });

export default {
  id: 'radioactivity',
  kind: 'converter',
  category: 'units-other',
  tags: [],
  name: { cs: 'Převod aktivity (radioaktivita)', en: 'Radioactivity converter' },
  description: {
    cs: 'Převod aktivity radioaktivního zdroje mezi becquerely (rozpadů za sekundu), curie (3,7 · 10¹⁰ Bq) a rozpady za minutu.',
    en: 'Converts the activity of a radioactive source between becquerels (decays per second), curies (3.7 · 10¹⁰ Bq) and disintegrations per minute.',
  },
  keywords: {
    cs: ['radioaktivita', 'aktivita', 'becquerel', 'bq', 'curie', 'ci', 'radon', 'záření'],
    en: ['radioactivity', 'activity', 'becquerel', 'bq', 'curie', 'ci', 'radon', 'radiation'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'NIST Special Publication 811: Guide for the Use of the SI – curie', url: 'https://www.nist.gov/pml/special-publication-811' },
  ],
};
