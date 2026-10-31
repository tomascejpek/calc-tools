/**
 * Mass converter: grams, kilograms, ounces and pounds.
 */

import { factorConversion } from '../../core/units.js';

/** Size of one unit in grams. */
export const GRAMS = {
  ug: 1e-6,
  mg: 0.001,
  ct: 0.2,
  g: 1,
  dag: 10,
  kg: 1000,
  t: 1e6,
  gr: 0.06479891,
  oz: 28.349523125,
  lb: 453.59237,
  st: 6350.29318,
  'us-ton': 907184.74,
  'uk-ton': 1016046.9088,
};

export default {
  id: 'mass',
  kind: 'converter',
  category: 'units-basic',
  tags: ['beer'],
  name: { cs: 'Převod hmotnosti', en: 'Mass converter' },
  description: {
    cs: 'Převod hmotnosti mezi mikrogramy až tunami, dekagramy, karáty a anglosaskými jednotkami (grain, unce, libra, stone, krátká a dlouhá tuna, vše avoirdupois).',
    en: 'Converts mass between micrograms and tonnes, decagrams, carats and imperial units (grain, ounce, pound, stone, short and long ton, all avoirdupois).',
  },
  keywords: {
    cs: ['hmotnost', 'váha', 'gram', 'kilogram', 'dekagram', 'deko', 'tuna', 'miligram', 'karát', 'unce', 'libra'],
    en: ['mass', 'weight', 'gram', 'kilogram', 'tonne', 'milligram', 'carat', 'ounce', 'pound', 'stone', 'ton', 'oz', 'lb'],
  },
  units: [
    { id: 'ug', label: { cs: 'µg', en: 'µg' }, significant: 6, min: 0 },
    { id: 'mg', label: { cs: 'mg', en: 'mg' }, significant: 6, min: 0 },
    { id: 'ct', label: { cs: 'karát (ct)', en: 'carat (ct)' }, precision: 2, min: 0 },
    { id: 'g', default: 100, label: { cs: 'g', en: 'g' }, precision: 1, min: 0 },
    { id: 'dag', label: { cs: 'dkg (dag)', en: 'dag' }, precision: 2, min: 0 },
    { id: 'kg', label: { cs: 'kg', en: 'kg' }, precision: 3, min: 0 },
    { id: 't', label: { cs: 't', en: 't (tonne)' }, significant: 6, min: 0 },
    { id: 'gr', label: { cs: 'grain (gr)', en: 'grain (gr)' }, precision: 1, min: 0 },
    { id: 'oz', label: { cs: 'oz', en: 'oz' }, precision: 2, min: 0 },
    { id: 'lb', label: { cs: 'lb', en: 'lb' }, precision: 3, min: 0 },
    { id: 'st', label: { cs: 'stone (st)', en: 'stone (st)' }, precision: 3, min: 0 },
    { id: 'us-ton', label: { cs: 'krátká tuna (US)', en: 'short ton (US)' }, significant: 6, min: 0 },
    { id: 'uk-ton', label: { cs: 'dlouhá tuna (UK)', en: 'long ton (UK)' }, significant: 6, min: 0 },
  ],
  ...factorConversion(GRAMS),
  references: [
    { title: 'NIST Handbook 44, Appendix C: General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' },
  ],
};
